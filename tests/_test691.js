// 📋 v6.91 — THE BUILD LIST, ROUND TWO. Eric, after loading his walkthrough tracker: "I like the succession of lights … But I
// also want something that will flip that … to just a checklist … 'Check all vents and airflow' — that's just testing items
// in a new house … Make sure it's on somebody's list, and then scheduled, and then done? … a little icon in each of the
// checkboxes that light up … when I have a checklist item that says 'test winch' and next to it it says 'pick needed,' I
// don't need a pick … an icon of a triangle with an exclamation point … that goes to the top of its category … as soon as I
// click Edit, it shifts, it changes sizes … Let's figure out a better layout for the edit … on the phone everything's
// pretty crammed." Also: the summary's POCKET — not done plates ("the buttons are huge compared to the text") and the
// board's ✓ ("so I know that it's getting saved somewhere"). Every name and figure in this file is made up.
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
  await page.evaluate(async () => {
    jobs = ['Oak House']; curJob = ''; crew = ['Phil', 'Nathan']; entries = []; todos = []; nextId = 1; pendingQueue = []; prefs.pocket = []; prefs.matTags = [];
    window.scheduleSave = () => {}; window.savePendingSoon = () => {}; window.publishSharedNotes = () => {};
    renderJobSelects(); closePanels(); renderAll();
    dbx.refreshToken = 'test-token';
    _portalIdx = { clients: [{ key: 'oak', job: 'Oak House', code: 'oak-111aaa' }] };
    window._dbxFiles = {};
    window.dbxDownload = async p => (window._dbxFiles || {})[p] ?? null;
    window.dbxUpload = async (p, body) => { (window._dbxFiles || {})[p] = body; return {}; };
    window.dbxPathExists = async p => Object.prototype.hasOwnProperty.call(window._dbxFiles || {}, p);
    _dbxFiles[portalRoot() + '/materials-office-oak-111aaa.json'] = JSON.stringify({ full: true, seq: 9, rooms: [
      { name: 'GARAGE / LOFT', items: [
        { id: 'm1', n: 'Garage door', t: 'Misc', buy: true, s: 'picked', sel: 'Wood toned, insulated' },
        { id: 'm2', n: 'Loft railing', t: 'Misc', buy: true, s: 'pick', sel: 'Decide whether the railing is needed' },
        { id: 'm3', n: 'Test winch', t: 'Misc', buy: true, s: 'pick' },
        { id: 'm4', n: 'Garage paint', t: 'Misc', buy: true, s: 'ordered' },
        { id: 'm5', n: 'Check all vents and airflow', t: 'Misc', s: 'todo', sel: 'Fans on, every vent open' }] },
      { name: 'KITCHEN', items: [{ id: 'm6', n: 'Countertops', t: 'Misc', buy: true, s: 'arrived', ins: '2026-09-01' }, { id: 'm7', n: 'Pendants x2', t: 'Electrical', tg: ['Electrical'], hm: true, s: 'pick' }] }] });
    await openMaterials(0);
    window._nm = r => (r.querySelector('.mat-nm b') || r.querySelector('.mat-fin-nm') || {}).textContent;   // ✓ v7.19 — a finished row's name is folded, not bold
    window._row = n => [...document.querySelectorAll('#revBox .mat-item')].find(r => _nm(r) === n);
    window._lights = n => [..._row(n).querySelectorAll('.mat-strip:not(.mat-rowbtns) .mat-box')];
    window._it = n => _matD.rooms.flatMap(r => r.items).find(x => x.n === n);
  });

  console.log('— 💡 v6.91 a little icon in every light —');

  ok('each light is an ICON over its LETTER with the word in its label; a lit one wears the plate AND a ✓ (never colour alone); the row\'s lamp wears the icon of the furthest light that is lit', await page.evaluate(() => {
    const L = _lights('Garage paint');
    const icons = L.map(b => b.querySelector('.mb-i').textContent).join(' '), letters = L.map(b => b.querySelector('b').textContent).join('');
    const lit = L.map(b => (b.classList.contains('on') ? 1 : 0) + '' + (b.querySelector('.mb-ck') ? 1 : 0) + (b.getAttribute('aria-pressed') === 'true' ? 1 : 0)).join(' ');
    const lamp = n => _row(n).querySelector('.frow > button').textContent.trim();
    return icons === '👆 🛒 📦 📅 🔧' && letters === 'PORSI' && lit === '111 111 000 000 000' && L[1].getAttribute('aria-label') === 'Ordered — yes' && L[2].getAttribute('aria-label') === 'Received — not yet' &&
      lamp('Garage paint') === '🛒' && lamp('Garage door') === '👆' && lamp('Loft railing') === '○' && lamp('Check all vents and airflow') === '○' &&
      // ✓ v7.19 — the installed countertops fold to their name and a green ✓ FINISHED (their 🔧 light is in the edit window)
      [...document.querySelectorAll('#revBox .mat-item.mi-fin')].some(r => /Countertops/.test(r.textContent) && /✓ FINISHED/.test(r.textContent));
  }));

  console.log('— ✅ v6.91 the checklist lights —');

  ok('a checklist row wears THREE lights — 👷 on a list · 📅 scheduled · ✅ done — and never reads "pick needed"; with no list yet it says so', await page.evaluate(() => {
    const L = _lights('Check all vents and airflow'), row = _row('Check all vents and airflow').textContent.replace(/\s+/g, ' ');
    return L.map(b => b.querySelector('.mb-i').textContent + b.querySelector('b').textContent).join(' ') === '👷A 📅S ✅D' && L.map(b => b.getAttribute('aria-label')).join('|') === 'On a list — not yet|Scheduled — not yet|Done — not yet' &&
      /to do — on nobody's list yet/.test(row) && !/pick needed/i.test(row) && /Fans on, every vent open/.test(row);
  }));

  ok('⇄ is under his thumb: "Test winch · pick needed" flips to a checklist item in ONE tap and the pick is gone; since v6.98 the plate is on EVERY row all the time (the open row and ✎ edit have it too)', await page.evaluate(() => {
    const flip = n => _row(n).querySelector('.mat-flip');
    const before = /pick needed/.test(_row('Test winch').textContent) && !!flip('Test winch') && /checklist item/.test(flip('Test winch').getAttribute('aria-label')) && flip('Test winch').textContent.replace(/\s+/g, '') === '⇄list';
    flip('Test winch').click();
    const it = _it('Test winch'), row = _row('Test winch').textContent;
    const after = !it.buy && it.s === 'todo' && !/pick needed/.test(row) && _lights('Test winch').length === 3 && flip('Test winch').textContent.replace(/\s+/g, '') === '⇄buy';
    const gone = !!flip('Garage door') && !!flip('Garage paint') && !!flip('Pendants x2');   // v6.98 — Eric: "yes make it show on every row all the time"
    const inRow = !!flip('Garage door');   // v7.09 — nothing folds any more; the ⇄ on the row IS where the flip lives
    return before && after && gone && inRow;
  }));

  ok('👷 opens "whose list?" under the row — the trades, his crew, a name of his own; a tap lights the light, the word names the list and the 🏷 sort at the top finds it; 📅 and ✅ tick on their own', await page.evaluate(() => {
    const L = () => _lights('Test winch'), it = _it('Test winch');
    L()[0].click();
    const pick = $('matWho-' + it.id), names = pick ? [...pick.querySelectorAll('button')].map(b => b.textContent.trim()) : [];
    const offered = !!pick && names.includes('Electrical') && names.includes('Phil') && names.includes('Nathan');
    [...pick.querySelectorAll('button')].find(b => b.textContent.trim() === 'Phil').click();
    const a = JSON.stringify(it.tg) === '["Phil"]' && L()[0].classList.contains('on') && /on the Phil list/.test(_row('Test winch').textContent) && _row('Test winch').querySelector('.frow > button').textContent.trim() === '👷';
    $('matWhoNew-' + it.id).value = 'Door sub'; matWhoAdd(it.id);
    const b = it.tg.includes('Door sub') && (prefs.matTags || []).includes('Door sub') && /on the Phil list \+1/.test(_row('Test winch').textContent);
    [...$('matWho-' + it.id).querySelectorAll('button')].find(x => /that's it/.test(x.textContent)).click();
    const closed = !$('matWho-' + it.id);
    const chip = [...document.querySelectorAll('#revBox .chips-row button')].find(x => /🏷 Phil \(1\)/.test(x.textContent));
    L()[1].click(); const c = it.sch === true && /scheduled/.test(_row('Test winch').textContent) && _row('Test winch').querySelector('.frow > button').textContent.trim() === '📅';
    // ✓ v7.19 — done = FINISHED: the row folds to its name and a green ✓ FINISHED; its ✅ light is in the edit window to take it back
    L()[2].click(); const fin = [...document.querySelectorAll('#revBox .mat-item.mi-fin')].find(r => /Test winch/.test(r.textContent));
    const d = it.s === 'done' && !!it.ddate && !!fin && /✓ FINISHED/.test(fin.textContent) && !fin.querySelector('.mat-strip');
    matBoxTap(it.id, 'D'); const e = it.s === 'todo' && !it.ddate && !!_row('Test winch');
    return offered && a && b && closed && !!chip && c && d && e;
  }));

  ok('✅ refuses while a step under the row is still open, in words — the same rule the lamp has always had', await page.evaluate(() => {
    const it = _it('Check all vents and airflow'); it.kids = [{ n: 'dryer vent' }, { n: 'bath fans', ok: true }]; renderMatMgr();
    let said = ''; const keep = window.toast; window.toast = m => { said = String(m); };
    _lights('Check all vents and airflow')[2].click();
    const refused = it.s === 'todo' && /1 step still open/.test(said);
    it.kids[0].ok = true; renderMatMgr(); _lights('Check all vents and airflow')[2].click();
    window.toast = keep;
    const r = refused && it.s === 'done'; it.s = 'todo'; delete it.kids; renderMatMgr(); return r;
  }));

  ok('each category counts its checklist rows the way it counts the things to buy, and "👷 on nobody\'s list" is one of the working lists', await page.evaluate(() => {
    const g = [...document.querySelectorAll('#revBox .set-section')].find(s => /GARAGE/.test(s.querySelector('h4').textContent)).querySelector('.mat-counts').textContent.replace(/\s+/g, ' ');
    const chip = [...$('matStageChips').querySelectorAll('button')].find(b => /on nobody's list/.test(b.textContent));
    const n = chip ? +(chip.textContent.match(/\((\d+)\)/) || [])[1] : -1;
    chip.click(); const rows = [...document.querySelectorAll('#revBox .mat-item')].map(_nm); chip.click; _matStageF = ''; renderMatMgr();
    return /🛒 2\/3 picked · 1 ordered · 0 received · 0 installed/.test(g) && /✅ 0\/2 done · 1 on a list · 1 scheduled/.test(g) && !/^·/.test(g.trim()) && n === 1 && rows.join() === 'Check all vents and airflow';
  }));

  console.log('— ⚠ v6.91 FIRST —');

  ok('⚠ 1st sends the row to the TOP of its category with the reason in words, the heading counts it, the plate is lit with a ✓; tap again and it goes back where it was; a row that is done no longer rides on top', await page.evaluate(() => {
    const names = () => [...[...document.querySelectorAll('#revBox .set-section')].find(s => /GARAGE/.test(s.querySelector('h4').textContent)).querySelectorAll('.mat-item')].map(_nm);
    const before = names().join('|');
    const btn = () => _row('Loft railing').querySelector('.mat-firstbtn');
    const plain = btn().getAttribute('aria-pressed') === 'false' && /goes to the top of its category/.test(btn().getAttribute('aria-label')) && !btn().querySelector('.mb-ck');
    btn().click();
    const row = _row('Loft railing'), head = [...document.querySelectorAll('#revBox .set-section')].find(s => /GARAGE/.test(s.querySelector('h4').textContent)).querySelector('.mat-counts').textContent;
    const a = names()[0] === 'Loft railing' && _it('Loft railing').first === true && row.classList.contains('mi-first') && /⚠ FIRST — the rest of this category waits on this/.test(row.textContent) && /⚠ 1 first/.test(head) &&
      btn().getAttribute('aria-pressed') === 'true' && !!btn().querySelector('.mb-ck') && names().slice(1).join('|') === before.split('|').filter(n => n !== 'Loft railing').join('|');
    const it = _it('Loft railing'); it.s = 'arrived'; it.ins = '2026-09-10'; renderMatMgr();
    const doneDrops = names()[0] !== 'Loft railing' && !_row('Loft railing').classList.contains('mi-first') &&
      names()[names().length - 1] === 'Loft railing' && _row('Loft railing').classList.contains('mi-fin');   // ✓ v7.19 — finished, it sinks to the BOTTOM, folded
    delete it.ins; it.s = 'pick'; renderMatMgr(); btn().click();
    return plain && a && doneDrops && names().join('|') === before && !_it('Loft railing').first;
  }));

  console.log('— ✎ v6.91 the edit window —');

  const ed = await page.evaluate(async () => {
    const rowTop = () => Math.round(_row('Loft railing').getBoundingClientRect().top), rowH = () => Math.round(_row('Loft railing').getBoundingClientRect().height);
    const t0 = rowTop(), h0 = rowH(), scroll0 = $('revModal').scrollTop;
    _row('Loft railing').querySelector('.mat-quick .mat-q-ed').click();   // ✎ edit (v7.08: it sits on every row's name line; v7.09: nothing folds)
    const sheet = $('matSheet'), it = _it('Loft railing');
    const secs = sheet ? [...sheet.querySelectorAll('.ms-h, .ms-fold')].map(x => x.textContent.replace(/\s+/g, ' ').trim()) : [];
    const r = { open: !!sheet && sheet.parentNode.id === 'matSheetHost' && !$('revBox').contains(sheet), z: sheet ? +getComputedStyle(sheet).zIndex : 0,
      rowStill: !_row('Loft railing').querySelector('input, textarea, select') && _row('Loft railing').classList.contains('mi-editing'),
      order: secs.map(s => s.replace(/ ·.*$/, '').replace(/^[▸▾] /, '')).join(' | '),
      folded: [...sheet.querySelectorAll('.ms-foldbody')].every(b => b.hidden && getComputedStyle(b).display === 'none'),
      name: $('matNm-' + it.id).value, note: $('matSel-' + it.id).value, noteIsBox: $('matSel-' + it.id).tagName === 'TEXTAREA',
      fits: sheet.querySelector('.mat-sheet-box').scrollWidth <= 390 && document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      foot: [...sheet.querySelectorAll('.mat-sheet-foot button')].map(b => b.textContent.trim()).join(' | '),
      footPinned: Math.round(sheet.querySelector('.mat-sheet-foot').getBoundingClientRect().bottom) <= 844 && sheet.querySelector('.mat-sheet-foot').getBoundingClientRect().top > 700,
      closer: getComputedStyle(sheet.querySelector('.mat-sheet-head .x-plate')).color };
    // the note is editable, and it lands on the row
    $('matSel-' + it.id).value = 'Yes to a railing — cable, black posts'; $('matSel-' + it.id).dispatchEvent(new Event('change'));
    $('matNm-' + it.id).value = 'Loft railing (cable)'; $('matNm-' + it.id).dispatchEvent(new Event('change'));
    // a fold opens in place and the window keeps its scroll through the redraw
    $('matSheetBody').scrollTop = 60; const s0 = $('matSheetBody').scrollTop; matEdFold('money'); r.keptScroll = s0 > 0 && $('matSheetBody').scrollTop === s0 && !sheetBody('money').hidden; r.s0 = s0;
    function sheetBody(k) { return document.querySelector(`.ms-foldsec[data-fold="${k}"] .ms-foldbody`); }
    $('matEst-' + it.id).value = '2,400'; $('matEst-' + it.id).dispatchEvent(new Event('change'));
    // the two KIND plates
    const kind = () => [...document.querySelectorAll('#matSheet .ms-kind button')].map(b => b.getAttribute('aria-pressed')).join();
    r.kind0 = kind(); document.querySelectorAll('#matSheet .ms-kind button')[1].click(); r.kind1 = kind(); r.flipped = !it.buy && [...document.querySelectorAll('#matSheet .mat-strip:not(.mat-rowbtns) .mat-box b')].map(b => b.textContent).join('') === 'ASD' && !!$('matNewTag-' + it.id) && !sheetBody('money').hidden;
    document.querySelectorAll('#matSheet .ms-kind button')[0].click(); r.back = it.buy === true;
    // ⚠ first from inside the window
    [...document.querySelectorAll('#matSheet button')].find(b => /Flag it FIRST/.test(b.textContent)).click(); r.first = it.first === true && /✓ ⚠ FIRST/.test($('matSheet').textContent);
    matFirstToggle(it.id);
    [...document.querySelectorAll('#matSheet .mat-sheet-foot button')].find(b => /DONE/.test(b.textContent)).click();
    r.closed = !$('matSheet') && $('matSheetHost').innerHTML === '' && _matEdit === '';
    r.saved = it.n === 'Loft railing (cable)' && it.sel === 'Yes to a railing — cable, black posts' && it.est === 2400 && /cable, black posts/.test(_row('Loft railing (cable)').textContent) && /est \$2,400/.test(_row('Loft railing (cable)').textContent);
    r.noJump = Math.abs($('revModal').scrollTop - scroll0) <= 1;   // v7.09 — there is no row to fold again
    return r;
  });
  ok('✎ edit opens its OWN window over the board — drawn outside the scrolling board, above it and under the toast — and the row behind it never turns into a form', ed.open && ed.z > 80 && ed.z < 90 && ed.rowStill, JSON.stringify(ed));
  ok('always the same order: Name · Note · What kind of row · Its lights, then ⚠ FIRST, then the folds — 💵 Money · 🏷 Whose list · 🏠 The homeowner · ☑ Steps · 📷 Photos — every fold shut until he opens it', /^Name \| Note — shows on the row \| What kind of row \| Its lights — tap one \| 📷 Photos \| 💵 Money \| 🏷 Whose list — tags \| 🏠 The homeowner \| ☑ Steps under it \| 📁 Pocket \| 🕘 Changes$/.test(ed.order) && ed.folded, ed.order);   // v7.08 — 📷 Photos is its own open section above 💵 Money (the Wizard fills the money from a photo); the fold is 📁 Pocket alone · 🕘 v7.19 — then the row's changes
  ok('the name and the note ("decide whether the railing is needed") are right there to edit — the note is a real writing box — and what he types lands on the row; money goes in under its fold', ed.name === 'Loft railing' && ed.note === 'Decide whether the railing is needed' && ed.noteIsBox && ed.saved, JSON.stringify(ed));
  ok('it fits the phone, the footer (✕ Delete · ✓ DONE — it is saved) stays pinned, the ✕ is black on gold, a fold opening keeps the window\'s scroll, and closing it leaves the board exactly where it was', ed.fits && ed.footPinned && /✕ Delete \| ✓ DONE — it is saved/.test(ed.foot) && /rgb\(17, 17, 17\)/.test(ed.closer) && ed.keptScroll && ed.closed && ed.noJump, JSON.stringify(ed));
  ok('the two KIND plates flip the row from inside the window (🛒 Something to buy ↔ ✅ Checklist item) and the lights follow; ⚠ FIRST is one plate', ed.kind0 === 'true,false' && ed.kind1 === 'false,true' && ed.flipped && ed.back && ed.first, JSON.stringify(ed));

  ok('➕ item opens the window with the name selected — nothing on the board moves but the new row; hold a name opens it too; ✕ Delete asks twice; closing the board closes the window', await page.evaluate(async () => {
    const n0 = _matD.rooms[0].items.length; matAddItem(0); await new Promise(r => setTimeout(r, 120));
    const id = _matEdit, nm = $('matNm-' + id);
    const a = _matD.rooms[0].items.length === n0 + 1 && !!$('matSheet') && document.activeElement === nm && nm.selectionStart === 0 && nm.selectionEnd === nm.value.length;
    const del = () => [...document.querySelectorAll('#matSheet .mat-sheet-foot button')].find(b => /Delete|SURE/.test(b.textContent));
    del().click(); const armed = /⚠ SURE\? tap again/.test(del().textContent) && _matD.rooms[0].items.length === n0 + 1;
    del().click(); const gone = _matD.rooms[0].items.length === n0 && !$('matSheet') && _matEdit === '';
    matItemHoldStart('m1'); await new Promise(r => setTimeout(r, 650)); matItemHoldEnd();
    const held = _matEdit === 'm1' && !!$('matSheet');
    matClose(); const shut = !$('matSheet') && _matEdit === '';
    await openMaterials(0);
    return a && armed && gone && held && shut;
  }));

  console.log('— 📱 v6.91 the phone —');

  const ph = await page.evaluate(() => {
    const sec = [...document.querySelectorAll('#revBox .set-section')].find(s => /GARAGE/.test(s.querySelector('h4').textContent)), h4 = sec.querySelector('h4');
    const tools = h4.querySelector('.mat-rm-tools'), vis = b => getComputedStyle(b).display !== 'none';
    const shown = [...tools.querySelectorAll('button')].filter(vis).map(b => b.textContent.trim()).join(' ');
    const first0 = sec.querySelector('.mat-item'), counts0 = h4.querySelector('.mat-counts');
    const live = { float: getComputedStyle(tools).float, tt: getComputedStyle(counts0).textTransform, above: tools.getBoundingClientRect().bottom <= first0.querySelector('b').getBoundingClientRect().top + 1, ownLine: counts0.getBoundingClientRect().top >= h4.querySelector('button').getBoundingClientRect().bottom - 2 };
    tools.querySelector('.rm-dots').click();
    const t2 = [...document.querySelectorAll('#revBox .set-section')].find(s => /GARAGE/.test(s.querySelector('h4').textContent)).querySelector('.mat-rm-tools');
    const more = [...t2.querySelectorAll('button')].filter(vis).length === 7; t2.querySelector('.rm-dots').click();
    const first = sec.querySelector('.mat-item'), name = first.querySelector('b').getBoundingClientRect(), tb = tools.getBoundingClientRect();
    const counts = h4.querySelector('.mat-counts'), cs = getComputedStyle(counts);
    const plates = [..._row('Loft railing (cable)').querySelectorAll('.mat-line2 .mat-box')], tops = new Set(plates.map(p => Math.round(p.getBoundingClientRect().top)));
    const parts = { shown, more, float: live.float, above: live.above, tt: live.tt, ownLine: live.ownLine,
      n: plates.length, rows: tops.size, sizes: plates.map(p => Math.round(p.getBoundingClientRect().width) + 'x' + Math.round(p.getBoundingClientRect().height)).join(' '), page: document.documentElement.scrollWidth <= document.documentElement.clientWidth, box: $('revBox').scrollWidth <= $('revBox').clientWidth + 1 };
    return parts.shown === '⋯ ➕ item' && parts.more && parts.float === 'none' && parts.above && parts.tt === 'none' && parts.ownLine && parts.n === 7 && parts.rows === 1 && plates.every(p => p.getBoundingClientRect().width >= 36 && p.getBoundingClientRect().height >= 40) && parts.page && parts.box ? true : JSON.stringify(parts);
  });
  ok('nothing is floated over the first row any more: the heading is the name, ➕ item and ⋯ (move · fold in · template · delete behind it), the counts in plain case on their own line; all seven plates of a row sit on ONE line', ph === true, ph);

  ok('the top of the board is short: the counts and "? how this works" — the legend and the instructions fold behind it; the title and ✕ no longer fight for a line', await page.evaluate(() => {
    const hint = [...$('revBox').querySelectorAll('.hint')].find(h => h.querySelector('a')), a = hint.querySelector('a');
    const shut = !$('matHelpBox') && /2 categories · \d+ items/.test(hint.textContent) && /how this works/.test(a.textContent) && !/HOLD a step/.test(hint.textContent);
    a.click(); const open = !!$('matHelpBox') && /👷 on somebody's list · 📅 scheduled · ✅ done/.test($('matHelpBox').textContent) && /⚠ 1st/.test($('matHelpBox').textContent);
    [...$('revBox').querySelectorAll('.hint a')].find(x => /how this works/.test(x.textContent)).click();
    const h3 = $('revBox').querySelector('h3'), x = h3.querySelector('.x-plate').getBoundingClientRect(), t = h3.querySelector('span').getBoundingClientRect();
    return shut && open && !$('matHelpBox') && getComputedStyle(h3).display === 'flex' && (x.left >= t.right - 1 || x.top >= t.bottom - 1);
  }));

  console.log('— 🧱 v6.91 the wall still stands —');

  ok('📤 to their page: a 🏠 row flagged ⚠ FIRST rides without the flag, his note, his costs or the estimate line; a checklist row never rides at all', await page.evaluate(async () => {
    const it = _it('Pendants x2'); it.first = true; it.sel = 'From the lighting house on Fifth'; it.est = 480; renderMatMgr();
    await matSave();
    const cli = JSON.parse(_dbxFiles[portalRoot() + '/materials-oak-111aaa.json']), items = cli.rooms.flatMap(r => r.items), txt = JSON.stringify(cli);
    const off = JSON.parse(_dbxFiles[portalRoot() + '/materials-office-oak-111aaa.json']).rooms.flatMap(r => r.items).find(x => x.n === 'Pendants x2');
    return items.length === 1 && items[0].n === 'Pendants x2' && !('first' in items[0]) && !('sel' in items[0]) && !('est' in items[0]) && !/lighting house|Test winch|vents/.test(txt) && off.first === true && off.sel === 'From the lighting house on Fifth';
  }));

  console.log('— 🎒 v6.91 the pocket leftovers: small plates, one row —');

  ok('each leftover wears four SMALL plates in ONE row — an icon over its word, a finger tall, not a wall of buttons — beside its small print; the words read bigger than the plates\' words; they still do what they did', await page.evaluate(() => {
    matClose();
    entries = []; nextId = 1;
    ['call the gravel supplier', 'pick up the long level', 'ask about the permit sign'].forEach((t, i) => addEntry('Note', '🎒 Flushed — ' + t, '—', { pocket: 'flushed', tags: ['pocket'], ts: new Date(Date.now() - i * 3600e3) }));
    openReview('summary'); _sumSec = 'pocket'; renderReview();
    const lines = [...document.querySelectorAll('.rev-sec-body[data-sec="pocket"] .sum-line')], acts = lines[0].querySelector('.pk-acts'), btns = [...acts.querySelectorAll('button')];
    const words = btns.map(b => b.textContent.replace(/\s+/g, '')).join('|'), rects = btns.map(b => b.getBoundingClientRect());
    const oneRow = new Set(rects.map(r => Math.round(r.top))).size === 1, small = rects.every(r => r.height >= 40 && r.height <= 48 && r.width <= 84), narrow = rects.reduce((s, r) => s + r.width, 0) <= 300;
    const big = parseFloat(getComputedStyle(lines[0].querySelector('.sum-m > b')).fontSize) >= 15 && parseFloat(getComputedStyle(btns[0].querySelector('b')).fontSize) <= 11;
    const labelled = btns.every(b => !!b.getAttribute('aria-label')) && /flushed ·/.test(lines[0].querySelector('.pk-meta').textContent);
    btns[2].click();   // ✓ Done
    const did = entries.some(e => e.pocket === 'done') && document.querySelectorAll('.rev-sec-body[data-sec="pocket"] .pk-acts').length === 2;
    const fits = $('revBox').scrollWidth <= $('revBox').clientWidth + 1;
    return words === '↩Today|➡Tomorrow|✓Done|✕Notneeded' && oneRow && small && narrow && big && labelled && did && fits ? true : JSON.stringify({ words, oneRow, small, narrow, big, labelled, did, fits, rects: rects.map(r => [Math.round(r.width), Math.round(r.height)]) });
  }));

  console.log('— 📋 v6.91 the board\'s ✓ says where the line goes —');

  ok('✓ on a board line: the label and the message say it leaves the board and STAYS in his log, marked done — with Undo', await page.evaluate(() => {
    entries = []; nextId = 1; const e = addEntry('Note', 'Sort the insurance email', 'Internal / Admin', { board: { p: 1, done: '', sub: [], at: new Date().toISOString() } });
    openReview('board'); _brdShow = 'Internal / Admin'; renderReview();
    const ck = [...document.querySelectorAll('#revBox .bd-ck')].find(b => /stays in your log/.test(b.getAttribute('aria-label') || ''));
    let said = ''; const keep = window.toastUndo; window.toastUndo = (m, fn) => { said = String(m); };
    const labelled = !!ck && /leaves the board · stays in your log, marked done/.test(ck.title); if (ck) ck.click();
    window.toastUndo = keep;
    const r = labelled && /✓ Done — off the board · kept in your log, marked done — Sort the insurance email/.test(said) && !!e.board.done && entries.includes(e);
    closeReview(); return r ? true : JSON.stringify({ labelled, said, done: e.board && e.board.done });
  }));

  ok('nothing runs off the right edge of the main page', await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth));
  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v6.91') && document.querySelector('footer').textContent.includes(APP_VER);
  }));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
