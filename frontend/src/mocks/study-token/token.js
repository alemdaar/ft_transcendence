const storageKey = 'studypeer-study-test-token';

export function getStudyTestToken() {
  return sessionStorage.getItem(storageKey) || '';
}

export function saveStudyTestToken(value) {
  const token = value.trim().replace(/^Bearer\s+/i, '');
  if (!/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token)) {
    throw new Error('Paste a JWT token. You can include the Bearer prefix.');
  }
  sessionStorage.setItem(storageKey, token);
}

export function clearStudyTestToken() {
  sessionStorage.removeItem(storageKey);
}
