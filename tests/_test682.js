// 🎒📋 v6.82 — THE POCKET AND THE GRINDER LAND IN THE SAME PLACE. Eric: "When I make a pocket item, it just goes
// into general notes. And then, when I check it off as done, it goes to the board. Is that correct? … if I'm adding
// things to the grinder or to the pocket list, I need it all to end up in the same place. When I ask for a summary
// or ask the wizard a question, the pocket checklist affects that."
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
    jobs = ['Shop / Admin', 'Mery', 'Hertz']; curJob = ''; crew = ['Phil']; entries = []; todos = []; nextId = 1; pendingQueue = []; prefs.pocket = []; prefs.pocketMax = 8;
    window.scheduleSave = () => {}; window.savePendingSoon = () => {}; window.publishSharedNotes = () => {};
    lsSet('daylog-revtab', ''); _brdShow = ''; _brdOpen = ''; _brdSubFor = '';
    renderJobSelects(); closePanels(); renderAll();
    addEntry('Note', 'frame the deck by Friday', 'Mery', { noSniff: true });
    pocketAdd('gravel for the drive'); pocketAdd('screws for Hertz');
  });

  console.log('— 🎒 v6.82 an open pocket item is a board line —');

  ok('the two open pocket items sit on the board under GENERAL, marked 🎒 pocket · today, beside the grinder thought under Mery; the tab counts all three', await page.evaluate(() => {
    openReview('board');
    const gen = [...document.querySelectorAll('.bd-body[data-job="—"] .bd-line')];
    const keys = gen.map(l => l.dataset.key);
    const items = pocket();
    return gen.length === 2 && items.every(it => keys.includes('p:' + it.id)) && gen.every(l => /🎒 pocket · today/.test(l.textContent)) &&
      !!document.querySelector(`.bd-line[data-key="e:${entries[0].id}"]`) && /BOARD · 3/.test(document.querySelector('.rev-tab.on').textContent) &&
      gen.every(l => l.querySelectorAll('.bd-lamp').length === 0) && /gravel for the drive/.test($('pocketList').textContent);
  }));

  ok('the pocket list on the main page and the board show the same items — one place, two views', await page.evaluate(() => {
    const onBoard = [...document.querySelectorAll('.bd-line[data-key^="p:"] .bd-t')].map(s => s.textContent.replace(/ — .*$/, '').replace(/ ✎$/, '').trim()).sort();
    const onList = [...$('pocketList').querySelectorAll('.pk-t')].map(s => s.textContent.trim()).sort();
    return onBoard.join('|') === onList.join('|') && onBoard.length === 2;
  }));

  ok('the cubes on a pocket item ride on the item itself and show on the board after a re-render', await page.evaluate(() => {
    const it = pocket().find(x => x.t === 'gravel for the drive');
    brdPri('p', it.id); brdPri('p', it.id);
    return it.p === 2 && document.querySelectorAll(`.bd-line[data-key="p:${it.id}"] .bd-cube.on`).length === 2;
  }));

  ok('✎ on a pocket line rewrites the pocket item; a pocket line offers no sub-line and no crew plates', await page.evaluate(() => {
    const it = pocket().find(x => x.t === 'gravel for the drive');
    brdOpen('p', it.id);
    const row = document.querySelector(`.bd-row[data-for="p:${it.id}"]`);
    const noSub = row && ![...row.querySelectorAll('.pick-chip')].some(b => /sub-line/.test(b.textContent)) && ![...row.querySelectorAll('.pick-chip')].some(b => /Phil/.test(b.textContent));
    const inp = $(`brdEd-p-${it.id}`); inp.value = 'gravel for the drive — 3 yards';
    brdEditSave('p', it.id);
    return noSub && it.t === 'gravel for the drive — 3 yards' && /3 yards/.test($('pocketList').textContent) && /3 yards/.test(document.querySelector(`.bd-line[data-key="p:${it.id}"]`).textContent);
  }));

  ok('✓ on the board is the pocket\'s own ✓: a ✓ note on the log, off the list, off the board — and Undo puts it back', await page.evaluate(() => {
    const it = pocket().find(x => x.t === 'screws for Hertz');
    const n = entries.length;
    brdDone('p', it.id);
    const gone = !pocket().some(x => x.id === it.id) && !document.querySelector(`.bd-line[data-key="p:${it.id}"]`) && entries.length === n + 1 && entries[0].pocket === 'done' && entries[0].details === '✓ screws for Hertz' && !/screws for Hertz/.test($('pocketList').textContent) && /Undo/.test($('toast').innerHTML);
    window._toastUndo();
    const back = pocket().some(x => x.t === 'screws for Hertz') && entries.length === n && !!document.querySelector('.bd-line[data-key^="p:"]') && /screws for Hertz/.test($('pocketList').textContent);
    return gone && back;
  }));

  ok('⇄ Put it on a job turns a pocket item into a grinder note on that job — on the log, on the board under the job, off the pocket', await page.evaluate(() => {
    const it = pocket().find(x => x.t === 'screws for Hertz');
    brdOpen('p', it.id);
    const sel = document.querySelector(`.bd-row[data-for="p:${it.id}"] select`);
    const wheel = sel && /Put it on a job/.test(sel.options[0].textContent) && ![...sel.options].some(o => /GENERAL/.test(o.textContent));
    brdMove('p', it.id, 'Hertz');
    const e = entries[0];
    return wheel && !pocket().some(x => x.id === it.id) && e.details === 'screws for Hertz' && e.job === 'Hertz' && !!e.board && document.querySelector(`.bd-line[data-key="e:${e.id}"]`).closest('.bd-body').dataset.job === 'Hertz' && !/screws for Hertz/.test($('pocketList').textContent);
  }));

  ok('⬆ ⬇ place a pocket item like any line, and the place sticks to the item', await page.evaluate(() => {
    pocketAdd('blue tape');
    renderReview();
    const it = pocket().find(x => x.t === 'blue tape'), other = pocket().find(x => x.t !== 'blue tape');   // other = gravel, priority 2 — unplaced lines sort by priority first
    const before = [...document.querySelectorAll('.bd-body[data-job="—"] .bd-line')].map(l => l.dataset.key);
    brdShift('p', it.id, -1);   // ⬆ the new one over the priority one
    const after = [...document.querySelectorAll('.bd-body[data-job="—"] .bd-line')].map(l => l.dataset.key);
    return before[0] === 'p:' + other.id && before[1] === 'p:' + it.id && after[0] === 'p:' + it.id && it.bOrd === 1 && other.bOrd === 2;
  }));

  console.log('— 🧙 v6.82 the Wizard sees one pocket, not two —');

  ok('the open pocket items ride once, under POCKET LIST — not again under BOARD — OPEN LINES; the grinder thought rides under the board', await page.evaluate(() => {
    const c = buildAskContext('what is on my list');
    const pl = c.split('POCKET LIST')[1].split('\n')[0], bo = c.split('BOARD — OPEN LINES')[1].split('\n')[0];
    return /gravel for the drive/.test(pl) && /blue tape/.test(pl) && !/gravel for the drive/.test(bo) && !/blue tape/.test(bo) && /frame the deck by Friday/.test(bo) && /screws for Hertz/.test(bo);
  }));

  ok('the summary tab still lists the live pocket under TO GET, and nothing runs off the edge', await page.evaluate(() => {
    revTab('summary');
    const t = document.querySelector('.rev-sec-body[data-sec="get"]').textContent;
    const r = /gravel for the drive/.test(t) && /blue tape/.test(t) && $('revBox').scrollWidth <= $('revBox').clientWidth;
    closeReview(); return r;
  }));

  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v6.82') && document.querySelector('footer').textContent.includes(APP_VER);
  }));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
