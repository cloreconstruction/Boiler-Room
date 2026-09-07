const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { fileURLToPath } = require('url');
(async () => {
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
  const appUrl = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const repo = path.dirname(fileURLToPath(appUrl));
  await page.goto(appUrl);
  await page.waitForTimeout(700);
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };
  await page.evaluate(() => {
    jobs = ['Mery']; curJob = 'Mery'; crew = []; entries = []; todos = []; nextId = 1;
    prefs.tagScrub1 = true; prefs.tagScrub2 = true;
    renderJobSelects(); closePanels(); renderAll();
    window._dbxFiles = {};
    window.dbxDownload = async path => (window._dbxFiles || {})[path] ?? null;
    window.dbxUpload = async (path, body) => { (window._dbxFiles || {})[path] = body; return {}; };
    window.dbxPathExists = async path => Object.prototype.hasOwnProperty.call(window._dbxFiles || {}, path);
    window.scheduleSave = () => {};
    dbx.refreshToken = dbx.refreshToken || 'test-token';
    _portalIdx = { clients: [{ key: 'mery', job: 'Mery Addition & Remodel', code: 'mery-224374' }] };
    window._dbxFiles[portalRoot() + '/index.json'] = JSON.stringify(_portalIdx);
  });

  // 🔧🧹🗑 v6.39 — Eric: "make the bookkeeper button look like the grinder button with the pipes
  // around the outside and make them the same size" · "there is a remanent drop down menu that
  // says rininger, it's part of the pic somehow and not functional, clean that out" · and the
  // Trash ↔ Landfill alias the pre-ship review sent back, done on BOTH pages with a re-baseline.
  console.log('— 🔧 v6.39 framed bookkeeper, clean clock picture, one Trash bucket on both pages —');

  ok('the bookkeeper plate wears the framed picture, and the file is really there', await page.evaluate(() => {
    const img = document.querySelector('.plate-btn--bkk img');
    return !!img && /steam\/btn-bookkeeper-framed\.webp$/.test(img.getAttribute('src'));
  }) && fs.existsSync(path.join(repo, 'steam', 'btn-bookkeeper-framed.webp')) && fs.statSync(path.join(repo, 'steam', 'btn-bookkeeper-framed.webp')).size > 50000);

  ok('the framed bookkeeper picture is the grinder\'s shape — same proportions, so the two plates match', await (async () => {
    const dims = await page.evaluate(async () => {
      const load = src => new Promise(r => { const i = new Image(); i.onload = () => r([i.naturalWidth, i.naturalHeight]); i.onerror = () => r(null); i.src = src; });
      return { g: await load('steam/btn-grinder.webp'), b: await load('steam/btn-bookkeeper-framed.webp') };
    });
    if (!dims.g || !dims.b) return false;
    return Math.abs(dims.g[0] / dims.g[1] - dims.b[0] / dims.b[1]) < 0.02;
  })());

  ok('the two plates render the same size, side by side', await page.evaluate(async () => {
    await new Promise(r => setTimeout(r, 300));
    const g = document.querySelector('.plate-btn--grind').getBoundingClientRect(), b = document.querySelector('.plate-btn--bkk').getBoundingClientRect();
    return g.width > 100 && Math.abs(g.width - b.width) <= 1 && Math.abs(g.height - b.height) <= 1;
  }));

  ok('the clock panel shows the cleaned picture, and the painted-on dropdown is gone from its corner', await (async () => {
    const src = await page.evaluate(() => (document.querySelector('#bigClock img') || {}).getAttribute('src'));
    if (src !== 'steam/clockpanel-big-v2.jpg') return false;
    const b64 = f => 'data:image/jpeg;base64,' + fs.readFileSync(path.join(repo, 'steam', f)).toString('base64');
    const lum = await page.evaluate(async ({ v2, v1 }) => {
      const probe = async src => { const i = await new Promise(r => { const im = new Image(); im.onload = () => r(im); im.src = src; });
        const c = document.createElement('canvas'); c.width = i.naturalWidth; c.height = i.naturalHeight; const x = c.getContext('2d'); x.drawImage(i, 0, 0);
        // the old dropdown sat in the top-left corner: sample a grid across it
        let max = 0; for (let y = 8; y < 56; y += 8) for (let px = 16; px < 220; px += 12) { const d = x.getImageData(Math.round(px * c.width / 900), Math.round(y * c.height / 1125), 1, 1).data; max = Math.max(max, d[0] + d[1] + d[2]); }
        return max; };
      return { v2: await probe(v2), v1: await probe(v1) };
    }, { v2: b64('clockpanel-big-v2.jpg'), v1: b64('clockpanel-big.jpg') });
    return lum.v1 > 300 && lum.v2 < 120;   // old picture: bright dropdown there; new one: dark panel background only
  })());

  ok('the app\'s matcher: Trash / Construction Debris sees the books\' Landfill and Garbage / Janitorial; Water Softener sees "Softner"', await page.evaluate(() =>
    estScore('Landfill', 'Trash / Construction Debris') > 0 && estScore('Garbage / Janitorial', 'Trash / Construction Debris') > 0 &&
    estScore('Water Softner', 'Water Softener') > 0 && estScore('Landfill', 'Framing') === 0 && estScore('Landfill', 'Misc') === 0 &&
    estScore('Framing', 'Framing') === 1000 && estScore('Landfill', 'Trash / Construction Debris') > estScore('Landfill', 'Misc')));

  // the homeowner's page carries its own copy of the matcher — it must add up the same
  const client = await ctx.newPage();
  const cErrs = []; client.on('pageerror', e => cErrs.push(e.message));
  await client.goto('file:///' + path.join(repo, 'c', 'index.html').replace(/\\/g, '/') + '?c=test');
  await client.waitForTimeout(500);
  ok('the client page\'s matcher credits Landfill dollars to Trash / Construction Debris — the same table, in words', await client.evaluate(() => {
    if (typeof budgetHtml !== 'function') return false;
    const h = budgetHtml({ budget: [{ n: 'Trash / Construction Debris', est: 1000 }, { n: 'Misc', est: 500 }], phases: [{ cats: [['Landfill', 650], ['Garbage / Janitorial', 120]] }] });
    return /770/.test(h.replace(/,/g, ''));
  }));
  ok('both pages carry the identical alias table', (() => {
    const a = fs.readFileSync(path.join(repo, 'index.html'), 'utf8').match(/const EST_ALIASES = \{.*\};/)[0];
    const b = fs.readFileSync(path.join(repo, 'c', 'index.html'), 'utf8').match(/const EST_ALIASES = \{.*\};/)[0];
    return a === b;
  })());
  await client.close();

  ok('a bill sent under Trash BEFORE this build is not swept away by old Landfill dollars — its base is lifted once', await page.evaluate(async () => {
    const board = { updated: '2026-09-01', mk: 20, cats: [{ n: 'Trash / Construction Debris', appr: true, bids: [{ e1: 1000, e2: 0, note: '', docs: [], acc: true }],
      pend: [{ a: 150, v: 'Central Peninsula Landfill', ts: '2026-09-02', base: 0, eid: 'e1' }] }] };
    window._dbxFiles[estPath('mery-224374')] = JSON.stringify(board);
    window._dbxFiles[portalRoot() + '/mery-224374.json'] = JSON.stringify({ phases: [{ cats: [['Landfill', 900]] }], budget: [] });
    await openEstimates(0);
    const x = _estD.cats.find(c => c.n === 'Trash / Construction Debris');
    const good = !!x && x.pend.length === 1 && x.pend[0].base === 900 && x.pend[0].al === 1 && !(_estD.cleared || []).some(t => t.eid === 'e1');
    closeEstimates();
    return good;
  }));

  ok('a second open does not lift it again — the stamp holds the base where it is', await page.evaluate(async () => {
    window._dbxFiles[portalRoot() + '/mery-224374.json'] = JSON.stringify({ phases: [{ cats: [['Landfill', 1000]] }], budget: [] });
    await openEstimates(0);
    const x = _estD.cats.find(c => c.n === 'Trash / Construction Debris');
    const good = !!x && (x.pend || []).length === 1 && x.pend[0].base === 900 && x.pend[0].al === 1;
    closeEstimates();
    return good;
  }));

  ok('once the books really grow past it, that bill clears the normal way', await page.evaluate(async () => {
    window._dbxFiles[portalRoot() + '/mery-224374.json'] = JSON.stringify({ phases: [{ cats: [['Landfill', 1050]] }], budget: [] });
    await openEstimates(0);
    const x = _estD.cats.find(c => c.n === 'Trash / Construction Debris');
    const t = (_estD.cleared || []).find(t => t.eid === 'e1');
    const good = !!x && (x.pend || []).length === 0 && !!t && t.why === 'qb' && t.base === 900 && t.saw === 1050;
    closeEstimates();
    return good;
  }));

  ok('with no client page loaded yet, nothing is re-based — it waits for the numbers', await page.evaluate(async () => {
    const board = { updated: '2026-09-01', mk: 20, cats: [{ n: 'Trash / Construction Debris', appr: false, bids: [], pend: [{ a: 150, v: 'x', ts: '2026-09-02', base: 0, eid: 'e2' }] }] };
    window._dbxFiles[estPath('mery-224374')] = JSON.stringify(board);
    delete window._dbxFiles[portalRoot() + '/mery-224374.json'];
    await openEstimates(0);
    const x = _estD.cats.find(c => c.n === 'Trash / Construction Debris');
    const good = !!x && x.pend.length === 1 && x.pend[0].base === 0 && !x.pend[0].al;
    closeEstimates();
    return good;
  }));

  ok('a bill written on THIS build already carries the stamp — it is never lifted, so it clears when the books take it in', await page.evaluate(async () => {
    const board = { updated: '2026-09-06', mk: 20, cats: [{ n: 'Trash / Construction Debris', appr: true, bids: [{ e1: 1000, e2: 0, note: '', docs: [], acc: true }],
      pend: [{ a: 150, v: 'Central Peninsula Landfill', ts: '2026-09-06', base: 900, eid: 'r1', al: 1 }] }] };
    window._dbxFiles[estPath('mery-224374')] = JSON.stringify(board);
    window._dbxFiles[portalRoot() + '/mery-224374.json'] = JSON.stringify({ phases: [{ cats: [['Landfill', 1050]] }], budget: [] });
    await openEstimates(0);
    const x = _estD.cats.find(c => c.n === 'Trash / Construction Debris');
    const t = (_estD.cleared || []).find(t => t.eid === 'r1');
    const good = !!x && (x.pend || []).length === 0 && !!t && t.base === 900 && t.why === 'qb';
    closeEstimates();
    return good;
  }));

  ok('the 🔮 → Upcoming door writes a bill with an alias-aware base and the stamp, board closed', await page.evaluate(async () => {
    entries = []; nextId = 1;
    const board = { updated: '2026-09-06', mk: 20, cats: [{ n: 'Trash / Construction Debris', appr: true, bids: [{ e1: 1000, e2: 0, note: '', docs: [], acc: true }], pend: [] }] };
    window._dbxFiles[estPath('mery-224374')] = JSON.stringify(board);
    window._dbxFiles[portalRoot() + '/mery-224374.json'] = JSON.stringify({ phases: [{ cats: [['Landfill', 900]] }], budget: [] });
    const e = addEntry('Note', 'dump run', 'Mery', { rcpt: true, category: 'Trash / Construction Debris' }); e.ai = '💵 $150.00 🏪 Central Peninsula Landfill';
    window._qUpBusy = false;
    await estQuickUpcoming(e.id);
    const saved = JSON.parse(window._dbxFiles[estPath('mery-224374')] || 'null');
    const x = saved && saved.cats.find(c => c.n === 'Trash / Construction Debris');
    const p = x && (x.pend || []).find(p => p.eid === e.id);
    return !!p && p.al === 1 && p.base === 900 && p.a === 150 && e.budg === 'sent';
  }));

  ok('board opened on a bad signal (page unread): a bill approved from the strip gets NO stamp, so the next good open lifts it instead of sweeping it', await page.evaluate(async () => {
    entries = []; nextId = 1;
    const board = { updated: '2026-09-06', mk: 20, cats: [{ n: 'Trash / Construction Debris', appr: true, bids: [{ e1: 1000, e2: 0, note: '', docs: [], acc: true }], pend: [] }] };
    window._dbxFiles[estPath('mery-224374')] = JSON.stringify(board);
    delete window._dbxFiles[portalRoot() + '/mery-224374.json'];        // the homeowner page cannot be read
    const e = addEntry('Note', 'dump run', 'Mery', { rcpt: true, category: 'Trash / Construction Debris' }); e.ai = '💵 $150.00 🏪 Central Peninsula Landfill';
    await openEstimates(0);
    if (_estPage !== null) { closeEstimates(); return false; }
    const ci = _estD.cats.findIndex(c => c.n === 'Trash / Construction Debris');
    if (!$('estBillA-' + e.id) || !$('estBillC-' + e.id)) { closeEstimates(); return false; }
    $('estBillA-' + e.id).value = '150'; $('estBillC-' + e.id).value = String(ci);
    await estBillApprove(e.id);
    const x1 = _estD.cats[ci]; const p1 = (x1.pend || []).find(p => p.eid === e.id);
    const wrote = !!p1 && p1.base === 0 && !p1.al && e.budg === 'sent';
    closeEstimates();
    await new Promise(r => setTimeout(r, 200));
    window._dbxFiles[portalRoot() + '/mery-224374.json'] = JSON.stringify({ phases: [{ cats: [['Landfill', 900]] }], budget: [] });
    await openEstimates(0);
    const x2 = _estD.cats.find(c => c.n === 'Trash / Construction Debris'); const p2 = (x2.pend || []).find(p => p.eid === e.id);
    const lifted = !!p2 && p2.base === 900 && p2.al === 1 && !(_estD.cleared || []).some(t => t.eid === e.id);
    closeEstimates();
    await new Promise(r => setTimeout(r, 200));
    window._dbxFiles[portalRoot() + '/mery-224374.json'] = JSON.stringify({ phases: [{ cats: [['Landfill', 1050]] }], budget: [] });
    await openEstimates(0);
    const x3 = _estD.cats.find(c => c.n === 'Trash / Construction Debris');
    const cleared = !!x3 && !(x3.pend || []).some(p => p.eid === e.id) && (_estD.cleared || []).some(t => t.eid === e.id && t.why === 'qb' && t.base === 900);
    closeEstimates();
    return wrote && lifted && cleared;
  }));

  ok('a brand-new client page (no books numbers yet): the bill stays unstamped, and when lifetime dollars land it is lifted, not swept', await page.evaluate(async () => {
    entries = []; nextId = 1;
    const board = { updated: '2026-09-06', mk: 20, cats: [{ n: 'Trash / Construction Debris', appr: true, bids: [{ e1: 1000, e2: 0, note: '', docs: [], acc: true }], pend: [] }] };
    window._dbxFiles[estPath('mery-224374')] = JSON.stringify(board);
    window._dbxFiles[portalRoot() + '/mery-224374.json'] = JSON.stringify({ phases: [], budget: [], journal: [] });   // portalNew's shape
    const e = addEntry('Note', 'dump run', 'Mery', { rcpt: true, category: 'Trash / Construction Debris' }); e.ai = '💵 $300.00 🏪 Central Peninsula Landfill';
    window._qUpBusy = false;
    await estQuickUpcoming(e.id);
    const saved = JSON.parse(window._dbxFiles[estPath('mery-224374')] || 'null');
    const p1 = saved && saved.cats[0].pend.find(p => p.eid === e.id);
    const wrote = !!p1 && p1.base === 0 && !p1.al && e.budg === 'sent';
    window._dbxFiles[portalRoot() + '/mery-224374.json'] = JSON.stringify({ phases: [{ cats: [['Landfill', 2000]] }], budget: [] });   // the books run lands months of dump fees
    await openEstimates(0);
    const x = _estD.cats.find(c => c.n === 'Trash / Construction Debris'); const p2 = (x.pend || []).find(p => p.eid === e.id);
    const lifted = !!p2 && p2.base === 2000 && p2.al === 1 && !(_estD.cleared || []).some(t => t.eid === e.id);
    closeEstimates();
    return wrote && lifted;
  }));

  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v6.39') && document.querySelector('footer').textContent.includes(APP_VER);
  }));

  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
