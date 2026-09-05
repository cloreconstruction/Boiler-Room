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
    jobs = ['Scritchfield','Rininger','Mery']; curJob='Scritchfield'; crew=[]; entries=[]; todos=[]; nextId=1;
    renderJobSelects(); closePanels(); renderAll();
  });

  console.log('— ⬆ v6.22 the writing box on top, the texts at the foot —');

  const order = () => page.evaluate(() =>
    [...document.querySelector('.wrap').children].map(e => e.id || e.className.split(' ')[0]).filter(Boolean));

  ok('the grinder box sits directly under the three plates — nothing between', await page.evaluate(() => {
    const k = [...document.querySelector('.wrap').children].map(e => e.id).filter(Boolean);
    return k.indexOf('qnCard') === k.indexOf('scRow') + 1;
  }));

  ok('🔥 needs-you, 📬 texts and 📌 nudges are all BELOW the writing box now', await page.evaluate(() => {
    const k = [...document.querySelector('.wrap').children].map(e => e.id).filter(Boolean);
    const q = k.indexOf('qnCard');
    return k.indexOf('hotStrip') > q && k.indexOf('txtDigest') > q && k.indexOf('nudgeStrip') > q;
  }));

  ok('…and below the running log too — they are at the foot, not the middle', await page.evaluate(() => {
    const k = [...document.querySelector('.wrap').children].map(e => e.id).filter(Boolean);
    return k.indexOf('hotStrip') > k.indexOf('runLogCard') && k.indexOf('txtDigest') > k.indexOf('runLogCard');
  }));

  ok('the three strips stay in their old order relative to each other', await page.evaluate(() => {
    const k = [...document.querySelector('.wrap').children].map(e => e.id).filter(Boolean);
    return k.indexOf('hotStrip') < k.indexOf('txtDigest') && k.indexOf('txtDigest') < k.indexOf('nudgeStrip');
  }));

  ok('📚 BOOKS UPDATED stays near the top — it is money, not texts', await page.evaluate(() => {
    const k = [...document.querySelector('.wrap').children].map(e => e.id).filter(Boolean);
    return k.indexOf('qbFreshStrip') > k.indexOf('qnCard') && k.indexOf('qbFreshStrip') < k.indexOf('runLogCard');
  }));

  console.log('— 🧙 the Wizard rides on the writing box —');

  ok('Ask the Wizard is INSIDE the ask row, beside the camera', await page.evaluate(() => {
    const w = $('wizSideBtn');
    return !!w && !!w.closest('.ask-row') && !!w.closest('.ask-side');
  }));

  ok('it sits shoulder to shoulder with the photo button, not stacked far away', await page.evaluate(() => {
    const w = $('wizSideBtn'), c = document.querySelector('.ask-side .cam-btn--tall');
    return !!c && Math.abs(w.getBoundingClientRect().left - c.getBoundingClientRect().left) < 4;
  }));

  ok('no scrolling to reach it — it is level with the text box', await page.evaluate(() => {
    const w = $('wizSideBtn').getBoundingClientRect(), t = $('askText').getBoundingClientRect();
    return w.top < t.bottom + 4 && w.bottom > t.top - 4;
  }));

  ok('it still fires the Wizard and nothing else', await page.evaluate(() => {
    let called = 0; const orig = window.askClaude;
    window.askClaude = () => { called++; };
    $('wizSideBtn').click();
    window.askClaude = orig;
    return called === 1;
  }));

  ok('the bottom plate row keeps the grinder and has lost the duplicate wizard', await page.evaluate(() => {
    const row = document.querySelector('.plate-row');
    const btns = [...row.querySelectorAll('.plate-btn')];
    // v6.23 put the bookkeeper beside the grinder — two plates is the truth now
    return btns.length === 2 && btns.some(b => b.classList.contains('plate-btn--grind')) &&
      !document.querySelector('.plate-btn--wiz');
  }));

  ok('the grinder plate is still the only way to FILE — one lever, one job', await page.evaluate(() =>
    document.querySelectorAll('[onclick*="saveQuickNote"]').length === 1));

  ok('the camera button still opens the picker', await page.evaluate(() => {
    let opened = 0;
    const inp = $('qnPhoto'); const orig = inp.click.bind(inp);
    inp.click = () => { opened++; };
    document.querySelector('.ask-side .cam-btn--tall').click();
    inp.click = orig;
    return opened === 1;
  }));

  ok('the whole writing box fits on one phone screen — no scroll to write and ask', await page.evaluate(() => {
    const r = $('askText').getBoundingClientRect(), w = $('wizSideBtn').getBoundingClientRect();
    return r.top < 500 && w.bottom < 700;   // 844-tall viewport
  }));

  console.log('page errors:', errs.length); errs.forEach(e => console.log('  ' + e));
  console.log(`${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail || errs.length ? 1 : 0);
})();
