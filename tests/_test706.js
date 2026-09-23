// 📐 v7.06 — THE PLAN RACK: BIG DROP BOXES, FOUR STANDARD SLOTS. Eric: "On the plan rack, make the drag-and-drop areas
// bigger and have it always have whole project, trusses, windows, and cabinets. Categories as a default."
// Also: a long file name kept its ending (a set went up as "…layou", no .pdf, and would not open as a PDF), and a paper
// whose name has no ending is told apart by its first bytes. Every name in this file is made up.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), { fileURLToPath } = require('url');
(async () => {
  const appUrl = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const src = fs.readFileSync(path.join(path.dirname(fileURLToPath(appUrl)), 'index.html'), 'utf8');
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };
  const errs = [];
  // one page = one window size; the rack files live in a fake Dropbox inside the page, every write is recorded
  const open = async (viewport, mobile) => {
    const ctx = await browser.newContext({ viewport, isMobile: mobile, hasTouch: mobile });
    const page = await ctx.newPage();
    page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
    await page.goto(appUrl); await page.waitForTimeout(700);
    await page.evaluate(() => {
      jobs = ['Oak House']; entries = []; todos = []; pendingQueue = []; window.scheduleSave = () => {}; dbx.refreshToken = 'x';
      renderJobSelects(); closePanels(); renderAll();
      _portalIdx = { clients: [
        { key: 'oak', job: 'Oak House', code: 'oak-aaaaaa' },      // no rack file yet
        { key: 'pine', job: 'Pine Cabin', code: 'pine-bbbbbb' },   // a rack saved before v7.06, with a slot of his own
        { key: 'elm', job: 'Elm Shop', code: 'elm-cccccc' },       // Trusses was taken off; "cabinets" made by hand
        { key: 'ash', job: 'Ash Barn', code: 'ash-dddddd' } ] };  // an old rack with the standard three
      const set = (rev, date, note, name) => ({ rev, date, file: '/Clore DayLog/Plans/x/' + name, fname: name, note });
      window._racks = {
        'pine-bbbbbb': { slots: [
          { key: 'whole', name: 'Whole project', cur: set(2, '2026-09-01', 'bigger shower', 'R2 pine.pdf'), hist: [set(1, '2026-08-01', 'first set', 'R1 pine.pdf')] },
          { key: 'windows', name: 'Windows', cur: set(1, '2026-08-02', 'window quote', 'R1 win.pdf'), hist: [] },
          { key: 'trusses', name: 'Trusses', cur: null, hist: [] },
          { key: 'kitchen', name: 'Kitchen', cur: null, hist: [] } ] },
        'elm-cccccc': { slots: [
          { key: 'whole', name: 'Whole project', cur: null, hist: [] },
          { key: 'windows', name: 'Windows', cur: null, hist: [] },
          { key: 'cab', name: 'cabinets', cur: set(1, '2026-07-01', 'kitchen layout', 'R1 cab.pdf'), hist: [] },
          { key: 'septic', name: 'Septic', cur: null, hist: [] } ] },
        'ash-dddddd': { slots: [
          { key: 'whole', name: 'Whole project', cur: set(1, '2026-09-15', 'downstairs plans', 'R1 ash.pdf'), hist: [] },
          { key: 'trusses', name: 'Trusses', cur: null, hist: [] },
          { key: 'windows', name: 'Windows', cur: null, hist: [] } ] } };
      window._before = JSON.parse(JSON.stringify(_racks));
      window._writes = [];
      window.dbxDownload = async p => { const m = String(p).match(/plans-([a-z]+-[a-z]+)\.json$/i); return m && _racks[m[1]] ? JSON.stringify(_racks[m[1]]) : null; };
      window.dbxUpload = async (p, body) => { _writes.push({ p: String(p), body }); return { path_display: String(p) }; };
      window._toasts = []; window.toast = (m) => { _toasts.push(String(m)); };
    });
    return { ctx, page };
  };

  // ───────────────────────── the phone ─────────────────────────
  const { ctx: phoneCtx, page } = await open({ width: 390, height: 844 }, true);
  console.log('— 📐 v7.06 four standard slots —');

  ok('a job with no rack yet opens on the four standard slots, in order: Whole project · Trusses · Windows · Cabinets', await page.evaluate(async () => {
    await openPlanRack(0);
    const names = _pkD.slots.map(s => s.name).join('|');
    const heads = [...document.querySelectorAll('#revBox .pk-slot h4')].map(h => h.textContent.trim().split('\n')[0].trim());
    return names === 'Whole project|Trusses|Windows|Cabinets' && heads.join('|') === '📐 Whole project|📐 Trusses|📐 Windows|📐 Cabinets';
  }));
  ok('opening a rack writes nothing — the standard slots ride along with the next real change', await page.evaluate(() => _writes.length === 0));

  ok('a rack saved before v7.06 gains Cabinets; the four come first in order, his own slot follows; every set, note and piece of history is untouched', await page.evaluate(async () => {
    closePlanRack(); await openPlanRack(1);
    const keys = _pkD.slots.map(s => s.key).join(',');
    const same = k => JSON.stringify(_pkD.slots.find(s => s.key === k)) === JSON.stringify(_before['pine-bbbbbb'].slots.find(s => s.key === k));
    return keys === 'whole,trusses,windows,cabinets,kitchen' && ['whole', 'windows', 'trusses', 'kitchen'].every(same) && _writes.length === 0;
  }));
  ok('a rack whose Trusses was taken off gets it back, and a slot he named "cabinets" by hand IS the Cabinets slot — found by name, not doubled, its set kept', await page.evaluate(async () => {
    closePlanRack(); await openPlanRack(2);
    const s = _pkD.slots;
    return s.map(x => x.key).join(',') === 'whole,trusses,windows,cab,septic' && s[3].cur && s[3].cur.note === 'kitchen layout'
      && s.filter(x => /cabinets/i.test(x.name)).length === 1;
  }));
  ok('an old rack with the standard three gets Cabinets at the end of the four', await page.evaluate(async () => {
    closePlanRack(); await openPlanRack(3);
    return _pkD.slots.map(s => s.name).join('|') === 'Whole project|Trusses|Windows|Cabinets' && _pkD.slots[0].cur.rev === 1;
  }));

  ok('an EMPTY standard slot wears no ✕ — it cannot come off the rack', await page.evaluate(() => {
    const x = si => document.querySelectorAll('#revBox .pk-slot')[si].querySelector('h4 button');
    return !x(1) && !x(2) && !x(3) && !!x(0);
  }));
  ok('a standard slot with a set: ✕ arms "⚠ SURE? Empties it", the second tap EMPTIES it — the slot stays, the rack is written once', await page.evaluate(async () => {
    const btn = () => document.querySelectorAll('#revBox .pk-slot')[0].querySelector('h4 button');
    await pkDelSlot(0);
    const armed = /SURE\? Empties it/.test(btn().textContent);
    const w0 = _writes.length;
    await pkDelSlot(0);
    const s = _pkD.slots[0];
    const saved = JSON.parse(_writes[_writes.length - 1].body);
    return armed && s.key === 'whole' && s.cur === null && s.hist.length === 0 && _pkD.slots.length === 4
      && _writes.length === w0 + 1 && saved.slots.map(x => x.key).join(',') === 'whole,trusses,windows,cabinets'
      && _toasts.some(t => /Whole project emptied — the slot stays/.test(t));
  }));
  ok('a slot of his own still comes off with its ✕, as before', await page.evaluate(async () => {
    closePlanRack(); await openPlanRack(2);
    await pkDelSlot(4);   // Septic — empty, one tap
    return _pkD.slots.map(s => s.key).join(',') === 'whole,trusses,windows,cab' && _toasts.some(t => /Septic slot gone/.test(t));
  }));
  ok('➕ slot refuses a name already on the rack — "whole project" and "CABINETS" are not made twice', await page.evaluate(async () => {
    const n = _pkD.slots.length;
    $('pkNewSlot').value = 'whole project'; await pkAddSlot();
    $('pkNewSlot').value = 'CABINETS'; await pkAddSlot();
    $('pkNewSlot').value = 'Electrical layout'; await pkAddSlot();
    return _pkD.slots.length === n + 1 && _pkD.slots[n].name === 'Electrical layout';
  }));

  console.log('— 📐 v7.06 bigger drop boxes —');

  ok('on the phone every drop box is a big target: 110px+ tall and the card\'s full width (it was 62px)', await page.evaluate(async () => {
    closePlanRack(); await openPlanRack(0);
    return [...document.querySelectorAll('#revBox .pk-drop')].every(d => {
      const r = d.getBoundingClientRect(), card = d.closest('.pk-slot').getBoundingClientRect();
      return r.height >= 110 && r.width >= card.width - 40;
    }) && document.querySelectorAll('#revBox .pk-drop').length === 4;
  }));
  ok('the rack never scrolls sideways on the phone', await page.evaluate(() => $('revBox').scrollWidth <= $('revBox').clientWidth + 1));
  ok('a tap on the box — or Enter on it — still opens the file picker for THAT slot', await page.evaluate(() => {
    const hits = [];
    const inp = $('pkFile-trusses'); inp.click = () => hits.push('t');
    $('pkFile-windows').click = () => hits.push('w');
    $('pkDrop-trusses').click();
    $('pkDrop-windows').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    return hits.join('') === 'tw';
  }));
  ok('the box says what it is in words: "Drop the new Trusses set here", "drag the PDF onto this box — or tap to pick a file"', await page.evaluate(() => {
    const t = $('pkDrop-trusses').innerText;
    return /Drop the new Trusses set here/.test(t) && /drag the PDF onto this box — or tap to pick a file/.test(t) && !/LET GO/.test(t);
  }));

  const fileDT = (names) => { const dt = new DataTransfer(); names.forEach(n => dt.items.add(new File(['%PDF-1.4 made up'], n, { type: 'application/pdf' }))); return dt; };
  await page.evaluate(`window.fileDT = ${fileDT.toString()}`);
  ok('a file dragged over ANY part of the Trusses card — here its heading — lights its box: a solid edge, a tinted plate, and the words turn to ⬇ LET GO', await page.evaluate(() => {
    const card = document.querySelector('.pk-slot[data-pk="trusses"]'), h4 = card.querySelector('h4'), box = $('pkDrop-trusses');
    const before = getComputedStyle(box).borderTopStyle;
    h4.dispatchEvent(new DragEvent('dragover', { dataTransfer: fileDT(['truss set.pdf']), bubbles: true, cancelable: true }));
    const cs = getComputedStyle(box), hot = box.querySelector('.pk-drop-hot'), idle = box.querySelector('.pk-drop-idle');
    return before === 'dashed' && card.classList.contains('pk-hot') && cs.borderTopStyle === 'solid' && cs.backgroundColor !== 'rgba(0, 0, 0, 0)'
      && getComputedStyle(hot).display !== 'none' && getComputedStyle(idle).display === 'none' && /⬇ LET GO — it goes in as Trusses R1/.test(hot.innerText);
  }));
  ok('moving off the card puts the box back the way it was', await page.evaluate(() => {
    const card = document.querySelector('.pk-slot[data-pk="trusses"]'), box = $('pkDrop-trusses');
    card.dispatchEvent(new DragEvent('dragleave', { bubbles: true, relatedTarget: document.body }));
    return !card.classList.contains('pk-hot') && getComputedStyle(box).borderTopStyle === 'dashed' && getComputedStyle(box.querySelector('.pk-drop-hot')).display === 'none';
  }));
  ok('dragging plain words over a card does not light it — only a file does', await page.evaluate(() => {
    const card = document.querySelector('.pk-slot[data-pk="windows"]'), dt = new DataTransfer(); dt.setData('text/plain', 'hello');
    card.dispatchEvent(new DragEvent('dragover', { dataTransfer: dt, bubbles: true, cancelable: true }));
    return !card.classList.contains('pk-hot');
  }));
  ok('let go on the heading: the file waits in TRUSSES for "what changed", and no other slot moved', await page.evaluate(() => {
    const h4 = document.querySelector('.pk-slot[data-pk="trusses"] h4');
    h4.dispatchEvent(new DragEvent('drop', { dataTransfer: fileDT(['truss set.pdf']), bubbles: true, cancelable: true }));
    const t = document.querySelector('.pk-slot[data-pk="trusses"]').innerText;
    return _pkPend.trusses && _pkPend.trusses.name === 'truss set.pdf' && /truss set\.pdf/.test(t) && /ready to go in as R1/.test(t)
      && !!$('pkNote-trusses') && Object.keys(_pkPend).join() === 'trusses' && !document.querySelector('.pk-slot.pk-hot');
  }));
  ok('the "what changed" box is a real writing box — a thumb tall, not a thin line', await page.evaluate(() => {
    const b = $('pkNote-trusses'), r = b.getBoundingClientRect();
    return r.height >= 44 && r.width >= 150 && getComputedStyle(b).borderTopStyle !== 'none';
  }));
  ok('two files dropped at once: the first goes in and he is told so', await page.evaluate(() => {
    const card = document.querySelector('.pk-slot[data-pk="cabinets"]');
    card.dispatchEvent(new DragEvent('drop', { dataTransfer: fileDT(['upper cabinets.pdf', 'lower cabinets.pdf']), bubbles: true, cancelable: true }));
    return _pkPend.cabinets.name === 'upper cabinets.pdf' && _toasts.some(t => /One set per slot — took the first file, upper cabinets\.pdf/.test(t));
  }));

  console.log('— 📐 v7.06 a long name keeps its ending —');

  ok('a long file name is shortened in FRONT of its ending: it still ends .pdf, and the name is 60 characters or fewer', await page.evaluate(async () => {
    _pkPend.windows = new File(['%PDF-1.4'], 'Oak House lower level remodel plan pages 4 and 5 layout with the notes.pdf', { type: 'application/pdf' });
    renderPlanRack(); $('pkNote-windows').value = 'first window set';
    await pkStamp('windows');
    const up = _writes.find(w => /\/Plans\/oak-aaaaaa\/windows\//.test(w.p));
    const name = up.p.split('/').pop().replace(/^R1 /, '');
    return !!up && /\.pdf$/.test(up.p) && name.length <= 60 && _pkD.slots.find(s => s.key === 'windows').cur.fname === name;
  }));
  ok('a PDF whose name has no ending at all gets .pdf', await page.evaluate(async () => {
    _pkPend.cabinets = new File(['%PDF-1.4'], 'cabinet layout', { type: 'application/pdf' });
    renderPlanRack(); $('pkNote-cabinets').value = 'kitchen and baths';
    await pkStamp('cabinets');
    return _writes.some(w => /\/Plans\/oak-aaaaaa\/cabinets\/R1 cabinet layout\.pdf$/.test(w.p));
  }));
  ok('a paper saved WITHOUT its ending opens as a PDF — told by its first bytes; a JPEG likewise; a .pdf name as before', await page.evaluate(async () => {
    const types = [];
    const mk = URL.createObjectURL; URL.createObjectURL = b => { types.push(b.type); return 'blob:x'; };
    window.getToken = async () => 't';
    const bytes = { pdf: [37, 80, 68, 70, 45, 49], jpg: [0xFF, 0xD8, 0xFF, 0xE0, 0, 16] };
    let want = 'pdf';
    const f0 = window.fetch; window.fetch = async () => new Response(new Uint8Array(bytes[want]), { headers: { 'content-type': 'application/octet-stream' } });
    await matOpenDoc('/Clore DayLog/Plans/oak-aaaaaa/whole/R1 lower level remodel plan pg4 pg5 layou');
    want = 'jpg'; await matOpenDoc('/Clore DayLog/Plans/oak-aaaaaa/whole/R2 site photo');
    want = 'pdf'; await matOpenDoc('/Clore DayLog/Plans/oak-aaaaaa/whole/R3 plans.pdf');
    URL.createObjectURL = mk; window.fetch = f0;
    $('cliPrev').classList.remove('show');
    return types.join(',') === 'application/pdf,image/jpeg,application/pdf';
  }));
  await phoneCtx.close();

  // ───────────────────────── the PC ─────────────────────────
  console.log('— 📐 v7.06 on the PC —');
  const { ctx: pcCtx, page: pc } = await open({ width: 1280, height: 800 }, false);
  const pcLay = await pc.evaluate(async () => {
    await openPlanRack(3);   // Whole project holds a set, the other three are empty
    const boxes = [...document.querySelectorAll('#revBox .pk-drop')].map(d => d.getBoundingClientRect());
    const cards = [...document.querySelectorAll('#revBox .pk-slot')].map(d => d.getBoundingClientRect());
    return { n: boxes.length, h: boxes.map(b => Math.round(b.height)), tops: cards.map(c => Math.round(c.top)), lefts: cards.map(c => Math.round(c.left)),
      bottom: Math.round(boxes[3].bottom), inner: innerHeight };
  });
  ok('the slots sit two across: Whole project beside Trusses, Windows beside Cabinets', pcLay.tops[0] === pcLay.tops[1] && pcLay.tops[2] === pcLay.tops[3]
    && pcLay.tops[2] > pcLay.tops[0] && pcLay.lefts[1] > pcLay.lefts[0] && pcLay.lefts[0] === pcLay.lefts[2], JSON.stringify(pcLay));
  ok('every drop box on the PC is 180px tall — four times the old 45px strip', pcLay.n === 4 && pcLay.h.every(h => h >= 180), JSON.stringify(pcLay.h));
  ok('all four standard drop boxes are on the screen at once (a file being dragged cannot scroll to the one below)', pcLay.bottom <= pcLay.inner, JSON.stringify(pcLay));
  await pc.setViewportSize({ width: 1700, height: 900 });
  ok('on a wide screen the rack keeps a readable width (1100px), so a name and its ✕ are not a screen apart', await pc.evaluate(() => {
    const w = document.querySelector('#revBox .pk-wrap').getBoundingClientRect().width;
    return w <= 1100 && w > 900;
  }));
  await pcCtx.close();

  ok('the rack\'s ✕ Close still wears the black-on-gold plate (v6.81)', (() => {
    const i = src.indexOf('onclick="closePlanRack()"'); return i > 0 && /x-plate/.test(src.slice(Math.max(0, i - 200), i));
  })());
  ok('no page errors', errs.length === 0, errs.join(' | '));
  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close(); process.exit(fail ? 1 : 0);
})();
