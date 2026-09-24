// 💵 v7.10 — THE GRINDER'S BUILD LIST PICK IS A COST LINE; SIX JOURNAL PHOTOS THEN A FOLD. Eric: "When I enter something into
// the grinder and I click 'Build List' I want all the construction categories on there, well organized, so I can just click …
// once I click the build list in the category I want 20% added automatically in it goes directly to the homeowner's upcoming
// cost page. I don't want it to stop and get sorted again." And: "On the client journal edit page, just have the first six
// photos showing and then the rest folded." Every name and figure in this file is made up.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { fileURLToPath } = require('url');
(async () => {
  const appUrl = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
  await page.goto(appUrl); await page.waitForTimeout(700);
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };

  await page.evaluate(() => {
    jobs = ['Oak House']; curJob = ''; crew = []; entries = []; todos = []; nextId = 1; pendingQueue = []; prefs.tags = ['Personal', 'Lumber yard'];
    window.scheduleSave = () => {}; window.savePendingSoon = () => {}; window.publishSharedNotes = () => {}; window.cpPush = () => {};
    renderJobSelects(); closePanels(); renderAll();
    dbx.refreshToken = 'test-token';
    _portalIdx = { clients: [{ key: 'oak', job: 'Oak House', code: 'oak-111aaa' }] };
    window._dbxFiles = {}; window._ups = [];
    window.dbxDownload = async p => (window._dbxFiles || {})[p] ?? null;
    window.dbxUpload = async (p, body) => { window._ups.push(p); window._dbxFiles[p] = body; return { path_display: p }; };
    window.dbxPathExists = async p => Object.prototype.hasOwnProperty.call(window._dbxFiles || {}, p);
    window._OFF = portalRoot() + '/materials-office-oak-111aaa.json'; window._EST = portalRoot() + '/estimates-oak-111aaa.json'; window._PAGE = portalRoot() + '/oak-111aaa.json';
    _dbxFiles[_OFF] = JSON.stringify({ full: true, seq: 2, updated: '2026-09-10', hist: [], rooms: [
      { name: 'KITCHEN', items: [{ id: 'm1', n: 'Countertops', t: 'Misc', buy: true, s: 'picked' }] },
      { name: 'Framing', items: [{ id: 'm2', n: 'Beam', t: 'Misc', buy: true, s: 'pick' }] }] });
    _dbxFiles[_EST] = JSON.stringify({ mk: 20, cats: [{ n: 'Plumbing', appr: true, est: 9000, bids: [] }] });
    _dbxFiles[_PAGE] = JSON.stringify({ name: 'Oak House', invoiced: 0, paid: 0, open: 0, phases: [], journal: [], show: {} });
    window._said = []; const t0 = window.toast, u0 = window.toastUndo;
    window.toast = (m, good) => { if (m) _said.push(String(m)); return t0(m, good); };
    window.toastUndo = (m, fn) => { _said.push('UNDO:' + String(m)); window._undo = fn; return u0(m, fn); };
    window._board = () => JSON.parse(_dbxFiles[_OFF]);
    window._pickJob = j => { qnJobPick = j; const s = $('qnJob'); if (s) s.value = j; updateStepFlow(); };
    window._send = async words => { $('askText').value = words; saveNoteFrom('askText'); await _blLine; for (let i = 0; i < 40 && window._qUpBusy; i++) await new Promise(r => setTimeout(r, 50)); await new Promise(r => setTimeout(r, 60)); };
  });

  console.log('— 🏗 v7.10 the WHERE window: every construction category, by phase —');
  const w = await page.evaluate(async () => {
    _pickJob('Oak House'); await qnBLToggle();
    const box = $('catBox');
    const heads = [...box.querySelectorAll('.bl-ph-h')].map(h => h.textContent.trim());
    const cats = [...box.querySelectorAll('#blPhases .bl-cat')].map(b => b.textContent.trim().replace(/^(✓|🏗)\s*/, '').trim());   // (a character class would split the 🏗 surrogate pair)
    const rooms = [...box.querySelectorAll('#blRoomGrid button')].map(b => b.textContent.replace(/\s+/g, ' ').trim());
    return { open: $('catModal').classList.contains('show'), heads, n: cats.length, cats, rooms, words: box.textContent.replace(/\s+/g, ' '), fits: box.scrollWidth <= box.clientWidth + 1 };
  });
  ok('the window lists the job\'s own categories first, then a heading a build phase — Site & utilities · Foundation & shell · Mechanical · Interior finish · Other costs', w.open && /On this Build List now/.test(w.heads[0]) && w.heads.slice(1).join('|') === '🏗 Site & utilities|🏗 Foundation & shell|🏗 Mechanical|🏗 Interior finish|🏗 Other costs', JSON.stringify(w.heads));
  ok('every construction category is a plate to tap (50+), the overhead ones (Tools · Fuel · Office/Admin) are not, and a category already on the board (Framing) is not listed twice', w.n >= 50 && w.cats.includes('Plumbing') && w.cats.includes('Trusses') && !w.cats.includes('Tools') && !w.cats.includes('Fuel') && !w.cats.includes('Office/Admin') && !w.cats.includes('Framing') && w.rooms.some(r => /Framing/.test(r)), JSON.stringify({ n: w.n, has: w.cats.slice(0, 6) }));
  ok('the hint says it in words: a construction category + a dollar amount = their Upcoming too, no stop in the receipts window', /construction category and a note with a dollar amount goes onto the homeowner's ESTIMATED UPCOMING COSTS too/.test(w.words) && /no stop in the receipts window/.test(w.words) && w.fits);
  ok('tapping a phase category lights the chip with its name', await page.evaluate(() => {
    [...$('catBox').querySelectorAll('#blPhases .bl-cat')].find(b => /Plumbing/.test(b.textContent)).click();
    return qnBL && qnBLRoom === 'Plumbing' && /📋 Plumbing/.test($('qnBLChip').textContent) && !$('catModal').classList.contains('show');
  }));

  console.log('— 💵 v7.10 a $ in the words, a construction category: straight to their Upcoming —');
  const s1 = await page.evaluate(async () => {
    _said.length = 0; _ups.length = 0;
    await _send('Water heater $1,240 from the supply house');
    const e = entries.find(x => /Water heater/.test(x.details || ''));
    const est = JSON.parse(_dbxFiles[_EST] || '{}'), pl = (est.cats || []).find(c => c.n === 'Plumbing') || {}, pend = (pl.pend || [])[0];
    const page = JSON.parse(_dbxFiles[_PAGE] || '{}');
    const row = (_board().rooms.find(r => r.name === 'Plumbing') || { items: [] }).items.find(i => /Water heater/.test(i.n));
    return { cat: e && e.category, budg: e && e.budg, pend, page: JSON.stringify(page.upcoming || null).slice(0, 300), row: !!row, said: _said.join(' | '), rowRoom: !!_board().rooms.find(r => r.name === 'Plumbing'), undo: _said.some(s => /^UNDO:/.test(s)) };
  });
  ok('the note lands on the Build List under Plumbing (the category became a Build List category) AND the entry wears the category', s1.row && s1.rowRoom && s1.cat === 'Plumbing', JSON.stringify(s1).slice(0, 300));
  ok('$1,240 went onto the estimates board as a pend under Plumbing — sent, base recorded, no stop in the receipts window', s1.pend && s1.pend.a === 1240 && s1.pend.base === 0 && s1.budg === 'sent', JSON.stringify(s1.pend));
  ok('the homeowner\'s page shows it under ESTIMATED UPCOMING COSTS with the 20% folded in — $1,488, no vendor, no "markup" anywhere on the page', (() => {
    const j = s1.page; return /1488/.test(j) && !/supply house/i.test(j) && !/markup/i.test(j) && !/1240/.test(j);
  })(), s1.page);
  ok('the toasts say so, and there is NO ↩ Undo (it reached their page)', /Build List → Plumbing · 💵 → their Upcoming/.test(s1.said) && /On their page under UPCOMING — Plumbing, \$1,488/.test(s1.said) && !s1.undo, s1.said.slice(0, 300));

  console.log('— 🏠 v7.10 a ROOM pick with a $ stays off their page; no $ is just a row —');
  ok('KITCHEN + "$300 pot filler" → the row lands, the money stays off their page and he is told why (no guessing the cost line)', await page.evaluate(async () => {
    _pickJob('Oak House'); await qnBLToggle(); qnBLPick('KITCHEN');
    _said.length = 0; const before = JSON.stringify(_dbxFiles[_EST]), pb = JSON.stringify(_dbxFiles[_PAGE]);
    await _send('$300 pot filler faucet');
    const row = _board().rooms.find(r => r.name === 'KITCHEN').items.find(i => /pot filler/.test(i.n));
    const e = entries.find(x => /pot filler/.test(x.details || ''));
    return !!row && !e.budg && !e.category && JSON.stringify(_dbxFiles[_EST]) === before && JSON.stringify(_dbxFiles[_PAGE]) === pb && /\$300 stays off their page — pick a construction category/.test(_said.join(' '));
  }));
  ok('Electrical + no dollar amount → a row under Electrical, nothing on their page, the plain ↩ Undo toast as before', await page.evaluate(async () => {
    _pickJob('Oak House'); await qnBLToggle(); qnBLPick('Electrical');
    _said.length = 0; const before = JSON.stringify(_dbxFiles[_EST]);
    await _send('Ask about the panel location');
    const row = (_board().rooms.find(r => r.name === 'Electrical') || { items: [] }).items.find(i => /panel location/.test(i.n));
    return !!row && JSON.stringify(_dbxFiles[_EST]) === before && _said.some(s => /^UNDO:.*Build List → Electrical/.test(s));
  }));
  ok('a minus is never a cost: "credit -$50" reads as no amount', await page.evaluate(() => grindAmtOf({ details: 'credit -$50 from the yard' }) === 0 && grindAmtOf({ details: 'two boxes $1,234.56 total' }) === 1234.56 && grindAmtOf({ details: 'nothing here' }) === 0));
  ok('the photo\'s own read wins over the words: 💵 $842.10 read off the receipt, "$900" typed → $842.10', await page.evaluate(() => grindAmtOf({ details: 'about $900', ai: '💵 $842.10 🏪 Yard' }) === 842.1));
  ok('a Build List pick is a cost line only when it is one of the estimates board\'s construction categories — never an overhead one, never a room', await page.evaluate(() => isBuildCat('Plumbing') && isBuildCat('framing') && !isBuildCat('Tools') && !isBuildCat('KITCHEN') && !isBuildCat('')));

  console.log('— 📷 v7.10 the journal window: six photos, then the fold —');
  const j = await page.evaluate(async () => {
    entries = []; nextId = 1;
    const ago = h => new Date(Date.now() - h * 3600000);
    for (let i = 0; i < 9; i++) addEntry('Note', 'site ' + i, 'Oak House', { noSniff: true, photoPath: `/p/${i}.jpg`, photoPaths: [`/p/${i}.jpg`, `/p/${i}b.jpg`], ts: ago(i + 1) });
    entries[8].jrn = true; entries[8].jrnSel = [`/p/8b.jpg`];   // the oldest one is PICKED for this week
    window.getToken = async () => 't'; const f0 = window.fetch; window.fetch = async (u, o) => /dropboxapi/.test(String(u)) ? new Response(new Blob(['x'], { type: 'image/jpeg' }), { status: 200 }) : f0(u, o);
    await openJournal(0); await new Promise(r => setTimeout(r, 200));
    const tiles = [...document.querySelectorAll('#jrnPhGrid [data-jph]')];
    const shown = tiles.filter(t => !t.hidden), hid = tiles.filter(t => t.hidden);
    const btn = $('jrnPhMoreBtn');
    return { total: tiles.length, shown: shown.length, hidden: hid.length, btn: btn ? btn.textContent.trim() : '', expanded: btn && btn.getAttribute('aria-expanded'), firstIsPicked: shown[0] && shown[0].dataset.jph.startsWith(entries[8].id + '_'), gridWide: btn && btn.getBoundingClientRect().width > 300 };
  });
  ok('18 photos on the job → 6 tiles show, 12 wait behind ONE full-width plate that says "+12 more photos — tap to see them all"', j.total === 18 && j.shown === 6 && j.hidden === 12 && /\+12 more photos — tap to see them all/.test(j.btn) && j.expanded === 'false' && j.gridWide, JSON.stringify(j));
  ok('what is picked for this week is in the first six, never behind the fold', j.firstIsPicked, JSON.stringify(j));
  ok('the plate opens them all and says so; tap again tucks them away; a fresh open starts folded again', await page.evaluate(async () => {
    jrnPhMore();
    const all = [...document.querySelectorAll('#jrnPhGrid [data-jph]')].every(t => !t.hidden) && /Showing all 18 — tap to tuck the rest away/.test($('jrnPhMoreBtn').textContent) && $('jrnPhMoreBtn').getAttribute('aria-expanded') === 'true';
    jrnPhMore();
    const back = [...document.querySelectorAll('#jrnPhGrid [data-jph]')].filter(t => t.hidden).length === 12;
    jrnPhMore(); closeReview(); await openJournal(0); await new Promise(r => setTimeout(r, 200));
    const fresh = [...document.querySelectorAll('#jrnPhGrid [data-jph]')].filter(t => t.hidden).length === 12;
    closeReview(); return all && back && fresh;
  }));
  ok('six or fewer photos: no plate at all', await page.evaluate(async () => {
    entries = entries.slice(0, 3); await openJournal(0); await new Promise(r => setTimeout(r, 200));
    const r = document.querySelectorAll('#jrnPhGrid [data-jph]').length === 6 && !$('jrnPhMoreBtn'); closeReview(); return r;
  }));

  ok('no page errors', errs.length === 0, errs.join(' | '));
  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close(); process.exit(fail ? 1 : 0);
})();
