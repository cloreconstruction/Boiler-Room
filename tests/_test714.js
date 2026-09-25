// 🎒📐 v7.14 — FOUR OF ERIC'S ASKS. "When I click Summary, just under Needs You is the Pocket List, which I like. But instead, I
// want the pocket not done, just under the needs you." · "Phil and crew don't need to see what they look at on the project portal.
// And not the copy link either." · "On the journals, we have: work notes, hours on site, photo count, money moved. I don't think
// we need any of that. We only need the draft it for me because it already knows where to pull it from." · "At the bottom of the
// journal editing page, it tells the week, says 'Edited,' and has an edit button and a take back button, but they don't really
// fit on there very well. Make sure all the take back buttons are in a line and all the edit buttons are in a line."
// Names and figures here are made up.
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

  await page.evaluate(() => {
    jobs = ['Oak House']; crew = ['Phil']; prefs.office = ['Phil']; entries = []; todos = []; nextId = 1; pendingQueue = [];
    window.scheduleSave = () => {}; window.savePendingSoon = () => {}; window.publishSharedNotes = () => {};
    renderJobSelects(); closePanels(); renderAll();
    dbx.refreshToken = 'tok';
  });

  console.log('— 🎒 v7.14 the summary: POCKET — not done right under NEEDS YOU —');
  const sum = await page.evaluate(() => {
    const now = new Date();
    prefs.pocket = [{ id: 'p1', t: 'buy blue tape', day: localDay(now), ts: now.toISOString() }];
    entries.unshift({ id: 900, ts: new Date(Date.now() - 86400000), type: 'Note', details: '🎒 Flushed — call the gravel guy', job: '—', pocket: 'flushed', tags: ['pocket'] });
    openReview('summary');
    const keys = [...document.querySelectorAll('.rev-sec')].map(b => b.dataset.sec).join(',');
    const open = [...document.querySelectorAll('.rev-sec-body')].filter(b => !b.hidden).map(b => b.dataset.sec).join();
    closeReview();
    return { keys, open };
  });
  ok('the headings read NEEDS YOU · POCKET — not done · POCKET LIST · PEOPLE · … (the leftovers lead now)', sum.keys === 'need,pocket,get,people,money,photos,wizard,sched,logan,record', sum.keys);
  ok('with leftovers waiting, the page opens on POCKET — not done', sum.open === 'pocket', sum.open);
  ok('with no leftovers, it opens on the POCKET LIST as before', await page.evaluate(() => {
    entries = entries.filter(e => e.id !== 900); openReview('summary');
    const open = [...document.querySelectorAll('.rev-sec-body')].filter(b => !b.hidden).map(b => b.dataset.sec).join();
    closeReview(); prefs.pocket = []; return open === 'get';
  }));

  console.log('— 🏠 v7.14 the portal: Copy link and What they look at are Eric\'s alone —');
  const pf = await page.evaluate(async () => {
    _portalIdx = { clients: [{ key: 'oak', job: 'Oak House', code: 'oak-111aaa' }] };
    window.dbxDownload = async p => /index\.json$/.test(p) ? JSON.stringify(_portalIdx) : null;
    openPortalWin(); _portalOpen = 0; await renderPortalList();
    const txt = b => b.textContent.replace(/\s+/g, ' ').trim();
    const acts = [...document.querySelectorAll('#portalList .pf-acts .btn-ghost')];
    const r = { dashed: acts.filter(b => b.classList.contains('only-me')).map(txt), plain: acts.filter(b => !b.classList.contains('only-me')).map(txt) };
    closePortalWin(); return r;
  });
  ok('on Eric\'s portal 📋 Copy link and 📊 What they look at now wear the dashed only-you edge', pf.dashed.includes('📋 Copy link') && pf.dashed.includes('📊 What they look at'), JSON.stringify(pf.dashed));
  ok('what Phil gets stays plain: Plans · Journal · Build List · View as this client', pf.plain.join('|') === '📐 Plans|📖 Journal|📋 Build List|👁 View as this client', pf.plain.join('|'));

  console.log('— ✍ v7.14 the journal: no switches, the draft knows where to pull from —');
  const jr = await page.evaluate(async () => {
    const ago = d => new Date(Date.now() - d * 86400000);
    entries.push(
      { id: 301, ts: ago(2), type: 'Note', details: 'Set the roof trusses', job: 'Oak House' },
      { id: 302, ts: ago(3), type: 'Note', details: 'Stamped: window rough-in passed', job: 'Oak House', jrn: true },
      { id: 303, ts: ago(1), type: 'Clock', details: 'Clocked out', job: 'Oak House', hours: 9.5 },
      { id: 304, ts: ago(1), type: 'Expense', details: 'Lumber run', job: 'Oak House', amount: 512.34 },
      { id: 305, ts: ago(1), type: 'Photo', details: 'framing photo', job: 'Oak House', photoPath: '/p/f.jpg' });
    prefs.journalPrefs = { 'oak-111aaa': { notes: true, hours: true, photos: true, money: true } };   // the old saved picks, all on
    const page = { name: 'Oak House', journal: [
      { week: 'Sep 21', text: 'Roof on.', photos: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k'], edited: true, released: '2026-09-21' },
      { week: 'Sep 14', text: 'Walls up.', released: '2026-09-14' },
      { week: 'Sep 7', text: 'Floor done.', photos: ['x'], released: '2026-09-07' }] };
    window.dbxDownload = async p => /oak-111aaa\.json$/.test(p) ? JSON.stringify(page) : /index\.json$/.test(p) ? JSON.stringify(_portalIdx) : null;
    await openJournal(0);
    for (let i = 0; i < 30 && !document.querySelector('.jrn-rel-row'); i++) await new Promise(r => setTimeout(r, 30));
    const t = $('revBox').textContent;
    const draft = journalDraft('Oak House', 'oak-111aaa');
    return { chips: /work notes|hours on site|photo count|money moved/.test(t), btn: [...document.querySelectorAll('#revBox button')].some(b => /Draft it for me/.test(b.textContent)), draft };
  });
  ok('the four switches are gone — no work notes · hours on site · photo count · money moved', !jr.chips);
  ok('✍ Draft it for me is still there', jr.btn);
  ok('the draft pulls the stamped note and the week\'s work notes', /window rough-in passed/.test(jr.draft) && /Set the roof trusses/.test(jr.draft), jr.draft);
  ok('…and never an hours tally, a photo count or raw money — even where the old saved picks had them on', !/Crew hours on site|Progress photos taken|Materials & subs paid|512/.test(jr.draft), jr.draft);

  console.log('— 📐 v7.14 the weeks on their page: every ✎ Edit in one column, every ↩ Take back in another —');
  const geo = () => page.evaluate(() => {
    const rows = [...document.querySelectorAll('.jrn-rel-row')];
    const r = x => x.getBoundingClientRect();
    return rows.map(row => ({ txt: row.querySelector('.sum-title').textContent, ed: r(row.querySelector('.jrn-rel-ed')), back: r(row.querySelector('.jrn-rel-back')), over: row.scrollWidth > row.clientWidth + 1, backTxt: row.querySelector('.jrn-rel-back').textContent.trim() }))
      .map(x => ({ txt: x.txt, edL: Math.round(x.ed.left), edW: Math.round(x.ed.width), bkL: Math.round(x.back.left), bkW: Math.round(x.back.width), over: x.over, backTxt: x.backTxt }));
  });
  const g = await geo();
  ok('three weeks listed, one of them long ("📷 11 · ✎ edited")', g.length === 3 && /📷 11 · ✎ edited/.test(g[0].txt), JSON.stringify(g));
  ok('all three ✎ Edit buttons stand in one straight column, the same width', new Set(g.map(x => x.edL)).size === 1 && new Set(g.map(x => x.edW)).size === 1, JSON.stringify(g.map(x => [x.edL, x.edW])));
  ok('all three ↩ Take back buttons stand in one straight column, the same width, right of Edit', new Set(g.map(x => x.bkL)).size === 1 && new Set(g.map(x => x.bkW)).size === 1 && g[0].bkL > g[0].edL, JSON.stringify(g.map(x => [x.bkL, x.bkW])));
  ok('nothing runs off the row on a phone', g.every(x => !x.over));
  const armed = await page.evaluate(async () => { await jrnRetract(1); await new Promise(r => setTimeout(r, 120)); return true; }) && await geo();
  ok('the first tap on Take back arms it in words — ⚠ SURE? Tap again — and it stays in its column', armed[1].backTxt === '⚠ SURE? Tap again' && armed[1].bkL === g[1].bkL && armed[1].bkW === g[1].bkW && !armed[1].over, JSON.stringify(armed[1]));

  ok('no page errors', errs.length === 0, errs.join(' | '));
  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close(); process.exit(fail ? 1 : 0);
})();
