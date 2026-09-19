// 🐢📦 v6.92 — WHEN DROPBOX SAYS SLOW DOWN. The first real catch-up (2026-09-18, 21:10) logged about forty texts and
// stalled: a sweep fired its twenty archive moves at once, Dropbox refused most of them ("too_many_write_operations" —
// 13 of 40 moved), and the pushback stopped the chain with 295 files still waiting. Moves go one at a time now, every
// Dropbox call waits and asks again on a 429, and the catch-up does a round over instead of giving up.
// Every name and word below is made up.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { fileURLToPath } = require('url');
(async () => {
  const appUrl = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const repo = path.dirname(fileURLToPath(appUrl));
  const src = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
  await page.goto(appUrl); await page.waitForTimeout(700);
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };

  console.log('— 🐢 v6.92 a 429 waits and asks again —');

  ok('dbxRpc, dbxDownload and dbxUpload each wait and ask again when Dropbox answers 429 — three times at most, then the answer is handed up as it is', await page.evaluate(async () => {
    window.getToken = async () => 'x'; window._dbxBackoffMs = 5;
    const realFetch = window.fetch; const calls = { rpc: 0, dl: 0, up: 0 }; let always = false;
    const slow = () => ({ status: 429, ok: false, headers: { get: () => '0' }, clone() { return this; }, json: async () => ({ error_summary: 'too_many_write_operations/..', error: { retry_after: 0 } }), text: async () => 'slow down' });
    window.fetch = async (u, init) => {
      u = String(u);
      if (/api\.dropboxapi\.com\/2\/files\/move_v2/.test(u)) { calls.rpc++; return always || calls.rpc < 3 ? slow() : { status: 200, ok: true, json: async () => ({ metadata: { path_lower: '/x' } }) }; }
      if (/content\.dropboxapi\.com\/2\/files\/download/.test(u)) { calls.dl++; return calls.dl < 2 ? slow() : { status: 200, ok: true, text: async () => 'FROM: Dale Example\nwords' }; }
      if (/content\.dropboxapi\.com\/2\/files\/upload/.test(u)) { calls.up++; return calls.up < 3 ? slow() : { status: 200, ok: true, json: async () => ({ name: 'f' }) }; }
      return realFetch(u, init);
    };
    const a = await dbxRpc('files/move_v2', { from_path: '/a', to_path: '/b' });
    const b = await dbxDownload('/clore daylog/inbox/t.txt');
    const c = await dbxUpload('/clore daylog/app data/x.json', '{}');
    const first = !!(a && a.metadata) && calls.rpc === 3 && b === 'FROM: Dale Example\nwords' && calls.dl === 2 && !!c && calls.up === 3;
    always = true; calls.rpc = 0; const d = await dbxRpc('files/move_v2', { from_path: '/a', to_path: '/b' });
    window.fetch = realFetch;
    return first && calls.rpc === 4 && /too_many_write_operations/.test(String(d.error_summary));
  }));

  await page.evaluate(() => {
    jobs = ['Mery']; curJob = ''; crew = ['Phil']; entries = []; todos = []; nextId = 1; pendingQueue = [];
    prefs.mailOk = []; prefs.mailNo = []; prefs.mailAsk = []; prefs.mailLoud = []; prefs.mailHush = []; prefs.mailPersonal = []; prefs.mailIgnored = []; prefs.pushSecret = '';
    window.scheduleSave = () => {}; window.savePendingSoon = () => {}; window.publishSharedNotes = () => {}; lsDel('daylog-sweep-last'); window._sweepLast = null;
    renderJobSelects(); closePanels(); renderAll();
    const F = window._fake = { files: [], log: [], flying: 0, maxFlying: 0, moveMs: 8, moveErr: null, listErrAt: [], lists: 0, band: [], lease: [] };
    F.text = (name, words, at) => ({ name, path_lower: '/clore daylog/inbox/' + name.toLowerCase(), server_modified: at || new Date().toISOString(), txt: 'FROM: Dale Example\n' + words });
    F.reset = () => { F.files = []; F.log = []; F.flying = 0; F.maxFlying = 0; F.moveMs = 8; F.moveErr = null; F.listErrAt = []; F.lists = 0; F.band = []; F.lease = [];
      entries = []; nextId = 1; pendingQueue = []; window._sweepLast = null; window._sweepChainOff = false; window._sweepGap = 15; window._sweepRetryGap = 25; };
    dbx.refreshToken = 'x'; window.getToken = async () => 'x';
    window.dbxUpload = async (p, b) => { if (/sweep-lease\.json$/.test(String(p))) F.lease.push(JSON.parse(b)); return {}; };
    window.dbxDownload = async p => { const f = F.files.find(f => f.path_lower === String(p).toLowerCase()); return f ? f.txt : null; };
    window.dbxRpc = async (ep, arg) => {
      if (ep === 'files/list_folder') { F.lists++; F.log.push('list'); if (F.listErrAt.includes(F.lists)) return { error_summary: 'too_many_requests/..' };
        return { entries: F.files.map(f => ({ '.tag': 'file', name: f.name, path_lower: f.path_lower, server_modified: f.server_modified })), has_more: false }; }
      if (ep === 'files/move_v2') {
        F.flying++; F.maxFlying = Math.max(F.maxFlying, F.flying); await new Promise(r => setTimeout(r, F.moveMs)); F.flying--; F.log.push('move');
        if (typeof F.moveErr === 'function' ? F.moveErr(arg) : F.moveErr) return { error_summary: 'too_many_write_operations/..' };
        F.files = F.files.filter(f => f.path_lower !== String(arg.from_path).toLowerCase()); return { metadata: { path_lower: String(arg.to_path).toLowerCase() } };
      }
      return {};
    };
    const bs = busyShow; window.busyShow = w => { F.band.push(String(w)); return bs(w); };
    window._settle = async () => { for (let i = 0; i < 600; i++) { await new Promise(r => setTimeout(r, 25)); if (!_sweepBusy && !_sweepNext) return true; } return false; };
  });

  console.log('— 📦 v6.92 one move at a time —');

  const r1 = await page.evaluate(async () => {
    const F = window._fake; F.reset();
    for (let i = 1; i <= 25; i++) F.files.push(F.text(`TEXT -Sep 17, 2026 at 2_${10 + i} PM.txt`, `Plain words number ${i} about the siding.`, new Date(Date.now() - i * 60000).toISOString()));
    await checkInboxTexts(); await window._settle();
    const secondList = F.log.indexOf('list', 1), movesBefore = F.log.slice(0, secondList).filter(x => x === 'move').length;
    return { maxFlying: F.maxFlying, logged: entries.filter(e => e.texted).length, inbox: F.files.length, lists: F.lists, movesBefore, band: ($('busyBand') || {}).textContent || '' };
  });
  ok('twenty-five texts: never two moves in the air at once, every file filed and out of the Inbox', r1.maxFlying === 1 && r1.logged === 25 && r1.inbox === 0, JSON.stringify(r1));
  ok('the catch-up waits for its moves: all twenty of round one are done BEFORE the Inbox is listed again', r1.movesBefore === 20 && r1.lists === 2 && /CAUGHT UP/.test(r1.band), JSON.stringify(r1));

  ok('a move Dropbox refuses is NOT counted as moved — the file is tried again on the next sweep and is never logged twice; "not found" means another device already moved it', await page.evaluate(async () => {
    const F = window._fake; F.reset(); window._sweepChainOff = true;
    F.files = [F.text('TEXT -Sep 18, 2026 at 9_01 AM.txt', 'A move that is refused the first time.')];
    F.moveErr = true; await checkInboxTexts(); await arcDrain();
    const stuck = F.files.length === 1 && entries.filter(e => e.texted).length === 1;
    const a = await archiveTextNow('/clore daylog/inbox/x.txt');
    F.moveErr = null; await checkInboxTexts(); await arcDrain();
    const healed = F.files.length === 0 && entries.filter(e => e.texted).length === 1;
    const keep = window.dbxRpc; window.dbxRpc = async () => ({ error_summary: 'from_lookup/not_found/..' }); const gone = await archiveTextNow('/clore daylog/inbox/y.txt'); window.dbxRpc = keep;
    return stuck && a === false && healed && gone === true;
  }));

  console.log('— 🐢 v6.92 a pushback in the middle of a catch-up —');

  const r2 = await page.evaluate(async () => {
    const F = window._fake; F.reset();
    for (let i = 1; i <= 45; i++) F.files.push(F.text(`TEXT -Sep 16, 2026 at 3_${10 + i} PM.txt`, `Catch-up words ${i} about the trim.`, new Date(Date.now() - i * 60000).toISOString()));
    F.listErrAt = [2];   // the second listing is refused: slow down
    await checkInboxTexts(); await window._settle();
    return { logged: entries.filter(e => e.texted).length, inbox: F.files.length, lists: F.lists, slow: F.band.some(w => /SLOW DOWN/.test(w)), band: ($('busyBand') || {}).textContent || '', err: (window._sweepLast || {}).err || '',
      leaseBack: F.lease.length > 0 && +new Date(F.lease[F.lease.length - 1].until) <= Date.now() };
  });
  ok('Dropbox says slow down on the second listing: the band says so, the round is done over, and all forty-five are filed — the pushback is not the end of the catch-up', r2.logged === 45 && r2.inbox === 0 && r2.slow && r2.lists === 4 && !r2.err && /CAUGHT UP/.test(r2.band) && r2.leaseBack, JSON.stringify(r2));

  const r3 = await page.evaluate(async () => {
    const F = window._fake; F.reset();
    for (let i = 1; i <= 30; i++) F.files.push(F.text(`TEXT -Sep 15, 2026 at 4_${10 + i} PM.txt`, `Stuck words ${i}.`, new Date(Date.now() - i * 60000).toISOString()));
    F.listErrAt = [2, 3, 4, 5, 6, 7];
    await checkInboxTexts(); await window._settle(); renderTextDigest();
    const line = (document.querySelector('#txtDigest .sweep-line') || {}).textContent || '';
    return { logged: entries.filter(e => e.texted).length, lists: F.lists, band: ($('busyBand') || {}).textContent || '', line, leaseBack: F.lease.length > 0 && +new Date(F.lease[F.lease.length - 1].until) <= Date.now() };
  });
  ok('it is bounded: three do-overs, then it stops, says so in words (the band and the line under the meter), and hands the lease back — the next sync goes on', r3.logged === 20 && r3.lists === 5 && /STOPPED/.test(r3.band) && /FAILED/.test(r3.line) && /too_many_requests/.test(r3.line) && r3.leaseBack, JSON.stringify(r3));

  ok('the source: one line for the moves, a 429 handled in all three Dropbox calls', (() => {
    return /let _arcLine = Promise\.resolve\(\);/.test(src) && (src.match(/r\.status === 429 && i < 3/g) || []).length === 3 && /await Promise\.race\(\[arcDrain\(\)/.test(src);
  })());

  ok('nothing runs off the right edge of the main page', await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth));
  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v6.92') && document.querySelector('footer').textContent.includes(APP_VER);
  }));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
