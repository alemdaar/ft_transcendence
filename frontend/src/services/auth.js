import { clearAccessToken, getAccessToken } from "./accessToken";
import { mockEnabled } from "../mocks/config";
import { mockAuthRequest } from "../mocks/auth";
async function authRequest(path, { body, signal } = {}) {
  if (mockEnabled) return mockAuthRequest(path, signal);
  let response;
  try {
    response = await fetch("/auth/" + path, {
      method: body === undefined ? "GET" : "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      signal,
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error("Cannot connect to the server. Please try again.", {
      cause: error,
    });
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      data?.details?.[0]?.message ||
      data?.error ||
      data?.message ||
      "Authentication request failed.";
    const error = new Error(message);
    error.status = response.status;
    error.retryAfter =
      Number(data?.retryAfter || response.headers.get("Retry-After")) || 0;
    throw error;
  }
  if (!data) throw new Error("The server returned an unexpected response.");
  return data;
}

export async function getCurrentUser(signal) {
  try {
    const user = (await authRequest("me", { signal })).user;
    if (user && !mockEnabled) await getAccessToken();
    if (!user) clearAccessToken();
    return user
      ? {
          ...user,
          authProvider: mockEnabled
            ? user.authProvider
            : user.authProvider ||
              sessionStorage.getItem("studypeer-login-method") ||
              "password",
        }
      : null;
  } catch (error) {
    if (error.status === 401) {
      clearAccessToken();
      return null;
    }
    throw error;
  }
}
export async function login(email, password) {
  clearAccessToken();
  const data = await authRequest("login", { body: { email, password } });
  if (!mockEnabled) await getAccessToken();
  sessionStorage.setItem("studypeer-login-method", "password");
  return {
    ...data,
    user: {
      ...data.user,
      authProvider: mockEnabled ? data.user.authProvider : "password",
    },
  };
}
export async function logout() {
  const data = await authRequest("logout", { body: {} });
  clearAccessToken();
  sessionStorage.removeItem("studypeer-login-method");
  return data;
}
export const register = (data) => authRequest("register", { body: data });
export const verifyEmail = (email, code) =>
  authRequest("verify-email", { body: { email, code } });
export const resendCode = (email) =>
  authRequest("resend-code", { body: { email } });
