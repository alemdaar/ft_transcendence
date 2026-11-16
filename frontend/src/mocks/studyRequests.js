import { mockUser } from "./data";
import { readDemo, saveDemo } from "./store";

export function listDemoRequests(signal) {
  signal?.throwIfAborted();
  return readDemo().requests.filter(
    (request) => request.asker_id !== mockUser.id,
  );
}

export function createDemoRequest({ topic, mode, description }) {
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

export function claimDemoRequest(id) {
  const data = readDemo();
  const request = data.requests.find((item) => item.id === Number(id));
  if (!request) throw new Error("Request not found.");
  if (request.asker_id === mockUser.id)
    throw new Error("You cannot claim your own request.");
  if (request.status !== "open")
    throw new Error("This request has already been claimed.");
  request.helper_id = mockUser.id;
  request.status = "claimed";
  request.updated_at = new Date().toISOString();
  saveDemo(data);
  return request;
}
