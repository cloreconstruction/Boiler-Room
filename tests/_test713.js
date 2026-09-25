// 👷 v7.13 — FROM THE CREW, AND FOUR PLATES ON THE UNLOCKER. Eric: "The log that Phil has below the Grinder button that says
// 'From Eric' and it's got a little searchable area is that on mine as well? I need to be able to see incoming things from Phil,
// or just his running log that he's unlocked for me or everyone." And: "My unlock it button should say 'Just me', 'Just Phil',
// and 'All crew'. And then I don't think we need the buttons that send it to the specific person, but maybe just the
// exclamation point in a triangle, like the warning light, where it means this needs someone's attention. I think there'd be
// four buttons total on the unlocker for both me and Phil." Names and words here are made up.
const { chromium } = require('playwright');
(async () => {
  const appUrl = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };
  const errs = [];
  const open = async init => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await ctx.route(u => !/^file:/.test(u.href), r => r.abort());
    if (init) await ctx.addInitScript(init);
    const page = await ctx.newPage();
    page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
    await page.goto(appUrl); await page.waitForTimeout(700);
    return { ctx, page };
  };

  // ───────────────────────── Eric's phone ─────────────────────────
  const { ctx, page } = await open();
  await page.evaluate(async () => {
    jobs = ['Oak House', 'Pine Cabin']; crew = ['Phil', 'Kevin']; prefs.office = ['Phil']; entries = []; todos = []; nextId = 1; pendingQueue = []; pendDone.clear();
    window.scheduleSave = () => {}; window.savePendingSoon = () => {}; window.publishSharedNotes = () => {};
    renderJobSelects(); closePanels(); renderAll();
    dbx.refreshToken = 'tok';
    const ago = h => new Date(Date.now() - h * 3600000).toISOString();
    const phil = [
      { id: 11, ts: ago(1), type: 'Note', details: 'Window order for Oak confirmed', job: 'Oak House', vis: 'Eric', photoPath: '/Phil/Job Notes/Oak House/Photos/window.jpg' },
      { id: 12, ts: ago(0.5), type: 'Note', details: 'Inspector is here now — need you', job: 'Oak House', vis: 'Eric', route: 'Eric', urg: 'now' },
      { id: 13, ts: ago(3), type: 'Note', details: 'Dumpster full at Pine', job: 'Pine Cabin', vis: 'crew' },
      { id: 14, ts: ago(4), type: 'Note', details: 'Kevin, bring the long ladder', job: 'Pine Cabin', vis: 'Kevin' },
      { id: 15, ts: ago(5), type: 'Note', details: 'my own private reminder', job: 'Oak House', mine: true },
      { id: 16, ts: ago(26), type: 'Done', details: '✓ DONE: set the forms', job: 'Oak House' },
      { id: 17, ts: ago(6), type: 'Clock', details: 'Clocked in', job: 'Oak House', hours: 8 },
    ];
    const kevin = [{ id: 21, ts: ago(2), type: 'Note', details: 'Tarped the lumber pile', job: 'Pine Cabin', vis: 'crew' }];
    window._files = { '/clore daylog/crew/phil/app data/entries.json': JSON.stringify({ entries: phil }), '/clore daylog/crew/kevin/app data/entries.json': JSON.stringify({ entries: kevin }) };
    window.dbxList = async () => ({ entries: [
      { '.tag': 'folder', name: 'Phil', path_lower: '/clore daylog/crew/phil', path_display: '/Clore DayLog/Crew/Phil' },
      { '.tag': 'folder', name: 'Kevin', path_lower: '/clore daylog/crew/kevin', path_display: '/Clore DayLog/Crew/Kevin' }] });
    window.dbxDownload = async p => window._files[p] ?? null;
    window._shown = []; window.showPhoto = p => { window._shown.push(p); };
    prefs.crewFeedN = 'all'; prefs.crewFeedFold = false;
    await checkCrewLogs();
  });
  const rowsOf = () => page.evaluate(() => [...document.querySelectorAll('#crewFeedList .cf-row')].map(r => r.textContent.replace(/\s+/g, ' ').trim()));

  console.log('— 👷 v7.13 FROM THE CREW on Eric\'s phone —');
  const feed = await page.evaluate(() => {
    const card = $('crewFeedCard'), qn = $('qnCard'), log = $('runLogCard');
    const r = x => x.getBoundingClientRect();
    return { shown: getComputedStyle(card).display !== 'none', title: $('cfFoldBtn').textContent.trim(), under: r(card).top >= r(qn).bottom - 1 && r(card).bottom <= r(log).top + 1 };
  });
  ok('the card shows on Eric\'s page right under the grinder and above the running log, titled FROM THE CREW (two people sent things)', feed.shown && /👷 FROM THE CREW — showing 5 of 5/.test(feed.title) && feed.under, JSON.stringify(feed));
  const rows = await rowsOf();
  ok('newest first, and only what was unlocked for Eric or for everyone: a note for Kevin alone, a 🔒 locked note and a clock punch are not in it', rows.length === 5 && /Inspector is here now/.test(rows[0]) && /Window order/.test(rows[1]) && /Tarped the lumber/.test(rows[2]) && !rows.some(t => /long ladder|private reminder|Clocked in/.test(t)), JSON.stringify(rows.map(t => t.slice(0, 40))));
  ok('each row says who, when, the job and who it was for in words — 📨 for you · 🔓 for everyone · ✅ finished · ⚠ NEEDS YOUR ATTENTION', /👷 Phil ·.*Oak House · 📨 for you · ⚠ NEEDS YOUR ATTENTION/.test(rows[0]) && /👷 Kevin ·.*Pine Cabin · 🔓 for everyone/.test(rows[2]) && rows.some(t => /✓ DONE: set the forms/.test(t) && /✅ finished/.test(t)), JSON.stringify(rows.map(t => t.slice(0, 90))));
  ok('the ⚠ note also came in as a HOT card for the sort pile (the 🔥 at the top of Eric\'s page)', await page.evaluate(() => !!(pendingQueue.find(p => /crew:Phil:12:/.test(p.id)) || {}).payload?.hot));
  ok('📷 Open the picture opens Phil\'s photo from Eric\'s side of the folder (/Clore DayLog/Crew/Phil/…)', await page.evaluate(() => {
    const b = [...document.querySelectorAll('#crewFeedList button')].find(x => /Open the picture/.test(x.textContent)); b.click();
    return window._shown[0] === '/Clore DayLog/Crew/Phil/Job Notes/Oak House/Photos/window.jpg';
  }), await page.evaluate(() => window._shown[0]));
  ok('the search box narrows it ("dumpster" → one row), says it is on, and keeps the cursor through the redraw', await page.evaluate(() => {
    const box = $('cfSearch'); box.focus(); box.value = 'dumpster'; box.dispatchEvent(new Event('input'));
    const r = [...document.querySelectorAll('#crewFeedList .cf-row')].length === 1 && document.activeElement === $('cfSearch') && $('cfSearch').classList.contains('sel-on') && /1 found/.test($('cfFoldBtn').textContent);
    _cfQ = ''; renderCrewFeed(); return r;
  }));
  ok('the person wheel picks one man (✓ ONLY Kevin → his one note) and the job wheel one job', await page.evaluate(() => {
    _cfWho = 'Kevin'; renderCrewFeed(); const a = document.querySelectorAll('#crewFeedList .cf-row').length === 1 && /✓ ONLY Kevin/.test($('crewFeedList').textContent);
    _cfWho = ''; _cfJob = 'Pine Cabin'; renderCrewFeed(); const b = document.querySelectorAll('#crewFeedList .cf-row').length === 2;
    _cfJob = ''; renderCrewFeed(); return a && b;
  }));
  // ⤵ v7.15 — the row's ✓ Log it became ⤵ Flush: into the running log the same way, and off the card
  ok('⤵ Flush on a row puts that note in Eric\'s running log under Phil, its card leaves the sort pile, and the row leaves this card', await page.evaluate(() => {
    const before = pendingQueue.length;
    const row = [...document.querySelectorAll('#crewFeedList .cf-row')].find(r => /Window order/.test(r.textContent));
    [...row.querySelectorAll('button')].find(b => /Flush/.test(b.textContent)).click();
    const e = entries.find(x => /Window order for Oak confirmed/.test(x.details || ''));
    const row2 = [...document.querySelectorAll('#crewFeedList .cf-row')].find(r => /Window order/.test(r.textContent));
    return !!e && e.who === 'Phil' && pendingQueue.length === before - 1 && !row2;
  }));
  ok('the "how many" wheel caps it, and the fold says how many wait in words', await page.evaluate(() => {
    prefs.crewFeedN = '3'; renderCrewFeed(); const a = document.querySelectorAll('#crewFeedList .cf-row').length === 3 && /showing 3 of 4/.test($('cfFoldBtn').textContent);
    crewFeedFold(); const b = /▸ 👷 FROM THE CREW — 4 notes, tap to open/.test($('cfFoldBtn').textContent) && $('crewFeedList').style.display === 'none';
    crewFeedFold(); prefs.crewFeedN = 'all'; renderCrewFeed(); return a && b;
  }));
  ok('with only Phil sending, it reads FROM PHIL', await page.evaluate(() => {
    const k = _crewFeed.Kevin; delete _crewFeed.Kevin; renderCrewFeed(); const t = $('cfFoldBtn').textContent; _crewFeed.Kevin = k; renderCrewFeed();
    return /👷 FROM PHIL — /.test(t);
  }));

  console.log('— ⚠ v7.13 four plates on Eric\'s unlocker —');
  const plates = () => page.evaluate(() => [...document.querySelectorAll('#qnVisChips .pick-chip')].map(b => b.textContent.replace(/\s+/g, ' ').trim()));
  const p0 = await plates();
  ok('exactly four: 🔒 Just me · 📨 Just Phil · 🔓 All crew · ⚠ Needs attention — no 📨 Kevin, no ➕ person, no rows/across wheels', p0.join('|') === '✓ 🔒 Just me|📨 Just Phil|🔓 All crew|⚠ Needs attention' && !(await page.evaluate(() => !!document.querySelector('#qnVisChips select, #qnVisChips .chip-bar'))), p0.join('|'));
  ok('the first three are ONE choice: Just Phil, then All crew lets Phil go, then Just me clears it', await page.evaluate(() => {
    setVis('Phil'); const a = qnVisNames.has('Phil') && !qnVis;
    setVis('crew'); const b = qnVis === 'crew' && !qnVisNames.size;
    setVis(''); const c = !qnVis && !qnVisNames.size;
    return a && b && c;
  }));
  ok('⚠ tapped while 🔒 Just me picks Just Phil for it (a note nobody sees cannot need anybody) and lights; the step line says so', await page.evaluate(() => {
    setVis(''); toggleAttn(); updateStepFlow();
    const sum = (document.querySelector('.g-step[data-step="5"] .g-step-sum') || {}).textContent || '';
    return qnAsk && qnVisNames.has('Phil') && /✓ ⚠ Needs attention/.test($('qnVisChips').textContent.replace(/\s+/g, ' ')) && /📨 just Phil · ⚠ needs attention/.test(sum);
  }));
  ok('SEND: the note goes to Phil and asks — it stays up big on his page until somebody answers (the old ❓)', await page.evaluate(async () => {
    qnJobPick = 'Oak House'; const s = $('qnJob'); if (s) s.value = 'Oak House';
    $('askText').value = 'Call the inspector back'; saveNoteFrom('askText'); await new Promise(r => setTimeout(r, 50));
    const e = entries.find(x => x.details === 'Call the inspector back');
    return !!e && e.vis === 'Phil' && e.ask === true && !qnAsk && !qnVis && !qnVisNames.size;
  }));
  ok('Just me turns ⚠ off with it; the words under the plates explain all four', await page.evaluate(() => {
    setVis('crew'); toggleAttn(); const on = qnAsk; setVis('');
    return on && !qnAsk && /⚠ stays up big on their page until somebody answers/.test($('visExplain').textContent) && /📨 goes to Phil's phone/.test($('visExplain').textContent);
  }));
  ok('on the phone the four sit two by two (a PC lays them four across)', await page.evaluate(() =>
    getComputedStyle($('qnVisChips')).getPropertyValue('--cols').trim() === '2'));
  await ctx.close();

  // ───────────────────────── Phil's phone ─────────────────────────
  const phil = await open(() => { try { localStorage.setItem('daylog-crew-name', 'Phil'); localStorage.setItem('daylog-crew-root', '/Phil'); localStorage.setItem('daylog-crew-jobs', JSON.stringify(['Oak House'])); localStorage.setItem('daylog-crew-mates', JSON.stringify(['Kevin'])); } catch (e) {} });
  console.log('— ⚠ v7.13 four plates on a crew phone —');
  const cp = await phil.page.evaluate(() => ({ crew: CREW_NAME, plates: [...document.querySelectorAll('#qnVisChips .pick-chip')].map(b => b.textContent.replace(/\s+/g, ' ').trim()),
    route: getComputedStyle($('crewRoute')).display, req: !!$('myReqStrip') && !$('crewRoute').contains($('myReqStrip')), feed: getComputedStyle($('crewFeedCard')).display }));
  ok('exactly four, from his side: 🔒 Just me · 📨 Just Eric (lit — reporting to Eric is the resting state) · 🔓 All crew · ⚠ Needs attention — no 📨 Kevin', cp.crew === 'Phil' && cp.plates.join('|') === '🔒 Just me|✓ 📨 Just Eric|🔓 All crew|⚠ Needs attention', cp.plates.join('|'));
  ok('the old "Send it to" and "How soon" rows are gone from his page; his request lamps (SENT → ANSWERED) stay', cp.route === 'none' && cp.req, JSON.stringify(cp));
  ok('no FROM THE CREW card on a crew phone', cp.feed === 'none');
  ok('⚠ on his phone = needs Eric\'s attention NOW: SEND makes the note routed to Eric, urgent, and unlocked for him', await phil.page.evaluate(async () => {
    window.scheduleSave = () => {}; toggleAttn();
    const lit = /✓ ⚠ Needs attention/.test($('qnVisChips').textContent.replace(/\s+/g, ' ')) && qnRoute === 'Eric' && qnUrg === 'now';
    qnJobPick = 'Oak House'; const s = $('qnJob'); if (s) s.value = 'Oak House';
    $('askText').value = 'Pump truck is late — call me'; saveNoteFrom('askText'); await new Promise(r => setTimeout(r, 50));
    const e = entries.find(x => x.details === 'Pump truck is late — call me');
    return lit && !!e && e.route === 'Eric' && e.urg === 'now' && (e.vis === 'Eric' || (Array.isArray(e.vis) && e.vis.includes('Eric'))) && !e.mine;
  }));
  ok('🔒 Just me on his phone lets ⚠ go too, and the note never leaves the phone', await phil.page.evaluate(async () => {
    toggleAttn(); setVis(''); const off = !qnRoute && !qnUrg;
    qnJobPick = 'Oak House'; $('askText').value = 'my own note'; saveNoteFrom('askText'); await new Promise(r => setTimeout(r, 50));
    const e = entries.find(x => x.details === 'my own note');
    return off && !!e && e.mine === true && !e.route;
  }));
  await phil.ctx.close();

  ok('no page errors', errs.length === 0, errs.join(' | '));
  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close(); process.exit(fail ? 1 : 0);
})();
