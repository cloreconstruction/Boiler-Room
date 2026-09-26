// v7.28 — Eric: "my banks statements are pdf only, how do i convert or get this to you easily?" … "go, make it read the pdf."
// Two made-up statements are built here as real PDFs (pdf-lib), pdf.js is served from this machine in place of the CDN, and the
// drop box reads them on the page. Every bank, account, store and figure is made up; the days are built from today.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { fileURLToPath } = require('url');
const { PDFDocument, StandardFonts } = require('pdf-lib');
(async () => {
  const appUrl = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const repo = path.dirname(fileURLToPath(appUrl));
  const src = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
  const pdfjs = path.dirname(require.resolve('pdfjs-dist/package.json'));
  const mkPdf = async lines => { const doc = await PDFDocument.create(); const font = await doc.embedFont(StandardFonts.Helvetica); const page = doc.addPage([612, 792]); let y = 740; for (const l of lines) { page.drawText(l, { x: 40, y, size: 10, font }); y -= 16; } return Buffer.from(await doc.save()).toString('base64'); };
  const d = new Date(), dom = d.getDate(), back = n => { const x = new Date(); x.setDate(Math.max(1, dom - n)); return x; };
  const md = x => `${String(x.getMonth() + 1).padStart(2, '0')}/${String(x.getDate()).padStart(2, '0')}`, mdy = x => md(x) + '/' + x.getFullYear(), mdy2 = x => md(x) + '/' + String(x.getFullYear()).slice(2);
  const iso = x => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
  const first = new Date(d.getFullYear(), d.getMonth(), 1);
  // a bank statement: running balances, sections, a two-line description, a checks table
  const bankPdf = await mkPdf(['ACME BANK', `Statement Period ${mdy(first)} - ${mdy(d)}`, 'Account Number: XXXXXX4321', 'Beginning Balance 1,000.00',
    'Deposits and Additions', `${md(back(6))} PAYROLL ACME CONST 1,500.00 2,500.00`,
    'Withdrawals and Debits', `${md(back(5))} POS PURCHASE 84.12 2,415.88`, 'FRED MEYER SOLDOTNA AK', `${md(back(4))} CHEVRON 0091 KENAI AK 61.40 2,354.48`, `${md(back(3))} AMEX EPAYMENT ACH PMT 300.00 2,054.48`,
    'Checks', `1234 ${md(back(2))} 50.00 2,004.48`, 'Ending Balance 2,004.48']);
  // a card statement: charges plain, the payment with a minus, days with a two-digit year
  const cardPdf = await mkPdf(['ACME CARD', 'Account Ending 1-21005', `Closing Date ${mdy(d)}`, 'Minimum Payment Due $25.00 New Balance $145.52',
    'New Charges', `${mdy2(back(5))}* FRED MEYER SOLDOTNA AK $84.12`, `${mdy2(back(4))} CHEVRON KENAI AK $61.40`,
    'Payments and Credits', `${mdy2(back(3))} MOBILE PAYMENT - THANK YOU -$300.00`]);
  // no balances, no sections: the words decide, and the toast says to check
  const barePdf = await mkPdf(['SOME BANK', `Statement Date ${mdy(d)}`, `${md(back(6))} DIRECT DEP ACME CONST 1,500.00`, `${md(back(5))} FRED MEYER SOLDOTNA AK 84.12`]);
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await ctx.route(u => !/^file:/.test(u.href), r => r.abort());
  let cdnOn = false;   // pdf.js from this machine, in place of the CDN, once the "offline" check has run
  await ctx.route(u => /cdnjs\.cloudflare\.com\/ajax\/libs\/pdf\.js\//.test(u.href), (route, req) => {
    if (!cdnOn) return route.abort();
    const f = /worker/.test(req.url()) ? 'pdf.worker.min.js' : 'pdf.min.js';
    return route.fulfill({ path: path.join(pdfjs, 'build', f), contentType: 'application/javascript' });
  });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
  await page.goto(appUrl); await page.waitForTimeout(700);
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };

  await page.evaluate(() => {
    window.scheduleSave = () => {}; window.savePendingSoon = () => {}; entries = []; todos = [];
    prefs.pb = {}; openPanel('budget');
    window._pdf = (name, b64) => new File([Uint8Array.from(atob(b64), c => c.charCodeAt(0))], name, { type: 'application/pdf' });
    window._said = []; const t0 = window.toast; window.toast = (m, g) => { if (m) _said.push(String(m)); return t0(m, g); };
    window._tx = () => pb().tx;
  });

  console.log('— 📄 (1) the reader —');
  ok('with no internet the PDF reader cannot fetch itself, and it says so in words — nothing is added', await page.evaluate(async b64 => {
    _said.length = 0; await pbStmtFiles([_pdf('statement.pdf', b64)]);
    return _tx().length === 0 && _said.some(m => /PDF reader needs the internet once/.test(m));
  }, bankPdf), await page.evaluate(() => JSON.stringify(_said)));
  cdnOn = true;
  const bank = await page.evaluate(async b64 => {
    _said.length = 0; await pbStmtFiles([_pdf('statement.pdf', b64)]);
    return { tx: _tx().map(t => ({ d: t.d, amt: t.amt, desc: t.desc, acct: t.acct, cat: t.cat })), accts: pb().accts, said: _said };
  }, bankPdf);
  const dd = n => iso(back(n));
  ok('a bank PDF: five lines with a day and an amount — the signs from the RUNNING BALANCES (payroll in, the rest out), the two-line words joined ("POS PURCHASE FRED MEYER SOLDOTNA AK"), the check from the checks table, the year from the statement period', bank.tx.length === 5 &&
    bank.tx.some(t => t.desc === 'PAYROLL ACME CONST' && t.amt === 1500 && t.d === dd(6)) && bank.tx.some(t => t.desc === 'POS PURCHASE FRED MEYER SOLDOTNA AK' && t.amt === -84.12 && t.d === dd(5)) &&
    bank.tx.some(t => t.desc === 'CHEVRON 0091 KENAI AK' && t.amt === -61.4) && bank.tx.some(t => t.desc === 'AMEX EPAYMENT ACH PMT' && t.amt === -300) && bank.tx.some(t => t.desc === 'Check 1234' && t.amt === -50 && t.d === dd(2)), JSON.stringify(bank));
  ok('…the account is its last four (4321 — never the X-ed number), the ending balance rides along as of the statement\'s closing day, and the toast does NOT ask him to check the ins and outs (nothing was guessed)', bank.accts['4321'] && bank.accts['4321'].bal === 2004.48 && bank.accts['4321'].balAt === iso(d) && bank.tx.every(t => t.acct === '4321') && !/XXXXXX/.test(JSON.stringify(bank.accts)) &&
    bank.said.some(m => /🏦 5 lines read from statement\.pdf · 5 new · 0 already here · 5 to sort$/.test(m)), JSON.stringify({ accts: bank.accts, said: bank.said }));
  ok('the same PDF dropped again adds nothing', await page.evaluate(async b64 => { _said.length = 0; await pbStmtFiles([_pdf('statement.pdf', b64)]); return _tx().length === 5 && _said.some(m => /0 new · 5 already here/.test(m)); }, bankPdf));
  const card = await page.evaluate(async b64 => {
    _said.length = 0; await pbStmtFiles([_pdf('card.pdf', b64)]);
    return { tx: _tx().filter(t => t.k === '1005').map(t => ({ d: t.d, amt: t.amt, desc: t.desc })), acct: pb().accts['1005'], said: _said, pair: !!document.querySelector('#pbBank .pb-pair') };
  }, cardPdf);
  ok('a card PDF (Minimum Payment Due · New Charges · Account Ending): the charges become money OUT, the payment money in, two-digit years read right, the account remembers it is a card, its New Balance rides along — and the payment now pairs with the bank\'s AMEX line', card.tx.length === 3 &&
    card.tx.some(t => t.desc === 'FRED MEYER SOLDOTNA AK' && t.amt === -84.12 && t.d === dd(5)) && card.tx.some(t => t.desc === 'MOBILE PAYMENT - THANK YOU' && t.amt === 300 && t.d === dd(3)) && card.acct && card.acct.flip === true && card.acct.bal === 145.52 &&
    card.said.some(m => /⇅ a card file: charges read as money out/.test(m)) && card.pair, JSON.stringify(card));
  ok('a bare PDF (no balances, no sections): DIRECT DEP reads as money in, the store as money out, and the toast says to check the ins and outs', await page.evaluate(async b64 => {
    _said.length = 0; await pbStmtFiles([_pdf('bare.pdf', b64)]);
    const t = _tx().filter(x => x.k === 'bare');
    return t.length === 2 && t.some(x => /DIRECT DEP/.test(x.desc) && x.amt === 1500) && t.some(x => /FRED MEYER/.test(x.desc) && x.amt === -84.12) && _said.some(m => /📄 check the ins and outs — ⇅ on the account turns them all/.test(m));
  }, barePdf), await page.evaluate(() => JSON.stringify({ tx: _tx().filter(x => x.k === 'bare'), said: _said })));
  ok('a PDF with no transaction lines is refused in words (a scan has no words to read)', await page.evaluate(async b64 => {
    _said.length = 0; const n = _tx().length; await pbStmtFiles([_pdf('blank.pdf', b64)]);
    return _tx().length === n && _said.some(m => /no lines with a day and an amount — a scanned statement has no words to read/.test(m));
  }, await mkPdf(['ACME BANK', 'Nothing to see here'])), await page.evaluate(() => JSON.stringify(_said)));
  ok('the drop box says PDF and takes .pdf files', await page.evaluate(() => /CSV, OFX \/ QFX or PDF/.test($('pbBank').textContent) && /\.pdf/.test($('pbStmtIn').accept) && /not a scan/.test($('pbBank').textContent)));
  ok('the wall still holds: the Wizard sees none of it, and no figure sits in the budget block of the code', await page.evaluate(() => !/FRED MEYER|PAYROLL ACME/.test(buildAskContext('what did I spend'))) && (() => { const a = src.indexOf('v6.84 — THE PERSONAL BUDGET ====='), b = src.indexOf('v6.79 — THE BOARD =====', a); const block = src.slice(a, b); return /pbPdfParse/.test(block) && !/(?<![v\d.])\d[\d,]*\.\d{2}\b/.test(block) && !/\b\d{1,3},\d{3}\b/.test(block); })());

  ok('version bumped — APP_VER and the footer agree', /const APP_VER = 'v7\.(2[8-9]|[3-9]\d)'/.test(src) && new RegExp('<footer>' + (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1].replace('.', '\\.')).test(src));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
