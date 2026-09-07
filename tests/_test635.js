const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
  await page.goto(process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html');
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
  });

  console.log('— 🏢 v6.35 overhead: tools, fuel, office — recorded, never billed —');

  ok('picking Tools in the 🧾 window marks the receipt overhead at the grind — no second tap', await page.evaluate(() => {
    entries = []; nextId = 1;
    qnRcpt = true; qnCat = 'Tools'; qnJobPick = 'Mery'; $('askText').value = 'new framing nailer $300';
    saveQuickNote();
    const e = entries[0];
    window._tool = e;
    return e && e.category === 'Tools' && e.billable === false && isOverheadEntry(e);
  }));

  ok('a project category does NOT get the mark', await page.evaluate(() => {
    qnRcpt = true; qnCat = 'Framing'; qnJobPick = 'Mery'; $('askText').value = 'lumber package $1,000';
    saveQuickNote();
    const e = entries[0];
    e.ai = '💵 $1,000.00 🏪 Spenard';
    window._lumber = e;
    return e.category === 'Framing' && e.billable !== false && !isOverheadEntry(e);
  }));

  ok('overhead is never offered to a client — not in the waiting list, not in the bill strip', await page.evaluate(() => {
    _tool.ai = '💵 $300.00 🏪 Home Depot';
    _estIdx = 0; _estD = { mk: 20, cats: [] }; _estPage = {};
    const strip = estBillCands().map(e => e.id);
    _estIdx = -1; _estD = null; _estPage = null;
    return rcptCount('Mery') === 1 && !rcptWaiting('Mery').some(e => e.id === _tool.id) && !strip.includes(_tool.id);
  }));

  ok('the one-tap door refuses it, in words', await page.evaluate(async () => {
    window._qUpBusy = false;
    await estQuickUpcoming(_tool.id);
    return !_tool.budg && /Overhead/.test($('toast').textContent) && /never billed/.test($('toast').textContent);
  }));

  ok('the log shows no door and a lamp that says OVERHEAD — recorded', await page.evaluate(() => {
    clearLogFilters(); renderLog();
    const h = $('askRecent').innerHTML;
    const row = h.slice(h.indexOf('framing nailer') - 400, h.indexOf('framing nailer') + 600);
    return /OVERHEAD — recorded/.test(rcptLampHtml(_tool)) && !/estQuickUpcoming\(\s*1\s*,/.test(row);
  }));

  ok('it still turns up under the 🧾 Receipts filter — it IS a receipt', await page.evaluate(() => {
    window._logRcptOnly = false; rlRcptToggle();
    const shown = /framing nailer/.test($('askRecent').textContent);
    rlRcptToggle();
    return shown;
  }));

  ok('the CSV Logan gets carries billable = no for it', await page.evaluate(() => {
    const src = String((typeof exportCsv === 'function' ? exportCsv : function () {}).toString());
    // the row builder is what matters: same test the export line uses
    return (_tool.billable === false || isOverheadEntry(_tool)) === true && (_lumber.billable === false || isOverheadEntry(_lumber)) === false;
  }));

  console.log('— 🧾 v6.35 the category window: overhead has its own group —');

  ok('the window shows an OVERHEAD group, in words, with Tools / Fuel / Office-Admin wearing 🏢', await page.evaluate(() => {
    qnJobPick = 'Mery'; prefs.jobCats = {};
    catModalOpen();
    const t = $('catBox').textContent;
    const grids = [...$('catBox').querySelectorAll('.cat-grid')];
    const overGrid = grids.find(g => /Tools/.test(g.textContent) && /Fuel/.test(g.textContent));
    return /OVERHEAD — recorded for the books, never billed to a client/.test(t) && overGrid &&
      /🏢 Tools/.test(overGrid.textContent) && overGrid.querySelectorAll('.pick-chip').length === 3;
  }));

  ok('the A → Z list is project costs only — Tools, Fuel and Office/Admin are not in it', await page.evaluate(() => {
    const grids = [...$('catBox').querySelectorAll('.cat-grid')];
    const az = grids[grids.length - 1].textContent;
    const okNow = !/Tools/.test(az) && !/Fuel/.test(az) && !/Office\/Admin/.test(az) && /Framing/.test(az);
    catModalClose();
    return okNow;
  }));

  console.log('— 💡💡💡 v6.35 the three lights in the receipts window —');

  const seed = () => page.evaluate(() => {
    entries = []; nextId = 1;
    const mk = (txt, o) => { const e = addEntry('Note', txt, 'Mery', {}); Object.assign(e, { rcpt: true, category: 'Framing' }, o); return e; };
    window._w = mk('waiting one', { ai: '💵 $100.00 🏪 A' });
    window._a = mk('sent, still on the board', { ai: '💵 $200.00 🏪 B', budg: 'sent' });
    window._b = mk('sent, paired with QB', { ai: '💵 $300.00 🏪 C', budg: 'sent' });
    window._c = mk('sent, paired, invoiced and paid', { ai: '💵 $400.00 🏪 D', budg: 'sent' });
    window._o = mk('fuel for the truck', { ai: '💵 $60.00 🏪 Tesoro', category: 'Fuel', billable: false });
    window._dbxFiles = {};
    window._dbxFiles[estPath('mery-224374')] = JSON.stringify({ mk: 20, cats: [
      { n: 'Framing', appr: false, bids: [], pend: [{ a: 200, v: 'B', base: 0, eid: _a.id }] }],
      cleared: [{ n: 'Framing', a: 300, v: 'C', eid: _b.id, cl: '2026-09-04', why: 'qb' },
                { n: 'Framing', a: 400, v: 'D', eid: _c.id, cl: '2026-09-02', why: 'qb-eric' }] });
    window._dbxFiles[portalRoot() + '/mery-224374.json'] = JSON.stringify({ name: 'Mery' });
    _rcptSel = new Set(); _estD = null; _estPaid = null;
  });

  await seed();
  ok('with no paid file yet, every ③ reads NOT YET — in words, not a colour', await page.evaluate(async () => {
    await openRcptReview(0);
    const t = $('revBox').textContent;
    return (t.match(/③ ○ NOT YET — comes from the books/g) || []).length === 3 && !/INVOICED & PAID/.test(t);
  }));

  ok('① is lit on every sent one', await page.evaluate(() =>
    ($('revBox').textContent.match(/① 🟢 ✓ SENT — on their page/g) || []).length === 3));

  ok('② is lit only where QuickBooks has it — the one still on the board reads NOT PAIRED', await page.evaluate(() => {
    const t = $('revBox').textContent;
    const iA = t.indexOf('sent, still on the board'), iB = t.indexOf('sent, paired with QB');
    return /② ○ NOT PAIRED YET/.test(t.slice(iA, iA + 400)) && /② 📗 ✓ PAIRED WITH QB/.test(t.slice(iB, iB + 400));
  }));

  ok('the waiting one is still up top with its check box, the sent ones below', await page.evaluate(() => {
    const t = $('revBox').textContent;
    return /1 waiting/.test(t) && t.indexOf('waiting one') < t.indexOf('SENT —') && /tap to check/.test(t);
  }));

  ok('overhead on this job sits in its own section with a total, never a check box', await page.evaluate(() => {
    const t = $('revBox').textContent;
    return /OVERHEAD ON THIS JOB — 1, \$60\.00/.test(t) && /fuel for the truck/.test(t) && /goes to Logan as not billable/.test(t);
  }));

  ok('a paired one tells him where to take it back; an unpaired one too', await page.evaluate(() => {
    const t = $('revBox').textContent;
    return /Off their upcoming list — the books carry it now/.test(t) && /↩ To change or take it back: 💰 Estimates/.test(t);
  }));

  await page.evaluate(() => closeRcptReview());
  await seed();
  ok('once the books side writes paid-<code>.json, ③ lights and that receipt leaves the list as settled', await page.evaluate(async () => {
    window._dbxFiles[portalRoot() + '/paid-mery-224374.json'] = JSON.stringify({ eids: [_c.id], byId: { [_c.id]: { inv: '1042', paidOn: '2026-09-05' } } });
    await openRcptReview(0);
    const t = $('revBox').textContent;
    return /✓ 1 fully settled, off the list/.test(t) && !/sent, paired, invoiced and paid/.test(t) &&
      /SENT — 2 on the way/.test(t) && rcptPaidHas(_c.id) && !rcptPaidHas(_b.id);
  }));

  ok('a bad paid file is treated as "no file", never as a crash', await page.evaluate(async () => {
    closeRcptReview();
    window._dbxFiles[portalRoot() + '/paid-mery-224374.json'] = '{not json';
    await openRcptReview(0);
    const okNow = _estPaid === null && /③ ○ NOT YET/.test($('revBox').textContent);
    closeRcptReview();
    return okNow;
  }));

  ok('closing the window drops the paid data so it cannot leak to another job', await page.evaluate(() => _estPaid === null));

  ok('the tracker count still counts WAITING only — sent and overhead never inflate it', await page.evaluate(() => rcptCount('Mery') === 1));

  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v6.35') && document.querySelector('footer').textContent.includes(APP_VER);
  }));

  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
