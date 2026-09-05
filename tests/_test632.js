const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };
  await page.goto(process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html');
  await page.waitForTimeout(700);
  await page.evaluate(() => {
    jobs = ['Mery', 'Scritchfield']; curJob = 'Mery'; crew = []; entries = []; todos = []; nextId = 1;
    renderJobSelects(); closePanels(); renderAll();
    window._dbxFiles = {};
    window.dbxDownload = async path => (window._dbxFiles || {})[path] ?? null;
    window.dbxUpload = async (path, body) => { (window._dbxFiles || {})[path] = body; return {}; };
    window.scheduleSave = () => {};
    _portalIdx = { clients: [{ code: 'mery-224374', job: 'Mery' }] };
    window._dbxFiles[portalRoot() + '/mery-224374.json'] = JSON.stringify({ name: 'Mery' });
  });

  console.log('— ✕ v6.32 every window has a way out at the top —');

  ok('the journal window has one — the one Eric asked for', await page.evaluate(async () => {
    await openJournal(0);
    const b = $('revBox').querySelector('h3 .win-x');
    return !!b && /close the journal/.test(b.getAttribute('aria-label'));
  }));

  ok('it is at the TOP, not below the fold he was scrolling past', await page.evaluate(() => {
    const b = $('revBox').querySelector('h3 .win-x');
    const ta = $('jrnText');
    return !!b && !!ta && b.getBoundingClientRect().top < ta.getBoundingClientRect().top;
  }));

  ok('and it actually shuts the window', await page.evaluate(() => {
    $('revBox').querySelector('h3 .win-x').click();
    return !$('revModal').classList.contains('show');
  }));

  ok('the feedback box has one', await page.evaluate(() => {
    openFeedback();
    const b = $('revBox').querySelector('h3 .win-x');
    const okNow = !!b && /feedback/.test(b.getAttribute('aria-label'));
    closeReview();
    return okNow;
  }));

  ok('the review pile has one — both when it is empty and when it is full', await page.evaluate(() => {
    pendingQueue = [];
    renderReview();
    const empty = !!$('revBox').querySelector('h3 .win-x');
    pendingQueue = [{ id: 'p1', kind: 'todo', payload: { text: 'call the inspector' } }];
    renderReview();
    const full = !!$('revBox').querySelector('h3 .win-x');
    pendingQueue = [];
    return empty && full;
  }));

  ok('the job card has one', await page.evaluate(() => {
    openJobCard('Mery');
    const okNow = !!$('revBox').querySelector('h3 .win-x');
    closeReview();
    return okNow;
  }));

  ok('the receipts window has one', await page.evaluate(async () => {
    await openRcptReview(0);
    const okNow = !!$('revBox').querySelector('.win-x');
    closeRcptReview();
    return okNow;
  }));

  ok('the category picker has one', await page.evaluate(() => {
    qnJobPick = 'Mery'; catModalOpen();
    const okNow = !!$('catBox').querySelector('.win-x');
    catModalClose();
    return okNow;
  }));

  ok('every close button is the SAME button — one helper, no drift', await page.evaluate(() => {
    // the old hand-rolled headers are gone: nothing floats its own ✕ any more
    return typeof winX === 'function' &&
      document.documentElement.innerHTML.indexOf('req-x" style="float: right; font-size: 15px') === -1;
  }));

  ok('it is big enough for a work thumb — 44px square', await page.evaluate(() => {
    const d = document.createElement('div'); d.innerHTML = winX('closeReview()', 'close');
    document.body.appendChild(d);
    const r = d.querySelector('button').getBoundingClientRect();
    d.remove();
    return r.width >= 44 && r.height >= 44;
  }));

  ok('it is reachable by a screen reader, and says which window it shuts', await page.evaluate(() => {
    const d = document.createElement('div'); d.innerHTML = winX('closeReview()', 'close the rack');
    const b = d.querySelector('button');
    return b.getAttribute('aria-label') === 'close the rack' && b.getAttribute('title') === 'close the rack';
  }));

  ok('a label with an apostrophe or bracket cannot break the button', await page.evaluate(() => {
    const d = document.createElement('div');
    d.innerHTML = winX('closeReview()', 'close Dale\'s <board>');
    const b = d.querySelector('button');
    return !!b && b.getAttribute('aria-label') === "close Dale's <board>" && !d.querySelector('board');
  }));

  console.log('— 🔧 the item-delete ✕ buttons were NOT touched —');

  ok('the red delete-a-thing ✕ is still its own control, not a window close', await page.evaluate(() =>
    document.documentElement.innerHTML.indexOf('matDelKid(') > -1 ||
    typeof matDelKid === 'function'));

  console.log('— 🧾 v6.32 the receipt filter on the running log —');

  const logSeed = () => page.evaluate(() => {
    entries = []; nextId = 1;
    window._logRcptOnly = false; window._logHeadsOnly = ''; window._rlOpen = new Set();
    const mk = (txt, o = {}) => { const e = addEntry('Note', txt, 'Mery', {}); Object.assign(e, o); return e; };
    window._tagged = mk('peninsula overhead doors invoice', { rcpt: true, category: 'Doors and Windows', ai: '💵 $2,400.00 🏪 Peninsula Overhead Doors' });
    window._sent = mk('lumber package', { rcpt: true, category: 'Framing', ai: '💵 $900.00', budg: 'sent' });
    window._waved = mk('gravel load', { rcpt: true, category: 'Site', ai: '💵 $300.00', budg: 'no' });
    window._untagged = mk('gas station stop', { ai: '💵 $84.10 🏪 Tesoro' });   // no tag, still a receipt
    window._plain = mk('framed the south wall');                                 // not a receipt at all
    clearLogFilters();
  });

  await logSeed();
  ok('there is a 🧾 Receipts button on the running log', await page.evaluate(() =>
    !!$('rlRcptBtn') && /Receipts/.test($('rlRcptBtn').textContent)));

  ok('off by default — the whole log still shows', await page.evaluate(() => {
    renderLog();
    const h = $('askRecent').textContent;
    return !window._logRcptOnly && /framed the south wall/.test(h) && /peninsula overhead doors/.test(h);
  }));

  ok('one tap and it is receipts ONLY', await page.evaluate(() => {
    rlRcptToggle();
    const h = $('askRecent').textContent;
    return window._logRcptOnly && /peninsula overhead doors/.test(h) && !/framed the south wall/.test(h);
  }));

  ok('it catches a receipt he never tagged — the one he would be hunting for', await page.evaluate(() =>
    /gas station stop/.test($('askRecent').textContent)));

  ok('the button SAYS it is on — not just a colour change', await page.evaluate(() => {
    const b = $('rlRcptBtn');
    return /✓ ON/.test(b.textContent) && b.getAttribute('aria-pressed') === 'true';
  }));

  ok('tapping again gives the whole log back', await page.evaluate(() => {
    rlRcptToggle();
    return !window._logRcptOnly && /framed the south wall/.test($('askRecent').textContent) &&
      $('rlRcptBtn').getAttribute('aria-pressed') === 'false';
  }));

  ok('Clear filters also clears it', await page.evaluate(() => {
    rlRcptToggle();
    clearLogFilters();
    return !window._logRcptOnly && !/✓ ON/.test($('rlRcptBtn').textContent);
  }));

  console.log('— 🟢🔴 v6.32 the on-the-list lamp —');

  ok('a receipt NOT on the list wears the red lamp', await page.evaluate(() => {
    const h = rcptLampHtml(_tagged);
    return /NOT ON IT/.test(h) && /🔴/.test(h) && /rc-wait/.test(h);
  }));

  ok('one already approved wears the green lamp', await page.evaluate(() => {
    const h = rcptLampHtml(_sent);
    return /ON THE LIST/.test(h) && /🟢/.test(h) && /rc-on/.test(h);
  }));

  ok('one he waved off says SKIPPED, not red — it is not nagging him', await page.evaluate(() => {
    const h = rcptLampHtml(_waved);
    return /SKIPPED/.test(h) && !/🔴/.test(h);
  }));

  ok('a plain note gets no lamp at all', await page.evaluate(() =>
    rcptLampHtml(_plain) === ''));

  ok('every lamp carries a WORD and a GLYPH, never colour alone', await page.evaluate(() => {
    const all = [_tagged, _sent, _waved].map(rcptLampHtml);
    return all.every(h => /[🟢🔴⚪]/.test(h) && /(ON THE LIST|NOT ON IT|SKIPPED)/.test(h));
  }));

  ok('the lamps actually appear on the rows in the log', await page.evaluate(() => {
    renderLog();
    const h = $('askRecent').innerHTML;
    return /NOT ON IT/.test(h) && /ON THE LIST/.test(h);
  }));

  ok('sending a receipt flips its lamp from red to green', await page.evaluate(() => {
    const before = /NOT ON IT/.test(rcptLampHtml(_tagged));
    _tagged.budg = 'sent';
    const after = /ON THE LIST/.test(rcptLampHtml(_tagged));
    _tagged.budg = undefined;
    return before && after;
  }));

  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v6.32') && document.querySelector('footer').textContent.includes(APP_VER);
  }));

  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
