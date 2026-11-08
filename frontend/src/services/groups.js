async function readResponse(response) {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      data?.error || data?.message || "Could not complete the group request.",
    );
  }
  return data;
}

export async function getGroups(
  { scope, page = 1, type = "", search = "", sort = "" },
  signal,
) {
  const query = new URLSearchParams({ scope, page: String(page) });
  if (scope === "discover") {
    if (type) query.set("type", type);
    if (search.trim()) query.set("search", search.trim());
    if (sort === "oldest") query.set("sort", sort);
  }
  const response = await fetch("/groups?" + query, {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json" },
    signal,
  });
  const result = await readResponse(response);
  if (!Array.isArray(result?.data) || !result?.pagination) {
    throw new Error("The server returned an unexpected groups response.");
  }
  return result;
}

export async function createGroup(group) {
  const response = await fetch("/groups", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(group),
  });
  return readResponse(response);
}
