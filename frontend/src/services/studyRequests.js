export async function getStudyRequests(signal) {
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
  const response = await fetch("/peer-request", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, mode, description }),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      typeof data?.message === "string"
        ? data.message
        : "Could not create your study request.",
    );
  }
  return data;
}
