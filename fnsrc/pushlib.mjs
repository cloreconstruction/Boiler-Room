// pushlib.mjs — shared push plumbing for the Netlify functions.
//
// 🧬 v6.27 — RECONSTRUCTED from the shipped bundles (netlify/functions/*.mjs, the
// `// fnsrc/…` sections at their tail). The originals only ever lived in the old build
// sandbox: this repo shipped the esbuild OUTPUT and kept no source. Nothing here is new
// behaviour — it is the same code the live functions have been running, put back under
// git so the next change can be built instead of hand-patched.
//
// Bundle with: node ../boiler-room-tools/build-functions.mjs

import webPush from 'web-push';

export async function dbxToken() {
  const r = await fetch('https://api.dropbox.com/oauth2/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: process.env.DBX_REFRESH_TOKEN,
      client_id: process.env.DBX_APP_KEY
    })
  });
  if (!r.ok) throw new Error('dropbox token ' + r.status);
  return (await r.json()).access_token;
}

// 🔒 Eric's own subs — the CREW/OWNER store. Homeowner subs never live here (see
// client-subs.json in the Client Portal folder); a NOW alert can never reach a homeowner.
export async function loadSubs() {
  const t = await dbxToken();
  const r = await fetch('https://content.dropboxapi.com/2/files/download', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + t,
      'Dropbox-API-Arg': JSON.stringify({ path: '/Clore DayLog/App Data/push-subs.json' })
    }
  });
  if (!r.ok) return [];
  try { const j = JSON.parse(await r.text()); return Array.isArray(j) ? j : []; }
  catch (e) { return []; }
}

export function setVapid() {
  webPush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:cloreconstruction@yahoo.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export async function sendToAll(title, body, tag) {
  setVapid();
  const subs = await loadSubs();
  const payload = JSON.stringify({ title, body, tag: tag || 'boiler-room' });
  let sent = 0, dead = 0;
  for (const s of subs) {
    try { await webPush.sendNotification(s.sub || s, payload); sent++; }
    catch (e) { dead++; }
  }
  return { sent, dead, total: subs.length };
}
