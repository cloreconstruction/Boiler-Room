// 🗓 v7.76 — THE DAYS ARE WORK DAYS. Eric: "when i put in number of days for the category i'm only counting work days, m-t for
// crew, m-f for subs, if a category crossed over a weekend i want it to have the bar go over the weekend but its crossed out with
// diagnal black and yellow bar for sat and sun. that way the category continues but the weekend isn't counted".
// A step's days are WORK days: the crew Mon–Thu, a sub or an inspection Mon–Fri, the homeowner's and a step with no "who" every
// day; the six holidays are nobody's. A step ends on its last work day, so its bar runs across the days in between — striped
// black and yellow. A step never starts on a day it does not work. A move is counted in work days and what it takes along keeps
// its place behind the step before it. A book written in calendar days is converted once, every step ending where it did.
// The MATH is pinned on fixed days of October–December 2026 (Oct 5 is a Monday; Thanksgiving is Thu Nov 26); the CHART is drawn on
// days worked out from a Monday with no holiday near it, so the checks hold whenever they run. Every name below is made up.
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
    window._pubs = 0; window.publishSharedNotes = async () => { window._pubs++; };
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
    delete prefs.subs; prefs.sched = { wd: 1, jobs: {} }; delete prefs.schedTaken; prefs.cards = {}; _portalIdx = null; _cardJob = '';
    localStorage.removeItem('daylog-sched-shade'); localStorage.removeItem('daylog-sched-zoom'); _schedShade = { we: false, fr: false, ho: false }; _schedZoom = 1; _schedWho = '';
    renderJobSelects(); closePanels(); renderAll(); clearTimeout(_schedPubT); _schedPubT = null; window._saves = 0; window._pubs = 0; window._ups.length = 0; _said.length = 0;
  });

  console.log('— 🗓 the work week —');
  ok('who works which day: the crew Mon–Thu, a sub and an inspection Mon–Fri, the homeowner and a step with no "who" every day; a holiday is nobody\'s work day (the homeowner\'s and the no-who step still count it)', await page.evaluate(() => {
    const wk = who => ['2026-10-05', '2026-10-06', '2026-10-07', '2026-10-08', '2026-10-09', '2026-10-10', '2026-10-11'].map(d => schedWorks(who, d) ? 'x' : '-').join('');   // Mon … Sun
    return wk('crew') === 'xxxx---' && wk('sub') === 'xxxxx--' && wk('inspection') === 'xxxxx--' && wk('homeowner') === 'xxxxxxx' && wk('') === 'xxxxxxx'
      && !schedWorks('crew', '2026-11-26') && !schedWorks('sub', '2026-11-26') && !schedWorks('inspection', '2026-11-26') && schedWorks('homeowner', '2026-11-26') && schedWorks('', '2026-11-26') && schedWorks('sub', '2026-11-27') && !schedWorks('sub', '2026-12-25')
      && schedWeekWord('crew') === 'Mon–Thu' && schedWeekWord('sub') === 'Mon–Fri' && schedWeekWord('inspection') === 'Mon–Fri' && schedWeekWord('homeowner') === '' && schedWeekWord('') === ''; }));
  ok('a step ENDS on its last work day: the crew\'s 4 days from a Monday end Thursday and its 5th is the next Monday; a sub\'s 5 end Friday, its 6th Monday; over Thanksgiving the day is skipped; a step that counts every day ends n − 1 days on', await page.evaluate(() => { const e = (who, start, days) => schedEnd({ who, start, days });
    return e('crew', '2026-10-05', 4) === '2026-10-08' && e('crew', '2026-10-05', 5) === '2026-10-12' && e('crew', '2026-10-05', 1) === '2026-10-05' && e('crew', '2026-10-08', 2) === '2026-10-12'
      && e('sub', '2026-10-05', 5) === '2026-10-09' && e('sub', '2026-10-05', 6) === '2026-10-12' && e('sub', '2026-10-09', 2) === '2026-10-12' && e('inspection', '2026-10-09', 1) === '2026-10-09'
      && e('crew', '2026-11-25', 3) === '2026-12-01' && e('sub', '2026-11-25', 2) === '2026-11-27'
      && e('homeowner', '2026-10-10', 3) === '2026-10-12' && e('', '2026-10-09', 7) === '2026-10-15' && e('', '2026-11-25', 3) === '2026-11-27'; }));
  ok('the next work day, either way: the crew\'s Friday → Monday (or back to Thursday); a sub\'s Saturday → Monday; Thanksgiving → the crew\'s Monday, a sub\'s Friday; a day that is worked stays', await page.evaluate(() =>
    schedWorkOn('crew', '2026-10-09', 1) === '2026-10-12' && schedWorkOn('crew', '2026-10-09', -1) === '2026-10-08' && schedWorkOn('crew', '2026-10-11', 1) === '2026-10-12' && schedWorkOn('sub', '2026-10-10', 1) === '2026-10-12' && schedWorkOn('sub', '2026-10-10', -1) === '2026-10-09'
      && schedWorkOn('crew', '2026-11-26', 1) === '2026-11-30' && schedWorkOn('sub', '2026-11-26', 1) === '2026-11-27' && schedWorkOn('crew', '2026-10-07', 1) === '2026-10-07' && schedWorkOn('homeowner', '2026-10-10', 1) === '2026-10-10' && schedWorkOn('', '2026-10-11', 1) === '2026-10-11'));
  ok('typed days: a WEEK is as many days as that kind of step works — the crew\'s 4, a sub\'s or an inspection\'s 5, 7 for the rest; days are days', await page.evaluate(() =>
    [schedDaysOf('1 week', 'crew'), schedDaysOf('1 week', 'sub'), schedDaysOf('1 week', 'inspection'), schedDaysOf('1 week', 'homeowner'), schedDaysOf('1 week', ''), schedDaysOf('1.5 weeks', 'crew'), schedDaysOf('1.5 weeks', 'sub'), schedDaysOf('2 wk', 'crew'), schedDaysOf('2-3 days', 'crew'), schedDaysOf('6', 'sub')].join('|') === '4|5|5|7|7|6|8|8|3|6'));
  ok('the days inside a step that are NOT worked, as runs: the crew\'s 6 from a Monday cover 9 days with Fri–Sun (3) in the middle; a sub\'s 7 from a Thursday cover 9 with the weekend (2); the crew over Thanksgiving: Thu–Sun (4); a step that counts every day has none', await page.evaluate(() => { const r = (who, start, days) => { const s = { who, start, days }; return schedSpanDays(s) + ':' + schedOffRuns(s).map(x => x.from + '+' + x.n).join(','); };
    return r('crew', '2026-10-05', 6) === '9:4+3' && r('sub', '2026-10-08', 7) === '9:2+2' && r('crew', '2026-11-25', 3) === '7:1+4' && r('crew', '2026-10-05', 4) === '4:' && r('sub', '2026-10-05', 5) === '5:' && r('', '2026-10-09', 7) === '7:' && r('homeowner', '2026-10-10', 2) === '2:' && r('crew', '2026-10-05', 9) === '15:4+3,11+3'; }));

  console.log('— 🔄 a book written in calendar days —');
  const CAL = { jobs: { 'Oak House': { steps: [
    { id: 'c1', n: 'crew mon to fri', days: 5, who: 'crew', start: '2026-10-05', done: '', note: 'his note', sid: '' },        // Mon → Fri: the crew's work days in it are Mon–Thu
    { id: 'c2', n: 'sub wed to wed', days: 8, who: 'sub', start: '2026-10-07', done: '', note: '', sid: 'sX' },               // Wed → the next Wed
    { id: 'c3', n: 'crew starts saturday', days: 5, who: 'crew', start: '2026-10-10', done: '', note: '', sid: '' },          // Sat → Wed
    { id: 'c4', n: 'inspection on a sunday', days: 1, who: 'inspection', start: '2026-10-18', done: '', note: '', sid: '' },
    { id: 'c5', n: 'move in', days: 2, who: 'homeowner', start: '2026-12-19', done: '', note: '', sid: '' },                  // Sat → Sun: every day counts
    { id: 'c6', n: 'cure', days: 7, who: '', start: '2026-10-09', done: '', note: '', sid: '' },
    { id: 'c7', n: 'done crew', days: 3, who: 'crew', start: '2026-09-28', done: '2026-09-30', note: '', sid: '' },
    { id: 'c8', n: 'crew sat and sun only', days: 2, who: 'crew', start: '2026-10-24', done: '', note: '', sid: '' } ] } } };
  ok('it is converted ONCE, in memory: every step keeps the last day it had (the crew\'s Friday end is its Thursday), its days become the work days inside its span, a start on a day off goes to the first work day in it; a step that counts every day is untouched; the book says wd', await page.evaluate(cal => {
    prefs.sched = JSON.parse(JSON.stringify(cal)); window._saves = 0; window._pubs = 0; clearTimeout(_schedPubT); _schedPubT = null;
    const st = Object.fromEntries(schedSteps('Oak House').map(s => [s.id, s.start + ' ' + s.days + ' ' + schedEnd(s)]));
    return prefs.sched.wd === 1 && st.c1 === '2026-10-05 4 2026-10-08' && st.c2 === '2026-10-07 6 2026-10-14' && st.c3 === '2026-10-12 3 2026-10-14' && st.c4 === '2026-10-19 1 2026-10-19' && st.c5 === '2026-12-19 2 2026-12-20' && st.c6 === '2026-10-09 7 2026-10-15' && st.c7 === '2026-09-28 3 2026-09-30' && st.c8 === '2026-10-26 1 2026-10-26'
      && schedSteps('Oak House').find(s => s.id === 'c1').note === 'his note' && schedSteps('Oak House').find(s => s.id === 'c2').sid === 'sX' && schedSteps('Oak House').find(s => s.id === 'c7').done === '2026-09-30'; }, CAL),
    await page.evaluate(() => JSON.stringify(schedSteps('Oak House').map(s => [s.id, s.start, s.days, schedEnd(s)]))));
  ok('the conversion pushes NOTHING by itself: no save of his file, no publish to the crew, no upload (it rides his next change — a push before the first pull could write over a newer copy)', await (async () => { await page.waitForTimeout(900); return await page.evaluate(() => window._saves === 0 && window._pubs === 0 && window._ups.length === 0 && _schedPubT === null); })());
  ok('…and never twice: the book read again, and again after a round trip through his file, is as it was', await page.evaluate(() => { const a = JSON.stringify(schedSteps('Oak House')); schedBook(); schedBook(); prefs.sched = JSON.parse(JSON.stringify(prefs.sched)); const b = JSON.stringify(schedSteps('Oak House')); return a === b && prefs.sched.wd === 1; }));
  ok('a phone with no book yet starts in work days at once', await page.evaluate(() => { const keep = prefs.sched; delete prefs.sched; const b = schedBook(); const r = b.wd === 1 && Object.keys(b.jobs).length === 0 && schedWd(); prefs.sched = keep; return r; }));

  console.log('— ➕ making and changing a step —');
  await page.evaluate(() => { prefs.sched = { wd: 1, jobs: {} }; window._saves = 0; });
  ok('a new step starts on a day it works: the crew\'s step asked for a Saturday starts the Monday; the next one typed starts on ITS first work day after that one ends (a sub the Friday after the crew\'s Thursday); "1 week" is 5 of a sub\'s days', await page.evaluate(() => {
    const a = schedAddStep('Pine Cabin', 'frame', '4', 'crew', '2026-10-03'), b = schedAddStep('Pine Cabin', 'plumbing rough-in', '1 week'), c = schedAddStep('Pine Cabin', 'floors', '2', 'crew');
    return a.start === '2026-10-05' && schedEnd(a) === '2026-10-08' && b.who === 'sub' && b.start === '2026-10-09' && b.days === 5 && schedEnd(b) === '2026-10-15' && c.start === '2026-10-19' && schedEnd(c) === '2026-10-20'; }), await page.evaluate(() => JSON.stringify(schedSteps('Pine Cabin').map(s => [s.n, s.start, s.days]))));
  ok('who → the crew on a step that starts on a Friday moves its start to the Monday (the crew is off Fridays) and keeps its days; a start set to a Saturday lands on the Monday; a step that counts every day takes the Saturday', await page.evaluate(() => { const id = schedSteps('Pine Cabin')[1].id;
    schedSet('Pine Cabin', id, 'who', 'crew'); const a = schedSteps('Pine Cabin')[1]; const r1 = a.start === '2026-10-12' && a.days === 5 && a.who === 'crew';
    schedSet('Pine Cabin', id, 'who', 'sub'); schedSet('Pine Cabin', id, 'start', '2026-10-10'); const b = schedSteps('Pine Cabin')[1]; const r2 = b.start === '2026-10-12';
    schedSet('Pine Cabin', id, 'who', ''); schedSet('Pine Cabin', id, 'start', '2026-10-10'); const c = schedSteps('Pine Cabin')[1]; const r3 = c.start === '2026-10-10' && schedEnd(c) === '2026-10-14';
    schedSet('Pine Cabin', id, 'days', '2 weeks'); const d = schedSteps('Pine Cabin')[1].days;   // no "who": a week is seven
    return r1 && r2 && r3 && d === 14; }));

  console.log('— ⇄ a move, in work days —');
  const PLAN = { wd: 1, jobs: { 'Pine Cabin': { steps: [
    { id: 'frame', n: 'frame', days: 4, who: 'crew', start: '2026-10-05', done: '', note: '', sid: '' },          // Mon → Thu
    { id: 'gutters', n: 'gutters', days: 2, who: 'sub', start: '2026-10-05', done: '', note: '', sid: '' },      // beside it: Mon, Tue
    { id: 'plumb', n: 'plumb', days: 3, who: 'sub', start: '2026-10-09', done: '', note: '', sid: '' },          // the Friday after the crew ends → Tue
    { id: 'floors', n: 'floors', days: 2, who: 'crew', start: '2026-10-14', done: '', note: '', sid: '' },       // the day after the plumber ends: Wed, Thu
    { id: 'movein', n: 'move in', days: 1, who: 'homeowner', start: '2026-10-16', done: '', note: '', sid: '' }, // the day after the floors
    { id: 'gap', n: 'a week and a day later', days: 1, who: 'sub', start: '2026-10-26', done: '', note: '', sid: '' },   // six of a sub's work days after the move-in
    { id: 'early', n: 'before all of it', days: 2, who: 'crew', start: '2026-09-28', done: '', note: '', sid: '' },
    { id: 'done', n: 'done in the middle', days: 1, who: 'sub', start: '2026-10-12', done: '2026-10-12', note: '', sid: '' } ] } } };
  const at = () => page.evaluate(() => Object.fromEntries(schedSteps('Pine Cabin').map(s => [s.id, s.start.slice(5)])));
  await page.evaluate(plan => { prefs.sched = JSON.parse(JSON.stringify(plan)); }, PLAN);
  const P0 = { frame: '10-05', gutters: '10-05', plumb: '10-09', floors: '10-14', movein: '10-16', gap: '10-26', early: '09-28', done: '10-12' };
  ok('one work day later on the crew\'s step: it goes to Tuesday and now ends the next MONDAY — and everything behind it keeps its place: the plumber still comes the day after the crew ends (Tue), the floors the crew\'s next day after the plumber (the Monday after), the move-in the day after that, the last one its six work days on; the one beside it goes a day of its own; the earlier one and the done one stay', await (async () => {
    const n = await page.evaluate(() => schedMove('Pine Cabin', 'frame', 1).map(s => s.id).join('|'));
    const a = await at();
    return n === 'frame|gutters|plumb|floors|movein|gap' && JSON.stringify(a) === JSON.stringify({ frame: '10-06', gutters: '10-06', plumb: '10-13', floors: '10-19', movein: '10-21', gap: '10-29', early: '09-28', done: '10-12' }) && await page.evaluate(() => schedEnd(schedSteps('Pine Cabin').find(s => s.id === 'frame')) === '2026-10-12');
  })(), JSON.stringify(await at()));
  ok('one work day earlier puts every step back exactly where it was', await (async () => { await page.evaluate(() => schedMove('Pine Cabin', 'frame', -1)); return JSON.stringify(await at()) === JSON.stringify(P0); })(), JSON.stringify(await at()));
  ok('one WEEK later is the same weekday for every step taken along — and a week earlier puts them back', await (async () => {
    await page.evaluate(() => schedMoveBy('Pine Cabin', 'frame', 1, 0)); const a = await at();
    await page.evaluate(() => schedMoveBy('Pine Cabin', 'frame', -1, 0)); const b = await at();
    return JSON.stringify(a) === JSON.stringify({ frame: '10-12', gutters: '10-12', plumb: '10-16', floors: '10-21', movein: '10-23', gap: '11-02', early: '09-28', done: '10-12' }) && JSON.stringify(b) === JSON.stringify(P0);
  })(), JSON.stringify(await at()));
  ok('a typed start day (the Wednesday of the week after): the step goes there, the one beside it the same week-and-two-days of its own, and the rest keep their places behind it', await (async () => {
    await page.evaluate(() => { _said.length = 0; schedStartSet('Pine Cabin', 'frame', '2026-10-14'); }); const a = await at();
    const said = await page.evaluate(() => _said.slice());
    await page.evaluate(() => schedStartSet('Pine Cabin', 'frame', '2026-10-05')); const b = await at();
    return JSON.stringify(a) === JSON.stringify({ frame: '10-14', gutters: '10-14', plumb: '10-21', floors: '10-26', movein: '10-28', gap: '11-05', early: '09-28', done: '10-12' }) && JSON.stringify(b) === JSON.stringify(P0)
      && said.some(m => /^📅 frame now starts Wed Oct 14 · 5 linked steps after it moved along · the last step ends Thu Nov 5$/.test(m));
  })(), JSON.stringify({ at: await at(), said: await page.evaluate(() => _said.slice()) }));
  ok('a typed SUNDAY for the crew\'s step lands on the Monday and says why; typed onto the day it is already on, nothing moves', await (async () => {
    await page.evaluate(() => { _said.length = 0; schedStartSet('Pine Cabin', 'frame', '2026-10-11'); }); const a = await at(), s1 = await page.evaluate(() => _said.slice());
    await page.evaluate(() => { _said.length = 0; window._saves = 0; schedStartSet('Pine Cabin', 'frame', '2026-10-10'); }); const b = await at(), s2 = await page.evaluate(() => ({ said: _said.slice(), saves: window._saves }));   // Saturday → the same Monday it is on
    await page.evaluate(() => schedStartSet('Pine Cabin', 'frame', '2026-10-05'));
    return a.frame === '10-12' && s1.some(m => /^📅 frame now starts Mon Oct 12 \(Sun Oct 11 is not a work day for this step\) · 5 linked steps/.test(m)) && b.frame === '10-12' && s2.saves === 0 && s2.said.some(m => m === 'Sat Oct 10 is not a work day for this step — it stays on Mon Oct 12') && JSON.stringify(await at()) === JSON.stringify(P0);
  })(), JSON.stringify(await at()));
  ok('a move across THANKSGIVING: the crew\'s Wednesday + 1 work day is the Monday after (Thu the holiday, Fri–Sun its days off); a sub\'s is the Friday', await page.evaluate(() => schedShift({ who: 'crew', start: '2026-11-25' }, 0, 1).start === '2026-11-30' && schedShift({ who: 'sub', start: '2026-11-25' }, 0, 1).start === '2026-11-27' && schedShift({ who: 'crew', start: '2026-11-30' }, 0, -1).start === '2026-11-25'
    && schedShift({ who: 'crew', start: '2026-11-19' }, 1, 0).start === '2026-11-30' && schedShift({ who: '', start: '2026-11-25' }, 0, 1).start === '2026-11-26'));   // (a week later onto the holiday itself goes to the next work day)
  ok('the whole job a week later: every open step the same weekday next week, the done one stays', await (async () => {
    await page.evaluate(() => schedMoveJob('Pine Cabin', 7)); const a = await at();
    await page.evaluate(() => schedMoveJob('Pine Cabin', -7));
    return JSON.stringify(a) === JSON.stringify({ frame: '10-12', gutters: '10-12', plumb: '10-16', floors: '10-21', movein: '10-23', gap: '11-02', early: '10-05', done: '10-12' }) && JSON.stringify(await at()) === JSON.stringify(P0);
  })(), JSON.stringify(await at()));

  console.log('— ▨ the chart —');
  await page.evaluate(() => {
    let mon = schedAddDays(schedMonday(localDay(new Date())), 7);
    const clear = m => { for (let i = 0; i < 35; i++) if (schedHolidayOf(schedAddDays(m, i))) return false; return true; };
    for (let i = 0; i < 20 && !clear(mon); i++) mon = schedAddDays(mon, 7);
    const d = n => schedAddDays(mon, n), put = (job, x) => schedPlan(job, true).steps.push(schedClean(x));
    window._mon = mon; prefs.sched = { wd: 1, jobs: {} };
    put('Oak House', { id: 'k6', n: 'crew six', start: d(0), days: 6, who: 'crew' });            // Mon–Thu, Mon, Tue: Fri–Sun struck through
    put('Oak House', { id: 's5', n: 'sub week', start: d(0), days: 5, who: 'sub' });             // Mon–Fri: nothing to strike
    put('Oak House', { id: 's7', n: 'sub seven', start: d(3), days: 7, who: 'sub' });            // Thu, Fri, the weekend, Mon–Fri
    put('Oak House', { id: 'cu', n: 'cure', start: d(4), days: 7, who: '' });                    // every day counts
    put('Oak House', { id: 'wt', n: 'walk through', start: d(12), days: 1, who: 'homeowner' });  // a Saturday
    put('Oak House', { id: 'fi', n: 'final', start: d(14), days: 1, who: 'inspection' });
    clearTimeout(_schedPubT); _schedPubT = null; _said.length = 0;
    openSchedule('Oak House');
  });
  await page.waitForTimeout(300);
  const row = n => page.evaluate(n => { const l = [...document.querySelectorAll('#schedBox .sch-lab')].find(x => x.querySelector('b').textContent.replace(/^[✓⚠] /, '').trim() === n); return l ? l.querySelector('small').textContent.replace(/\s+/g, ' ').trim() : ''; }, n);
  const bar = n => page.evaluate(n => { const b = [...document.querySelectorAll('#schedBox .sch-bar')].find(x => x.textContent.trim() === n); if (!b) return null; const r = b.getBoundingClientRect();
    return { w: r.width, t: (b.querySelector('.sch-bar-t') || {}).textContent || '', title: b.title, xs: [...b.querySelectorAll('.sch-x')].map(x => { const q = x.getBoundingClientRect(); return { at: (q.left - r.left) / r.width, w: q.width / r.width, h: q.height / r.height }; }) }; }, n);
  const near = (a, b) => Math.abs(a - b) < 0.03;
  ok('the rows count WORK days in words for a step with a work week, plain days for one that counts every day, and give the day it really ends', await (async () => {
    const d = n => page.evaluate(n => schedShortWord(schedAddDays(window._mon, n)), n);
    return (await row('crew six')) === `${await d(0)} – ${await d(8)} · 6 work days · 👷 crew` && (await row('sub week')) === `${await d(0)} – ${await d(4)} · 5 work days · 🔧 sub` && (await row('sub seven')) === `${await d(3)} – ${await d(11)} · 7 work days · 🔧 sub`
      && (await row('cure')) === `${await d(4)} – ${await d(10)} · 7 days` && (await row('walk through')) === `${await d(12)} · 1 day · 🏠 homeowner` && (await row('final')) === `${await d(14)} · 1 work day · 📋 inspection`;
  })(), JSON.stringify([await row('crew six'), await row('cure'), await row('walk through'), await row('final')]));
  ok('the crew\'s six days: ONE bar from Monday to the Tuesday after — nine days wide — with Fri, Sat and Sun struck through in the middle of it (a third of the bar, four ninths in, the bar\'s whole height)', await (async () => {
    const b = await bar('crew six'), wkw = await page.evaluate(() => document.querySelector('#schedBox .sch-head span').getBoundingClientRect().width);
    return !!b && near(b.w / wkw, 9 / 7) && b.xs.length === 1 && near(b.xs[0].at, 4 / 9) && near(b.xs[0].w, 3 / 9) && b.xs[0].h > 0.85 && b.t === 'crew six' && /6 work days \(the striped days are not worked\)/.test(b.title);
  })(), JSON.stringify(await bar('crew six')));
  ok('a sub\'s seven from a Thursday: the weekend struck through (two ninths of the bar, two ninths in); a sub\'s Mon–Fri, a step that counts every day and the one-day marks wear no stripes', await (async () => {
    const s7 = await bar('sub seven'), s5 = await bar('sub week'), cu = await bar('cure');
    const marks = await page.evaluate(() => [...document.querySelectorAll('#schedBox .sch-bar.mark')].every(m => !m.querySelector('.sch-x')) && document.querySelectorAll('#schedBox .sch-bar.mark').length === 2);
    return s7.xs.length === 1 && near(s7.xs[0].at, 2 / 9) && near(s7.xs[0].w, 2 / 9) && s5.xs.length === 0 && !/striped/.test(s5.title) && cu.xs.length === 0 && marks && await page.evaluate(() => document.querySelectorAll('#schedBox .sch-x').length === 2);
  })(), JSON.stringify(await bar('sub seven')));
  ok('the stripes are black and yellow on a slant, and the step\'s name still reads across them: it sits OVER the stripes on a halo of the bar\'s own colour', await page.evaluate(() => { const x = document.querySelector('#schedBox .sch-x'), cs = getComputedStyle(x), t = x.parentElement.querySelector('.sch-bar-t'), ts = getComputedStyle(t);
    return /repeating-linear-gradient\(135deg/.test(cs.backgroundImage) && /rgb\(17, 17, 17\)/.test(cs.backgroundImage) && /rgb\(245, 196, 0\)/.test(cs.backgroundImage) && cs.position === 'absolute' && cs.pointerEvents === 'none'
      && ts.position === 'relative' && ts.zIndex === '1' && ts.textShadow !== 'none' && !!(x.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_FOLLOWING); }));
  ok('over the chart, in words: Days are WORK days — who works which, the holidays off, and what the stripes mean — with a striped key beside it; the top line says steps with work days', await page.evaluate(() => { const s = $('schWdSay');
    return !!s && s.textContent.trim() === 'Days are WORK days: 👷 crew Mon–Thu · 🔧 subs and 📋 inspections Mon–Fri · the holidays off. A bar runs across the days in between, striped black and yellow — those are not counted.' && !!s.querySelector('.sch-xkey') && /repeating-linear-gradient/.test(getComputedStyle(s.querySelector('.sch-xkey')).backgroundImage)
      && /A plan is a list of steps with work days\./.test($('schedBox').textContent) && document.querySelectorAll('#schedBox .sch-x').length === 2 && document.documentElement.scrollWidth <= innerWidth + 0.5; }));
  ok('the editor says whose week it counts: Work days (Mon–Thu) on the crew\'s step with ◀ 1 work day earlier · 1 work day later ▶; "2 weeks" typed there is 8; a sub\'s says Mon–Fri; a step that counts every day says so and moves by plain days', await (async () => {
    const ed = async id => { await page.evaluate(id => { _schedOpen = id; renderSchedule(); }, id); return page.evaluate(() => ({ l: $('schDaysL').textContent.trim(), mv: [...document.querySelectorAll('#schEdit .sch-moves')][0].textContent.replace(/\s+/g, ' ').trim() })); };
    const k = await ed('k6');
    await page.evaluate(() => { const i = $('schDays'); i.value = '2 weeks'; i.dispatchEvent(new Event('change')); }); await page.waitForTimeout(80);
    const days = await page.evaluate(() => { const s = schedSteps('Oak House').find(x => x.id === 'k6'); const n = s.days; schedSet('Oak House', 'k6', 'days', 6); return n; });
    const s = await ed('s7'), c = await ed('cu'), w = await ed('wt');
    await page.evaluate(() => { _schedOpen = null; renderSchedule(); });
    return k.l === 'Work days (Mon–Thu)' && k.mv === '◀ 1 work day earlier 1 work day later ▶ 1 week later ▶▶' && days === 8 && s.l === 'Work days (Mon–Fri)' && c.l === 'Days (every day counts)' && c.mv === '◀ 1 day earlier 1 day later ▶ 1 week later ▶▶' && w.l === 'Days (every day counts)';
  })());
  ok('with ☑ Weekends and ☑ Fridays shaded, no step with a work week is flagged (the crew\'s runs across its days off, the sub is at work on its Friday) — the Saturday walk-through, which counts every day, still says so', await (async () => {
    await page.evaluate(() => { _schedShade = { we: true, fr: true, ho: false }; renderSchedule(); }); await page.waitForTimeout(80);
    const r = await page.evaluate(() => Object.fromEntries([...document.querySelectorAll('#schedBox .sch-lab')].map(l => [l.querySelector('b').textContent.trim(), (l.querySelector('.sch-offw') || {}).textContent || ''])));
    await page.evaluate(() => { _schedShade = { we: false, fr: false, ho: false }; renderSchedule(); });
    return r['crew six'] === '' && r['sub week'] === '' && r['sub seven'] === '' && r['final'] === '' && r['walk through'] === '⚠ on a Sat' && /starts Fri/.test(r['cure']);
  })());

  console.log('— 👷 the crew\'s copy —');
  const pub = await page.evaluate(() => { clearTimeout(_schedPubT); _schedPubT = null; schedLinkToggle('Oak House', 'k6'); return JSON.stringify(schedPublish()); });
  ok('the copy sent to the crew says its days are work days and carries BOTH counts on a step — days = what its bar covers on the calendar (a phone still on the old build draws the right bar), wk = the work days; no link, no note', (() => { const j = JSON.parse(pub), st = Object.fromEntries(j.jobs['Oak House'].steps.map(s => [s.id, s]));
    return j.wd === 1 && st.k6.days === 9 && st.k6.wk === 6 && st.s5.days === 5 && st.s5.wk === 5 && st.s7.days === 9 && st.s7.wk === 7 && st.cu.days === 7 && st.cu.wk === 7 && Object.keys(st.k6).sort().join(',') === 'days,done,id,n,sid,start,who,wk' && !/free|note/.test(pub); })(), pub.slice(0, 300));
  ok('a crew phone on this build reads the work days out of it (days = wk, no wk left) and ends every step on the same day Eric\'s phone does', await page.evaluate(pub => { const mine = Object.fromEntries(schedSteps('Oak House').map(s => [s.id, s.days + ' ' + schedEnd(s)]));
    const b = schedCrewTake(JSON.parse(pub)); const st = b.jobs['Oak House'].steps; return b.wd === 1 && st.every(s => !('wk' in s)) && st.every(s => mine[s.id] === s.days + ' ' + schedEnd(s)) && st.find(s => s.id === 'k6').days === 6; }, pub));
  await page.evaluate(pub => { localStorage.setItem('daylog-crew-name', 'Kevin'); localStorage.removeItem('daylog-crew-office'); localStorage.setItem('daylog-crew-sched', JSON.stringify(schedCrewTake(JSON.parse(pub))));
    localStorage.setItem('daylog-dbx', JSON.stringify({ appKey: 'k', refreshToken: 'test-token', accessToken: 'a', expiresAt: Date.now() + 3600000 })); }, pub);
  await page.reload(); await page.waitForTimeout(900); await stub();
  ok('a field phone (a real reload as Kevin) draws the same chart read-only: 6 work days on the row, the stripes in the bar, the words over the chart — nothing written', await (async () => {
    await page.evaluate(() => { jobs = ['Oak House']; window._ups.length = 0; window._saves = 0; openSchedule('Oak House'); }); await page.waitForTimeout(250);
    return await page.evaluate(() => { const l = [...document.querySelectorAll('#schedBox .sch-lab')].find(x => /crew six/.test(x.textContent)); l.click();
      const r = CREW_NAME === 'Kevin' && / · 6 work days · 👷 crew$/.test(l.querySelector('small').textContent.replace(/\s+/g, ' ').trim()) && document.querySelectorAll('#schedBox .sch-x').length === 2 && !!$('schWdSay') && !document.querySelector('#schedBox .sch-tools') && !document.querySelector('#schedBox .sch-freew')
        && / · 6 work days · 👷 crew/.test(document.querySelector('#schedBox .sch-edit-ro').textContent) && window._saves === 0 && window._ups.filter(p => !/pending\.json$/.test(p)).length === 0; closeReview(); return r; });
  })());
  ok('a copy sent BEFORE this build (no wd) is read as it was written — calendar days, no stripes, no "work days" — until Eric\'s phone sends the new one', await (async () => {
    await page.evaluate(() => { const mon = (() => { const d = new Date(); d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + 7); return localDay(d); })();
      crewSched = { jobs: { 'Oak House': { steps: [{ id: 'o1', n: 'old framing', days: 9, who: 'crew', start: mon, done: '' }] } } }; openSchedule('Oak House'); }); await page.waitForTimeout(200);
    return await page.evaluate(() => { const l = document.querySelector('#schedBox .sch-lab small').textContent.replace(/\s+/g, ' ').trim(), s = schedSteps('Oak House')[0];
      const r = / · 9 days · 👷 crew$/.test(l) && schedEnd(s) === schedAddDays(s.start, 8) && !document.querySelector('#schedBox .sch-x') && !$('schWdSay') && !schedWd(); closeReview(); return r; });
  })());
  await page.evaluate(() => { localStorage.removeItem('daylog-crew-name'); localStorage.removeItem('daylog-crew-sched'); });
  await page.reload(); await page.waitForTimeout(900); await stub();

  console.log('— 📥 a plan dropped in from outside —');
  ok('a plan\'s days are CALENDAR days (the contract): each step is offered as the work days inside its span — the crew\'s Mon–Fri is 4, a Saturday start goes to the Monday; a plan that says "wd": 1 is taken as written', await page.evaluate(() => { prefs.sched = { wd: 1, jobs: {} }; jobs = ['Oak House', 'Pine Cabin'];
    const a = schedInboxClean({ id: 'p1', job: 'Oak House', steps: [{ n: 'frame', days: 5, who: 'crew', start: '2026-10-05' }, { n: 'tile', days: 12, who: 'sub', start: '2026-11-16' }, { n: 'sat start', days: 5, who: 'crew', start: '2026-10-10' }, { n: 'move in', days: 2, who: 'homeowner', start: '2026-12-19' }] });
    const b = schedInboxClean({ id: 'p2', job: 'Oak House', wd: 1, steps: [{ n: 'frame', days: 5, who: 'crew', start: '2026-10-05' }] });
    const f = s => s.start + ' ' + s.days + ' ' + schedEnd(s);
    return f(a.steps[0]) === '2026-10-05 4 2026-10-08' && f(a.steps[1]) === '2026-11-16 9 2026-11-27' && f(a.steps[2]) === '2026-10-12 3 2026-10-14' && f(a.steps[3]) === '2026-12-19 2 2026-12-20' && f(b.steps[0]) === '2026-10-05 5 2026-10-12' && schedInboxSpan(a) === 'Oct 5 to Dec 20'; }));

  ok('🧱 their page is told nothing new: the cut is still the names and three words — no day count, no date, no stripes', await page.evaluate(() => { schedAddStep('Oak House', 'frame', '6', 'crew'); const c = JSON.stringify(schedPageCut('Oak House')); clearTimeout(_schedPubT); return /"n":"frame"/.test(c) && !/days|wk|wd|start|work/.test(c.replace(/"at":"[^"]+"/, '')); }) && !/sch-x|schedWorks|work days/.test(csrc));
  ok('version bumped — APP_VER and the footer agree', /const APP_VER = 'v7\.(7[6-9]|[89]\d)'/.test(src) && new RegExp('<footer>' + (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1].replace('.', '\\.') + ' ·').test(src));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
