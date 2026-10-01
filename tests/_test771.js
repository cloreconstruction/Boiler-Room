// ▒ v7.71 — THE DAYS OFF, SHADED. Eric: "on the gantt chart i want to be able to select "weekends" "fridays" as crew doesnt
// always work friday and holidays. and it will put like a highlighted vertical opaque column overlay so that i can easily adjust
// things off of the weekends". Three plates over the chart (☐ Weekends ☐ Fridays ☐ Holidays), a see-through column down the
// chart for every such day, and a step that starts or ends on a shaded day says so on its row. A way of looking: kept on the
// device, nothing written. Every name below is made up; the days are worked out from today so the checks hold whenever they run.
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
  // the plan, built on real weekdays: next week's Monday is the anchor (so nothing is late and every weekday is known)
  await page.evaluate(() => {
    jobs = ['Oak House', 'Pine Cabin', 'Internal / Admin']; crew = ['Phil', 'Kevin']; prefs.office = ['Phil']; entries = []; todos = []; nextId = 1;
    delete prefs.subs; prefs.sched = { jobs: {} }; delete prefs.schedTaken; prefs.cards = {}; _portalIdx = null; _cardJob = '';
    localStorage.removeItem('daylog-sched-shade'); localStorage.removeItem('daylog-sched-zoom'); _schedShade = { we: false, fr: false, ho: false }; _schedZoom = 1;
    const mon = schedAddDays(schedMonday(localDay(new Date())), 7), d = n => schedAddDays(mon, n), put = (job, n, start, days, who, done) => schedPlan(job, true).steps.push(schedClean({ n, start, days, who, done: done || '' }));
    window._mon = mon;
    // 🗓 v7.76 — the days are WORK days: a crew, sub or inspection step never starts or ends on a day it does not work, so the row's
    // ⚠ is for the steps that count EVERY day (no "who", or the homeowner's) — those can still sit on a weekend, a Friday, a holiday
    put('Oak House', 'mon to fri', d(0), 5, '');                // Mon → Fri
    put('Oak House', 'sat to sun', d(5), 2, '');                // Sat → Sun
    put('Oak House', 'tue to thu', d(8), 3, 'sub');             // Tue → Thu the week after: touches no shaded day
    put('Oak House', 'move in on a sat', d(12), 1, 'homeowner');   // a one-day mark on a Saturday
    put('Oak House', 'wed to mon', d(16), 6, '');               // Wed → Mon: runs THROUGH a weekend, starts and ends on working days
    put('Oak House', 'done on a sunday', d(6), 1, '', d(6));    // done: never flagged
    put('Oak House', 'crew thu to tue', d(24), 3, 'crew');      // the crew's Thu, Mon, Tue: it runs over its Friday and the weekend — never flagged, those days are not its own
    put('Oak House', 'sub mon to fri', d(28), 5, 'sub');        // a sub works its Friday: not flagged when Fridays are shaded
    put('Pine Cabin', 'thu to fri', d(3), 2, '');
    renderJobSelects(); closePanels(); renderAll(); clearTimeout(_schedPubT); window._saves = 0; window._ups.length = 0; _said.length = 0;
    openSchedule('Oak House');
  });
  await page.waitForTimeout(250);
  const rows = () => page.evaluate(() => Object.fromEntries([...document.querySelectorAll('#schedBox .sch-lab')].map(l => [l.querySelector('b').textContent.replace(/^[✓⚠] /, '').trim(), (l.querySelector('.sch-offw') || {}).textContent || ''])));
  const bands = k => page.evaluate(k => { const g = document.querySelector('#schedBox .sch-grid'), heads = [...g.querySelectorAll('.sch-head span')].map(s => s.getBoundingClientRect()); const wk = heads[0].width, x0 = heads[0].left;
    return [...g.querySelectorAll('.sch-off' + (k ? '.' + k : ''))].map(b => { const r = b.getBoundingClientRect(); return { day: Math.round((r.left - x0) / wk * 7 * 100) / 100, days: Math.round(r.width / wk * 7 * 100) / 100, d: +b.dataset.d, t: b.title, h: Math.round(r.height), gh: Math.round(g.getBoundingClientRect().height) }; }); }, k);
  const weeks = await page.evaluate(() => document.querySelectorAll('#schedBox .sch-head span').length);

  console.log('— ▒ the three plates —');
  ok('the window wears ▒ SHADE with ☐ Weekends, ☐ Fridays, ☐ Holidays under the week-width row; all off to start: no column on the chart, no line of words, no flag on a row', await page.evaluate(() => { const s = $('schShade'); const chips = [...s.querySelectorAll('.pick-chip')];
    return !!s && /▒ SHADE/.test(s.textContent) && chips.map(c => c.textContent.trim()).join('|') === '☐ Weekends|☐ Fridays|☐ Holidays' && chips.every(c => c.getAttribute('aria-pressed') === 'false' && !c.classList.contains('sel'))
      && !!($('schZoom').compareDocumentPosition(s) & Node.DOCUMENT_POSITION_FOLLOWING) && !!(s.compareDocumentPosition($('schedList')) & Node.DOCUMENT_POSITION_FOLLOWING) && !document.querySelector('#schedBox .sch-off') && !$('schShadeSay') && !document.querySelector('#schedBox .sch-offw'); }));
  ok('390px: the three plates are a thumb tall, fit the phone, and the page does not scroll sideways', await page.evaluate(() => { const rs = [...$('schShade').querySelectorAll('.pick-chip')].map(c => c.getBoundingClientRect()); return rs.every(r => r.height >= 44 && r.right <= innerWidth + 0.5 && r.width >= 70) && document.documentElement.scrollWidth <= innerWidth + 0.5; }),
    await page.evaluate(() => JSON.stringify({ chips: [...$('schShade').querySelectorAll('.pick-chip')].map(c => { const r = c.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height), Math.round(r.right)]; }), label: Math.round($('schShade').querySelector('.sch-shade-l').getBoundingClientRect().width), page: document.documentElement.scrollWidth })));

  console.log('— ☑ Weekends —');
  ok('☑ Weekends: the plate lights (☑, pressed), and a see-through column two days wide lies over Saturday and Sunday of EVERY week, the whole height of the chart', await (async () => {
    await page.evaluate(() => $('schShade').querySelector('[data-k="we"]').click()); await page.waitForTimeout(120);
    const b = await bands('we');
    const chip = await page.evaluate(() => { const c = $('schShade').querySelector('[data-k="we"]'); return c.textContent.trim() === '☑ Weekends' && c.getAttribute('aria-pressed') === 'true' && c.classList.contains('sel'); });
    return chip && b.length === weeks && b.every((x, i) => Math.abs(x.day - (i * 7 + 5)) < 0.15 && Math.abs(x.days - 2) < 0.15 && x.t === 'weekend' && x.h >= x.gh - 2) && (await bands('fr')).length === 0 && (await bands('ho')).length === 0;
  })(), JSON.stringify((await bands('we')).slice(0, 3)));
  ok('the column is an overlay: it lies OVER the bars, lets a tap through to the row under it, and is a wash you can see through (not a solid block)', await page.evaluate(() => { const b = document.querySelector('#schedBox .sch-off.we'), cs = getComputedStyle(b); const m = cs.backgroundColor.match(/rgba?\(([^)]+)\)/); const alpha = m && m[1].split(',').length === 4 ? parseFloat(m[1].split(',')[3]) : 1;
    const bar = [...document.querySelectorAll('#schedBox .sch-bar')].find(x => x.textContent.trim() === 'sat to sun'), r = bar.getBoundingClientRect(); const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return cs.pointerEvents === 'none' && cs.position === 'absolute' && alpha > 0.05 && alpha < 0.6 && !!top && (top === bar || bar.contains(top) || top.classList.contains('sch-lane')) && !!(bar.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING); }));
  ok('in words, under the plates: what is shaded — and a step says so on its own row: starts Sat · ends Sun, a one-day mark "on a Sat"; a step that only runs THROUGH a weekend, one that touches none, and a DONE one say nothing', await (async () => {
    const r = await rows(), say = await page.evaluate(() => $('schShadeSay') ? $('schShadeSay').textContent.trim() : '');
    return /^▒ Shaded on the chart: weekends\. A step that counts every day \(🏠 homeowner, or no “who”\) and starts or ends on a shaded day says so on its row\.$/.test(say) && r['sat to sun'] === '⚠ starts Sat · ends Sun' && r['move in on a sat'] === '⚠ on a Sat' && r['mon to fri'] === '' && r['tue to thu'] === '' && r['wed to mon'] === '' && r['done on a sunday'] === ''
      && r['crew thu to tue'] === '' && r['sub mon to fri'] === '';   // v7.76 — a step with a work week is never flagged
  })(), JSON.stringify(await rows()));
  ok('the job\'s heading counts them: ⚠ 2 on a shaded day', await page.evaluate(() => { const n = document.querySelector('#schedBox .sch-band-h .sch-off-n'); return !!n && n.textContent.trim() === '⚠ 2 on a shaded day'; }));

  console.log('— ☑ Fridays, with the weekends —');
  ok('☑ Fridays too: a one-day column on every Friday, drawn differently from the weekend\'s (fainter, a dashed edge); the words name both; the Mon → Fri step now says ends Fri', await (async () => {
    await page.evaluate(() => $('schShade').querySelector('[data-k="fr"]').click()); await page.waitForTimeout(120);
    const f = await bands('fr'), w = await bands('we'), r = await rows();
    const look = await page.evaluate(() => { const a = getComputedStyle(document.querySelector('#schedBox .sch-off.fr')), b = getComputedStyle(document.querySelector('#schedBox .sch-off.we')); return a.backgroundColor !== b.backgroundColor && a.borderLeftStyle === 'dashed' && b.borderLeftStyle === 'solid' && /weekends · Fridays\./.test($('schShadeSay').textContent); });
    return f.length === weeks && f.every((x, i) => Math.abs(x.day - (i * 7 + 4)) < 0.15 && Math.abs(x.days - 1) < 0.15 && x.t === 'Friday') && w.length === weeks && look && r['mon to fri'] === '⚠ ends Fri' && r['sat to sun'] === '⚠ starts Sat · ends Sun' && r['tue to thu'] === ''
      && r['sub mon to fri'] === '' && r['crew thu to tue'] === '';   // v7.76 — the sub is at work on its Friday; the crew's step only runs across one
  })(), JSON.stringify(await rows()));
  ok('Weekends off again, Fridays stay: each plate is its own switch', await (async () => {
    await page.evaluate(() => $('schShade').querySelector('[data-k="we"]').click()); await page.waitForTimeout(120);
    const r = await rows();
    return (await bands('we')).length === 0 && (await bands('fr')).length === weeks && r['sat to sun'] === '' && r['mon to fri'] === '⚠ ends Fri' && await page.evaluate(() => /^▒ Shaded on the chart: Fridays\./.test($('schShadeSay').textContent.trim()) && document.querySelector('#schedBox .sch-off-n').textContent.trim() === '⚠ 1 on a shaded day');
  })());

  console.log('— ☑ Holidays —');
  ok('the holidays are the six the trades take, by rule, any year: New Year\'s Day, Memorial Day (the last Monday of May), July 4th, Labor Day (the first Monday of September), Thanksgiving (the fourth Thursday of November), Christmas', await page.evaluate(() => { const a = schedHolidays(2026), b = schedHolidays(2027), c = schedHolidays(2028);
    return Object.keys(a).sort().join(',') === '2026-01-01,2026-05-25,2026-07-04,2026-09-07,2026-11-26,2026-12-25' && a['2026-11-26'] === 'Thanksgiving' && a['2026-05-25'] === 'Memorial Day' && a['2026-09-07'] === 'Labor Day'
      && Object.keys(b).sort().join(',') === '2027-01-01,2027-05-31,2027-07-04,2027-09-06,2027-11-25,2027-12-25' && Object.keys(c).sort().join(',') === '2028-01-01,2028-05-29,2028-07-04,2028-09-04,2028-11-23,2028-12-25' && schedHolidayOf('2026-11-27') === '' && schedHolidayOf('nope') === ''; }));
  // the next holiday from the anchor Monday: a step is put right on it, so it is in view whenever this runs
  const hol = await page.evaluate(() => { let day = schedAddDays(window._mon, 21), name = ''; for (let i = 0; i < 400 && !name; i++) { name = schedHolidayOf(day); if (!name) day = schedAddDays(day, 1); } const p = schedPlan('Oak House', true); p.steps.push(schedClean({ n: 'starts on the holiday', start: day, days: 3, who: '' })); p.steps.push(schedClean({ n: 'ends on the holiday', start: schedAddDays(day, -2), days: 3, who: '' }));   /* (steps that count every day — v7.76) */ renderSchedule(true); return { day, name, word: schedDayWord(day) }; });
  await page.waitForTimeout(150);
  ok('☑ Holidays: the holiday in view gets its own column — hatched, one day wide, on its day — and the words under the plates NAME it with its date; a step that starts or ends on it says so', await (async () => {
    await page.evaluate(() => { $('schShade').querySelector('[data-k="fr"]').click(); $('schShade').querySelector('[data-k="ho"]').click(); }); await page.waitForTimeout(150);
    const h = await bands('ho'), r = await rows();
    const idx = await page.evaluate(day => { const lo = schedWindow(['Oak House']).lo; return Math.round((schedDate(day) - schedDate(lo)) / 86400000); }, hol.day);
    const look = await page.evaluate(() => { const cs = getComputedStyle(document.querySelector('#schedBox .sch-off.ho')); return /repeating-linear-gradient/.test(cs.backgroundImage) && $('schShade').querySelector('[data-k="ho"]').textContent.trim() === '☑ Holidays' && $('schShadeSay').textContent.trim(); });
    const mine = h.find(x => x.d === idx);
    return !!mine && Math.abs(mine.day - idx) < 0.2 && Math.abs(mine.days - 1) < 0.15 && mine.t === hol.name + ' · ' + hol.word && typeof look === 'string' && look.indexOf('holidays (') > 0 && look.indexOf(hol.word + ' ' + hol.name) > 0
      && r['starts on the holiday'].indexOf('starts ' + hol.name) >= 0 && r['ends on the holiday'].indexOf('ends ' + hol.name) >= 0 && (await bands('fr')).length === 0;
  })(), JSON.stringify({ hol, bands: await bands('ho'), rows: await rows() }));
  ok('a plan with no holiday in its weeks says so in words (holidays — none in these weeks) and draws no hatched column', await (async () => {
    await page.evaluate(() => { $('schedJob').value = 'Pine Cabin'; $('schedJob').dispatchEvent(new Event('change')); }); await page.waitForTimeout(150);
    const any = await page.evaluate(() => { const w = schedWindow(['Pine Cabin']); for (let d = 0; d < w.weeks * 7; d++) if (schedHolidayOf(schedAddDays(w.lo, d))) return true; return false; });
    const r = await page.evaluate(() => ({ n: document.querySelectorAll('#schedBox .sch-off.ho').length, say: $('schShadeSay').textContent }));
    await page.evaluate(() => { $('schedJob').value = 'Oak House'; $('schedJob').dispatchEvent(new Event('change')); }); await page.waitForTimeout(120);
    return any ? r.n >= 1 : (r.n === 0 && /holidays \(none in these weeks\)/.test(r.say));   // (in a week that happens to hold a holiday the column is simply there)
  })());

  console.log('— 🧱 what it is and is not —');
  ok('the columns follow the week width: at 300% each weekend column is still Saturday and Sunday of its week', await (async () => {
    await page.evaluate(() => { $('schShade').querySelector('[data-k="ho"]').click(); $('schShade').querySelector('[data-k="we"]').click(); schedZoomTo(3); }); await page.waitForTimeout(150);
    const b = await bands('we'), n = await page.evaluate(() => document.querySelectorAll('#schedBox .sch-head span').length);
    await page.evaluate(() => schedZoomTo(1));
    return b.length === n && b.every((x, i) => Math.abs(x.day - (i * 7 + 5)) < 0.1 && Math.abs(x.days - 2) < 0.1);
  })());
  ok('📋 Every job: every chart wears the columns, and each job\'s heading has its own count', await (async () => {
    await page.evaluate(() => { $('schShade').querySelector('[data-k="fr"]').click(); $('schedJob').value = '*'; $('schedJob').dispatchEvent(new Event('change')); }); await page.waitForTimeout(150);
    const r = await page.evaluate(() => [...document.querySelectorAll('#schedBox .sch-band')].map(b => ({ job: b.dataset.job, we: b.querySelectorAll('.sch-off.we').length, fr: b.querySelectorAll('.sch-off.fr').length, n: (b.querySelector('.sch-off-n') || {}).textContent || '', wk: b.querySelectorAll('.sch-head span').length })));
    await page.evaluate(() => { $('schedJob').value = 'Oak House'; $('schedJob').dispatchEvent(new Event('change')); }); await page.waitForTimeout(120);
    return r.length === 2 && r.every(x => x.we === x.wk && x.fr === x.wk) && /⚠ \d+ on a shaded day/.test(r[0].n) && r[1].n === '⚠ 1 on a shaded day';
  })());
  ok('the plan is not touched: no step moved, no day count changed, a row tap still opens its editor through the column, and two days later takes the flag off the Saturday step\'s start', await (async () => {
    const before = await page.evaluate(() => JSON.stringify(schedSorted('Oak House').map(s => [s.n, s.start, s.days])));
    await page.evaluate(() => { const b = [...document.querySelectorAll('#schedBox .sch-bar')].find(x => x.textContent.trim() === 'sat to sun'); b.parentElement.click(); }); await page.waitForTimeout(120);
    const ed = await page.evaluate(() => !!document.querySelector('#schedBox .sch-edit'));
    const same = before === await page.evaluate(() => JSON.stringify(schedSorted('Oak House').map(s => [s.n, s.start, s.days])));
    const r = await page.evaluate(() => { const s = schedSteps('Oak House').find(x => x.n === 'sat to sun'); schedSet('Oak House', s.id, 'start', schedAddDays(s.start, 2)); schedSet('Oak House', s.id, 'days', 2); renderSchedule(); const l = [...document.querySelectorAll('#schedBox .sch-lab')].find(x => /sat to sun/.test(x.textContent)); const t = (l.querySelector('.sch-offw') || {}).textContent || ''; schedSet('Oak House', s.id, 'start', schedAddDays(s.start, -2)); _schedOpen = null; renderSchedule(); return t; });
    return ed && same && r === '';
  })());
  ok('it is kept on THIS device and nowhere else: one key, no save of his prefs for a switch, no upload; nothing of it in the plan, the crew\'s copy or their page', await page.evaluate(() => { const k = JSON.parse(localStorage.getItem('daylog-sched-shade')); clearTimeout(_schedPubT);
    return k.we === true && k.fr === true && k.ho === false && window._ups.length === 0 && !/shade/i.test(JSON.stringify(prefs)) && !/shade|"off"/i.test(JSON.stringify(schedPublish())) && !/shade/i.test(JSON.stringify(schedPageCut('Oak House'))); }));
  await page.evaluate(() => closeReview());
  await page.reload(); await page.waitForTimeout(900); await stub();
  ok('after a real reload the plates come back as he left them (☑ Weekends ☑ Fridays ☐ Holidays) and the columns with them', await (async () => {
    await page.evaluate(() => { jobs = ['Oak House']; prefs.sched = { jobs: {} }; schedPasteText('Oak House', 'framing 5 days\ndrywall 2 weeks'); clearTimeout(_schedPubT); openSchedule('Oak House'); }); await page.waitForTimeout(200);
    const r = await page.evaluate(() => ({ chips: [...$('schShade').querySelectorAll('.pick-chip')].map(c => c.textContent.trim()).join('|'), we: document.querySelectorAll('#schedBox .sch-off.we').length, fr: document.querySelectorAll('#schedBox .sch-off.fr').length, ho: document.querySelectorAll('#schedBox .sch-off.ho').length, wk: document.querySelectorAll('#schedBox .sch-head span').length }));
    await page.evaluate(() => closeReview());
    return r.chips === '☑ Weekends|☑ Fridays|☐ Holidays' && r.we === r.wk && r.fr === r.wk && r.ho === 0;
  })());

  console.log('— 👷 a field phone (Kevin) —');
  await page.evaluate(() => { localStorage.setItem('daylog-crew-name', 'Kevin'); localStorage.removeItem('daylog-crew-office'); localStorage.removeItem('daylog-sched-shade');
    const mon = (() => { const d = new Date(); d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + 7); return d; })(), iso = n => { const d = new Date(mon); d.setDate(d.getDate() + n); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
    localStorage.setItem('daylog-crew-sched', JSON.stringify({ jobs: { 'Oak House': { steps: [{ id: 's1', n: 'framing', days: 6, who: 'crew', start: iso(0), done: '' }] } } }));
    localStorage.setItem('daylog-dbx', JSON.stringify({ appKey: 'k', refreshToken: 'test-token', accessToken: 'a', expiresAt: Date.now() + 3600000 })); });
  await page.reload(); await page.waitForTimeout(900); await stub();
  ok('a crew phone has the plates too: its own switches on its own screen, the Mon → Sat step of a copy sent BEFORE v7.76 (calendar days, read as it was written) says ends Sat, nothing written', await (async () => {
    await page.evaluate(() => { jobs = ['Oak House']; window._ups.length = 0; window._saves = 0; openSchedule('Oak House'); }); await page.waitForTimeout(250);
    const off = await page.evaluate(() => [...$('schShade').querySelectorAll('.pick-chip')].map(c => c.textContent.trim()).join('|'));
    await page.evaluate(() => $('schShade').querySelector('[data-k="we"]').click()); await page.waitForTimeout(120);
    return off === '☐ Weekends|☐ Fridays|☐ Holidays' && await page.evaluate(() => { const l = document.querySelector('#schedBox .sch-lab'); const r = CREW_NAME === 'Kevin' && !document.querySelector('#schedBox .sch-tools') && document.querySelectorAll('#schedBox .sch-off.we').length >= 1 && (l.querySelector('.sch-offw') || {}).textContent === '⚠ ends Sat' && window._saves === 0 && window._ups.filter(p => !/pending\.json$/.test(p)).length === 0; closeReview(); return r; });
  })());
  await page.evaluate(() => { localStorage.removeItem('daylog-crew-name'); localStorage.removeItem('daylog-crew-sched'); localStorage.removeItem('daylog-sched-shade'); });

  ok('the homeowner\'s page has no word of it', !/sched-shade|schedShade|sch-off/.test(csrc));
  ok('version bumped — APP_VER and the footer agree', /const APP_VER = 'v7\.(7[1-9]|[89]\d)'/.test(src) && new RegExp('<footer>' + (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1].replace('.', '\\.') + ' ·').test(src));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
