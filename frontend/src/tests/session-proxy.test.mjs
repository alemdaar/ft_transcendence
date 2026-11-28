import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer as createHttpServer } from 'node:http';
import { once } from 'node:events';
import { createServer } from 'vite';
import viteConfig from '../vite.config.js';

test('session API reaches the backend plural route while the session page stays in React', async () => {
  const requests = [];
  const upstream = createHttpServer((request, response) => {
    requests.push({ path: request.url, token: request.headers.authorization });
    response.setHeader('Content-Type', 'application/json');
    if (request.url === '/sessions/67') {
      response.writeHead(500).end(JSON.stringify({ error: 'UNKOWN_ERROR' }));
    } else {
      response.end(JSON.stringify({ succes: { id: 66 }, Profiles: { askerOne: { name: 'Student' } } }));
    }
  });
  let vite;
  upstream.listen(0, '127.0.0.1');
  try {
    await once(upstream, 'listening');
    vite = await createServer({
      ...viteConfig,
      configFile: false,
      server: {
        host: '127.0.0.1', port: 0, open: false,
        proxy: {
          '/session/': {
            ...viteConfig.server.proxy['/session/'],
            target: 'http://127.0.0.1:' + upstream.address().port,
          },
        },
      },
    });
    await vite.listen();
    const base = 'http://127.0.0.1:' + vite.httpServer.address().port;
    const response = await fetch(base + '/session/66', {
      headers: { Authorization: 'Bearer local-test-placeholder' },
    });
    assert.equal(response.status, 200);
    assert.equal((await response.json()).succes.id, 66);
    assert.deepEqual(requests[0], { path: '/sessions/66', token: 'Bearer local-test-placeholder' });
    const failed = await fetch(base + '/session/67');
    assert.equal(failed.status, 500);
    assert.deepEqual(await failed.json(), { error: 'UNKOWN_ERROR' });
    const page = await fetch(base + '/sessions/66', { headers: { Accept: 'text/html' } });
    assert.equal(page.status, 200);
    assert.match(page.headers.get('Content-Type'), /text\/html/);
    assert.match(await page.text(), /id="root"/);
    assert.equal(requests.length, 2);
  } finally {
    if (vite) await vite.close();
    upstream.closeAllConnections();
    await new Promise(resolve => upstream.close(resolve));
  }
});
