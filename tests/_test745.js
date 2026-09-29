// ≈ 🧾 v7.45 — Eric: "on the estimates page i need a button to push that says 'placeholder best guess' or something similar and
// that number needs to be highlighted somehow until it gets backed by a real bid. there need to be a distinction to the client
// between the budget approved estimates need to be more like 'estimated remaining costs' and estimated upcoming costs can be
// 'receipts recived but not on invoices'." (1) The estimates board: a bid line can be marked ≈ placeholder — best guess; the row
// wears it (glyph, words, a dashed edge) until a real bid backs it; the mark never reaches their page. (2) The homeowner's page:
// RECEIPTS RECEIVED — NOT ON AN INVOICE YET (every receipt that waits, once) and ESTIMATED REMAINING COSTS (each estimate, less
// what is billed, less the receipts that wait). Every name and figure here is made up.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { fileURLToPath } = require('url');
(async () => {
  const appUrl = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const repo = path.dirname(fileURLToPath(appUrl));
  const src = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
  const csrc = fs.readFileSync(path.join(repo, 'c', 'index.html'), 'utf8');
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
  await page.goto(appUrl); await page.waitForTimeout(700);
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };
  const CODE = 'oak-111111';

  await page.evaluate(CODE => {
    jobs = ['Oak House']; crew = []; entries = []; todos = []; nextId = 1;
    renderJobSelects(); closePanels(); renderAll();
    window.scheduleSave = () => {};
    dbx.refreshToken = 'test-token';
    _portalIdx = { clients: [{ key: 'oak', job: 'Oak House', code: CODE }] };
    window._dbxFiles = {}; window._ups = [];
    window.dbxDownload = async p => (window._dbxFiles || {})[p] ?? null;
    window.dbxUpload = async (p, body) => { (window._dbxFiles || {})[p] = body; window._ups.push(p); return {}; };
    window.dbxPathExists = async p => Object.prototype.hasOwnProperty.call(window._dbxFiles || {}, p);
    window._said = []; const t0 = window.toast; window.toast = (m, g) => { if (m) _said.push(String(m)); return t0(m, g); };
    // the board: one approved line with a receipt waiting on it, one dark line with a receipt waiting, one line with a real bid
    window._dbxFiles[estPath(CODE)] = JSON.stringify({ mk: 20, cats: [
      { n: 'Framing', appr: true, bids: [{ e1: 10000, e2: 0, acc: true, inc: true }], pend: [{ a: 1000, v: 'Lumber Co', ts: '2026-09-20', base: 2500, eid: 5, inc: true }] },
      { n: 'Plumbing', appr: false, bids: [], pend: [{ a: 500, v: 'Pipe Shop', ts: '2026-09-21', base: 0, eid: 6 }] },
      { n: 'Electrical', appr: false, bids: [{ e1: 4000, e2: 0, acc: true, inc: true }] }] });
    // their page, written BEFORE v7.45: the approved line's receipt sits inside the budget line, the list holds only the dark line's
    window._dbxFiles[portalRoot() + '/' + CODE + '.json'] = JSON.stringify({ name: 'Oak House', updated: '2026-09-21', show: { money: true },
      invoiced: 2500, paid: 2500, open: 0, phases: [{ name: 'Shell', cats: [['Framing', 2500]] }], journal: [],
      budget: [{ n: 'Framing', est: 10000, up: 1000 }], upcoming: { items: [{ n: 'Plumbing', a: 600 }], tot: 600 } });
    _estIdx = -1; _estD = null; _estPage = null; window._qUpBusy = false;
  }, CODE);
  const pageJson = () => page.evaluate(CODE => JSON.parse(window._dbxFiles[portalRoot() + '/' + CODE + '.json']), CODE);
  const row = n => page.evaluate(n => { const r = [...document.querySelectorAll('.est-row')].find(x => x.querySelector('.est-name').textContent.includes(n)); if (!r) return null;
    const cs = getComputedStyle(r), num = r.querySelector('.est-num'), ns = getComputedStyle(num);
    return { hidden: r.hasAttribute('hidden'), guess: r.classList.contains('est-guess'), num: num.textContent.trim(), numGuess: num.classList.contains('guess'), sub: (r.querySelector('.est-sub') || { textContent: '' }).textContent.replace(/\s+/g, ' ').trim(),
      edge: cs.borderLeftStyle, edgeW: parseFloat(cs.borderLeftWidth), deco: ns.textDecorationLine + ' ' + ns.textDecorationStyle, lamp: r.querySelector('.est-lamp').textContent.trim(), ci: +r.dataset.ci }; }, n);

  console.log('— 🧾 the receipts list is whole —');
  await page.evaluate(async () => { await openEstimates(0); });
  await page.waitForTimeout(1700);
  ok('opening the board brings a page written before v7.45 up to date — the words say so, and it is not called a loss', await page.evaluate(() => _said.some(s => /Bringing their receipts list up to date/.test(s)) && !_said.some(s => /had lost/.test(s))), await page.evaluate(() => JSON.stringify(_said)));
  ok('their page now lists EVERY receipt that waits — the one under the approved line too — marked all, each once, markup folded in, no vendor', await (async () => {
    const pg = await pageJson(), u = pg.upcoming || {};
    const names = (u.items || []).map(i => i.n + ':' + i.a).join('|');
    return u.all === 1 && names === 'Framing:1000|Plumbing:600' && u.tot === 1600 && pg.budget.length === 1 && pg.budget[0].up === 1000 && !/Lumber Co|Pipe Shop|markup/i.test(JSON.stringify(pg));
  })(), JSON.stringify((await pageJson()).upcoming));
  ok('a page that already agrees is left alone: opening the board again writes nothing', await (async () => {
    await page.evaluate(() => { closeEstimates(); window._ups.length = 0; _said.length = 0; });
    await page.evaluate(async () => { await openEstimates(0); }); await page.waitForTimeout(1600);
    return page.evaluate(() => window._ups.length === 0 && !_said.some(s => /receipts list|had lost/.test(s)));
  })(), await page.evaluate(() => JSON.stringify([window._ups, _said])));

  console.log('— ≈ placeholder, best guess —');
  ok('no guess on the board yet: no ≈ plate at the top, no row wears the mark', await page.evaluate(() => !$('estGuessBtn') && !document.querySelector('.est-row.est-guess') && !/≈/.test([...document.querySelectorAll('.est-num')].map(n => n.textContent).join(''))));
  ok('open a category: beside ➕ another bid sits ≈ ➕ placeholder — best guess; a tap adds a line already marked, picked, its number box ready', await (async () => {
    const ci = (await row('Plumbing')).ci;
    await page.evaluate(ci => { estFold(ci); }, ci);
    const has = await page.evaluate(ci => { const r = document.querySelector(`.est-row[data-ci="${ci}"]`); const b = r.querySelector('.est-guess-add'); return !!b && /≈ ➕ placeholder — best guess/.test(b.textContent) && /➕ another bid in Plumbing/.test(r.textContent); }, ci);
    await page.evaluate(ci => { document.querySelector(`.est-row[data-ci="${ci}"] .est-guess-add`).click(); }, ci);
    await page.waitForTimeout(160);
    return has && await page.evaluate(ci => { const x = _estD.cats[ci], b = x.bids[0], box = document.querySelector(`.est-row[data-ci="${ci}"] .est-bid[data-bi="0"]`);
      return x.bids.length === 1 && b.guess === true && b.acc === true && box.classList.contains('guess') && document.activeElement === box.querySelector('input') && /≈ PLACEHOLDER — best guess/.test(box.querySelector('.est-guess-btn').textContent) && box.querySelector('.est-guess-btn').getAttribute('aria-pressed') === 'true' && /no bid behind this number yet/.test(box.querySelector('.est-guess-say').textContent); }, ci);
  })());
  ok('before a number is typed the row says so; with the number in, the row wears ≈ on the number, the words and a dashed edge — not the colour alone', await (async () => {
    const before = await row('Plumbing');
    await page.evaluate(() => { const r = [...document.querySelectorAll('.est-row')].find(x => x.querySelector('.est-name').textContent.includes('Plumbing')); const i = r.querySelector('.est-bid input'); i.value = '3000'; i.dispatchEvent(new Event('change')); });
    const r = await row('Plumbing');
    return /≈ placeholder — no number typed yet/.test(before.sub) && !before.guess && r.guess && r.num === '≈ $3,600' && r.numGuess && /^≈ PLACEHOLDER — best guess, no bid yet/.test(r.sub) && r.edge === 'dashed' && r.edgeW >= 3 && /underline/.test(r.deco) && /dashed/.test(r.deco);
  })(), JSON.stringify(await row('Plumbing')));
  ok('the top of the board counts them, in words, on a plate big enough for a thumb', await page.evaluate(() => {
    const b = $('estGuessBtn');
    return !!b && /^≈ 1 best guess — \$3,600 with no bid behind it yet · tap to see only those$/.test(b.textContent.trim()) && b.getAttribute('aria-pressed') === 'false' && b.getBoundingClientRect().height >= 40;
  }), await page.evaluate(() => ($('estGuessBtn') || { textContent: 'no plate' }).textContent));
  ok('a tap on it lists ONLY the best guesses; the same plate, lit and in words, shows everything again', await (async () => {
    await page.evaluate(() => $('estGuessBtn').click());
    const only = await page.evaluate(() => ({ rows: [...document.querySelectorAll('.est-row:not([hidden])')].map(r => r.querySelector('.est-name').textContent.replace(/[▸▾]/g, '').trim()), b: $('estGuessBtn').textContent.trim(), p: $('estGuessBtn').getAttribute('aria-pressed'), folds: document.querySelectorAll('.est-empty-fold').length }));
    await page.evaluate(() => $('estGuessBtn').click());
    const all = await page.evaluate(() => [...document.querySelectorAll('.est-row:not([hidden])')].length);
    return only.rows.join('|') === 'Plumbing' && /^✓ ≈ ONLY THE BEST GUESSES \(1\) — tap to show everything$/.test(only.b) && only.p === 'true' && only.folds === 0 && all >= 3;
  })());
  ok('any bid line can be marked, and unmarked: Electrical\'s real bid → ≈ (two on the board) → back, the toast saying which', await (async () => {
    const ci = (await row('Electrical')).ci;
    await page.evaluate(ci => { estFold(ci); _said.length = 0; document.querySelector(`.est-row[data-ci="${ci}"] .est-bid[data-bi="0"] .est-guess-btn`).click(); }, ci);
    const on = await page.evaluate(ci => ({ g: _estD.cats[ci].bids[0].guess === true, b: $('estGuessBtn').textContent, said: _said.join(' | '), num: document.querySelector(`.est-row[data-ci="${ci}"] .est-num`).textContent.trim(),
      heads: [...document.querySelectorAll('.est-phase')].map(h => h.textContent.replace(/\s+/g, ' ').trim()) }), ci);
    await page.evaluate(ci => { _said.length = 0; document.querySelector(`.est-row[data-ci="${ci}"] .est-bid[data-bi="0"] .est-guess-btn`).click(); }, ci);
    const off = await page.evaluate(ci => ({ g: _estD.cats[ci].bids[0].guess, b: $('estGuessBtn').textContent, said: _said.join(' | '), num: document.querySelector(`.est-row[data-ci="${ci}"] .est-num`).textContent.trim(), plate: document.querySelector(`.est-row[data-ci="${ci}"] .est-bid[data-bi="0"] .est-guess-btn`).textContent.trim() }), ci);
    await page.evaluate(ci => estFold(ci), ci);
    return on.g && /≈ 2 best guesses — \$7,600/.test(on.b) && /Electrical — marked as your best guess/.test(on.said) && on.num === '≈ $4,000' && on.heads.some(h => /^Mechanical .*· ≈ \$4,000 best guess$/.test(h)) &&
      off.g === undefined && /≈ 1 best guess —/.test(off.b) && /Electrical — a real bid backs it now/.test(off.said) && off.num === '$4,000' && off.plate === '○ placeholder — best guess';
  })());
  ok('✓ APPROVE a best guess: their page gets the name and the number like any other — no mark, no word of it; the board row still wears ≈ with its lamp lit', await (async () => {
    const ci = (await row('Plumbing')).ci;
    await page.evaluate(async ci => { await estApprove(ci); await estApprove(ci); }, ci);
    await page.waitForTimeout(200);
    const pg = await pageJson(), b = (pg.budget || []).find(x => x.n === 'Plumbing'), r = await row('Plumbing');
    return !!b && b.est === 3600 && b.up === 600 && !('guess' in b) && !/guess|placeholder|≈/i.test(JSON.stringify(pg)) && r.guess && /✓ ON PAGE/.test(r.lamp) && /≈ PLACEHOLDER/.test(r.sub) && /✓ ON THEIR PAGE/.test(r.sub);
  })(), JSON.stringify((await pageJson()).budget));
  ok('the mark is saved on the board file (it is his) and nowhere else', await (async () => {
    await page.waitForTimeout(1400);
    return page.evaluate(CODE => { const bd = JSON.parse(window._dbxFiles[estPath(CODE)]); const p = bd.cats.find(x => x.n === 'Plumbing');
      return p.bids[0].guess === true && Object.keys(window._dbxFiles).filter(k => k !== estPath(CODE)).every(k => !/"guess"/.test(window._dbxFiles[k])); }, CODE);
  })());
  ok('backed by a real bid: add the bid, tap ○ use this — the row drops the mark by itself, the count goes, their page follows the real number', await (async () => {
    const ci = (await row('Plumbing')).ci;
    await page.evaluate(ci => { if (!_estOpenCats.has(ci)) estFold(ci); estBidAdd(ci); estBidSet(ci, 1, 'e1', '2800'); }, ci);
    await page.evaluate(async ci => { await estBidAccept(ci, 1); }, ci);
    await page.waitForTimeout(200);
    const r = await row('Plumbing'), pg = await pageJson(), b = pg.budget.find(x => x.n === 'Plumbing');
    return !r.guess && r.num === '$3,360' && !/PLACEHOLDER/.test(r.sub) && r.edge !== 'dashed' && await page.evaluate(ci => !$('estGuessBtn') && _estD.cats[ci].bids[0].guess === true && !_estD.cats[ci].bids[0].acc, ci) && b.est === 3360;
  })(), JSON.stringify(await row('Plumbing')));
  ok('? How this works says it in words', await page.evaluate(() => /≈ Placeholder — best guess:/.test($('estHelpBox').textContent) && /their page shows the number like any other/.test($('estHelpBox').textContent)));
  ok('at 390px the board does not run off the side', await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth && $('revBox').scrollWidth <= $('revBox').clientWidth + 1));
  ok('🎛 What they see names the two cards as their page does, in the page\'s order', await page.evaluate(() => PV_CARDS.map(c => c[0]).join('|') === 'journal|money|upcoming|budget|phases' && /^🧾 Receipts received — not on an invoice yet$/.test(PV_CARDS[2][1]) && /^📐 Estimated remaining costs/.test(PV_CARDS[3][1]) && OWN_WORDS.upcoming === 'receipts received' && OWN_WORDS.budget === 'estimated remaining costs'));
  ok('his own words follow: the receipts window and the toasts name the card their page shows', /under <b>RECEIPTS RECEIVED — NOT ON AN INVOICE YET<\/b>/.test(src) && /On their page under RECEIPTS RECEIVED — /.test(src) && !/under UPCOMING —/.test(src) && !/ESTIMATED UPCOMING COSTS<\/b>/.test(src));
  await page.evaluate(() => closeEstimates());

  console.log('— 🏠 the homeowner\'s page —');
  const home = async (json, q = '') => {
    const p = await ctx.newPage();
    p.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push('client: ' + e.message); });
    await p.addInitScript(json => {
      const real = window.fetch.bind(window);
      window.fetch = (url, opts) => (/client-portal/.test(String(url)) && !(opts && opts.method === 'POST'))
        ? Promise.resolve(new Response(json, { status: 200, headers: { 'content-type': 'application/json' } })) : real(url, opts);
    }, JSON.stringify(json));
    await p.goto(appUrl.replace(/index\.html$/, 'c/index.html') + '?c=' + CODE + q);
    await p.waitForTimeout(900);
    return p;
  };
  const cards = p => p.evaluate(() => { const t = id => { const c = document.getElementById(id); return c ? { h: c.querySelector('h3').textContent.trim(), tot: c.querySelector('.bud-total').textContent.trim(), sub: c.querySelector('.bud-total-l').textContent.replace(/\s+/g, ' ').trim(), text: c.textContent.replace(/\s+/g, ' ').trim(),
      rows: [...c.querySelectorAll('.rc-row, .bud-row')].map(r => r.textContent.replace(/\s+/g, ' ').trim()) } : null; };
    return { up: t('upcomingCard'), bud: t('budgetCard'), order: [...document.querySelectorAll('#app .card')].map(c => c.id).filter(Boolean), app: document.getElementById('app').textContent.replace(/\s+/g, ' ') }; });
  const base = { name: 'Oak House', updated: '2026-09-21', show: { money: true }, invoiced: 2500, paid: 2500, open: 0, phases: [{ name: 'Shell', cats: [['Framing', 2500]] }], journal: [] };

  const pOld = await home({ ...base, budget: [{ n: 'Framing', est: 10000, up: 1000 }], upcoming: { items: [{ n: 'Plumbing', a: 600 }], tot: 600 } });
  const o = await cards(pOld);
  ok('the receipts card: its name, every receipt that waits — a page written before v7.45 has the approved line\'s receipt joined in — and the total of them all', !!o.up && o.up.h === '🧾 RECEIPTS RECEIVED — NOT ON AN INVOICE YET' && o.up.tot === '$1,600.00' && o.up.sub === 'ALREADY BOUGHT OR DONE FOR YOUR JOB — COMING ON YOUR NEXT INVOICE' && o.up.rows.join('|') === 'Plumbing$600.00|Framing$1,000.00' && /shown as it will appear on your invoice/.test(o.up.text), JSON.stringify(o.up));
  ok('the remaining card: its name, and the big number is what is still AHEAD — the estimate, less what is billed, less the receipts that wait', !!o.bud && o.bud.h === 'ESTIMATED REMAINING COSTS' && o.bud.tot === '$6,500.00' && /^STILL AHEAD ON THE APPROVED WORK · ESTIMATE \$10,000\.00 · \$2,500\.00 BILLED SO FAR · 🧾 \$1,000\.00 IN RECEIPTS NOT INVOICED YET$/.test(o.bud.sub), JSON.stringify(o.bud && [o.bud.h, o.bud.tot, o.bud.sub]));
  ok('each line says what remains, and shows its sum: the estimate, what is billed, the receipts that wait', o.bud.rows.length === 1 && /^Framing \$6,500\.00 remaining estimate \$10,000\.00 · \$2,500\.00 billed so far · 🧾 \$1,000\.00 in receipts not invoiced yet/.test(o.bud.rows[0]) && /"Remaining" is each estimate, less what has been billed to that line so far and less the receipts still waiting for an invoice/.test(o.bud.text), JSON.stringify(o.bud.rows));
  ok('the money reads in the order it happens: where it stands · the receipts received · the costs remaining', o.order.filter(id => /^(money|upcoming|budget)Card$/.test(id)).join('|') === 'moneyCard|upcomingCard|budgetCard', o.order.join('|'));
  ok('the old names are gone from their page, and nothing names a markup, a vendor or a guess', !/ESTIMATED UPCOMING COSTS|BUDGET — APPROVED ESTIMATES|on the way/.test(o.app) && !/markup|Lumber Co|Pipe Shop|guess|placeholder/i.test(o.app));
  ok('a dollar is on the list or in the remainder, never both: invoiced + receipts + remaining = the estimate', (() => { const n = s => +String(s).replace(/[^\d.]/g, ''); return n(o.up.rows[1].split('$')[1]) + n(o.bud.tot) + 2500 === 10000; })());
  ok('at 390px neither card runs off the side', await pOld.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth && [...document.querySelectorAll('#upcomingCard, #budgetCard')].every(c => c.scrollWidth <= c.clientWidth + 1)));
  await pOld.close();

  const pNew = await home({ ...base, budget: [{ n: 'Framing', est: 10000, up: 1000 }], upcoming: { items: [{ n: 'Framing', a: 1000 }, { n: 'Plumbing', a: 600 }], tot: 1600, all: 1 } });
  const nw = await cards(pNew);
  ok('a page written since v7.45 carries them all already — nothing is counted twice', nw.up.tot === '$1,600.00' && nw.up.rows.join('|') === 'Framing$1,000.00|Plumbing$600.00' && nw.bud.tot === '$6,500.00', JSON.stringify([nw.up.tot, nw.up.rows, nw.bud.tot]));
  await pNew.close();

  const pOver = await home({ ...base, invoiced: 1300, paid: 1300, phases: [{ name: 'Shell', cats: [['Framing', 900], ['Roofing', 400]] }], budget: [{ n: 'Framing', est: 1000, up: 300 }, { n: 'Roofing', est: 2000 }], upcoming: { items: [{ n: 'Framing', a: 300 }], tot: 300, all: 1 } });
  const ov = await cards(pOver);
  ok('a line past its estimate says ⚠ over by, in words, and takes nothing off the rest: the remainder is the other line\'s alone', /^Framing ⚠ over by \$200\.00 estimate \$1,000\.00 · \$900\.00 billed so far · 🧾 \$300\.00 in receipts/.test(ov.bud.rows[0]) && /^Roofing \$1,600\.00 remaining estimate \$2,000\.00 · \$400\.00 billed so far$/.test(ov.bud.rows[1]) && ov.bud.tot === '$1,600.00' && /⚠ OVER BY \$200\.00$/.test(ov.bud.sub), JSON.stringify([ov.bud.rows, ov.bud.tot, ov.bud.sub]));
  await pOver.close();

  const pNone = await home({ ...base, budget: [{ n: 'Framing', est: 10000 }] });
  const no = await cards(pNone);
  ok('nothing waiting: the receipts card is still there and says so; the remaining card has no receipts line', no.up.h === '🧾 RECEIPTS RECEIVED — NOT ON AN INVOICE YET' && no.up.tot === '$0.00' && no.up.sub === 'NOTHING WAITING — ALL CAUGHT UP' && /every receipt for your job so far is already on an invoice/.test(no.up.text) && no.bud.tot === '$7,500.00' && !/🧾/.test(no.bud.sub) && !/receipts/.test(no.bud.rows[0]), JSON.stringify([no.up, no.bud.sub, no.bud.rows]));
  await pNone.close();

  console.log('— 🧾 never more sure than the page is —');
  ok('with the books\' split up to date the card adds no caution', !/may be less than shown/.test(o.bud.text) && !/not split out/.test(o.bud.text));
  const pBehind = await home({ ...base, invoiced: 9000, paid: 9000, phases: [], budget: [{ n: 'Framing', est: 10000, up: 1000 }], upcoming: { items: [{ n: 'Framing', a: 1000 }], tot: 1000, all: 1 } });
  const bh = await cards(pBehind);
  ok('invoiced, but nothing split out by line: no line claims $0.00 billed — it says the split is not there yet, and that what truly remains may be less', bh.bud.tot === '$9,000.00' && /ESTIMATE \$10,000\.00 · WHAT IS BILLED IS NOT SPLIT OUT BY LINE YET · 🧾 \$1,000\.00 IN RECEIPTS NOT INVOICED YET$/.test(bh.bud.sub) && /estimate \$10,000\.00 · what is billed is not split out by line yet · 🧾 \$1,000\.00 in receipts not invoiced yet/.test(bh.bud.rows[0]) && !/\$0\.00 billed/i.test(bh.bud.text) && /Some of what has been invoiced is not matched to a line here yet, so what truly remains may be less than shown\./.test(bh.bud.text), JSON.stringify([bh.bud.sub, bh.bud.rows]));
  await pBehind.close();
  const pPart = await home({ ...base, invoiced: 9000, paid: 9000, budget: [{ n: 'Framing', est: 10000 }] });
  const pt = await cards(pPart);
  ok('part of it split out: the line shows what the books have against it, and the caution stands', pt.bud.tot === '$7,500.00' && /estimate \$10,000\.00 · \$2,500\.00 billed so far$/.test(pt.bud.rows[0].replace(/\s*$/, '')) && /may be less than shown/.test(pt.bud.text), JSON.stringify([pt.bud.tot, pt.bud.rows]));
  await pPart.close();

  const pOpt = await home({ ...base, phases: [], budget: [{ n: 'Siding', opts: [{ t: 'Vinyl', est: 8000 }, { t: 'Repaint', est: 3000 }], def: 0 }] }, '&pv=1');
  ok('a line with choices: the remainder rides the planned option until they tap, then follows their pick', await (async () => {
    const a = (await cards(pOpt)).bud;
    await pOpt.evaluate(() => [...document.querySelectorAll('#budgetCard .opt-pick')][1].click());
    await pOpt.waitForTimeout(150);
    const b = (await cards(pOpt)).bud;
    return a.tot === '$8,000.00' && /CHOOSE YOUR OPTION/.test(a.rows[0]) && b.tot === '$3,000.00' && /YOUR CHOICE \$3,000\.00 remaining/.test(b.rows[0]);
  })());
  await pOpt.close();

  ok('the alias table is still the same on both sides (the v6.39 rule)', (() => { const a = (src.match(/const EST_ALIASES = (\{[^\n]*\});/) || [])[1], b = (csrc.match(/const EST_ALIASES = (\{[^\n]*\});/) || [])[1]; return !!a && a === b; })());
  ok('version bumped — APP_VER and the footer agree', /const APP_VER = 'v7\.(4[5-9]|[5-9]\d)'/.test(src) && new RegExp('<footer>' + (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1].replace('.', '\\.') + ' ·').test(src));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors on either page', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
