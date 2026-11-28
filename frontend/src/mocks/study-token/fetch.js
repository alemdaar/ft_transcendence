import { getStudyTestToken } from './token';

export function studyTestTokenFetch(path, options = {}) {
  if (!/^\/(peer-request|session|sessions)([/?]|$)/.test(path)) {
    throw new Error('Unsupported study request path.');
  }
  const token = getStudyTestToken();
  if (!token) throw new Error('Paste your study request test token above to continue.');
  const headers = new Headers(options.headers);
  headers.set('Authorization', 'Bearer ' + token);
  return fetch(path, { ...options, credentials: 'include', headers });
}
