// v7.23 — Eric: "In the build list, I click on 'Edit an item.' The Picked — what it is box is empty. But if I scroll down and unfold
// the homeowner tab, it has their pick (what's decided). There should be a button down there that says 'send to: Picked — what it
// is box'." Every name here is made up.
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
    _dbxFiles[portalRoot() + '/materials-office-oak-111aaa.json'] = JSON.stringify({ full: true, seq: 9, rooms: [
      { name: 'KITCHEN', items: [
        { id: 'h1', n: 'Their tile', t: 'Misc', hm: true, s: 'picked', pick: 'White subway' },
        { id: 'h2', n: 'Their faucet', t: 'Misc', hm: true, s: 'picked', pick: 'Brushed gold', desc: 'Something else' },
        { id: 'h3', n: 'Their sink', t: 'Misc', hm: true, s: 'pick' },
        { id: 'o1', n: 'Office hood', t: 'Misc', buy: true, s: 'pick' }] }] });
    _dbxFiles[portalRoot() + '/materials-oak-111aaa.json'] = JSON.stringify({ rooms: [{ name: 'KITCHEN', items: [
      { id: 'h1', n: 'Their tile', hm: true, s: 'picked', pick: 'White subway' }, { id: 'h2', n: 'Their faucet', hm: true, s: 'picked', pick: 'Brushed gold' }, { id: 'h3', n: 'Their sink', hm: true, s: 'pick' }] }] });
    await openMaterials(0); _matRmShut = new Set(); renderMatMgr();
    window._it = id => _matD.rooms.flatMap(r => r.items).find(x => x.id === id);
    window._btn = () => document.querySelector('#matSheet .mat-pick2desc');
    window._hint = () => document.querySelector('#matSheet .mat-pick-wait');
    window._said = []; const t0 = window.toast; window.toast = (m, g) => { if (m) _said.push(String(m)); return t0(m, g); };
  });

  console.log('— 👆 the homeowner\'s pick → the Picked — what it is box —');
  ok('a 🏠 row with their pick and an empty 👆 box: the box says the homeowner\'s pick is waiting in the 🏠 fold, and the fold has the plate 👆 Send to "Picked — what it is"', await page.evaluate(() => {
    matEditOpen('h1');
    const b = _btn(), h = _hint();
    return $('matDesc-h1').value === '' && !!h && /The homeowner picked "White subway"/.test(h.textContent) && /👆 Use it here/.test(h.textContent) &&
      !!b && b.closest('.ms-foldsec[data-fold="home"]') !== null && b.textContent.trim() === '👆 Send to "Picked — what it is"' && b.getAttribute('aria-pressed') === 'false';
  }), await page.evaluate(() => (_btn() || {}).textContent + ' | ' + (_hint() || {}).textContent));
  ok('a tap on it: the pick lands in the 👆 box, the waiting line is gone, the plate reads ✓ In the Picked — what it is box, the 🕘 history writes it down, the row leads with it', await page.evaluate(() => {
    _said.length = 0; _btn().click();
    const it = _it('h1'), c = it.chg[it.chg.length - 1], b = _btn();
    matEditClose(); renderMatMgr();
    const line = document.querySelector('#revBox .mat-item[data-id="h1"] .mat-sel').textContent.trim();
    matEditOpen('h1');
    return it.desc === 'White subway' && it.pick === 'White subway' && $('matDesc-h1').value === 'White subway' && !_hint() && b.textContent.trim() === '✓ In the Picked — what it is box' && b.getAttribute('aria-pressed') === 'true' &&
      c.f === 'picked — what it is' && c.from === '' && c.to === 'White subway' && c.by === 'Eric' && /^👆 White subway/.test(line) && _said.some(m => /Put in Picked — what it is: "White subway"/.test(m));
  }), await page.evaluate(() => JSON.stringify({ desc: _it('h1').desc, chg: _it('h1').chg, btn: (_btn() || {}).textContent })));
  ok('a 👆 box that already holds OTHER words asks ⚠ SURE? first (nothing changes), the second tap replaces them; a fresh tap after four seconds asks again', await page.evaluate(async () => {
    matEditOpen('h2'); _btn().click();
    const armed = /⚠ SURE\? It replaces "Something else"/.test(_btn().textContent) && _btn().classList.contains('armed') && _it('h2').desc === 'Something else' && !_hint();
    await new Promise(r => setTimeout(r, 4300));
    const calm = _btn().textContent.trim() === '👆 Send to "Picked — what it is"' && _it('h2').desc === 'Something else';
    _btn().click(); _btn().click();
    return armed && calm && _it('h2').desc === 'Brushed gold' && _btn().textContent.trim() === '✓ In the Picked — what it is box';
  }), await page.evaluate(() => JSON.stringify({ desc: _it('h2').desc, btn: (_btn() || {}).textContent })));
  ok('a 🏠 row with NO pick yet has neither the plate nor the waiting line; an office row has no 🏠 pick box at all — its 👆 box stands alone', await page.evaluate(() => {
    matEditOpen('h3'); const a = !_btn() && !_hint() && !!$('matDesc-h3');
    matEditOpen('o1'); const b = !_btn() && !_hint() && !!$('matDesc-o1') && !document.querySelector('#matSheet [onchange*="\'pick\'"]');
    return a && b;
  }));
  ok('typing their pick into the 🏠 box brings the plate up at once; 👆 Use it here at the top does the same job as the plate below', await page.evaluate(() => {
    matEditOpen('h3');
    const inp = document.querySelector('#matSheet [onchange*="\'pick\'"]'); inp.value = 'Black granite'; inp.dispatchEvent(new Event('change'));
    const a = _it('h3').pick === 'Black granite' && !!_btn() && !!_hint();
    _hint().querySelector('button').click();
    return a && _it('h3').desc === 'Black granite' && !_hint() && _btn().textContent.trim() === '✓ In the Picked — what it is box';
  }), await page.evaluate(() => JSON.stringify({ pick: _it('h3').pick, desc: _it('h3').desc, btn: !!_btn(), hint: !!_hint() })));
  ok('the wall: the homeowner\'s file still carries their pick and never the 👆 box', await page.evaluate(async () => {
    matEditClose(); await matSave();
    const cl = JSON.parse(_dbxFiles[portalRoot() + '/materials-oak-111aaa.json'] || '{}'), c = (cl.rooms || []).flatMap(r => r.items);
    const h1 = c.find(x => x.id === 'h1') || {};
    return h1.pick === 'White subway' && c.every(x => !('desc' in x));
  }));

  ok('version bumped — APP_VER and the footer agree', /const APP_VER = 'v7\.(2[3-9]|[3-9]\d)'/.test(src) && new RegExp('<footer>' + (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1].replace('.', '\\.')).test(src));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
