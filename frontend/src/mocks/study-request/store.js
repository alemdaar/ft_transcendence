import { initialStudyRequests } from './data.js';
const key = 'study-request-demo-v2';
export function readStudyData() {
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    if (Array.isArray(saved)) return saved;
  } catch { return structuredClone(initialStudyRequests); }
  return structuredClone(initialStudyRequests);
}
export function saveStudyData(data) { localStorage.setItem(key, JSON.stringify(data)); }
export function studyUserId() { return sessionStorage.getItem('study-demo-user') === '2' ? 2 : 1; }
export function resetStudyData() { localStorage.removeItem(key); }
