// 🔓 v7.73 — ONE STEP ON ITS OWN. Eric, nudging steps off the weekends: "how can i unlock a single item so i can move it without
// it moving everythig else". The rule stands (a move takes every linked step that starts on or after it) — but the open step's
// editor wears a switch: 🔗 LINKED ↔ 🔓 UNLINKED — only this step moves.
// Re-pinned for v7.75 and v7.76: the switch is the step's own LINK now and it STAYS as he set it (it used to let go when the step
// was folded — with "unlink all" that would have undone itself), the row says 🔓 unlinked in words, and a move is counted in WORK
// days (the crew's Thursday + 1 is Monday). The three new plates — unlink all, relink all, linked only from here on — are _test775.
// Every name below is made up; the days are worked out from next Monday so the checks hold whenever they run.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { fileURLToPath } = require('url');
(async () => {
  const appUrl = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const repo = path.dirname(fileURLToPath(appUrl));
  const src = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
  const csrc = fs.readFileSync(path.join(repo, 'c', 'index.html'), 'utf8');
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await ctx.route(u => !/^file:/.test(u.href), r => r.abort());
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
  await page.goto(appUrl); await page.waitForTimeout(700);
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };
  const stub = () => page.evaluate(() => {
    window._saves = 0; window.scheduleSave = () => { window._saves++; };
    window._dbxFiles = window._dbxFiles || {}; window._ups = [];
    window.dbxDownload = async p => (window._dbxFiles || {})[p] ?? null;
    window.dbxUpload = async (p, body) => { (window._dbxFiles || {})[p] = typeof body === 'string' ? body : '[file]'; window._ups.push(p); return { path_display: p }; };
    window.dbxPathExists = async p => Object.prototype.hasOwnProperty.call(window._dbxFiles || {}, p);
    window.dbxList = async () => ({ entries: [] }); window.dbxRpc = async () => ({});
    window.pushOut = () => false; window.cpPush = () => {}; window.cpReload = () => {};
    if (!window._said) { window._said = []; const t0 = window.toast; window.toast = (m, g) => { if (m) _said.push(String(m)); return t0(m, g); }; }
    dbx.refreshToken = 'test-token';
  });
  await stub();
  // the plan hangs off a Monday five weeks out — far enough that a holiday week can be stepped over (the anchor moves on a week at
  // a time until the three weeks the checks use hold no holiday), so every weekday below is the weekday it says
  await page.evaluate(() => {
    jobs = ['Oak House', 'Pine Cabin', 'Internal / Admin']; crew = ['Phil', 'Kevin']; prefs.office = ['Phil']; entries = []; todos = []; nextId = 1;
    delete prefs.subs; prefs.sched = { wd: 1, jobs: {} }; delete prefs.schedTaken; prefs.cards = {}; _portalIdx = null; _cardJob = '';
    localStorage.removeItem('daylog-sched-shade'); localStorage.removeItem('daylog-sched-zoom'); _schedShade = { we: false, fr: false, ho: false }; _schedZoom = 1; _schedWho = '';
    let mon = schedAddDays(schedMonday(localDay(new Date())), 7);
    const clear = m => { for (let i = 0; i < 35; i++) if (schedHolidayOf(schedAddDays(m, i))) return false; return true; };
    for (let i = 0; i < 12 && !clear(mon); i++) mon = schedAddDays(mon, 7);
    const d = n => schedAddDays(mon, n), put = (job, x) => schedPlan(job, true).steps.push(schedClean(x));
    window._mon = mon;
    put('Oak House', { id: 'D', n: 'an early one', start: d(0), days: 3, who: 'crew' });           // Mon → Wed
    put('Oak House', { id: 'A', n: 'the one he moves', start: d(7), days: 3, who: 'crew' });       // the next Mon → Wed
    put('Oak House', { id: 'C', n: 'same day beside it', start: d(7), days: 4, who: 'sub' });      // Mon → Thu, beside it
    put('Oak House', { id: 'E', n: 'a done one', start: d(8), days: 2, who: 'crew', done: d(8) });
    put('Oak House', { id: 'B', n: 'right after', start: d(11), days: 2, who: 'sub' });            // the Fri after the sub beside it ends, → Mon
    put('Oak House', { id: 'F', n: 'the last', start: d(15), days: 1, who: 'inspection' });        // the Tue after that
    put('Pine Cabin', { id: 'P', n: 'siding', start: d(1), days: 10, who: 'crew' });
    renderJobSelects(); closePanels(); renderAll(); clearTimeout(_schedPubT); window._saves = 0; window._ups.length = 0; _said.length = 0;
    openSchedule('Oak House');
  });
  await page.waitForTimeout(250);
  const starts = () => page.evaluate(() => Object.fromEntries(schedSteps('Oak House').map(s => [s.id, Math.round((schedDate(s.start) - schedDate(window._mon)) / 86400000)])));
  const openRow = id => page.evaluate(id => { const s = schedSteps('Oak House').find(x => x.id === id); const lab = [...document.querySelectorAll('#schedBox .sch-lab')].find(l => l.querySelector('b').textContent.replace(/^[✓⚠] /, '').trim() === s.n); lab.click(); }, id);
  const tap = re => page.evaluate(re => { const b = [...document.querySelectorAll('#schEdit button')].find(x => new RegExp(re).test(x.textContent.trim())); if (!b) return false; b.click(); return true; }, re);
  const solo = () => page.evaluate(() => { const b = $('schSolo'); return b ? { t: b.textContent.trim(), pressed: b.getAttribute('aria-pressed'), sel: b.classList.contains('sel'), say: $('schMoveSay').textContent.trim() } : null; });
  const rowSays = id => page.evaluate(id => { const s = schedSteps('Oak House').find(x => x.id === id); const lab = [...document.querySelectorAll('#schedBox .sch-lab')].find(l => l.querySelector('b').textContent.replace(/^[✓⚠] /, '').trim() === s.n); return (lab.querySelector('.sch-freew') || {}).textContent || ''; }, id);
  const base = await starts();
  ok('the plan sits on the days it says: D Mon · A and C the next Mon · the done one Tue · B that Fri · F the Tue after', JSON.stringify(base) === JSON.stringify({ D: 0, A: 7, C: 7, E: 8, B: 11, F: 15 }), JSON.stringify(base));

  console.log('— 🔗 linked, as ever —');
  await openRow('A'); await page.waitForTimeout(120);
  ok('a step\'s editor wears the switch over its move buttons — 🔗 LINKED to start (not pressed), a thumb tall, inside the phone; the line under the buttons says what a move takes along', await (async () => {
    const s = await solo();
    const geo = await page.evaluate(() => { const b = $('schSolo'), r = b.getBoundingClientRect(), mv = [...document.querySelectorAll('#schEdit .sch-moves')][0]; return r.height >= 44 && r.left >= 0 && r.right <= innerWidth + 0.5 && !!(b.compareDocumentPosition(mv) & Node.DOCUMENT_POSITION_FOLLOWING) && document.documentElement.scrollWidth <= innerWidth + 0.5; });
    return !!s && s.t === '🔗 LINKED — a move takes the linked steps after it along · tap to unlink this one' && s.pressed === 'false' && !s.sel && s.say === '🔗 Linked — a move takes this step and the 3 linked steps that start on or after it. A ✓ done step never moves.' && geo && (await rowSays('A')) === '';
  })(), JSON.stringify(await solo()));
  ok('linked, 1 work day later ▶ takes every step that starts on or after it along — the one beside it goes a work day of its own, the ones after keep their place behind the step before them; the earlier one and the done one stay; the toast counts them; ◀ puts every one back', await (async () => {
    await page.evaluate(() => { _said.length = 0; }); await tap('^1 work day later ▶$'); await page.waitForTimeout(120);
    const a = await starts(), said = await page.evaluate(() => _said.slice());
    await tap('^◀ 1 work day earlier$'); await page.waitForTimeout(120);
    const back = await starts();
    // A Mon → Tue; C beside it Mon → Tue (now ends Fri); B was the sub's next work day after C ended, and still is: Mon; F the day after B ends: Wed
    return a.A === 8 && a.C === 8 && a.B === 14 && a.F === 16 && a.D === base.D && a.E === base.E && said.some(m => /^📅 the one he moves moved 1 work day later · it starts Tue .+ · 3 linked steps after it moved along · the last step ends Wed /.test(m)) && JSON.stringify(back) === JSON.stringify(base);
  })(), JSON.stringify(await starts()));

  console.log('— 🔓 unlinked —');
  ok('a tap on the switch: 🔓 UNLINKED — only this step moves (pressed, lit), the line under the buttons says so, and the ROW says 🔓 unlinked in words', await (async () => {
    await page.evaluate(() => { _said.length = 0; $('schSolo').click(); }); await page.waitForTimeout(120);
    const s = await solo();
    return s.t === '🔓 UNLINKED — only this step moves · tap to link it again' && s.pressed === 'true' && s.sel && s.say === '🔓 Unlinked — only this step moves, by the buttons or a typed start day. Every other step stays where it is.' && (await rowSays('A')) === '🔓 unlinked' && (await rowSays('C')) === ''
      && await page.evaluate(() => _said.some(m => /^🔓 the one he moves is unlinked — it moves on its own, and nothing else moves it$/.test(m)) && document.querySelector('#schedBox .sch-band-h .sch-free-n').textContent.trim() === '🔓 1 unlinked');
  })(), JSON.stringify(await solo()));
  ok('unlinked, 1 work day later ▶ twice walks THIS step from Monday to Wednesday — and nothing else moves: not the one beside it, not the ones after; the toast says only it moved, and to which day', await (async () => {
    await page.evaluate(() => { _said.length = 0; window._saves = 0; }); await tap('^1 work day later ▶$'); await page.waitForTimeout(100); await tap('^1 work day later ▶$'); await page.waitForTimeout(120);
    const a = await starts(), r = await page.evaluate(() => ({ said: _said.slice(), saves: window._saves, day: schedDayWord(schedSteps('Oak House').find(s => s.id === 'A').start) }));
    return a.A === 9 && ['B', 'C', 'D', 'E', 'F'].every(k => a[k] === base[k]) && r.said.length === 2 && r.said[1] === '🔓 Only the one he moves moved 1 work day later · it starts ' + r.day + ' — nothing else moved' && /^Wed /.test(r.day) && r.saves >= 2;
  })(), JSON.stringify({ now: await starts(), base }));
  ok('🗓 the crew\'s Thursday + 1 work day is MONDAY (its Friday and the weekend are not its days) — and − 1 is Thursday again', await (async () => {
    await tap('^1 work day later ▶$'); await page.waitForTimeout(80); const thu = await starts();
    await tap('^1 work day later ▶$'); await page.waitForTimeout(80); const mon = await starts();
    await tap('^◀ 1 work day earlier$'); await page.waitForTimeout(80); const back = await starts();
    return thu.A === 10 && mon.A === 14 && back.A === 10 && ['B', 'C', 'D', 'E', 'F'].every(k => mon[k] === base[k]);
  })(), JSON.stringify(await starts()));
  ok('it stays unlinked through its own moves; a typed start day moves only it too — a SATURDAY typed lands on the Monday and says why; so do 1 week later ▶▶ and ◀ 1 work day earlier', await (async () => {
    const still = (await solo()).sel;
    await page.evaluate(() => { _said.length = 0; const i = $('schStart'); i.value = schedAddDays(window._mon, 12); i.dispatchEvent(new Event('change')); }); await page.waitForTimeout(120);
    const a = await starts(), why = await page.evaluate(() => _said.slice());
    await tap('^1 week later ▶▶$'); await page.waitForTimeout(100); const b = await starts();
    await tap('^◀ 1 work day earlier$'); await page.waitForTimeout(100); const c = await starts();
    const rest = x => ['B', 'C', 'D', 'E', 'F'].every(k => x[k] === base[k]);
    return still && a.A === 14 && why.some(m => /^🔓 Only the one he moves now starts Mon .+ \(Sat .+ is not a work day for this step\) — nothing else moved$/.test(m)) && rest(a) && b.A === 21 && rest(b) && c.A === 17 && rest(c) && (await solo()).sel;
  })(), JSON.stringify({ at: await starts(), said: await page.evaluate(() => _said.slice()) }));
  ok('a ✓ done step never moves, linked or not — it says so, and nothing else moves either', await (async () => {
    await openRow('E'); await page.waitForTimeout(100);
    const linked = !(await solo()).sel;
    await page.evaluate(() => { _said.length = 0; }); const before = await starts(); await tap('^1 work day later ▶$'); await page.waitForTimeout(100); const mid = await starts();
    const said1 = await page.evaluate(() => _said.some(m => /^✓ a done one is done — a done step never moves/.test(m)));
    await page.evaluate(() => { $('schSolo').click(); _said.length = 0; }); await page.waitForTimeout(80);
    await tap('^1 work day later ▶$'); await page.waitForTimeout(100); const after = await starts();
    const r = linked && JSON.stringify(before) === JSON.stringify(mid) && said1 && JSON.stringify(before) === JSON.stringify(after) && await page.evaluate(() => _said.some(m => /^✓ a done one is done — a done step never moves/.test(m)));
    await page.evaluate(() => $('schSolo').click()); await page.waitForTimeout(60);   // (linked again — the done one is not counted as unlinked either way)
    return r;
  })(), await page.evaluate(() => JSON.stringify(_said)));

  console.log('— 🔗 v7.75: it stays as he set it —');
  ok('open another step: THAT one is linked, and the first is still 🔓 on its row; open the first again: UNLINKED; ▴ Fold and open it: UNLINKED; pick another job and come back: UNLINKED; the window opened again: UNLINKED', await (async () => {
    await openRow('B'); await page.waitForTimeout(80); const other = (await solo()).sel, rowA = await rowSays('A');
    await openRow('A'); await page.waitForTimeout(80); const again = (await solo()).sel;
    await tap('^▴ Fold$'); await page.waitForTimeout(80); await openRow('A'); await page.waitForTimeout(80); const folded = (await solo()).sel;
    await page.evaluate(() => { $('schedJob').value = 'Pine Cabin'; $('schedJob').dispatchEvent(new Event('change')); $('schedJob').value = 'Oak House'; $('schedJob').dispatchEvent(new Event('change')); }); await page.waitForTimeout(100); await openRow('A'); await page.waitForTimeout(80); const picked = (await solo()).sel;
    await page.evaluate(() => { closeReview(); openSchedule('Oak House'); _schedOpen = 'A'; renderSchedule(); }); await page.waitForTimeout(100); const reopened = (await solo()).sel;
    return !other && rowA === '🔓 unlinked' && again && folded && picked && reopened;
  })());
  ok('while it is unlinked no OTHER step\'s move takes it along: the early one a week later takes the linked ones after it, and this one stays', await (async () => {
    const b0 = await starts();
    await page.evaluate(() => { schedMoveBy('Oak House', 'D', 1, 0); renderSchedule(); }); const b1 = await starts();
    await page.evaluate(() => { schedMoveBy('Oak House', 'D', -1, 0); renderSchedule(); }); const b2 = await starts();
    return b1.D === b0.D + 7 && b1.A === b0.A && b1.E === b0.E && b1.C === b0.C + 7 && b1.B === b0.B + 7 && b1.F === b0.F + 7 && JSON.stringify(b2) === JSON.stringify(b0);
  })(), JSON.stringify(await starts()));
  ok('the switch again links it: the row loses the words, the heading its count — and the rule is whole: a move on that step takes the later ones along once more', await (async () => {
    await page.evaluate(() => { _said.length = 0; $('schSolo').click(); }); await page.waitForTimeout(100);
    const s = await solo(), row = await rowSays('A'), said = await page.evaluate(() => _said.some(m => /^🔗 the one he moves is linked — a move takes the linked steps after it along$/.test(m)) && !document.querySelector('#schedBox .sch-band-h .sch-free-n'));
    await page.evaluate(() => { const i = $('schStart'); i.value = schedAddDays(window._mon, 7); i.dispatchEvent(new Event('change')); }); await page.waitForTimeout(100);   // back beside the sub, where it began (nothing starts on or after it but the linked ones)
    const b0 = await starts(); await tap('^1 week later ▶▶$'); await page.waitForTimeout(100); const b1 = await starts(); await tap('^◀ 1 work day earlier$'); await page.waitForTimeout(60);
    const later = Object.keys(b0).filter(k => k !== 'E' && k !== 'A' && b0[k] >= b0.A);
    return !s.sel && s.pressed === 'false' && row === '' && said && later.length >= 3 && b1.A === b0.A + 7 && later.every(k => b1[k] > b0[k]) && b1.D === b0.D && b1.E === b0.E;
  })(), JSON.stringify(await starts()));

  console.log('— 🧱 what it is —');
  ok('the link is HIS: it is in his own plan (one mark on that step, none on a linked one) — and never in the crew\'s copy, their page\'s cut or a key on the device', await page.evaluate(() => { clearTimeout(_schedPubT); schedLinkToggle('Oak House', 'A');
    const keys = id => Object.keys(schedSteps('Oak House').find(s => s.id === id)).sort().join(',');
    const r = keys('A') === 'days,done,free,id,n,note,sid,start,who' && keys('B') === 'days,done,id,n,note,sid,start,who' && prefs.sched.jobs['Oak House'].steps.find(s => s.id === 'A').free === 1
      && !/free|unlink|solo/i.test(JSON.stringify(schedPublish())) && !/free|unlink|solo/i.test(JSON.stringify(schedPageCut('Oak House'))) && Object.keys(localStorage).every(k => !/solo|link/i.test(k));
    return r; }));
  ok('the 👁 crew preview reads the step: no switch, no 🔓 on a row, and a move asked for outright moves nothing', await page.evaluate(() => { crewPreview = true; _schedOpen = 'A'; renderSchedule(); const a = !$('schSolo') && !$('schLinks') && !!document.querySelector('#schedBox .sch-edit-ro') && !document.querySelector('#schedBox .sch-freew'); const was = schedSteps('Oak House').find(s => s.id === 'A').start; const m = schedMove('Oak House', 'A', 1, true); const b = m.length === 0 && schedLinkToggle('Oak House', 'A') === null && schedSteps('Oak House').find(s => s.id === 'A').start === was && schedSteps('Oak House').find(s => s.id === 'A').free === 1; crewPreview = false; _schedOpen = null; renderSchedule(); closeReview(); return a && b; }));

  console.log('— 👷 a field phone (Kevin) —');
  await page.evaluate(() => { localStorage.setItem('daylog-crew-name', 'Kevin'); localStorage.removeItem('daylog-crew-office');
    const d = new Date(), iso = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    localStorage.setItem('daylog-crew-sched', JSON.stringify({ jobs: { 'Oak House': { steps: [{ id: 's1', n: 'framing', days: 6, who: 'crew', start: iso, done: '' }, { id: 's2', n: 'drywall', days: 10, who: 'sub', start: iso, done: '' }] } } }));
    localStorage.setItem('daylog-dbx', JSON.stringify({ appKey: 'k', refreshToken: 'test-token', accessToken: 'a', expiresAt: Date.now() + 3600000 })); });
  await page.reload(); await page.waitForTimeout(900); await stub();
  ok('a crew phone reads a step with no switch on it; nothing can be moved or unlinked there; nothing written', await (async () => {
    await page.evaluate(() => { jobs = ['Oak House']; window._ups.length = 0; window._saves = 0; openSchedule('Oak House'); document.querySelector('#schedBox .sch-lab').click(); }); await page.waitForTimeout(250);
    return await page.evaluate(() => { const was = schedSteps('Oak House').map(s => s.start).join(); const r = CREW_NAME === 'Kevin' && !$('schSolo') && !$('schLinks') && !!document.querySelector('#schedBox .sch-edit-ro') && schedMove('Oak House', 's1', 1, true).length === 0 && schedMove('Oak House', 's1', 1).length === 0 && schedLinkAll('Oak House', false) === 0 && schedLinkFrom('Oak House', 's1') === null && schedSteps('Oak House').map(s => s.start).join() === was && window._saves === 0 && window._ups.filter(p => !/pending\.json$/.test(p)).length === 0; closeReview(); return r; });
  })());
  await page.evaluate(() => { localStorage.removeItem('daylog-crew-name'); localStorage.removeItem('daylog-crew-sched'); });

  ok('the homeowner\'s page has no word of it', !/schedSolo|sch-solo|schLinks|sch-freew/.test(csrc));
  ok('version bumped — APP_VER and the footer agree', /const APP_VER = 'v7\.(7[3-9]|[89]\d)'/.test(src) && new RegExp('<footer>' + (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1].replace('.', '\\.') + ' ·').test(src));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
