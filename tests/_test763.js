// 🔍 v7.63 — A SEARCH BOX ON THE BUILD LIST. Eric: "in the build list i need a search bar to find items or categories at the top
// with the rest of the sorting stuff." The words he types find a row (its name, what it is, its note, the pick, its SKU, a tag) or
// a whole category by its name; the board narrows to what matches, the matching categories unfold, a line counts what it found,
// ✕ clears it, the box keeps his thumb through every redraw, and it rides with the working-list and 🏷 filters. Every name made up.
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
        { id: 'k1', n: 'Kitchen sink', t: 'Misc', buy: true, s: 'picked', desc: 'Kraus 32 inch, stainless', sku: 'KHU100-32' },
        { id: 'k2', n: 'Faucet', t: 'Misc', buy: true, s: 'pick', sel: 'matte black, pull-down' },
        { id: 'k3', n: 'Disposal', t: 'Misc', buy: true, s: 'ordered', tg: ['Plumbing'] }] },
      { name: 'MASTER BATHROOM', items: [
        { id: 'b1', n: 'Vanity', t: 'Misc', hm: true, s: 'picked', pick: 'the oak one with the vessel sink' },
        { id: 'b2', n: 'Shower valve', t: 'Misc', buy: true, s: 'pick', tg: ['Plumbing'] }] },
      { name: 'GARAGE', items: [
        { id: 'g1', n: 'Floor paint', t: 'Misc', buy: true, s: 'pick' },
        { id: 'g2', n: 'Check the vents', t: 'Misc', s: 'todo' }] }] });
    window.scheduleMatSave = () => {};
    await openMaterials(0);
    window._shown = () => [...document.querySelectorAll('#revBox .set-section[data-ri]')].map(s => ({ cat: s.querySelector('h4 button').textContent.replace(/^[▸▾]\s*/, '').trim(), shut: s.querySelector('h4 button').getAttribute('aria-expanded') === 'false', rows: [...s.querySelectorAll('.mat-item')].map(r => r.dataset.id) }));
    window._say = () => (document.querySelector('.mat-search-say') || { textContent: '' }).textContent.replace(/\s+/g, ' ').trim();
    window._type = v => { const b = $('matSearch'); b.focus(); b.value = v; b.dispatchEvent(new Event('input', { bubbles: true })); };
  });

  ok('the box sits at the top of the board, above the 🏷 sort and the working lists, 44px tall, and the board opens folded with every category and no count line', await page.evaluate(() => {
    const b = $('matSearch'), chips = $('matStageChips'), tags = document.querySelector('#revBox .chips-row');
    const order = b && chips && tags && !!(b.compareDocumentPosition(tags) & Node.DOCUMENT_POSITION_FOLLOWING) && !!(b.compareDocumentPosition(chips) & Node.DOCUMENT_POSITION_FOLLOWING);
    return order && b.getBoundingClientRect().height >= 44 && /Find an item or a category/.test(b.placeholder) && _shown().length === 3 && _shown().every(s => s.shut) && _say() === '' && !document.querySelector('.mat-search-x');
  }), await page.evaluate(() => JSON.stringify(_shown())));
  ok('a word finds rows by NAME across the board — the matching categories unfold, the others leave, the line counts what it found, ✕ appears', await page.evaluate(() => {
    _type('paint');
    const s = _shown();
    return s.length === 1 && s[0].cat === 'GARAGE' && !s[0].shut && s[0].rows.join() === 'g1' && _say() === '🔍 1 row in 1 category match “paint” · ✕ clears it' && !!document.querySelector('.mat-search-x');
  }), await page.evaluate(() => JSON.stringify([_shown(), _say()])));
  ok('a CATEGORY name finds the whole category — every row in it', await page.evaluate(() => { _type('kitchen'); const s = _shown(); return s.length === 1 && s[0].cat === 'KITCHEN' && s[0].rows.join() === 'k1,k2,k3' && /3 rows in 1 category/.test(_say()); }), await page.evaluate(() => JSON.stringify(_shown())));
  ok('what it IS, the note, the homeowner\'s pick, the SKU and a tag are searched too — case aside', await page.evaluate(() => {
    const by = v => { _type(v); return _shown().flatMap(s => s.rows).join(); };
    return by('Kraus') === 'k1' && by('pull-down') === 'k2' && by('vessel') === 'b1' && by('khu100') === 'k1' && by('plumb') === 'k3,b2';
  }), await page.evaluate(() => { const by = v => { _type(v); return _shown().flatMap(s => s.rows).join(); }; return JSON.stringify([by('Kraus'), by('pull-down'), by('vessel'), by('khu100'), by('plumb')]); }));
  ok('two categories matched read "n rows in 2 categories"; nothing matched is said in words and the board shows no category', await page.evaluate(() => {
    _type('plumb'); const two = _shown().length === 2 && /2 rows in 2 categories match “plumb”/.test(_say());
    _type('zzzz'); return two && _shown().length === 0 && _say() === '🔍 nothing on this board matches “zzzz” · ✕ clears it';
  }), await page.evaluate(() => JSON.stringify([_shown(), _say()])));
  ok('the box keeps his thumb through the redraw: it is still focused with the caret at the end', await page.evaluate(() => { _type('vent'); const b = $('matSearch'); return document.activeElement === b && b.selectionStart === 4 && b.value === 'vent' && _shown().flatMap(s => s.rows).join() === 'g2'; }));
  ok('✕ clears it: every category is back (open, as a search leaves them), the count line and the ✕ are gone, the box is empty and focused', await page.evaluate(() => { document.querySelector('.mat-search-x').click(); const s = _shown(); return s.length === 3 && s.every(x => !x.shut) && _say() === '' && !document.querySelector('.mat-search-x') && $('matSearch').value === '' && document.activeElement === $('matSearch'); }), await page.evaluate(() => JSON.stringify(_shown())));
  ok('it rides WITH a working-list filter: ○ to pick narrows the search to the rows that are both, and the line says so', await page.evaluate(() => {
    [...$('matStageChips').querySelectorAll('button')].find(b => /to pick/.test(b.textContent)).click();
    _type('a');   // every row has an a in its name but Faucet… no — "Faucet" has one too; the stage filter is what narrows
    const rows = _shown().flatMap(s => s.rows).join();
    const r = rows === 'k2,b2,g1' && /\(with the filter below\)/.test(_say());
    _matStageF = ''; _matQ = ''; renderMatMgr();
    return r;
  }), await page.evaluate(() => JSON.stringify([_shown(), _say()])));
  ok('opening the board again starts with an empty box', await page.evaluate(async () => { _type('sink'); matClose(); await openMaterials(0); return $('matSearch').value === '' && _matQ === '' && _shown().length === 3; }));
  ok('? how this works says it', await page.evaluate(() => { _matHelp = true; renderMatMgr(); return /🔍 Find — type a word in the box at the top/.test($('matHelpBox').textContent); }));
  ok('at 390px nothing runs off the side', await page.evaluate(() => $('revBox').scrollWidth <= $('revBox').clientWidth + 1 && document.documentElement.scrollWidth <= document.documentElement.clientWidth));
  await page.evaluate(() => matClose());

  ok('version bumped — APP_VER and the footer agree', /const APP_VER = 'v7\.(6[3-9]|[7-9]\d)'/.test(src) && new RegExp('<footer>' + (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1].replace('.', '\\.') + ' ·').test(src));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
