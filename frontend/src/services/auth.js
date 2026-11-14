import { mockEnabled } from '../mocks/config';
import { mockUser } from '../mocks/data';
async function authRequest(path, { body, signal } = {}) {
  if (mockEnabled) {
    signal?.throwIfAborted();
    if (path === 'me') return { user: sessionStorage.getItem('studypeer-demo-signed-out') ? null : mockUser };
    if (path === 'login') { sessionStorage.removeItem('studypeer-demo-signed-out'); return { user: mockUser }; }
    if (path === 'logout') { sessionStorage.setItem('studypeer-demo-signed-out', 'true'); return { message: 'Signed out of demo.' }; }
    throw new Error('Registration and email verification are unavailable in demo mode.');
  }
  let response;
  try {
    response = await fetch('/auth/' + path, {
      method: body === undefined ? 'GET' : 'POST',
      credentials: 'include',
      headers: { Accept: 'application/json', ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      signal,
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error('Cannot connect to the server. Please try again.', { cause: error });
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = data?.details?.[0]?.message || data?.error || data?.message || 'Authentication request failed.';
    const error = new Error(message);
    error.status = response.status;
    error.retryAfter = Number(data?.retryAfter || response.headers.get('Retry-After')) || 0;
    throw error;
  }
  if (!data) throw new Error('The server returned an unexpected response.');
  return data;
}

export async function getCurrentUser(signal) {
  try { return (await authRequest('me', { signal })).user; }
  catch (error) { if (error.status === 401) return null; throw error; }
}
export const login = (email, password) => authRequest('login', { body: { email, password } });
export const logout = () => authRequest('logout', { body: {} });
export const register = (data) => authRequest('register', { body: data });
export const verifyEmail = (email, code) => authRequest('verify-email', { body: { email, code } });
export const resendCode = (email) => authRequest('resend-code', { body: { email } });
