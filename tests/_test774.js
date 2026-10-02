// 💬 v7.74 — A NEW REPLY CANNOT BE MISSED. Eric, with Phil's words on his card ("I can't see your response by tapping. And I
// accidentally flushed."): "Does Phil's disappear if he flushes and I don't. Why wouldn't he see my response?" The note had not
// left Phil's card and the reply was on his phone — but a tap on the alert only opened the app at the top of the page. Now a
// note with words from the other side he has not answered comes FIRST on the card and says ↩ NEW REPLY, the fold counts them,
// a tap on the alert lands on it, and ⤵ Flush can be taken back. Names, jobs and words below are made up.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { fileURLToPath } = require('url');
(async () => {
  const appUrl = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const repo = path.dirname(fileURLToPath(appUrl));
  const src = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
  const sw = fs.readFileSync(path.join(repo, 'sw.js'), 'utf8');
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };
  const errs = [];
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await ctx.route(u => !/^file:/.test(u.href), r => r.abort());
  const page = await ctx.newPage();
  page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });

  // ---------------- Phil's phone ----------------
  console.log('— 💬 Phil\'s phone: WITH ERIC —');
  await page.goto(appUrl); await page.waitForTimeout(500);
  await page.evaluate(() => { localStorage.setItem('daylog-crew-name', 'Phil'); localStorage.removeItem('daylog-crew-office'); localStorage.removeItem('daylog-shared-flushed'); localStorage.setItem('daylog-dbx', JSON.stringify({ appKey: 'k', refreshToken: 'test-token', accessToken: 'a', expiresAt: Date.now() + 3600000 })); });
  const philBoot = async url => {
    await page.goto(url); await page.waitForTimeout(900);
    await page.evaluate(() => {
      window._saves = 0; window.scheduleSave = () => { window._saves++; }; window.savePendingSoon = () => {};
      window._dbxFiles = window._dbxFiles || {}; window._ups = [];
      window.dbxDownload = async p => (window._dbxFiles || {})[p] ?? null; window.dbxUpload = async p => { window._ups.push(p); return {}; };
      window.dbxList = async () => ({ entries: [] }); window.dbxRpc = async () => ({}); window.pushOut = () => false;
      if (!window._said) { window._said = []; const t0 = window.toast; window.toast = (m, g) => { if (m) _said.push(String(m)); return t0(m, g); }; }
      dbx.refreshToken = 'test-token';
      const m = n => new Date(Date.now() - n * 60000), iso = n => m(n).toISOString();
      jobs = ['Oak House', 'Pine Cabin']; todos = []; nextId = 100; prefs.thSeen = {}; prefs.crewShowN = '3'; prefs.crewFold = false; _crFEJob = ''; _crFETag = '';
      entries = [
        { id: 10, ts: m(3 * 1440), type: 'Note', details: 'Which stain for the deck?', job: 'Oak House', vis: 'Eric' },                      // an OLD plain note of his — Eric answered it five minutes ago
        { id: 11, ts: m(30), type: 'Note', details: 'Need the gate code', job: 'Oak House', vis: 'Eric', route: 'Eric', urg: 'now' },             // ⚠, no answer yet
        { id: 12, ts: m(1440), type: 'Note', details: 'Trim is short two sticks', job: 'Pine Cabin', vis: 'Eric' },                          // answered, and he answered back: nothing new
        { id: 13, ts: m(170), type: 'Note', details: '↩ Got it', job: 'Pine Cabin', vis: 'Eric', re: { owner: 'Phil', id: 12 } }];
      const notes = [201, 202, 203, 204, 205, 206].map((id, i) => ({ id, ts: iso(60 + i * 20), text: 'A plain note from Eric number ' + (i + 1), job: 'Oak House' }));
      notes.push({ id: 207, ts: iso(2 * 1440), text: 'Bring the long level tomorrow', job: 'Oak House' });
      notes.push({ id: 301, ts: iso(5), text: '↩ Use the walnut', job: 'Oak House', re: { owner: 'Phil', id: 10 } });
      notes.push({ id: 302, ts: iso(180), text: '↩ I will bring two', job: 'Pine Cabin', re: { owner: 'Phil', id: 12 } });
      notes.push({ id: 303, ts: iso(10), text: '↩ and the ladder', job: 'Oak House', re: { owner: 'Eric', id: 207 } });
      window._shared = { from: 'Eric', notes, todos: [], asks: [], seen: {} };
      window._put = () => { _dbxFiles[DBX_ROOT + '/shared.json'] = JSON.stringify(window._shared); }; _put();
      renderJobSelects(); closePanels(); renderAll();
    });
    await page.evaluate(async () => { await checkSharedNotes(); }); await page.waitForTimeout(150);
  };
  await philBoot(appUrl);
  const rows = () => page.evaluate(() => [...document.querySelectorAll('#crewSharedList .sum-row')].map(r => ({ t: r.textContent.replace(/\s+/g, ' ').trim(), nw: r.classList.contains('th-new'), th: r.dataset.th })));
  const fold = () => page.evaluate(() => $('crFoldBtn').textContent.trim());

  ok('a note with words from Eric he has not answered comes FIRST, whatever its age — his three-day-old note with the five-minute-old reply is inside the three the card shows (it sat ninth, below the fold); then ⚠, then newest', await (async () => {
    const r = await rows(), all = await page.evaluate(() => crewSharedRows().map(n => (n.own ? 'own' : 'eric') + n.id));
    return r.length === 3 && r.map(x => x.th).join('|') === 'Eric:207|Phil:10|Phil:11' && all.indexOf('own10') === 1 && all.indexOf('own12') > 3 && all.length === 10;
  })(), JSON.stringify(await rows()));
  ok('the row says so in words and wears an edge: ↩ NEW REPLY · … with Eric\'s words under it; a note with nothing new wears neither', await (async () => {
    const r = await rows();
    const css = await page.evaluate(() => { const n = document.querySelector('#crewSharedList .sum-row.th-new'), o = document.querySelector('#crewSharedList .sum-row:not(.th-new)'); return getComputedStyle(n).outlineStyle === 'solid' && getComputedStyle(o).outlineStyle !== 'solid' && !!n.querySelector('.th-newtag'); });
    return r[1].nw && /^↩ NEW REPLY · 📨 YOU → ERIC · Which stain for the deck\?/.test(r[1].t) && /↩ Eric .* Use the walnut/.test(r[1].t) && r[0].nw && /^↩ NEW REPLY · /.test(r[0].t) && /and the ladder/.test(r[0].t) && !r[2].nw && !/NEW REPLY/.test(r[2].t) && /⚠ NEEDS ERIC'S ATTENTION/.test(r[2].t) && css;
  })(), JSON.stringify(await rows()));
  ok('the fold counts them, open and folded: · ↩ 2 new replies', await (async () => {
    const a = await fold();
    await page.evaluate(() => { prefs.crewFold = true; renderCrewShared(); }); const b = await fold();
    await page.evaluate(() => { prefs.crewFold = false; renderCrewShared(); });
    return a === '▾ 📨 WITH ERIC — showing 3 of 10 · ↩ 2 new replies, tap to fold' && b === '▸ 📨 WITH ERIC — 10 notes · ↩ 2 new replies, tap to open';
  })(), await fold());
  ok('once he answers, the note is no longer new: it goes back to its place by age and the count drops to 1', await (async () => {
    await page.evaluate(() => { thRespondOpen('Phil', '10', 'Eric'); $('thT-Phil-10').value = 'Walnut it is'; thRespondSend('Phil', '10', 'Eric'); }); await page.waitForTimeout(120);
    const r = await rows(), all = await page.evaluate(() => crewSharedRows().map(n => (n.own ? 'own' : 'eric') + n.id));
    return r.map(x => x.th).join('|') === 'Eric:207|Phil:11|Eric:201' && all.indexOf('own10') === all.length - 1 && /· ↩ 1 new reply, tap to fold$/.test(await fold());
  })(), JSON.stringify({ rows: (await rows()).map(x => x.th), fold: await fold() }));

  console.log('— ⤵ a flush can be taken back —');
  ok('his own note flushed: it STAYS on his card (⤵ flushed by you ✓) until Eric flushes it too — and the toast offers Undo; Undo puts it back exactly as it was', await (async () => {
    await page.evaluate(() => thOwnFlush('11')); await page.waitForTimeout(100);
    const a = await page.evaluate(() => { const r = document.querySelector('#crewSharedList [data-th="Phil:11"]'); return { there: !!r, done: !!r && /⚙ you are done with it ✓/.test(r.textContent), stamp: !!entries.find(e => e.id === 11).threadDone, toast: $('toast').textContent, btn: !!$('toast').querySelector('button') }; });
    await page.evaluate(() => $('toast').querySelector('button').click()); await page.waitForTimeout(100);
    const b = await page.evaluate(() => { const r = document.querySelector('#crewSharedList [data-th="Phil:11"]'), e = entries.find(x => x.id === 11); return { plate: !!r && !!r.querySelector('.th-flush') && /⚙ Done with it/.test(r.textContent), stamp: 'threadDone' in e, seen: (prefs.thSeen || {})['Phil:11'] || '' }; });
    return a.there && a.done && a.stamp && /^⚙ Done with it ✓ — it leaves the card once they take it to the grinder too/.test(a.toast) && a.btn && b.plate && !b.stamp && !b.seen;
  })());
  ok('one of Eric\'s notes flushed to the grinder: a copy lands in his log — Undo takes the copy back out and the plate returns', await (async () => {
    const n0 = await page.evaluate(() => entries.length);
    await page.evaluate(() => thSharedFlush('201')); await page.waitForTimeout(100);
    const a = await page.evaluate(() => ({ n: entries.length, copy: entries.some(e => e.sharedRef === 201 && /^Eric: A plain note from Eric number 1/.test(e.details)), set: JSON.parse(localStorage.getItem('daylog-shared-flushed') || '[]').includes('201'), toast: $('toast').textContent }));
    await page.evaluate(() => $('toast').querySelector('button').click()); await page.waitForTimeout(100);
    const b = await page.evaluate(() => ({ n: entries.length, copy: entries.some(e => e.sharedRef === 201), set: JSON.parse(localStorage.getItem('daylog-shared-flushed') || '[]').includes('201'), plate: !!document.querySelector('#crewSharedList [data-th="Eric:201"] .th-flush') }));
    return a.n === n0 + 1 && a.copy && a.set && /^⚙ In your grinder ✓ — Eric sees you took it/.test(a.toast) && b.n === n0 && !b.copy && !b.set && b.plate;
  })());

  console.log('— 🔔 a tap on the alert lands on the note —');
  ok('the card folded, the page at the top, a window open — then Eric answers and Phil taps the alert: the window shuts, the newest is pulled, the card opens, and the note with the new words is in the middle of the screen, flashing', await (async () => {
    await page.evaluate(() => { prefs.crewFold = true; renderCrewShared(); openSchedule('*'); window.scrollTo(0, 0);
      window._shared.notes.push({ id: 304, ts: new Date().toISOString(), text: '↩ Two more sticks are on the truck', job: 'Pine Cabin', re: { owner: 'Phil', id: 12 } }); window._put(); window._downs = 0; const d = window.dbxDownload; window.dbxDownload = async p => { if (/shared\.json$/.test(p)) window._downs++; return d(p); }; });
    await page.evaluate(() => pushTapSet('crew-reply')); await page.waitForTimeout(500);
    return await page.evaluate(() => { const r = document.querySelector('#crewSharedList [data-th="Phil:12"]'); if (!r) return false; const b = r.getBoundingClientRect();
      return window._downs >= 1 && !$('revModal').classList.contains('show') && prefs.crewFold === false && r.classList.contains('th-new') && r.classList.contains('th-flash') && /Two more sticks are on the truck/.test(r.textContent) && b.top >= 0 && b.bottom <= innerHeight && _pushTap === ''; });
  })(), await page.evaluate(() => JSON.stringify({ fold: prefs.crewFold, tap: _pushTap, rows: [...document.querySelectorAll('#crewSharedList .sum-row')].map(r => r.dataset.th + (r.classList.contains('th-new') ? '*' : '')) })));
  ok('an alert that is not about a note (or a made-up word) moves nothing; the 👁 preview is left alone', await page.evaluate(() => { window.scrollTo(0, 0); const y = scrollY; pushTapSet('hot-text'); pushTapSet('crew-reply"><x'); pushTapSet(''); return scrollY === y && _pushTap === '' && /crewPreview\) return/.test(pushTapSet.toString()); }));
  ok('the service worker tells an OPEN app which alert was tapped, and a COLD start gets it on its address: the same landing either way', await (async () => {
    const viaMsg = await page.evaluate(async () => { if (!('serviceWorker' in navigator)) return 'none'; window.scrollTo(0, 0); prefs.thSeen = {}; renderCrewShared(); navigator.serviceWorker.dispatchEvent(new MessageEvent('message', { data: { brTap: 'crew-reply' } })); await new Promise(r => setTimeout(r, 400)); const r = document.querySelector('#crewSharedList .sum-row.th-new'); return r && r.classList.contains('th-flash') ? 'landed' : 'no'; });
    await philBoot(appUrl + '?tap=crew-reply'); await page.waitForTimeout(2200);
    const cold = await page.evaluate(() => { const r = document.querySelector('#crewSharedList .sum-row.th-new'); const b = r ? r.getBoundingClientRect() : null; return { clean: !/tap=/.test(location.href), inView: !!b && b.top >= 0 && b.bottom <= innerHeight, th: r ? r.dataset.th : '' }; });
    return (viaMsg === 'landed' || (viaMsg === 'none' && /navigator\.serviceWorker\.addEventListener\('message'/.test(await page.evaluate(() => document.documentElement.outerHTML)))) && cold.clean && cold.inView && /^(Eric:207|Phil:10)$/.test(cold.th);
  })());
  ok('sw.js: the tap carries only the alert\'s TAG (letters, digits, - and _), posts it to the open app and opens ./?tap= for a crew alert on a cold start; a homeowner\'s ping still goes to its own page', /const tag = String\(e\.notification\.tag \|\| ''\)\.replace\(\/\[\^\\w-\]\/g, ''\)\.slice\(0, 40\)/.test(sw) && /postMessage\(\{ brTap: tag \}\)/.test(sw) && /openWindow\(want \|\| \(\/\^crew-\/\.test\(tag\) \? '\.\/\?tap=' \+ encodeURIComponent\(tag\) : '\.\/'\)\)/.test(sw) && /const hit = want \? list\.find/.test(sw));
  await page.evaluate(() => { localStorage.removeItem('daylog-crew-name'); localStorage.removeItem('daylog-shared-flushed'); });

  // ---------------- Eric's phone ----------------
  console.log('— 💬 Eric\'s phone: WITH PHIL —');
  await page.goto(appUrl); await page.waitForTimeout(800);
  await page.evaluate(() => {
    window.scheduleSave = () => {}; window.savePendingSoon = () => {}; window.setAck = () => {}; window.pushOut = () => false;
    entries = []; todos = []; pendingQueue = []; jobs = ['Oak House']; crew = ['Phil']; prefs.office = ['Phil']; prefs.crewCfg716 = true; prefs.crewFeedGone = []; prefs.thSeen = {}; prefs.crewFeedN = '3'; prefs.crewFeedFold = false; nextId = 100;
    renderJobSelects(); closePanels(); renderAll();
    dbx.refreshToken = 'tok'; window.dbxUpload = async () => ({});
    const m = n => new Date(Date.now() - n * 60000), iso = n => m(n).toISOString();
    entries = [{ id: 5, ts: m(5 * 1440), type: 'Note', details: 'Order the long screws', job: 'Oak House', vis: 'Phil' }];   // an OLD note of Eric's — Phil just answered it
    window._phil = [40, 41, 42, 43, 44].map((id, i) => ({ id, ts: iso(30 + i * 15), type: 'Note', details: 'Phil plain note ' + (i + 1), job: 'Oak House', vis: 'Eric' }));
    _phil.push({ id: 50, ts: iso(4), type: 'Note', details: '↩ Ordered, here Friday', job: 'Oak House', vis: 'Eric', re: { owner: 'Eric', id: 5 } });
    window._files = { '/clore daylog/crew/phil/app data/entries.json': JSON.stringify({ entries: _phil }) };
    window.dbxList = async () => ({ entries: [{ '.tag': 'folder', name: 'Phil', path_lower: '/clore daylog/crew/phil', path_display: '/Clore DayLog/Crew/Phil' }] });
    window.dbxDownload = async p => window._files[p] ?? null;
  });
  await page.evaluate(async () => { await checkCrewLogs(); }); await page.waitForTimeout(150);
  // 💬 v7.80 — on HIS card the words are his own ("a light for response waiting or alert waiting that pulses"): ↩ RESPONSE WAITING behind a pulsing lamp
  ok('on Eric\'s card the same: his five-day-old note with Phil\'s fresh answer leads the three shown, says ↩ RESPONSE WAITING (v7.80), and the fold counts it', await page.evaluate(() => { const rs = [...document.querySelectorAll('#crewFeedList .sum-row')]; const t = rs[0].textContent.replace(/\s+/g, ' ').trim();
    return rs.length === 3 && rs[0].dataset.th === 'Eric:5' && rs[0].classList.contains('th-new') && /^↩ RESPONSE WAITING · 📨 you →\s*Phil/.test(t) && /Ordered, here Friday/.test(t) && !rs[1].classList.contains('th-new') && /· ↩ 1 response waiting, tap to fold$/.test($('cfFoldBtn').textContent.trim()); }),
    await page.evaluate(() => JSON.stringify({ th: [...document.querySelectorAll('#crewFeedList .sum-row')].map(r => r.dataset.th + (r.classList.contains('th-new') ? '*' : '')), first: document.querySelector('#crewFeedList .sum-row').textContent.replace(/\s+/g, ' ').trim().slice(0, 140), fold: $('cfFoldBtn').textContent.trim() })));
  ok('a tap on the crew\'s alert lands on it there too (the card folded first); his own flush has Undo', await (async () => {
    await page.evaluate(() => { prefs.crewFeedFold = true; renderCrewFeed(); window.scrollTo(0, 0); pushTapSet('crew-ask'); }); await page.waitForTimeout(500);
    const land = await page.evaluate(() => { const r = document.querySelector('#crewFeedList [data-th="Eric:5"]'); if (!r) return false; const b = r.getBoundingClientRect(); return prefs.crewFeedFold === false && r.classList.contains('th-flash') && b.top >= 0 && b.bottom <= innerHeight; });
    await page.evaluate(() => thOwnFlush('5')); await page.waitForTimeout(100);
    const fl = await page.evaluate(() => !!entries.find(e => e.id === 5).threadDone && !!$('toast').querySelector('button'));
    await page.evaluate(() => $('toast').querySelector('button').click()); await page.waitForTimeout(100);
    return land && fl && await page.evaluate(() => !('threadDone' in entries.find(e => e.id === 5)));
  })());

  ok('version bumped — APP_VER and the footer agree', /const APP_VER = 'v7\.(7[4-9]|[89]\d)'/.test(src) && new RegExp('<footer>' + (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1].replace('.', '\\.') + ' ·').test(src));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
