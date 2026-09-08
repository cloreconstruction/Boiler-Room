// 🗂 v6.55 — THE DRILL-DOWN, THE SIMPLE WAY. Eric asked to tap a category and see what is in it
// down to the paper, then asked "what is the simplest method". This is it: the receipts window
// he already opens, with its rows grouped under their category and a total on each head.
// Job → 🧾 Receipts → the category → the receipts in it → 📷 the photograph.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { fileURLToPath } = require('url');
(async () => {
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };
  const appUrl = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const repo = path.dirname(fileURLToPath(appUrl));
  const src = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

  console.log('— 🗂 v6.55 receipts, gathered under their category —');

  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
  await page.goto(appUrl); await page.waitForTimeout(700);

  await page.evaluate(() => {
    jobs = ['Mery']; curJob = 'Mery'; crew = []; nextId = 500;
    window.dbxDownload = async () => null; window.dbxUpload = async () => ({});
    window.dbxRpc = async () => ({ metadata: {} });
    window.scheduleSave = () => {}; window.renderPortalList = () => {};
    dbx.refreshToken = 'tok';
    _portalIdx = { clients: [{ code: 'mery', key: 'mery', job: 'Mery', name: 'Mery' }] };
    _estD = null; _estPage = null; _estPaid = null; _rcptCatShut = new Set();
    const T = d => new Date('2026-08-' + d + 'T12:00:00');
    // a real spread: a big category, a small one, an awkward NAME, and the uncategorised pile
    const mk = (id, det, amt, cat, day, ph) => ({ id, ts: T(day), type: 'Filed', details: det, job: 'Mery',
      ...(cat ? { category: cat } : {}), amount: amt, rcpt: true,
      ...(ph ? { photoPath: '/p/' + id + '.jpg' } : {}) });
    entries = [
      mk(1, 'Kaiser roofing down payment', 12000, '', 14, 1),
      mk(2, 'Spenard lumber', 1151.80, '', 15, 1),
      mk(3, 'Home Depot trim', 337.25, 'Vanities and sinks', 16, 1),
      mk(4, 'AIH drill bit', 22.25, 'Vanities and sinks', 17, 0),
      mk(5, 'Sheetrock invoice', 58000, 'Drywall', 18, 1),
      mk(6, 'Printer paper', 40.81, "Bob's Office/Admin & Co", 19, 1)
    ];
    _rcptIdx = 0; _rcptSel = new Set();
    // the window must actually be SHOWN or every measurement below is taken on a display:none
    // element and reads 0 — which is how the first draft of the 44px check passed on nothing.
    $('revModal').classList.add('show');
    renderRcptReview();
    return true;
  });

  ok('the window is really on screen, so the measurements below mean something', await page.evaluate(() =>
    $('revBox').getBoundingClientRect().height > 100));

  const heads = () => page.evaluate(() => [...document.querySelectorAll('#revBox .rc-grp-h')].map(h => ({
    name: (h.querySelector('.rc-grp-n') || {}).textContent || '',
    tot: (h.querySelector('.rc-grp-sum') || {}).textContent || '',
    open: h.getAttribute('aria-expanded') === 'true'
  })));

  ok('every receipt sits under a category head', await page.evaluate(() =>
    document.querySelectorAll('#revBox .rc-grp').length === 4 &&
    document.querySelectorAll('#revBox .rc-grp .g-step').length === 6));

  ok('the ⚠ uncategorised pile leads — it is the one that needs him', await (async () => {
    const h = await heads();
    return /NO CATEGORY YET/.test(h[0].name) && /2 · \$13,151\.80/.test(h[0].tot);
  })(), JSON.stringify((await heads())[0]));

  ok('then the rest by money, biggest first', await (async () => {
    const h = await heads();
    return h[1].name === 'Drywall' && /\$58,000\.00/.test(h[1].tot)
      && h[2].name === 'Vanities and sinks' && /2 · \$359\.50/.test(h[2].tot)
      && /Office\/Admin/.test(h[3].name);
  })(), JSON.stringify(await heads()));

  ok('each head spells out its count and its money, so it reads the same folded or open', await (async () => {
    const h = await heads();
    return h.every(x => /^\d+ · \$[\d,]+\.\d\d$/.test(x.tot.trim()));
  })(), JSON.stringify((await heads()).map(h => h.tot)));

  ok('the heads add up to the window total — nothing is lost or counted twice', await page.evaluate(() => {
    const sum = [...document.querySelectorAll('#revBox .rc-grp-sum')]
      .reduce((s, el) => s + parseFloat(el.textContent.split('$')[1].replace(/,/g, '')), 0);
    const all = rcptWaiting('Mery').reduce((s, e) => s + estBillParse(e).amt, 0);
    return Math.abs(sum - all) < 0.005 && Math.abs(all - 71552.11) < 0.005;
  }), await page.evaluate(() => rcptWaiting('Mery').reduce((s, e) => s + estBillParse(e).amt, 0)));

  // ── the drill: tap the head, the receipts fold away; tap again, they come back ──
  ok('a head opens showing everything, exactly as the window did before', await (async () => {
    const h = await heads();
    return h.every(x => x.open) && (await page.evaluate(() => document.querySelectorAll('#revBox .rc-grp .g-step').length)) === 6;
  })());

  ok('tapping a head folds just that category away', await page.evaluate(() => {
    rcptCatFold(1);                                    // Drywall
    const grp = [...document.querySelectorAll('#revBox .rc-grp')][1];
    return grp.querySelectorAll('.g-step').length === 0 &&
      grp.querySelector('.rc-grp-h').getAttribute('aria-expanded') === 'false' &&
      /58,000/.test(grp.querySelector('.rc-grp-sum').textContent) &&
      document.querySelectorAll('#revBox .rc-grp .g-step').length === 5;
  }));

  ok('tapping it again brings them back', await page.evaluate(() => {
    rcptCatFold(1);
    return document.querySelectorAll('#revBox .rc-grp .g-step').length === 6;
  }));

  ok('a category name with a slash, an apostrophe and an ampersand folds cleanly', await page.evaluate(() => {
    const before = document.querySelectorAll('#revBox .rc-grp .g-step').length;
    rcptCatFold(3);                                    // "Bob's Office/Admin & Co"
    const grp = [...document.querySelectorAll('#revBox .rc-grp')][3];
    const shut = grp.querySelectorAll('.g-step').length === 0 && _rcptCatShut.has("Bob's Office/Admin & Co");
    rcptCatFold(3);
    return before === 6 && shut && document.querySelectorAll('#revBox .rc-grp .g-step').length === 6;
  }));

  ok('the fold is remembered by NAME, so a re-render does not lose it', await page.evaluate(() => {
    rcptCatFold(1);
    renderRcptReview(); renderRcptReview();
    const still = [...document.querySelectorAll('#revBox .rc-grp')][1].querySelectorAll('.g-step').length === 0;
    rcptCatFold(1);
    return still;
  }));

  // ── the way down to the paper, and the way to fix what is wrong ──
  ok('a receipt inside a group still carries 📷 Look at it, ✏️ Fix it and ⏏ Not for them', await page.evaluate(() => {
    const grp = [...document.querySelectorAll('#revBox .rc-grp')][1];
    const t = grp.innerHTML;
    return /📷 Look at it/.test(t) && /✏️ Fix it/.test(t) && /⏏ Not for them/.test(t);
  }));

  ok('the ⚠ pile is where the catch-up happens — every row has the picture and the fix', await page.evaluate(() => {
    const grp = [...document.querySelectorAll('#revBox .rc-grp')][0];
    return (grp.innerHTML.match(/📷 Look at it/g) || []).length === 2 &&
      (grp.innerHTML.match(/✏️ Fix it/g) || []).length === 2 &&
      /Kaiser roofing/.test(grp.textContent) && /12,000/.test(grp.textContent);
  }));

  ok('ticking still works from inside a group, and the approve line still counts right', await page.evaluate(() => {
    rcptTog(5); rcptTog(3);                            // Drywall + one Vanities
    const t = $('revBox').textContent;
    return _rcptSel.size === 2 && /☑ 2 checked/.test(t);
  }), await page.evaluate(() => $('revBox').textContent.replace(/\s+/g, ' ').slice(0, 200)));

  ok('an uncategorised receipt still cannot be approved — the door has not moved', await page.evaluate(() => {
    _rcptSel = new Set([1]);                           // the Kaiser one, no category
    renderRcptReview();
    return /Nothing checked yet|0 checked/.test($('revBox').textContent) ||
      !/☑ 1 checked/.test($('revBox').textContent);
  }), await page.evaluate(() => $('revBox').textContent.replace(/\s+/g, ' ').slice(0, 200)));

  ok('a head is a real control — 44px for a thumb, and it says open or closed out loud', await page.evaluate(() => {
    _rcptSel = new Set(); renderRcptReview();
    const h = document.querySelector('#revBox .rc-grp-h');
    const r = h.getBoundingClientRect();
    return r.height >= 44 && h.hasAttribute('aria-expanded') && /receipts?,/.test(h.getAttribute('aria-label'));
  }), await page.evaluate(() => document.querySelector('#revBox .rc-grp-h').getAttribute('aria-label')));

  ok('nothing depends on colour — the uncategorised head SAYS so', await page.evaluate(() =>
    /⚠ NO CATEGORY YET/.test(document.querySelector('#revBox .rc-grp-n').textContent)));

  ok('the window does not scroll sideways at 390px, even with a long category name', await page.evaluate(() => {
    const box = $('revBox');
    return box.scrollWidth <= box.clientWidth + 1;
  }), await page.evaluate(() => JSON.stringify({ s: $('revBox').scrollWidth, c: $('revBox').clientWidth })));

  ok('a job with nothing waiting still says so, and draws no empty heads', await page.evaluate(() => {
    entries = []; renderRcptReview();
    return document.querySelectorAll('#revBox .rc-grp').length === 0 &&
      /Nothing waiting/.test($('revBox').textContent);
  }));

  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v6.55') && document.querySelector('footer').textContent.includes(APP_VER);
  }));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
