// v7.19 — (1) Eric: "On the build list, I'd like some sort of signal or some sort of history to show. When something gets changed in
// the notes, what it was changed from … a little button or light that lights up if something's been changed in the last couple of
// days. And then you can click on it and see what the changes are, and it will have who changed it and a date and timestamp. And when
// there's something in the category marked with the exclamation point triangle, maybe make that light up orange, red, or something
// when the category is folded." (2) "when the item is completed, it should be folded to just the name. And a green light that says
// 'finished' … And they should move to the bottom of that category as well." (3) "Can you make an option for all these fonts to be
// changed in the setup and appearance, similar to the theme? If so, go ahead and do all of them." Every name here is made up.
const { chromium } = require('playwright');
(async () => {
  const appUrl = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await ctx.route(u => !/^file:/.test(u.href), r => r.abort());
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
  await page.goto(appUrl); await page.waitForTimeout(700);
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };

  await page.evaluate(async () => {
    jobs = ['Oak House']; crew = ['Phil']; entries = []; todos = []; nextId = 1; pendingQueue = [];
    window.scheduleSave = () => {}; window.savePendingSoon = () => {}; window.publishSharedNotes = () => {};
    renderJobSelects(); closePanels(); renderAll();
    dbx.refreshToken = 't'; _portalIdx = { clients: [{ key: 'oak', job: 'Oak House', code: 'oak-111aaa' }] };
    window._dbxFiles = {}; window.dbxDownload = async p => (window._dbxFiles || {})[p] ?? null; window.dbxUpload = async (p, b) => { window._dbxFiles[p] = b; return {}; };
    const old = new Date(Date.now() - 3 * 864e5).toISOString();
    _dbxFiles[portalRoot() + '/materials-office-oak-111aaa.json'] = JSON.stringify({ full: true, seq: 9, rooms: [
      { name: 'KITCHEN', items: [
        { id: 'm1', n: 'Kitchen faucet', t: 'Misc', buy: true, s: 'picked', sel: 'Brushed nickel' },
        { id: 'm2', n: 'Range hood', t: 'Misc', buy: true, s: 'arrived', ins: '2026-09-05' },
        { id: 'm3', n: 'Sink', t: 'Misc', buy: true, s: 'ordered', chg: [{ at: old, by: 'Phil', f: 'note', from: 'Steel', to: 'Composite' }] },
        { id: 'm4', n: 'Backsplash tile', t: 'Misc', hm: true, s: 'pick' }] },
      { name: 'GARAGE', items: [
        { id: 'm5', n: 'Garage door', t: 'Misc', buy: true, s: 'pick', first: true },
        { id: 'm6', n: 'Check the vents', t: 'Misc', s: 'done' },
        { id: 'm7', n: 'Floor paint', t: 'Misc', buy: true, s: 'pick' }] }] });
    _dbxFiles[portalRoot() + '/materials-oak-111aaa.json'] = JSON.stringify({ rooms: [{ name: 'KITCHEN', items: [{ id: 'm4', n: 'Backsplash tile', hm: true, s: 'picked', pick: 'White subway' }] }] });
    await openMaterials(0);
    window._nm = r => (r.querySelector('.mat-nm b') || r.querySelector('.mat-fin-nm') || {}).textContent;
    window._row = n => [...document.querySelectorAll('#revBox .mat-item')].find(r => _nm(r) === n);
    window._it = id => _matD.rooms.flatMap(r => r.items).find(x => x.id === id);
    window._sec = n => [...document.querySelectorAll('#revBox .set-section')].find(s => s.querySelector('h4') && s.querySelector('h4').textContent.includes(n));
  });

  console.log('— 🕘 (1) what changed, who, when —');
  ok('the homeowner\'s pick, merged in from their page, is written on the row as hers', await page.evaluate(() => {
    const c = _it('m4').chg || [];
    return c.length === 1 && c[0].by === 'the homeowner' && c[0].f === 'what was picked' && c[0].from === '' && c[0].to === 'White subway';
  }));
  ok('a note changed in place is written down — who (Eric), when, the field, was → now', await page.evaluate(() => {
    matSelEdit('m1'); $('matSelIn-m1').value = 'Matte black'; matSelDone('m1', true);
    const c = _it('m1').chg[_it('m1').chg.length - 1];
    return c.by === 'Eric' && c.f === 'note' && c.from === 'Brushed nickel' && c.to === 'Matte black' && !isNaN(+new Date(c.at));
  }));
  ok('…and the row lights: a lit 🕘 plate on its name line AND the words "🕘 changed today … by you · see what changed" under it', await page.evaluate(() => {
    const r = _row('Kitchen faucet'), plate = r.querySelector('.mat-q-chg'), line = r.querySelector('.mat-chg-line');
    return !!plate && getComputedStyle(plate).borderTopWidth === '2px' && !!line && /🕘 changed today .* by you · see what changed/.test(line.textContent.replace(/\s+/g, ' '));
  }));
  ok('a tap on 🕘 opens the changes: newest first, the day and time, who, the field, was (struck through) → now', await page.evaluate(() => {
    _row('Kitchen faucet').querySelector('.mat-q-chg').click();
    const box = document.querySelector('#matChgHost .we-box'), rows = [...box.querySelectorAll('.mc-row')];
    const t = rows[0].textContent.replace(/\s+/g, ' ');
    const struck = getComputedStyle(rows[0].querySelector('.mc-was')).textDecorationLine.includes('line-through');
    matChgClose();
    return /CHANGES — Kitchen faucet/.test(box.textContent) && /today \d+:\d\d .M · you/.test(t) && /NOTE/.test(t) && /was: “Brushed nickel”/.test(t) && /now: “Matte black”/.test(t) && struck && !document.querySelector('#matChgHost .we-box');
  }), '');
  ok('a light ticked is written down too (Ordered light: ○ off → ✓ on)', await page.evaluate(() => {
    matBoxTap('m1', 'O'); const c = _it('m1').chg[_it('m1').chg.length - 1];
    return c.f === 'Ordered light' && c.from === '○ off' && c.to === '✓ on';
  }));
  ok('a change older than two days does not light the row — but the edit window\'s 🕘 Changes still lists it, with Phil\'s name', await page.evaluate(() => {
    const r = _row('Sink'), dark = !r.querySelector('.mat-q-chg') && !r.querySelector('.mat-chg-line');
    matEditOpen('m3'); matEdFold('chg');
    const sec = document.querySelector('#matSheetHost [data-fold="chg"]'), t = sec ? sec.textContent.replace(/\s+/g, ' ') : '';
    matEditClose();
    return dark && /🕘 Changes/.test(t) && /Phil/.test(t) && /was: “Steel”/.test(t) && /now: “Composite”/.test(t);
  }));
  ok('what goes to the homeowner\'s page never carries the changes (old notes sit in them)', await page.evaluate(async () => {
    await matSave();
    const cli = JSON.parse(_dbxFiles[portalRoot() + '/materials-oak-111aaa.json']), off = JSON.parse(_dbxFiles[portalRoot() + '/materials-office-oak-111aaa.json']);
    const cliItems = cli.rooms.flatMap(r => r.items), offItems = off.rooms.flatMap(r => r.items);
    return cliItems.length > 0 && cliItems.every(x => !('chg' in x)) && offItems.some(x => Array.isArray(x.chg) && x.chg.length);
  }));

  console.log('— ⚠ (1) a folded category with a FIRST row lights orange —');
  ok('open: the ⚠ FIRST row leads its category, no lit plate on the heading', await page.evaluate(() => {
    const s = _sec('GARAGE');
    return !s.querySelector('.mat-first-lit') && !s.querySelector('h4').classList.contains('mat-rm-first') && _nm(s.querySelector('.mat-item')) === 'Garage door';
  }));
  ok('folded: an orange edge on the heading and an orange plate that says "⚠ 1 FIRST" in words (the counts line leaves its own out)', await page.evaluate(() => {
    const ri = _matD.rooms.findIndex(r => r.name === 'GARAGE'); matRmToggle(ri);
    const s = _sec('GARAGE'), h = s.querySelector('h4'), lit = h.querySelector('.mat-first-lit');
    const cs = lit && getComputedStyle(lit), edge = getComputedStyle(h).borderLeftWidth;
    const counts = (h.querySelector('.mat-counts') || {}).textContent || '';
    matRmToggle(ri);
    return h.classList.contains('mat-rm-first') && !!lit && lit.textContent.trim() === '⚠ 1 FIRST' && edge === '4px' && cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && !/⚠ 1 first/.test(counts);
  }));
  ok('a folded category with no FIRST row stays plain', await page.evaluate(() => {
    const ri = _matD.rooms.findIndex(r => r.name === 'KITCHEN'); matRmToggle(ri);
    const h = _sec('KITCHEN').querySelector('h4'), plain = !h.classList.contains('mat-rm-first') && !h.querySelector('.mat-first-lit');
    matRmToggle(ri); return plain;
  }));

  console.log('— ✓ (2) a finished item folds to its name and a green light, at the bottom —');
  ok('the installed hood and the checklist row that is done are folded: the name and "✓ FINISHED" — no lights, no note', await page.evaluate(() => {
    const a = _row('Range hood'), b = _row('Check the vents');
    const f = r => r.classList.contains('mi-fin') && /✓ FINISHED/.test(r.textContent) && !r.querySelector('.mat-strip') && !r.querySelector('.mat-sel');
    return f(a) && f(b);
  }));
  ok('…and they sit at the BOTTOM of their category', await page.evaluate(() => {
    const names = s => [..._sec(s).querySelectorAll('.mat-item')].map(_nm);
    const k = names('KITCHEN'), g = names('GARAGE');
    return k[k.length - 1] === 'Range hood' && g[g.length - 1] === 'Check the vents' && g[0] === 'Garage door';
  }));
  ok('the green light is words and a ✓ as well as green; a tap on the name still opens it (its lights are in there to take it back)', await page.evaluate(() => {
    const lamp = _row('Range hood').querySelector('.mat-fin-lamp'), words = lamp.textContent.trim(), edge = getComputedStyle(lamp).borderTopStyle;   // read before the tap redraws the board
    _row('Range hood').querySelector('.mat-fin-nm').click();
    const open = _matEdit === 'm2' && !!document.querySelector('#matSheetHost #matSheet');
    matEditClose();
    return words === '✓ FINISHED' && edge === 'solid' && open;
  }));
  ok('ticking the last light finishes a row: it folds and drops to the bottom; taking it back brings it out again', await page.evaluate(() => {
    matBoxTap('m7', 'P'); matBoxTap('m7', 'O'); matBoxTap('m7', 'R'); matBoxTap('m7', 'I');
    const g = [..._sec('GARAGE').querySelectorAll('.mat-item')].map(_nm), fin = _row('Floor paint').classList.contains('mi-fin');
    matBoxTap('m7', 'I');
    return fin && g[g.length - 1] === 'Floor paint' && !_row('Floor paint').classList.contains('mi-fin');
  }));
  await page.evaluate(() => matClose());

  console.log('— 🔤 (3) Letters in Setup → Appearance —');
  ok('five picks, A to E, each drawn in its own letters; A (today) is lit', await page.evaluate(() => {
    const chips = [...document.querySelectorAll('#fontChips .font-chip')];
    const letters = chips.map(c => c.querySelector('.fc-l').textContent.replace('✓', '').trim()).join('');
    const fam = chips.map(c => c.style.fontFamily);
    return chips.length === 5 && letters === 'ABCDE' && chips[0].classList.contains('sel') && /Atkinson Hyperlegible/.test(fam[2]) && /Lexend/.test(fam[3]) && /Public Sans/.test(fam[4]);
  }));
  // a small heavy label to measure: the Summary's heading count badge is 10–12 px bold on every phone
  const probe = () => page.evaluate(() => {
    let p = document.getElementById('t719p'); if (!p) { p = document.createElement('div'); p.id = 't719p'; p.innerHTML = '<span style="font-size: var(--fs11, 11px); font-weight: var(--fw8, 800);">⚙ TO THE GRINDER</span><b>bold</b>'; document.body.appendChild(p); }
    const s = getComputedStyle(p.firstChild), b = getComputedStyle(p.lastChild);
    return { size: s.fontSize, weight: s.fontWeight, bold: b.fontWeight, fam: getComputedStyle(document.body).fontFamily, font: document.documentElement.dataset.font || '' };
  });
  const a = await probe();
  ok('A draws exactly as before: 11 px at 800, the phone\'s own letters, no attribute on the page', a.size === '11px' && a.weight === '800' && a.font === '' && /system-ui/.test(a.fam), JSON.stringify(a));
  const b = await page.evaluate(() => { setFont('b'); return true; }) && await probe();
  ok('B: the same letters, the small words bigger (12.5 px) and far less heavy (600)', b.size === '12.5px' && b.weight === '600' && b.bold === '600' && b.font === 'b' && /system-ui/.test(b.fam), JSON.stringify(b));
  const c = await page.evaluate(() => { setFont('c'); return true; }) && await probe();
  ok('C: Atkinson Hyperlegible, 12.5 px at 700 — and its letters are fetched from Google Fonts, only 400 and 700', c.size === '12.5px' && c.weight === '700' && /Atkinson Hyperlegible/.test(c.fam) && await page.evaluate(() => /Atkinson\+Hyperlegible:wght@400;700/.test((document.getElementById('fontLink-c') || {}).href || '')), JSON.stringify(c));
  const d = await page.evaluate(() => { setFont('d'); return true; }) && await probe();
  ok('D: Lexend (wide letters), a touch smaller than the others: 12 px at 600', d.size === '12px' && d.weight === '600' && /Lexend/.test(d.fam), JSON.stringify(d));
  const e = await page.evaluate(() => { setFont('e'); return true; }) && await probe();
  ok('E: Public Sans, 12.5 px at 600', e.size === '12.5px' && e.weight === '600' && /Public Sans/.test(e.fam), JSON.stringify(e));
  ok('the pick is his (synced prefs) and this phone remembers it before anything is drawn next time', await page.evaluate(() => prefs.font === 'e' && localStorage.getItem('daylog-font') === 'e' && document.querySelector('#fontChips .font-chip.sel').dataset.font === 'e'));
  ok('with the biggest letters on, nothing runs off the side of the phone: the main page, the Summary, the Build List', await page.evaluate(async () => {
    setFont('c'); closePanels(); renderAll(); const main = document.documentElement.scrollWidth <= innerWidth + 1;
    openReview('summary'); const sum = document.documentElement.scrollWidth <= innerWidth + 1 && $('revBox').scrollWidth <= $('revBox').clientWidth + 1; closeReview();
    await openMaterials(0); const box = $('revBox'); const board = box.scrollWidth <= box.clientWidth + 1; matClose();
    return main && sum && board;
  }));
  ok('a pull from Dropbox brings his letters with it (another device picked A)', await page.evaluate(() => { applyFont('a'); return !document.documentElement.dataset.font; }) && (await probe()).size === '11px');

  ok('no page errors', errs.length === 0, errs.join(' | '));
  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close(); process.exit(fail ? 1 : 0);
})();
