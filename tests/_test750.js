// 🏷 ✓ v7.50 — TWO MORE ON THE ESTIMATES BOARD.
// (1) Eric: "The two receipts that make up the [amount on the way] are both in the wrong category, so I need buttons to change them
//     to the right category."
// (2) Eric: "there's still some demo to go, but we are way, way under the original estimate. How can I show that on the progress
//     bar? Or I can show when a category is complete. That way, the original estimate and where it's at on the progress bar can be
//     locked in and done."
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
    window.showPhoto = p => { window._shown = p; };
    window._dbxFiles[estPath(CODE)] = JSON.stringify(board);
    window._dbxFiles[portalRoot() + '/' + CODE + '.json'] = JSON.stringify(pg);
    _estIdx = -1; _estD = null; _estPage = null; window._qUpBusy = false;
  }, [CODE, board, pg]);
  const pageJson = () => page.evaluate(CODE => JSON.parse(window._dbxFiles[portalRoot() + '/' + CODE + '.json']), CODE);
  const boardJson = () => page.evaluate(CODE => JSON.parse(window._dbxFiles[estPath(CODE)]), CODE);
  const pageUps = () => page.evaluate(CODE => window._ups.filter(p => p === portalRoot() + '/' + CODE + '.json').length, CODE);
  const open = async () => { await page.evaluate(async () => { await openEstimates(0); }); await page.waitForTimeout(1500); };
  const ciOf = n => page.evaluate(n => _estD.cats.findIndex(x => x.n === n), n);
  const rowOf = n => page.evaluate(n => { const ci = _estD.cats.findIndex(x => x.n === n), r = document.querySelector(`.est-row[data-ci="${ci}"]`);
    if (!r) return null; let h = r.previousElementSibling; while (h && !h.classList.contains('est-phase')) h = h.previousElementSibling;
    const bar = r.querySelector('.est-bar'), fill = r.querySelector('.est-bar-fill');
    return { num: r.querySelector('.est-num').textContent.trim(), sub: (r.querySelector('.est-sub') || { textContent: '' }).textContent.replace(/\s+/g, ' ').trim(), done: r.classList.contains('est-done'), lamp: r.querySelector('.est-lamp').textContent.trim(),
      under: h ? h.textContent.replace(/\s+/g, ' ').trim() : '', edge: getComputedStyle(r).borderLeftStyle, edgeW: parseFloat(getComputedStyle(r).borderLeftWidth),
      bar: bar ? { done: bar.classList.contains('done'), w: fill.style.width, label: bar.getAttribute('aria-label'), bg: getComputedStyle(bar).backgroundImage } : null,
      say: (r.querySelector('.est-done-say') || { textContent: '' }).textContent.replace(/\s+/g, ' ').trim(), plates: [...r.querySelectorAll('.chips-row .btn-ghost.req-x')].map(b => b.textContent.trim()), bids: r.querySelectorAll('.est-bid').length }; }, n);
  const win = () => page.evaluate(() => { const b = $('estWhatBox'); if (!b) return null;
    return { head: b.querySelector('.we-head b').textContent.trim(), tabs: [...b.querySelectorAll('.ew-tab')].map(t => t.textContent.replace(/\s+/g, ' ').trim() + (t.classList.contains('sel') ? ' [ON]' : '')),
      rows: [...b.querySelectorAll('.ew-row')].map(r => ({ kind: r.dataset.kind, eid: r.dataset.eid ? +r.dataset.eid : null, amt: r.querySelector('.ew-amt b').textContent.trim(), meta: [...r.querySelectorAll('.ew-meta')].map(m => m.textContent.replace(/\s+/g, ' ').trim()),
        words: (r.querySelector('.ew-words') || { textContent: '' }).textContent.trim(), mv: (r.querySelector('.ew-move-btn') || { textContent: '' }).textContent.trim(), open: !!r.querySelector('#ewMove') })),
      mover: $('ewMove') ? { label: $('ewMove').querySelector('label').textContent.trim(), groups: [...$('ewMoveTo').querySelectorAll('optgroup')].map(g => g.label), names: [...$('ewMoveTo').querySelectorAll('optgroup option')].map(o => o.textContent), first: $('ewMoveTo').options[0].textContent, hint: $('ewMove').querySelector('.hint').textContent.trim(),
        h: Math.round($('ewMoveTo').getBoundingClientRect().height) } : null,
      fits: b.scrollWidth <= b.clientWidth + 1 && document.documentElement.scrollWidth <= document.documentElement.clientWidth }; });
  const basePg = { name: 'Oak House', updated: '2026-09-21', show: { money: true }, invoiced: 5900, paid: 5900, open: 0, journal: [],
    phases: [{ n: 1, name: 'Site', total: 2000, cats: [['Demo Labor', 2000]] }, { n: 2, name: 'Shell', total: 3900, cats: [['Framing Labor', 2400], ['Roofing', 1500]] }] };

  await seed({ mk: 20, cats: [
    { n: 'Demo', appr: true, bids: [{ e1: 20000, e2: 0, acc: true }] },
    { n: 'Framing', appr: true, bids: [{ e1: 10000, e2: 0, acc: true, inc: true }] },
    { n: 'Roofing', appr: true, bids: [{ e1: 1000, e2: 0, acc: true, inc: true }] },
    { n: 'Siding', appr: true, bids: [{ e1: 8000, e2: 0, acc: true, inc: true, opt: true, lbl: 'Vinyl' }, { e1: 3000, e2: 0, inc: true, opt: true, lbl: 'Repaint', guess: true }] },
    { n: 'Plumbing', appr: false, bids: [{ e1: 3000, e2: 0, acc: true }] }] }, basePg);
  await page.evaluate(() => {
    entries = []; nextId = 1;
    const mk = (txt, day, o) => { const e = addEntry('Note', txt, 'Oak House', {}); Object.assign(e, { rcpt: true, ts: new Date(day + 'T10:30:00') }, o); return e; };
    const A = mk('studs for the east wall', '2026-09-10', { category: 'Demo', ai: '📅 2026-09-09\n🏪 Lumber Co\n💵 $500.00', photoPath: '/p/a.jpg', budg: 'sent' });
    const N = mk('pipe, not sent yet', '2026-09-12', { category: 'Demo', ai: '🏪 Pipe Shop\n💵 $80.00' });
    window._E = { A: A.id, N: N.id };
    const b = JSON.parse(window._dbxFiles[estPath('oak-111111')]);
    b.cats[0].pend = [{ a: 500, v: 'Lumber Co', ts: '2026-09-11', base: 2000, eid: A.id, al: 1 }, { a: 100, inc: true, v: 'Dump Co', ts: '2026-09-13', base: 2000, al: 1 }];
    b.cats.push({ n: 'Labor', appr: false, bids: [], pend: [{ a: 900, inc: true, kind: 'labor', wk: '2026-08-30', hrs: 12, v: '', ts: '2026-09-05', base: 5900 }] });
    window._dbxFiles[estPath('oak-111111')] = JSON.stringify(b);
  });
  await open();
  await page.waitForTimeout(600);

  // ───────────────────────── 🏷 a receipt on the wrong line ─────────────────────────
  console.log('— 🏷 a receipt on the wrong category —');
  await page.evaluate(() => document.querySelector(`.est-row[data-ci="${_estD.cats.findIndex(x => x.n === 'Demo')}"] .est-what[data-what="way"]`).click());
  await page.waitForTimeout(150);
  const w0 = await win();
  ok('every receipt on the way wears 🏷 Wrong category? Move it — the one with a receipt behind it and the one typed in by hand', !!w0 && w0.head === '💵 Demo' && w0.rows.length === 2 && w0.rows.every(r => r.mv === '🏷 Wrong category? Move it') && !w0.mover, JSON.stringify(w0 && w0.rows));
  ok('a week of crew labor has no such plate — it stays on its own line', await (async () => { await page.evaluate(() => estWhatScope(true)); const w = await win(); const l = w.rows.find(r => r.kind === 'labor');
    await page.evaluate(() => { estMoveOpen(_estD.cats.findIndex(x => x.n === 'Labor'), 0); });
    const said = await page.evaluate(() => _said.some(t => /^👷 A week of crew labor stays on its own line$/.test(t)));
    await page.evaluate(() => estWhatScope(false));
    return !!l && !l.mv && said && !(await win()).mover; })());
  await page.evaluate(() => document.querySelector(`#estWhatBox .ew-row[data-eid="${_E.A}"] .ew-move-btn`).click());
  await page.waitForTimeout(150);
  const w1 = await win();
  ok('a tap opens the way to the right line under THAT receipt: the board\'s categories in a wheel, under their phases — the line it is on left out', !!w1.mover && w1.rows.find(r => r.eid != null).open && !w1.rows.find(r => r.eid == null).open &&
    /^Move it off Demo — onto which category\?$/.test(w1.mover.label) && w1.mover.first === '— pick the category —' && w1.mover.groups.join('|') === 'Site & utilities|Foundation & shell|Mechanical|Interior finish|Other costs' && !w1.mover.names.includes('Demo') && w1.mover.names.includes('Framing') && w1.mover.names[w1.mover.names.length - 1] === 'Labor' && w1.mover.h >= 44, JSON.stringify(w1.mover && [w1.mover.label, w1.mover.groups, w1.mover.names.length, w1.mover.h]));
  ok('✓ Move it with nothing picked moves nothing, and says so', await (async () => {
    await page.evaluate(() => document.querySelector('#ewMove .ew-move-go').click());
    await page.waitForTimeout(100);
    return await page.evaluate(() => _estD.cats.find(x => x.n === 'Demo').pend.length === 2 && _said.some(t => /^Pick the category it belongs on first$/.test(t)));
  })());
  const upsBefore = await pageUps();
  await page.evaluate(() => { const s = $('ewMoveTo'); s.value = [...s.options].find(o => o.textContent === 'Framing').value; document.querySelector('#ewMove .ew-move-go').click(); });
  await page.waitForTimeout(500);
  ok('moved: off Demo, onto Framing — and its base is measured against the NEW line as the books stand today', await page.evaluate(() => { const d = _estD.cats.find(x => x.n === 'Demo'), f = _estD.cats.find(x => x.n === 'Framing');
    return d.pend.length === 1 && d.pend[0].v === 'Dump Co' && f.pend.length === 1 && f.pend[0].eid === _E.A && f.pend[0].a === 500 && f.pend[0].base === 2400 && f.pend[0].al === 1 && f.pend[0].ts === '2026-09-11' && f.pend[0].mv.length === 1 && f.pend[0].mv[0].from === 'Demo'; }), await page.evaluate(() => JSON.stringify(_estD.cats.filter(x => x.pend).map(x => [x.n, x.pend]))));
  ok('the receipt in his log has the new category', await page.evaluate(() => entries.find(e => e.id === _E.A).category === 'Framing' && entries.find(e => e.id === _E.A).budg === 'sent'));
  ok('their page follows at once: the receipt is under Framing, Demo keeps only what is still on it — and the two lines\' own receipts agree', await (async () => { const pg = await pageJson();
    const it = Object.fromEntries((pg.upcoming.items || []).map(i => [i.n, i.a])), b = Object.fromEntries((pg.budget || []).map(x => [x.n, x.up || 0]));
    return (await pageUps()) === upsBefore + 1 && it.Framing === 600 && it.Demo === 100 && pg.upcoming.tot === 1600 && b.Framing === 600 && b.Demo === 100 && !/Lumber Co|Dump Co/.test(JSON.stringify(pg)); })(), JSON.stringify((await pageJson()).upcoming));
  const w2 = await win();
  ok('the window follows the receipt to its new line, and the row says where it came from', w2.head === '💵 Framing' && w2.rows.length === 1 && w2.rows[0].eid != null && /🏷 moved here from Demo/.test(w2.rows[0].meta.join(' ')) && /🏷 Framing$/.test(w2.rows[0].meta[0]) && !w2.mover && await page.evaluate(() => _said.some(t => /^🏷 Moved — off Demo, onto Framing\. Their page has it under Framing now ✓$/.test(t))), JSON.stringify(w2.rows));
  ok('the board shut and opened again: the moved bill is STILL on the way — the dollars the books already held on Framing did not retire it', await (async () => {
    await page.evaluate(() => closeEstimates()); await open();
    return await page.evaluate(() => { const f = _estD.cats.find(x => x.n === 'Framing'); return (f.pend || []).length === 1 && !(_estD.cleared || []).length && !_said.some(t => /matched in QuickBooks/.test(t)); });
  })());
  ok('inside the OPEN category each bill on the way has the same plate, and it opens the same way', await (async () => {
    await page.evaluate(() => { _estOpenCats = new Set(); estFold(_estD.cats.findIndex(x => x.n === 'Demo')); });
    const n = await page.evaluate(() => document.querySelectorAll('.est-row.est-open .est-pend-mv').length);
    await page.evaluate(() => document.querySelector('.est-row.est-open .est-pend-mv').click());
    await page.waitForTimeout(150);
    const w = await win();
    return n === 1 && !!w && w.head === '💵 Demo' && !!w.mover && w.rows[0].open && w.rows[0].eid == null;
  })());
  ok('a bill typed in by hand moves too', await (async () => {
    await page.evaluate(() => { const s = $('ewMoveTo'); s.value = [...s.options].find(o => o.textContent === 'Plumbing').value; document.querySelector('#ewMove .ew-move-go').click(); });
    await page.waitForTimeout(500);
    const pg = await pageJson(), it = Object.fromEntries((pg.upcoming.items || []).map(i => [i.n, i.a]));
    return await page.evaluate(() => !_estD.cats.find(x => x.n === 'Demo').pend && _estD.cats.find(x => x.n === 'Plumbing').pend[0].v === 'Dump Co' && _estD.cats.find(x => x.n === 'Plumbing').pend[0].base === 0) && it.Plumbing === 100 && !('Demo' in it);
  })(), JSON.stringify((await pageJson()).upcoming));
  ok('🧾 NOT SENT: a receipt that was never sent changes its category the same way — only his log changes, nothing is written to their page', await (async () => {
    const before = await pageUps();
    await page.evaluate(() => { estWhatOpen(_estD.cats.findIndex(x => x.n === 'Demo'), 'log'); });
    const w = await win();
    await page.evaluate(() => document.querySelector(`#estWhatBox .ew-row[data-eid="${_E.N}"] .ew-move-btn`).click());
    await page.waitForTimeout(100);
    const m = (await win()).mover;
    await page.evaluate(() => { const s = $('ewMoveTo'); s.value = [...s.options].find(o => o.textContent === 'Plumbing').value; document.querySelector('#ewMove .ew-move-go').click(); });
    await page.waitForTimeout(300);
    const w3 = await win();
    return w.rows.length === 1 && w.rows[0].mv === '🏷 Wrong category? Move it' && /^File it under which category instead of Demo\?$/.test(m.label) && /only the receipt in your log changes/.test(m.hint) &&
      await page.evaluate(() => { const e = entries.find(x => x.id === _E.N); return e.category === 'Plumbing' && !e.budg && _said.some(t => /^🏷 Off Demo — under Plumbing now ✓ · it is still waiting, not sent$/.test(t)); }) &&
      w3.head === '💵 Plumbing' && w3.rows.length === 1 && w3.rows[0].eid != null && (await pageUps()) === before;
  })());
  ok('at 390px the window with the wheel open does not run off the side', await (async () => { await page.evaluate(() => { estWhatOpen(_estD.cats.findIndex(x => x.n === 'Framing'), 'way'); document.querySelector('#estWhatBox .ew-move-btn').click(); }); await page.waitForTimeout(100); const w = await win(); await page.evaluate(() => estWhatClose()); return w.fits && !!w.mover; })());

  // ───────────────────────── ✓ a category that is finished ─────────────────────────
  console.log('— ✓ a category that is finished —');
  await page.evaluate(() => { _estOpenCats = new Set(); estFold(_estD.cats.findIndex(x => x.n === 'Demo')); _said.length = 0; });
  const d0 = await rowOf('Demo');
  ok('the open category offers ✓ Mark this category COMPLETE, first among its plates', d0.plates[0] === '✓ Mark this category COMPLETE' && !d0.done && d0.num === '$24,000' && d0.bar && !d0.bar.done && d0.bar.w === '8%', JSON.stringify(d0));
  await page.evaluate(() => document.querySelector('.est-row.est-open .est-done-btn').click());
  await page.waitForTimeout(500);
  const d1 = await rowOf('Demo');
  ok('one tap: the row says ✓ COMPLETE and what it came to against the estimate — in words, with a solid edge down its side', d1.done && /^✓ COMPLETE — came in \$22,000 under the estimate · ✓ ON THEIR PAGE/.test(d1.sub) && d1.edge === 'solid' && d1.edgeW >= 3 && d1.num === '$24,000' && d1.lamp === '✓ ON PAGE', JSON.stringify(d1));
  ok('the bar shows what it came to, and the rest of the track — what was never needed — is struck through', d1.bar.done && d1.bar.w === '8%' && /gradient/.test(d1.bar.bg) && /^complete — \$2,000 of \$24,000$/.test(d1.bar.label), JSON.stringify(d1.bar));
  ok('the open category says it is locked, since when, at what number and what it came to', /^🔒 COMPLETE since .+ — the estimate is locked at \$24,000; it came to \$2,000 \(\$2,000 in\)\. ↩ Reopen it to change a bid\. Their page says COMPLETE on this line and counts nothing more as remaining\.$/.test(d1.say), d1.say);
  ok('the plates follow: ↩ Reopen leads, and adding a bid or a placeholder is not offered while it is complete', d1.plates[0] === '↩ Reopen — not complete after all' && !d1.plates.some(p => /another bid|placeholder/.test(p)) && d1.bids === 1, JSON.stringify(d1.plates));
  ok('the top of the board counts it, and the toast said what it came to', await page.evaluate(() => /^✓ 1 complete$/.test(($('estDoneN') || { textContent: '' }).textContent.trim()) && _said.some(t => /^✓ Demo is COMPLETE — estimate \$24,000, it came to \$2,000: \$22,000 under · their page says COMPLETE$/.test(t))), await page.evaluate(() => JSON.stringify(_said)));
  ok('LOCKED: a number typed into its bid, a bid added, taken off, swapped or marked — each is refused in words and nothing changes', await (async () => {
    const ci = await ciOf('Demo');
    const r = await page.evaluate(async ci => { _said.length = 0; const x = _estD.cats[ci], was = JSON.stringify(x.bids);
      estBidSet(ci, 0, 'e1', '5'); estBidAdd(ci); estBidAdd(ci, true); estBidDel(ci, 0); estBidDel(ci, 0); await estBidAccept(ci, 0); await estBidAlso(ci, 0); await estBidInc(ci, 0); await estBidOpt(ci, 0); await estBidGuess(ci, 0);
      return { same: JSON.stringify(x.bids) === was, n: _said.filter(t => /^🔒 Demo is COMPLETE — its estimate is locked\. ↩ Reopen it first$/.test(t)).length, tot: estTotal(x), still: !!x.done }; }, ci);
    return r.same && r.n === 10 && r.tot === 24000 && r.still;
  })());
  ok('their page\'s line carries the one letter — done — and nothing else new', await (async () => { const b = ((await pageJson()).budget || []).find(x => x.n === 'Demo'); return !!b && b.done === 1 && b.est === 24000 && Object.keys(b).sort().join() === 'done,est,n'; })(), JSON.stringify(((await pageJson()).budget || []).find(x => x.n === 'Demo')));
  ok('a line that ended OVER its estimate says so — and, settled, it no longer sits under ⚠ NEEDS YOU', await (async () => {
    const before = await rowOf('Roofing');
    await page.evaluate(async () => { await estDone(_estD.cats.findIndex(x => x.n === 'Roofing')); });
    await page.waitForTimeout(400);
    const r = await rowOf('Roofing');
    return /^⚠ Needs you/.test(before.under) && /over \$500/.test(before.sub) && r.done && /^✓ COMPLETE — ⚠ \$500 over the estimate/.test(r.sub) && !/ · over \$500/.test(r.sub) && /^Foundation & shell/.test(r.under) && r.bar.w === '100%';
  })(), JSON.stringify(await rowOf('Roofing')));
  ok('a line that is NOT on their page is complete on his board alone — their page is not written', await (async () => {
    const before = await pageUps();
    await page.evaluate(async () => { await estDone(_estD.cats.findIndex(x => x.n === 'Plumbing')); });
    await page.waitForTimeout(1500);
    const r = await rowOf('Plumbing'), f = await boardJson();
    return r.done && /^✓ COMPLETE — came in \$3,500 under the estimate/.test(r.sub) && (await pageUps()) === before && !!f.cats.find(x => x.n === 'Plumbing').done && !((await pageJson()).budget || []).some(x => x.n === 'Plumbing');
  })(), JSON.stringify(await rowOf('Plumbing')));
  ok('a line with choices can be finished too', await (async () => { await page.evaluate(async () => { await estDone(_estD.cats.findIndex(x => x.n === 'Siding')); }); await page.waitForTimeout(400);
    const b = ((await pageJson()).budget || []).find(x => x.n === 'Siding'); return !!b && b.done === 1 && Array.isArray(b.opts) && b.opts.length === 2; })());
  const pgDone = await pageJson();

  console.log('— 🏠 the homeowner\'s page —');
  const home = async (json, q = '') => {
    const p = await ctx.newPage();
    p.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push('client: ' + e.message); });
    await p.addInitScript(json => {
      window._posts = [];
      window.fetch = (url, opts) => {
        if (!/client-portal/.test(String(url))) return Promise.reject(new TypeError('Failed to fetch'));
        if (opts && opts.method === 'POST') { try { window._posts.push(JSON.parse(opts.body)); } catch (e) { window._posts.push(String(opts.body)); } return Promise.resolve(new Response('{"ok":true}', { status: 200, headers: { 'content-type': 'application/json' } })); }
        return Promise.resolve(new Response(json, { status: 200, headers: { 'content-type': 'application/json' } }));
      };
    }, JSON.stringify(json));
    await p.goto(appUrl.replace(/index\.html$/, 'c/index.html') + '?c=' + CODE + q);
    await p.waitForTimeout(900);
    return p;
  };
  const card = p => p.evaluate(() => { const c = document.getElementById('budgetCard'); if (!c) return null;
    return { tot: c.querySelector('.bud-total').textContent.trim(), sub: c.querySelector('.bud-total-l').textContent.replace(/\s+/g, ' ').trim(), text: c.textContent.replace(/\s+/g, ' ').trim(), note: !!c.querySelector('#budPhNote'),
      rows: Object.fromEntries([...c.querySelectorAll('.bud-row')].map(r => { const cs = getComputedStyle(r), bar = r.querySelector('.bud-bar'); return [r.querySelector('span').textContent.replace(/ — (YOUR CHOICE|CHOOSE YOUR OPTION)$/, '').trim(), { t: r.textContent.replace(/\s+/g, ' ').trim(), done: r.classList.contains('bud-done'), ph: r.classList.contains('bud-ph'), left: r.querySelector('.bud-left').textContent.trim(), tag: (r.querySelector('.bud-done-tag') || { textContent: '' }).textContent.trim(),
        edge: cs.borderLeftStyle, edgeW: parseFloat(cs.borderLeftWidth), bar: bar.classList.contains('done'), barBg: getComputedStyle(bar).backgroundImage, opts: [...r.querySelectorAll('.opt-pick')].map(o => o.disabled), lock: !!r.querySelector('.opt-lockbtn, .opt-unlock'), prompt: !!r.querySelector('.opt-prompt') }]; })),
      fits: document.documentElement.scrollWidth <= document.documentElement.clientWidth && c.scrollWidth <= c.clientWidth + 1 }; });
  const hp = await home(pgDone);
  const h = await card(hp);
  ok('a finished line says ✓ COMPLETE where "remaining" stood, says in words that nothing more is expected, and wears a solid edge', !!h && h.rows.Demo.done && h.rows.Demo.left === '✓ COMPLETE' && h.rows.Demo.tag === '✓ COMPLETE — this part of the job is finished; nothing more is expected on this line' && h.rows.Demo.edge === 'solid' && h.rows.Demo.edgeW >= 3 && /estimate \$24,000\.00 · \$2,000\.00 billed so far/.test(h.rows.Demo.t), JSON.stringify(h && h.rows.Demo));
  ok('NOTHING MORE is counted as remaining on it: the big number is only what is still ahead on the lines that are open', h.tot === '$7,000.00' && h.rows.Framing.left === '$7,000.00 remaining' && !h.rows.Framing.done && /✓ 3 LINES COMPLETE/.test(h.sub) && /A line marked ✓ COMPLETE is finished: nothing more is counted as remaining on it\./.test(h.text), JSON.stringify([h.tot, h.sub]));
  ok('the part of its bar that was never needed is struck through', h.rows.Demo.bar && /gradient/.test(h.rows.Demo.barBg) && !h.rows.Framing.bar);
  ok('no claim about dollars saved is made to them', !/came in|under the estimate|saved/i.test(h.text));
  ok('a finished line that ended over its estimate still says ⚠ over by', /^⚠ over by \$500\.00$/.test(h.rows.Roofing.left) && h.rows.Roofing.done && /nothing more is expected/.test(h.rows.Roofing.tag), JSON.stringify(h.rows.Roofing));
  ok('a finished line is no placeholder any more, and its choices rest: no tap, no lock plate, no "choose your option"', !h.rows.Siding.ph && !h.note && !/≈/.test(h.tot) && h.rows.Siding.opts.length === 2 && h.rows.Siding.opts.every(Boolean) && !h.rows.Siding.lock && !h.rows.Siding.prompt && /This part of the job is finished — the choice is closed\./.test(h.rows.Siding.t), JSON.stringify(h.rows.Siding));
  ok('at 390px their card does not run off the side', h.fits);
  await hp.close();
  const hp0 = await home({ ...pgDone, budget: pgDone.budget.map(b => { const { done, ...r } = b; return r; }) });
  const h0 = await card(hp0);
  ok('a page with no finished line reads exactly as before: every line counts what remains, no ✓ word anywhere', h0.tot === '$37,000.00' && Object.values(h0.rows).every(r => !r.done && !r.tag && !r.bar) && !/COMPLETE/.test(h0.text) && h0.rows.Demo.left === '$22,000.00 remaining', JSON.stringify([h0.tot, Object.keys(h0.rows)]));
  await hp0.close();

  console.log('— ↩ reopen · the heal on open —');
  ok('↩ Reopen takes it all back: the row, the lock, the count — and their page counts what remains again', await (async () => {
    await page.evaluate(() => { _said.length = 0; _estOpenCats = new Set(); estFold(_estD.cats.findIndex(x => x.n === 'Demo')); });
    await page.evaluate(() => document.querySelector('.est-row.est-open .est-done-btn').click());
    await page.waitForTimeout(500);
    const r = await rowOf('Demo'), b = ((await pageJson()).budget || []).find(x => x.n === 'Demo');
    const free = await page.evaluate(() => { const ci = _estD.cats.findIndex(x => x.n === 'Demo'); estBidSet(ci, 0, 'e2', '100'); const t = estTotal(_estD.cats[ci]); estBidSet(ci, 0, 'e2', ''); return t; });
    return !r.done && !/COMPLETE/.test(r.sub) && r.plates[0] === '✓ Mark this category COMPLETE' && !r.say && !('done' in b) && free === 24120 && await page.evaluate(() => /^✓ 3 complete$/.test($('estDoneN').textContent.trim()) && _said.some(t => /^↩ Demo is open again — the estimate can be changed · their page counts what remains again$/.test(t)));
  })(), JSON.stringify(await rowOf('Demo')));
  ok('a page that has lost its ✓ marks is put right when the board opens — and one that agrees is left alone', await (async () => {
    await page.waitForTimeout(1400);
    await page.evaluate(() => closeEstimates());
    await page.evaluate(CODE => { const p = portalRoot() + '/' + CODE + '.json', pg = JSON.parse(_dbxFiles[p]); pg.budget.forEach(b => { delete b.done; }); _dbxFiles[p] = JSON.stringify(pg); _said.length = 0; window._ups.length = 0; }, CODE);
    await open(); await page.waitForTimeout(600);
    const healed = ((await pageJson()).budget || []).filter(b => b.done).map(b => b.n).sort().join(), said = await page.evaluate(() => _said.some(t => /^✓ Marking the finished lines on their page…$/.test(t)));
    const n1 = await pageUps();
    await page.evaluate(() => closeEstimates()); await page.evaluate(() => { window._ups.length = 0; _said.length = 0; });
    await open(); await page.waitForTimeout(600);
    return healed === 'Roofing,Siding' && said && n1 === 1 && (await pageUps()) === 0;
  })());
  ok('? How this works says both in words', await page.evaluate(() => /🏷 A receipt on the wrong category:/.test($('estHelpBox').textContent) && /✓ A category that is finished:/.test($('estHelpBox').textContent)));
  ok('at 390px the board does not run off the side', await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth && $('revBox').scrollWidth <= $('revBox').clientWidth + 1));
  await page.evaluate(() => closeEstimates());

  ok('version bumped — APP_VER and the footer agree', /const APP_VER = 'v7\.(5\d|[6-9]\d)'/.test(src) && new RegExp('<footer>' + (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1].replace('.', '\\.') + ' ·').test(src));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
