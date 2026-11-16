import { getAccessToken, invalidateAccessToken } from "./accessToken";

export async function authorizedFetch(path, options = {}) {
  if (!/^\/(groups|peer-request|sessions)([/?]|$)/.test(path))
    throw new Error("Unsupported authenticated service path.");
  options.signal?.throwIfAborted();
  let token = await getAccessToken();
  async function send() {
    options.signal?.throwIfAborted();
    const headers = new Headers(options.headers);
    headers.set("Authorization", "Bearer " + token);
    return fetch(path, { ...options, credentials: "include", headers });
  }
  let response = await send();
  if (response.status === 401) {
    invalidateAccessToken(token);
    options.signal?.throwIfAborted();
    token = await getAccessToken();
    response = await send();
    if (response.status === 401) invalidateAccessToken(token);
  }
  return response;
}
