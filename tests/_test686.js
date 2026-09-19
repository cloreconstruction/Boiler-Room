// 📷🔍🧾✎📥 v6.86 — Eric's list of 2026-09-16: "take the photo/file select button and make it step 3 and move tag it to
// step 4" · "the phone version still has 2 summary buttons at the top" · the search "should either come up in a window or
// be easily separated out" · "when i click on receipts it should close all other tags" · "the new budget button on the
// bottom should say personal budget" · "make shop/admin to say internal/admin" · "the text counter at the bottom i dont
// think is working it says 0 texts today".
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
  await page.evaluate(() => {
    jobs = ['Shop / Admin', 'Mery', 'Hertz']; curJob = ''; crew = ['Phil']; entries = []; todos = []; nextId = 1; pendingQueue = []; prefs.pocket = []; prefs.rlFilter = ''; prefs.rlWho = ''; prefs.rlHide = [];
    window.scheduleSave = () => {}; window.savePendingSoon = () => {}; window.publishSharedNotes = () => {}; lsDel('daylog-sweep-last'); window._sweepLast = null;
    renderJobSelects(); closePanels(); renderAll();
  });

  console.log('— 📷 v6.86 the grinder: ③ photo, ④ tags, ⑤ unlock, ⑥ send —');

  ok('six steps in order — ① job, ② SAY IT, ③ ADD A PHOTO OR FILE with the camera plate and the photo list, ④ TAG IT, ⑤ UNLOCK IT, ⑥ SEND IT — and the camera left the side of the writing box', await page.evaluate(() => {
    const steps = [...document.querySelectorAll('#qnCard .g-step')];
    const num = s => s.querySelector('.g-step-num').textContent.trim(), lbl = s => s.querySelector('.g-step-label').textContent;
    const s3 = steps[2], s4 = steps[3], s5 = steps[4], s6 = steps[5];
    return steps.map(num).join('') === '123456' && /SAY IT/.test(lbl(steps[1])) && /ADD A PHOTO OR FILE/.test(lbl(s3)) && s3.dataset.step === '3' &&
      !!s3.querySelector('.cam-btn--wide[onclick*="qnPhoto"]') && s3.contains($('qnPhotoInfo')) && /ADD PHOTOS OR FILES/.test(s3.textContent) &&
      /TAG IT/.test(lbl(s4)) && s4.contains($('qnTagChips')) && /UNLOCK IT/.test(lbl(s5)) && s5.contains($('qnVisRow')) && /SEND IT/.test(lbl(s6)) && !!s6.querySelector('.plate-btn--grind') &&
      !document.querySelector('.ask-side .cam-btn') && !!document.querySelector('.ask-side #wizSideBtn') && !/add a photo/.test(lbl(steps[1]));
  }));

  ok('the flow: words → ⑥ is NEXT and ② DONE; a photo alone → ③ DONE with "1 attached", ② not done, ⑥ NEXT; tags and unlock fold as ④ and ⑤', await page.evaluate(() => {
    window._gOpen = {}; qnSel = new Set(); qnVis = ''; qnVisNames = new Set(); qnHeads = false; qnJobPick = 'Mery'; notePhotos = [];
    $('askText').value = 'a note'; updateStepFlow();
    const S = n => document.querySelector(`.g-step[data-step="${n}"]`);
    const a = S(6).classList.contains('next') && S(2).classList.contains('done') && !S(3).classList.contains('done') && S(4).classList.contains('fold') && S(5).classList.contains('fold') && /none picked/.test(S(4).textContent) && /just you/.test(S(5).textContent);
    $('askText').value = ''; notePhotos = [{ name: 'receipt.jpg' }]; updateStepFlow();
    const b = S(6).classList.contains('next') && S(3).classList.contains('done') && /📷 1 attached/.test(S(3).textContent) && !S(2).classList.contains('done');
    gFold(4); const c = !S(4).classList.contains('fold'); gFold(4);
    notePhotos = []; updateStepFlow();
    const d = !S(3).classList.contains('done') && S(1).classList.contains('done') && S(2).classList.contains('next');
    return a && b && c && d;
  }));

  console.log('— 📊 v6.86 one summary button, on the phone too —');

  ok('the phone shows three plates under the clock and no Summary plate; the header SUMMARY is there and wears the count', await page.evaluate(() => {
    const vis = [...document.querySelectorAll('#scRow .sc-btn')].filter(b => getComputedStyle(b).display !== 'none');
    pendingQueue = [{ id: 'x1', kind: 'todo', payload: { text: 'call Dale' } }]; renderPendBanner();
    const r = vis.length === 3 && !vis.some(b => /Summary/.test(b.textContent)) && getComputedStyle($('summaryBtn')).display !== 'none' && $('summaryBtn').getBoundingClientRect().width > 0 && $('hbSumN').textContent === '1' && getComputedStyle($('scRow')).gridTemplateColumns.split(' ').length === 3;
    pendingQueue = []; renderPendBanner(); return r;
  }));

  console.log('— 🔍 v6.86 the search in its own window —');

  ok('🔍 Search opens a window: the boxes, the kind plates and the results move into it; the main page keeps its place with a note', await page.evaluate(() => {
    entries = []; nextId = 1;
    addEntry('Note', 'kings delivered to Mery', 'Mery', { noSniff: true });
    addEntry('Note', 'paint colour for Dale', 'Hertz', { noSniff: true });
    renderLog();
    rlSearchToggle();
    const win = $('rlWin');
    return win.classList.contains('show') && document.body.classList.contains('modal-open') && $('rlWinBody').contains($('askRecent')) && $('rlWinBody').contains($('rlSearchWrap')) && $('rlSearchWrap').style.display !== 'none' &&
      !!$('rlWinBody').querySelector('.rl-filters') && !!$('rlWinNote') && $('runLogCard').contains($('rlWinNote')) && !$('runLogCard').contains($('askRecent')) && /Close search/.test($('rlSearchBtn').textContent) && /SEARCH THE LOG/.test(win.textContent);
  }));
  ok('typing in the window narrows the results right there; ✕ moves everything back in order, keeps the search, and the Search plate reads ✓ ON until Clear filters', await page.evaluate(() => {
    $('logSearch').value = 'kings'; logQuery = 'kings'; window._rlN = 12; renderAskRecent();
    const inWin = [...$('rlWinBody').querySelectorAll('.ask-recent-row')].map(r => r.textContent);
    const narrowed = inWin.length === 1 && /kings/.test(inWin[0]);
    rlSearchShow(false);
    const card = $('runLogCard'), kids = [...card.children].map(k => k.id || k.className.split(' ')[0]);
    const back = !$('rlWin').classList.contains('show') && !document.body.classList.contains('modal-open') && card.contains($('askRecent')) && card.contains($('rlSearchWrap')) && $('rlSearchWrap').style.display === 'none' && !$('rlWinNote') &&
      kids.indexOf('rlSearchWrap') < kids.indexOf('askRecent') && kids.indexOf('askRecent') < kids.indexOf('logDbxHits') && kids.indexOf('rlSearchWrap') > kids.findIndex(k => /qn-div|rl-head/.test(k));
    const stillNarrow = [...$('askRecent').querySelectorAll('.ask-recent-row')].length === 1 && /Search ✓ ON/.test($('rlSearchBtn').textContent) && $('rlSearchBtn').classList.contains('sel');
    clearLogFilters();
    const cleared = [...$('askRecent').querySelectorAll('.ask-recent-row')].length === 2 && $('rlSearchBtn').textContent === '🔍 Search' && !$('rlSearchBtn').classList.contains('sel');
    return narrowed && back && stillNarrow && cleared;
  }));

  console.log('— 🧾 v6.86 Receipts ON means receipts only —');

  ok('with a kind plate lit, 🧾 Receipts ON drops it and the plate row becomes ONE line that says RECEIPTS ONLY; OFF brings the plates back', await page.evaluate(() => {
    prefs.rlFilter = 'wiz'; prefs.rlHide = ['photo']; prefs.rlWho = 'Phil'; renderAskRecent();
    rlRcptToggle();
    const row = $('askRecent').querySelector('.rl-filters');
    const on = window._logRcptOnly === true && prefs.rlFilter === '' && prefs.rlHide.length === 0 && prefs.rlWho === '' && row.querySelectorAll('button').length === 1 && /RECEIPTS ONLY/.test(row.textContent) && /Receipts ✓ ON/.test($('rlRcptBtn').textContent);
    rlRcptToggle();
    const off = !window._logRcptOnly && $('askRecent').querySelector('.rl-filters').querySelectorAll('button').length > 5 && /Grinder/.test($('askRecent').querySelector('.rl-filters').textContent);
    return on && off;
  }));

  console.log('— 💰 v6.86 PERSONAL budget, in words —');

  ok('the bottom plate says Personal Budget (Personal on the phone) and the page says PERSONAL BUDGET — yours, not the business', await page.evaluate(() => {
    const b = document.querySelector('.cap-btn[data-panel="budget"]');
    return b.querySelector('.lb-long').textContent === 'Personal Budget' && b.querySelector('.lb-short').textContent === 'Personal' && /PERSONAL BUDGET/.test($('panel-budget').querySelector('h3').textContent) && /not the business/.test($('panel-budget').querySelector('h3').textContent);
  }));

  console.log('— ✎ v6.86 rename a job; Shop / Admin → Internal / Admin —');

  ok('renameJob moves everything filed under the old name — the log, a to-do, the wheel memory, the learned categories, the job card, the recap bridge', await page.evaluate(() => {
    entries = []; todos = []; nextId = 1;
    const e = addEntry('Note', 'ordered blades', 'Shop / Admin', { noSniff: true });
    todos.push({ id: 900, text: 'renew the plate', job: 'Shop / Admin', done: false, ts: new Date().toISOString() });
    prefs.jobRecent = ['Shop / Admin', 'Mery']; prefs.lastJob = 'Shop / Admin'; prefs.jobCats = { 'shop / admin': ['Tools'] }; prefs.cards = { 'shop / admin': { job: 'Shop / Admin', addr: '123 Shop Rd', people: [], codes: [], notes: '' } }; prefs.recapJobs = { shop: 'Shop / Admin' };
    qnJobPick = 'Shop / Admin'; lsSet('daylog-cardjob', 'Shop / Admin');
    const r = renameJob('Shop / Admin', 'Internal / Admin');
    return r === true && jobs.includes('Internal / Admin') && !jobs.includes('Shop / Admin') && e.job === 'Internal / Admin' && todos[0].job === 'Internal / Admin' && prefs.jobRecent[0] === 'Internal / Admin' && prefs.lastJob === 'Internal / Admin' &&
      prefs.jobCats['internal / admin'][0] === 'Tools' && !prefs.jobCats['shop / admin'] && prefs.cards['internal / admin'].job === 'Internal / Admin' && !prefs.cards['shop / admin'] && prefs.recapJobs.shop === 'Internal / Admin' && qnJobPick === 'Internal / Admin' && lsGet('daylog-cardjob') === 'Internal / Admin' &&
      [...$('qnJob').options].some(o => o.value === 'Internal / Admin') && ![...$('qnJob').options].some(o => o.value === 'Shop / Admin') && renameJob('Internal / Admin', 'Mery') === false;
  }));
  ok('Setup → Jobs: ✎ on a pill opens a box, Enter renames; a name already taken is refused', await page.evaluate(() => {
    openPanel('settings'); renderJobsManager();
    const i = jobs.indexOf('Internal / Admin');
    const pill = [...$('jobList').querySelectorAll('.job-pill')].find(p => /Internal \/ Admin/.test(p.textContent));
    const pen = pill && [...pill.querySelectorAll('button')].find(b => b.textContent === '✎');
    if (!pen) return false;
    pen.click();
    const box = $('jobRenBox'); if (!box || box.value !== 'Internal / Admin') return false;
    box.value = 'Overhead / Admin';
    box.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    const renamed = jobs.includes('Overhead / Admin') && !jobs.includes('Internal / Admin') && !$('jobRenBox') && /Overhead \/ Admin/.test($('jobList').textContent);
    closePanels();
    return renamed && renameJob('Overhead / Admin', 'Internal / Admin');
  }));
  ok('the one-time switch: a pull that brings Shop / Admin renames it to Internal / Admin once (the flag holds after), never on a crew phone', await page.evaluate(async () => {
    const file = JSON.stringify({ jobs: ['Shop / Admin', 'Mery'], trucks: [], crew: ['Phil'], prefs: { jobRen686: false }, entries: [{ id: 1, type: 'Note', details: 'blades', job: 'Shop / Admin', ts: new Date().toISOString() }], todos: [] });
    window.dbxDownload = async p => /entries\.json$/.test(p) ? file : null;
    window.dbxUpload = async () => ({}); window.dbxRpc = async () => ({ entries: [] }); dbx.refreshToken = 'x'; window.getToken = async () => 'x';
    const keep = { checkPending, checkInboxTexts, checkClientAsks, checkCrewLogs, refreshCrewCfg, checkSharedNotes };
    window.checkPending = async () => {}; window.checkInboxTexts = async () => {}; window.checkClientAsks = async () => {}; window.checkCrewLogs = async () => {}; window.refreshCrewCfg = async () => {}; window.checkSharedNotes = async () => {};
    await pullRemote();
    const once = jobs.includes('Internal / Admin') && !jobs.includes('Shop / Admin') && entries[0].job === 'Internal / Admin' && prefs.jobRen686 === true;
    const file2 = JSON.stringify({ jobs: ['Shop / Admin', 'Mery'], trucks: [], crew: ['Phil'], prefs: { jobRen686: true }, entries: [], todos: [] });
    window.dbxDownload = async p => /entries\.json$/.test(p) ? file2 : null;
    await pullRemote();
    const holds = jobs.includes('Shop / Admin') && !jobs.includes('Internal / Admin');
    Object.assign(window, keep);   // the real sweep is under test next
    return once && holds;
  }) && /\/\^\(shop\|internal\)\/i\.test\(j\)/.test(src));

  console.log('— 📥 v6.86 the Inbox sweep says how it went —');

  ok('no Dropbox → the sweep writes down why; a refused listing is an error in words, not an empty Inbox; a good sweep says what it saw and filed', await page.evaluate(async () => {
    entries = []; nextId = 1; pendingQueue = []; window._sweepLast = null;
    dbx.refreshToken = '';
    await checkInboxTexts();
    const a = /no Dropbox/.test((window._sweepLast || {}).err || '');
    dbx.refreshToken = 'x'; window.getToken = async () => 'x'; window.dbxDownload = async () => null; window.dbxUpload = async () => ({});
    window.dbxRpc = async ep => ep === 'files/list_folder' ? { error_summary: 'missing_scope/files.metadata.read' } : {};
    await checkInboxTexts();
    const b = /Inbox listing: missing_scope/.test((window._sweepLast || {}).err || '');
    window.dbxRpc = async ep => ep === 'files/list_folder' ? { entries: [{ '.tag': 'file', name: 'TEXT -Sep 16, 2026 at 8_00 AM.txt', path_lower: '/clore daylog/inbox/text -sep 16, 2026 at 8_00 am.txt', server_modified: new Date().toISOString() }] } : ep === 'files/move_v2' ? { metadata: { path_lower: '/x' } } : {};
    window.dbxDownload = async p => /8_00 am\.txt$/.test(p) ? 'FROM: Dale Rininger\nCan you come by tomorrow?' : null;
    await checkInboxTexts();
    const s = window._sweepLast || {};
    const c = !s.err && s.seen === 1 && (s.texts === 1 || pendingQueue.some(p => p.kind === 'text')) && !!s.at && JSON.parse(lsGet('daylog-sweep-last') || '{}').seen === 1;
    return a && b && c;
  }));
  const r9 = await page.evaluate(async () => {
    renderTextDigest();
    const line = document.querySelector('#txtDigest .sweep-line');
    const good = !!line && /Checked for new texts just now: 1 in the Inbox/.test(line.textContent) && /Check for texts now/.test(line.textContent) && !/sweep/i.test(line.textContent)   /* v6.93 — "sweep" read like "flush" to him */ && typeof sweepNow === 'function';
    openPanel('settings'); renderMailSenders();
    const set = $('sweepStatusSet');
    const inSetup = !!set && /Checked for new texts/.test(set.textContent) && !![...$('setMail').querySelectorAll('button')].find(b => /Check for new texts & emails now/.test(b.textContent));
    closePanels();
    window.dbxRpc = async () => ({ error_summary: 'expired_access_token/' });
    await checkInboxTexts();
    renderTextDigest();
    const bad = /⚠ The check for new texts FAILED just now: Inbox listing: expired_access_token/.test(document.querySelector('#txtDigest .sweep-line').textContent) && /FAILED just now: Inbox listing: expired_access_token/.test($('sweepStatusSet').textContent);
    return good && inSetup && bad ? true : JSON.stringify({ good, inSetup, bad, line: line && line.textContent, set: set && set.textContent, last: window._sweepLast });
  });
  ok('the line under the text meter and Setup → 📧 Email senders say it in words, with a Sweep now tap; a failure reads ⚠ FAILED', r9 === true, r9);

  ok('nothing runs off the right edge of the main page', await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth));
  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v6.86') && document.querySelector('footer').textContent.includes(APP_VER);
  }));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
