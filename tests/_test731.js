// v7.31 — Eric, with a picture of his FROM PHIL card: "when i flush it into my log it'll be ready for summaries and journals
// and wizard right?" — the words were, the PICTURE was not (the flush never carried it), and a 📖 Journal photos note Phil
// stamped on his phone lost its stamp. Now the Sort card carries the picture (Eric's own copy, under Crew/<name>) and the
// journal stamp, and ⤵ Flush writes both onto the entry in Eric's log. And: "phil cant see my pocket list right? when i
// click on 'see what phil sees' its just showing me mine instead right? could there be a replacement like greyed out words
// that say 'here's where phils pocket list shows privately'." Names, jobs and pictures made up.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { fileURLToPath } = require('url');
(async () => {
  const appUrl = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const repo = path.dirname(fileURLToPath(appUrl));
  const src = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await ctx.route(u => !/^file:/.test(u.href), r => r.abort());
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
  await page.goto(appUrl); await page.waitForTimeout(700);
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };

  await page.evaluate(() => {
    window.scheduleSave = () => {}; window.savePendingSoon = () => {}; window.publishSharedNotes = async () => {}; window.setAck = () => {};
    entries = []; todos = []; pendingQueue = []; jobs = ['Oak House']; crew = ['Phil']; prefs.previewAs = 'Phil';
    renderJobSelects(); closePanels(); renderAll();
    dbx.refreshToken = 'tok';
    window._said = []; const t0 = window.toast; window.toast = (m, g) => { if (m) _said.push(String(m)); return t0(m, g); };
  });

  console.log('— 🎒 (1) the 👁 preview and the pocket —');
  ok('Eric\'s own pocket list shows on his page; in the preview as Phil the card shows grey words instead — where Phil\'s private list sits — and puts the − n/N +, ⤵ Flush and the writing box away; back on his own app the list is back', await page.evaluate(() => {
    prefs.pocket = [{ id: 'a1', t: 'buy hinges for the shop door', day: localDay(new Date()), ts: new Date().toISOString() }]; renderPocket();
    const own = /buy hinges/.test($('pocketList').textContent) && !$('pocketCard').classList.contains('pk-preview');
    crewPreviewToggle();
    const t = $('pocketList').textContent, card = $('pocketCard');
    const prev = document.body.classList.contains('crew-mode') && card.classList.contains('pk-preview') && /Phil’s pocket list shows here/.test(t) && /private to Phil’s phone/.test(t) && /Phil never sees yours/.test(t) && !/buy hinges/.test(t) &&
      $('pocketIn').offsetParent === null && getComputedStyle(card.querySelector('.pk-cap')).display === 'none' && getComputedStyle(card.querySelector('.pk-flush')).display === 'none' && card.querySelector('.pk-privnote').offsetParent !== null;
    crewPreviewToggle();
    const back = !document.body.classList.contains('crew-mode') && !card.classList.contains('pk-preview') && /buy hinges/.test($('pocketList').textContent) && $('pocketIn').offsetParent !== null;
    return own && prev && back;
  }), await page.evaluate(() => JSON.stringify({ t: $('pocketList').textContent, cls: $('pocketCard').className, body: document.body.className })));
  ok('the grey words are dim and italic — a placeholder, not a list', await page.evaluate(() => { crewPreviewToggle(); const el = $('pocketCard').querySelector('.pk-privnote'), cs = getComputedStyle(el); const r = cs.fontStyle === 'italic' && +cs.opacity <= 1; crewPreviewToggle(); return r; }));

  console.log('— 📷 (2) the flush carries the picture and the journal stamp —');
  await page.evaluate(async () => {
    const ago = h => new Date(Date.now() - h * 3600000).toISOString();
    window._phil = [
      { id: 21, ts: ago(1), type: 'Note', details: '📖 Journal photos — week of ' + localDay(new Date()), job: 'Oak House', jrn: true, photoPath: '/Phil/photos/2026-09-27 oak siding.jpg' },
      { id: 22, ts: ago(2), type: 'Note', details: 'From Jason: looks like a load bearing wall', job: 'Oak House', vis: 'Eric', route: 'Eric', urg: 'now', photoPath: '/Phil/photos/wall.jpg', photoPaths: ['/Phil/photos/wall.jpg', '/Phil/photos/wall2.jpg'] },
      { id: 23, ts: ago(3), type: 'Note', details: 'Trim delivered to the garage', job: 'Oak House', vis: 'Eric' }];
    window._files = { '/clore daylog/crew/phil/app data/entries.json': JSON.stringify({ entries: _phil }) };
    window.dbxList = async () => ({ entries: [{ '.tag': 'folder', name: 'Phil', path_lower: '/clore daylog/crew/phil', path_display: '/Clore DayLog/Crew/Phil' }] });
    window.dbxDownload = async p => window._files[p] ?? null;
    await checkCrewLogs(); renderCrewFeed();
  });
  ok('the three Sort cards come in; the picture rides on the card as Eric\'s own copy of it (Crew/Phil/photos/…), both pictures of the two-picture note, and the 📖 stamp only on the journal note', await page.evaluate(() => {
    const c = id => pendingQueue.find(p => new RegExp('^crew:Phil:' + id + ':').test(p.id));
    const a = c(21), b = c(22), d = c(23);
    return a && b && d && a.payload.ph === '/Clore DayLog/Crew/Phil/photos/2026-09-27 oak siding.jpg' && a.payload.jrn === true &&
      b.payload.ph === '/Clore DayLog/Crew/Phil/photos/wall.jpg' && JSON.stringify(b.payload.phs) === JSON.stringify(['/Clore DayLog/Crew/Phil/photos/wall.jpg', '/Clore DayLog/Crew/Phil/photos/wall2.jpg']) && b.payload.jrn === false && !d.payload.ph && d.payload.jrn === false;
  }), await page.evaluate(() => JSON.stringify(pendingQueue.filter(p => /^crew:/.test(p.id)).map(p => [p.id, p.payload.ph, p.payload.phs, p.payload.jrn]))));
  ok('⤵ Flush on the FROM PHIL card: the journal note lands in Eric\'s log as "Phil: 📖 Journal photos …" WITH the picture and the 📖 stamp — the Oak House journal window lists that picture, picked; the wall note lands with both pictures and no stamp; the plain note lands with neither', await page.evaluate(async () => {
    const key = id => pendingQueue.find(p => new RegExp('^crew:Phil:' + id + ':').test(p.id)).id;
    const k21 = key(21), k22 = key(22), k23 = key(23);
    const btn = [...document.querySelectorAll('#crewFeedList .cf-flush')].find(b => /Flush to the grinder/.test(b.textContent) && b.closest('.cf-row').textContent.includes('Journal photos'));   // 💬 v7.33 — the plate's words
    if (btn) btn.click(); else reviewAct(k21, 'log');
    await new Promise(r => setTimeout(r, 80));
    reviewAct(k22, 'log'); reviewAct(k23, 'log');
    const j = entries.find(e => e.crewKey === k21), w = entries.find(e => e.crewKey === k22), t = entries.find(e => e.crewKey === k23);
    const pl = jrnPhotoList('Oak House');
    return j && /^Phil: 📖 Journal photos/.test(j.details) && j.who === 'Phil' && j.job === 'Oak House' && j.photoPath === '/Clore DayLog/Crew/Phil/photos/2026-09-27 oak siding.jpg' && j.jrn === true && !j.jrnDone &&
      w && w.photoPath === '/Clore DayLog/Crew/Phil/photos/wall.jpg' && JSON.stringify(w.photoPaths) === JSON.stringify(['/Clore DayLog/Crew/Phil/photos/wall.jpg', '/Clore DayLog/Crew/Phil/photos/wall2.jpg']) && !w.jrn &&
      t && !t.photoPath && !t.jrn &&
      pl.some(x => x.e === j && x.path === j.photoPath) && pl.filter(x => x.e === w).length === 2 && pl[0].e === j;
  }), await page.evaluate(() => JSON.stringify({ e: entries.filter(e => e.crewKey).map(e => [e.details, e.photoPath, e.photoPaths, e.jrn]), pl: jrnPhotoList('Oak House').map(x => x.path) })));
  ok('the same picture opens from the entry the way it does from the card (the path is the one Eric\'s Dropbox holds) — and the Wizard\'s log rows now carry Phil\'s note', await page.evaluate(() => {
    const j = entries.find(e => /Journal photos/.test(e.details)); const c = buildAskContext('what did phil send about oak house');
    return /^\/Clore DayLog\/Crew\/Phil\//.test(j.photoPath) && /Journal photos/.test(c);
  }));
  ok('the ✅ finished card built from a FROM THE CREW row carries the picture and the stamp too (source)', /vis: e\.vis \|\| '', ph: cfPhotoPath\(e\.photoPath \|\| \(e\.photoPaths \|\| \[\]\)\[0\], r\.folder\), jrn: !!e\.jrn \} \};/.test(src));

  ok('version bumped — APP_VER and the footer agree', /const APP_VER = 'v7\.(3[1-9]|[4-9]\d)'/.test(src) && new RegExp('<footer>' + (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1].replace('.', '\\.')).test(src));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
