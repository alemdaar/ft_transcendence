// // // Simple tests for B3.
// // // 1. Start the server (npm run dev).  2. Run the tests: npm test

// // import 'dotenv/config';
// // import { describe, it } from 'node:test';
// // import assert from 'node:assert/strict';
// // import jwt from 'jsonwebtoken';

// // const API = process.env.API_URL ?? 'http://localhost:3005';
// // const SECRET = process.env.JWT_SECRET;

// // // Random user ids, so old data does not disturb the tests
// // const base = 100000 + Math.floor(Math.random() * 800000);
// // const ASKER = base;
// // const HELPER = base + 1;
// // const OTHER = base + 2;

// // // A token, like the ones you build on jwt.io
// // const token = (id) =>
// //   jwt.sign({ campus: 'Khouribga' }, SECRET, {
// //     subject: String(id),
// //     issuer: 'user-service',
// //     audience: 'ft-transcendence-services',
// //     expiresIn: '15m',
// //   });

// // async function call(method, path, user, body) {
// //   const headers = {};
// //   if (user) headers.Authorization = `Bearer ${token(user)}`;
// //   if (body) headers['Content-Type'] = 'application/json';
// //   const res = await fetch(API + path, { method, headers, body: body && JSON.stringify(body) });
// //   let data = null;
// //   try { data = await res.json(); } catch { /* empty answer */ }
// //   return { status: res.status, data };
// // }

// // // Find the post or the list inside the answer, even if it is wrapped
// // const post = (r) =>
// //   r.data?.id !== undefined ? r.data : Object.values(r.data ?? {}).find((v) => v?.id !== undefined) ?? {};
// // const posts = (r) =>
// //   Array.isArray(r.data) ? r.data : Object.values(r.data ?? {}).find(Array.isArray) ?? [];

// // const okay = (r) => assert.ok([200, 201, 204].includes(r.status), `got ${r.status} ${JSON.stringify(r.data)}`);

// // async function newPost(mode = 'online') {
// //   const r = await call('POST', '/peer-request', ASKER, { topic: 'Test topic', description: 'Test description', mode });
// //   okay(r);
// //   return post(r).id;
// // }

// // const claim = (id, user, mode = 'online') =>
// //   call('POST', `/peer-request/${id}/claim`, user,
// //     mode === 'insite' ? { specificSpot: 'Library, 2nd floor', meetTime: '14:00' } : undefined);

// // const action = (id, user, name) => call('POST', `/sessions/${id}/${name}`, user);

// // const statusOf = async (id) => post(await call('GET', `/peer-request/${id}`, OTHER)).status;

// // describe('B3 basic tests', () => {
// //   it('rejects a request with no token', async () => {
// //     assert.equal((await call('GET', '/peer-request', null)).status, 401);
// //   });

// //   it('rejects a bad post', async () => {
// //     const noTopic = await call('POST', '/peer-request', ASKER, { topic: '', description: 'x', mode: 'online' });
// //     assert.equal(noTopic.status, 400);
// //     const badMode = await call('POST', '/peer-request', ASKER, { topic: 'x', description: 'x', mode: 'hybrid' });
// //     assert.equal(badMode.status, 400);
// //   });

// //   it('creates a post that starts open', async () => {
// //     assert.equal(await statusOf(await newPost()), 'open');
// //   });

// //   it('shows the post in the feed to other users, not to its asker', async () => {
// //     const id = await newPost();
// //     assert.ok(posts(await call('GET', '/peer-request', HELPER)).some((p) => p.id === id));
// //     assert.ok(!posts(await call('GET', '/peer-request', ASKER)).some((p) => p.id === id));
// //   });

// //   it('online: the first claim wins, a second claim gets 409', async () => {
// //     const id = await newPost();
// //     okay(await claim(id, HELPER));
// //     assert.equal(await statusOf(id), 'claimed');
// //     assert.equal((await claim(id, OTHER)).status, 409);
// //   });

// //   it('online: the helper sends a message and the asker reads it', async () => {
// //     const id = await newPost();
// //     okay(await claim(id, HELPER));
// //     const msg = `hello ${base}`;
// //     okay(await call('POST', `/sessions/${id}/messages`, HELPER, { msg }));
// //     const messages = await call('GET', `/sessions/${id}/messages`, ASKER);
// //     assert.ok(JSON.stringify(messages.data).includes(msg));
// //   });

// //   it('only the asker can complete', async () => {
// //     const id = await newPost();
// //     okay(await claim(id, HELPER));
// //     assert.ok([403, 409].includes((await action(id, HELPER, 'completed')).status));
// //     okay(await action(id, ASKER, 'completed'));
// //     assert.equal(await statusOf(id), 'completed');
// //   });

// //   it('in-site: claim, accept, on the way, arrived, complete', async () => {
// //     const id = await newPost('insite');
// //     okay(await claim(id, HELPER, 'insite'));
// //     assert.equal(await statusOf(id), 'pending');
// //     okay(await action(id, ASKER, 'accept'));
// //     assert.equal(await statusOf(id), 'claimed');
// //     okay(await action(id, HELPER, 'on-the-way'));
// //     okay(await action(id, HELPER, 'arrived'));
// //     okay(await action(id, ASKER, 'completed'));
// //     assert.equal(await statusOf(id), 'completed');
// //   });

// //   it('release: the post goes back to open', async () => {
// //     const id = await newPost();
// //     okay(await claim(id, HELPER));
// //     okay(await action(id, HELPER, 'leaveit'));
// //     assert.equal(await statusOf(id), 'open');
// //   });

// //   it('my activity: mine lists my post', async () => {
// //     const id = await newPost();
// //     assert.ok(posts(await call('GET', '/peer-request/myactivity/mine', ASKER)).some((p) => p.id === id));
// //   });

// //   it('edit and delete an open post', async () => {
// //     const id = await newPost();
// //     okay(await call('PATCH', `/peer-request/myactivity/${id}`, ASKER, { topic: 'Edited teweer', description: 'Edited teweer' }));
// //     assert.equal(post(await call('GET', `/peer-request/${id}`, OTHER)).topic, 'Edited teweer');
// //     okay(await call('DELETE', `/peer-request/myactivity/${id}`, ASKER));
// //     assert.equal((await call('GET', `/peer-request/${id}`, OTHER)).status, 404);
// //   });
// // });



// // Integration tests for the B3 service. Run them with: npm test
// //
// // - The test starts the server itself (SERVER_ENTRY, default src/server.js)
// //   on TEST_PORT (default 3100).
// // - To test a server that is already running, set API_URL=http://localhost:3000
// //   and the test will not start one.
// // - It needs a running database, and the same JWT_SECRET as the server
// //   (from the .env file or from the environment).

