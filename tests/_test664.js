// 🩹 v6.64 — SELF-HEAL. Eric, on Josten: "i have a receipt that says 'total due to phil: $15,600'
// and it says 'sent on their page' but then i go to client view and estimated upcoming costs and
// i dont see it on there." The board had it pending; the page had lost its `upcoming` block to
// another writer. The board is the truth for what is pending: opening the estimates board or the
// receipts window republishes the page when it disagrees.
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
  await page.goto(process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html');
  await page.waitForTimeout(700);
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };

  const seed = () => page.evaluate(() => {
    jobs = ['Josten/Weiser']; curJob = 'Josten/Weiser'; crew = []; entries = []; todos = []; nextId = 1;
    window.scheduleSave = () => {};
    dbx.refreshToken = 'test-token';
    _portalIdx = { clients: [{ key: 'josten', job: 'Josten–Weiser Custom Home', code: 'josten-842d53' }] };
    window._dbxFiles = {};
    window.dbxDownload = async p => (window._dbxFiles || {})[p] ?? null;
    window.dbxUpload = async (p, body) => { (window._dbxFiles || {})[p] = body; return {}; };
    window.dbxPathExists = async p => Object.prototype.hasOwnProperty.call(window._dbxFiles || {}, p);
    // Josten's board, as it really was: four bills pending under dark categories
    window._dbxFiles[estPath('josten-842d53')] = JSON.stringify({ mk: 20, cats: [
      { n: 'Heating', appr: false, bids: [], pend: [{ a: 13400, v: 'Waterworks', ts: '2026-09-11', base: 0, eid: 3045 }] },
      { n: 'Interior Paint', appr: false, bids: [], pend: [{ a: 15600, v: '', ts: '2026-09-06', base: 0, eid: 2842 }] },
      { n: 'Garage Doors', appr: false, bids: [], pend: [{ a: 3290, v: 'Peninsula', ts: '2026-09-05', base: 9240, eid: 2776 }] }] });
    // …and the page as another writer left it: books numbers, journal, switches — no `upcoming`
    window._dbxFiles[portalRoot() + '/josten-842d53.json'] = JSON.stringify({ name: 'Josten–Weiser Custom Home', updated: '2026-09-11',
      show: { money: true, phases: true, boards: false }, invoiced: 491368.74, paid: 491368.74, open: 0,
      phases: [{ name: 'Exterior Finish', cats: [['Garage doors', 9240]] }],
      journal: [{ week: 'Aug 28 – Sep 3', released: '2026-09-04', text: 'Garage doors installed.' }], boardsOff: ['b1'] });
    _estIdx = -1; _estD = null; _estPage = null; _rcptIdx = -1; _rcptSel = new Set(); window._qUpBusy = false;
  });
  const pg = () => page.evaluate(() => JSON.parse(window._dbxFiles[portalRoot() + '/josten-842d53.json']));

  console.log('— 🩹 v6.64 the page lost its upcoming block —');

  await seed();
  ok('the setup is the bug: three bills pending, none on the page', await page.evaluate(() => {
    const p = JSON.parse(window._dbxFiles[portalRoot() + '/josten-842d53.json']);
    return !p.upcoming;
  }));

  ok('opening the estimates board puts them back — all three, marked up, no vendor', await (async () => {
    await page.evaluate(async () => { await openEstimates(0); });
    await page.waitForTimeout(1600);   // scheduleEstSave's debounce
    const p = await pg();
    const said = await page.evaluate(() => /put(ting)? (them )?back/i.test($('toast').textContent));
    const names = (p.upcoming || { items: [] }).items.map(i => i.n).sort().join('|');
    return !!p.upcoming && p.upcoming.tot === Math.round((13400 + 15600 + 3290) * 1.2 * 100) / 100 &&
      names === 'Garage Doors|Heating|Interior Paint' && !/Waterworks|Peninsula/.test(JSON.stringify(p.upcoming)) && said;
  })());

  { const p = await pg(); ok('the books numbers, the journal, the switches and boardsOff are untouched',
      p.invoiced === 491368.74 && (p.journal || []).length === 1 && p.show.boards === false && p.show.money === true && JSON.stringify(p.boardsOff) === '["b1"]'); }

  ok('a page that already agrees is left alone — no needless rewrite', await page.evaluate(async () => {
    closeEstimates();
    const before = window._dbxFiles[portalRoot() + '/josten-842d53.json'];
    let writes = 0; const real = window.dbxUpload;
    window.dbxUpload = async (p, body) => { if (/josten-842d53\.json$/.test(p)) writes++; return real(p, body); };
    await openEstimates(0);
    await new Promise(r => setTimeout(r, 1600));
    closeEstimates();
    window.dbxUpload = real;
    return writes === 0 && window._dbxFiles[portalRoot() + '/josten-842d53.json'] === before;
  }));

  await seed();
  ok('the receipts window heals it too, and says so', await (async () => {
    await page.evaluate(async () => { await openRcptReview(0); });
    await page.waitForTimeout(300);
    const p = await pg();
    const said = await page.evaluate(() => /put back/i.test($('toast').textContent));
    await page.evaluate(() => closeRcptReview());
    return !!p.upcoming && p.upcoming.items.length === 3 && said;
  })());

  ok('a hidden budget switch is not disturbed by the heal', await page.evaluate(async () => {
    const p = JSON.parse(window._dbxFiles[portalRoot() + '/josten-842d53.json']);
    p.show.upcoming = false; delete p.upcoming;
    window._dbxFiles[portalRoot() + '/josten-842d53.json'] = JSON.stringify(p);
    await openRcptReview(0); await new Promise(r => setTimeout(r, 300)); closeRcptReview();
    const q = JSON.parse(window._dbxFiles[portalRoot() + '/josten-842d53.json']);
    return q.show.upcoming === false && !!q.upcoming;   // the block is back; his switch still says hidden
  }));

  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v6.64') && document.querySelector('footer').textContent.includes(APP_VER);
  }));

  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
