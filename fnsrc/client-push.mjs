// client-push.mjs — 🔔 v6.68 HOMEOWNER PINGS, the door Eric's app knocks on.
// POST { c, kind } with x-push-secret (the same secret his own pings use). The logic lives in
// client-push-core.mjs; this file only wires Dropbox and web-push to it.
// Bundle with: node ../boiler-room-tools/build-functions.mjs client-push
import webPush from 'web-push';
import { dbxToken, setVapid } from './pushlib.mjs';
import { ping, drain } from './client-push-core.mjs';

const hsafe = o => JSON.stringify(o).split('').map(ch => ch.charCodeAt(0) > 126 ? '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0') : ch).join('');

export async function mkDeps() {
  const t = await dbxToken();
  setVapid();
  return {
    now: () => new Date(),
    dl: async path => {
      const r = await fetch('https://content.dropboxapi.com/2/files/download', { method: 'POST',
        headers: { Authorization: 'Bearer ' + t, 'Dropbox-API-Arg': hsafe({ path }) } });
      return r.ok ? await r.text() : null;
    },
    up: async (path, body) => {
      await fetch('https://content.dropboxapi.com/2/files/upload', { method: 'POST',
        headers: { Authorization: 'Bearer ' + t, 'Dropbox-API-Arg': hsafe({ path, mode: 'overwrite', mute: true }), 'Content-Type': 'application/octet-stream' },
        body });
    },
    send: async (sub, payload) => {
      try { await webPush.sendNotification(sub, payload); return true; }
      catch (e) { return (e && (e.statusCode === 404 || e.statusCode === 410)) ? 'dead' : false; }
    },
  };
}

export default async req => {
  if (req.method !== 'POST') return new Response('POST only', { status: 405 });
  if (req.headers.get('x-push-secret') !== process.env.PUSH_SECRET) return new Response('nope', { status: 401 });
  if (!process.env.DBX_REFRESH_TOKEN || !process.env.DBX_APP_KEY || !process.env.VAPID_PRIVATE_KEY) return Response.json({ ok: false, why: 'env' });
  let b = {};
  try { b = await req.json(); } catch (e) {}
  const deps = await mkDeps();
  const r = b && b.drain ? await drain(deps) : await ping(deps, b);
  return Response.json(r);
};
