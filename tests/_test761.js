// ⏳ v7.61 — SAVE FOR LATER; 🔄 UPDATED, AND WHY. Eric: "on the client page i want them to be able to click a button next to
// categories that I put the button on and it'll say 'save for later' meaning i can set up categories or specific bids so they can
// click that button on the client page estimated remaining costs so it can be saved for last or next year and save money now.
// make it so it comes off the estimated and onto a for later window." and "also could have a signal on there if a bid got updated?
// and a description as to why it changed". Three halves: the homeowner's door in node (the hold route), Eric's board (the offer
// on a category and on a part, what their hold reads as, the UPDATED stamp and his why), and the REAL homeowner page (the button,
// the ⏳ SAVED FOR LATER card, the way back, the sign). Every name and figure made up.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { fileURLToPath, pathToFileURL } = require('url');
(async () => {
  const appUrl = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const repo = path.dirname(fileURLToPath(appUrl));
  const src = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
  const fnSrc = fs.readFileSync(path.join(repo, 'fnsrc', 'client-portal.mjs'), 'utf8');
  const shipped = fs.readFileSync(path.join(repo, 'netlify', 'functions', 'client-portal.mjs'), 'utf8');
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };
  // the day on their card is ALASKA's (the function stamps it with Intl; after 4 PM in Kenai the UTC day is already tomorrow — the
  // full run of 2026-09-30 found it at 00:14 UTC); the board's own stamps use the PC's local day
  const todayAK = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Anchorage', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const today = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })();

  console.log('— ☁ the homeowner\'s door: {c, hold} —');
  ok('the shipped function IS the source (copied verbatim), and both carry the hold route', shipped === fnSrc && /b\.hold && typeof b\.hold === 'object'/.test(fnSrc));
  const portal = (await import(pathToFileURL(path.join(repo, 'netlify', 'functions', 'client-portal.mjs')).href)).default;
  const PAGE = '/Clore DayLog/App Data/Client Portal/test-1234.json', ASKS = '/Clore DayLog/App Data/Client Portal/asks-test-1234.json';
  const mkPortal = (files = {}) => {
    const state = { files: { '/Clore DayLog/App Data/Client Portal/index.json': JSON.stringify({ clients: [{ key: 'test', job: 'Oak House', code: 'test-1234' }] }), ...files }, ups: [], rings: 0 };   // 🚪 v7.81 — the door opens only for a code on the list
    global.fetch = async (url, init = {}) => {
      const u = String(url);
      if (u.includes('oauth2/token')) return { ok: true, json: async () => ({ access_token: 't' }) };
      if (u.includes('/notify')) { state.rings++; return { ok: true }; }
      const arg = init.headers && init.headers['Dropbox-API-Arg'] ? JSON.parse(init.headers['Dropbox-API-Arg']) : {};
      if (u.includes('files/download')) { const t = state.files[arg.path]; return t == null ? { ok: false, status: 409, text: async () => '' } : { ok: true, status: 200, text: async () => t }; }
      if (u.includes('files/upload')) { state.ups.push(arg.path); state.files[arg.path] = typeof init.body === 'string' ? init.body : Buffer.from(init.body).toString(); return { ok: true, status: 200 }; }
      return { ok: false, status: 500, text: async () => '' };
    };
    return state;
  };
  const post = body => portal(new Request('http://x/.netlify/functions/client-portal', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }));
  process.env.DBX_REFRESH_TOKEN = 'r'; process.env.DBX_APP_KEY = 'a'; process.env.PUSH_SECRET = 's';
  const pg0 = () => ({ name: 'Oak House', budget: [
    { n: 'Demo', est: 6000, later: 1 },
    { n: 'Vanities and sinks', est: 3360, lp: [{ t: 'Second bath vanity', est: 1680 }] },
    { n: 'Roofing', est: 5400 },
    { n: 'Siding', est: 2000, done: 1, later: 1 },
    { n: 'Flooring', opts: [{ t: 'Vinyl plank', est: 4000 }, { t: 'Tile', est: 7000 }], def: 0, later: 1 }] });
  const st = mkPortal({ [PAGE]: JSON.stringify(pg0()) });
  const pageOf = () => JSON.parse(st.files[PAGE]), asksOf = () => JSON.parse(st.files[ASKS] || '[]');
  ok('hold on an OFFERED line: the page line gets held + heldAt (today), one review-pile entry names it with its number, the office bell is asked', await (async () => {
    const r = await post({ c: 'test-1234', hold: { n: 'Demo', on: true } });
    const b = pageOf().budget.find(x => x.n === 'Demo'), a = asksOf();
    return r.status === 200 && b.held === 1 && b.heldAt === todayAK && b.later === 1 && a.length === 1 && a[0].pk === 'hold:Demo' && a[0].text === '⏳ SAVED FOR LATER — Demo ($6,000)' && a[0].tag === 'General' && st.rings === 1;
  })(), JSON.stringify([pageOf().budget[0], asksOf()]));
  ok('the same tap again changes nothing and writes nothing', await (async () => { const n = st.ups.length; const r = await post({ c: 'test-1234', hold: { n: 'Demo', on: true } }); return r.status === 200 && st.ups.length === n && st.rings === 1; })());
  ok('↩ back in the plan: held comes off, the SAME pile entry flips (never a second), counting the change of mind', await (async () => {
    const r = await post({ c: 'test-1234', hold: { n: 'Demo', on: false } });
    const b = pageOf().budget.find(x => x.n === 'Demo'), a = asksOf();
    return r.status === 200 && !('held' in b) && !('heldAt' in b) && a.length === 1 && a[0].text === '↩ BACK IN THE PLAN — Demo ($6,000) · changed their mind 1×' && a[0].k === 2;
  })(), JSON.stringify(asksOf()));
  ok('a part: {p} holds that part alone — its own pile entry, named line: part, with the part\'s number', await (async () => {
    const r = await post({ c: 'test-1234', hold: { n: 'Vanities and sinks', on: true, p: 0 } });
    const b = pageOf().budget.find(x => x.n === 'Vanities and sinks'), a = asksOf();
    return r.status === 200 && b.lp[0].held === 1 && b.lp[0].heldAt === todayAK && !('held' in b) && a[0].pk === 'hold:Vanities and sinks#0' && a[0].text === '⏳ SAVED FOR LATER — Vanities and sinks: Second bath vanity ($1,680)';
  })(), JSON.stringify(asksOf()));
  ok('a line with choices holds whole, and the entry carries the planned (or picked) option\'s number', await (async () => {
    const r = await post({ c: 'test-1234', hold: { n: 'Flooring', on: true } });
    return r.status === 200 && pageOf().budget.find(x => x.n === 'Flooring').held === 1 && asksOf()[0].text === '⏳ SAVED FOR LATER — Flooring ($4,000)';
  })(), JSON.stringify(asksOf()[0]));
  ok('refused in words: a line the builder did not offer (400), a finished line (400), a part that is not there (404), a line that is not there (404), an unknown code (404) — and nothing written', await (async () => {
    const n = st.ups.length;
    const a = await post({ c: 'test-1234', hold: { n: 'Roofing', on: true } });
    const b = await post({ c: 'test-1234', hold: { n: 'Siding', on: true } });
    const c = await post({ c: 'test-1234', hold: { n: 'Vanities and sinks', on: true, p: 4 } });
    const d = await post({ c: 'test-1234', hold: { n: 'Nowhere', on: true } });
    const e = await post({ c: 'nobody-0000', hold: { n: 'Demo', on: true } });
    return a.status === 400 && b.status === 400 && c.status === 404 && d.status === 404 && e.status === 404 && st.ups.length === n;
  })());

  console.log('— 💰 Eric\'s board: the offer, their hold, 🔄 updated —');
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await ctx.route(u => !/^file:/.test(u.href), r => r.abort());
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
  await page.goto(appUrl); await page.waitForTimeout(700);
  const CODE = 'oak-111111';
  const seed = (board, pg) => page.evaluate(([CODE, board, pg]) => {
    jobs = ['Oak House']; crew = []; todos = []; window.scheduleSave = () => {}; dbx.refreshToken = 'test-token';
    _portalIdx = { clients: [{ key: 'oak', job: 'Oak House', code: CODE }] };
    window._dbxFiles = {}; window._ups = [];
    window.dbxDownload = async p => (window._dbxFiles || {})[p] ?? null;
    window.dbxUpload = async (p, body) => { (window._dbxFiles || {})[p] = body; window._ups.push(p); return {}; };
    window.dbxPathExists = async p => Object.prototype.hasOwnProperty.call(window._dbxFiles || {}, p);
    if (!window._said) { window._said = []; const t0 = window.toast; window.toast = (m, g) => { if (m) _said.push(String(m)); return t0(m, g); }; }
    _said.length = 0; entries = []; nextId = 1;
    window._dbxFiles[estPath(CODE)] = JSON.stringify(board);
    window._dbxFiles[portalRoot() + '/' + CODE + '.json'] = JSON.stringify(pg);
    _estIdx = -1; _estD = null; _estPage = null; _estSales = null;
  }, [CODE, board, pg]);
  const open = async () => { await page.evaluate(async () => { await openEstimates(0); }); await page.waitForTimeout(1300); };
  const pageJson = () => page.evaluate(CODE => JSON.parse(window._dbxFiles[portalRoot() + '/' + CODE + '.json']), CODE);
  const lineOf = async n => ((await pageJson()).budget || []).find(b => b.n === n);
  const unfold = n => page.evaluate(n => { const ci = _estD.cats.findIndex(x => x.n === n); _estOpenCats = new Set([ci]); renderEstimates(); }, n);
  const rowOf = n => page.evaluate(n => { const ci = _estD.cats.findIndex(x => x.n === n), r = document.querySelector(`.est-row[data-ci="${ci}"]`);
    return r ? { num: r.querySelector('.est-num').textContent.trim(), sub: (r.querySelector('.est-sub') || { textContent: '' }).textContent.replace(/\s+/g, ' ').trim(), later: (r.querySelector('.est-later-btn') || { textContent: '' }).textContent.trim(),
      bidLater: [...r.querySelectorAll('.est-bid')].map(b => (b.querySelector('.est-bid-later') || { textContent: '' }).textContent.trim()), lbl: [...r.querySelectorAll('.est-bid input[type="text"]')].map(i => i.placeholder).filter(p => /homeowner sees/.test(p)),
      upd: (r.querySelector('.est-upd-say') || { textContent: '' }).textContent.replace(/\s+/g, ' ').trim(), why: (r.querySelector('.est-upd-say input') || { value: null }).value } : null; }, n);
  const head = () => page.evaluate(() => ({ held: ($('estHeldN') || { textContent: '' }).textContent.trim(), upd: ($('estUpdN') || { textContent: '' }).textContent.trim() }));
  const ci = n => page.evaluate(n => _estD.cats.findIndex(x => x.n === n), n);
  const board = () => ({ mk: 20, cats: [
    { n: 'Demo', appr: true, bids: [{ e1: 5000, e2: 0, acc: true }] },
    { n: 'Vanities and sinks', appr: true, bids: [{ e1: 1400, e2: 0, acc: true, note: 'Master bath vanity' }, { e1: 1400, e2: 0, acc: true, note: 'Second bath vanity', lbl: 'Second bath vanity' }] },
    { n: 'Roofing', appr: true, bids: [{ e1: 4000, e2: 0, acc: true }] },
    { n: 'Siding', appr: true, done: { at: '2026-09-20' }, bids: [{ e1: 2000, e2: 0, acc: true }] },
    { n: 'Framing', appr: false, bids: [{ e1: 9000, e2: 0, acc: true }] }] });
  const pgA = { name: 'Oak House', updated: '2026-09-28', show: { money: true }, invoiced: 0, paid: 0, open: 0, journal: [], phases: [],
    budget: [{ n: 'Demo', est: 6000 }, { n: 'Vanities and sinks', est: 3360 }, { n: 'Roofing', est: 4800 }, { n: 'Siding', est: 2400, done: 1 }] };   // no `upcoming` — nothing is on the way, and a page that says otherwise is healed on open (v6.64)
  await seed(board(), pgA);
  await open();
  ok('a board with no offers writes nothing new on open, and no row speaks of later', await page.evaluate(() => window._ups.length === 0) && await (async () => { const r = await rowOf('Demo'); return r.later === '' && !/later/i.test(r.sub) && (await head()).held === ''; })());
  await unfold('Demo');
  ok('⏳ Let them save this for later on a category: the plate lights, the row says they can, their page line carries later: 1 — and only that', await (async () => {
    await page.evaluate(async () => { const ci = _estD.cats.findIndex(x => x.n === 'Demo'); _said.length = 0; await estLaterToggle(ci); });
    await page.waitForTimeout(300);
    const r = await rowOf('Demo'), l = await lineOf('Demo');
    return r.later === '⏳ THEY CAN SAVE THIS FOR LATER — tap to take the offer off' && /⏳ they can save this for later/.test(r.sub) && !!l && l.later === 1 && Object.keys(l).sort().join() === 'est,later,n' && await page.evaluate(() => _said.some(t => /^⏳ Demo — their page offers Save for later now$/.test(t)));
  })(), JSON.stringify([await rowOf('Demo'), await lineOf('Demo')]));
  ok('a single-bid line offers no ○ can wait (the category plate is the one); a line that adds bids together offers it on each used bid', (await rowOf('Demo')).bidLater.join('|') === '' && await (async () => { await unfold('Vanities and sinks'); const r = await rowOf('Vanities and sinks'); return r.bidLater.join('|') === '○ can wait|○ can wait' && r.lbl.length === 0; })(), JSON.stringify(await rowOf('Vanities and sinks')));
  ok('○ can wait on the second vanity: the part rides their page as lp — its homeowner name and its client number, nothing else about the bid; the 🏠 name box appears; the row says which part', await (async () => {
    await page.evaluate(async () => { const ci = _estD.cats.findIndex(x => x.n === 'Vanities and sinks'); _said.length = 0; await estBidLater(ci, 1); });
    await page.waitForTimeout(300);
    const r = await rowOf('Vanities and sinks'), l = await lineOf('Vanities and sinks');
    return r.bidLater.join('|') === '○ can wait|⏳ CAN WAIT — they may save this part for later' && r.lbl.length === 1 && /this part called/.test(r.lbl[0]) && /⏳ they can save “Second bath vanity” for later/.test(r.sub)
      && !!l && JSON.stringify(l.lp) === JSON.stringify([{ t: 'Second bath vanity', est: 1680 }]) && Object.keys(l).sort().join() === 'est,lp,n' && l.est === 3360 && !JSON.stringify(l).includes('1400') && !JSON.stringify(l).includes('Master');
  })(), JSON.stringify([await rowOf('Vanities and sinks'), await lineOf('Vanities and sinks')]));
  ok('a COMPLETE category offers no ⏳ plate and its page line carries no offer', await (async () => { await unfold('Siding'); const r = await rowOf('Siding'), l = await lineOf('Siding'); return r.later === '' && !('later' in l) && l.done === 1; })());
  ok('their hold, written by their door, reads on the board: the row, the part, and the head count what they saved and what it adds up to', await (async () => {
    await page.evaluate(() => closeEstimates());
    await page.evaluate(CODE => { const p = portalRoot() + '/' + CODE + '.json', pg = JSON.parse(_dbxFiles[p]); const d = pg.budget.find(b => b.n === 'Demo'); d.held = 1; d.heldAt = '2026-09-30'; const v = pg.budget.find(b => b.n === 'Vanities and sinks'); v.lp[0].held = 1; v.lp[0].heldAt = '2026-09-30'; _dbxFiles[p] = JSON.stringify(pg); window._ups.length = 0; }, CODE);
    await open();
    const d = await rowOf('Demo'), v = await rowOf('Vanities and sinks'), h = await head();
    return /⏳ THEY SAVED IT FOR LATER · Sep 30, 2026/.test(d.sub) && /⏳ they saved “Second bath vanity” for later · Sep 30, 2026/.test(v.sub) && h.held === '⏳ 2 saved for later by them — $7,680' && await page.evaluate(() => window._ups.length === 0);
  })(), JSON.stringify([await rowOf('Demo'), await rowOf('Vanities and sinks'), await head()]));
  ok('a republish keeps their hold (like their pick): a change on another line, and Demo and the part are still held on their page', await (async () => {
    await page.evaluate(async () => { const ci = _estD.cats.findIndex(x => x.n === 'Roofing'); estBidSet(ci, 0, 'e1', '4500'); });
    await page.waitForTimeout(1600);
    const d = await lineOf('Demo'), v = await lineOf('Vanities and sinks');
    return d.held === 1 && d.heldAt === '2026-09-30' && v.lp[0].held === 1 && v.lp[0].heldAt === '2026-09-30';
  })(), JSON.stringify([await lineOf('Demo'), await lineOf('Vanities and sinks')]));
  ok('🔄 the number on Roofing changed while it was on their page: the line says UPDATED — the day, was, now — with no why yet; the row and the head say so; the open category asks why', await (async () => {
    const l = await lineOf('Roofing'); await unfold('Roofing'); const r = await rowOf('Roofing'), h = await head();
    return !!l.chg && l.chg.d === today && l.chg.from === 4800 && l.chg.to === 5400 && !('why' in l.chg) && /🔄 UPDATED on their page · .* — ✎ say why/.test(r.sub) && h.upd === '🔄 1 updated on their page — 1 with no why yet' && /Their page says UPDATED .* — was \$4,800, now \$5,400\. Why did it change\?/.test(r.upd);
  })(), JSON.stringify([await lineOf('Roofing'), await rowOf('Roofing'), await head()]));
  ok('a line\'s FIRST time on their page is not an update (Framing lit now carries no chg)', await (async () => {
    await page.evaluate(async () => { const ci = _estD.cats.findIndex(x => x.n === 'Framing'); await estApprove(ci); await estApprove(ci); });
    await page.waitForTimeout(400);
    const l = await lineOf('Framing'); return !!l && !('chg' in l) && l.est === 10800;
  })(), JSON.stringify(await lineOf('Framing')));
  ok('✓ Say it on their page: his why rides the line; a second change keeps the sign (was = the first figure) but holds the why back until he says it again for the new number', await (async () => {
    await page.evaluate(async () => { const ci = _estD.cats.findIndex(x => x.n === 'Roofing'); $('estWhy-' + ci).value = 'the real bid came in — the placeholder was low'; await estUpdWhy(ci); });
    await page.waitForTimeout(300);
    const l1 = await lineOf('Roofing');
    await page.evaluate(async () => { const ci = _estD.cats.findIndex(x => x.n === 'Roofing'); estBidSet(ci, 0, 'e1', '4600'); });
    await page.waitForTimeout(1600);
    const l2 = await lineOf('Roofing'), r2 = await rowOf('Roofing');
    await page.evaluate(async () => { const ci = _estD.cats.findIndex(x => x.n === 'Roofing'); await estUpdWhy(ci); });
    await page.waitForTimeout(300);
    const l3 = await lineOf('Roofing');
    return l1.chg.why === 'the real bid came in — the placeholder was low' && l2.chg.from === 4800 && l2.chg.to === 5520 && !('why' in l2.chg) && /Your why was said for \$5,400 — the number is \$5,520 now/.test(r2.upd) && r2.why === 'the real bid came in — the placeholder was low' && l3.chg.why === 'the real bid came in — the placeholder was low' && l3.chg.to === 5520;
  })(), JSON.stringify(await lineOf('Roofing')));
  ok('a number that goes back to where it started takes the sign off by itself; ✕ takes it off by his hand', await (async () => {
    await page.evaluate(async () => { const ci = _estD.cats.findIndex(x => x.n === 'Roofing'); estBidSet(ci, 0, 'e1', '4000'); });
    await page.waitForTimeout(1600);
    const back = await lineOf('Roofing'), backRow = await rowOf('Roofing');
    await page.evaluate(async () => { const ci = _estD.cats.findIndex(x => x.n === 'Roofing'); estBidSet(ci, 0, 'e1', '4200'); });
    await page.waitForTimeout(1600);
    const again = await lineOf('Roofing');
    await page.evaluate(async () => { const ci = _estD.cats.findIndex(x => x.n === 'Roofing'); await estUpdOff(ci); });
    await page.waitForTimeout(300);
    const off = await lineOf('Roofing');
    return !('chg' in back) && !/UPDATED/.test(backRow.sub) && again.chg && again.chg.from === 4800 && again.chg.to === 5040 && !('chg' in off) && await page.evaluate(() => !_estD.cats.find(x => x.n === 'Roofing').upd);
  })(), JSON.stringify(await lineOf('Roofing')));
  ok('the offer taken off Demo puts the line back on their estimate: neither later nor held rides the page line', await (async () => {
    await page.evaluate(async () => { const ci = _estD.cats.findIndex(x => x.n === 'Demo'); await estLaterToggle(ci); });
    await page.waitForTimeout(300);
    const l = await lineOf('Demo'), h = await head();
    return !('later' in l) && !('held' in l) && !('heldAt' in l) && h.held === '⏳ 1 saved for later by them — $1,680';
  })(), JSON.stringify([await lineOf('Demo'), await head()]));
  ok('a page that lost the offers is put right when the board opens (and one that agrees is left alone)', await (async () => {
    await page.evaluate(() => closeEstimates());
    await page.evaluate(CODE => { const p = portalRoot() + '/' + CODE + '.json', pg = JSON.parse(_dbxFiles[p]); pg.budget.forEach(b => { delete b.lp; }); _dbxFiles[p] = JSON.stringify(pg); _said.length = 0; window._ups.length = 0; }, CODE);
    await open(); await page.waitForTimeout(1500);
    const l = await lineOf('Vanities and sinks'), said = await page.evaluate(() => _said.some(t => /^⏳ Marking the save-for-later offers on their page…$/.test(t)));
    await page.evaluate(() => closeEstimates()); await page.evaluate(() => { window._ups.length = 0; });
    await open(); await page.waitForTimeout(600);
    return !!l.lp && l.lp[0].t === 'Second bath vanity' && said && await page.evaluate(CODE => !window._ups.some(p => p.endsWith('/' + CODE + '.json')), CODE);
  })());
  ok('? How this works says both in words', await page.evaluate(() => /⏳ Save for later:/.test($('estHelpBox').textContent) && /🔄 Updated:/.test($('estHelpBox').textContent) && /no vendor names/.test($('estHelpBox').textContent)));
  ok('at 390px the board does not run off the side', await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth && $('revBox').scrollWidth <= $('revBox').clientWidth + 1));
  await page.evaluate(() => closeEstimates());

  console.log('— 🏠 the homeowner\'s page —');
  const home = async (json, q = '') => {
    const p = await ctx.newPage();
    p.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push('client: ' + e.message); });
    await p.addInitScript(json => {
      window._posts = [];
      window.fetch = (url, opts) => {
        if (!/client-portal/.test(String(url))) return Promise.reject(new TypeError('Failed to fetch'));
        if (opts && opts.method === 'POST') { try { window._posts.push(JSON.parse(opts.body)); } catch (e) { window._posts.push(String(opts.body)); } return Promise.resolve(new Response('ok', { status: 200 })); }
        return Promise.resolve(new Response(json, { status: 200, headers: { 'content-type': 'application/json' } }));
      };
    }, JSON.stringify(json));
    await p.goto(appUrl.replace(/index\.html$/, 'c/index.html') + '?c=' + CODE + q);
    await p.waitForTimeout(900);
    return p;
  };
  const card = p => p.evaluate(() => { const c = document.getElementById('budgetCard'), l = document.getElementById('laterCard'); if (!c) return null;
    return { tot: c.querySelector('.bud-total').textContent.trim(), sub: c.querySelector('.bud-total-l').textContent.replace(/\s+/g, ' ').trim(), text: c.textContent.replace(/\s+/g, ' ').trim(),
      rows: Object.fromEntries([...c.querySelectorAll('.bud-row')].map(r => [r.querySelector('span').textContent.replace(/ — (YOUR CHOICE|CHOOSE YOUR OPTION)$/, '').trim(), { t: r.textContent.replace(/\s+/g, ' ').trim(), left: r.querySelector('.bud-left').textContent.trim(), btn: (r.querySelector('.bud-later-line') || { textContent: '' }).textContent.trim(), parts: [...r.querySelectorAll('.bud-part')].map(x => x.textContent.replace(/\s+/g, ' ').trim()), upd: (r.querySelector('.bud-upd') || { textContent: '' }).textContent.replace(/\s+/g, ' ').trim(), tall: [...r.querySelectorAll('.bud-later-btn')].every(b => b.getBoundingClientRect().height >= 40) }])),
      later: l ? { tot: l.querySelector('.bud-total').textContent.trim(), sub: l.querySelector('.bud-total-l').textContent.replace(/\s+/g, ' ').trim(), rows: [...l.querySelectorAll('.lt-row')].map(r => ({ n: r.querySelector('.lt-name').textContent.trim(), a: r.querySelector('.lt-amt').textContent.trim(), meta: r.querySelector('.lt-meta').textContent.replace(/\s+/g, ' ').trim(), back: r.querySelector('.lt-back').textContent.trim() })), text: l.textContent.replace(/\s+/g, ' ').trim(), atBottom: !!l.nextElementSibling && l.nextElementSibling.id === 'bellCard' && !!l.previousElementSibling && l.previousElementSibling.id === 'phasesCard' } : null,
      posts: window._posts.filter(p => p && p.hold), fits: document.documentElement.scrollWidth <= document.documentElement.clientWidth && c.scrollWidth <= c.clientWidth + 1 }; });
  const pgH = { name: 'Oak House', updated: '2026-09-30', show: { money: true, phases: true }, invoiced: 0, paid: 0, open: 0, journal: [], phases: [{ n: 1, name: 'Site & utilities', total: 0, cats: [] }],
    budget: [{ n: 'Demo', est: 6000, later: 1 }, { n: 'Vanities and sinks', est: 3360, lp: [{ t: 'Second bath vanity', est: 1680 }] }, { n: 'Roofing', est: 5400, chg: { d: '2026-09-30', from: 4800, to: 5400, why: 'the real bid came in — the placeholder was low' } }, { n: 'Siding', est: 2400, done: 1, later: 1 }, { n: 'Flooring', est: 4000 }], upcoming: { items: [], tot: 0, all: 1 } };
  const hp = await home(pgH);
  const h0 = await card(hp);
  ok('the button sits only where the builder offered it: ⏳ Save this for later on Demo, a part row on the vanities line, none on Roofing or Flooring, none on a finished line', !!h0 && h0.rows.Demo.btn === '⏳ Save this for later — it comes off the remaining costs' && h0.rows['Vanities and sinks'].parts.join('|') === '⏳ Second bath vanity · $1,680.00 Save for later' && h0.rows['Vanities and sinks'].btn === '' && h0.rows.Roofing.btn === '' && h0.rows.Flooring.btn === '' && h0.rows.Siding.btn === '' && h0.rows.Siding.parts.length === 0 && Object.values(h0.rows).every(r => r.tall) && !h0.later, JSON.stringify(h0 && h0.rows));
  ok('🔄 the Roofing line says UPDATED with the day, was, now and the builder\'s why; the card counts it and says what the sign means', /^🔄 UPDATED Sep 30 — was \$4,800\.00, now \$5,400\.00 · the real bid came in — the placeholder was low$/.test(h0.rows.Roofing.upd) && /· 🔄 1 UPDATED/.test(h0.sub) && /🔄 UPDATED marks a line whose number changed, with the day and the reason\./.test(h0.text) && /⏳ Save for later holds a part of the job .* onto the SAVED FOR LATER card at the bottom of this page/.test(h0.text) && h0.tot === '$18,760.00', JSON.stringify([h0.rows.Roofing.upd, h0.sub, h0.tot]));
  ok('a tap on Demo: it leaves the remaining costs (the big number drops by it), the ⏳ SAVED FOR LATER card appears right under with the way back, and the office is told', await (async () => {
    await hp.evaluate(() => document.querySelector('.bud-later-line').click());
    await hp.waitForTimeout(200);
    const h = await card(hp);
    return h.tot === '$12,760.00' && !h.rows.Demo && /⏳ \$6,000\.00 SAVED FOR LATER — NOT COUNTED HERE/.test(h.sub) && !!h.later && h.later.atBottom && h.later.tot === '$6,000.00' && h.later.rows.length === 1 && h.later.rows[0].n === '⏳ Demo' && h.later.rows[0].a === '$6,000.00' && /saved for later .* · estimate \$6,000\.00/.test(h.later.rows[0].meta) && h.later.rows[0].back === '↩ Put it back in the plan'
      && /YOU CHOSE TO HOLD THIS FOR LATER — NOT COUNTED IN THE REMAINING COSTS/.test(h.later.sub) && /Clore Construction sees your choice; put one back any time/.test(h.later.text) && JSON.stringify(h.posts) === JSON.stringify([{ c: CODE, hold: { n: 'Demo', on: true } }]);
  })(), JSON.stringify(await card(hp)));
  ok('a tap on the part: the vanities line keeps its other half (estimate $1,680.00, ⏳ $1,680.00 saved for later), the card lists it as line — part, two held now', await (async () => {
    await hp.evaluate(() => document.querySelector('.bud-part .bud-later-btn').click());
    await hp.waitForTimeout(200);
    const h = await card(hp);
    return h.tot === '$11,080.00' && /estimate \$1,680\.00 · .* · ⏳ \$1,680\.00 saved for later/.test(h.rows['Vanities and sinks'].t) && h.rows['Vanities and sinks'].parts.length === 0 && h.rows['Vanities and sinks'].left === '$1,680.00 remaining' && h.later.rows.length === 2 && h.later.rows[1].n === '⏳ Vanities and sinks — Second bath vanity' && h.later.rows[1].a === '$1,680.00' && h.later.tot === '$7,680.00' && /⏳ \$7,680\.00 SAVED FOR LATER/.test(h.sub)
      && h.posts.length === 2 && JSON.stringify(h.posts[1]) === JSON.stringify({ c: CODE, hold: { n: 'Vanities and sinks', on: true, p: 0 } });
  })(), JSON.stringify(await card(hp)));
  ok('↩ Put it back in the plan: Demo counts again, the button is back on it, the card keeps the part alone — and the office is told', await (async () => {
    await hp.evaluate(() => document.querySelector('#laterCard .lt-back').click());
    await hp.waitForTimeout(200);
    const h = await card(hp);
    return h.tot === '$17,080.00' && !!h.rows.Demo && h.rows.Demo.btn.startsWith('⏳ Save this for later') && h.later.rows.length === 1 && h.later.rows[0].n === '⏳ Vanities and sinks — Second bath vanity' && JSON.stringify(h.posts[2]) === JSON.stringify({ c: CODE, hold: { n: 'Demo', on: false } });
  })(), JSON.stringify(await card(hp)));
  ok('the last one put back: the ⏳ card goes away', await (async () => {
    await hp.evaluate(() => document.querySelector('#laterCard .lt-back').click());
    await hp.waitForTimeout(200);
    const h = await card(hp);
    return !h.later && h.tot === '$18,760.00' && h.rows['Vanities and sinks'].parts.length === 1 && !/SAVED FOR LATER/.test(h.sub);
  })());
  ok('at 390px their page does not run off the side', (await card(hp)).fits);
  ok('🧱 every line is its own plate on their page too (Eric: "need better seperation on the categories"): an edge all round, a radius, room between, the bar outlined — a placeholder line keeps its dashed left edge', await hp.evaluate(() => {
    const rows = [...document.querySelectorAll('#budgetCard .bud-row')];
    const plate = rows.every(r => { const cs = getComputedStyle(r); return parseFloat(cs.borderTopWidth) >= 1 && parseFloat(cs.borderRightWidth) >= 1 && parseFloat(cs.borderBottomWidth) >= 1 && parseFloat(cs.borderTopLeftRadius) >= 10 && parseFloat(cs.paddingLeft) >= 10; });
    const room = rows.slice(1).every((r, i) => r.getBoundingClientRect().top - rows[i].getBoundingClientRect().bottom >= 8);
    const bar = rows.every(r => { const b = r.querySelector('.bud-bar'); return b && getComputedStyle(b).outlineStyle === 'solid'; });
    return rows.length >= 4 && plate && room && bar;
  }));
  ok('…and a placeholder line keeps its dashed left edge, a finished line its solid one', await (async () => {
    const p = await home({ ...pgH, budget: [{ n: 'Demo', est: 6000, g: 1 }, { n: 'Siding', est: 2400, done: 1 }] });
    const r = await p.evaluate(() => [...document.querySelectorAll('#budgetCard .bud-row')].map(x => { const cs = getComputedStyle(x); return cs.borderLeftStyle + ':' + parseFloat(cs.borderLeftWidth) + ':' + cs.borderTopStyle + ':' + parseFloat(cs.borderTopWidth); }));
    await p.close();
    return r.join('|') === 'dashed:4:solid:1|solid:4:solid:1';
  })());
  await hp.close();
  ok('a page written with their hold already on it opens with the line on the ⏳ card, dated', await (async () => {
    const p = await home({ ...pgH, budget: pgH.budget.map(b => b.n === 'Demo' ? { ...b, held: 1, heldAt: '2026-09-29' } : b) });
    const h = await card(p); await p.close();
    return !h.rows.Demo && !!h.later && h.later.rows[0].n === '⏳ Demo' && /saved for later Sep 29/.test(h.later.rows[0].meta) && h.tot === '$12,760.00';
  })());
  ok('in Eric\'s preview (pv=1) the tap shows the motion and saves nothing', await (async () => {
    const p = await home(pgH, '&pv=1');
    await p.evaluate(() => document.querySelector('.bud-later-line').click());
    await p.waitForTimeout(200);
    const h = await card(p); await p.close();
    return !!h.later && h.posts.length === 0;
  })());
  ok('a page with no offer and no change reads exactly as before: no button, no card, no sign', await (async () => {
    const p = await home({ ...pgH, budget: [{ n: 'Demo', est: 6000 }, { n: 'Roofing', est: 5400 }] });
    const h = await card(p); await p.close();
    return !h.later && Object.values(h.rows).every(r => !r.btn && !r.parts.length && !r.upd) && !/later|UPDATED/i.test(h.text) && h.tot === '$11,400.00';
  })());
  ok('the wall holds: the app never sends a bid\'s note, vendor or markup for a part — only a homeowner name and a client number (asserted above); the homeowner\'s door never reads or writes the estimates file', !/estimates-/.test(fnSrc));

  ok('version bumped — APP_VER and the footer agree', /const APP_VER = 'v7\.(6[1-9]|[7-9]\d)'/.test(src) && new RegExp('<footer>' + (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1].replace('.', '\\.') + ' ·').test(src));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
