// 📅 v7.67 — THE SCHEDULE. Eric: "can we build in a gantt calendar that can be easily made and moved? i used a site called
// clickup and it worked fairly well but was difficult to see enough info at once and was a huge chore to try and just juggle
// and change the chart with multiple jobs and constant delays." A job's plan is a list of steps with days (typed, pasted, or
// the standard sequence); a move takes the step and everything after it; ✓ done never moves; one week grid for every job;
// the crew on two jobs in one week is said in words. Doors: the 📇 Job Card (under 📐 Plans) and the top of the 🏠 portal.
// Every job name and day below is made up; the dates are made relative to today so the checks hold whenever they run.
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

  const stub = () => page.evaluate(() => {
    window._saves = 0; window.scheduleSave = () => { window._saves++; }; window.publishSharedNotes = async () => {}; window.pushOut = () => false;
    window._dbxFiles = window._dbxFiles || {}; window._ups = [];
    window.dbxDownload = async p => (window._dbxFiles || {})[p] ?? null;
    window.dbxUpload = async (p, body) => { (window._dbxFiles || {})[p] = typeof body === 'string' ? body : '[file]'; window._ups.push(p); return {}; };
    window.dbxPathExists = async p => Object.prototype.hasOwnProperty.call(window._dbxFiles || {}, p);
    window.dbxList = async () => ({ entries: [] }); window.dbxRpc = async () => ({});
    window.renderPortalList = () => {};
    if (!window._said) { window._said = []; const t0 = window.toast; window.toast = (m, g) => { if (m) _said.push(String(m)); return t0(m, g); }; }
    dbx.refreshToken = 'test-token';
  });
  await stub();
  await page.evaluate(() => { jobs = ['Oak House', 'Pine Cabin', 'Personal']; crew = ['Phil', 'Kevin']; prefs.office = ['Phil']; entries = []; todos = []; nextId = 1; prefs.cards = {}; prefs.sched = { jobs: {} };
    _portalIdx = { clients: [{ key: 'oak', job: 'Oak House', code: 'oak-111111' }] }; _cardJob = ''; localStorage.removeItem('daylog-cardjob'); renderJobSelects(); closePanels(); renderAll(); window._ups.length = 0; });   // (renderAll publishes the mail rules — not what is under test)
  const steps = job => page.evaluate(job => schedSteps(job).map(s => ({ n: s.n, days: s.days, who: s.who, start: s.start, done: s.done })), job);
  const today = await page.evaluate(() => localDay(new Date()));
  const plus = n => page.evaluate(n => schedAddDays(localDay(new Date()), n), n);

  console.log('— made in a minute —');
  ok('the words: "1.5 weeks" → 11 days (rounded), "2.5 wk" → 18, "3-4 days" → the bigger one, "2" → 2, "1 day" → 1, nothing → 1', await page.evaluate(() => [schedDaysOf('1.5 weeks'), schedDaysOf('2.5 wk'), schedDaysOf('3-4 days'), schedDaysOf('2'), schedDaysOf('1 day'), schedDaysOf('')].join('|') === '11|18|4|2|1|1'));
  ok('a pasted list — one step a line, the days last — lands as steps, one after the other, each starting the day after the one before ends; who is read off the words (plumbing → sub, inspection → inspection, move in → homeowner, the rest → crew)', await (async () => {
    const n = await page.evaluate(() => schedPasteText('Oak House', 'plumbing 1.5 weeks\nheat/ducting 2-3 days\ninsulation 3-4 days\nsheetrock 2.5 weeks\nrough-in inspection 1 day\nfloors, doors, trim 2 weeks\nmove in'));
    const st = await steps('Oak House');
    const d0 = st[0].start;
    const starts = await page.evaluate(d0 => { const st = schedSteps('Oak House'); let d = d0, okk = true; st.forEach(s => { if (s.start !== d) okk = false; d = schedAddDays(d, s.days); }); return okk; }, d0);
    return n === 7 && st.map(s => s.n).join('|') === 'plumbing|heat/ducting|insulation|sheetrock|rough-in inspection|floors, doors, trim|move in' && st.map(s => s.days).join('|') === '11|3|4|18|1|14|1' && st.map(s => s.who).join('|') === 'sub|sub|sub|sub|inspection|crew|homeowner' && d0 === (await plus(0)) && starts;
  })(), JSON.stringify(await steps('Oak House')));
  ok('the whole plan is one scheduleSave away (prefs.sched — his own prefs, synced like everything else)', await page.evaluate(() => _saves > 0 && prefs.sched.jobs['Oak House'].steps.length === 7));
  ok('➕ Add a step typed in the window lands AFTER the last step, with its days and who', await (async () => {
    await page.evaluate(() => openSchedule('Oak House'));
    await page.evaluate(() => { _schedAdd = true; renderSchedule(); $('schAddN').value = 'clean'; $('schAddD').value = '2 days'; $('schAddW').value = 'crew'; schedAddTap('Oak House'); });
    const st = await steps('Oak House');
    const last = st[st.length - 1], before = st[st.length - 2];
    return st.length === 8 && last.n === 'clean' && last.days === 2 && last.who === 'crew' && last.start === await page.evaluate(b => schedAddDays(b.start, b.days), before) && await page.evaluate(() => !!$('schAddN'));   // the add row stays open for the next one
  })(), JSON.stringify(await steps('Oak House')));
  ok('📐 the standard sequence fills an EMPTY job only (22 steps in build order); a job that has steps refuses in words', await (async () => {
    const n1 = await page.evaluate(() => schedFromTemplate('Pine Cabin'));
    const st = await steps('Pine Cabin');
    const n2 = await page.evaluate(() => { _said.length = 0; schedTemplateTap('Oak House'); return schedSteps('Oak House').length; });
    return n1 === 22 && st.length === 22 && st[0].n === 'Demo' && st[21].n === 'Move in' && st[21].who === 'homeowner' && n2 === 8 && await page.evaluate(() => _said.some(s => /already has steps/.test(s)));
  })());

  console.log('— moved in one tap —');
  ok('a move on a step takes that step AND every step that starts on or after it by the same days; the steps before it stay', await (async () => {
    const before = await steps('Oak House');
    const moved = await page.evaluate(() => { const st = schedSteps('Oak House'); return schedMove('Oak House', st[2].id, 3).map(s => s.n); });
    const after = await steps('Oak House');
    return moved.join('|') === 'insulation|sheetrock|rough-in inspection|floors, doors, trim|move in|clean' && after.slice(0, 2).every((s, i) => s.start === before[i].start) && await page.evaluate(b => { const st = schedSteps('Oak House'); return st.slice(2).every((s, i) => s.start === schedAddDays(b[i + 2].start, 3)); }, before);
  })());
  ok('a ✓ done step never moves — even when it sits inside the moved range', await (async () => {
    await page.evaluate(() => { const st = schedSteps('Oak House'); schedDoneToggle('Oak House', st[3].id); });   // sheetrock done
    const before = await steps('Oak House');
    await page.evaluate(() => { const st = schedSteps('Oak House'); schedMove('Oak House', st[2].id, 7); });
    const after = await steps('Oak House');
    return before[3].done === today && after[3].start === before[3].start && after[2].start === await page.evaluate(b => schedAddDays(b, 7), before[2].start) && after[4].start === await page.evaluate(b => schedAddDays(b, 7), before[4].start);
  })());
  ok('a typed start day is a move by the difference — what follows comes along', await (async () => {
    const before = await steps('Oak House');
    const want = await page.evaluate(b => schedAddDays(b, 5), before[5].start);
    await page.evaluate(w => { const st = schedSteps('Oak House'); schedStartSet('Oak House', st[5].id, w); }, want);
    const after = await steps('Oak House');
    return after[5].start === want && after[6].start === await page.evaluate(b => schedAddDays(b, 5), before[6].start) && after[0].start === before[0].start;
  })());
  ok('⇄ the whole job a week later moves every open step and leaves the done one', await (async () => {
    const before = await steps('Oak House');
    await page.evaluate(() => schedMoveJob('Oak House', 7));
    const after = await steps('Oak House');
    return after.every((s, i) => s.done ? s.start === before[i].start : true) && await page.evaluate(b => schedSteps('Oak House').every((s, i) => s.done || s.start === schedAddDays(b[i].start, 7)), before);
  })());
  ok('the toast says what moved and when the last step now ends', await page.evaluate(() => { _said.length = 0; const st = schedSteps('Oak House'); schedMoveTap('Oak House', st[5].id, 1); return _said.some(s => /^📅 floors, doors, trim and 2 steps after it moved 1 day later · the last step ends /.test(s)); }), await page.evaluate(() => _said.join(' | ')));
  ok('✕ Delete is two taps (⚠ SURE?), and the first tap lets go by itself', await (async () => {
    await page.evaluate(() => { const st = schedSteps('Oak House'); _schedOpen = st[7].id; renderSchedule(); });
    const n0 = (await steps('Oak House')).length;
    await page.evaluate(() => $('revBox').querySelector('.sch-del').click());
    const armed = await page.evaluate(() => /⚠ SURE\? Tap again/.test($('revBox').querySelector('.sch-del').textContent) && $('revBox').querySelector('.sch-del').classList.contains('armed'));
    const n1 = (await steps('Oak House')).length;
    await page.evaluate(() => $('revBox').querySelector('.sch-del').click());
    const n2 = (await steps('Oak House')).length;
    return armed && n1 === n0 && n2 === n0 - 1 && await page.evaluate(() => !schedSteps('Oak House').some(s => s.n === 'clean') && _said.some(s => /^✕ clean is off the plan$/.test(s)));
  })());

  console.log('— see it all —');
  ok('the window: a job wheel with 📋 Every job first, the chart (weeks across, a bar a step, the names pinned on the left), a row a step in start order', await (async () => {
    await page.evaluate(() => openSchedule('Oak House'));
    return await page.evaluate(() => { const o = $('schedJob').options; const labs = [...$('revBox').querySelectorAll('.sch-lab')].map(l => l.querySelector('b').textContent.replace(/^[✓⚠] /, '')); const bars = $('revBox').querySelectorAll('.sch-bar').length; const heads = $('revBox').querySelectorAll('.sch-head span').length;
      const inStartOrder = schedSteps('Oak House').slice().sort((a, b) => a.start.localeCompare(b.start)).map(s => s.n).join('|');   // the done sheetrock stayed put while the rest moved on, so it sits third now
      return /^📋 Every job · 2 with a plan$/.test(o[0].textContent) && $('schedJob').value === 'Oak House' && labs.join('|') === inStartOrder && inStartOrder === 'plumbing|heat/ducting|sheetrock|insulation|rough-in inspection|floors, doors, trim|move in' && bars === 7 && heads >= 4 && getComputedStyle($('revBox').querySelector('.sch-lab')).position === 'sticky' && /✓ SHOWING — Oak House/.test($('schedNow').textContent); });
  })(), await page.evaluate(() => [...$('revBox').querySelectorAll('.sch-lab b')].map(b => b.textContent).join('|')));
  ok('a bar sits where its days are: the first step starts at the left of its week, a later step further right, a sub step is outlined and the move-in a round mark, the done step dimmed', await page.evaluate(() => { const bars = [...$('revBox').querySelectorAll('.sch-bar')]; const l = b => parseFloat(b.style.left); return l(bars[0]) < l(bars[1]) && l(bars[1]) < l(bars[5]) && bars[0].classList.contains('sub') && bars[6].classList.contains('mark') && bars[2].classList.contains('done') && bars[2].textContent === 'sheetrock' && parseFloat(bars[0].style.width) > 0; }));
  ok('a tap on a row opens its editor UNDER the chart — the step, its days, its start, who, a note, the three moves, ✓ Done, ✕ Delete', await (async () => {
    await page.evaluate(() => $('revBox').querySelectorAll('.sch-lab')[1].click());
    return await page.evaluate(() => { const e = $('schEdit'); const chart = $('revBox').querySelector('.sch-chart'); return !!e && $('schN').value === 'heat/ducting' && $('schDays').value === '3' && $('schStart').type === 'date' && !!$('schWho') && !!$('schNote') && [...e.querySelectorAll('button')].map(b => b.textContent.trim()).join('|') === '◀ 1 day earlier|1 day later ▶|1 week later ▶▶|✓ Done|✕ Delete this step|▴ Fold' && chart.compareDocumentPosition(e) & Node.DOCUMENT_POSITION_FOLLOWING && !chart.contains(e) && $('revBox').querySelectorAll('.sch-lab')[1].classList.contains('open'); });
  })());
  ok('a late step (its last day before today, not done) is said in words — ⚠ LATE on the row and ⚠ n LATE on the band', await (async () => {
    await page.evaluate(() => { const st = schedSteps('Oak House'); schedMoveJob('Oak House', -40); openSchedule('Oak House'); });
    const r = await page.evaluate(() => { const lab = $('revBox').querySelector('.sch-lab'); return /^⚠ plumbing/.test(lab.querySelector('b').textContent) && /LATE/.test(lab.querySelector('small').textContent) && lab.classList.contains('late') && /⚠ \d LATE/.test($('revBox').querySelector('.sch-band-h').textContent) && $('revBox').querySelector('.sch-bar').classList.contains('late'); });
    await page.evaluate(() => { schedMoveJob('Oak House', 40); });
    return r;
  })());
  ok('📋 Every job stacks every job that has a plan on ONE week grid, each with its own band and the same week columns', await (async () => {
    await page.evaluate(() => { openSchedule('*'); });
    return await page.evaluate(() => { const bands = [...$('revBox').querySelectorAll('.sch-band')]; const wk = bands.map(b => b.querySelector('.sch-head').children.length); return bands.length === 2 && bands.map(b => b.dataset.job).join('|') === 'Oak House|Pine Cabin' && wk[0] === wk[1] && /every job with a plan/.test($('schedNow').textContent) && !$('revBox').querySelector('.sch-tools'); });
  })());
  ok('the crew on two jobs in one week is said in words on both bands and the week heading wears ⚠', await (async () => {
    // Pine Cabin's Demo (crew, 5 days) starts today; Oak House's crew step moved onto the same week
    await page.evaluate(() => { const st = schedSteps('Oak House'); const f = st.find(s => s.n === 'floors, doors, trim'); schedMove('Oak House', f.id, Math.round((schedDate(localDay(new Date())) - schedDate(f.start)) / 86400000)); openSchedule('*'); });
    return await page.evaluate(() => { const bands = [...$('revBox').querySelectorAll('.sch-band')]; const c = bands.map(b => (b.querySelector('.sch-clash') || { textContent: '' }).textContent); return /⚠ The crew is on two jobs at once the weeks? of .*\(Pine Cabin\)/.test(c[0]) && /\(Oak House\)/.test(c[1]) && bands.every(b => b.querySelector('.sch-head .sch-wk-clash')); });
  })(), await page.evaluate(() => [...$('revBox').querySelectorAll('.sch-clash')].map(c => c.textContent).join(' | ')));
  ok('👷 CREW ONLY narrows every band to the crew\'s steps; 🔧 SUBS AND THE REST to the others; EVERYONE brings them all back', await page.evaluate(() => { schedWho('crew'); const a = [...$('revBox').querySelectorAll('.sch-band')].map(b => [...b.querySelectorAll('.sch-lab b')].map(x => x.textContent).join('|')); schedWho('sub'); const s = [...$('revBox').querySelectorAll('.sch-band')][0].querySelectorAll('.sch-lab').length; schedWho(''); const e = $('revBox').querySelectorAll('.sch-band')[0].querySelectorAll('.sch-lab').length; return a[0] === 'floors, doors, trim' && s === 6 && e === 7; }));
  ok('the first look lands on this week (the dashed today line is in view) and the weeks scroll under the pinned names', await (async () => {
    await page.evaluate(() => { schedMoveJob('Pine Cabin', -70); openSchedule('*'); });
    return await page.evaluate(() => { const c = $('revBox').querySelector('.sch-chart'); const t = c.querySelector('.sch-today'); if (!t) return false; const cr = c.getBoundingClientRect(), tr = t.getBoundingClientRect(); return c.scrollWidth > c.clientWidth && tr.left >= cr.left && tr.left <= cr.right; });
  })());
  ok('nothing runs off the right edge at 390px (the chart scrolls inside its own box)', await page.evaluate(() => { const b = $('revBox'); return b.scrollWidth <= b.clientWidth + 1 && document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1; }));
  await page.evaluate(() => closeReview());

  console.log('— the doors —');
  ok('📇 Job Card: the 📅 Schedule plate sits right under 📐 Plans (Plans still the pick\'s next sibling) and says the steps and when the last ends', await (async () => {
    await page.evaluate(() => openJobCard('Oak House'));
    return await page.evaluate(() => { const pick = $('revBox').querySelector('.jc-pick'), p = $('revBox').querySelector('.jc-plans'), s = $('revBox').querySelector('.jc-sched'); return !!p && !!s && pick.nextElementSibling === p && p.nextElementSibling === s && /^📅 Schedule — 7 steps, last ends /.test(s.textContent.trim()) && s.getBoundingClientRect().height >= 44; });
  })());
  ok('a tap opens the schedule on that job, and ‹ Back comes back to the card on the same job — not the main page', await (async () => {
    await page.evaluate(() => $('revBox').querySelector('.jc-sched').click());
    await page.waitForTimeout(150);
    const open = await page.evaluate(() => !!$('schedBox') && $('schedJob').value === 'Oak House' && $('revModal').classList.contains('mat-full') && /‹ Back to the job card/.test($('revBox').textContent));
    await page.evaluate(() => [...$('revBox').querySelectorAll('button')].find(b => /^‹ Back/.test(b.textContent.trim())).click());
    await page.waitForTimeout(150);
    return open && await page.evaluate(() => $('revModal').classList.contains('show') && !$('revModal').classList.contains('mat-full') && !!$('jcJob') && $('jcJob').value === 'Oak House' && !!$('revBox').querySelector('.jc-sched'));
  })());
  ok('a job with no plan: the plate says so; the schedule opened from the form face saves the words first', await (async () => {
    await page.evaluate(() => { prefs.cards = { 'oak house': { job: 'Oak House', addr: '', people: [], codes: [], notes: '' } }; openJobCard('Oak House', true); $('jcNotes').value = 'gate sticks'; $('revBox').querySelector('.jc-sched').click(); });
    await page.waitForTimeout(150);
    const r1 = await page.evaluate(() => !!$('schedBox') && cardGet('Oak House').notes === 'gate sticks');
    await page.evaluate(() => { schedClose(); _cardJob = ''; openJobCard('Pine Cabin'); prefs.sched.jobs['Pine Cabin'].steps = []; openJobCard('Pine Cabin'); });
    return r1 && await page.evaluate(() => /^📅 Schedule — no plan yet for Pine Cabin$/.test($('revBox').querySelector('.jc-sched').textContent.trim()));
  })());
  await page.evaluate(() => closeReview());
  ok('🏠 Project portal: the 📅 plate sits at the top, before the books strip and the job list, and counts the jobs with a plan', await (async () => {
    await page.evaluate(() => openPortalWin());
    const r = await page.evaluate(() => { const p = $('portalBox').querySelector('.pf-sched'), strip = $('qbFreshStrip'); return !!p && !!strip && (p.compareDocumentPosition(strip) & Node.DOCUMENT_POSITION_FOLLOWING) && (p.compareDocumentPosition($('portalList')) & Node.DOCUMENT_POSITION_FOLLOWING) && /^📅 Schedule — every job on one week grid · 1 with a plan$/.test(p.textContent.trim()); });
    await page.evaluate(() => { $('portalBox').querySelector('.pf-sched').click(); });
    await page.waitForTimeout(150);
    const open = await page.evaluate(() => !!$('schedBox') && $('schedJob').value === '*' && $('portalWin').classList.contains('show'));
    await page.evaluate(() => { schedClose(); });
    const back = await page.evaluate(() => !$('revModal').classList.contains('show') && $('portalWin').classList.contains('show') && document.body.classList.contains('modal-open'));
    await page.evaluate(() => closePortalWin());
    return r && open && back;
  })());
  ok('the 👁 crew preview opens the window READ-ONLY (v7.68: the crew read the weeks) — the doors draw, no tools, no editor, a row tap reads the step', await page.evaluate(() => { crewPreview = true; const a = /📅 Schedule — 7 steps/.test(cardSchedHtml('Oak House')) && /📅 Schedule — every job/.test(portalSchedHtml()); openSchedule('Oak House'); const b = $('revModal').classList.contains('show') && !!$('schedBox') && !$('revBox').querySelector('.sch-tools') && !$('revBox').querySelector('.sch-page') && /Eric's plan, as it landed on this phone/.test($('revBox').textContent); $('revBox').querySelector('.sch-lab').click(); const c = !!$('revBox').querySelector('.sch-edit-ro') && !$('schN') && !$('revBox').querySelector('.sch-del') && /A move is his to make/.test($('revBox').textContent); closeReview(); crewPreview = false; return a && b && c; }));
  ok('nothing of the plan reached Dropbox from the window (his prefs carry it)', await page.evaluate(() => window._ups.length === 0));

  console.log('— 👷 a field phone —');
  await page.evaluate(() => { localStorage.setItem('daylog-crew-name', 'Kevin'); localStorage.removeItem('daylog-crew-office'); localStorage.setItem('daylog-dbx', JSON.stringify({ appKey: 'k', refreshToken: 'test-token', accessToken: 'a', expiresAt: Date.now() + 3600000 })); });
  await page.reload(); await page.waitForTimeout(900); await stub();
  ok('a crew phone with NO plan sent to it yet: no Schedule plate on the job card, none in the portal; the window (reached by hand) is read-only with no plan and nothing is written (v7.68: the plan rides in shared.json, _test768)', await page.evaluate(() => { crewCards = { 'oak house': { job: 'Oak House', addr: '', people: [], codes: [], notes: '' } }; _portalIdx = { clients: [] }; crewSched = null; localStorage.removeItem('daylog-crew-sched'); openJobCard('Oak House'); const a = CREW_NAME === 'Kevin' && !$('revBox').querySelector('.jc-sched'); closeReview(); openSchedule('Oak House'); const b = $('revModal').classList.contains('show') && !$('revBox').querySelector('.sch-tools') && !$('revBox').querySelector('.sch-page') && schedAddStep('Oak House', 'x', '1') === null && schedSteps('Oak House').length === 0; closeReview(); return a && b && portalSchedHtml() === '' && window._ups.length === 0 && !prefs.sched; }));
  await page.evaluate(() => { localStorage.removeItem('daylog-crew-name'); });

  ok('version bumped — APP_VER and the footer agree', /const APP_VER = 'v7\.(6[7-9]|[7-9]\d)'/.test(src) && new RegExp('<footer>' + (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1].replace('.', '\\.') + ' ·').test(src));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
