// v7.38 — 📈 BUSINESS: THE SAVINGS GROWTH CHART. Eric, 2026-09-28, with the chart he built in ChatGPT from his Relay statements:
// "i want a button at the top next to summary that has business graphs and charts … drag and drop the statements into setup from
// relay business accounts and this is one graph id like it to update and continue over time." A 📈 plate at the top (his phones
// only) → the page: bars for what went into savings each month, a dashed average of the full months, an orange month-end balance
// line, ONE shared dollar axis, the partial month labelled by its day, the last balance at the end of its line; temporary money
// pre-lit for his tap (⇄ parked · ↩ returned); the Relay drop in Setup and on the page. EVERY figure here is made up.
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

  console.log('— 📈 Eric\'s phone —');
  const eric = await open();
  const page = eric.page;
  await page.evaluate(() => {
    window.scheduleSave = () => {}; window.savePendingSoon = () => {};
    entries = []; todos = []; jobs = ['Oak House']; crew = ['Phil']; nextId = 100; renderJobSelects(); closePanels(); renderAll();
    dbx.refreshToken = 'tok'; window._up = {}; window.dbxUpload = async (p, body) => { _up[p] = body; return { path_display: p }; }; window.dbxDownload = async p => (_up[p] != null ? _up[p] : null);
    lsSet('daylog-bizbank', ''); _biz = null; prefs.bizSav = ''; prefs.bizFrom = '';
    window._said = []; const t0 = window.toast; window.toast = (m, g) => { _said.push(String(m)); return t0(m, g); };
    // made-up statements in a Relay-like shape: a heading row, a running balance, newest last
    window.SAV = 'Date,Description,Amount,Balance\n2026-01-05,Transfer from Receiving,1000.00,1000.00\n2026-01-31,Interest,2.00,1002.00\n2026-02-10,Transfer from Receiving,1500.00,2502.00\n2026-02-14,Transfer to OPEX,-2502.00,0.00\n2026-02-20,Transfer from Receiving,800.00,800.00\n2026-03-05,Transfer from Receiving,1200.00,2000.00\n2026-03-15,Manual transfer from OPEX,7000.00,9000.00\n2026-04-08,Transfer from Receiving,900.00,9900.00\n2026-05-02,To OPEX,-7000.00,2900.00\n2026-05-10,Transfer from Receiving,600.00,3500.00\n';
    window.RCV = 'Date,Description,Amount,Balance\n2026-03-05,Customer payment,60000.00,60000.00\n2026-03-05,Transfer to Savings,-1200.00,58800.00\n2026-03-05,Transfer to OPEX,-56800.00,2000.00\n';
    window.file = (txt, name) => new File([txt], name, { type: 'text/csv' });
  });
  ok('the top row on Eric\'s phone: 🏠 Project portal · 👷 Crew portal · 📇 Job cards · 📈 Business — four plates on one line, nothing off the side; the Summary plate stays hidden', await page.evaluate(() => {
    const vis = [...document.querySelectorAll('#scRow .sc-btn')].filter(b => getComputedStyle(b).display !== 'none'), tops = new Set(vis.map(b => Math.round(b.getBoundingClientRect().top)));
    return vis.length === 4 && tops.size === 1 && /Business/.test(vis[3].textContent) && !vis.some(b => /Summary/.test(b.textContent)) && document.documentElement.scrollWidth <= document.documentElement.clientWidth;
  }), await page.evaluate(() => [...document.querySelectorAll('#scRow .sc-btn')].map(b => b.textContent.trim() + ':' + getComputedStyle(b).display).join(' | ')));
  ok('the page opens with nothing yet: the two old money pages as doors, the drop box, and no chart', await page.evaluate(() => {
    openBusiness(); const t = $('revBox').textContent;
    return $('revModal').classList.contains('show') && /Profit Ticker/.test(t) && /Project Tracker/.test(t) && /SAVINGS GROWTH/.test(t) && /No statements yet/.test(t) && !!$('bizFileIn') && !document.querySelector('.biz-chart');
  }));
  ok('two Relay CSVs dropped at once land as two accounts, each its last four from the file name (never the whole number); the chart reads the SAVINGS one; the file is written to App Data/business-bank.json', await page.evaluate(async () => {
    await bizStmtFiles([file(SAV, 'Business Savings - 1234 - 2026.csv'), file(RCV, 'Receiving - 5678 - 2026.csv')]);
    await bizSaveNow();
    const S = bizStore(), t = $('revBox').textContent;
    return Object.keys(S.accts).sort().join(',') === '1234,5678' && S.accts['1234'].lines.length === 10 && S.accts['5678'].lines.length === 3 && bizSavAcct() === '1234' && /···1234/.test(t) && /···5678/.test(t) &&
      !!document.querySelector('.biz-chart') && typeof _up[BIZ_PATH()] === 'string' && JSON.parse(_up[BIZ_PATH()]).accts['1234'].lines.length === 10 && _said.some(m => /10 lines read from Business Savings/.test(m) && /10 new/.test(m));
  }), await page.evaluate(() => JSON.stringify({ accts: Object.keys(bizStore().accts), said: _said.slice(-3), up: Object.keys(_up) })));
  ok('the same file dropped again adds nothing', await page.evaluate(async () => { _said.length = 0; await bizStmtFiles([file(SAV, 'Business Savings - 1234 - 2026.csv')]); return bizStore().accts['1234'].lines.length === 10 && _said.some(m => /0 new · 10 already here/.test(m)); }), await page.evaluate(() => _said.join(' | ')));
  ok('the chart starts by itself the month the balance last touched zero (Feb — it was emptied on the 14th), not the first month; the partial newest month is labelled by its day ("May 10"), the others by name', await page.evaluate(() => {
    const s = bizSeries('1234', ''); return s.from === '2026-02' && /touched zero/.test(s.fromWhy) && s.rows.map(r => r.label).join('|') === 'Feb|Mar|Apr|May 10' && s.rows[3].partial === true && s.asOf === '2026-05-10';
  }), await page.evaluate(() => JSON.stringify(bizSeries('1234', '').rows.map(r => [r.mk, r.label, r.added, r.adj, r.actual]))));
  ok('before any tap the bars count every deposit (interest in) and the line is the bank\'s own month-end balance; the average is over the FULL months only', await page.evaluate(() => {
    const s = bizSeries('1234', ''), r = s.rows;
    return r[0].added === 2300 && r[0].adj === 800 && r[1].added === 8200 && r[1].adj === 9000 && r[2].added === 900 && r[2].adj === 9900 && r[3].added === 600 && r[3].adj === 3500 && s.fullN === 3 && s.avg === Math.round((2300 + 8200 + 900) / 3 * 100) / 100;
  }), await page.evaluate(() => JSON.stringify(bizSeries('1234', ''))));
  ok('the big March deposit is PRE-LIT as temporary — the same amount went back out on May 2 — but nothing is marked by itself: the ⇄ TEMPORARY MONEY card names it with ⚠ LOOKS PARKED and two plates', await page.evaluate(() => {
    const card = [...document.querySelectorAll('.biz-card')].find(c => /TEMPORARY MONEY/.test(c.textContent)); if (!card) return false;
    const t = card.textContent.replace(/\s+/g, ' ');
    return /LOOKS PARKED/.test(t) && /went back out May 2/.test(t) && /\$7,000\.00/.test(t) && !/⇄ PARKED/.test(t) && card.querySelectorAll('.biz-line').length === 1 && [...card.querySelectorAll('.pick-chip')].every(b => b.getAttribute('aria-pressed') === 'false') && Object.keys(bizStore().marks).length === 0;
  }), await page.evaluate(() => ([...document.querySelectorAll('.biz-card')].find(c => /TEMPORARY MONEY/.test(c.textContent)) || { textContent: 'no card' }).textContent.replace(/\s+/g, ' ').slice(0, 300)));
  ok('⇄ Parked on it: March\'s bar drops to the real deposits, the March and April balance points lose the parked money, May (after it left) is untouched, and the average follows; the mark says until when', await page.evaluate(() => {
    const card = [...document.querySelectorAll('.biz-card')].find(c => /TEMPORARY MONEY/.test(c.textContent));
    [...card.querySelectorAll('.pick-chip')].find(b => /Parked/.test(b.textContent)).click();
    const s = bizSeries('1234', ''), r = s.rows, m = Object.values(bizStore().marks)[0];
    return r[1].added === 1200 && r[1].adj === 2000 && r[1].actual === 9000 && r[2].added === 900 && r[2].adj === 2900 && r[3].added === 600 && r[3].adj === 3500 && s.avg === Math.round((2300 + 1200 + 900) / 3 * 100) / 100 && m.kind === 'parked' && m.until === '2026-05-02' &&
      /⇄ PARKED — off the bars and the line until May 2/.test($('revBox').textContent)   /* 📈 v7.39 words */ && _said.some(x => /⇄ Parked — out of the bars, and off the balance line until May 2/.test(x));
  }), await page.evaluate(() => JSON.stringify({ rows: bizSeries('1234', '').rows.map(r => [r.mk, r.added, r.adj, r.actual]), marks: bizStore().marks, said: _said.slice(-2) })));
  ok('the drawn chart: teal bars with their amounts, the orange line ending with the exact balance, the dashed average with its word, ONE shared axis whose top clears the tallest thing, the month labels, and words for a screen reader', await page.evaluate(() => {
    const svg = document.querySelector('.biz-chart'), h = svg.outerHTML, s = bizSeries('1234', '');
    const top = bizNice(Math.max(...s.rows.map(r => Math.max(r.added, r.adj)), s.avg)).top;
    return svg.getAttribute('role') === 'img' && /Savings growth: February 2026 added \$2,300\.00, balance \$800\.00/.test(svg.getAttribute('aria-label')) && /\$3,500\.00/.test(h) && /avg \$1,467/.test(h) && /stroke-dasharray/.test(h) && h.split('<rect').length === 5 && />May 10</.test(h) && />Feb</.test(h) && top >= 3500 && top >= 2300 && /\$2,300</.test(h) && /\$1,200</.test(h);
  }), await page.evaluate(() => document.querySelector('.biz-chart').outerHTML.slice(0, 600)));
  ok('the same plate again takes the mark off; ↩ Returned on the April deposit takes it out of the bars only — the balance line keeps it', await page.evaluate(() => {
    const card = () => [...document.querySelectorAll('.biz-card')].find(c => /TEMPORARY MONEY/.test(c.textContent));
    [...card().querySelectorAll('.pick-chip')].find(b => /Parked/.test(b.textContent)).click();
    const back = bizSeries('1234', '').rows[1].added === 8200 && bizStore().marks[Object.keys(bizStore().marks)[0]].kind === '';
    _bizAll = true; renderBusiness();
    const apr = [...document.querySelectorAll('#revBox .biz-line')].find(l => /Apr 8/.test(l.textContent)); if (!apr) return false;
    [...apr.querySelectorAll('.pick-chip')].find(b => /Returned/.test(b.textContent)).click();
    const r = bizSeries('1234', '').rows[2];
    return back && r.added === 0 && r.adj === 9900 && /↩ RETURNED — off the bars only, the line keeps it/.test($('revBox').textContent);
  }), await page.evaluate(() => JSON.stringify({ rows: bizSeries('1234', '').rows.map(r => [r.mk, r.added, r.adj]), marks: bizStore().marks })));
  ok('the from-month wheel: his pick starts the chart in January; blank goes back to the month the balance last touched zero', await page.evaluate(() => {
    prefs.bizFrom = '2026-01'; renderBusiness(); const a = bizSeries('1234', prefs.bizFrom);
    prefs.bizFrom = ''; renderBusiness(); const b = bizSeries('1234', '');
    return a.rows.length === 5 && a.rows[0].label === 'Jan' && a.fromWhy === 'your pick' && b.rows.length === 4 && b.from === '2026-02' && [...document.querySelectorAll('#revBox select')].some(s => /touched zero/.test(s.textContent));
  }));
  ok('the same account through an OFX (FITIDs, a ledger balance): every line is already here (the CSV and the OFX are one line each), and the ledger balance anchors the account', await page.evaluate(async () => {
    const ofx = '<OFX><BANKMSGSRSV1><STMTTRNRS><STMTRS><BANKACCTFROM><ACCTID>1234</ACCTID></BANKACCTFROM><BANKTRANLIST>' +
      [['20260505', '-7000.00', 'To OPEX', 'A1'], ['20260510', '600.00', 'Transfer from Receiving', 'A2']].map(([d, a, n, f]) => `<STMTTRN><TRNTYPE>OTHER</TRNTYPE><DTPOSTED>${d}</DTPOSTED><TRNAMT>${a}</TRNAMT><FITID>${f}</FITID><NAME>${n}</NAME></STMTTRN>`).join('') +
      '</BANKTRANLIST><LEDGERBAL><BALAMT>3500.00</BALAMT><DTASOF>20260510</DTASOF></LEDGERBAL></STMTRS></STMTTRNRS></BANKMSGSRSV1></OFX>';
    _said.length = 0; await bizStmtFiles([new File([ofx], 'savings.ofx', { type: 'application/x-ofx' })]);
    const a = bizStore().accts['1234'];
    return a.lines.length === 11 && a.bal === 3500 && a.balAt === '2026-05-10' && _said.some(m => /2 lines read from savings\.ofx/.test(m) && /1 new/.test(m) && /1 already here/.test(m));
  }), await page.evaluate(() => JSON.stringify({ n: bizStore().accts['1234'].lines.length, said: _said })));
  ok('the ⚙ Setup section carries the same drop box and says what is in: two accounts, their lines, through when', await page.evaluate(() => {
    bizSetupWord(); const sec = $('bizSec'), t = $('bizSetupMsg').textContent;
    return !!sec && !!$('bizFileInSet') && /···1234: 11 lines through May 10/.test(t) && /···5678: 3 lines through Mar 5/.test(t) && /Open the Business page/.test(sec.textContent);
  }), await page.evaluate(() => $('bizSetupMsg').textContent));
  ok('THE WALL: the Wizard never sees a business line; the personal budget never gains one; the store rides only as App Data/business-bank.json', await page.evaluate(() => {
    const ctx = buildAskContext('how is the savings doing');
    return !/Manual transfer from OPEX|Customer payment/.test(ctx) && pb().tx.length === 0 && Object.keys(_up).every(p => /business-bank\.json$/.test(p));
  }));
  await page.evaluate(() => bizClose());
  ok('no figure of his can sit in the Business block — nothing to the cent, nothing in the thousands with a comma (this file is public too, so its own numbers are made up)', (() => {
    const i = src.indexOf('// ================= 📈 v7.38 — BUSINESS'), j = src.indexOf('async function openMoneyPage(which) {', i);
    const block = src.slice(i, j);
    return block.length > 5000 && !/(?<![v\d.])\d[\d,]*\.\d{2}\b/.test(block) && !/\b\d{1,3},\d{3}\b/.test(block);
  })());

  console.log('— 👷 Phil\'s phone —');
  const phil = await open(() => { try { localStorage.setItem('daylog-crew-name', 'Phil'); localStorage.setItem('daylog-crew-root', '/Phil'); localStorage.setItem('daylog-crew-jobs', JSON.stringify(['Oak House'])); } catch (e) {} });
  ok('a crew phone: no 📈 Business plate, no Setup section, and openBusiness() draws nothing', await phil.page.evaluate(() => {
    const biz = document.querySelector('#scRow .sc-biz');
    openBusiness();
    return CREW_NAME === 'Phil' && !!biz && getComputedStyle(biz).display === 'none' && getComputedStyle($('bizSec')).display === 'none' && !$('revModal').classList.contains('show');
  }));

  ok('version bumped — APP_VER and the footer agree', /const APP_VER = 'v7\.(3[8-9]|[4-9]\d)'/.test(src) && new RegExp('<footer>' + (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1].replace('.', '\\.')).test(src));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
