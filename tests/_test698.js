// ⇄ v6.98 — Eric: "how do i swith from checklist to item to pick and order" … "yes make it show on every row all the
// time." The ⇄ plate used to leave a row the moment one of its lights was lit, so he could not find it. It is on every
// row now, always after ⚠ 1st; a row with progress the flip would re-map asks "⚠ sure?" first; a 🏠 row says why it stays.
// Every name below is made up.
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

  await page.evaluate(async () => {
    jobs = ['Oak House']; crew = ['Phil']; entries = []; todos = []; nextId = 1; pendingQueue = [];
    window.scheduleSave = () => {}; window.savePendingSoon = () => {}; window.publishSharedNotes = () => {};
    renderJobSelects(); closePanels(); renderAll();
    dbx.refreshToken = 't'; _portalIdx = { clients: [{ key: 'oak', job: 'Oak House', code: 'oak-111aaa' }] };
    window._dbxFiles = {}; window.dbxDownload = async p => (window._dbxFiles || {})[p] ?? null; window.dbxUpload = async (p, b) => { window._dbxFiles[p] = b; return {}; };
    window.dbxPathExists = async p => Object.prototype.hasOwnProperty.call(window._dbxFiles, p);
    _dbxFiles[portalRoot() + '/materials-office-oak-111aaa.json'] = JSON.stringify({ full: true, seq: 9, rooms: [{ name: 'KITCHEN', items: [
      { id: 'm1', n: 'Plain to buy', t: 'Misc', buy: true, s: 'pick' },
      { id: 'm2', n: 'Ordered faucet', t: 'Misc', buy: true, s: 'ordered', odate: '2026-09-01' },
      { id: 'm3', n: 'Installed hood', t: 'Misc', buy: true, s: 'arrived', ins: '2026-09-05' },
      { id: 'm4', n: 'Plain checklist', t: 'Misc', s: 'todo' },
      { id: 'm5', n: 'Tagged and scheduled', t: 'Electrical', tg: ['Electrical'], s: 'todo', sch: true, schd: '2026-10-01' },
      { id: 'm6', n: 'Checklist in work', t: 'Misc', s: 'work' },
      { id: 'm7', n: 'Checklist done', t: 'Misc', s: 'done' },
      { id: 'm8', n: 'Homeowner pick', t: 'Misc', hm: true, s: 'picked', pick: 'Matte black' }] }] });
    await openMaterials(0);
    window._row = n => [...document.querySelectorAll('#revBox .mat-item')].find(r => r.querySelector('b') && r.querySelector('b').textContent === n);
    window._flip = n => _row(n).querySelector('.mat-flip');
    window._it = id => _matD.rooms[0].items.find(x => x.id === id);
    window._said = []; const t0 = window.toast; window.toast = (m, g) => { if (m) _said.push(String(m)); return t0(m, g); };
  });

  ok('EVERY row wears the ⇄ plate, always in the same place — right after ⚠ 1st — whatever lights are lit: to buy, ordered, installed, checklist, tagged, in work, done, and the 🏠 row', await page.evaluate(() => {
    // ✓ v7.19 — a FINISHED row (the installed hood, the checklist done) folds to its name and ✓ FINISHED; its ⇄ is in the edit window
    const rows = [...document.querySelectorAll('#revBox .mat-item:not(.mi-fin)')], fin = [...document.querySelectorAll('#revBox .mat-item.mi-fin')].map(r => r.textContent);
    return rows.length === 6 && rows.every(r => { const b = [...r.querySelectorAll('.mat-rowbtns .mat-box')]; return b.length === 2 && b[0].classList.contains('mat-firstbtn') && b[1].classList.contains('mat-flip'); }) &&
      fin.length === 2 && fin.some(t => /Installed hood/.test(t)) && fin.some(t => /Checklist done/.test(t)) &&
      _flip('Plain to buy').textContent.replace(/\s+/g, '') === '⇄list' && _flip('Plain checklist').textContent.replace(/\s+/g, '') === '⇄buy' && _flip('Ordered faucet').textContent.replace(/\s+/g, '') === '⇄list';
  }));

  ok('a row with nothing to lose flips in ONE tap, both ways — and a tag or a schedule is nothing to lose (both ride across)', await page.evaluate(() => {
    _flip('Plain checklist').click(); const a = _it('m4').buy === true && _it('m4').s === 'pick' && /pick needed/.test(_row('Plain checklist').textContent);
    _flip('Plain checklist').click(); const b = !_it('m4').buy && _it('m4').s === 'todo';
    _flip('Tagged and scheduled').click(); const it = _it('m5');
    const c = it.buy === true && it.s === 'pick' && it.sch === true && it.schd === '2026-10-01' && JSON.stringify(it.tg) === '["Electrical"]';
    _flip('Tagged and scheduled').click();
    return a && b && c && !_it('m5').buy;
  }));

  const armed = await page.evaluate(async () => {
    _flip('Ordered faucet').click();
    const f = _flip('Ordered faucet'), one = { s: _it('m2').s, buy: _it('m2').buy, words: f.textContent.replace(/\s+/g, ''), cls: f.classList.contains('armed'), label: f.getAttribute('aria-label') };
    await new Promise(r => setTimeout(r, 4300));
    const calm = { words: _flip('Ordered faucet').textContent.replace(/\s+/g, ''), s: _it('m2').s, buy: _it('m2').buy };
    _flip('Ordered faucet').click(); _flip('Ordered faucet').click();
    const two = { buy: !!_it('m2').buy, s: _it('m2').s, words: _flip('Ordered faucet').textContent.replace(/\s+/g, '') };
    return { one, calm, two };
  });
  ok('a row with PROGRESS (an ordered faucet) does not flip on a stray tap: the plate arms — "⚠ sure?" in words — and lets go by itself after four seconds with nothing changed', armed.one.s === 'ordered' && armed.one.buy === true && armed.one.words === '⚠sure?' && armed.one.cls && /tap again to flip it/.test(armed.one.label) && armed.calm.words === '⇄list' && armed.calm.s === 'ordered' && armed.calm.buy === true, JSON.stringify(armed));
  ok('the second tap inside the four seconds does flip it, and its light is carried across as best it fits (ordered → in work)', armed.two.buy === false && armed.two.s === 'work' && armed.two.words === '⇄buy', JSON.stringify(armed.two));

  ok('the same guard on a checklist row that is in work or done, and on an installed thing; arming one row disarms nothing else by accident', await page.evaluate(() => {
    // ✓ v7.19 — finished rows are folded (no plate on the row), so the guard is driven through the plate's own function
    matFlipTap('m7'); const a = _it('m7').s === 'done' && !_it('m7').buy && _matFlipArm === 'm7';
    matFlipTap('m3'); const b = _it('m3').s === 'arrived' && !!_it('m3').ins && _matFlipArm === 'm3';
    matFlipTap('m3'); const c = !_it('m3').buy && _it('m3').s === 'done';
    return a && b && c;
  }));

  ok('a 🏠 row wears the plate too — dimmed, a house on it, marked disabled — and a tap says in words why it stays something to buy; nothing changes', await page.evaluate(() => {
    const f = _flip('Homeowner pick'); _said.length = 0; const before = JSON.stringify(_it('m8'));
    f.click();
    return f.classList.contains('is-off') && f.getAttribute('aria-disabled') === 'true' && /🏠/.test(f.textContent) && /stays something to buy/.test(f.getAttribute('aria-label')) &&
      /on the homeowner's page, so it stays something to buy/.test(_said.join(' ')) && JSON.stringify(_it('m8')) === before;
  }));

  ok('all seven plates of a thing to buy still sit on ONE line on the phone, and nothing runs off the board', await page.evaluate(() => {
    const plates = [..._row('Plain to buy').querySelectorAll('.mat-line2 .mat-box')], tops = new Set(plates.map(p => Math.round(p.getBoundingClientRect().top)));
    return plates.length === 7 && tops.size === 1 && $('revBox').scrollWidth <= $('revBox').clientWidth + 1 && document.documentElement.scrollWidth <= document.documentElement.clientWidth;
  }));

  ok('"? how this works" says it the new way', await page.evaluate(() => { _matHelp = true; renderMatMgr(); const t = ($('matHelpBox') || {}).textContent || ''; _matHelp = false; renderMatMgr(); return /at the end of every row/.test(t) && /asks ⚠ sure\? first/.test(t) && !/while no light is lit/.test(t); }));

  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v6.98') && document.querySelector('footer').textContent.includes(APP_VER);
  }));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
