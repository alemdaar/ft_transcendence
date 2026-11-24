import { normalizeSession } from '../utils/sessionProfiles.js';
import { apiErrorMessage } from '../utils/apiError.js';
import { studyFetch } from './studyFetch';

async function request(path, { method = 'GET', body, signal } = {}) {
  const response = await studyFetch(path, {
    method, signal,
    headers: { Accept: 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(apiErrorMessage(data, 'Could not complete this request.'));
  return data;
}

export async function getActivity(scope, signal) {
  const data = await request('/peer-request/myactivity/' + scope, { signal });
  if (Array.isArray(data?.succes)) return data.succes;
  const empty = scope === 'mine' ? 'No requests Posted From You!' : 'No Post are Claimed From You!';
  if (data?.message === empty || data?.error === empty) return [];
  throw new Error('Unexpected activity response.');
}
export const editRequest = (id, body) => request('/peer-request/myactivity/' + id, { method: 'PATCH', body });
export const deleteRequest = id => request('/peer-request/myactivity/' + id, { method: 'DELETE' });
export async function getSession(id, signal) {
  if (!Number.isSafeInteger(Number(id)) || Number(id) <= 0) throw new Error('Invalid session ID.');
  const data = await request('/session/' + id, { signal });
  return normalizeSession(data);
}
