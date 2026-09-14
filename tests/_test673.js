// 🧙📜🎒 v6.73 — KEEP THE WIZARD + THE POCKET LIST (Eric's "1-4", the first two). "look through
// the things ive asked the wizard" — now there is something to look through. "a super quick fire
// list … just today and tomorrow … so that they dont get just longer and longer."
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
    jobs = ['Mery', 'Hertz']; curJob = 'Mery'; crew = []; entries = []; todos = []; nextId = 1; pendingQueue = [];
    prefs.pocket = []; _wizLog = []; lsSet('daylog-wizlog', '[]');
    renderJobSelects(); closePanels(); renderAll();
    window.scheduleSave = () => {}; window.savePendingSoon = () => {}; window.publishSharedNotes = () => {};
    dbx.refreshToken = 'test-token';
    window._dbxFiles = {};
    window.dbxDownload = async p => (window._dbxFiles || {})[p] ?? null;
    window.dbxUpload = async (p, body) => { (window._dbxFiles || {})[p] = body; return {}; };
    window.dbxRpc = async () => ({ matches: [] });
    window.aiKey = () => 'k';
    window.aiCall = async () => ({ r: { ok: true, json: async () => ({ content: [{ text: 'Tuesday you poured footings at Mery. SOURCES: 1' }] }) }, model: 'quick', fell: false });
    addEntry('Note', 'poured footings', 'Mery', { noSniff: true });
  });

  console.log('— 🧙📜 v6.73 keep the Wizard —');

  ok('an instant answer is KEPT: question, answer, the records it used, which brain, when', await page.evaluate(async () => {
    $('askText').value = 'what did we do tuesday';
    await askInstant('what did we do tuesday');
    closeWizFull();
    const r = wizLog()[0];
    return !!r && r.q === 'what did we do tuesday' && /poured footings at Mery/.test(r.a) && !/SOURCES/.test(r.a) && r.ids.join() === '1' && r.by.length > 0 && /^20\d\d-/.test(r.at) && _lastAnswer.keep === r.at;
  }));

  ok('…on the phone at once, and in Dropbox a breath later (App Data/wizard-log.json)', await (async () => {
    const local = await page.evaluate(() => JSON.parse(lsGet('daylog-wizlog') || '[]').length === 1);
    await page.waitForTimeout(1900);
    return local && await page.evaluate(() => { const f = window._dbxFiles[WIZ_LOG_PATH()]; return !!f && JSON.parse(f)[0].q === 'what did we do tuesday'; });
  })());

  ok('✎ Wrong? Correct it attaches the fix to THAT answer', await page.evaluate(() => {
    applyCorrection('it was Wednesday, not Tuesday');
    const r = wizLog()[0];
    return r.fix && r.fix.length === 1 && r.fix[0].t === 'it was Wednesday, not Tuesday';
  }));

  ok('the sort page shows it under WIZARD with the words, and 🧙 Open the answer brings it back up, correctable', await page.evaluate(() => {
    _revSec = null; renderReview();
    const h = [...document.querySelectorAll('.rev-sec')].find(b => b.dataset.sec === 'wizard');
    const row = document.querySelector('.rev-sec-body[data-sec="wizard"] .rev-wiz');
    const shows = /WIZARD 1 waiting/.test(h.textContent.replace(/\s+/g, ' ')) && !!row && /what did we do tuesday/.test(row.textContent) && /✎ corrected/.test(row.textContent);
    const at = wizLog()[0].at;
    row.querySelector('button').click();
    const up = $('wizFull').classList.contains('show') && /poured footings/.test($('wizFullBody').textContent) && _lastAnswer.keep === at && /Wrong\? Correct it/.test($('wizFullBody').textContent);
    closeWizFull();
    return shows && up;
  }));

  ok('history never wins the first open: with a bill waiting the page opens on MONEY, not WIZARD; the count line says 1 waiting', await page.evaluate(() => {
    pendingQueue = [{ id: 'bill:2026-10-10:enstar', kind: 'bill', payload: { who: 'Enstar', amt: 412.55, due: '2026-10-10', job: 'Mery', what: '🏪 Enstar', text: 'Pay Enstar', pri: 2 } }];
    _revSec = null; renderReview();
    const open = [...document.querySelectorAll('.rev-sec-body')].filter(b => !b.hidden).map(b => b.dataset.sec);
    const sub = $('revBox').querySelector('.rev-sub').textContent;
    pendingQueue = [];
    return open.join() === 'money' && /^1 waiting/.test(sub);
  }));

  ok('the file in Dropbox and the phone merge — an older answer from another day rides in, newest first', await page.evaluate(async () => {
    window._dbxFiles[WIZ_LOG_PATH()] = JSON.stringify([{ at: '2026-09-10T10:00:00Z', q: 'door code for 937?', a: '2006, as of 9/8 (Patrick)', ids: [], by: 'quick' }]);
    await wizLogLoad();
    return wizLog().length === 2 && wizLog()[0].q === 'what did we do tuesday' && wizLog()[1].q === 'door code for 937?';
  }));

  console.log('— 🎒 v6.73 the pocket list —');

  ok('the list sits right under the grinder (the writing box stays first, v6.12): one line, a + button, empty words', await page.evaluate(() => {
    renderPocket();
    const card = $('pocketCard');
    const k = [...document.querySelector('.wrap').children].map(e => e.id).filter(Boolean);
    return !!card && !!$('pocketIn') && !!document.querySelector('.pk-add') && /Empty\. Think of something at Home Depot/.test(card.textContent) &&
      k.indexOf('qnCard') === k.indexOf('scRow') + 1 && k.indexOf('pocketCard') === k.indexOf('qnCard') + 1;
  }));

  ok('type it, tap + (or Enter): it lands under TODAY with ✓ Done and ➡ Tomorrow; the count says 2 of 8', await page.evaluate(() => {
    $('pocketIn').value = 'screws for Hertz'; pocketAddFromBox();
    $('pocketIn').value = 'call the inspector'; $('pocketIn').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    const t = $('pocketList').textContent;
    return pocket().length === 2 && $('pocketIn').value === '' && /TODAY/.test(t) && /call the inspector/.test(t) && /screws for Hertz/.test(t) && /✓ Done/.test(t) && /➡ Tomorrow/.test(t) && $('pocketCount').textContent === '2 of 8';
  }));

  ok('➡ Tomorrow moves it under TOMORROW, where the ➡ button is gone', await page.evaluate(() => {
    const it = pocket().find(x => x.t === 'call the inspector');
    pocketTomorrow(it.id);
    const rows = [...document.querySelectorAll('.pk-row')];
    const tomRow = rows.find(r => /call the inspector/.test(r.textContent));
    return it.day === pocketDay(1) && /TOMORROW/.test($('pocketList').textContent) && tomRow && !/➡ Tomorrow/.test(tomRow.textContent);
  }));

  ok('✓ Done takes it off and leaves a small note on the log, tagged pocket, on the job the wheel is set to', await page.evaluate(() => {
    const it = pocket().find(x => x.t === 'screws for Hertz');
    const n = entries.length;
    pocketDone(it.id);
    const e = entries[0];
    return pocket().length === 1 && entries.length === n + 1 && e.details === '✓ screws for Hertz' && (e.tags || []).includes('pocket') && e.pocket === 'done' && e.job === 'Mery';
  }));

  ok('✕ takes a mistake off with no note', await page.evaluate(() => {
    pocketAdd('oops'); const n = entries.length;
    pocketDrop(pocket().find(x => x.t === 'oops').id);
    return !pocket().some(x => x.t === 'oops') && entries.length === n;
  }));

  ok('eight is the limit — the ninth is refused, in words', await page.evaluate(() => {
    prefs.pocket = [];
    for (let i = 1; i <= 8; i++) pocketAdd('thing ' + i);
    const ninth = pocketAdd('thing 9');
    return pocket().length === 8 && ninth === false && /Eight is the limit/.test($('toast').textContent);
  }));

  ok('the nightly sweep: what was not done yesterday leaves the list as a "not done" note tagged pocket; today\'s and tomorrow\'s stay', await page.evaluate(() => {
    prefs.pocket = [];
    pocketAdd('today thing'); pocketAdd('tomorrow thing'); pocketTomorrow(pocket().find(x => x.t === 'tomorrow thing').id);
    pocket().push({ id: 'y1', t: 'yesterday thing', day: pocketDay(-1), ts: new Date().toISOString() });
    const n = entries.length;
    const swept = pocketSweep();
    const e = entries[0];
    return swept === 1 && pocket().length === 2 && !pocket().some(x => x.t === 'yesterday thing') && entries.length === n + 1 &&
      e.details === '🎒 Not done — yesterday thing' && (e.tags || []).includes('pocket') && e.pocket === 'swept' && /went to the Wizard/.test($('toast').textContent) && pocketSweep() === 0;
  }));

  ok('the Wizard sees the pocket list when it answers', await page.evaluate(() => {
    const c = buildAskContext('what do I need to do today');
    return /POCKET LIST/.test(c) && /today thing/.test(c) && /tomorrow thing/.test(c);
  }));

  ok('the list rides prefs, so it syncs with everything else', await page.evaluate(() => {
    const j = JSON.parse(livePayload());
    return Array.isArray(j.prefs.pocket) && j.prefs.pocket.length === 2;
  }));

  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v6.73') && document.querySelector('footer').textContent.includes(APP_VER);
  }));

  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
