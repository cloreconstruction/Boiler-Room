// 📎 v6.59 — the Wizard shows the Dropbox paths of the files it found, and the PICK THE JOB
// step is the wheel alone. Eric: "id like in small letter for it to show the dropbox file path to
// the results it finds so if something messes up or its taking too long i can just find the file
// in dropbox myself" / "i dont like the 'recent' tags, just leave the drop down menu only".
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
    jobs = ['Mery', 'Smith, Troy']; curJob = 'Mery'; crew = []; entries = []; todos = []; nextId = 1;
    prefs.tagScrub1 = true; prefs.tagScrub2 = true;
    renderJobSelects(); closePanels(); renderAll();
    window.scheduleSave = () => {};
    dbx.refreshToken = 'test-token';
    window.aiKey = () => 'test-key';
    window._searched = [];
    window.dbxRpc = async (path, arg) => {
      if (path === 'files/search_v2') {
        window._searched.push(arg.query);
        return { matches: [
          { metadata: { metadata: { '.tag': 'file', path_display: '/Clore DayLog/Job Notes/Smith, Troy/concrete only contract — Office-Admin — Smith, Troy — 2026-07-29 0909.pdf' } } },
          { metadata: { metadata: { '.tag': 'file', path_display: '/Clore DayLog/Receipts/2026-07/Insulated concrete solutions. Down payment, Troy smith — 2026-07-22 0935.jpeg' } } },
          { metadata: { metadata: { '.tag': 'folder', path_display: '/Clore DayLog/Job Notes/Smith, Troy' } } }
        ] };
      }
      return {};
    };
    window._ctxSeen = '';
    window.aiCall = async (req) => {
      window._ctxSeen = (req.messages || []).map(m => m.content).join('\n');
      return { r: { ok: true, json: async () => ({ content: [{ text: 'The concrete-only contract is filed under Smith, Troy in Job Notes.' }] }) }, model: 'quick', fell: false };
    };
  });

  console.log('— 📎 v6.59 the Wizard shows where it looked —');

  ok('the answer screen lists the Dropbox paths of the files whose names matched, in full', await page.evaluate(async () => {
    $('askText').value = 'find the troy smith concrete contract';
    await askInstant('find the troy smith concrete contract');
    const t = $('wizFullBody').textContent;
    return $('wizFull').classList.contains('show') &&
      /Files in Dropbox whose names matched/.test(t) &&
      /\/Clore DayLog\/Job Notes\/Smith, Troy\/concrete only contract/.test(t) &&
      /\/Clore DayLog\/Receipts\/2026-07\/Insulated concrete solutions/.test(t);
  }));

  ok('folders are not listed — only files he can open', await page.evaluate(() =>
    ($('wizFullBody').textContent.match(/\/Clore DayLog\//g) || []).length === 2));

  ok('it is small print under the answer, not the answer', await page.evaluate(() => {
    const box = $('wizFullBody').querySelector('.wf-files');
    const ans = $('wizFullBody').querySelector('.wf-q');
    return !!box && parseFloat(getComputedStyle(box).fontSize) <= 12 && box.getBoundingClientRect().top > ans.getBoundingClientRect().top;
  }));

  ok('the Wizard itself was still told about the same files (nothing lost from its context)', await page.evaluate(() =>
    /DROPBOX FILES WHOSE NAMES MATCH/.test(window._ctxSeen) && /concrete only contract/.test(window._ctxSeen)));

  ok('tapping a path copies it', await page.evaluate(async () => {
    let got = '';
    const real = navigator.clipboard;
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async t => { got = t; } } });
    $('wizFullBody').querySelector('.wf-path').click();
    await new Promise(r => setTimeout(r, 50));
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: real });
    return /^\/Clore DayLog\/Job Notes\/Smith, Troy\/concrete only contract/.test(got) && /Path copied/.test($('toast').textContent);
  }));

  ok('no matching files = no list at all (no empty heading)', await page.evaluate(async () => {
    closeWizFull();
    window.dbxRpc = async () => ({ matches: [] });
    await askInstant('what did we do tuesday');
    const t = $('wizFullBody').textContent;
    closeWizFull();
    return !/Files in Dropbox/.test(t) && !$('wizFullBody').querySelector('.wf-files');
  }));

  ok('a path with an apostrophe or an ampersand cannot break the screen', await page.evaluate(async () => {
    window.dbxRpc = async () => ({ matches: [{ metadata: { metadata: { '.tag': 'file', path_display: "/Clore DayLog/Job Notes/Dale's <house> & shop/bid.pdf" } } }] });
    await askInstant('dale bid');
    const t = $('wizFullBody').textContent;
    const okNow = /Dale's <house> & shop\/bid\.pdf/.test(t) && !$('wizFullBody').querySelector('house');
    closeWizFull();
    return okNow;
  }));

  console.log('— 🎡 v6.59 pick the job is the wheel alone —');

  ok('no recent-job plates on PICK THE JOB; the wheel has the whole row', await page.evaluate(() => {
    clockJobName = 'Mery'; curJob = 'Mery';
    const e = addEntry('Note', 'x', 'Smith, Troy', {});
    renderQnJobChips();
    const box = $('qnJobChips');
    entries = entries.filter(x => x.id !== e.id);
    return box.querySelectorAll('button').length === 0 && !box.closest('.g-step').classList.contains('has-jobchips') &&
      $('qnJob').getBoundingClientRect().width > 250;
  }));

  ok('the wheel still picks the job for the grind', await page.evaluate(() => {
    $('qnJob').value = 'Smith, Troy'; $('qnJob').dispatchEvent(new Event('change'));
    return qnJobPick === 'Smith, Troy';
  }));

  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v6.59') && document.querySelector('footer').textContent.includes(APP_VER);
  }));

  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
