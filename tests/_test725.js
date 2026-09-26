// v7.25 — Eric: "some kind of timer … show that something's getting old. But … if it's ordered and you're just waiting for it to
// arrive, it won't notify you" and "one method of making something a top priority in the category, but also have a way to show
// that there's something ready to be done … can't move forward until it's done … they want tan soffit, and Northstar Metal
// doesn't have a tan color … somebody needs to go do some research … how do we mark that?" — "yes to 1 and 2." Every name here
// is made up.
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

  await page.evaluate(async () => {
    jobs = ['Oak House']; crew = ['Phil']; entries = []; todos = []; nextId = 1; pendingQueue = [];
    window.scheduleSave = () => {}; window.savePendingSoon = () => {}; window.publishSharedNotes = () => {};
    renderJobSelects(); closePanels(); renderAll();
    dbx.refreshToken = 't'; _portalIdx = { clients: [{ key: 'oak', job: 'Oak House', code: 'oak-111aaa' }] };
    window._dbxFiles = {}; window.dbxDownload = async p => (window._dbxFiles || {})[p] ?? null; window.dbxUpload = async (p, b) => { window._dbxFiles[p] = b; return {}; };
    window.dbxPathExists = async p => Object.prototype.hasOwnProperty.call(window._dbxFiles, p);
    const ago = d => new Date(Date.now() - d * 864e5).toISOString(), day = d => localDay(new Date(Date.now() - d * 864e5));
    _dbxFiles[portalRoot() + '/materials-office-oak-111aaa.json'] = JSON.stringify({ full: true, seq: 9, rooms: [
      { name: 'EXTERIOR', items: [
        { id: 'a20', n: 'Soffit', t: 'Misc', hm: true, s: 'pick', chg: [{ at: ago(20), by: 'Eric', f: 'note', from: '', to: 'x' }] },
        { id: 'a8', n: 'Fascia', t: 'Misc', buy: true, s: 'picked', chg: [{ at: ago(8), by: 'Eric', f: 'note', from: '', to: 'x' }] },
        { id: 'a4', n: 'Gutters', t: 'Misc', buy: true, s: 'arrived', chg: [{ at: ago(4), by: 'Eric', f: 'note', from: '', to: 'x' }] },
        { id: 'a1', n: 'Downspouts', t: 'Misc', buy: true, s: 'pick', chg: [{ at: ago(1), by: 'Eric', f: 'note', from: '', to: 'x' }] },
        { id: 'v20', n: 'Windows', t: 'Misc', buy: true, s: 'ordered', odate: day(20) },
        { id: 'v20e', n: 'Front door', t: 'Misc', buy: true, s: 'ordered', odate: day(20), eta: day(2) },
        { id: 'f20', n: 'Trim paint', t: 'Misc', buy: true, s: 'arrived', ins: day(20) },
        { id: 'c10', n: 'Check the vents', t: 'Misc', s: 'work', chg: [{ at: ago(10), by: 'Eric', f: 'note', from: '', to: 'x' }] },
        { id: 'n0', n: 'Porch beams', t: 'Misc', buy: true, s: 'picked' }] },
      { name: 'GARAGE', items: [{ id: 'g1', n: 'Floor paint', t: 'Misc', buy: true, s: 'pick', chg: [{ at: ago(30), by: 'Eric', f: 'note', from: '', to: 'x' }] }] }] });
    window._saves = 0; window.scheduleMatSave = () => { _saves++; };
    await openMaterials(0); _matRmShut = new Set(); renderMatMgr();
    window._it = id => _matD.rooms.flatMap(r => r.items).find(x => x.id === id);
    window._rowId = id => document.querySelector('#revBox .mat-item[data-id="' + id + '"]');
    window._age = id => { const a = _rowId(id) && _rowId(id).querySelector('.mat-age'); return a ? { c: [...a.classList].find(k => /^c\d$/.test(k)), w: a.textContent.replace(/\s+/g, ' ').trim(), lit: [...a.querySelectorAll('i')].filter(i => getComputedStyle(i).backgroundColor !== 'rgba(0, 0, 0, 0)').length } : null; };
    window._sec = n => [...document.querySelectorAll('#revBox .set-section')].find(s => s.querySelector('h4') && s.querySelector('h4').textContent.includes(n));
    window._chip = re => [...$('matStageChips').querySelectorAll('button')].find(b => re.test(b.textContent));
  });

  console.log('— ⏳ (1) getting old —');
  ok('the cubes count from the row\'s last change: 20 days = three lit (+ "20 days"), 8 days = two, 4 days = one, 1 day = nothing yet', await page.evaluate(() => {
    const a = _age('a20'), b = _age('a8'), c = _age('a4');
    return a && a.c === 'c3' && a.lit === 3 && /20 days/.test(a.w) && b && b.c === 'c2' && b.lit === 2 && /8 days/.test(b.w) && c && c.c === 'c1' && c.lit === 1 && /4 days/.test(c.w) && !_age('a1');
  }), await page.evaluate(() => JSON.stringify([_age('a20'), _age('a8'), _age('a4'), _age('a1')])));
  ok('an ordered row waits quietly on the vendor (20 days, no cubes) — until its expected arrival has passed (then the cubes count); a finished row never; a working checklist row does (10 days = two)', await page.evaluate(() =>
    !_age('v20') && _age('v20e') && _age('v20e').c === 'c3' && !_rowId('f20').querySelector('.mat-age') && _age('c10') && _age('c10').c === 'c2'),
    await page.evaluate(() => JSON.stringify([_age('v20'), _age('v20e'), _age('c10')])));
  ok('a row with no date at all is dated TODAY once on open (seen) — no cubes yet, and the board saves the stamp', await page.evaluate(() => _it('n0').seen === localDay(new Date()) && !_age('n0') && _saves > 0 && _it('a20').seen === undefined));
  ok('the heading counts "⏳ n getting old" (a week or more) and the working list "⏳ getting old (n)" shows just those rows, oldest category and all', await page.evaluate(() => {
    const h = _sec('EXTERIOR').querySelector('.mat-counts').textContent.replace(/\s+/g, ' ');
    const chip = _chip(/⏳ getting old/); const n = +(chip.textContent.match(/\((\d+)\)/) || [])[1];
    chip.click(); const shown = [...document.querySelectorAll('#revBox .mat-item')].map(r => r.dataset.id).sort().join();
    _chip(/⏳ getting old/).click();
    return /⏳ 4 getting old/.test(h) && n === 5 && shown === 'a20,a8,c10,g1,v20e' && _matStageF === '';
  }), await page.evaluate(() => _sec('EXTERIOR').querySelector('.mat-counts').textContent + ' | ' + (_chip(/⏳ getting old/) || {}).textContent));
  ok('20 days reads "20 days"; five weeks reads "4 wks"; the words ride in the label too', await page.evaluate(() => /30 days|4 wks/.test(_age('g1').w) && _age('g1').c === 'c3' && /waiting on you/.test(_rowId('g1').querySelector('.mat-age').getAttribute('aria-label'))));

  console.log('— 🚧 (2) stuck —');
  ok('every unfinished row wears a 🚧 stuck plate between ⚠ 1st and ⇄ — eight plates on ONE line at phone width, nothing off the edge', await page.evaluate(() => {
    const plates = [..._rowId('a20').querySelectorAll('.mat-line2 .mat-box')], tops = new Set(plates.map(p => Math.round(p.getBoundingClientRect().top)));
    const btns = [..._rowId('a20').querySelectorAll('.mat-rowbtns .mat-box')].map(b => ['mat-firstbtn', 'mat-stuckbtn', 'mat-flip'].find(k => b.classList.contains(k)));
    return plates.length === 8 && tops.size === 1 && btns.join('|') === 'mat-firstbtn|mat-stuckbtn|mat-flip' && $('revBox').scrollWidth <= $('revBox').clientWidth + 1 && document.documentElement.scrollWidth <= document.documentElement.clientWidth;
  }), await page.evaluate(() => JSON.stringify([..._rowId('a20').querySelectorAll('.mat-line2 .mat-box')].map(p => Math.round(p.getBoundingClientRect().top)))));
  ok('a tap marks it STUCK: the plate lights (✓, aria-pressed), the row wears a coral edge and a band "🚧 STUCK — needs:" with a box that takes the focus; the history writes it down', await page.evaluate(async () => {
    _rowId('a20').querySelector('.mat-stuckbtn').click(); await new Promise(r => setTimeout(r, 80));
    const it = _it('a20'), row = _rowId('a20'), band = row.querySelector('.mat-stuck-band'), box = $('matNeed-a20'), btn = row.querySelector('.mat-stuckbtn'), c = it.chg[it.chg.length - 1];
    return it.stuck === true && row.classList.contains('mi-stuck') && !!band && /🚧 STUCK — needs:/.test(band.textContent) && !!box && document.activeElement === box && btn.classList.contains('on') && btn.getAttribute('aria-pressed') === 'true' && !!btn.querySelector('.mb-ck') &&
      c.f === '🚧 stuck' && c.from === 'no' && c.to === 'yes' && getComputedStyle(row).boxShadow !== 'none';
  }), await page.evaluate(() => JSON.stringify({ stuck: _it('a20').stuck, cls: _rowId('a20').className, act: document.activeElement && document.activeElement.id })));
  ok('what he types in the band is the row\'s "needs" — kept, in the history as "what it needs", and shown in the edit window\'s own box', await page.evaluate(() => {
    const box = $('matNeed-a20'); box.value = 'find a tan soffit — the supplier has none'; box.dispatchEvent(new Event('change'));
    const it = _it('a20'), c = it.chg[it.chg.length - 1];
    matEditOpen('a20'); const sb = $('matNeedS-a20'), plate = [...document.querySelectorAll('#matSheet .pick-chip')].find(b => /🚧/.test(b.textContent));
    const r = it.need === 'find a tan soffit — the supplier has none' && c.f === 'what it needs' && c.to === it.need && !!sb && sb.value === it.need && !!plate && /✓ 🚧 STUCK/.test(plate.textContent) && plate.getAttribute('aria-pressed') === 'true';
    matEditClose(); return r;
  }), await page.evaluate(() => JSON.stringify({ need: _it('a20').need, last: _it('a20').chg[_it('a20').chg.length - 1] })));
  ok('the heading counts "🚧 1 stuck"; folded, it wears a coral "🚧 1 STUCK" plate and the counts line leaves its own out; the working list "🚧 stuck (1)" shows just that row', await page.evaluate(() => {
    const open = _sec('EXTERIOR').querySelector('.mat-counts').textContent.replace(/\s+/g, ' ');
    matRmToggle(0); const h4 = _sec('EXTERIOR').querySelector('h4'), lit = h4.querySelector('.mat-stuck-lit'), counts = h4.querySelector('.mat-counts').textContent.replace(/\s+/g, ' ');
    const folded = !!lit && lit.textContent.trim() === '🚧 1 STUCK' && !/🚧 1 stuck/.test(counts);
    matRmToggle(0);
    const chip = _chip(/🚧 stuck/); chip.click(); const shown = [...document.querySelectorAll('#revBox .mat-item')].map(r => r.dataset.id).join(); _chip(/🚧 stuck/).click();
    return /🚧 1 stuck/.test(open) && folded && /\(1\)/.test(chip.textContent) && shown === 'a20';
  }), await page.evaluate(() => _sec('EXTERIOR').querySelector('.mat-counts').textContent));
  ok('a row can be FIRST and STUCK at once — both bands; tap 🚧 again and it is clear: the band, the needs and the edge go, the history says so', await page.evaluate(() => {
    matFirstToggle('a20'); const both = _rowId('a20').classList.contains('mi-first') && _rowId('a20').classList.contains('mi-stuck') && !!_rowId('a20').querySelector('.mat-first-band') && !!_rowId('a20').querySelector('.mat-stuck-band');
    _rowId('a20').querySelector('.mat-stuckbtn').click();
    const it = _it('a20'), c = it.chg[it.chg.length - 1];
    matFirstToggle('a20');
    return both && !it.stuck && !('need' in it) && !_rowId('a20').classList.contains('mi-stuck') && !_rowId('a20').querySelector('.mat-stuck-band') && c.f === '🚧 stuck' && c.to === 'no';
  }));
  ok('a finished row is never stuck and never old (its 🚧 is cleared by finishing, its cubes gone)', await page.evaluate(() => {
    const it = _it('a8'); it.stuck = true; it.need = 'x'; it.ins = localDay(new Date()); it.s = 'arrived'; renderMatMgr();
    const r = !matIsStuck(it) && !matOld(it) && _rowId('a8').classList.contains('mi-fin') && !_rowId('a8').querySelector('.mat-stuck-band') && !_rowId('a8').querySelector('.mat-age');
    delete it.ins; delete it.stuck; delete it.need; it.s = 'picked'; renderMatMgr(); return r;
  }));
  ok('"? how this works" says both', await page.evaluate(() => { _matHelp = true; renderMatMgr(); const t = ($('matHelpBox') || {}).textContent || ''; _matHelp = false; renderMatMgr(); return /🚧 stuck marks a row that cannot move until something happens/.test(t) && /cubes count the days a row has waited on you/.test(t) && /ordered row waits quietly/.test(t); }));
  ok('THE WALL: stuck, needs and seen never ride to the homeowner\'s file', await page.evaluate(async () => {
    _it('a20').stuck = true; _it('a20').need = 'x';
    await matSave();
    const cl = JSON.parse(_dbxFiles[portalRoot() + '/materials-oak-111aaa.json'] || '{}'), c = (cl.rooms || []).flatMap(r => r.items);
    return c.length > 0 && c.every(x => !('stuck' in x) && !('need' in x) && !('seen' in x)) && /"stuck":true/.test(_dbxFiles[portalRoot() + '/materials-office-oak-111aaa.json']);
  }));

  ok('version bumped — APP_VER and the footer agree', /const APP_VER = 'v7\.(2[5-9]|[3-9]\d)'/.test(src) && new RegExp('<footer>' + (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1].replace('.', '\\.')).test(src));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
