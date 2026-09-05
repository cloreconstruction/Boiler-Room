const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };
  await page.goto(process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html');
  await page.waitForTimeout(700);
  await page.evaluate(() => {
    jobs = ['Mery', 'Scritchfield']; curJob = 'Mery'; crew = []; entries = []; todos = []; nextId = 1;
    prefs.tagScrub1 = true; prefs.tagScrub2 = true;
    renderJobSelects(); closePanels(); renderAll();
    // every test below stands in for Dropbox — nothing here touches the real account
    window._dbxLog = [];
    window.dbxDownload = async path => { window._dbxLog.push(['get', path]); return (window._dbxFiles || {})[path] ?? null; };
    window.dbxUpload = async (path, body) => { window._dbxLog.push(['put', path, body]); (window._dbxFiles || {})[path] = body; return {}; };
    window.scheduleSave = () => {};
  });

  console.log('— 🛟 v6.28 a bad signal must never eat a client\'s estimates board —');

  const setup = () => page.evaluate(() => {
    // put the GOOD Dropbox stub back — each test below breaks it its own way, and a leftover
    // broken stub would quietly turn the next test into a re-run of the last one
    window.dbxDownload = async path => { window._dbxLog.push(['get', path]); return (window._dbxFiles || {})[path] ?? null; };
    entries = []; nextId = 1;
    const e = addEntry('Note', 'lumber from Spenard $1,000', 'Mery', {});
    e.category = 'Framing'; e.ai = '💵 $1,000.00 🏪 Spenard'; e.rcpt = true;
    _portalIdx = { clients: [{ code: 'mery-224374', job: 'Mery' }] };
    _estIdx = -1; _estD = null; _estPage = null; window._qUpBusy = false;
    // the REAL board on the server: three categories of real work, bids and a lit lamp
    const real = { updated: '2026-09-01', mk: 15, cats: [
      { n: 'Framing', appr: true, bids: [{ e1: 20000, acc: true }] },
      { n: 'Septic', appr: false, bids: [{ e1: 9000, acc: true, note: 'Hansen bid' }] },
      { n: 'Demo', appr: false, bids: [] }] };
    window._dbxFiles = {};
    window._dbxFiles[estPath('mery-224374')] = JSON.stringify(real);
    window._dbxFiles[portalRoot() + '/mery-224374.json'] = JSON.stringify({ name: 'Mery', budget: [] });
    window._realBoard = JSON.stringify(real);
    return e.id;
  });

  let id = await setup();
  ok('the board read failing sends NOTHING and leaves the file untouched', await page.evaluate(async id => {
    window.dbxDownload = async path => {
      if (/estimates/i.test(path) || path === estPath('mery-224374')) throw new Error('offline');
      return (window._dbxFiles || {})[path] ?? null;
    };
    const before = window._dbxFiles[estPath('mery-224374')];
    await estQuickUpcoming(id);
    const e = entries.find(x => x.id === id);
    return e.budg !== 'sent' && window._dbxFiles[estPath('mery-224374')] === before &&
      before === window._realBoard;
  }, id));

  id = await setup();
  ok('a 404/null read is refused too — an empty board is never invented', await page.evaluate(async id => {
    window.dbxDownload = async path => (path === estPath('mery-224374') ? null : (window._dbxFiles || {})[path] ?? null);
    await estQuickUpcoming(id);
    const e = entries.find(x => x.id === id);
    return e.budg !== 'sent' && window._dbxFiles[estPath('mery-224374')] === window._realBoard;
  }, id));

  id = await setup();
  ok('and it SAYS so — a silent no-op would look like it worked', await page.evaluate(async id => {
    window.dbxDownload = async path => (path === estPath('mery-224374') ? null : (window._dbxFiles || {})[path] ?? null);
    await estQuickUpcoming(id);
    return /nothing sent/i.test(document.body.textContent);
  }, id));

  id = await setup();
  ok('their page failing to read is refused too — no guessed base', await page.evaluate(async id => {
    window.dbxDownload = async path => {
      if (path === portalRoot() + '/mery-224374.json') return null;
      return (window._dbxFiles || {})[path] ?? null;
    };
    await estQuickUpcoming(id);
    const e = entries.find(x => x.id === id);
    return e.budg !== 'sent' && window._dbxFiles[estPath('mery-224374')] === window._realBoard;
  }, id));

  id = await setup();
  ok('with both reads good it DOES send, and the real board survives', await page.evaluate(async id => {
    await estQuickUpcoming(id);
    const e = entries.find(x => x.id === id);
    const saved = JSON.parse(window._dbxFiles[estPath('mery-224374')]);
    const fr = saved.cats.find(c => c.n === 'Framing');
    const sep = saved.cats.find(c => c.n === 'Septic');
    return e.budg === 'sent' && saved.cats.length >= 3 && (fr.pend || []).length === 1 &&
      sep.bids[0].note === 'Hansen bid' && saved.mk === 15;
  }, id));

  console.log('— 🔁 v6.28 one receipt, one posting —');

  ok('a second tap on an already-sent receipt is refused', await page.evaluate(async () => {
    const e = entries[0];
    const before = JSON.parse(window._dbxFiles[estPath('mery-224374')]).cats.find(c => c.n === 'Framing').pend.length;
    await estQuickUpcoming(e.id);
    const after = JSON.parse(window._dbxFiles[estPath('mery-224374')]).cats.find(c => c.n === 'Framing').pend.length;
    return before === 1 && after === 1;
  }));

  id = await setup();
  ok('a DOUBLE tap posts it once, not twice', await page.evaluate(async id => {
    // both taps fire before either await resolves — the old code posted two bills
    await Promise.all([estQuickUpcoming(id), estQuickUpcoming(id)]);
    const fr = JSON.parse(window._dbxFiles[estPath('mery-224374')]).cats.find(c => c.n === 'Framing');
    return (fr.pend || []).length === 1;
  }, id));

  console.log('— 💵 v6.28 the toast tells the truth about the markup —');

  id = await setup();
  ok('a 15% board says $1,150 — not the 20% default', await page.evaluate(async id => {
    await estQuickUpcoming(id);
    const t = $('toast').textContent;   // the toast itself, not the whole page
    return /\$1,150/.test(t) && !/\$1,200/.test(t) && /UPCOMING/.test(t);
  }, id));

  console.log('— ➗ v6.28 every pending dollar appears exactly ONCE —');

  ok('a lit category with an estimate stays OUT of upcoming — its budget row has it', await page.evaluate(() => {
    _estD = { mk: 20, cats: [{ n: 'Framing', appr: true, bids: [{ e1: 10000, acc: true }], pend: [{ a: 1000, base: 0 }] }] };
    return estUpcoming() === null && estPendUp(_estD.cats[0]) === 1200;
  }));

  ok('a lit category with NO estimate DOES ride — the budget card drops it', await page.evaluate(() => {
    _estD = { mk: 20, cats: [{ n: 'Framing', appr: true, bids: [], pend: [{ a: 1000, base: 0 }] }] };
    const u = estUpcoming();
    return u && u.tot === 1200;
  }));

  ok('a dark category rides — that was the whole point of the feature', await page.evaluate(() => {
    _estD = { mk: 20, cats: [{ n: 'Septic', appr: false, bids: [{ e1: 5000, acc: true }], pend: [{ a: 500, base: 0 }] }] };
    return estUpcoming().tot === 600;
  }));

  ok('mixed board: the client total counts each dollar once', await page.evaluate(() => {
    _estD = { mk: 20, cats: [
      { n: 'Framing', appr: true, bids: [{ e1: 10000, acc: true }], pend: [{ a: 1000, base: 0 }] }, // budget row
      { n: 'Septic', appr: false, bids: [], pend: [{ a: 500, base: 0 }] }] };                        // upcoming
    const inBudget = estPendUp(_estD.cats[0]);
    const u = estUpcoming();
    return inBudget === 1200 && u.tot === 600 && u.items.length === 1 && u.items[0].n === 'Septic';
  }));

  console.log('— 💸 v6.28 one payment retires one bill —');

  ok('two identical bills, one payment: only ONE clears', await page.evaluate(() => {
    _estD = { mk: 20, cats: [{ n: 'Framing', appr: false, bids: [], pend: [
      { a: 100, base: 0, eid: 1 }, { a: 100, base: 0, eid: 2 }] }] };
    _estPage = { phases: [{ cats: [['Framing', 100]] }] };
    const n = estAutoClear();
    return n === 1 && _estD.cats[0].pend.length === 1 && _estD.cats[0].pend[0].eid === 2;
  }));

  ok('the oldest bill is the one the money retires', await page.evaluate(() =>
    (_estD.cleared || [])[0].eid === 1));

  ok('enough in the books clears BOTH', await page.evaluate(() => {
    _estD = { mk: 20, cats: [{ n: 'Framing', appr: false, bids: [], pend: [
      { a: 100, base: 0 }, { a: 100, base: 0 }] }] };
    _estPage = { phases: [{ cats: [['Framing', 200]] }] };
    return estAutoClear() === 2 && !_estD.cats[0].pend;
  }));

  ok('three bills, two covered: the third still shows', await page.evaluate(() => {
    _estD = { mk: 20, cats: [{ n: 'Framing', appr: false, bids: [], pend: [
      { a: 100, base: 0 }, { a: 100, base: 0 }, { a: 100, base: 0 }] }] };
    _estPage = { phases: [{ cats: [['Framing', 200]] }] };
    return estAutoClear() === 2 && _estD.cats[0].pend.length === 1;
  }));

  ok('every clear still leaves a walkable trail', await page.evaluate(() => {
    _estD = { mk: 20, cats: [{ n: 'Framing', appr: false, bids: [], pend: [{ a: 100, v: 'Spenard', eid: 9, base: 0 }] }] };
    _estPage = { phases: [{ cats: [['Framing', 100]] }] };
    estAutoClear();
    const t = _estD.cleared[0];
    return t.eid === 9 && t.v === 'Spenard' && t.a === 100 && t.why === 'qb' && !!t.cl;
  }));

  ok('nothing in the books clears nothing', await page.evaluate(() => {
    _estD = { mk: 20, cats: [{ n: 'Framing', appr: false, bids: [], pend: [{ a: 100, base: 0 }] }] };
    _estPage = { phases: [] };
    return estAutoClear() === 0 && _estD.cats[0].pend.length === 1;
  }));

  console.log('— 🔒 the hard rules, still —');

  ok('a personal receipt never reaches a client page', await page.evaluate(async () => {
    entries = []; nextId = 1;
    const e = addEntry('Note', 'personal $500', 'Mery', {});
    e.personal = true; e.category = 'Framing'; e.ai = '💵 $500.00';
    window._qUpBusy = false;
    const before = window._dbxFiles[estPath('mery-224374')];
    await estQuickUpcoming(e.id);
    return e.budg !== 'sent' && window._dbxFiles[estPath('mery-224374')] === before;
  }));

  ok('no vendor name ever rides out to the page', await page.evaluate(() => {
    _estD = { mk: 20, cats: [{ n: 'Framing', appr: false, bids: [], pend: [{ a: 100, v: 'Spenard Builders Supply', base: 0 }] }] };
    return !/Spenard/.test(JSON.stringify(estUpcoming()));
  }));

  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v6.28') && document.querySelector('footer').textContent.includes(APP_VER);
  }));

  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
