// 🔍 v7.79 — FIND A CATEGORY; 👁 THEIR PAGE FROM ANY LINE. Eric: "on the top of the estimates page i need to be able to search for
// categories, scrolling is taking a while to find things" — and, while it was being built: "and on each item a small icon to click
// to see client view, i want to keep checking back and forth quickly when i make changes and see what they see". A search box is
// the first thing under the board's title: what matches sits right under it, still in its sections, Enter opens the first, a
// category he took off the board is offered back. Every row wears a small 👁 at its front: a change still waiting is saved first,
// their page opens over the board with that line brought to the middle, and the board is exactly as it was when he comes back.
// A tiny HTTP server serves the app, the REAL homeowner page and the function's page route from one store, so the viewer's frame
// is the app's own origin — as it is on the live site. Every name and figure below is made up.
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
(async () => {
  const APP = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const ROOT = path.dirname(decodeURIComponent(new URL(APP).pathname).replace(/^\/([A-Za-z]:)/, '$1'));
  const src = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const CODE = 'oak-111111';
  const store = new Map();
  const state = { base: '' };
  const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.txt': 'text/plain', '.json': 'application/json', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml' };
  const srv = http.createServer((req, res) => {
    const u = new URL(req.url, 'http://x');
    const send = (code, body, type) => { res.writeHead(code, { 'content-type': type || 'text/plain', 'cache-control': 'no-store' }); res.end(body); };
    let body = ''; req.on('data', d => { body += d; }); req.on('end', () => {
      if (u.pathname === '/__get') { const v = store.get(u.searchParams.get('path')); return v == null ? send(404, '') : send(200, v); }
      if (u.pathname === '/__put') { store.set(u.searchParams.get('path'), body); return send(200, 'ok'); }
      if (/client-portal/.test(u.pathname)) {
        if (req.method === 'POST') return send(200, 'ok');
        if (u.searchParams.get('boards')) return send(200, '{"boards":[]}', 'application/json');
        if (u.searchParams.get('a')) return send(200, '[]', 'application/json');
        if (u.searchParams.get('mat')) return send(200, '{"rooms":[]}', 'application/json');
        if (u.searchParams.get('p') || u.searchParams.get('bimg') || u.searchParams.get('manifest')) return send(404, '');
        const v = store.get(state.base + '/' + u.searchParams.get('c') + '.json');
        return v == null ? send(404, '{"error":"not found"}', 'application/json') : send(200, v, 'application/json');
      }
      if (/^\/\.netlify\//.test(u.pathname)) return send(404, '');
      if (u.pathname === '/' || u.pathname === '/index.html') return send(200, fs.readFileSync(path.join(ROOT, 'index.html')), TYPES['.html']);
      if (u.pathname === '/c/' || u.pathname === '/c/index.html') return send(200, fs.readFileSync(path.join(ROOT, 'c', 'index.html')), TYPES['.html']);
      const f = path.normalize(path.join(ROOT, decodeURIComponent(u.pathname)));
      if (f.startsWith(ROOT) && TYPES[path.extname(f)] && fs.existsSync(f) && fs.statSync(f).isFile()) return send(200, fs.readFileSync(f), TYPES[path.extname(f)]);
      send(404, '');
    });
  });
  await new Promise(r => srv.listen(0, '127.0.0.1', r));
  const SRV = 'http://127.0.0.1:' + srv.address().port;

  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await ctx.route(u => !u.href.startsWith(SRV), r => r.abort());
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => { if (!/Failed to fetch|ServiceWorker|service worker/i.test(e.message)) errs.push(e.message); });
  await page.goto(SRV + '/'); await page.waitForTimeout(900);
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };
  const wait = async (fn, ms = 6000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { try { if (await fn()) return true; } catch (e) {} await new Promise(r => setTimeout(r, 100)); } return false; };

  const setup = await page.evaluate(CODE => {
    window.dbxDownload = async p => { const r = await fetch('/__get?path=' + encodeURIComponent(p)); return r.ok ? await r.text() : null; };
    window.dbxUpload = async (p, body) => { (window._ups = window._ups || []).push(p); await fetch('/__put?path=' + encodeURIComponent(p), { method: 'POST', body: typeof body === 'string' ? body : JSON.stringify(body) }); return { path_display: p }; };
    window.dbxPathExists = async p => (await fetch('/__get?path=' + encodeURIComponent(p))).ok;
    window.dbxRpc = async () => ({});
    window.scheduleSave = () => {}; window.publishSharedNotes = async () => {}; window.savePendingSoon = () => {};
    dbx.refreshToken = 'test-token';
    jobs = ['Oak House']; curJob = ''; entries = []; todos = []; nextId = 1; crew = ['Phil']; prefs.office = [];
    _portalIdx = { clients: [{ key: 'oak', job: 'Oak House', code: CODE }] };
    window._said = []; const t0 = window.toast; window.toast = (m, g) => { if (m) _said.push(String(m)); return t0(m, g); };
    return { base: portalRoot(), est: estPath(CODE), origin: location.origin };
  }, CODE);
  state.base = setup.base;
  const pagePath = state.base + '/' + CODE + '.json';
  const one = (n, e1, appr, more) => ({ n, appr: !!appr, bids: e1 ? [{ e1, e2: 0, acc: true }] : [], ...(more || {}) });
  // twelve lines on their page (so their page is long), two office-only ones, one with only a receipt on the way, one he took off
  const board = () => ({ mk: 20, gone: ['Septic'], cats: [
    one('Demo', 0, false, { pend: [{ a: 500, inc: false, v: '', ts: '2026-09-29', base: 0 }] }),
    one('Dirt work', 4000, true), one('Concrete and foundation', 15000, true), one('Framing', 12000, true), one('Trusses', 8000, true),
    one('Roofing', 9000, true), one('Windows', 7000, true), one('Siding', 11000, true), one('Plumbing', 10000, true), one('Electrical', 9500, true),
    one('Insulation', 6000, true), one('Drywall', 8500, true), one('Tile showers', 5000, true),
    one('Interior Paint', 6000, false), one('Ext Painting', 0, false),
    one('Trash / Construction Debris', 900, false)] });
  store.set(setup.est, JSON.stringify(board()));
  store.set(pagePath, JSON.stringify({ name: 'Oak House', updated: '2026-09-28', show: { money: true }, invoiced: 0, paid: 0, open: 0, journal: [], phases: [], budget: [], upcoming: { items: [], tot: 0, all: 1 } }));
  ok('the harness: the app and their page are served from one origin (as on the live site)', setup.origin === SRV, setup.origin);

  const openBoard = async () => { await page.evaluate(async () => { await openEstimates(0); }); await page.waitForTimeout(1800); await page.evaluate(() => { window._ups = []; _said.length = 0; }); };
  const rows = () => page.evaluate(() => [...document.querySelectorAll('.est-board .est-row')].map(r => r.querySelector('.est-name').textContent.replace(/[▸▾]/g, '').trim()));
  const heads = () => page.evaluate(() => [...document.querySelectorAll('.est-board .est-phase')].map(h => h.textContent.replace(/\s+/g, ' ').trim()));
  await openBoard();
  const all0 = await rows();

  // ───────────────────────── 🔍 find a category ─────────────────────────
  console.log('— 🔍 find a category —');
  const box = await page.evaluate(() => { const b = $('estSearch'), q = b.getBoundingClientRect(), kids = [...document.querySelector('.est-board').children]; return { ph: b.placeholder, h: Math.round(q.height), fs: getComputedStyle(b).fontSize, idx: kids.indexOf(b.closest('.est-search')), h3: kids[0].tagName, w: Math.round(q.width), val: b.value, firstRowTop: document.querySelector('.est-row').getBoundingClientRect().top, topTop: document.querySelector('.est-top').getBoundingClientRect().top }; });
  ok('the search box is the first thing under the board\'s title: "🔍 Find a category…", 44px tall, 16px letters (no zoom on an iPhone), empty', box.h3 === 'H3' && box.idx === 1 && /Find a category/.test(box.ph) && box.h >= 44 && box.fs === '16px' && box.val === '' && box.w >= 300, JSON.stringify(box));
  ok('with no search every category is on the list, under the top of the board as before (' + all0.length + ' rows)', all0.length >= 55 && box.topTop < box.firstRowTop && all0.includes('Framing') && all0.includes('Insulation'), String(all0.length));
  await page.click('#estSearch');
  await page.keyboard.type('p');
  const p1 = await rows();
  await page.keyboard.type('aint');
  const p2 = await rows();
  const s2 = await page.evaluate(() => ({ say: $('estSearchSay').textContent.replace(/\s+/g, ' ').trim(), focus: document.activeElement.id, val: $('estSearch').value, caret: $('estSearch').selectionStart, firstRowTop: document.querySelector('.est-row').getBoundingClientRect().top, topTop: document.querySelector('.est-top').getBoundingClientRect().top, boxBottom: $('estSearch').getBoundingClientRect().bottom }));
  ok('typing narrows the list letter by letter: "p" finds every name with a p in it (Plumbing among them), and "paint" finds Interior Paint and Ext Painting', p1.length > p2.length && p1.includes('Plumbing') && p1.every(n => /p/i.test(n)) && p2.length === 2 && p2.includes('Interior Paint') && p2.includes('Ext Painting'), JSON.stringify([p1, p2]));
  ok('the box keeps his thumb through every redraw (still focused, the caret at the end), and a line under it counts: 🔍 2 categories match “paint”', s2.focus === 'estSearch' && s2.val === 'paint' && s2.caret === 5 && /^🔍 2 categories match “paint” — tap one to open it · ✕ clears the search$/.test(s2.say), JSON.stringify(s2));
  ok('what matches sits RIGHT UNDER the box — above the rest of the top of the board (the bills strip, the help) — so it is on the screen with the keyboard up', s2.firstRowTop < s2.topTop && s2.firstRowTop - s2.boxBottom < 160, JSON.stringify(s2));
  ok('the sections stay, only the ones that hold a match, and each says how many of its categories are showing', await (async () => { const h = await heads(); return h.length === 2 && h.every(t => /\d+ of \d+ shown$/.test(t)) && !h.some(t => /approved/.test(t)); })(), JSON.stringify(await heads()));
  ok('the matching rows are still folded to their one line (a tap opens one)', await page.evaluate(() => document.querySelectorAll('.est-row.est-open').length === 0 && document.querySelectorAll('.est-bid').length === 0));
  await page.evaluate(() => estSearchSet('INT paint'));
  ok('every word must be in the name, capitals aside: "INT paint" → Interior Paint and Ext Painting ("int" is in both)… and "interior paint" → Interior Paint alone', JSON.stringify(await rows()) === JSON.stringify(['Ext Painting', 'Interior Paint']) && await (async () => { await page.evaluate(() => estSearchSet('interior paint')); const r = await rows(); return r.length === 1 && r[0] === 'Interior Paint' && /^🔍 1 category matches “interior paint” — tap it to open it/.test(await page.evaluate(() => $('estSearchSay').textContent.trim())); })(), JSON.stringify(await rows()));
  await page.evaluate(() => estSearchSet('landfill'));
  ok('the books\' other names for a line find it too: "landfill" → Trash / Construction Debris', JSON.stringify(await rows()) === JSON.stringify(['Trash / Construction Debris']), JSON.stringify(await rows()));
  await page.evaluate(() => estSearchSet('demo'));
  ok('a category that NEEDS HIM (a receipt waiting) is found under its ⚠ Needs you heading', await (async () => { const h = await heads(), r = await rows(); return r.length === 1 && r[0] === 'Demo' && /^⚠ Needs you/.test(h[0]); })(), JSON.stringify([await heads(), await rows()]));
  await page.evaluate(() => estSearchSet('zzz'));
  const none = await page.evaluate(() => ({ rows: document.querySelectorAll('.est-row').length, say: $('estSearchSay').textContent.replace(/\s+/g, ' ').trim(), back: !!$('estSearchBack') }));
  ok('nothing found says so in words, and points at ➕ category', none.rows === 0 && /^🔍 No category on this board matches “zzz” — ➕ category at the foot of the board adds one · ✕ clears the search$/.test(none.say) && !none.back, JSON.stringify(none));
  await page.evaluate(() => estSearchSet('sept'));
  const gone = await page.evaluate(() => ({ rows: document.querySelectorAll('.est-row').length, back: $('estSearchBack') ? $('estSearchBack').textContent.replace(/\s+/g, ' ').trim() : '', chips: [...document.querySelectorAll('#estSearchBack .est-back')].map(b => b.textContent.trim()) }));
  ok('a category he once TOOK OFF this board is offered back by name: 🗑 You took this one off this board: ↩ Septic', gone.rows === 0 && /You took this one off this board/.test(gone.back) && gone.chips.join() === '↩ Septic', JSON.stringify(gone));
  await page.evaluate(() => document.querySelector('#estSearchBack .est-back').click());
  await page.waitForTimeout(150);
  ok('…one tap puts it back, and it is right there as the match', JSON.stringify(await rows()) === JSON.stringify(['Septic']) && await page.evaluate(() => !(_estD.gone || []).includes('Septic') && _estD.cats.some(x => x.n === 'Septic') && _said.some(t => /↩ Septic is back on this board/.test(t))), JSON.stringify(await rows()));
  await page.evaluate(() => estSearchSet('roof'));
  await page.click('#estSearch'); await page.keyboard.press('Enter');
  await page.waitForTimeout(200);
  const go = await page.evaluate(() => { const r = document.querySelector('.est-row.est-open'); return { open: r ? r.querySelector('.est-name').textContent.replace(/[▸▾]/g, '').trim() : '', bids: document.querySelectorAll('.est-row.est-open .est-bid').length, focus: document.activeElement.id, q: $('estSearch').value }; });
  ok('Enter (the phone\'s Search key) opens the first one found — Roofing unfolds, the keyboard is let go, the search stays', go.open === 'Roofing' && go.bids === 1 && go.focus !== 'estSearch' && go.q === 'roof', JSON.stringify(go));
  ok('working inside the found category keeps it on the screen: a number typed there, and the list is still the search', await page.evaluate(() => { const ci = _estD.cats.findIndex(x => x.n === 'Roofing'); estBidSet(ci, 0, 'e2', '250'); const r = [...document.querySelectorAll('.est-row')]; return r.length === 1 && r[0].classList.contains('est-open') && _estD.cats[ci].bids[0].e2 === 250; }));
  await page.evaluate(() => { const ci = _estD.cats.findIndex(x => x.n === 'Roofing'); estBidSet(ci, 0, 'e2', ''); });
  await page.evaluate(() => { const ci = _estD.cats.findIndex(x => x.n === 'Tile showers'); _estD.cats[ci].bids[0].guess = true; estSearchSet('t'); estGuessOnly(); });
  const both = await page.evaluate(() => ({ rows: [...document.querySelectorAll('.est-row')].map(r => r.querySelector('.est-name').textContent.replace(/[▸▾]/g, '').trim()), say: $('estSearchSay').textContent.replace(/\s+/g, ' ').trim() }));
  ok('with ≈ only-the-best-guesses lit, both narrow together — and the line says "among the best guesses"', both.rows.join() === 'Tile showers' && /1 category matches “t” \(among the best guesses\)/.test(both.say), JSON.stringify(both));
  await page.evaluate(() => { estGuessOnly(); const ci = _estD.cats.findIndex(x => x.n === 'Tile showers'); delete _estD.cats[ci].bids[0].guess; renderEstimates(); });
  await page.evaluate(() => document.querySelector('.est-search .mat-search-x').click());
  const cleared = await page.evaluate(() => ({ n: document.querySelectorAll('.est-row').length, val: $('estSearch').value, say: !!$('estSearchSay'), x: !!document.querySelector('.est-search .mat-search-x'), order: document.querySelector('.est-top').getBoundingClientRect().top < document.querySelector('.est-row').getBoundingClientRect().top, heads: [...document.querySelectorAll('.est-phase')].some(h => /approved/.test(h.textContent)) }));
  ok('✕ clears it: every category is back, the top of the board is above the list again, the headings say their money again', cleared.n === all0.length + 1 && cleared.val === '' && !cleared.say && !cleared.x && cleared.order && cleared.heads, JSON.stringify(cleared));
  ok('at 390px nothing runs off the side, with and without a search', await page.evaluate(() => { const b = document.querySelector('.est-board'); const a = b.scrollWidth <= b.clientWidth + 1; estSearchSet('pl'); const c = b.scrollWidth <= b.clientWidth + 1; estSearchClear(); return a && c; }));
  await page.evaluate(() => { estSearchSet('fram'); closeEstimates(); });
  await openBoard();
  ok('a fresh open of the board starts with no search', await page.evaluate(() => $('estSearch').value === '' && document.querySelectorAll('.est-row').length >= 55));

  // ───────────────────────── 👁 their page from any line ─────────────────────────
  console.log('— 👁 the eye on every row —');
  const eyes = await page.evaluate(() => { const rs = [...document.querySelectorAll('.est-board .est-row')]; const e = rs.map(r => r.querySelector('.est-line > .est-eye'));
    const nm = n => rs.find(r => r.querySelector('.est-name').textContent.replace(/[▸▾]/g, '').trim() === n);
    const q = el => el.getBoundingClientRect();
    return { rows: rs.length, eyes: e.filter(Boolean).length, first: rs.every(r => r.querySelector('.est-line').firstElementChild.classList.contains('est-eye')), lefts: [...new Set(e.map(x => Math.round(q(x).left)))], w: Math.round(q(e[0]).width), h: Math.round(q(e[0]).height),
      offFr: nm('Framing').querySelector('.est-eye').classList.contains('off'), offPaint: nm('Interior Paint').querySelector('.est-eye').classList.contains('off'), offDemo: nm('Demo').querySelector('.est-eye').classList.contains('off'),
      aria: [nm('Framing').querySelector('.est-eye').getAttribute('aria-label'), nm('Interior Paint').querySelector('.est-eye').getAttribute('aria-label')],
      gap: Math.round(q(nm('Framing').querySelector('.est-lamp')).left - q(nm('Framing').querySelector('.est-eye')).right),
      longName: (() => { const n = nm('Trash / Construction Debris').querySelector('.est-name'); return { ws: getComputedStyle(n).whiteSpace, h: Math.round(q(n).height), one: Math.round(q(nm('Framing').querySelector('.est-name')).height) }; })() }; });
  ok('every row has one small 👁 at its front — the same place on every row (one straight column), 30px or more', eyes.rows === eyes.eyes && eyes.first && eyes.lefts.length === 1 && eyes.w >= 30 && eyes.h >= 30 && eyes.w <= 40, JSON.stringify(eyes));
  ok('it is the far side from the lamp (a stray thumb on a lit lamp takes a line off their page; on the eye it only looks)', eyes.gap >= 120, String(eyes.gap));
  ok('a line they see wears it bright; a line they do not see wears it dimmed, and says so to a reader; a line with only a receipt on their page is bright', !eyes.offFr && eyes.offPaint && !eyes.offDemo && eyes.aria[0] === 'see Framing on their page' && eyes.aria[1] === 'see Interior Paint on their page — it is not on their page', JSON.stringify(eyes.aria));
  ok('a long name wraps onto a second line now instead of being cut to a few letters', eyes.longName.ws === 'normal' && eyes.longName.h > eyes.longName.one + 8, JSON.stringify(eyes.longName));

  console.log('— a tap: their page, at that line —');
  const fr = () => page.frames().find(f => /\/c\/\?c=/.test(f.url()));
  const lineIn = name => fr().evaluate(name => { const first = el => String((el.querySelector('span') || {}).textContent || '').replace(/\s+/g, ' ').trim(); const row = [...document.querySelectorAll('#budgetCard .bud-row, #upcomingCard .rc-row')].find(r => first(r) === name); if (!row) return null; const q = row.getBoundingClientRect(); return { top: Math.round(q.top), bottom: Math.round(q.bottom), vh: innerHeight, outline: row.style.outline, text: row.textContent.replace(/\s+/g, ' ').trim().slice(0, 120), card: row.closest('.card').id }; }, name);
  // first the plain viewer, to see where the line sits when nobody looks for it
  await page.evaluate(() => clientPreviewOpen(0));
  await wait(async () => fr() && await fr().evaluate(() => !!document.querySelector('#budgetCard .bud-row')));
  const plain = await lineIn('Tile showers');
  await page.evaluate(() => clientPreviewClose());
  ok('(their page is long: opened plainly, the Tile showers line is far below the screen)', plain && plain.top > plain.vh, JSON.stringify(plain));
  const ti = await page.evaluate(() => { const ci = _estD.cats.findIndex(x => x.n === 'Tile showers'); _estOpenCats = new Set([ci]); renderEstimates(); document.querySelector(`.est-row[data-ci="${ci}"]`).scrollIntoView({ block: 'center' }); return ci; });
  const before = await page.evaluate(() => ({ st: $('revModal').scrollTop, open: [..._estOpenCats].join() }));
  await page.click(`.est-row[data-ci="${ti}"] .est-eye`);
  await wait(async () => fr() && await fr().evaluate(() => !!document.querySelector('#budgetCard .bud-row')));
  await wait(async () => { const l = await lineIn('Tile showers'); return l && l.outline; });
  const seen = await lineIn('Tile showers');
  const view = await page.evaluate(() => ({ show: $('cliPrev').classList.contains('show'), banner: document.querySelector('.cp-banner').textContent.trim(), over: +getComputedStyle($('cliPrev')).zIndex > +getComputedStyle($('revModal')).zIndex, board: $('revModal').classList.contains('show'), open: [..._estOpenCats].join() }));
  ok('a tap on the 👁 opens their page OVER the board (the board stays open underneath, the row is not folded by the tap), and the banner names the line', view.show && view.over && view.board && view.open === before.open && /^👁 THEIR PAGE — Tile showers · TAP HERE TO COME BACK$/.test(view.banner), JSON.stringify(view));
  ok('their page is brought to that line: Tile showers is on the screen, in ESTIMATED REMAINING COSTS, with its edge showing for a moment', seen && seen.card === 'budgetCard' && seen.top >= 0 && seen.bottom <= seen.vh && /solid/.test(seen.outline) && /Tile showers/.test(seen.text) && /\$6,000/.test(seen.text), JSON.stringify(seen));
  await page.waitForTimeout(2000);
  ok('…and the edge lets go by itself — what is left is exactly their page', (await lineIn('Tile showers')).outline === '');
  await page.click('.cp-banner');
  const back = await page.evaluate(() => ({ show: $('cliPrev').classList.contains('show'), st: $('revModal').scrollTop, open: [..._estOpenCats].join(), banner: document.querySelector('.cp-banner').textContent.trim(), src: $('cpFrame').getAttribute('src') }));
  ok('a tap on the banner comes straight back: the board is where it was — the same line open, the same place on the page', !back.show && Math.abs(back.st - before.st) <= 2 && back.open === before.open && /^👁 CLIENT PREVIEW · TAP HERE TO COME BACK$/.test(back.banner), JSON.stringify([before, back]));

  console.log('— a change is saved before he looks —');
  await page.evaluate(ci => { window._ups = []; estBidSet(ci, 0, 'e1', '5500'); }, ti);
  const pend = await page.evaluate(() => !!_estTimer);
  await page.click(`.est-row[data-ci="${ti}"] .est-eye`);
  await wait(async () => fr() && await fr().evaluate(() => !!document.querySelector('#budgetCard .bud-row')));
  await wait(async () => { const l = await lineIn('Tile showers'); return l && /\$6,600/.test(l.text); });
  const fresh = await lineIn('Tile showers');
  ok('a number changed a moment ago (its save still waiting) is on their page by the time it opens: the line reads the new number', pend && fresh && /\$6,600/.test(fresh.text) && JSON.parse(store.get(pagePath)).budget.find(b => b.n === 'Tile showers').est === 6600 && await page.evaluate(() => !_estTimer && window._ups.some(u => /oak-111111\.json$/.test(u))), JSON.stringify(fresh));
  await page.evaluate(() => clientPreviewClose());

  console.log('— a line they do not see, and a line with only a receipt —');
  const pi = await page.evaluate(() => _estD.cats.findIndex(x => x.n === 'Interior Paint'));
  await page.evaluate(ci => document.querySelector(`.est-row[data-ci="${ci}"] .est-eye`).click(), pi);
  await wait(async () => fr() && await fr().evaluate(() => !!document.querySelector('#budgetCard .bud-row')));
  await page.waitForTimeout(700);
  const off = await page.evaluate(() => ({ show: $('cliPrev').classList.contains('show'), banner: document.querySelector('.cp-banner').textContent.trim() }));
  const offPg = await fr().evaluate(() => ({ has: /Interior Paint/.test(document.body.innerText), outlined: [...document.querySelectorAll('.bud-row, .rc-row')].filter(r => r.style.outline).length }));
  ok('an office-only line: their page still opens, and the banner says it in words — "is office-only, they do not see it" — nothing on their page is marked', off.show && /^👁 THEIR PAGE — Interior Paint is office-only, they do not see it · TAP HERE TO COME BACK$/.test(off.banner) && !offPg.has && offPg.outlined === 0, JSON.stringify([off, offPg]));
  await page.evaluate(() => clientPreviewClose());
  const di = await page.evaluate(() => _estD.cats.findIndex(x => x.n === 'Demo'));
  await page.evaluate(ci => document.querySelector(`.est-row[data-ci="${ci}"] .est-eye`).click(), di);
  await wait(async () => fr() && await fr().evaluate(() => !!document.querySelector('#upcomingCard .rc-row')));
  await wait(async () => { const l = await lineIn('Demo'); return l && l.outline; });
  const rc = await lineIn('Demo');
  ok('a line with only a receipt on their page: the banner says "they see its receipts, not its estimate" and the receipt line is the one shown', rc && rc.card === 'upcomingCard' && /solid/.test(rc.outline) && rc.top >= 0 && rc.bottom <= rc.vh && /^👁 THEIR PAGE — Demo: they see its receipts, not its estimate · TAP HERE TO COME BACK$/.test(await page.evaluate(() => document.querySelector('.cp-banner').textContent.trim())), JSON.stringify(rc));
  await page.evaluate(() => clientPreviewClose());
  ok('looking writes nothing: no file is saved by the 👁 when nothing was waiting', await page.evaluate(async ci => { window._ups = []; await estPeek(ci); const n = window._ups.length; clientPreviewClose(); return n === 0; }, ti));
  ok('? How this works says both: the search box and the 👁', await page.evaluate(() => /🔍 Find a category: type a few letters in the box at the top/.test($('estHelpBox').textContent) && /👁 on every row: tap it to see their page at that line/.test($('estHelpBox').textContent)));
  await page.evaluate(() => closeEstimates());

  ok('their page\'s own code is not changed by any of this (the app looks into its own frame)', !/cpSeek|estPeek|estSearch/.test(fs.readFileSync(path.join(ROOT, 'c', 'index.html'), 'utf8')));
  ok('version bumped — APP_VER and the footer agree', /const APP_VER = 'v7\.(79|[89]\d)'/.test(src) && new RegExp('<footer>' + (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1].replace('.', '\\.') + ' ·').test(src));
  ok('version.txt matches the build', fs.readFileSync(path.join(ROOT, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close(); srv.close();
  process.exit(fail ? 1 : 0);
})();
