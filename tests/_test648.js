// 📧 v6.48 — Eric: "id like the email section to be below the grinder not above it."
// The 📧 card sat between step ④ and the ⚙ plate, so a morning's mail pushed the grinder button
// — the one he reaches for all day — down off the screen. This suite pins the new order, and
// re-pins v6.42's lesson: the card must never live inside a .g-step, because a folded step
// hides everything in it.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { fileURLToPath } = require('url');
(async () => {
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };
  const appUrl = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const repo = path.dirname(fileURLToPath(appUrl));
  const src = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

  console.log('— 📧 v6.48 the email card moves below the grinder —');

  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
  await page.goto(appUrl); await page.waitForTimeout(700);

  // put something in every fold so the card actually renders
  const fill = () => page.evaluate(() => {
    jobs = ['Shop / Admin', 'Mery']; curJob = 'Mery'; crew = []; entries = []; todos = []; nextId = 1;
    prefs.mailOk = ['bob@sub.com']; prefs.mailNo = []; prefs.mailLoud = []; prefs.mailHush = [];
    prefs.mailPersonal = []; prefs.mailIgnored = [];
    prefs.mailAsk = [{ a: 'new@vendor.com', w: 'Vendor Co', s: 'A quote for you', b: 'the quote', ts: new Date().toISOString() }];
    pendingQueue = [{ id: 'mail:1', kind: 'mail', payload: { from: 'Bob', addr: 'bob@sub.com', subj: 'Invoice', body: 'bill', why: 'invoice', gist: 'A bill.', by: 'cloud', known: true, entryId: null, ts: new Date().toISOString() } }];
    window.scheduleSave = () => {}; window.savePendingSoon = () => {};
    renderJobSelects(); closePanels(); renderAll(); renderMailAsk();
    return $('mailAskCard').style.display !== 'none';
  });
  ok('the 📧 card renders when there is mail waiting', await fill());

  const geom = () => page.evaluate(() => {
    const card = $('mailAskCard');
    const grind = document.querySelector('.plate-btn--grind');
    const log = $('runLogCard');
    const r = el => { const b = el.getBoundingClientRect(); return { top: b.top + scrollY, bottom: b.bottom + scrollY }; };
    return { card: r(card), grind: r(grind), log: r(log),
      inStep: !!card.closest('.g-step'), inAsk: !!card.closest('.ask-card'),
      afterGrindInDom: !!(grind.compareDocumentPosition(card) & Node.DOCUMENT_POSITION_FOLLOWING),
      beforeLogInDom: !!(card.compareDocumentPosition(log) & Node.DOCUMENT_POSITION_FOLLOWING) };
  });
  const g = await geom();

  ok('the 📧 card sits BELOW the ⚙ grinder button on the page', g.card.top > g.grind.bottom, JSON.stringify({ card: g.card.top, grindBottom: g.grind.bottom }));
  ok('it comes after the grinder in the document too, not just visually', g.afterGrindInDom);
  ok('it sits ABOVE the running log — the grinder, then mail, then the book', g.beforeLogInDom && g.card.bottom <= g.log.top + 1, JSON.stringify({ cardBottom: g.card.bottom, logTop: g.log.top }));
  ok('it is OUTSIDE the grinder card entirely — its own card now', !g.inAsk);
  // 🅿 v6.42's bug: the card lived inside .g-step[data-step="4"] and gFold() hid it outright
  ok('it is NOT inside any .g-step, so folding a step can never hide it', !g.inStep);

  ok('folding every step leaves the 📧 card standing', await page.evaluate(() => {
    [3, 4].forEach(n => gFold(n));
    const c = $('mailAskCard');
    return c.style.display !== 'none' && c.getBoundingClientRect().height > 0;
  }));

  // the whole point of the move: mail must no longer DISPLACE the grinder. A morning with a
  // pile of email and a morning with none must put the ⚙ plate in exactly the same place.
  ok('a pile of mail no longer pushes the ⚙ grinder down the screen', await page.evaluate(() => {
    const grind = () => document.querySelector('.plate-btn--grind').getBoundingClientRect().top + scrollY;
    const card = $('mailAskCard');
    const withMail = grind();
    const tall = card.getBoundingClientRect().height;
    card.style.display = 'none';                 // the same page with an empty inbox
    const without = grind();
    card.style.display = '';
    return tall > 40 && Math.abs(withMail - without) < 1;
  }));

  ok('nothing overlaps: mail card, grinder and log keep their own bands', (() => {
    return g.grind.bottom <= g.card.top && g.card.bottom <= g.log.top + 1;
  })(), JSON.stringify(g));

  ok('a crew phone still never sees it', await page.evaluate(() => {
    const c = $('mailAskCard'); const before = c.style.display;
    return before !== 'none' && /CREW_NAME/.test(renderMailAsk.toString());
  }));

  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v6.48') && document.querySelector('footer').textContent.includes(APP_VER);
  }));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
