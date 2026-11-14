import { mockEnabled } from "../mocks/config";
import { listGroups, createDemoGroup, groupAction } from "../mocks/groups";
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
  if (mockEnabled) {
    signal?.throwIfAborted();
    return listGroups({ scope, page, type, search, sort });
  }
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
  if (mockEnabled) return createDemoGroup(group);
  const response = await fetch("/groups", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(group),
  });
  return readResponse(response);
}

async function groupRequest(id, method, suffix = "", signal) {
  if (!Number.isSafeInteger(Number(id)) || Number(id) <= 0)
    throw new Error("Invalid group ID.");
  if (mockEnabled) {
    signal?.throwIfAborted();
    return groupAction(id, method, suffix);
  }
  const response = await fetch("/groups/" + Number(id) + suffix, {
    method,
    credentials: "include",
    headers: { Accept: "application/json" },
    signal,
  });
  return readResponse(response);
}

export async function getGroup(id, signal) {
  const group = await groupRequest(id, "GET", "", signal);
  if (!group || Number(group.id) !== Number(id))
    throw new Error("The server returned an unexpected group response.");
  return group;
}
export const joinGroup = (id) => groupRequest(id, "POST", "/join");
export const requestGroupJoin = (id) =>
  groupRequest(id, "POST", "/join-request");
export const deleteGroup = (id) => groupRequest(id, "DELETE");
