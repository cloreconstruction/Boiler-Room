// v7.30 — Eric: "i did the csv and this happened" (his credit union's CSV has no heading row and reads day · words · an empty
// cell · amount, so v7.26 read the words as the amount and a 22-digit card reference became forty-five dollars of zeros) …
// "i downloaded the ofx, fix this … make sure future ofx's will work. and maybe csv's too … maybe i can take it off and start
// from zero so that i don't have to sort tons of receipts." Every bank, account, store and figure here is made up; only the
// SHAPES are the bank's. The dates are built from today so the month checks hold.
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
    const dom = new Date().getDate(), back = n => { const d = new Date(); d.setDate(Math.max(1, dom - n)); return d; };
    const p2 = n => String(n).padStart(2, '0');
    const us = d => `${p2(d.getMonth() + 1)}/${p2(d.getDate())}/${d.getFullYear()}`, us2 = d => `${p2(d.getMonth() + 1)}/${p2(d.getDate())}/${String(d.getFullYear()).slice(2)}`, iso = d => localDay(d), ofx = d => iso(d).replace(/-/g, '');
    window._D = { us, us2, iso, ofx, back };
    window._file = (name, text) => new File([text], name, { type: 'text/plain' });
    window._said = []; const t0 = window.toast; window.toast = (m, g) => { if (m) _said.push(String(m)); return t0(m, g); };
    const u0 = window.toastUndo; window.toastUndo = (m, fn) => { if (m) _said.push(String(m)); return u0(m, fn); };   // an Undo toast is a toast too
    window._tx = () => pb().tx;
    // the credit union's lines — the words exactly the way that bank writes them, the stores and figures made up
    window._rows = () => [
      [back(1), 'DEBIT', '-31.10', `WITHDRAWAL DEBIT CARD PURCHASE SUBWAY 12345 SOLDOTNA AKDate ${us2(back(1))} PURCH 4029357733092526000012%% Card 12 34567%% MCC 5814`],
      [back(1), 'DEBIT', '-6.00', 'WITHDRAWAL ACH STASH CAPITAL (S TYPE: ACH CO: STASH CAPITAL (SNAME: SOMEBODY%% ACH Trace 123456789012345'],
      [back(1), 'DEBIT', '-6.00', 'WITHDRAWAL ACH STASH CAPITAL (S TYPE: ACH CO: STASH CAPITAL (SNAME: SOMEBODY%% ACH Trace 123456789012399'],
      [back(1), 'DEP', '2450.00', 'DEPOSIT ACH ACME BUILDERS TYPE: PAYROLL CO: ACME BUILDERS%% ACH Trace 123456789012346'],
      [back(2), 'XFER', '175.00', 'From Loan 12 '],
      [back(3), 'FEE', '-27.00', 'WITHDRAWAL FEE'],
      [back(3), 'POS', '-18.75', 'WITHDRAWAL POS 6259220556617 BILL\'S MINI MART SOLDOTNA AK%% Card 12 34567%% MCC 5411'],
      [back(4), 'DEBIT', '-8.99', `Recurring WITHDRAWAL DEBIT CARD PURCHASE STREAMCO 800-555-0100 CADate ${us2(back(4))} PURCH 4029357733092526000099%% Card 12 34567%% MCC 4899`],
      [back(5), 'ATM', '-101.00', 'WITHDRAWAL AT ATM #123400005678'],
      [back(5), 'DEBIT', '-31.10', `WITHDRAWAL DEBIT CARD PURCHASE SUBWAY 12345 SOLDOTNA AKDate ${us2(back(5))} PURCH 4029357733092526000042%% Card 12 34567%% MCC 5814`]];
    window._cuCsv = () => _rows().map(r => `${us(r[0])},${r[3]},,${r[2]}`).join('\r\n') + '\r\n';
    window._cuOfx = () => ['OFXHEADER:100', 'DATA:OFXSGML', 'VERSION:102', 'SECURITY:NONE', '', '<OFX>', '<BANKMSGSRSV1><STMTTRNRS><STMTRS><CURDEF>USD', '<BANKACCTFROM><BANKID>1234', '<ACCTID>0009999999-S70', '<ACCTTYPE>CHECKING', '</BANKACCTFROM><BANKTRANLIST>',
      ..._rows().map((r, i) => `<STMTTRN>\n<TRNTYPE>${r[1]}\n<DTPOSTED>${ofx(r[0])}120000\n<TRNAMT>${r[2]}\n<FITID>9000000000${p2(i)}\n<MEMO>${r[3]}\n</STMTTRN>`),
      '</BANKTRANLIST><LEDGERBAL><BALAMT>1234.56', `<DTASOF>${ofx(back(1))}120000`, '</LEDGERBAL></STMTRS></STMTTRNRS></BANKMSGSRSV1></OFX>'].join('\n');
    window._want = { 'SUBWAY 12345 SOLDOTNA AK': -31.1, 'STASH CAPITAL (S': -6, 'ACME BUILDERS': 2450, 'From Loan 12': 175, 'FEE': -27, 'BILL\'S MINI MART SOLDOTNA AK': -18.75, 'STREAMCO 800-555-0100 CA': -8.99, 'ATM #…': -101 };
    window._check = () => { const tx = _tx(); return Object.entries(_want).every(([desc, amt]) => tx.some(t => t.desc === desc && t.amt === amt)) && tx.every(t => Math.abs(t.amt) < 10000 && !/%%|PURCH|TYPE:|MCC|Trace/.test(t.desc)); };
  });

  console.log('— 🏦 (1) the credit union\'s CSV: no heading row, day · words · (empty) · amount —');
  ok('every line reads with the RIGHT amount and the store\'s words cleaned (SUBWAY 12345 SOLDOTNA AK · STASH CAPITAL (S · ACME BUILDERS · From Loan 12 · FEE · BILL\'S MINI MART · STREAMCO · ATM #…); nothing over ten thousand, no %% / PURCH / TYPE: noise; the toast counts ten', await page.evaluate(async () => {
    _said.length = 0; await pbStmtFiles([_file('EXPORT.CSV', _cuCsv())]);
    return _tx().length === 10 && _check() && _said.some(m => /🏦 10 lines read from EXPORT\.CSV · 10 new · 0 already here · 10 to sort/.test(m));
  }), await page.evaluate(() => JSON.stringify({ tx: _tx().map(t => [t.d, t.amt, t.desc]), said: _said })));
  ok('the two identical STASH lines of one day are two lines (their place among identical lines tells them apart), and the second SUBWAY day is its own line', await page.evaluate(() => _tx().filter(t => t.desc === 'STASH CAPITAL (S').length === 2 && _tx().filter(t => t.desc === 'SUBWAY 12345 SOLDOTNA AK').length === 2));
  ok('a figure the size of a card reference is never money: pbAmtOf refuses it; a heading-row CSV whose Amount cell holds one reads no line rather than a wrong one', await page.evaluate(async () => {
    const n = _tx().length; _said.length = 0;
    await pbStmtFiles([_file('odd.csv', `Date,Description,Amount\n${_D.us(_D.back(1))},SOME STORE,4029357733092526000012\n`)]);
    return pbAmtOf('4029357733092526000012') === null && pbAmtOf('-31.10') === -31.1 && pbMoneyCell('1052') === 1052 && pbMoneyCell('WITHDRAWAL X') === null && !PB_MONEY_RE.test('09/25/2026') && _tx().length === n && _said.some(m => /odd\.csv: nothing in it I could read/.test(m));
  }), await page.evaluate(() => JSON.stringify(_said)));
  ok('other no-heading shapes still read: day · amount · * · (empty) · words (v7.26\'s), day · words · check number · amount (the signed figure beats the bare number), day · words · amount · balance (the second money cell is the balance)', await page.evaluate(async () => {
    const n = _tx().length;
    await pbStmtFiles([_file('shapes.csv', [`"${_D.us(_D.back(6))}","-33.10","*","","CHEVRON 0091 KENAI AK"`, `${_D.us(_D.back(7))},CHECK TO THE PLUMBER,1052,-200.00`, `${_D.us(_D.back(8))},MOBILE DEPOSIT,250.00,1500.25`].join('\n'))]);
    const tx = _tx(), a = pb().accts['shapes'];
    return tx.length === n + 3 && tx.some(t => t.amt === -33.1 && t.desc === 'CHEVRON 0091 KENAI AK') && tx.some(t => t.amt === -200 && t.desc === 'CHECK TO THE PLUMBER') && tx.some(t => t.amt === 250 && t.desc === 'MOBILE DEPOSIT') && a && a.bal === 1500.25;
  }), await page.evaluate(() => JSON.stringify({ tx: _tx().map(t => [t.d, t.amt, t.desc]), accts: pb().accts })));

  console.log('— 📄 (2) the OFX: the bank\'s own ids, the account by its share tag, the same lines as the CSV —');
  ok('the OFX dropped AFTER the CSV adds nothing — 10 already here (one line, two files); the account is S70 (the share tag — the member number appears nowhere), the ledger balance rides along as of its day', await page.evaluate(async () => {
    _said.length = 0; const n = _tx().length; await pbStmtFiles([_file('EXPORT.OFX', _cuOfx())]);
    const a = pb().accts['S70'];
    return _tx().length === n && _said.some(m => /10 lines read from EXPORT\.OFX · 0 new · 10 already here/.test(m)) && a && a.last4 === 'S70' && a.bal === 1234.56 && a.balAt === _D.iso(_D.back(1)) && !/9999999/.test(JSON.stringify(prefs.pb)) &&
      pbAcctTag('0009999999-S70') === 'S70' && pbAcctTag('000123456789') === '6789' && pbAcctTag('XXXX-XXXXXX-71005') === '1005' && pbAcctShow('1005') === '···1005' && pbAcctShow('S70') === 'S70';
  }), await page.evaluate(() => JSON.stringify({ n: _tx().length, said: _said, accts: pb().accts })));
  ok('the ACCOUNTS row reads S70, not ···S70', await page.evaluate(() => { const t = $('pbBank').textContent; return /S70/.test(t) && !/···S70/.test(t); }));
  ok('fresh: the OFX first reads all ten (ids S70:<the bank\'s id>, the words cleaned the same way), and the CSV dropped after it adds nothing', await page.evaluate(async () => {
    prefs.pb = {}; openPanel('budget'); _said.length = 0;
    await pbStmtFiles([_file('EXPORT.OFX', _cuOfx())]);
    const first = _tx().length === 10 && _check() && _tx().every(t => /^S70:9000000000\d\d$/.test(t.id) && t.acct === 'S70') && _said.some(m => /10 lines read from EXPORT\.OFX · 10 new · 0 already here · 10 to sort/.test(m));
    await pbStmtFiles([_file('EXPORT.CSV', _cuCsv())]);
    return first && _tx().length === 10 && _said.some(m => /10 lines read from EXPORT\.CSV · 0 new · 10 already here/.test(m));
  }), await page.evaluate(() => JSON.stringify({ tx: _tx().map(t => [t.id, t.d, t.amt, t.desc]), said: _said })));
  ok('the memo cleaner cuts only the bank\'s own tails and prefixes: plain words stay as written, a bare DEPOSIT stays DEPOSIT', await page.evaluate(() =>
    pbMemoClean('FRED MEYER #0123 SOLDOTNA AK') === 'FRED MEYER #0123 SOLDOTNA AK' && pbMemoClean('DEPOSIT') === 'DEPOSIT' && pbMemoClean('MOBILE DEPOSIT') === 'MOBILE DEPOSIT' && pbMemoClean('HOME STORE — HOME STORE SOLDOTNA') === 'HOME STORE — HOME STORE SOLDOTNA' &&
    pbMemoClean('WITHDRAWAL ACH AMAZON MARKETPLA TYPE: WEB CO: AMAZON MARKETPLA%% ACH Trace 1') === 'AMAZON MARKETPLA' && pbMemoClean('WITHDRAWAL POS 6259 THE STORE%% Card 1') === 'THE STORE'));

  console.log('— 🤷 (3) a line he cannot place; start from zero —');
  ok('every wheel offers 🤷 Don\'t remember — take it off; picking it takes that line off with an Undo and learns nothing about the store', await page.evaluate(async () => {
    const opt = document.querySelector('#pbBank .pb-txsel option[value="__off"]');
    const t = _tx().find(x => x.desc === 'FEE'), n = _tx().length; _said.length = 0;
    pbTxCat(t.id, '__off');
    const gone = _tx().length === n - 1 && !_tx().some(x => x.desc === 'FEE') && !Object.keys(pb().storeCat).length && _said.some(m => /line taken off/.test(m));
    const u = [...document.querySelectorAll('button')].find(b => /Undo/i.test(b.textContent) && b.offsetParent); if (u) u.click(); await new Promise(r => setTimeout(r, 50));
    return !!opt && /Don't remember — take it off/.test(opt.textContent) && gone && !!u && _tx().length === n && _tx().some(x => x.desc === 'FEE');
  }), await page.evaluate(() => JSON.stringify({ n: _tx().length, said: _said, sc: pb().storeCat })));
  ok('🧹 Start from zero: the plate names the count; the first tap only ARMS it (⚠ SURE? in words, the armed edge); the second takes every bank line off; Undo brings all ten back; the account, its balance and a sorted store stay', await page.evaluate(async () => {
    pbTxCat(_tx().find(x => x.desc === 'ACME BUILDERS').id, 'Income');
    const plate = () => document.querySelector('#pbBank .pb-zero');
    const before = plate() && /Start from zero — take all 10 bank lines off/.test(plate().textContent);
    pbTxZero(); const armed = plate() && /⚠ SURE\? Tap again — all 10 bank lines come off/.test(plate().textContent) && plate().classList.contains('armed') && _tx().length === 10;
    _said.length = 0; pbTxZero();
    const gone = _tx().length === 0 && !plate() && _said.some(m => /🧹 10 bank lines taken off — starting from zero/.test(m)) && pb().accts['S70'] && pb().accts['S70'].bal === 1234.56 && pb().storeCat['acme builders'] === 'Income';
    const u = [...document.querySelectorAll('button')].find(b => /Undo/i.test(b.textContent) && b.offsetParent); if (u) u.click(); await new Promise(r => setTimeout(r, 50));
    return before && armed && gone && !!u && _tx().length === 10 && _tx().find(x => x.desc === 'ACME BUILDERS').cat === 'Income';
  }), await page.evaluate(() => JSON.stringify({ n: _tx().length, said: _said, plate: (document.querySelector('#pbBank .pb-zero') || {}).textContent })));
  ok('an armed plate lets go by itself after four seconds with nothing changed', await page.evaluate(async () => {
    pbTxZero(); const armed = document.querySelector('#pbBank .pb-zero').classList.contains('armed');
    await new Promise(r => setTimeout(r, 4300));
    return armed && !document.querySelector('#pbBank .pb-zero').classList.contains('armed') && _tx().length === 10;
  }));
  ok('nothing runs off the side of the phone', await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth));

  console.log('— 🔒 (4) the wall —');
  ok('no figure sits in the budget block of the code (the numbers here are the test\'s own), and the new words are in it', (() => { const a = src.indexOf('v6.84 — THE PERSONAL BUDGET ====='), b = src.indexOf('v6.79 — THE BOARD =====', a); const block = a > 0 && b > a ? src.slice(a, b) : ''; return block.length > 5000 && /pbMemoClean/.test(block) && /pbTxZero/.test(block) && !/(?<![v\d.])\d[\d,]*\.\d{2}\b/.test(block) && !/\b\d{1,3},\d{3}\b/.test(block); })());
  ok('version bumped — APP_VER and the footer agree', /const APP_VER = 'v7\.(30|3[1-9]|[4-9]\d)'/.test(src) && new RegExp('<footer>' + (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1].replace('.', '\\.')).test(src));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
