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
    jobs = ['Mery']; curJob = 'Mery'; crew = []; entries = []; todos = []; nextId = 1;
    prefs.tagScrub1 = true; prefs.tagScrub2 = true;
    prefs.mailAsk = []; prefs.mailOk = []; prefs.mailNo = [];
    renderJobSelects(); closePanels(); renderAll();
    window._dbxFiles = {};
    window.dbxDownload = async path => (window._dbxFiles || {})[path] ?? null;
    window.dbxUpload = async (path, body) => { (window._dbxFiles || {})[path] = body; return {}; };
    window.scheduleSave = () => {};
    dbx.refreshToken = dbx.refreshToken || 'test-token';
  });

  // 📧 v6.40 — Eric: "the running log will need an email search and i'll need a place to be able
  // to add or delete or edit the always and never for email senders."
  console.log('— 📧 v6.40 an email search on the log, and the sender lists he can edit —');

  ok('the log\'s Type wheel offers 📧 Emails', await page.evaluate(() => [...$('lfType').options].some(o => o.value === 'Mail' && /Emails/.test(o.text))));

  ok('📧 Emails shows only what came in by email — a plain note stays out', await page.evaluate(() => {
    entries = []; nextId = 1;
    addEntry('Note', 'plain jobsite note about the septic', 'Mery', {});
    const m = mailParse('FROM: Dale Rininger<dale@rininger.com>\nSUBJECT:question about the deck stain\n\ncan we go darker on the deck?');
    autoLogMail(m, '2026-09-06T20:00:00Z');
    clearLogFilters(); $('lfType').value = 'Mail'; renderAskRecent();
    const h = $('askRecent').textContent;
    return /question about the deck stain/.test(h) && !/plain jobsite note/.test(h) && /📧/.test($('askRecent').innerHTML);
  }));

  ok('the search box finds an email by sender and by subject', await page.evaluate(() => {
    clearLogFilters(); logQuery = 'rininger'; renderAskRecent();
    const a = /question about the deck stain/.test($('askRecent').textContent);
    logQuery = 'deck stain'; renderAskRecent();
    const b = /Dale Rininger: question about the deck stain/.test($('askRecent').textContent) && !/plain jobsite note/.test($('askRecent').textContent);   // v6.41 — the 📧 glyph says "email"; the line no longer spends its room on the words
    logQuery = ''; clearLogFilters(); renderAskRecent();
    return a && b;
  }));

  ok('Setup has the 📧 Email senders card with both lists, in words', await page.evaluate(() => {
    prefs.mailOk = ['dale@rininger.com']; prefs.mailNo = ['@junkmail.com'];
    renderMailSenders();
    const t = $('mailListsBox').textContent;
    return /ALWAYS — kept \(1\)/.test(t) && /dale@rininger\.com/.test(t) && /NEVER — skipped \(1\)/.test(t) && /@junkmail\.com/.test(t) && /everyone there/.test(t);
  }));

  ok('✕ drop takes a sender off a list, and the next email from there will ask again', await page.evaluate(() => {
    mailListDel(true, 0);
    return !mailOk().length && /off that list/.test($('toast').textContent) && /asks again/.test($('toast').textContent) && /nobody yet/.test($('mailListsBox').textContent);
  }));

  ok('adding by hand: a pasted "Name <addr>" is cleaned to the address; a bare company becomes @company', await page.evaluate(() => {
    $('mailAddInput').value = 'Bob Sub <Bob@SubCo.com>'; mailListAdd(true);
    $('mailAddInput').value = 'spenard.com'; mailListAdd(true);
    return mailOk().includes('bob@subco.com') && mailOk().includes('@spenard.com') && $('mailAddInput').value === '' && /kept from now on/.test($('toast').textContent);
  }));

  ok('a sender is on one list or the other, never both — moving him to Never takes him off Always', await page.evaluate(() => {
    $('mailAddInput').value = 'bob@subco.com'; mailListAdd(false);
    return !mailOk().includes('bob@subco.com') && mailNo().includes('bob@subco.com') && mailNo().length === 2;
  }));

  ok('junk input is refused in words and changes nothing', await page.evaluate(() => {
    const before = JSON.stringify([mailOk(), mailNo()]);
    $('mailAddInput').value = 'not an address'; mailListAdd(true);
    return JSON.stringify([mailOk(), mailNo()]) === before && /Type an address like/.test($('toast').textContent);
  }));

  ok('adding a sender who was still waiting on the old "keep them?" question clears that question (v6.67: the card no longer asks at all)', await page.evaluate(() => {
    mailAsk().push({ a: 'new@vendor.com', s: 'quote' }); renderMailAsk();
    $('mailAddInput').value = 'new@vendor.com'; mailListAdd(true);
    return !mailAsk().length && mailOk().includes('new@vendor.com') && !/NEW EMAIL SENDERS/.test($('mailAskCard').textContent);
  }));

  ok('the sweep honours the edited lists — Never means archived, nothing logged', await page.evaluate(() =>
    mailListed(mailNo(), 'bob@subco.com') && mailListed(mailNo(), 'anyone@junkmail.com') && mailListed(mailOk(), 'x@spenard.com') && !mailListed(mailOk(), 'bob@subco.com')));

  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v6.40') && document.querySelector('footer').textContent.includes(APP_VER);
  }));

  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
