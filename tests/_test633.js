const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
  const APP = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  await page.goto(APP);
  await page.waitForTimeout(700);
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };
  await page.evaluate(() => {
    // the REAL shape of Eric's data: the app job is short, the portal name is long
    jobs = ['Josten/Weiser', 'Mery']; curJob = 'Josten/Weiser'; crew = []; entries = []; todos = []; nextId = 1;
    prefs.tagScrub1 = true; prefs.tagScrub2 = true;
    renderJobSelects(); closePanels(); renderAll();
    window._dbxFiles = {}; window._dbxLog = [];
    window.dbxDownload = async path => { window._dbxLog.push(['get', path]); return (window._dbxFiles || {})[path] ?? null; };
    window.dbxUpload = async (path, body) => { window._dbxLog.push(['put', path, body]); (window._dbxFiles || {})[path] = body; return {}; };
    window.dbxPathExists = async path => Object.prototype.hasOwnProperty.call(window._dbxFiles || {}, path);
    window.scheduleSave = () => {};
  });

  console.log('— 🔗 v6.33 the portal name and the app job are two different strings —');

  const seed = () => page.evaluate(() => {
    entries = []; nextId = 1;
    _portalIdx = { clients: [{ key: 'josten', job: 'Josten–Weiser Custom Home', code: 'josten-842d53' }] };
    window._dbxFiles = {};
    // Josten has a PAGE (with QuickBooks already carrying $9,240 of garage doors) but NO board file
    window._dbxFiles[portalRoot() + '/josten-842d53.json'] = JSON.stringify({ name: 'Josten–Weiser Custom Home',
      phases: [{ name: 'Exterior Finish', cats: [['Garage doors', 9240], ['Siding', 33391.07]] }] });
    window._dbxFiles[portalRoot() + '/index.json'] = JSON.stringify(_portalIdx);
    // Eric's actual entry, as the grinder wrote it this morning
    const e = addEntry('Note', '📅 2026-07-21\n🏪 Peninsula Overhead Doors LLC\n💵 $3,290', 'Josten/Weiser', {});
    e.rcpt = true; e.category = 'Garage Doors';
    e.ai = '📅 2026-07-21\n🏪 Peninsula Overhead Doors LLC\n💵 $3,290\n🗓 DUE 2026-08-01 — ⚠ PAST DUE';
    window._pod = e;
    _estIdx = -1; _estD = null; _estPage = null; window._qUpBusy = false; _rcptSel = new Set();
    return e.id;
  });

  let id = await seed();
  ok('portalAppJob bridges "Josten–Weiser Custom Home" to the app job "Josten/Weiser"', await page.evaluate(() =>
    portalAppJob(_portalIdx.clients[0]) === 'Josten/Weiser'));

  ok('the receipts count sees it — it used to compare the two names literally and find nothing', await page.evaluate(() =>
    rcptCount(portalAppJob(_portalIdx.clients[0])) === 1 && rcptCount(_portalIdx.clients[0].job) === 0));

  ok('the tracker button says 1 WAITING for Josten', await page.evaluate(async () => {
    dbx.refreshToken = dbx.refreshToken || 'test-token';
    _portalOpen = 0;
    await renderPortalList();
    return /🧾 Receipts to approve · 1 WAITING/.test($('portalList').innerHTML);
  }));

  ok('the bill strip on the estimates board finds it too (empty since v5.94 — this was why)', await page.evaluate(() => {
    _estIdx = 0; _estD = { mk: 20, cats: [] }; _estPage = {};
    const c = estBillCands();
    _estIdx = -1; _estD = null; _estPage = null;
    return c.length === 1 && c[0].id === _pod.id;
  }));

  ok('the receipts window lists it under Josten', await page.evaluate(async () => {
    await openRcptReview(0);
    return /Peninsula Overhead Doors/.test($('revBox').textContent) && /receipt \$3,290\.00/.test($('revBox').textContent);
  }));

  ok('and shows the number the homeowner will see — 20% folded in', await page.evaluate(() =>
    /they see \$3,948\.00/.test($('revBox').textContent)));

  console.log('— 🆕 v6.33 a client with no estimates board yet —');

  ok('Dropbox says "no such file" → the door starts a fresh board and sends', await page.evaluate(async () => {
    closeRcptReview();
    await estQuickUpcoming(_pod.id);
    const saved = JSON.parse(window._dbxFiles[estPath('josten-842d53')] || 'null');
    return _pod.budg === 'sent' && !!saved && Array.isArray(saved.cats) && saved.mk === 20;
  }));

  ok('the fresh board has Eric\'s default categories in his order, nothing approved', await page.evaluate(() => {
    const saved = JSON.parse(window._dbxFiles[estPath('josten-842d53')]);
    return saved.cats.length >= EST_DEFAULT_CATS.length && saved.cats[0].n === EST_DEFAULT_CATS[0] &&
      !saved.cats.some(x => x.appr);
  }));

  ok('the bill landed under Garage Doors, base stamped from QuickBooks ($9,240 already in)', await page.evaluate(() => {
    const saved = JSON.parse(window._dbxFiles[estPath('josten-842d53')]);
    const gd = saved.cats.find(x => x.n === 'Garage Doors');
    return gd && gd.pend && gd.pend.length === 1 && gd.pend[0].a === 3290 && gd.pend[0].base === 9240 &&
      gd.pend[0].eid === _pod.id && /Peninsula/.test(gd.pend[0].v);
  }));

  ok('their page got 🔮 upcoming: Garage Doors $3,948, no vendor', await page.evaluate(() => {
    const pg = JSON.parse(window._dbxFiles[portalRoot() + '/josten-842d53.json']);
    return pg.upcoming && pg.upcoming.tot === 3948 && pg.upcoming.items[0].n === 'Garage Doors' &&
      !/Peninsula/.test(JSON.stringify(pg.upcoming));
  }));

  ok('the toast says exactly what they see', await page.evaluate(() => /UPCOMING — Garage Doors, \$3,948/.test($('toast').textContent)));

  id = await seed();
  ok('the file EXISTS but would not read → still refused, nothing invented, nothing written', await page.evaluate(async () => {
    window._dbxFiles[estPath('josten-842d53')] = '{"cats":[{"n":"Framing","appr":true,"bids":[{"e1":50000,"acc":true}]}]}';
    const real = window.dbxDownload;
    window.dbxDownload = async path => (path === estPath('josten-842d53') ? null : (window._dbxFiles || {})[path] ?? null);
    const before = window._dbxFiles[estPath('josten-842d53')];
    await estQuickUpcoming(_pod.id);
    window.dbxDownload = real;
    return !_pod.budg && window._dbxFiles[estPath('josten-842d53')] === before && /nothing sent/i.test($('toast').textContent);
  }));

  id = await seed();
  ok('the probe itself failing → refused too (a bad signal is not "no file")', await page.evaluate(async () => {
    const realP = window.dbxPathExists;
    window.dbxPathExists = async () => { throw new Error('offline'); };
    await estQuickUpcoming(_pod.id);
    window.dbxPathExists = realP;
    return !_pod.budg && !window._dbxFiles[estPath('josten-842d53')];
  }));

  id = await seed();
  ok('the batch APPROVE in the receipts window starts a fresh board the same way', await page.evaluate(async () => {
    await openRcptReview(0);
    rcptTog(_pod.id);
    await rcptApprove();
    const saved = JSON.parse(window._dbxFiles[estPath('josten-842d53')] || 'null');
    const okNow = _pod.budg === 'sent' && !!saved && saved.cats.find(x => x.n === 'Garage Doors').pend.length === 1;
    closeRcptReview();
    return okNow;
  }));

  console.log('— 🧾 v6.33 Receipts turns every other filter off —');

  ok('search words, wheels, dates and the heads-up view all drop when Receipts goes ON', await page.evaluate(() => {
    entries = []; nextId = 1;
    window._logRcptOnly = false;
    logQuery = 'lumber'; if ($('logSearch')) $('logSearch').value = 'lumber';
    if ($('lfFrom')) $('lfFrom').value = '2026-01-01';
    window._logHeadsOnly = 'Mery';
    rlRcptToggle();
    return window._logRcptOnly && logQuery === '' && ($('logSearch') || {}).value === '' &&
      ($('lfFrom') || {}).value === '' && window._logHeadsOnly === '';
  }));

  ok('turning it OFF does not wipe anything he set afterwards', await page.evaluate(() => {
    logQuery = 'gravel';
    rlRcptToggle();
    const kept = logQuery === 'gravel';
    logQuery = ''; clearLogFilters();
    return kept && !window._logRcptOnly;
  }));

  console.log('— 🔝 v6.33 Project portal opens at the TOP of Setup —');

  ok('jumpSetup lands with the panel scrolled to 0, and stays there after the late layout', await page.evaluate(async () => {
    closePanels();
    const panel = $('panel-settings');
    panel.classList.add('open'); panel.scrollTop = 600; panel.classList.remove('open');   // a stale scroll from last time
    jumpSetup('portalSec');
    await new Promise(r => setTimeout(r, 500));
    const top = panel.scrollTop === 0 && panel.classList.contains('open');
    closePanels();
    return top;
  }));

  ok('the portal is still the first section, so "top" is the right answer', await page.evaluate(() =>
    document.querySelector('#panel-settings .set-section').id === 'portalSec'));

  console.log('— 🔲 v6.33 the 🧾 category window: same-size plates, three across —');

  ok('the category plates sit in a three-column grid', await page.evaluate(() => {
    qnJobPick = 'Mery'; prefs.jobCats = { mery: ['Framing', 'Septic'] };
    catModalOpen();
    const grids = $('catBox').querySelectorAll('.cat-grid');
    const cols = getComputedStyle(grids[grids.length - 1]).gridTemplateColumns.split(' ').length;
    return grids.length >= 1 && cols === 3;
  }));

  ok('every plate is the same width and height, to the pixel', await page.evaluate(() => {
    const chips = [...$('catBox').querySelectorAll('.cat-grid .pick-chip')].slice(0, 9).map(b => b.getBoundingClientRect());
    return chips.length === 9 && chips.every(r => Math.abs(r.width - chips[0].width) < 1.5 && Math.abs(r.height - chips[0].height) < 1.5);
  }));

  ok('a long name wraps INSIDE its plate instead of stretching it', await page.evaluate(() => {
    const long = [...$('catBox').querySelectorAll('.cat-grid .pick-chip')].find(b => /Drywall, Mud and Texture/.test(b.textContent));
    const any = $('catBox').querySelector('.cat-grid .pick-chip');
    const okNow = long && Math.abs(long.getBoundingClientRect().width - any.getBoundingClientRect().width) < 1.5 && long.scrollWidth <= long.clientWidth + 1;
    catModalClose();
    return okNow;
  }));

  console.log('— 🌙 v6.33 no more white flash at night —');

  ok('the client-preview frame is no longer painted white', await page.evaluate(() => {
    const bg = getComputedStyle($('cpFrame')).backgroundColor;
    return bg !== 'rgb(255, 255, 255)' && bg !== 'rgba(0, 0, 0, 0)';
  }));

  ok('the root canvas has a background, so no gap ever paints the browser\'s white', await page.evaluate(() =>
    getComputedStyle(document.documentElement).backgroundColor !== 'rgba(0, 0, 0, 0)'));

  const cpage = await ctx.newPage();
  await cpage.goto(APP.replace(/index\.html$/, 'c/index.html'));
  await cpage.waitForTimeout(400);
  ok('the client page paints its root dark before its CSS variables even matter', await cpage.evaluate(() => {
    const bg = getComputedStyle(document.documentElement).backgroundColor;
    const meta = document.querySelector('meta[name="theme-color"]');
    return bg !== 'rgba(0, 0, 0, 0)' && bg !== 'rgb(255, 255, 255)' && !!meta;
  }));
  await cpage.close();

  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v6.33') && document.querySelector('footer').textContent.includes(APP_VER);
  }));

  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