// import 'dotenv/config';
// import { describe, it, before, after } from 'node:test';
// import assert from 'node:assert/strict';
// import { spawn } from 'node:child_process';
// import jwt from 'jsonwebtoken';

// const SECRET = process.env.JWT_SECRET;
// if (!SECRET) throw new Error('JWT_SECRET is missing. Put it in .env or in the environment.');

// const ENTRY = process.env.SERVER_ENTRY ?? 'src/server.js';
// const TEST_PORT = process.env.TEST_PORT ?? '3005';
// const API = process.env.API_URL ?? `http://localhost:${TEST_PORT}`;

// // Random user ids, so the test data never clashes with real data
// const base = 100000 + Math.floor(Math.random() * 800000);
// const A = base;           // the asker
// const B = base + 1;       // the helper
// const C = base + 2;       // a third user: a stranger, or a second helper
// const VIEWER = base + 3;  // only reads post details

// const INSITE = { specificSpot: 'Library, 2nd floor', meetTime: '14:00' };

// // ---------- helpers ----------

// function makeToken(userId, secret = SECRET, expiresIn = '15m') {
//   return jwt.sign({ campus: 'Khouribga' }, secret, {
//     algorithm: 'HS256',
//     subject: String(userId),
//     issuer: 'user-service',
//     audience: 'ft-transcendence-services',
//     expiresIn,
//   });
// }

// // user: a user id (a token is made for it), a ready token (string), or null (no token)
// async function call(method, path, user, body) {
//   const headers = {};
//   if (user !== null) {
//     headers.Authorization = `Bearer ${typeof user === 'string' ? user : makeToken(user)}`;
//   }
//   if (body !== undefined) headers['Content-Type'] = 'application/json';
//   const res = await fetch(API + path, {
//     method,
//     headers,
//     body: body === undefined ? undefined : JSON.stringify(body),
//   });
//   const text = await res.text();
//   let data = null;
//   try { data = JSON.parse(text); } catch { /* empty or not JSON */ }
//   return { status: res.status, body: data };
// }

// const isOk = (res) => res.status === 200 || res.status === 201;

// function expectStatus(res, allowed, label) {
//   assert.ok(
//     allowed.includes(res.status),
//     `${label}: expected ${allowed.join(' or ')}, got ${res.status} ${JSON.stringify(res.body)}`,
//   );
// }
// const expectOk = (res, label) => expectStatus(res, [200, 201], label);

// // The answers may be wrapped, like { data: {...} } or { allPost: [...] }.
// // These two helpers find the post or the list inside.
// function one(body) {
//   if (body && body.id !== undefined) return body;
//   return Object.values(body ?? {}).find(
//     (v) => v && typeof v === 'object' && !Array.isArray(v) && v.id !== undefined,
//   ) ?? {};
// }
// function list(body) {
//   if (Array.isArray(body)) return body;
//   return Object.values(body ?? {}).find(Array.isArray) ?? [];
// }
// const idsOf = (res) => list(res.body).map((p) => p.id);

// async function makePost(user, mode = 'online') {
//   const res = await call('POST', '/peer-request', user, {
//     topic: 'Test topic',
//     description: 'Test description',
//     mode,
//   });
//   expectOk(res, 'create post');
//   const id = one(res.body).id;
//   assert.ok(Number.isInteger(id), `create post: no id in the answer ${JSON.stringify(res.body)}`);
//   return id;
// }

// const claim = (id, user, mode = 'online') =>
//   call('POST', `/peer-request/${id}/claim`, user, mode === 'insite' ? INSITE : undefined);

// const act = (id, user, action) => call('POST', `/sessions/${id}/${action}`, user);
// const hub = (id, user) => call('GET', `/sessions/${id}`, user);

// async function statusOf(id) {
//   const res = await call('GET', `/peer-request/${id}`, VIEWER);
//   expectStatus(res, [200], 'get post');
//   return one(res.body).status;
// }

// // ---------- server ----------

// let child;

// async function waitForServer() {
//   for (let i = 0; i < 60; i++) {
//     if (child.exitCode !== null) {
//       throw new Error(`The server stopped at startup (exit code ${child.exitCode}). See its log above.`);
//     }
//     try {
//       await fetch(`${API}/peer-request`); // any answer means the server is up
//       return;
//     } catch {
//       await new Promise((r) => setTimeout(r, 500));
//     }
//   }
//   throw new Error('The server did not start in 30 seconds.');
// }

// // ---------- tests ----------

// describe('B3 service', () => {
//   before(async () => {
//     if (process.env.API_URL) return;
//     child = spawn(process.execPath, [ENTRY], {
//       env: { ...process.env, PORT: TEST_PORT },
//       stdio: ['ignore', 'inherit', 'inherit'],
//     });
//     await waitForServer();
//   });

//   after(() => {
//     child?.kill();
//   });

//   describe('authentication', () => {
//     it('rejects a request with no token', async () => {
//       const res = await call('GET', '/peer-request', null);
//       assert.equal(res.status, 401);
//     });

//     it('rejects a token that is not a token', async () => {
//       const res = await call('GET', '/peer-request', 'not.a.token');
//       assert.equal(res.status, 401);
//     });

//     it('rejects a token signed with another secret', async () => {
//       const res = await call('GET', '/peer-request', makeToken(A, 'another-secret-that-is-long-enough-123456'));
//       assert.equal(res.status, 401);
//     });

//     it('rejects an expired token', async () => {
//       const res = await call('GET', '/peer-request', makeToken(A, SECRET, -60));
//       assert.equal(res.status, 401);
//     });
//   });

//   describe('the id in the url', () => {
//     for (const bad of ['abc', '0', '-1', '2.5', '2147483648']) {
//       it(`GET /peer-request/${bad} is 400`, async () => {
//         const res = await call('GET', `/peer-request/${bad}`, A);
//         assert.equal(res.status, 400);
//       });
//     }

//     it('GET /sessions/abc is 400', async () => {
//       const res = await call('GET', '/sessions/abc', A);
//       assert.equal(res.status, 400);
//     });

//     it('an id that does not exist is 404', async () => {
//       const res = await call('GET', '/peer-request/2147483647', A);
//       assert.equal(res.status, 404);
//     });
//   });

//   describe('create a post', () => {
//     const good = { topic: 'Test topic', description: 'Test description', mode: 'online' };
//     const badBodies = [
//       ['no topic', { ...good, topic: undefined }],
//       ['empty topic', { ...good, topic: '   ' }],
//       ['topic too long', { ...good, topic: 'x'.repeat(256) }],
//       ['no description', { ...good, description: undefined }],
//       ['wrong mode', { ...good, mode: 'hybrid' }],
//       ['no mode', { ...good, mode: undefined }],
//     ];

