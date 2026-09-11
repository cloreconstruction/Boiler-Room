// 👁 v6.61 — THE OWNER VIEW. Eric: "I want my project portal to basically look exactly like the
// client page, and it will also control the client page … I have my edit buttons there and my
// add photos, and I can hide windows from them." The real client page inside the app's preview
// frame, a bar on every card, per-client per-card switches (and per option board), every tap a
// message to the app. This suite runs a tiny HTTP server so the app and the page share ONE store
// the way they share Dropbox in production.
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
        if (u.searchParams.get('p') || u.searchParams.get('bimg')) return send(404, '');
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

  state.base = await page.evaluate(({ SRV, CODE }) => {
    window.dbxDownload = async p => { const r = await fetch(SRV + '/__get?path=' + encodeURIComponent(p)); return r.ok ? await r.text() : null; };
    window.dbxUpload = async (p, body) => { await fetch(SRV + '/__put?path=' + encodeURIComponent(p), { method: 'POST', body: typeof body === 'string' ? body : JSON.stringify(body) }); return {}; };
    window.dbxPathExists = async p => (await fetch(SRV + '/__get?path=' + encodeURIComponent(p))).ok;
    window.portalUrl = i => SRV + '/c/?c=' + encodeURIComponent(_portalIdx.clients[i].code);
    window.scheduleSave = () => {};
    dbx.refreshToken = 'test-token';
    jobs = ['Mery']; curJob = 'Mery'; entries = []; nextId = 1;
    _portalIdx = { clients: [{ key: 'mery', job: 'Mery Addition & Remodel', code: CODE }] };
    return portalRoot();
  }, { SRV, CODE });
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

  console.log('— 👁 v6.61 the OWNER view inside the app —');
  const frame = () => page.frames().find(f => /\/c\/\?c=/.test(f.url()));
  const frameReady = async () => wait(async () => { const f = frame(); return f && await f.evaluate(() => !!document.querySelector('.own-head')); }, 8000);

  ok('View as this client opens the page in owner mode, banner and all', await (async () => {
    await page.evaluate(() => clientPreviewOpen(0));
    const src = await page.evaluate(() => $('cpFrame').src);
    return /owner=1/.test(src) && /pv=1/.test(src) && await frameReady();
  })());

  ok('the hidden budget card STILL draws for Eric — dimmed, and it says so', await frame().evaluate(() => {
    const c = document.getElementById('budgetCard');
    return !!c && c.classList.contains('own-off') && /HIDDEN FROM THEM — tap to show/.test(c.querySelector('.own-bar').textContent);
  }));

  ok('a shown card says THEY SEE THIS, and offers ✎ Edit', await frame().evaluate(() => {
    const c = document.getElementById('upcomingCard');
    const t = c.querySelector('.own-bar').textContent;
    return /THEY SEE THIS — tap to hide/.test(t) && /✎ Edit/.test(t);
  }));

  ok('the journal card carries ➕ Add photos', await frame().evaluate(() => /➕ Add photos/.test(document.querySelector('#journalCard .own-bar').textContent)));

  ok('the four tiles get their own switches, in words', await frame().evaluate(() => {
    const rows = [...document.querySelectorAll('.own-tiles .own-bar')];
    return rows.length === 4 && rows.every(r => /THEY SEE|HIDDEN/.test(r.textContent)) && /Options/.test(rows[2].textContent);
  }));

  ok('in owner mode the switched-off board is still listed, marked, with its own switch', await frame().evaluate(async () => {
    await boardsOpen();
    const rows = [...document.querySelectorAll('#boardCard .bd-row')];
    const off = rows.find(r => /Shower drain/.test(r.textContent));
    return rows.length === 3 && off && off.classList.contains('own-off') && /HIDDEN FROM THEM — tap to show/.test(off.textContent);
  }));

  console.log('— 🔁 v6.61 a tap on the page flips the switch through the app —');

  ok('tap "show" on the budget → the page file changes → the frame reloads with it shown', await (async () => {
    await frame().click('#budgetCard .own-vis');
    const wrote = await wait(() => pageJson().show.budget === true);
    const back = await frameReady();
    const shown = back && await frame().evaluate(() => { const c = document.getElementById('budgetCard'); return !!c && !c.classList.contains('own-off') && /THEY SEE THIS/.test(c.querySelector('.own-bar').textContent); });
    return wrote && shown;
  })());

  ok('tap "hide" on upcoming → hidden for the homeowner, still there for Eric', await (async () => {
    await frame().click('#upcomingCard .own-vis');
    const wrote = await wait(() => pageJson().show.upcoming === false);
    const back = await frameReady();
    const dim = back && await frame().evaluate(() => document.getElementById('upcomingCard').classList.contains('own-off'));
    const h2 = await ctx.newPage(); await h2.goto(SRV + '/c/?c=' + CODE); await h2.waitForTimeout(600);
    const gone = await h2.evaluate(() => !document.getElementById('upcomingCard') && !!document.getElementById('budgetCard'));
    await h2.close();
    return wrote && dim && gone;
  })());

  ok('money is opt-in: hiding it writes false, showing it writes true (never a missing key)', await (async () => {
    await frame().click('#moneyCard .own-vis');
    const off = await wait(() => pageJson().show.money === false);
    await frameReady();
    await frame().click('#moneyCard .own-vis');
    const on = await wait(() => pageJson().show.money === true);
    await frameReady();
    return off && on;
  })());

  ok('a board can be switched back on, and another off, per client', await (async () => {
    await frame().evaluate(async () => { await boardsOpen(); });
    await frame().click('#boardCard .bd-row.own-off .own-inline');
    const on = await wait(() => !(pageJson().boardsOff || []).includes('b2'));
    await frameReady();
    await frame().evaluate(async () => { await boardsOpen(); });
    const rows = await frame().$$('#boardCard .bd-row .own-inline');
    await rows[0].click();
    const off = await wait(() => (pageJson().boardsOff || []).includes('b1'));
    await frameReady();
    return on && off;
  })());

  console.log('— ✎ v6.61 edit goes to the window that owns the card —');

  ok('✎ Edit on the budget closes the preview and opens the estimates board', await (async () => {
    await frame().evaluate(async () => { await boardsOpen(); });
    const btns = await frame().$$('#budgetCard .own-bar button');
    await btns[1].click();
    const opened = await wait(() => page.evaluate(() => !$('cliPrev').classList.contains('show') && $('revModal').classList.contains('show') && /estimates/i.test($('revBox').textContent)));
    await page.evaluate(() => closeEstimates());
    return opened;
  })());

  ok('➕ Add photos on the journal opens the journal window', await (async () => {
    await page.evaluate(() => clientPreviewOpen(0));
    await frameReady();
    const btns = await frame().$$('#journalCard .own-bar button');
    await btns[2].click();
    const opened = await wait(() => page.evaluate(() => !$('cliPrev').classList.contains('show') && $('revModal').classList.contains('show') && /journal/i.test($('revBox').textContent)));
    await page.evaluate(() => closeReview());
    return opened;
  })());

  console.log('— 🔒 v6.61 only the preview frame is listened to —');

  ok('a message from anywhere but the frame is ignored', await (async () => {
    const before = JSON.stringify(pageJson().show);
    await page.evaluate(() => window.postMessage({ boiler: 'owner', act: 'hide', card: 'phases' }, '*'));
    await page.waitForTimeout(500);
    return JSON.stringify(pageJson().show) === before;
  })());

  ok('a card name the app does not know is dropped, not written', await (async () => {
    await page.evaluate(() => clientPreviewOpen(0));
    await frameReady();
    const before = JSON.stringify(pageJson());
    await frame().evaluate(() => ownerMsg({ act: 'hide', card: '__proto__' }));
    await frame().evaluate(() => ownerMsg({ act: 'hide', card: 'wages' }));
    await page.waitForTimeout(500);
    return JSON.stringify(pageJson()) === before;
  })());

  ok('every owner control is a WORD, never a lamp alone', await frame().evaluate(() =>
    [...document.querySelectorAll('.own-bar button, .own-inline')].every(b => /[A-Za-z]{3,}/.test(b.textContent))));

  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v6.61') && document.querySelector('footer').textContent.includes(APP_VER);
  }));

  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  srv.close();
  process.exit(fail ? 1 : 0);
})();
