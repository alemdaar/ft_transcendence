import { authorizedFetch } from './authorizedFetch';
import { mockEnabled } from '../mocks/config';
import { activityAction } from '../mocks/requestActivity';

async function request(path, { method = 'GET', body, signal } = {}) {
  if (mockEnabled) { signal?.throwIfAborted(); return activityAction(path, method, body); }
  const response = await authorizedFetch(path, {
    method, signal,
    headers: { Accept: 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error || data?.Error || 'Could not complete this request.');
  return data;
}

export async function getActivity(scope, signal) {
  const data = await request('/peer-request/myactivity/' + scope, { signal });
  if (Array.isArray(data?.succes)) return data.succes;
  const empty = scope === 'mine' ? 'No requests Posted From You!' : 'No Post are Claimed From You!';
  if (data?.message === empty) return [];
  throw new Error('Unexpected activity response.');
}
export const editRequest = (id, body) => request('/peer-request/myactivity/' + id, { method: 'PATCH', body });
export const deleteRequest = id => request('/peer-request/myactivity/' + id, { method: 'DELETE' });
export async function getSession(id, signal) {
  if (!Number.isSafeInteger(Number(id)) || Number(id) <= 0) throw new Error('Invalid session ID.');
  const data = await request('/sessions/' + id, { signal });
  if (!data?.succes || !data?.Profiles) throw new Error('Unexpected session response.');
  return data;
}