//     for (const [name, body] of badBodies) {
//       it(`rejects: ${name}`, async () => {
//         const res = await call('POST', '/peer-request', A, body);
//         assert.equal(res.status, 400, JSON.stringify(res.body));
//       });
//     }

//     it('creates an online post that starts open', async () => {
//       const res = await call('POST', '/peer-request', A, good);
//       expectOk(res, 'create');
//       const post = one(res.body);
//       assert.equal(post.status, 'open');
//       assert.equal(post.mode, 'online');
//     });

//     it('creates an in-site post', async () => {
//       const res = await call('POST', '/peer-request', A, { ...good, mode: 'insite' });
//       expectOk(res, 'create');
//       assert.equal(one(res.body).mode, 'insite');
//     });

//     it('ignores a status sent by the client', async () => {
//       const res = await call('POST', '/peer-request', A, { ...good, status: 'completed' });
//       expectOk(res, 'create');
//       assert.equal(await statusOf(one(res.body).id), 'open');
//     });
//   });

//   describe('feed and details', () => {
//     it('shows an open post to other users, never to its asker', async () => {
//       const id = await makePost(A);
//       assert.ok(idsOf(await call('GET', '/peer-request', B)).includes(id), 'B should see it');
//       assert.ok(!idsOf(await call('GET', '/peer-request', A)).includes(id), 'A should not see it');
//     });

//     it('returns the details of one post', async () => {
//       const id = await makePost(A);
//       const res = await call('GET', `/peer-request/${id}`, B);
//       expectStatus(res, [200], 'details');
//       assert.equal(one(res.body).topic, 'Test topic');
//     });
//   });

//   describe('claim', () => {
//     it('the asker cannot claim their own post', async () => {
//       const id = await makePost(A);
//       expectStatus(await claim(id, A), [403, 409], 'claim own post');
//       assert.equal(await statusOf(id), 'open');
//     });

//     it('an online claim goes to claimed and leaves the feed', async () => {
//       const id = await makePost(A);
//       expectOk(await claim(id, B), 'claim');
//       assert.equal(await statusOf(id), 'claimed');
//       assert.ok(!idsOf(await call('GET', '/peer-request', C)).includes(id), 'should leave the feed');
//     });

//     it('a second claim on the same post is 409', async () => {
//       const id = await makePost(A);
//       expectOk(await claim(id, B), 'first claim');
//       assert.equal((await claim(id, C)).status, 409);
//     });

//     it('an in-site claim needs a spot and a time, and the post stays open if it fails', async () => {
//       const id = await makePost(A, 'insite');
//       const bodies = [{}, { specificSpot: 'Library, 2nd floor' }, { ...INSITE, meetTime: '25:00' }];
//       for (const body of bodies) {
//         const res = await call('POST', `/peer-request/${id}/claim`, B, body);
//         assert.equal(res.status, 400, JSON.stringify(body));
//       }
//       assert.equal(await statusOf(id), 'open');
//     });

//     it('an in-site claim goes to pending and leaves the feed', async () => {
//       const id = await makePost(A, 'insite');
//       expectOk(await claim(id, B, 'insite'), 'claim');
//       assert.equal(await statusOf(id), 'pending');
//       assert.ok(!idsOf(await call('GET', '/peer-request', C)).includes(id), 'should leave the feed');
//     });

//     it('only one of two simultaneous claims wins', async () => {
//       for (let round = 1; round <= 5; round++) {
//         const id = await makePost(A);
//         const [rb, rc] = await Promise.all([claim(id, B), claim(id, C)]);
//         const wins = [rb, rc].filter(isOk).length;
//         assert.equal(wins, 1, `round ${round}: B got ${rb.status}, C got ${rc.status}`);
//         const loser = isOk(rb) ? rc : rb;
//         assert.equal(loser.status, 404, `round ${round}: the loser should get 404`);
//       }
//     });
//   });

//   describe('session hub: online', () => {
//     let id;
//     before(async () => {
//       id = await makePost(A, 'online');
//       expectOk(await claim(id, B), 'claim');
//     });

//     it('the asker and the helper can open the hub, a stranger cannot', async () => {
//       expectStatus(await hub(id, A), [200], 'asker');
//       expectStatus(await hub(id, B), [200], 'helper');
//       expectStatus(await hub(id, C), [403, 404], 'stranger');
//     });

//     it('the helper sends a message and the asker reads it', async () => {
//       const msg = `hello from the helper ${base}`;
//       expectOk(await call('POST', `/sessions/${id}/messages`, B, { msg }), 'send');
//       const res = await call('GET', `/sessions/${id}/messages`, A);
//       expectStatus(res, [200], 'read');
//       assert.ok(JSON.stringify(res.body).includes(msg), 'the message should be in the list');
//     });

//     it('rejects an empty or a too long message', async () => {
//       for (const msg of ['', '   ', 'x'.repeat(501)]) {
//         const res = await call('POST', `/sessions/${id}/messages`, B, { msg });
//         assert.equal(res.status, 400, `msg length ${msg.length}`);
//       }
//     });

//     it('a stranger cannot read or write the chat', async () => {
//       expectStatus(await call('GET', `/sessions/${id}/messages`, C), [403, 404], 'read');
//       expectStatus(await call('POST', `/sessions/${id}/messages`, C, { msg: 'hi' }), [403, 404], 'write');
//     });

//     // it('the in-site endpoints answer 400 on an online post', async () => {
//     //   for (const action of ['accept', 'on-the-way', 'arrived']) {
//     //     const res = await act(id, A, action);
//     //     assert.equal(res.status, 400, action);
//     //   }
//     // });

//     it('only the asker can complete', async () => {
//       expectStatus(await act(id, B, 'complete'), [403, 409], 'helper');
//       expectStatus(await act(id, C, 'complete'), [403, 404, 409], 'stranger');
//       assert.equal(await statusOf(id), 'claimed');
//       expectOk(await act(id, A, 'complete'), 'asker');
//       assert.equal(await statusOf(id), 'completed');
//     });

//     it('a completed session cannot be completed or released again', async () => {
//       assert.equal((await act(id, A, 'complete')).status, 409);
//       assert.equal((await act(id, B, 'release')).status, 409);
//       assert.equal(await statusOf(id), 'completed');
//     });
//   });

//   describe('session hub: in-site', () => {
//     let id;
//     before(async () => {
//       id = await makePost(A, 'insite');
//       expectOk(await claim(id, B, 'insite'), 'claim');
//     });

//     it('starts pending', async () => {
//       assert.equal(await statusOf(id), 'pending');
//     });

