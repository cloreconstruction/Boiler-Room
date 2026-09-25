// ⤵ v7.15 — THE FROM PHIL CARD FLUSHES LIKE THE POCKET. Eric: "From phil window needs to have a flush like the pocket list does and
// it goes into grinder like pocket list". A flushed note goes into Eric's running log the way ✓ Log it always put a crew note
// there (under Phil's name, its Sort card cleared) and leaves the card for good (prefs.crewFeedGone). Names and words are made up.
const { chromium } = require('playwright');
(async () => {
  const appUrl = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await ctx.route(u => !/^file:/.test(u.href), r => r.abort());
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
  await page.goto(appUrl); await page.waitForTimeout(700);
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };

  await page.evaluate(async () => {
    jobs = ['Oak House', 'Pine Cabin']; crew = ['Phil']; prefs.office = ['Phil']; entries = []; todos = []; nextId = 1; pendingQueue = []; pendDone.clear();
    prefs.crewFeedGone = []; prefs.crewFeedN = 'all'; prefs.crewFeedFold = false;
    window.scheduleSave = () => {}; window.savePendingSoon = () => {}; window.publishSharedNotes = () => {};
    renderJobSelects(); closePanels(); renderAll();
    dbx.refreshToken = 'tok';
    const ago = h => new Date(Date.now() - h * 3600000).toISOString();
    window._phil = [
      { id: 11, ts: ago(1), type: 'Note', details: 'Window order for Oak confirmed', job: 'Oak House', vis: 'Eric' },
      { id: 12, ts: ago(2), type: 'Note', details: 'Dumpster full at Pine', job: 'Pine Cabin', vis: 'crew' },
      { id: 13, ts: ago(3), type: 'Note', details: 'Trim delivered to the garage', job: 'Oak House', vis: 'Eric' },
      { id: 14, ts: ago(4), type: 'Note', details: 'Already dealt with last week', job: 'Oak House', vis: 'Eric' },
    ];
    window._files = { '/clore daylog/crew/phil/app data/entries.json': JSON.stringify({ entries: _phil }) };
    window.dbxList = async () => ({ entries: [{ '.tag': 'folder', name: 'Phil', path_lower: '/clore daylog/crew/phil', path_display: '/Clore DayLog/Crew/Phil' }] });
    window.dbxDownload = async p => window._files[p] ?? null;
    window._said = []; const t0 = window.toast; window.toast = (m, g) => { if (m) _said.push(String(m)); return t0(m, g); };
    await checkCrewLogs();
    // note 14 was handled on another day: its Sort card is gone, but the card still lists it
    pendingQueue = pendingQueue.filter(p => !/crew:Phil:14:/.test(p.id)); renderCrewFeed();
  });
  const rows = () => page.evaluate(() => [...document.querySelectorAll('#crewFeedList .cf-row')].map(r => r.textContent.replace(/\s+/g, ' ').trim()));

  console.log('— ⤵ v7.15 a flush plate on the card, and on every row —');
  const head = await page.evaluate(() => ({ btn: ($('cfFlushBtn') || {}).textContent, sameStyle: $('cfFlushBtn').classList.contains('pk-flush') && $('cfFlushBtn').classList.contains('pk-tiny'),
    rowBtns: [...document.querySelectorAll('#crewFeedList .cf-flush')].map(b => b.textContent.trim()) }));
  ok('the card\'s head wears the pocket\'s own ⤵ Flush plate, with the count it will take: ⤵ Flush 4', head.btn === '⤵ Flush 4' && head.sameStyle, JSON.stringify(head));
  ok('every row has its own ⤵ Flush: "into your log" while its Sort card waits, "off the card" once it was handled', head.rowBtns.filter(t => t === '⤵ Flush — into your log').length === 3 && head.rowBtns.filter(t => t === '⤵ Flush — off the card').length === 1, JSON.stringify(head.rowBtns));

  ok('narrowed by the search ("dumpster") the plate says ⤵ Flush these 1 — and flushing takes only that one', await page.evaluate(() => {
    _cfQ = 'dumpster'; renderCrewFeed();
    const lab = $('cfFlushBtn').textContent;
    crewFeedFlushAll();
    const e = entries.find(x => /Dumpster full at Pine/.test(x.details || ''));
    return lab === '⤵ Flush these 1' && !!e && e.who === 'Phil' && !pendingQueue.some(p => /crew:Phil:12:/.test(p.id)) && _cfQ === '' && $('cfFlushBtn').textContent === '⤵ Flush 3';
  }));
  const r1 = await rows();
  ok('…the other three stay on the card', r1.length === 3 && !r1.some(t => /Dumpster/.test(t)), JSON.stringify(r1.map(t => t.slice(0, 40))));

  ok('⤵ Flush (all): the two still waiting go into the running log under Phil, the handled one is NOT logged twice, and the card clears', await page.evaluate(() => {
    const before = entries.length; _said.length = 0;
    $('cfFlushBtn').click();
    const trim = entries.find(x => /Trim delivered/.test(x.details || '')), win = entries.find(x => /Window order/.test(x.details || ''));
    const dup = entries.filter(x => /Already dealt with/.test(x.details || '')).length;
    return entries.length === before + 2 && trim && trim.who === 'Phil' && win && win.who === 'Phil' && dup === 0
      && !pendingQueue.some(p => /^crew:Phil:/.test(p.id)) && getComputedStyle($('crewFeedCard')).display === 'none'
      && /3 off the card — 2 into your running log, 1 already handled/.test(_said.join(' '));
  }));
  ok('what was flushed is remembered in his synced settings (prefs.crewFeedGone), so the next sweep does not bring it back', await page.evaluate(async () => {
    await checkCrewLogs(); renderCrewFeed();
    return prefs.crewFeedGone.length === 4 && getComputedStyle($('crewFeedCard')).display === 'none';
  }));
  ok('a NEW note from Phil after the flush shows on its own — "⤵ Flush 1"', await page.evaluate(async () => {
    _phil.unshift({ id: 15, ts: new Date().toISOString(), type: 'Note', details: 'Pump truck booked for Tuesday', job: 'Oak House', vis: 'Eric' });
    window._files['/clore daylog/crew/phil/app data/entries.json'] = JSON.stringify({ entries: _phil });
    await checkCrewLogs();
    const t = [...document.querySelectorAll('#crewFeedList .cf-row')].map(r => r.textContent);
    return t.length === 1 && /Pump truck booked/.test(t[0]) && $('cfFlushBtn').textContent === '⤵ Flush 1';
  }));
  ok('a single row\'s ⤵ Flush logs it and it leaves the card (the card hides when nothing is left)', await page.evaluate(() => {
    document.querySelector('#crewFeedList .cf-flush').click();
    const e = entries.find(x => /Pump truck booked/.test(x.details || ''));
    return !!e && e.who === 'Phil' && getComputedStyle($('crewFeedCard')).display === 'none';
  }));
  ok('a flushed note with NO job — or a job that is not on Eric\'s list — files under — (unfiled), never under his first job', await page.evaluate(async () => {
    jobs = ['Internal / Admin', 'Oak House', 'Pine Cabin'];
    _phil.unshift({ id: 16, ts: new Date().toISOString(), type: 'Note', details: 'Need more screws', job: '', vis: 'Eric' },
      { id: 17, ts: new Date().toISOString(), type: 'Note', details: 'Test job on my phone', job: 'Test by Phil in setup', vis: 'Eric' });
    window._files['/clore daylog/crew/phil/app data/entries.json'] = JSON.stringify({ entries: _phil });
    await checkCrewLogs();
    $('cfFlushBtn').click();
    const a = entries.find(x => /Need more screws/.test(x.details || '')), b = entries.find(x => /Test job on my phone/.test(x.details || ''));
    return !!a && !!b && a.job === '—' && b.job === '—';
  }));
  ok('a ✅ finished note from Phil (it closes none of Eric\'s to-dos, so it never had a Sort card) still goes into his log when flushed', await page.evaluate(async () => {
    _phil.unshift({ id: 18, ts: new Date().toISOString(), type: 'Done', details: 'Siding done on the north wall', job: 'Oak House', vis: 'Eric' });
    window._files['/clore daylog/crew/phil/app data/entries.json'] = JSON.stringify({ entries: _phil });
    await checkCrewLogs();
    const noCard = !pendingQueue.some(p => /crew:Phil:18:/.test(p.id));
    const plate = document.querySelector('#crewFeedList .cf-flush').textContent.trim();
    document.querySelector('#crewFeedList .cf-flush').click();
    const e = entries.find(x => /Siding done on the north wall/.test(x.details || ''));
    return noCard && plate === '⤵ Flush — into your log' && !!e && e.who === 'Phil' && e.type === 'Note' && e.details === 'Phil: ✅ FINISHED: Siding done on the north wall'
      && e.job === 'Oak House' && !pendingQueue.some(p => /crew:Phil:18:/.test(p.id)) && pendDone.has(e.crewKey);
  }));
  ok('a note his OTHER device already logged (its card came back on this one) is NOT logged twice — old entries matched by name, exact words and day', await page.evaluate(async () => {
    const now = new Date();
    entries.unshift({ id: 9001, ts: now, type: 'Note', details: 'Phil: Tile is on site', job: 'Oak House', who: 'Phil' });   // logged on his phone, before v7.15 (no key)
    _phil.unshift({ id: 19, ts: now.toISOString(), type: 'Note', details: 'Tile is on site', job: 'Oak House', vis: 'Eric' },
      { id: 20, ts: now.toISOString(), type: 'Note', details: 'Grout is on site', job: 'Oak House', vis: 'Eric' });
    window._files['/clore daylog/crew/phil/app data/entries.json'] = JSON.stringify({ entries: _phil });
    await checkCrewLogs();
    const carded = pendingQueue.some(p => /crew:Phil:19:/.test(p.id));
    const plates = [...document.querySelectorAll('#crewFeedList .cf-row')].map(r => r.textContent.replace(/\s+/g, ' '));
    const tilePlate = /Tile is on site.*Flush — off the card/.test(plates.find(t => /Tile is on site/.test(t)) || '');
    const before = entries.length;
    $('cfFlushBtn').click();
    const tiles = entries.filter(x => /Tile is on site/.test(x.details || '')).length, grout = entries.filter(x => /Grout is on site/.test(x.details || '')).length;
    return carded && tilePlate && tiles === 1 && grout === 1 && entries.length === before + 1 && !pendingQueue.some(p => /crew:Phil:(19|20):/.test(p.id));
  }));
  ok('Phil\'s ANSWER to one of Eric\'s to-dos: the flush checks the to-do off (as its Sort card did) AND puts his words in the log, without a doubled "Phil:"', await page.evaluate(async () => {
    todos = [{ id: 500, text: 'Ask Phil about the deck pay', job: 'Oak House', done: false, who: 'Phil', ts: new Date().toISOString() }];
    _phil.unshift({ id: 21, ts: new Date().toISOString(), type: 'Done', details: 'Phil: Not paid for the deck yet', srcRef: 'e500', job: 'Oak House', vis: 'Eric' });
    window._files['/clore daylog/crew/phil/app data/entries.json'] = JSON.stringify({ entries: _phil });
    await checkCrewLogs();
    const carded = pendingQueue.some(p => /crew:Phil:21:/.test(p.id));
    const plate = [...document.querySelectorAll('#crewFeedList .cf-row')].map(r => r.textContent.replace(/\s+/g, ' ')).find(t => /Not paid for the deck/.test(t)) || '';
    $('cfFlushBtn').click();
    const e = entries.find(x => /Not paid for the deck yet/.test(x.details || ''));
    return carded && /Flush — into your log/.test(plate) && todos[0].done === true && !!e && e.details === 'Phil: ✅ FINISHED: Not paid for the deck yet' && e.who === 'Phil'
      && !pendingQueue.some(p => /crew:Phil:21:/.test(p.id));
  }));
  ok('the key is on every crew note the flush logs, so the next check is exact', await page.evaluate(() => {
    const e = entries.find(x => /Grout is on site/.test(x.details || ''));
    return !!e && /^crew:Phil:20:/.test(e.crewKey || '');
  }));
  ok('the remembered list keeps the newest 800 only', await page.evaluate(() => {
    prefs.crewFeedGone = Array.from({ length: 805 }, (_, i) => 'crew:Old:' + i + ':2026-01-01');
    crewFeedFlushKeys(['crew:Phil:999:2026-09-25']);
    return prefs.crewFeedGone.length === 800 && prefs.crewFeedGone[799] === 'crew:Phil:999:2026-09-25' && prefs.crewFeedGone[0] === 'crew:Old:6:2026-01-01';
  }));

  ok('no page errors', errs.length === 0, errs.join(' | '));
  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close(); process.exit(fail ? 1 : 0);
})();
