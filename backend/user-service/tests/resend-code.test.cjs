const assert = require("node:assert/strict");
const { test, beforeEach } = require("node:test");

const now = 1800000000000;
let pending;
let claimed;
let sent;
let replacements;

function stub(path, exports) {
    const id = require.resolve(path);
    require.cache[id] = { id, filename: id, loaded: true, exports };
}

stub("../src/services/auth.service.ts", {
    findPendingRegistration: async () => pending,
    replacePendingVerificationCode: async (data) => {
        replacements.push(data);
        if (claimed) return false;
        claimed = true;
        return true;
    }
});
stub("../src/services/email.service.ts", {
    sendVerificationEmail: async (...args) => { sent.push(args); }
});
stub("../src/services/jwt.service.ts", {});
stub("../src/services/fortytwo.service.ts", {});

const { resendVerificationCode } = require("../src/controllers/auth.controller.ts");

function response() {
    return {
        statusCode: 200,
        headers: {},
        set(key, value) { this.headers[key] = value; return this; },
        status(code) { this.statusCode = code; return this; },
        json(body) { this.body = body; return this; }
    };
}

const request = { body: { email: "student@student.1337.ma" } };

beforeEach(() => {
    pending = { expiresAt: new Date(now + 5 * 60 * 1000) };
    claimed = false;
    sent = [];
    replacements = [];
});

test("initial registration starts the cooldown and early retries do not change the code", async (t) => {
    t.mock.method(Date, "now", () => now + 1001);
    const res = response();
    await resendVerificationCode(request, res);
    assert.equal(res.statusCode, 429);
    assert.equal(res.headers["Retry-After"], "59");
    assert.equal(res.body.retryAfter, 59);
    assert.equal(replacements.length, 0);
    assert.equal(sent.length, 0);
});

test("allows a resend exactly at 60 seconds and gives the new code five minutes", async (t) => {
    t.mock.method(Date, "now", () => now + 60000);
    const res = response();
    await resendVerificationCode(request, res);
    assert.equal(res.statusCode, 200);
    assert.equal(sent.length, 1);
    assert.match(sent[0][1], /^\d{6}$/);
    assert.equal(replacements[0].previousExpiresAt, pending.expiresAt);
    assert.equal(replacements[0].expiresAt.getTime(), now + 60000 + 300000);
    assert.equal(replacements[0].code, sent[0][1]);
});

test("simultaneous resend requests send only one email", async (t) => {
    t.mock.method(Date, "now", () => now + 60000);
    const responses = [response(), response()];
    await Promise.all(responses.map(res => resendVerificationCode(request, res)));
    assert.deepEqual(responses.map(res => res.statusCode).sort(), [200, 429]);
    assert.equal(sent.length, 1);
});

test("unknown emails retain the generic response without sending mail", async () => {
    pending = null;
    const res = response();
    await resendVerificationCode(request, res);
    assert.equal(res.statusCode, 200);
    assert.equal(sent.length, 0);
    assert.equal(replacements.length, 0);
});
