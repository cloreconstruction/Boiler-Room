// 🚪 v7.81 — THE HOMEOWNER'S DOOR OPENS ONLY FOR A CLIENT'S CODE. Found 2026-10-02 while a new office file was about to be put
// in the Client Portal folder: the door cleaned the code it was asked for (letters, digits, dashes) and then served
// `<that name>.json` out of the folder — so a caller who asked for a file that is NOT a client page was handed it (the list of
// every client's code, an office estimates board, an office Build List, the invoice lines, the push files). Now a code must be on
// the list in index.json before anything is read or written for it. The whole suite runs the SHIPPED function in node against a
// made-up Dropbox; every name, code and figure is made up.
const fs = require('fs'), path = require('path'), { fileURLToPath, pathToFileURL } = require('url');
(async () => {
  const appUrl = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const repo = path.dirname(fileURLToPath(appUrl));
  const src = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
  const fnSrc = fs.readFileSync(path.join(repo, 'fnsrc', 'client-portal.mjs'), 'utf8');
  const shipped = fs.readFileSync(path.join(repo, 'netlify', 'functions', 'client-portal.mjs'), 'utf8');
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };

  console.log('— 🚪 the shipped function —');
  ok('the shipped function IS the source (copied verbatim), and it checks the list', shipped === fnSrc && /async function isClient\(t, c\)/.test(fnSrc) && /index\.json/.test(fnSrc));
  ok('both doors ask the list before anything else is read: GET and POST', (() => {
    const get = fnSrc.slice(fnSrc.indexOf("if (req.method === 'GET')"), fnSrc.indexOf("if (req.method === 'POST')")), post = fnSrc.slice(fnSrc.indexOf("if (req.method === 'POST')"));
    const first = s => { const a = s.indexOf('isClient(t, c)'), b = s.indexOf('await dl(t,'); return a > 0 && (b < 0 || a < b); };
    return first(get) && first(post);
  })());

  const B = '/Clore DayLog/App Data/Client Portal';
  const portal = (await import(pathToFileURL(path.join(repo, 'netlify', 'functions', 'client-portal.mjs')).href)).default;
  process.env.DBX_REFRESH_TOKEN = 'r'; process.env.DBX_APP_KEY = 'a'; delete process.env.PUSH_SECRET;
  // a made-up Client Portal folder: two client pages, and every kind of office file that sits beside them
  const OFFICE = {
    [`${B}/index.json`]: JSON.stringify({ clients: [{ key: 'oak', job: 'Oak House', code: 'oak-1a2b3c' }, { key: 'pine', job: 'Pine Cabin', code: 'pine-4d5e6f' }] }),
    [`${B}/oak-1a2b3c.json`]: JSON.stringify({ name: 'Oak House', budget: [{ n: 'Siding', est: 6000 }] }),
    [`${B}/pine-4d5e6f.json`]: JSON.stringify({ name: 'Pine Cabin' }),
    [`${B}/estimates-oak-1a2b3c.json`]: JSON.stringify({ mk: 20, cats: [{ n: 'Siding', bids: [{ e1: 5000, note: 'OFFICE-ONLY-WORDS' }] }] }),
    [`${B}/materials-office-oak-1a2b3c.json`]: JSON.stringify({ rooms: [{ name: 'KITCHEN', items: [{ n: 'Sink', sel: 'OFFICE-ONLY-WORDS' }] }] }),
    [`${B}/materials-oak-1a2b3c.json`]: JSON.stringify({ rooms: [{ name: 'KITCHEN', items: [{ n: 'Sink' }] }] }),
    [`${B}/sales-oak-1a2b3c.json`]: JSON.stringify({ asOf: '2026-09-30', lines: [{ inv: '1', amt: 5 }] }),
    [`${B}/paid-oak-1a2b3c.json`]: JSON.stringify({ eids: [1] }),
    [`${B}/plans-oak-1a2b3c.json`]: JSON.stringify({ slots: [] }),
    [`${B}/hitlist-oak-1a2b3c.json`]: JSON.stringify({ lines: [{ t: 'OFFICE-ONLY-WORDS' }] }),
    [`${B}/asks-oak-1a2b3c.json`]: JSON.stringify([{ tag: 'General', text: 'a question of theirs' }]),
    [`${B}/clicks-oak-1a2b3c.json`]: JSON.stringify([{ ev: 'open' }]),
    [`${B}/push-oak-1a2b3c.json`]: JSON.stringify([{ sub: { endpoint: 'https://push.example.com/x', keys: { p256dh: 'p', auth: 'a' } } }]),
    [`${B}/push-queue.json`]: JSON.stringify([{ c: 'oak-1a2b3c', kind: 'journal' }]),
    [`${B}/push-log.json`]: JSON.stringify({ 'oak-1a2b3c:journal': '2026-10-01T00:00:00Z' }),
  };
  const mk = (files = OFFICE, opts = {}) => {
    const st = { files: { ...files }, ups: [], dls: [] };
    global.fetch = async (url, init = {}) => {
      const u = String(url);
      if (u.includes('oauth2/token')) return { ok: true, json: async () => ({ access_token: 't' }) };
      const arg = init.headers && init.headers['Dropbox-API-Arg'] ? JSON.parse(init.headers['Dropbox-API-Arg']) : {};
      if (u.includes('files/download')) { st.dls.push(arg.path);
        if (opts.indexDown && /\/index\.json$/.test(arg.path)) return { ok: false, status: 429, text: async () => '' };
        // Dropbox finds a path whatever its case
        const key = Object.keys(st.files).find(k => k.toLowerCase() === String(arg.path).toLowerCase());
        return key == null ? { ok: false, status: 409, text: async () => '' } : { ok: true, status: 200, text: async () => st.files[key], arrayBuffer: async () => new ArrayBuffer(4) }; }
      if (u.includes('get_thumbnail_v2')) return { ok: true, arrayBuffer: async () => new ArrayBuffer(9) };
      if (u.includes('files/upload')) { st.ups.push(arg.path); st.files[arg.path] = typeof init.body === 'string' ? init.body : Buffer.from(init.body).toString(); return { ok: true, status: 200 }; }
      return { ok: false, status: 500, text: async () => '' };
    };
    return st;
  };
  const GET = q => portal(new Request('https://x/.netlify/functions/client-portal?' + q));
  const POST = body => portal(new Request('https://x/.netlify/functions/client-portal', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }));

  console.log('— 🏠 a real code works as ever —');
  let st = mk();
  ok('a client\'s own code gets their page', await (async () => { const r = await GET('c=oak-1a2b3c'); const j = await r.json(); return r.status === 200 && j.name === 'Oak House'; })());
  ok('…their Build List (the homeowner\'s cut, never the office file), their questions, their manifest', await (async () => {
    const m = await GET('c=oak-1a2b3c&mat=1'), a = await GET('c=oak-1a2b3c&a=1'), f = await GET('c=oak-1a2b3c&manifest=1');
    const mt = await m.text();
    return m.status === 200 && /KITCHEN/.test(mt) && !/OFFICE-ONLY-WORDS/.test(mt) && a.status === 200 && /a question of theirs/.test(await a.text()) && f.status === 200 && (await f.json()).start_url === '/c/?c=oak-1a2b3c';
  })());
  ok('the same code in capitals is still theirs (a link is not case-bound)', await (async () => { const r = await GET('c=OAK-1A2B3C'); return r.status === 200 && (await r.json()).name === 'Oak House'; })());
  ok('a second client\'s code works too; a made-up code gets "not found"', await (async () => { const a = await GET('c=pine-4d5e6f'), b = await GET('c=nobody-000000'); return a.status === 200 && b.status === 404; })());
  ok('their own taps are still saved: a question, a click', await (async () => {
    const a = await POST({ c: 'oak-1a2b3c', ask: { tag: 'General', text: 'when is the siding going on' } }), b = await POST({ c: 'oak-1a2b3c', ev: 'open' });
    return a.status === 200 && b.status === 200 && /siding going on/.test(st.files[`${B}/asks-oak-1a2b3c.json`]) && st.ups.includes(`${B}/clicks-oak-1a2b3c.json`);
  })());

  console.log('— 🚪 a file that is not a client page is never handed out —');
  st = mk();
  const NOT_PAGES = ['index', 'estimates-oak-1a2b3c', 'materials-office-oak-1a2b3c', 'materials-oak-1a2b3c', 'sales-oak-1a2b3c', 'paid-oak-1a2b3c', 'plans-oak-1a2b3c',
    'hitlist-oak-1a2b3c', 'asks-oak-1a2b3c', 'clicks-oak-1a2b3c', 'push-oak-1a2b3c', 'push-queue', 'push-log'];
  const tried = [];
  for (const name of NOT_PAGES) { const r = await GET('c=' + name); tried.push({ name, status: r.status, body: await r.text() }); }
  ok('every one of them, asked for by name, is "not found" — the client list, the office estimates, the office Build List, the invoice lines, the push files', tried.every(x => x.status === 404), JSON.stringify(tried.filter(x => x.status !== 404).map(x => x.name)));
  ok('…and not a word of any of them is in what comes back', tried.every(x => !/OFFICE-ONLY-WORDS|clients|oak-1a2b3c|endpoint|eids|lines/.test(x.body)), JSON.stringify(tried.map(x => x.body.slice(0, 40))));
  ok('…and the file itself was never even read (only the list was)', NOT_PAGES.filter(n => n !== 'index').every(n => !st.dls.some(p => p.toLowerCase() === `${B}/${n}.json`.toLowerCase())), JSON.stringify(st.dls));
  ok('the same names with the other routes on them are refused too (mat · a · boards · manifest · a photo · a poster)', await (async () => {
    const qs = ['c=index&mat=1', 'c=index&a=1', 'c=index&boards=1', 'c=index&manifest=1', 'c=index&p=x.jpg', 'c=index&bimg=x.png', 'c=office-oak-1a2b3c&mat=1', 'c=estimates-oak-1a2b3c&manifest=1'];
    const rs = []; for (const q of qs) rs.push((await GET(q)).status);
    return rs.every(s => s === 404);
  })());
  ok('a POST for one of them writes nothing and reads nothing of it: no push file, no clicks file, no question file made for "index"', await (async () => {
    const n = st.ups.length;
    const a = await POST({ c: 'index', ev: 'open' }), b = await POST({ c: 'index', ask: { tag: 'General', text: 'x' } }), c = await POST({ c: 'index', push: { sub: { endpoint: 'https://push.example.com/z', keys: { p256dh: 'p', auth: 'a' } } } }),
      d = await POST({ c: 'estimates-oak-1a2b3c', pick: { n: 'Siding', o: 0 } }), e = await POST({ c: 'estimates-oak-1a2b3c', hold: { n: 'Siding', on: true } });
    return [a, b, c, d, e].every(r => r.status === 404) && st.ups.length === n && !Object.keys(st.files).some(k => /(clicks|asks|push)-index\.json$/.test(k)) &&
      st.files[`${B}/estimates-oak-1a2b3c.json`] === OFFICE[`${B}/estimates-oak-1a2b3c.json`];
  })());
  ok('a code is still cleaned before it is used: dots and slashes never reach a Dropbox path', await (async () => {
    const r = await GET('c=' + encodeURIComponent('../index')), r2 = await GET('c=' + encodeURIComponent('oak-1a2b3c/../index'));
    return r.status === 404 && r2.status === 404 && !st.dls.some(p => /\.\./.test(p));
  })());

  console.log('— 🗂 the list itself —');
  ok('one page load asks many times — the list is read once, not once per request', await (async () => {
    // (the list was read by the checks above; five more asks inside the half minute read it no more)
    st = mk(); const before = st.dls.filter(p => /\/index\.json$/.test(p)).length;
    for (let i = 0; i < 5; i++) await GET('c=oak-1a2b3c');
    return st.dls.filter(p => /\/index\.json$/.test(p)).length - before === 0;
  })(), JSON.stringify(st.dls));
  ok('a rotated code dies at once: its page file is gone, so the old link is "not found" though the list was read a moment ago', await (async () => {
    const files = { ...OFFICE }; delete files[`${B}/pine-4d5e6f.json`]; files[`${B}/pine-777777.json`] = JSON.stringify({ name: 'Pine Cabin' });
    files[`${B}/index.json`] = JSON.stringify({ clients: [{ key: 'oak', job: 'Oak House', code: 'oak-1a2b3c' }, { key: 'pine', job: 'Pine Cabin', code: 'pine-777777' }] });
    mk(files);
    return (await GET('c=pine-4d5e6f')).status === 404;
  })());
  // the rest wait out the door's own short memory, so they come last (the door looks at the list again for a code it does not know,
  // no more than once in five seconds)
  await new Promise(r => setTimeout(r, 5200));
  ok('a page made a moment ago is served: a code the door does not know makes it look at the list once more', await (async () => {
    const files = { ...OFFICE, [`${B}/new-abcdef.json`]: JSON.stringify({ name: 'New Job' }) };
    files[`${B}/index.json`] = JSON.stringify({ clients: [{ key: 'oak', job: 'Oak House', code: 'oak-1a2b3c' }, { key: 'pine', job: 'Pine Cabin', code: 'pine-4d5e6f' }, { key: 'new', job: 'New Job', code: 'new-abcdef' }] });
    mk(files);
    const r = await GET('c=new-abcdef');
    return r.status === 200 && (await r.json()).name === 'New Job';
  })());
  await new Promise(r => setTimeout(r, 5200));
  ok('a list that cannot be read lets nobody NEW in — and what was known a moment ago still stands', await (async () => {
    const s2 = mk(OFFICE, { indexDown: true });
    const known = await GET('c=oak-1a2b3c'), stranger = await GET('c=index'), other = await GET('c=estimates-oak-1a2b3c');
    return known.status === 200 && stranger.status === 404 && other.status === 404 && !s2.dls.some(p => /estimates-/.test(p));
  })());

  console.log('— 📱 the app and their page are untouched by it —');
  ok('the homeowner\'s page asks only by its own code (every request is ?c=<its code>)', (() => { const pg = fs.readFileSync(path.join(repo, 'c', 'index.html'), 'utf8');
    const all = pg.match(/FN \+ '[^']*'/g) || []; return all.length > 0 && all.every(a => a === "FN + '?c='") && (pg.match(/FN \+ '\?c=' \+ encodeURIComponent\(code/g) || []).length === all.length; })());
  ok('version bumped — APP_VER and the footer agree', /const APP_VER = 'v7\.(8[1-9]|9\d)'/.test(src) && new RegExp('<footer>' + (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1].replace('.', '\\.') + ' ·').test(src));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
