import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { normalizeSession, normalizeProfile } from '../utils/sessionProfiles.js';
import { apiErrorMessage } from '../utils/apiError.js';

async function loadService(name) {
  let code = await readFile(new URL('../services/' + name + '.js', import.meta.url), 'utf8');
  code = code.replace(/import \{ studyFetch \} from [^;]+;/, 'const studyFetch = (...args) => globalThis.studyTestFetch(...args);');
  for (const path of ['../utils/sessionProfiles.js', '../utils/apiError.js']) {
    code = code.replace(path, new URL(path, new URL('../services/', import.meta.url)).href);
  }
  return import('data:text/javascript,' + encodeURIComponent(code));
}

const session = (mode = 'online') => ({
  succes: { id: 66, asker_id: 65, helper_id: 625, topic: 'Web security', description: 'Help with web security', status: mode === 'online' ? 'claimed' : 'pending', mode, campus: 'Rabat', meetup: mode === 'insite' ? { specificSpot: 'In library', meetTime: '1970-01-01T12:00:00.000Z' } : null },
  profiles: { asker: { id: '65', name: 'Asker', avatar: '/asker.png' }, helper: { id: '625', name: 'Helper', avatar: '/helper.png' } },
});

function reply(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

test('session normalizes new online and on-site responses', () => {
  for (const mode of ['online', 'insite']) {
    const result = normalizeSession(session(mode));
    assert.equal(result.succes.mode, mode);
    assert.equal(result.profiles.asker.name, 'Asker');
    assert.equal(result.profiles.helper.avatar, '/helper.png');
    assert.equal(result.succes.meetup === null, mode === 'online');
  }
});

test('deleted or unavailable users do not hide session information', () => {
  const data = session('insite');
  data.profiles = { asker: { id: null, username: 'Unknown user', avatarUrl: null }, helper: null };
  const result = normalizeSession(data);
  assert.equal(result.succes.meetup.specificSpot, 'In library');
  assert.deepEqual(result.profiles.asker, { id: null, name: 'Unknown user', avatar: null });
  assert.deepEqual(result.profiles.helper, { id: null, name: 'Unknown user', avatar: null });
  delete data.profiles;
  assert.equal(normalizeSession(data).profiles.asker.name, 'Unknown user');
});

test('profile variants, missing images and invalid profiles', () => {
  assert.equal(normalizeProfile({ username: 'Student', avatarUrl: '/photo.png' }).avatar, '/photo.png');
  assert.equal(normalizeProfile({ name: ' ', username: 'Student' }).name, 'Student');
  assert.equal(normalizeProfile({ name: 123 }).name, 'Unknown user');
  assert.equal(normalizeProfile({ avatar: 'javascript:alert(1)' }).avatar, null);
  assert.throws(() => normalizeSession({ succes: {} }), /Unexpected session/);
});

test('GET session uses singular endpoint and propagates cancellation/errors', async () => {
  const api = await loadService('requestActivity');
  const controller = new AbortController();
  globalThis.studyTestFetch = async (path, options) => {
    assert.equal(path, '/session/66');
    assert.equal(options.method, 'GET');
    assert.equal(options.signal, controller.signal);
    return reply(session());
  };
  assert.equal((await api.getSession(66, controller.signal)).profiles.helper.name, 'Helper');
  for (const status of [400, 401, 403, 404, 500]) {
    globalThis.studyTestFetch = async () => reply({ error: 'failure-' + status }, status);
    await assert.rejects(api.getSession(66), new RegExp('failure-' + status));
  }
  for (const id of [0, -1, 'bad', 1.5]) await assert.rejects(api.getSession(id), /Invalid session/);
  globalThis.studyTestFetch = async () => { throw new DOMException('Aborted', 'AbortError'); };
  await assert.rejects(api.getSession(66), { name: 'AbortError' });
});

test('activity handles both empty-response shapes and preserves mutation contracts', async () => {
  const api = await loadService('requestActivity');
  for (const scope of ['mine', 'iclaimed']) {
    const message = scope === 'mine' ? 'No requests Posted From You!' : 'No Post are Claimed From You!';
    for (const field of ['message', 'error']) {
      globalThis.studyTestFetch = async () => reply({ [field]: message });
      assert.deepEqual(await api.getActivity(scope), []);
    }
    globalThis.studyTestFetch = async () => reply({ succes: [{ id: 36 }] });
    assert.equal((await api.getActivity(scope))[0].id, 36);
  }
  globalThis.studyTestFetch = async (path, options) => {
    assert.equal(path, '/peer-request/myactivity/36');
    assert.equal(options.method, 'PATCH');
    assert.deepEqual(JSON.parse(options.body), { topic: 'Updated topic', description: 'Updated description' });
    return reply({ succes: { id: 36 } });
  };
  await api.editRequest(36, { topic: 'Updated topic', description: 'Updated description' });
  globalThis.studyTestFetch = async (path, options) => {
    assert.equal(options.method, 'DELETE');
    assert.equal('body' in options, false);
    return reply({ succes: { id: 36 } });
  };
  await api.deleteRequest(36);
});

test('feed supports documented and current list shapes and server errors', async () => {
  const api = await loadService('studyRequests');
  for (const field of ['allPost', 'succes']) {
    globalThis.studyTestFetch = async () => reply({ [field]: [{ id: 2 }] });
    assert.equal((await api.getStudyRequests())[0].id, 2);
  }
  globalThis.studyTestFetch = async () => reply({ message: 'No Posts Created Yet' });
  assert.deepEqual(await api.getStudyRequests(), []);
  globalThis.studyTestFetch = async () => reply({ error: 'Database unavailable' }, 500);
  await assert.rejects(api.getStudyRequests(), /Database unavailable/);
});

test('claims send meetup data only for on-site requests', async () => {
  const api = await loadService('studyRequests');
  globalThis.studyTestFetch = async (path, options) => {
    assert.equal(path, '/peer-request/7/claim');
    assert.equal(options.method, 'POST');
    assert.equal('body' in options, false);
    return reply({ succes: 'claimed' });
  };
  await api.claimRequest(7);
  const meetup = { specificSpot: 'In library', meetTime: '12:00' };
  globalThis.studyTestFetch = async (path, options) => {
    assert.deepEqual(JSON.parse(options.body), meetup);
    return reply({ succes: 'pending' });
  };
  await api.claimRequest(7, meetup);
});

test('validation errors are readable text rather than object strings', () => {
  assert.equal(apiErrorMessage({ error: [{ field: 'topic', message: 'Topic too short' }] }, 'Failed'), 'Topic too short');
  assert.equal(apiErrorMessage(null, 'Failed'), 'Failed');
});

test('authenticated fetch permits singular session API and includes bearer token', async () => {
  let source = await readFile(new URL('../services/authorizedFetch.js', import.meta.url), 'utf8');
  source = source.replace(/import \{ getAccessToken, invalidateAccessToken \} from [^;]+;/, "const getAccessToken = async () => 'test-token'; const invalidateAccessToken = () => {};");
  const { authorizedFetch } = await import('data:text/javascript,' + encodeURIComponent(source));
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async (path, options) => {
      assert.equal(path, '/session/66');
      assert.equal(options.headers.get('Authorization'), 'Bearer test-token');
      return reply(session());
    };
    assert.equal((await authorizedFetch('/session/66')).status, 200);
    await assert.rejects(authorizedFetch('https://example.com/session/66'), /Unsupported/);
  } finally { globalThis.fetch = original; }
});
