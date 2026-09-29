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

// 🔔 v7.39 — any small JSON file of his (the push settings); null when it is not there or will not parse
export async function loadJson(path) {
  const t = await dbxToken();
  const r = await fetch('https://content.dropboxapi.com/2/files/download', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + t, 'Dropbox-API-Arg': JSON.stringify({ path }) }
  });
  if (!r.ok) return null;
  try { return JSON.parse(await r.text()); } catch (e) { return null; }
}

// 👷 v7.47 — THE ROAD TO THE CREW'S PHONES. Small Dropbox helpers that take the token (one token a run, not one a file) and
// escape every path for the header (Dropbox-API-Arg carries Latin-1 only — the v6.47 lesson; a crew folder is a person's name).
export const hsafe = o => JSON.stringify(o).replace(/[\u007f-￿]/g, c => '\\u' + ('000' + c.charCodeAt(0).toString(16)).slice(-4));
export async function dbxRead(t, path) {
  const r = await fetch('https://content.dropboxapi.com/2/files/download', { method: 'POST', headers: { Authorization: 'Bearer ' + t, 'Dropbox-API-Arg': hsafe({ path }) } });
  return r.ok ? r.text() : null;
}
export async function dbxReadJson(t, path) { try { return JSON.parse(await dbxRead(t, path) || 'null'); } catch (e) { return null; } }
export async function dbxWrite(t, path, body) {
  const r = await fetch('https://content.dropboxapi.com/2/files/upload', { method: 'POST',
    headers: { Authorization: 'Bearer ' + t, 'Dropbox-API-Arg': hsafe({ path, mode: 'overwrite', mute: true }), 'Content-Type': 'application/octet-stream' }, body });
  return r.ok;
}
// the folders inside a folder, by name — every page of the listing (a listing comes in pages: the v6.90 lesson)
export async function dbxFolders(t, path) {
  const out = [];
  let r = await fetch('https://api.dropboxapi.com/2/files/list_folder', { method: 'POST', headers: { Authorization: 'Bearer ' + t, 'content-type': 'application/json' }, body: JSON.stringify({ path, limit: 2000 }) });
  for (let i = 0; i < 20 && r.ok; i++) {
    const j = await r.json();
    (j.entries || []).forEach(e => { if (e && e['.tag'] === 'folder' && e.name) out.push(e.name); });
    if (!j.has_more || !j.cursor) break;
    r = await fetch('https://api.dropboxapi.com/2/files/list_folder/continue', { method: 'POST', headers: { Authorization: 'Bearer ' + t, 'content-type': 'application/json' }, body: JSON.stringify({ cursor: j.cursor }) });
  }
  return out;
}
// one push to a list of subscriptions; a dead one is counted, never retried
export async function sendSubs(subs, payload) {
  setVapid();
  const body = JSON.stringify(payload);
  let sent = 0, dead = 0;
  for (const s of (Array.isArray(subs) ? subs : [])) {
    try { await webPush.sendNotification((s && s.sub) || s, body); sent++; }
    catch (e) { dead++; }
  }
  return { sent, dead };
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
