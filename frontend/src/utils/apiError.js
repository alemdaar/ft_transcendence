export function apiErrorMessage(data, fallback) {
  const error = data?.error || data?.Error || data?.message;
  if (typeof error === 'string' && error.trim()) return error;
  if (Array.isArray(error)) {
    const messages = error.map(item => typeof item === 'string' ? item : item?.message).filter(Boolean);
    if (messages.length) return messages.join(' ');
  }
  return fallback;
}
