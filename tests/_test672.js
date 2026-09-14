// 💬 v6.72 — NEEDS REVIEW. Eric: "do 4 but make it 'needs review' and it goes on the summary
// page." A flagged email keeps its card, moves under NEEDS YOU on the sort page, and stays lit
// until he says done. The same queue feeds the summary tab when it comes.
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
    jobs = ['Mery']; curJob = '—'; crew = []; entries = []; todos = []; nextId = 1; pendingQueue = [];
    prefs.tagScrub1 = true; prefs.tagScrub2 = true; prefs.mailPersonal = []; prefs.mailNo = []; prefs.tags = [];
    renderJobSelects(); closePanels(); renderAll();
    window.scheduleSave = () => {}; window._saves = 0; window.savePendingSoon = () => { window._saves++; }; window.publishSharedNotes = () => {}; window.publishMailRules = () => {};
    dbx.refreshToken = 'test-token';
    window._dbxFiles = {};
    window.dbxDownload = async p => (window._dbxFiles || {})[p] ?? null;
    window.dbxUpload = async (p, body) => { (window._dbxFiles || {})[p] = body; return {}; };
    window.T = {
      mail: (id, who, addr, subj, body) => {
        const e = autoLogMail({ who, addr, subj, body }, '2026-09-13T15:10:00Z', { mailBucket: 'important', mailWhy: 'question', mailGist: 'asks', mailBy: 'phone' });
        pendingQueue.push({ id, kind: 'mail', payload: { from: who, addr, subj, body, why: 'question', gist: 'asks', by: 'phone', known: true, entryId: e.id, ts: '2026-09-13T15:10:00Z' } });
        return e;
      },
      sec: id => { const c = document.querySelector(`.rev-card[data-pid="${id}"]`); return c ? c.closest('.rev-sec-body').dataset.sec : null; },
    };
    T.mail('mail:1', 'Dale Rininger', 'dale@rininger.com', 'deck stain', 'Can we go darker on the deck stain?');
    T.mail('mail:2', 'Bob Ashman', 'bob@ashmanplumbing.com', 'Invoice 4471', 'attached');
    openReview();
  });

  console.log('— 💬 v6.72 needs review —');

  ok('an important email starts under PEOPLE and offers 💬 Needs review', await page.evaluate(() =>
    T.sec('mail:1') === 'people' && /💬 Needs review — keep it under NEEDS YOU/.test(document.querySelector('.rev-card[data-pid="mail:1"]').textContent)));

  ok('tap it: the card STAYS, moves under NEEDS YOU, wears the flag and the date, and is saved that way', await page.evaluate(() => {
    window._saves = 0;
    reviewAct('mail:1', 'needs');
    const c = document.querySelector('.rev-card[data-pid="mail:1"]');
    const p = pendingQueue.find(x => x.id === 'mail:1');
    return pendingQueue.length === 2 && T.sec('mail:1') === 'need' && !!c && /NEEDS REVIEW — an email you flagged on 20/.test(c.textContent) &&
      p.payload.needs === true && /^20\d\d-/.test(p.payload.needsTs) && window._saves >= 1 && /Under NEEDS YOU/.test($('toast').textContent);
  }));

  ok('a flagged card answers with ✓ Reviewed — done, send to grinder, not important — and nothing else', await page.evaluate(() => {
    const t = document.querySelector('.rev-card[data-pid="mail:1"]').textContent;
    return /✓ Reviewed — done/.test(t) && /📥 Send to grinder/.test(t) && /✕ Not important/.test(t) && !/Needs review —/.test(t) && !/Personal/.test(t) && !/Never this sender/.test(t);
  }));

  ok('the sort page opens on NEEDS YOU while it sits there, and PEOPLE still holds the other email', await page.evaluate(() => {
    _revSec = null; renderReview();
    const open = [...document.querySelectorAll('.rev-sec-body')].filter(b => !b.hidden).map(b => b.dataset.sec);
    return open.join() === 'need' && T.sec('mail:2') === 'people';
  }));

  ok('✓ Reviewed — done clears it; the email stays on the log', await page.evaluate(() => {
    reviewAct('mail:1', 'log');
    return !pendingQueue.some(p => p.id === 'mail:1') && entries.length === 2;
  }));

  ok('a flagged card can still go to the grinder — same hand-off, same single copy', await page.evaluate(() => {
    reviewAct('mail:2', 'needs');
    reviewAct('mail:2', 'grind');
    return !pendingQueue.length && /^Email from Bob Ashman: Invoice 4471/.test($('askText').value) && entries.length === 2 && _grindMail === entries.find(e => e.mailAddr === 'bob@ashmanplumbing.com').id;
  }));

  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v6.72') && document.querySelector('footer').textContent.includes(APP_VER);
  }));

  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
