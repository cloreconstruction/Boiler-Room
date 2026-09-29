// ≈ v7.46 — Eric: "The client page on the estimates coming in needs to make clear that they're placeholder numbers so that people
// don't panic when they're too high or weirdly low." A number he marked ≈ best guess on the estimates board (v7.45) now says so
// on the homeowner's page: ≈ on the number, the word PLACEHOLDER under the line's name, a dashed edge, and a note before the first
// line saying what a placeholder is — a rough figure that holds the spot until the real bid comes in, higher or lower. The mark
// rides as one letter on the line (g); nothing else about the bid goes. Every name and figure here is made up.
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
  const CODE = 'oak-111111';

  const seed = (board, pg) => page.evaluate(([CODE, board, pg]) => {
    jobs = ['Oak House']; crew = []; entries = []; todos = []; nextId = 1;
    window.scheduleSave = () => {};
    dbx.refreshToken = 'test-token';
    _portalIdx = { clients: [{ key: 'oak', job: 'Oak House', code: CODE }] };
    window._dbxFiles = {}; window._ups = [];
    window.dbxDownload = async p => (window._dbxFiles || {})[p] ?? null;
    window.dbxUpload = async (p, body) => { (window._dbxFiles || {})[p] = body; window._ups.push(p); return {}; };
    window.dbxPathExists = async p => Object.prototype.hasOwnProperty.call(window._dbxFiles || {}, p);
    if (!window._said) { window._said = []; const t0 = window.toast; window.toast = (m, g) => { if (m) _said.push(String(m)); return t0(m, g); }; }
    _said.length = 0;
    window._dbxFiles[estPath(CODE)] = JSON.stringify(board);
    window._dbxFiles[portalRoot() + '/' + CODE + '.json'] = JSON.stringify(pg);
    _estIdx = -1; _estD = null; _estPage = null; window._qUpBusy = false;
  }, [CODE, board, pg]);
  const pageJson = () => page.evaluate(CODE => JSON.parse(window._dbxFiles[portalRoot() + '/' + CODE + '.json']), CODE);
  const ciOf = n => page.evaluate(n => _estD.cats.findIndex(x => x.n === n), n);
  const basePg = { name: 'Oak House', updated: '2026-09-21', show: { money: true }, invoiced: 0, paid: 0, open: 0, phases: [], journal: [] };

  console.log('— ≈ the mark reaches their page —');
  await seed({ mk: 20, cats: [
    { n: 'Framing', appr: true, bids: [{ e1: 10000, e2: 0, acc: true, inc: true, note: 'from Big Lumber', docs: [] }] },
    { n: 'Plumbing', appr: true, bids: [{ e1: 3000, e2: 0, acc: true }] },
    { n: 'Electrical', appr: false, bids: [{ e1: 4000, e2: 0, acc: true, inc: true }] },
    { n: 'Siding', appr: true, bids: [{ e1: 8000, e2: 0, acc: true, inc: true, opt: true, lbl: 'Vinyl' }, { e1: 3000, e2: 0, inc: true, opt: true, lbl: 'Repaint', guess: true }] }] },
    { ...basePg, budget: [{ n: 'Framing', est: 10000 }, { n: 'Plumbing', est: 3600 }, { n: 'Siding', opts: [{ t: 'Vinyl', est: 8000 }, { t: 'Repaint', est: 3000 }], def: 0, pick: 1, lk: true }] });
  await page.evaluate(async () => { await openEstimates(0); });
  await page.waitForTimeout(1700);
  ok('opening the board puts a page\'s marks right when they differ from the board\'s — and the homeowner\'s own pick and lock ride through', await (async () => {
    const pg = await pageJson(), s = pg.budget.find(b => b.n === 'Siding');
    return await page.evaluate(() => _said.some(t => /Marking the placeholder numbers on their page/.test(t))) && s.opts[1].g === 1 && !('g' in s.opts[0]) && s.pick === 1 && s.lk === true && !('g' in pg.budget.find(b => b.n === 'Framing'));
  })(), JSON.stringify((await pageJson()).budget));
  ok('a page whose marks already agree is left alone', await (async () => {
    await page.evaluate(() => { closeEstimates(); window._ups.length = 0; _said.length = 0; });
    await page.evaluate(async () => { await openEstimates(0); }); await page.waitForTimeout(1600);
    return page.evaluate(() => window._ups.length === 0 && _said.every(t => !/placeholder/i.test(t)));
  })(), await page.evaluate(() => JSON.stringify([window._ups, _said])));
  ok('≈ on a line that is ON their page reaches it at once: the line gets g, the toast says their page says PLACEHOLDER', await (async () => {
    const ci = await ciOf('Plumbing');
    await page.evaluate(ci => { estFold(ci); _said.length = 0; window._ups.length = 0; }, ci);
    await page.evaluate(async ci => { await estBidGuess(ci, 0); }, ci);
    const pg = await pageJson(), b = pg.budget.find(x => x.n === 'Plumbing');
    return b.g === 1 && b.est === 3600 && await page.evaluate(CODE => window._ups.includes(portalRoot() + '/' + CODE + '.json') && _said.some(t => /Plumbing — marked as your best guess.*Their page says PLACEHOLDER on it/.test(t)), CODE);
  })(), JSON.stringify((await pageJson()).budget));
  ok('the board row says their page says so too', await page.evaluate(() => { const r = [...document.querySelectorAll('.est-row')].find(x => x.querySelector('.est-name').textContent.includes('Plumbing')); return /≈ PLACEHOLDER — best guess, no bid yet \(their page says so too\)/.test(r.querySelector('.est-sub').textContent.replace(/\s+/g, ' ')); }));
  ok('the plate again takes it off their page at once', await (async () => {
    const ci = await ciOf('Plumbing');
    await page.evaluate(async ci => { _said.length = 0; await estBidGuess(ci, 0); }, ci);
    const b = (await pageJson()).budget.find(x => x.n === 'Plumbing');
    return !('g' in b) && await page.evaluate(() => _said.some(t => /a real bid backs it now\. The highlight is off, here and on their page/.test(t)));
  })());
  ok('a line that is NOT on their page is marked on the board alone — their page is not written', await (async () => {
    const ci = await ciOf('Electrical');
    await page.evaluate(ci => { window._ups.length = 0; _said.length = 0; estBidGuess(ci, 0); }, ci);
    await page.waitForTimeout(1500);
    return page.evaluate(([ci, CODE]) => _estD.cats[ci].bids[0].guess === true && !window._ups.includes(portalRoot() + '/' + CODE + '.json') && _said.some(t => /Electrical — marked as your best guess/.test(t) && !/Their page/.test(t)), [ci, CODE]);
  })(), await page.evaluate(() => JSON.stringify([window._ups, _said])));
  ok('only the one letter goes: no note, no bid paper, no vendor, no markup, not the word guess', await (async () => {
    const ci = await ciOf('Framing');
    await page.evaluate(async ci => { await estBidGuess(ci, 0); }, ci);
    const pg = await pageJson(), f = pg.budget.find(x => x.n === 'Framing');
    return f.g === 1 && Object.keys(f).sort().join(',') === 'est,g,n' && !/Big Lumber|guess|markup|docs|note/i.test(JSON.stringify(pg.budget));
  })(), JSON.stringify((await pageJson()).budget));
  ok('? How this works says their page says it too', await page.evaluate(() => /their page says it too: ≈ on the number and the word PLACEHOLDER/.test($('estHelpBox').textContent)));
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
  const card = p => p.evaluate(() => { const c = document.getElementById('budgetCard'); if (!c) return null;
    return { tot: c.querySelector('.bud-total').textContent.trim(), sub: c.querySelector('.bud-total-l').textContent.replace(/\s+/g, ' ').trim(), note: (c.querySelector('#budPhNote') || { textContent: '' }).textContent.replace(/\s+/g, ' ').trim(),
      noteFirst: !!c.querySelector('#budPhNote') && !!c.querySelector('.bud-row') && !!(c.querySelector('#budPhNote').compareDocumentPosition(c.querySelector('.bud-row')) & Node.DOCUMENT_POSITION_FOLLOWING),
      rows: [...c.querySelectorAll('.bud-row')].map(r => { const cs = getComputedStyle(r); return { t: r.textContent.replace(/\s+/g, ' ').trim(), ph: r.classList.contains('bud-ph'), tag: (r.querySelector('.bud-ph-tag') || { textContent: '' }).textContent.trim(), left: r.querySelector('.bud-left').textContent.trim(), edge: cs.borderLeftStyle, edgeW: parseFloat(cs.borderLeftWidth) }; }),
      up: (document.getElementById('upcomingCard') || { textContent: '' }).textContent, fits: document.documentElement.scrollWidth <= document.documentElement.clientWidth && c.scrollWidth <= c.clientWidth + 1 }; });

  const some = await home({ ...basePg, budget: [{ n: 'Framing', est: 10000 }, { n: 'Plumbing', est: 3600, g: 1, up: 600 }, { n: 'Roofing', est: 6000, g: 1 }], upcoming: { items: [{ n: 'Plumbing', a: 600 }], tot: 600, all: 1 } });
  const s = await card(some);
  ok('a placeholder line wears ≈ on what remains, the word PLACEHOLDER under its name in plain words, and a dashed edge — a real number wears none of it', s.rows.length === 3 && !s.rows[0].ph && s.rows[0].left === '$10,000.00 remaining' && !s.rows[0].tag && s.rows[0].edge !== 'dashed' &&
    s.rows[1].ph && s.rows[1].left === '≈ $3,000.00 remaining' && s.rows[1].tag === '≈ PLACEHOLDER — a rough number until the real bid comes in' && s.rows[1].edge === 'dashed' && s.rows[1].edgeW >= 3 && /estimate ≈ \$3,600\.00 · /.test(s.rows[1].t) &&
    s.rows[2].ph && s.rows[2].left === '≈ $6,000.00 remaining', JSON.stringify(s.rows));
  ok('before the first line the card says what a placeholder is — how many there are, that the real number replaces it, that it may be higher or lower', /^≈ 2 OF THESE 3 ARE PLACEHOLDER NUMBERS — a rough figure that holds the spot until the real bid comes in\. It will be replaced by the real number, which may be higher or lower\.$/.test(s.note) && s.noteFirst, s.note);
  ok('the big number and the estimate wear ≈ too, and the line under them says how much of the estimate is placeholder numbers', s.tot === '≈ $19,000.00' && /ESTIMATE ≈ \$19,600\.00 · ≈ \$9,600\.00 OF IT IS PLACEHOLDER NUMBERS · /.test(s.sub), JSON.stringify([s.tot, s.sub]));
  ok('the receipts card is about real receipts — no ≈ and no placeholder word on it', !/≈|PLACEHOLDER|placeholder/.test(s.up) && /Plumbing/.test(s.up));
  ok('at 390px the card does not run off the side', s.fits);
  ok('the light page shows the same mark (the edge, the glyph, the words)', await (async () => {
    await some.evaluate(() => { document.documentElement.setAttribute('data-theme', document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light'); });
    const t = await card(some);
    return t.rows[1].edge === 'dashed' && t.rows[1].edgeW >= 3 && t.rows[1].left === '≈ $3,000.00 remaining' && /PLACEHOLDER/.test(t.rows[1].tag);
  })());
  await some.close();

  const all = await home({ ...basePg, budget: [{ n: 'Plumbing', est: 3600, g: 1 }, { n: 'Roofing', est: 6000, g: 1 }] });
  const a = await card(all);
  ok('every line a placeholder: the note says THESE ARE PLACEHOLDER NUMBERS', /^≈ THESE ARE PLACEHOLDER NUMBERS — /.test(a.note) && a.rows.every(r => r.ph), a.note);
  await all.close();
  const one = await home({ ...basePg, budget: [{ n: 'Plumbing', est: 3600, g: 1 }] });
  ok('one line, a placeholder: THIS IS A PLACEHOLDER NUMBER', /^≈ THIS IS A PLACEHOLDER NUMBER — /.test((await card(one)).note));
  await one.close();

  const none = await home({ ...basePg, budget: [{ n: 'Framing', est: 10000 }, { n: 'Plumbing', est: 3600 }] });
  const n0 = await card(none);
  ok('no placeholder on the page: no note, no ≈, no dashed edge — the card reads as before', !n0.note && n0.tot === '$13,600.00' && !/≈|PLACEHOLDER/i.test(n0.sub + n0.rows.map(r => r.t).join(' ')) && n0.rows.every(r => !r.ph && r.edge !== 'dashed'), JSON.stringify(n0));
  await none.close();

  const over = await home({ ...basePg, invoiced: 5000, phases: [{ name: 'Shell', cats: [['Plumbing', 5000]] }], budget: [{ n: 'Plumbing', est: 3600, g: 1 }] });
  const ov = await card(over);
  ok('a placeholder already past its number says ⚠ over by — and still says it was a placeholder', /^⚠ over by \$1,400\.00$/.test(ov.rows[0].left) && ov.rows[0].ph && /PLACEHOLDER/.test(ov.rows[0].tag), JSON.stringify(ov.rows));
  await over.close();

  const opt = await home({ ...basePg, budget: [{ n: 'Siding', opts: [{ t: 'Vinyl', est: 8000 }, { t: 'Repaint', est: 3000, g: 1 }], def: 0 }] }, '&pv=1');
  ok('a line with choices: the placeholder option wears ≈ and the words inside its own box; the line is a placeholder only while the total rides that option', await (async () => {
    const before = await card(opt);
    const boxes = await opt.evaluate(() => [...document.querySelectorAll('#budgetCard .opt-pick')].map(b => b.textContent.replace(/\s+/g, ' ').trim()));
    await opt.evaluate(() => [...document.querySelectorAll('#budgetCard .opt-pick')][1].click());
    await opt.waitForTimeout(150);
    const after = await card(opt);
    return !before.rows[0].ph && before.tot === '$8,000.00' && !before.note && /Vinyl\s*\$8,000\.00/.test(boxes[0]) && !/≈/.test(boxes[0]) && /Repaint\s*≈ \$3,000\.00/.test(boxes[1]) && /≈ placeholder — a rough number until the real bid comes in/.test(boxes[1]) &&
      after.rows[0].ph && after.tot === '≈ $3,000.00' && /^≈ THIS IS A PLACEHOLDER NUMBER/.test(after.note) && /YOUR CHOICE ≈ \$3,000\.00 remaining/.test(after.rows[0].t);
  })());
  await opt.close();

  ok('version bumped — APP_VER and the footer agree', /const APP_VER = 'v7\.(4[6-9]|[5-9]\d)'/.test(src) && new RegExp('<footer>' + (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1].replace('.', '\\.') + ' ·').test(src));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors on either page', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
