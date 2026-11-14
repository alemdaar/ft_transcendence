import { mockEnabled } from "../mocks/config";
import { mockUser } from "../mocks/data";
import { readDemo, saveDemo } from "../mocks/store";
export async function getStudyRequests(signal) {
  if (mockEnabled) {
    signal?.throwIfAborted();
    return readDemo().requests.filter(
      (request) => request.asker_id !== mockUser.id,
    );
  }
  const response = await fetch("/peer-request", {
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
    throw new Error(
      typeof data?.Error === "string"
        ? data.Error
        : typeof data?.message === "string"
          ? data.message
          : "Could not load study requests.",
    );
  }
  if (!Array.isArray(data?.allPost))
    throw new Error("The server returned an unexpected response.");
  return data.allPost;
}

export async function createStudyRequest({ topic, mode, description }) {
  if (mockEnabled) {
    const data = readDemo();
    data.requests.push({
      id: Math.max(0, ...data.requests.map((request) => request.id)) + 1,
      asker_id: mockUser.id,
      topic,
      mode,
      description,
      campus: mockUser.campus,
      status: "open",
    });
    saveDemo(data);
    return { message: "Request created." };
  }
  const response = await fetch("/peer-request", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, mode, description }),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      typeof data?.Error === "string"
        ? data.Error
        : "Could not create your study request.",
    );
  }
  return data;
}
