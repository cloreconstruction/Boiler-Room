// ☎ v6.57 — NAME A NUMBER, AGAIN. Eric: "wheres the option for me to add a name to the phone
// numbers from texts?" It has existed since v5.26 (✎ name in the texts digest, and the name box
// in the thread window since v6.14) — but v6.24's tag scrub stopped bare numbers becoming tags,
// and every door to the name box was keyed on the tag. A text from an unnamed number therefore
// filed under "?", wore no ✎, and had no 💬 thread link. The sender is read from the words now.
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

  const NUM = '+19075550142';
  const seed = () => page.evaluate((NUM) => {
    jobs = ['Mery']; curJob = 'Mery'; crew = []; entries = []; todos = []; nextId = 1;
    prefs.tagScrub1 = true; prefs.tagScrub2 = true; prefs.senderAlias = {}; prefs.tags = [];
    window.scheduleSave = () => {};
    _tdOpen = true; _tdSender = ''; _tdRen = ''; _tdRange = 'today';
    // exactly what the incoming-text path writes for a number iOS could not match: the number
    // is in the words, tagClean() dropped it as a tag (v6.24), so there is NO tag at all
    const e = addEntry('Note', `Text from ${NUM}: can you come by the shop today?`, '—', { noSniff: true, texted: true, tags: tagClean(NUM) });
    window._raw = e;
    const known = addEntry('Note', 'Text from Phil: walls are up', '—', { noSniff: true, texted: true, tags: ['Phil'] });
    window._phil = known;
    renderAll(); renderTextDigest();
    return { tags: e.tags, id: e.id };
  }, NUM);

  console.log('— ☎ v6.57 a text from a raw number can reach the name box again —');

  const s = await seed();
  ok('the setup is the real bug: the number text has NO tag (the v6.24 scrub)', s.tags === undefined || (Array.isArray(s.tags) && s.tags.length === 0));

  ok('textSender reads the number out of the words', await page.evaluate((NUM) => textSender(_raw) === NUM, NUM));

  ok('…and a tagged text still answers with its tag, a plain note with nothing', await page.evaluate(() => {
    const plain = addEntry('Note', 'poured the footings', 'Mery', {});
    const okNow = textSender(_phil) === 'Phil' && textSender(plain) === '';
    entries = entries.filter(e => e.id !== plain.id);
    return okNow;
  }));

  ok('the 📬 digest files it under the NUMBER, not under "?"', await page.evaluate((NUM) => {
    renderTextDigest();
    const t = $('txtDigest').textContent;
    return t.includes(NUM) && !/\?\s*\(1\)/.test(t);
  }, NUM));

  ok('…with the ✎ name chip beside it', await page.evaluate(() => /✎ name/.test($('txtDigest').textContent)));

  ok('the log row offers 💬 thread · ✎ name for that text', await page.evaluate(() => {
    window._rlOpen = new Set([_raw.id]); clearLogFilters(); renderLog();
    const h = $('askRecent').innerHTML;
    window._rlOpen = new Set();
    return /💬 thread ↩ · ✎ name/.test(h);
  }));

  ok('the thread window finds the conversation by the number and shows the name box', await page.evaluate((NUM) => {
    openThread(NUM);
    const okNow = threadWith(NUM).length === 1 && !!$('thrName') && /come by the shop/.test($('revBox').textContent);
    return okNow;
  }, NUM));

  ok('typing a name in the thread window names it — and the thread reopens under the name', await page.evaluate(() => {
    $('thrName').value = 'Dale Rininger';
    thrName();
    return _thrWho === 'Dale Rininger' && /Dale Rininger/.test($('revBox').textContent) && !$('thrName');
  }));

  ok('the text itself now wears the name — words, tag, and it is marked for sync', await page.evaluate(() =>
    /^Text from Dale Rininger:/.test(_raw.details) && (_raw.tags || [])[0] === 'Dale Rininger' && _raw.synced === false));

  ok('the digest follows: Dale Rininger, and no ✎ (a name needs no naming)', await page.evaluate(() => {
    closeReview(); renderTextDigest();
    const t = $('txtDigest').textContent;
    return /Dale Rininger/.test(t) && !/✎ name/.test(t);
  }));

  ok('the NEXT text from that number arrives already wearing the name', await page.evaluate((NUM) =>
    senderName(NUM) === 'Dale Rininger', NUM));

  await seed();
  ok('the digest\'s own ✎ route works too: tap ✎, type, Enter', await page.evaluate((NUM) => {
    tdRenameStart(NUM);
    const box = $('tdRenBox');
    if (!box) return false;
    tdRenameDone(NUM, 'Cheryn');
    return /^Text from Cheryn:/.test(_raw.details) && (_raw.tags || [])[0] === 'Cheryn' && /Cheryn \(1\)/.test($('txtDigest').textContent);
  }, NUM));

  ok('a Personal-locked text from a number still never shows outside — the lock is untouched', await page.evaluate(() => {
    const p = addEntry('Note', 'Text from +19075550199: dinner at 6?', '—', { noSniff: true, texted: true });
    p.personal = true;
    const outside = textSender(p) === '+19075550199';   // the helper answers — the lock is enforced where it always was
    entries = entries.filter(e => e.id !== p.id);
    return outside;
  }));

  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v6.57') && document.querySelector('footer').textContent.includes(APP_VER);
  }));

  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
