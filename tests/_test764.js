// 🧾 v7.64 — A CHECK ON THE HOMEOWNER'S PAGE: NEVER AGAIN. Eric, with a picture of a client's PROGRESS PHOTOS whose last tile
// was a check he wrote: "last photo is a check written. not sure how it got on the page but trace the path and be sure it doesn't
// happen again." Traced: a receipt note's picture, stamped for the journal, released with the week; the grid had let it go
// unseen, and a take-back left the file on the shelf. Four guards, every one asserted here with made-up names and numbers:
// a paper-looking tile asks ⚠ SURE? (so does the row's 📖), Release shows the pictures first with ✕ on each, a released week's
// photos each wear ✕ (one off, the week stays), and off the page = off the shelf (the file moves to Backups; a sweep on open).
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

  const seed = () => page.evaluate(() => {
    jobs = ['Oak House']; curJob = ''; crew = []; entries = []; todos = []; nextId = 1; pendingQueue = [];
    window.scheduleSave = () => {}; window.savePendingSoon = () => {}; window.publishSharedNotes = () => {}; window.cpPush = () => {}; window.getToken = async () => 't';
    renderJobSelects(); closePanels(); renderAll();
    dbx.refreshToken = 'test-token';
    _portalIdx = { clients: [{ key: 'oak', job: 'Oak House', code: 'oak-111aaa' }] };
    window._dbxFiles = {}; window._ups = []; window._rpc = [];
    window.dbxDownload = async p => (window._dbxFiles || {})[p] ?? null;
    window.dbxUpload = async (p, body) => { window._ups.push(p); window._dbxFiles[p] = body; return { path_display: p }; };
    window.dbxPathExists = async p => Object.prototype.hasOwnProperty.call(window._dbxFiles || {}, p);
    // a fake Dropbox: copy_v2 lands a file in the served folder, move_v2 moves it, list_folder lists a folder's files
    window.dbxRpc = async (ep, arg) => { window._rpc.push([ep, arg]);
      if (ep === 'files/copy_v2') { if (window._dbxFiles[arg.to_path] != null) return { error_summary: 'to/conflict/file' }; window._dbxFiles[arg.to_path] = '[photo]'; return { metadata: { path_display: arg.to_path } }; }
      if (ep === 'files/move_v2') { if (window._dbxFiles[arg.from_path] == null) return { error_summary: 'from_lookup/not_found' }; window._dbxFiles[arg.to_path] = window._dbxFiles[arg.from_path]; delete window._dbxFiles[arg.from_path]; return { metadata: { path_display: arg.to_path } }; }
      return {}; };
    window.dbxList = async arg => ({ entries: Object.keys(window._dbxFiles).filter(p => p.startsWith(arg.path + '/') && !p.slice(arg.path.length + 1).includes('/')).map(p => ({ '.tag': 'file', name: p.split('/').pop(), path_lower: p.toLowerCase(), path_display: p })) });
    window._PAGE = portalRoot() + '/oak-111aaa.json'; window._PH = portalRoot() + '/photos-oak-111aaa'; window._BK = DBX_ROOT + '/App Data/Backups/photos-oak-111aaa';
    _dbxFiles[_PAGE] = JSON.stringify({ name: 'Oak House', invoiced: 0, paid: 0, open: 0, phases: [], journal: [], show: {} });
    const mk = (id, words, extra, photos) => { const e = addEntry('Note', words, 'Oak House', extra); e.id = id; e.ts = new Date(Date.now() - 2 * 864e5); e.photoPath = photos[0]; if (photos.length > 1) e.photoPaths = photos; photos.forEach(p => { _dbxFiles[p] = '[photo]'; }); return e; };
    mk(1, 'Framing almost done', {}, ['/Clore DayLog/Job Notes/Oak House/Framing almost done - Oak House - 2026-09-28 0901 1.jpeg', '/Clore DayLog/Job Notes/Oak House/Framing almost done - Oak House - 2026-09-28 0901 2.jpeg']);
    mk(2, '📅 2026-09-27\n🏪 Gravel Co\n💵 $415.00\nNew footers, concrete only', {}, ['/Clore DayLog/Receipts/2026-09-27 Gravel Co 415 - Oak House - 2026-09-27 1102.jpeg']);   // a check, photographed as the receipt
    mk(3, 'Deck boards going down', {}, ['/Clore DayLog/Job Notes/Oak House/Deck boards going down - Oak House - 2026-09-29 1500.jpeg']);
    nextId = 10;
    window._said = []; const t0 = window.toast; window.toast = (m, good) => { if (m) _said.push(String(m)); return t0(m, good); };
    window._tile = id => document.querySelector(`[data-jph="${id}_0"]`);
    window._pg = () => JSON.parse(_dbxFiles[_PAGE]);
    window._served = () => Object.keys(_dbxFiles).filter(p => p.startsWith(_PH + '/')).map(p => p.split('/').pop()).sort();
    window._backup = () => Object.keys(_dbxFiles).filter(p => p.startsWith(_BK + '/')).map(p => p.split('/').pop()).sort();
  });
  await seed();
  const open = async () => { await page.evaluate(async () => { _jrnKeepText = null; await openJournal(0); }); await page.waitForTimeout(400); };

  console.log('— 🧾 (1) paper asks first —');
  ok('jrnPaperLike: a receipt note (💵 / 🏪 lines), the 🧾 tag, a category, an amount, a Filed entry, a bill on the way, or the word "check" — but not a plain progress note', await page.evaluate(() =>
    jrnPaperLike({ details: '📅 2026-09-27\n🏪 Gravel Co\n💵 $415.00' }) && jrnPaperLike({ details: 'x', tags: ['Receipt'] }) && jrnPaperLike({ details: 'x', category: 'Framing' }) && jrnPaperLike({ details: 'x', amount: 12 }) && jrnPaperLike({ details: 'x', type: 'Filed' }) && jrnPaperLike({ details: 'x', budg: 'sent' })
    && jrnPaperLike({ details: 'wrote a check to the plumber' }) && jrnPaperLike({ details: 'x', ai: '🏪 Home Depot' }) && !jrnPaperLike({ details: 'Framing almost done' }) && !jrnPaperLike({ details: 'Deck boards going down', tags: ['Phil'] })));
  await open();
  ok('in the grid the receipt\'s tile wears 🧾 RECEIPT? on a dashed edge; a progress shot wears nothing', await page.evaluate(() => { const r = _tile(2), f = _tile(1); return !!r && r.classList.contains('jrn-paper') && /🧾 RECEIPT\?/.test(r.textContent) && !!f && !f.classList.contains('jrn-paper') && !/RECEIPT/.test(f.textContent); }));
  ok('one tap on the receipt only asks — ⚠ SURE? on the tile, a toast, nothing picked; the second tap picks it; a progress shot picks in one tap', await page.evaluate(() => {
    _said.length = 0; _tile(2).click();
    const asked = /⚠ SURE\? tap again/.test(_tile(2).textContent) && _tile(2).classList.contains('armed') && !entries.find(e => e.id === 2).jrn && _said.some(t => /looks like a receipt or a check/.test(t));
    _tile(2).click();
    const picked = !!entries.find(e => e.id === 2).jrn && /✓ GOES/.test(_tile(2).textContent);
    _tile(1).click();
    const one = !!entries.find(e => e.id === 1).jrn && /✓ GOES/.test(_tile(1).textContent);
    return asked && picked && one;
  }), await page.evaluate(() => JSON.stringify([_tile(2).textContent.trim(), entries.filter(e => e.jrn).map(e => e.id)])));
  ok('un-picking is one tap; the row\'s 📖 stamp on a receipt note with a picture asks the same way, and stamps on the second tap', await page.evaluate(() => {
    _tile(2).click(); const off = !entries.find(e => e.id === 2).jrn;
    _said.length = 0; jrnStamp(2); const asked = !entries.find(e => e.id === 2).jrn && _said.some(t => /its PICTURE would go to the homeowner/.test(t));
    jrnStamp(2); const on = !!entries.find(e => e.id === 2).jrn;
    jrnStamp(2); const offAgain = !entries.find(e => e.id === 2).jrn;   // taking a stamp off never asks
    return off && asked && on && offAgain;
  }));

  console.log('— 📷 (2) look before it goes —');
  ok('Release with pictures riding opens the sheet first: every photo, its words, the receipt flagged, ✕ Leave this one off on each — and NOTHING is written yet', await page.evaluate(async () => {
    _tile(2).click(); _tile(2).click();   // the receipt back on, on purpose (two taps)
    _tile(3).click();   // the deck shot too — three ride: a framing shot, the receipt, the deck
    $('jrnText').value = 'Framing is nearly done and the deck boards are going down.';
    _ups.length = 0; _rpc.length = 0;
    await journalRelease();
    const box = document.querySelector('#jrnGoHost .we-box'); if (!box) return false;
    const tiles = [...box.querySelectorAll('.jrn-go-ph')];
    return /📷 3 PHOTOS GO WITH THIS WEEK/.test(box.textContent) && tiles.length === 3 && tiles.filter(t => t.classList.contains('paper')).length === 1 && /⚠ 1 looks like paper/.test(box.textContent)
      && tiles.every(t => /✕ Leave this one off/.test(t.querySelector('.jrn-go-x').textContent)) && tiles.some(t => /Framing almost done/.test(t.textContent)) && /📖 Release — 3 photos ride/.test(box.textContent) && _ups.length === 0 && !_rpc.some(r => r[0] === 'files/copy_v2');
  }), await page.evaluate(() => (document.querySelector('#jrnGoHost .we-box') || { textContent: 'NO SHEET' }).textContent.replace(/\s+/g, ' ').slice(0, 300)));
  ok('✕ on the receipt leaves it off: it is un-picked in the grid, the sheet redraws with 2', await page.evaluate(() => {
    [...document.querySelectorAll('#jrnGoHost .jrn-go-ph')].find(t => t.classList.contains('paper')).querySelector('.jrn-go-x').click();
    const box = document.querySelector('#jrnGoHost .we-box');
    return !!box && /📷 2 PHOTOS GO/.test(box.textContent) && !box.querySelector('.jrn-go-ph.paper') && !entries.find(e => e.id === 2).jrn && /📖 Release — 2 photos ride/.test(box.textContent);
  }));
  ok('📖 Release from the sheet releases: the week carries the 2 pictures (the check is not among them), the copies landed in the served folder, the sheet is gone', await page.evaluate(async () => {
    [...document.querySelectorAll('#jrnGoHost button')].find(b => /^📖 Release/.test(b.textContent)).click();
    await new Promise(r => setTimeout(r, 400));
    const j = _pg().journal[0];
    return !!j && (j.photos || []).length === 2 && !j.photos.some(n => /Gravel/.test(n)) && _served().length === 2 && _served().every(n => /Framing almost done|Deck boards/.test(n)) && !document.querySelector('#jrnGoHost .we-box') && _said.some(t => /Journal released .* with 2 photos/.test(t));
  }), await page.evaluate(() => JSON.stringify([_pg().journal[0], _served()])));
  ok('words alone release with no sheet', await page.evaluate(async () => {
    await openJournal(0); await new Promise(r => setTimeout(r, 300));
    $('jrnText').value = 'A quiet week — the windows are on order.';
    await journalRelease(); await new Promise(r => setTimeout(r, 300));
    return !document.querySelector('#jrnGoHost .we-box') && _pg().journal.length === 2 && !_pg().journal[0].photos;
  }));

  console.log('— ✕ (3) one photo off a released week · (4) off the page = off the shelf —');
  await page.evaluate(async () => { await openJournal(0); await new Promise(r => setTimeout(r, 500)); });
  ok('a released week lists its pictures, each with ✕ (the words-only week lists none)', await page.evaluate(() => {
    const rows = [...document.querySelectorAll('#jrnRelList .jrn-rel-row')];
    return rows.length === 2 && rows[0].querySelectorAll('.jrn-rel-ph').length === 0 && rows[1].querySelectorAll('.jrn-rel-ph').length === 2 && [...rows[1].querySelectorAll('.jrn-rel-x')].every(b => b.textContent.trim() === '✕') && /✕ on a photo takes just that one off/.test($('jrnRelList').textContent);
  }), await page.evaluate(() => $('jrnRelList').innerHTML.slice(0, 400)));
  ok('✕ asks first (⚠ SURE?), then takes that ONE photo off the week — the week stays, its other picture stays, and the file moves out of the served folder into Backups (moved, never deleted)', await page.evaluate(async () => {
    const row = document.querySelectorAll('#jrnRelList .jrn-rel-row')[1];
    const x = row.querySelector('.jrn-rel-ph .jrn-rel-x'); x.click(); await new Promise(r => setTimeout(r, 300));
    const armed = /⚠ SURE\?/.test(document.querySelectorAll('#jrnRelList .jrn-rel-row')[1].querySelector('.jrn-rel-ph.armed .jrn-rel-x').textContent);
    document.querySelectorAll('#jrnRelList .jrn-rel-row')[1].querySelector('.jrn-rel-ph.armed .jrn-rel-x').click(); await new Promise(r => setTimeout(r, 500));
    const j = _pg().journal[1];
    return armed && j.photos.length === 1 && _served().length === 1 && _backup().length === 1 && _pg().journal.length === 2 && _said.some(t => /✕ That photo is off Oak House's page — the file moved out of their folder/.test(t));
  }), await page.evaluate(() => JSON.stringify([_pg().journal, _served(), _backup()])));
  ok('a file two weeks still share is NOT moved when one week drops it', await page.evaluate(async () => {
    const pg = _pg(); pg.journal[0].photos = [pg.journal[1].photos[0]]; _dbxFiles[_PAGE] = JSON.stringify(pg);   // the words-only week now names the same picture
    await renderJrnReleased(); await new Promise(r => setTimeout(r, 300));
    const row = document.querySelectorAll('#jrnRelList .jrn-rel-row')[0];
    row.querySelector('.jrn-rel-x').click(); await new Promise(r => setTimeout(r, 200)); document.querySelectorAll('#jrnRelList .jrn-rel-row')[0].querySelector('.jrn-rel-x').click(); await new Promise(r => setTimeout(r, 400));
    return !_pg().journal[0].photos && _pg().journal[1].photos.length === 1 && _served().length === 1 && _said.some(t => /another week still uses the file/.test(t));
  }), await page.evaluate(() => JSON.stringify([_pg().journal, _served()])));
  ok('↩ Take back on a week moves its pictures out of the served folder too', await page.evaluate(async () => {
    jrnRetract(1); await new Promise(r => setTimeout(r, 200)); await jrnRetract(1); await new Promise(r => setTimeout(r, 500));
    return _pg().journal.length === 1 && _served().length === 0 && _backup().length === 2 && _said.some(t => /is OFF Oak House's page ✓ · 1 picture file moved out of their folder/.test(t));
  }), await page.evaluate(() => JSON.stringify([_pg().journal, _served(), _backup(), _said.slice(-2)])));
  ok('the sweep on open: a file in the served folder that no week names any more (a week taken back on an older build) moves to Backups; a named one stays; a failed page read sweeps nothing', await page.evaluate(async () => {
    _dbxFiles[_PH + '/orphan - Oak House - 2026-09-01 0900.jpeg'] = '[photo]'; _dbxFiles[_PH + '/kept - Oak House - 2026-09-02 0900.jpeg'] = '[photo]';
    const pg = _pg(); pg.journal[0].photos = ['kept - Oak House - 2026-09-02 0900.jpeg']; _dbxFiles[_PAGE] = JSON.stringify(pg);
    _said.length = 0; await openJournal(0); await new Promise(r => setTimeout(r, 600));
    const swept = _served().join() === 'kept - Oak House - 2026-09-02 0900.jpeg' && _backup().includes('orphan - Oak House - 2026-09-01 0900.jpeg') && _said.some(t => /🧹 1 picture file no week on their page uses any more — moved out of their folder/.test(t));
    _dbxFiles[_PH + '/orphan2 - Oak House - 2026-09-01 0900.jpeg'] = '[photo]';
    const real = _dbxFiles[_PAGE]; delete _dbxFiles[_PAGE];
    _jrnSweptFor = ''; await renderJrnReleased(); await new Promise(r => setTimeout(r, 300));
    const noRead = _served().includes('orphan2 - Oak House - 2026-09-01 0900.jpeg');
    _dbxFiles[_PAGE] = real;
    return swept && noRead;
  }), await page.evaluate(() => JSON.stringify([_served(), _backup()])));
  ok('nothing here deletes: every Dropbox call on a picture file is a move or a copy', await page.evaluate(() => _rpc.every(r => r[0] === 'files/copy_v2' || r[0] === 'files/move_v2') && _rpc.filter(r => r[0] === 'files/move_v2').every(r => /\/App Data\/Backups\/photos-oak-111aaa\//.test(r[1].to_path) && r[1].autorename === true)));
  ok('at 390px the journal window does not run off the side', await page.evaluate(() => $('revBox').scrollWidth <= $('revBox').clientWidth + 1));
  await page.evaluate(() => closeReview());

  ok('version bumped — APP_VER and the footer agree', /const APP_VER = 'v7\.(6[4-9]|[7-9]\d)'/.test(src) && new RegExp('<footer>' + (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1].replace('.', '\\.') + ' ·').test(src));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
