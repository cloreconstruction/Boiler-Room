// v7.26 — Eric: "id like to expand on the personal budget part … the biggest question i have is how could we get it to get
// statements or better daily updated numbers from a bank account?" — of the three roads offered he picked the statement drop
// ("2"). Every bank, account, store and figure here is made up; the dates are built from today so the month checks hold.
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

  await page.evaluate(() => {
    window.scheduleSave = () => {}; window.savePendingSoon = () => {}; entries = []; todos = [];
    prefs.pb = {}; openPanel('budget');
    // days inside THIS month, counted back from today (never past the 1st) so the month tiles see them
    const dom = new Date().getDate(), back = n => { const d = new Date(); d.setDate(Math.max(1, dom - n)); return d; };
    const us = d => `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`, iso = d => localDay(d), ofx = d => iso(d).replace(/-/g, '');
    window._D = { us, iso, ofx, back };
    window._file = (name, text) => new File([text], name, { type: 'text/plain' });
    window._said = []; const t0 = window.toast; window.toast = (m, g) => { if (m) _said.push(String(m)); return t0(m, g); };
    window._tx = () => pb().tx;
    window._chase = () => [
      'Details,Posting Date,Description,Amount,Type,Balance,Check or Slip #',
      `DEBIT,${us(back(1))},FRED MEYER #0123 SOLDOTNA AK,-84.12,DEBIT_CARD,1520.33,`,
      `CREDIT,${us(back(2))},PAYROLL ACME CONST,1500.00,ACH_CREDIT,1604.45,`,
      `DEBIT,${us(back(2))},"THREE BEARS, KENAI",-42.17,DEBIT_CARD,104.45,`,
      `DEBIT,${us(back(3))},FRED MEYER #0123 SOLDOTNA AK,-19.99,DEBIT_CARD,146.62,`].join('\r\n') + '\r\n';
  });

  console.log('— 🏦 (1) a statement lands and is read on the phone —');
  ok('a bank CSV with a heading row (newest first): four lines, the signs and the quoted "THREE BEARS, KENAI" right, newest first, the balance kept for the account (as of the newest day), the toast counts it', await page.evaluate(async () => {
    _said.length = 0; await pbStmtFiles([_file('checking.csv', _chase())]);
    const t = _tx(), a = Object.values(pb().accts)[0] || {};
    return t.length === 4 && t[0].amt === -84.12 && t[0].desc === 'FRED MEYER #0123 SOLDOTNA AK' && t[0].d === _D.iso(_D.back(1)) && t.some(x => x.amt === 1500 && /PAYROLL/.test(x.desc)) && t.some(x => x.amt === -42.17 && x.desc === 'THREE BEARS, KENAI') && t[3].amt === -19.99 &&
      a.bal === 1520.33 && a.balAt === _D.iso(_D.back(1)) && t.every(x => !x.cat) && _said.some(m => /🏦 4 lines read from checking\.csv · 4 new · 0 already here · 4 to sort/.test(m));
  }), await page.evaluate(() => JSON.stringify({ tx: _tx(), accts: pb().accts, said: _said })));
  ok('the same file dropped again adds nothing — 4 already here', await page.evaluate(async () => {
    _said.length = 0; await pbStmtFiles([_file('checking.csv', _chase())]);
    return _tx().length === 4 && _said.some(m => /4 lines read .* 0 new · 4 already here/.test(m));
  }), await page.evaluate(() => JSON.stringify(_said)));
  ok('a CSV with NO heading row (the day, the amount, then the words in the last cell) reads too', await page.evaluate(async () => {
    const t = [`"${_D.us(_D.back(4))}","-33.10","*","","CHEVRON 0091 KENAI AK"`, `"${_D.us(_D.back(5))}","250.00","*","","MOBILE DEPOSIT"`].join('\n');
    await pbStmtFiles([_file('other-bank.csv', t)]);
    const tx = _tx();
    return tx.length === 6 && tx.some(x => x.amt === -33.1 && x.desc === 'CHEVRON 0091 KENAI AK') && tx.some(x => x.amt === 250 && x.desc === 'MOBILE DEPOSIT');
  }), await page.evaluate(() => JSON.stringify(_tx().map(x => [x.d, x.amt, x.desc]))));
  ok('a card CSV with Debit / Credit columns and a Card No.: the debit is money out, the credit money in, the card is its last four, and a long run of digits in the words is masked', await page.evaluate(async () => {
    const t = ['Transaction Date,Posted Date,Card No.,Description,Category,Debit,Credit', `${_D.iso(_D.back(6))},${_D.iso(_D.back(5))},1234,AMAZON.COM 1234567890123,Shopping,25.50,`, `${_D.iso(_D.back(7))},${_D.iso(_D.back(6))},1234,PAYMENT - THANK YOU,,,100.00`].join('\n');
    await pbStmtFiles([_file('card.csv', t)]);
    const tx = _tx(), am = tx.find(x => /AMAZON/.test(x.desc)), pay = tx.find(x => /THANK YOU/.test(x.desc));
    return tx.length === 8 && am && am.amt === -25.5 && am.desc === 'AMAZON.COM …' && am.acct === '1234' && pay && pay.amt === 100 && !/1234567890123/.test(JSON.stringify(prefs.pb));
  }), await page.evaluate(() => JSON.stringify(_tx().map(x => [x.d, x.amt, x.desc, x.acct]))));
  ok('an OFX / QFX file: the bank\'s own ids, the account\'s last four (never the whole number anywhere), the ledger balance as of its day', await page.evaluate(async () => {
    const t = ['OFXHEADER:100', 'DATA:OFXSGML', '', '<OFX><BANKMSGSRSV1><STMTTRNRS><STMTRS><BANKACCTFROM><ACCTID>000123456789</ACCTID></BANKACCTFROM>',
      `<BANKTRANLIST><STMTTRN><TRNTYPE>DEBIT<DTPOSTED>${_D.ofx(_D.back(8))}120000[-8:AKDT]<TRNAMT>-12.50<FITID>A1<NAME>HOME STORE<MEMO>HOME STORE SOLDOTNA</STMTTRN>`,
      `<STMTTRN><TRNTYPE>CREDIT<DTPOSTED>${_D.ofx(_D.back(9))}<TRNAMT>75.00<FITID>A2<NAME>REFUND</STMTTRN></BANKTRANLIST>`,
      `<LEDGERBAL><BALAMT>1300.25<DTASOF>${_D.ofx(_D.back(8))}</LEDGERBAL></STMTRS></STMTTRNRS></BANKMSGSRSV1></OFX>`].join('\n');
    await pbStmtFiles([_file('savings.qfx', t)]);
    const tx = _tx(), h = tx.find(x => x.id === '6789:A1'), r = tx.find(x => x.id === '6789:A2'), a = pb().accts['6789'];
    return tx.length === 10 && h && h.amt === -12.5 && h.desc === 'HOME STORE — HOME STORE SOLDOTNA' && h.acct === '6789' && r && r.amt === 75 && a && a.bal === 1300.25 && a.balAt === _D.iso(_D.back(8)) && !/000123456789/.test(JSON.stringify(prefs.pb)) &&
      Object.values(pb().accts).every(x => String(x.last4 || '').length <= 4);
  }), await page.evaluate(() => JSON.stringify({ tx: _tx().slice(0, 3), accts: pb().accts })));
  ok('a file that is not a statement is refused in words; nothing changes', await page.evaluate(async () => {
    _said.length = 0; const n = _tx().length; await pbStmtFiles([_file('photo.jpg', 'xx')]); await pbStmtFiles([_file('notes.csv', 'just some words\nno numbers here')]);
    return _tx().length === n && _said.some(m => /not a bank file/.test(m)) && _said.some(m => /no day and amount columns/.test(m));
  }), await page.evaluate(() => JSON.stringify(_said)));

  console.log('— 🗂 (2) TO SORT: the wheel, and the store is remembered —');
  ok('the 🏦 card says how many are to sort; every unsorted line has a wheel, the deposits offer 💵 Income first; nothing runs off the phone', await page.evaluate(() => {
    const card = $('pbBank'), rows = [...card.querySelectorAll('.pb-txrow')], dep = rows.find(r => /PAYROLL/.test(r.textContent)), sel = dep && dep.querySelector('select');
    return /10 to sort/.test(card.textContent) && rows.length === 10 && rows.every(r => r.querySelector('select.pb-txsel')) && sel && sel.options[1].value === 'Income' && /💵 Income/.test(sel.options[1].textContent) &&
      document.documentElement.scrollWidth <= document.documentElement.clientWidth;
  }), await page.evaluate(() => ($('pbBank') || {}).textContent));
  ok('Groceries on one FRED MEYER line: the other FRED MEYER line follows (same store, exact name), the store is remembered, the toast says so', await page.evaluate(() => {
    _said.length = 0; const t = _tx().find(x => x.amt === -84.12);
    pbTxCat(t.id, 'Groceries');
    const fm = _tx().filter(x => /FRED MEYER/.test(x.desc));
    return fm.length === 2 && fm.every(x => x.cat === 'Groceries') && pb().storeCat['fred meyer soldotna ak'] === 'Groceries' && _said.some(m => /→ Groceries · 1 more of the same store followed/.test(m));
  }), await page.evaluate(() => JSON.stringify({ sc: pb().storeCat, said: _said })));
  ok('…and the sorted bank lines count: SPENT is the two FRED MEYER lines, WHERE IT WENT shows Groceries, the SPEND list shows them with a 🏦 and a ✎ (never a ✕)', await page.evaluate(() => {
    const spent = pbSpendThisMonth().reduce((s, x) => s + x.amt, 0);
    const body = $('pbBody').textContent.replace(/\s+/g, ' ');
    const rows = [...document.querySelectorAll('#pbBody .pb-row')].filter(r => /🏦 Groceries/.test(r.textContent));
    return Math.round(spent * 100) === 10411 && /SPENT \$104/.test(body) && /WHERE IT WENT/.test(body) && rows.length === 2 && rows.every(r => r.querySelector('.pb-x') && r.querySelector('.pb-x').textContent === '✎');
  }), await page.evaluate(() => JSON.stringify({ spent: pbSpendThisMonth(), body: $('pbBody').textContent.replace(/\s+/g, ' ').slice(0, 400) })));
  ok('the next FRED MEYER line dropped LATER is sorted on arrival — the store is known', await page.evaluate(async () => {
    const t = ['Details,Posting Date,Description,Amount,Type,Balance,Check or Slip #', `DEBIT,${_D.us(_D.back(0))},FRED MEYER #0123 SOLDOTNA AK,-7.25,DEBIT_CARD,1513.08,`].join('\n');
    await pbStmtFiles([_file('checking2.csv', t)]);
    const n = _tx().find(x => x.amt === -7.25);
    return !!n && n.cat === 'Groceries' && _said.some(m => /1 line read from checking2\.csv · 1 new · 0 already here$/.test(m));
  }), await page.evaluate(() => JSON.stringify(_said.slice(-2))));
  ok('Income, Transfer and Bill never count as spending: the payroll as Income shows as "came in this month", THREE BEARS as Transfer and the card payment as Bill leave SPENT alone', await page.evaluate(() => {
    const before = pbSpendThisMonth().reduce((s, x) => s + x.amt, 0);
    pbTxCat(_tx().find(x => /PAYROLL/.test(x.desc)).id, 'Income'); pbTxCat(_tx().find(x => /THREE BEARS/.test(x.desc)).id, 'Transfer'); pbTxCat(_tx().find(x => /THANK YOU/.test(x.desc)).id, 'Bill');
    const after = pbSpendThisMonth().reduce((s, x) => s + x.amt, 0);
    return Math.round(before * 100) === Math.round(after * 100) && /💵 \$1,500 came in this month/.test($('pbBank').textContent) && !pbCatList().includes('Income') && !pbCatList().includes('Transfer');
  }), await page.evaluate(() => $('pbBank').textContent.replace(/\s+/g, ' ')));
  ok('✎ on a sorted bank line unsorts it (back in TO SORT); ✕ on a line takes it off, and Undo puts it back', await page.evaluate(async () => {
    const t = _tx().find(x => x.amt === -19.99); pbTxCat(t.id, '');
    const back = !t.cat && [...$('pbBank').querySelectorAll('.pb-txrow')].some(r => /19\.99|\$20/.test(r.textContent) && /FRED MEYER/.test(r.textContent));
    const n = _tx().length; pbTxDel(t.id); const gone = _tx().length === n - 1;
    const u = [...document.querySelectorAll('#toast button, .toast button, button')].find(b => /Undo/i.test(b.textContent) && b.offsetParent); if (u) u.click(); await new Promise(r => setTimeout(r, 50));
    return back && gone && !!u && _tx().length === n && _tx().some(x => x.amt === -19.99);
  }));

  console.log('— 🔒 (3) the wall —');
  ok('the Wizard never sees a bank line (prefs.pb stays out of its context), and no figure sits in the budget block of the code (the numbers here are the test\'s own)', await page.evaluate(() => {
    const c = buildAskContext('what did I spend at fred meyer');
    return !/FRED MEYER/.test(c) && !/THREE BEARS/.test(c) && !/1520/.test(c);
  }) && (() => { const a = src.indexOf('v6.84 — THE PERSONAL BUDGET ====='), b = src.indexOf('v6.79 — THE BOARD =====', a); const block = a > 0 && b > a ? src.slice(a, b) : ''; return block.length > 5000 && /pbStmtFiles/.test(block) && !/(?<![v\d.])\d[\d,]*\.\d{2}\b/.test(block) && !/\b\d{1,3},\d{3}\b/.test(block); })());

  ok('version bumped — APP_VER and the footer agree', /const APP_VER = 'v7\.(2[6-9]|[3-9]\d)'/.test(src) && new RegExp('<footer>' + (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1].replace('.', '\\.')).test(src));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
