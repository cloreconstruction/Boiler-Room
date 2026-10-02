// 🗒 v7.78 — A NOTE ON EACH NUMBER; ┄ THE BLUE DOTTED LINES, ON OR OFF. Eric: "on the estimate page i want estimate 1 and estimate 2
// to have their own text boxes. so i can put note on each number. in setup i want to be able to turn on and off the blue dotted
// lines for phils views". (1) Every bid's two numbers each have a note box beside them (b.n1 · b.n2): office-side only — never in
// the cut their page is written from, never a publish, kept on a COMPLETE line — and the thumb stays in the box it moved to (a
// number's redraw no longer throws away the box or the plate he tapped next). (2) ⚙ Setup → Appearance has a switch for each kind
// of blue dotted line: the dashed edge on what only he sees in the Project portal, and the dotted frame of the 👁 preview. Both
// start ON; off rides in his prefs and is painted before the first pull; a crew phone has no switch. Every name and figure made up.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { fileURLToPath } = require('url');
(async () => {
  const appUrl = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const repo = path.dirname(fileURLToPath(appUrl));
  const src = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };
  const errs = [];
  const CODE = 'oak-111111';
  const openCtx = async (vp, init) => {
    const ctx = await browser.newContext(vp.width < 700 ? { viewport: vp, isMobile: true, hasTouch: true } : { viewport: vp });
    await ctx.route(u => !/^file:/.test(u.href), r => r.abort());
    if (init) await ctx.addInitScript(init);
    const page = await ctx.newPage();
    page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
    await page.goto(appUrl); await page.waitForTimeout(700);
    return { ctx, page };
  };
  const board = () => ({ mk: 20, cats: [
    { n: 'Framing', appr: false, bids: [{ e1: 12000, e2: 3000, acc: true, note: 'crew and lumber' }, { e1: 800, e2: 0 }] },
    { n: 'Roofing', appr: true, bids: [{ e1: 9000, e2: 0, acc: true }] },
    { n: 'Demo', appr: false, done: { at: '2026-09-20' }, bids: [{ e1: 2000, e2: 500, acc: true }] },
    { n: 'Plumbing', appr: false, bids: [] }] });
  const pg = () => ({ name: 'Oak House', updated: '2026-09-28', show: { money: true }, invoiced: 0, paid: 0, open: 0, journal: [], phases: [], budget: [{ n: 'Roofing', est: 10800 }], upcoming: { items: [], tot: 0, all: 1 } });
  const seed = (page, b, p) => page.evaluate(([CODE, b, p]) => {
    jobs = ['Oak House']; crew = ['Phil', 'Ann']; todos = []; entries = []; nextId = 1; prefs.office = ['Phil'];
    window._saves = 0; window.scheduleSave = () => { window._saves++; }; dbx.refreshToken = 'test-token';
    window.publishSharedNotes = async () => {}; window.savePendingSoon = () => {};
    _portalIdx = { clients: [{ key: 'oak', job: 'Oak House', code: CODE }] };
    window._dbxFiles = { [portalRoot() + '/index.json']: JSON.stringify(_portalIdx) }; window._ups = [];
    window.dbxDownload = async q => (window._dbxFiles || {})[q] ?? null;
    window.dbxUpload = async (q, body) => { (window._dbxFiles || {})[q] = body; window._ups.push(q); return { path_display: q }; };
    window.dbxPathExists = async q => Object.prototype.hasOwnProperty.call(window._dbxFiles || {}, q);
    window.dbxRpc = async () => ({});
    if (!window._said) { window._said = []; const t0 = window.toast; window.toast = (m, g) => { if (m) _said.push(String(m)); return t0(m, g); }; }
    _said.length = 0;
    window._dbxFiles[estPath(CODE)] = JSON.stringify(b);
    window._dbxFiles[portalRoot() + '/' + CODE + '.json'] = JSON.stringify(p);
    _estIdx = -1; _estD = null; _estPage = null; _estSales = null;
  }, [CODE, b, p]);
  const openBoard = async page => { await page.evaluate(async () => { await openEstimates(0); }); await page.waitForTimeout(1500); await page.evaluate(() => { window._ups.length = 0; _said.length = 0; }); };
  const unfold = (page, n) => page.evaluate(n => { const ci = _estD.cats.findIndex(x => x.n === n); _estOpenCats = new Set([ci]); renderEstimates(); return ci; }, n);
  const bidSel = (ci, bi) => `.est-row[data-ci="${ci}"] .est-bid[data-bi="${bi}"]`;
  const fkNow = page => page.evaluate(() => (document.activeElement && document.activeElement.dataset && document.activeElement.dataset.fk) || '');

  // ───────────────────────── 🗒 a note on each number (his phone) ─────────────────────────
  console.log('— 🗒 a note on each number —');
  const eric = await openCtx({ width: 390, height: 844 });
  const page = eric.page;
  await seed(page, board(), pg());
  await openBoard(page);
  const fr = await unfold(page, 'Framing');
  const lay = await page.evaluate(sel => {
    const b = document.querySelector(sel), rows = [...b.querySelectorAll('.est-numrow')];
    const r = el => { const q = el.getBoundingClientRect(); return { l: Math.round(q.left), t: Math.round(q.top), w: Math.round(q.width), h: Math.round(q.height), r: Math.round(q.right) }; };
    return { n: rows.length, labels: rows.map(x => x.querySelector('label').textContent.trim()),
      amt: rows.map(x => r(x.querySelector('.est-numamt'))), note: rows.map(x => r(x.querySelector('.est-numnote'))),
      ph: rows.map(x => x.querySelector('.est-numnote').placeholder), aria: rows.map(x => x.querySelector('.est-numnote').getAttribute('aria-label')),
      vals: rows.map(x => x.querySelector('.est-numamt').value), first: b.querySelector('input') === rows[0].querySelector('.est-numamt'),
      box: r(b), wide: document.querySelector('.est-board').scrollWidth <= document.querySelector('.est-board').clientWidth + 1,
      bidNote: !!b.querySelector('input[data-fk$=":note"]'), inputs: b.querySelectorAll('.est-numline input').length };
  }, bidSel(fr, 0));
  ok('each bid has Estimate 1 and Estimate 2, and EACH number has its own note box beside it (four boxes: number · note · number · note)', lay.n === 2 && lay.inputs === 4 && lay.labels.join('|') === 'Estimate 1|Estimate 2' && lay.vals.join('|') === '12000|3000', JSON.stringify(lay));
  ok('the note boxes say what they are: "🗒 note on this number", and a reader hears "note on Estimate 1 / 2"', lay.ph.every(p => /note on this number/.test(p)) && lay.aria.join('|') === 'note on Estimate 1|note on Estimate 2', JSON.stringify([lay.ph, lay.aria]));
  ok('at 390px a number and its note sit on ONE line, the note to the right of its number; Estimate 2\'s pair is under Estimate 1\'s', [0, 1].every(i => Math.abs(lay.amt[i].t - lay.note[i].t) <= 2 && lay.note[i].l >= lay.amt[i].r) && lay.amt[1].t > lay.amt[0].t + 20, JSON.stringify(lay));
  ok('the note box is wide enough to write in (150px or more), the number box keeps its width, nothing runs off the side', lay.note.every(n => n.w >= 150 && n.r <= lay.box.r + 1) && lay.amt.every(a => a.w >= 96 && a.w <= 120) && lay.wide, JSON.stringify(lay));
  ok('the first box of a bid is still Estimate 1\'s number (≈ ➕ placeholder puts the thumb there), and the bid\'s own note box is still under the numbers', lay.first && lay.bidNote);

  console.log('— typing into them (real taps and keys) —');
  await page.click(bidSel(fr, 0) + ' .est-numrow:nth-child(1) .est-numnote');
  await page.keyboard.type('crew labor, 3 weeks');
  ok('what he types is in the board\'s data as he types (before the box is even left)', await page.evaluate(ci => _estD.cats[ci].bids[0].n1 === 'crew labor, 3 weeks', fr), await page.evaluate(ci => JSON.stringify(_estD.cats[ci].bids[0]), fr));
  ok('a redraw in the middle of typing cannot take the words: the box still holds them', await page.evaluate(sel => { renderEstimates(); return document.querySelector(sel + ' .est-numrow:nth-child(1) .est-numnote').value === 'crew labor, 3 weeks'; }, bidSel(fr, 0)));
  await page.click(bidSel(fr, 0) + ' .est-numrow:nth-child(2) .est-numnote');
  await page.keyboard.type('lumber package  ');
  await page.click(bidSel(fr, 0) + ' .est-numrow:nth-child(2) .est-numamt');
  await page.waitForTimeout(80);
  ok('each number keeps its OWN note (Estimate 1: crew labor · Estimate 2: lumber package, trimmed)', await page.evaluate(ci => { const b = _estD.cats[ci].bids[0]; return b.n1 === 'crew labor, 3 weeks' && b.n2 === 'lumber package' && b.e1 === 12000 && b.e2 === 3000 && b.note === 'crew and lumber'; }, fr), await page.evaluate(ci => JSON.stringify(_estD.cats[ci].bids[0]), fr));
  await page.waitForTimeout(1500);
  const st1 = await page.evaluate(CODE => ({ ups: window._ups.slice(), file: JSON.parse(window._dbxFiles[estPath(CODE)]).cats.find(x => x.n === 'Framing').bids[0], pg: window._dbxFiles[portalRoot() + '/' + CODE + '.json'] }), CODE);
  ok('the notes are saved in the board\'s own file — and their page was not written for them', st1.file.n1 === 'crew labor, 3 weeks' && st1.file.n2 === 'lumber package' && st1.ups.length >= 1 && st1.ups.every(u => /estimates-/.test(u)), JSON.stringify(st1.ups));

  console.log('— the thumb stays in the box it moved to —');
  await page.evaluate(() => { window._ups.length = 0; });
  await page.click(bidSel(fr, 0) + ' .est-numrow:nth-child(1) .est-numamt');
  await page.keyboard.press('Control+A'); await page.keyboard.type('12500');
  await page.click(bidSel(fr, 0) + ' .est-numrow:nth-child(1) .est-numnote');
  await page.waitForTimeout(60);
  ok('type a number, tap its note: the number is stored, the board has redrawn (the total follows) and the thumb is IN the note box', await page.evaluate(([ci, sel]) => { const b = _estD.cats[ci].bids[0], a = document.activeElement; return b.e1 === 12500 && a && a.dataset.fk === ci + ':0:n1' && a.isConnected && /= \$15,500/.test(document.querySelector(sel).textContent); }, [fr, bidSel(fr, 0)]), await fkNow(page));
  await page.keyboard.press('End'); await page.keyboard.type(' + a helper');
  await page.click(bidSel(fr, 0) + ' .est-numrow:nth-child(2) .est-numamt');
  await page.waitForTimeout(60);
  ok('…and typing goes on in that box; tapping Estimate 2 next lands in Estimate 2', await page.evaluate(ci => _estD.cats[ci].bids[0].n1 === 'crew labor, 3 weeks + a helper', fr) && await fkNow(page) === fr + ':0:e2', await page.evaluate(ci => JSON.stringify(_estD.cats[ci].bids[0]), fr) + ' ' + await fkNow(page));
  await page.keyboard.press('Control+A'); await page.keyboard.type('3500');
  await page.keyboard.press('Tab');
  await page.waitForTimeout(60);
  ok('Tab out of a number: it is stored and the thumb is in the next box (its note), not lost', await page.evaluate(ci => _estD.cats[ci].bids[0].e2 === 3500, fr) && await fkNow(page) === fr + ':0:n2', await fkNow(page));
  await page.click(bidSel(fr, 1) + ' .est-numrow:nth-child(1) .est-numamt');
  await page.keyboard.press('Control+A'); await page.keyboard.type('950');
  await page.click(bidSel(fr, 1) + ' .est-guess-btn');
  await page.waitForTimeout(120);
  ok('a plate tapped straight after typing a number acts on the FIRST tap (the number is stored, the plate is lit)', await page.evaluate(([ci, sel]) => { const b = _estD.cats[ci].bids[1]; return b.e1 === 950 && b.guess === true && /≈ PLACEHOLDER/.test(document.querySelector(sel + ' .est-guess-btn').textContent); }, [fr, bidSel(fr, 1)]), await page.evaluate(ci => JSON.stringify(_estD.cats[ci].bids[1]), fr));
  await page.tap(bidSel(fr, 1) + ' .est-numrow:nth-child(1) .est-numamt');
  await page.keyboard.press('Control+A'); await page.keyboard.type('975');
  await page.tap(bidSel(fr, 1) + ' .est-numrow:nth-child(1) .est-numnote');
  await page.waitForTimeout(120);
  ok('the same with a finger (a touch tap): number stored, the thumb in its note box', await page.evaluate(ci => _estD.cats[ci].bids[1].e1 === 975, fr) && await fkNow(page) === fr + ':1:n1', await fkNow(page));
  ok('code calling in (no tap in the air) still redraws at once, as ever', await page.evaluate(([ci, sel]) => { estBidSet(ci, 1, 'e2', '25'); return /= \$1,000/.test(document.querySelector(sel).textContent); }, [fr, bidSel(fr, 1)]));

  console.log('— 🧱 the wall: a note on a number never leaves the office —');
  const ro = await unfold(page, 'Roofing');
  await page.waitForTimeout(1400);
  await page.evaluate(() => { window._ups.length = 0; });
  await page.click(bidSel(ro, 0) + ' .est-numrow:nth-child(1) .est-numnote');
  await page.keyboard.type('Peak Roofing bid, good through October');
  await page.click(bidSel(ro, 0) + ' .est-numrow:nth-child(2) .est-numnote');
  await page.keyboard.type('ice shield allowance');
  await page.evaluate(() => document.activeElement.blur());
  await page.waitForTimeout(1500);
  const wall = await page.evaluate(CODE => { const cut = JSON.stringify(estCut()), pgTxt = window._dbxFiles[portalRoot() + '/' + CODE + '.json']; return { ups: window._ups.slice(), cut, pgHas: /Peak Roofing|ice shield|n1|n2/.test(pgTxt), cutHas: /Peak Roofing|ice shield|"n1"|"n2"/.test(cut), file: JSON.parse(window._dbxFiles[estPath(CODE)]).cats.find(x => x.n === 'Roofing').bids[0] }; }, CODE);
  ok('on a category that is ✓ ON THEIR PAGE a note on a number writes the board\'s file only — their page is not written at all', wall.ups.length >= 1 && wall.ups.every(u => /estimates-/.test(u)) && wall.file.n1 === 'Peak Roofing bid, good through October' && wall.file.n2 === 'ice shield allowance', JSON.stringify(wall.ups));
  ok('the cut their page is made from has no word of it (the line is its name and its number)', !wall.cutHas && /"n":"Roofing"/.test(wall.cut) && /"est":10800/.test(wall.cut), wall.cut);
  await page.evaluate(ci => { window._ups.length = 0; estBidSet(ci, 0, 'e2', '500'); }, ro);
  await page.waitForTimeout(1600);
  const pub = await page.evaluate(CODE => ({ ups: window._ups.slice(), pgTxt: window._dbxFiles[portalRoot() + '/' + CODE + '.json'] }), CODE);
  ok('when the NUMBER changes their page follows as before — and still carries no note on a number', pub.ups.some(u => u.endsWith('/' + CODE + '.json')) && /11400/.test(pub.pgTxt) && !/Peak Roofing|ice shield/.test(pub.pgTxt), JSON.stringify(pub.ups));

  console.log('— a COMPLETE line, an emptied box, the cap —');
  const de = await unfold(page, 'Demo');
  await page.evaluate(() => { _said.length = 0; });
  await page.click(bidSel(de, 0) + ' .est-numrow:nth-child(1) .est-numnote');
  await page.keyboard.type('came in under, dump fees lower');
  await page.evaluate(() => document.activeElement.blur());
  await page.waitForTimeout(60);
  ok('a COMPLETE (locked) line still takes a note on a number — it changes no figure — and says nothing about the lock', await page.evaluate(ci => _estD.cats[ci].bids[0].n1 === 'came in under, dump fees lower' && !_said.some(t => /locked/.test(t)), de), await page.evaluate(() => JSON.stringify(_said)));
  ok('…while its NUMBER stays locked, as before', await page.evaluate(ci => { estBidSet(ci, 0, 'e1', '9'); return _estD.cats[ci].bids[0].e1 === 2000 && _said.some(t => /COMPLETE — its estimate is locked/.test(t)); }, de));
  ok('an emptied note box takes the note off the bid (no empty key kept), and a long note is cut at 160 letters', await page.evaluate(ci => { estBidSet(ci, 0, 'n1', '   '); const gone = !('n1' in _estD.cats[ci].bids[0]); estBidSet(ci, 0, 'n2', 'x'.repeat(300)); return gone && _estD.cats[ci].bids[0].n2.length === 160; }, de));
  ok('a new bid starts with empty note boxes, and ? How this works says what they are', await page.evaluate(([ci]) => { const pi = _estD.cats.findIndex(x => x.n === 'Plumbing'); _estOpenCats = new Set([pi]); estBidAdd(pi); const b = document.querySelector(`.est-row[data-ci="${pi}"] .est-bid[data-bi="0"]`); return !!b && [...b.querySelectorAll('.est-numnote')].every(i => i.value === '') && /🗒 A note on each number: Estimate 1 and Estimate 2 each have their own note box/.test($('estHelpBox').textContent) && /stay in the office/.test($('estHelpBox').textContent); }, [de]));
  await page.evaluate(() => closeEstimates());
  await eric.ctx.close();

  console.log('— on a PC the two pairs sit side by side —');
  const pc = await openCtx({ width: 1280, height: 800 });
  await seed(pc.page, board(), pg());
  await openBoard(pc.page);
  const frPc = await unfold(pc.page, 'Framing');
  const layPc = await pc.page.evaluate(sel => { const rows = [...document.querySelectorAll(sel + ' .est-numrow')].map(x => ({ a: x.querySelector('.est-numamt').getBoundingClientRect(), n: x.querySelector('.est-numnote').getBoundingClientRect() })); return rows.map(r => ({ at: Math.round(r.a.top), al: Math.round(r.a.left), nt: Math.round(r.n.top), nw: Math.round(r.n.width), nl: Math.round(r.n.left) })); }, bidSel(frPc, 0));
  ok('at 1280px Estimate 1 with its note and Estimate 2 with its note are on the same line, each note 200px or wider', layPc.length === 2 && Math.abs(layPc[0].at - layPc[1].at) <= 2 && layPc[1].al > layPc[0].nl && layPc.every(r => Math.abs(r.at - r.nt) <= 2 && r.nw >= 200), JSON.stringify(layPc));
  await pc.page.click(bidSel(frPc, 0) + ' .est-numrow:nth-child(1) .est-numamt');
  await pc.page.keyboard.press('Control+A'); await pc.page.keyboard.type('13000');
  await pc.page.click(bidSel(frPc, 0) + ' .est-numrow:nth-child(2) .est-numnote');
  await pc.page.waitForTimeout(60);
  ok('with a real mouse: type a number, click another box — stored, and the click was not thrown away', await pc.page.evaluate(ci => _estD.cats[ci].bids[0].e1 === 13000, frPc) && await fkNow(pc.page) === frPc + ':0:n2', await fkNow(pc.page));
  await pc.page.evaluate(() => closeEstimates());
  await pc.ctx.close();

  // ───────────────────────── ┄ the blue dotted lines ─────────────────────────
  console.log('— ┄ the blue dotted lines, on or off —');
  const e2 = await openCtx({ width: 390, height: 844 });
  const p2 = e2.page;
  await seed(p2, board(), pg());
  const chips = () => p2.evaluate(() => ({ shown: $('dotBlock').style.display !== 'none', head: $('dotBlock').querySelector('.set-sub-h').textContent.trim(), t: [...$('dotChips').querySelectorAll('.pick-chip')].map(b => b.textContent.trim()), on: [...$('dotChips').querySelectorAll('.pick-chip')].map(b => b.getAttribute('aria-pressed')), sel: [...$('dotChips').querySelectorAll('.pick-chip')].map(b => b.classList.contains('sel')), hint: $('dotHint').textContent, h: [...$('dotChips').querySelectorAll('.pick-chip')].map(b => Math.round(b.getBoundingClientRect().height)) }));
  await p2.evaluate(() => { openPanel('settings'); const s = $('setAppear'); if (s.classList.contains('shut') || s.classList.contains('collapsed')) { const h = s.querySelector(':scope > h4'); if (h) h.click(); } });
  await p2.waitForTimeout(150);
  const c0 = await chips();
  ok('⚙ Setup → Appearance has ┄ Blue dotted lines with two switches, both ✓ ON to start, each saying which lines it is (and naming Phil)', c0.shown && /Blue dotted lines/.test(c0.head) && c0.t.length === 2 && /^✓ ON — the dashed edge on what only you see in the Project portal \(Phil does not\)$/.test(c0.t[0]) && /^✓ ON — the dotted frame round the page while you look as Phil$/.test(c0.t[1]) && c0.on.join() === 'true,true' && c0.sel.every(Boolean), JSON.stringify(c0));
  ok('the small print says only he ever sees these lines, and that the PREVIEW banner stays', /only ever drawn on your own phone and PC/.test(c0.hint) && /gold PREVIEW banner still tells you/.test(c0.hint), c0.hint);
  const portal = () => p2.evaluate(async () => {
    closePanels(); openPortalWin(); await renderPortalList(); _portalOpen = 0; await renderPortalList();
    const txt = b => b.textContent.replace(/\s+/g, ' ').trim();
    const mine = [...document.querySelectorAll('#portalList .only-me')], key = document.querySelector('#portalList .only-me-key');
    const r = { n: mine.length, styles: [...new Set(mine.map(m => getComputedStyle(m).outlineStyle))], key: !!key && getComputedStyle(key).display !== 'none', names: [...document.querySelectorAll('#portalList .pf-acts button')].map(txt).join('|') };
    closePortalWin(); return r;
  });
  const frame = () => p2.evaluate(() => { crewPreviewToggle(); const cs = getComputedStyle(document.body, '::after'); const r = { cls: document.body.classList.contains('crew-preview'), dotted: cs.display !== 'none' && cs.borderTopStyle === 'dotted', badge: $('crewBadge').textContent.trim(), badgeShown: $('crewBadge').style.display !== 'none' }; crewPreviewToggle(); return r; });
  const d0 = await portal(), f0 = await frame();
  ok('as it was: the portal\'s only-you plates wear the dashed edge with the key line, and the 👁 preview wears the dotted frame', d0.n >= 6 && d0.styles.join() === 'dashed' && d0.key && f0.cls && f0.dotted, JSON.stringify([d0, f0]));
  await p2.evaluate(() => { _said.length = 0; window._saves = 0; document.querySelector('#dotChips [data-dot="mine"]').click(); });
  const c1 = await chips(), d1 = await portal(), f1 = await frame();
  ok('tap the first switch: it reads ○ OFF — no dashed edge…, unlit, and says so in a toast; his prefs carry it and a save is asked for', /^○ OFF — no dashed edge on what only you see in the Project portal$/.test(c1.t[0]) && c1.on[0] === 'false' && !c1.sel[0] && c1.sel[1] && await p2.evaluate(() => prefs.dots.mine === false && !('frame' in prefs.dots) && window._saves >= 1 && _said.some(t => /^┄ Dashed edges OFF — nothing in your Project portal is outlined now$/.test(t))), JSON.stringify(c1) + await p2.evaluate(() => JSON.stringify([prefs.dots, _said])));
  ok('…the portal draws no dashed edge and no key line now — every plate is still there by name', d1.n === d0.n && d1.styles.join() === 'none' && !d1.key && d1.names === d0.names && /Estimates/.test(d1.names) && /Receipts/.test(d1.names), JSON.stringify(d1));
  ok('…and the preview frame is its own switch: still dotted', f1.dotted, JSON.stringify(f1));
  await p2.evaluate(() => { _said.length = 0; document.querySelector('#dotChips [data-dot="frame"]').click(); });
  const c2 = await chips(), f2 = await frame();
  ok('tap the second switch: ○ OFF — no dotted frame while you look as Phil; the preview has no frame, and the gold banner still says PREVIEW', /^○ OFF — no dotted frame while you look as Phil$/.test(c2.t[1]) && c2.on.join() === 'false,false' && f2.cls && !f2.dotted && /PREVIEW/.test(f2.badge) && f2.badgeShown && await p2.evaluate(() => prefs.dots.frame === false && _said.some(t => /^┄ Dotted frame OFF — the gold banner still says PREVIEW$/.test(t))), JSON.stringify([c2, f2]));
  ok('what is off is remembered on the phone for the first paint', await p2.evaluate(() => localStorage.getItem('daylog-dots-off') === 'mine,frame'));
  const thumb = await p2.evaluate(() => { openPanel('settings'); $('setAppear').classList.add('open'); const b = [...$('dotChips').querySelectorAll('.pick-chip')].map(x => x.getBoundingClientRect()), pn = $('panel-settings').getBoundingClientRect(); const r = { h: b.map(x => Math.round(x.height)), w: b.map(x => Math.round(x.width)), inside: b.every(x => x.left >= pn.left - 1 && x.right <= pn.right + 1), dashed: [...$('dotChips').querySelectorAll('.pick-chip')].map(x => getComputedStyle(x).borderTopStyle) }; closePanels(); return r; });
  ok('the switches take a thumb (44px or more) at 390px, stay inside the Setup window, and an OFF one wears a dashed edge (never the colour alone)', thumb.h.length === 2 && thumb.h.every(h => h >= 44) && thumb.w.every(w => w >= 200) && thumb.inside && thumb.dashed.join() === 'dashed,dashed', JSON.stringify(thumb));
  await p2.evaluate(() => { _said.length = 0; document.querySelector('#dotChips [data-dot="mine"]').click(); });
  const c3 = await chips(), d3 = await portal();
  ok('tap the first again: back ON — the dashed edges and the key line return, and the toast names who does not see those plates', /^✓ ON — /.test(c3.t[0]) && c3.on[0] === 'true' && d3.styles.join() === 'dashed' && d3.key && await p2.evaluate(() => !('mine' in prefs.dots) && prefs.dots.frame === false && _said.some(t => /^┄ Dashed edges ON — a dashed edge marks what only you see \(Phil does not\)$/.test(t))), JSON.stringify([c3, d3]));
  ok('a pull from his other device applies what it says (frame back on, edges off)', await p2.evaluate(async () => {
    const real = window.dbxDownload;
    window.dbxDownload = async q => /entries\.json$/.test(q) ? JSON.stringify({ jobs: ['Oak House'], crew: ['Phil'], entries: [], todos: [], prefs: { office: ['Phil'], dots: { mine: false } } }) : real(q);
    try { await pullRemote(); } catch (e) {}
    window.dbxDownload = real;
    const r = document.body.classList.contains('dash-mine-off') && !document.body.classList.contains('dash-frame-off') && localStorage.getItem('daylog-dots-off') === 'mine';
    return r && /^○ OFF/.test($('dotChips').querySelector('[data-dot="mine"]').textContent.trim()) && /^✓ ON/.test($('dotChips').querySelector('[data-dot="frame"]').textContent.trim());
  }));
  // a real reload: the phone's own memory paints it before any pull
  await p2.evaluate(() => { localStorage.setItem('daylog-dots-off', 'mine,frame'); });
  await p2.reload(); await p2.waitForTimeout(700);
  ok('after a real reload, before anything is pulled: both are off from the first paint and the switches read ○ OFF', await p2.evaluate(() => document.body.classList.contains('dash-mine-off') && document.body.classList.contains('dash-frame-off') && [...$('dotChips').querySelectorAll('.pick-chip')].every(b => /^○ OFF/.test(b.textContent.trim()) && b.getAttribute('aria-pressed') === 'false')));
  ok('…and a tap there turns just that one on, keeping the other off', await p2.evaluate(() => { window.scheduleSave = () => {}; document.querySelector('#dotChips [data-dot="frame"]').click(); return !document.body.classList.contains('dash-frame-off') && document.body.classList.contains('dash-mine-off') && prefs.dots.mine === false && !('frame' in prefs.dots) && localStorage.getItem('daylog-dots-off') === 'mine'; }));
  await e2.ctx.close();

  console.log('— a crew phone has no switch —');
  const phil = await openCtx({ width: 390, height: 844 }, () => { try { localStorage.setItem('daylog-crew-name', 'Phil'); localStorage.setItem('daylog-crew-root', '/Phil'); localStorage.setItem('daylog-crew-jobs', JSON.stringify(['Oak House'])); localStorage.setItem('daylog-dots-off', ''); } catch (e) {} });
  ok('on Phil\'s phone ⚙ Setup → Appearance shows no blue-dotted-line switch, and the code refuses a tap', await phil.page.evaluate(() => { window.scheduleSave = () => {}; openPanel('settings'); const hid = $('dotBlock').style.display === 'none' && !$('dotChips').children.length; setDots('mine'); setDots('frame'); return hid && !(prefs.dots && (prefs.dots.mine === false || prefs.dots.frame === false)) && !document.body.classList.contains('dash-mine-off') && !document.body.classList.contains('dash-frame-off'); }));
  await phil.ctx.close();

  ok('the homeowner\'s page knows nothing of either change (no note on a number, no dotted-line switch)', !/n1|est-numnote|dash-mine-off|dotChips/.test(fs.readFileSync(path.join(repo, 'c', 'index.html'), 'utf8')));
  ok('version bumped — APP_VER and the footer agree', /const APP_VER = 'v7\.(7[89]|[89]\d)'/.test(src) && new RegExp('<footer>' + (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1].replace('.', '\\.') + ' ·').test(src));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
