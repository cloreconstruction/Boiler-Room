// v7.27 — Eric, the morning after v7.26: "i added my amex statement, when i pay my amex card how will it know those charges were
// already accounted for?" A card company's file counts a charge as plus; the payment shows on both sides. Every bank, account,
// store and figure here is made up; the dates are built from today.
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
    const us = d => `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`, iso = d => localDay(d);
    window._D = { us, iso, back };
    window._file = (name, text) => new File([text], name, { type: 'text/plain' });
    window._said = []; const t0 = window.toast; window.toast = (m, g) => { if (m) _said.push(String(m)); return t0(m, g); };
    window._tx = () => pb().tx;
    window._rowOf = re => [...document.querySelectorAll('#pbBank .pb-txrow')].find(r => re.test(r.textContent));
  });

  console.log('— 💳 (1) a card company\'s file: charges read as plus —');
  ok('an Amex-style CSV (Card Member · Account # · Appears On Your Statement As) is known by its own column names: the charges turn into money OUT, the payment into money in, the account remembers it is a card, the toast says so', await page.evaluate(async () => {
    const t = ['Date,Description,Card Member,Account #,Amount,Extended Details,Appears On Your Statement As,Category',
      `${_D.us(_D.back(1))},FRED MEYER SOLDOTNA,E CLORE,-21005,84.12,,FRED MEYER SOLDOTNA AK,Groceries`,
      `${_D.us(_D.back(2))},CHEVRON KENAI,E CLORE,-21005,61.40,,CHEVRON 0091,Gas`,
      `${_D.us(_D.back(3))},PAYMENT - THANK YOU,E CLORE,-21005,-300.00,,PAYMENT - THANK YOU,`].join('\n');
    _said.length = 0; await pbStmtFiles([_file('activity.csv', t)]);
    const tx = _tx(), fm = tx.find(x => /FRED MEYER/.test(x.desc)), pay = tx.find(x => /PAYMENT/.test(x.desc)), a = pb().accts['1005'];
    return tx.length === 3 && fm && fm.amt === -84.12 && fm.acct === '1005' && fm.k === '1005' && pay && pay.amt === 300 && a && a.flip === true && _said.some(m => /⇅ a card file: charges read as money out/.test(m));
  }), await page.evaluate(() => JSON.stringify({ tx: _tx(), accts: pb().accts, said: _said })));
  ok('a plain bank CSV is left as it is (money out minus) — and the account\'s ⇅ switch flips every line of THAT account, says so, remembers it for its next file, and flips back on a second tap', await page.evaluate(async () => {
    const t = ['Date,Description,Amount', `${_D.us(_D.back(2))},AMEX EPAYMENT ACH PMT,-300.00`, `${_D.us(_D.back(4))},THREE BEARS KENAI,-42.17`].join('\n');
    await pbStmtFiles([_file('checking.csv', t)]);
    const tb = () => _tx().find(x => /THREE BEARS/.test(x.desc)), fm = () => _tx().find(x => /FRED MEYER/.test(x.desc));
    const plain = tb().amt === -42.17 && tb().k === 'checking' && !pb().accts.checking.flip;
    const btn = [...document.querySelectorAll('#pbBank .pb-flip')].find(b => /checking/.test(b.closest('.pb-row').textContent));
    btn.click(); const flipped = tb().amt === 42.17 && fm().amt === -84.12 && pb().accts.checking.flip === true && _said.some(m => /⇅ checking: charges now read as money OUT — remembered/.test(m));
    await pbStmtFiles([_file('checking (2).csv', ['Date,Description,Amount', `${_D.us(_D.back(5))},SAFEWAY KENAI,-10.00`].join('\n'))]);
    const next = _tx().find(x => /SAFEWAY/.test(x.desc)).amt === 10 && _tx().find(x => /SAFEWAY/.test(x.desc)).k === 'checking';
    [...document.querySelectorAll('#pbBank .pb-flip')].find(b => /checking/.test(b.closest('.pb-row').textContent)).click();
    return plain && flipped && next && tb().amt === -42.17 && _tx().find(x => /SAFEWAY/.test(x.desc)).amt === -10 && !pb().accts.checking.flip;
  }), await page.evaluate(() => JSON.stringify({ tx: _tx().map(x => [x.desc, x.amt, x.k]), accts: pb().accts, said: _said.slice(-3) })));

  console.log('— ↔ (2) the payment on both sides —');
  ok('the card payment sits on both accounts (−$300 out of checking, +$300 into the card, two days apart): the checking line offers "↔ Same money on ···1005 … both are a transfer"', await page.evaluate(() => {
    const row = _rowOf(/AMEX EPAYMENT/), plate = row && row.querySelector('.pb-pair');
    return !!plate && /↔ Same money on ···1005/.test(plate.textContent) && /both are a transfer/.test(plate.textContent) && !_rowOf(/THREE BEARS/).querySelector('.pb-pair');
  }), await page.evaluate(() => (_rowOf(/AMEX EPAYMENT/) || {}).textContent));
  ok('one tap: BOTH lines are a Transfer, both stores are remembered, neither counts as spending', await page.evaluate(() => {
    _rowOf(/AMEX EPAYMENT/).querySelector('.pb-pair').click();
    const a = _tx().find(x => /AMEX EPAYMENT/.test(x.desc)), b = _tx().find(x => /PAYMENT - THANK YOU/.test(x.desc));
    return a.cat === 'Transfer' && b.cat === 'Transfer' && pb().storeCat['amex epayment ach pmt'] === 'Transfer' && pb().storeCat['payment - thank you'] === 'Transfer' && !pbSpendAll().some(x => /PAYMENT/.test(x.note)) && !_rowOf(/AMEX EPAYMENT/);
  }), await page.evaluate(() => JSON.stringify({ sc: pb().storeCat, spend: pbSpendAll().map(x => x.note) })));
  ok('next month\'s payment lines land already sorted as Transfer — both sides', await page.evaluate(async () => {
    await pbStmtFiles([_file('checking (3).csv', ['Date,Description,Amount', `${_D.us(_D.back(0))},AMEX EPAYMENT ACH PMT,-250.00`].join('\n'))]);
    await pbStmtFiles([_file('activity (2).csv', ['Date,Description,Card Member,Account #,Amount,Extended Details,Appears On Your Statement As,Category', `${_D.us(_D.back(0))},PAYMENT - THANK YOU,E CLORE,-21005,-250.00,,PAYMENT - THANK YOU,`].join('\n'))]);
    const a = _tx().filter(x => /AMEX EPAYMENT/.test(x.desc)), b = _tx().filter(x => /PAYMENT - THANK YOU/.test(x.desc));
    return a.length === 2 && a.every(x => x.cat === 'Transfer') && b.length === 2 && b.every(x => x.cat === 'Transfer' && x.amt > 0);
  }), await page.evaluate(() => JSON.stringify(_tx().map(x => [x.desc, x.amt, x.cat, x.k]))));
  ok('a sort is remembered money IN as well: payroll as Income once, and the next payroll line is Income on arrival', await page.evaluate(async () => {
    await pbStmtFiles([_file('checking (4).csv', ['Date,Description,Amount', `${_D.us(_D.back(6))},PAYROLL ACME CONST,1500.00`].join('\n'))]);
    pbTxCat(_tx().find(x => /PAYROLL/.test(x.desc)).id, 'Income');
    await pbStmtFiles([_file('checking (5).csv', ['Date,Description,Amount', `${_D.us(_D.back(7))},PAYROLL ACME CONST,1500.00`].join('\n'))]);
    const pr = _tx().filter(x => /PAYROLL/.test(x.desc));
    return pr.length === 2 && pr.every(x => x.cat === 'Income') && pb().storeCat['payroll acme const'] === 'Income';
  }), await page.evaluate(() => JSON.stringify(_tx().filter(x => /PAYROLL/.test(x.desc)))));
  ok('the card\'s charges count as spending once sorted (Groceries on the FRED MEYER charge), and the wall holds — no whole card number anywhere, the Wizard sees none of it', await page.evaluate(() => {
    pbTxCat(_tx().find(x => /FRED MEYER/.test(x.desc)).id, 'Groceries');
    const spent = pbSpendThisMonth().reduce((s, x) => s + x.amt, 0);
    return Math.round(spent * 100) === 8412 && !/21005/.test(JSON.stringify(prefs.pb)) && !/FRED MEYER|AMEX/.test(buildAskContext('what did I pay amex'));
  }), await page.evaluate(() => JSON.stringify(pbSpendThisMonth())));

  ok('version bumped — APP_VER and the footer agree', /const APP_VER = 'v7\.(2[7-9]|[3-9]\d)'/.test(src) && new RegExp('<footer>' + (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1].replace('.', '\\.')).test(src));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