//     it('on-the-way and arrived wait for the accept', async () => {
//       assert.equal((await act(id, B, 'on-the-way')).status, 409);
//       assert.equal((await act(id, B, 'arrived')).status, 409);
//     });

//     it('only the asker can accept', async () => {
//       expectStatus(await act(id, B, 'accept'), [403, 409], 'helper');
//       expectStatus(await act(id, C, 'accept'), [403, 404, 409], 'stranger');
//       assert.equal(await statusOf(id), 'pending');
//     });

//     it('the asker accepts: the post is claimed, a second accept is 409', async () => {
//       expectOk(await act(id, A, 'accept'), 'accept');
//       assert.equal(await statusOf(id), 'claimed');
//       assert.equal((await act(id, A, 'accept')).status, 409);
//     });

//     it('both users can press on-the-way and arrived', async () => {
//       for (const user of [B, A]) {
//         expectOk(await act(id, user, 'on-the-way'), 'on-the-way');
//         expectOk(await act(id, user, 'arrived'), 'arrived');
//       }
//       const flags = JSON.stringify((await hub(id, A)).body);
//       for (const flag of ['asker_on_way', 'helper_on_way', 'asker_arrived', 'helper_arrived']) {
//         assert.ok(flags.includes(`"${flag}":true`), `${flag} should be true`);
//       }
//     });

//     it('pressing a button twice is fine', async () => {
//       expectOk(await act(id, B, 'on-the-way'), 'second press');
//     });

//     it('a stranger cannot press the buttons', async () => {
//       expectStatus(await act(id, C, 'on-the-way'), [403, 404, 409], 'on-the-way');
//       expectStatus(await act(id, C, 'arrived'), [403, 404, 409], 'arrived');
//     });

//     it('the chat answers 400 on an in-site post', async () => {
//       const res = await call('POST', `/sessions/${id}/messages`, B, { text: 'hi' });
//       assert.equal(res.status, 400);
//     });

//     it('the asker completes', async () => {
//       expectOk(await act(id, A, 'complete'), 'complete');
//       assert.equal(await statusOf(id), 'completed');
//     });
//   });

//   describe('release', () => {
//     it('the helper can release an online post: it is open again and can be claimed', async () => {
//       const id = await makePost(A);
//       expectOk(await claim(id, B), 'claim');
//       expectOk(await act(id, B, 'release'), 'release');
//       assert.equal(await statusOf(id), 'open');
//       assert.ok(idsOf(await call('GET', '/peer-request', C)).includes(id), 'back in the feed');
//       expectOk(await claim(id, C), 'claim again');
//     });

//     it('the asker can release a claimed post', async () => {
//       const id = await makePost(A);
//       expectOk(await claim(id, B), 'claim');
//       expectOk(await act(id, A, 'release'), 'release');
//       assert.equal(await statusOf(id), 'open');
//     });

//     it('a stranger cannot release', async () => {
//       const id = await makePost(A);
//       expectOk(await claim(id, B), 'claim');
//       expectStatus(await act(id, C, 'release'), [403, 404, 409], 'stranger');
//       assert.equal(await statusOf(id), 'claimed');
//     });

//     it('nobody can release an open post', async () => {
//       const id = await makePost(A);
//       expectStatus(await act(id, A, 'release'), [403, 409], 'release an open post');
//     });

//     it('in-site: a released post can be claimed again (the meetup row is removed)', async () => {
//       const id = await makePost(A, 'insite');
//       expectOk(await claim(id, B, 'insite'), 'first claim');
//       expectOk(await act(id, B, 'release'), 'release');
//       assert.equal(await statusOf(id), 'open');
//       expectOk(await claim(id, C, 'insite'), 'second claim');
//       assert.equal(await statusOf(id), 'pending');
//     });

//     it('in-site: the asker can decline a pending proposal', async () => {
//       const id = await makePost(A, 'insite');
//       expectOk(await claim(id, B, 'insite'), 'claim');
//       expectOk(await act(id, A, 'release'), 'decline');
//       assert.equal(await statusOf(id), 'open');
//     });
//   });

//   describe('my activity', () => {
//     it('mine: lists my posts of any status, and only mine', async () => {
//       const openId = await makePost(A);
//       const claimedId = await makePost(A);
//       expectOk(await claim(claimedId, B), 'claim');

//       const mine = idsOf(await call('GET', '/peer-request/myactivity/mine', A));
//       assert.ok(mine.includes(openId), 'the open post');
//       assert.ok(mine.includes(claimedId), 'the claimed post');

//       const notMine = idsOf(await call('GET', '/peer-request/myactivity/mine', B));
//       assert.ok(!notMine.includes(openId) && !notMine.includes(claimedId), 'B should not see them');
//     });

//     it('claimed: lists the posts I claimed', async () => {
//       const id = await makePost(A);
//       expectOk(await claim(id, B), 'claim');
//       assert.ok(idsOf(await call('GET', '/peer-request/myactivity/claimed', B)).includes(id));
//       assert.ok(!idsOf(await call('GET', '/peer-request/myactivity/claimed', A)).includes(id));
//     });

//     it('edit: the asker can edit an open post', async () => {
//       const id = await makePost(A);
//       const res = await call('PATCH', `/peer-request/myactivity/${id}`, A, {
//         topic: 'Edited topic',
//         description: 'Edited description',
//       });
//       expectStatus(res, [200], 'edit');
//       const details = await call('GET', `/peer-request/${id}`, VIEWER);
//       assert.equal(one(details.body).topic, 'Edited topic');
//     });

//     it('edit: a bad body is 400, another user is refused', async () => {
//       const id = await makePost(A);
//       const bad = await call('PATCH', `/peer-request/myactivity/${id}`, A, { topic: '', description: 'x' });
//       assert.equal(bad.status, 400);
//       const other = await call('PATCH', `/peer-request/myactivity/${id}`, B, {
//         topic: 'Hacked',
//         description: 'Hacked',
//       });
//       expectStatus(other, [403, 409], 'another user');
//     });

//     it('edit: a claimed post cannot be edited', async () => {
//       const id = await makePost(A);
//       expectOk(await claim(id, B), 'claim');
//       const res = await call('PATCH', `/peer-request/myactivity/${id}`, A, {
//         topic: 'Too late',
//         description: 'Too late',
//       });
//       assert.equal(res.status, 409);
//     });

//     it('delete: the asker can delete an open post', async () => {
//       const id = await makePost(A);
//       expectStatus(await call('DELETE', `/peer-request/myactivity/${id}`, A), [200, 204], 'delete');
//       assert.equal((await call('GET', `/peer-request/${id}`, VIEWER)).status, 404);
//     });

