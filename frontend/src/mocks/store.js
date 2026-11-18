import { initialGroups, initialRequests } from "./data";

const key = "studypeer-demo-v1";
export function readDemo() {
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    if (Array.isArray(saved?.groups) && Array.isArray(saved?.requests))
      return saved;
  } catch {
    return structuredClone({
      groups: initialGroups,
      requests: initialRequests,
    });
  }
  return structuredClone({ groups: initialGroups, requests: initialRequests });
}
export function saveDemo(data) {
  localStorage.setItem(key, JSON.stringify(data));
}
export function resetDemo() {
  localStorage.removeItem(key);
  sessionStorage.removeItem("studypeer-demo-signed-out");
}
