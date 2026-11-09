const assert = require("node:assert/strict");
const { test } = require("node:test");
const { registerSchema, profileSchema, resetPasswordSchema } = require("../src/schema/auth.schema.ts");
const { HttpError } = require("../src/lib/http-error.ts");
const { errorHandler } = require("../src/middleware/error-handler.ts");

function response() {
    return {
        headers: {}, statusCode: 200,
        set(key, value) { this.headers[key] = value; return this; },
        status(code) { this.statusCode = code; return this; },
        json(body) { this.body = body; return this; }
    };
}

test("normalizes email consistently and requires matching passwords", () => {
    const input = { email: " Student@STUDENT.1337.MA ", password: "password123", confirmpassword: "password123" };
    assert.equal(registerSchema.parse(input).email, "student@student.1337.ma");
    assert.equal(registerSchema.safeParse({ ...input, confirmpassword: "different" }).success, false);
    assert.equal(registerSchema.safeParse({ ...input, email: "student@example.com" }).success, false);
});

test("profile edits cannot overwrite identity, password or points", () => {
    for (const data of [{ points: 100 }, { email: "other@student.1337.ma" }, { passwordHash: "x" }, {}]) {
        assert.equal(profileSchema.safeParse(data).success, false);
    }
    assert.equal(profileSchema.safeParse({ avatarUrl: "javascript:alert(1)" }).success, false);
    assert.equal(profileSchema.safeParse({ displayname: " Student ", location: null }).success, true);
});

test("reset tokens must be 256-bit hex strings", () => {
    const input = { token: "a".repeat(64), password: "password123", confirmpassword: "password123" };
    assert.equal(resetPasswordSchema.safeParse(input).success, true);
    assert.equal(resetPasswordSchema.safeParse({ ...input, token: "123456" }).success, false);
});

test("invalid JSON and large bodies preserve client error status", () => {
    for (const [type, status] of [["entity.parse.failed", 400], ["entity.too.large", 413], ["charset.unsupported", 415]]) {
        const res = response();
        errorHandler({ type }, {}, res, () => assert.fail("unexpected next"));
        assert.equal(res.statusCode, status);
    }
});

test("cooldowns expose Retry-After and database identity conflicts return 409", () => {
    const res = response();
    errorHandler(new HttpError(429, "Wait", 59), {}, res, () => {});
    assert.equal(res.headers["Retry-After"], "59");
    assert.equal(res.body.retryAfter, 59);
    const conflict = response();
    errorHandler({ code: "P2002" }, {}, conflict, () => {});
    assert.equal(conflict.statusCode, 409);
});
