// 🎛 v7.40 — WHAT THEY SEE. Eric: "on the client view take out the blue dotted boxes off, id rather setup which functions they
// see or dont on a different page. also office crew should be able to click on the client viewer." The client viewer is the
// homeowner's page exactly as they get it (no owner bars, no dashed edges, nothing hidden drawn); the switches live in a
// window of their own off the portal fold; an office crew phone opens the viewer and has no switches. A tiny HTTP server
// stands in for the function so the app and the real homeowner page share ONE store, the way they share Dropbox. Every
// name and figure below is made up.
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
(async () => {
  const APP = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const ROOT = path.dirname(decodeURIComponent(new URL(APP).pathname).replace(/^\/([A-Za-z]:)/, '$1'));
  const CODE = 'test-1234';
  const store = new Map();
  const state = { base: '' };
  const lib = { v: 1, boards: [
    { id: 'b1', name: 'Sheetrock / Drywall', img: '', groups: [{ n: 'Corners', o: ['Square', 'Bullnose'] }] },
    { id: 'b2', name: 'Shower drain', img: '', groups: [{ n: 'Style', o: ['Linear', 'Center'] }] },
    { id: 'b3', name: 'Siding colors', img: '', groups: [{ n: 'Color', o: ['Sage', 'Slate'] }] },
    { id: 'b4', name: 'Retired board', on: false, img: '', groups: [] }] };
  const served = () => JSON.stringify({ boards: lib.boards.filter(b => b.on !== false) });
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
        if (u.searchParams.get('boards')) return send(200, served(), 'application/json');
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
    jobs = ['Mery']; curJob = 'Mery'; entries = []; nextId = 1; prefs.office = ['Phil']; crew = ['Phil'];
    _portalIdx = { clients: [{ key: 'mery', job: 'Mery Addition & Remodel', code: CODE }] };
    _boards = null;
    window._said = []; const t0 = window.toast; window.toast = (m, g) => { if (m) _said.push(String(m)); return t0(m, g); };
    return { base: portalRoot(), boardsPath: BOARDS_DIR() + '/boards.json' };
  }, { SRV, CODE });
  state.base = setup.base;
  store.set(setup.boardsPath, JSON.stringify(lib));
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
  const frame = () => page.frames().find(f => /\/c\/\?c=/.test(f.url()));
  const frameReady = async () => wait(async () => { const f = frame(); return f && await f.evaluate(() => !!document.getElementById('moneyCard')); }, 12000);
  const rows = () => page.evaluate(() => [...document.querySelectorAll('#pvBox .pv-row')].map(r => ({ k: r.dataset.key, t: r.querySelector('.pv-sw').textContent.trim(), on: r.querySelector('.pv-sw').getAttribute('aria-pressed') === 'true', sel: r.querySelector('.pv-sw').classList.contains('sel') })));
  const rowOf = async k => (await rows()).find(r => r.k === k) || {};
  const tap = k => page.evaluate(k => { const r = [...document.querySelectorAll('#pvBox .pv-row')].find(r => r.dataset.key === k); r.querySelector('.pv-sw').click(); }, k);
  const windowRows = async () => wait(async () => (await rows()).length >= 12, 8000);

  console.log('— 🏠 the portal fold on Eric\'s phone —');
  const fold = await page.evaluate(async () => {
    openPortalWin(); await renderPortalList(); _portalOpen = 0; await renderPortalList(); await new Promise(r => setTimeout(r, 300)); await renderPortalList();
    const txt = b => b.textContent.replace(/\s+/g, ' ').trim();
    const plate = [...document.querySelectorAll('#portalList .pf-acts button')].find(b => /🎛 What they see/.test(b.textContent));
    return { visbox: !!document.querySelector('#portalList .pf-visbox'), chips: /They can see/.test($('portalList').textContent), plate: !!plate, onlyMe: !!plate && plate.classList.contains('only-me'),
      view: [...document.querySelectorAll('#portalList .pf-acts button')].some(b => /👁 View as this client/.test(b.textContent)), words: plate ? txt(plate) : '' };
  });
  ok('the 🎛 they-can-see chips are off the fold; one plate reads "🎛 What they see — turn parts of their page on or off", beside 👁 View as this client', !fold.visbox && !fold.chips && fold.plate && fold.view && /turn parts of their page on or off/.test(fold.words), JSON.stringify(fold));
  ok('with office crew on the roster the plate wears the only-you dashed edge (Phil has no door); with none it is plain', fold.onlyMe && await page.evaluate(async () => { prefs.office = []; await renderPortalList(); const p = [...document.querySelectorAll('#portalList .pf-acts button')].find(b => /🎛 What they see/.test(b.textContent)); const plain = !!p && !p.classList.contains('only-me'); prefs.office = ['Phil']; await renderPortalList(); return plain; }));

  console.log('— 👁 the viewer is the homeowner\'s page, nothing more —');
  ok('👁 View as this client opens the page with &pv=1 and no owner mode; inside: no owner line, no bars, none of the owner words, not one dashed rim (the owner view’s mark)', await (async () => {
    await page.evaluate(() => clientPreviewOpen(0));
    const src = await page.evaluate(() => $('cpFrame').src);
    if (!(/pv=1/.test(src) && !/owner=1/.test(src) && await frameReady())) return false;
    return frame().evaluate(() => !document.querySelector('.own-head, .own-bar, .own-off, .own-inline, .own-tiles') && !/OWNER VIEW|THEY SEE THIS|HIDDEN FROM THEM/.test((document.getElementById('app') || document.body).textContent)
      && ![...document.querySelectorAll('body *')].some(el => getComputedStyle(el).outlineStyle === 'dashed'));
  })());
  ok('the hidden budget card is NOT drawn for Eric either — he sees exactly what they get; where it stands, upcoming and work by phase are there', await frame().evaluate(() =>
    !document.getElementById('budgetCard') && !!document.getElementById('moneyCard') && !!document.getElementById('upcomingCard') && !!document.getElementById('phasesCard')));
  ok('the hidden board is not listed inside the viewer — 2 of 3, no switch on a row', await frame().evaluate(async () => {
    await boardsOpen();
    const rs = [...document.querySelectorAll('#boardCard .bd-row')];
    return rs.length === 2 && !rs.some(r => /Shower drain/.test(r.textContent)) && !rs.some(r => r.querySelector('button'));
  }));
  ok('a message shaped like the old owner bars is ignored — the page has no write path any more', await (async () => {
    await page.evaluate(() => window.postMessage({ boiler: 'owner', act: 'hide', card: 'journal' }, '*'));
    await page.waitForTimeout(400);
    return pageJson().show.journal === undefined;
  })());
  await page.evaluate(() => clientPreviewClose());

  console.log('— 🎛 WHAT THEY SEE, the window —');
  ok('🎛 What they see opens its own window over the portal: every card, every tile and every board the library has switched on, one plate each, in words, with aria-pressed', await (async () => {
    await page.evaluate(() => openPageVis(0));
    const up = await page.evaluate(() => $('revModal').classList.contains('show') && $('revModal').classList.contains('mat-full') && !!$('pvBox') && /WHAT THEY SEE/.test($('pvBox').textContent) && /Mery Addition/.test($('pvBox').textContent));
    if (!(up && await windowRows())) return false;
    const rs = await rows();
    const keys = rs.map(r => r.k).join('|');
    return keys === 'journal|money|upcoming|budget|phases|photos|ask|boards|mat|board:b1|board:b2|board:b3'
      && rs.every(r => /^✓ THEY SEE THIS( BOARD)? — tap to hide$|^○ HIDDEN FROM THEM — tap to show$/.test(r.t) && r.on === r.sel && r.on === /THEY SEE/.test(r.t));
  })());
  ok('the plates read the page: budget HIDDEN (its switch is false), money and phases THEY SEE (opt-in, true), journal and the tiles THEY SEE (absent = on), the b2 board HIDDEN and b1 / b3 THEY SEE THIS BOARD', await (async () => {
    const r = await rows(), g = k => r.find(x => x.k === k);
    return !g('budget').on && g('money').on && g('phases').on && g('journal').on && g('photos').on && g('mat').on && !g('board:b2').on && g('board:b1').on && g('board:b3').on && /THIS BOARD/.test(g('board:b1').t);
  })());
  ok('tap the budget plate → the page file gets show.budget = true and the plate turns to ✓ THEY SEE THIS; tap upcoming → false and ○ HIDDEN', await (async () => {
    await tap('budget');
    const a = await wait(() => pageJson().show.budget === true) && await wait(async () => (await rowOf('budget')).on);
    await tap('upcoming');
    const b = await wait(() => pageJson().show.upcoming === false) && await wait(async () => !(await rowOf('upcoming')).on);
    return a && b;
  })());
  ok('money is opt-in: hiding writes false, showing writes true — never a missing key', await (async () => {
    await tap('money'); const a = await wait(() => pageJson().show.money === false);
    await tap('money'); const b = await wait(() => pageJson().show.money === true);
    return a && b;
  })());
  ok('a board plate flips boardsOff for THIS client: b1 off → [b2, b1]; b2 back on → [b1]; the rows follow', await (async () => {
    await tap('board:b1'); const a = await wait(() => JSON.stringify(pageJson().boardsOff) === '["b2","b1"]') && await wait(async () => !(await rowOf('board:b1')).on);
    await tap('board:b2'); const b = await wait(() => JSON.stringify(pageJson().boardsOff) === '["b1"]') && await wait(async () => (await rowOf('board:b2')).on);
    return a && b;
  })());
  ok('the homeowner gets it on the next load: the budget card is there, upcoming is gone, the boards are b2 and b3', await (async () => {
    const home = await ctx.newPage(); await home.goto(SRV + '/c/?c=' + CODE); await home.waitForTimeout(800);
    const r = await home.evaluate(async () => { await boardsOpen(); const rs = [...document.querySelectorAll('#boardCard .bd-row')].map(x => x.textContent);
      return { budget: !!document.getElementById('budgetCard'), upcoming: !!document.getElementById('upcomingCard'), boards: rs.length, drywall: rs.some(t => /Drywall/.test(t)), drain: rs.some(t => /Shower drain/.test(t)) }; });
    await home.close();
    return r.budget && !r.upcoming && r.boards === 2 && !r.drywall && r.drain;
  })());
  ok('🖼 Options off → the boards section says so in words and draws no board plate; on again → the plates are back', await (async () => {
    await tap('boards'); const off = await wait(() => pageJson().show.boards === false) && await wait(async () => { const r = await rows(); return !r.some(x => /^board:/.test(x.k)) && /Options is off for them/.test(await page.evaluate(() => $('pvBox').textContent)); });
    await tap('boards'); const on = await wait(() => pageJson().show.boards === true) && await wait(async () => (await rows()).filter(x => /^board:/.test(x.k)).length === 3);
    return off && on;
  })());
  ok('every plate in the window is a WORD, never a lamp alone; a plate that is off is dashed and dim, a plate that is on is the lit chip', await page.evaluate(() =>
    [...document.querySelectorAll('#pvBox .pv-sw')].every(b => /[A-Za-z]{3,}/.test(b.textContent) && (b.classList.contains('sel') ? getComputedStyle(b).borderTopStyle !== 'dashed' : (getComputedStyle(b).borderTopStyle === 'dashed' && +getComputedStyle(b).opacity < 1)))));
  ok('👁 View as this client at the foot opens the viewer over the window (pv=1, no owner), and closing the viewer lands back on the window', await (async () => {
    await page.evaluate(() => { [...document.querySelectorAll('#pvBox .pv-foot button')].find(b => /View as this client/.test(b.textContent)).click(); });
    const src = await page.evaluate(() => $('cpFrame').src);
    const over = await page.evaluate(() => $('cliPrev').classList.contains('show') && +getComputedStyle($('cliPrev')).zIndex > +getComputedStyle($('revModal')).zIndex);
    await page.evaluate(() => clientPreviewClose());
    return /pv=1/.test(src) && !/owner=1/.test(src) && over && await page.evaluate(() => !!$('pvBox') && $('revModal').classList.contains('show'));
  })());
  ok('✕ closes the window and the portal is still there under it', await page.evaluate(() => { pageVisClose(); return !$('revModal').classList.contains('show') && $('portalWin').classList.contains('show'); }));
  await page.evaluate(() => { prefs.office = ['Phil']; });
  await ctx.close();

  // ───────────────────────── Phil's phone: OFFICE crew ─────────────────────────
  console.log('— 👷 an office crew phone opens the viewer, and has no switches —');
  const p2ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await p2ctx.addInitScript(() => { try { localStorage.setItem('daylog-crew-name', 'Phil'); localStorage.setItem('daylog-crew-root', '/Phil'); localStorage.setItem('daylog-crew-office', '1'); localStorage.setItem('daylog-portal-root', '/Client Portal'); localStorage.setItem('daylog-crew-jobs', JSON.stringify(['Oak House'])); } catch (e) {} });
  const p2 = await p2ctx.newPage();
  p2.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push('phil: ' + e.message); });
  await p2.goto(APP); await p2.waitForTimeout(900);
  const phil = await p2.evaluate(async () => {
    window.scheduleSave = () => {}; window.savePendingSoon = () => {}; dbx.refreshToken = 't'; window.getToken = async () => 't';
    window._files = {
      '/Client Portal/index.json': JSON.stringify({ clients: [{ key: 'oak', job: 'Oak House', code: 'oak-111aaa' }] }),
      '/Client Portal/oak-111aaa.json': JSON.stringify({ name: 'Oak House', journal: [{ released: '2026-09-22' }] }),
    };
    window._ups = [];
    window.dbxDownload = async p => Object.prototype.hasOwnProperty.call(_files, p) ? _files[p] : null;
    window.dbxUpload = async (p, b) => { _ups.push(p); if (typeof b === 'string') _files[p] = b; return { path_display: p }; };
    window.dbxList = async () => ({ entries: [{ '.tag': 'folder', name: 'Phil', path_display: '/Phil', path_lower: '/phil' }, { '.tag': 'folder', name: 'Client Portal', path_display: '/Client Portal', path_lower: '/client portal' }] });
    window._said = []; const t0 = window.toast; window.toast = (m, g) => { if (m) _said.push(String(m)); return t0(m, g); };
    openPortalWin(); await renderPortalList(); _portalOpen = 0; await renderPortalList(); await new Promise(r => setTimeout(r, 300));
    const txt = b => b.textContent.replace(/\s+/g, ' ').trim();
    const btns = [...document.querySelectorAll('#portalList .pf-acts button')].map(txt);
    const view = [...document.querySelectorAll('#portalList .pf-acts button')].find(b => /👁 View as this client/.test(b.textContent));
    view.click();
    const shown = $('cliPrev').classList.contains('show'), src = $('cpFrame').src;
    clientPreviewClose();
    openPageVis(0);
    return { crew: CREW_NAME, office: amOffice(), btns, shown, src, noWin: !$('pvBox') && !$('revModal').classList.contains('show'), said: _said.join(' | '), ups: _ups.length };
  });
  ok('Phil\'s fold is Plans · Journal · Build List · View as this client — no 🎛 plate', phil.crew === 'Phil' && phil.office && phil.btns.join('|') === '📐 Plans|📖 Journal|📋 Build List|👁 View as this client', JSON.stringify(phil.btns));
  ok('👁 View as this client on his phone opens the viewer on the plain page (pv=1, never owner=1)', phil.shown && /\/c\/\?c=oak-111aaa&pv=1$/.test(phil.src), phil.src);
  ok('the switches are Eric\'s: openPageVis on a crew phone draws nothing, writes nothing, and says so in words', phil.noWin && phil.ups === 0 && /Eric.s to set/.test(phil.said), phil.said);
  await p2ctx.close();

  ok('version bumped — APP_VER, the footer and version.txt agree', (() => { const src = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8'); const v = (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]; const num = x => (String(x).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(v) >= num('v7.40') && src.includes('<footer>' + v + ' ·') && fs.readFileSync(path.join(ROOT, 'version.txt'), 'utf8').trim() === v; })());
  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  srv.close();
  process.exit(fail ? 1 : 0);
})();
