// 📅 v7.68 — THREE ROADS OUT OF THE SCHEDULE. Eric, the same night v7.67 shipped: "if you can build while my pc is off then
// go ahead and get started" — his go on the three offered: (1) the crew's phones read the weeks (read-only, the subs' road in
// shared.json); (2) a 🔧 step names WHICH sub, picked by exact name off the subs list, and the sub's plate under 👷 Subs lists
// his booked weeks; (3) WHERE WE ARE on the homeowner's page — the steps in order with ✓ done · ▸ under way · ○ ahead and no
// dates, switched on per job, following the plan while it is on. Every name, number and day below is made up; the dates are
// relative to today so the checks hold whenever they run.
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
  const OAK = 'oak-111111', PINE = 'pine-222222';
  const pageOf = (name, extra) => ({ name, stage: 'Framing', updated: '2026-09-21', show: { money: true, journal: true }, invoiced: 5000, paid: 4600, open: 400, phases: [], journal: [{ week: 'Sep 14 – 20', text: 'Framing went up.', released: '2026-09-21' }], budget: [{ n: 'Framing', est: 5000 }], boardsOff: ['b1'], ...extra });

  // the fake Dropbox: one store; the listing knows the crew folders
  const stub = () => page.evaluate(([OAK, PINE, pOak, pPine]) => {
    window._saves = 0; window.scheduleSave = () => { window._saves++; };
    window._dbxFiles = window._dbxFiles || {}; window._ups = [];
    window.dbxDownload = async p => (window._dbxFiles || {})[p] ?? null;
    window.dbxUpload = async (p, body) => { (window._dbxFiles || {})[p] = typeof body === 'string' ? body : '[file]'; window._ups.push(p); return { path_display: p }; };
    window.dbxPathExists = async p => Object.prototype.hasOwnProperty.call(window._dbxFiles || {}, p);
    window.dbxList = async () => ({ entries: [] });
    window.dbxRpc = async () => ({});
    window.pushOut = () => false; window.cpPush = () => {}; window.cpReload = () => {};
    if (!window._said) { window._said = []; const t0 = window.toast; window.toast = (m, g) => { if (m) _said.push(String(m)); return t0(m, g); }; }
    dbx.refreshToken = 'test-token';
    if (pOak) { _dbxFiles[portalRoot() + '/index.json'] = JSON.stringify({ clients: [{ key: 'oak', job: 'Oak House', code: OAK }, { key: 'pine', job: 'Pine Cabin', code: PINE }] });
      _dbxFiles[portalRoot() + '/' + OAK + '.json'] = JSON.stringify(pOak); _dbxFiles[portalRoot() + '/' + PINE + '.json'] = JSON.stringify(pPine); }
  }, [OAK, PINE, pageOf('Oak House'), pageOf('Pine Cabin', { open: 0 })]);
  await stub();
  await page.evaluate(() => {
    jobs = ['Oak House', 'Pine Cabin', 'Internal / Admin']; crew = ['Phil', 'Kevin']; prefs.office = ['Phil']; entries = []; todos = []; nextId = 1;
    delete prefs.subs; prefs.sched = { jobs: {} }; prefs.cards = {}; _portalIdx = null; _cardJob = ''; localStorage.removeItem('daylog-cardjob');
    renderJobSelects(); closePanels(); renderAll(); window._ups.length = 0;
    // the subs list: one on Oak House, one on nobody's job
    subsPut('subs', { id: 'sDK', co: 'Drain Kings', who: 'Pat', trade: 'Plumbing', ph: '907-555-0101', em: '' });
    subsPut('subs', { id: 'sSB', co: 'Spark Bros', who: 'Lee', trade: 'Electrical', ph: '907-555-0102', em: '' });
    subsPut('on', { id: 'jDK', job: 'Oak House', sid: 'sDK', note: '' });
    clearTimeout(_subsPubT);
    // the plan: the first step already done, the second starts today
    schedPasteText('Oak House', 'demo 3 days\nplumbing rough-in 1.5 weeks\nelectrical rough-in 1 week\nrough-in inspection 1 day\nfloors, doors, trim 2 weeks');
    // (v7.76 — the days are work days: the done step is put two weeks back, the second on the sub's latest work day up to today)
    const ids = schedSteps('Oak House').map(s => s.id), t0 = localDay(new Date());
    schedSet('Oak House', ids[0], 'start', schedAddDays(t0, -14)); schedDoneToggle('Oak House', ids[0]);
    schedSet('Oak House', ids[1], 'start', schedWorkOn('sub', t0, -1));
    clearTimeout(_schedPubT);
  });
  await page.evaluate(async () => { _portalIdx = JSON.parse(_dbxFiles[portalRoot() + '/index.json']); });
  const steps = () => page.evaluate(() => schedSteps('Oak House').map(s => ({ n: s.n, who: s.who, sid: s.sid, done: !!s.done, note: s.note })));
  const pageWrites = () => page.evaluate(([OAK, PINE]) => window._ups.filter(p => p === portalRoot() + '/' + OAK + '.json' || p === portalRoot() + '/' + PINE + '.json').length, [OAK, PINE]);
  const pageJson = code => page.evaluate(code => JSON.parse(_dbxFiles[portalRoot() + '/' + code + '.json']), code);
  const today = await page.evaluate(() => localDay(new Date()));

  console.log('— 🔧 a sub on a step —');
  ok('the editor on a 🔧 step offers WHICH SUB: the ones on this job first, then the rest of the list by trade — picked by name, never guessed from the step\'s words', await (async () => {
    await page.evaluate(() => { openSchedule('Oak House'); const st = schedSteps('Oak House'); _schedOpen = st[1].id; renderSchedule(); });
    await page.waitForTimeout(100);
    return await page.evaluate(() => { const w = $('schSid'); if (!w) return false; const groups = [...w.querySelectorAll('optgroup')].map(g => g.label + ':' + [...g.querySelectorAll('option')].map(o => o.textContent.trim()).join('|'));
      return $('schWho').value === 'sub' && w.value === '' && groups.join(' // ') === 'On Oak House:Drain Kings · Pat — Plumbing // The rest of the list:Spark Bros · Lee — Electrical' && schedSteps('Oak House')[1].sid === '' && /their plate under 👷 Subs shows these weeks/.test($('revBox').textContent); });
  })(), await page.evaluate(() => $('schSid') ? $('schSid').outerHTML.slice(0, 300) : 'no wheel'));
  ok('a pick: the step carries the sub\'s id, the row reads 🔧 sub · Drain Kings, the bar names it too', await (async () => {
    await page.evaluate(() => { $('schSid').value = 'sDK'; $('schSid').dispatchEvent(new Event('change')); });
    await page.waitForTimeout(100);
    const st = await steps();
    return st[1].sid === 'sDK' && await page.evaluate(() => { const lab = [...$('revBox').querySelectorAll('.sch-lab')].find(l => /plumbing rough-in/.test(l.textContent)); const bar = [...$('revBox').querySelectorAll('.sch-bar')].find(b => /plumbing rough-in/.test(b.textContent)); return /🔧 sub · Drain Kings/.test(lab.querySelector('small').textContent) && /Drain Kings/.test(bar.title) && $('schSid').value === 'sDK'; });
  })(), JSON.stringify(await steps()));
  ok('the sub\'s plate under 👷 Subs on this job lists his booked weeks: 📅 Oak House · plumbing rough-in · <the days>; Spark Bros (no step) has no such line', await (async () => {
    await page.evaluate(() => { closeReview(); openSubs('Oak House'); });
    const r = await page.evaluate(() => { const rows = [...$('subsBox').querySelectorAll('.sb-row')]; const dk = rows.find(r => /Drain Kings/.test(r.textContent)); const l = dk && dk.querySelector('.sb-sched'); return { dk: l ? l.textContent.trim() : '', n: rows.length }; });
    const s1 = await page.evaluate(() => { const s = schedSteps('Oak House')[1]; return schedShortWord(s.start) + ' – ' + schedShortWord(schedEnd(s)); });
    return r.n === 1 && r.dk === '📅 Oak House · plumbing rough-in · ' + s1;
  })(), JSON.stringify(await page.evaluate(() => [...$('subsBox').querySelectorAll('.sb-sched')].map(x => x.textContent))));
  ok('the same line on 📋 Every job and on the ⚙ Setup master list', await (async () => {
    const every = await page.evaluate(() => { subsPick('*'); const dk = [...$('subsBox').querySelectorAll('.sb-row')].find(r => /Drain Kings/.test(r.textContent)); return dk && dk.querySelector('.sb-sched') ? dk.querySelector('.sb-sched').textContent.trim() : ''; });
    const setup = await page.evaluate(() => { closeReview(); $('panel-settings').classList.add('open'); renderSubsSetup(); const dk = [...$('subsSetupBox').querySelectorAll('.sb-master')].find(r => /Drain Kings/.test(r.textContent)); const sb = [...$('subsSetupBox').querySelectorAll('.sb-master')].find(r => /Spark Bros/.test(r.textContent)); const r = [dk && dk.querySelector('.sb-sched') ? dk.querySelector('.sb-sched').textContent.trim() : '', !!(sb && sb.querySelector('.sb-sched'))]; $('panel-settings').classList.remove('open'); $('subsSetupBox').innerHTML = ''; return r; });
    return /^📅 Oak House · plumbing rough-in · /.test(every) && /^📅 Oak House · plumbing rough-in · /.test(setup[0]) && setup[1] === false;
  })());
  ok('a step marked ✓ done leaves the sub\'s plate; who → crew lets the sub go (no sid, no wheel)', await (async () => {
    await page.evaluate(() => { const st = schedSteps('Oak House'); schedDoneToggle('Oak House', st[1].id); });
    const gone = await page.evaluate(() => { openSubs('Oak House'); const dk = [...$('subsBox').querySelectorAll('.sb-row')].find(r => /Drain Kings/.test(r.textContent)); const r = !dk.querySelector('.sb-sched'); closeReview(); return r; });
    await page.evaluate(() => { const st = schedSteps('Oak House'); schedDoneToggle('Oak House', st[1].id); schedSet('Oak House', st[1].id, 'who', 'crew'); });
    const st = await steps();
    const noWheel = await page.evaluate(() => { openSchedule('Oak House'); _schedOpen = schedSteps('Oak House')[1].id; renderSchedule(); const r = !$('schSid') && $('schWho').value === 'crew'; return r; });
    await page.evaluate(() => { const st = schedSteps('Oak House'); schedSet('Oak House', st[1].id, 'who', 'sub'); schedSet('Oak House', st[1].id, 'sid', 'sDK'); schedSet('Oak House', st[1].id, 'note', 'Pat said Tuesday, waiting on the permit'); closeReview(); });
    return gone && st[1].sid === '' && st[1].who === 'crew' && noWheel && await page.evaluate(() => schedClean({ n: 'x', who: 'crew', sid: 'sDK' }).sid === '' && schedClean({ n: 'x', who: 'sub', sid: 'sDK' }).sid === 'sDK');
  })(), JSON.stringify(await steps()));

  console.log('— 👷 the road to the crew —');
  ok('publishSharedNotes writes the plan into EVERY crew folder\'s shared.json — every job with steps, the sub\'s id riding, Eric\'s NOTE left out; a job with no steps is not there', await (async () => {
    await page.evaluate(async () => { clearTimeout(_schedPubT); clearTimeout(_subsPubT); window._ups.length = 0; await publishSharedNotes(); });
    await page.waitForTimeout(200);
    return await page.evaluate(() => ['Phil', 'Kevin'].every(n => { const j = JSON.parse(_dbxFiles['/Clore DayLog/Crew/' + n + '/shared.json'] || 'null'); if (!j || !j.sched || !j.sched.jobs) return false; const oak = j.sched.jobs['Oak House']; if (!oak || !Array.isArray(oak.steps) || oak.steps.length !== 5) return false;
      const s = oak.steps[1]; return s.n === 'plumbing rough-in' && s.sid === 'sDK' && s.who === 'sub' && !('note' in s) && !/waiting on the permit/.test(JSON.stringify(j)) && !j.sched.jobs['Pine Cabin'] && Object.keys(j.sched.jobs).length === 1; }));
  })(), await page.evaluate(() => Object.keys(_dbxFiles).join(' | ')));
  ok('🧱 the road to the crew wrote no homeowner page', (await pageWrites()) === 0);
  ok('a change to the plan publishes to the crew on its own, 600 ms later (the subs\' way)', await (async () => {
    await page.evaluate(() => { window._ups.length = 0; const st = schedSteps('Oak House'); schedMove('Oak House', st[2].id, 2); });
    const before = await page.evaluate(() => window._ups.filter(p => /shared\.json$/.test(p)).length);
    await page.waitForTimeout(900);
    const after = await page.evaluate(() => window._ups.filter(p => /shared\.json$/.test(p)).length);
    return before === 0 && after === 2 && await page.evaluate(() => { const j = JSON.parse(_dbxFiles['/Clore DayLog/Crew/Phil/shared.json']); return j.sched.jobs['Oak House'].steps[2].start === schedSteps('Oak House')[2].start; });
  })());

  console.log('— 🏠 WHERE WE ARE on their page —');
  ok('the cut for their page: the step NAMES and three words by today — done · now (started, not done) · next — nothing else (no days, no who, no sub, no note, no date on a step)', await page.evaluate(() => { const c = schedPageCut('Oak House'); const st = c.steps; return c.at === localDay(new Date()) && st.length === 5 && st.every(s => Object.keys(s).sort().join(',') === 'n,st') && st.map(s => s.st).join('|') === 'done|now|next|next|next' && st[0].n === 'demo' && !/Drain|permit|sub|crew|\d{4}-\d{2}/.test(JSON.stringify(st)); }), await page.evaluate(() => JSON.stringify(schedPageCut('Oak House'))));
  ok('the window reads their page and offers 📤 Put WHERE WE ARE on their page (off today); the ⏳ words first, then the plate', await (async () => {
    await page.evaluate(() => { window._ups.length = 0; openSchedule('Oak House'); });
    const first = await page.evaluate(() => /⏳ reading their page…|📤 Put WHERE WE ARE/.test(($('revBox').querySelector('.sch-page') || { textContent: '' }).textContent));
    await page.waitForTimeout(300);
    return first && await page.evaluate(() => { const p = $('revBox').querySelector('.sch-page .sch-tool'); return !!p && /^📤 Put WHERE WE ARE on their page — the steps in order \(✓ done · ▸ under way · ○ ahead\), no dates$/.test(p.textContent.trim()) && !p.disabled && !_schedPage['oak-111111'].on; }) && (await pageWrites()) === 0;
  })(), await page.evaluate(() => ($('revBox').querySelector('.sch-page') || { textContent: 'no plate' }).textContent));
  ok('📤: their page gets `sched` and show.sched = true, every other key byte for byte as it was; the plate flips to ✓ ON THEIR PAGE with 🙈 beside it', await (async () => {
    const before = await pageJson(OAK);
    await page.evaluate(() => $('revBox').querySelector('.sch-page .sch-tool').click());
    await page.waitForTimeout(300);
    const after = await pageJson(OAK);
    const strip = o => { const x = JSON.parse(JSON.stringify(o)); delete x.sched; if (x.show) delete x.show.sched; return JSON.stringify(x); };
    return (await pageWrites()) === 1 && after.show.sched === true && after.sched.at === today && after.sched.steps.map(s => s.st).join('|') === 'done|now|next|next|next' && strip(before) === strip(after) && after.boardsOff[0] === 'b1' && after.journal.length === 1
      && await page.evaluate(() => { const b = [...$('revBox').querySelectorAll('.sch-page .sch-tool')].map(x => x.textContent.trim()); return b.length === 2 && /^✓ WHERE WE ARE IS ON THEIR PAGE — as of .+ · tap to send today's$/.test(b[0]) && b[1] === '🙈 Take it off their page' && _said.some(s => /^📅 WHERE WE ARE is on their page — the steps in order, no dates ✓$/.test(s)); });
  })(), JSON.stringify(await pageJson(OAK)).slice(0, 400));
  ok('while it is on, their page follows a change to the plan by itself (800 ms later): a step marked done → the page says done', await (async () => {
    await page.evaluate(() => { window._ups.length = 0; const st = schedSteps('Oak House'); schedDoneToggle('Oak House', st[1].id); });
    const soon = await pageWrites();
    await page.waitForTimeout(1100);
    const pg = await pageJson(OAK);
    return soon === 0 && (await pageWrites()) === 1 && pg.sched.steps.map(s => s.st).join('|') === 'done|done|next|next|next' && pg.show.sched === true;
  })(), JSON.stringify((await pageJson(OAK)).sched));
  ok('a job whose page is OFF writes nothing when its plan changes (Pine Cabin)', await (async () => {
    await page.evaluate(() => { window._ups.length = 0; schedAddStep('Pine Cabin', 'demo', '2 days', 'crew'); });
    await page.waitForTimeout(1100);
    return (await pageWrites()) === 0 && await page.evaluate(() => !JSON.parse(_dbxFiles[portalRoot() + '/pine-222222.json']).sched);
  })());
  ok('on open the window puts their card right when the day moved it — a page that says ○ ahead for a step that has started is rewritten; a page that agrees is left alone', await (async () => {
    await page.evaluate(() => { const pg = JSON.parse(_dbxFiles[portalRoot() + '/oak-111111.json']); pg.sched.steps[1].st = 'now'; pg.sched.steps[2].st = 'done'; _dbxFiles[portalRoot() + '/oak-111111.json'] = JSON.stringify(pg); window._ups.length = 0; closeReview(); openSchedule('Oak House'); });
    await page.waitForTimeout(400);
    const fixed = (await pageWrites()) === 1 && (await pageJson(OAK)).sched.steps.map(s => s.st).join('|') === 'done|done|next|next|next';
    await page.evaluate(() => { window._ups.length = 0; closeReview(); openSchedule('Oak House'); });
    await page.waitForTimeout(400);
    return fixed && (await pageWrites()) === 0;
  })(), JSON.stringify((await pageJson(OAK)).sched));
  ok('🙈 Take it off their page: show.sched = false, `sched` stays (the page draws nothing), the plate reads 📤 again', await (async () => {
    await page.evaluate(() => { window._ups.length = 0; [...$('revBox').querySelectorAll('.sch-page .sch-tool')].find(b => /🙈/.test(b.textContent)).click(); });
    await page.waitForTimeout(300);
    const pg = await pageJson(OAK);
    return pg.show.sched === false && !!pg.sched && await page.evaluate(() => /^📤 Put WHERE WE ARE/.test($('revBox').querySelector('.sch-page .sch-tool').textContent.trim()) && !_schedPage['oak-111111'].on);
  })());
  ok('🎛 What they see lists 📅 Where we are FIRST, opt-in (off until switched), and switching it on there writes today\'s steps with it', await (async () => {
    await page.evaluate(() => { closeReview(); Object.keys(_visCache).forEach(k => delete _visCache[k]); openPageVis(0); });
    await page.waitForTimeout(400);
    const row = await page.evaluate(() => { const r = $('pvBox').querySelector('.pv-row'); return { k: r.dataset.key, name: r.querySelector('.pv-name').textContent.trim(), plate: r.querySelector('.pv-sw').textContent.trim(), hint: /📅 Where we are shows the 📅 Schedule's steps in order/.test($('pvBox').textContent) }; });
    await page.evaluate(() => { window._ups.length = 0; $('pvBox').querySelector('.pv-row .pv-sw').click(); });
    await page.waitForTimeout(300);
    const pg = await pageJson(OAK);
    return row.k === 'sched' && /^📅 Where we are — the plan's steps in order, no dates/.test(row.name) && row.plate === '○ HIDDEN FROM THEM — tap to show' && row.hint && pg.show.sched === true && pg.sched.at === today && pg.sched.steps.length === 5
      && await page.evaluate(() => /✓ THEY SEE THIS — tap to hide/.test($('pvBox').querySelector('.pv-row .pv-sw').textContent) && _said.some(s => /where we are — they see it again/.test(s)));
  })(), await page.evaluate(() => ($('pvBox') || { textContent: 'no window' }).textContent.slice(0, 300)));
  await page.evaluate(() => closeReview());
  ok('a job with no client page: the window says so in words and offers no plate', await page.evaluate(() => { jobs.push('Barn'); openSchedule('Barn'); const r = /Barn has no client page — give it one/.test(($('revBox').querySelector('.sch-page') || { textContent: '' }).textContent) && !$('revBox').querySelector('.sch-page .sch-tool'); closeReview(); jobs.pop(); return r; }));

  console.log('— 🏠 the homeowner\'s page, for real —');
  const home = async (json) => {
    const p = await ctx.newPage();
    p.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push('client: ' + e.message); });
    await p.addInitScript(json => { window.fetch = (url, opts) => { if (!/client-portal/.test(String(url))) return Promise.reject(new TypeError('Failed to fetch')); if (opts && opts.method === 'POST') return Promise.resolve(new Response('ok', { status: 200 })); return Promise.resolve(new Response(json, { status: 200, headers: { 'content-type': 'application/json' } })); }; }, JSON.stringify(json));
    await p.goto(appUrl.replace(/index\.html$/, 'c/index.html') + '?c=' + OAK);
    await p.waitForTimeout(900);
    return p;
  };
  const sched = { at: '2026-10-01', steps: [{ n: 'Demo', st: 'done' }, { n: 'Dirt work', st: 'done' }, { n: 'Plumbing rough-in', st: 'now' }, { n: 'Electrical rough-in', st: 'next' }, { n: 'Move in', st: 'next' }] };
  const hp = await home(pageOf('Oak House', { show: { money: true, journal: true, sched: true }, sched }));
  const card = p => p.evaluate(() => { const c = document.getElementById('schedCard'); if (!c) return null; return { sub: c.querySelector('.sw-sub').textContent.replace(/\s+/g, ' ').trim(), fold: (c.querySelector('#swDone .ph-head') || { textContent: '' }).textContent.replace(/\s+/g, ' ').trim(), foldOpen: !!c.querySelector('#swDone.open'),
    rows: [...c.querySelectorAll('.sw-row')].map(r => ({ g: r.querySelector('.sw-g').textContent, n: r.querySelector('.sw-n').textContent, w: r.querySelector('.sw-w').textContent, now: r.classList.contains('sw-now'), done: r.classList.contains('sw-done'), inFold: !!r.closest('#swDone'), visible: r.getBoundingClientRect().height > 0, border: getComputedStyle(r).borderTopWidth })),
    foot: c.querySelector('.sw-foot').textContent.trim(), text: c.textContent.replace(/\s+/g, ' ').trim(), beforeJournal: !!c.nextElementSibling && c.nextElementSibling.id === 'journalCard', fits: document.documentElement.scrollWidth <= document.documentElement.clientWidth }; });
  const h0 = await card(hp);
  ok('the card draws right before the journal: 2 OF 5 STEPS DONE · 1 UNDER WAY · AS OF the day; the done ones folded behind ✓ 2 steps done — tap to see; the under-way step wears ▸ UNDER WAY and a heavier edge; the rest ○ AHEAD', !!h0 && h0.sub === '2 OF 5 STEPS DONE · 1 UNDER WAY · AS OF 2026-10-01' && /^✓ 2 steps done — tap to see\s*▾$/.test(h0.fold) && !h0.foldOpen && h0.beforeJournal
    && h0.rows.filter(r => !r.inFold).map(r => r.g + ' ' + r.n + ' ' + r.w).join('|') === '▸ Plumbing rough-in UNDER WAY|○ Electrical rough-in AHEAD|○ Move in AHEAD' && h0.rows.filter(r => r.inFold).map(r => r.g + ' ' + r.n + ' ' + r.w).join('|') === '✓ Demo DONE|✓ Dirt work DONE' && h0.rows.filter(r => r.inFold).every(r => !r.visible)
    && h0.rows.find(r => r.now).border === '2px' && h0.rows.filter(r => !r.now && !r.inFold).every(r => r.border === '1px') && h0.fits, JSON.stringify(h0));
  ok('no date, no days, no sub, no crew on the card — the order is the promise, the timing is not; the foot says so', !/\d{1,2} days?|\bsub\b|\bcrew\b|Oct \d|Drain/i.test(h0.text) && h0.foot === 'The steps, in the order they come. Timing moves with the weather and the subs — ask us where things stand.', h0.text);
  ok('a tap on the fold shows the done steps', await (async () => { await hp.evaluate(() => document.querySelector('#swDone .ph-head').click()); await hp.waitForTimeout(100); const h = await card(hp); return h.foldOpen && h.rows.filter(r => r.inFold).every(r => r.visible); })());
  await hp.close();
  const hOff = await home(pageOf('Oak House', { show: { money: true, journal: true }, sched }));
  ok('with the switch off (absent) the card is not drawn even though `sched` sits on the page — opt-in; and with show.sched = false likewise', (await card(hOff)) === null && await (async () => { await hOff.close(); const h2 = await home(pageOf('Oak House', { show: { money: true, sched: false }, sched })); const r = (await card(h2)) === null; await h2.close(); return r; })());
  const hAll = await home(pageOf('Oak House', { show: { money: true, sched: true }, sched: { at: '2026-10-01', steps: [{ n: 'Demo', st: 'done' }, { n: 'Move in', st: 'done' }] } }));
  const hA = await card(hAll);
  ok('every step done: the card says so in one line under the fold', !!hA && hA.sub === '2 OF 2 STEPS DONE · AS OF 2026-10-01' && hA.rows.filter(r => !r.inFold).map(r => r.n + ' ' + r.w).join('|') === 'Every step on the plan is done DONE', JSON.stringify(hA));
  await hAll.close();
  ok('the homeowner\'s page has no word of a sub, a day count or a start day in the WHERE WE ARE block', /sw-row/.test(csrc) && csrc.indexOf('// 📅 v7.68 — WHERE WE ARE') > 0 && !/schedSubWord|\.sid|\.start|\.days|\.who/.test(csrc.slice(csrc.indexOf('// 📅 v7.68 — WHERE WE ARE'), csrc.indexOf('// 📖 the job journal'))));

  console.log('— 👷 a field phone (Kevin) reads the weeks —');
  const book = await page.evaluate(() => { const st = schedSteps('Oak House'); if (st[1].done) schedDoneToggle('Oak House', st[1].id); clearTimeout(_schedPubT); return JSON.stringify({ sched: schedPublish(), subs: subsPublish() }); });   // the plumbing step open again, so the sub's weeks show on the crew phone
  await page.evaluate(() => { localStorage.setItem('daylog-crew-name', 'Kevin'); localStorage.removeItem('daylog-crew-office'); localStorage.removeItem('daylog-crew-sched'); localStorage.removeItem('daylog-crew-subs'); localStorage.setItem('daylog-dbx', JSON.stringify({ appKey: 'k', refreshToken: 'test-token', accessToken: 'a', expiresAt: Date.now() + 3600000 })); });
  await page.reload(); await page.waitForTimeout(900); await stub();
  await page.evaluate(book => { jobs = ['Oak House', 'Pine Cabin']; _said.length = 0; const b = JSON.parse(book);
    _dbxFiles[DBX_ROOT + '/shared.json'] = JSON.stringify({ from: 'Eric', notes: [], todos: [], asks: [], cards: { 'oak house': { job: 'Oak House', addr: '12 Oak Lane', people: [], codes: [], notes: '' } }, subs: b.subs, sched: b.sched });
    _dbxFiles[DBX_ROOT + '/portal.json'] = JSON.stringify({ clients: [{ job: 'Oak House', code: 'oak-111111' }] }); }, book);
  await page.evaluate(async () => { await checkSharedNotes(); });
  await page.waitForTimeout(200);
  ok('the plan lands on the phone with the sync and is kept for a day with no signal', await page.evaluate(() => CREW_NAME === 'Kevin' && !!crewSched && schedSteps('Oak House').length === 5 && schedSteps('Pine Cabin').length === 1 && JSON.parse(localStorage.getItem('daylog-crew-sched')).jobs['Oak House'].steps.length === 5 && schedSteps('Oak House')[1].note === ''));
  ok('the job card wears the 📅 plate and opens the window READ-ONLY: the bands, the bars, the sub named on the row, no ➕ / 📋 / ⇄ tools, no 📤 plate, no editor — a row tap reads the step', await (async () => {
    await page.evaluate(() => { crewCards = JSON.parse(localStorage.getItem('daylog-crew-cards') || 'null') || crewCards; openJobCard('Oak House'); });
    const plate = await page.evaluate(() => { const s = $('revBox').querySelector('.jc-sched'); return s ? s.textContent.trim() : ''; });
    await page.evaluate(() => $('revBox').querySelector('.jc-sched').click());
    await page.waitForTimeout(150);
    const w = await page.evaluate(() => { const b = $('revBox'); const lab = [...b.querySelectorAll('.sch-lab')].find(l => /plumbing rough-in/.test(l.textContent)); lab.click(); return { box: !!$('schedBox'), bars: b.querySelectorAll('.sch-bar').length, tools: !!b.querySelector('.sch-tools'), page: !!b.querySelector('.sch-page'), hint: /Eric's plan, as it landed on this phone/.test(b.textContent), sub: /🔧 sub · Drain Kings/.test(lab.textContent), ro: !!b.querySelector('.sch-edit-ro') && /Drain Kings/.test(b.querySelector('.sch-edit-ro').textContent) && /A move is his to make/.test(b.textContent), edit: !!$('schN') || !!b.querySelector('.sch-del'), back: /‹ Back to the job card/.test(b.textContent) }; });
    return /^📅 Schedule — 5 steps, last ends /.test(plate) && w.box && w.bars === 5 && !w.tools && !w.page && w.hint && w.sub && w.ro && !w.edit && w.back;
  })());
  ok('‹ Back lands on the job card; the portal wears the plate too; Every job shows both plans', await (async () => {
    await page.evaluate(() => [...$('revBox').querySelectorAll('button')].find(b => /^‹ Back/.test(b.textContent.trim())).click());
    await page.waitForTimeout(150);
    const back = await page.evaluate(() => !!$('jcJob') && $('jcJob').value === 'Oak House');
    await page.evaluate(() => { closeReview(); openPortalWin(); });
    await page.waitForTimeout(200);
    const portal = await page.evaluate(() => { const p = $('portalBox').querySelector('.pf-sched'); return !!p && /· 2 with a plan$/.test(p.textContent.trim()); });
    await page.evaluate(() => { closePortalWin(); openSchedule('*'); });
    const every = await page.evaluate(() => { const r = [...$('revBox').querySelectorAll('.sch-band')].map(b => b.dataset.job).join('|') === 'Oak House|Pine Cabin' && !$('revBox').querySelector('.sch-tools'); closeReview(); return r; });
    return back && portal && every;
  })());
  ok('it reads, it does not change: every writer refuses on a crew phone, the subs window shows the sub\'s booked weeks, and nothing was written', await page.evaluate(() => { const st = schedSteps('Oak House'); const a = schedAddStep('Oak House', 'x', '1') === null && schedMove('Oak House', st[2].id, 3).length === 0 && schedMoveJob('Oak House', 7).length === 0 && schedDoneToggle('Oak House', st[2].id) === undefined && !schedSteps('Oak House')[2].done && schedPasteText('Oak House', 'x 1 day') === 0 && schedFromTemplate('Barn') === 0 && schedPublish() === null && !schedPlan('Barn');
    schedSet('Oak House', st[2].id, 'n', 'changed'); schedDel('Oak House', st[2].id); const b = schedSteps('Oak House').length === 5 && schedSteps('Oak House')[2].n === 'electrical rough-in';
    openSubs('Oak House'); const dk = [...$('subsBox').querySelectorAll('.sb-row')].find(r => /Drain Kings/.test(r.textContent)); const c = !!dk && !!dk.querySelector('.sb-sched') && /📅 Oak House · plumbing rough-in/.test(dk.querySelector('.sb-sched').textContent); closeReview();
    return a && b && c && window._ups.filter(p => !/pending\.json$/.test(p)).length === 0; }), await page.evaluate(() => JSON.stringify(window._ups)));   // (pending.json is the review pile's own save on a window close — not this build's)
  await page.evaluate(() => { localStorage.removeItem('daylog-crew-name'); localStorage.removeItem('daylog-crew-sched'); });

  ok('version bumped — APP_VER and the footer agree', /const APP_VER = 'v7\.(6[8-9]|[7-9]\d)'/.test(src) && new RegExp('<footer>' + (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1].replace('.', '\\.') + ' ·').test(src));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
