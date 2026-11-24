import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { mockStudyFetch } from '../mocks/study-request/api.js';
import { resetStudyData } from '../mocks/study-request/store.js';

beforeEach(() => {
  const values = new Map();
  const storage = { getItem: key => values.get(key) || null, setItem: (key, value) => values.set(key, String(value)), removeItem: key => values.delete(key) };
  globalThis.localStorage = storage;
  globalThis.sessionStorage = storage;
});
const call = async (path, method = 'GET', body) => {
  const response = await mockStudyFetch(path, { method, ...(body ? { body: JSON.stringify(body) } : {}) });
  return { status: response.status, data: await response.json() };
};

test('demo feed excludes own requests and activity includes the seeded sessions', async () => {
  assert.equal((await call('/peer-request')).data.allPost.some(post => post.asker_id === 1), false);
  assert((await call('/peer-request/myactivity/mine')).data.succes.some(post => post.id === 105));
  assert((await call('/peer-request/myactivity/iclaimed')).data.succes.some(post => post.id === 104));
});

test('demo supports online claims, repeat errors and session profiles', async () => {
  assert.equal((await call('/peer-request/102/claim', 'POST')).status, 200);
  assert.equal((await call('/peer-request/102/claim', 'POST')).status, 409);
  const result = await call('/session/102');
  assert.equal(result.data.succes.status, 'claimed');
  assert.equal(result.data.profiles.helper.name, 'Student One');
});

test('on-site claim requires meetup values and creates a pending session', async () => {
  assert.equal((await call('/peer-request/103/claim', 'POST')).status, 400);
  assert.equal((await call('/peer-request/103/claim', 'POST', { specificSpot: 'In library', meetTime: '12:00' })).status, 200);
  const result = await call('/session/103');
  assert.equal(result.data.succes.status, 'pending');
  assert.equal(result.data.succes.meetup.specificSpot, 'In library');
});

test('demo session handles unavailable participants and access restrictions', async () => {
  assert.equal((await call('/session/106')).data.profiles.helper.username, 'Unknown user');
  globalThis.sessionStorage.setItem('study-demo-user', '2');
  assert.equal((await call('/session/106')).status, 403);
  assert.equal((await call('/peer-request/myactivity/101', 'DELETE')).status, 403);
});

test('demo create, edit, delete and reset persist locally', async () => {
  const created = await call('/peer-request', 'POST', { topic: 'New request', description: 'A detailed description', mode: 'online' });
  const id = created.data.succes.id;
  await call('/peer-request/myactivity/' + id, 'PATCH', { topic: 'Edited request' });
  assert((await call('/peer-request/myactivity/mine')).data.succes.some(post => post.id === id && post.topic === 'Edited request'));
  assert.equal((await call('/peer-request/myactivity/' + id, 'DELETE')).status, 200);
  assert.equal((await call('/peer-request/myactivity/mine')).data.succes.some(post => post.id === id), false);
  await call('/peer-request/myactivity/101', 'DELETE');
  resetStudyData();
  assert((await call('/peer-request/myactivity/mine')).data.succes.some(post => post.id === 101));
});
