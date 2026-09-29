// 📈 v7.41 — BUSINESS, ROUND TWO. Eric, 2026-09-28: "savings growth chart should be its own window and have a button next to
// profit tracker and project tracker, i also want a truck mileage tracker" · "make the profit tracker be able to have buttons
// that change the chart to by day week month etc. also want to be able to select or over lay other things like total business
// income and how much went to each vendor per week month year etc. think of anything useful to make charts and graphs and
// summaries out of." The Business page is a menu of doors; 🏦 Savings growth, 🚚 Truck mileage and 📈 Money charts are windows
// of their own. EVERY name and figure here is made up; the dates are made relative to today so the spans always hold.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { fileURLToPath } = require('url');
(async () => {
  const appUrl = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const repo = path.dirname(fileURLToPath(appUrl));
  const src = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const errs = [];
  const open = async (init) => { const c = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }); await c.route(u => !/^file:/.test(u.href), r => r.abort()); if (init) await c.addInitScript(init); const p = await c.newPage(); p.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); }); await p.goto(appUrl); await p.waitForTimeout(700); return { ctx: c, page: p }; };
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };
  const wait = async (fn, ms = 6000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { try { if (await fn()) return true; } catch (e) {} await new Promise(r => setTimeout(r, 80)); } return false; };
  // the same date arithmetic, done here without the app: a day n days ago, its month key, this month's key, the last 12 month keys
  const dayAgo = n => { const d = new Date(Date.now() - n * 86400000); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const mk = s => s.slice(0, 7), thisMk = mk(dayAgo(0)), thisYear = dayAgo(0).slice(0, 4);
  const last12 = (() => { const out = []; const d = new Date(); d.setDate(1); for (let i = 0; i < 12; i++) { out.push(d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0')); d.setMonth(d.getMonth() - 1); } return new Set(out); })();
  const money = s => +String(s).replace(/[^\d.-]/g, '');

  console.log('— 📈 Eric\'s phone —');
  const eric = await open();
  const page = eric.page;
  await page.evaluate(() => {
    window.scheduleSave = () => {}; window.savePendingSoon = () => {};
    const D = n => localDay(new Date(Date.now() - n * 86400000));
    jobs = ['Oak House', 'Pine Cabin']; crew = ['Phil']; todos = []; nextId = 100; pendingQueue = [];
    trucks = [{ name: '2021 Dodge', lastOdo: null }, { name: 'F-250', lastOdo: null }];
    prefs.lastOdo = { '2021 Dodge': { odo: 50100, ts: new Date().toISOString() } };
    entries = [
      { id: 1, ts: new Date(D(3) + 'T10:00:00'), type: 'Mileage', details: 'Trip · Oak House', job: 'Oak House', miles: 40, truck: '2021 Dodge', odometer: 50100 },
      { id: 2, ts: new Date(D(10) + 'T10:00:00'), type: 'Mileage', details: 'oil change at the shop', job: 'Pine Cabin', miles: 25, truck: '2021 Dodge', odometer: 50060 },
      { id: 3, ts: new Date(D(40) + 'T10:00:00'), type: 'Mileage', details: 'Trip', job: 'Oak House', miles: 60, truck: 'F-250', odometer: 8000 },
      { id: 4, ts: new Date(D(200) + 'T10:00:00'), type: 'Mileage', details: 'Trip', job: 'Oak House', miles: 100, truck: '2021 Dodge', odometer: 49000 },
      { id: 5, ts: new Date(D(5) + 'T10:00:00'), type: 'Mileage', details: 'dump run', job: 'Pine Cabin', miles: 30, truck: 'F-250', odometer: 8100, who: 'Phil' },
      { id: 6, ts: new Date(D(2) + 'T10:00:00'), type: 'Expense', details: 'Lumber', job: 'Oak House', amount: 120, ai: '🏪 Spenard\n💵 $120.00', tags: ['Receipt'] },
      { id: 7, ts: new Date(D(2) + 'T11:00:00'), type: 'Note', details: 'a personal thing', job: '—', amount: 999, personal: true }];
    renderJobSelects(); closePanels(); renderAll();
    dbx.refreshToken = 'tok'; window._up = {}; window.dbxUpload = async (p, body) => { _up[p] = body; return { path_display: p }; }; window.dbxDownload = async p => (_up[p] != null ? _up[p] : null);
    _up[DBX_ROOT + '/App Data/qb-ledger.json'] = JSON.stringify({ asOf: D(1), rows: [
      { num: '1001', n: 'Oak House', a: 1000, o: 0, d: D(80) }, { num: '1002', n: 'Pine Cabin', a: 2500, o: 500, d: D(45) },
      { num: '1003', n: 'Oak House', a: 4000, o: 4000, d: D(20) }, { num: '900', n: 'Old Job', a: 700, o: 0, d: D(400) }] });
    _up[DBX_ROOT + '/App Data/qb-costs.json'] = JSON.stringify({ fieldEraStart: D(70), lines: [
      { qid: 'q1', d: D(65), type: 'Expense', who: 'Spenard', memo: 'lumber', acct: '5000 Materials', amt: 300 },
      { qid: 'q2', d: D(35), type: 'Check', who: 'Spenard', memo: 'more lumber', acct: '5000 Materials', amt: 200 },
      { qid: 'q3', d: D(15), type: 'Expense', who: 'Fuel Co', memo: 'diesel', acct: '6000 Fuel', amt: 150 }] });
    lsSet('daylog-bizbank', ''); _biz = null; prefs.bizSav = ''; prefs.bizFrom = ''; _bizBooks = null; _bizSel = null; _bizSpan = 'month'; _bizMSpan = 'month'; _bizTruck = '';
    window._said = []; const t0 = window.toast; window.toast = (m, g) => { _said.push(String(m)); return t0(m, g); };
    window.SAV = 'Date,Description,Amount,Balance\n2026-01-05,Transfer from Receiving,1000.00,1000.00\n2026-02-10,Transfer from Receiving,1500.00,2500.00\n';
    window.RCV = 'Date,Description,Amount,Balance\n2026-03-05,Customer payment,60000.00,60000.00\n2026-03-05,Transfer to Savings,-1200.00,58800.00\n2026-03-05,Transfer to OPEX,-56800.00,2000.00\n';
    window.file = (txt, name) => new File([txt], name, { type: 'text/csv' });
  });
  const txt = sel => page.evaluate(sel => (document.querySelector(sel) || { textContent: '' }).textContent.replace(/\s+/g, ' ').trim(), sel);
  const tableRows = title => page.evaluate(title => { const t = [...document.querySelectorAll('#bizBox .biz-title')].find(x => x.textContent.trim().startsWith(title)); let tb = t && t.nextElementSibling; while (tb && tb.tagName !== 'TABLE') tb = tb.nextElementSibling; if (!tb) return null;
    return [...tb.querySelectorAll('tr')].slice(1).map(tr => [...tr.children].map(td => td.textContent.replace(/\s+/g, ' ').trim())); }, title);
  const tiles = () => page.evaluate(() => [...document.querySelectorAll('#bizBox .biz-tile')].map(t => [(t.querySelector('b') || {}).textContent || '', ((t.querySelector('span') || {}).textContent || '').replace(/\s+/g, ' ').trim()]));
  const chart = () => page.evaluate(() => { const svg = document.querySelector('#bizBox .biz-chart'); if (!svg) return null;
    return { bars: svg.querySelectorAll('.biz-bar').length, lines: svg.querySelectorAll('polyline').length, titles: [...svg.querySelectorAll('title')].map(t => t.textContent), labels: [...svg.querySelectorAll('text')].map(t => t.textContent) }; });
  const legend = () => txt('#bizBox .biz-legend');

  ok('📈 Business opens as a MENU of five doors — Profit Ticker · Project Tracker · Savings growth · Truck mileage · Money charts — and no chart', await page.evaluate(() => {
    openBusiness(); const b = $('bizBox'), doors = [...document.querySelectorAll('#bizBox .biz-doors button')].map(x => x.textContent);
    return $('revModal').classList.contains('show') && b && b.dataset.view === 'menu' && doors.length === 5 && /Profit Ticker/.test(doors[0]) && /Project Tracker/.test(doors[1]) && /Savings growth/.test(doors[2]) && /Truck mileage/.test(doors[3]) && /Money charts/.test(doors[4]) && !document.querySelector('.biz-chart');
  }));
  ok('🏦 Savings growth is its own window (a ‹ Business plate takes you back): the drop box is there, and after two Relay files the savings chart draws', await page.evaluate(async () => {
    openSavings(); const a = $('bizBox').dataset.view === 'savings' && /SAVINGS/.test($('bizBox').textContent) && !!document.querySelector('#bizBox .biz-back') && !!$('bizFileIn');
    await bizStmtFiles([file(SAV, 'Business Savings - 1234 - 2026.csv'), file(RCV, 'Business Receiving - 0915 - 2026.csv')]);
    const b = !!document.querySelector('#bizBox .biz-chart') && $('bizBox').dataset.view === 'savings';
    document.querySelector('#bizBox .biz-back').click();
    return a && b && $('bizBox').dataset.view === 'menu';
  }));

  console.log('— 🚚 TRUCK MILEAGE —');
  const expThisMonth = [[3, 40], [10, 25], [40, 60], [200, 100], [5, 30]].filter(([n]) => mk(dayAgo(n)) === thisMk).reduce((s, [, v]) => s + v, 0);
  const exp12 = [[3, 40], [10, 25], [40, 60], [200, 100], [5, 30]].filter(([n]) => last12.has(mk(dayAgo(n)))).reduce((s, [, v]) => s + v, 0);
  const expYear = [[3, 40], [10, 25], [40, 60], [200, 100], [5, 30]].filter(([n]) => dayAgo(n).slice(0, 4) === thisYear).reduce((s, [, v]) => s + v, 0);
  ok('🚚 Truck mileage opens on MONTH for all trucks: 12 bars, one per month, their titles adding up to the trips of the last 12 months; the tiles read this month, this year, all time', await (async () => {
    await page.evaluate(() => openMiles());
    const c = await chart(), view = await page.evaluate(() => $('bizBox').dataset.view), spans = await txt('#bizBox .biz-spans');
    const total = c.titles.reduce((s, t) => s + money((t.match(/all trucks ([\d,]+) mi/) || [])[1] || 0), 0);
    const tl = await tiles();
    return view === 'miles' && c.bars === 12 && /✓ MONTH/.test(spans) && !/DAY/.test(spans) && total === exp12
      && tl.some(([b, w]) => b === expThisMonth.toLocaleString('en-US') + ' mi' && w === 'this month') && tl.some(([b, w]) => b === expYear.toLocaleString('en-US') + ' mi' && w === 'this year') && tl.some(([b, w]) => b === '255 mi' && /^all time · 5 trips/.test(w));
  })());
  ok('the truck tiles: the 2021 Dodge reads its odometer now and the miles since the trip that said "oil change" (40 mi); the F-250 has no service note yet and says so', await page.evaluate(() => {
    const tl = [...document.querySelectorAll('#bizBox .biz-tile')].map(t => [(t.querySelector('b') || {}).textContent || '', ((t.querySelector('span') || {}).textContent || '').replace(/\s+/g, ' ').trim()]);
    return tl.some(([b, w]) => b === '50,100' && /^2021 Dodge · odometer now · 40 mi since the .* service note$/.test(w)) && tl.some(([b, w]) => b === '8,100' && /^F-250 · odometer now · no service note yet/.test(w));
  }));
  {
    const byJob = await tableRows('BY JOB'), byWho = await tableRows('BY WHO'), trips = await page.evaluate(() => [...document.querySelectorAll('#bizBox .biz-card')].find(c => /THE TRIPS/.test(c.textContent)).querySelectorAll('.biz-line').length);
    const oak = [[3, 40], [40, 60], [200, 100]].filter(([n]) => last12.has(mk(dayAgo(n)))).reduce((s, [, v]) => s + v, 0), pine = [[10, 25], [5, 30]].filter(([n]) => last12.has(mk(dayAgo(n)))).reduce((s, [, v]) => s + v, 0);
    const first = oak >= pine ? ['Oak House', oak] : ['Pine Cabin', pine];
    ok('BY JOB sums the span\'s trips per job, most miles first, with a share; BY WHO shows Phil\'s dump run apart from yours; THE TRIPS list newest first with the truck and the reading',
      !!byJob && byJob.length === 2 && byJob[0][0] === first[0] && money(byJob[0][1]) === first[1] && /%$/.test(byJob[0][3]) && !!byWho && byWho.some(r => r[0] === 'Phil' && money(r[1]) === 30) && trips === 5, JSON.stringify({ byJob, byWho, trips }));
  }
  ok('pick the F-250: the bars add up to its trips alone, the trips list is its two, and the tile is its odometer', await (async () => {
    await page.evaluate(() => { _bizTruck = 'F-250'; renderBusiness(); });
    const c = await chart(), total = c.titles.reduce((s, t) => s + money((t.match(/F-250 ([\d,]+) mi/) || [])[1] || 0), 0);
    const trips = await page.evaluate(() => [...document.querySelectorAll('#bizBox .biz-card')].find(c => /THE TRIPS/.test(c.textContent)).querySelectorAll('.biz-line').length);
    const f = [[40, 60], [5, 30]].filter(([n]) => last12.has(mk(dayAgo(n)))).reduce((s, [, v]) => s + v, 0);
    return total === f && trips === 2 && /F-250 · odometer now/.test(await txt('#bizBox .biz-tiles'));
  })());
  ok('WEEK draws the last 16 weeks (Monday to Sunday); YEAR draws every year the log has', await (async () => {
    await page.evaluate(() => { _bizTruck = ''; bizMilesSpan('week'); });
    const w = await chart();
    await page.evaluate(() => bizMilesSpan('year'));
    const y = await chart(), years = new Set([dayAgo(200).slice(0, 4), thisYear]).size;
    await page.evaluate(() => bizMilesSpan('month'));
    return w.bars === 16 && y.bars === years && y.labels.some(l => l === thisYear);
  })());

  console.log('— 📈 MONEY CHARTS —');
  const invRows = [[80, 1000, 'Oak House', 0], [45, 2500, 'Pine Cabin', 500], [20, 4000, 'Oak House', 4000], [400, 700, 'Old Job', 0]];
  const inv12 = invRows.filter(([n]) => last12.has(mk(dayAgo(n)))).reduce((s, [, v]) => s + v, 0);
  const invYear = invRows.filter(([n]) => dayAgo(n).slice(0, 4) === thisYear).reduce((s, [, v]) => s + v, 0);
  const invMonth = invRows.filter(([n]) => mk(dayAgo(n)) === thisMk).reduce((s, [, v]) => s + v, 0);
  ok('📈 Money charts opens on MONTH with 📤 Invoiced and 🧾 Costs laid over each other — two lines with their own marks, a legend in words, 12 months; the numbers table adds up to the last 12 months of invoices and costs', await (async () => {
    await page.evaluate(() => openMoneyCharts());
    if (!await wait(async () => (await chart()) && (await chart()).lines === 2)) return false;
    const c = await chart(), lg = await legend(), rows = await tableRows('THE NUMBERS BEHIND THE CHART');
    const invCol = rows.reduce((s, r) => s + money(r[1]), 0), costCol = rows.reduce((s, r) => s + money(r[2]), 0);
    return c.lines === 2 && c.bars === 0 && /● 📤 Invoiced/.test(lg) && /■ 🧾 Costs \(QuickBooks\)/.test(lg) && rows.length === 12 && invCol === inv12 && costCol === 650 && /✓ MONTH/.test(await txt('#bizBox .biz-spans'));
  })());
  ok('the tiles: invoiced this month and this year from the ledger, what is still out there (the open balances), QuickBooks costs this month, and each source\'s total for the span with its average', await page.evaluate(({ invMonth, invYear }) => {
    const tl = [...document.querySelectorAll('#bizBox .biz-tile')].map(t => [(t.querySelector('b') || {}).textContent || '', ((t.querySelector('span') || {}).textContent || '').replace(/\s+/g, ' ').trim()]);
    const m = s => +s.replace(/[^\d.-]/g, '');
    const t = w => tl.find(([, x]) => x.includes(w)) || ['', ''];
    return m(t('invoiced this month')[0]) === invMonth && m(t('invoiced this year')[0]) === invYear && t('still out there')[0] === '$4,500' && !!t('QuickBooks costs this month')[1] && /^📤 Invoiced · the last 12 months · about \$/.test(t('📤 Invoiced ·')[1]);
  }, { invMonth, invYear }));
  ok('BY CUSTOMER (the span): Oak House two invoices with what is still open, Pine Cabin one; the old job is outside the 12 months. BY VENDOR: Spenard twice, Fuel Co once. BY ACCOUNT: Materials and Fuel', await (async () => {
    const c = await tableRows('BY CUSTOMER'), v = await tableRows('BY VENDOR — QuickBooks'), a = await tableRows('BY ACCOUNT — QuickBooks');
    return c && c.length === 2 && c[0][0] === 'Oak House' && money(c[0][1]) === 5000 && c[0][2] === '2' && money(c[0][3]) === 4000 && c[1][0] === 'Pine Cabin' && money(c[1][3]) === 500
      && v && v[0][0] === 'Spenard' && money(v[0][1]) === 500 && v[0][2] === '2' && v[1][0] === 'Fuel Co' && money(v[1][1]) === 150
      && a && a[0][0] === '5000 Materials' && money(a[0][1]) === 500 && a[1][0] === '6000 Fuel';
  })());
  ok('one source alone draws BARS with the number on each: take 🧾 Costs off → 12 bars, no line; put it back → two lines', await (async () => {
    await page.evaluate(() => bizSrcToggle('cost'));
    const one = await chart();
    await page.evaluate(() => bizSrcToggle('cost'));
    const two = await chart();
    return one.bars === 12 && one.lines === 0 && one.titles.some(t => /📤 Invoiced \$/.test(t)) && two.lines === 2;
  })());
  ok('▲ chart it on a vendor lays that vendor over the chart: a third line, its name in the legend and a column of its own that adds up to what he was paid; the plate then reads ✓ on the chart and takes it off again', await (async () => {
    await page.evaluate(() => { [...document.querySelectorAll('#bizBox .biz-mini')].find(b => b.closest('tr').textContent.includes('Spenard')).click(); });
    const c = await chart(), lg = await legend(), rows = await tableRows('THE NUMBERS BEHIND THE CHART'), plate = await page.evaluate(() => [...document.querySelectorAll('#bizBox .biz-mini')].find(b => b.closest('tr').textContent.includes('Spenard')).textContent);
    const col = rows.reduce((s, r) => s + money(r[3]), 0);
    await page.evaluate(() => { [...document.querySelectorAll('#bizBox .biz-mini')].find(b => b.closest('tr').textContent.includes('Spenard')).click(); });
    const after = await chart();
    return c.lines === 3 && /▲ 🧾 Spenard/.test(lg) && col === 500 && /✓ on the chart/.test(plate) && after.lines === 2;
  })());
  ok('YEAR takes in every year on record — the old job joins the invoiced total; DAY is the last 30 days; WEEK the last 16 weeks', await (async () => {
    await page.evaluate(() => bizMoneySpan('year'));
    const y = await tableRows('THE NUMBERS BEHIND THE CHART'), yTot = y.reduce((s, r) => s + money(r[1]), 0), yChart = await chart();
    await page.evaluate(() => bizMoneySpan('day'));
    const d = await tableRows('THE NUMBERS BEHIND THE CHART');
    await page.evaluate(() => bizMoneySpan('week'));
    const w = await tableRows('THE NUMBERS BEHIND THE CHART');
    await page.evaluate(() => bizMoneySpan('month'));
    return yTot === 8200 && yChart.labels.includes(thisYear) && d.length === 30 && w.length === 16;
  })());
  ok('🏦 Into the bank reads the Relay account (the receiving one, not the savings): on YEAR its total is the deposits on that statement; 🧾 Receipts (the log) counts the priced receipt and NEVER the personal line', await (async () => {
    await page.evaluate(() => { bizSrcToggle('bankin'); bizSrcToggle('rcpt'); bizMoneySpan('year'); });
    const lg = await legend(), rows = await tableRows('THE NUMBERS BEHIND THE CHART');
    const head = await page.evaluate(() => [...[...document.querySelectorAll('#bizBox .biz-card')].find(c => /THE NUMBERS BEHIND/.test(c.textContent)).querySelectorAll('th')].map(t => t.textContent.trim()));
    const iBank = head.indexOf('🏦 Into the bank'), iRc = head.indexOf('🧾 Receipts (the log)');
    const bank = rows.reduce((s, r) => s + money(r[iBank]), 0), rc = rows.reduce((s, r) => s + money(r[iRc]), 0);
    const cov = await page.evaluate(() => [...document.querySelectorAll('#bizBox .biz-card .hint')].map(h => h.textContent).join(' | '));
    await page.evaluate(() => { bizSrcToggle('bankin'); bizSrcToggle('rcpt'); bizMoneySpan('month'); });
    return /🏦 Into the bank/.test(lg) && /🧾 Receipts \(the log\)/.test(lg) && bank === 60000 && rc === 120 && /the bank: [^|]*0915/.test(cov);
  })());
  ok('no ledger in Dropbox: the page says so in words and still draws the sources it has', await (async () => {
    await page.evaluate(async () => { _up[DBX_ROOT + '/App Data/qb-ledger.json'] = null; await bizBooksLoad(true); renderBusiness(); });
    const cov = await page.evaluate(() => [...document.querySelectorAll('#bizBox .hint')].map(h => h.textContent).join(' | '));
    const c = await chart();
    await page.evaluate(async () => { _up[DBX_ROOT + '/App Data/qb-ledger.json'] = JSON.stringify({ asOf: localDay(new Date()), rows: [] }); await bizBooksLoad(true); renderBusiness(); });
    return /no ledger in Dropbox yet/.test(cov) && !!c;
  })());
  ok('every plate in the windows is a WORD, never a lamp alone; the legend names each source with its own mark', await page.evaluate(() =>
    [...document.querySelectorAll('#bizBox .pick-chip, #bizBox .btn-ghost:not(.win-x)')].every(b => /[A-Za-z]{3,}/.test(b.textContent)) && /[●■▲◆]/.test((document.querySelector('#bizBox .biz-legend') || {}).textContent || '')));
  ok('no figure of his can sit in the Business block — nothing to the cent, nothing in the thousands with a comma (this file is public too, so its own numbers are made up)', (() => {
    const i = src.indexOf('// ================= 📈 v7.38 — BUSINESS'), j = src.indexOf('async function openMoneyPage(which) {', i);
    const block = src.slice(i, j);
    return block.length > 20000 && /v7.41 — BUSINESS, ROUND TWO/.test(block) && !/(?<![v\d.])\d[\d,]*\.\d{2}\b/.test(block) && !/\b\d{1,3},\d{3}\b/.test(block);
  })());
  await eric.ctx.close();

  console.log('— 👷 Phil\'s phone —');
  const phil = await open(() => { try { localStorage.setItem('daylog-crew-name', 'Phil'); localStorage.setItem('daylog-crew-root', '/Phil'); localStorage.setItem('daylog-crew-jobs', JSON.stringify(['Oak House'])); } catch (e) {} });
  ok('a crew phone: none of the three windows opens — openSavings, openMiles, openMoneyCharts draw nothing', await phil.page.evaluate(() => {
    openSavings(); const a = !$('revModal').classList.contains('show') && !$('bizBox');
    openMiles(); const b = !$('revModal').classList.contains('show') && !$('bizBox');
    openMoneyCharts(); const c = !$('revModal').classList.contains('show') && !$('bizBox');
    return CREW_NAME === 'Phil' && a && b && c;
  }));
  await phil.ctx.close();

  ok('version bumped — APP_VER and the footer agree', /const APP_VER = 'v7\.(4[1-9]|[5-9]\d)'/.test(src) && new RegExp('<footer>' + (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1].replace('.', '\\.') + ' ·').test(src));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
