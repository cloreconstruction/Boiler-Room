// client-portal.mjs — serves each client's curated tracker data and logs what they tap.
// GET  ?c=<code>            -> the client's JSON (read from Eric's Dropbox; code IS the key)
// GET  ?c=<code>&p=<name>   -> a released journal photo from that client's own photos folder
// GET  ?c=<code>&boards=1   -> the shared Option Boards library (only boards switched ON)
// GET  ?c=<code>&bimg=<f>   -> one poster picture from that library, rendered to JPEG
// POST {c, board:{id,picks[],note,call}} -> their choices off a poster; one entry per board
// POST {c, ev}              -> appends one click event to that client's clicks file
// POST {c, ask:{tag,text}}  -> appends one question/remark to that client's asks file
// GET  ?c=<code>&manifest=1 -> a web-app manifest for THAT page (🔔 v6.68 — iPhone pings need a Home Screen copy)
// POST {c, push:{sub}}      -> 🔔 v6.68 this phone's push subscription, into the client's OWN push file
// POST {c, push:{off:endpoint}} -> …and out again
// Data lives in /Clore DayLog/App Data/Client Portal/ — written by Eric's app and Claude,
// served here so the public page never touches Dropbox directly and codes stay unguessable.
// 🧬 v6.68 — this source came back under git the same way pushlib did in v6.27: it is the shipped
// bundle, read back in, so the next change could be built instead of hand-patched.

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
    headers: { Authorization: 'Bearer ' + t, 'Dropbox-API-Arg': hsafe({ path }) }
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
      'Dropbox-API-Arg': hsafe({ path, mode: 'overwrite', mute: true }),
      'Content-Type': 'application/octet-stream'
    },
    body
  });
}
// 🔤 v6.50 — Dropbox-API-Arg is an HTTP header and can only carry Latin-1. The mail watcher
// died on exactly this in v6.47 (iOS writes a NARROW NO-BREAK SPACE into its filenames), so
// every header this file builds gets the same escaping the app has always used.
const hsafe = o => JSON.stringify(o).split('').map(ch => ch.charCodeAt(0) > 126 ? '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0') : ch).join('');
const clean = s => String(s || '').replace(/[^a-z0-9-]/gi, '').slice(0, 40);
// 🖼 v6.50 — OPTION BOARDS. Eric's posters ("Sheetrock / Drywall Options" and the rest) live
// ONCE and serve every client: one shared library, not a copy per job. The board file and its
// pictures are only ever handed out to a caller who already proved a real client code.
const BOARDS = '/Clore DayLog/App Data/Option Boards';
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
      // 📷 v5.84 — serve a Dropbox-rendered JPEG, not the raw file: iPhone HEIC shots render
      // in EVERY homeowner's browser this way. Raw bytes only as the fallback.
      const th = await fetch('https://content.dropboxapi.com/2/files/get_thumbnail_v2', {
        method: 'POST',
        headers: { Authorization: `Bearer ${t}`,
          'Dropbox-API-Arg': hsafe({ resource: { '.tag': 'path', path: `${BASE}/photos-${c}/${p}` }, format: { '.tag': 'jpeg' }, size: { '.tag': 'w2048h1536' } }) }
      });
      if (th.ok) {
        const buf = await th.arrayBuffer();
        return new Response(buf, { headers: { 'content-type': 'image/jpeg', 'cache-control': 'private, max-age=86400' } });
      }
      const r = await dlRaw(t, `${BASE}/photos-${c}/${p}`);
      if (!r.ok) return new Response('no photo', { status: 404 });
      const buf = await r.arrayBuffer();
      const ct = IMG_CT[(p.split('.').pop() || '').toLowerCase()] || 'application/octet-stream';
      return new Response(buf, { headers: { 'content-type': ct, 'cache-control': 'private, max-age=86400' } });
    }
    // 🖼 v6.50 — a POSTER from the shared Option Boards library. Same door as a journal photo:
    // the code is checked first, the name is stripped to safe characters, and it is rendered to
    // JPEG so a HEIC or a huge PNG still opens on every homeowner's phone.
    const bi = String(url.searchParams.get('bimg') || '').replace(/[^a-zA-Z0-9._ -]/g, '').slice(0, 80);
    if (bi) {
      if (await dl(t, `${BASE}/${c}.json`) == null) return new Response('nope', { status: 404 });
      const th = await fetch('https://content.dropboxapi.com/2/files/get_thumbnail_v2', {
        method: 'POST',
        headers: { Authorization: `Bearer ${t}`,
          'Dropbox-API-Arg': hsafe({ resource: { '.tag': 'path', path: `${BOARDS}/${bi}` }, format: { '.tag': 'jpeg' }, size: { '.tag': 'w2048h1536' } }) }
      });
      if (th.ok) return new Response(await th.arrayBuffer(), { headers: { 'content-type': 'image/jpeg', 'cache-control': 'private, max-age=86400' } });
      const r = await dlRaw(t, `${BOARDS}/${bi}`);
      if (!r.ok) return new Response('no picture', { status: 404 });
      const ct = IMG_CT[(bi.split('.').pop() || '').toLowerCase()] || 'application/octet-stream';
      return new Response(await r.arrayBuffer(), { headers: { 'content-type': ct, 'cache-control': 'private, max-age=86400' } });
    }
    // 🔔 v6.68 — a manifest per client page, so a homeowner can add THEIR page to the Home Screen
    // (an iPhone only delivers pings to a Home Screen web app) and it opens back on their own code.
    if (url.searchParams.get('manifest')) {
      let pg = null;
      try { pg = JSON.parse(await dl(t, `${BASE}/${c}.json`) || 'null'); } catch (e) {}
      if (!pg) return new Response('nope', { status: 404 });
      const name = String(pg.name || 'Your project').slice(0, 60);
      return new Response(JSON.stringify({ name: `${name} — Clore Construction`, short_name: name.slice(0, 12), start_url: `/c/?c=${c}`, scope: '/c/', display: 'standalone',
        background_color: '#171410', theme_color: '#171410', icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: '/icon-180.png', sizes: '180x180', type: 'image/png' }] }),
        { headers: { 'content-type': 'application/manifest+json', 'cache-control': 'private, max-age=3600' } });
    }
    // 🖼 the board library itself — shared by every client, so only the ones switched ON travel
    if (url.searchParams.get('boards')) {
      if (await dl(t, `${BASE}/${c}.json`) == null) return new Response('nope', { status: 404 });
      let lib = null;
      try { lib = JSON.parse(await dl(t, `${BOARDS}/boards.json`) || 'null'); } catch (e) {}
      const on = lib && Array.isArray(lib.boards) ? lib.boards.filter(b => b && b.id && b.on !== false) : [];
      return new Response(JSON.stringify({ boards: on }), { headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
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
    // 🔔 v6.68 — HOMEOWNER PINGS: this phone's subscription, in THIS client's own file
    // (push-<code>.json). Never Eric's App Data/push-subs.json — his and the crew's alerts must
    // never reach a homeowner, and a homeowner ping must never reach the crew. Only what the
    // browser handed the page is kept: the endpoint and its two keys. Twenty phones per page, tops.
    if (b.push && typeof b.push === 'object') {
      const path = `${BASE}/push-${c}.json`;
      let arr = [];
      try { arr = JSON.parse(await dl(t, path) || '[]'); } catch (e) {}
      if (!Array.isArray(arr)) arr = [];
      if (typeof b.push.off === 'string') {
        const keep = arr.filter(x => ((x && x.sub) || {}).endpoint !== b.push.off);
        if (keep.length !== arr.length) await up(t, path, JSON.stringify(keep, null, 1));
        return Response.json({ ok: true, n: keep.length });
      }
      const s = b.push.sub;
      const good = s && typeof s === 'object' && typeof s.endpoint === 'string' && /^https:\/\//.test(s.endpoint) && s.endpoint.length < 600 &&
        s.keys && typeof s.keys.p256dh === 'string' && typeof s.keys.auth === 'string';
      if (!good) return new Response('bad', { status: 400 });
      const sub = { endpoint: s.endpoint, expirationTime: null, keys: { p256dh: String(s.keys.p256dh).slice(0, 200), auth: String(s.keys.auth).slice(0, 100) } };
      arr = arr.filter(x => ((x && x.sub) || {}).endpoint !== sub.endpoint);
      arr.push({ sub, ts: new Date().toISOString(), ua: String(req.headers.get('user-agent') || '').slice(0, 60) });
      arr = arr.slice(-20);
      await up(t, path, JSON.stringify(arr, null, 1));
      return Response.json({ ok: true, n: arr.length });
    }
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
        item.cph = phPath; // 🖼 v5.76 — the board shows her picture big, so the path rides the item
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
    // 💰 v5.91 — the homeowner tapped a budget CHOICE (vinyl siding vs repaint). Their pick
    // rides their own page (so the total follows it) and echoes into Eric's review pile.
    if (b.pick && typeof b.pick === 'object') {
      const n = String(b.pick.n || '').slice(0, 60);
      const o = Number.isInteger(b.pick.o) ? b.pick.o : -1;
      if (!n || o < 0) return new Response('bad', { status: 400 });
      const ppath = `${BASE}/${c}.json`;
      let pg = null;
      try { pg = JSON.parse(await dl(t, ppath) || 'null'); } catch (e) {}
      const entry = pg && Array.isArray(pg.budget) ? pg.budget.find(x => x && x.n === n && Array.isArray(x.opts)) : null;
      if (!entry || o >= entry.opts.length) return new Response('nope', { status: 404 });
      if (entry.pick !== o) {
        entry.pick = o; // their own tap isn't "news" — the updated-lamp stays honest
        await up(t, ppath, JSON.stringify(pg, null, 1));
        // 🔕 v5.92 — Eric: "if she's clicking around choosing different options I don't want
        // an alert each time." ONE review-pile entry per category, updated in place — the
        // latest choice stands, with a small changed-count so he knows they shopped around.
        const apath = `${BASE}/asks-${c}.json`;
        let arr = [];
        try { arr = JSON.parse(await dl(t, apath) || '[]'); } catch (e) {}
        if (!Array.isArray(arr)) arr = [];
        const label = `💰 CHOSE — ${n}: ${entry.opts[o].t} ($${(+entry.opts[o].est || 0).toLocaleString()})`;
        const old = arr.find(a => a && a.pk === n);
        if (old) {
          old.k = (+old.k || 1) + 1;
          old.text = `${label} · changed their mind ${old.k - 1}×`;
          old.ts = new Date().toISOString();
          arr = [old, ...arr.filter(a => a !== old)]; // freshest choice rides the top, still one entry
        } else {
          arr.unshift({ tag: 'General', pk: n, k: 1, text: label, ts: new Date().toISOString() });
        }
        await up(t, apath, JSON.stringify(arr.slice(0, 200)));
      }
      return new Response('ok');
    }
    // 🔒 v5.93 — LOCK IT IN: the homeowner's definite word on a choice (or reopening it).
    // Flips the same standing pile entry — never a second alert.
    if (b.lock && typeof b.lock === 'object') {
      const n = String(b.lock.n || '').slice(0, 60);
      const on = !!b.lock.on;
      if (!n) return new Response('bad', { status: 400 });
      const ppath = `${BASE}/${c}.json`;
      let pg = null;
      try { pg = JSON.parse(await dl(t, ppath) || 'null'); } catch (e) {}
      const entry = pg && Array.isArray(pg.budget) ? pg.budget.find(x => x && x.n === n && Array.isArray(x.opts)) : null;
      if (!entry) return new Response('nope', { status: 404 });
      const hasPick = Number.isInteger(entry.pick) && entry.opts[entry.pick];
      if (on && !hasPick) return new Response('bad', { status: 400 }); // nothing chosen = nothing to lock
      if (!!entry.lk !== on) {
        if (on) entry.lk = true; else delete entry.lk;
        await up(t, ppath, JSON.stringify(pg, null, 1));
        const apath = `${BASE}/asks-${c}.json`;
        let arr = [];
        try { arr = JSON.parse(await dl(t, apath) || '[]'); } catch (e) {}
        if (!Array.isArray(arr)) arr = [];
        const pickWord = hasPick ? `${entry.opts[entry.pick].t} ($${(+entry.opts[entry.pick].est || 0).toLocaleString()})` : '';
        const label = on ? `🔒 LOCKED IN — ${n}: ${pickWord}` : `↩ UNLOCKED — ${n}: deciding again (was ${pickWord})`;
        const old = arr.find(a => a && a.pk === n);
        if (old) { old.text = label; old.ts = new Date().toISOString(); arr = [old, ...arr.filter(a => a !== old)]; }
        else arr.unshift({ tag: 'General', pk: n, k: 1, text: label, ts: new Date().toISOString() });
        await up(t, apath, JSON.stringify(arr.slice(0, 200)));
      }
      return new Response('ok');
    }
    // 🖼 v6.50 — what they chose off a poster. Eric: "so make check boxes? and a send to eric
    // button? or a comment page if they check what they wants thats close and describe the
    // rest?" Both: the ticks AND their words come back together, as ONE message per board, in
    // one entry that updates in place — the same rule v5.92 set for budget choices, so shopping
    // around never buries him in alerts. Their answer also lands on their own page, so they can
    // look back at what they picked without asking him.
    if (b.board && typeof b.board === 'object') {
      const id = String(b.board.id || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40);
      const note = String(b.board.note || '').slice(0, 1000).trim();
      const call = !!b.board.call;
      const picks = Array.isArray(b.board.picks)
        ? [...new Set(b.board.picks.map(x => String(x || '').slice(0, 120).trim()).filter(Boolean))].slice(0, 40) : [];
      if (!id || (!picks.length && !note && !call)) return new Response('bad', { status: 400 });
      let lib = null;
      try { lib = JSON.parse(await dl(t, `${BOARDS}/boards.json`) || 'null'); } catch (e) {}
      const board = lib && Array.isArray(lib.boards) ? lib.boards.find(x => x && x.id === id && x.on !== false) : null;
      if (!board) return new Response('nope', { status: 404 });
      // only names that are actually ON that poster can come back — nothing invented in transit
      const real = new Set((board.groups || []).flatMap(g => (g.o || []).map(String)));
      const keep = picks.filter(x => real.has(x));
      if (!keep.length && !note && !call) return new Response('bad', { status: 400 });
      const now = new Date().toISOString();
      const ppath = `${BASE}/${c}.json`;
      let pg = null;
      try { pg = JSON.parse(await dl(t, ppath) || 'null'); } catch (e) {}
      if (pg && typeof pg === 'object') {
        pg.boardPicks = pg.boardPicks && typeof pg.boardPicks === 'object' ? pg.boardPicks : {};
        const was = pg.boardPicks[id];
        pg.boardPicks[id] = { picks: keep, note, call, ts: now, k: (was && +was.k || 0) + 1 };
        await up(t, ppath, JSON.stringify(pg, null, 1));
      }
      const bits = [keep.length ? keep.join(', ') : '', note ? `“${note}”` : '', call ? '📞 asked you to CALL' : ''].filter(Boolean);
      const label = `🖼 CHOSE — ${board.name || id}: ${bits.join(' · ')}`;
      const apath = `${BASE}/asks-${c}.json`;
      let arr = [];
      try { arr = JSON.parse(await dl(t, apath) || '[]'); } catch (e) {}
      if (!Array.isArray(arr)) arr = [];
      const key = 'board:' + id;
      const old = arr.find(a => a && a.pk === key);
      if (old) {
        old.k = (+old.k || 1) + 1;
        old.text = `${label}${old.k > 1 ? ` · changed their mind ${old.k - 1}×` : ''}`;
        old.ts = now;
        arr = [old, ...arr.filter(a => a !== old)];
      } else arr.unshift({ tag: 'Materials', pk: key, k: 1, text: label, ts: now });
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