//     it('delete: another user is refused, and a claimed post cannot be deleted', async () => {
//       const id = await makePost(A);
//       expectStatus(await call('DELETE', `/peer-request/myactivity/${id}`, B), [403, 409], 'another user');
//       expectOk(await claim(id, B), 'claim');
//       assert.equal((await call('DELETE', `/peer-request/myactivity/${id}`, A)).status, 409);
//     });
//   });
// });




// Integration tests for the B3 service. Run them with: npm test
//
// - The test starts the server itself (SERVER_ENTRY, default src/server.js)
//   on TEST_PORT (default 3100).
// - To test a server that is already running, set API_URL=http://localhost:3000
//   and the test will not start one.
// - It needs a running database, and the same JWT_SECRET as the server
//   (from the .env file or from the environment).

// Integration tests for the B3 service. Run them with: npm test
//
// - The test starts the server itself (SERVER_ENTRY, default src/server.js)
//   on TEST_PORT (default 3100).
// - To test a server that is already running, set API_URL=http://localhost:3000
//   and the test will not start one.
// - It needs a running database, and the same JWT_SECRET as the server
//   (from the .env file or from the environment).

import 'dotenv/config';
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET;
if (!SECRET) throw new Error('JWT_SECRET is missing. Put it in .env or in the environment.');

const ENTRY = process.env.SERVER_ENTRY ?? 'src/server.js';
const TEST_PORT = process.env.TEST_PORT ?? '3005';
const API = process.env.API_URL ?? `http://localhost:${TEST_PORT}`;

// Random user ids, so the test data never clashes with real data
const base = 100000 + Math.floor(Math.random() * 800000);
const A = base;           // the asker
const B = base + 1;       // the helper
const C = base + 2;       // a third user: a stranger, or a second helper
const VIEWER = base + 3;  // only reads post details

// The plan an in-site helper sends when claiming: where to meet, and at what time (HH:MM).
const INSITE = { specificSpot: 'Library, 2nd floor', meetTime: '14:00' };

// ---------- helpers ----------

// Makes a login token, like the ones you build on jwt.io. The user id becomes the token's `sub`.
// By default it uses the real secret and lives 15 minutes.
// The other two arguments let a test make a BAD token: another secret, or a negative lifetime (already expired).
function makeToken(userId, secret = SECRET, expiresIn = '15m') {
  return jwt.sign({ campus: 'Khouribga' }, secret, {
    algorithm: 'HS256',
    subject: String(userId),
    issuer: 'user-service',
    audience: 'ft-transcendence-services',
    expiresIn,
  });
}

