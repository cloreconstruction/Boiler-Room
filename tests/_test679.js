// 📋 v6.79 — THE BOARD. Eric: "anything added to the grinder should be able to just add thoughts to the
// grinder as i go and the summary list changes as i go and things get added under the right job or
// category … a super quick priority light … three cubes for each level of priority but keep those small
// and not flashing … arrange or edit the notes … a check box that phil or i can both touch … each
// category could have a sub category … each week the list will populate and get organized and i can
// move things and add priorities and add last minute things and alert phil." — "yes to all."
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
    window.scheduleSave = () => {}; window.savePendingSoon = () => {}; window.publishSharedNotes = () => { window._pubN = (window._pubN || 0) + 1; };
    lsSet('daylog-revtab', ''); _brdShow = ''; _brdOpen = ''; _brdSubFor = '';
    renderJobSelects(); closePanels(); renderAll();
    const ago = d => { const x = new Date(); x.setDate(x.getDate() - d); x.setHours(9, 0, 0, 0); return x; };
    const add = (type, details, job, extra) => addEntry(type, details, job, { noSniff: true, ...extra });
    window._e = {};
    _e.thought = add('Note', 'frame the deck this week', 'Mery', { ts: ago(0) });
    _e.hertz = add('Note', 'order the garage door', 'Hertz', { ts: ago(1) });
    _e.old = add('Note', 'from three weeks back', 'Mery', { ts: ago(21) });
    _e.oldTouched = add('Note', 'touched long ago', 'Mery', { ts: ago(30), board: { p: 1, sub: [], at: ago(30).toISOString() } });
    _e.text = add('Note', 'Text from Kevin: pouring at 8', 'Mery', { texted: true, tags: ['Kevin'], ts: ago(0) });
    _e.rcpt = add('Note', 'lumber package', 'Mery', { rcpt: true, category: 'Framing', ai: '💵 $1,000.00 🏪 Spenard', ts: ago(0) });
    _e.mail = add('Note', 'Email from Bob: invoice', '—', { mail: true, mailAddr: 'bob@x.com', mailSubj: 'invoice', tags: ['Bob'], ts: ago(0) });
    _e.priv = add('Note', 'dentist at 3', 'Mery', { personal: true, ts: ago(0) });
    _e.hours = add('Clock', 'shift', 'Hertz', { hours: 7.5, ts: ago(0) });
    _e.flush = add('Note', '🎒 Flushed — call the gravel guy', '—', { tags: ['pocket'], pocket: 'flushed', ts: ago(0) });
    _e.done = add('Note', '✓ screws for Hertz', 'Hertz', { tags: ['pocket'], pocket: 'done', ts: ago(0) });
    todos.push({ id: 900, text: 'call the inspector', job: 'Mery', done: false, due: localDay(new Date(Date.now() + 2 * 86400000)), pri: 2, ts: new Date().toISOString() });
    todos.push({ id: 901, text: 'already done thing', job: 'Mery', done: true, pri: 1, ts: new Date().toISOString() });
  });
  const keysIn = job => page.evaluate(j => [...document.querySelectorAll(`.bd-body[data-job="${j}"] .bd-line`)].map(l => l.dataset.key), job);
  const lit = key => page.evaluate(k => document.querySelectorAll(`.bd-line[data-key="${k}"] .bd-cube.on`).length, key);

  console.log('— 📋 v6.79 the third tab, and what is a line —');

  ok('the summaries page has three tabs now, BOARD wearing the open-line count; the plate and the SUMMARY button open where he was last', await page.evaluate(() => {
    openReview('board');
    const tabs = [...document.querySelectorAll('.rev-tab')].map(b => b.textContent.trim());
    return tabs.length === 3 && /BOARD · 5/.test(tabs[2]) && document.querySelector('.rev-tab.on').textContent.includes('BOARD') &&
      /openReview\('last'\)/.test(document.querySelector('#scRow .sc-btn:last-child').getAttribute('onclick')) && /openReview\('last'\)/.test($('summaryBtn').getAttribute('onclick')) &&
      getComputedStyle(document.querySelector('.rev-tabs')).gridTemplateColumns.split(' ').length === 3 &&
      [...document.querySelectorAll('.rev-tab')].every(b => b.getBoundingClientRect().height < 50);   // one line each — the count never wraps
  }));

  ok('headings are the jobs — the job on the clock first, GENERAL last — only the ones with lines', await page.evaluate(() =>
    [...document.querySelectorAll('.bd-hd')].map(h => h.dataset.job).join(',') === 'Mery,Hertz,—' && /GENERAL/.test(document.querySelector('.bd-hd[data-job="—"]').textContent)));

  ok('what is on: two fresh thoughts, an old line he touched, the pocket flush, the open to-do — five lines', await page.evaluate(() => {
    const keys = [...document.querySelectorAll('.bd-line')].map(l => l.dataset.key);
    return keys.length === 5 && keys.includes('e:' + _e.thought.id) && keys.includes('e:' + _e.hertz.id) && keys.includes('e:' + _e.oldTouched.id) && keys.includes('e:' + _e.flush.id) && keys.includes('t:900');
  }));

  ok('what is NOT: a three-week-old untouched note, a text, a receipt, an email, the clock, a done pocket note, a done to-do — and never a personal note, even if touched', await page.evaluate(() => {
    const keys = [...document.querySelectorAll('.bd-line')].map(l => l.dataset.key);
    const none = [_e.old, _e.text, _e.rcpt, _e.mail, _e.priv, _e.hours, _e.done].every(e => !keys.includes('e:' + e.id)) && !keys.includes('t:901');
    brdTouch(_e.priv); _e.priv.board.p = 3; renderReview();
    const stillNo = !boardOn(_e.priv) && ![...document.querySelectorAll('.bd-line')].some(l => l.dataset.key === 'e:' + _e.priv.id);
    return none && stillNo;
  }));

  ok('the pocket flush sits under GENERAL, stamp off the words, "🎒 flushed" in small print; the to-do shows its due day', await page.evaluate(() => {
    const f = document.querySelector(`.bd-line[data-key="e:${_e.flush.id}"]`), t = document.querySelector('.bd-line[data-key="t:900"]');
    return !!f && f.closest('.bd-body').dataset.job === '—' && /call the gravel guy/.test(f.querySelector('.bd-t').textContent) && !/Flushed —/.test(f.querySelector('.bd-t').textContent) && /🎒 flushed/.test(f.textContent) &&
      !!t && t.closest('.bd-body').dataset.job === 'Mery' && /📅 due/.test(t.textContent);
  }));

  console.log('— 📋 v6.79 the cubes —');

  ok('every heading opens CLOSED with its count (v6.84); a tap opens one', await page.evaluate(() =>
    [...document.querySelectorAll('.bd-body')].every(b => b.hidden) && [...document.querySelectorAll('.bd-hd')].every(h => /tap to open/.test(h.textContent) && h.getAttribute('aria-expanded') === 'false')));

  ok('the to-do at priority 2 shows two lit cubes; a fresh thought shows none; the cubes are small and still', await page.evaluate(() => {
    brdFold('Mery');   // open the one heading under test
    const c = document.querySelector('.bd-line[data-key="t:900"] .bd-cube'), cs = getComputedStyle(c);
    return document.querySelectorAll('.bd-line[data-key="t:900"] .bd-cube.on').length === 2 && document.querySelectorAll(`.bd-line[data-key="e:${_e.thought.id}"] .bd-cube.on`).length === 0 &&
      document.querySelectorAll('.bd-line[data-key="t:900"] .bd-cube').length === 3 && parseFloat(cs.width) <= 12 && cs.animationName === 'none' && /priority MED/.test(document.querySelector('.bd-line[data-key="t:900"] .bd-pri').getAttribute('aria-label'));
  }));

  ok('tapping the cubes climbs LOW → MED → HIGH → off, on the entry itself; HIGH sorts to the top and bolds', await page.evaluate(() => {
    const id = _e.thought.id, sel = `.bd-line[data-key="e:${id}"]`;
    brdPri('e', id); const a = _e.thought.board.p === 1 && document.querySelectorAll(sel + ' .bd-cube.on').length === 1;
    brdPri('e', id); brdPri('e', id); const b = _e.thought.board.p === 3 && document.querySelectorAll(sel + ' .bd-cube.on').length === 3 && document.querySelector(sel).classList.contains('hi') &&
      [...document.querySelectorAll('.bd-body[data-job="Mery"] .bd-line')][0].dataset.key === 'e:' + id && /1 high/.test(document.querySelector('.bd-hd[data-job="Mery"]').textContent);
    brdPri('e', id); const c = _e.thought.board.p === 0 && document.querySelectorAll(sel + ' .bd-cube.on').length === 0;
    return a && b && c;
  }));

  ok('within a job the order is priority first, then newest: the to-do (2), the touched old line (1), the fresh thought (0)', await page.evaluate(() =>
    [...document.querySelectorAll('.bd-body[data-job="Mery"] .bd-line')].map(l => l.dataset.key).join(',') === `t:900,e:${_e.oldTouched.id},e:${_e.thought.id}`));

  console.log('— 📋 v6.79 ✓, ✎, sub-lines, ⇄, and the add box —');

  ok('✓ takes a thought off the board — done by Eric, the entry still on the log — and Undo puts it back', await page.evaluate(() => {
    const id = _e.hertz.id;
    brdDone('e', id);
    const gone = !document.querySelector(`.bd-line[data-key="e:${id}"]`) && !!_e.hertz.board.done && _e.hertz.board.by === 'Eric' && entries.includes(_e.hertz) && /BOARD · 4/.test(document.querySelector('.rev-tab.on').textContent) && /Undo/.test($('toast').innerHTML);
    window._toastUndo();
    const back = !!document.querySelector(`.bd-line[data-key="e:${id}"]`) && !_e.hertz.board.done;
    return gone && back;
  }));

  ok('✓ on a to-do finishes the to-do itself (a Done entry on the log) and it leaves the board', await page.evaluate(() => {
    brdDone('t', 900);
    const t = todos.find(x => x.id === 900);
    return t.done === true && entries.some(e => e.type === 'Done' && e.todoRef === 900) && !document.querySelector('.bd-line[data-key="t:900"]');
  }));

  ok('tap the words: the row opens with the edit box, ✎ Save rewrites the entry\'s words and the log', await page.evaluate(() => {
    const id = _e.thought.id;
    brdOpen('e', id);
    const row = document.querySelector(`.bd-row[data-for="e:${id}"]`), inp = $(`brdEd-e-${id}`);
    const opened = !!row && !!inp && inp.value === 'frame the deck this week' && /PRIORITY —/.test(row.textContent);
    inp.value = 'frame the deck by Friday';
    brdEditSave('e', id);
    return opened && _e.thought.details === 'frame the deck by Friday' && /frame the deck by Friday/.test(document.querySelector(`.bd-line[data-key="e:${id}"] .bd-t`).textContent) && !document.querySelector(`.bd-row[data-for="e:${id}"]`);
  }));

  ok('a sub-line: ➕ opens a box under the line, the sub-line lands indented with its own ○, and its ✓ strikes it through', await page.evaluate(() => {
    const id = _e.thought.id;
    brdOpen('e', id); brdSubAdd(id);
    const box = $('brdSubIn'); if (!box) return false;
    box.value = 'get the 2x6s'; brdSubSave(id);
    const sub = document.querySelector(`.bd-line[data-key="e:${id}"] + .bd-sub`);
    const a = _e.thought.board.sub.length === 1 && _e.thought.board.sub[0].t === 'get the 2x6s' && !!sub && /get the 2x6s/.test(sub.textContent) && sub.querySelector('.bd-ck').textContent === '○';
    brdSubDone(id, 0);
    const sub2 = document.querySelector(`.bd-line[data-key="e:${id}"] + .bd-sub`);
    return a && !!_e.thought.board.sub[0].done && sub2.classList.contains('done') && sub2.querySelector('.bd-ck').textContent === '✓';
  }));

  ok('⇄ moves a line to another job — the entry\'s job changes, it shows under the new heading', await page.evaluate(() => {
    const id = _e.thought.id;
    brdMove('e', id, 'Hertz');
    return _e.thought.job === 'Hertz' && document.querySelector(`.bd-line[data-key="e:${id}"]`).closest('.bd-body').dataset.job === 'Hertz';
  }));

  ok('the add box: a last-minute thing on the board AND on the log, under the job he picked', await page.evaluate(() => {
    $('brdIn').value = 'buy shims'; $('brdJob').value = 'Hertz';
    brdAdd();
    const e = entries[0];
    return e.details === 'buy shims' && e.job === 'Hertz' && e.type === 'Note' && !!e.board && $('brdIn').value === '' && document.querySelector(`.bd-line[data-key="e:${e.id}"]`).closest('.bd-body').dataset.job === 'Hertz';
  }));

  ok('one heading open at a time: opening Hertz closes Mery; tapping Hertz again closes it', await page.evaluate(() => {
    brdFold('Hertz');
    const one = !document.querySelector('.bd-body[data-job="Hertz"]').hidden && document.querySelector('.bd-body[data-job="Mery"]').hidden && document.querySelector('.bd-hd[data-job="Hertz"]').getAttribute('aria-expanded') === 'true';
    brdFold('Hertz');
    const closed = document.querySelector('.bd-body[data-job="Hertz"]').hidden && /tap to open/.test(document.querySelector('.bd-hd[data-job="Hertz"]').textContent);
    brdFold('Mery');
    return one && closed;
  }));

  console.log('— 👷 v6.79 Phil: alert him, and his ✓ comes back —');

  ok('👷 Phil on a line puts it on his phone (sendTo + vis), pushes generic words with no name and no dollars, and shows on the line; tap again takes it back', await page.evaluate(async () => {
    const id = _e.thought.id; prefs.pushSecret = 'sec'; window._pushes = [];
    const realFetch = window.fetch;
    window.fetch = (u, o) => { if (/functions\/notify/.test(String(u))) { window._pushes.push(JSON.parse(o.body)); return Promise.resolve({ ok: true }); } return realFetch(u, o); };
    brdOpen('e', id);
    const chip = [...document.querySelectorAll(`.bd-row[data-for="e:${id}"] .pick-chip`)].find(b => /Phil/.test(b.textContent));
    if (!chip) { window.fetch = realFetch; return false; }
    chip.click(); await new Promise(r => setTimeout(r, 20));
    const sent = Array.isArray(_e.thought.sendTo) && _e.thought.sendTo.includes('Phil') && _e.thought.vis === 'Phil' && (window._pubN || 0) > 0 &&
      window._pushes.length === 1 && window._pushes[0].tag === 'board' && !/Phil|\$|\d{3}/.test(window._pushes[0].title + ' ' + window._pushes[0].body) &&
      document.querySelector(`.bd-line[data-key="e:${id}"] .bd-lamp`).classList.contains('on');   // v6.80 — the line is open (its words are a box), so the 👷 lamp is what shows it on the line
    const bits = brdShareBits(_e.thought);
    const rides = bits.board && bits.board.p === 0 && bits.board.sub.length === 1 && bits.board.sub[0].t === 'get the 2x6s' && bits.board.sub[0].done === true && bits.boardDone === undefined;
    if (_brdOpen !== 'e:' + id) brdOpen('e', id);   // the row stayed open through the re-render
    const chip2 = [...document.querySelectorAll(`.bd-row[data-for="e:${id}"] .pick-chip`)].find(b => /Phil/.test(b.textContent));
    if (!chip2) { window.fetch = realFetch; return false; }
    chip2.click();
    const back = !_e.thought.sendTo && !_e.thought.vis;
    window.fetch = realFetch; prefs.pushSecret = '';
    return sent && rides && back;
  }));

  ok('a personal note can never be sent to a crew phone from the board', await page.evaluate(() => {
    brdCrew(String(_e.priv.id), 'Phil');
    return !_e.priv.sendTo && !_e.priv.vis;
  }));

  ok('Phil\'s ✓ rides back through the crew log: the line is done BY PHIL and leaves Eric\'s board', await page.evaluate(async () => {
    const id = _e.hertz.id;
    dbx.refreshToken = 'tok';
    window.dbxRpc = async (ep, arg) => ep === 'files/list_folder' ? { entries: [{ '.tag': 'folder', name: 'Phil', path_lower: '/clore daylog/crew/phil' }] } : {};
    window.dbxDownload = async p => /crew\/phil\/app data\/entries\.json$/.test(String(p)) ? JSON.stringify({ entries: [{ id: 77, ts: new Date().toISOString(), type: 'Note', details: '✓ DONE: order the garage door', job: 'Hertz', vis: 'Eric', boardRef: id }] }) : null;
    await checkCrewLogs();
    const line = document.querySelector(`.bd-line[data-key="e:${id}"]`);
    return !!_e.hertz.board && !!_e.hertz.board.done && _e.hertz.board.by === 'Phil' && !line && !boardOn(_e.hertz) && pendingQueue.some(p => p.kind === 'crew' && /✓ DONE: order the garage door/.test(p.payload.text));
  }));

  ok('the tab he was on is remembered: close, open the plate\'s way — the board again', await page.evaluate(() => {
    revTab('board'); closeReview();
    openReview('last');
    const a = _revTab === 'board' && document.querySelector('.rev-tab.on').textContent.includes('BOARD') && lsGet('daylog-revtab') === 'board';
    revTab('summary'); closeReview(); openReview('last');
    const b = _revTab === 'summary';
    closeReview(); return a && b;
  }));

  ok('nothing runs off the right edge of the board', await page.evaluate(() => { openReview('board'); const b = $('revBox'); const r = b.scrollWidth <= b.clientWidth; closeReview(); return r; }));

  // ── the crew phone ──
  console.log('— 👷 v6.79 on Phil\'s phone —');
  const ctx2 = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const p2 = await ctx2.newPage();
  const errs2 = []; p2.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs2.push(e.message); });
  await p2.addInitScript(() => { try { localStorage.setItem('daylog-crew-name', 'Phil'); localStorage.removeItem('daylog-board-done'); } catch (e) {} });
  await p2.goto(appUrl); await p2.waitForTimeout(700);
  ok('FROM ERIC shows the line with its cubes and sub-line, and a ✓ Done — tell Eric he can touch', await p2.evaluate(() => {
    window.scheduleSave = () => {}; entries = []; nextId = 1; jobs = ['Mery']; curJob = 'Mery';
    crewShared = [{ id: 5, ts: new Date().toISOString(), text: 'frame the deck by Friday', job: 'Mery', direct: true, toAll: false, board: { p: 2, sub: [{ t: 'get the 2x6s', done: false }] } },
      { id: 6, ts: new Date().toISOString(), text: 'a plain note from Eric', job: 'Mery', direct: true }];
    renderCrewShared();
    const card = $('crewSharedCard'), t = $('crewSharedList').textContent;
    const rowFive = [...$('crewSharedList').querySelectorAll('.sum-row')].find(r => /frame the deck/.test(r.textContent));
    const rowSix = [...$('crewSharedList').querySelectorAll('.sum-row')].find(r => /plain note/.test(r.textContent));
    return CREW_NAME === 'Phil' && card.style.display !== 'none' && !!rowFive && rowFive.querySelectorAll('.bd-cube.on').length === 2 && /get the 2x6s/.test(rowFive.textContent) &&
      !![...rowFive.querySelectorAll('button')].find(b => /✓ Done — tell Eric/.test(b.textContent)) && !!rowSix && ![...rowSix.querySelectorAll('button')].find(b => /tell Eric/.test(b.textContent));
  }));
  ok('his ✓ writes a note for Eric carrying the line\'s id, and the chip turns to ✓ DONE', await p2.evaluate(() => {
    const rowFive = [...$('crewSharedList').querySelectorAll('.sum-row')].find(r => /frame the deck/.test(r.textContent));
    [...rowFive.querySelectorAll('button')].find(b => /tell Eric/.test(b.textContent)).click();
    const e = entries[0];
    const row2 = [...$('crewSharedList').querySelectorAll('.sum-row')].find(r => /frame the deck/.test(r.textContent));
    return !!e && /^✓ DONE: frame the deck/.test(e.details) && String(e.boardRef) === '5' && e.vis === 'Eric' && e.job === 'Mery' && /✓ DONE/.test(row2.textContent) && ![...row2.querySelectorAll('button')].find(b => /tell Eric/.test(b.textContent));
  }));
  ok('a line Eric marked done shows ✓ DONE — Eric on the crew phone, no button', await p2.evaluate(() => {
    crewShared = [{ id: 9, ts: new Date().toISOString(), text: 'hang the door', job: 'Mery', direct: true, board: { p: 1, sub: [] }, boardDone: 'Eric' }];
    renderCrewShared();
    const row = $('crewSharedList').querySelector('.sum-row');
    return /✓ DONE — Eric/.test(row.textContent) && !row.querySelector('button[onclick^="crewBoardDone"]');
  }));
  ok('no page errors on the crew phone', errs2.length === 0, errs2.join(' | '));
  await ctx2.close();

  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v6.79') && document.querySelector('footer').textContent.includes(APP_VER);
  }));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
