// 👷 v7.47 — THE ROAD TO THE CREW'S PHONES, AND NINE ALERTS. Eric, with the list in front of him (⚠ Eric needs an answer ·
// 📨 a note from Eric · 📋 your board · ↩ Eric answered you · 📇 a job card changed · 📐 new plans · and for the office crew
// 📖 a journal is due · 🏠 a homeowner picked or asked · 🚧 the Build List needs a look): "Yes to all." And, before that: "do
// they need to set up a push notification on their phone or just me?" — both. Until now NOTHING could ring a crew phone.
// Three halves: the cloud's rules and doors in node, Eric's phone, a crew phone. Every name and figure here is made up.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { fileURLToPath, pathToFileURL } = require('url');
(async () => {
  const appUrl = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const repo = path.dirname(fileURLToPath(appUrl));
  const src = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };
  const errs = [];

  console.log('— ☁ the rules (fnsrc/crew-push-core.mjs, in node) —');
  const C = await import(pathToFileURL(path.join(repo, 'fnsrc', 'crew-push-core.mjs')).href);
  const roster = [{ name: 'Phil', office: true }, { name: 'Kevin', office: false }, { name: 'Ann Lee', office: true }];
  const at = h => new Date(Date.UTC(2026, 8, 29, (h + 8) % 24, 30));   // Alaska is 8 hours behind UTC in late September
  ok('WHO: everyone, the office crew, or the names asked for — only people whose folder is really there, and never the sender himself', C.targetsOf('crew', roster, 'Eric', 'eric').join() === 'Phil,Kevin,Ann Lee' && C.targetsOf('office', roster, '', 'client').join() === 'Phil,Ann Lee' &&
    C.targetsOf(['phil', 'Nobody', 'ann  lee'], roster, 'Eric', 'eric').join() === 'Phil,Ann Lee' && C.targetsOf('crew', roster, 'Phil', 'plans').join() === 'Kevin,Ann Lee' && C.targetsOf('Zed', roster, 'Eric', 'eric').length === 0);
  ok('an office-only alert reaches the office crew whatever was asked for', C.targetsOf('crew', roster, 'Eric', 'stuck').join() === 'Phil,Ann Lee' && C.targetsOf(['Kevin'], roster, 'Eric', 'journal').length === 0 && C.OFFICE_KINDS.join() === 'journal,client,stuck');
  ok('WHETHER: with no settings file a phone rings 7 AM to 8 PM Alaska — never "at any hour"', C.decide(null, 'eric', at(9), null, 'Phil').ok && !C.decide(null, 'eric', at(22), null, 'Phil').ok && C.decide(null, 'eric', at(22), null, 'Phil').why === 'outside his hours' && !C.decide(null, 'ask', at(3), null, 'Phil').ok);
  ok('his own switches and hours decide: a kind off never rings, only-urgent lets ⚠ through and nothing else, all day means all day', !C.decide({ kinds: { board: false } }, 'board', at(9), null, 'Phil').ok && C.decide({ kinds: { board: false } }, 'eric', at(9), null, 'Phil').ok &&
    !C.decide({ urgent: true }, 'eric', at(9), null, 'Phil').ok && C.decide({ urgent: true }, 'ask', at(9), null, 'Phil').ok && C.decide({ win: { from: 5, to: 5 } }, 'eric', at(2), null, 'Phil').ok && !C.decide(null, 'made-up', at(9), null, 'Phil').ok);
  ok('a kind that comes in bursts rings once and rests — a homeowner half an hour, a job card ten minutes — for THAT person only; a note never rests', (() => {
    const st = C.stateAfter(null, ['Phil:client', 'Phil:card'], at(9)), later = m => new Date(+at(9) + m * 60000);
    return !C.decide(null, 'client', later(10), st, 'Phil').ok && C.decide(null, 'client', later(31), st, 'Phil').ok && C.decide(null, 'client', later(1), st, 'Ann Lee').ok &&
      !C.decide(null, 'card', later(5), st, 'Phil').ok && C.decide(null, 'card', later(11), st, 'Phil').ok && C.decide(null, 'eric', later(1), C.stateAfter(null, ['Phil:eric'], at(9)), 'Phil').ok;
  })());
  ok('the state file keeps only when a bursty kind last rang, and forgets after a day', (() => { const a = C.stateAfter({ last: { 'Old:card': new Date(+at(9) - 2 * 86400e3).toISOString(), 'Phil:card': at(8).toISOString() } }, ['Kevin:plans'], at(9)); return Object.keys(a.last).sort().join() === 'Kevin:plans,Phil:card' && Object.keys(a).sort().join() === 'last,v'; })());
  const words = Object.values(C.CREW_WORDS).map(w => w.title + ' ' + w.body).join(' | ');
  ok('WHAT: nine kinds, fixed words — no dollar sign, no number, no address; only ⚠ Eric needs an answer is urgent', Object.keys(C.CREW_WORDS).join() === 'ask,eric,reply,board,card,plans,journal,client,stuck' && !/\$|\d|@/.test(words) && Object.entries(C.CREW_WORDS).filter(([, w]) => w.urgent).map(([k]) => k).join() === 'ask');
  const day = n => new Date(Date.UTC(2026, 8, 29) - n * 86400e3).toISOString().slice(0, 10);
  ok('📖 a journal is DUE at seven days, a job quiet three weeks is left out, a hidden journal and a job never journaled do not count', C.journalsDue([{ journal: [{ released: day(7) }] }, { journal: [{ released: day(20) }] }, { journal: [{ released: day(6) }] }, { journal: [{ released: day(21) }] }, { journal: [] }, { show: { journal: false }, journal: [{ released: day(9) }] }, null], day(0)) === 2);
  ok('it rings at 9 in the morning Alaska time, Monday to Friday, then rests three days', C.journalWhen(at(9), null).send && C.journalWhen(at(10), null).why === 'hour' && C.journalWhen(at(9), { last: day(1) }).why === 'rang lately' && C.journalWhen(at(9), { last: day(2) }).why === 'rang lately' && C.journalWhen(at(9), { last: day(3) }).send &&
    C.journalWhen(new Date(Date.UTC(2026, 9, 3, 17, 30)), null).why === 'weekend' && C.journalWhen(new Date(Date.UTC(2026, 11, 1, 18, 30)), null).send);   // winter: 18Z is 9 AM

  console.log('— ☁ the door (the shipped notify function, in node, against a made-up Dropbox) —');
  const webPush = require('web-push');
  const vapid = webPush.generateVAPIDKeys();
  Object.assign(process.env, { DBX_REFRESH_TOKEN: 'r', DBX_APP_KEY: 'a', PUSH_SECRET: 'made-up-secret', VAPID_PUBLIC_KEY: vapid.publicKey, VAPID_PRIVATE_KEY: vapid.privateKey });
  const notify = (await import(pathToFileURL(path.join(repo, 'netlify', 'functions', 'notify.mjs')).href)).default;
  const CREW = '/Clore DayLog/Crew';
  const mkBox = files => {
    const st = { files: { ...files }, ups: [], reads: [], lists: 0 };
    global.fetch = async (url, init = {}) => {
      const u = String(url), h = init.headers || {};
      if (u.includes('oauth2/token')) return { ok: true, json: async () => ({ access_token: 't' }) };
      if (u.includes('files/list_folder')) { st.lists++; const names = [...new Set(Object.keys(st.files).filter(p => p.startsWith(CREW + '/')).map(p => p.slice(CREW.length + 1).split('/')[0]))]; return { ok: true, json: async () => ({ entries: names.map(n => ({ '.tag': 'folder', name: n })), has_more: false }) }; }
      const arg = h['Dropbox-API-Arg'] ? JSON.parse(h['Dropbox-API-Arg']) : {};
      if (u.includes('files/download')) { st.reads.push(arg.path); const t = st.files[arg.path]; return t == null ? { ok: false, status: 409, text: async () => '' } : { ok: true, status: 200, text: async () => t }; }
      if (u.includes('files/upload')) { st.ups.push(arg.path); st.files[arg.path] = String(init.body); return { ok: true, status: 200 }; }
      return { ok: false, status: 500, text: async () => '' };
    };
    return st;
  };
  const hourAK = parseInt(new Intl.DateTimeFormat('en-US', { timeZone: 'America/Anchorage', hour: '2-digit', hour12: false }).format(new Date()), 10) % 24;
  const openWin = { from: hourAK, to: (hourAK + 1) % 24 }, shutWin = { from: (hourAK + 2) % 24, to: (hourAK + 3) % 24 };
  const sub = { endpoint: 'https://127.0.0.1:9/made-up', expirationTime: null, keys: { p256dh: 'x', auth: 'y' } };   // nothing listens there: the push itself is refused, which is all this half needs
  const folder = (name, o) => ({ [`${CREW}/${name}/crew.json`]: JSON.stringify({ name, office: o.office || undefined }), ...(o.subs ? { [`${CREW}/${name}/App Data/push-subs.json`]: JSON.stringify(o.subs) } : {}), ...(o.set ? { [`${CREW}/${name}/App Data/push-settings.json`]: JSON.stringify(o.set) } : {}) });
  const box = () => mkBox({ ...folder('Phil', { office: true, subs: [{ sub }], set: { win: openWin, kinds: { board: false }, urgent: false, tz: 'America/Anchorage' } }), ...folder('Kevin', { subs: [{ sub }], set: { win: shutWin, tz: 'America/Anchorage' } }), ...folder('Ann', { office: true }),
    [`${CREW}/Old Stuff/readme.txt`]: 'not a crew member', '/Clore DayLog/App Data/push-subs.json': JSON.stringify([{ sub }]) });
  const post = (body, secret = 'made-up-secret') => notify(new Request('http://x/.netlify/functions/notify', { method: 'POST', headers: { 'content-type': 'application/json', 'x-push-secret': secret }, body: JSON.stringify(body) }));
  ok('without the secret the door stays shut', (await post({ to: 'crew', kind: 'eric' }, 'wrong')).status === 401);
  const r1 = await (async () => { const st = box(); const j = await (await post({ to: 'crew', kind: 'eric', from: 'Eric', title: 'HIS OWN WORDS $500', body: 'Josten' })).json(); return { j, st }; })();
  // Ann has no settings file, so CREW_DEFAULTS (7 AM–8 PM Alaska) speak for her — and the hours are looked at before the sign-up:
  // run at night she reads "outside his hours", by day "not signed up". Both are the truth (found by the full run of 2026-09-29 after 8 PM).
  const nightAK = hourAK < 7 || hourAK >= 20;
  ok('a push for the crew reads each person\'s OWN folder — his sign-up, his hours, his switches — and never Eric\'s own sign-up file', r1.j.to === 3 && r1.j.skipped.Kevin === 'outside his hours' && r1.j.skipped.Ann === (nightAK ? 'outside his hours' : 'not signed up') && r1.j.skipped.Phil === 'no phone took it' &&
    r1.st.reads.includes(`${CREW}/Phil/App Data/push-subs.json`) && r1.st.reads.includes(`${CREW}/Phil/App Data/push-settings.json`) && !r1.st.reads.includes(`${CREW}/Kevin/App Data/push-subs.json`) && !r1.st.reads.includes('/Clore DayLog/App Data/push-subs.json') && !('Old Stuff' in r1.j.skipped), JSON.stringify(r1.j));
  ok('it writes nothing for a note (no state to keep) — and the answer carries counts and fixed words only, none of what was sent along', r1.st.ups.length === 0 && !/HIS OWN WORDS|Josten|\$/.test(JSON.stringify(r1.j)));
  ok('a kind he switched off on his own phone does not ring him', await (async () => { box(); const j = await (await post({ to: ['Phil'], kind: 'board', from: 'Eric' })).json(); return j.to === 1 && j.skipped.Phil === 'board is off' && j.sent === 0; })());
  ok('an office-only alert asked of everyone goes to the office crew alone; a kind the door does not know rings nobody', await (async () => { box(); const a = await (await post({ to: 'crew', kind: 'client' })).json(); const b = await (await post({ to: 'crew', kind: 'gossip' })).json(); return a.to === 2 && !('Kevin' in a.skipped) && b.to === 0 && b.sent === 0; })());
  ok('a push with no "to" is still Eric\'s own, by his own file — as before', await (async () => { const st = box(); const j = await (await post({ kind: 'text', urgent: true, title: 'x', body: 'y' })).json(); return 'total' in j && st.reads.includes('/Clore DayLog/App Data/push-subs.json') && st.lists === 0; })());
  const bundle = fs.readFileSync(path.join(repo, 'netlify', 'functions', 'journal-reminder.mjs'), 'utf8'), toml = fs.readFileSync(path.join(repo, 'netlify.toml'), 'utf8');
  ok('the journal timer is shipped and on the clock: weekday mornings, both the summer and the winter hour', /journal-reminder-state\.json/.test(bundle) && /A job journal is due/.test(bundle) && /\[functions\."journal-reminder"\]\s+schedule = "0 17,18 \* \* 1-5"/.test(toml));

  console.log('— 🏠 the homeowner\'s door rings the office —');
  const portal = (await import(pathToFileURL(path.join(repo, 'netlify', 'functions', 'client-portal.mjs')).href)).default;
  const PAGE = '/Clore DayLog/App Data/Client Portal/test-1234.json';
  const mkPortal = files => { const st = { files: { ...files }, rings: [] };
    global.fetch = async (url, init = {}) => { const u = String(url);
      if (u.includes('/.netlify/functions/notify')) { st.rings.push({ body: JSON.parse(init.body), secret: (init.headers || {})['x-push-secret'] }); return { ok: true, status: 200, json: async () => ({}) }; }
      if (u.includes('oauth2/token')) return { ok: true, json: async () => ({ access_token: 't' }) };
      const arg = init.headers && init.headers['Dropbox-API-Arg'] ? JSON.parse(init.headers['Dropbox-API-Arg']) : {};
      if (u.includes('files/download')) { const t = st.files[arg.path]; return t == null ? { ok: false, status: 409, text: async () => '' } : { ok: true, status: 200, text: async () => t }; }
      if (u.includes('files/upload')) { st.files[arg.path] = typeof init.body === 'string' ? init.body : Buffer.from(init.body).toString(); return { ok: true, status: 200 }; }
      return { ok: false, status: 500, text: async () => '' }; };
    return st; };
  const ask = (body, ctx) => portal(new Request('http://x/.netlify/functions/client-portal', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }), ctx);
  const pg = () => ({ [PAGE]: JSON.stringify({ name: 'Oak House', budget: [{ n: 'Siding', opts: [{ t: 'Vinyl', est: 8000 }, { t: 'Repaint', est: 3000 }], def: 0 }] }) });
  ok('a question saved = the office is rung: kind "client", to the office, with the site\'s own secret — and not one word of the question', await (async () => { const st = mkPortal(pg()); const r = await ask({ c: 'test-1234', ask: { tag: 'General', text: 'Can we move the window? It is $400 more' } });
    return r.status === 200 && st.rings.length === 1 && JSON.stringify(st.rings[0].body) === '{"to":"office","kind":"client"}' && st.rings[0].secret === 'made-up-secret'; })());
  ok('a choice tapped rings once; the SAME choice tapped again changes nothing and rings nobody; a lock rings', await (async () => { const st = mkPortal(pg());
    await ask({ c: 'test-1234', pick: { n: 'Siding', o: 1 } }); const a = st.rings.length; await ask({ c: 'test-1234', pick: { n: 'Siding', o: 1 } }); const b = st.rings.length; await ask({ c: 'test-1234', lock: { n: 'Siding', on: true } });
    return a === 1 && b === 1 && st.rings.length === 2; })());
  ok('a word about the APP (Feedback) is Eric\'s to read — no bell; a click on their page — no bell; an unknown code — no bell', await (async () => { const st = mkPortal(pg());
    await ask({ c: 'test-1234', ask: { tag: 'Feedback', text: 'love it' } }); await ask({ c: 'test-1234', ev: 'open' }); await ask({ c: 'nobody-0000', ask: { tag: 'General', text: 'x' } }); return st.rings.length === 0; })());
  ok('the homeowner is answered first: the bell is handed to waitUntil, never waited on', await (async () => { const st = mkPortal(pg()); const held = []; const r = await ask({ c: 'test-1234', ask: { tag: 'General', text: 'hello' } }, { waitUntil: p => held.push(p) }); return r.status === 200 && held.length === 1 && typeof held[0].then === 'function' && st.rings.length === 1; })());
  ok('no secret in the site\'s settings = no bell, and the question is saved all the same', await (async () => { const keep = process.env.PUSH_SECRET; delete process.env.PUSH_SECRET; const st = mkPortal(pg()); const r = await ask({ c: 'test-1234', ask: { tag: 'General', text: 'hello' } }); process.env.PUSH_SECRET = keep;
    return r.status === 200 && st.rings.length === 0 && /hello/.test(st.files['/Clore DayLog/App Data/Client Portal/asks-test-1234.json'] || ''); })());

  console.log('— 📱 Eric\'s phone —');
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const open = async init => { const c = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }); await c.route(u => !/^file:/.test(u.href), r => r.abort()); if (init) await c.addInitScript(init); const p = await c.newPage(); p.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); }); await p.goto(appUrl); await p.waitForTimeout(700); return { ctx: c, page: p }; };
  const eric = await open();
  const page = eric.page;
  await page.evaluate(() => {
    window.scheduleSave = () => {}; window.savePendingSoon = () => {};
    entries = []; todos = []; jobs = ['Oak House']; crew = ['Phil', 'Kevin', 'Ann']; prefs.office = ['Phil', 'Ann']; nextId = 100; pendingQueue = [];
    prefs.pushSecret = 'made-up-secret'; prefs.pushWin = { from: 9, to: 10 }; prefs.pushKinds = { crew: false }; prefs.pushUrgent = true;   // HIS switches are as tight as they go — a push for the crew does not answer to them
    renderJobSelects(); closePanels(); renderAll();
    window._order = []; window.publishSharedNotes = async () => { await new Promise(r => setTimeout(r, 30)); _order.push('published'); };
    window._sent = []; const f0 = window.fetch; window.fetch = (u, init) => { if (/functions\/notify/.test(String(u))) { _sent.push(JSON.parse(init.body)); _order.push('rang'); return Promise.resolve(new Response('{}', { status: 200 })); } return f0(u, init); };
    window._clear = () => { _sent.length = 0; _order.length = 0; Object.keys(_pushRestAt).forEach(k => delete _pushRestAt[k]); };
    window._note = async (words, vis, attn) => { qnJobPick = 'Oak House'; setVis(vis); if (attn !== attnOn()) toggleAttn(); $('askText').value = words; $('askText').dispatchEvent(new Event('input')); saveNoteFrom('askText'); await new Promise(r => setTimeout(r, 120)); };
  });
  ok('who a push is for: everyone on the roster, the office crew, or the names — a name that is not on the roster is nobody', await page.evaluate(() => pushNames('crew').join() === 'Phil,Kevin,Ann' && pushNames('office').join() === 'Phil,Ann' && pushNames(['kevin', 'Zed']).join() === 'Kevin' && pushNames('Zed').length === 0 && pushNames('').length === 0));
  ok('a note unlocked for Phil: it goes to his folder FIRST, then his phone is rung — "From Eric", to Phil alone, and not one word of the note rides along', await page.evaluate(async () => { _clear(); await _note('the gate code is 4471 and the lumber was $500', 'Phil', false);
    const s = _sent[0] || {}; return _sent.length === 1 && s.kind === 'eric' && JSON.stringify(s.to) === '["Phil"]' && s.from === 'Eric' && _order.join() === 'published,rang' && !/4471|500|gate|lumber|Oak House/.test(JSON.stringify(s)) && !('title' in s) && !('body' in s); }), await page.evaluate(() => JSON.stringify([_sent, _order])));
  ok('with ⚠ it is "Eric needs an answer"; for 🔓 all crew it goes to every name on the roster; HIS own switches (crew off, only urgent, an hour a day) do not stop it — theirs decide', await page.evaluate(async () => { _clear(); await _note('need the count by noon', 'Phil', true); const a = _sent[0] || {}; _clear(); await _note('pour is Friday', 'crew', false); const b = _sent[0] || {};
    return a.kind === 'ask' && JSON.stringify(a.to) === '["Phil"]' && b.kind === 'eric' && JSON.stringify(b.to) === '["Phil","Kevin","Ann"]'; }), await page.evaluate(() => JSON.stringify(_sent)));
  ok('🔒 Just me rings nobody — with ⚠ lit too; a 🔒 Personal note rings nobody', await page.evaluate(async () => { _clear(); await _note('for me only', '', false); await _note('heads-up for me', '', true); const n = _sent.length;
    const e = addEntry('Note', 'family thing', 'Oak House', { personal: true }); return n === 0 && _sent.length === 0 && !!e; }));
  ok('↩ Respond to a note Phil sent: "Eric answered you", to Phil, after the response is in his folder', await page.evaluate(async () => { _clear();
    _crewLog = { Phil: [{ id: 5, ts: new Date().toISOString(), type: 'Note', details: 'which door?', job: 'Oak House', vis: 'Eric' }] };
    const box = document.createElement('div'); box.innerHTML = '<div id="thBox-Phil-5"></div><textarea id="thT-Phil-5">the north one</textarea>'; document.body.appendChild(box);
    thRespondSend('Phil', 5, 'Phil'); await new Promise(r => setTimeout(r, 120)); box.remove();
    const s = _sent[0] || {}; return _sent.length === 1 && s.kind === 'reply' && JSON.stringify(s.to) === '["Phil"]' && _order.join() === 'published,rang' && !/north/.test(JSON.stringify(s)); }), await page.evaluate(() => JSON.stringify([_sent, _order])));
  ok('👷 a Board line put on Kevin\'s board rings Kevin; taking it back off rings nobody', await page.evaluate(async () => { _clear(); const e = addEntry('Note', 'pick up the hangers', 'Oak House', { board: { p: 1, sub: [], at: new Date().toISOString() } });
    brdCrew(e.id, 'Kevin'); await new Promise(r => setTimeout(r, 120)); const a = _sent.slice(); _clear(); brdCrew(e.id, 'Kevin'); await new Promise(r => setTimeout(r, 120));
    return a.length === 1 && a[0].kind === 'board' && JSON.stringify(a[0].to) === '["Kevin"]' && _sent.length === 0; }));
  ok('📇 a job card: what the crew already hold is taken as told; a changed code rings the whole crew once, the same card saved again rings nobody, a locked card never rings', await page.evaluate(async () => { _clear();
    prefs.cards = { 'oak house': { job: 'Oak House', addr: '12 Oak St', people: [], codes: [{ w: 'gate', c: '1111' }], notes: '' }, 'pine cabin': { job: 'Pine Cabin', addr: '9 Pine Rd', people: [], codes: [], notes: '', lock: true } }; delete prefs.cardTold;
    cardToldSeed(); const seeded = Object.keys(prefs.cardTold).join() === 'oak house';
    const c = prefs.cards['oak house']; cardCommit(c); await new Promise(r => setTimeout(r, 120)); const same = _sent.length;
    c.codes[0].c = '2222'; cardCommit(c); await new Promise(r => setTimeout(r, 120)); const a = _sent.slice();
    cardCommit(c); await new Promise(r => setTimeout(r, 120)); const again = _sent.length;
    const l = prefs.cards['pine cabin']; l.addr = '10 Pine Rd'; cardCommit(l); await new Promise(r => setTimeout(r, 120));
    return seeded && same === 0 && a.length === 1 && a[0].kind === 'card' && JSON.stringify(a[0].to) === '["Phil","Kevin","Ann"]' && !/2222|Oak/.test(JSON.stringify(a[0])) && again === 1 && _sent.length === 1; }), await page.evaluate(() => JSON.stringify(_sent)));
  ok('a second card change minutes later rests (one bell, not a string of them); ten minutes on it rings again', await page.evaluate(async () => { _clear(); const c = prefs.cards['oak house'];
    c.addr = '14 Oak St'; cardCommit(c); await new Promise(r => setTimeout(r, 120)); c.addr = '16 Oak St'; cardCommit(c); await new Promise(r => setTimeout(r, 120)); const n = _sent.length;
    _pushRestAt.card = Date.now() - 11 * 60000; c.addr = '18 Oak St'; cardCommit(c); await new Promise(r => setTimeout(r, 120)); return n === 1 && _sent.length === 2; }));
  ok('🚧 stuck and ⚠ FIRST on a Build List row ring the OFFICE crew (not the field); taking the mark off rings nobody', await page.evaluate(async () => { _clear();
    dbx.refreshToken = 't'; _portalIdx = { clients: [{ key: 'oak', job: 'Oak House', code: 'oak-111aaa' }] };
    window._dbxFiles = {}; window.dbxDownload = async p => (window._dbxFiles || {})[p] ?? null; window.dbxUpload = async (p, b) => { window._dbxFiles[p] = b; return {}; }; window.dbxPathExists = async p => Object.prototype.hasOwnProperty.call(window._dbxFiles, p);
    _dbxFiles[portalRoot() + '/materials-office-oak-111aaa.json'] = JSON.stringify({ full: true, seq: 3, rooms: [{ name: 'EXTERIOR', items: [{ id: 'a1', n: 'Soffit', t: 'Misc', buy: true, s: 'pick' }, { id: 'a2', n: 'Fascia', t: 'Misc', buy: true, s: 'pick' }] }] });
    window.scheduleMatSave = () => {}; await openMaterials(0);
    matStuckToggle('a1'); const a = _sent.slice(); matStuckToggle('a1'); const off = _sent.length; _pushRestAt.stuck = 0; matFirstToggle('a2'); const b = _sent.slice(); matFirstToggle('a2');
    matClose();
    return a.length === 1 && a[0].kind === 'stuck' && JSON.stringify(a[0].to) === '["Phil","Ann"]' && off === 1 && b.length === 2 && b[1].kind === 'stuck' && _sent.length === 2 && !/Soffit|Fascia|Oak/.test(JSON.stringify(_sent)); }), await page.evaluate(() => JSON.stringify(_sent)));
  ok('📐 a new plan set rings the whole crew from Eric\'s phone (the door is in pkStamp, after the set is saved)', /await pkSave\(\);\s+renderPlanRack\(\);\s+pushOut\('plans', false, '', '', 'crew-plans', 'crew'\);/.test(src) && await page.evaluate(() => { _clear(); return pushOut('plans', false, '', '', 'crew-plans', 'crew') === true && _sent[0].kind === 'plans' && _sent[0].to.length === 3; }));
  ok('no push secret on his phone = nothing is sent, and ⑤ UNLOCK IT says what ⚠ and an unlocked note do about ringing — with the secret and without', await page.evaluate(() => { _clear(); const t1 = ($('visExplain') || { textContent: '' }).textContent; renderVisChips(); const withS = $('visExplain').textContent;
    prefs.pushSecret = ''; renderVisChips(); const r = pushOut('eric', false, '', '', 'x', 'crew'); const noS = $('visExplain').textContent; prefs.pushSecret = 'made-up-secret'; renderVisChips();
    return r === false && _sent.length === 0 && /rings their phones, each in his own hours/.test(withS) && /A note you unlock rings them too, as "From Eric"/.test(withS) && /their phones ring once the push secret is in/.test(noS) && !/cannot ring their phone yet/.test(withS + noS + t1); }));
  ok('⚙ Setup → 🔔 Notifications shows WHO ON THE CREW IS SIGNED UP — read from each one\'s own folder: the phones, his hours, what he switched off; and who has not turned it on', await page.evaluate(async () => {
    const base = n => `${CREW_DIR}/${n}/App Data`; _dbxFiles = {};
    _dbxFiles[base('Phil') + '/push-subs.json'] = JSON.stringify([{ sub: {} }, { sub: {} }]); _dbxFiles[base('Phil') + '/push-settings.json'] = JSON.stringify({ win: { from: 6, to: 18 }, kinds: { board: false }, urgent: false });
    _dbxFiles[base('Ann') + '/push-subs.json'] = JSON.stringify([{ sub: {} }]);
    _ntCrew = null; _ntCrewAt = 0; renderPushSetup(); await new Promise(r => setTimeout(r, 200));
    const row = n => (document.querySelector(`#ntCrewBox .nt-crew-row[data-who="${n}"]`) || { textContent: '' }).textContent.replace(/\s+/g, ' ').trim();
    return /^Phil · office — ✓ SIGNED UP — 2 phones · rings 6 AM – 6 PM · 1 alert switched off$/.test(row('Phil')) && /^Kevin — ○ NOT SIGNED UP YET — nothing can ring this phone$/.test(row('Kevin')) && /^Ann · office — ✓ SIGNED UP — 1 phone · rings 7 AM – 8 PM$/.test(row('Ann')) &&
      /Each of them turns it on ONCE, on his own phone/.test($('ntBox').textContent) && [...document.querySelectorAll('#ntBox .nt-row')].length === 5; }), await page.evaluate(() => ($('ntCrewBox') || { textContent: 'no box' }).textContent.replace(/\s+/g, ' ')));
  ok('his own alerts are as they were: a push with no "to" still answers to HIS switches', await page.evaluate(() => { _clear(); prefs.pushWin = { from: 0, to: 0 }; prefs.pushKinds = { weather: false }; prefs.pushUrgent = false; const a = pushOut('weather', false, 'w', 'x', 'weather'), b = pushOut('bill', false, '💳', 'x', 'bill-due');
    return a === false && b === true && _sent.length === 1 && _sent[0].title === '💳' && !('to' in _sent[0]); }));
  ok('the two lists agree: the app\'s crew alerts are the cloud\'s nine kinds, and the same three are office-only', await page.evaluate(() => JSON.stringify([PUSH_KINDS_CREW.map(r => r[0]).sort(), PUSH_KINDS_CREW.filter(r => r[7] === 'office').map(r => r[0])])) === JSON.stringify([Object.keys(C.CREW_WORDS).sort(), C.OFFICE_KINDS]));
  await eric.ctx.close();

  console.log('— 👷 a crew phone —');
  const crewPhone = (name, office, extra) => open(new Function(`try { localStorage.setItem('daylog-crew-name', '${name}'); localStorage.setItem('daylog-crew-root', '/${name}'); localStorage.setItem('daylog-crew-jobs', JSON.stringify(['Oak House'])); localStorage.setItem('daylog-crew-office', '${office ? '1' : ''}'); ${extra || ''} } catch (e) {}`));
  const rowsOf = p => p.evaluate(() => { openPanel('settings'); renderPushSetup(); return [...document.querySelectorAll('#ntBox .nt-row')].map(r => ({ k: r.dataset.kind, only: r.dataset.only || '', sw: r.querySelector('.nt-sw').textContent.replace(/\s+/g, ' ').trim(), from: r.querySelector('.nt-from').textContent.trim(), st: r.querySelector('.nt-state').textContent.trim() })); });
  const kevin = await crewPhone('Kevin', false, `localStorage.setItem('daylog-push-secret', 'made-up-secret');`);
  const kr = await rowsOf(kevin.page);
  ok('a field phone has six alerts of its own, each a switch — no office ones, none of Eric\'s (texts, email, bills, weather)', kr.map(r => r.k).join() === 'ask,eric,reply,board,card,plans' && kr.every(r => /^✓ ON — /.test(r.sw)) && /⚠ Eric needs an answer/.test(kr[0].sw) && !kr.some(r => /office/.test(r.sw)) && kr.every(r => /Eric's phone/.test(r.from)), JSON.stringify(kr));
  ok('not signed up yet, every row says so in words — and where to turn it on', kr.every(r => /^○ NOT YET — this phone is not signed up \(Turn on notifications, above\)$/.test(r.st)) && await kevin.page.evaluate(() => /not signed up yet|cannot ring|blocked/i.test(document.querySelector('#ntBox .nt-phone').textContent)), JSON.stringify(kr.map(r => r.st)));
  ok('no push-secret box, no list of the crew\'s phones, and the foot says this phone rings by ITS OWN hours and switches', await kevin.page.evaluate(() => { const t = $('ntBox').textContent; return !$('ntSecret') && !$('ntCrewBox') && /This phone rings by YOUR hours and YOUR switches/.test(t) && !/nothing rings this phone yet/.test(t) && /nothing on a lock screen ever names a job, a person or a dollar amount/.test(t); }));
  ok('a crew phone never sends a push for the crew — its pushes are for Eric, as before', await kevin.page.evaluate(() => { window._sent = []; const f0 = window.fetch; window.fetch = (u, init) => { if (/functions\/notify/.test(String(u))) { _sent.push(JSON.parse(init.body)); return Promise.resolve(new Response('{}')); } return f0(u, init); };
    const a = pushOut('plans', false, '', '', 'x', 'crew'), b = pushOut('crew', true, '🔥 needs it NOW', 'Open Boiler Room', 'crew-now'); return a === false && b === true && _sent.length === 1 && !('to' in _sent[0]) && pushNames('crew').length === 0; }));
  await kevin.ctx.close();

  const signedUp = `localStorage.setItem('daylog-push-secret', 'made-up-secret'); Object.defineProperty(Notification, 'permission', { get: () => 'granted' });`;
  const phil = await crewPhone('Phil', true, signedUp);
  const pr = await rowsOf(phil.page);
  ok('an office phone has all nine — the last three marked 🏢 office, two of them sent by the cloud on its own', pr.map(r => r.k).join() === 'ask,eric,reply,board,card,plans,journal,client,stuck' && pr.filter(r => r.only === 'office').map(r => r.k).join() === 'journal,client,stuck' && pr.slice(6).every(r => /· 🏢 office$/.test(r.sw)) &&
    /cloud on its own clock/.test(pr[6].from) && /the moment the homeowner's page saves it/.test(pr[7].from) && /Eric's phone/.test(pr[8].from), JSON.stringify(pr.map(r => [r.k, r.sw, r.from])));
  ok('signed up, with the secret handed over: every row RINGS, in this phone\'s own hours', pr.every(r => /^✓ RINGS 7 AM – 8 PM$/.test(r.st)) && await phil.page.evaluate(() => /✓ This phone is signed up to ring/.test(document.querySelector('#ntBox .nt-phone').textContent)), JSON.stringify(pr.map(r => r.st)));
  ok('a switch, the hours and only-urgent are this phone\'s own: they go up to ITS folder for the cloud door to read — and Eric\'s mail rules are never written from here', await phil.page.evaluate(async () => {
    window.scheduleSave = () => {}; dbx.refreshToken = 'tok'; window._up = {}; window.dbxUpload = async (p, b) => { _up[p] = b; return {}; };
    [...document.querySelectorAll('#ntBox .nt-row')].find(r => r.dataset.kind === 'board').querySelector('.nt-sw').click();
    $('ntFrom').value = '6'; $('ntFrom').dispatchEvent(new Event('change')); document.querySelector('#ntBox .nt-urg').click();
    await new Promise(r => setTimeout(r, 1000));
    const s = JSON.parse(_up[DBX_ROOT + '/App Data/push-settings.json'] || '{}'), rows = [...document.querySelectorAll('#ntBox .nt-row')].map(r => [r.dataset.kind, r.querySelector('.nt-state').textContent.trim()]);
    const g = k => (rows.find(r => r[0] === k) || [])[1];
    return DBX_ROOT === '/Phil' && s.kinds.board === false && s.win.from === 6 && s.win.to === 20 && s.urgent === true && typeof s.tz === 'string' && Object.keys(_up).join() === '/Phil/App Data/push-settings.json' &&
      g('board') === '○ OFF — never rings' && g('ask') === '✓ RINGS 6 AM – 8 PM' && /^🔕 QUIET/.test(g('eric')) && /^🔕 QUIET/.test(g('journal')); }), await phil.page.evaluate(() => JSON.stringify(window._up)));
  await phil.ctx.close();
  const ann = await crewPhone('Ann', true, `Object.defineProperty(Notification, 'permission', { get: () => 'granted' });`);
  const ar = await rowsOf(ann.page);
  ok('signed up, but Eric has not put the secret in: what HIS phone sends cannot ring yet, and the row says what he has to do; what the cloud sends on its own rings', ar.filter(r => /^⚠ CANNOT RING YET — Eric has not put the push secret in/.test(r.st)).map(r => r.k).join() === 'ask,eric,reply,board,card,plans,stuck' && ar.filter(r => /^✓ RINGS/.test(r.st)).map(r => r.k).join() === 'journal,client', JSON.stringify(ar.map(r => [r.k, r.st])));
  ok('at 390px the section does not run off the side', await ann.page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth && $('ntBox').scrollWidth <= $('ntBox').clientWidth + 1));
  await ann.ctx.close();

  ok('version bumped — APP_VER and the footer agree', /const APP_VER = 'v7\.(4[7-9]|[5-9]\d)'/.test(src) && new RegExp('<footer>' + (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1].replace('.', '\\.') + ' ·').test(src));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
