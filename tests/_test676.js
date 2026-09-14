// 📊 v6.76 — THE SUMMARIES PAGE. Eric: "build the summaries page and make a button for it up to
// the right of job cards at the top of main page. make it so the email sort is in the summaries
// page and the items to review page in it. and keep our categories for the summary page."
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
    jobs = ['Mery', 'Hertz']; curJob = 'Mery'; crew = ['Phil']; entries = []; todos = []; nextId = 1; pendingQueue = [];
    prefs.pocket = []; prefs.pocketMax = 8; prefs.mailIgnored = []; prefs.mailPersonal = []; prefs.tags = []; _wizLog = []; lsSet('daylog-wizlog', '[]');
    renderJobSelects(); closePanels(); renderAll();
    window.scheduleSave = () => {}; window.savePendingSoon = () => {}; window.publishSharedNotes = () => {}; window.publishMailRules = () => {};
    dbx.refreshToken = 'test-token';
    window._dbxFiles = {};
    window.dbxDownload = async p => (window._dbxFiles || {})[p] ?? null;
    window.dbxUpload = async (p, body) => { (window._dbxFiles || {})[p] = body; return {}; };
    _portalIdx = null;
    const ago = d => { const x = new Date(); x.setDate(x.getDate() - d); x.setHours(10, 0, 0, 0); return x; };
    // a week of the log, the real shapes
    const add = (type, details, job, extra) => { const e = addEntry(type, details, job, { noSniff: true, ...extra }); return e; };
    window._e = {};
    _e.mailInv = add('Note', 'Email from Bob Ashman: Invoice 4471 — attached', '—', { mail: true, mailAddr: 'bob@ashmanplumbing.com', mailSubj: 'Invoice 4471', mailBucket: 'important', mailWhy: 'invoice', mailGist: 'a bill', mailBy: 'phone', tags: ['Bob Ashman'], ts: ago(0) });
    _e.mailSched = add('Note', 'Email from Kenai P&Z: inspection Thursday 9am', '—', { mail: true, mailAddr: 'pz@kenai.gov', mailSubj: 'inspection Thursday 9am', mailBucket: 'maybe', mailWhy: 'schedule', mailGist: 'inspection Thursday', mailBy: 'phone', tags: ['Kenai P&Z'], ts: ago(2) });
    _e.text = add('Note', 'Text from Kevin: pouring Mery at 8', 'Mery', { texted: true, tags: ['Kevin'], ts: ago(1) });
    _e.rcpt = add('Note', 'lumber package', 'Mery', { rcpt: true, category: 'Framing', ai: '💵 $1,000.00 🏪 Spenard', budg: 'sent', ts: ago(1) });
    _e.logan = add('Note', 'sent Logan the August receipts', '—', { tags: ['Bookkeeper'], ts: ago(3) });
    _e.photo = add('Note', 'walls up', 'Mery', { photoPaths: ['/x/a.jpg', '/x/b.jpg'], ts: ago(0) });
    _e.clock = add('Clock', 'shift', 'Hertz', { hours: 7.5, ts: ago(0) });
    _e.miles = add('Mileage', 'to Mery', '—', { miles: 24, ts: ago(1) });
    _e.pocketDone = add('Note', '✓ screws for Hertz', 'Hertz', { tags: ['pocket'], pocket: 'done', ts: ago(0) });
    _e.old = add('Note', 'ten days ago', 'Mery', { ts: ago(10) });
    _e.priv = add('Note', 'dentist at 3', 'Mery', { personal: true, ts: ago(0) });
    todos.push({ id: 900, text: 'call the inspector', job: 'Mery', done: false, due: localDay(new Date(Date.now() + 2 * 86400000)), pri: 1, ts: new Date().toISOString() });
    pocketAdd('gravel for the drive');
    wizKeep('what did we do tuesday', 'Tuesday you poured footings at Mery.', [1], '⚡ quick brain');
    pendingQueue = [{ id: 'bill:2026-10-10:enstar', kind: 'bill', payload: { who: 'Enstar', amt: 412.55, due: '2026-10-10', job: 'Mery', what: '🏪 Enstar', text: 'Pay Enstar', pri: 2 } }];
    renderPendBanner();
  });
  const secs = () => page.evaluate(() => [...document.querySelectorAll('.rev-sec')].map(b => ({ key: b.dataset.sec, text: b.textContent.replace(/\s+/g, ' ').trim(), open: b.classList.contains('open') })));
  const body = key => page.evaluate(k => document.querySelector(`.rev-sec-body[data-sec="${k}"]`).textContent.replace(/\s+/g, ' '), key);

  console.log('— 📊 v6.76 the doors —');

  ok('a 📊 Summary plate sits to the right of Job cards at the top of the main page, wearing the waiting count', await page.evaluate(() => {
    const plates = [...document.querySelectorAll('#scRow .sc-btn')].map(b => b.textContent.replace(/\s+/g, ' ').trim());
    const sum = document.querySelector('#scRow .sc-btn:last-child');
    return plates.length === 4 && /Job cards/.test(plates[2]) && /Summary/.test(plates[3]) && /openReview\('summary'\)/.test(sum.getAttribute('onclick')) && $('scSumN').textContent === '1' &&
      getComputedStyle(document.querySelector('#scRow')).gridTemplateColumns.split(' ').length === 4;
  }));

  ok('the SUMMARY header button opens the same page; the Review banner under the clock and the 📧 card are off the main page but still render their words', await page.evaluate(() => {
    const hb = /openReview\('summary'\)/.test($('summaryBtn').getAttribute('onclick'));
    renderMailAsk();
    return hb && getComputedStyle($('pendBanner')).display === 'none' && /1 item waiting/.test($('pendBanner').textContent) && getComputedStyle($('mailAskCard')).display === 'none' && /EMAIL — this week/.test($('mailAskCard').textContent);
  }));

  ok('open it: two tabs, SORT with the count and SUMMARY; the summary opens on THIS WEEK', await page.evaluate(() => {
    openReview('summary');
    const tabs = [...document.querySelectorAll('.rev-tab')].map(b => b.textContent.trim());
    return $('revModal').classList.contains('show') && tabs.length === 2 && /SORT · 1/.test(tabs[0]) && /SUMMARY/.test(tabs[1]) && document.querySelector('.rev-tab.on').textContent.includes('SUMMARY') && /THIS WEEK/.test(document.querySelector('.pick-chip.sel').textContent);
  }));

  console.log('— 📊 v6.76 the nine headings, our categories —');

  ok('the headings come in the agreed order with counts, and the personal note is nowhere on the page', await (async () => {
    const h = await secs();
    const t = await page.evaluate(() => $('revBox').textContent);
    return h.map(x => x.key).join(',') === 'need,people,money,photos,wizard,sched,get,pocket,logan,record' && !/dentist/.test(t);
  })());

  { const t = await body('need'); ok('NEEDS YOU says what waits, in words, with a way over to the sort tab', /1 waiting/.test(t) && /1 bills/.test(t) && /Open the sort tab/.test(t)); }

  ok('PEOPLE holds the 📧 email sort (counts, folds, the double check) and then every email and text of the week', await (async () => {
    const t = await body('people');
    return /EMAIL — this week/.test(t) && /Double check/.test(t) && /Bob Ashman/.test(t) && /Invoice 4471/.test(t) && /🧾 INVOICE/.test(t) && /Kevin/.test(t) && /pouring Mery at 8/.test(t) && /Kenai P&Z/.test(t);
  })());

  ok('MONEY lists the receipt with its light and the invoice email', await (async () => {
    const t = await body('money');
    return /lumber package/.test(t) && /ON THE LIST/.test(t) && /Invoice 4471/.test(t);
  })());

  ok('PHOTOS counts per job; WIZARD shows the kept answer; SCHEDULE has the due to-do, the inspection email and the pocket day', await (async () => {
    const p = await body('photos'), w = await body('wizard'), s = await body('sched');
    return /Mery — 2 photos/.test(p) && /what did we do tuesday/.test(w) && /call the inspector/.test(s) && /inspection Thursday/.test(s) && /gravel for the drive/.test(s) && /today/.test(s);
  })());

  ok('TO GET has the pocket item and the pocket note; SENT TO LOGAN has the bookkeeper note and the receipt on their page', await (async () => {
    const g = await body('get'), l = await body('logan');
    return /gravel for the drive/.test(g) && /screws for Hertz/.test(g) && /sent Logan the August receipts/.test(l) && /to Logan/.test(l) && /lumber package/.test(l) && /on their page/.test(l);
  })());

  ok('THE RECORD is by day, newest first, with the counts: hours, miles, emails, receipts', await (async () => {
    const r = await body('record');
    const days = await page.evaluate(() => [...document.querySelectorAll('.rev-sec-body[data-sec="record"] .sum-day .sum-dh b')].map(b => b.textContent));
    return days.length >= 3 && days[0] > days[1] && /7\.5 h/.test(r) && /24 mi/.test(r) && /1 email/.test(r) && /1 receipt/.test(r) && /walls up/.test(r) && !/ten days ago/.test(r);
  })());

  ok('TODAY narrows every section to today; the ten-day-old note is never in either', await (async () => {
    await page.evaluate(() => sumSpan('today'));
    const h = await secs();
    const rec = await body('record'), ppl = await body('people');
    const week = await page.evaluate(() => { sumSpan('week'); return $('revBox').textContent; });
    return /THE RECORD 1/.test(h.find(x => x.key === 'record').text) && /walls up/.test(rec) && !/Kevin/.test(ppl) && /Invoice 4471/.test(ppl) && !/ten days ago/.test(week);
  })());

  ok('one open at a time here too, and the tabs swap without losing the pile', await page.evaluate(() => {
    sumSecTap('money');
    const one = [...document.querySelectorAll('.rev-sec-body')].filter(b => !b.hidden).map(b => b.dataset.sec).join() === 'money';
    revTab('sort');
    const sort = document.querySelector('.rev-tab.on').textContent.includes('SORT') && !!document.querySelector('.rev-card[data-pid="bill:2026-10-10:enstar"]') && /EMAIL — this week/.test(document.querySelector('.rev-sec-body[data-sec="people"]').textContent);
    revTab('summary');
    return one && sort && document.querySelector('.rev-tab.on').textContent.includes('SUMMARY');
  }));

  ok('the older summary pages are one tap away from the foot of the page', await page.evaluate(() => /Older summary pages/.test($('revBox').textContent)));

  ok('every heading is a word and a count — never a colour alone', await page.evaluate(() =>
    [...document.querySelectorAll('.rev-sec')].every(b => /[A-Z]{2,}/.test(b.textContent) && /(\d|nothing)/.test(b.textContent))));   // "TO GET" is two short words

  await page.evaluate(() => closeReview());

  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v6.76') && document.querySelector('footer').textContent.includes(APP_VER);
  }));

  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
