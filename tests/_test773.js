// 🔓 v7.73 — ONE STEP ON ITS OWN. Eric, nudging steps off the weekends: "how can i unlock a single item so i can move it without
// it moving everythig else". The rule stands (a move takes every step that starts on or after it) — but the open step's editor
// wears a switch: 🔗 LINKED ↔ 🔓 UNLOCKED — only this step moves. It is never stored: fold it or open another and it is linked.
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
  await page.evaluate(() => {
    jobs = ['Oak House', 'Pine Cabin', 'Internal / Admin']; crew = ['Phil', 'Kevin']; prefs.office = ['Phil']; entries = []; todos = []; nextId = 1;
    delete prefs.subs; prefs.sched = { jobs: {} }; delete prefs.schedTaken; prefs.cards = {}; _portalIdx = null; _cardJob = '';
    localStorage.removeItem('daylog-sched-shade'); localStorage.removeItem('daylog-sched-zoom'); _schedShade = { we: false, fr: false, ho: false }; _schedZoom = 1; _schedWho = '';
    const mon = schedAddDays(schedMonday(localDay(new Date())), 7), d = n => schedAddDays(mon, n), put = (job, x) => schedPlan(job, true).steps.push(schedClean(x));
    window._mon = mon;
    put('Oak House', { id: 'D', n: 'an early one', start: d(0), days: 3, who: 'crew' });
    put('Oak House', { id: 'A', n: 'starts on a saturday', start: d(5), days: 3, who: 'crew' });
    put('Oak House', { id: 'C', n: 'same day beside it', start: d(5), days: 4, who: 'sub' });
    put('Oak House', { id: 'E', n: 'a done one', start: d(6), days: 2, who: 'crew', done: d(6) });
    put('Oak House', { id: 'B', n: 'right after', start: d(8), days: 2, who: 'sub' });
    put('Oak House', { id: 'F', n: 'the last', start: d(14), days: 1, who: 'inspection' });
    put('Pine Cabin', { id: 'P', n: 'siding', start: d(1), days: 10, who: 'crew' });
    renderJobSelects(); closePanels(); renderAll(); clearTimeout(_schedPubT); window._saves = 0; window._ups.length = 0; _said.length = 0;
    openSchedule('Oak House');
  });
  await page.waitForTimeout(250);
  const starts = () => page.evaluate(() => Object.fromEntries(schedSteps('Oak House').map(s => [s.id, Math.round((schedDate(s.start) - schedDate(window._mon)) / 86400000)])));
  const openRow = id => page.evaluate(id => { const s = schedSteps('Oak House').find(x => x.id === id); const lab = [...document.querySelectorAll('#schedBox .sch-lab')].find(l => l.querySelector('b').textContent.replace(/^[✓⚠] /, '').trim() === s.n); lab.click(); }, id);
  const tap = re => page.evaluate(re => { const b = [...document.querySelectorAll('#schEdit button')].find(x => new RegExp(re).test(x.textContent.trim())); if (!b) return false; b.click(); return true; }, re);
  const solo = () => page.evaluate(() => { const b = $('schSolo'); return b ? { t: b.textContent.trim(), pressed: b.getAttribute('aria-pressed'), sel: b.classList.contains('sel'), say: $('schMoveSay').textContent.trim() } : null; });
  const base = await starts();

  console.log('— 🔗 linked, as ever —');
  await openRow('A'); await page.waitForTimeout(120);
  ok('a step\'s editor wears the switch over its move buttons — 🔗 LINKED to start (not pressed), a thumb tall, inside the phone; the line under the buttons says the rule', await (async () => {
    const s = await solo();
    const geo = await page.evaluate(() => { const b = $('schSolo'), r = b.getBoundingClientRect(), mv = [...document.querySelectorAll('#schEdit .sch-moves')][0]; return r.height >= 44 && r.left >= 0 && r.right <= innerWidth + 0.5 && !!(b.compareDocumentPosition(mv) & Node.DOCUMENT_POSITION_FOLLOWING) && document.documentElement.scrollWidth <= innerWidth + 0.5; });
    return !!s && s.t === '🔗 LINKED — a move takes every later step along · tap to unlock this one' && s.pressed === 'false' && !s.sel && /^A move takes this step and every step that starts on or after it\. A ✓ done step never moves\.$/.test(s.say) && geo;
  })(), JSON.stringify(await solo()));
  ok('linked, 1 day later ▶ takes every step that starts on or after it along (the one beside it, the ones after) — the earlier one and the done one stay; the toast counts them', await (async () => {
    await page.evaluate(() => { _said.length = 0; }); await tap('^1 day later ▶$'); await page.waitForTimeout(120);
    const a = await starts(), said = await page.evaluate(() => _said.slice());
    await tap('^◀ 1 day earlier$'); await page.waitForTimeout(120);
    const back = await starts();
    return a.A === base.A + 1 && a.C === base.C + 1 && a.B === base.B + 1 && a.F === base.F + 1 && a.D === base.D && a.E === base.E && said.some(m => /^📅 starts on a saturday and 3 steps after it moved 1 day later · the last step ends /.test(m)) && JSON.stringify(back) === JSON.stringify(base);
  })(), JSON.stringify(await starts()));

  console.log('— 🔓 unlocked —');
  ok('a tap on the switch: 🔓 UNLOCKED — only this step moves (pressed, lit), and the line under the buttons says so', await (async () => {
    await page.evaluate(() => $('schSolo').click()); await page.waitForTimeout(120);
    const s = await solo();
    return s.t === '🔓 UNLOCKED — only this step moves · tap to link it to the rest again' && s.pressed === 'true' && s.sel && /^🔓 Only this step moves — by the buttons or a typed start day\. Every other step stays where it is\./.test(s.say);
  })(), JSON.stringify(await solo()));
  ok('unlocked, 1 day later ▶ twice walks THIS step from Saturday to Monday — and nothing else moves: not the one beside it, not the ones after; the toast says only it moved, and to which day', await (async () => {
    await page.evaluate(() => { _said.length = 0; window._saves = 0; }); await tap('^1 day later ▶$'); await page.waitForTimeout(100); await tap('^1 day later ▶$'); await page.waitForTimeout(120);
    const a = await starts(), r = await page.evaluate(() => ({ said: _said.slice(), saves: window._saves, day: schedDayWord(schedSteps('Oak House').find(s => s.id === 'A').start) }));
    return a.A === base.A + 2 && ['B', 'C', 'D', 'E', 'F'].every(k => a[k] === base[k]) && r.said.length === 2 && r.said[1] === '🔓 Only starts on a saturday moved 1 day later · it starts ' + r.day + ' — nothing else moved' && /^Mon /.test(r.day) && r.saves >= 2;
  })(), JSON.stringify({ now: await starts(), base }));
  ok('it stays unlocked through its own moves; a typed start day moves only it too; so do 1 week later ▶▶ and ◀ 1 day earlier', await (async () => {
    const still = (await solo()).sel;
    await page.evaluate(() => { const i = $('schStart'); i.value = schedAddDays(window._mon, 9); i.dispatchEvent(new Event('change')); }); await page.waitForTimeout(120);
    const a = await starts();
    await tap('^1 week later ▶▶$'); await page.waitForTimeout(100); const b = await starts();
    await tap('^◀ 1 day earlier$'); await page.waitForTimeout(100); const c = await starts();
    const rest = x => ['B', 'C', 'D', 'E', 'F'].every(k => x[k] === base[k]);
    return still && a.A === 9 && rest(a) && b.A === 16 && rest(b) && c.A === 15 && rest(c) && (await solo()).sel;
  })(), JSON.stringify(await starts()));
  ok('with ☑ Weekends shaded: the step beside it still says ⚠ starts Sat, the one he walked off the weekend says nothing — one step fixed, the rest untouched', await (async () => {
    await page.evaluate(() => { const s = schedSteps('Oak House').find(x => x.id === 'A'); s.start = schedAddDays(window._mon, 7); _schedShade.we = true; renderSchedule(); }); await page.waitForTimeout(100);
    const r = await page.evaluate(() => Object.fromEntries([...document.querySelectorAll('#schedBox .sch-lab')].map(l => [l.querySelector('b').textContent.replace(/^[✓⚠] /, '').trim(), (l.querySelector('.sch-offw') || {}).textContent || ''])));
    await page.evaluate(() => { _schedShade.we = false; renderSchedule(); });
    return r['starts on a saturday'] === '' && r['same day beside it'] === '⚠ starts Sat';
  })());
  ok('a ✓ done step unlocked still never moves — and it says so, and nothing else moves either', await (async () => {
    await openRow('E'); await page.waitForTimeout(100);
    const linked = !(await solo()).sel;
    await page.evaluate(() => { $('schSolo').click(); _said.length = 0; }); await page.waitForTimeout(80);
    const before = await starts(); await tap('^1 day later ▶$'); await page.waitForTimeout(100); const after = await starts();
    return linked && JSON.stringify(before) === JSON.stringify(after) && await page.evaluate(() => _said.some(m => /^✓ a done one is done — a done step never moves/.test(m)));
  })(), await page.evaluate(() => JSON.stringify(_said)));

  console.log('— 🔗 it links again by itself —');
  ok('open another step and it is LINKED; ▴ Fold and open the first again: LINKED; pick another job and come back: LINKED; the window opened again: LINKED', await (async () => {
    await openRow('A'); await page.waitForTimeout(80); await page.evaluate(() => $('schSolo').click()); await page.waitForTimeout(80);
    const on = (await solo()).sel;
    await openRow('B'); await page.waitForTimeout(80); const other = (await solo()).sel;
    await openRow('A'); await page.waitForTimeout(80); const again = (await solo()).sel;
    await page.evaluate(() => $('schSolo').click()); await page.waitForTimeout(60); await tap('^▴ Fold$'); await page.waitForTimeout(80); await openRow('A'); await page.waitForTimeout(80); const folded = (await solo()).sel;
    await page.evaluate(() => $('schSolo').click()); await page.waitForTimeout(60);
    await page.evaluate(() => { $('schedJob').value = 'Pine Cabin'; $('schedJob').dispatchEvent(new Event('change')); $('schedJob').value = 'Oak House'; $('schedJob').dispatchEvent(new Event('change')); }); await page.waitForTimeout(100); await openRow('A'); await page.waitForTimeout(80); const picked = (await solo()).sel;
    await page.evaluate(() => { $('schSolo').click(); closeReview(); openSchedule('Oak House'); _schedOpen = 'A'; renderSchedule(); }); await page.waitForTimeout(100); const reopened = (await solo()).sel;
    return on && !other && !again && !folded && !picked && !reopened;
  })());
  ok('linked again, the rule is whole: a move on that step takes the later ones along once more', await (async () => {
    const b0 = await starts(); await tap('^1 day later ▶$'); await page.waitForTimeout(100); const b1 = await starts(); await tap('^◀ 1 day earlier$'); await page.waitForTimeout(100);
    const later = Object.keys(b0).filter(k => k !== 'E' && b0[k] >= b0.A);
    return later.length >= 3 && later.every(k => b1[k] === b0[k] + 1) && b1.D === b0.D && b1.E === b0.E;
  })(), JSON.stringify(await starts()));

  console.log('— 🧱 what it is not —');
  ok('the unlock is never stored: nothing of it in the plan, in the crew\'s copy, in their page\'s cut or on the device', await page.evaluate(() => { clearTimeout(_schedPubT); const keys = [...new Set(schedSteps('Oak House').flatMap(s => Object.keys(s)))].sort().join(',');
    return keys === 'days,done,id,n,note,sid,start,who' && !/solo|unlock/i.test(JSON.stringify(prefs.sched)) && !/solo|unlock/i.test(JSON.stringify(schedPublish())) && !/solo|unlock/i.test(JSON.stringify(schedPageCut('Oak House'))) && Object.keys(localStorage).every(k => !/solo/i.test(k)); }));
  ok('the 👁 crew preview reads the step: no switch, and a move asked for outright moves nothing', await page.evaluate(() => { crewPreview = true; _schedOpen = 'A'; renderSchedule(); const a = !$('schSolo') && !!document.querySelector('#schedBox .sch-edit-ro'); const was = schedSteps('Oak House').find(s => s.id === 'A').start; const m = schedMove('Oak House', 'A', 1, true); const b = m.length === 0 && schedSteps('Oak House').find(s => s.id === 'A').start === was; crewPreview = false; _schedOpen = null; renderSchedule(); closeReview(); return a && b; }));

  console.log('— 👷 a field phone (Kevin) —');
  await page.evaluate(() => { localStorage.setItem('daylog-crew-name', 'Kevin'); localStorage.removeItem('daylog-crew-office');
    const d = new Date(), iso = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    localStorage.setItem('daylog-crew-sched', JSON.stringify({ jobs: { 'Oak House': { steps: [{ id: 's1', n: 'framing', days: 6, who: 'crew', start: iso, done: '' }, { id: 's2', n: 'drywall', days: 10, who: 'sub', start: iso, done: '' }] } } }));
    localStorage.setItem('daylog-dbx', JSON.stringify({ appKey: 'k', refreshToken: 'test-token', accessToken: 'a', expiresAt: Date.now() + 3600000 })); });
  await page.reload(); await page.waitForTimeout(900); await stub();
  ok('a crew phone reads a step with no switch on it; nothing can be moved there, alone or with the rest; nothing written', await (async () => {
    await page.evaluate(() => { jobs = ['Oak House']; window._ups.length = 0; window._saves = 0; openSchedule('Oak House'); document.querySelector('#schedBox .sch-lab').click(); }); await page.waitForTimeout(250);
    return await page.evaluate(() => { const was = schedSteps('Oak House').map(s => s.start).join(); const r = CREW_NAME === 'Kevin' && !$('schSolo') && !!document.querySelector('#schedBox .sch-edit-ro') && schedMove('Oak House', 's1', 1, true).length === 0 && schedMove('Oak House', 's1', 1).length === 0 && schedSteps('Oak House').map(s => s.start).join() === was && window._saves === 0 && window._ups.filter(p => !/pending\.json$/.test(p)).length === 0; closeReview(); return r; });
  })());
  await page.evaluate(() => { localStorage.removeItem('daylog-crew-name'); localStorage.removeItem('daylog-crew-sched'); });

  ok('the homeowner\'s page has no word of it', !/schedSolo|sch-solo/.test(csrc));
  ok('version bumped — APP_VER and the footer agree', /const APP_VER = 'v7\.(7[3-9]|[89]\d)'/.test(src) && new RegExp('<footer>' + (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1].replace('.', '\\.') + ' ·').test(src));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
