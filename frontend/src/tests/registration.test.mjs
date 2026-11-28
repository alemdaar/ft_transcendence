import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = (
  await readFile(
    new URL("../services/registration.js", import.meta.url),
    "utf8",
  )
).replace(
  /import \{ register \} from [^;]+;/,
  "const register = data => globalThis.registrationTestRequest(data);",
);
const { submitRegistration } = await import(
  "data:text/javascript," + encodeURIComponent(source)
);
const input = {
  email: " Student@student.1337.ma ",
  password: "password123",
  confirmpassword: "password123",
};
const fail = (status, message, retryAfter) =>
  Object.assign(new Error(message), { status, retryAfter });

test("new registration proceeds to verification with normalized email only", async () => {
  globalThis.registrationTestRequest = async (body) => {
    assert.equal(body.email, "student@student.1337.ma");
    assert.equal(body.confirmpassword, input.confirmpassword);
    return { message: "Verification required" };
  };
  const state = await submitRegistration(input);
  assert.deepEqual(state, {
    email: "student@student.1337.ma",
    resumed: false,
    retryAfter: 60,
  });
  assert.equal("password" in state, false);
});

test("pending account returns verification navigation state", async () => {
  globalThis.registrationTestRequest = async () => {
    throw fail(
      409,
      "Registration pending. Verify your email or request a new code.",
    );
  };
  assert.deepEqual(await submitRegistration(input), {
    email: "student@student.1337.ma",
    resumed: true,
    retryAfter: 0,
  });
});

test("pending code cooldown returns verification state and remaining wait", async () => {
  globalThis.registrationTestRequest = async () => {
    throw fail(429, "Please wait before requesting another code.", 38);
  };
  assert.equal((await submitRegistration(input)).retryAfter, 38);
});

test("existing verified accounts, generic rate limits and network failures remain errors", async () => {
  for (const error of [
    fail(409, "User already exists"),
    fail(429, "Too many attempts. Please try again later."),
    fail(500, "Server unavailable"),
    new Error("Cannot connect to the server."),
  ]) {
    globalThis.registrationTestRequest = async () => {
      throw error;
    };
    await assert.rejects(submitRegistration(input), error);
  }
});
