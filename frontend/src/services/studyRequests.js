import { apiErrorMessage } from '../utils/apiError.js';
import { studyFetch } from './studyFetch';
export async function getStudyRequests(signal) {
  const response = await studyFetch("/peer-request", {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json" },
    signal,
  });
  const data = await response.json().catch(() => null);

  if (
    (response.ok || response.status === 404) &&
    data?.message === "No Posts Created Yet"
  )
    return [];
  if (!response.ok) {
    throw new Error(apiErrorMessage(data, "Could not load study requests."));
  }
  const posts = data?.allPost ?? data?.succes;
  if (!Array.isArray(posts))
    throw new Error("The server returned an unexpected response.");
  return posts;
}

export async function createStudyRequest({ topic, mode, description }) {
  const response = await studyFetch("/peer-request", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, mode, description }),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(apiErrorMessage(data, "Could not create your study request."));
  }
  return data;
}

export async function claimRequest(id, meetup) {
  const response = await studyFetch('/peer-request/' + id + '/claim', {
    method: 'POST',
    ...(meetup ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(meetup) } : {}),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(apiErrorMessage(data, 'Could not claim the request.'));
  return data;
}
