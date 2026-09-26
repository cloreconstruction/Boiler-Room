// v7.29 — Eric: "take the hour tracker off phils main page, he uses another hours tracker." A crew phone hides the clock, the
// Hours-this-week card and the ⏱ Hours plate — unless a shift is running on it. Eric's own phone is untouched. Names made up.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { fileURLToPath } = require('url');
(async () => {
  const appUrl = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const repo = path.dirname(fileURLToPath(appUrl));
  const src = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };
  const errs = [];
  const open = async init => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await ctx.route(u => !/^file:/.test(u.href), r => r.abort());
    if (init) await ctx.addInitScript(init);
    const page = await ctx.newPage();
    page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
    await page.goto(appUrl); await page.waitForTimeout(700);
    return { ctx, page };
  };
  const look = () => ({
    off: document.body.classList.contains('hours-off'), crew: document.body.classList.contains('crew-mode'),
    clock: getComputedStyle(document.querySelector('.clock-card')).display, week: getComputedStyle($('weekCard')).display,
    hoursBtn: getComputedStyle(document.querySelector('.cap-btn[data-panel="hours"]')).display, milesBtn: getComputedStyle(document.querySelector('.cap-btn[data-panel="mileage"]')).display,
    setupBtn: getComputedStyle(document.querySelector('.cap-btn[data-panel="settings"]')).display, fits: document.documentElement.scrollWidth <= document.documentElement.clientWidth });

  console.log('— ⏱ Eric\'s phone —');
  const eric = await open();
  const e = await eric.page.evaluate(look);
  ok('Eric\'s phone: the clock, Hours this week and the ⏱ Hours plate are all there, as ever', !e.off && !e.crew && e.clock !== 'none' && e.week !== 'none' && e.hoursBtn !== 'none', JSON.stringify(e));
  await eric.ctx.close();

  console.log('— 👷 Phil\'s phone —');
  const phil = await open(() => { try { localStorage.setItem('daylog-crew-name', 'Phil'); localStorage.setItem('daylog-crew-root', '/Phil'); localStorage.setItem('daylog-crew-jobs', JSON.stringify(['Oak House'])); } catch (e) {} });
  const p = await phil.page.evaluate(look);
  ok('a crew phone with no shift running: the clock, the Hours-this-week card and the ⏱ Hours plate are gone; Miles and Setup stay; nothing runs off the side', p.crew && p.off && p.clock === 'none' && p.week === 'none' && p.hoursBtn === 'none' && p.milesBtn !== 'none' && p.setupBtn !== 'none' && p.fits, JSON.stringify(p));
  ok('a shift running on it brings the clock back (nobody is left clocked in with no lever); punched out, it hides again', await phil.page.evaluate(() => {
    clockedInAt = new Date(); hoursOffSync(); const on = !document.body.classList.contains('hours-off') && getComputedStyle(document.querySelector('.clock-card')).display !== 'none';
    clockedInAt = null; hoursOffSync(); const off = document.body.classList.contains('hours-off') && getComputedStyle(document.querySelector('.clock-card')).display === 'none';
    return on && off;
  }));
  ok('the switch is thrown wherever the clock changes hands (clock in, clock out, a job switch, a shift restored) — every clockedInAt assignment is followed by hoursOffSync', (src.match(/clockedInAt = [^\n]*hoursOffSync\(\);/g) || []).length >= 6);
  await phil.ctx.close();

  ok('version bumped — APP_VER and the footer agree', /const APP_VER = 'v7\.(29|[3-9]\d)'/.test(src) && new RegExp('<footer>' + (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1].replace('.', '\\.')).test(src));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
