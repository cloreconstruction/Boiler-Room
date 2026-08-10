// client-portal.mjs — serves each client's curated tracker data and logs what they tap.
// GET  ?c=<code>            -> the client's JSON (read from Eric's Dropbox; code IS the key)
// GET  ?c=<code>&p=<name>   -> a released journal photo from that client's own photos folder
// POST {c, ev}              -> appends one click event to that client's clicks file
// POST {c, ask:{tag,text}}  -> appends one question/remark to that client's asks file
// Data lives in /Clore DayLog/App Data/Client Portal/ — written by Eric's app and Claude,
// served here so the public page never touches Dropbox directly and codes stay unguessable.

const BASE = '/Clore DayLog/App Data/Client Portal';

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
async function dlRaw(t, path) {
  return fetch('https://content.dropboxapi.com/2/files/download', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + t, 'Dropbox-API-Arg': JSON.stringify({ path }) }
  });
}
async function dl(t, path) {
  const r = await dlRaw(t, path);
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
const IMG_CT = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif', heic: 'image/heic', heif: 'image/heif' };

const portal = async req => {
  const url = new URL(req.url);
  if (req.method === 'GET') {
    const c = clean(url.searchParams.get('c'));
    if (!c) return new Response(JSON.stringify({ error: 'missing code' }), { status: 400 });
    const t = await dbxToken();
    // 📷 a released journal photo — only from THIS code's own folder, code checked first
    const p = String(url.searchParams.get('p') || '').replace(/[^a-zA-Z0-9._ -]/g, '').slice(0, 80);
    if (p) {
      if (await dl(t, `${BASE}/${c}.json`) == null) return new Response('nope', { status: 404 });
      const r = await dlRaw(t, `${BASE}/photos-${c}/${p}`);
      if (!r.ok) return new Response('no photo', { status: 404 });
      const buf = await r.arrayBuffer();
      const ct = IMG_CT[(p.split('.').pop() || '').toLowerCase()] || 'application/octet-stream';
      return new Response(buf, { headers: { 'content-type': ct, 'cache-control': 'private, max-age=86400' } });
    }
    // 📋 the materials board (rooms, items, lamps) — served whole; picks/remarks come back by POST
    if (url.searchParams.get('mat')) {
      if (await dl(t, `${BASE}/${c}.json`) == null) return new Response('nope', { status: 404 });
      const mat = await dl(t, `${BASE}/materials-${c}.json`);
      return new Response(mat || '{"rooms":[]}', { headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
    }
    // 💬 their own asks, with the three-lamp state (sent / on it / answered)
    if (url.searchParams.get('a')) {
      if (await dl(t, `${BASE}/${c}.json`) == null) return new Response('nope', { status: 404 });
      const asks = await dl(t, `${BASE}/asks-${c}.json`);
      return new Response(asks || '[]', { headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
    }
    const txt = await dl(t, `${BASE}/${c}.json`);
    if (txt == null) return new Response(JSON.stringify({ error: 'not found' }), { status: 404 });
    return new Response(txt, { headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
  }
  if (req.method === 'POST') {
    let b = {};
    try { b = await req.json(); } catch (e) {}
    const c = clean(b.c);
    if (!c) return new Response('bad', { status: 400 });
    const t = await dbxToken();
    if (await dl(t, `${BASE}/${c}.json`) == null) return new Response('nope', { status: 404 });
    // 📋 a materials-board action: a pick locks the item; a remark rides the item's thread.
    // Both ALSO append to the asks file so Eric's review pile hears about it on his next sync.
    if (b.mat && typeof b.mat === 'object') {
      const id = String(b.mat.id || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 24);
      const pick = String(b.mat.pick || '').slice(0, 300).trim();
      const remark = String(b.mat.remark || '').slice(0, 600).trim();
      // 📎 v5.35 — a picture of their pick (client-side shrunk JPEG, base64)
      const photo = b.mat.photo && typeof b.mat.photo === 'object' && typeof b.mat.photo.b64 === 'string' ? b.mat.photo : null;
      const declineOpt = Number.isInteger(b.mat.declineOpt) ? b.mat.declineOpt : null;
      if (!id || (!pick && !remark && !photo && declineOpt == null)) return new Response('bad', { status: 400 });
      if (photo && photo.b64.length > 6_000_000) return new Response('too big', { status: 413 });
      const mpath = `${BASE}/materials-${c}.json`;
      let mat = null;
      try { mat = JSON.parse(await dl(t, mpath) || 'null'); } catch (e) {}
      if (!mat || !Array.isArray(mat.rooms)) return new Response('nope', { status: 404 });
      let item = null;
      for (const r of mat.rooms) { const f = (r.items || []).find(x => x && x.id === id); if (f) { item = f; break; } }
      if (!item) return new Response('nope', { status: 404 });
      const now = new Date().toISOString();
      let phPath = '';
      if (photo) {
        let buf;
        try { buf = Buffer.from(photo.b64, 'base64'); } catch (e) { return new Response('bad', { status: 400 }); }
        if (!buf.length || buf.length > 4_500_000) return new Response('too big', { status: 413 });
        const safe = String(photo.n || 'pick').replace(/[^a-zA-Z0-9._-]/g, '').replace(/\.(png|jpe?g|webp|heic|heif|gif)$/i, '').slice(0, 40) || 'pick';
        const fname = `${Date.now()}-${safe}.jpg`;
        await up(t, `${BASE}/mat-uploads-${c}/${fname}`, buf);
        phPath = `mat-uploads-${c}/${fname}`;
        item.remarks = [...(item.remarks || []), { from: 'client', text: '📎 sent a picture', ts: now }].slice(-20);
      }
      // 🙅 v5.75 — "No, thank you" on an option: grayed on her page, undoable, told to Eric
      if (declineOpt != null && (item.opts || [])[declineOpt]) {
        item.opts[declineOpt].no = !item.opts[declineOpt].no;
        if (!item.opts[declineOpt].no) delete item.opts[declineOpt].no;
        item.remarks = [...(item.remarks || []), { from: 'client', text: `${item.opts[declineOpt].no ? '🙅 No thank you to' : '↩ un-declined'}: ${item.opts[declineOpt].t}`, ts: now }].slice(-20);
      }
      if (pick) { item.s = 'picked'; item.pick = pick; item.pickedTs = now.slice(0, 10); }
      if (remark) item.remarks = [...(item.remarks || []), { from: 'client', text: remark, ts: now }].slice(-20);
      mat.updated = now.slice(0, 10);
      await up(t, mpath, JSON.stringify(mat));
      // echo into the asks channel → Eric's review pile (a photo rides along by path)
      const apath = `${BASE}/asks-${c}.json`;
      let arr = [];
      try { arr = JSON.parse(await dl(t, apath) || '[]'); } catch (e) {}
      if (!Array.isArray(arr)) arr = [];
      arr.unshift({ tag: 'Materials',
        text: pick ? `📋 PICKED — ${item.n}: ${pick}` : remark ? `📋 ${item.n}: ${remark}` : declineOpt != null ? `📋 ${item.n}: ${(item.opts[declineOpt] || {}).no ? '🙅 no-thank-you to' : 'un-declined'} "${(item.opts[declineOpt] || {}).t}"` : `📎 ${item.n}: sent a picture of their pick`,
        ts: now, ...(phPath ? { photo: phPath } : {}) });
      await up(t, apath, JSON.stringify(arr.slice(0, 200)));
      return new Response('ok');
    }
    // 💬 a question or remark from the client — lands in Eric's review pile on his next sync
    if (b.ask && typeof b.ask === 'object') {
      const tag = ['Phil', 'Eric', 'General', 'Feedback', 'Materials'].includes(b.ask.tag) ? b.ask.tag : 'General';
      const text = String(b.ask.text || '').slice(0, 1000).trim();
      if (!text) return new Response('bad', { status: 400 });
      const path = `${BASE}/asks-${c}.json`;
      let arr = [];
      try { arr = JSON.parse(await dl(t, path) || '[]'); } catch (e) {}
      if (!Array.isArray(arr)) arr = [];
      arr.unshift({ tag, text, ts: new Date().toISOString() });
      await up(t, path, JSON.stringify(arr.slice(0, 200)));
      return new Response('ok');
    }
    const ev = String(b.ev || '').slice(0, 40);
    if (!ev) return new Response('bad', { status: 400 });
    const path = `${BASE}/clicks-${c}.json`;
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
