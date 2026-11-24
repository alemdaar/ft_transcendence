import { studyProfiles } from './data.js';
import { readStudyData, saveStudyData, studyUserId } from './store.js';

const respond = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
const fail = (message, status = 400) => respond({ error: message }, status);

export async function mockStudyFetch(path, options = {}) {
  options.signal?.throwIfAborted();
  const method = options.method || 'GET';
  const requests = readStudyData();
  const user = studyUserId();
  const body = options.body ? JSON.parse(options.body) : {};
  if (path === '/peer-request' && method === 'GET') return respond({ allPost: requests.filter(post => post.asker_id !== user && post.status === 'open') });
  if (path === '/peer-request' && method === 'POST') {
    const post = { id: Math.max(0, ...requests.map(post => post.id)) + 1, asker_id: user, helper_id: null, topic: body.topic, description: body.description, mode: body.mode, status: 'open', campus: 'Rabat', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), meetup: null };
    requests.push(post); saveStudyData(requests); return respond({ succes: post }, 201);
  }
  if (path === '/peer-request/myactivity/mine') return respond({ succes: requests.filter(post => post.asker_id === user) });
  if (path === '/peer-request/myactivity/iclaimed') return respond({ succes: requests.filter(post => post.helper_id === user && post.status === 'claimed') });
  const match = path.match(/^\/(?:peer-request\/(?:myactivity\/)?|session\/)(\d+)(\/claim)?$/);
  if (!match) return fail('Unknown demo endpoint.', 404);
  const post = requests.find(post => post.id === Number(match[1]));
  if (!post) return fail('Request not found.', 404);
  if (path.startsWith('/session/')) {
    if (![post.asker_id, post.helper_id].includes(user)) return fail('You are not a participant.', 403);
    if (!['pending', 'claimed'].includes(post.status)) return fail('Session not available.', 404);
    const profile = id => studyProfiles[id] || { id: null, username: 'Unknown user', avatarUrl: null };
    return respond({ succes: post, profiles: { asker: profile(post.asker_id), helper: profile(post.helper_id) } });
  }
  if (match[2] && method === 'POST') {
    if (post.asker_id === user) return fail('You cannot claim your own request.', 403);
    if (post.status !== 'open') return fail('Already claimed.', 409);
    if (post.mode === 'insite') {
      if (!body.specificSpot || body.specificSpot.trim().length < 5 || !/^([01]\d|2[0-3]):[0-5]\d$/.test(body.meetTime || '')) return fail('A meeting spot and time are required.');
      post.meetup = { id: post.id, request_id: post.id, specificSpot: body.specificSpot, meetTime: '1970-01-01T' + body.meetTime + ':00.000Z', asker_on_way: false, asker_arrived: false, helper_on_way: false, helper_arrived: false, created_at: new Date().toISOString() };
    }
    post.helper_id = user; post.status = post.mode === 'insite' ? 'pending' : 'claimed';
  } else {
    if (post.asker_id !== user) return fail('Only the author can change this request.', 403);
    if (method === 'PATCH') { post.topic = body.topic ?? post.topic; post.description = body.description ?? post.description; }
    else if (method === 'DELETE') { saveStudyData(requests.filter(item => item.id !== post.id)); return respond({ succes: post }); }
    else return fail('Unsupported demo action.', 405);
  }
  post.updated_at = new Date().toISOString(); saveStudyData(requests); return respond({ succes: post });
}
