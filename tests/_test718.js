// 🎒 v7.18 — Eric: "Make everyone's pocket list private to their phone. But if we want to get it to the grinder and tag it, you
// open the summary button, click on Pocket List or Pocket Not Done. Both will have a send-to-grinder with the same four unlock it
// buttons. Adjust me: just Eric or Phil, or all crew, and needs attention." Names and words are made up.
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
  const sendRows = sec => `#revBox .rev-sec-body[data-sec="${sec}"] .pk-sendrow`;

  // ───────────────────────── Eric's phone ─────────────────────────
  const { ctx, page } = await open();
  await page.evaluate(() => {
    jobs = ['Oak House', 'Pine Cabin']; crew = ['Phil', 'Kevin']; prefs.office = ['Phil']; entries = []; todos = []; nextId = 1; pendingQueue = []; pendDone.clear();
    window.scheduleSave = () => {}; window.savePendingSoon = () => {}; window._pub = 0; window.publishSharedNotes = () => { _pub++; };
    renderJobSelects(); closePanels(); renderAll();
    prefs.pocketMax = 8; prefs.pocket = [];
    pocketAdd('buy more screws'); pocketAdd('call the tile guy');
    pocketDone(pocket().find(x => x.t === 'call the tile guy').id);                                  // → a ✓ pocket note
    entries.unshift({ id: 900, ts: new Date(Date.now() - 3600e3), type: 'Note', details: '🎒 Flushed — order trim for Pine', job: '—', tags: ['pocket'], pocket: 'flushed', noSniff: true });
    renderPocket();
  });

  console.log('— ⚙ the Summary: send-to-grinder with the same four unlock buttons —');
  // a plate is its icon over its word (two pieces, no space between them in the markup) — read them as "icon word"
  await page.evaluate(() => { window._plate = b => [...b.children].map(c => c.textContent.trim()).join(' '); });
  const rows = await page.evaluate(() => { openReview('summary'); sumSecTap('get'); const g = [...document.querySelectorAll('#revBox .rev-sec-body[data-sec="get"] .pk-sendrow')].map(r => [...r.querySelectorAll('.pk-send')].map(_plate));
    sumSecTap('pocket'); const p = [...document.querySelectorAll('#revBox .rev-sec-body[data-sec="pocket"] .pk-sendrow')].map(r => [...r.querySelectorAll('.pk-send')].map(_plate));
    return { g, p }; });
  const four = '🔒 Just me|📨 Just Phil|🔓 All crew|⚠ Needs attention';
  ok('POCKET LIST: the live item AND the one checked off each carry "⚙ TO THE GRINDER" with the four plates, worded for Eric\'s phone', rows.g.length === 2 && rows.g.every(r => r.join('|') === four), JSON.stringify(rows.g));
  ok('POCKET — not done: the leftover carries the same four (beside its ↩ ➡ ✓ ✕)', rows.p.length === 1 && rows.p[0].join('|') === four, JSON.stringify(rows.p));

  ok('📨 Just Phil on a live item: the Summary shuts, its words are in the grinder, and ⑤ already reads "✓ 📨 Just Phil"', await page.evaluate(() => {
    openReview('summary'); sumSecTap('get');
    const row = [...document.querySelectorAll('#revBox .rev-sec-body[data-sec="get"] .sum-line')].find(l => /buy more screws/.test(l.textContent));
    row.querySelector('.pk-send[data-v="buddy"]').click();
    return !$('revModal').classList.contains('show') && $('askText').value === 'buy more screws' && qnVisNames.has('Phil') && !qnAsk &&
      /✓\s*📨 Just Phil/.test($('qnVisChips').textContent);
  }));
  ok('…he picks the job and SENDs: the note goes to Phil, and the item has left the pocket', await page.evaluate(() => {
    qnJobPick = 'Oak House'; $('qnJob').value = 'Oak House';
    const n0 = entries.length, p0 = _pub;
    saveNoteFrom('askText');
    const e = entries.find(x => x.details === 'buy more screws');
    return entries.length === n0 + 1 && !!e && e.vis === 'Phil' && e.job === 'Oak House' && !pocket().some(x => x.t === 'buy more screws') && _pub > p0;
  }));
  ok('⚠ Needs attention on the leftover: the SAME note goes out (no second copy) — to Phil, as a question, off the leftovers', await page.evaluate(() => {
    openReview('summary'); sumSecTap('pocket');
    document.querySelector('#revBox .rev-sec-body[data-sec="pocket"] .pk-send[data-v="attn"]').click();
    const box = $('askText').value, lit = qnAsk && qnVisNames.has('Phil');
    qnJobPick = 'Pine Cabin'; $('qnJob').value = 'Pine Cabin';
    const n0 = entries.length; saveNoteFrom('askText');
    const e = entries.find(x => x.id === 900);
    return box === 'order trim for Pine' && lit && entries.length === n0 && e.details === 'order trim for Pine' && e.vis === 'Phil' && e.ask === true && e.job === 'Pine Cabin' &&
      e.pocket === 'sent' && e.pocketSent === true && !pocketLeftList().some(x => x.id === 900);
  }));
  ok('🔒 Just me on the checked-off one: filed as a grinder note on his own log, nobody else', await page.evaluate(() => {
    const d = entries.find(x => x.pocket === 'done'); const id = d.id;
    openReview('summary'); sumSecTap('get');
    document.querySelector('#revBox .rev-sec-body[data-sec="get"] .pk-send[data-v="me"]').click();
    const box = $('askText').value;
    qnJobPick = 'Oak House'; $('qnJob').value = 'Oak House'; saveNoteFrom('askText');
    const e = entries.find(x => x.id === id);
    return box === 'call the tile guy' && e.details === 'call the tile guy' && !e.vis && e.pocket === 'sent' && e.job === 'Oak House';
  }));
  ok('typing a fresh note over the words makes a NEW note — the pocket thing is left alone', await page.evaluate(() => {
    pocketAdd('rent the lift');
    openReview('summary'); sumSecTap('get');
    const row = [...document.querySelectorAll('#revBox .rev-sec-body[data-sec="get"] .sum-line')].find(l => /rent the lift/.test(l.textContent));
    row.querySelector('.pk-send[data-v="me"]').click();
    $('askText').value = 'something else entirely'; saveNoteFrom('askText');
    return pocket().some(x => x.t === 'rent the lift') && entries.some(x => x.details === 'something else entirely');
  }));
  ok('↩ Undo after a 🔒 Just me send of a live item puts it back on the pocket', await page.evaluate(async () => {
    openReview('summary'); sumSecTap('get');
    const row = [...document.querySelectorAll('#revBox .rev-sec-body[data-sec="get"] .sum-line')].find(l => /rent the lift/.test(l.textContent));
    row.querySelector('.pk-send[data-v="me"]').click();
    saveNoteFrom('askText');
    const gone = !pocket().some(x => x.t === 'rent the lift');
    const u = [...document.querySelectorAll('#toast button, .toast button, button')].find(b => /Undo/i.test(b.textContent) && b.offsetParent);
    if (u) u.click(); await new Promise(r => setTimeout(r, 50));
    return gone && !!u && pocket().some(x => x.t === 'rent the lift');
  }));
  ok('Eric\'s own pocket notes never travel to a crew phone (no unlock on them)', await page.evaluate(() => {
    pocketFlush(); const flushed = entries.filter(e => e.pocket === 'flushed');
    return flushed.length > 0 && flushed.every(e => !e.vis);
  }));

  console.log('— 🎒 his side of the wall, for a crew phone that has not loaded v7.18 yet —');
  ok('a crew member\'s pocket notes (not sent on) make no Sort card and do not show on FROM PHIL; one he sent on does', await page.evaluate(async () => {
    pendingQueue = [];
    const now = new Date().toISOString();
    const log = [
      { id: 41, ts: now, type: 'Note', details: '✓ grab the ladder', job: '—', tags: ['pocket'], pocket: 'done' },
      { id: 42, ts: now, type: 'Note', details: '🎒 Flushed — caulk', job: '—', tags: ['pocket'], pocket: 'flushed' },
      { id: 43, ts: now, type: 'Note', details: 'caulk for the tub', job: 'Oak House', tags: ['pocket'], pocket: 'sent', pocketSent: true, vis: 'Eric' }];
    window.dbxList = async () => ({ entries: [{ '.tag': 'folder', name: 'Phil', path_lower: '/clore daylog/crew/phil', path_display: '/Clore DayLog/Crew/Phil' }] });
    window.dbxDownload = async p => /\/phil\/app data\/entries\.json$/i.test(p) ? JSON.stringify({ entries: log }) : null;
    dbx.refreshToken = 'tok';
    await checkCrewLogs();
    const cards = pendingQueue.filter(p => /^crew:Phil:/.test(p.id)).map(p => p.id.split(':')[2]);
    const feed = (_crewFeed.Phil || []).map(r => r.e.id);
    return JSON.stringify(cards) === '["43"]' && JSON.stringify(feed) === '[43]';
  }));
  await ctx.close();

  // ───────────────────────── Phil's phone ─────────────────────────
  const phil = await open(() => { try { localStorage.setItem('daylog-crew-name', 'Phil'); localStorage.setItem('daylog-crew-root', '/Phil'); localStorage.setItem('daylog-crew-jobs', JSON.stringify(['Oak House'])); } catch (e) {} });
  const p = phil.page;
  console.log('— 🎒 Phil\'s pocket stays on Phil\'s phone —');
  await p.evaluate(() => {
    window._up = null; window.dbxUpload = async (path, body) => { if (/App Data\/entries\.json$/.test(path)) _up = body; return {}; };
    dbx.refreshToken = 'tok'; entries = []; nextId = 500; prefs.pocketMax = 8; prefs.pocket = [];
    pocketAdd('pick up the hinges'); pocketAdd('text the painter'); pocketAdd('check the gutter');
    pocketDone(pocket().find(x => x.t === 'text the painter').id);
    pocketFlushOne(pocket().find(x => x.t === 'check the gutter').id);
    setVis(''); qnJobPick = 'Oak House'; $('askText').value = 'my own reminder'; saveNoteFrom('askText');   // 🔒 Just me
    setVis('Eric'); qnJobPick = 'Oak House'; $('askText').value = 'the trim is here'; saveNoteFrom('askText');   // 📨 Just Eric
  });
  const upl = await p.evaluate(async () => { await pushRemote(); const j = JSON.parse(_up || '{}'); return { words: (j.entries || []).map(e => e.details), pocket: (j.prefs || {}).pocket }; });
  ok('what his phone writes to Dropbox holds NONE of his pocket (list or notes) and not his 🔒 Just me note — only the note for Eric', JSON.stringify(upl.words) === JSON.stringify(['the trim is here']) && Array.isArray(upl.pocket) && upl.pocket.length === 0, JSON.stringify(upl));
  ok('…and a pull from Dropbox (which replaces the log with the file) puts them all back on his phone — the old loss of 🔒 notes too', await p.evaluate(async () => {
    window.dbxDownload = async path => /App Data\/entries\.json$/.test(path) ? _up : null;
    await pullRemote(); await new Promise(r => setTimeout(r, 100));
    const w = entries.map(e => e.details);
    return ['✓ text the painter', '🎒 Flushed — check the gutter', 'my own reminder', 'the trim is here'].every(x => w.includes(x)) && pocket().some(x => x.t === 'pick up the hinges') &&
      nextId > Math.max(...entries.map(e => e.id));
  }));
  ok('his Summary offers the same four, from his side: 🔒 Just me · 📨 Just Eric · 🔓 All crew · ⚠ Needs attention', await p.evaluate(() => {
    openReview('summary'); sumSecTap('get');
    const r = document.querySelector('#revBox .rev-sec-body[data-sec="get"] .pk-sendrow');
    return !!r && [...r.querySelectorAll('.pk-send')].map(b => [...b.children].map(c => c.textContent.trim()).join(' ')).join('|') === '🔒 Just me|📨 Just Eric|🔓 All crew|⚠ Needs attention';
  }));
  ok('📨 Just Eric on his checked-off note: it goes through his grinder to Eric — and only now is it in what his phone writes', await p.evaluate(async () => {
    const d = entries.find(e => e.pocket === 'done'); const id = d.id;
    const row = [...document.querySelectorAll('#revBox .rev-sec-body[data-sec="get"] .sum-line')].find(l => /text the painter/.test(l.textContent));
    row.querySelector('.pk-send[data-v="buddy"]').click();
    qnJobPick = 'Oak House'; $('qnJob').value = 'Oak House'; saveNoteFrom('askText');
    await pushRemote();
    const e = entries.find(x => x.id === id), up = JSON.parse(_up).entries.map(x => x.details);
    return e.vis === 'Eric' && e.pocketSent === true && !e.mine && up.includes('text the painter') && !up.some(x => /check the gutter/.test(x));
  }));
  await phil.ctx.close();

  ok('no page errors', errs.length === 0, errs.join(' | '));
  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close(); process.exit(fail ? 1 : 0);
})();
