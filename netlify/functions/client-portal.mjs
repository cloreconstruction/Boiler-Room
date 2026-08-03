// client-portal.mjs — serves each client's curated tracker data and logs what they tap.
// GET  ?c=<code>          -> the client's JSON (read from Eric's Dropbox; code IS the key)
// POST {c, ev}            -> appends one click event to that client's clicks file
// Data lives in /Clore DayLog/App Data/Client Portal/ — written by Eric's app and Claude,
// served here so the public page never touches Dropbox directly and codes stay unguessable.

async function dbxToken() {
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
async function dl(t, path) {
  const r = await fetch('https://content.dropboxapi.com/2/files/download', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + t, 'Dropbox-API-Arg': JSON.stringify({ path }) }
  });
  return r.ok ? await r.text() : null;
}
async function up(t, path, body) {
  await fetch('https://content.dropboxapi.com/2/files/upload', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + t,
      'Dropbox-API-Arg': JSON.stringify({ path, mode: 'overwrite', mute: true }),
      'Content-Type': 'application/octet-stream'
    },
    body
  });
}
const clean = s => String(s || '').replace(/[^a-z0-9-]/gi, '').slice(0, 40);

const portal = async req => {
  const url = new URL(req.url);
  if (req.method === 'GET') {
    const c = clean(url.searchParams.get('c'));
    if (!c) return new Response(JSON.stringify({ error: 'missing code' }), { status: 400 });
    const t = await dbxToken();
    const txt = await dl(t, `/Clore DayLog/App Data/Client Portal/${c}.json`);
    if (txt == null) return new Response(JSON.stringify({ error: 'not found' }), { status: 404 });
    return new Response(txt, { headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
  }
  if (req.method === 'POST') {
    let b = {};
    try { b = await req.json(); } catch (e) {}
    const c = clean(b.c), ev = String(b.ev || '').slice(0, 40);
    if (!c || !ev) return new Response('bad', { status: 400 });
    const t = await dbxToken();
    if (await dl(t, `/Clore DayLog/App Data/Client Portal/${c}.json`) == null) return new Response('nope', { status: 404 });
    const path = `/Clore DayLog/App Data/Client Portal/clicks-${c}.json`;
    let arr = [];
    try { arr = JSON.parse(await dl(t, path) || '[]'); } catch (e) {}
    if (!Array.isArray(arr)) arr = [];
    arr.unshift({ ev, ts: new Date().toISOString() });
    await up(t, path, JSON.stringify(arr.slice(0, 500)));
    return new Response('ok');
  }
  return new Response('no', { status: 405 });
};
export { portal as default };
