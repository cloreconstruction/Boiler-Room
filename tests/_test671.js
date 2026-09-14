// 📥 v6.71 — AN EMAIL INTO THE GRINDER. Eric: "on the email sort lets do 'important, send to
// grinder'. keep 'never from sender' and 'personal' which would still send to grinder but lock
// as personal." The email is already on the log; the card hands that entry to the grinder and
// the grind updates it — never a second copy.
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
    jobs = ['Mery', 'Hertz']; curJob = '—'; crew = []; entries = []; todos = []; nextId = 1; pendingQueue = [];
    prefs.tagScrub1 = true; prefs.tagScrub2 = true; prefs.mailPersonal = []; prefs.mailNo = []; prefs.mailOk = []; prefs.tags = ['Subs'];
    renderJobSelects(); closePanels(); renderAll();
    window.scheduleSave = () => {}; window.savePendingSoon = () => {}; window.publishSharedNotes = () => {}; window.publishMailRules = () => {};
    dbx.refreshToken = 'test-token';
    window._dbxFiles = {};
    window.dbxDownload = async p => (window._dbxFiles || {})[p] ?? null;
    window.dbxUpload = async (p, body) => { (window._dbxFiles || {})[p] = body; return {}; };
    window.T = {
      mail: (id, who, addr, subj, body) => {
        const e = autoLogMail({ who, addr, subj, body }, '2026-09-12T15:10:00Z', { mailBucket: 'important', mailWhy: 'invoice', mailGist: 'a bill', mailBy: 'phone' });
        pendingQueue.push({ id, kind: 'mail', payload: { from: who, addr, subj, body, why: 'invoice', gist: 'a bill', by: 'phone', known: true, entryId: e.id, ts: '2026-09-12T15:10:00Z' } });
        return e;
      },
      reset: () => { entries = []; nextId = 1; pendingQueue = []; qnSel = new Set(); qnJobPick = ''; qnRcpt = false; qnCat = ''; _grindMail = null; $('askText').value = ''; closeReview(); },
    };
  });

  console.log('— 📥 v6.71 the email card\'s four answers —');

  ok('the card offers exactly: Important → grinder, Personal → grinder locked, Never this sender, Not important', await page.evaluate(() => {
    T.reset(); T.mail('mail:1', 'Bob Ashman', 'bob@ashmanplumbing.com', 'Invoice 4471', 'Rough-in plumbing invoice, $3,290.00 due Oct 10.');
    openReview();
    const t = $('revBox').textContent;
    return /📥 Important — send to grinder/.test(t) && /🔒 Personal — grinder, locked/.test(t) && /🚫 Never this sender/.test(t) && /✕ Not important — it stays on the log/.test(t) &&
      !/Got it/.test(t) && !/Never more than a maybe/.test(t) && !/Always \+ log it/.test(t);
  }));

  ok('Important → send to grinder: Review closes, the email\'s words are in the box, the sender\'s tag is lit, the card is gone, the log still has ONE copy', await page.evaluate(() => {
    reviewAct('mail:1', 'grind');
    const box = $('askText').value;
    return !$('revModal').classList.contains('show') && /^Email from Bob Ashman: Invoice 4471\nRough-in plumbing invoice/.test(box) && qnSel.has('Bob Ashman') &&
      !pendingQueue.length && entries.length === 1 && _grindMail === entries[0].id && /In the grinder/.test($('toast').textContent);
  }));

  ok('the grind UPDATES that entry — job, tag, 🧾 category, the $ pulled out — no second copy, and the 📧 chip, address and date stay', await page.evaluate(() => {
    const e = entries[0];
    qnJobPick = 'Mery'; qnSel.add('Subs'); qnRcpt = true; qnCat = 'Plumbing';
    saveQuickNote();
    return entries.length === 1 && e.job === 'Mery' && e.mail === true && e.mailAddr === 'bob@ashmanplumbing.com' && e.mailSubj === 'Invoice 4471' &&
      (e.tags || []).includes('Subs') && (e.tags || []).includes('Bob Ashman') && e.category === 'Plumbing' && e.rcpt === true && /💵 \$3,290\.00/.test(e.ai || '') &&
      _grindMail === null && /📧 Filed · Mery/.test($('toast').textContent) && !/Took it back|Undo/i.test($('toast').textContent);
  }));

  ok('…and because the grind made it a receipt, it is now waiting under MONEY for Mery', await page.evaluate(() => rcptCount('Mery') === 1));

  ok('Personal → the record is LOCKED the moment he taps, the address joins the 🔒 list, and the grinder opens locked', await page.evaluate(() => {
    T.reset(); const e = T.mail('mail:2', 'Shevaun', 'shevaun@example.com', 'dinner', 'are you home by 6?');
    openReview();
    reviewAct('mail:2', 'personal');
    return e.personal === true && (e.tags || []).includes('Personal') && mailListed(mailPersonal(), 'shevaun@example.com') &&
      /^Email from Shevaun: dinner/.test($('askText').value) && qnSel.has('Personal') && personalTagOn() && !pendingQueue.length && /locked as personal/.test($('toast').textContent);
  }));

  ok('grinding a personal one keeps it personal and keeps it single', await page.evaluate(() => {
    const e = entries[0];
    qnJobPick = 'Hertz'; saveQuickNote();
    return entries.length === 1 && e.personal === true && (e.tags || []).includes('Personal') && e.job === 'Hertz' && !e.vis;
  }));

  ok('a fresh note typed over the hand-off is a NEW note — the email is left as it was', await page.evaluate(() => {
    T.reset(); const e = T.mail('mail:3', 'Dale', 'dale@rininger.com', 'stain', 'can we go darker?');
    openReview(); reviewAct('mail:3', 'grind');
    const before = e.details;
    $('askText').value = 'pick up screws for Hertz'; qnJobPick = 'Hertz';
    saveQuickNote();
    return entries.length === 2 && e.details === before && e.job === '—' && entries.find(x => x !== e).details === 'pick up screws for Hertz' && _grindMail === null;
  }));

  ok('Never this sender still lists them and clears the card; Not important clears the card and the email stays on the log', await page.evaluate(() => {
    T.reset(); T.mail('mail:4', 'Sales', 'sales@coldcall.com', 'offer', 'save on siding');
    T.mail('mail:5', 'Bob Ashman', 'bob@ashmanplumbing.com', 'thanks', 'got the check');
    openReview();
    reviewAct('mail:4', 'never'); reviewAct('mail:5', false);
    return mailListed(mailNo(), 'sales@coldcall.com') && !pendingQueue.length && entries.length === 2;
  }));

  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v6.71') && document.querySelector('footer').textContent.includes(APP_VER);
  }));

  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