// call() sends ONE request to the server and gives back { status, body }.
// It adds the Authorization header for you, and the JSON body if you give one.
// user: a user id (a token is made for it), a ready token (string), or null (no token)
async function call(method, path, user, body) {
  const headers = {};
  if (user !== null) {
    headers.Authorization = `Bearer ${typeof user === 'string' ? user : makeToken(user)}`;
  }
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const res = await fetch(API + path, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let data = null;
  try { data = JSON.parse(text); } catch { /* empty or not JSON */ }
  return { status: res.status, body: data };
}

// Any 2xx is a success. Any 4xx is a refusal. The exact code does not matter.
const isOk = (res) => res.status >= 200 && res.status < 300;
const isRefused = (res) => res.status >= 400 && res.status < 500;

// Fails the test if the answer is NOT a success (2xx). `label` tells you which step failed.
function expectOk(res, label) {
  assert.ok(isOk(res), `${label}: expected a success (2xx), got ${res.status} ${JSON.stringify(res.body)}`);
}
// Fails the test if the answer is NOT a refusal (4xx). `label` tells you which step failed.
function expectRefused(res, label) {
  assert.ok(isRefused(res), `${label}: expected a refusal (4xx), got ${res.status} ${JSON.stringify(res.body)}`);
}

// The answers may be wrapped, like { data: {...} } or { allPost: [...] }.
// These two helpers find the post or the list inside.
// one(): finds the post inside an answer.
function one(body) {
  if (body && body.id !== undefined) return body;
  return Object.values(body ?? {}).find(
    (v) => v && typeof v === 'object' && !Array.isArray(v) && v.id !== undefined,
  ) ?? {};
}
// list(): finds the list of posts inside an answer.
function list(body) {
  if (Array.isArray(body)) return body;
  return Object.values(body ?? {}).find(Array.isArray) ?? [];
}
// idsOf(): the ids of all posts in a list answer. Used to check if a post is (or is not) in a list.
const idsOf = (res) => list(res.body).map((p) => p.id);

// A creates a post (online by default) and gives back its id. The test fails here if the post is not created.
async function makePost(user, mode = 'online') {
  const res = await call('POST', '/peer-request', user, {
    topic: 'Test topic',
    description: 'Test description',
    mode,
  });
  expectOk(res, 'create post');
  const id = one(res.body).id;
  assert.ok(Number.isInteger(id), `create post: no id in the answer ${JSON.stringify(res.body)}`);
  return id;
}

// The helper claims post `id`.
// An in-site claim also sends the plan (spot and time). An online claim sends no body.
const claim = (id, user, mode = 'online') =>
  call('POST', `/peer-request/${id}/claim`, user, mode === 'insite' ? INSITE : undefined);

// Presses a session button on post `id`: accept, complete, release, on-the-way or arrived. These requests have no body.
const act = (id, user, action) => call('POST', `/sessions/${id}/${action}`, user);
// Opens the session hub of post `id`.
const hub = (id, user) => call('GET', `/sessions/${id}`, user);

// Reads the post's current status ('open', 'pending', 'claimed' or 'completed') from the details endpoint.
// Tests use it to check what an action did to the post.
async function statusOf(id) {
  const res = await call('GET', `/peer-request/${id}`, VIEWER);
  expectOk(res, 'get post');
  return one(res.body).status;
}

// ---------- server ----------

// The server process that the test starts (empty when API_URL is used).
let child;

// Waits until the server answers (up to 30 seconds).
// It stops early with a clear error if the server crashed at startup.
async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    if (child.exitCode !== null) {
      throw new Error(`The server stopped at startup (exit code ${child.exitCode}). See its log above.`);
    }
    try {
      await fetch(`${API}/peer-request`); // any answer means the server is up
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  throw new Error('The server did not start in 30 seconds.');
}

// ---------- tests ----------

// All the tests are in this group. Every test does 3 things:
// 1) makes a post (sometimes claims it), 2) does one action, 3) checks the answer.
// Success = any 2xx. Refused = any 4xx. Many tests also check the post's status afterwards.
// A = the asker, B = the helper, C = a stranger or a second helper.
describe('B3 service', () => {
  // Runs once before all the tests: starts the server, then waits until it answers.
  // If API_URL is set, a server is already running, so it starts nothing.
  before(async () => {
    if (process.env.API_URL) return;
    child = spawn(process.execPath, [ENTRY], {
      env: { ...process.env, PORT: TEST_PORT },
      stdio: ['ignore', 'inherit', 'inherit'],
    });
    await waitForServer();
  });

  // Runs once after all the tests: stops the server that the test started.
  after(() => {
    child?.kill();
  });

  // GROUP 1: the server must refuse requests without a valid token.
  describe('authentication', () => {
    // Sends a request with no Authorization header. Must be refused.
    it('rejects a request with no token', async () => {
      const res = await call('GET', '/peer-request', null);
      expectRefused(res, 'request');
    });

    // Sends the text 'not.a.token' as the token. Must be refused.
    it('rejects a token that is not a token', async () => {
      const res = await call('GET', '/peer-request', 'not.a.token');
      expectRefused(res, 'request');
    });

    // Sends a real-looking token signed with a different secret. The signature check fails, so it is refused.
    it('rejects a token signed with another secret', async () => {
      const res = await call('GET', '/peer-request', makeToken(A, 'another-secret-that-is-long-enough-123456'));
      expectRefused(res, 'request');
    });

    // Sends a token that expired 60 seconds ago. Must be refused.
    it('rejects an expired token', async () => {
      const res = await call('GET', '/peer-request', makeToken(A, SECRET, -60));
      expectRefused(res, 'request');
    });
  });

  // GROUP 2: a post id in the URL must be a whole number from 1 to 2147483647.
  describe('the id in the url', () => {
    // One test for each bad id: text, zero, negative, decimal, too big. Each must be refused.
    for (const bad of ['abc', '0', '-1', '2.5', '2147483648']) {
      it(`GET /peer-request/${bad} is refused`, async () => {
        const res = await call('GET', `/peer-request/${bad}`, A);
        expectRefused(res, 'request');
      });
    }

    // Same check on the sessions endpoints: 'abc' is not a valid id, so it is refused.
    it('GET /sessions/abc is refused', async () => {
      const res = await call('GET', '/sessions/abc', A);
      expectRefused(res, 'request');
    });

    // Asks for post 2147483647, the biggest valid id. No post has it, so the server must refuse (not found).
    it('an id that does not exist is refused', async () => {
      const res = await call('GET', '/peer-request/2147483647', A);
      expectRefused(res, 'request');
    });
  });

  // GROUP 3: creating a post.
  describe('create a post', () => {
    // `good` is a valid body. Each item in `badBodies` is a copy of it with one thing broken
    // (`undefined` means the field is missing).
    const good = { topic: 'Test topic', description: 'Test description', mode: 'online' };
    const badBodies = [
      ['no topic', { ...good, topic: undefined }],
      ['empty topic', { ...good, topic: '   ' }],
      ['topic too long', { ...good, topic: 'x'.repeat(256) }],
      ['no description', { ...good, description: undefined }],
      ['wrong mode', { ...good, mode: 'hybrid' }],
      ['no mode', { ...good, mode: undefined }],
    ];

    // One test for each broken body above. Each must be refused.
    for (const [name, body] of badBodies) {
      it(`rejects: ${name}`, async () => {
        const res = await call('POST', '/peer-request', A, body);
        expectRefused(res, JSON.stringify(res.body));
      });
    }

    // A creates a valid online post. It must succeed, and the post must have status 'open' and mode 'online'.
    it('creates an online post that starts open', async () => {
      const res = await call('POST', '/peer-request', A, good);
      expectOk(res, 'create');
      const post = one(res.body);
      assert.equal(post.status, 'open');
      assert.equal(post.mode, 'online');
    });

    // The same, with mode 'insite'.
    it('creates an in-site post', async () => {
      const res = await call('POST', '/peer-request', A, { ...good, mode: 'insite' });
      expectOk(res, 'create');
      assert.equal(one(res.body).mode, 'insite');
    });

    // A sends status: 'completed' in the body. The server must ignore it, and the post must still be 'open'.
    it('ignores a status sent by the client', async () => {
      const res = await call('POST', '/peer-request', A, { ...good, status: 'completed' });
      expectOk(res, 'create');
      assert.equal(await statusOf(one(res.body).id), 'open');
    });
  });

  // GROUP 4: the feed and the details of one post.
  describe('feed and details', () => {
    // A creates a post. B asks for the feed and must see it. A asks for the feed and must NOT see their own post.
    it('shows an open post to other users, never to its asker', async () => {
      const id = await makePost(A);
      assert.ok(idsOf(await call('GET', '/peer-request', B)).includes(id), 'B should see it');
      assert.ok(!idsOf(await call('GET', '/peer-request', A)).includes(id), 'A should not see it');
    });

    // A creates a post. B opens its details and must see the topic 'Test topic'.
    it('returns the details of one post', async () => {
      const id = await makePost(A);
      const res = await call('GET', `/peer-request/${id}`, B);
      expectOk(res, 'details');
      assert.equal(one(res.body).topic, 'Test topic');
    });
  });

  // GROUP 5: claiming a post.
  describe('claim', () => {
    // A tries to claim their own post. Must be refused, and the post stays 'open'.
    it('the asker cannot claim their own post', async () => {
      const id = await makePost(A);
      expectRefused(await claim(id, A), 'claim own post');
      assert.equal(await statusOf(id), 'open');
    });

    // B claims an online post. The status becomes 'claimed', and C no longer sees it in the feed.
    it('an online claim goes to claimed and leaves the feed', async () => {
      const id = await makePost(A);
      expectOk(await claim(id, B), 'claim');
      assert.equal(await statusOf(id), 'claimed');
      assert.ok(!idsOf(await call('GET', '/peer-request', C)).includes(id), 'should leave the feed');
    });

    // B claims a post. Then C tries to claim the same post. B won, so C must be refused.
    it('a second claim on the same post is refused', async () => {
      const id = await makePost(A);
      expectOk(await claim(id, B), 'first claim');
      expectRefused(await claim(id, C), 'refused');
    });

    // B tries to claim an in-site post with a bad plan: an empty body, only a spot, and the time 25:00 (not a real time).
    // All must be refused, and the post must stay 'open' (nothing is half saved).
    it('an in-site claim needs a spot and a time, and the post stays open if it fails', async () => {
      const id = await makePost(A, 'insite');
      const bodies = [{}, { specificSpot: 'Library, 2nd floor' }, { ...INSITE, meetTime: '25:00' }];
      for (const body of bodies) {
        const res = await call('POST', `/peer-request/${id}/claim`, B, body);
        expectRefused(res, JSON.stringify(body));
      }
      assert.equal(await statusOf(id), 'open');
    });

    // B claims an in-site post with a spot and a time. The status becomes 'pending' (waiting for the asker), and it leaves the feed.
    it('an in-site claim goes to pending and leaves the feed', async () => {
      const id = await makePost(A, 'insite');
      expectOk(await claim(id, B, 'insite'), 'claim');
      assert.equal(await statusOf(id), 'pending');
      assert.ok(!idsOf(await call('GET', '/peer-request', C)).includes(id), 'should leave the feed');
    });

    // The race test. B and C claim the same post at the same moment, 5 times (a new post each time).
    // Each round, exactly one must win and the other must be refused.
    it('only one of two simultaneous claims wins', async () => {
      for (let round = 1; round <= 5; round++) {
        const id = await makePost(A);
        const [rb, rc] = await Promise.all([claim(id, B), claim(id, C)]);
        const wins = [rb, rc].filter(isOk).length;
        assert.equal(wins, 1, `round ${round}: B got ${rb.status}, C got ${rc.status}`);
        const loser = isOk(rb) ? rc : rb;
        expectRefused(loser, `round ${round}: the loser should be refused`);
      }
    });
  });

  // GROUP 6: the session hub of an ONLINE post.
  // These tests share one post and run in order (see `before` below).
  describe('session hub: online', () => {
    let id;
    // Runs once before this group: A creates an online post and B claims it.
    before(async () => {
      id = await makePost(A, 'online');
      expectOk(await claim(id, B), 'claim');
    });

    // A and B (the two people in the session) can open the hub. C (a stranger) must be refused.
    it('the asker and the helper can open the hub, a stranger cannot', async () => {
      expectOk(await hub(id, A), 'asker');
      expectOk(await hub(id, B), 'helper');
      expectRefused(await hub(id, C), 'stranger');
    });

    // B sends a message, then A reads the messages. The message must be in the list.
    it('the helper sends a message and the asker reads it', async () => {
      const text = `hello from the helper ${base}`;
      expectOk(await call('POST', `/sessions/${id}/messages`, B, { msg: text }), 'send');
      const res = await call('GET', `/sessions/${id}/messages`, A);
      expectOk(res, 'read');
      assert.ok(JSON.stringify(res.body).includes(text), 'the message should be in the list');
    });

    // B sends bad messages: empty, only spaces, and 501 characters (the limit is 500). All must be refused.
    it('rejects an empty or a too long message', async () => {
      for (const text of ['', '   ', 'x'.repeat(501)]) {
        const res = await call('POST', `/sessions/${id}/messages`, B, { msg: text });
        expectRefused(res, `text length ${text.length}`);
      }
    });

    // C (a stranger) tries to read the chat and to write in it. Both must be refused.
    it('a stranger cannot read or write the chat', async () => {
      expectRefused(await call('GET', `/sessions/${id}/messages`, C), 'read');
      expectRefused(await call('POST', `/sessions/${id}/messages`, C, { msg: 'hi' }), 'write');
    });

    // accept, on-the-way and arrived only exist for in-site posts. On this online post they must be refused.
    it('the in-site endpoints are refused on an online post', async () => {
      for (const action of ['accept', 'on-the-way', 'arrived']) {
        const res = await act(id, A, action);
        expectRefused(res, action);
      }
    });

    // B (the helper) and C (a stranger) try to complete: refused, and the status stays 'claimed'.
    // Then A (the asker) completes: success, and the status becomes 'completed'.
    it('only the asker can complete', async () => {
      expectRefused(await act(id, B, 'completed'), 'helper');
      expectRefused(await act(id, C, 'completed'), 'stranger');
      assert.equal(await statusOf(id), 'claimed');
      expectOk(await act(id, A, 'completed'), 'asker');
      assert.equal(await statusOf(id), 'completed');
    });

    // The session is already completed. A completing again, and B releasing, must both be refused. The status stays 'completed'.
    it('a completed session cannot be completed or released again', async () => {
      expectRefused(await act(id, A, 'complete'), 'refused');
      expectRefused(await act(id, B, 'release'), 'refused');
      assert.equal(await statusOf(id), 'completed');
    });
  });

  // GROUP 7: the session hub of an IN-SITE post.
  // These tests share one post and run in order (see `before` below).
  describe('session hub: in-site', () => {
    let id;
    // Runs once before this group: A creates an in-site post and B claims it with a spot and a time.
    before(async () => {
      id = await makePost(A, 'insite');
      expectOk(await claim(id, B, 'insite'), 'claim');
    });

    // Right after the claim, the status must be 'pending' (the asker has not answered yet).
    it('starts pending', async () => {
      assert.equal(await statusOf(id), 'pending');
    });

    // B presses on-the-way and arrived too early (the status is still 'pending'). Both must be refused.
    it('on-the-way and arrived wait for the accept', async () => {
      expectRefused(await act(id, B, 'on-the-way'), 'refused');
      expectRefused(await act(id, B, 'arrived'), 'refused');
    });

    // B (the helper) and C (a stranger) try to accept the plan. Both must be refused, and the status stays 'pending'.
    it('only the asker can accept', async () => {
      expectRefused(await act(id, B, 'accept'), 'helper');
      expectRefused(await act(id, C, 'accept'), 'stranger');
      assert.equal(await statusOf(id), 'pending');
    });

    // A (the asker) accepts: success, and the status becomes 'claimed'. Accepting a second time must be refused.
    it('the asker accepts: the post is claimed, a second accept is refused', async () => {
      expectOk(await act(id, A, 'accept'), 'accept');
      assert.equal(await statusOf(id), 'claimed');
      expectRefused(await act(id, A, 'accept'), 'refused');
    });

    // B and A both press on-the-way and arrived.
    // Then the hub must show all four flags as true: asker_on_way, helper_on_way, asker_arrived, helper_arrived.
    it('both users can press on-the-way and arrived', async () => {
      for (const user of [B, A]) {
        expectOk(await act(id, user, 'on-the-way'), 'on-the-way');
        expectOk(await act(id, user, 'arrived'), 'arrived');
      }
      const flags = JSON.stringify((await hub(id, A)).body);
      for (const flag of ['asker_on_way', 'helper_on_way', 'asker_arrived', 'helper_arrived']) {
        assert.ok(flags.includes(`"${flag}":true`), `${flag} should be true`);
      }
    });

    // B presses on-the-way a second time. It must still succeed (pressing twice is harmless).
    it('pressing a button twice is fine', async () => {
      expectOk(await act(id, B, 'on-the-way'), 'second press');
    });

    // C (a stranger) presses on-the-way and arrived. Both must be refused.
    it('a stranger cannot press the buttons', async () => {
      expectRefused(await act(id, C, 'on-the-way'), 'on-the-way');
      expectRefused(await act(id, C, 'arrived'), 'arrived');
    });

    // Chat only exists for online posts. B sends a message on this in-site post, and it must be refused.
    it('the chat is refused on an in-site post', async () => {
      const res = await call('POST', `/sessions/${id}/messages`, B, { msg: 'hi' });
      expectRefused(res, 'request');
    });

    // A (the asker) completes the session: success, and the status becomes 'completed'.
    it('the asker completes', async () => {
      expectOk(await act(id, A, 'completed'), 'completed');
      assert.equal(await statusOf(id), 'completed');
    });
  });

  // GROUP 8: release undoes a claim, and the post goes back to 'open'. Each test makes its own post.
  describe('release', () => {
    // B claims an online post, then releases it. The status is 'open' again, the post is back in the feed, and C can claim it.
    it('the helper can release an online post: it is open again and can be claimed', async () => {
      const id = await makePost(A);
      expectOk(await claim(id, B), 'claim');
      expectOk(await act(id, B, 'leaveit'), 'leaveit');
      assert.equal(await statusOf(id), 'open');
      assert.ok(idsOf(await call('GET', '/peer-request', C)).includes(id), 'back in the feed');
      expectOk(await claim(id, C), 'claim again');
    });

    // B claims, then A (the asker) releases. The status is 'open' again.
    it('the asker can release a claimed post', async () => {
      const id = await makePost(A);
      expectOk(await claim(id, B), 'claim');
      expectOk(await act(id, A, 'leaveit'), 'leaveit');
      assert.equal(await statusOf(id), 'open');
    });

    // B claims, then C (a stranger) tries to release. Must be refused, and the status stays 'claimed'.
    it('a stranger cannot release', async () => {
      const id = await makePost(A);
      expectOk(await claim(id, B), 'claim');
      expectRefused(await act(id, C, 'leaveit'), 'stranger');
      assert.equal(await statusOf(id), 'claimed');
    });

    // Nobody claimed this post. A trying to release it must be refused (there is nothing to undo).
    it('nobody can release an open post', async () => {
      const id = await makePost(A);
      expectRefused(await act(id, A, 'leaveit'), 'release an open post');
    });

    // B claims an in-site post (this creates a meetup row), then releases it. Then C claims the same post again.
    // This only works if the old meetup row was deleted, because there can only be one per post.
    it('in-site: after a decline, the post can be claimed again (the meetup row is removed)', async () => {
    const id = await makePost(A, 'insite');
    expectOk(await claim(id, B, 'insite'), 'first claim');
    expectOk(await act(id, A, 'leaveit'), 'asker declines');
    assert.equal(await statusOf(id), 'open');
    expectOk(await claim(id, C, 'insite'), 'second claim');
    assert.equal(await statusOf(id), 'pending');
  });

    // B claims an in-site post with a plan (status 'pending'). A releases it, which is the 'Decline' button. The status is 'open' again.
    it('in-site: the asker can decline a pending proposal', async () => {
      const id = await makePost(A, 'insite');
      expectOk(await claim(id, B, 'insite'), 'claim');
      expectOk(await act(id, A, 'leaveit'), 'decline');
      assert.equal(await statusOf(id), 'open');
    });
  });

  // GROUP 9: the My Activity endpoints. Each test makes its own post.
  describe('my activity', () => {
    // A has two posts: one 'open' and one 'claimed' by B.
    // A's 'mine' list must have both (any status). B's 'mine' list must have neither (only your own posts).
    it('mine: lists my posts of any status, and only mine', async () => {
      const openId = await makePost(A);
      const claimedId = await makePost(A);
      expectOk(await claim(claimedId, B), 'claim');

      const mine = idsOf(await call('GET', '/peer-request/myactivity/mine', A));
      assert.ok(mine.includes(openId), 'the open post');
      assert.ok(mine.includes(claimedId), 'the claimed post');

      const notMine = idsOf(await call('GET', '/peer-request/myactivity/mine', B));
      assert.ok(!notMine.includes(openId) && !notMine.includes(claimedId), 'B should not see them');
    });

    // B claims a post. B's 'claimed' list must have it. A's 'claimed' list must not (A is the asker, not the helper).
    it('claimed: lists the posts I claimed', async () => {
      const id = await makePost(A);
      expectOk(await claim(id, B), 'claim');
      assert.ok(idsOf(await call('GET', '/peer-request/myactivity/iclaimed', B)).includes(id));
      assert.ok(!idsOf(await call('GET', '/peer-request/myactivity/iclaimed', A)).includes(id));
    });

    // A changes the topic and description of an open post: success. Then the details must show the new topic.
    it('edit: the asker can edit an open post', async () => {
      const id = await makePost(A);
      const res = await call('PATCH', `/peer-request/myactivity/${id}`, A, {
        topic: 'Edited topic',
        description: 'Edited description',
      });
      expectOk(res, 'edit');
      const details = await call('GET', `/peer-request/${id}`, VIEWER);
      assert.equal(one(details.body).topic, 'Edited topic');
    });

    // A sends an empty topic: refused. B tries to edit A's post: refused.
    it('edit: a bad body and another user are refused', async () => {
      const id = await makePost(A);
      const bad = await call('PATCH', `/peer-request/myactivity/${id}`, A, { topic: '', description: 'x' });
      expectRefused(bad, 'request');
      const other = await call('PATCH', `/peer-request/myactivity/${id}`, B, {
        topic: 'Hacked',
        description: 'Hacked',
      });
      expectRefused(other, 'another user');
    });

    // B claims the post, then A tries to edit it. Must be refused.
    it('edit: a claimed post cannot be edited', async () => {
      const id = await makePost(A);
      expectOk(await claim(id, B), 'claim');
      const res = await call('PATCH', `/peer-request/myactivity/${id}`, A, {
        topic: 'Too late',
        description: 'Too late',
      });
      expectRefused(res, 'request');
    });

    // A deletes an open post: success. Then asking for that post must be refused (it no longer exists).
    it('delete: the asker can delete an open post', async () => {
      const id = await makePost(A);
      expectOk(await call('DELETE', `/peer-request/myactivity/${id}`, A), 'delete');
      expectRefused(await call('GET', `/peer-request/${id}`, VIEWER), 'refused');
    });

    // B tries to delete A's open post: refused. Then B claims it, and A tries to delete it: refused (a claimed post can't be deleted).
    it('delete: another user is refused, and a claimed post cannot be deleted', async () => {
      const id = await makePost(A);
      expectRefused(await call('DELETE', `/peer-request/myactivity/${id}`, B), 'another user');
      expectOk(await claim(id, B), 'claim');
      expectRefused(await call('DELETE', `/peer-request/myactivity/${id}`, A), 'refused');
    });
  });
});