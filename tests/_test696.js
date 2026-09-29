// ┄ v6.96 gave the owner view a bright dashed edge on everything only Eric sees. 🎛 v7.40 took the owner view out — Eric:
// "on the client view take out the blue dotted boxes off, id rather setup which functions they see or dont on a different
// page." This suite now proves the OTHER direction: the REAL homeowner page inside a frame that still asks for owner mode
// (an older app, &owner=1) draws nothing but the homeowner's page — no owner line, no owner buttons, nothing hidden drawn,
// not one dashed edge — in both themes, and the plain page is the same. A tiny HTTP server stands in for the function.
// Every name and figure below is made up.
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
(async () => {
  const APP = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const ROOT = path.dirname(decodeURIComponent(new URL(APP).pathname).replace(/^\/([A-Za-z]:)/, '$1'));
  const src = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const csrc = fs.readFileSync(path.join(ROOT, 'c', 'index.html'), 'utf8');
  const pageJson = JSON.stringify({ name: 'Oak House', updated: '2026-09-10', show: { money: true, phases: true, upcoming: false, mat: false }, invoiced: 1000, paid: 800, open: 200,
    phases: [{ n: 1, name: 'Site', total: 100, cats: [['Demo', 100]] }], journal: [{ week: 'Sep 4 – Sep 10', released: '2026-09-10', text: 'Walls are up.', photos: [] }],
    budget: [{ n: 'Framing', est: 5000 }], upcoming: { items: [{ n: 'Septic', a: 600 }], tot: 600 }, boardsOff: ['b2'] });
  const boards = JSON.stringify({ boards: [{ id: 'b1', name: 'Drywall corners', img: '', groups: [{ n: 'Corners', o: ['Square', 'Bullnose'] }] }, { id: 'b2', name: 'Shower drain', img: '', groups: [{ n: 'Style', o: ['Linear', 'Center'] }] }] });
  const srv = http.createServer((req, res) => {
    const u = new URL(req.url, 'http://x'); const send = (code, body, type) => { res.writeHead(code, { 'content-type': type || 'text/plain' }); res.end(body); };
    if (/client-portal/.test(u.pathname)) {
      if (req.method === 'POST') return send(200, 'ok');
      if (u.searchParams.get('boards')) return send(200, boards, 'application/json');
      if (u.searchParams.get('a')) return send(200, '[]', 'application/json');
      if (u.searchParams.get('mat')) return send(200, '{"rooms":[]}', 'application/json');
      if (u.searchParams.get('p') || u.searchParams.get('bimg') || u.searchParams.get('manifest')) return send(404, '');
      return send(200, pageJson, 'application/json');
    }
    if (u.pathname === '/c/' || u.pathname === '/c/index.html') return send(200, fs.readFileSync(path.join(ROOT, 'c', 'index.html')), 'text/html; charset=utf-8');
    if (u.pathname === '/parent.html') return send(200, '<!doctype html><title>parent</title><body style="margin:0"><iframe id="f" src="/c/?c=oak-1&pv=1&owner=1" style="width:390px;height:1600px;border:0"></iframe>', 'text/html');
    send(404, '');
  });
  await new Promise(r => srv.listen(0, '127.0.0.1', r));
  const SRV = 'http://127.0.0.1:' + srv.address().port;
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  let pass = 0, fail = 0; const errs = [];
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };

  const page = await ctx.newPage(); page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
  await page.goto(SRV + '/parent.html');
  const fr = () => page.frames().find(f => /owner=1/.test(f.url()));
  for (let i = 0; i < 80 && !(fr() && await fr().evaluate(() => !!document.getElementById('moneyCard')).catch(() => false)); i++) await new Promise(r => setTimeout(r, 100));

  console.log('— 🎛 v7.40 a frame that still asks for owner mode gets the homeowner\'s page and nothing else —');
  // what an older app's &owner=1 used to draw: the OWNER VIEW line, a bar on every card, hidden cards dimmed with a rim,
  // a ○ HIDDEN switch on a board row — and the bright dashed --mine edge on all of it
  const probe = () => fr().evaluate(() => {
    const els = [...document.querySelectorAll('body *')];
    const dashed = els.filter(el => getComputedStyle(el).outlineStyle === 'dashed').map(el => el.className || el.tagName);   // the owner view marked a hidden thing with a dashed OUTLINE; the page's own option chips wear a dashed border by design
    return { theme: document.documentElement.dataset.theme || 'dark',
      owner: !!document.querySelector('.own-head, .own-bar, .own-off, .own-inline, .own-tag, .own-tiles'),
      words: /OWNER VIEW|THEY SEE THIS|HIDDEN FROM THEM|ONLY YOU see it/.test((document.getElementById('app') || document.body).textContent),   // the rendered page, not the script's own comments
      upcoming: !!document.getElementById('upcomingCard'), mat: !!document.getElementById('matTile'), money: !!document.getElementById('moneyCard'), journal: !!document.getElementById('journalCard'),
      dashed };
  });
  await fr().evaluate(() => { document.documentElement.dataset.theme = 'dark'; });
  const d = await probe();
  ok('dark: no owner line, no owner buttons, none of the owner words — and the parts he hid (upcoming, the Build List tile) are simply not drawn, as for the homeowner', !d.owner && !d.words && !d.upcoming && !d.mat && d.money && d.journal, JSON.stringify(d));
  ok('dark: not one dashed rim anywhere on the page', d.dashed.length === 0, JSON.stringify(d.dashed));
  await fr().evaluate(() => { document.documentElement.dataset.theme = 'light'; });
  const l = await probe();
  ok('light: the same — nothing of the owner view, no dashed edge', l.theme === 'light' && !l.owner && !l.words && !l.upcoming && !l.mat && l.dashed.length === 0, JSON.stringify(l));

  ok('the Options window lists only the boards they get (the hidden one is not there) and no row carries a switch', await (async () => {
    await fr().evaluate(() => { document.documentElement.dataset.theme = 'dark'; const t = document.getElementById('boardTile'); if (t) t.click(); });
    for (let i = 0; i < 40 && !(await fr().evaluate(() => document.querySelectorAll('.bd-row').length > 0)); i++) await new Promise(r => setTimeout(r, 100));
    return fr().evaluate(() => { const rows = [...document.querySelectorAll('.bd-row')]; return rows.length === 1 && /Drywall corners/.test(rows[0].textContent) && !rows[0].querySelector('button') && !/Shower drain/.test(document.body.textContent); });
  })());

  console.log('— 🏠 the plain page —');
  const home = await ctx.newPage(); home.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push('home: ' + e.message); });
  await home.goto(SRV + '/c/?c=oak-1'); await home.waitForTimeout(900);
  ok('the plain page: no owner line, no owner buttons, nothing hidden drawn, not one dashed rim', await home.evaluate(() => {
    const any = [...document.querySelectorAll('body *')].some(el => getComputedStyle(el).outlineStyle === 'dashed');
    return !document.querySelector('.own-head, .own-bar, .own-off, .own-inline') && !any && !document.getElementById('upcomingCard') && !!document.getElementById('moneyCard');
  }));
  ok('the owner code is out of the homeowner page for good — no OWNER, no ownerMsg, no --mine, no own- class in its source', !/\bOWNER\b|ownerMsg|ownerDecorate|--mine|own-bar|own-off|own-head/.test(csrc));
  ok('and the app no longer asks for it — the viewer opens the page with &pv=1 alone', /portalUrl\(i\) \+ '&pv=1';/.test(src) && !/&owner=1/.test(src));

  ok('version bumped — APP_VER, the footer and version.txt agree', (() => { const v = (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]; const num = x => (String(x).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(v) >= num('v7.40') && src.includes('<footer>' + v + ' ·') && fs.readFileSync(path.join(ROOT, 'version.txt'), 'utf8').trim() === v; })());
  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close(); srv.close();
  process.exit(fail ? 1 : 0);
})();
