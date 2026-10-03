// v7.83 — 🏦 THE ACCOUNTS BY WHAT THEY ARE FOR. Eric, the night he dropped all four Relay statements: "relay accounts, for the
// charts, [one] is receiving, [one] is opex, [one] is business savings …, [one] is federal tax savings". The charts knew an account
// only by its last four: SAVINGS GROWTH drew whichever came first (or the one the wheel was last left on) and the money charts read
// "the bank" off the first account that was not that one. Now each account wears ONE of four roles by his tap under 📥 STATEMENTS,
// and the charts read by role: savings growth from the Business savings, money in from Receiving, money out from OPEX — without the
// money that only moved between his own accounts. EVERY account number, name and figure here is made up; the statements are built
// in the bank's own shape ("<the other side> — <the memo>") and dated from today.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { fileURLToPath } = require('url');
(async () => {
  const appUrl = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const repo = path.dirname(fileURLToPath(appUrl));
  const src = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const errs = [];
  const open = async (init, vp) => { const c = await browser.newContext(vp || { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }); await c.route(u => !/^file:/.test(u.href), r => r.abort()); if (init) await c.addInitScript(init); const p = await c.newPage(); p.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); }); await p.goto(appUrl); await p.waitForTimeout(700); return { ctx: c, page: p }; };
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };

  // the made-up bank: four accounts, each line "<the other side> — <the memo>", days counted back from today
  const seed = () => {
    window.scheduleSave = () => { window._saves = (window._saves || 0) + 1; }; window.savePendingSoon = () => {};
    entries = []; todos = []; jobs = ['Oak House']; crew = ['Phil']; nextId = 100; renderJobSelects(); closePanels(); renderAll();
    dbx.refreshToken = 'tok'; window._up = {}; window.dbxUpload = async (p, body) => { _up[p] = body; return { path_display: p }; }; window.dbxDownload = async p => (_up[p] != null ? _up[p] : null);
    lsSet('daylog-bizbank', ''); _biz = null; prefs.bizSav = ''; prefs.bizFrom = '';
    window._said = []; const t0 = window.toast; window.toast = (m, g) => { _said.push(String(m)); return t0(m, g); };
    const day = n => { const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() - n); return d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0'); };
    const ofx = (acct, lines, bal, balDay) => 'OFXHEADER:100\n<OFX><BANKMSGSRSV1><STMTTRNRS><STMTRS><BANKACCTFROM><ACCTID>' + acct + '</BANKACCTFROM><BANKTRANLIST>' +
      lines.map((l, i) => `<STMTTRN><TRNTYPE>${l[1] > 0 ? 'CREDIT' : 'DEBIT'}<DTPOSTED>${day(l[0])}<TRNAMT>${l[1].toFixed(2)}<FITID>${acct}-${i}<NAME>${l[2]}<MEMO>${l[3]}</STMTTRN>`).join('') + '</BANKTRANLIST>' +
      (bal != null ? `<LEDGERBAL><BALAMT>${bal.toFixed(2)}<DTASOF>${day(balDay)}</LEDGERBAL>` : '') + '</STMTRS></STMTTRNRS></BANKMSGSRSV1></OFX>';
    const AUTO = 'Transfer automation: Receiving Auto Transfer';
    window.FILES = {
      recv: ofx('000111227001', [
        [40, 10000, 'Oak House LLC', 'Invoice 12 payment'], [40, -9400, '8101 - OPEX 7002', AUTO], [40, -250, '8102 Business Savings 7003', AUTO], [40, -350, '8103 Fed Tax Savings 7004', AUTO],
        [20, 4000, 'Pine Cabin Co', 'Deposit'], [20, -3760, '8101 - OPEX 7002', 'Instant auto transfer'], [20, -100, '8102 Business Savings 7003', 'Instant auto transfer'], [20, -140, '8103 Fed Tax Savings 7004', 'Instant auto transfer'],
        [10, 500, '8101 - OPEX 7002', 'Transfer'],          // money coming BACK from OPEX — his own, not income
        [5, 77, 'Check 7002', 'deposit']]),                  // a cheque whose number happens to be another account's last four — nothing on that account matches it
      opex: ofx('000111227002', [
        [40, 9400, '8100 - Receiving 7001', AUTO], [38, -2100, 'Lumber Yard', 'card'], [35, -3000, 'Payroll Co', 'payroll'], [20, 3760, '8100 - Receiving 7001', 'Instant auto transfer'],
        [18, -900, 'Business Savings', 'gc fee xfer to bus sav'],   // an older line: the other account by NAME alone — and the same money is on that account
        [10, -500, '8100 - Receiving 7001', 'Transfer'], [8, -120.5, 'Fuel Stop', 'card'],
        [6, -400, 'Fed Tax Savings', 'quarterly'],
        [3, -55, 'Business Savings', 'a fee refunded']]),    // the same NAME, but no such money on that account — it was really paid out
      sav: ofx('000111227003', [[40, 250, '8100 - Receiving 7001', AUTO], [20, 100, '8100 - Receiving 7001', 'Instant auto transfer'], [18, 900, 'OPEX', 'gc fee xfer to bus sav'], [15, 1.25, 'Relay', 'Interest']], 1251.25, 15),
      tax: ofx('000111227004', [[40, 350, '8100 - Receiving 7001', AUTO], [20, 140, '8100 - Receiving 7001', 'Instant auto transfer'], [6, 400, 'OPEX', 'quarterly']]) };
    window.file = (txt, name) => new File([txt], name, { type: 'application/x-ofx' });
    window.sumOf = key => Math.round(bizItems(key).reduce((s, x) => s + x.v, 0) * 100) / 100;
    window.acctRow = k => document.querySelector(`#bizBox .biz-acct[data-acct="${k}"]`);
    window.plate = (k, r) => acctRow(k) && acctRow(k).querySelector(`.biz-role[data-role="${r}"]`);
  };

  console.log('— 🏦 Eric\'s phone —');
  const eric = await open();
  const page = eric.page;
  await page.evaluate(seed);

  ok('four statements dropped at once land as four accounts, each its last four; the toast asks what the account is', await page.evaluate(async () => {
    openSavings();
    await bizStmtFiles([file(FILES.recv, 'Relay 2026 #7001.ofx'), file(FILES.opex, 'Relay 2026 #7002.ofx'), file(FILES.sav, 'Relay 2026 #7003.ofx'), file(FILES.tax, 'Relay 2026 #7004.ofx')]);
    const S = bizStore();
    return Object.keys(S.accts).join(',') === '7001,7002,7003,7004' && S.accts['7001'].lines.length === 10 && S.accts['7002'].lines.length === 9 && S.accts['7003'].lines.length === 4 && S.accts['7004'].lines.length === 3 &&
      _said.filter(m => /say what this account is under 📥 STATEMENTS/.test(m)).length === 4;
  }), await page.evaluate(() => JSON.stringify({ k: Object.keys(bizStore().accts), said: _said.slice(-4) })));

  ok('under every account: four plates — 📥 Receiving · 💳 OPEX · 🏦 Business savings · 🏛 Tax savings — none lit (○, a dashed edge, not pressed), and a line says to tap what each account is', await page.evaluate(() => {
    const ps = [...document.querySelectorAll('#bizBox .biz-role')], say = (document.querySelector('#bizBox .biz-role-say') || {}).textContent || '';
    return ps.length === 16 && ps.every(p => p.getAttribute('aria-pressed') === 'false' && !p.classList.contains('sel') && /^○ /.test(p.textContent.trim()) && getComputedStyle(p).borderTopStyle === 'dashed') &&
      [...acctRow('7001').querySelectorAll('.biz-role')].map(p => p.textContent.trim()).join(' | ') === '○ 📥 Receiving | ○ 💳 OPEX | ○ 🏦 Business savings | ○ 🏛 Tax savings' && /^👇 Tap what each account is\./.test(say);
  }), await page.evaluate(() => (document.querySelector('#bizBox .biz-role-say') || {}).textContent));

  ok('(the fault he met: with no account named, SAVINGS GROWTH draws the first account — and a wheel left on another account keeps it there)', await page.evaluate(() => {
    const first = bizSavAcct(); prefs.bizSav = '7002'; const pinned = bizSavAcct();
    return first === '7001' && pinned === '7002';
  }));

  await page.evaluate(() => { renderBusiness(); _said.length = 0; });
  await page.click('#bizBox .biz-acct[data-acct="7003"] .biz-role[data-role="sav"]');
  ok('a tap on 🏦 Business savings under ···7003: the plate is lit — ✓, its word in capitals, a solid edge, pressed — and the toast says what it means', await page.evaluate(() => {
    const p = plate('7003', 'sav');
    return p.getAttribute('aria-pressed') === 'true' && p.classList.contains('sel') && p.textContent.trim() === '✓ 🏦 BUSINESS SAVINGS' && getComputedStyle(p).borderTopStyle === 'solid' &&
      [...acctRow('7003').querySelectorAll('.biz-role')].filter(x => x.classList.contains('sel')).length === 1 && _said.some(m => m === '🏦 ···7003 is Business savings — the savings the growth chart reads');
  }), await page.evaluate(() => JSON.stringify(_said)));
  ok('SAVINGS GROWTH now reads that account — though the wheel was left on another one — and it is called by what it is for everywhere it is shown', await page.evaluate(() => {
    const t = $('revBox').textContent.replace(/\s+/g, ' ');
    return bizSavAcct() === '7003' && prefs.bizSav === '7002' && /SAVINGS GROWTH — Business savings ···7003/.test(t) && bizAcctWord('7003') === 'Business savings ···7003' && acctRow('7003').querySelector('b').textContent === 'Business savings ···7003' &&
      [...document.querySelectorAll('#bizBox select[aria-label="which account is the savings"] option')].find(o => o.selected).textContent === 'chart: Business savings ···7003';
  }), await page.evaluate(() => $('revBox').textContent.replace(/\s+/g, ' ').slice(0, 200)));

  await page.click('#bizBox .biz-acct[data-acct="7001"] .biz-role[data-role="recv"]');
  await page.click('#bizBox .biz-acct[data-acct="7002"] .biz-role[data-role="opex"]');
  await page.click('#bizBox .biz-acct[data-acct="7004"] .biz-role[data-role="tax"]');
  ok('the other three named the same way; the line over the accounts lists which is which, and ⚙ Setup names them too', await page.evaluate(() => {
    const say = document.querySelector('#bizBox .biz-role-say').textContent.trim();
    bizSetupWord();
    return say === '📥 Receiving = ···7001 · 💳 OPEX = ···7002 · 🏦 Business savings = ···7003 · 🏛 Tax savings = ···7004' &&
      /Receiving ···7001: 10 lines/.test($('bizSetupMsg').textContent) && /OPEX ···7002: 9 lines/.test($('bizSetupMsg').textContent) && /Tax savings ···7004: 3 lines/.test($('bizSetupMsg').textContent);
  }), await page.evaluate(() => document.querySelector('#bizBox .biz-role-say').textContent + ' // ' + $('bizSetupMsg').textContent));

  ok('one account a role: 🏦 Business savings tapped under another account MOVES there (the toast says where it was); tapped back, it returns', await (async () => {
    await page.evaluate(() => { _said.length = 0; });
    await page.click('#bizBox .biz-acct[data-acct="7004"] .biz-role[data-role="sav"]');
    const moved = await page.evaluate(() => ({ a: bizStore().accts['7003'].role, b: bizStore().accts['7004'].role, n: document.querySelectorAll('#bizBox .biz-role.sel[data-role="sav"]').length, said: _said.slice() }));
    await page.click('#bizBox .biz-acct[data-acct="7003"] .biz-role[data-role="sav"]');
    await page.click('#bizBox .biz-acct[data-acct="7004"] .biz-role[data-role="tax"]');
    const back = await page.evaluate(() => Object.values(bizStore().accts).map(a => a.role).join(','));
    return moved.a === '' && moved.b === 'sav' && moved.n === 1 && moved.said.some(m => /^🏦 ···7004 is Business savings — .*\(it was on ···7003\)$/.test(m)) && back === 'recv,opex,sav,tax';
  })(), await page.evaluate(() => JSON.stringify(Object.values(bizStore().accts).map(a => a.role))));
  ok('the same plate again takes the role off (and the account goes back to its bare last four); once more puts it back', await (async () => {
    await page.evaluate(() => { _said.length = 0; });
    await page.click('#bizBox .biz-acct[data-acct="7004"] .biz-role[data-role="tax"]');
    const off = await page.evaluate(() => ({ r: bizStore().accts['7004'].role, w: bizAcctWord('7004'), said: _said.slice(), p: plate('7004', 'tax').textContent.trim() }));
    await page.click('#bizBox .biz-acct[data-acct="7004"] .biz-role[data-role="tax"]');
    return off.r === '' && off.w === '···7004' && off.p === '○ 🏛 Tax savings' && off.said.some(m => m === '🏛 ···7004 is no longer marked Tax savings') && await page.evaluate(() => bizStore().accts['7004'].role === 'tax');
  })());
  ok('his own name for an account still wins over the role\'s word — and an emptied box gives the role\'s word back', await page.evaluate(() => {
    bizAcctName('7002', 'Bills'); const named = bizAcctWord('7002'); bizAcctName('7002', '');
    return named === 'Bills ···7002' && bizAcctWord('7002') === 'OPEX ···7002';
  }));

  ok('it is saved on the account in his own business-bank.json — the role and its own clock — and nothing else about the account changed', await page.evaluate(async () => {
    await bizSaveNow();
    const j = JSON.parse(_up[BIZ_PATH()]);
    return Object.keys(j.accts).map(k => j.accts[k].role).join(',') === 'recv,opex,sav,tax' && Object.values(j.accts).every(a => /^\d{4}-\d\d-\d\dT/.test(a.roleAt || '')) && j.accts['7001'].lines.length === 10 && j.accts['7003'].bal === 1251.25;
  }));

  console.log('— the savings window —');
  ok('the wheel still looks at another account for now (the title follows), without changing what the savings is — and the window opens on the Business savings again next time', await page.evaluate(() => {
    const sel = document.querySelector('#bizBox select[aria-label="which account is the savings"]');
    sel.value = '7004'; sel.dispatchEvent(new Event('change'));
    const t1 = $('revBox').textContent.replace(/\s+/g, ' '), look = bizSavAcct(), pref = prefs.bizSav, role = bizRoleAcct('sav');
    bizClose(); openSavings();
    return look === '7004' && /SAVINGS GROWTH — Tax savings ···7004/.test(t1) && pref === '7002' && role === '7003' && bizSavAcct() === '7003' && /SAVINGS GROWTH — Business savings ···7003/.test($('revBox').textContent.replace(/\s+/g, ' '));
  }));
  ok('the chart itself is the Business savings\' own: its deposits by month and the balance the statement printed', await page.evaluate(() => {
    const s = bizSeries(bizSavAcct(), ''); const added = Math.round(s.rows.reduce((n, r) => n + r.added, 0) * 100) / 100;
    return s.k === '7003' && added === 1251.25 && s.rows[s.rows.length - 1].actual === 1251.25 && !!document.querySelector('#bizBox .biz-chart');
  }), await page.evaluate(() => JSON.stringify(bizSeries(bizSavAcct(), '').rows)));

  console.log('— the money charts —');
  await page.evaluate(() => { bizClose(); openMoneyCharts(); });
  await page.waitForTimeout(300);
  await page.evaluate(() => { _bizSel = new Set(['bankin', 'bankout']); _bizSpan = 'month'; renderBusiness(); });
  ok('🏦 Into the bank is what came into RECEIVING — the customers\' money and the cheque — without the money that came back from his own OPEX account', await page.evaluate(() => {
    const it = bizItems('bankin');
    return sumOf('bankin') === 14077 && it.length === 3 && it.some(x => /^Check 7002/.test(x.name)) && !it.some(x => /OPEX 7002 — Transfer$/.test(x.name));
  }), await page.evaluate(() => JSON.stringify(bizItems('bankin'))));
  ok('🏦 Out of the bank is what left OPEX to anyone else: the transfers to his own accounts are out of it — the numbered one, and the two older ones the bank named by the account\'s name alone', await page.evaluate(() => {
    const it = bizItems('bankout'), names = it.map(x => x.name);
    return sumOf('bankout') === 5275.5 && it.length === 4 && names.some(n => /^Lumber Yard/.test(n)) && names.some(n => /^Payroll Co/.test(n)) && names.some(n => /^Fuel Stop/.test(n)) &&
      !names.some(n => /gc fee xfer/.test(n)) && !names.some(n => /quarterly/.test(n)) && !names.some(n => /Receiving 7001/.test(n));
  }), await page.evaluate(() => JSON.stringify(bizItems('bankout'))));
  ok('…but a line that only NAMES one of his accounts, with no such money on that account, was really paid — it stays in (and so does the cheque whose number matched)', await page.evaluate(() =>
    bizItems('bankout').some(x => /a fee refunded/.test(x.name) && x.v === 55) && bizItems('bankin').some(x => /^Check 7002/.test(x.name) && x.v === 77) &&
    bizOwnXfer('7002', bizStore().accts['7002'].lines.find(l => /a fee refunded/.test(l.desc))) === '' && bizOwnXfer('7002', bizStore().accts['7002'].lines.find(l => /gc fee xfer/.test(l.desc))) === '7003'));
  ok('the line under the chart says which account each reads and how many lines were left out; the "which bank account" wheel is gone — the roles decide', await page.evaluate(() => {
    const t = $('revBox').textContent.replace(/\s+/g, ' ');
    return /the bank: in = Receiving ···7001 · out = OPEX ···7002 — money moved between your own accounts is left out \(4 lines\)/.test(t) && !document.querySelector('#bizBox select[aria-label="which bank account"]') && !/pick another below/.test(t);
  }), await page.evaluate(() => $('revBox').textContent.replace(/\s+/g, ' ').match(/the bank:[^·]*·[^·]*/)));
  ok('two more plates are offered now that those accounts are named — 🏦 Into savings and 🏛 Into tax savings — and each adds its line to the chart', await (async () => {
    const offered = await page.evaluate(() => [...document.querySelectorAll('#bizBox .biz-srcs .pick-chip')].map(b => b.textContent.trim()));
    await page.evaluate(() => { bizSrcToggle('banksav'); bizSrcToggle('banktax'); });
    return offered.includes('🏦 Into savings') && offered.includes('🏛 Into tax savings') && await page.evaluate(() => sumOf('banksav') === 1251.25 && sumOf('banktax') === 890 && bizSel().has('banksav') && bizSel().has('banktax') &&
      /Into savings/.test(document.querySelector('#bizBox .biz-legend, #bizBox').textContent) && document.querySelectorAll('#bizBox .biz-mark').length > 0);
  })(), await page.evaluate(() => JSON.stringify([sumOf('banksav'), sumOf('banktax')])));
  ok('a deposit he marks ⇄ parked on the savings chart leaves 🏦 Into savings too — the two agree', await page.evaluate(() => {
    const a = bizStore().accts['7003'], l = a.lines.find(x => x.amt === 900);
    bizMarkSet('7003', l.id, 'parked'); const without = sumOf('banksav'); bizMarkSet('7003', l.id, 'parked');
    return without === 351.25 && sumOf('banksav') === 1251.25;
  }));
  ok('take the Tax savings role off and its plate — and its line on the chart — go; put it back and the plate returns', await page.evaluate(() => {
    bizRoleSet('7004', 'tax');
    const gone = ![...document.querySelectorAll('#bizBox .biz-srcs .pick-chip')].some(b => /Into tax savings/.test(b.textContent)) && !bizSel().has('banktax');
    bizRoleSet('7004', 'tax');
    return gone && [...document.querySelectorAll('#bizBox .biz-srcs .pick-chip')].some(b => /Into tax savings/.test(b.textContent));
  }));
  ok('with NO account named Receiving or OPEX the charts read as they always did: one account by the wheel, every line — transfers too — and the old words', await page.evaluate(() => {
    bizRoleSet('7001', 'recv'); bizRoleSet('7002', 'opex');   // both off
    const t = $('revBox').textContent.replace(/\s+/g, ' '), wheel = !!document.querySelector('#bizBox select[aria-label="which bank account"]');
    const inAll = sumOf('bankin'), outAll = sumOf('bankout'), acct = bizBankAcct();
    bizRoleSet('7001', 'recv'); bizRoleSet('7002', 'opex');   // and on again
    return acct === '7001' && wheel && inAll === 14577 && outAll === 14000 && /the bank: ···7001 \(pick another below\)/.test(t) && /say what each account is under 🏦 Savings growth → 📥 STATEMENTS/.test(t) && sumOf('bankin') === 14077;
  }), await page.evaluate(() => JSON.stringify([sumOf('bankin'), sumOf('bankout')])));
  ok('? how this works says it in his words', await page.evaluate(() => { _bizHelp = true; renderBusiness(); const t = $('revBox').textContent; _bizHelp = false; renderBusiness();
    return /"into" is what came into Receiving and "out" is what left OPEX/.test(t) && /money that only moved between your own accounts is left out/.test(t); }));

  console.log('— two devices —');
  ok('a role said here is not lost to a NEWER copy of the account from another device that never heard of it (a statement dropped there since)', await page.evaluate(async () => {
    await bizSaveNow();
    const j = JSON.parse(_up[BIZ_PATH()]); const a = j.accts['7001']; delete a.role; delete a.roleAt; a.touch = new Date(Date.now() + 60000).toISOString(); a.name = 'From the other device';
    _up[BIZ_PATH()] = JSON.stringify(j);
    await bizLoad();
    const got = bizStore().accts['7001'];
    return got.name === 'From the other device' && got.role === 'recv';
  }));
  ok('…and a role said LATER on the other device wins here, even over this device\'s newer copy of the account', await page.evaluate(async () => {
    const mine = bizStore().accts['7004']; mine.touch = new Date(Date.now() + 120000).toISOString();
    const j = JSON.parse(_up[BIZ_PATH()]); j.accts['7004'].role = ''; j.accts['7004'].roleAt = new Date(Date.now() + 180000).toISOString(); j.accts['7004'].touch = '2026-01-01T00:00:00.000Z';
    _up[BIZ_PATH()] = JSON.stringify(j);
    await bizLoad();
    const off = bizStore().accts['7004'].role === '';
    bizRoleSet('7004', 'tax');   // (his tap here, later still, puts it back)
    return off && bizStore().accts['7004'].role === 'tax';
  }));
  ok('a save keeps a role the file gained since this device last read it — and where two accounts end up with the same role, the newer tap stands', await page.evaluate(async () => {
    const S = bizStore(); S.accts['7002'].role = ''; S.accts['7002'].roleAt = '';   // this device never heard OPEX was named
    const j = JSON.parse(_up[BIZ_PATH()]); j.accts['7002'].role = 'opex'; j.accts['7002'].roleAt = new Date().toISOString();
    j.accts['7001'].role = 'sav'; j.accts['7001'].roleAt = '2026-01-01T00:00:00.000Z';   // an OLDER word on the file about another account: it must not take the savings from 7003
    _up[BIZ_PATH()] = JSON.stringify(j);
    await bizSaveNow();
    const out = JSON.parse(_up[BIZ_PATH()]);
    return out.accts['7002'].role === 'opex' && out.accts['7003'].role === 'sav' && out.accts['7001'].role === 'recv' && Object.values(out.accts).filter(a => a.role === 'sav').length === 1;
  }), await page.evaluate(() => JSON.stringify(Object.values(JSON.parse(_up[BIZ_PATH()]).accts).map(a => a.role))));

  console.log('— how it sits —');
  ok('at 390px the four plates sit two across, each takes a thumb (40px or more), and nothing runs off the side', await page.evaluate(() => {
    bizClose(); openSavings();
    const ps = [...acctRow('7001').querySelectorAll('.biz-role')].map(p => p.getBoundingClientRect()), tops = new Set(ps.map(r => Math.round(r.top)));
    return tops.size === 2 && ps.every(r => r.height >= 40 && r.width >= 120) && $('revBox').scrollWidth <= $('revBox').clientWidth + 1 && document.documentElement.scrollWidth <= document.documentElement.clientWidth;
  }), await page.evaluate(() => JSON.stringify([...acctRow('7001').querySelectorAll('.biz-role')].map(p => { const r = p.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)]; }))));
  ok('his own 👁 crew preview changes nothing here: a role tap is refused', await page.evaluate(() => { const was = crewPreview; crewPreview = true; const r0 = bizStore().accts['7001'].role; bizRoleSet('7001', 'tax'); const same = bizStore().accts['7001'].role === r0; crewPreview = was; return same; }));

  console.log('— 🖥 a PC —');
  const pc = await open(null, { viewport: { width: 1280, height: 900 } });
  await pc.page.evaluate(seed);
  ok('on a PC the four plates sit on one line under the account', await pc.page.evaluate(async () => {
    openSavings(); await bizStmtFiles([file(FILES.sav, 'Relay 2026 #7003.ofx')]);
    const ps = [...acctRow('7003').querySelectorAll('.biz-role')].map(p => p.getBoundingClientRect());
    return ps.length === 4 && new Set(ps.map(r => Math.round(r.top))).size === 1;
  }));
  ok('one account alone, named 🏦 Business savings: the chart reads it and the money charts offer 🏦 Into savings', await pc.page.evaluate(async () => {
    bizRoleSet('7003', 'sav'); const chart = bizSavAcct() === '7003';
    bizClose(); openMoneyCharts(); await new Promise(r => setTimeout(r, 200)); renderBusiness();
    return chart && [...document.querySelectorAll('#bizBox .biz-srcs .pick-chip')].some(b => /Into savings/.test(b.textContent)) && ![...document.querySelectorAll('#bizBox .biz-srcs .pick-chip')].some(b => /Into tax savings/.test(b.textContent));
  }));

  console.log('— 👷 a crew phone —');
  const phil = await open(() => { try { localStorage.setItem('daylog-crew-name', 'Phil'); localStorage.setItem('daylog-crew-root', '/Phil'); localStorage.setItem('daylog-crew-jobs', JSON.stringify(['Oak House'])); } catch (e) {} });
  ok('a crew phone has none of it: no Business window, and a role cannot be set there', await phil.page.evaluate(() => {
    _biz = { v: 1, accts: { '7001': { last4: '7001', name: '', lines: [], bal: null, balAt: '', file: '' } }, marks: {} };
    bizRoleSet('7001', 'recv'); openSavings();
    return CREW_NAME === 'Phil' && !_biz.accts['7001'].role && !$('revModal').classList.contains('show') && !document.querySelector('.biz-role');
  }));

  console.log('— the wall —');
  const blk = (src.match(/\/\/ =+ 🏦 v7\.83 — THE ACCOUNTS BY WHAT THEY ARE FOR =+[\s\S]*?\nfunction bizFlowAcct[^\n]*\n/) || [''])[0];
  ok('the block holds no account number of any kind — the last fours are his data (the site\'s code is public)', blk.length > 2000 && !/\b\d{4}\b/.test(blk) && !/\$\s?\d/.test(blk), String(blk.length) + ' ' + JSON.stringify(blk.match(/\b\d{4}\b/g)));
  ok('the homeowner\'s page has no word of it', !/biz-role|bizRole|Business savings|OPEX/.test(fs.readFileSync(path.join(repo, 'c', 'index.html'), 'utf8')));

  ok('version bumped — APP_VER and the footer agree', /const APP_VER = 'v7\.(8[3-9]|9\d)'/.test(src) && new RegExp('<footer>' + (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1].replace('.', '\\.')).test(src));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
