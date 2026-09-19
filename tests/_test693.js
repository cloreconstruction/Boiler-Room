// 🗣 v6.93 — Eric: "i'd say just change 'sweep now' to different wording, i thought that meant send all text to the grinder
// like the 'flush' word we used. it means 'go check for texts'?" It does. Nothing he reads about it says "sweep" any more:
// the line under the text counter, the Setup plate, the messages and the working band all say CHECK.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { fileURLToPath } = require('url');
(async () => {
  const appUrl = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const repo = path.dirname(fileURLToPath(appUrl));
  const src = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
  await page.goto(appUrl); await page.waitForTimeout(700);
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };

  const r = await page.evaluate(async () => {
    entries = []; nextId = 1; pendingQueue = []; window.scheduleSave = () => {}; window.savePendingSoon = () => {}; window.publishSharedNotes = () => {};
    const line = () => { const d = document.createElement('div'); d.innerHTML = sweepStatusHtml(); return d.textContent.replace(/\s+/g, ' ').trim(); };
    lsDel('daylog-sweep-last'); window._sweepLast = null; const never = line();
    window._sweepLast = { at: new Date().toISOString(), seen: 336, texts: 20, mails: 0, left: 316, did: 20, err: '' }; const good = line();
    window._sweepLast = { at: new Date().toISOString(), err: 'Inbox listing: too_many_requests' }; const failed = line();
    window._sweepLast = { at: new Date().toISOString(), wait: true, err: '' }; const waiting = line();
    const said = []; const keepT = window.toast; window.toast = m => said.push(String(m));
    dbx.refreshToken = 'x'; window.getToken = async () => 'x'; window.dbxUpload = async () => ({}); window.dbxDownload = async () => null;
    window.dbxRpc = async ep => ep === 'files/list_folder' ? { entries: [], has_more: false } : {};
    await sweepNow(); window.toast = keepT;
    openPanel('settings'); renderMailSenders(); const plate = [...$('setMail').querySelectorAll('button')].map(b => b.textContent.trim()).join(' | '); closePanels();
    return { never, good, failed, waiting, said: said.join(' | '), plate };
  });
  ok('the line under the text counter says CHECK: what it found, what it brought into the log, what comes on the next check — with a "Check for texts now" tap', /^📥 Checked for new texts just now: 336 in the Inbox · 20 texts and 0 emails brought into your log · 316 more on the next check · Check for texts now$/.test(r.good), r.good);
  ok('before it has ever run, when it fails, and when another device is busy, it says so in the same plain words', /Has not checked for new texts yet on this phone — it checks with every sync · Check for texts now/.test(r.never) && /^⚠ The check for new texts FAILED just now: Inbox listing: too_many_requests · Check for texts now$/.test(r.failed) && /another of your devices is bringing the texts in — this one waits its turn · Check for texts now/.test(r.waiting), JSON.stringify(r));
  ok('the tap says what it is doing and what it did; the Setup plate reads "Check for new texts & emails now"', /📥 Checking for new texts and emails…/.test(r.said) && /0 texts and 0 emails brought in · 0 still to come/.test(r.said) && /📥 Check for new texts & emails now/.test(r.plate), JSON.stringify(r));
  ok('the word "sweep" is gone from everything he reads about it', ![r.never, r.good, r.failed, r.waiting, r.said, r.plate].some(t => /sweep/i.test(t)) && !/INBOX SWEEP STOPPED|Sweep now<|Sweep the Inbox now/.test(src) && /THE CHECK FOR TEXTS STOPPED/.test(src));

  ok('nothing runs off the right edge of the main page', await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth));
  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v6.93') && document.querySelector('footer').textContent.includes(APP_VER);
  }));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
