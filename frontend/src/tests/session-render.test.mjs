import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

test('participant and meetup components render API data and fallback users', async () => {
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
  try {
    const { default: Participants } = await server.ssrLoadModule('/components/sessions/SessionParticipants.jsx');
    let html = renderToStaticMarkup(createElement(Participants, { profiles: {
      asker: { name: 'Asker', avatar: '/photo.png' }, helper: { name: 'Unknown user', avatar: null },
    } }));
    assert.match(html, /photo.png/);
    assert.match(html, /Unknown user/);
    assert.match(html, /Asker/);
    html = renderToStaticMarkup(createElement(Participants, { profiles: null }));
    assert.equal((html.match(/Unknown user/g) || []).length, 4);
    assert.doesNotMatch(html, /<img/);
    const { default: Meetup } = await server.ssrLoadModule('/components/sessions/SessionMeetup.jsx');
    html = renderToStaticMarkup(createElement(Meetup, { meetup: {
      specificSpot: 'In library', meetTime: '1970-01-01T12:00:00.000Z', asker_arrived: true, helper_on_way: true,
    } }));
    assert.match(html, /12:00/);
    assert.match(html, /Arrived/);
    assert.match(html, /On the way/);
  } finally { await server.close(); }
});
