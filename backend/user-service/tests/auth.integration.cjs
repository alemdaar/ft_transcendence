const assert = require("node:assert/strict");
const { test } = require("node:test");
const { once } = require("node:events");
const { readdir, readFile } = require("node:fs/promises");
const crypto = require("node:crypto");
const { Client } = require("pg");
require("dotenv").config({ quiet: true });

function stub(path, exports) {
    const id = require.resolve(path);
    require.cache[id] = { id, filename: id, loaded: true, exports };
}

// Creates and drops a separate database; never runs migrations against DATABASE_URL itself.
test("PostgreSQL authentication integration", async t => {
    const adminUrl = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
    assert.ok(adminUrl, "Set TEST_DATABASE_URL or DATABASE_URL to a PostgreSQL account with CREATEDB permission");
    const admin = new Client({ connectionString: adminUrl, connectionTimeoutMillis: 3000 });
    await admin.connect();
    const dbName = `user_service_test_${crypto.randomBytes(8).toString("hex")}`;
    let dbCreated = false;
    let migrationClient, prisma, store, server;
    t.after(async () => {
        if (server) await new Promise(resolve => server.close(resolve));
        if (store) await store.close();
        if (prisma) await prisma.$disconnect();
        if (migrationClient) await migrationClient.end();
        if (dbCreated) await admin.query(`DROP DATABASE "${dbName}" WITH (FORCE)`);
        await admin.end();
    });
    await admin.query(`CREATE DATABASE "${dbName}"`);
    dbCreated = true;
    const testUrl = new URL(adminUrl);
    testUrl.pathname = `/${dbName}`;
    process.env.DATABASE_URL = testUrl.href;
    process.env.SESSION_SECRET = "integration-session-secret-32-characters-long";
    process.env.JWT_SECRET = "integration-jwt-secret-32-characters-long";
    process.env.FRONTEND_URL = "http://localhost:5173/";
    process.env.TRUST_PROXY = "loopback";
    process.env.NODE_ENV = "test";
    process.env.FORTYTWO_CLIENT_ID = "test-client";
    process.env.FORTYTWO_CLIENT_SECRET = "test-secret";
    process.env.FORTYTWO_REDIRECT_URI = "http://localhost:5173/auth/42/callback";
    migrationClient = new Client({ connectionString: testUrl.href });
    await migrationClient.connect();
    const migrations = (await readdir("prisma/migrations", { withFileTypes: true })).filter(e => e.isDirectory()).map(e => e.name).sort();
    for (const migration of migrations) await migrationClient.query(await readFile(`prisma/migrations/${migration}/migration.sql`, "utf8"));

    const emails = [];
    let failMail = false;
    stub("../src/services/email.service.ts", {
        sendVerificationEmail: async (email, value) => {
            if (failMail) throw new (require("../src/lib/http-error.ts").HttpError)(503, "Email unavailable");
            emails.push({ kind: "verify", email, value });
        },
        sendPasswordResetEmail: async (email, value) => {
            if (failMail) throw new (require("../src/lib/http-error.ts").HttpError)(503, "Email unavailable");
            emails.push({ kind: "reset", email, value });
        }
    });
    const profileIds = new Map();
    function profile(login) {
        if (!profileIds.has(login)) profileIds.set(login, profileIds.size + 100);
        return { id: profileIds.get(login), login, email: `${login}@student.1337.ma`, displayname: login, location: null, campus: [{ id: 1, name: "1337" }] };
    }
    let lookupHook;
    let oauthProfile = profile("oauthstudent");
    const real42 = require("../src/services/fortytwo.service.ts");
    stub("../src/services/fortytwo.service.ts", {
        ...real42,
        get42UserByLogin: async login => { if (lookupHook) await lookupHook(login); return profile(login); },
        fetch42: async path => new Response(JSON.stringify(path === "/oauth/token" ? { access_token: "test-provider-token" } : oauthProfile), { status: 200, headers: { "Content-Type": "application/json" } })
    });
    const app = require("../src/app.ts").default;
    prisma = require("../src/lib/prisma.ts").prisma;
    store = require("../src/config/session.ts").sessionStore;
    server = app.listen(0, "127.0.0.1");
    await once(server, "listening");
    const base = `http://127.0.0.1:${server.address().port}`;
    let ip = 0;
    async function request(path, options = {}) {
        ip += 1;
        const headers = { "X-Forwarded-For": `10.0.${Math.floor(ip / 250)}.${ip % 250 + 1}`, ...options.headers };
        if (options.cookie) headers.Cookie = options.cookie;
        if (options.body !== undefined) headers["Content-Type"] = "application/json";
        const response = await fetch(`${base}${path}`, {
            method: options.method || (options.body !== undefined ? "POST" : "GET"),
            headers, body: options.body === undefined ? undefined : JSON.stringify(options.body), redirect: "manual"
        });
        const raw = await response.text();
        const data = response.headers.get("content-type")?.includes("application/json") ? JSON.parse(raw) : raw;
        return { status: response.status, data, headers: response.headers, cookie: response.headers.get("set-cookie")?.split(";")[0] };
    }
    const email = login => `${login}@student.1337.ma`;
    const password = "testPassword123!";
    const registration = login => ({ email: email(login), password, confirmpassword: password });
    const lastMail = (kind, address) => emails.findLast(m => m.kind === kind && m.email === address).value;
    async function create(login) {
        assert.equal((await request("/auth/register", { body: registration(login) })).status, 201);
        const result = await request("/auth/verify-email", { body: { email: email(login), code: lastMail("verify", email(login)) } });
        assert.equal(result.status, 201, JSON.stringify(result.data));
        return result.data.user;
    }
    async function loginAs(login, currentPassword = password) {
        const result = await request("/auth/login", { body: { email: email(login), password: currentPassword } });
        assert.equal(result.status, 200, JSON.stringify(result.data));
        assert.ok(result.cookie);
        return result.cookie;
    }
    async function accessToken(cookie) {
        const result = await request("/auth/token", { method: "POST", cookie });
        assert.equal(result.status, 200);
        return result.data.accessToken;
    }
    const bearer = token => ({ Authorization: `Bearer ${token}` });

    await t.test("health, readiness, JSON errors, origin checks and anonymous access", async () => {
        assert.equal((await request("/health")).status, 200);
        assert.equal((await request("/ready")).status, 200);
        assert.equal((await request("/auth/me")).status, 401);
        assert.equal((await request("/auth/token", { method: "POST" })).status, 401);
        assert.equal((await request("/auth/login", { body: registration("origin"), headers: { Origin: "https://attacker.example" } })).status, 403);
        const invalid = await fetch(`${base}/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{" });
        assert.equal(invalid.status, 400);
        const large = await request("/auth/login", { body: { value: "x".repeat(17000) } });
        assert.equal(large.status, 413);
    });

    await t.test("registration normalization, shared cooldown and concurrent resends", async () => {
        const address = email("resendstudent");
        assert.equal((await request("/auth/register", { body: { ...registration("resendstudent"), email: ` ${address.toUpperCase()} ` } })).status, 201);
        const original = await prisma.pendingRegistration.findUnique({ where: { email: address } });
        assert.notEqual(original.passwordHash, password);
        assert.equal(await prisma.user.count({ where: { email: address } }), 0);
        assert.equal((await request("/auth/register", { body: registration("resendstudent") })).status, 429);
        const early = await request("/auth/resend-code", { body: { email: address } });
        assert.equal(early.status, 429);
        assert.ok(Number(early.headers.get("Retry-After")) > 0);
        await prisma.pendingRegistration.update({ where: { email: address }, data: { codeSentAt: new Date(Date.now() - 60001) } });
        assert.equal((await request("/auth/register", { body: registration("resendstudent") })).status, 409);
        const before = emails.length;
        const results = await Promise.all([1, 2].map(() => request("/auth/resend-code", { body: { email: address } })));
        assert.deepEqual(results.map(r => r.status).sort(), [200, 429]);
        assert.equal(emails.length, before + 1);
        const pending = await prisma.pendingRegistration.findUnique({ where: { email: address } });
        assert.equal(pending.passwordHash, original.passwordHash);
        assert.equal(pending.expiresAt.getTime() - pending.codeSentAt.getTime(), 300000);
        const unknownBefore = emails.length;
        assert.equal((await request("/auth/resend-code", { body: { email: email("unknown") } })).status, 200);
        assert.equal(emails.length, unknownBefore);
    });

    await t.test("simultaneous verification creates exactly one user", async () => {
        const address = email("concurrentstudent");
        await request("/auth/register", { body: registration("concurrentstudent") });
        const code = lastMail("verify", address);
        const results = await Promise.all([1, 2].map(() => request("/auth/verify-email", { body: { email: address, code } })));
        assert.equal(results.filter(r => r.status === 201).length, 1);
        assert.ok(results.every(r => [201, 400, 404].includes(r.status)));
        assert.equal(await prisma.user.count({ where: { email: address } }), 1);
        assert.equal(await prisma.pendingRegistration.count({ where: { email: address } }), 0);
        assert.equal("passwordHash" in results.find(r => r.status === 201).data.user, false);
    });

    await t.test("resend during 42 lookup invalidates the old verification snapshot", async () => {
        const address = email("stalestudent");
        await request("/auth/register", { body: registration("stalestudent") });
        const oldCode = lastMail("verify", address);
        await prisma.pendingRegistration.update({ where: { email: address }, data: { codeSentAt: new Date(Date.now() - 60001) } });
        let release, started;
        const gate = new Promise(resolve => { release = resolve; });
        const entered = new Promise(resolve => { started = resolve; });
        lookupHook = async login => { if (login === "stalestudent") { started(); await gate; } };
        const verification = request("/auth/verify-email", { body: { email: address, code: oldCode } });
        await entered;
        try {
            assert.equal((await request("/auth/resend-code", { body: { email: address } })).status, 200);
        } finally { lookupHook = undefined; release(); }
        assert.equal((await verification).status, 400);
        assert.equal(await prisma.user.count({ where: { email: address } }), 0);
        assert.equal((await request("/auth/verify-email", { body: { email: address, code: lastMail("verify", address) } })).status, 201);
    });

    await t.test("verification rechecks expiry after 42 lookup and identity conflicts roll back", async () => {
        const address = email("expiredstudent");
        await request("/auth/register", { body: registration("expiredstudent") });
        lookupHook = async login => {
            if (login === "expiredstudent") await prisma.pendingRegistration.update({ where: { email: address }, data: { expiresAt: new Date(Date.now() - 1) } });
        };
        try {
            assert.equal((await request("/auth/verify-email", { body: { email: address, code: lastMail("verify", address) } })).status, 400);
        } finally { lookupHook = undefined; }
        assert.equal(await prisma.user.count({ where: { email: address } }), 0);
        await request("/auth/register", { body: registration("conflictstudent") });
        profileIds.set("conflictstudent", profileIds.get("stalestudent"));
        assert.equal((await request("/auth/verify-email", { body: { email: email("conflictstudent"), code: lastMail("verify", email("conflictstudent")) } })).status, 409);
        assert.equal(await prisma.pendingRegistration.count({ where: { email: email("conflictstudent") } }), 1);
    });

    await t.test("SMTP failures roll back initial registration and resends", async () => {
        const address = email("resendfailedmail");
        assert.equal((await request("/auth/register", { body: registration("resendfailedmail") })).status, 201);
        failMail = true;
        try {
            assert.equal((await request("/auth/register", { body: registration("failedmail") })).status, 503);
            assert.equal(await prisma.pendingRegistration.count({ where: { email: email("failedmail") } }), 0);
            await prisma.pendingRegistration.update({ where: { email: address }, data: { codeSentAt: new Date(Date.now() - 60001) } });
            const before = await prisma.pendingRegistration.findUnique({ where: { email: address } });
            assert.equal((await request("/auth/resend-code", { body: { email: address } })).status, 503);
            assert.deepEqual(await prisma.pendingRegistration.findUnique({ where: { email: address } }), before);
        } finally { failMail = false; }
    });

    await t.test("login rotates sessions; bearer works for reads and session is required for changes", async () => {
        const user = await create("sessionstudent");
        const anonymous = await request("/auth/42");
        const login = await request("/auth/login", { cookie: anonymous.cookie, body: { email: email("sessionstudent"), password } });
        assert.equal(login.status, 200);
        assert.notEqual(login.cookie, anonymous.cookie);
        assert.equal("passwordHash" in login.data.user, false);
        assert.equal((await request("/auth/me", { cookie: anonymous.cookie })).status, 401);
        await prisma.user.update({ where: { id: user.id }, data: { campus: "Khouribga" } });
        const token = await accessToken(login.cookie);
        assert.deepEqual(require("../src/services/jwt.service.ts").verifyAccessTokenClaims(token), {
            userId: user.id, authVersion: 0, campus: "Khouribga"
        });
        assert.equal((await request("/auth/me", { headers: bearer(token) })).status, 200);
        assert.equal((await request("/auth/me", { headers: bearer("invalid") })).status, 401);
        assert.equal((await request("/auth/token", { method: "POST", headers: bearer(token) })).status, 401);
        assert.equal((await request("/auth/me", { method: "PATCH", body: { displayname: "Changed" }, headers: bearer(token) })).status, 401);
        assert.equal((await request("/auth/me", { method: "PATCH", cookie: login.cookie, body: { points: 100 } })).status, 400);
        const updated = await request("/auth/me", { method: "PATCH", cookie: login.cookie, body: { displayname: "New Name", location: null, avatarUrl: "https://example.com/avatar.png" } });
        assert.equal(updated.status, 200);
        assert.equal(updated.data.user.displayname, "New Name");
        assert.equal((await request("/auth/logout", { method: "POST", cookie: login.cookie })).status, 200);
        assert.equal((await request("/auth/me", { cookie: login.cookie })).status, 401);
    });

    await t.test("password changes revoke every old session and access token", async () => {
        const first = await loginAs("sessionstudent");
        const second = await loginAs("sessionstudent");
        const token = await accessToken(first);
        const nextPassword = "newPassword123!";
        const body = { currentPassword: "wrong", password: nextPassword, confirmpassword: nextPassword };
        assert.equal((await request("/auth/change-password", { cookie: first, body })).status, 401);
        assert.equal((await request("/auth/change-password", { cookie: first, body: { ...body, currentPassword: password } })).status, 200);
        assert.equal((await request("/auth/me", { cookie: second })).status, 401);
        assert.equal((await request("/auth/me", { headers: bearer(token) })).status, 401);
        assert.equal((await request("/auth/login", { body: { email: email("sessionstudent"), password } })).status, 401);
        await loginAs("sessionstudent", nextPassword);
    });

    await t.test("reset tokens are hashed, expire, roll back on SMTP failure and are consumed once", async () => {
        await create("resetstudent");
        const address = email("resetstudent");
        const cookie = await loginAs("resetstudent");
        const token = await accessToken(cookie);
        const before = emails.length;
        assert.equal((await request("/auth/forgot-password", { body: { email: email("missingstudent") } })).status, 200);
        assert.equal(emails.length, before);
        assert.equal((await request("/auth/forgot-password", { body: { email: address } })).status, 200);
        const raw = lastMail("reset", address);
        const reset = await prisma.passwordReset.findFirst({ where: { user: { email: address } } });
        assert.notEqual(reset.tokenHash, raw);
        assert.equal(reset.tokenHash, crypto.createHash("sha256").update(raw).digest("hex"));
        assert.equal((await request("/auth/forgot-password", { body: { email: address } })).status, 200);
        assert.equal(lastMail("reset", address), raw);
        await prisma.passwordReset.update({ where: { id: reset.id }, data: { createdAt: new Date(Date.now() - 60001) } });
        const saved = await prisma.passwordReset.findUnique({ where: { id: reset.id } });
        failMail = true;
        try { assert.equal((await request("/auth/forgot-password", { body: { email: address } })).status, 503); }
        finally { failMail = false; }
        assert.deepEqual(await prisma.passwordReset.findUnique({ where: { id: reset.id } }), saved);
        const body = { token: raw, password: "resetPassword123!", confirmpassword: "resetPassword123!" };
        await prisma.passwordReset.update({ where: { id: reset.id }, data: { expiresAt: new Date(Date.now() - 1) } });
        assert.equal((await request("/auth/reset-password", { body })).status, 400);
        await prisma.passwordReset.update({ where: { id: reset.id }, data: { expiresAt: new Date(Date.now() + 900000) } });
        const results = await Promise.all([1, 2].map(() => request("/auth/reset-password", { body })));
        assert.deepEqual(results.map(r => r.status).sort(), [200, 400]);
        assert.equal((await request("/auth/me", { cookie })).status, 401);
        assert.equal((await request("/auth/me", { headers: bearer(token) })).status, 401);
        await loginAs("resetstudent", body.password);
    });

    await t.test("account deletion verifies the password and removes account, reset tokens and sessions", async () => {
        await create("deletestudent");
        const cookie = await loginAs("deletestudent");
        const otherCookie = await loginAs("deletestudent");
        const token = await accessToken(cookie);
        await request("/auth/forgot-password", { body: { email: email("deletestudent") } });
        assert.equal((await request("/auth/me", { method: "DELETE", cookie, body: { confirmation: "DELETE", currentPassword: "wrong" } })).status, 401);
        assert.equal((await request("/auth/me", { method: "DELETE", cookie, body: { confirmation: "DELETE", currentPassword: password } })).status, 200);
        assert.equal(await prisma.user.count({ where: { email: email("deletestudent") } }), 0);
        assert.equal((await request("/auth/me", { cookie: otherCookie })).status, 401);
        assert.equal((await request("/auth/me", { headers: bearer(token) })).status, 401);
    });

    await t.test("OAuth state is checked, frontend redirect is configured, and OAuth-only deletion requires recent login", async () => {
        assert.equal((await request("/auth/42/callback?code=test&state=bad")).status, 400);
        const start = await request("/auth/42");
        const state = new URL(start.headers.get("location")).searchParams.get("state");
        const callback = await request(`/auth/42/callback?code=test&state=${state}`, { cookie: start.cookie });
        assert.equal(callback.status, 302);
        assert.equal(callback.headers.get("location"), process.env.FRONTEND_URL);
        const cookie = callback.cookie;
        const user = await prisma.user.findUnique({ where: { email: email("oauthstudent") } });
        assert.equal(user.passwordHash, null);
        assert.equal((await request(`/auth/42/callback?code=test&state=${state}`, { cookie })).status, 400);
        await prisma.$executeRaw`UPDATE "user_sessions" SET "sess" = jsonb_set("sess"::jsonb, '{authenticatedAt}', '0'::jsonb)::json WHERE "sess"->>'userId' = ${String(user.id)}`;
        assert.equal((await request("/auth/me", { method: "DELETE", cookie, body: { confirmation: "DELETE" } })).status, 403);
        const freshStart = await request("/auth/42", { cookie });
        const freshState = new URL(freshStart.headers.get("location")).searchParams.get("state");
        const fresh = await request(`/auth/42/callback?code=test&state=${freshState}`, { cookie: freshStart.cookie || cookie });
        assert.equal(fresh.status, 302);
        assert.equal((await request("/auth/me", { method: "DELETE", cookie: fresh.cookie, body: { confirmation: "DELETE" } })).status, 200);
        oauthProfile = { ...profile("outsider"), email: "outsider@example.com" };
        const outsider = await request("/auth/42");
        const outsiderState = new URL(outsider.headers.get("location")).searchParams.get("state");
        assert.equal((await request(`/auth/42/callback?code=test&state=${outsiderState}`, { cookie: outsider.cookie })).status, 403);
    });

    await t.test("verification rate limit persists per normalized email across different IPs", async () => {
        const address = email("ratelimited");
        for (let attempt = 0; attempt < 10; attempt++) {
            assert.equal((await request("/auth/verify-email", { body: { email: attempt % 2 ? address.toUpperCase() : address, code: "123456" } })).status, 404);
        }
        const blocked = await request("/auth/verify-email", { body: { email: address, code: "123456" } });
        assert.equal(blocked.status, 429);
        assert.ok(blocked.data.retryAfter > 0);
        assert.equal(await prisma.authRateLimit.count({ where: { key: crypto.createHash("sha256").update(`verify:${address}`).digest("hex") } }), 1);
    });
});
