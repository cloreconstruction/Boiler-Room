// 👁 v6.61 — THE OWNER VIEW. Eric: "I want my project portal to basically look exactly like the
// client page, and it will also control the client page … I have my edit buttons there and my
// add photos, and I can hide windows from them." The real client page inside the app's preview
// frame, a bar on every card, per-client per-card switches (and per option board), every tap a
// message to the app.
// 🎛 v7.40 — and then Eric: "on the client view take out the blue dotted boxes off, id rather setup which functions they see
// or dont on a different page." The bars and the owner mode are gone: the viewer is the homeowner's page exactly as they
// get it, and the switches live in the portal's 🎛 What they see window (tests/_test740.js walks that window). This suite
// keeps the homeowner half and pins the viewer to the plain page. It runs a tiny HTTP server so the app and the page share
// ONE store the way they share Dropbox in production.
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
(async () => {
  const APP = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const ROOT = path.dirname(decodeURIComponent(new URL(APP).pathname).replace(/^\/([A-Za-z]:)/, '$1'));
  const CODE = 'test-1234';
  const store = new Map();
  const state = { base: '' };
  const boards = { boards: [
    { id: 'b1', name: 'Sheetrock / Drywall', img: '', groups: [{ n: 'Corners', o: ['Square', 'Bullnose'] }] },
    { id: 'b2', name: 'Shower drain', img: '', groups: [{ n: 'Style', o: ['Linear', 'Center'] }] },
    { id: 'b3', name: 'Siding colors', img: '', groups: [{ n: 'Color', o: ['Sage', 'Slate'] }] }] };
  const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS' };
  const srv = http.createServer((req, res) => {
    const u = new URL(req.url, 'http://x');
    const send = (code, body, type) => { res.writeHead(code, { ...cors, 'content-type': type || 'text/plain' }); res.end(body); };
    if (req.method === 'OPTIONS') return send(204, '');
    let body = ''; req.on('data', d => { body += d; }); req.on('end', () => {
      if (u.pathname === '/__get') { const v = store.get(u.searchParams.get('path')); return v == null ? send(404, '') : send(200, v); }
      if (u.pathname === '/__put') { store.set(u.searchParams.get('path'), body); return send(200, 'ok'); }
      if (/client-portal/.test(u.pathname)) {
        if (req.method === 'POST') return send(200, 'ok');
        if (u.searchParams.get('boards')) return send(200, JSON.stringify(boards), 'application/json');
        if (u.searchParams.get('a')) return send(200, '[]', 'application/json');
        if (u.searchParams.get('mat')) return send(200, '{"rooms":[]}', 'application/json');
        if (u.searchParams.get('p') || u.searchParams.get('bimg') || u.searchParams.get('manifest')) return send(404, '');
        const v = store.get(state.base + '/' + u.searchParams.get('c') + '.json');
        return v == null ? send(404, '{"error":"not found"}', 'application/json') : send(200, v, 'application/json');
      }
      if (u.pathname === '/c/' || u.pathname === '/c/index.html') return send(200, fs.readFileSync(path.join(ROOT, 'c', 'index.html')), 'text/html; charset=utf-8');
      send(404, '');
    });
  });
  await new Promise(r => srv.listen(0, '127.0.0.1', r));
  const SRV = 'http://127.0.0.1:' + srv.address().port;

  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
  await page.goto(APP);
  await page.waitForTimeout(700);
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };
  const wait = async (fn, ms = 4000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { try { if (await fn()) return true; } catch (e) {} await new Promise(r => setTimeout(r, 80)); } return false; };
  const pageJson = () => JSON.parse(store.get(state.base + '/' + CODE + '.json'));

  const setup = await page.evaluate(({ SRV, CODE }) => {
    window.dbxDownload = async p => { const r = await fetch(SRV + '/__get?path=' + encodeURIComponent(p)); return r.ok ? await r.text() : null; };
    window.dbxUpload = async (p, body) => { await fetch(SRV + '/__put?path=' + encodeURIComponent(p), { method: 'POST', body: typeof body === 'string' ? body : JSON.stringify(body) }); return {}; };
    window.dbxPathExists = async p => (await fetch(SRV + '/__get?path=' + encodeURIComponent(p))).ok;
    window.portalUrl = i => SRV + '/c/?c=' + encodeURIComponent(_portalIdx.clients[i].code);
    window.scheduleSave = () => {};
    dbx.refreshToken = 'test-token';
    jobs = ['Mery']; curJob = 'Mery'; entries = []; nextId = 1;
    _portalIdx = { clients: [{ key: 'mery', job: 'Mery Addition & Remodel', code: CODE }] };
    _boards = null;
    return { base: portalRoot(), boardsPath: BOARDS_DIR() + '/boards.json' };
  }, { SRV, CODE });
  state.base = setup.base;
  store.set(setup.boardsPath, JSON.stringify({ v: 1, boards: boards.boards }));
  store.set(state.base + '/' + CODE + '.json', JSON.stringify({
    name: 'Mery Addition & Remodel', updated: '2026-09-10',
    show: { money: true, phases: true, budget: false },
    invoiced: 1000, paid: 1000, open: 0,
    phases: [{ n: 1, name: 'Site', total: 100, cats: [['Demo', 100]] }],
    journal: [{ week: 'Sep 4 – Sep 10', released: '2026-09-10', text: 'Walls are up.', photos: [] }],
    budget: [{ n: 'Framing', est: 5000 }],
    upcoming: { items: [{ n: 'Septic', a: 600 }], tot: 600 },
    boardsOff: ['b2']
  }));

  console.log('— 🏠 v6.61 what the HOMEOWNER sees —');
  const home = await ctx.newPage();
  home.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push('home: ' + e.message); });
  await home.goto(SRV + '/c/?c=' + CODE); await home.waitForTimeout(700);
  ok('no owner bars, no owner banner — the plain page', await home.evaluate(() => !document.querySelector('.own-bar') && !document.querySelector('.own-head')));
  ok('the budget card is hidden by its per-client switch', await home.evaluate(() => !document.getElementById('budgetCard')));
  ok('upcoming, where it stands and work by phase still show', await home.evaluate(() =>
    !!document.getElementById('upcomingCard') && !!document.getElementById('moneyCard') && !!document.getElementById('phasesCard')));
  ok('a board switched off for this client never reaches them — 2 of 3', await home.evaluate(async () => {
    await boardsOpen();
    const rows = [...document.querySelectorAll('#boardCard .bd-row')].map(r => r.textContent);
    return rows.length === 2 && !rows.some(t => /Shower drain/.test(t));
  }));
  await home.goto(SRV + '/c/?c=' + CODE + '&pv=1&owner=1'); await home.waitForTimeout(700);
  ok('&owner=1 pasted into a plain browser (no parent frame) draws NOTHING extra', await home.evaluate(() => !document.querySelector('.own-bar') && !document.querySelector('.own-head')));
  await home.close();

  console.log('— 👁 v7.40 the viewer inside the app is the same page —');
  const frame = () => page.frames().find(f => /\/c\/\?c=/.test(f.url()));
  const frameReady = async () => wait(async () => { const f = frame(); return f && await f.evaluate(() => !!document.getElementById('moneyCard')); }, 12000);

  ok('View as this client opens the page with &pv=1 and NO owner mode — no owner line, no bars, none of the owner words', await (async () => {
    await page.evaluate(() => clientPreviewOpen(0));
    const src = await page.evaluate(() => $('cpFrame').src);
    return /pv=1/.test(src) && !/owner=1/.test(src) && await frameReady()
      && await frame().evaluate(() => !document.querySelector('.own-head, .own-bar, .own-off, .own-inline, .own-tiles') && !/OWNER VIEW|THEY SEE THIS|HIDDEN FROM THEM/.test((document.getElementById('app') || document.body).textContent));
  })());
  ok('the hidden budget card is NOT drawn in the viewer — Eric sees exactly what they get; upcoming, where it stands and work by phase are there', await frame().evaluate(() =>
    !document.getElementById('budgetCard') && !!document.getElementById('upcomingCard') && !!document.getElementById('moneyCard') && !!document.getElementById('phasesCard')));
  ok('the hidden board is not listed inside the viewer either — 2 of 3', await frame().evaluate(async () => {
    await boardsOpen();
    const rows = [...document.querySelectorAll('#boardCard .bd-row')].map(r => r.textContent);
    return rows.length === 2 && !rows.some(t => /Shower drain/.test(t));
  }));
  ok('an older app asking for owner mode inside the frame (&owner=1) gets the plain page too', await (async () => {
    await page.evaluate(() => { $('cpFrame').src = $('cpFrame').src + '&owner=1'; });
    await page.waitForTimeout(300);
    return await frameReady() && await frame().evaluate(() => /owner=1/.test(location.search) && !document.querySelector('.own-head, .own-bar, .own-off') && !document.getElementById('budgetCard'));
  })());
  await page.evaluate(() => clientPreviewClose());

  console.log('— 🎛 v7.40 the switches live on the portal now —');
  ok('🎛 What they see (the portal fold) writes the same page file: show the budget → show.budget true, and a fresh homeowner load has the card', await (async () => {
    await page.evaluate(async () => { openPortalWin(); await renderPortalList(); _portalOpen = 0; await renderPortalList(); openPageVis(0); });
    const drawn = await wait(() => page.evaluate(() => document.querySelectorAll('#pvBox .pv-row').length >= 9), 8000);
    if (!drawn) return false;
    await page.evaluate(() => { [...document.querySelectorAll('#pvBox .pv-row')].find(r => r.dataset.key === 'budget').querySelector('.pv-sw').click(); });
    const wrote = await wait(() => pageJson().show.budget === true);
    const h2 = await ctx.newPage(); await h2.goto(SRV + '/c/?c=' + CODE); await h2.waitForTimeout(700);
    const has = await h2.evaluate(() => !!document.getElementById('budgetCard'));
    await h2.close();
    return wrote && has;
  })());
  ok('money is opt-in: hiding it writes false, showing it writes true (never a missing key)', await (async () => {
    await page.evaluate(() => pageShowSet(0, 'money', false)); const a = await wait(() => pageJson().show.money === false);
    await page.evaluate(() => pageShowSet(0, 'money', true)); const b = await wait(() => pageJson().show.money === true);
    return a && b;
  })());
  ok('a card name the app does not know is dropped, not written', await (async () => {
    await page.evaluate(() => pageShowSet(0, 'wallet', false));
    await page.waitForTimeout(300);
    return pageJson().show.wallet === undefined;
  })());
  ok('every plate in the window is a WORD, never a lamp alone', await page.evaluate(() =>
    [...document.querySelectorAll('#pvBox .pv-sw')].every(b => /[A-Za-z]{3,}/.test(b.textContent))));
  await page.evaluate(() => pageVisClose());

  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v7.40') && document.querySelector('footer').textContent.includes(APP_VER);
  }));

  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  srv.close();
  process.exit(fail ? 1 : 0);
})();
