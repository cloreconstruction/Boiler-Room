// v7.20 — (1) Eric: "the picked, ordered, received buttons, etc. When you click scheduled, but previous lights were not lit, it
// should light them all. And it should go both ways. If you advance a light by skipping one, it should light that one up, and if
// you de-advance it, it should go the other way too. And each light change should be a click and then a second click, because if
// any lights accidentally get changed, it could be missed or skipped on an order." (2) "I think the grinder should be labeled like
// the pocket list window is labeled. The running log is labeled. That will help separate the beginning of the grinder step 1 from
// everything else, like the pocket list." Every name here is made up.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { fileURLToPath } = require('url');
(async () => {
  const appUrl = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const repo = path.dirname(fileURLToPath(appUrl));
  const src = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await ctx.route(u => !/^file:/.test(u.href), r => r.abort());
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
  await page.goto(appUrl); await page.waitForTimeout(700);
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };

  console.log('— ⚙️ (2) the grinder wears its name —');
  const g = await page.evaluate(() => {
    const t = $('grinderTitle'), card = $('qnCard'), pk = document.querySelector('#pocketCard .pk-title');
    const cs = getComputedStyle(t), ps = getComputedStyle(pk), s1 = document.querySelector('#qnCard .g-step[data-step="1"]').getBoundingClientRect();
    return { first: card.firstElementChild === t, words: t.textContent.trim(), same: cs.fontSize === ps.fontSize && cs.fontWeight === ps.fontWeight && cs.letterSpacing === ps.letterSpacing,
      above: t.getBoundingClientRect().bottom <= s1.top, inCard: t.getBoundingClientRect().top >= card.getBoundingClientRect().top,
      box: $('askText').getBoundingClientRect().top + scrollY, wiz: $('wizSideBtn').getBoundingClientRect().bottom };
  });
  ok('the grinder\'s card opens with its own name — ⚙️ GRINDER — in the pocket list\'s own lettering, above ① PICK THE JOB', g.first && g.words === '⚙️ GRINDER' && g.same && g.above && g.inCard, JSON.stringify(g));
  ok('…and the writing box and the Wizard plate still fit the first phone screen (v6.12)', g.box < 600 && g.wiz < 800, JSON.stringify(g));

  await page.evaluate(async () => {
    jobs = ['Oak House']; crew = ['Phil']; entries = []; todos = []; nextId = 1; pendingQueue = [];
    window.scheduleSave = () => {}; window.savePendingSoon = () => {}; window.publishSharedNotes = () => {};
    renderJobSelects(); closePanels(); renderAll();
    dbx.refreshToken = 't'; _portalIdx = { clients: [{ key: 'oak', job: 'Oak House', code: 'oak-111aaa' }] };
    window._dbxFiles = {}; window.dbxDownload = async p => (window._dbxFiles || {})[p] ?? null; window.dbxUpload = async (p, b) => { window._dbxFiles[p] = b; return {}; };
    _dbxFiles[portalRoot() + '/materials-office-oak-111aaa.json'] = JSON.stringify({ full: true, seq: 9, rooms: [
      { name: 'KITCHEN', items: [
        { id: 'l1', n: 'Faucet', t: 'Misc', buy: true, s: 'pick' },
        { id: 'l2', n: 'Hood', t: 'Misc', buy: true, s: 'arrived' },
        { id: 'l3', n: 'Tile', t: 'Misc', hm: true, s: 'pick' },
        { id: 'l4', n: 'Old schedule with a long name that wraps', t: 'Misc', buy: true, s: 'pick', sch: true }] },
      { name: 'GARAGE', items: [
        { id: 'c1', n: 'Test vents', t: 'Misc', s: 'todo' },
        { id: 'c2', n: 'Test winch', t: 'Misc', s: 'todo', kids: [{ n: 'grease it' }] },
        { id: 'c3', n: 'Sweep out', t: 'Misc', s: 'todo' }] }] });
    await openMaterials(0);
    window._it = id => _matD.rooms.flatMap(r => r.items).find(x => x.id === id);
    window._rowId = id => document.querySelector('#revBox .mat-item[data-id="' + id + '"]');
    window._boxes = (id, host) => [...(host || _rowId(id)).querySelectorAll('.mat-strip:not(.mat-rowbtns) .mat-box')];
    window._box = (id, k, host) => _boxes(id, host)[matBoxes(_it(id)).map(b => b[0]).indexOf(k)];
    window._marks = (id, host) => _boxes(id, host).map(x => x.classList.contains('armed') ? 'a' : x.classList.contains('will') ? 'w' : '-').join('');
    window._lit = (id, host) => _boxes(id, host).map(x => x.getAttribute('aria-pressed') === 'true' ? 1 : 0).join('');
    window._say = (id, host) => (((host || _rowId(id)).querySelector('.mat-arm-say')) || {}).textContent ? (host || _rowId(id)).querySelector('.mat-arm-say').textContent.replace(/\s+/g, ' ').trim() : '';
    window._said = []; const t0 = window.toast; window.toast = (m, g) => { if (m) _said.push(String(m)); return t0(m, g); };
  });

  console.log('— 🔗 (1) one chain, two taps —');
  const armS = await page.evaluate(() => {
    _box('l1', 'S').click();
    const it = _it('l1'), b = _box('l1', 'S'), w = _box('l1', 'P');
    return { s: it.s || 'pick', sch: !!it.sch, chg: (it.chg || []).length, armed: b.classList.contains('armed'), face: b.textContent.replace(/\s+/g, ''), label: b.getAttribute('aria-label'),
      marks: _marks('l1'), say: _say('l1'), edge: getComputedStyle(b).borderTopStyle + ' ' + getComputedStyle(b).borderTopWidth, dash: getComputedStyle(w).outlineStyle, wlabel: w.getAttribute('aria-label') };
  });
  ok('ONE tap on 📅 S only ARMS it — nothing changes; the plate reads ⚠ sure? with a solid edge, and its label says what the second tap will do', armS.s === 'pick' && !armS.sch && armS.chg === 0 && armS.armed && armS.face === '⚠sure?' && /^solid 2(\.5)?px$/.test(armS.edge) && armS.label === 'Scheduled — tap again to light Picked, Ordered, Received, Scheduled', JSON.stringify(armS));
  ok('…every plate the second tap would change wears a dashed edge (and says so in its label), and a line under the row says it in words', armS.marks === 'wwwa-' && armS.dash === 'dashed' && armS.wlabel === 'Picked — lights with the next tap' &&
    armS.say === '⚠ SURE? Tap 📅 Scheduled again to light 👆 Picked · 🛒 Ordered · 📦 Received · 📅 Scheduled — or leave it and nothing changes.', JSON.stringify(armS));

  ok('the SECOND tap does it: scheduled with nothing before it lit lights them all — picked, ordered (dated), received, scheduled; the ⚠ and the line are gone; ONE line in the row\'s changes', await page.evaluate(() => {
    _box('l1', 'S').click();
    const it = _it('l1'), c = it.chg || [], r = _rowId('l1');
    return it.s === 'arrived' && it.sch === true && !it.ins && !!it.odate && _lit('l1') === '11110' && _marks('l1') === '-----' && !r.querySelector('.mat-arm-say') &&
      c.length === 1 && c[0].f === 'lights' && c[0].from === 'none lit' && c[0].to === 'Picked · Ordered · Received · Scheduled';
  }));

  ok('it goes the other way too: turning 🛒 Ordered off (two taps) turns off everything after it — received and scheduled — and says so first', await page.evaluate(() => {
    _box('l1', 'O').click();
    const mid = _it('l1').s === 'arrived' && _it('l1').sch === true && _marks('l1') === '-aww-' && _say('l1') === '⚠ SURE? Tap 🛒 Ordered again to turn off 🛒 Ordered · 📦 Received · 📅 Scheduled — or leave it and nothing changes.';
    _box('l1', 'O').click();
    const it = _it('l1');
    return mid && it.s === 'picked' && !it.sch && !it.schd && _lit('l1') === '10000' && it.chg[it.chg.length - 1].to === 'Picked';
  }));

  ok('a tap on ANOTHER light moves the ⚠ there with nothing changed, and left alone the ⚠ lets go by itself after five seconds — nothing changed', await page.evaluate(async () => {
    _box('l1', 'R').click(); const a = _matLightArm && _matLightArm.k === 'R' && _marks('l1') === '-wa--';
    _box('l1', 'I').click(); const b = _matLightArm && _matLightArm.k === 'I' && _marks('l1') === '-wwwa' && _it('l1').s === 'picked' && !_it('l1').ins && !_it('l1').sch;
    await new Promise(r => setTimeout(r, 5300));
    const it = _it('l1');
    return a && b && !_matLightArm && _marks('l1') === '-----' && !_say('l1') && it.s === 'picked' && !it.sch && !it.ins && _lit('l1') === '10000';
  }));

  ok('🔧 Installed (two taps) lights all five — the row is ✓ FINISHED and folds (v7.19)', await page.evaluate(() => {
    _box('l1', 'I').click(); _box('l1', 'I').click();
    const it = _it('l1'), r = _rowId('l1');
    return it.s === 'arrived' && it.sch === true && !!it.ins && r.classList.contains('mi-fin') && /✓ FINISHED/.test(r.textContent);
  }));

  ok('the round lamp is two taps too: the first arms it (⚠ on the lamp, the line names the NEXT light), the second lights it — a received hood goes on to 📅, never back to "pick needed"', await page.evaluate(() => {
    const lamp = () => _rowId('l2').querySelector('.frow > button');
    const g0 = lamp().textContent.trim(); lamp().click();
    const armed = lamp().classList.contains('mat-lamp-armed') && lamp().textContent.trim() === '⚠' && /sure\? tap again/.test(lamp().getAttribute('aria-label')) && !_it('l2').sch;
    const say = _say('l2');
    lamp().click(); const it = _it('l2');
    return g0 === '📦' && armed && say === '⚠ SURE? Tap the round lamp again to light 📅 Scheduled — or leave it and nothing changes.' && it.sch === true && it.s === 'arrived' && !it.ins && lamp().textContent.trim() === '📅';
  }));

  ok('an old row with only 📅 lit: 👆 Picked lights just itself (nothing before it), and 📅 off leaves Picked lit', await page.evaluate(() => {
    const it = _it('l4');
    _box('l4', 'P').click(); _box('l4', 'P').click(); const a = it.s === 'picked' && it.sch === true && _lit('l4') === '10010';
    _box('l4', 'S').click(); _box('l4', 'S').click();
    return a && !it.sch && it.s === 'picked' && _lit('l4') === '10000';
  }));

  ok('a 🏠 row follows the same chain and marks the homeowner\'s page as waiting to send', await page.evaluate(() => {
    _matPubDirty = false;
    _box('l3', 'O').click(); const a = (_it('l3').s || 'pick') === 'pick' && !_matPubDirty;
    _box('l3', 'O').click();
    return a && _it('l3').s === 'ordered' && _matPubDirty === true && _lit('l3') === '11000';
  }));

  ok('in the ✎ edit window the lights are the same two taps, and the line saying what will change shows right there', await page.evaluate(() => {
    matEditOpen('l4'); const sh = $('matSheet');
    const head = [...sh.querySelectorAll('.ms-h')].some(h => h.textContent === 'Its lights — tap one, then tap it again');
    _box('l4', 'O', $('matSheet')).click();
    const say = _say('l4', $('matSheet')), marks = _marks('l4', $('matSheet')), before = _it('l4').s;
    _box('l4', 'O', $('matSheet')).click(); const after = _it('l4').s;
    matEditClose();
    return head && say === '⚠ SURE? Tap 🛒 Ordered again to light 🛒 Ordered — or leave it and nothing changes.' && marks === '-a---' && before === 'picked' && after === 'ordered';
  }));

  console.log('— ✅ the checklist rows —');
  ok('✅ Done (two taps) lights 📅 Scheduled with it — but never 👷: that one is a NAME he picks', await page.evaluate(() => {
    _box('c1', 'D').click(); const say = _say('c1'), marks = _marks('c1');
    _box('c1', 'D').click(); const it = _it('c1');
    return say === '⚠ SURE? Tap ✅ Done again to light 📅 Scheduled · ✅ Done — or leave it and nothing changes.' && marks === '-wa' && it.s === 'done' && it.sch === true && !(it.tg || []).length && _rowId('c1').classList.contains('mi-fin');
  }));
  ok('📅 off (two taps, from its window — the finished row is folded) turns ✅ off with it', await page.evaluate(() => {
    matBoxTap('c1', 'S'); const a = _it('c1').s === 'done'; matBoxTap('c1', 'S');
    const it = _it('c1');
    return a && it.s === 'todo' && !it.sch && !it.ddate && !_rowId('c1').classList.contains('mi-fin');
  }));
  ok('👷 is ONE tap — it opens "whose list?" (a pick, not a light change)', await page.evaluate(() => {
    _box('c3', 'A').click(); const a = !!$('matWho-c3') && !_matLightArm;
    _matWhoFor = ''; renderMatMgr();
    return a && !$('matWho-c3');
  }));
  ok('✅ with a step still open is refused at the FIRST tap, in words — nothing arms, nothing changes', await page.evaluate(() => {
    _said.length = 0; _box('c2', 'D').click();
    return _it('c2').s === 'todo' && !_it('c2').sch && !_matLightArm && _marks('c2') === '---' && _said.some(m => m === '🔒 1 step still open — grease it. Check it off first.');
  }));
  ok('the round lamp on a checklist row: two taps → ⚙ in work, two more → ✅ done (📅 with it)', await page.evaluate(() => {
    const lamp = () => _rowId('c3').querySelector('.frow > button');
    lamp().click(); const say = _say('c3'); lamp().click(); const a = _it('c3').s === 'work';
    lamp().click(); lamp().click(); const it = _it('c3');
    return say === '⚠ SURE? Tap the round lamp again to mark it ⚙ in work — or leave it and nothing changes.' && a && it.s === 'done' && it.sch === true;
  }));

  ok('armed on a long name at phone width, nothing runs off the side', await page.evaluate(() => {
    _box('l4', 'R').click();
    const fits = !!_say('l4') && $('revBox').scrollWidth <= $('revBox').clientWidth + 1 && document.documentElement.scrollWidth <= document.documentElement.clientWidth;
    matLightDisarm(); renderMatMgr();
    return fits;
  }));
  ok('"? how this works" says it: tap, then tap again; a light lights the ones before it and turning one off turns off the ones after it; the steps are in the row\'s window', await page.evaluate(() => {
    _matHelp = true; renderMatMgr(); const t = ($('matHelpBox') || {}).textContent || ''; _matHelp = false; renderMatMgr();
    return /then tap it again/.test(t) && /Lighting one lights every one before it; turning one off turns off every one after it/.test(t) && /steps are in its window/.test(t) && /round lamp lights the next one — two taps as well/.test(t);
  }));
  ok('closing the board lets go of an armed light', await page.evaluate(() => {
    _box('l4', 'R').click(); const a = !!_matLightArm; matClose();
    return a && !_matLightArm;
  }));

  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v7.20') && document.querySelector('footer').textContent.includes(APP_VER);
  }));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
