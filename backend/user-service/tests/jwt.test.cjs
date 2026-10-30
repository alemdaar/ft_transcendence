const assert = require("node:assert/strict");
const { test } = require("node:test");
const jwt = require("jsonwebtoken");
process.env.JWT_SECRET = "unit-test-secret-at-least-32-characters-long";
const { generateAccessToken, verifyAccessTokenClaims } = require("../src/services/jwt.service.ts");

test("access tokens preserve subject, campus and version and expire after 15 minutes", () => {
    const token = generateAccessToken(42, 3, "Khouribga");
    assert.deepEqual(verifyAccessTokenClaims(token), { userId: 42, authVersion: 3, campus: "Khouribga" });
    const payload = jwt.decode(token);
    assert.equal(payload.sub, "42");
    assert.equal(payload.campus, "Khouribga");
    assert.equal(payload.exp - payload.iat, 900);
    assert.equal(payload.iss, "user-service");
    assert.equal(payload.aud, "ft-transcendence-services");
});

test("rejects tampered, expired, wrongly scoped and malformed identity tokens", () => {
    const options = { algorithm: "HS256", subject: "42", issuer: "user-service", audience: "ft-transcendence-services", expiresIn: "15m" };
    const sign = (payload, overrides = {}) => jwt.sign(payload, process.env.JWT_SECRET, { ...options, ...overrides });
    for (const token of [
        sign({ version: 0, campus: "Khouribga" }, { expiresIn: -1 }),
        sign({ version: 0, campus: "Khouribga" }, { issuer: "other" }),
        sign({ version: 0, campus: "Khouribga" }, { audience: "other" }),
        sign({ version: 0, campus: "Khouribga" }, { subject: "0" }),
        sign({ version: -1, campus: "Khouribga" }), sign({ campus: "Khouribga" }),
        generateAccessToken(42, 0, "Khouribga") + "tampered"
    ]) assert.throws(() => verifyAccessTokenClaims(token));
});

test("rejects tokens with missing, empty or non-string campus claims", () => {
    const options = { algorithm: "HS256", subject: "42", issuer: "user-service", audience: "ft-transcendence-services", expiresIn: "15m" };
    for (const campus of [undefined, null, "", "   ", 55, ["Khouribga"], { name: "Khouribga" }]) {
        const token = jwt.sign({ version: 0, campus }, process.env.JWT_SECRET, options);
        assert.throws(() => verifyAccessTokenClaims(token));
    }
});
