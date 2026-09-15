// ✕📌🧙 v6.81 — EVERY ✕ BLACK ON GOLD; NO SILENT JOB DEFAULT; THE WIZARD SEES THE POCKET AND THE BOARD.
// Eric: "There are still some X's that need to be black for closing windows. Also, check: I'm still getting
// the Hertz job tagged on stuff. I don't know if it's tagged or if it's always the default … Also, the pocket
// list: when I push Done or when I make a pocket list item, are those searchable by the Grinder? … I want to
// make sure that as I make a checklist and check them off, the wizard knows that those items are done."
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
    jobs = ['Hertz', 'Mery', 'Shop / Admin']; curJob = ''; crew = ['Phil']; entries = []; todos = []; nextId = 1; pendingQueue = []; prefs.pocket = []; prefs.lastJob = 'Hertz'; prefs.jobRecent = ['Hertz'];
    window.scheduleSave = () => {}; window.savePendingSoon = () => {}; window.publishSharedNotes = () => {};
    renderJobSelects(); closePanels(); renderAll();
  });

  console.log('— ✕ v6.81 every closer black on gold —');

  ok('the lightbox ✕ Close, the summary viewer ✕, the answer-strip ✕ and the photo-viewer ✕ are gold plates with a black ✕', await page.evaluate(() => {
    const brass = getComputedStyle(document.querySelector('.qn-div-label')).backgroundColor;
    const sel = ['button[onclick="closeLightbox()"]', '.sv-close', '.ask-inline__x', '.lb-close'];
    return sel.every(s => { const b = document.querySelector(s); if (!b) return false; const cs = getComputedStyle(b); return cs.color === 'rgb(17, 17, 17)' && cs.backgroundColor === brass && parseFloat(cs.borderTopWidth) >= 3; });
  }));
  ok('the client preview\'s ✕ CLOSE pill is black on gold too', await page.evaluate(() => {
    const b = document.querySelector('.cp-x'); const cs = getComputedStyle(b);
    return cs.color === 'rgb(17, 17, 17)' && cs.backgroundColor === getComputedStyle(document.querySelector('.qn-div-label')).backgroundColor;
  }));
  ok('the estimates board, the plan rack and the materials board closers wear the plate in the source', (() => {
    const has = fn => { const i = src.indexOf(`onclick="${fn}()"`); if (i < 0) return false; return /x-plate/.test(src.slice(Math.max(0, i - 200), i)); };
    return has('closeEstimates') && has('closePlanRack') && (src.match(/x-plate[^>]*onclick="matClose\(\)"/g) || []).length === 2;
  })());
  ok('a small ✕ plate still reads black on gold and stays a thumb tall', await page.evaluate(() => {
    const b = document.querySelector('.ask-inline__x'); const cs = getComputedStyle(b);
    return parseFloat(cs.minHeight) >= 36 && cs.color === 'rgb(17, 17, 17)';
  }));

  console.log('— 📌 v6.81 no silent job default —');

  ok('with no job tapped, the app is set to NO job — not last week\'s (prefs.lastJob), not the first on the list', await page.evaluate(() => {
    curJob = ''; prefs.lastJob = 'Hertz'; renderAllJobChips();
    return curJob === '' && !document.querySelector('#hJobChips .pick-chip.sel') && !document.querySelector('#nJobChips .pick-chip.sel') && ![...document.querySelectorAll('#nJobChips .pick-chip')].some(b => b.textContent.trim() === '');
  }));
  ok('Hours refuses to save without a job and says so; after a tap on the job plate it files under THAT job', await page.evaluate(() => {
    entries = []; nextId = 1; curJob = '';
    $('hHours').value = '2'; $('hDesc').value = 'trim'; $('hIn').value = ''; $('hOut').value = '';
    saveHours();
    const refused = entries.length === 0 && /Pick the job first/.test($('toast').textContent);
    setCurJob('Mery'); $('hHours').value = '2';
    saveHours();
    return refused && entries.length === 1 && entries[0].type === 'Hours' && entries[0].job === 'Mery';
  }));
  ok('a pocket ✓ note files under no job — it never borrows the app\'s job', await page.evaluate(() => {
    entries = []; nextId = 1; prefs.pocket = []; curJob = 'Hertz';
    pocketAdd('screws'); pocketDone(pocket()[0].id);
    const e = entries.find(x => x.pocket === 'done');
    return !!e && e.job === '—' && e.details === '✓ screws';
  }));
  ok('a Wizard correction note files under no job', await page.evaluate(() => {
    entries = []; nextId = 1; curJob = 'Hertz'; _lastAnswer = null;
    window.aiCall = async () => 'ok';
    const box = $('corrText') || $('askCorr') || null;
    const src = applyCorrection.toString();
    return /'—', \{ noSniff: true \}/.test(src) && !/curJob, \{ noSniff: true \}/.test(src);
  }));
  ok('the bill card takes the grinder wheel\'s pick, else the entry the photo landed on, else no job — never the app\'s leftover job', await page.evaluate(() => {
    pendingQueue = []; entries = []; nextId = 1; curJob = 'Hertz'; qnJobPick = '';
    addEntry('Note', 'enstar bill', 'Mery', { noSniff: true, photoPath: '/Clore DayLog/Photos/enstar-bill.jpg' });
    billMaybeSuggest({ name: 'enstar-bill.jpg' }, { ai: '🏪 Enstar · due 10/10/2026 · amount due $412.55', aiDue: '2026-10-10', aiDueAmt: 412.55 });
    const a = pendingQueue.find(p => p.kind === 'bill');
    pendingQueue = []; qnJobPick = 'Shop / Admin';
    billMaybeSuggest({ name: 'enstar-bill.jpg' }, { ai: '🏪 Enstar · due 10/11/2026 · amount due $412.55', aiDue: '2026-10-11', aiDueAmt: 412.55 });
    const b = pendingQueue.find(p => p.kind === 'bill');
    pendingQueue = []; qnJobPick = '';
    billMaybeSuggest({ name: 'nothing-on-the-log.jpg' }, { ai: '🏪 Enstar · due 10/12/2026 · amount due $412.55', aiDue: '2026-10-12', aiDueAmt: 412.55 });
    const c = pendingQueue.find(p => p.kind === 'bill');
    return !!a && a.payload.job === 'Mery' && !!b && b.payload.job === 'Shop / Admin' && !!c && c.payload.job === '';
  }));
  ok('the board\'s add box starts on GENERAL, not the app\'s job', await page.evaluate(() => {
    curJob = 'Hertz'; openReview('board');
    const r = $('brdJob').value === '—';
    closeReview(); return r;
  }));
  ok('📗 To bookkeeper names the wheel\'s pick or a dash — never the app\'s job', (() => {
    const i = src.indexOf('function toBookkeeper()'); const body = src.slice(i, i + 600);
    return /qnJobPick : '—'/.test(body) && !/curJob \|\| '—'/.test(body);
  })());

  console.log('— 🧙 v6.81 the Wizard sees the pocket and the board —');

  ok('a checked-off pocket item reaches the Wizard as DONE in words, an unfinished one as NOT DONE, the open list as open', await page.evaluate(() => {
    entries = []; nextId = 1; prefs.pocket = []; curJob = '';
    pocketAdd('gravel for the drive');
    pocketAdd('screws for Hertz'); pocketDone(pocket().find(x => x.t === 'screws for Hertz').id);
    addEntry('Note', '🎒 Flushed — call the gravel guy', '—', { noSniff: true, tags: ['pocket'], pocket: 'flushed' });
    const c = buildAskContext('what did I get done today');
    return /POCKET LIST \(his quick list[^\n]*\[\{"t":"gravel for the drive"/.test(c) && /POCKET DONE[^\n]*"t":"screws for Hertz"/.test(c) && /POCKET NOT DONE[^\n]*"t":"call the gravel guy"/.test(c) &&
      /"x":"✓ screws for Hertz"[^}]*"pocket":"DONE — he checked it off his pocket list"/.test(c) && /"pocket":"NOT DONE — left the pocket list unfinished"/.test(c);
  }));
  ok('the board reaches the Wizard: open lines by job with priority and steps, and this week\'s done lines with who finished them', await page.evaluate(() => {
    entries = []; nextId = 1; todos = [];
    const a = addEntry('Note', 'frame the deck by Friday', 'Mery', { noSniff: true, board: { p: 3, sub: [{ t: 'get the 2x6s', done: '2026-09-14T10:00:00Z' }, { t: 'call for the inspection', done: '' }], at: new Date().toISOString() } });
    const b = addEntry('Note', 'order the garage door', 'Hertz', { noSniff: true, board: { p: 1, sub: [], at: new Date().toISOString(), done: new Date().toISOString(), by: 'Phil' } });
    addEntry('Note', 'dentist at 3', 'Mery', { noSniff: true, personal: true, board: { p: 2, sub: [], at: new Date().toISOString() } });
    const c = buildAskContext('what is on the board');
    return /BOARD — OPEN LINES[^\n]*"job":"Mery","t":"frame the deck by Friday","p":3,"sub":\["✓ done: get the 2x6s","○ open: call for the inspection"\]/.test(c) &&
      /BOARD — DONE THIS WEEK[^\n]*"t":"order the garage door","by":"Phil"/.test(c) && !/dentist/.test(c) &&
      /"x":"frame the deck by Friday"[^}]*"board":\{"p":3,"done":"open"/.test(c) && /"board":\{"p":1,"done":"DONE by Phil"/.test(c);
  }));
  ok('a pocket note is a plain log entry, so the running log\'s search finds it', await page.evaluate(() => {
    entries = []; nextId = 1; prefs.pocket = [];
    pocketAdd('blue tape'); pocketDone(pocket()[0].id);
    return entries.some(e => e.pocket === 'done' && /blue tape/.test(e.details) && e.type === 'Note') && typeof renderLog === 'function';
  }));

  console.log('— 💳 v6.81 cards in the Vault —');

  ok('the Vault has a 💳 CARDS tab beside 🔑 LOGINS, and the add button follows the tab', await page.evaluate(() => {
    vaultData = []; vaultKey = {}; vaultRevealed = new Set(); vaultShowView('main'); vaultShowTab('login');
    const tabs = [...document.querySelectorAll('#vaultTabs .vault-tab')].map(b => b.textContent.trim());
    const a = tabs.length === 2 && /LOGINS/.test(tabs[0]) && /CARDS/.test(tabs[1]) && /Add login/.test($('vaultAddBtn').textContent) && document.querySelector('#vaultTabs .vault-tab.on').textContent.includes('LOGINS');
    vaultShowTab('card');
    return a && /Add card/.test($('vaultAddBtn').textContent) && document.querySelector('#vaultTabs .vault-tab.on').textContent.includes('CARDS') && /No cards saved yet/.test($('vaultList').textContent);
  }));

  ok('a card saves into the same encrypted vault and shows MASKED — last four only — with its own 📋 for every part', await page.evaluate(async () => {
    window.vaultPush = async () => { window._vaultPushed = (window._vaultPushed || 0) + 1; };
    vaultAddTap();
    const formUp = $('vaultCardForm').style.display !== 'none' && $('vaultForm').style.display === 'none';
    $('vaultCName').value = 'Home Depot Visa'; $('vaultCNum').value = '4242 4242 4242 4242'; $('vaultCExp').value = '09/28'; $('vaultCCvv').value = '123'; $('vaultCHolder').value = 'Eric Clore'; $('vaultCZip').value = '99611';
    await vaultSaveCard();
    const row = $('vaultList').querySelector('.vault-row'); const t = row ? row.textContent : '';
    const rec = vaultData.find(x => x.kind === 'card');
    return formUp && !!rec && rec.num === '4242424242424242' && rec.site === 'Home Depot Visa' && (window._vaultPushed || 0) >= 1 && $('vaultCardForm').style.display === 'none' &&
      /Home Depot Visa/.test(t) && /•••• 4242/.test(t) && !/4242 4242 4242/.test(t) && !/123/.test(t) && /09\/28/.test(t) && /Eric Clore/.test(t) &&
      ['num', 'exp', 'cvv', 'name', 'zip'].every(f => !!row.querySelector(`button[onclick="vaultCopyField(${rec.id},'${f}')"]`)) && !/4242424242424242/.test($('vaultList').innerHTML);
  }));

  ok('👁 Show reveals the number; 📋 copies digits only; the LOGINS tab does not list the card', await page.evaluate(() => {
    const rec = vaultData.find(x => x.kind === 'card');
    vaultToggleReveal(rec.id);
    const shown = /4242 4242 4242 4242/.test($('vaultList').textContent) && /CVV 123/.test($('vaultList').textContent);
    let copied = ''; const real = navigator.clipboard;
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async v => { copied = v; } } });
    vaultCopyField(rec.id, 'num'); const gotNum = copied === '4242424242424242';
    vaultCopyField(rec.id, 'cvv'); const gotCvv = copied === '123';
    vaultCopyField(rec.id, 'name'); const gotName = copied === 'Eric Clore';
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: real });
    vaultToggleReveal(rec.id);
    const masked = /•••• 4242/.test($('vaultList').textContent);
    vaultShowTab('login');
    const notInLogins = !/Home Depot Visa/.test($('vaultList').textContent);
    vaultShowTab('card');
    return shown && gotNum && gotCvv && gotName && masked && notInLogins;
  }));

  ok('✏ Edit brings the card back into the form; the vault never leaks — a card is not a log entry and not in the Wizard context', await page.evaluate(() => {
    const rec = vaultData.find(x => x.kind === 'card');
    vaultEditCard(rec.id);
    const form = $('vaultCardForm').style.display !== 'none' && $('vaultCName').value === 'Home Depot Visa' && $('vaultCNum').value === '4242 4242 4242 4242' && $('vaultCCvv').type === 'password';
    vaultShowCardForm(false);
    return form && !entries.some(e => /4242|Home Depot Visa/.test(JSON.stringify(e))) && !/4242|Home Depot Visa/.test(buildAskContext('what cards do I have'));
  }));

  console.log('— 🏠 v6.81 a way back from the portal —');

  ok('the Project Portal window ends with a ← Back plate under the list — in every state, even before Dropbox — and it closes the window', await page.evaluate(() => {
    openPortalWin(); renderPortalList();
    const back = [...$('portalWin').querySelectorAll('button')].filter(x => /Back to the main page/.test(x.textContent)).pop();
    const list = $('portalList');
    const plate = !!back && back.classList.contains('x-plate') && getComputedStyle(back).color === 'rgb(17, 17, 17)';
    const under = !!back && !!list && !!(back.compareDocumentPosition(list) & Node.DOCUMENT_POSITION_PRECEDING) && !list.contains(back);
    const one = [...$('portalWin').querySelectorAll('button')].filter(x => /Back to the main page/.test(x.textContent)).length === 1;
    if (back) back.click();
    return plate && under && one && !$('portalWin').classList.contains('show');
  }));

  console.log('— 🔒 v6.81 Personal on top of every wheel, and off the grinder\'s ① —');

  ok('the Personal job is not on the grinder\'s ① wheel — the 🔒 chip in ③ is the same lock', await page.evaluate(() => {
    jobs = ['Hertz', 'Mery', 'Personal', 'Shop / Admin']; curJob = ''; renderAllJobChips(); renderJobSelects();
    const opts = [...$('qnJob').options].map(o => o.textContent.trim());
    const a = { id: 1, details: 'x', job: 'Personal', tags: [] }, b = { id: 2, details: 'x', job: 'Mery', tags: ['Personal'] }, c = { id: 3, details: 'x', job: 'Mery', personal: true };
    return !opts.some(o => /^Personal$/i.test(o)) && opts.includes('Mery') && isLocked(a) && isLocked(b) && isLocked(c);
  }));

  ok('everywhere else Personal sits on top: the clock wheel, the File Cabinet wheel, the hours and mileage grids, the bill wheel, the board\'s move wheel', await page.evaluate(() => {
    prefs.jobRecent = ['Hertz']; renderAllJobChips(); renderJobSelects(); renderFcJobSel();
    renderMileBody(); renderMileJobs();                                                       // the mileage grid is drawn with its panel
    // (the clock-out panel has no job grid — the shift's job is the job; renderCoJobs is dead code)
    const first = sel => { const el = document.querySelector(sel); return el ? el.textContent.trim() : ''; };
    const firstOpt = (sel, skip) => { const el = $(sel); if (!el) return ''; const o = [...el.options].map(x => x.textContent.trim()).filter(t => !skip.test(t)); return o[0] || ''; };
    const clock = firstOpt('clockJob', /Choose job/), fc = firstOpt('fcJobSel', /^—$/);
    const hours = first('#hJobChips .pick-chip'), mile = first('#mJobGrid .pick-chip');
    pendingQueue = [{ id: 'qb:1', kind: 'qb', payload: { text: 'x', amt: 1 } }];
    const wheel = revJobWheel(pendingQueue[0], 'job'); const div = document.createElement('div'); div.innerHTML = wheel;
    const bill = [...div.querySelectorAll('option')].map(o => o.textContent.trim()).filter(t => !/pick it later/.test(t))[0];
    pendingQueue = [];
    addEntry('Note', 'a thought', 'Mery', { noSniff: true, board: { p: 0, sub: [], at: new Date().toISOString() } });
    openReview('board'); brdOpen('e', entries[0].id);
    const move = [...document.querySelector('.bd-row select').options].map(o => o.textContent.trim()).filter(t => !/Move to/.test(t))[0];
    closeReview();
    closePanels();
    return [clock, fc, hours, mile, bill, move].every(t => /^Personal$/.test(t)) && recentJobsOrdered()[0] === 'Personal' && recentJobsOrdered()[1] === 'Hertz';
  }));

  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v6.81') && document.querySelector('footer').textContent.includes(APP_VER);
  }));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
