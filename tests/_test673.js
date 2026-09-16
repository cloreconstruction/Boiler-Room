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

  ok('the list sits inside the grinder just above ① PICK THE JOB (v6.75, Eric\'s spot): one line, a + button, the cap between − and +, ⤵ Flush, empty words', await page.evaluate(() => {
    prefs.pocketMax = 8; renderPocket();
    const card = $('pocketCard');
    const k = [...document.querySelector('.wrap').children].map(e => e.id).filter(Boolean);
    const step1 = document.querySelector('#qnCard .g-step[data-step="1"]');
    return !!card && !!$('pocketIn') && !!document.querySelector('.pk-add') && $('pocketList').textContent === '' && /think of it, type it, tap \+/.test($('pocketIn').placeholder) &&
      k.indexOf('qnCard') === k.indexOf('scRow') + 1 && $('qnCard').contains(card) && !!(card.compareDocumentPosition(step1) & Node.DOCUMENT_POSITION_FOLLOWING) &&
      $('pocketCount').textContent === '0/8' && !!document.querySelector('.pk-flush') && document.querySelectorAll('.pk-cap .pk-tiny').length === 2;
  }));

  ok('type it, tap + (or Enter): it lands under TODAY with ✓ Done, ✎ and ⤵ Flush (v6.84 — the ✕ and ➡ plates are gone); the count says 2 of 8', await page.evaluate(() => {
    $('pocketIn').value = 'screws for Hertz'; pocketAddFromBox();
    $('pocketIn').value = 'call the inspector'; $('pocketIn').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    const t = $('pocketList').textContent;
    return pocket().length === 2 && $('pocketIn').value === '' && /TODAY/.test(t) && /call the inspector/.test(t) && /screws for Hertz/.test(t) && /✓ Done/.test(t) && /⤵ Flush/.test(t) && /✎/.test(t) && !/➡ Tomorrow/.test(t) && !/✕/.test(t) && $('pocketCount').textContent === '2/8';
  }));

  ok('pocketTomorrow (the summary\'s ↩ uses it) moves an item under TOMORROW', await page.evaluate(() => {
    const it = pocket().find(x => x.t === 'call the inspector');
    pocketTomorrow(it.id);
    const rows = [...document.querySelectorAll('.pk-row')];
    const tomRow = rows.find(r => /call the inspector/.test(r.textContent));
    return it.day === pocketDay(1) && /TOMORROW/.test($('pocketList').textContent) && !!tomRow;
  }));

  // 📌 v6.81 — Eric: "I'm still getting the Hertz job tagged on stuff" — a pocket item has no job of its own; the ✓ note files under none
  ok('✓ Done takes it off and leaves a small note on the log, tagged pocket, under no job (v6.81)', await page.evaluate(() => {
    const it = pocket().find(x => x.t === 'screws for Hertz');
    const n = entries.length;
    pocketDone(it.id);
    const e = entries[0];
    return pocket().length === 1 && entries.length === n + 1 && e.details === '✓ screws for Hertz' && (e.tags || []).includes('pocket') && e.pocket === 'done' && e.job === '—';
  }));

  ok('pocketDrop still takes a mistake off with no note (the ✕ plate itself is gone in v6.84)', await page.evaluate(() => {
    pocketAdd('oops'); const n = entries.length;
    pocketDrop(pocket().find(x => x.t === 'oops').id);
    return !pocket().some(x => x.t === 'oops') && entries.length === n;
  }));

  ok('✎ edits the words in place; ⤵ Flush sends that one item to the log as a flushed note, off the list (v6.84)', await page.evaluate(() => {
    pocketAdd('gravel'); const it = pocket().find(x => x.t === 'gravel');
    pocketEditStart(it.id); const inp = document.querySelector('.pk-row input.pk-edit'); if (!inp) return false;
    inp.value = 'gravel for the drive'; inp.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    const edited = it.t === 'gravel for the drive' && /gravel for the drive/.test($('pocketList').textContent) && !document.querySelector('.pk-row input');
    const n = entries.length; pocketFlushOne(it.id);
    return edited && !pocket().some(x => x.id === it.id) && entries.length === n + 1 && entries[0].pocket === 'flushed' && /🎒 Flushed — gravel for the drive/.test(entries[0].details) && entries[0].job === '—';
  }));

  ok('over the cap the OLDEST goes to the grinder\'s pile as a pocket note — the newest stay in sight (v6.75)', await page.evaluate(() => {
    prefs.pocket = []; prefs.pocketMax = 8;
    for (let i = 1; i <= 8; i++) pocketAdd('thing ' + i);
    const n = entries.length;
    const ninth = pocketAdd('thing 9');
    const e = entries[0];
    return ninth === true && pocket().length === 8 && pocket()[0].t === 'thing 9' && !pocket().some(x => x.t === 'thing 1') &&
      entries.length === n + 1 && e.details === '🎒 Overflow — thing 1' && e.pocket === 'over' && (e.tags || []).includes('pocket') && /went to the grinder/.test($('toast').textContent);
  }));

  ok('tiny − and +: the cap moves, the count says so, and shrinking it overflows the oldest; it never goes under 2 or over 30', await page.evaluate(() => {
    pocketCapSet(-1);
    const a = pocketCap() === 7 && pocket().length === 7 && !pocket().some(x => x.t === 'thing 2') && $('pocketCount').textContent === '7/7' && /Holds 7 now/.test($('toast').textContent);
    pocketCapSet(1);
    const b = pocketCap() === 8 && $('pocketCount').textContent === '7/8';
    prefs.pocketMax = 2; pocketCapSet(-1); const c = pocketCap() === 2;
    prefs.pocketMax = 30; pocketCapSet(1); const d = pocketCap() === 30;
    prefs.pocketMax = 8; renderPocket();
    return a && b && c && d;
  }));

  ok('⤵ Flush clears the list and sends every item to the grinder\'s pile; an empty flush just says so', await page.evaluate(() => {
    prefs.pocket = []; pocketAdd('one'); pocketAdd('two');
    const n = entries.length;
    const flushed = pocketFlush();
    const notes = entries.slice(0, 2).map(e => e.details).sort().join('|');
    const empty = pocketFlush();
    return flushed === 2 && pocket().length === 0 && entries.length === n + 2 && notes === '🎒 Flushed — one|🎒 Flushed — two' && entries[0].pocket === 'flushed' && empty === 0 && /Nothing to flush/.test($('toast').textContent);
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
