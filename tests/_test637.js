const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { fileURLToPath } = require('url');
(async () => {
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
  const appUrl = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  await page.goto(appUrl);
  await page.waitForTimeout(700);
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };
  await page.evaluate(() => {
    jobs = ['Mery']; curJob = 'Mery'; crew = []; entries = []; todos = []; nextId = 1;
    prefs.tagScrub1 = true; prefs.tagScrub2 = true;
    renderJobSelects(); closePanels(); renderAll();
    window._dbxFiles = {};
    window.dbxDownload = async path => (window._dbxFiles || {})[path] ?? null;
    window.dbxUpload = async (path, body) => { (window._dbxFiles || {})[path] = body; return {}; };
    window.dbxPathExists = async path => Object.prototype.hasOwnProperty.call(window._dbxFiles || {}, path);
    window.scheduleSave = () => {};
    dbx.refreshToken = dbx.refreshToken || 'test-token';
    const idx = { clients: [{ key: 'mery', job: 'Mery Addition & Remodel', code: 'mery-224374' }] };
    _portalIdx = idx;
    window._dbxFiles[portalRoot() + '/index.json'] = JSON.stringify(idx);
  });

  // 📊 v6.37 — Eric: "lets put a button for the project tracker next to the receipts to approve
  // button. for quick access" · "take out the last part of the note from 'question or a change..' on."
  console.log('— 📊 v6.37 a Project Tracker button beside Receipts to approve, and a shorter client note —');

  ok('the job fold shows 📊 Project Tracker right after 🧾 Receipts to approve', await page.evaluate(async () => {
    _portalOpen = 0;
    await renderPortalList();
    const h = document.body.innerHTML;
    return /🧾 Receipts to approve[^<]*<\/button>\s*(<!--[\s\S]*?-->\s*)?<button[^>]*onclick="openMoneyPage\('tracker'\)"[^>]*>📊 Project Tracker<\/button>/.test(h);
  }));

  ok('the same button sits in the office-phone fold too (both folds carry it, plus the Money section)', (() => {
    const src = fs.readFileSync(fileURLToPath(appUrl), 'utf8');
    return (src.match(/onclick="openMoneyPage\('tracker'\)"/g) || []).length === 3;
  })());

  ok('tapping it opens the same Project Tracker page the Summary window shows', await page.evaluate(async () => {
    window._dbxFiles[(DBX_ROOT + '/App Data/project-tracker.html').toLowerCase()] = '<html><body>tracker page</body></html>';
    await openMoneyPage('tracker');
    const good = $('svTitle').textContent === 'Project Tracker' && $('sumViewer').classList.contains('show');
    $('sumViewer').classList.remove('show'); document.body.classList.remove('modal-open');
    return good;
  }));

  ok('with no tracker file yet, it says so in words instead of opening a blank page', await page.evaluate(async () => {
    delete window._dbxFiles[(DBX_ROOT + '/App Data/project-tracker.html').toLowerCase()];
    await openMoneyPage('tracker');
    return /No Project Tracker published yet/.test($('toast').textContent) && !$('sumViewer').classList.contains('show');
  }));

  const client = fs.readFileSync(path.join(path.dirname(fileURLToPath(appUrl)), 'c', 'index.html'), 'utf8');
  ok('client page: the upcoming-costs note stops at "once it\'s invoiced." — the "question or a change" line is gone',
    !/Questions or a change of mind/.test(client) && /once it's invoiced\.<\/div>/.test(client));

  ok('client page: the rest of the note is untouched', /already committed to your job that haven't reached an invoice yet/.test(client) && /Figures are estimates and can move a little\. Each drops off this list once it's invoiced\./.test(client));

  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v6.37') && document.querySelector('footer').textContent.includes(APP_VER);
  }));

  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
