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
  await page.evaluate(() => {
    jobs = ['Mery']; curJob = 'Mery'; crew = []; entries = []; todos = []; nextId = 1;
    prefs.tagScrub1 = true; prefs.tagScrub2 = true;
    renderJobSelects(); closePanels(); renderAll();
    window._dbxFiles = {};
    window.dbxDownload = async path => (window._dbxFiles || {})[path] ?? null;
    window.dbxUpload = async (path, body) => { (window._dbxFiles || {})[path] = body; return {}; };
    window.dbxPathExists = async path => Object.prototype.hasOwnProperty.call(window._dbxFiles || {}, path);
    window.scheduleSave = () => {};
    dbx.refreshToken = dbx.refreshToken || 'test-token';
  });

  // a receipt already SENT: on the board as a pending bill in a DARK category, on their page under upcoming
  const seedSent = () => page.evaluate(() => {
    entries = []; nextId = 1;
    _portalIdx = { clients: [{ key: 'mery', job: 'Mery Addition & Remodel', code: 'mery-224374' }] };
    const e = addEntry('Note', 'lumber package $1,000', 'Mery', {});
    e.rcpt = true; e.category = 'Framing'; e.ai = '💵 $1,000.00 🏪 Spenard'; e.budg = 'sent';
    window._e = e;
    window._dbxFiles = {};
    window._dbxFiles[estPath('mery-224374')] = JSON.stringify({ updated: '', mk: 20, cats: [
      { n: 'Framing', appr: false, bids: [], pend: [{ a: 1000, v: 'Spenard', ts: '2026-09-05', base: 0, eid: e.id }] }] });
    window._dbxFiles[portalRoot() + '/mery-224374.json'] = JSON.stringify({ name: 'Mery',
      upcoming: { items: [{ n: 'Framing', a: 1200 }], tot: 1200 } });
    _estIdx = -1; _estD = null; _estPage = null; window._qUpBusy = false; _estBillFold = null;
    return e.id;
  });
  const pageJson = () => page.evaluate(() => JSON.parse(window._dbxFiles[portalRoot() + '/mery-224374.json']));
  const boardJson = () => page.evaluate(() => JSON.parse(window._dbxFiles[estPath('mery-224374')]));

  console.log('— ↩ v6.34 take it back, all the way —');

  await seedSent();
  ok('the pending bill row wears BOTH buttons — QB has it, and Take back', await page.evaluate(async () => {
    await openEstimates(0);
    _estOpenCats.add(_estD.cats.findIndex(x => x.n === 'Framing')); renderEstimates();   // unfold the category, as a tap would
    const h = $('revBox').innerHTML;
    return /QB HAS IT/.test(h) && /↩ Take back/.test(h) && /estPendClear\(\d+, 0, 'back'\)/.test(h);
  }));

  ok('↩ Take back pulls it off the board', await page.evaluate(async () => {
    const ci = _estD.cats.findIndex(x => x.n === 'Framing');
    await estPendClear(ci, 0, 'back');
    return !_estD.cats[ci].pend;
  }));

  ok('…and off their page — republished even though the lamp is dark', async () => {}, '');
  { const pg = await pageJson(); ok('their page no longer shows it under UPCOMING', !pg.upcoming); }

  ok('the receipt is WAITING again — 🔴, both doors open, back in the count', await page.evaluate(() =>
    _e.budg === undefined && /NOT ON IT/.test(rcptLampHtml(_e)) && rcptCount('Mery') === 1));

  ok('the trail says ERIC took it back — not a QuickBooks match', await page.evaluate(() => {
    const t = (_estD.cleared || [])[0];
    return t && t.why === 'eric' && t.eid === _e.id && t.a === 1000 && t.v === 'Spenard';
  }));

  ok('the board file on Dropbox carries the trail too', async () => {}, '');
  { const b = await boardJson(); ok('the saved board carries the trail entry', (b.cleared || [])[0] && b.cleared[0].why === 'eric'); }

  ok('it can be sent AGAIN after fixing it (the whole point)', await page.evaluate(async () => {
    closeEstimates();
    _e.category = 'Septic';                      // he fixed the category
    await estQuickUpcoming(_e.id);
    const b = JSON.parse(window._dbxFiles[estPath('mery-224374')]);
    const sep = b.cats.find(x => x.n === 'Septic');
    return _e.budg === 'sent' && sep && sep.pend && sep.pend.length === 1;
  }));

  console.log('— 📗 v6.34 "QB has it" settles it instead —');

  await seedSent();
  ok('✓ QB HAS IT retires the bill and keeps the receipt SETTLED (🟢) — no second offer', await page.evaluate(async () => {
    await openEstimates(0);
    const ci = _estD.cats.findIndex(x => x.n === 'Framing');
    await estPendClear(ci, 0, 'qb');
    return !_estD.cats[ci].pend && _e.budg === 'sent' && rcptCount('Mery') === 0 && /ON THE LIST/.test(rcptLampHtml(_e));
  }));

  { const pg = await pageJson(); ok('their page drops it from UPCOMING all the same', !pg.upcoming); }

  ok('the trail says Eric paired it by hand — distinct from the automatic match', await page.evaluate(() =>
    (_estD.cleared || [])[0].why === 'qb-eric'));

  console.log('— 🔮 v6.34 the board\'s own approve reaches the page at once —');

  await seedSent();
  ok('✓ ONTO THEIR PAGE in a DARK category publishes UPCOMING immediately', await page.evaluate(async () => {
    closeEstimates();
    // a fresh receipt, not yet sent, waiting in the bill strip
    const e2 = addEntry('Note', 'gravel load', 'Mery', {});
    e2.rcpt = true; e2.category = 'Framing'; e2.ai = '💵 $500.00 🏪 Pit';
    window._dbxFiles[estPath('mery-224374')] = JSON.stringify({ updated: '', mk: 20, cats: [{ n: 'Framing', appr: false, bids: [] }] });
    window._dbxFiles[portalRoot() + '/mery-224374.json'] = JSON.stringify({ name: 'Mery' });
    await openEstimates(0);
    const a = $('estBillA-' + e2.id), c = $('estBillC-' + e2.id);
    if (!a || !c) return 'strip inputs missing';
    a.value = '500'; c.value = String(_estD.cats.findIndex(x => x.n === 'Framing'));
    await estBillApprove(e2.id);
    const pg = JSON.parse(window._dbxFiles[portalRoot() + '/mery-224374.json']);
    closeEstimates();
    return pg.upcoming && pg.upcoming.tot === 600 && /UPCOMING/.test($('toast').textContent);
  }) === true);

  ok('the by-hand line publishes the same way', await page.evaluate(async () => {
    window._dbxFiles[estPath('mery-224374')] = JSON.stringify({ updated: '', mk: 20, cats: [{ n: 'Framing', appr: false, bids: [] }] });
    window._dbxFiles[portalRoot() + '/mery-224374.json'] = JSON.stringify({ name: 'Mery' });
    _estBillFold = true;   // nothing is waiting, so the strip only opens if he opens it — as a tap would
    await openEstimates(0);
    const a = $('estHandA'), c = $('estHandC');
    if (!a || !c) return false;
    a.value = '250'; c.value = String(_estD.cats.findIndex(x => x.n === 'Framing'));
    await estBillHand();
    const pg = JSON.parse(window._dbxFiles[portalRoot() + '/mery-224374.json']);
    closeEstimates();
    return pg.upcoming && pg.upcoming.tot === 300;
  }));

  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v6.34') && document.querySelector('footer').textContent.includes(APP_VER);
  }));

  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
