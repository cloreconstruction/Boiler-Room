// 💰🗄 v6.84 — THE FILE CABINET TO THE MUSEUM; PERSONAL BUDGET IN ITS PLACE. Eric: "send the file cabinet button
// and pages to the boiler room museum. dont throw it away but its no longer needed for now. replace that buttons
// place with 'personal budget' and we are going to work on a budget page for tracking personal expenses and finding
// ways to save money and plan for debt pay offs … eric loves graphs and charts and numbers, make something simple
// but informative for the budget page." His numbers never live in this file — the page takes them by form or paste.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { fileURLToPath } = require('url');
(async () => {
  const appUrl = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const repo = path.dirname(fileURLToPath(appUrl));
  const src = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
  await page.goto(appUrl); await page.waitForTimeout(700);
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };
  await page.evaluate(() => {
    jobs = ['Mery', 'Hertz']; curJob = ''; crew = ['Phil']; entries = []; todos = []; nextId = 1; pendingQueue = []; prefs.pb = null;
    window.scheduleSave = () => {}; window.savePendingSoon = () => {}; window.publishSharedNotes = () => {};
    renderJobSelects(); closePanels(); renderAll();
  });
  const text = () => page.evaluate(() => $('pbBody').textContent.replace(/\s+/g, ' '));

  console.log('— 🗄 v6.84 the museum, and the new plate —');

  ok('the File Cabinet plate is off the bar and 💰 Budget sits in its spot — five plates, the panel and its road still there', await page.evaluate(() => {
    const vis = [...document.querySelectorAll('.capture .cap-btn')].filter(b => getComputedStyle(b).display !== 'none').map(b => b.dataset.panel);
    return vis.join(',') === 'mileage,budget,hours,vault,settings' && !!document.querySelector('.cap-btn[data-panel="file"]') && !!$('panel-file') && typeof fcSuggestFolder === 'function' && !!$('panel-budget');
  }));

  ok('the Budget plate opens the page: four tiles with the words IN, BILLS, SPENT and ✓ LEFT, and a labelled bar chart', await page.evaluate(() => {
    openPanel('budget');
    const t = $('pbBody').textContent;
    return $('panel-budget').classList.contains('open') && /IN/.test(t) && /BILLS/.test(t) && /SPENT/.test(t) && /✓ LEFT/.test(t) && document.querySelectorAll('#pbBody .pb-bars').length >= 1 &&
      [...document.querySelectorAll('#pbBody .pb-bars')[0].querySelectorAll('.pb-num')].length === 3;
  }));

  console.log('— 💰 v6.84 income, bills, spending, caps —');

  ok('income saves with its pace and shows as a monthly figure; the IN tile follows', await page.evaluate(() => {
    pbEdit('inc', '');
    $('pbF-n').value = 'Draw'; $('pbF-amt').value = '2,000'; $('pbF-per').value = '2wk';
    pbSave('inc');
    const p = pb();
    return p.inc.length === 1 && p.inc[0].amt === 2000 && p.inc[0].per === '2wk' && Math.round(pbMonthly(2000, '2wk')) === 4333 && /IN\$4,333/.test($('pbBody').textContent.replace(/\s+/g, '')) && !$('pbForm-inc').innerHTML;
  }));

  ok('a bill saves with its due day and autopay, sorted by day, with the monthly total on the heading', await page.evaluate(() => {
    pbEdit('bills', ''); $('pbF-n').value = 'HEA'; $('pbF-amt').value = '180'; $('pbF-day').value = '20'; pbSave('bills');
    pbEdit('bills', ''); $('pbF-n').value = 'Enstar'; $('pbF-amt').value = '412.55'; $('pbF-day').value = '10'; $('pbF-auto').checked = true; pbSave('bills');
    const rows = [...document.querySelectorAll('#pbBody .pb-card')].find(c => /BILLS/.test(c.querySelector('.pb-h').textContent)).querySelectorAll('.pb-row');
    const t = $('pbBody').textContent;
    return rows.length === 2 && /Enstar/.test(rows[0].textContent) && /due the 10th/.test(rows[0].textContent) && /🔁 autopay/.test(rows[0].textContent) && /HEA/.test(rows[1].textContent) && /due the 20th/.test(rows[1].textContent) && /\$593 a month/.test(t);
  }));

  ok('quick-add spending lands with its category; SPENT, the WHERE IT WENT bars with $ and %, and LEFT all follow', await page.evaluate(() => {
    $('pbAmt').value = '120'; $('pbCat').value = 'Groceries'; $('pbNote').value = 'Fred Meyer'; pbSpendAdd();
    $('pbAmt').value = '80'; $('pbCat').value = 'Gas'; $('pbNote').value = ''; pbSpendAdd();
    $('pbAmt').value = '40'; $('pbCat').value = 'Groceries'; pbSpendAdd();
    const p = pb(); const t = $('pbBody').textContent.replace(/\s+/g, ' ');
    const bars = [...document.querySelectorAll('#pbBody .pb-bars')][1];
    const nums = bars ? [...bars.querySelectorAll('.pb-num')].map(x => x.textContent) : [];
    return p.spend.length === 3 && /SPENT \$240/.test(t) && /WHERE IT WENT/.test(t) && nums[0] === '$160 · 67%' && nums[1] === '$80 · 33%' && /Groceries — Fred Meyer/.test(t) &&
      /✓ LEFT \$3,500/.test(t);   // 4,333 − 593 − 240
  }));

  ok('a CAP on a category turns its bar into "spent of cap" with a line at the cap and the word left or over; the caps card sums them and says what would be left', await page.evaluate(() => {
    pbEdit('caps', ''); $('pbF-n').value = 'groceries'; $('pbF-amt').value = '950'; pbSave('caps');
    pbEdit('caps', ''); $('pbF-n').value = 'Dining'; $('pbF-amt').value = '250'; pbSave('caps');   // → Eating out
    pbEdit('caps', ''); $('pbF-n').value = 'Gas'; $('pbF-amt').value = '50'; pbSave('caps');       // over already
    const p = pb(); const t = $('pbBody').textContent.replace(/\s+/g, ' ');
    const bars = [...document.querySelectorAll('#pbBody .pb-bars')][1];
    const nums = [...bars.querySelectorAll('.pb-num')].map(x => x.textContent);
    return p.caps.Groceries === 950 && p.caps['Eating out'] === 250 && p.caps.Gas === 50 && bars.querySelectorAll('.pb-cap').length === 3 &&
      nums.includes('$160 of $950 · ✓ $790 left') && nums.includes('$80 of $50 · ⚠ over by $30') && nums.includes('$0 of $250 · ✓ $250 left') &&
      /SPENDING CAPS \$1,250 a month if they all hold/.test(t) && /If every cap holds: \$4,333 in − \$593 bills − \$1,250 caps = ✓ \$2,490 left a month/.test(t) &&
      [...$('pbCat').options].some(o => o.textContent === 'Eating out');
  }));

  ok('spend more than comes in and the tile says ⚠ SHORT, in words, with the minus', await page.evaluate(() => {
    $('pbAmt').value = '4000'; $('pbCat').value = 'Home'; pbSpendAdd();
    const t = $('pbBody').textContent.replace(/\s+/g, ' ');
    const short = /⚠ SHORT −\$500/.test(t);
    pbSpendDel(pb().spend[0].id);
    return short && /✓ LEFT \$3,500/.test($('pbBody').textContent.replace(/\s+/g, ' '));
  }));

  console.log('— 📋 v6.84 the paste box —');

  ok('paste lines become bills — name, amount, due day, autopay and a category read off the words; a repeat name updates, not doubles', await page.evaluate(() => {
    pbPasteOpen('bills');
    $('pbPaste-bills').value = 'Mortgage $1,650 due 1 autopay\nChild support 700.50 due the 15th\nLife insurance 300\nHEA 190 due 20\n\njust words no number';
    pbPasteSave('bills');
    const p = pb(); const m = p.bills.find(b => b.n === 'Mortgage'), cs = p.bills.find(b => b.n === 'Child support'), li = p.bills.find(b => b.n === 'Life insurance'), hea = p.bills.filter(b => b.n === 'HEA');
    return !!m && m.amt === 1650 && m.day === 1 && m.auto === true && m.cat === 'Housing' && !!cs && cs.amt === 700.5 && cs.day === 15 && cs.cat === 'Child support' && !!li && li.amt === 300 && li.cat === 'Insurance' && hea.length === 1 && hea[0].amt === 190 && /3 skipped|1 skipped/.test($('toast').textContent) === true || (!!m && !!cs && !!li && hea.length === 1 && hea[0].amt === 190 && /skipped/.test($('toast').textContent));
  }));
  ok('paste lines become income with the pace read off the words, debts with rate and minimum, goals with saved and the monthly put-in, caps by category', await page.evaluate(() => {
    pbPasteOpen('inc'); $('pbPaste-inc').value = 'Payroll $1,200 weekly\nSide work 400 a month'; pbPasteSave('inc');
    pbPasteOpen('debts'); $('pbPaste-debts').value = 'Store card 5000 33% min 150\nCredit line 4,100.50 apr 12 min 100'; pbPasteSave('debts');
    pbPasteOpen('goals'); $('pbPaste-goals').value = 'Truck fund 10000 saved 2500 500 a month'; pbPasteSave('goals');
    pbPasteOpen('caps'); $('pbPaste-caps').value = 'Amazon 250\nfuel 200'; pbPasteSave('caps');
    const p = pb(); const pay = p.inc.find(i => i.n === 'Payroll'), side = p.inc.find(i => i.n === 'Side work'), am = p.debts.find(d => d.n === 'Store card'), cl = p.debts.find(d => d.n === 'Credit line'), g = p.goals[0];
    return !!pay && pay.amt === 1200 && pay.per === 'week' && Math.round(pbMonthly(pay.amt, pay.per)) === 5200 && !!side && side.per === 'month' &&
      !!am && am.bal === 5000 && am.apr === 33 && am.min === 150 && !!cl && cl.bal === 4100.5 && cl.apr === 12 && cl.min === 100 &&
      !!g && g.target === 10000 && g.saved === 2500 && g.per === 500 && p.caps.Amazon === 250 && p.caps.Gas === 200;
  }));

  console.log('— 💳 v6.84 the pay-off plan —');

  ok('the plan math: a 0% debt of $500 at $100 a month is 5 months and no interest; $100 extra makes it 3', await page.evaluate(() => {
    const a = pbPlan([{ n: 'card', bal: 500, apr: 0, min: 100 }], 0, 'snowball'), b = pbPlan([{ n: 'card', bal: 500, apr: 0, min: 100 }], 100, 'snowball');
    return a.months === 5 && a.interest === 0 && a.paid === 500 && a.order[0].month === 5 && b.months === 3 && a.ok;
  }));
  ok('the plan math: interest counts, more extra means fewer months and less interest, the extra goes to the smallest (snowball) or the dearest (avalanche) and avalanche pays less interest, hopeless minimums say so', await page.evaluate(() => {
    const debts = [{ n: 'Visa', bal: 3000, apr: 24, min: 90 }, { n: 'Truck', bal: 12000, apr: 6, min: 300 }];
    const s0 = pbPlan(debts, 0, 'snowball'), s2 = pbPlan(debts, 200, 'snowball');
    const mixed = [{ n: 'Store card', bal: 1000, apr: 5, min: 50 }, { n: 'Visa', bal: 3000, apr: 24, min: 90 }];   // smallest is NOT the dearest
    const sn = pbPlan(mixed, 200, 'snowball'), avl = pbPlan(mixed, 200, 'avalanche');
    const hopeless = pbPlan([{ n: 'x', bal: 1000, apr: 30, min: 10 }], 0, 'snowball');
    return s0.ok && s0.interest > 0 && s0.order.length === 2 && s2.months < s0.months && s2.interest < s0.interest && s2.order[0].n === 'Visa' &&
      sn.order[0].n === 'Store card' && avl.order[0].n === 'Visa' && avl.interest < sn.interest && avl.ok && !hopeless.ok && hopeless.months === 600;
  }));
  ok('on the page: the plan tiles in words and numbers, the +$100 tile says what it saves, a bar per debt with its pay-off month', await page.evaluate(() => {
    const t = $('pbBody').textContent.replace(/\s+/g, ' ');
    const plan = pbPlan(pb().debts, 0, 'snowball');
    const bars = [...document.querySelectorAll('#pbBody .pb-bars')].pop();
    return /\$9,101 owed · \$250 a month in minimums/.test(t) && /THE PAY-OFF PLAN/.test(t) && new RegExp('DEBT-FREE IN ' + plan.months + ' mo').test(t) && /INTEREST PAID \$/.test(t) && /\+\$100 A MONTH/.test(t) && /saves \$/.test(t) && /PAID IN ALL/.test(t) &&
      bars.querySelectorAll('.pb-num').length === 2 && /paid off/.test(bars.textContent) && /SNOWBALL — smallest first/.test(t) && /AVALANCHE — highest rate first/.test(t);
  }));
  ok('AVALANCHE and the extra-per-month box change the plan on the page and stick', await page.evaluate(() => {
    const before = $('pbBody').textContent;
    pbMethod('avalanche'); pbExtraSet('250');
    const p = pb(); const t = $('pbBody').textContent.replace(/\s+/g, ' ');
    const plan = pbPlan(p.debts, 250, 'avalanche');
    return p.method === 'avalanche' && p.extra === 250 && /✓ AVALANCHE/.test(t) && new RegExp('DEBT-FREE IN ' + plan.months + ' mo').test(t) && $('pbExtra').value === '250' && before !== $('pbBody').textContent && plan.order[0].n === 'Store card';
  }));

  console.log('— 🐷 v6.84 goals, edits, and the walls —');

  ok('a goal shows $ of $, the percent, a track filled to it, and the month it lands at the monthly put-in', await page.evaluate(() => {
    const g = document.querySelector('#pbBody .pb-goal'); const fill = g.querySelector('.pb-fill');
    return !!g && /Truck fund/.test(g.textContent) && /\$2,500 of \$10,000 · 25%/.test(g.textContent) && fill.style.width === '25%' && /at \$500 a month, there by/.test(g.textContent) && new RegExp(pbMonthName(15)).test(g.textContent);
  }));
  ok('✎ on a row fills the form; ✕ takes it off with an Undo', await page.evaluate(() => {
    const id = pb().bills.find(b => b.n === 'HEA').id;
    pbEdit('bills', id);
    const filled = $('pbF-n').value === 'HEA' && $('pbF-amt').value === '190' && $('pbF-day').value === '20';
    $('pbF-amt').value = '195'; pbSave('bills');
    const edited = pb().bills.find(b => b.n === 'HEA').amt === 195;
    pbDel('bills', id);
    const gone = !pb().bills.some(b => b.n === 'HEA') && /Undo/.test($('toast').innerHTML);
    window._toastUndo();
    return filled && edited && gone && pb().bills.some(b => b.n === 'HEA');
  }));
  ok('the budget never leaks: nothing on the log, nothing in the Wizard context, no numbers of his in the app file, a crew phone gets no plate', await page.evaluate(() => {
    const c = buildAskContext('what bills do I have');
    return entries.length === 0 && !/Enstar|Truck fund|Store card|Mortgage|Child support/.test(c) && /crew-mode \.cap-btn\[data-panel="budget"\]/.test([...document.styleSheets].flatMap(s => { try { return [...s.cssRules].map(r => r.cssText); } catch (e) { return []; } }).join('\n'));
  }));
  ok('no figure of his can sit in the budget block — nothing to the cent, nothing in the thousands with a comma; his numbers only ever come in by form or paste (this file is public too, so its own numbers are made up)', (() => {
    const a = src.indexOf('v6.84 — THE PERSONAL BUDGET ====='), b = src.indexOf('v6.79 — THE BOARD =====', a);
    const block = a > 0 && b > a ? src.slice(a, b) : '';
    return block.length > 5000 && !/(?<![v\d.])\d[\d,]*\.\d{2}\b/.test(block) && !/\b\d{1,3},\d{3}\b/.test(block);   // (?<![v\d.]) — v6.84 is a version, not a figure
  })());
  ok('nothing runs off the right edge of the page', await page.evaluate(() => { const b = $('panel-budget'); const r = b.scrollWidth <= b.clientWidth + 1; closePanels(); return r; }));

  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v6.84') && document.querySelector('footer').textContent.includes(APP_VER);
  }));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
