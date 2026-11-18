let accessToken = null;
let expiresAt = 0;
let pending = null;
let generation = 0;

export function clearAccessToken() {
  accessToken = null;
  expiresAt = 0;
  pending = null;
  generation += 1;
}

export function invalidateAccessToken(token) {
  if (accessToken === token) clearAccessToken();
}

export async function getAccessToken() {
  if (accessToken && Date.now() < expiresAt) return accessToken;
  if (pending) return pending;
  const currentGeneration = generation;
  const request = (async () => {
    const response = await fetch("/auth/token", {
      method: "POST",
      credentials: "include",
      headers: { Accept: "application/json" },
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      const error = new Error(
        data?.error || data?.message || "Please sign in again to continue.",
      );
      error.status = response.status;
      throw error;
    }
    if (
      typeof data?.accessToken !== "string" ||
      !data.accessToken ||
      !Number.isFinite(data.expiresIn) ||
      data.expiresIn <= 0
    ) {
      throw new Error("The server returned an invalid access token.");
    }
    if (generation !== currentGeneration)
      throw new Error("The login session changed. Please retry.");
    accessToken = data.accessToken;
    expiresAt = Date.now() + Math.max(0, data.expiresIn * 1000 - 30000);
    return accessToken;
  })();
  pending = request;
  try {
    return await request;
  } finally {
    if (pending === request) pending = null;
  }
}
