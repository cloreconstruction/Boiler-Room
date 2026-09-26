// 📋 v6.97 — THE GRINDER → THE BUILD LIST. Eric: "how can i put something into the grinder and have it land on the build
// list?" — there was no door; offered; "go". A 📋 Build List chip in ④ TAG IT: the job first, then WHERE (that job's own
// categories, or a new one); SEND files the note as always AND puts it on the job's Build List as a checklist item.
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

  await page.evaluate(() => {
    jobs = ['Oak House', 'Mery']; curJob = ''; crew = ['Phil']; entries = []; todos = []; nextId = 1; pendingQueue = []; prefs.tags = ['Personal', 'Lumber yard'];
    window.scheduleSave = () => {}; window.savePendingSoon = () => {}; window.publishSharedNotes = () => {};
    renderJobSelects(); closePanels(); renderAll();
    dbx.refreshToken = 'test-token';
    _portalIdx = { clients: [{ key: 'oak', job: 'Oak House', code: 'oak-111aaa' }] };
    window._dbxFiles = {}; window._ups = []; window._failUp = false;
    window.dbxDownload = async p => (window._dbxFiles || {})[p] ?? null;
    window.dbxUpload = async (p, body) => { if (window._failUp && /materials-office/.test(p)) throw new Error('upload failed (503)'); window._ups.push(p); window._dbxFiles[p] = body; return {}; };
    window.dbxPathExists = async p => Object.prototype.hasOwnProperty.call(window._dbxFiles || {}, p);
    window._OFF = portalRoot() + '/materials-office-oak-111aaa.json'; window._CLI = portalRoot() + '/materials-oak-111aaa.json';
    _dbxFiles[_OFF] = JSON.stringify({ full: true, seq: 3, updated: '2026-09-10', hist: [], rooms: [
      { name: 'KITCHEN', items: [{ id: 'm1', n: 'Countertops', t: 'Misc', buy: true, s: 'picked' }, { id: 'm2', n: 'Faucet', t: 'Misc', buy: true, s: 'pick' }] },
      { name: 'GARAGE / LOFT', items: [{ id: 'm3', n: 'Garage door', t: 'Misc', buy: true, s: 'ordered' }] }] });
    window._said = []; const t0 = window.toast, u0 = window.toastUndo;
    window.toast = (m, good) => { if (m) _said.push(String(m)); return t0(m, good); };
    window.toastUndo = (m, fn) => { _said.push(String(m)); window._undo = fn; return u0(m, fn); };
    window._board = () => JSON.parse(_dbxFiles[_OFF]);
    window._pickJob = j => { qnJobPick = j; const s = $('qnJob'); if (s) s.value = j; updateStepFlow(); };
    window._send = async words => { $('askText').value = words; saveNoteFrom('askText'); await _blLine; await new Promise(r => setTimeout(r, 30)); };
    window._chip = () => $('qnBLChip');
  });

  console.log('— 📋 v6.97 the chip and the window —');

  ok('the 📋 Build List chip sits in ④ TAG IT beside ⚠ Heads-up and 🧾 Receipt; with no job on the wheel it asks for the job first and stays off', await page.evaluate(async () => {
    const chips = [...$('qnTagChips').querySelectorAll('button')].map(b => b.textContent.trim());
    const at = chips.findIndex(c => /Build List/.test(c));
    _said.length = 0; await qnBLToggle();
    return at === 2 && /Heads-up/.test(chips[0]) && /Receipt/.test(chips[1]) && !qnBL && /Pick the job first/.test(_said.join(' ')) && _chip().getAttribute('aria-pressed') === 'false';
  }));

  ok('a job with no client page says so in words and stays off — nothing is guessed', await page.evaluate(async () => {
    _pickJob('Mery'); _said.length = 0; await qnBLToggle();
    return !qnBL && /Mery has no client page yet/.test(_said.join(' ')) && !$('catModal').classList.contains('show');
  }));

  const w = await page.evaluate(async () => {
    _pickJob('Oak House'); _ups.length = 0; await qnBLToggle();
    const box = $('catBox'), rooms = [...box.querySelectorAll('#blRoomGrid button')].map(b => b.textContent.replace(/\s+/g, ' ').trim());
    return { open: $('catModal').classList.contains('show'), title: box.querySelector('h3').textContent.replace(/\s+/g, ' ').trim(), rooms, newBox: !!$('blNewRoom'), words: box.textContent.replace(/\s+/g, ' '), ups: _ups.length, lit: qnBL };
  });
  ok('with the job picked, the chip opens a WINDOW that asks where: that job\'s own categories with their counts, a box for a new one — and nothing is written yet', w.open && /Where on the Build List/.test(w.title) && w.rooms.join('|') === '📋 KITCHEN 2 rows|📋 GARAGE / LOFT 1 row' && w.newBox && /Oak House Build List/.test(w.words) && /checklist item/.test(w.words) && w.ups === 0 && w.lit, JSON.stringify(w));

  ok('pick KITCHEN: the window shuts, the chip reads "📋 KITCHEN — tap to change", step ④ is done and its folded line says where the note is going', await page.evaluate(() => {
    [...$('blRoomGrid').querySelectorAll('button')][0].click();
    const step = document.querySelector('#qnCard .g-step[data-step="4"]');
    $('askText').value = 'x'; updateStepFlow(); const sum = step.querySelector('.g-step-sum').textContent; $('askText').value = ''; updateStepFlow();
    return !$('catModal').classList.contains('show') && /📋 KITCHEN — tap to change/.test(_chip().textContent) && _chip().getAttribute('aria-pressed') === 'true' && /📋 Build List → KITCHEN/.test(sum) && qnBLRoom === 'KITCHEN';
  }));

  console.log('— ⚙ SEND —');

  const s1 = await page.evaluate(async () => {
    _said.length = 0; _ups.length = 0;
    await _send('Order the under-cabinet lights\nwarm white, plug-in\nask about a dimmer');
    const e = entries.find(x => /under-cabinet/.test(x.details)), B = _board(), k = B.rooms.find(r => r.name === 'KITCHEN'), it = k.items[k.items.length - 1];
    return { e: e && { job: e.job, type: e.type, matRef: e.matRef, details: e.details }, it, n: k.items.length, seq: B.seq, hist: (B.hist || []).map(h => h.txt).join(' | '), full: B.full, ups: _ups.filter(p => /materials-office/.test(p)).length, cli: _ups.some(p => /materials-oak-111aaa\.json$/.test(p)),
      said: _said.join(' | '), chipOff: !qnBL && !qnBLRoom && /^📋 Build List$/.test(_chip().textContent.trim()), band: ($('busyBand') || {}).textContent || '' };
  });
  ok('SEND files the note in the log under its job as always…', !!s1.e && s1.e.job === 'Oak House' && s1.e.type === 'Note' && /under-cabinet lights/.test(s1.e.details), JSON.stringify(s1.e));
  ok('…AND puts it on that job\'s Build List, in KITCHEN, as a checklist item: the first line is the name, the rest is the note, the ids tie the two together', s1.n === 3 && s1.it.n === 'Order the under-cabinet lights' && s1.it.sel === 'warm white, plug-in · ask about a dimmer' && s1.it.s === 'todo' && !s1.it.buy && !s1.it.hm && s1.it.src === 'grinder' && s1.it.id === 'm4' && s1.seq === 4 && s1.it.eid === 1 && s1.e.matRef && s1.e.matRef.id === 'm4' && s1.e.matRef.room === 'KITCHEN' && s1.e.matRef.code === 'oak-111aaa', JSON.stringify({ it: s1.it, ref: s1.e && s1.e.matRef }));
  ok('only the OFFICE board is written (once) — never the homeowner\'s file; the board\'s history says where the row came from; the message and the band say it landed; the chip lets go for the next note', s1.ups === 1 && !s1.cli && s1.full === true && /⚙ from the grinder → KITCHEN: Order the under-cabinet lights/.test(s1.hist) && /Note saved · Oak House · 📋 Build List → KITCHEN/.test(s1.said) && /ON THE BUILD LIST — KITCHEN/.test(s1.band) && s1.chipOff, JSON.stringify({ ups: s1.ups, said: s1.said, band: s1.band }));

  ok('on the board the row is a ✅ checklist item that says "⚙ from the grinder", wears its note, and ⇄ turns it into something to buy; the log row wears "📋 Build List → KITCHEN" and the tap opens that board', await page.evaluate(async () => {
    prefs.rlFilter = ''; renderAskRecent();
    const e = entries.find(x => x.matRef); _rlOpen.add(e.id); renderAskRecent();
    const chip = [...document.querySelectorAll('#askRecent .log-meta span')].find(x => /Build List → KITCHEN/.test(x.textContent));
    if (!chip) return 'no chip in the log row';
    chip.click(); await new Promise(r => setTimeout(r, 250));
    _matRmShut = new Set(); renderMatMgr();   // 📁 v7.21 — the board opens folded; this check looks at the row
    const row = [...document.querySelectorAll('#revBox .mat-item')].find(r => r.querySelector('b') && r.querySelector('b').textContent === 'Order the under-cabinet lights');
    if (!row) return 'no row on the board';
    const t = row.textContent.replace(/\s+/g, ' ');
    const lights = [...row.querySelectorAll('.mat-strip:not(.mat-rowbtns) .mat-box b')].map(b => b.textContent).join('');
    const a = /from the grinder/.test(t) && /warm white, plug-in/.test(t) && lights === 'ASD' && !!row.querySelector('.mat-flip');
    row.querySelector('.mat-flip').click();
    const it = _matD.rooms[0].items.find(x => x.id === 'm4'); const b = it.buy === true && it.s === 'pick';
    matBuyToggle('m4'); await matAutoSave(); matClose();
    return a && b;
  }));

  const s2 = await page.evaluate(async () => {
    _pickJob('Oak House'); await qnBLToggle(); $('blNewRoom').value = 'Punch list'; qnBLPick($('blNewRoom').value);
    const chipWords = _chip().textContent.trim();
    await _send('Touch up the paint by the back door');
    _pickJob('Oak House'); await qnBLToggle();
    const rooms = [...$('blRoomGrid').querySelectorAll('button')].map(b => b.textContent.replace(/\s+/g, ' ').trim()); qnBLOff(true);
    const B = _board(), p = B.rooms.find(r => r.name === 'Punch list');
    return { chipWords, room: !!p, row: p && p.items[0], rooms };
  });
  ok('a NEW category typed in the window is made on SEND, and the next time the window lists it', /📋 Punch list — tap to change/.test(s2.chipWords) && s2.room && s2.row.n === 'Touch up the paint by the back door' && !s2.row.sel && s2.rooms.some(r => /Punch list 1 row/.test(r)), JSON.stringify(s2));

  ok('two notes sent in the same breath BOTH land — the rows go on the board one at a time, neither write covers the other', await page.evaluate(async () => {
    const n0 = _board().rooms.find(r => r.name === 'KITCHEN').items.length;
    const a = addEntry('Note', 'First of two at once', 'Oak House', {}), b = addEntry('Note', 'Second of two at once', 'Oak House', {});
    const slow = window.dbxDownload; window.dbxDownload = async p => { await new Promise(r => setTimeout(r, 25)); return slow(p); };
    const p1 = grindToBuildList(a, 'Oak House', 'KITCHEN'), p2 = grindToBuildList(b, 'Oak House', 'KITCHEN');
    await Promise.all([p1, p2]); window.dbxDownload = slow;
    const k = _board().rooms.find(r => r.name === 'KITCHEN').items, names = k.map(x => x.n);
    return k.length === n0 + 2 && names.includes('First of two at once') && names.includes('Second of two at once') && new Set(k.map(x => x.id)).size === k.length;
  }));

  ok('↩ Undo takes the note back AND its row off the board — his words are in the box again', await page.evaluate(async () => {
    _pickJob('Oak House'); await qnBLToggle(); qnBLPick('GARAGE / LOFT');
    await _send('Hang the bike hooks');
    const had = _board().rooms.find(r => r.name === 'GARAGE / LOFT').items.some(x => x.n === 'Hang the bike hooks');
    _undo(); await _blLine; await new Promise(r => setTimeout(r, 30));
    const gone = !_board().rooms.find(r => r.name === 'GARAGE / LOFT').items.some(x => x.n === 'Hang the bike hooks');
    return had && gone && !entries.some(e => e.details === 'Hang the bike hooks') && $('askText').value === 'Hang the bike hooks';
  }));

  console.log('— 🔒 the rules —');

  ok('a 🔒 personal note never goes on a Build List: the chip refuses while Personal is lit, and a note that turns personal after the pick is saved on the phone and NOT put on the board', await page.evaluate(async () => {
    $('askText').value = ''; _pickJob('Oak House'); qnSel = new Set(['Personal']); renderTagChips();
    _said.length = 0; await qnBLToggle(); const refused = !qnBL && /personal note stays on this phone/.test(_said.join(' '));
    qnSel = new Set(); renderTagChips(); await qnBLToggle(); qnBLPick('KITCHEN'); qnSel = new Set(['Personal']); renderTagChips();
    const n0 = JSON.stringify(_board());
    await _send('A private thought about the kitchen');
    const e = entries.find(x => /private thought/.test(x.details));
    return refused && !!e && e.personal === true && !e.matRef && JSON.stringify(_board()) === n0;
  }));

  ok('the job wheel turns under a pick: the pick lets go in words, and SEND never puts a row on the wrong job\'s board', await page.evaluate(async () => {
    qnSel = new Set(); _pickJob('Oak House'); await qnBLToggle(); qnBLPick('KITCHEN');
    _said.length = 0; qnJobPick = 'Mery'; $('qnJob').value = 'Mery'; qnBLJobChanged();
    const let_go = !qnBL && !qnBLRoom && /was for another job/.test(_said.join(' '));
    const n0 = JSON.stringify(_board()); await _send('This one is a Mery note');
    const e = entries.find(x => /Mery note/.test(x.details));
    return let_go && !!e && e.job === 'Mery' && !e.matRef && JSON.stringify(_board()) === n0;
  }));

  ok('if the board cannot be written, the NOTE is still saved and he is told the row did not make it — nothing is half-done in silence', await page.evaluate(async () => {
    _pickJob('Oak House'); await qnBLToggle(); qnBLPick('KITCHEN');
    _failUp = true; _said.length = 0; const n0 = JSON.stringify(_board());
    await _send('Swap the pantry light'); _failUp = false;
    const e = entries.find(x => /pantry light/.test(x.details));
    return !!e && !e.matRef && JSON.stringify(_board()) === n0 && /did not reach the Oak House Build List/.test(_said.join(' ')) && /NOT ON THE BUILD LIST/.test(($('busyBand') || {}).textContent || '');
  }));

  ok('THE WALL: a grinder row he later marks 🏠 rides to their file without his note or the grinder\'s ids', await page.evaluate(async () => {
    await openMaterials(0); _matRmShut = new Set(); renderMatMgr(); const it = _matD.rooms.flatMap(r => r.items).find(x => x.n === 'Order the under-cabinet lights');
    matHmToggle(it.id); await matSave();
    const cli = JSON.parse(_dbxFiles[_CLI]), c = cli.rooms.flatMap(r => r.items).find(x => x.n === 'Order the under-cabinet lights'), txt = JSON.stringify(cli);
    matHmToggle(it.id); await matAutoSave(); matClose();
    return !!c && !('sel' in c) && !('eid' in c) && !('src' in c) && !('gat' in c) && !/warm white|grinder/.test(txt);
  }));

  ok('with that job\'s board OPEN on the screen the row lands in it at once (and it saves itself) — and the board still reads the homeowner\'s picks the way it always did', await page.evaluate(async () => {
    _dbxFiles[_CLI] = JSON.stringify({ rooms: [{ name: 'KITCHEN', items: [{ id: 'm2', n: 'Faucet', hm: true, s: 'picked', pick: 'Brushed bronze pull-down' }] }] });
    await openMaterials(0); _matRmShut = new Set(); renderMatMgr();
    const merged = _matD.rooms[0].items.find(x => x.id === 'm2').pick === 'Brushed bronze pull-down' && (_matD.hist || []).some(h => /client picked "Brushed bronze pull-down"/.test(h.txt));
    const e = addEntry('Note', 'Landed while the board was open', 'Oak House', {});
    await grindToBuildList(e, 'Oak House', 'KITCHEN');
    const row = [...document.querySelectorAll('#revBox .mat-item')].some(r => r.querySelector('b') && r.querySelector('b').textContent === 'Landed while the board was open');
    const r = merged && row && _matDirty === true && !!e.matRef; await matAutoSave(); matClose(); return r;
  }));

  ok('a crew phone has no chip (the boards live in Eric\'s Dropbox), and the old Note panel never sends to a board', /function qnBLChipHtml\(\) \{\s+if \(CREW_NAME\) return '';/.test(src) && /const _bl = \(!fromPanel && qnBL/.test(src));

  ok('nothing runs off the right edge of the main page', await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth));
  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v6.97') && document.querySelector('footer').textContent.includes(APP_VER);
  }));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
