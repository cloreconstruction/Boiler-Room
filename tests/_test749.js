// 💰 v7.49 — THREE ASKS ON THE ESTIMATES BOARD, one sitting.
// (1) Eric: "On the estimates page, when it says a dollar amount is on the way, I need to be able to click on that and see what that
//     is, as well as how much money is already in. I need to be able to click on that and see the amounts, the dates, and the
//     categories, and then also be able to click on the picture, if needed, of the receipt."
// (2) Eric: "I want to be able to select multiple bids, for example, when I am estimating two separate things that need to be done
//     in the same category."
// (3) Eric: "It says 'Hide the 4 empty or 11 empty tap to show.' I don't want that. I need to be able to see all the categories all
//     the time. Make it so whenever you open the page, it's folded, though. Then I can just delete the ones I'm not going to use."
// Every name and figure here is made up.
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
  const CODE = 'oak-111111';

  const seed = (board, pg) => page.evaluate(([CODE, board, pg]) => {
    jobs = ['Oak House']; crew = []; todos = [];
    window.scheduleSave = () => {};
    dbx.refreshToken = 'test-token';
    _portalIdx = { clients: [{ key: 'oak', job: 'Oak House', code: CODE }] };
    window._dbxFiles = {}; window._ups = [];
    window.dbxDownload = async p => (window._dbxFiles || {})[p] ?? null;
    window.dbxUpload = async (p, body) => { (window._dbxFiles || {})[p] = body; window._ups.push(p); return {}; };
    window.dbxPathExists = async p => Object.prototype.hasOwnProperty.call(window._dbxFiles || {}, p);
    if (!window._said) { window._said = []; const t0 = window.toast; window.toast = (m, g) => { if (m) _said.push(String(m)); return t0(m, g); };
      const u0 = window.toastUndo; window.toastUndo = (m, fn) => { _said.push(String(m)); return u0(m, fn); }; }
    _said.length = 0;
    window.showPhoto = p => { window._shown = p; };   // the picture itself is Dropbox's — the suite only needs to know WHICH one was asked for
    window._dbxFiles[estPath(CODE)] = JSON.stringify(board);
    window._dbxFiles[portalRoot() + '/' + CODE + '.json'] = JSON.stringify(pg);
    _estIdx = -1; _estD = null; _estPage = null; window._qUpBusy = false;
  }, [CODE, board, pg]);
  const pageJson = () => page.evaluate(CODE => JSON.parse(window._dbxFiles[portalRoot() + '/' + CODE + '.json']), CODE);
  const boardJson = () => page.evaluate(CODE => JSON.parse(window._dbxFiles[estPath(CODE)]), CODE);
  const open = async () => { await page.evaluate(async () => { await openEstimates(0); }); await page.waitForTimeout(1500); };
  const rowNames = () => page.evaluate(() => [...document.querySelectorAll('.est-board .est-row')].map(r => r.querySelector('.est-name').textContent.replace(/[▸▾]/g, '').trim()));
  const ciOf = n => page.evaluate(n => _estD.cats.findIndex(x => x.n === n), n);
  const rowOf = n => page.evaluate(n => { const ci = _estD.cats.findIndex(x => x.n === n), r = document.querySelector(`.est-row[data-ci="${ci}"]`);
    return r ? { num: r.querySelector('.est-num').textContent.trim(), sub: (r.querySelector('.est-sub') || { textContent: '' }).textContent.replace(/\s+/g, ' ').trim(), open: r.classList.contains('est-open'), guess: r.classList.contains('est-guess'),
      lamp: r.querySelector('.est-lamp').textContent.trim(), sum: (r.querySelector('.est-sum-say') || { textContent: '' }).textContent.replace(/\s+/g, ' ').trim(),
      plates: [...r.querySelectorAll('.est-bid')].map(b => [...b.querySelectorAll('.est-use, .est-also')].map(p => p.textContent.trim())) } : null; }, n);
  const basePg = { name: 'Oak House', updated: '2026-09-21', show: { money: true }, invoiced: 0, paid: 0, open: 0, phases: [], journal: [] };

  // ───────────────────────── (3) every category, always ─────────────────────────
  console.log('— 👁 every category is always on the list —');
  await seed({ mk: 20, cats: [{ n: 'Framing', appr: false, bids: [{ e1: 1000, e2: 0, acc: true }] }] }, basePg);
  await page.evaluate(() => { entries = []; nextId = 1; });
  await open();
  const ORDER = await page.evaluate(() => CATS_IN_ORDER.slice());
  const r0 = await rowNames();
  ok('a board with one bid on it shows EVERY category — all 55, in the one order — and not one of them is hidden', r0.length === 55 && r0.join('|') === ORDER.join('|') && await page.evaluate(() => document.querySelectorAll('.est-row[hidden]').length === 0 && [...document.querySelectorAll('.est-row')].every(r => r.getBoundingClientRect().height > 20)), JSON.stringify(r0.length));
  ok('the "+11 empty — tap to show" line is gone from the board', await page.evaluate(() => !document.querySelector('.est-empty-fold') && !/empty — tap to show|hide the \d+ empty/.test($('revBox').textContent)));
  ok('Insulation is right there, under Mechanical, with nothing to unfold first', await page.evaluate(() => { const r = [...document.querySelectorAll('.est-row')].find(x => /Insulation/.test(x.querySelector('.est-name').textContent)); if (!r) return false;
    let h = r.previousElementSibling; while (h && !h.classList.contains('est-phase')) h = h.previousElementSibling;
    return !r.hidden && getComputedStyle(r).display !== 'none' && !!h && /^Mechanical/.test(h.textContent.trim()); }));
  ok('the page opens FOLDED: every category is its one line, none open', await page.evaluate(() => document.querySelectorAll('.est-row.est-open').length === 0 && document.querySelectorAll('.est-bid').length === 0));
  ok('a category opened, the board shut and opened again: it is folded again', await (async () => {
    await page.evaluate(() => estFold(_estD.cats.findIndex(x => x.n === 'Framing')));
    const was = (await rowOf('Framing')).open;
    await page.evaluate(() => closeEstimates()); await open();
    return was && !(await rowOf('Framing')).open && (await page.evaluate(() => document.querySelectorAll('.est-row.est-open').length === 0));
  })());

  console.log('— 🗑 "then I can just delete the ones I\'m not going to use" —');
  ok('✕ remove category: two taps, and it says in words that it stays off — with an Undo', await (async () => {
    const ci = await ciOf('Septic');
    await page.evaluate(ci => { estFold(ci); estDelCat(ci); }, ci);
    const armed = await page.evaluate(() => /SURE\?/.test($('revBox').textContent)) && (await rowNames()).includes('Septic');
    await page.evaluate(ci => estDelCat(ci), ci);
    const names = await rowNames();
    return armed && !names.includes('Septic') && names.length === 54 && await page.evaluate(() => _said.some(t => /^✕ Septic is off this board — it stays off until you put it back/.test(t)) && /Undo/.test($('toast').textContent));
  })());
  ok('↩ Undo brings it back whole, in its place', await (async () => { await page.evaluate(() => window._toastUndo()); const n = await rowNames(); return n.length === 55 && n.join('|') === ORDER.join('|') && !(await page.evaluate(() => (_estD.gone || []).length)); })());
  ok('a category with bids comes back with its bids and its lamp on Undo', await (async () => {
    const ci = await ciOf('Framing');
    await page.evaluate(ci => { estDelCat(ci); estDelCat(ci); }, ci);
    const gone = !(await rowNames()).includes('Framing');
    await page.evaluate(() => window._toastUndo());
    return gone && (await rowOf('Framing')).num === '$1,200' && await page.evaluate(() => _estD.cats.find(x => x.n === 'Framing').bids.length === 1);
  })());
  ok('taken off, saved, the board opened again: it is STILL off (it used to come straight back), and the file remembers it by name', await (async () => {
    for (const n of ['Septic', 'HEA', 'Urethane']) { const ci = await ciOf(n); await page.evaluate(ci => { estDelCat(ci); estDelCat(ci); }, ci); }
    await page.waitForTimeout(1500);
    const f = await boardJson();
    await page.evaluate(() => closeEstimates()); await open();
    const n = await rowNames();
    return JSON.stringify(f.gone) === '["Septic","HEA","Urethane"]' && n.length === 52 && !n.includes('Septic') && !n.includes('HEA') && !n.includes('Urethane') && n.join('|') === ORDER.filter(x => !['Septic', 'HEA', 'Urethane'].includes(x)).join('|');
  })());
  ok('the foot of the board says how many are off, in words, and folds the way back behind one tap', await page.evaluate(() => { const b = document.querySelector('#estGone .est-gone-btn'); if (!b) return false;
    const folded = /^▸ 🗑 3 categories taken off this board — tap to put one back$/.test(b.textContent.trim()) && !document.querySelector('#estGone .est-back') && b.getAttribute('aria-expanded') === 'false';
    b.click();
    const chips = [...document.querySelectorAll('#estGone .est-back')].map(c => c.textContent.trim());
    return folded && chips.join('|') === '↩ Septic|↩ HEA|↩ Urethane' && [...document.querySelectorAll('#estGone .est-back')].every(c => c.getBoundingClientRect().height >= 34); }));
  ok('↩ puts one back where it belongs in the one order, empty — and it is off the list of the ones taken off', await (async () => {
    await page.evaluate(() => [...document.querySelectorAll('#estGone .est-back')].find(c => /HEA/.test(c.textContent)).click());
    await page.waitForTimeout(150);
    const n = await rowNames(), left = await page.evaluate(() => [...document.querySelectorAll('#estGone .est-back')].map(c => c.textContent.trim()).join('|'));
    return n.length === 53 && n.indexOf('HEA') === n.indexOf('Enstar') + 1 && left === '↩ Septic|↩ Urethane' && await page.evaluate(() => JSON.stringify(_estD.gone) === '["Septic","Urethane"]' && _said.some(t => /^↩ HEA is back on this board$/.test(t)));
  })());
  ok('typing its name into ➕ category brings one back too', await (async () => {
    await page.evaluate(() => { $('estNewCat').value = 'Urethane'; estAddCat(); });
    const n = await rowNames();
    return n.includes('Urethane') && await page.evaluate(() => JSON.stringify(_estD.gone) === '["Septic"]');
  })());
  await page.evaluate(() => closeEstimates());

  // ───────────────────────── (2) more than one bid counted ─────────────────────────
  console.log('— ➕ two separate things in the same category —');
  await seed({ mk: 20, cats: [
    { n: 'Plumbing', appr: false, bids: [{ e1: 9000, e2: 0, acc: true, note: 'rough-in and finish', shN: true }, { e1: 3000, e2: 0, note: 'water heater', shN: true }, { e1: 8000, e2: 500, note: 'the other plumber' }] },
    { n: 'Framing', appr: false, bids: [{ e1: 10000, e2: 0, acc: true, inc: true }, { e1: 2000, e2: 0 }] },
    { n: 'Siding', appr: false, bids: [{ e1: 8000, e2: 0, acc: true, inc: true, opt: true, lbl: 'Vinyl' }, { e1: 3000, e2: 0, inc: true, opt: true, lbl: 'Repaint' }, { e1: 1000, e2: 0, inc: true, note: 'soffit' }] }] }, basePg);
  await open();
  await page.evaluate(() => estFold(_estD.cats.findIndex(x => x.n === 'Plumbing')));
  const p0 = await rowOf('Plumbing');
  ok('one bid counted: it reads ✓ USING THIS ONE; each other bid offers ○ use this instead AND ➕ add this too', p0.num === '$10,800' && JSON.stringify(p0.plates) === JSON.stringify([['✓ USING THIS ONE'], ['○ use this instead', '➕ add this too'], ['○ use this instead', '➕ add this too']]), JSON.stringify(p0));
  ok('➕ add this too: the category\'s number is the two added together — each with the markup folded in — and the row says so', await (async () => {
    await page.evaluate(() => document.querySelectorAll('.est-row.est-open .est-bid')[1].querySelector('.est-also').click());
    await page.waitForTimeout(100);
    const r = await rowOf('Plumbing');
    return r.num === '$14,400' && /➕ 2 bids added together/.test(r.sub) && /bid \$12,000/.test(r.sub) && await page.evaluate(() => { const x = _estD.cats.find(k => k.n === 'Plumbing'); return estRaw(x) === 12000 && estTotal(x) === 14400 && x.bids.filter(b => b.acc).length === 2; });
  })(), JSON.stringify(await rowOf('Plumbing')));
  ok('the open category says the sum in words: what is added, the total, what the client sees', /^➕ 2 bids are added together — \$9,000 \+ \$3,000 = \$12,000 → \$14,400 to the client\. That total is this category's number\.$/.test((await rowOf('Plumbing')).sum), (await rowOf('Plumbing')).sum);
  ok('the toast says it too, so an added bid is never a surprise', await page.evaluate(() => _said.some(t => /^➕ Plumbing counts 2 bids now — \$9,000 \+ \$3,000 = \$12,000 \(\$14,400 to the client\)$/.test(t))), await page.evaluate(() => JSON.stringify(_said.slice(-2))));
  ok('both counted bids read ✓ COUNTED — tap to take it off; the third still offers both ways in', JSON.stringify((await rowOf('Plumbing')).plates) === JSON.stringify([['✓ COUNTED — tap to take it off'], ['✓ COUNTED — tap to take it off'], ['○ use this instead', '➕ add this too']]), JSON.stringify((await rowOf('Plumbing')).plates));
  ok('✓ ON THEIR PAGE: their page gets ONE number for the line — the sum — and nothing about the parts; the 🏠 notes ride joined', await (async () => {
    const ci = await ciOf('Plumbing');
    await page.evaluate(async ci => { await estApprove(ci); await estApprove(ci); }, ci);
    await page.waitForTimeout(300);
    const pg = await pageJson(), b = (pg.budget || []).find(x => x.n === 'Plumbing');
    return !!b && b.est === 14400 && Object.keys(b).sort().join() === 'd,est,n' && b.d === 'rough-in and finish · water heater' && !/bids|parts|acc|9000|3000|10800|3600|markup/i.test(JSON.stringify(pg.budget));
  })(), JSON.stringify((await pageJson()).budget));
  ok('✓ COUNTED — tap to take it off: back to one bid, and their page follows at once', await (async () => {
    await page.evaluate(() => document.querySelectorAll('.est-row.est-open .est-bid')[1].querySelector('.est-use').click());
    await page.waitForTimeout(300);
    const r = await rowOf('Plumbing'), b = ((await pageJson()).budget || []).find(x => x.n === 'Plumbing');
    return r.num === '$10,800' && !/added together/.test(r.sub) && !r.sum && r.lamp === '✓ ON PAGE' && b.est === 10800 && b.d === 'rough-in and finish' && await page.evaluate(() => _said.some(t => /^✓ Taken off — Plumbing is \$9,000 now \(\$10,800 to the client\) · their page has the new number$/.test(t)));
  })(), JSON.stringify(await rowOf('Plumbing')));
  ok('○ use this instead still means INSTEAD: with two counted, a tap on the third makes it the only one', await (async () => {
    await page.evaluate(() => document.querySelectorAll('.est-row.est-open .est-bid')[1].querySelector('.est-also').click());
    await page.waitForTimeout(200);
    const two = (await rowOf('Plumbing')).num;
    await page.evaluate(() => document.querySelectorAll('.est-row.est-open .est-bid')[2].querySelector('.est-use').click());
    await page.waitForTimeout(300);
    const r = await rowOf('Plumbing');
    return two === '$14,400' && r.num === '$10,200' && JSON.stringify(r.plates) === JSON.stringify([['○ use this instead', '➕ add this too'], ['○ use this instead', '➕ add this too'], ['✓ USING THIS ONE']]) && ((await pageJson()).budget || []).find(x => x.n === 'Plumbing').est === 10200;
  })(), JSON.stringify(await rowOf('Plumbing')));
  ok('each bid keeps its OWN markup rule in the sum: one with the markup already in, one with it riding on top', await (async () => {
    await page.evaluate(() => { _estOpenCats = new Set(); estFold(_estD.cats.findIndex(x => x.n === 'Framing')); });
    await page.evaluate(() => document.querySelectorAll('.est-row.est-open .est-bid')[1].querySelector('.est-also').click());
    await page.waitForTimeout(100);
    const r = await rowOf('Framing');
    return r.num === '$12,400' && /\$10,000 \+ \$2,000 = \$12,000 → \$12,400 to the client/.test(r.sum);
  })(), JSON.stringify(await rowOf('Framing')));
  ok('a counted part that is a best guess: the row says PART PLACEHOLDER and how much of it — the top of the board counts only that part', await (async () => {
    await page.evaluate(() => estBidGuess(_estD.cats.findIndex(x => x.n === 'Framing'), 1));
    await page.waitForTimeout(100);
    const r = await rowOf('Framing'), top = await page.evaluate(() => ($('estGuessBtn') || { textContent: '' }).textContent.trim());
    return r.guess && r.num === '≈ $12,400' && /≈ PART PLACEHOLDER — \$2,400 of it is your best guess, no bid yet/.test(r.sub) && /^≈ 1 best guess — \$2,400 with no bid behind it yet/.test(top);
  })(), JSON.stringify([await rowOf('Framing'), await page.evaluate(() => ($('estGuessBtn') || { textContent: '' }).textContent.trim())]));
  ok('on their page that line is ≈ — one letter, nothing else about the bids', await (async () => {
    const ci = await ciOf('Framing');
    await page.evaluate(async ci => { await estApprove(ci); await estApprove(ci); }, ci);
    await page.waitForTimeout(300);
    const b = ((await pageJson()).budget || []).find(x => x.n === 'Framing');
    return !!b && b.est === 12400 && b.g === 1 && Object.keys(b).sort().join() === 'est,g,n';
  })(), JSON.stringify((await pageJson()).budget));
  ok('deleting ONE of two counted bids leaves the lamp lit (there is still a number to show); deleting the last puts it out', await (async () => {
    const ci = await ciOf('Framing');
    await page.evaluate(ci => { estBidDel(ci, 1); estBidDel(ci, 1); }, ci);
    await page.waitForTimeout(100);
    const a = await rowOf('Framing');
    await page.evaluate(ci => { estBidDel(ci, 0); estBidDel(ci, 0); }, ci);
    await page.waitForTimeout(100);
    const b = await rowOf('Framing');
    return a.num === '$10,000' && a.lamp === '✓ ON PAGE' && b.num === '—' && b.lamp === '🏢 office';
  })());
  await page.waitForTimeout(1400);

  console.log('— 🏠 a category that offers the homeowner a choice —');
  await page.evaluate(() => { _estOpenCats = new Set(); estFold(_estD.cats.findIndex(x => x.n === 'Siding')); });
  const s0 = await rowOf('Siding');
  ok('the choices stay one-of (✓ USING THIS ONE / ○ use this); a bid that is not a choice can only be ADDED', s0.num === '$8,000' && JSON.stringify(s0.plates) === JSON.stringify([['✓ USING THIS ONE'], ['○ use this'], ['➕ add this too']]), JSON.stringify(s0));
  ok('added, it is counted in EVERY choice: the board shows the plan plus it, and every price on their page carries it', await (async () => {
    await page.evaluate(() => document.querySelectorAll('.est-row.est-open .est-bid')[2].querySelector('.est-also').click());
    await page.waitForTimeout(100);
    const ci = await ciOf('Siding');
    await page.evaluate(async ci => { await estApprove(ci); await estApprove(ci); }, ci);
    await page.waitForTimeout(300);
    const r = await rowOf('Siding'), b = ((await pageJson()).budget || []).find(x => x.n === 'Siding');
    return r.num === '$9,000' && /the choice they make, plus what is counted in every choice/.test(r.sum) && JSON.stringify(r.plates) === JSON.stringify([['✓ USING THIS ONE'], ['○ use this'], ['✓ COUNTED — tap to take it off']]) &&
      !!b && b.def === 0 && b.opts.map(o => o.t + ':' + o.est).join('|') === 'Vinyl:9000|Repaint:4000' && !('est' in b);
  })(), JSON.stringify([await rowOf('Siding'), ((await pageJson()).budget || []).find(x => x.n === 'Siding')]));
  ok('○ use this on the other choice moves the PLAN and leaves what is counted in every choice alone', await (async () => {
    await page.evaluate(() => document.querySelectorAll('.est-row.est-open .est-bid')[1].querySelector('.est-use').click());
    await page.waitForTimeout(300);
    const r = await rowOf('Siding'), b = ((await pageJson()).budget || []).find(x => x.n === 'Siding');
    return r.num === '$4,000' && b.def === 1 && b.opts.map(o => o.est).join() === '9000,4000' && await page.evaluate(() => _estD.cats.find(x => x.n === 'Siding').bids.map(k => k.acc ? 1 : 0).join('') === '011');
  })(), JSON.stringify(await rowOf('Siding')));
  ok('two counted bids that BOTH become choices: only the first stays the plan, and he is told', await (async () => {
    await page.evaluate(() => { const x = _estD.cats.find(k => k.n === 'Plumbing'); x.bids.forEach((b, i) => { b.acc = i < 2; delete b.opt; }); renderEstimates(); });
    const ci = await ciOf('Plumbing');
    await page.evaluate(async ci => { await estBidOpt(ci, 0); _said.length = 0; await estBidOpt(ci, 1); }, ci);
    await page.waitForTimeout(200);
    return await page.evaluate(() => { const x = _estD.cats.find(k => k.n === 'Plumbing'); return x.bids.map(b => b.acc ? 1 : 0).join('') === '100' && estTotal(x) === 10800 && _said.some(t => /^👁 These are choices now — the homeowner picks ONE\./.test(t)); });
  })());
  ok('a board written before this build reads exactly as it did: one bid counted, the same number', await page.evaluate(() => {
    const x = { n: 'Trim', bids: [{ e1: 500, e2: 250, acc: true }, { e1: 900, e2: 0 }] };
    return estParts(x).length === 1 && estRaw(x) === 750 && estTotal(x) === 900 && estAccBid(x) === x.bids[0] && !estIsGuess(x); }));
  ok('? How this works says it in words', await page.evaluate(() => /➕ Two separate things in one category:/.test($('estHelpBox').textContent) && /Every category is always on the list\./.test($('estHelpBox').textContent) && /tap either one/.test($('estHelpBox').textContent)));
  await page.evaluate(() => closeEstimates());
  await page.waitForTimeout(200);

  // ───────────────────────── (1) what is in the number ─────────────────────────
  console.log('— 💵 "on the way" and "in" are doors —');
  await seed({ mk: 20, cats: [{ n: 'Framing', appr: true, bids: [{ e1: 10000, e2: 0, acc: true, inc: true }] }, { n: 'Plumbing', appr: false, bids: [] }, { n: 'Roofing', appr: false, bids: [] }] },
    { ...basePg, invoiced: 3200, paid: 3200, phases: [{ n: 2, name: 'Shell', total: 2400, cats: [['Framing Labor', 1400], ['Framing Materials', 1000]] }, { n: 3, name: 'Mechanical', total: 800, cats: [['Plumbing', 800]] }] });
  await page.evaluate(() => {
    entries = []; nextId = 1;
    const mk = (txt, day, o) => { const e = addEntry('Note', txt, 'Oak House', {}); Object.assign(e, { rcpt: true, ts: new Date(day + 'T10:30:00') }, o); return e; };
    const A = mk('studs and nails for the east wall', '2026-09-10', { category: 'Framing', ai: '📅 2026-09-09\n🏪 Lumber Co\n💵 $1,000.00\n🛒 2x4x8 stud × 40 · framing nails', photoPath: '/p/a.jpg', photoPaths: ['/p/a.jpg', '/p/b.jpg'], budg: 'sent' });
    const B = mk('pipe and fittings', '2026-09-12', { category: 'Materials', ai: '🏪 Pipe Shop\n💵 $500.00', budg: 'sent' });
    const C = mk('the first lumber load', '2026-08-20', { category: 'Framing', ai: '📅 2026-08-19\n🏪 Lumber Co\n💵 $2,000.00', photoPath: '/p/c.jpg', budg: 'sent' });
    const D = mk('joist hangers — sent once, taken back', '2026-09-14', { category: 'Framing', ai: '🏪 Fastener Hut\n💵 $300.00', photoPath: '/p/d.jpg' });
    const E = mk('a birthday present', '2026-09-15', { category: 'Framing', ai: '🏪 Gift Shop\n💵 $75.00', personal: true });
    const F = mk('blades for the saw', '2026-09-16', { category: 'Framing', ai: '🏪 Tool Barn\n💵 $40.00', budg: 'no' });
    const G = mk('shingles, not sent yet', '2026-09-17', { category: 'Roofing', ai: '🏪 Roof Supply\n💵 $600.00' });
    window._E = { A: A.id, B: B.id, C: C.id, D: D.id, E: E.id, F: F.id, G: G.id };
    const b = JSON.parse(window._dbxFiles[estPath('oak-111111')]);
    b.cats[0].pend = [{ a: 1000, v: 'Lumber Co', ts: '2026-09-11', base: 2400, eid: A.id, al: 1 }, { a: 250, v: 'Truss Co', ts: '2026-09-13', base: 2400, al: 1 }];
    b.cats[1].pend = [{ a: 500, inc: true, v: 'Pipe Shop', ts: '2026-09-12', base: 800, eid: B.id, al: 1 }];
    b.cats.push({ n: 'Labor', appr: false, bids: [], pend: [{ a: 900, inc: true, kind: 'labor', wk: '2026-08-30', hrs: 12, v: '', ts: '2026-09-05', base: 3200 }] });
    b.cleared = [{ n: 'Framing', a: 2000, v: 'Lumber Co', eid: C.id, ts: '2026-08-21', cl: '2026-08-27', base: 0, saw: 2400, why: 'qb' },
      { n: 'Framing', a: 300, v: 'Fastener Hut', eid: D.id, ts: '2026-09-14', cl: '2026-09-15', why: 'eric' }];
    window._dbxFiles[estPath('oak-111111')] = JSON.stringify(b);
  });
  await open();
  await page.waitForTimeout(600);
  await page.evaluate(() => { window._ups.length = 0; _said.length = 0; });
  const fr = await rowOf('Framing');
  ok('the row still says both figures — and each is a plate now: an edge, an underline, a ›', /\$2,400 in ›/.test(fr.sub) && /📥 \$1,500 on the way ›/.test(fr.sub) && await page.evaluate(() => { const r = document.querySelector(`.est-row[data-ci="${_estD.cats.findIndex(x => x.n === 'Framing')}"]`), b = [...r.querySelectorAll('.est-what')];
    return b.length === 2 && b.every(x => { const cs = getComputedStyle(x), bx = x.getBoundingClientRect(); return x.tagName === 'BUTTON' && /underline/.test(cs.textDecorationLine) && parseFloat(cs.borderTopWidth) >= 1 && bx.height >= 36 && /see what it is$/.test(x.getAttribute('aria-label')); }); }), JSON.stringify(fr));
  const win = () => page.evaluate(() => { const b = $('estWhatBox'); if (!b) return null;
    return { head: b.querySelector('.we-head b').textContent.trim(), tabs: [...b.querySelectorAll('.ew-tab')].map(t => t.textContent.replace(/\s+/g, ' ').trim() + (t.classList.contains('sel') ? ' [ON]' : '')), scope: [...b.querySelectorAll('.ew-scope .pick-chip')].map(t => t.textContent.trim() + (t.classList.contains('sel') ? ' [ON]' : '')),
      say: b.querySelector('.ew-say').textContent.replace(/\s+/g, ' ').trim(), cats: [...b.querySelectorAll('.ew-cat')].map(c => c.textContent.replace(/\s+/g, ' ').trim()), heads: [...b.querySelectorAll('.ew-h')].map(c => c.textContent.trim()),
      rows: [...b.querySelectorAll('.ew-row')].map(r => ({ kind: r.dataset.kind, eid: r.dataset.eid ? +r.dataset.eid : null, amt: r.querySelector('.ew-amt b').textContent.trim(), shown: (r.querySelector('.ew-amt span') || { textContent: '' }).textContent.trim(),
        meta: [...r.querySelectorAll('.ew-meta')].map(m => m.textContent.replace(/\s+/g, ' ').trim()), words: (r.querySelector('.ew-words') || { textContent: '' }).textContent.trim(), ph: (r.querySelector('.ew-ph') || { textContent: '' }).textContent.trim(), noph: !!r.querySelector('.ew-noph'), ent: !!r.querySelector('.ew-ent') })),
      none: (b.querySelector('.ew-none') || { textContent: '' }).textContent.trim(), z: +getComputedStyle(b.parentElement).zIndex, fits: b.scrollWidth <= b.clientWidth + 1 && document.documentElement.scrollWidth <= document.documentElement.clientWidth }; });
  await page.evaluate(() => document.querySelector(`.est-row[data-ci="${_estD.cats.findIndex(x => x.n === 'Framing')}"] .est-what[data-what="way"]`).click());
  await page.waitForTimeout(150);
  const w1 = await win();
  ok('a tap on "on the way" opens ONE window over the board, on 📥 ON THE WAY, for that category', !!w1 && w1.head === '💵 Framing' && w1.tabs.join(' | ') === '✓ 📥 ON THE WAY$1,500.00 [ON] | 📗 IN$2,400.00 | 🧾 NOT SENT2' && w1.scope.join(' | ') === '✓ Framing only [ON] | ○ Every category on this job' && w1.z > 80 && await page.evaluate(() => $('revModal').classList.contains('show')), JSON.stringify(w1 && [w1.head, w1.tabs, w1.scope, w1.z]));
  ok('it says what the figure is: what their page shows, his own cost, how many receipts', /^\$1,500\.00 on their page now · your cost \$1,250\.00 · 2 receipts\. Sent to their page under RECEIPTS RECEIVED — NOT ON AN INVOICE YET/.test(w1.say), w1 && w1.say);
  ok('a receipt row: the AMOUNT to the cent and what their page shows, the receipt\'s own DATE, the store, the CATEGORY, the day it was sent, its words and items', (() => { const r = w1.rows.find(x => x.eid != null); return !!r && r.kind === 'way' && r.amt === '$1,000.00' && r.shown === '$1,200.00 on their page' &&
    r.meta[0] === '📅 Sep 9, 2026 · 🏪 Lumber Co · 🏷 Framing' && r.meta[1] === 'sent to their page Sep 11, 2026' && r.words === 'studs and nails for the east wall' && r.meta[2] === '🛒 2x4x8 stud × 40 · framing nails'; })(), JSON.stringify(w1.rows));
  ok('newest first; a bill typed in by hand says there is no receipt behind it (no picture, no entry)', w1.rows.length === 2 && w1.rows[0].eid == null && w1.rows[0].amt === '$250.00' && w1.rows[0].shown === '$300.00 on their page' && /📅|🏪 Truss Co/.test(w1.rows[0].meta[0]) && /✍ typed in by hand — no receipt behind it/.test(w1.rows[0].meta.join(' ')) && !w1.rows[0].ph && !w1.rows[0].ent, JSON.stringify(w1.rows[0]));
  ok('📷 Look at the receipt opens THAT receipt\'s picture — both of them, in the viewer', await (async () => {
    await page.evaluate(() => document.querySelector('#estWhatBox .ew-row[data-eid] .ew-ph').click());
    await page.waitForTimeout(100);
    return w1.rows[1].ph === '📷 Look at the receipt · 2' && await page.evaluate(() => window._shown === '/p/a.jpg' && lbPaths.join() === '/p/a.jpg,/p/b.jpg') && await page.evaluate(() => +getComputedStyle($('lightbox')).zIndex > +getComputedStyle(document.querySelector('.est-what-sheet')).zIndex);
  })());
  ok('📄 The whole entry opens the entry OVER the list, and its way back says so', await (async () => {
    await page.evaluate(() => document.querySelector('#estWhatBox .ew-row[data-eid] .ew-ent').click());
    await page.waitForTimeout(100);
    const r = await page.evaluate(() => { const s = document.querySelector('#wizEntHost .we-sheet'); if (!s) return null;
      const r0 = { t: s.textContent.replace(/\s+/g, ' '), z: +getComputedStyle(s).zIndex, zw: +getComputedStyle(document.querySelector('.est-what-sheet')).zIndex };
      wizEntryClose(); return { ...r0, still: !!$('estWhatBox') }; });
    return !!r && /ENTRY \d+/.test(r.t) && /studs and nails for the east wall/.test(r.t) && /‹ Back to the list/.test(r.t) && !/Back to the answer/.test(r.t) && r.z > r.zw && r.still;
  })());

  console.log('— ✓ how much is already in —');
  await page.evaluate(() => estWhatClose());
  await page.evaluate(() => document.querySelector(`.est-row[data-ci="${_estD.cats.findIndex(x => x.n === 'Framing')}"] .est-what[data-what="in"]`).click());
  await page.waitForTimeout(150);
  const w2 = await win();
  ok('a tap on "in" opens the same window on ✓ IN', !!w2 && w2.head === '💵 Framing' && w2.tabs[1] === '✓ 📗 IN$2,400.00 [ON]' && /^\$2,400\.00 billed on this line in the books, from the last QuickBooks run\./.test(w2.say) && !/may be more/.test(w2.say), JSON.stringify(w2 && [w2.tabs, w2.say]));
  ok('the books\' own lines: each by the books\' name, the phase the books have it under, its amount — and they add up to the row\'s figure', (() => { const L = w2.rows.filter(r => r.kind === 'line');
    return w2.heads[0] === '📗 THE BOOKS\' LINES — 2, $2,400.00' && L.length === 2 && L[0].amt === '$1,400.00' && L[0].meta[0] === '📗 Framing Labor · under Shell in the books' && L[1].amt === '$1,000.00' && L[1].meta[0] === '📗 Framing Materials · under Shell in the books' && /no date and no receipt rides with it/.test(w2.say); })(), JSON.stringify([w2.heads, w2.rows.filter(r => r.kind === 'line')]));
  ok('under them, the receipt he sent that the books have since taken in: its amount, its date, the store, the category, when it was sent and when the books took it — and its picture', (() => { const T = w2.rows.filter(r => r.kind === 'taken');
    return w2.heads[1] === '🧾 RECEIPTS YOU SENT THAT THE BOOKS HAVE TAKEN IN — 1' && T.length === 1 && T[0].amt === '$2,000.00' && T[0].meta[0] === '📅 Aug 19, 2026 · 🏪 Lumber Co · 🏷 Framing' && T[0].meta[1] === 'sent Aug 21, 2026 · 📗 the books took it in (the category\'s total grew by it) Aug 27, 2026' && T[0].ph === '📷 Look at the receipt' && T[0].ent; })(), JSON.stringify(w2.rows.filter(r => r.kind === 'taken')));
  ok('a receipt he TOOK BACK is not counted as in', !w2.rows.some(r => /joist hangers/.test(r.words)));
  ok('when the books\' split by line is behind what has been invoiced, the window says the true figure may be more', await (async () => {
    await page.evaluate(() => { _estPage.invoiced = 9000; estWhatDraw(); });
    const s = (await win()).say;
    await page.evaluate(() => { _estPage.invoiced = 3200; estWhatDraw(); });
    return /⚠ The books' split by line is behind what has been invoiced on this job — the true figure may be more\./.test(s);
  })());

  ok('a credit on one of the books\' lines reads as a credit — a minus sign and the word, never "$-50.00"', await (async () => {
    await page.evaluate(() => { _estPage.phases[1].cats.push(['Plumbing credit', -50]); estWhatOpen(_estD.cats.findIndex(x => x.n === 'Plumbing'), 'in'); });
    const w = await win(), L = w.rows.filter(r => r.kind === 'line');
    await page.evaluate(() => { _estPage.phases[1].cats.pop(); estWhatOpen(_estD.cats.findIndex(x => x.n === 'Framing'), 'in'); });
    return L.length === 2 && L[0].amt === '$800.00' && L[0].shown === 'billed' && L[1].amt === '−$50.00' && L[1].shown === 'a credit' && w.tabs[1] === '✓ 📗 IN$750.00 [ON]' && !/\$-/.test(JSON.stringify(w));
  })());

  console.log('— 🧾 not sent · every category —');
  await page.evaluate(() => document.querySelector('#estWhatBox .ew-tab[data-tab="log"]').click());
  await page.waitForTimeout(100);
  const w3 = await win();
  ok('🧾 NOT SENT: the receipts in his log under the same line that are not on their page — each says why', w3.tabs[2] === '✓ 🧾 NOT SENT2 [ON]' && w3.rows.length === 2 && w3.rows[0].words === 'blades for the saw' && /⏏ NOT FOR THEM/.test(w3.rows[0].meta[1]) && w3.rows[1].words === 'joist hangers — sent once, taken back' && /○ WAITING — not sent to their page yet/.test(w3.rows[1].meta[1]) && w3.rows[1].amt === '$300.00' && w3.rows[1].shown === '$360.00 on their page', JSON.stringify(w3.rows));
  ok('🔒 a personal entry is on none of the lists', await (async () => { let seen = false;
    for (const t of ['way', 'in', 'log']) { for (const all of [false, true]) { await page.evaluate(([t, all]) => { estWhatTab(t); estWhatScope(all); }, [t, all]); if (/birthday|Gift Shop/.test(await page.evaluate(() => $('estWhatBox').textContent))) seen = true; } }
    return !seen; })());
  await page.evaluate(() => { estWhatScope(false); estWhatTab('way'); });
  await page.evaluate(() => document.querySelector('#estWhatBox .ew-scope [data-scope="all"]').click());
  await page.waitForTimeout(100);
  const w4 = await win();
  ok('○ Every category on this job: every line that has something on the way, under its own heading, in the one order — a line of his own last', !!w4 && w4.head === '💵 Every category' && w4.cats.join(' | ') === 'Framing$1,500.00 › | Plumbing$500.00 › | Labor$900.00 ›' && w4.rows.length === 4 && w4.tabs[0] === '✓ 📥 ON THE WAY$2,900.00 [ON]' && /^\$2,900\.00 on their page now · your cost \$2,650\.00 · 4 receipts\./.test(w4.say), JSON.stringify(w4 && [w4.head, w4.cats, w4.tabs, w4.say]));
  ok('a receipt filed under one category and sent to another line says both; one with no date read off it shows the day it was logged; no picture says so', (() => { const r = w4.rows.find(x => x.words === 'pipe and fittings');
    return !!r && r.meta[0] === '📅 Sep 12, 2026 · 🏪 Pipe Shop · 🏷 Materials (on the Plumbing line)' && r.amt === '$500.00' && r.shown === 'the same on their page' && r.noph && !r.ph && r.ent; })(), JSON.stringify(w4.rows.find(x => x.words === 'pipe and fittings')));
  ok('a week of crew labor is a row too: the week, the hours, the amount — and no receipt behind it', (() => { const r = w4.rows.find(x => x.kind === 'labor');
    return !!r && r.amt === '$900.00' && /^👷 Labor — week of Aug 30 \(12 h\) · sent to their page Sep 5, 2026$/.test(r.meta[1]) && /no receipt behind it/.test(r.meta.join(' ')) && !r.ph && !r.ent; })(), JSON.stringify(w4.rows.find(x => x.kind === 'labor')));
  ok('the top of the board has the whole job\'s two figures, and they are the window\'s totals', await page.evaluate(() => { const b = [...document.querySelectorAll('#estWhatAll .est-what')].map(x => x.textContent.trim()); return b.join(' | ') === '📥 $2,900 on the way › | 📗 $3,200 in ›'; }) && (await (async () => { await page.evaluate(() => estWhatTab('in')); const w = await win(); return w.tabs[1] === '✓ 📗 IN$3,200.00 [ON]' && w.cats.join(' | ') === 'Framing$2,400.00 › | Plumbing$800.00 ›'; })()), await page.evaluate(() => JSON.stringify([...document.querySelectorAll('#estWhatAll .est-what')].map(x => x.textContent.trim()))));
  ok('a tap on a category\'s heading narrows the window to that category', await (async () => {
    await page.evaluate(() => [...document.querySelectorAll('#estWhatBox .ew-cat')].find(c => /Plumbing/.test(c.textContent)).click());
    await page.waitForTimeout(100);
    const w = await win();
    return w.head === '💵 Plumbing' && w.scope.join(' | ') === '✓ Plumbing only [ON] | ○ Every category on this job' && w.rows.length === 1 && w.rows[0].meta[0] === '📗 Plumbing · under Mechanical in the books';
  })());
  ok('the two figures at the top open the window on the whole job', await (async () => {
    await page.evaluate(() => { estWhatClose(); document.querySelector('#estWhatAll .est-what[data-what="way"]').click(); });
    await page.waitForTimeout(100);
    const w = await win();
    return !!w && w.head === '💵 Every category' && w.scope.join(' | ') === '✓ Every category on this job [ON]' && w.rows.length === 4;
  })());
  ok('a list with nothing in it says so in words', await (async () => { await page.evaluate(() => estWhatOpen(_estD.cats.findIndex(x => x.n === 'Roofing'), 'way')); const w = await win();
    await page.evaluate(() => estWhatTab('log')); const l = await win();
    return /^○ Nothing is on the way on Roofing right now\.$/.test(w.none) && w.rows.length === 0 && l.rows.length === 1 && l.rows[0].words === 'shingles, not sent yet'; })());
  ok('in the OPEN category, a bill on the way has 📷 picture right on it', await (async () => { await page.evaluate(() => { estWhatClose(); _estOpenCats = new Set(); estFold(_estD.cats.findIndex(x => x.n === 'Framing')); window._shown = ''; });
    const n = await page.evaluate(() => { const b = [...document.querySelectorAll('.est-row.est-open .est-pend-ph')]; if (b[0]) b[0].click(); return b.length; });
    return n === 1 && await page.evaluate(() => window._shown === '/p/a.jpg'); })());
  ok('looking is all it does: not one file was written while the window was used', await page.evaluate(() => window._ups.length === 0), await page.evaluate(() => JSON.stringify(window._ups)));
  ok('a category with receipts on the way is not removed from under them — it says what to do first', await (async () => {
    const ci = await ciOf('Framing');
    await page.evaluate(ci => { _said.length = 0; estDelCat(ci); estDelCat(ci); }, ci);
    return (await rowNames()).includes('Framing') && await page.evaluate(() => _said.some(t => /^📥 Framing has 2 receipts on the way — take them back or retire them first, then remove the category$/.test(t)));
  })());
  ok('at 390px the window and the board do not run off the side, and every plate in the window takes a thumb', await (async () => {
    await page.evaluate(() => estWhatOpen(-1, 'way'));
    await page.waitForTimeout(100);
    const w = await win();
    return w.fits && await page.evaluate(() => [...document.querySelectorAll('#estWhatBox button')].every(b => b.getBoundingClientRect().height >= 40) && $('revBox').scrollWidth <= $('revBox').clientWidth + 1);
  })(), await page.evaluate(() => JSON.stringify([...document.querySelectorAll('#estWhatBox button')].map(b => [b.textContent.trim().slice(0, 24), Math.round(b.getBoundingClientRect().height)]).filter(x => x[1] < 40))));
  ok('the window goes with its board', await page.evaluate(() => { closeEstimates(); return !$('estWhatBox') && !_estWhat; }));

  console.log('— 👷 a crew phone —');
  await page.evaluate(() => { localStorage.setItem('daylog-crew-name', 'Phil'); });
  await page.reload(); await page.waitForTimeout(900);
  ok('a crew phone has no door to any of it: the board is Eric\'s, and the window draws nothing', await page.evaluate(async () => {
    _portalIdx = { clients: [{ key: 'oak', job: 'Oak House', code: 'oak-111111' }] };
    _estD = { mk: 20, cats: [{ n: 'Framing', bids: [], pend: [{ a: 100, ts: '2026-09-01' }] }] }; _estIdx = 0;
    estWhatOpen(0, 'way');
    const none = !document.getElementById('estWhatBox');
    _estD = null; _estIdx = -1;
    return !!CREW_NAME && none; }));
  await page.evaluate(() => { localStorage.removeItem('daylog-crew-name'); });

  ok('version bumped — APP_VER and the footer agree', /const APP_VER = 'v7\.(49|[5-9]\d)'/.test(src) && new RegExp('<footer>' + (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1].replace('.', '\\.') + ' ·').test(src));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
