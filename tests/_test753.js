// 📎 v7.53 — THE GRINDER LANDS ON A ROW THAT IS ALREADY THERE. Eric, after "Kitchen sink has arrived…" → 📋 Build List → KITCHEN
// made a NEW row beside the Kitchen sink already on the list: "Is there a way that I can say, 'The kitchen sink has arrived,'
// and do the Build List in the kitchen, and it will just put it onto the correct item that's already created and just advance
// the light?" — "Yes build that." A category that already holds rows asks: a new row, or one of THESE (the one his words name
// lit first); under the row he taps, the lights not yet lit, the one his words point at pre-lit; his tap decides; SEND puts the
// words on the row and moves the light along the chain. Every name and word below is made up.
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

  const seed = () => page.evaluate(() => {
    jobs = ['Oak House', 'Mery']; curJob = ''; crew = ['Phil']; entries = []; todos = []; nextId = 1; pendingQueue = []; prefs.tags = ['Lumber yard'];
    window.scheduleSave = () => {}; window.savePendingSoon = () => {}; window.publishSharedNotes = () => {};
    renderJobSelects(); closePanels(); renderAll();
    dbx.refreshToken = 'test-token';
    _portalIdx = { clients: [{ key: 'oak', job: 'Oak House', code: 'oak-111aaa' }] };
    window._dbxFiles = {}; window._ups = [];
    window.dbxDownload = async p => (window._dbxFiles || {})[p] ?? null;
    window.dbxUpload = async (p, body) => { window._ups.push(p); window._dbxFiles[p] = body; return {}; };
    window.dbxPathExists = async p => Object.prototype.hasOwnProperty.call(window._dbxFiles || {}, p);
    window._OFF = portalRoot() + '/materials-office-oak-111aaa.json'; window._CLI = portalRoot() + '/materials-oak-111aaa.json';
    _dbxFiles[_OFF] = JSON.stringify({ full: true, seq: 5, updated: '2026-09-10', hist: [], rooms: [
      { name: 'KITCHEN', items: [
        { id: 'm1', n: 'Kitchen sink', t: 'Misc', buy: true, s: 'picked' },
        { id: 'm2', n: 'Faucet', t: 'Misc', buy: true, s: 'pick' },
        { id: 'm3', n: 'Check all vents', t: 'Misc', s: 'todo', kids: [{ n: 'attic run', ok: false }] },
        { id: 'm4', n: 'Cabinets', t: 'Misc', buy: true, s: 'arrived', ins: '2026-09-20' }] },
      { name: 'GARAGE / LOFT', items: [{ id: 'm5', n: 'Garage door', t: 'Misc', buy: true, s: 'ordered' }] },
      { name: 'BATH', items: [] }] });
    window._said = []; const t0 = window.toast, u0 = window.toastUndo;
    window.toast = (m, good) => { if (m) _said.push(String(m)); return t0(m, good); };
    window.toastUndo = (m, fn) => { _said.push(String(m)); window._undo = fn; return u0(m, fn); };
    window._board = () => JSON.parse(_dbxFiles[_OFF]);
    window._row = id => { const B = _board(); for (const r of B.rooms) { const f = (r.items || []).find(x => x.id === id); if (f) return f; } return null; };
    window._pickJob = j => { qnJobPick = j; const s = $('qnJob'); if (s) s.value = j; updateStepFlow(); };
    window._send = async () => { saveNoteFrom('askText'); await _blLine; await new Promise(r => setTimeout(r, 30)); };
    window._chip = () => $('qnBLChip');
    window._step2 = () => ({ open: $('catModal').classList.contains('show'), title: ($('catBox').querySelector('h3') || { textContent: '' }).textContent.replace(/✕/g, '').replace(/\s+/g, ' ').trim(),
      newRow: ($('blNewRow') || { textContent: '' }).textContent.replace(/\s+/g, ' ').trim(),
      rows: [...document.querySelectorAll('#blRowGrid .bl-row')].map(b => ({ id: b.dataset.blRow, t: b.textContent.replace(/\s+/g, ' ').trim(), named: b.classList.contains('bl-named'), sel: b.classList.contains('sel'), dashed: getComputedStyle(b).borderTopStyle })),
      lights: [...document.querySelectorAll('#blLightGrid .bl-light')].map(b => ({ k: b.dataset.blLight, t: b.textContent.replace(/\s+/g, ' ').trim(), sel: b.classList.contains('sel'), off: b.disabled })),
      done: ([...$('catBox').querySelectorAll('.btn-primary')].find(b => /SEND puts it on/.test(b.textContent)) || { textContent: '' }).textContent.replace(/\s+/g, ' ').trim(),
      hint: ($('blLightGrid') && $('blLightGrid').previousElementSibling ? $('blLightGrid').previousElementSibling.textContent : '').replace(/\s+/g, ' ').trim(),
      fits: $('catBox').scrollWidth <= $('catBox').clientWidth + 1 });
  });
  await seed();
  const day = await page.evaluate(() => { const d = new Date(); return `${d.getMonth() + 1}/${d.getDate()}`; });

  console.log('— 📎 the second question: a new row, or one already here —');
  const a = await page.evaluate(async () => {
    $('askText').value = 'Kitchen sink has arrived. I will check for damage and put it in storage'; updateStepFlow();
    _pickJob('Oak House'); await qnBLToggle();
    [...$('blRoomGrid').querySelectorAll('button')].find(b => /KITCHEN/.test(b.textContent)).click();
    return { ..._step2(), row: qnBLRow, room: qnBLRoom, lit: qnBL };
  });
  ok('KITCHEN already has rows, so the window asks: a new row, or one of these — the rows listed with their state in words, nothing picked yet', a.open && a.title === '📋 KITCHEN — a new row, or one already here?' && a.rows.length === 4 && a.row === null && a.room === 'KITCHEN' && a.lit && a.lights.length === 0 && a.fits, JSON.stringify(a));
  ok('➕ A NEW ROW leads, wearing the first line of his words', /^➕ A NEW ROW — “Kitchen sink has arrived\. I will check for damage and put it in storage”/.test(a.newRow) && /a checklist row, as before/.test(a.newRow), a.newRow);
  ok('the row his words NAME comes first, dashed, and SAYS it — "named in your note"; the others follow in the board\'s order with their state', a.rows[0].id === 'm1' && a.rows[0].named && /Kitchen sink picked · named in your note/.test(a.rows[0].t) && a.rows[0].dashed === 'dashed' && a.rows.slice(1).map(r => r.id).join() === 'm2,m3,m4' && !a.rows[1].named && /Faucet pick needed/.test(a.rows[1].t) && /Cabinets ✓ finished/.test(a.rows[3].t), JSON.stringify(a.rows));

  const b = await page.evaluate(() => { document.querySelector('#blRowGrid [data-bl-row="m1"]').click(); return { ..._step2(), row: qnBLRow }; });
  ok('tap Kitchen sink: it is picked, and its lights that are NOT lit yet appear under it — 👆 Picked is lit already, so it is not offered', b.rows[0].sel && b.row && b.row.id === 'm1' && b.row.name === 'Kitchen sink' && b.lights.map(l => l.k).join() === ',O,R,S,I' && /Lit now: Picked/.test(b.hint), JSON.stringify({ lights: b.lights, hint: b.hint, row: b.row }));
  ok('📦 Received is PRE-LIT — his note says "arrived" — and the plate says it lights 🛒 Ordered with it (the v7.20 chain); ○ Leave the lights is there too', b.row.light === 'R' && b.row.why === 'arrived' && b.lights.find(l => l.k === 'R').sel && /📦 Received/.test(b.lights.find(l => l.k === 'R').t) && /lights 🛒 Ordered with it/.test(b.lights.find(l => l.k === 'R').t) && /○ Leave the lights/.test(b.lights[0].t) && !b.lights[0].sel && /The one your note points at is lit/.test(b.hint), JSON.stringify(b.lights));
  ok('the ✓ plate says what SEND will do, in words', b.done === '✓ Done — SEND puts it on Kitchen sink · 📦 Received', b.done);

  const c = await page.evaluate(() => {
    document.querySelector('#blLightGrid [data-bl-light="I"]').click(); const i = { light: qnBLRow.light, t: document.querySelector('#blLightGrid [data-bl-light="I"]').textContent.replace(/\s+/g, ' ').trim(), sel: document.querySelector('#blLightGrid [data-bl-light="I"]').classList.contains('sel') };
    document.querySelector('#blLightGrid [data-bl-light=""]').click(); const none = { light: qnBLRow.light, done: _step2().done };
    document.querySelector('#blLightGrid [data-bl-light="R"]').click(); const back = { light: qnBLRow.light, why: qnBLRow.why };
    return { i, none, back };
  });
  ok('his tap decides: 🔧 Installed instead lights the three before it too; ○ Leave takes every light off the plan; 📦 again puts it back (with no "your note says" — it is his pick now)', c.i.light === 'I' && c.i.sel && /lights 🛒 Ordered · 📦 Received · 📅 Scheduled with it/.test(c.i.t) && c.none.light === '' && c.none.done === '✓ Done — SEND puts it on Kitchen sink' && c.back.light === 'R' && c.back.why === '', JSON.stringify(c));

  const d = await page.evaluate(() => {
    _said.length = 0; [...$('catBox').querySelectorAll('.btn-primary')].find(b => /SEND puts it on/.test(b.textContent)).click();
    const step = document.querySelector('#qnCard .g-step[data-step="4"]'); updateStepFlow(); const sum = step.querySelector('.g-step-sum').textContent;
    return { shut: !$('catModal').classList.contains('show'), chip: _chip().textContent.trim(), pressed: _chip().getAttribute('aria-pressed'), sum, said: _said.join(' | ') };
  });
  ok('✓ Done shuts the window; the chip and step ④\'s folded line say where it goes — the row and the light', d.shut && d.chip === '📋 KITCHEN → Kitchen sink · 📦 Received — tap to change' && d.pressed === 'true' && /📋 Build List → KITCHEN · Kitchen sink/.test(d.sum) && /📋 KITCHEN → Kitchen sink · 📦 Received — SEND puts it there ✓/.test(d.said), JSON.stringify(d));

  console.log('— ⚙ SEND —');
  const s = await page.evaluate(async () => {
    _said.length = 0; _ups.length = 0; await _send();
    const e = entries.find(x => /Kitchen sink has arrived/.test(x.details)), B = _board(), k = B.rooms.find(r => r.name === 'KITCHEN'), it = _row('m1');
    prefs.rlFilter = ''; renderAskRecent(); _rlOpen.add(e.id); renderAskRecent();   // the running log's rows are folded; the chip sits on the open row's meta line
    const logRow = ([...document.querySelectorAll('#askRecent .log-meta span')].find(x => /Build List → KITCHEN/.test(x.textContent)) || { textContent: '' }).textContent.replace(/\s+/g, ' ');
    return { e: e && { job: e.job, matRef: e.matRef }, n: k.items.length, it, hist: (B.hist || []).map(h => h.txt), ups: _ups.filter(p => /materials-office/.test(p)).length, cli: _ups.some(p => /materials-oak-111aaa\.json$/.test(p)), said: _said.join(' | '), band: ($('busyBand') || {}).textContent || '', logRow, chipOff: !qnBL && !qnBLRoom && qnBLRow === null };
  });
  ok('SEND: NO new row — KITCHEN still has its four; the note is in the log and points at the row it landed on', s.n === 4 && !!s.e && s.e.job === 'Oak House' && s.e.matRef && s.e.matRef.id === 'm1' && s.e.matRef.room === 'KITCHEN' && s.e.matRef.on === 'Kitchen sink' && s.e.matRef.light === '📦 Received' && s.chipOff, JSON.stringify({ n: s.n, ref: s.e && s.e.matRef }));
  const today = await page.evaluate(() => localDay(new Date()));
  ok('the light moved along the chain: Picked → Ordered → Received (ordered dated today), Scheduled and Installed untouched', s.it.s === 'arrived' && s.it.odate === today && !s.it.sch && !s.it.ins, JSON.stringify(s.it));
  ok('his words went onto the row\'s note, dated, after what was there — and into its 🕘 history (the note, and the lights from → to)', s.it.sel === `${day}: Kitchen sink has arrived. I will check for damage and put it in storage` && Array.isArray(s.it.chg) && s.it.chg.some(x => x.f === 'note' && x.from === '' && /Kitchen sink has arrived/.test(x.to)) && s.it.chg.some(x => x.f === 'lights' && x.from === 'Picked' && x.to === 'Picked · Ordered · Received' && x.by === 'Eric'), JSON.stringify({ sel: s.it.sel, chg: s.it.chg }));
  ok('the board\'s own ledger says it: from the grinder, onto the row, the light, his words', s.hist.some(t => /^☒ Ordered, Received — Kitchen sink$/.test(t)) && s.hist.some(t => /^⚙ from the grinder → KITCHEN · Kitchen sink: 📦 Received — Kitchen sink has arrived/.test(t)), JSON.stringify(s.hist));
  ok('ONLY the office file was written — the homeowner\'s file waits for the board\'s 📤, as a light tapped on the board does', s.ups === 1 && !s.cli, JSON.stringify({ ups: s.ups, cli: s.cli }));
  ok('the toast, the band and the log row all name the row and the light', /Note saved · Oak House · 📋 Build List → KITCHEN · Kitchen sink · 📦 Received ✓/.test(s.said) && /📋 ✓ ON THE BUILD LIST — KITCHEN · Kitchen sink · 📦 Received/.test(s.band) && /📋 Build List → KITCHEN · Kitchen sink · 📦 Received/.test(s.logRow), JSON.stringify({ said: s.said, band: s.band, logRow: s.logRow.slice(0, 200) }));

  const u = await page.evaluate(async () => {
    _ups.length = 0; _undo(); await _blLine; await new Promise(r => setTimeout(r, 30));
    const B = _board(), k = B.rooms.find(r => r.name === 'KITCHEN'), it = _row('m1');
    return { n: k.items.length, it, gone: !entries.some(x => /Kitchen sink has arrived/.test(x.details)), hist: (B.hist || []).map(h => h.txt), box: $('askText').value, ups: _ups.filter(p => /materials-office/.test(p)).length };
  });
  ok('↩ Undo puts the row back EXACTLY as it was — the light, the note, the history — the note leaves the log, his words come back to the box', u.n === 4 && u.it.s === 'picked' && !u.it.odate && !u.it.sel && !u.it.chg && u.gone && /Kitchen sink has arrived/.test(u.box) && u.hist.some(t => /↩ took back the grinder note on Kitchen sink — the row is as it was/.test(t)) && u.ups === 1, JSON.stringify(u));

  console.log('— 📎 the other rows —');
  const f = await page.evaluate(async () => {
    $('askText').value = 'Ordered the tap today from the plumbing supply'; updateStepFlow(); _pickJob('Oak House'); await qnBLToggle(); qnBLPick('KITCHEN');
    const before = _step2();
    document.querySelector('#blRowGrid [data-bl-row="m2"]').click();
    const after = _step2(), row = { ...qnBLRow };
    blRowDone(); _said.length = 0; await _send();
    return { before: { named: before.rows.filter(r => r.named).map(r => r.id), first: before.rows[0].id }, after: { lights: after.lights.map(l => [l.k, l.sel]) }, row, it: _row('m2'), said: _said.join(' | ') };
  });
  ok('a note that names NO row ("the tap") lights none first — the board\'s order stands; Faucet tapped: 🛒 Ordered pre-lit from "ordered", and it lights 👆 Picked with it', f.before.named.length === 0 && f.before.first === 'm1' && f.row.id === 'm2' && f.row.light === 'O' && f.row.why === 'ordered' && f.after.lights.map(l => l.join(':')).join() === ':false,P:false,O:true,R:false,S:false,I:false' && f.it.s === 'ordered' && f.it.odate && /📋 Build List → KITCHEN · Faucet · 🛒 Ordered ✓/.test(f.said), JSON.stringify(f));

  const g = await page.evaluate(async () => {
    $('askText').value = 'Check all vents done, airflow is good'; updateStepFlow(); _pickJob('Oak House'); await qnBLToggle(); qnBLPick('KITCHEN');
    document.querySelector('#blRowGrid [data-bl-row="m3"]').click();
    const st = _step2(), row = { ...qnBLRow };
    _said.length = 0; blLightTap('D'); const refused = _said.join(' | '), still = { ...qnBLRow };   // the plate is disabled, so a tap cannot land on it — the function refuses in words all the same
    blRowDone(); _said.length = 0; await _send();
    return { st: { lights: st.lights.map(l => ({ k: l.k, sel: l.sel, off: l.off, t: l.t })), named: st.rows.filter(r => r.named).map(r => r.id) }, row, refused, still, it: _row('m3'), said: _said.join(' | ') };
  });
  ok('a checklist row with a step still open: ✅ Done is offered dark and SAYS why, it is never pre-lit, and a tap on it refuses in words — only the words go on the row', g.st.named.join() === 'm3' && g.row.light === '' && g.st.lights.find(l => l.k === 'D').off && /1 step still open — attic run/.test(g.st.lights.find(l => l.k === 'D').t) && g.st.lights[0].sel && g.st.lights.find(l => l.k === 'S') && !g.st.lights.find(l => l.k === 'S').off && /step still open/.test(g.refused) && g.still.light === '' && g.it.s === 'todo' && /Check all vents done/.test(g.it.sel || '') && /📋 Build List → KITCHEN · Check all vents ✓/.test(g.said) && !/✅/.test(g.said), JSON.stringify(g));

  const h = await page.evaluate(async () => {
    $('askText').value = 'Bath fan needs a new switch'; updateStepFlow(); _pickJob('Oak House'); await qnBLToggle(); qnBLPick('BATH');
    const bath = { shut: !$('catModal').classList.contains('show'), chip: _chip().textContent.trim() };
    qnBLOff(true);
    await qnBLToggle(); qnBLPick('KITCHEN'); const two = _step2().open; $('blNewRow').click();
    const fresh = { shut: !$('catModal').classList.contains('show'), chip: _chip().textContent.trim(), row: qnBLRow };
    await _send(); const B = _board(), k = B.rooms.find(r => r.name === 'KITCHEN');
    return { bath, two, fresh, n: k.items.length, last: k.items[k.items.length - 1] };
  });
  ok('a category with NO rows asks nothing more — it shuts at once as before; ➕ A NEW ROW does what v6.97 always did', h.bath.shut && h.bath.chip === '📋 BATH — tap to change' && h.two && h.fresh.shut && h.fresh.chip === '📋 KITCHEN — tap to change' && h.fresh.row === null && h.n === 5 && h.last.n === 'Bath fan needs a new switch' && h.last.s === 'todo' && h.last.src === 'grinder', JSON.stringify(h));

  const bk = await page.evaluate(async () => {
    $('askText').value = 'Garage door is here'; updateStepFlow(); _pickJob('Oak House'); await qnBLToggle(); qnBLPick('GARAGE / LOFT');
    document.querySelector('#blRowGrid [data-bl-row="m5"]').click(); const picked = { ...qnBLRow };
    [...$('catBox').querySelectorAll('button')].find(b => /Back to the categories/.test(b.textContent)).click();
    const back = { title: ($('catBox').querySelector('h3') || {}).textContent.replace(/\s+/g, ' ').trim(), row: qnBLRow, open: $('catModal').classList.contains('show') };
    qnBLOff(true); return { picked, back };
  });
  ok('‹ Back to the categories lets the row go and shows the categories again', bk.picked.id === 'm5' && bk.picked.light === 'R' && /Where on the Build List/.test(bk.back.title) && bk.back.row === null && bk.back.open, JSON.stringify(bk));

  const gone = await page.evaluate(async () => {
    $('askText').value = 'Garage door is here, in the driveway'; updateStepFlow(); _pickJob('Oak House'); await qnBLToggle(); qnBLPick('GARAGE / LOFT');
    document.querySelector('#blRowGrid [data-bl-row="m5"]').click(); blRowDone();
    const B = _board(); B.rooms.find(r => r.name === 'GARAGE / LOFT').items = []; _dbxFiles[_OFF] = JSON.stringify(B);   // another phone took the row off in between
    _said.length = 0; await _send();
    const B2 = _board(), g = B2.rooms.find(r => r.name === 'GARAGE / LOFT'), e = entries.find(x => /in the driveway/.test(x.details));
    return { n: g.items.length, it: g.items[0], ref: e && e.matRef, said: _said.join(' | ') };
  });
  ok('the row gone from the board between the pick and SEND: the words are not lost — a new row, and he is told', gone.n === 1 && gone.it && /Garage door is here/.test(gone.it.n) && gone.it.src === 'grinder' && gone.ref && !gone.ref.on && /⚠ "Garage door" is not on the Oak House Build List any more — your note went on as a new row under GARAGE \/ LOFT/.test(gone.said), JSON.stringify(gone));

  console.log('— 📋 the board open on the screen —');
  const op = await page.evaluate(async () => {
    await openMaterials(0); await new Promise(r => setTimeout(r, 200)); _matRmShut = new Set(); renderMatMgr();
    $('askText').value = 'Kitchen sink has arrived'; updateStepFlow(); _pickJob('Oak House'); await qnBLToggle(); qnBLPick('KITCHEN');
    document.querySelector('#blRowGrid [data-bl-row="m1"]').click(); blRowDone();
    _ups.length = 0; await _send();
    const it = matFindItem('m1'), rowEl = [...document.querySelectorAll('#revBox .mat-item, #revBox [data-id="m1"]')].find(el => /Kitchen sink/.test(el.textContent));
    const lit = rowEl ? [...rowEl.querySelectorAll('.mat-box')].filter(b => b.getAttribute('aria-pressed') === 'true').map(b => b.textContent.replace(/\s+/g, ' ').trim()) : null;
    const r = { s: it.s, sel: it.sel, dirty: _matDirty, ups: _ups.filter(p => /materials-office/.test(p)).length, lit, open: $('revModal').classList.contains('show') };
    matClose(); closeReview(); return r;
  });
  ok('with that board OPEN on the screen the row changes right there (📦 lit on the row) and the board saves itself — no second write of the file around it', op.open && op.s === 'arrived' && /Kitchen sink has arrived/.test(op.sel) && op.ups === 0 && op.dirty && Array.isArray(op.lit) && op.lit.some(t => /R/.test(t)) && op.lit.some(t => /O/.test(t)), JSON.stringify(op));

  ok('the row plates are a finger tall and nothing runs off the side at 390px', await page.evaluate(async () => {
    $('askText').value = 'Faucet'; updateStepFlow(); _pickJob('Oak House'); await qnBLToggle(); qnBLPick('KITCHEN'); document.querySelector('#blRowGrid [data-bl-row="m2"]').click();
    const hs = [...document.querySelectorAll('#blRowGrid .bl-row, #blLightGrid .bl-light, #blNewRow')].map(b => b.getBoundingClientRect().height);
    const r = hs.every(h => h >= 44) && _step2().fits && document.documentElement.scrollWidth <= document.documentElement.clientWidth; qnBLOff(true); return r; }));

  ok('version bumped — APP_VER and the footer agree', /const APP_VER = 'v7\.(5[3-9]|[6-9]\d)'/.test(src) && new RegExp('<footer>' + (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1].replace('.', '\\.') + ' ·').test(src));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
