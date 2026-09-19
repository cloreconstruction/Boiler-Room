// 📄📥 v6.90 — THE INBOX LISTING COMES IN PAGES. Eric, 2026-09-18, a picture of the line under the text meter:
// "Inbox sweep just now: 0 in the Inbox · 0 texts and 0 emails filed" — while 336 files sat in that folder and had since
// 09-14. Dropbox answers a folder listing in PAGES, and a page may hold nothing at all while has_more is true; the app
// (and the cloud mail watcher) read page one and stopped. Half of this suite is the app in a phone-sized browser with a
// fake Dropbox that pages like the real one; half is the Netlify watcher run in node with fetch stubbed.
// Every name, number and word below is made up.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { fileURLToPath } = require('url');
(async () => {
  const appUrl = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const repo = path.dirname(fileURLToPath(appUrl));
  const src = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
  const fn = fs.readFileSync(path.join(repo, 'fnsrc', 'mail-watch.mjs'), 'utf8');
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
  await page.goto(appUrl); await page.waitForTimeout(700);
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };

  await page.evaluate(() => {
    jobs = ['Mery', 'Oak Street']; curJob = ''; crew = ['Phil']; entries = []; todos = []; nextId = 1; pendingQueue = [];
    prefs.mailOk = []; prefs.mailNo = []; prefs.mailAsk = []; prefs.mailLoud = []; prefs.mailHush = []; prefs.mailPersonal = []; prefs.mailIgnored = []; prefs.pushSecret = '';
    window.scheduleSave = () => {}; window.savePendingSoon = () => {}; window.publishSharedNotes = () => {}; lsDel('daylog-sweep-last'); window._sweepLast = null;
    renderJobSelects(); closePanels(); renderAll();
    // a fake Dropbox that PAGES: `lead` empty pages (has_more true) come before the one that holds the files
    const F = window._fake = { files: [], lead: 0, stuck: false, failAt: -1, endless: false, listCalls: 0, contCalls: 0, firstArgs: null, contArgs: [], dl: {}, band: [], rings: 0, lease: [] };
    F.page = i => {
      if (F.endless) return { entries: [], cursor: 'c' + (i + 1), has_more: true };
      if (i === F.failAt) return { error_summary: 'too_many_requests/' };
      if (i < F.lead) return { entries: i === 1 ? [{ '.tag': 'folder', name: 'Text Photos', path_lower: '/clore daylog/inbox/text photos' }] : [], cursor: 'c' + (i + 1), has_more: true };
      return { entries: F.files.map(f => ({ '.tag': 'file', name: f.name, path_lower: f.path_lower, server_modified: f.server_modified })), cursor: 'c' + (i + 1), has_more: false };
    };
    F.text = (name, from, words, at) => ({ name, path_lower: '/clore daylog/inbox/' + name.toLowerCase(), server_modified: at || new Date().toISOString(), txt: 'FROM: ' + from + '\n' + words });
    F.reset = () => { F.files = []; F.lead = 0; F.stuck = false; F.failAt = -1; F.endless = false; F.listCalls = 0; F.contCalls = 0; F.firstArgs = null; F.contArgs = []; F.dl = {}; F.band = []; F.rings = 0; F.lease = [];
      entries = []; nextId = 1; pendingQueue = []; window._sweepLast = null; window._sweepChainOff = false; window._sweepGap = 20; };
    dbx.refreshToken = 'x'; window.getToken = async () => 'x'; window.dbxUpload = async (p, b) => { if (/sweep-lease.json$/.test(String(p))) F.lease.push(JSON.parse(b)); return {}; };
    window.dbxRpc = async (ep, arg) => {
      if (ep === 'files/list_folder') { F.listCalls++; F.firstArgs = arg; return F.page(0); }
      if (ep === 'files/list_folder/continue') { F.contCalls++; F.contArgs.push(arg); return F.page(+String(arg.cursor).slice(1)); }
      if (ep === 'files/move_v2') { if (!F.stuck) F.files = F.files.filter(f => f.path_lower !== String(arg.from_path).toLowerCase()); return { metadata: { path_lower: String(arg.to_path).toLowerCase() } }; }
      return {};
    };
    window.dbxDownload = async p => { const f = F.files.find(f => f.path_lower === String(p).toLowerCase()); if (f) F.dl[f.name] = (F.dl[f.name] || 0) + 1; return f ? f.txt : null; };
    const realFetch = window.fetch;
    window.fetch = async (u, init) => { if (/functions\/notify/.test(String(u))) { F.rings++; return { ok: true, json: async () => ({}) }; } return realFetch(u, init); };
    const bs = busyShow; window.busyShow = w => { F.band.push(String(w)); return bs(w); };
    window._settle = async () => { for (let i = 0; i < 400; i++) { await new Promise(r => setTimeout(r, 25)); if (!_sweepBusy && !_sweepNext) return true; } return false; };
  });

  console.log('— 📄 v6.90 the bug: page one of the listing is empty, the files are on a later page —');

  const r1 = await page.evaluate(async () => {
    const F = window._fake; F.reset(); F.lead = 3;
    F.files = [F.text('TEXT -Sep 18, 2026 at 5_20 PM.txt', 'Dale Example', 'The cedar came in, it looks fine.'), F.text('TEXT -Sep 18, 2026 at 6_38 PM.txt', 'Nora Sample', 'Thanks for the drawings.'), F.text('TEXT -Sep 18, 2026 at 8_00 PM.txt', 'Dale Example', 'Gate code is the same as last week.')];
    await checkInboxTexts(); await window._settle();
    const s = window._sweepLast || {}; renderTextDigest();
    const line = document.querySelector('#txtDigest .sweep-line');
    return { seen: s.seen, texts: s.texts, err: s.err || '', logged: entries.filter(e => e.texted).length, cont: F.contCalls, left: F.files.length, line: line ? line.textContent : '', lease: F.lease.length };
  });
  ok('three empty pages, then the files: the sweep follows the cursor — 3 in the Inbox, 3 texts filed, the Inbox emptied, and the line under the meter says so',
    r1.seen === 3 && r1.texts === 3 && !r1.err && r1.logged === 3 && r1.cont === 3 && r1.left === 0 && r1.lease === 0 && /3 in the Inbox · 3 texts and 0 emails brought into your log/.test(r1.line), JSON.stringify(r1));

  const r2 = await page.evaluate(async () => {
    const F = window._fake; F.reset(); F.lead = 2; F.files = [F.text('TEXT -Sep 17, 2026 at 9_55 AM.txt', 'Dale Example', 'x')];
    const r = await dbxList({ path: '/Clore DayLog/Inbox', recursive: false });
    const refused = await (async () => { const keep = window.dbxRpc; window.dbxRpc = async () => ({ error_summary: 'path/not_found/..' }); const e = await dbxList({ path: '/nope' }); window.dbxRpc = keep; return e; })();
    return { n: r.entries.length, tags: r.entries.map(e => e['.tag']).join(','), more: r.has_more, pages: r.pages, first: F.firstArgs, cont: F.contArgs, refused };
  });
  ok('dbxList: the first call carries the caller\'s words and asks for big pages; every next call carries ONLY the cursor; the answer has page one\'s shape with everything in it',
    r2.n === 2 && r2.tags === 'folder,file' && r2.more === false && r2.pages === 3 && r2.first.path === '/Clore DayLog/Inbox' && r2.first.recursive === false && r2.first.limit === 2000 &&
    r2.cont.length === 2 && r2.cont.every(a => Object.keys(a).join() === 'cursor') && r2.cont[0].cursor === 'c1' && r2.cont[1].cursor === 'c2', JSON.stringify(r2));
  ok('a refused listing still comes back as Dropbox\'s own error — the sweep keeps saying it in words', /path\/not_found/.test(String((r2.refused || {}).error_summary)) && !Array.isArray((r2.refused || {}).entries));

  const r3 = await page.evaluate(async () => {
    const F = window._fake; F.reset(); F.endless = true;
    const t0 = Date.now(); const r = await dbxList({ path: '/x' }, 6); const capped = { pages: r.pages, partial: r.partial || '', n: r.entries.length, ms: Date.now() - t0 };
    F.reset(); F.lead = 4; F.failAt = 2; F.files = [F.text('TEXT -Sep 17, 2026 at 5_12 PM.txt', 'Dale Example', 'x')];
    await checkInboxTexts(); await window._settle(); renderTextDigest();
    const s = window._sweepLast || {}, line = document.querySelector('#txtDigest .sweep-line');
    return { capped, part: s.part || '', err: s.err || '', line: line ? line.textContent : '' };
  });
  ok('it is bounded: a cursor that never ends stops at the page cap and says the listing was cut short', r3.capped.pages === 6 && /cut short/.test(r3.capped.partial) && r3.capped.n === 0, JSON.stringify(r3.capped));
  ok('a page that fails part-way is not an empty Inbox: the sweep keeps what it has and the line says the listing was cut short, and why', /too_many_requests/.test(r3.part) && !r3.err && /listing was cut short/.test(r3.line) && /too_many_requests/.test(r3.line), JSON.stringify(r3));

  ok('every folder listing in the app goes through dbxList — page one alone is never trusted again', (() => {
    const raw = (src.match(/dbxRpc\('files\/list_folder'/g) || []).length, cont = (src.match(/dbxRpc\('files\/list_folder\/continue'/g) || []).length, used = (src.match(/await dbxList\(/g) || []).length;
    return raw === 1 && cont === 1 && used >= 10;
  })());

  console.log('— 📥 v6.90 catching up on a backlog —');

  const r4 = await page.evaluate(async () => {
    const F = window._fake; F.reset(); F.lead = 1;
    for (let i = 1; i <= 45; i++) F.files.push(F.text(`TEXT -Sep ${10 + (i % 8)}, 2026 at ${1 + (i % 11)}_${10 + i} PM n${i}.txt`, i % 2 ? 'Dale Example' : 'Nora Sample', `Note number ${i}: the siding sample is on the porch.`, new Date(Date.now() - i * 3600e3).toISOString()));
    await checkInboxTexts();
    const afterOne = { logged: entries.filter(e => e.texted).length, left: (window._sweepLast || {}).left, next: !!_sweepNext };
    const settled = await window._settle();
    const texts = entries.filter(e => e.texted), s = window._sweepLast || {};
    return { afterOne, settled, logged: texts.length, unique: new Set(texts.map(e => e.details)).size, inbox: F.files.length, lists: F.listCalls, left: s.left, band: F.band.filter(w => /CATCHING UP/.test(w)).length, bandWords: F.band.find(w => /CATCHING UP/.test(w)) || '', bandNow: ($('busyBand') || {}).textContent || '',
      days: new Set(texts.map(e => localDay(new Date(e.ts)))).size,
      lease: { n: F.lease.length, devs: new Set(F.lease.map(l => l.dev)).size, dev: (F.lease[0] || {}).dev || '', firstAhead: +new Date((F.lease[0] || {}).until) - Date.now() > 30000, lastBack: +new Date((F.lease[F.lease.length - 1] || {}).until) <= Date.now() } };
  });
  ok('45 texts waiting: one sweep files 20 and says 25 are left — then the next sweeps follow by themselves until the Inbox is clear',
    r4.afterOne.logged === 20 && r4.afterOne.left === 25 && r4.afterOne.next === true && r4.settled && r4.logged === 45 && r4.inbox === 0 && r4.lists === 3 && !r4.left, JSON.stringify(r4));
  ok('nothing is filed twice, every text keeps the day it arrived, and the working band says CATCHING UP with how many are left, then that it is caught up',
    r4.unique === 45 && r4.days > 1 && r4.band >= 2 && /CATCHING UP ON THE INBOX — 25 LEFT/.test(r4.bandWords) && /CAUGHT UP/.test(r4.bandNow), JSON.stringify(r4));

  ok('🔑 the device that catches up takes a lease (one device id, ninety seconds ahead), renews it every round and hands it back when the Inbox is clear',
    r4.lease.n >= 3 && r4.lease.devs === 1 && /^[a-z0-9]{6,10}$/.test(r4.lease.dev) && r4.lease.firstAhead && r4.lease.lastBack, JSON.stringify(r4.lease));

  const r5 = await page.evaluate(async () => {
    const F = window._fake; F.reset(); F.stuck = true;
    for (let i = 1; i <= 30; i++) { const f = F.text(`TEXT -Sep 12, 2026 at 1_${10 + i} PM.txt`, 'Dale Example', 'old ' + i); F.files.push(f); pendMarkDone('text:' + f.name); }
    await checkInboxTexts(); await new Promise(r => setTimeout(r, 300)); await window._settle();
    const stuck = { lists: F.listCalls, logged: entries.filter(e => e.texted).length };
    F.reset(); F.files = [F.text('TEXT -Sep 18, 2026 at 2_02 PM.txt', 'Dale Example', 'Just the one.')];
    const a = checkInboxTexts(), b = checkInboxTexts(); await Promise.all([a, b]); await window._settle();
    return { stuck, once: { lists: F.listCalls, logged: entries.filter(e => e.texted).length } };
  });
  ok('a round that files nothing ends the chain (thirty handled files that will not move: ONE listing, not a loop)', r5.stuck.lists === 1 && r5.stuck.logged === 0, JSON.stringify(r5.stuck));
  ok('one sweep at a time: two calls in the same breath are one listing and one entry', r5.once.lists === 1 && r5.once.logged === 1, JSON.stringify(r5.once));

  const r6 = await page.evaluate(async () => {
    const F = window._fake; F.reset(); window._sweepChainOff = true;
    for (let i = 1; i <= 25; i++) F.files.push(F.text(`TEXT -Sep 16, 2026 at 3_${10 + i} PM.txt`, 'Nora Sample', `Plain words ${i} about the trim colour.`));
    F.files.push({ name: 'Email -Bid for the porch.txt', path_lower: '/clore daylog/inbox/email -bid for the porch.txt', server_modified: new Date().toISOString(), txt: 'FROM: Pat Bidder <pat@bidder.example>\nSUBJECT: Bid for the porch\n\nHere is the number we talked about.' });
    await checkInboxTexts(); const one = { texts: entries.filter(e => e.texted).length, mails: entries.filter(e => e.mail).length, dl: F.dl['Email -Bid for the porch.txt'] || 0, next: !!_sweepNext };
    await checkInboxTexts(); await window._settle();
    return { one, texts: entries.filter(e => e.texted).length, mails: entries.filter(e => e.mail).length, dl: F.dl['Email -Bid for the porch.txt'] || 0 };
  });
  ok('an email waiting behind a pile of texts is downloaded ONCE, however many sweeps it waits through — and it is filed when its turn comes',
    r6.one.texts === 20 && r6.one.mails === 0 && r6.one.dl === 1 && r6.one.next === false && r6.texts === 25 && r6.mails === 1 && r6.dl === 1, JSON.stringify(r6));

  const r7 = await page.evaluate(async () => {
    const F = window._fake; F.reset(); prefs.pushSecret = 's';
    F.files = [F.text('TEXT -Sep 14, 2026 at 7_15 AM.txt', 'Dale Example', 'Urgent - the inspector is coming tomorrow at 9am, need you there.', new Date(Date.now() - 4 * 86400e3).toISOString()),
      F.text('TEXT -Sep 18, 2026 at 7_40 PM.txt', 'Nora Sample', 'Urgent - the delivery truck is here right now, call me.', new Date().toISOString())];
    await checkInboxTexts(); await window._settle();
    const hot = pendingQueue.filter(p => p.kind === 'text' && p.payload && p.payload.hot);
    prefs.pushSecret = '';
    return { cards: hot.length, rings: F.rings };
  });
  ok('a hot text found four days late still pins its card, but only the fresh one rings the phone', r7.cards === 2 && r7.rings === 1, JSON.stringify(r7));

  const r8 = await page.evaluate(async () => {
    const F = window._fake; F.reset();
    F.files = [F.text('TEXT -Sep 18, 2026 at 3_03 PM.txt', 'Dale Example', 'Held while the other device works.')];
    const keepDl = window.dbxDownload; let leaseTxt = JSON.stringify({ dev: 'the-other-one', until: new Date(Date.now() + 60000).toISOString() });
    window.dbxDownload = async p => /sweep-lease.json$/.test(String(p)) ? leaseTxt : keepDl(p);
    await checkInboxTexts(); await window._settle(); renderTextDigest();
    const held = { lists: F.listCalls, logged: entries.filter(e => e.texted).length, line: (document.querySelector('#txtDigest .sweep-line') || {}).textContent || '' };
    leaseTxt = JSON.stringify({ dev: 'the-other-one', until: new Date(Date.now() - 1000).toISOString() });
    await checkInboxTexts(); await window._settle();
    const expired = { lists: F.listCalls, logged: entries.filter(e => e.texted).length };
    leaseTxt = '{ not json'; F.files = [F.text('TEXT -Sep 18, 2026 at 3_09 PM.txt', 'Nora Sample', 'A lease file that cannot be read stops nothing.')];
    await checkInboxTexts(); await window._settle();
    const junk = { logged: entries.filter(e => e.texted).length };
    window.dbxDownload = keepDl;
    return { held, expired, junk };
  });
  ok('🔑 another device holds the lease → this one does not sweep, and the line says it waits its turn; an expired lease or one that cannot be read stops nothing',
    r8.held.lists === 0 && r8.held.logged === 0 && /another of your devices is bringing the texts in/.test(r8.held.line) && r8.expired.lists === 1 && r8.expired.logged === 1 && r8.junk.logged === 2, JSON.stringify(r8));

  console.log('— ☁ v6.90 the cloud watcher reads every page too —');

  const bundle = 'file:///' + path.join(repo, 'netlify', 'functions', 'mail-watch.mjs').replace(/\\/g, '/');
  const mod = await import(bundle);
  const ENV = { ANTHROPIC_API_KEY: 'k', DBX_REFRESH_TOKEN: 'r', DBX_APP_KEY: 'a' };
  const RULES = { v: 1, sort: true, ok: [], no: [], loud: [], hush: [], personal: [], personalNames: [], quiet: { from: '20:00', to: '07:00' } };
  const mkHarness = (opts = {}) => {
    const files = opts.files || [];
    const state = { judgedWritten: null, anthropic: [], downloads: [], lists: [], pushes: 0 };
    const meta = f => ({ '.tag': 'file', name: f.name, path_lower: '/clore daylog/inbox/' + f.name.toLowerCase(), server_modified: f.at || '2026-09-18T19:00:00Z' });
    const pageOf = i => opts.endless ? { entries: [], cursor: 'c' + (i + 1), has_more: true }
      : i < (opts.lead || 0) ? { entries: [], cursor: 'c' + (i + 1), has_more: true } : { entries: files.map(meta), cursor: 'c' + (i + 1), has_more: false };
    global.fetch = async (url, init = {}) => {
      const u = String(url);
      if (u.includes('oauth2/token')) return { ok: true, json: async () => ({ access_token: 't' }) };
      if (u.includes('files/list_folder/continue')) { const a = JSON.parse(init.body); state.lists.push(a); return { ok: true, json: async () => pageOf(+String(a.cursor).slice(1)) }; }
      if (u.includes('files/list_folder')) { state.lists.push(JSON.parse(init.body)); return { ok: true, json: async () => pageOf(0) }; }
      if (u.includes('files/download')) {
        const p = JSON.parse(init.headers['Dropbox-API-Arg']).path; state.downloads.push(p);
        if (/mail-rules\.json$/.test(p)) return { ok: true, text: async () => JSON.stringify(RULES) };
        if (/mail-judged\.json$/.test(p)) return { ok: true, text: async () => JSON.stringify(opts.judged || {}) };
        if (/push-subs\.json$/.test(p)) { state.pushes++; return { ok: true, text: async () => JSON.stringify([]) }; }
        const hit = files.find(f => f.name.toLowerCase() === p.split('/').pop());
        return hit ? { ok: true, text: async () => hit.txt } : { ok: false };
      }
      if (u.includes('files/upload')) { state.judgedWritten = JSON.parse(init.body); return { ok: true, json: async () => ({}) }; }
      if (u.includes('api.anthropic.com')) { state.anthropic.push(JSON.parse(init.body)); return { ok: true, json: async () => ({ content: [{ text: JSON.stringify(opts.verdict || { bucket: 'maybe', why: 'other', gist: '' }) }] }) }; }
      return { ok: false };
    };
    return state;
  };
  const mail = (name, subj, body, at) => ({ name, at, txt: `FROM: Pat Bidder <pat@bidder.example>\nSUBJECT: ${subj}\n\n${body}` });
  const NOON = new Date('2026-09-18T20:00:00Z');   // noon in Alaska — not quiet hours

  ok('the watcher: two empty pages, then the email — it follows the cursor, judges it, and its first call asks for big pages', await (async () => {
    const st = mkHarness({ lead: 2, files: [mail('Email -Bid.txt', 'Bid', 'the number')] });
    const r = await mod.run({ env: ENV, now: NOON });
    return r.ok === true && r.seen === 1 && r.judged === 1 && !!st.judgedWritten['Email -Bid.txt'] && st.lists.length === 3 && st.lists[0].limit === 2000 && st.lists[0].recursive === false &&
      Object.keys(st.lists[1]).join() === 'cursor' && st.lists[2].cursor === 'c2';
  })());

  ok('the watcher is bounded too: a cursor that never ends stops at its page cap and the run still finishes', await (async () => {
    const st = mkHarness({ endless: true });
    const said = []; const r = await mod.run({ env: ENV, now: NOON, log: m => said.push(String(m)) });
    return r.ok === true && r.seen === 0 && st.lists.length <= 41 && st.lists.length >= 10 && /cut short/.test(said.join(' '));
  })());

  ok('emails go before texts, newest first; a file NAMED as a text is marked without being downloaded and does not use up the run', await (async () => {
    const files = [];
    for (let i = 1; i <= 30; i++) files.push({ name: `TEXT -Sep 15, 2026 at 1_${10 + i} PM.txt`, at: '2026-09-15T21:00:00Z', txt: 'FROM: Dale Example\nwords ' + i });
    for (let i = 1; i <= 10; i++) files.push(mail(`Email -m${i}.txt`, 'm' + i, 'x', `2026-09-${String(8 + i).padStart(2, '0')}T12:00:00Z`));
    const st = mkHarness({ files });
    const r = await mod.run({ env: ENV, now: NOON });
    const j = st.judgedWritten, mails = Object.keys(j).filter(k => /^Email/.test(k)).sort();
    return r.judged === 8 && st.anthropic.length === 8 && !st.downloads.some(p => /\/text -/.test(p)) && Object.keys(j).filter(k => /^TEXT/.test(k)).every(k => j[k].skip === 'text') && Object.keys(j).filter(k => /^TEXT/.test(k)).length === 30 &&
      mails.length === 8 && !j['Email -m1.txt'] && !j['Email -m2.txt'] && !!j['Email -m10.txt'] && !!j['Email -m3.txt'];
  })());

  ok('an important email found days late is judged and written down, but it does not ring; a fresh one does', await (async () => {
    const st = mkHarness({ files: [mail('Email -old.txt', 'Invoice', 'a bill', '2026-09-14T18:00:00Z')], verdict: { bucket: 'important', why: 'invoice', gist: 'A bill.' } });
    const r = await mod.run({ env: ENV, now: NOON });
    const a = r.important === 0 && st.judgedWritten['Email -old.txt'].bucket === 'important' && st.judgedWritten['Email -old.txt'].push === 'late' && st.pushes === 0;
    const st2 = mkHarness({ files: [mail('Email -new.txt', 'Invoice', 'a bill', '2026-09-18T18:30:00Z')], verdict: { bucket: 'important', why: 'invoice', gist: 'A bill.' } });
    const r2 = await mod.run({ env: ENV, now: NOON });
    return a && r2.important === 1 && st2.judgedWritten['Email -new.txt'].push === 'sent';
  })());

  ok('nothing but counts and fixed words can reach the Netlify log, and the shipped bundle carries the paging', (() => {
    const calls = (fn.match(/log\((.*?)\);/g) || []).join(' ');
    const b = fs.readFileSync(path.join(repo, 'netlify', 'functions', 'mail-watch.mjs'), 'utf8');
    return calls.length > 0 && !/m\.(who|addr|subj|body)|v\.gist|f\.name|row\./.test(calls) && /list_folder\/continue/.test(fn) && /list_folder\/continue/.test(b);
  })());

  ok('nothing runs off the right edge of the main page', await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth));
  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v6.90') && document.querySelector('footer').textContent.includes(APP_VER);
  }));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
