const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };
  await page.goto('file:///home/claude/work/clore-daylog.html');
  await page.waitForTimeout(700);
  await page.evaluate(() => {
    jobs=['Scritchfield','Rininger','Mery']; curJob='Scritchfield'; crew=[]; entries=[]; todos=[]; nextId=1;
    renderJobSelects(); closePanels(); renderAll();
  });

  console.log('— ⚖ v6.23 grinder and bookkeeper, matched and side by side —');

  ok('both plates live in the SAME row now', await page.evaluate(() => {
    const g = document.querySelector('.plate-btn--grind'), b = $('bkkBtn');
    return !!g && !!b && g.parentElement === b.parentElement &&
      g.parentElement.classList.contains('plate-row');
  }));

  ok('same width, to the pixel', await page.evaluate(() => {
    const g = document.querySelector('.plate-btn--grind').getBoundingClientRect();
    const b = $('bkkBtn').getBoundingClientRect();
    return Math.abs(g.width - b.width) < 1 && g.width > 100;
  }));

  ok('same height, to the pixel', await page.evaluate(() => {
    const g = document.querySelector('.plate-btn--grind').getBoundingClientRect();
    const b = $('bkkBtn').getBoundingClientRect();
    return Math.abs(g.height - b.height) < 1;
  }));

  ok('shoulder to shoulder — same top edge, bookkeeper on the right', await page.evaluate(() => {
    const g = document.querySelector('.plate-btn--grind').getBoundingClientRect();
    const b = $('bkkBtn').getBoundingClientRect();
    return Math.abs(g.top - b.top) < 1 && b.left > g.left;
  }));

  ok('the old 68%-wide centred treatment is gone', await page.evaluate(() => {
    // NB a flex item always computes to display:block, so that tells us nothing. What
    // matters is that nothing is pinning its width or centring it any more.
    const st = getComputedStyle($('bkkBtn'));
    const row = document.querySelector('.plate-row').getBoundingClientRect();
    const b = $('bkkBtn').getBoundingClientRect();
    return st.maxWidth === 'none' && st.flexGrow === '1' && st.marginLeft === '0px' &&
      b.width > row.width * 0.4 && b.width < row.width * 0.6;   // a half, not 68% centred
  }));

  ok('it takes LESS room than before — one row, not two', await page.evaluate(() => {
    const row = document.querySelector('.plate-row').getBoundingClientRect();
    const b = $('bkkBtn').getBoundingClientRect();
    return b.bottom <= row.bottom + 1;      // the bookkeeper no longer hangs below the row
  }));

  ok('both still do their own job — nothing got cross-wired', await page.evaluate(() => {
    let grind = 0, bkk = 0;
    const og = window.saveQuickNote, ob = window.toBookkeeper;
    window.saveQuickNote = () => { grind++; }; window.toBookkeeper = () => { bkk++; };
    document.querySelector('.plate-btn--grind').click();
    $('bkkBtn').click();
    window.saveQuickNote = og; window.toBookkeeper = ob;
    return grind === 1 && bkk === 1;
  }));

  ok('the hint under them explains the difference between the two', await page.evaluate(() => {
    const t = $('bkkHint').textContent;
    return /files it/.test(t) && /send sheet/.test(t);
  }));

  ok('art failing to load leaves two readable gold buttons, still matched', await page.evaluate(() => {
    document.querySelector('.plate-btn--grind').classList.add('noimg');
    $('bkkBtn').classList.add('noimg');
    const g = document.querySelector('.plate-btn--grind').getBoundingClientRect();
    const b = $('bkkBtn').getBoundingClientRect();
    const okSize = Math.abs(g.width - b.width) < 1;
    const words = $('bkkBtn').textContent.trim();
    document.querySelector('.plate-btn--grind').classList.remove('noimg');
    $('bkkBtn').classList.remove('noimg');
    return okSize && /bookkeeper/i.test(words);
  }));

  ok('the wizard is still up on the writing box, not back down here', await page.evaluate(() =>
    !!$('wizSideBtn') && !!$('wizSideBtn').closest('.ask-row') &&
    document.querySelectorAll('.plate-row .plate-btn').length === 2));

  console.log('page errors:', errs.length); errs.forEach(e => console.log('  ' + e));
  console.log(`${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail || errs.length ? 1 : 0);
})();
