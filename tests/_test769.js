// 📥 v7.69 — A PLAN WAITING FOR HIS TAP. Eric: "also the gantt schedule we made for mery project put that in the new calendar
// too". His plan lives in his prefs and his prefs ride in the log file his own devices write, so nothing outside the app may
// write it: a plan made elsewhere is dropped into App Data/sched-inbox.json, which the app only READS, and the 📅 Schedule
// window offers it — "📥 A plan is waiting for <job> … ✓ Put it on the schedule". His tap writes it into his own plan; a plan
// taken or turned down is never offered again. Every name and day below is made up; the dates are relative to today.
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

  // the fake Dropbox: one store; every read and every write is noted by its path
  const stub = () => page.evaluate(() => {
    window._saves = 0; window.scheduleSave = () => { window._saves++; };
    window._dbxFiles = window._dbxFiles || {}; window._ups = []; window._downs = [];
    window.dbxDownload = async p => { window._downs.push(p); return (window._dbxFiles || {})[p] ?? null; };
    window.dbxUpload = async (p, body) => { (window._dbxFiles || {})[p] = typeof body === 'string' ? body : '[file]'; window._ups.push(p); return { path_display: p }; };
    window.dbxPathExists = async p => Object.prototype.hasOwnProperty.call(window._dbxFiles || {}, p);
    window.dbxList = async () => ({ entries: [] });
    window.dbxRpc = async () => ({});
    window.pushOut = () => false; window.cpPush = () => {}; window.cpReload = () => {};
    if (!window._said) { window._said = []; const t0 = window.toast; window.toast = (m, g) => { if (m) _said.push(String(m)); return t0(m, g); }; }
    dbx.refreshToken = 'test-token';
  });
  await stub();
  await page.evaluate(() => {
    jobs = ['Oak House', 'Pine Cabin', 'Internal / Admin']; crew = ['Phil', 'Kevin']; prefs.office = ['Phil']; entries = []; todos = []; nextId = 1;
    delete prefs.subs; prefs.sched = { jobs: {} }; delete prefs.schedTaken; prefs.cards = {}; _portalIdx = null; _cardJob = ''; _schedInbox = null;
    localStorage.removeItem('daylog-cardjob'); localStorage.removeItem('daylog-schedinbox-told');
    renderJobSelects(); closePanels(); renderAll(); window._ups.length = 0; window._downs.length = 0; _said.length = 0;
  });
  const INBOX = await page.evaluate(() => schedInboxPath());
  const day = n => page.evaluate(n => schedAddDays(localDay(new Date()), n), n);
  // 🗓 v7.76 — the days are work days and a step starts on a day it works: the plan's days hang off NEXT WEEK'S MONDAY, so they are
  // weekdays whenever this runs (d3 a Monday, d5 the Wednesday, d12 and d13 the Tuesday and Wednesday after, d20 the Monday after that)
  const mon = await page.evaluate(() => schedMonday(schedAddDays(localDay(new Date()), 7)));
  const from = n => page.evaluate(([m, n]) => schedAddDays(m, n), [mon, n]);
  const d3 = await from(0), d5 = await from(2), d12 = await from(8), d13 = await from(9), d20 = await from(14), dm2 = await day(-2);
  const snap = (who, d) => page.evaluate(([who, d]) => schedWorkOn(who, d, 1), [who, d]);   // (a holiday on one of those days moves the step to its next work day)
  const today = await page.evaluate(() => localDay(new Date()));
  const oakPlan = { id: 'oak-finish-1', job: 'oak house', from: 'Claude', at: today, note: 'the finish sheet', steps: [
    { n: 'Shingles', days: 5, who: 'sub', start: d3, sid: 'sNOT-HIS' },
    { n: 'Framing wrap-up', days: 5, who: 'crew', start: d3, note: 'runs beside the roofer' },
    { n: 'Rough-in inspection', days: 1, who: 'inspection', start: d12 },
    { n: 'Demo', days: 2, who: 'somebody', start: dm2, done: dm2 },
    { n: '', days: 3, who: 'crew', start: d5 },                    // no name: not a step
    { n: 'No day on it', days: 3, who: 'crew', start: 'next week' },   // no day: not a step
    null ] };
  const pinePlan = { id: 'pine-2', job: 'Pine Cabin', from: 'Claude', steps: [{ n: 'Siding', days: 10, who: 'crew', start: d5 }, { n: 'Gutters', days: 2, who: 'sub', start: d20 }] };
  const barnPlan = { id: 'barn 1!', job: 'Barn', steps: [{ n: 'Slab', days: 4, who: 'sub', start: d13 }] };   // the id is cut to plain characters: barn1
  const fileOf = plans => JSON.stringify({ plans });
  const setFile = body => page.evaluate(([p, body]) => { if (body == null) delete _dbxFiles[p]; else _dbxFiles[p] = body; }, [INBOX, body]);
  const waiting = () => page.evaluate(() => schedInboxWaiting('').map(p => p.id).join('|'));
  const plates = () => page.evaluate(() => [...document.querySelectorAll('#schedInbox .sch-inbox')].map(x => ({ id: x.dataset.plan, t: x.textContent.replace(/\s+/g, ' ').trim(), go: (x.querySelector('.sch-inbox-go') || {}).textContent, no: (x.querySelector('.sch-inbox-no') || {}).textContent })));

  console.log('— 📥 the file is read, never trusted —');
  ok('no file in Dropbox: nothing waits, nothing is said, the window draws no plate', await (async () => {
    await page.evaluate(async () => { await schedInboxLoad(); openSchedule('*'); });
    await page.waitForTimeout(150);
    const r = await page.evaluate(() => Array.isArray(_schedInbox) && _schedInbox.length === 0 && !!$('schedInbox') && $('schedInbox').children.length === 0 && _said.length === 0);
    await page.evaluate(() => closeReview());
    return r;
  })());
  ok('a broken file, a file with no plans, a list that is not a list: nothing waits and no error', await (async () => {
    const out = [];
    for (const body of ['{ not json', '{"plans":"x"}', '[]', 'null', '{"plans":[null,"x",7,{"id":"a"},{"id":"b","job":"Oak House","steps":[]},{"id":"c","job":"Oak House","steps":[{"n":"x","start":"soon"}]},{"job":"Oak House","steps":[{"n":"x","start":"2026-01-05"}]},{"id":"p","job":"Personal","steps":[{"n":"x","start":"2026-01-05"}]}]}']) {
      await setFile(body); await page.evaluate(async () => { await schedInboxLoad(true); });
      out.push(await page.evaluate(() => Array.isArray(_schedInbox) ? _schedInbox.length : -1));
    }
    return out.join(',') === '0,0,0,0,0';
  })());
  ok('the real file: three plans kept (a second copy of the same id is not a second plan); a step with no name or no day is left out; an id is cut to plain characters; a step cannot name a sub', await (async () => {
    await setFile(fileOf([oakPlan, pinePlan, barnPlan, { ...pinePlan, steps: [{ n: 'A second copy', days: 1, start: d5 }] }]));
    await page.evaluate(async () => { _said.length = 0; _schedInbox = null; await schedInboxLoad(); });
    return await page.evaluate(() => _schedInbox.map(p => p.id + ':' + p.steps.length).join('|') === 'oak-finish-1:4|pine-2:2|barn1:1' && _schedInbox[0].steps.every(s => s.sid === '') && _schedInbox[0].steps[3].who === '' && _schedInbox[0].from === 'Claude' && _schedInbox[0].note === 'the finish sheet');
  })(), await page.evaluate(() => JSON.stringify(_schedInbox)));
  ok('it is said ONCE on this device, with where to find it — and never again for the same plans', await (async () => {
    const first = await page.evaluate(() => _said.filter(m => /^📥 A plan is waiting for /.test(m)));
    await page.evaluate(async () => { _said.length = 0; await schedInboxLoad(true); });
    const again = await page.evaluate(() => _said.filter(m => /^📥 A plan is waiting/.test(m)).length);
    return first.length === 1 && /\(\+2 more\) — 🏠 Project portal → 📅 Schedule$/.test(first[0]) && again === 0;
  })(), await page.evaluate(() => JSON.stringify(_said)));
  ok('nothing is on the schedule and nothing was saved: a plan that waits is only an offer', await page.evaluate(() => schedJobs().length === 0 && Object.keys(prefs.sched.jobs).length === 0 && !prefs.schedTaken && window._saves === 0 && window._ups.length === 0));

  console.log('— 🚪 the doors say it —');
  ok('the portal plate counts what waits; the job card\'s plate says a plan is waiting for THAT job — and not on a job with none', await (async () => {
    await page.evaluate(() => openPortalWin()); await page.waitForTimeout(150);
    const portal = await page.evaluate(() => { const p = $('portalBox').querySelector('.pf-sched'); const t = p ? p.textContent.trim() : ''; closePortalWin(); return t; });
    const cards = await page.evaluate(() => [cardSchedHtml('Oak House'), cardSchedHtml('Internal / Admin')].map(h => h.replace(/<[^>]+>/g, '').trim()));
    return portal === '📅 Schedule — every job on one week grid · 📥 3 plans waiting' && cards[0] === '📅 Schedule — no plan yet for Oak House · 📥 a plan is waiting' && cards[1] === '📅 Schedule — no plan yet for Internal / Admin';
  })());
  ok('a plan that lands while a door is on the screen puts the words on it without a tap', await (async () => {
    await page.evaluate(() => { _schedInbox = []; openPortalWin(); });
    await page.waitForTimeout(100);
    const before = await page.evaluate(() => $('portalBox').querySelector('.pf-sched').textContent.trim());
    await page.evaluate(async () => { await schedInboxLoad(true); });
    const after = await page.evaluate(() => { const t = $('portalBox').querySelector('.pf-sched').textContent.trim(); closePortalWin(); return t; });
    return !/📥/.test(before) && /· 📥 3 plans waiting$/.test(after);
  })());

  console.log('— 📅 the window offers it —');
  ok('Every job: a plate a plan above the list — 📥, the job by HIS name, the steps, the days, who it is from; ✓ Put it on the schedule and ✕ Not this one; a job that is not on his list is said in words', await (async () => {
    await page.evaluate(() => openSchedule('*')); await page.waitForTimeout(200);
    const p = await plates();
    const span = await page.evaluate(([a, b]) => schedShortWord(a) + ' to ' + schedShortWord(b), [dm2, d12]);
    const above = await page.evaluate(() => $('schedInbox').compareDocumentPosition($('schedList')) & Node.DOCUMENT_POSITION_FOLLOWING);
    return p.length === 3 && p[0].id === 'oak-finish-1' && p[0].t.indexOf('📥 A plan is waiting for Oak House — 4 steps, ' + span + ' · from Claude · the finish sheet') === 0 && p[0].go === '✓ Put it on the schedule' && p[0].no === '✕ Not this one'
      && /Nothing is on the schedule until you tap/.test(p[0].t) && !/not a job on your list/.test(p[0].t) && /📥 A plan is waiting for Barn — 1 step, /.test(p[2].t) && /⚠ “Barn” is not a job on your list/.test(p[2].t) && !!above;
  })(), JSON.stringify(await plates()));
  ok('one job picked: its own plan leads, the others still show (each names its job)', await (async () => {
    await page.evaluate(() => { $('schedJob').value = 'Pine Cabin'; $('schedJob').dispatchEvent(new Event('change')); });
    await page.waitForTimeout(150);
    const p = await plates();
    return p.map(x => x.id).join('|') === 'pine-2|oak-finish-1|barn1' && /^📥 A plan is waiting for Pine Cabin — 2 steps/.test(p[0].t);
  })(), JSON.stringify((await plates()).map(x => x.id)));
  ok('390px: the plate fits the phone, its two buttons are a thumb tall, the page does not scroll sideways', await page.evaluate(() => { const b = $('schedInbox').querySelector('.sch-inbox').getBoundingClientRect(); const btns = [...$('schedInbox').querySelectorAll('.sch-inbox button')].map(x => x.getBoundingClientRect());
    return b.left >= 0 && b.right <= innerWidth + 0.5 && btns.every(r => r.height >= 44 && r.right <= innerWidth + 0.5) && document.documentElement.scrollWidth <= innerWidth + 0.5 && getComputedStyle($('schedInbox').querySelector('.sch-inbox')).borderTopStyle === 'dashed'; }));

  console.log('— ✓ his tap puts it on —');
  ok('✓ Put it on the schedule: the four steps land under HIS job name with their OWN start days (two side by side stay side by side), ids of their own, the done one done, his job wheel on that job, the bars drawn', await (async () => {
    await page.evaluate(() => { _said.length = 0; window._saves = 0; window._ups.length = 0; [...$('schedInbox').querySelectorAll('.sch-inbox')].find(x => x.dataset.plan === 'oak-finish-1').querySelector('.sch-inbox-go').click(); });
    await page.waitForTimeout(200);
    const r = await page.evaluate(() => ({ keys: Object.keys(prefs.sched.jobs).join('|'), st: schedSteps('Oak House').map(s => ({ n: s.n, d: s.days, w: s.who, s: s.start, done: s.done, sid: s.sid, note: s.note, id: s.id })), job: _schedJob, sel: $('schedJob').value, bars: $('revBox').querySelectorAll('.sch-bar').length, taken: prefs.schedTaken, saves: window._saves, said: _said.slice() }));
    const ids = new Set(r.st.map(s => s.id));
    const span = await page.evaluate(([a, b]) => schedShortWord(a) + ' to ' + schedShortWord(b), [dm2, await snap('inspection', d12)]);
    return r.keys === 'Oak House' && r.st.length === 4 && r.st[0].n === 'Shingles' && r.st[0].s === await snap('sub', d3) && r.st[1].s === await snap('crew', d3) && r.st[2].s === await snap('inspection', d12) && r.st[3].s === dm2 && r.st[3].done === dm2 && r.st[3].w === '' && r.st[0].w === 'sub' && r.st[0].sid === '' && r.st[1].note === 'runs beside the roofer'
      && r.st[0].d <= 5 && r.st[1].d <= 4 && r.st[3].d === 2   // v7.76 — a plan's days are calendar days: Mon–Fri is five work days of a sub's and four of the crew's (fewer in a holiday week); a step with no "who" counts every day
      && ids.size === 4 && r.st.every(s => /^s[a-z0-9]{6,}$/.test(s.id)) && r.job === 'Oak House' && r.sel === 'Oak House' && r.bars === 4 && r.taken['oak-finish-1'] === today && r.saves >= 1 && r.said.some(m => m === '📥 4 steps on Oak House — ' + span);
  })(), await page.evaluate(() => JSON.stringify({ k: Object.keys(prefs.sched.jobs), st: schedSteps('Oak House'), said: _said })));
  ok('the plate is gone, the other two still wait; the crew\'s phones get the new plan on their own (the v7.68 road)', await (async () => {
    const p = await plates();
    await page.waitForTimeout(900);
    const crewGot = await page.evaluate(() => ['Phil', 'Kevin'].every(n => { const j = JSON.parse(_dbxFiles['/Clore DayLog/Crew/' + n + '/shared.json'] || 'null'); return !!j && !!j.sched && !!j.sched.jobs['Oak House'] && j.sched.jobs['Oak House'].steps.length === 4; }));
    return p.map(x => x.id).join('|') === 'pine-2|barn1' && crewGot;
  })(), JSON.stringify((await plates()).map(x => x.id)));
  ok('a plan taken is never offered again — not after a fresh read of the file, not after the app is told nothing', await (async () => {
    await page.evaluate(async () => { await schedInboxLoad(true); });
    const a = await waiting();
    await page.evaluate(async () => { _schedInbox = null; await schedInboxLoad(); });
    return a === 'pine-2|barn1' && (await waiting()) === 'pine-2|barn1' && await page.evaluate(() => schedSteps('Oak House').length === 4);
  })());
  ok('a read that gets NOTHING back (no signal, or the request fails) leaves the offer standing — it never vanishes on a dropped connection', await (async () => {
    const before = await waiting();
    await page.evaluate(async () => { const d = window.dbxDownload; window.dbxDownload = async () => null; await schedInboxLoad(true); window.dbxDownload = async () => { throw new TypeError('Failed to fetch'); }; await schedInboxLoad(true); window.dbxDownload = d; });
    return before === 'pine-2|barn1' && (await waiting()) === before && await page.evaluate(() => document.querySelectorAll('#schedInbox .sch-inbox').length === 2);
  })());
  ok('a move after the take is his own: one step a week later takes the steps that start on or after it along, the done one stays (the v7.67 rule on the new plan) — and a week earlier puts every one back', await page.evaluate(() => { const st = schedSorted('Oak House'); const first = st.find(s => s.n === 'Shingles'), was = st.map(s => s.start).join('|'); const want = schedShift({ who: 'sub', start: first.start }, 1, 0).start; schedMoveBy('Oak House', first.id, 1, 0); const now = schedSorted('Oak House');
    const by = n => now.find(s => s.n === n); const r = by('Demo').start === st.find(s => s.n === 'Demo').start && by('Shingles').start === want && want > first.start && by('Framing wrap-up').start === schedShift({ who: 'crew', start: st.find(s => s.n === 'Framing wrap-up').start }, 1, 0).start && by('Rough-in inspection').start > st.find(s => s.n === 'Rough-in inspection').start;
    schedMoveBy('Oak House', by('Shingles').id, -1, 0); return r && schedSorted('Oak House').map(s => s.start).join('|') === was; }));

  console.log('— ✕ not this one, and a job that already has steps —');
  ok('✕ Not this one: the plate leaves, the plan is remembered as turned down, nothing lands on the schedule — and Undo brings the offer back', await (async () => {
    await page.evaluate(() => { $('schedJob').value = '*'; $('schedJob').dispatchEvent(new Event('change')); });
    await page.waitForTimeout(120);
    await page.evaluate(() => { _said.length = 0; [...$('schedInbox').querySelectorAll('.sch-inbox')].find(x => x.dataset.plan === 'barn1').querySelector('.sch-inbox-no').click(); });
    await page.waitForTimeout(120);
    const off = await page.evaluate(() => ({ w: schedInboxWaiting('').map(p => p.id).join('|'), t: prefs.schedTaken.barn1, barn: !!schedPlan('Barn'), toast: $('toast').textContent, n: document.querySelectorAll('#schedInbox .sch-inbox').length }));
    await page.evaluate(() => $('toast').querySelector('button').click());
    await page.waitForTimeout(120);
    const back = await page.evaluate(() => ({ w: schedInboxWaiting('').map(p => p.id).join('|'), t: 'barn1' in prefs.schedTaken, n: document.querySelectorAll('#schedInbox .sch-inbox').length }));
    await page.evaluate(() => { [...$('schedInbox').querySelectorAll('.sch-inbox')].find(x => x.dataset.plan === 'barn1').querySelector('.sch-inbox-no').click(); });
    return off.w === 'pine-2' && off.t === 'no' && !off.barn && /^✕ That plan for Barn will not be offered again/.test(off.toast) && off.n === 1 && back.w === 'pine-2|barn1' && back.t === false && back.n === 2 && (await waiting()) === 'pine-2';
  })());
  ok('a job that already has steps: the plate says ➕ Add its 2 steps to the 1 already here; the tap ADDS them — his own step is untouched', await (async () => {
    await page.evaluate(() => { schedAddStep('Pine Cabin', 'Demo the porch', '3', 'crew'); renderSchedule(); });
    const mine = await page.evaluate(() => { const s = schedSteps('Pine Cabin')[0]; return { id: s.id, start: s.start, days: s.days }; });
    const word = (await plates())[0].go;
    await page.evaluate(() => { _said.length = 0; $('schedInbox').querySelector('.sch-inbox-go').click(); });
    await page.waitForTimeout(200);
    const r = await page.evaluate(() => ({ st: schedSteps('Pine Cabin').map(s => ({ n: s.n, id: s.id, s: s.start, d: s.days, w: s.who })), said: _said.slice(), left: document.querySelectorAll('#schedInbox .sch-inbox').length, job: _schedJob }));
    return word === '➕ Add its 2 steps to the 1 already here' && r.st.length === 3 && r.st[0].id === mine.id && r.st[0].s === mine.start && r.st[0].d === mine.days && r.st[1].n === 'Siding' && r.st[1].s === d5 && r.st[2].n === 'Gutters' && r.st[2].s === d20 && r.st[2].w === 'sub'
      && r.said.some(m => /^📥 2 steps on Pine Cabin — .* · added to the 1 already there$/.test(m)) && r.left === 0 && r.job === 'Pine Cabin';
  })(), await page.evaluate(() => JSON.stringify({ st: schedSteps('Pine Cabin'), said: _said })));

  console.log('— 🧱 what it never does —');
  ok('the inbox file is READ, never written: not one upload to it, and its bytes are as they were dropped', await page.evaluate(([p, body]) => window._ups.every(u => u !== p) && _dbxFiles[p] === body, [INBOX, fileOf([oakPlan, pinePlan, barnPlan, { ...pinePlan, steps: [{ n: 'A second copy', days: 1, start: d5 }] }])]));
  ok('a new plan that lands while he is TYPING a step does not redraw the window under his thumbs — the words and the cursor stay; the plate is there on the next draw', await (async () => {
    await page.evaluate(() => { $('schedJob').value = 'Oak House'; $('schedJob').dispatchEvent(new Event('change')); });
    await page.waitForTimeout(120);
    await page.evaluate(() => { _schedAdd = true; renderSchedule(); const el = $('schAddN'); el.focus(); el.value = 'cabinets and van'; });
    await setFile(fileOf([oakPlan, pinePlan, barnPlan, { id: 'oak-extra', job: 'Oak House', from: 'Claude', steps: [{ n: 'Punch list', days: 2, who: 'crew', start: d20 }] }]));
    await page.evaluate(async () => { await schedInboxLoad(true); });
    const mid = await page.evaluate(() => ({ v: $('schAddN') ? $('schAddN').value : null, focus: document.activeElement === $('schAddN'), plates: document.querySelectorAll('#schedInbox .sch-inbox').length, w: schedInboxWaiting('').map(p => p.id).join('|') }));
    const after = await page.evaluate(() => { _schedAdd = false; renderSchedule(); return [...document.querySelectorAll('#schedInbox .sch-inbox')].map(x => x.dataset.plan).join('|'); });
    return mid.v === 'cabinets and van' && mid.focus && mid.plates === 0 && mid.w === 'oak-extra' && after === 'oak-extra';
  })());
  ok('the 👁 crew preview is offered nothing and can take nothing', await page.evaluate(() => { crewPreview = true; renderSchedule(); const a = schedInboxWaiting('').length === 0 && document.querySelectorAll('#schedInbox .sch-inbox').length === 0 && !/📥/.test(cardSchedHtml('Oak House')) && !/📥/.test(portalSchedHtml());
    const n = schedSteps('Oak House').length; schedInboxTake('oak-extra'); schedInboxSkip('oak-extra'); const b = schedSteps('Oak House').length === n && !('oak-extra' in prefs.schedTaken); crewPreview = false; renderSchedule(); closeReview(); return a && b; }));
  ok('the homeowner\'s page and the homeowner\'s door have no word of the inbox; the app names the file in one place', (() => { let fn = ''; try { fn = fs.readFileSync(path.join(repo, 'fnsrc', 'client-portal.mjs'), 'utf8'); } catch (e) { fn = ''; }
    return !/sched-inbox/.test(csrc) && !/sched-inbox/.test(fn) && (src.match(/sched-inbox\.json'/g) || []).length === 1; })());

  console.log('— 👷 a field phone (Kevin) never reads it —');
  await page.evaluate(() => { localStorage.setItem('daylog-crew-name', 'Kevin'); localStorage.removeItem('daylog-crew-office'); localStorage.removeItem('daylog-crew-sched'); localStorage.setItem('daylog-dbx', JSON.stringify({ appKey: 'k', refreshToken: 'test-token', accessToken: 'a', expiresAt: Date.now() + 3600000 })); });
  await page.reload(); await page.waitForTimeout(900); await stub();
  ok('a crew phone: the file is not downloaded, no plate, no words on a door, a take does nothing, nothing written', await (async () => {
    await page.evaluate(([oak]) => { jobs = ['Oak House', 'Pine Cabin']; _said.length = 0; _dbxFiles[DBX_ROOT + '/App Data/sched-inbox.json'] = JSON.stringify({ plans: [oak] }); _dbxFiles['/Clore DayLog/App Data/sched-inbox.json'] = JSON.stringify({ plans: [oak] });
      crewSched = { jobs: { 'Oak House': { steps: [{ id: 's1', n: 'Framing', days: 5, who: 'crew', start: localDay(new Date()), done: '' }] } } }; window._downs.length = 0; window._ups.length = 0; }, [oakPlan]);
    await page.evaluate(async () => { await schedInboxLoad(true); openSchedule('*'); });
    await page.waitForTimeout(250);
    return await page.evaluate(() => { const n = schedSteps('Oak House').length; schedInboxTake('oak-finish-1'); const r = CREW_NAME === 'Kevin' && _schedInbox === null && window._downs.every(p => !/sched-inbox/.test(p)) && !!$('schedBox') && document.querySelectorAll('.sch-inbox').length === 0 && !/📥/.test(cardSchedHtml('Oak House')) && !/📥/.test(portalSchedHtml())
      && schedSteps('Oak House').length === n && n === 1 && _said.every(m => !/📥/.test(m)) && window._ups.filter(p => !/pending\.json$/.test(p)).length === 0; closeReview(); return r; });
  })(), await page.evaluate(() => JSON.stringify({ downs: window._downs, ups: window._ups, said: _said })));
  await page.evaluate(() => { localStorage.removeItem('daylog-crew-name'); localStorage.removeItem('daylog-crew-sched'); });

  ok('version bumped — APP_VER and the footer agree', /const APP_VER = 'v7\.(69|[7-9]\d)'/.test(src) && new RegExp('<footer>' + (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1].replace('.', '\\.') + ' ·').test(src));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
