// 📝 v6.74 — THE NOTE PLATE IS PARKED. Eric: "the note button between hours and vault, i think
// that can go away … put it in the historical app folder, like we dont need it anymore but could
// always come back to it someday." The grinder is the note; the plate hides, the panel stays.
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
  await page.evaluate(() => { jobs = ['Mery']; curJob = 'Mery'; crew = []; entries = []; todos = []; nextId = 1; renderJobSelects(); closePanels(); renderAll(); window.scheduleSave = () => {}; });

  console.log('— 📝 v6.74 the Note plate is parked —');

  ok('the bar shows five plates — Mileage, File Cabinet, Hours, Vault, Setup — and no Note', await page.evaluate(() => {
    const shown = [...document.querySelectorAll('.capture .cap-btn')].filter(b => b.offsetParent !== null);
    const panels = shown.map(b => b.dataset.panel);
    return document.body.classList.contains('parked-630') && shown.length === 5 && panels.join(',') === 'mileage,budget,hours,vault,settings' && !panels.includes('note');
  }));

  ok('each of the five is still a thumb-sized plate', await page.evaluate(() =>
    [...document.querySelectorAll('.capture .cap-btn')].filter(b => b.offsetParent !== null).every(b => b.getBoundingClientRect().width >= 60 && b.getBoundingClientRect().height >= 44)));

  ok('the plate is parked, not deleted: the button and the Note panel are still in the page, and openPanel("note") still opens it', await page.evaluate(() => {
    const btn = document.querySelector('.capture .cap-btn[data-panel="note"]');
    const panel = document.getElementById('panel-note');
    if (!btn || !panel) return false;
    openPanel('note');
    const opened = panel.classList.contains('open');
    closePanels();
    return opened && getComputedStyle(btn).display === 'none';
  }));

  ok('take the park off and the plate comes right back — someday is one class away', await page.evaluate(() => {
    document.body.classList.remove('parked-630');
    const back = document.querySelector('.capture .cap-btn[data-panel="note"]').offsetParent !== null;
    document.body.classList.add('parked-630');
    return back && document.querySelector('.capture .cap-btn[data-panel="note"]').offsetParent === null;
  }));

  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v6.74') && document.querySelector('footer').textContent.includes(APP_VER);
  }));

  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
