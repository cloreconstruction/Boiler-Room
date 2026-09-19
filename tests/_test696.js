// ┄ v6.96 — Eric: "anytime im in the client preview i want anything they cant see to have a dashed border, bright, even the
// buttons that are for me." The REAL homeowner page inside a frame in OWNER mode (a tiny HTTP server stands in for the
// function), and the same page opened plainly as the homeowner. Every name and figure below is made up.
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
(async () => {
  const APP = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const ROOT = path.dirname(decodeURIComponent(new URL(APP).pathname).replace(/^\/([A-Za-z]:)/, '$1'));
  const src = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
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
  for (let i = 0; i < 80 && !(fr() && await fr().evaluate(() => !!document.querySelector('.own-head')).catch(() => false)); i++) await new Promise(r => setTimeout(r, 100));

  console.log('— ┄ v6.96 the owner view: only-you things wear a bright dashed edge —');

  // helpers that run inside the frame
  const probe = () => fr().evaluate(() => {
    const lum = c => { const m = c.match(/[\d.]+/g).map(Number); const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(m[0]) + 0.7152 * f(m[1]) + 0.0722 * f(m[2]); };
    const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
    const tmp = document.createElement('div'); tmp.style.cssText = 'color: var(--mine); background: var(--gold); border-color: var(--bg)'; document.body.appendChild(tmp);
    const cs0 = getComputedStyle(tmp), mine = cs0.color, gold = cs0.backgroundColor, bg = cs0.borderTopColor; tmp.remove();
    const edge = el => { const c = getComputedStyle(el); return { style: c.borderTopStyle, w: parseFloat(c.borderTopWidth), color: c.borderTopColor }; };
    const rim = el => { const c = getComputedStyle(el); return { style: c.outlineStyle, w: parseFloat(c.outlineWidth), color: c.outlineColor, op: +c.opacity }; };
    const head = document.querySelector('.own-head');
    const btns = [...document.querySelectorAll('.own-bar button, .own-inline')];
    const hidden = [...document.querySelectorAll('.own-off')], seen = [...document.querySelectorAll('.card')].filter(c => !c.classList.contains('own-off'));
    const rgb = c => c.match(/[\d.]+/g).slice(0, 3).map(Number), far = (a, b) => Math.hypot(...rgb(a).map((v, i) => v - rgb(b)[i]));
    return { mine, gold, bg, contrast: ratio(mine, bg), vsGold: far(mine, gold), theme: document.documentElement.dataset.theme || 'dark',
      head: { ...edge(head), words: head.textContent }, nBtns: btns.length, btnsOk: btns.every(b => { const e = edge(b); return e.style === 'dashed' && e.w >= 2 && e.color === mine; }),
      btnWords: btns.map(b => b.textContent.trim().slice(0, 22)),
      hiddenIds: hidden.map(h => h.id || h.className), hiddenOk: hidden.length > 0 && hidden.every(h => { const r = rim(h); return r.style === 'dashed' && r.w >= 2.5 && r.color === mine && r.op === 1; }),
      innerDim: hidden.filter(h => h.classList.contains('card')).every(h => [...h.children].filter(k => !k.classList.contains('own-bar') && !k.classList.contains('own-tag')).every(k => +getComputedStyle(k).opacity < 1) && [...h.querySelectorAll(':scope > .own-bar')].every(k => +getComputedStyle(k).opacity === 1)),
      seenPlain: seen.length > 0 && seen.every(c => getComputedStyle(c).outlineStyle !== 'dashed' && getComputedStyle(c).borderTopColor !== mine) };
  });
  await fr().evaluate(() => { document.documentElement.dataset.theme = 'dark'; });
  const d = await probe();
  ok('the OWNER VIEW line wears the edge itself and says what it means in words — "a bright dashed edge … means ONLY YOU see it"', d.head.style === 'dashed' && d.head.w >= 2 && d.head.color === d.mine && /bright dashed edge, like this one, means ONLY YOU see it/.test(d.head.words), JSON.stringify(d.head));
  ok('EVERY button that is his — ✓ THEY SEE THIS / ○ HIDDEN, ✎ Edit, ➕ Add photos, the tile switches — has the bright dashed edge', d.nBtns >= 8 && d.btnsOk, JSON.stringify({ n: d.nBtns, words: d.btnWords }));
  ok('everything he has HIDDEN from them (a card, a tile) wears a bright dashed rim at FULL brightness — what is inside dims, his bar on it does not', d.hiddenOk && d.innerDim && d.hiddenIds.includes('upcomingCard') && d.hiddenIds.some(x => /matTile|soon/.test(x)), JSON.stringify(d.hiddenIds));
  ok('a thing they DO see keeps its plain edge — the sign means one thing only', d.seenPlain);
  ok('the colour is one their page never uses (not its gold) and it stands out from the page: 3:1 or better on the dark page', d.vsGold > 120 && d.contrast >= 3 && d.mine !== d.gold, JSON.stringify({ mine: d.mine, bg: d.bg, c: d.contrast }));

  await fr().evaluate(() => { document.documentElement.dataset.theme = 'light'; });
  const l = await probe();
  ok('…and on the LIGHT page too: still dashed, still his colour, still 3:1 or better against the cream', l.btnsOk && l.hiddenOk && l.contrast >= 3 && l.vsGold > 120 && l.mine !== d.mine, JSON.stringify({ mine: l.mine, bg: l.bg, c: l.contrast }));

  ok('a hidden option board in the Options window wears it too, with its ○ HIDDEN switch', await (async () => {
    await fr().evaluate(() => { document.documentElement.dataset.theme = 'dark'; const t = document.getElementById('boardTile'); if (t) t.click(); });
    for (let i = 0; i < 40 && !(await fr().evaluate(() => !!document.querySelector('.bd-row.own-off'))); i++) await new Promise(r => setTimeout(r, 100));
    return fr().evaluate(() => { const r = document.querySelector('.bd-row.own-off'); if (!r) return false; const c = getComputedStyle(r), b = getComputedStyle(r.querySelector('.own-inline'));
      return c.outlineStyle === 'dashed' && parseFloat(c.outlineWidth) >= 2.5 && b.borderTopStyle === 'dashed' && /HIDDEN FROM/.test(r.textContent); });
  })());

  console.log('— 🏠 the homeowner sees none of it —');
  const home = await ctx.newPage(); home.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push('home: ' + e.message); });
  await home.goto(SRV + '/c/?c=oak-1'); await home.waitForTimeout(900);
  ok('the plain page has no owner line, no owner buttons, nothing hidden drawn and not one dashed bright edge anywhere', await home.evaluate(() => {
    const tmp = document.createElement('div'); tmp.style.color = 'var(--mine)'; document.body.appendChild(tmp); const mine = getComputedStyle(tmp).color; tmp.remove();
    const any = [...document.querySelectorAll('body *')].some(el => { const c = getComputedStyle(el); return (c.borderTopStyle === 'dashed' && c.borderTopColor === mine) || (c.outlineStyle === 'dashed' && c.outlineColor === mine); });
    return !document.querySelector('.own-head, .own-bar, .own-off, .own-inline') && !any && !document.getElementById('upcomingCard');
  }));

  ok('version bumped — APP_VER, the footer and version.txt agree', (() => { const v = (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]; const num = x => (String(x).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(v) >= num('v6.96') && src.includes('<footer>' + v + ' ·') && fs.readFileSync(path.join(ROOT, 'version.txt'), 'utf8').trim() === v; })());
  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close(); srv.close();
  process.exit(fail ? 1 : 0);
})();
