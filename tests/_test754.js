// 🧾 v7.54 — A RECEIPT NAMES THE ROW BY ITS SKU. Eric's "yes" to the offer after v7.53: a Build List row can carry a SKU / model
// (v7.08) and the Wizard's receipt read prints the store's codes exactly as printed (v7.43's 🛒 line) — so a receipt ground on a
// job names the row it paid for by the EXACT code (five or more characters, case and spacing aside), never by a guess at a word:
// the WHERE window lists those rows first under 🧾 On this receipt, a tap lands on the row with 🛒 Ordered pre-lit (bought), or
// 📦 Received when the row was already ordered (in hand); his tap decides; SEND moves the light and puts the words on the row.
// Every name, code and figure below is made up.
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

  await page.evaluate(() => {
    jobs = ['Oak House']; curJob = ''; crew = ['Phil']; entries = []; todos = []; nextId = 1; pendingQueue = []; prefs.tags = ['Lumber yard'];
    window.scheduleSave = () => {}; window.savePendingSoon = () => {}; window.publishSharedNotes = () => {};
    renderJobSelects(); closePanels(); renderAll();
    dbx.refreshToken = 'test-token';
    _portalIdx = { clients: [{ key: 'oak', job: 'Oak House', code: 'oak-111aaa' }] };
    window._dbxFiles = {}; window._ups = [];
    window.dbxDownload = async p => (window._dbxFiles || {})[p] ?? null;
    window.dbxUpload = async (p, body) => { window._ups.push(p); window._dbxFiles[p] = body; return {}; };
    window.dbxPathExists = async p => Object.prototype.hasOwnProperty.call(window._dbxFiles || {}, p);
    window._OFF = portalRoot() + '/materials-office-oak-111aaa.json';
    _dbxFiles[_OFF] = JSON.stringify({ full: true, seq: 5, updated: '2026-09-10', hist: [], rooms: [
      { name: 'KITCHEN', items: [
        { id: 'm1', n: 'Faucet', t: 'Misc', buy: true, s: 'pick', sku: 'DEL-9159-DST' },
        { id: 'm2', n: 'Kitchen sink', t: 'Misc', buy: true, s: 'ordered', odate: '2026-09-20', sku: 'KRA-KHU100-30' },
        { id: 'm3', n: 'Tile', t: 'Misc', buy: true, s: 'pick', sku: 'T12' }] },
      { name: 'BATH', items: [{ id: 'm4', n: 'Bath fan', t: 'Misc', buy: true, s: 'pick', sku: 'PAN-FV0511' }] }] });
    window._said = []; const t0 = window.toast, u0 = window.toastUndo;
    window.toast = (m, good) => { if (m) _said.push(String(m)); return t0(m, good); };
    window.toastUndo = (m, fn) => { _said.push(String(m)); window._undo = fn; return u0(m, fn); };
    window._board = () => JSON.parse(_dbxFiles[_OFF]);
    window._row = id => { const B = _board(); for (const r of B.rooms) { const f = (r.items || []).find(x => x.id === id); if (f) return f; } return null; };
    window._pickJob = j => { qnJobPick = j; const s = $('qnJob'); if (s) s.value = j; updateStepFlow(); };
    window._send = async () => { saveNoteFrom('askText'); await _blLine; await new Promise(r => setTimeout(r, 30)); };
    window._sku = () => [...document.querySelectorAll('#blSkuGrid .bl-row')].map(b => ({ id: b.dataset.blSku, t: b.textContent.replace(/\s+/g, ' ').trim() }));
    window._rows = () => [...document.querySelectorAll('#blRowGrid .bl-row')].map(b => ({ id: b.dataset.blRow, t: b.textContent.replace(/\s+/g, ' ').trim(), sel: b.classList.contains('sel'), named: b.classList.contains('bl-named') }));
    window._lights = () => [...document.querySelectorAll('#blLightGrid .bl-light')].map(b => ({ k: b.dataset.blLight, t: b.textContent.replace(/\s+/g, ' ').trim(), sel: b.classList.contains('sel') }));
    // what the Wizard's read leaves in ③ SAY IT for a store receipt (v7.43): the day, the store, the amount, the items — a code copied as printed
    window._READ = '📅 2026-09-29\n🏪 Peninsula Builders Supply\n💵 $412.37\n🛒 "DEL-9159-DST" · deck screws 5 lb · "KRA KHU100 30" · shims';
  });

  console.log('— 🧾 the receipt names the rows —');
  const a = await page.evaluate(async () => {
    $('askText').value = _READ; updateStepFlow(); _pickJob('Oak House'); await qnBLToggle();
    return { open: $('catModal').classList.contains('show'), sku: _sku(), title: $('catBox').querySelector('h3').textContent.replace(/✕/g, '').replace(/\s+/g, ' ').trim(), rooms: !!$('blRoomGrid') };
  });
  ok('the WHERE window leads with 🧾 On this receipt: the rows whose SKU is on it, across the board — by the exact code (dashes and spaces aside); a four-character code never matches, and a row not on the receipt is not listed', a.open && /Where on the Build List/.test(a.title) && a.rooms && a.sku.map(x => x.id).join() === 'm1,m2' && /^🧾 Faucet KITCHEN · pick needed · SKU DEL-9159-DST$/.test(a.sku[0].t) && /^🧾 Kitchen sink KITCHEN · ordered · SKU KRA-KHU100-30$/.test(a.sku[1].t), JSON.stringify(a));

  const b = await page.evaluate(() => { document.querySelector('#blSkuGrid [data-bl-sku="m1"]').click(); return { room: qnBLRoom, row: qnBLRow, rows: _rows(), lights: _lights(), title: $('catBox').querySelector('h3').textContent.replace(/✕/g, '').replace(/\s+/g, ' ').trim() }; });
  ok('a tap on it jumps to KITCHEN with Faucet picked — first, and saying WHY it is first — and 🛒 Ordered pre-lit: bought', b.room === 'KITCHEN' && /KITCHEN — a new row, or one already here/.test(b.title) && b.row && b.row.id === 'm1' && b.row.light === 'O' && b.row.whyKind === 'sku' && b.rows[0].id === 'm1' && b.rows[0].sel && b.rows[0].named && /its SKU is on this receipt/.test(b.rows[0].t) && b.lights.find(l => l.k === 'O').sel && /its SKU is on this receipt — bought/.test(b.lights.find(l => l.k === 'O').t) && !b.lights.find(l => l.k === 'R').sel, JSON.stringify(b));
  ok('the other row on the receipt is listed too, marked the same way, second', b.rows[1].id === 'm2' && b.rows[1].named && /its SKU is on this receipt/.test(b.rows[1].t) && !b.rows[1].sel && b.rows[2].id === 'm3' && !b.rows[2].named, JSON.stringify(b.rows));

  const s = await page.evaluate(async () => {
    blRowDone(); _said.length = 0; await _send();
    const it = _row('m1'), e = entries.find(x => /DEL-9159-DST/.test(x.details));
    return { it, ref: e && e.matRef, said: _said.join(' | '), n: _board().rooms.find(r => r.name === 'KITCHEN').items.length };
  });
  ok('SEND: the faucet is Picked · Ordered (the chain), the receipt\'s words are on its note, the log points at the row — no new row', s.it.s === 'ordered' && s.it.odate && /DEL-9159-DST/.test(s.it.sel) && s.ref && s.ref.on === 'Faucet' && s.ref.light === '🛒 Ordered' && s.n === 3 && /📋 Build List → KITCHEN · Faucet · 🛒 Ordered ✓/.test(s.said), JSON.stringify(s));

  const c = await page.evaluate(async () => {
    $('askText').value = _READ; updateStepFlow(); _pickJob('Oak House'); await qnBLToggle();
    const sku = _sku(); document.querySelector('#blSkuGrid [data-bl-sku="m2"]').click();
    const row = { ...qnBLRow }, lights = _lights();
    blRowDone(); _said.length = 0; await _send();
    return { sku: sku.map(x => x.t), row, lights, it: _row('m2'), said: _said.join(' | ') };
  });
  ok('the same receipt again: the faucet now reads "ordered" on the list; the sink was ALREADY ordered, so its jump pre-lights 📦 Received — in hand — and SEND lands it', /Faucet KITCHEN · ordered/.test(c.sku[0]) && c.row.id === 'm2' && c.row.light === 'R' && c.row.whyKind === 'sku' && /its SKU is on this receipt — in hand/.test(c.lights.find(l => l.k === 'R').t) && c.it.s === 'arrived' && /📋 Build List → KITCHEN · Kitchen sink · 📦 Received ✓/.test(c.said), JSON.stringify(c));

  const w = await page.evaluate(async () => {
    $('askText').value = 'Faucet arrived, boxed\n🛒 "DEL-9159-DST"'; updateStepFlow(); _pickJob('Oak House'); await qnBLToggle(); qnBLPick('KITCHEN');
    const rows = _rows(); document.querySelector('#blRowGrid [data-bl-row="m1"]').click();
    const row = { ...qnBLRow }, lights = _lights(); qnBLOff(true); return { rows, row, lights };
  });
  ok('his WORDS come first: "arrived" with the SKU on the same note pre-lights 📦 Received (your note says "arrived"), and the plate says both reasons the row is first', w.rows[0].id === 'm1' && /its SKU is on this receipt · named in your note/.test(w.rows[0].t) && w.row.light === 'R' && w.row.whyKind === 'word' && w.row.why === 'arrived' && /your note says "arrived"/.test(w.lights.find(l => l.k === 'R').t), JSON.stringify(w));

  const t = await page.evaluate(async () => {
    $('askText').value = 'T12 tile came in, 40 boxes'; updateStepFlow(); _pickJob('Oak House'); await qnBLToggle();
    const grid = !!$('blSkuGrid'); qnBLPick('KITCHEN'); const rows = _rows(); qnBLOff(true);
    return { grid, rows: rows.map(r => [r.id, r.named, r.t]) };
  });
  ok('a short code (T12) never matches as a SKU — no 🧾 block; the row is still found by its NAME ("tile"), named in your note, nothing more', !t.grid && t.rows[0][0] === 'm3' && t.rows[0][1] && /named in your note/.test(t.rows[0][2]) && !/SKU/.test(t.rows[0][2]), JSON.stringify(t));

  const p = await page.evaluate(async () => {
    $('askText').value = 'Order the under-cabinet lights'; updateStepFlow(); _pickJob('Oak House'); await qnBLToggle();
    const grid = !!$('blSkuGrid'), rooms = [...$('blRoomGrid').querySelectorAll('button')].length; qnBLOff(true); return { grid, rooms };
  });
  ok('a plain note with no code on it: the window is exactly v7.53\'s — no 🧾 block, the categories as before', !p.grid && p.rooms === 2, JSON.stringify(p));

  ok('the SKU match is exact: the same characters, case and spacing aside, five or more of them', await page.evaluate(() => {
    const it = { sku: 'DEL-9159-DST' }, it4 = { sku: 'A-1' };
    return blRowsBySku('bought "del 9159 dst" today', [it]).length === 1 && blRowsBySku('DEL-9159-DSX', [it]).length === 0 && blRowsBySku('a-1 a-1 a-1', [it4]).length === 0 && blRowsBySku('nothing', [{ n: 'x' }]).length === 0;
  }));

  ok('version bumped — APP_VER and the footer agree', /const APP_VER = 'v7\.(5[4-9]|[6-9]\d)'/.test(src) && new RegExp('<footer>' + (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1].replace('.', '\\.') + ' ·').test(src));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
