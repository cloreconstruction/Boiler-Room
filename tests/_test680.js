// ✕📋 v6.80 — THE ✕ BLACK; THE BOARD, ROUND TWO. Eric: "i like the new gold X close window buttons but
// make the X black and then it's perfect. the board is looking good, next make it so i can edit the text
// and arrange the notes' order. also there should be more cube lights maybe? one saying that phil and the
// crew can see it and one that shows if its on the client page?"
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
    jobs = ['Shop / Admin', 'Mery', 'Hertz']; curJob = 'Mery'; crew = ['Phil']; entries = []; todos = []; nextId = 1; pendingQueue = []; prefs.pocket = []; prefs.pushSecret = '';
    window.scheduleSave = () => {}; window.savePendingSoon = () => {}; window.publishSharedNotes = () => {};
    lsSet('daylog-revtab', ''); _brdShow = ''; _brdOpen = ''; _brdSubFor = '';
    renderJobSelects(); closePanels(); renderAll();
    const ago = d => { const x = new Date(); x.setDate(x.getDate() - d); x.setHours(9, 0, 0, 0); return x; };
    const add = (type, details, job, extra) => addEntry(type, details, job, { noSniff: true, ...extra });
    window._e = {};
    _e.thought = add('Note', 'frame the deck this week', 'Mery', { ts: ago(0) });
    _e.shared = add('Note', 'ask Dale about the paint colour', 'Mery', { ts: ago(1), vis: 'Phil', sendTo: ['Phil'] });
    _e.onPage = add('Note', 'walls up, roof next', 'Mery', { ts: ago(2), jrn: true, jrnSent: '2026-09-10', jrnDone: true });
    _e.stamped = add('Note', 'windows are in', 'Mery', { ts: ago(3), jrn: true });
    todos.push({ id: 900, text: 'call the inspector', job: 'Mery', done: false, due: localDay(new Date(Date.now() + 2 * 86400000)), pri: 2, ts: new Date().toISOString() });
  });
  const order = () => page.evaluate(() => [...document.querySelectorAll('.bd-body[data-job="Mery"] .bd-line')].map(l => l.dataset.key));

  console.log('— ✕ v6.80 black on the gold plate —');

  ok('the ✕ window closer and the panel ✕ are black on their brass plates, in the light skin too', await page.evaluate(() => {
    prefs.skin = ''; applySkin(''); renderAll();
    openReview('summary');
    const x = $('revBox').querySelector('.win-x'), c = document.querySelector('.panel-close');
    const r = getComputedStyle(x).color === 'rgb(17, 17, 17)' && !!c && getComputedStyle(c).color === 'rgb(17, 17, 17)' && getComputedStyle(x).backgroundColor !== 'rgb(17, 17, 17)';
    closeReview(); return r;
  }));

  console.log('— 📋 v6.80 the words edit in the line —');

  ok('a closed line wears a ✎ hint; tapping the words turns them into a box right in the line, Enter saves', await page.evaluate(() => {
    openReview('board'); brdFold('Mery');   // v6.84 — headings open closed; open the one under test
    const id = _e.thought.id, line = () => document.querySelector(`.bd-line[data-key="e:${id}"]`);
    const hint = !!line().querySelector('.bd-hint');
    brdOpen('e', id);
    const inp = line().querySelector('input.bd-inline');
    const inLine = !!inp && inp.id === `brdEd-e-${id}` && inp.value === 'frame the deck this week' && !line().querySelector('.bd-t') && line().classList.contains('open');
    inp.value = 'frame the deck by Friday';
    inp.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    return hint && inLine && _e.thought.details === 'frame the deck by Friday' && /frame the deck by Friday/.test(line().querySelector('.bd-t').textContent) && !line().querySelector('input');
  }));

  console.log('— 📋 v6.80 arrange the order —');

  ok('to start, Mery reads priority first then newest: the to-do (2), then the notes newest first', await page.evaluate(() =>
    [...document.querySelectorAll('.bd-body[data-job="Mery"] .bd-line')].map(l => l.dataset.key).join(',') === `t:900,e:${_e.thought.id},e:${_e.shared.id},e:${_e.onPage.id},e:${_e.stamped.id}`));

  ok('⬇ Down on the to-do swaps it with the line under it, and stamps every line in the heading with its place', await page.evaluate(() => {
    brdOpen('t', '900');
    const row = document.querySelector('.bd-row[data-for="t:900"]');
    const up = [...row.querySelectorAll('.pick-chip')].find(b => /Up/.test(b.textContent)), down = [...row.querySelectorAll('.pick-chip')].find(b => /Down/.test(b.textContent));
    const topDisabled = up.disabled && !down.disabled;
    down.click();
    const keys = [...document.querySelectorAll('.bd-body[data-job="Mery"] .bd-line')].map(l => l.dataset.key);
    const t = todos.find(x => x.id === 900);
    return topDisabled && keys[0] === 'e:' + _e.thought.id && keys[1] === 't:900' && t.bOrd === 2 && _e.thought.board.ord === 1 && _e.shared.board.ord === 3 && _e.stamped.board.ord === 5;
  }));

  ok('⬆ Up moves a note over the one above; the hand-made order holds through a re-render and a priority tap', await page.evaluate(() => {
    brdOpen('e', _e.stamped.id);
    [...document.querySelector(`.bd-row[data-for="e:${_e.stamped.id}"]`).querySelectorAll('.pick-chip')].find(b => /Up/.test(b.textContent)).click();
    const a = [...document.querySelectorAll('.bd-body[data-job="Mery"] .bd-line')].map(l => l.dataset.key);
    brdPri('e', _e.stamped.id); brdPri('e', _e.stamped.id); brdPri('e', _e.stamped.id);   // HIGH — but it stays where he put it
    const b = [...document.querySelectorAll('.bd-body[data-job="Mery"] .bd-line')].map(l => l.dataset.key);
    return a[3] === 'e:' + _e.stamped.id && a[4] === 'e:' + _e.onPage.id && b.join(',') === a.join(',') && _e.stamped.board.p === 3;
  }));

  ok('a brand-new thought lands at the TOP of an arranged heading until he places it', await page.evaluate(() => {
    const e = addEntry('Note', 'pick up the permit', 'Mery', { noSniff: true });
    renderReview();
    const keys = [...document.querySelectorAll('.bd-body[data-job="Mery"] .bd-line')].map(l => l.dataset.key);
    brdShift('e', String(e.id), 1);
    const keys2 = [...document.querySelectorAll('.bd-body[data-job="Mery"] .bd-line')].map(l => l.dataset.key);
    return keys[0] === 'e:' + e.id && keys2[1] === 'e:' + e.id && e.board.ord === 2;
  }));

  ok('⇄ moving a placed line to another heading drops its place — it arrives at the top there', await page.evaluate(() => {
    brdMove('e', String(_e.stamped.id), 'Hertz');
    return _e.stamped.job === 'Hertz' && _e.stamped.board.ord == null && document.querySelector('.bd-body[data-job="Hertz"] .bd-line').dataset.key === 'e:' + _e.stamped.id;
  }));

  console.log('— 👷🏠 v6.80 the two lamps —');

  ok('a line Phil can see lights the 👷 lamp and the open row says CREW: Phil; a plain line stays unlit and says nobody yet', await page.evaluate(() => {
    const on = document.querySelector(`.bd-line[data-key="e:${_e.shared.id}"]`), off = document.querySelector(`.bd-line[data-key="e:${_e.thought.id}"]`);
    const lampOn = on.querySelectorAll('.bd-lamp')[0], lampOff = off.querySelectorAll('.bd-lamp')[0];
    brdOpen('e', _e.shared.id);
    const rowOn = document.querySelector(`.bd-row[data-for="e:${_e.shared.id}"]`).textContent;
    brdOpen('e', _e.thought.id);
    const rowOff = document.querySelector(`.bd-row[data-for="e:${_e.thought.id}"]`).textContent;
    return lampOn.classList.contains('on') && /crew can see it: Phil/.test(lampOn.title) && !lampOff.classList.contains('on') && /no crew phone/.test(lampOff.title) &&
      /👷 CREW: Phil/.test(rowOn) && /CREW: nobody yet/.test(rowOff);
  }));

  ok('a line that went out in a journal week lights the 🏠 lamp with the sent day; a stamped-but-waiting line is unlit and says STAMPED; a to-do has no lamps', await page.evaluate(() => {
    const pg = document.querySelector(`.bd-line[data-key="e:${_e.onPage.id}"]`).querySelectorAll('.bd-lamp')[1];
    const st = document.querySelector(`.bd-line[data-key="e:${_e.stamped.id}"]`).querySelectorAll('.bd-lamp')[1];
    brdOpen('e', _e.onPage.id);
    const row = document.querySelector(`.bd-row[data-for="e:${_e.onPage.id}"]`).textContent;
    return pg.classList.contains('on') && /ON THEIR PAGE — sent Sep 10/.test(pg.title) && !st.classList.contains('on') && /STAMPED/.test(st.title) &&
      /🏠 ON THEIR PAGE — sent Sep 10/.test(row) && document.querySelectorAll('.bd-line[data-key="t:900"] .bd-lamp').length === 0;
  }));

  ok('the lamps are small and still, and never colour alone — lit is a filled plate, unlit an outline, both with words', await page.evaluate(() => {
    const on = document.querySelector(`.bd-line[data-key="e:${_e.shared.id}"] .bd-lamp.on`), off = document.querySelector(`.bd-line[data-key="e:${_e.thought.id}"] .bd-lamp`);
    const a = getComputedStyle(on), b = getComputedStyle(off);
    return parseFloat(a.width) <= 20 && a.animationName === 'none' && a.backgroundColor !== b.backgroundColor && parseFloat(b.opacity) < 1 && on.getAttribute('aria-label') && off.getAttribute('aria-label');
  }));

  ok('nothing runs off the right edge with the lamps in the line', await page.evaluate(() => { const b = $('revBox'); const r = b.scrollWidth <= b.clientWidth; closeReview(); return r; }));

  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v6.80') && document.querySelector('footer').textContent.includes(APP_VER);
  }));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
