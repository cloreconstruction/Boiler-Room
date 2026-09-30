// 📗 v7.58 — A RECEIPT MATCHED TO LOGAN'S INVOICE, TO THE CENT. Eric: "qb has it, i don't usually know when qb has it other than i
// sent the reciept to logan. so how are these getting matched? how can we know that its correct" — the books run now writes this
// client's invoice LINES (Client Portal/sales-<code>.json); a receipt on the way is retired only when ONE line has its exact amount
// (its own, or with the markup folded in), dated on or after the receipt, under an item that is this category. The same amount
// under another item only pre-lights the plate — his tap decides. With the file, nothing is retired on a guess; without it, the
// old category-growth rule stands. The plate reads ✓ It's on their invoice now (it said QB HAS IT). Every name and figure made up.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { fileURLToPath } = require('url');
(async () => {
  const appUrl = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const repo = path.dirname(fileURLToPath(appUrl));
  const src = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
  const fn = fs.readFileSync(path.join(repo, 'fnsrc', 'client-portal.mjs'), 'utf8');
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await ctx.route(u => !/^file:/.test(u.href), r => r.abort());
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
  await page.goto(appUrl); await page.waitForTimeout(700);
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };
  const CODE = 'oak-111111';

  const seed = (board, pg, sales) => page.evaluate(([CODE, board, pg, sales]) => {
    jobs = ['Oak House']; crew = []; todos = []; window.scheduleSave = () => {}; dbx.refreshToken = 'test-token';
    _portalIdx = { clients: [{ key: 'oak', job: 'Oak House', code: CODE }] };
    window._dbxFiles = {}; window._ups = [];
    window.dbxDownload = async p => (window._dbxFiles || {})[p] ?? null;
    window.dbxUpload = async (p, body) => { (window._dbxFiles || {})[p] = body; window._ups.push(p); return {}; };
    window.dbxPathExists = async p => Object.prototype.hasOwnProperty.call(window._dbxFiles || {}, p);
    if (!window._said) { window._said = []; const t0 = window.toast; window.toast = (m, g) => { if (m) _said.push(String(m)); return t0(m, g); }; }
    _said.length = 0;
    // the receipts behind the bills: their own dates ride on the read
    entries = []; nextId = 1;
    const mk = (id, d, v, a) => { const e = addEntry('Note', `receipt ${v}`, 'Oak House', { rcpt: true, category: 'Framing', ai: `📅 ${d}\n🏪 ${v}\n💵 $${a}`, budg: 'sent' }); e.id = id; return e; };
    mk(1, '2026-09-18', 'Lumber Co', '1,240.00'); mk(2, '2026-09-21', 'Pipe Pros', '830.50'); mk(3, '2026-09-24', 'Roof Mart', '500.00'); mk(4, '2026-09-19', 'Volt Works', '200.00'); mk(5, '2026-09-19', 'Siding Co', '300.00'); mk(6, '2026-09-20', 'Nail Shop', '75.00'); mk(7, '2026-09-20', 'Nail Shop', '75.00');
    nextId = 100;
    window._dbxFiles[estPath(CODE)] = JSON.stringify(board);
    window._dbxFiles[portalRoot() + '/' + CODE + '.json'] = JSON.stringify(pg);
    if (sales) window._dbxFiles[portalRoot() + '/sales-' + CODE + '.json'] = JSON.stringify(sales);
    _estIdx = -1; _estD = null; _estPage = null; _estSales = null;
  }, [CODE, board, pg, sales]);
  const open = async () => { await page.evaluate(async () => { await openEstimates(0); }); await page.waitForTimeout(1300); };
  const boardJson = () => page.evaluate(CODE => JSON.parse(window._dbxFiles[estPath(CODE)]), CODE);
  const pendOf = n => page.evaluate(n => { const x = _estD.cats.find(c => c.n === n); return (x && x.pend || []).map(p => ({ a: p.a, eid: p.eid })); }, n);
  const rowWords = n => page.evaluate(n => { const ci = _estD.cats.findIndex(c => c.n === n); _estOpenCats.add(ci); renderEstimates(); const r = document.querySelector(`.est-row[data-ci="${ci}"]`);
    return [...r.querySelectorAll('.est-pend-row')].map(p => ({ t: p.textContent.replace(/\s+/g, ' ').trim(), lit: p.querySelector('.est-pend-inv').classList.contains('sel'), plate: p.querySelector('.est-pend-inv').textContent.trim() })); }, n);
  const pend = (a, ts, eid, base) => ({ a, inc: false, v: 'x', ts, base: base || 0, eid });
  const board = () => ({ mk: 20, cats: [
    { n: 'Framing', appr: true, bids: [{ e1: 20000, e2: 0, acc: true }], pend: [pend(1240, '2026-09-20', 1), pend(75, '2026-09-21', 6), pend(75, '2026-09-21', 7)] },
    { n: 'Plumbing', appr: true, bids: [{ e1: 9000, e2: 0, acc: true }], pend: [pend(830.5, '2026-09-22', 2)] },
    { n: 'Roofing', appr: false, bids: [], pend: [pend(500, '2026-09-25', 3)] },
    { n: 'Electrical', appr: true, bids: [{ e1: 4000, e2: 0, acc: true }], pend: [pend(200, '2026-09-20', 4)] },
    { n: 'Siding', appr: false, bids: [], pend: [pend(300, '2026-09-20', 5, 0)] }] });
  const pg = { name: 'Oak House', updated: '2026-09-28', show: { money: true }, invoiced: 30000, paid: 20000, open: 10000, journal: [],
    phases: [{ n: 1, name: 'Foundation & shell', total: 30000, cats: [['Framing', 15000], ['Siding', 15000]] }], upcoming: { items: [{ n: 'Framing', a: 1668 }, { n: 'Plumbing', a: 996.6 }, { n: 'Roofing', a: 600 }, { n: 'Electrical', a: 240 }, { n: 'Siding', a: 360 }], tot: 3864.6, all: 1 } };
  const sales = { asOf: '2026-09-29', lines: [
    { inv: '1334', d: '2026-09-23', item: 'Framing', memo: 'lumber, first load', amt: 1240 },
    { inv: '1334', d: '2026-09-23', item: '', memo: 'markup', amt: 248 },
    { inv: '1335', d: '2026-09-26', item: 'Roofing', memo: 'rough plumbing — billed under the wrong item', amt: 830.5 },
    { inv: '1330', d: '2026-09-10', item: 'Roofing', memo: 'an older line, before the receipt', amt: 500 },
    { inv: '1336', d: '2026-09-27', item: 'Electrical', memo: 'service panel parts', amt: 240 },
    { inv: '1334', d: '2026-09-23', item: 'Framing', memo: 'nails', amt: 75 }] };

  console.log('— 📗 the invoice lines —');
  await seed(board(), pg, sales);
  await open();
  const b1 = await boardJson();
  const trail = b1.cleared || [];
  ok('on open, a receipt with ITS OWN invoice line — the same amount to the cent, dated after the receipt, under its own category — is retired and the trail names the invoice', trail.some(t => t.eid === 1 && t.why === 'qb' && t.inv === '1334' && t.invD === '2026-09-23' && t.invItem === 'Framing' && t.saw === 1240 && t.invKey) && (await pendOf('Framing')).every(p => p.eid !== 1), JSON.stringify(trail));
  ok('the markup line beside it is nobody\'s receipt; a line for the marked-up figure matches too (the electrical receipt at $200 → $240 on their page, billed as $240)', trail.some(t => t.eid === 4 && t.why === 'qb' && t.inv === '1336') && !trail.some(t => t.saw === 248) && (await pendOf('Electrical')).length === 0, JSON.stringify(trail));
  ok('the same amount under ANOTHER item is never taken on its own — the plumbing receipt stays, its row says what it saw, and the plate is pre-lit for his tap', await (async () => { const w = await rowWords('Plumbing'); return (await pendOf('Plumbing')).length === 1 && w.length === 1 && /📗 exactly \$830\.50 on invoice #1335 · Sep 26, 2026 · under Roofing — is that this one\?/.test(w[0].t) && w[0].lit && w[0].plate === "✓ It's on their invoice"; })());
  ok('a line dated BEFORE the receipt is not its line — the roofing receipt stays and says no invoice line yet', await (async () => { const w = await rowWords('Roofing'); return (await pendOf('Roofing')).length === 1 && /no invoice line for it yet/.test(w[0].t) && !w[0].lit; })());
  ok('with the lines in hand NOTHING is retired on a guess: the siding receipt sits under a category the books show far past it, and stays', (await pendOf('Siding')).length === 1 && !trail.some(t => t.eid === 5));
  ok('one line, one receipt: two identical receipts and ONE line for the amount — the first is retired, the second waits', trail.filter(t => t.a === 75).length === 1 && (await pendOf('Framing')).filter(p => p.a === 75).length === 1, JSON.stringify(trail.filter(t => t.a === 75)));
  ok('the toast counts what was matched', await page.evaluate(() => _said.some(t => /^📗 3 bills matched in QuickBooks — off their receipts list$/.test(t))), await page.evaluate(() => JSON.stringify(_said)));

  ok('his tap on the pre-lit plate retires the plumbing receipt and writes the invoice it saw onto the trail — as HIS tap, not a match', await page.evaluate(async () => {
    const ci = _estD.cats.findIndex(c => c.n === 'Plumbing'); _said.length = 0; await estPendClear(ci, 0, 'qb'); await new Promise(r => setTimeout(r, 100));
    const t = (_estD.cleared || []).find(x => x.eid === 2);
    return !!t && t.why === 'qb-eric' && t.inv === '1335' && t.invItem === 'Roofing' && _said.some(s => /^📗 Off their receipts list — on invoice #1335$/.test(s)); }));
  ok('the same line cannot retire a second receipt afterwards — it is spent', await page.evaluate(() => { const free = estSalesFree(); return !free.some(l => l.inv === '1335') && !free.some(l => l.inv === '1336') && free.filter(l => l.inv === '1334').length === 1 && free[0] && true; }));
  ok('💵 the what-is-in-it window names the invoice on each: matched to the cent, or your tap', await page.evaluate(() => { const ci = _estD.cats.findIndex(c => c.n === 'Framing'); estWhatOpen(ci, 'in');
    const rows = [...document.querySelectorAll('.est-what-sheet .ew-row[data-kind="taken"]')].map(r => r.textContent.replace(/\s+/g, ' '));
    estWhatClose(); const ci2 = _estD.cats.findIndex(c => c.n === 'Plumbing'); estWhatOpen(ci2, 'in'); const rows2 = [...document.querySelectorAll('.est-what-sheet .ew-row[data-kind="taken"]')].map(r => r.textContent.replace(/\s+/g, ' ')); estWhatClose();
    return rows.some(t => /📗 on invoice #1334 · Sep 23, 2026 \(matched to the cent\)/.test(t)) && rows2.some(t => /📗 on invoice #1335 · Sep 26, 2026 \(your tap\)/.test(t)); }));
  ok('closing the board lets the lines go', await page.evaluate(() => { closeEstimates(); return _estSales === null; }));

  console.log('— without the file —');
  await seed(board(), pg, null);
  await open();
  const b2 = await boardJson();
  ok('with NO lines file the old rule stands: the siding receipt clears because the category\'s total grew past it (why qb, no invoice named), and the row wears the old nudge words', b2.cleared.some(t => t.eid === 5 && t.why === 'qb' && !t.inv) && await page.evaluate(() => _estSales === null) && (await rowWords('Framing')).every(w => !/invoice line/.test(w.t)), JSON.stringify(b2.cleared));
  ok('his tap without the file writes no invoice on the trail, and the words say he said so', await page.evaluate(async () => { const ci = _estD.cats.findIndex(c => c.n === 'Plumbing'); _said.length = 0; await estPendClear(ci, 0, 'qb'); const t = (_estD.cleared || []).find(x => x.eid === 2); return !!t && t.why === 'qb-eric' && !t.inv && _said.some(s => /^📗 Off their receipts list — you said it is on their invoice$/.test(s)); }));
  await page.evaluate(() => closeEstimates());

  ok('🧱 the homeowner\'s door never serves the lines file', !/sales-/.test(fn));
  ok('the old plate words are gone from the app: no "QB HAS IT" on a bill', !/QB HAS IT — retire/.test(src) && /✓ It's on their invoice/.test(src));
  ok('version bumped — APP_VER and the footer agree', /const APP_VER = 'v7\.(5[8-9]|[6-9]\d)'/.test(src) && new RegExp('<footer>' + (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1].replace('.', '\\.') + ' ·').test(src));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
