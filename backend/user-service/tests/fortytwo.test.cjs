const assert = require("node:assert/strict");
const { test } = require("node:test");
process.env.FORTYTWO_CLIENT_ID = "test-client";
process.env.FORTYTWO_CLIENT_SECRET = "test-secret";
function service() {
    const path = require.resolve("../src/services/fortytwo.service.ts");
    delete require.cache[path];
    return require(path);
}
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });

test("concurrent 42 lookups share a token request and all requests have timeout signals", async t => {
    let tokens = 0;
    t.mock.method(global, "fetch", async (url, options) => {
        assert.ok(options.signal instanceof AbortSignal);
        if (url.endsWith("/oauth/token")) { tokens++; return json({ access_token: "app-token", expires_in: 3600 }); }
        const login = url.split("/").at(-1);
        return json({ id: 1, login, email: `${login}@student.1337.ma` });
    });
    const api = service();
    await Promise.all(["one", "two", "three"].map(login => api.get42UserByLogin(login)));
    assert.equal(tokens, 1);
});

test("a rejected cached token is refreshed once", async t => {
    let tokens = 0, lookups = 0;
    t.mock.method(global, "fetch", async url => {
        if (url.endsWith("/oauth/token")) { tokens++; return json({ access_token: `token-${tokens}`, expires_in: 3600 }); }
        lookups++;
        return lookups === 1 ? json({}, 401) : json({ id: 1, login: "student", email: "student@student.1337.ma" });
    });
    await service().get42UserByLogin("student");
    assert.equal(tokens, 2);
    assert.equal(lookups, 2);
});

test("42 connection failures and malformed JSON produce upstream errors", async t => {
    const api = service();
    t.mock.method(global, "fetch", async () => { throw new DOMException("Timed out", "TimeoutError"); });
    await assert.rejects(api.fetch42("/v2/me"), error => error.status === 502);
    await assert.rejects(api.read42Json(new Response("invalid json")), error => error.status === 502);
    assert.throws(() => api.parse42Profile({ id: -1 }), error => error.status === 502);
});
