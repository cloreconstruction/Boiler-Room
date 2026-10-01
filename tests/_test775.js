// 🔗 v7.75 — THE LINKS. Eric: "the gantt chart needs to have more link buttons: unlink all, relink all, and stay linked only to
// everything after this category". A step is 🔗 linked (a move takes the linked steps after it along) or 🔓 unlinked (it moves
// alone, and no other step's move takes it along) — and it STAYS that way. Three plates beside the open step's own switch:
// 🔗 Stay linked only to everything after this step · 🔓 Unlink all · 🔗 Relink all; the two job-wide ones are also among the
// job's tools under the chart. The row says 🔓 unlinked in words and the heading counts them. The link is his own tool: in his
// plan, never in the crew's copy or on a homeowner's page.
// Every name below is made up; the days hang off a Monday with no holiday near it, so the checks hold whenever they run.
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
  // six steps in a row on Oak House, one a week (each a Monday), the third with one beside it; Pine Cabin has a plan of its own
  await page.evaluate(() => {
    jobs = ['Oak House', 'Pine Cabin', 'Internal / Admin']; crew = ['Phil', 'Kevin']; prefs.office = ['Phil']; entries = []; todos = []; nextId = 1;
    delete prefs.subs; prefs.sched = { wd: 1, jobs: {} }; delete prefs.schedTaken; prefs.cards = {}; _cardJob = '';
    _portalIdx = { clients: [{ key: 'oak', job: 'Oak House', code: 'oak-111111' }] };
    _dbxFiles[portalRoot() + '/oak-111111.json'] = JSON.stringify({ name: 'Oak House', show: { sched: true }, sched: { at: '2026-01-01', steps: [] } });   // WHERE WE ARE is on their page: a real change to the plan would write it
    localStorage.removeItem('daylog-sched-shade'); localStorage.removeItem('daylog-sched-zoom'); _schedShade = { we: false, fr: false, ho: false }; _schedZoom = 1; _schedWho = '';
    let mon = schedAddDays(schedMonday(localDay(new Date())), 7);
    const clear = m => { for (let i = 0; i < 70; i++) if (schedHolidayOf(schedAddDays(m, i))) return false; return true; };
    for (let i = 0; i < 30 && !clear(mon); i++) mon = schedAddDays(mon, 7);
    const d = n => schedAddDays(mon, n), put = (job, x) => schedPlan(job, true).steps.push(schedClean(x));
    window._mon = mon;
    put('Oak House', { id: 'S1', n: 'one', start: d(0), days: 3, who: 'crew' });
    put('Oak House', { id: 'S2', n: 'two', start: d(7), days: 3, who: 'sub' });
    put('Oak House', { id: 'S3', n: 'three', start: d(14), days: 3, who: 'crew' });
    put('Oak House', { id: 'S3b', n: 'three beside', start: d(14), days: 2, who: 'sub' });
    put('Oak House', { id: 'S4', n: 'four', start: d(21), days: 3, who: 'sub' });
    put('Oak House', { id: 'S5', n: 'five', start: d(28), days: 1, who: 'inspection' });
    put('Oak House', { id: 'S6', n: 'six done', start: d(29), days: 1, who: 'crew', done: d(29) });
    put('Pine Cabin', { id: 'P1', n: 'siding', start: d(0), days: 4, who: 'crew' });
    put('Pine Cabin', { id: 'P2', n: 'gutters', start: d(7), days: 2, who: 'sub' });
    renderJobSelects(); closePanels(); renderAll(); clearTimeout(_schedPubT); _schedPubT = null; window._saves = 0; window._pubs = 0; window._ups.length = 0; _said.length = 0;
    openSchedule('Oak House');
  });
  await page.waitForTimeout(400);
  await page.evaluate(() => { window._ups.length = 0; window._saves = 0; });   // (opening the window on a job whose card is ON put their page right — that is v7.68's, not what is under test)
  const starts = job => page.evaluate(job => Object.fromEntries(schedSteps(job || 'Oak House').map(s => [s.id, Math.round((schedDate(s.start) - schedDate(window._mon)) / 86400000)])), job);
  const free = job => page.evaluate(job => schedSteps(job || 'Oak House').filter(s => s.free).map(s => s.id).join('|'), job);
  const openRow = id => page.evaluate(id => { if (_schedOpen === id) return; const s = schedSteps('Oak House').concat(schedSteps('Pine Cabin')).find(x => x.id === id); const lab = [...document.querySelectorAll('#schedBox .sch-lab')].find(l => l.querySelector('b').textContent.replace(/^[✓⚠] /, '').trim() === s.n); lab.click(); }, id);
  const rows = () => page.evaluate(() => Object.fromEntries([...document.querySelectorAll('#schedBox .sch-lab')].map(l => [l.querySelector('b').textContent.replace(/^[✓⚠] /, '').trim(), (l.querySelector('.sch-freew') || {}).textContent || ''])));
  const head = () => page.evaluate(() => { const n = document.querySelector('#schedBox .sch-band-h .sch-free-n'); return n ? n.textContent.trim() : ''; });
  const say = () => page.evaluate(() => $('schMoveSay') ? $('schMoveSay').textContent.trim() : '');
  const base = await starts();

  console.log('— 🔗 the plates —');
  await openRow('S3'); await page.waitForTimeout(120);
  ok('the open step\'s editor has the links together, over the move buttons: its own switch, then 🔗 Stay linked only to everything after this step, then 🔓 Unlink all and 🔗 Relink all side by side — each a thumb tall, inside the phone', await page.evaluate(() => { const g = $('schLinks'); if (!g) return false; const b = [...g.querySelectorAll('button')], r = b.map(x => x.getBoundingClientRect()), mv = document.querySelector('#schEdit .sch-moves');
    return b.map(x => x.id).join('|') === 'schSolo|schLinkFrom|schUnlinkAll|schRelinkAll' && b.slice(1).map(x => x.textContent.trim()).join('|') === '🔗 Stay linked only to everything after this step|🔓 Unlink all|🔗 Relink all'
      && r.every(x => x.height >= 44 && x.left >= 0 && x.right <= innerWidth + 0.5) && Math.abs(r[2].top - r[3].top) < 1 && r[3].left > r[2].right - 1 && r[1].width > r[2].width * 1.8 && !!(g.compareDocumentPosition(mv) & Node.DOCUMENT_POSITION_FOLLOWING) && document.documentElement.scrollWidth <= innerWidth + 0.5; }));
  ok('the job\'s tools under the chart carry the two job-wide ones too; all linked to start, so 🔗 reads ✓ ALL LINKED (lit, pressed) and nothing on the chart says unlinked', await page.evaluate(() => { const u = $('schToolUnlink'), r = $('schToolRelink');
    return !!u && !!r && u.textContent.trim() === '🔓 Unlink all — every step moves on its own' && u.getAttribute('aria-pressed') === 'false' && r.textContent.trim() === '✓ 🔗 ALL LINKED — a move takes the later steps along' && r.getAttribute('aria-pressed') === 'true' && r.classList.contains('sel')
      && !document.querySelector('#schedBox .sch-freew') && u.getBoundingClientRect().height >= 44 && u.getBoundingClientRect().right <= innerWidth + 0.5; }));

  console.log('— 🔓 unlink all —');
  ok('🔓 Unlink all: every step of the job is unlinked — each row says 🔓 unlinked, the heading 🔓 ALL UNLINKED (the done one is not counted), the toast says so, the tool plate reads ✓ ALL UNLINKED, the open step\'s switch is pressed', await (async () => {
    await page.evaluate(() => { _said.length = 0; $('schUnlinkAll').click(); }); await page.waitForTimeout(120);
    const r = await rows(), f = await free();
    return f === 'S1|S2|S3|S3b|S4|S5|S6' && Object.values(r).every(v => v === '🔓 unlinked') && (await head()) === '🔓 ALL UNLINKED' && (await say()).indexOf('🔓 Unlinked — only this step moves') === 0
      && await page.evaluate(() => _said.some(m => m === '🔓 All 7 steps on Oak House are unlinked — a move takes only the step you move') && $('schSolo').getAttribute('aria-pressed') === 'true' && $('schToolUnlink').textContent.trim() === '✓ 🔓 ALL UNLINKED — every step moves on its own' && $('schToolUnlink').classList.contains('sel') && !$('schToolRelink').classList.contains('sel') && $('schToolRelink').textContent.trim() === '🔗 Relink all — a move takes the later steps along');
  })(), JSON.stringify({ free: await free(), head: await head() }));
  ok('…and now ANY step moves alone: the third a week later, the first a work day later, a typed start on the second — nothing else moves each time', await (async () => {
    await page.evaluate(() => { [...document.querySelectorAll('#schEdit button')].find(b => /^1 week later/.test(b.textContent.trim())).click(); }); await page.waitForTimeout(80);
    const a = await starts();
    await openRow('S1'); await page.waitForTimeout(80); await page.evaluate(() => { [...document.querySelectorAll('#schEdit button')].find(b => /^1 work day later/.test(b.textContent.trim())).click(); }); await page.waitForTimeout(80);
    const b = await starts();
    await openRow('S2'); await page.waitForTimeout(80); await page.evaluate(() => { const i = $('schStart'); i.value = schedAddDays(window._mon, 9); i.dispatchEvent(new Event('change')); }); await page.waitForTimeout(80);
    const c = await starts();
    const only = (x, was, id, to) => Object.keys(was).every(k => k === id ? x[k] === to : x[k] === was[k]);
    return only(a, base, 'S3', 21) && only(b, a, 'S1', 1) && only(c, b, 'S2', 9);
  })(), JSON.stringify(await starts()));
  ok('it STAYS: the window closed and opened again, the plan cleaned and read again — still all unlinked', await (async () => {
    await page.evaluate(() => { closeReview(); prefs.sched = JSON.parse(JSON.stringify(prefs.sched)); openSchedule('Oak House'); }); await page.waitForTimeout(300);
    return (await free()) === 'S1|S2|S3|S3b|S4|S5|S6' && (await head()) === '🔓 ALL UNLINKED';
  })());
  ok('a step ADDED to an all-unlinked job is linked (the default) — the heading counts the unlinked ones instead of saying ALL', await (async () => {
    await page.evaluate(() => { schedAddStep('Oak House', 'a new one', '2', 'crew'); renderSchedule(); }); await page.waitForTimeout(80);
    const h = await head(), r = await rows();
    await page.evaluate(() => { const s = schedSteps('Oak House').find(x => x.n === 'a new one'); schedDel('Oak House', s.id); renderSchedule(); });
    return h === '🔓 6 unlinked' && r['a new one'] === '' && r['one'] === '🔓 unlinked';
  })(), await head());

  console.log('— 🔗 relink all —');
  ok('🔗 Relink all (the tool under the chart, no step open): nothing is unlinked — no row says so, the heading has no count, the plate reads ✓ ALL LINKED, the toast says so', await (async () => {
    await page.evaluate(() => { _schedOpen = null; renderSchedule(); _said.length = 0; $('schToolRelink').click(); }); await page.waitForTimeout(120);
    return (await free()) === '' && Object.values(await rows()).every(v => v === '') && (await head()) === ''
      && await page.evaluate(() => _said.some(m => m === '🔗 All 7 steps on Oak House are linked — a move takes the later steps along') && $('schToolRelink').classList.contains('sel') && /^✓ 🔗 ALL LINKED/.test($('schToolRelink').textContent.trim()) && !$('schToolUnlink').classList.contains('sel'));
  })());
  ok('…and the rule is whole: a move on a step takes every later one along (the done one stays), and back', await (async () => {
    await page.evaluate(() => { schedSet('Oak House', 'S1', 'start', schedAddDays(window._mon, 0)); schedSet('Oak House', 'S2', 'start', schedAddDays(window._mon, 7)); schedSet('Oak House', 'S3', 'start', schedAddDays(window._mon, 14)); renderSchedule(); });
    const b0 = await starts();
    await page.evaluate(() => { schedMoveBy('Oak House', 'S2', 1, 0); }); const b1 = await starts();
    await page.evaluate(() => { schedMoveBy('Oak House', 'S2', -1, 0); renderSchedule(); }); const b2 = await starts();
    return JSON.stringify(b0) === JSON.stringify(base) && b1.S1 === b0.S1 && ['S2', 'S3', 'S3b', 'S4', 'S5'].every(k => b1[k] === b0[k] + 7) && b1.S6 === b0.S6 && JSON.stringify(b2) === JSON.stringify(b0);
  })(), JSON.stringify(await starts()));

  console.log('— 🔗 stay linked only to everything after this step —');
  await openRow('S3'); await page.waitForTimeout(120);
  ok('on the third step: it and every step that starts on or after it (the one BESIDE it too) stay linked; the two that start before it are unlinked — rows, heading (🔓 2 unlinked), toast and the line under the buttons all say so', await (async () => {
    await page.evaluate(() => { _said.length = 0; $('schLinkFrom').click(); }); await page.waitForTimeout(120);
    const r = await rows();
    return (await free()) === 'S1|S2' && r['one'] === '🔓 unlinked' && r['two'] === '🔓 unlinked' && ['three', 'three beside', 'four', 'five', 'six done'].every(k => r[k] === '') && (await head()) === '🔓 2 unlinked'
      && (await say()) === '🔗 Linked — a move takes this step and the 3 linked steps that start on or after it. A ✓ done step never moves.'
      && await page.evaluate(() => _said.some(m => m === '🔗 three and the 4 steps after it are linked · 🔓 the 2 before it are unlinked') && $('schSolo').getAttribute('aria-pressed') === 'false' && !$('schToolUnlink').classList.contains('sel') && !$('schToolRelink').classList.contains('sel'));
  })(), JSON.stringify({ free: await free(), head: await head(), say: await say(), said: await page.evaluate(() => _said.slice()) }));
  ok('nothing EARLIER pushes it now: the first step a week later moves only itself — the third and what follows stay', await (async () => {
    const b0 = await starts();
    await page.evaluate(() => { schedMoveBy('Oak House', 'S1', 1, 0); }); const b1 = await starts();
    await page.evaluate(() => { schedMoveBy('Oak House', 'S1', -1, 0); renderSchedule(); });
    return b1.S1 === b0.S1 + 7 && Object.keys(b0).filter(k => k !== 'S1').every(k => b1[k] === b0[k]);
  })());
  ok('…and it still pushes what follows: the third a week later takes the one beside it and every later step along; the two before it and the done one stay', await (async () => {
    const b0 = await starts();
    await page.evaluate(() => { [...document.querySelectorAll('#schEdit button')].find(b => /^1 week later/.test(b.textContent.trim())).click(); }); await page.waitForTimeout(80);
    const b1 = await starts();
    await page.evaluate(() => { schedMoveBy('Oak House', 'S3', -1, 0); renderSchedule(); });
    return ['S3', 'S3b', 'S4', 'S5'].every(k => b1[k] === b0[k] + 7) && b1.S1 === b0.S1 && b1.S2 === b0.S2 && b1.S6 === b0.S6;
  })(), JSON.stringify(await starts()));
  ok('from ALL UNLINKED, the same plate on the fourth step links it and the ones after it, and leaves the earlier ones unlinked', await (async () => {
    await page.evaluate(() => { schedLinkAll('Oak House', false); renderSchedule(); }); await openRow('S4'); await page.waitForTimeout(100);
    await page.evaluate(() => { _said.length = 0; $('schLinkFrom').click(); }); await page.waitForTimeout(100);
    return (await free()) === 'S1|S2|S3|S3b' && (await head()) === '🔓 4 unlinked' && await page.evaluate(() => _said.some(m => m === '🔗 four and the 2 steps after it are linked · 🔓 the 4 before it are unlinked'));
  })(), JSON.stringify({ free: await free(), head: await head() }));
  ok('on the FIRST step it is the same as relink all (nothing starts before it): the toast names no unlinked ones', await (async () => {
    await openRow('S1'); await page.waitForTimeout(100);
    await page.evaluate(() => { _said.length = 0; $('schLinkFrom').click(); }); await page.waitForTimeout(100);
    return (await free()) === '' && (await head()) === '' && await page.evaluate(() => _said.some(m => m === '🔗 one and the 6 steps after it are linked'));
  })());

  console.log('— 🧱 what a link is and is not —');
  ok('the whole job a week later moves every open step, linked or not', await (async () => {
    await page.evaluate(() => { schedLinkAll('Oak House', false); }); const b0 = await starts();
    await page.evaluate(() => { schedMoveJob('Oak House', 7); }); const b1 = await starts();
    await page.evaluate(() => { schedMoveJob('Oak House', -7); schedLinkAll('Oak House', true); renderSchedule(); });
    return ['S1', 'S2', 'S3', 'S3b', 'S4', 'S5'].every(k => b1[k] === b0[k] + 7) && b1.S6 === b0.S6;
  })());
  ok('a link change is saved in HIS plan and nowhere else: one save of his own book each time — no publish to the crew, no write to a homeowner\'s page (their card is ON for this job), no key on the device', await (async () => {
    await page.waitForTimeout(1100);   // (the whole-job move just above is a real change: let its page write land first)
    await page.evaluate(() => { clearTimeout(_schedPubT); _schedPubT = null; window._saves = 0; window._pubs = 0; window._ups.length = 0; schedLinkAll('Oak House', false); schedLinkFrom('Oak House', 'S3'); schedLinkToggle('Oak House', 'S5'); });
    await page.waitForTimeout(1200);
    const r = await page.evaluate(() => ({ saves: window._saves, pubs: window._pubs, ups: window._ups.slice(), t: _schedPubT, mine: prefs.sched.jobs['Oak House'].steps.filter(s => s.free).map(s => s.id).join('|'), ls: Object.keys(localStorage).filter(k => /link|free/i.test(k)).length }));
    return r.saves === 3 && r.pubs === 0 && r.ups.length === 0 && r.t === null && r.mine === 'S1|S2|S5' && r.ls === 0;
  })(), await page.evaluate(() => JSON.stringify({ saves: window._saves, pubs: window._pubs, ups: window._ups })));
  ok('🧱 the link never leaves his plan: not a word of it in the crew\'s copy or in the cut for their page', await page.evaluate(() => { const pub = JSON.stringify(schedPublish()), cut = JSON.stringify(schedPageCut('Oak House')); clearTimeout(_schedPubT); _schedPubT = null;
    return !/free|unlink|link/i.test(pub) && !/free|unlink|link/i.test(cut) && JSON.parse(pub).jobs['Oak House'].steps.length === 7 && JSON.parse(cut).steps.every(s => Object.keys(s).sort().join(',') === 'n,st'); }));
  ok('a real change to the plan still goes out: a move publishes to the crew and their page follows', await (async () => {
    await page.evaluate(() => { window._pubs = 0; window._ups.length = 0; schedLinkAll('Oak House', true); schedMoveBy('Oak House', 'S4', 0, 1); });
    await page.waitForTimeout(1300);
    const r = await page.evaluate(() => ({ pubs: window._pubs, page: window._ups.filter(p => /oak-111111\.json$/.test(p)).length }));
    await page.evaluate(() => { schedMoveBy('Oak House', 'S4', 0, -1); }); await page.waitForTimeout(1300);
    return r.pubs >= 1 && r.page === 1;
  })());
  ok('📋 Every job: a step opened there has the same plates, and they act on ITS job alone', await (async () => {
    await page.evaluate(() => { $('schedJob').value = '*'; $('schedJob').dispatchEvent(new Event('change')); }); await page.waitForTimeout(150);
    await openRow('P1'); await page.waitForTimeout(120);
    const has = await page.evaluate(() => !!$('schLinks') && !$('schToolUnlink') && $('schEdit').closest('.sch-band').dataset.job === 'Pine Cabin');
    await page.evaluate(() => $('schUnlinkAll').click()); await page.waitForTimeout(100);
    const r = { pine: await free('Pine Cabin'), oak: await free('Oak House'), heads: await page.evaluate(() => [...document.querySelectorAll('#schedBox .sch-band')].map(b => b.dataset.job + ':' + ((b.querySelector('.sch-free-n') || {}).textContent || '').trim()).join(' | ')) };
    await page.evaluate(() => { $('schRelinkAll').click(); $('schedJob').value = 'Oak House'; $('schedJob').dispatchEvent(new Event('change')); }); await page.waitForTimeout(120);
    return has && r.pine === 'P1|P2' && r.oak === '' && r.heads === 'Oak House: | Pine Cabin:🔓 ALL UNLINKED' && (await free('Pine Cabin')) === '';
  })(), JSON.stringify({ pine: await free('Pine Cabin'), oak: await free('Oak House') }));
  ok('a plan taken from the inbox lands linked, whatever the file says', await page.evaluate(() => { const p = schedInboxClean({ id: 'x1', job: 'Barn', steps: [{ n: 'slab', days: 3, who: 'sub', start: schedAddDays(window._mon, 2), free: 1 }] }); return !!p && p.steps.length === 1 && !('free' in p.steps[0]); }));
  ok('the 👁 crew preview and a crew phone have none of it: no plates, no 🔓 on a row or a heading, and every link writer refuses', await page.evaluate(() => { schedLinkAll('Oak House', false); crewPreview = true; _schedOpen = 'S3'; renderSchedule();
    const a = !$('schLinks') && !$('schToolUnlink') && !$('schToolRelink') && !document.querySelector('#schedBox .sch-freew') && !!document.querySelector('#schedBox .sch-edit-ro');
    const b = schedLinkAll('Oak House', true) === 0 && schedLinkFrom('Oak House', 'S3') === null && schedLinkToggle('Oak House', 'S3') === null && schedSteps('Oak House').every(s => s.free === 1);
    crewPreview = false; schedLinkAll('Oak House', true); _schedOpen = null; renderSchedule(); closeReview(); return a && b; }));

  ok('the homeowner\'s page has no word of it', !/schLinks|schedLink|sch-freew|\.free\b/.test(csrc));
  ok('version bumped — APP_VER and the footer agree', /const APP_VER = 'v7\.(7[5-9]|[89]\d)'/.test(src) && new RegExp('<footer>' + (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1].replace('.', '\\.') + ' ·').test(src));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
