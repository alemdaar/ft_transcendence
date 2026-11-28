import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { getStudyTestToken, saveStudyTestToken, clearStudyTestToken } from '../mocks/study-token/token.js';

const source = (await readFile(new URL('../mocks/study-token/fetch.js', import.meta.url), 'utf8'))
  .replace("'./token'", JSON.stringify(new URL('../mocks/study-token/token.js', import.meta.url).href));
const { studyTestTokenFetch } = await import('data:text/javascript,' + encodeURIComponent(source));

test('local token is sent to study endpoints only, and removal stops requests', async () => {
  const values = new Map();
  const originalStorage = globalThis.sessionStorage;
  const originalFetch = globalThis.fetch;
  globalThis.sessionStorage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key),
  };
  try {
    let calls = 0;
    globalThis.fetch = async (path, options) => {
      calls += 1;
      assert.equal(path, '/peer-request/1/claim');
      assert.equal(options.method, 'POST');
      assert.equal(options.headers.get('Authorization'), 'Bearer header.payload.signature');
      assert.equal(options.headers.get('Content-Type'), 'application/json');
      return new Response('{}', { status: 201 });
    };
    assert.throws(() => studyTestTokenFetch('/peer-request'), /Paste your/);
    assert.throws(() => saveStudyTestToken('invalid'), /JWT/);
    saveStudyTestToken(' Bearer header.payload.signature ');
    assert.equal(getStudyTestToken(), 'header.payload.signature');
    assert.equal((await studyTestTokenFetch('/peer-request/1/claim', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
    })).status, 201);
    for (const path of ['/auth/me', '/groups', 'https://example.com/peer-request', '//example.com']) {
      assert.throws(() => studyTestTokenFetch(path), /Unsupported/);
    }
    clearStudyTestToken();
    assert.equal(getStudyTestToken(), '');
    assert.throws(() => studyTestTokenFetch('/peer-request'), /Paste your/);
    assert.equal(calls, 1);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalStorage === undefined) delete globalThis.sessionStorage;
    else globalThis.sessionStorage = originalStorage;
  }
});
