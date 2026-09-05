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
  });

  console.log('— 🔮 v6.27 estimated upcoming costs —');

  ok('the upcoming block rides even when NO lamp is lit — that was the whole bug', await page.evaluate(() => {
    _estD = { mk: 20, cats: [{ n: 'Framing', appr: false, bids: [], pend: [{ a: 1000, ts: '2026-09-05', base: 0 }] }] };
    const u = estUpcoming();
    return u && u.items.length === 1 && u.items[0].n === 'Framing' && u.tot === 1200;
  }));

  ok('20% is folded in and never named — the client number IS the marked-up one', await page.evaluate(() => {
    const u = estUpcoming();
    return u.tot === 1200 && JSON.stringify(u).indexOf('20') === JSON.stringify(u).indexOf('1200') + 2 - 2 || !/markup|mk/i.test(JSON.stringify(u));
  }));

  ok('a bid line that already includes markup is NOT marked up twice', await page.evaluate(() => {
    _estD = { mk: 20, cats: [{ n: 'Septic', appr: false, bids: [], pend: [{ a: 500, inc: true, base: 0 }] }] };
    return estUpcoming().tot === 500;
  }));

  ok('no vendor name ever rides out to the page', await page.evaluate(() => {
    _estD = { mk: 20, cats: [{ n: 'Framing', appr: false, bids: [], pend: [{ a: 100, v: 'Spenard Builders Supply', base: 0 }] }] };
    return !/Spenard/.test(JSON.stringify(estUpcoming()));
  }));

  ok('several categories sum, biggest first', await page.evaluate(() => {
    _estD = { mk: 20, cats: [
      { n: 'Demo', appr: false, bids: [], pend: [{ a: 100, base: 0 }] },
      { n: 'Framing', appr: true, bids: [], pend: [{ a: 1000, base: 0 }] }] };
    const u = estUpcoming();
    return u.items[0].n === 'Framing' && u.items[1].n === 'Demo' && u.tot === 1320;
  }));

  ok('nothing pending = no block at all (no empty card on their page)', await page.evaluate(() => {
    _estD = { mk: 20, cats: [{ n: 'Demo', appr: true, bids: [] }] };
    return estUpcoming() === null;
  }));

  console.log('— 🧾→📗 v6.27 auto-clear, with the paper trail —');

  ok('QuickBooks catching up retires the bill', await page.evaluate(() => {
    _estD = { mk: 20, cats: [{ n: 'Framing', appr: false, bids: [], pend: [{ a: 1000, v: 'Spenard', eid: 7, ts: '2026-09-01', base: 0 }] }] };
    _estPage = { phases: [{ cats: [['Framing', 1000]] }] };
    const n = estAutoClear();
    return n === 1 && !_estD.cats[0].pend && estUpcoming() === null;
  }));

  ok('the trail keeps the receipt walkable — vendor, entry id, base and the QB figure', await page.evaluate(() => {
    const t = (_estD.cleared || [])[0];
    return t && t.n === 'Framing' && t.a === 1000 && t.v === 'Spenard' && t.eid === 7 &&
      t.base === 0 && t.saw === 1000 && t.why === 'qb' && !!t.cl;
  }));

  ok('books NOT caught up yet = the bill stays put', await page.evaluate(() => {
    _estD = { mk: 20, cats: [{ n: 'Framing', appr: false, bids: [], pend: [{ a: 1000, base: 0 }] }] };
    _estPage = { phases: [{ cats: [['Framing', 400]] }] };
    return estAutoClear() === 0 && _estD.cats[0].pend.length === 1;
  }));

  ok('only the growth since approval counts — an old ledger cannot clear a new bill', await page.evaluate(() => {
    _estD = { mk: 20, cats: [{ n: 'Framing', appr: false, bids: [], pend: [{ a: 1000, base: 5000 }] }] };
    _estPage = { phases: [{ cats: [['Framing', 5000]] }] };   // same figure it was approved against
    return estAutoClear() === 0 && _estD.cats[0].pend.length === 1;
  }));

  ok('a cent of rounding does not strand a bill forever', await page.evaluate(() => {
    _estD = { mk: 20, cats: [{ n: 'Framing', appr: false, bids: [], pend: [{ a: 1000, base: 0 }] }] };
    _estPage = { phases: [{ cats: [['Framing', 999.5]] }] };
    return estAutoClear() === 1;
  }));

  ok('two bills, one matched — the other is untouched and still shows', await page.evaluate(() => {
    _estD = { mk: 20, cats: [{ n: 'Framing', appr: false, bids: [], pend: [
      { a: 100, base: 0 }, { a: 9000, base: 0 }] }] };
    _estPage = { phases: [{ cats: [['Framing', 100]] }] };
    const n = estAutoClear();
    return n === 1 && _estD.cats[0].pend.length === 1 && _estD.cats[0].pend[0].a === 9000;
  }));

  console.log('— 🔒 the hard rules still hold —');

  ok('a personal receipt can never be sent up — the lock wins', await page.evaluate(async () => {
    entries = []; nextId = 1;
    const e = addEntry('Note', 'personal lumber $500', 'Mery', {});
    e.personal = true; e.category = 'Framing'; e.ai = '💵 $500.00';
    _portalIdx = { clients: [{ code: 'mery-224374', job: 'Mery' }] };
    const before = JSON.stringify(_estD);
    await estQuickUpcoming(e.id);
    return e.budg !== 'sent' && JSON.stringify(_estD) === before;
  }));

  ok('a job with no client page is refused, not guessed at', await page.evaluate(async () => {
    entries = []; nextId = 1;
    const e = addEntry('Note', 'lumber $500', 'Scritchfield', {});
    e.category = 'Framing'; e.ai = '💵 $500.00';
    _portalIdx = { clients: [{ code: 'mery-224374', job: 'Mery' }] };
    await estQuickUpcoming(e.id);
    return e.budg !== 'sent' && /no client page/.test(document.body.textContent);
  }));

  ok('a receipt with no dollar read is refused', await page.evaluate(async () => {
    entries = []; nextId = 1;
    const e = addEntry('Note', 'lumber, no price', 'Mery', {});
    e.category = 'Framing';
    await estQuickUpcoming(e.id);
    return e.budg !== 'sent';
  }));

  console.log('— 🪜 the log door —');

  ok('a categorised receipt shows the ONE-TAP → Upcoming door', await page.evaluate(() => {
    entries = []; nextId = 1;
    const e = addEntry('Note', 'lumber $500', 'Mery', {});
    e.category = 'Framing'; e.ai = '💵 $500.00'; e.rcpt = true;
    clearLogFilters(); window._logHeadsOnly = ''; renderLog();
    return /🔮 → Upcoming/.test($('askRecent').innerHTML);
  }));

  ok('an UNcategorised receipt still gets the old board jump, not a dead end', await page.evaluate(() => {
    entries = []; nextId = 1;
    const e = addEntry('Note', 'lumber $500', 'Mery', {});
    e.ai = '💵 $500.00'; e.rcpt = true;
    renderLog();
    const h = $('askRecent').innerHTML;
    return /💰 → Budget/.test(h) && !/🔮 → Upcoming/.test(h);
  }));

  ok('once sent BOTH doors close — the same receipt cannot be posted twice', await page.evaluate(() => {
    entries[0].budg = 'sent'; renderLog();
    const h = $('askRecent').innerHTML;
    return !/🔮 → Upcoming/.test(h) && !/💰 → Budget/.test(h);
  }));

  ok('…and the unfolded row spells out where it went', await page.evaluate(() => {
    window._rlOpen = new Set([entries[0].id]); renderLog();
    const h = $('askRecent').innerHTML;
    window._rlOpen = new Set();
    return /on their page/.test(h);
  }));

  ok('the door is a word and a glyph, not a colour', await page.evaluate(() => {
    entries = []; nextId = 1;
    const e = addEntry('Note', 'lumber $500', 'Mery', {});
    e.category = 'Framing'; e.ai = '💵 $500.00';
    renderLog();
    return /🔮 → Upcoming/.test($('askRecent').textContent);
  }));

  // 🏷 at or past this suite's build, and the footer agrees with APP_VER (see 624)
  ok('version bumped everywhere it matters — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v6.27') && document.querySelector('footer').textContent.includes(APP_VER);
  }));

  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
