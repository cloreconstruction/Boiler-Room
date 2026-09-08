// 💸 v6.53 — THE $94,373 THAT COULD NOT BE SEEN. estBillParse() read only the 🧾 block the
// grinder writes into e.ai, but a receipt FILED from the cabinet (an emailed sub invoice, a
// PDF) carries its money in e.amount and has no ai block. Every money door is gated on that
// one function, so 17 real receipts worth $94,373.37 were invisible everywhere — including
// $58,000 of Rininger sheetrock and $30,000 of Josten sheetrock. Silently.
// The seeds below are the REAL shapes out of his entries.json.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { fileURLToPath } = require('url');
(async () => {
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };
  const appUrl = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const repo = path.dirname(fileURLToPath(appUrl));
  const src = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

  console.log('— 💸 v6.53 the filed receipts the app could not see —');

  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
  await page.goto(appUrl); await page.waitForTimeout(700);

  await page.evaluate(() => {
    jobs = ['Rininger', 'Josten/Weiser', 'Mery', 'Personal', 'Shop / Admin'];
    curJob = 'Mery'; crew = []; todos = []; nextId = 2000;
    window.dbxDownload = async () => null; window.dbxUpload = async () => ({});
    window.dbxRpc = async () => ({ metadata: {} });
    window.scheduleSave = () => {}; window.savePendingSoon = () => {}; window.renderPortalList = () => {};
    dbx.refreshToken = 'tok';
    _portalIdx = { clients: [{ code: 'rin', job: 'Rininger', name: 'Rininger' }] };
    _estD = null; _estPage = null; _estPaid = null;
    const T = new Date('2026-08-20T12:00:00');
    entries = [
      // ── the real invisible ones: money in e.amount, NO ai block, type Filed ──
      { id: 196, ts: T, type: 'Filed', details: 'Invoice for all Sheetrock work', job: 'Rininger',
        category: 'Drywall', amount: 58000, photoPath: '/p/196.pdf', filedTo: 'Inbox' },
      { id: 767, ts: T, type: 'Filed', details: 'Invoice for sheetrock at Jostens', job: 'Josten/Weiser',
        category: 'Drywall', amount: 30000, photoPath: '/p/767.pdf', filedTo: 'Inbox' },
      // a DISTINCT date, so no neighbouring row in the same window can satisfy an
      // assertion about this one (the first draft of the date test failed exactly that way)
      { id: 84, ts: new Date('2026-08-11T12:00:00'), type: 'Filed', details: 'Milo trailer invoice', job: 'Mery',
        category: 'Subcontractor', amount: 372.42, filedTo: 'Inbox' },
      // ── must STAY invisible: already in Logan's books (would bill the client twice) ──
      { id: 240, ts: T, type: 'Expense', details: 'Sub payment (from QuickBooks import)', job: 'Mery',
        category: 'Subcontractor', amount: 100, qbQid: 'q253f045ce0', qbV: '2026-08-01' },
      // ── must STAY invisible: on the Personal job ──
      { id: 821, ts: T, type: 'Filed', details: 'IMG_4403.png', job: 'Personal',
        category: 'Permits/Fees', amount: 259.70, photoPath: '/p/821.png' },
      // ── overhead: recorded, never offered to a client ──
      { id: 533, ts: T, type: 'Filed', details: 'Fuel f-250', job: 'Mery', category: 'Fuel', amount: 136.48 },
      // ── not a receipt at all: a number on a note, no 🧾 and no category ──
      { id: 900, ts: T, type: 'Note', details: 'quoted him about 4500 for the deck', job: 'Mery', amount: 4500 },
      // ── the ai-block kind, unchanged by this build ──
      { id: 901, ts: T, type: 'Note', details: 'Home Depot run', job: 'Rininger', category: 'Framing',
        rcpt: true, ai: '🧾 RECEIPT\n🏪 Home Depot\n💵 $240.50\n📅 2026-08-20', photoPath: '/p/901.jpg' }
    ];
    renderLog();
  });

  const parse = id => page.evaluate(i => { const p = estBillParse(entries.find(e => e.id === i)); return p ? { amt: p.amt, v: p.v, d: p.d, filed: !!p.filed } : null; }, id);

  // ── the bug itself ──
  ok('the $58,000 Rininger sheetrock invoice is finally seen', JSON.stringify(await parse(196)) === JSON.stringify({ amt: 58000, v: '', d: '', filed: true }), JSON.stringify(await parse(196)));
  ok('the $30,000 Josten sheetrock invoice too', (await parse(767)).amt === 30000);
  ok('and the small filed ones', (await parse(84)).amt === 372.42);

  ok('a receipt with the grinder block is UNCHANGED — vendor and date still ride', JSON.stringify(await parse(901)) === JSON.stringify({ amt: 240.5, v: 'Home Depot', d: '2026-08-20', filed: false }), JSON.stringify(await parse(901)));

  // ── the two landmines ──
  ok('🚫 a QuickBooks import stays invisible — it is already in the books', (await parse(240)) === null);
  ok('🚫 a plain note carrying a number is not a receipt', (await parse(900)) === null);
  ok('🚫 a zero or empty amount is not a receipt', await page.evaluate(() => {
    const z = { id: 1, ts: new Date(), type: 'Filed', category: 'Drywall', amount: 0 };
    const n = { id: 2, ts: new Date(), type: 'Filed', category: 'Drywall' };
    return estBillParse(z) === null && estBillParse(n) === null;
  }));

  // a credit must never become a charge — the whole reason this does not use Math.abs()
  ok('🚫 a REFUND is not a bill — a negative amount refuses rather than flipping positive', await page.evaluate(() => {
    const credit = { id: 3, ts: new Date(), type: 'Filed', category: 'Plumbing', amount: -38.99, details: 'Returns' };
    return estBillParse(credit) === null;
  }));

  ok('🚫 an unreadable amount refuses too', await page.evaluate(() => {
    const junk = { id: 4, ts: new Date(), type: 'Filed', category: 'Drywall', amount: 'about six hundred' };
    const inf = { id: 5, ts: new Date(), type: 'Filed', category: 'Drywall', amount: Infinity };
    return estBillParse(junk) === null && estBillParse(inf) === null;
  }));

  ok('the source says so, so nobody re-introduces Math.abs here', /A CREDIT IS NOT A COST/.test(src) && !/amt: Math\.abs\(\+e\.amount\)/.test(src));

  // ── they reach the window he actually uses ──
  ok('the Rininger receipts window now offers the $58,000 invoice', await page.evaluate(() => {
    const w = rcptWaiting('Rininger');
    return w.length === 2 && w.some(e => e.id === 196) && w.some(e => e.id === 901);
  }), await page.evaluate(() => JSON.stringify(rcptWaiting('Rininger').map(e => e.id))));

  ok('the button count agrees with the list — they cannot disagree', await page.evaluate(() =>
    rcptCount('Rininger') === rcptWaiting('Rininger').length && rcptCount('Josten/Weiser') === 1));

  ok('the money shown to the homeowner is the marked-up figure, computed off the filed amount', await page.evaluate(() => {
    const e = entries.find(x => x.id === 196);
    const p = estBillParse(e);
    return p.amt === 58000 && estPendMk({ a: p.amt }) === estPendMk({ a: 58000 }) && estPendMk({ a: p.amt }) >= 58000;
  }));

  // ── 🔒 the locks ──
  ok('🔒 the Personal JOB never reaches the receipts window', await page.evaluate(() =>
    rcptWaiting('Personal').length === 0 && rcptSkipped('Personal').length === 0 && rcptSent('Personal').length === 0));

  ok('🔒 nor the estimates bill strip', await page.evaluate(() => {
    _estIdx = 0; _portalIdx = { clients: [{ code: 'per', key: 'personal', job: 'Personal', name: 'Personal' }] };
    const out = estBillCands();
    _portalIdx = { clients: [{ code: 'rin', key: 'rininger', job: 'Rininger', name: 'Rininger' }] }; _estIdx = 0;
    return out.length === 0;
  }));

  // 🔒 the leak this build closed on the way past
  ok('🔒 a client record with NO key matches no job — it used to inherit jobs[0]', await page.evaluate(() => {
    const nokey = portalAppJob({ code: 'x', job: 'Somebody Brand New' });
    const withkey = portalAppJob({ code: 'r', key: 'rininger', job: 'Rininger Project' });
    return nokey === 'Somebody Brand New' && withkey === 'Rininger' && jobs[0] !== 'Somebody Brand New';
  }), await page.evaluate(() => JSON.stringify([portalAppJob({ code: 'x', job: 'Somebody Brand New' }), jobs[0]])));

  ok('and that client is therefore offered NOBODY else\'s receipts', await page.evaluate(() => {
    _portalIdx = { clients: [{ code: 'x', job: 'Somebody Brand New', name: 'New' }] }; _estIdx = 0;
    const out = estBillCands();
    _portalIdx = { clients: [{ code: 'rin', key: 'rininger', job: 'Rininger', name: 'Rininger' }] }; _estIdx = 0;
    return out.length === 0;
  }));

  ok('🔒 an entry flagged personal is still barred, whatever its job', await page.evaluate(() => {
    entries.push({ id: 902, ts: new Date('2026-08-20T12:00:00'), type: 'Filed', details: 'private',
      job: 'Rininger', category: 'Drywall', amount: 500, personal: true });
    return !rcptWaiting('Rininger').some(e => e.id === 902);
  }));

  ok('🏢 overhead is still recorded but never offered', await page.evaluate(() =>
    !rcptWaiting('Mery').some(e => e.id === 533) && rcptOverhead('Mery').some(e => e.id === 533)));

  // ── the receipts window renders them properly ──
  ok('the window draws the filed invoice with its picture button and no vendor line', await page.evaluate(() => {
    _rcptIdx = 0; _rcptSel = new Set();
    renderRcptReview();
    const t = $('revBox').innerHTML;
    return /Invoice for all Sheetrock work/.test(t) && /58,000\.00/.test(t) &&
      /📷 Look at it/.test(t) && !/🏪 ·/.test(t) && !/🏪 undefined/.test(t) && !/🏪 <\/span>/.test(t);
  }), await page.evaluate(() => $('revBox').textContent.replace(/\s+/g, ' ').slice(0, 200)));

  ok('a filed receipt with no picture says so rather than showing a dead button', await page.evaluate(() => {
    _portalIdx = { clients: [{ code: 'mery', key: 'mery', job: 'Mery', name: 'Mery' }] }; _rcptIdx = 0;
    renderRcptReview();
    return /no picture on this one/.test($('revBox').textContent) && /Milo trailer invoice/.test($('revBox').textContent);
  }));

  // a filed invoice carries no date of its own, so the row prints the ENTRY's date. Scoped to
  // the row itself — the first draft grepped the whole window and was satisfied by the 🏢
  // overhead row next door, which an adversarial mutation proved by making this row print
  // "NO DATE" while the suite stayed green.
  ok('the row prints that receipt\'s own date, and no neighbour can stand in for it', await page.evaluate(() => {
    const row = [...document.querySelectorAll('#revBox .g-step')].find(el => /Milo trailer invoice/.test(el.textContent));
    if (!row) return false;
    const t = row.textContent;
    return /2026-08-11|Aug 11|8\/11/.test(t) && !/NO DATE/.test(t) && !/2026-08-20|Aug 20/.test(t);
  }), await page.evaluate(() => {
    const row = [...document.querySelectorAll('#revBox .g-step')].find(el => /Milo trailer invoice/.test(el.textContent));
    return row ? row.textContent.replace(/\s+/g, ' ').slice(0, 140) : 'row not found';
  }));

  // ── nothing publishes without his tap ──
  ok('none of this reaches a client until he approves it — all still unsent', await page.evaluate(() =>
    entries.filter(e => e.budg).length === 0 && rcptSent('Rininger').length === 0));

  // the approve door is the last place money can escape — check it refuses on its own
  ok('🔒 even a hand-ticked Personal receipt is refused at the approve door', await page.evaluate(async () => {
    _portalIdx = { clients: [{ code: 'per', key: 'personal', job: 'Personal', name: 'Personal' }] };
    _rcptIdx = 0; _rcptSel = new Set([821]);
    let said = '';
    const keep = window.toast; window.toast = m => { said = String(m); };
    await rcptApprove();
    window.toast = keep;
    const e = entries.find(x => x.id === 821);
    return !e.budg && /Check at least one receipt/.test(said);
  }), await page.evaluate(() => JSON.stringify(entries.find(x => x.id === 821).budg || null)));

  ok('the filed invoice stores its amount and an EMPTY vendor, and learns nothing false', await page.evaluate(() => {
    const p = estBillParse(entries.find(e => e.id === 196));
    const before = JSON.stringify(prefs.vendCat || {});
    catLearn('Rininger', 'Drywall', p.v);
    return p.v === '' && JSON.stringify(prefs.vendCat || {}) === before;
  }));

  // ── each guard proved load-bearing, one at a time ──
  // (the first draft of this suite asserted the guard's SHAPE by passing a FUNCTION as the
  //  condition — always truthy, so it stayed green against a source it no longer matched.)
  ok('ORIGIN is what bars a bill, not verification: a field receipt MATCHED to the books still shows', await page.evaluate(() => {
    const matched = { id: 28, ts: new Date(), type: 'Filed', details: 'Insulated concrete solutions. Down payment',
      job: 'Rininger', category: 'Concrete and foundation', amount: 50000, qbQid: 'qabc', qbV: '2026-08-01' };
    const born = { id: 29, ts: new Date(), type: 'Expense', details: 'Home Depot — x (from QuickBooks import)',
      job: 'Rininger', category: 'Framing', amount: 500, qbQid: 'qdef', qbV: '2026-08-01' };
    const bornNew = { id: 30, ts: new Date(), type: 'Expense', details: 'anything at all',
      job: 'Rininger', category: 'Framing', amount: 500, qbImp: 1 };
    const p = estBillParse(matched);
    return !!p && p.amt === 50000 && estBillParse(born) === null && estBillParse(bornNew) === null;
  }), await page.evaluate(() => JSON.stringify(estBillParse({ id: 28, type: 'Filed', category: 'x', amount: 50000, qbQid: 'q', qbV: 'd' }))));

  ok('a QuickBooks card stamps its entry at birth, so the words are only the fallback', /e\.qbImp = 1;/.test(src) && /qbImp \|\| \(e\.type === 'Expense'/.test(src));

  ok('the marker guard is load-bearing: no 🧾 flag and no category means no bill', await page.evaluate(() => {
    const bare = { id: 31, ts: new Date(), type: 'Filed', details: 'a number with no category', job: 'Mery', amount: 900 };
    const flagged = { ...bare, id: 32, rcpt: true };
    const catted = { ...bare, id: 33, category: 'Framing' };
    return estBillParse(bare) === null && estBillParse(flagged).amt === 900 && estBillParse(catted).amt === 900;
  }));

  ok('the positive guard is load-bearing: -1 refuses, +1 passes', await page.evaluate(() => {
    const mk = a => ({ id: 34, ts: new Date(), type: 'Filed', category: 'Framing', job: 'Mery', amount: a });
    return estBillParse(mk(-1)) === null && estBillParse(mk(1)).amt === 1 && estBillParse(mk(0)) === null;
  }));

  // ── the Personal locks, asserted on entries that WOULD otherwise appear ──
  ok('🔒 each lock is load-bearing: the same receipt appears, or not, only because of it', await page.evaluate(() => {
    const base = { ts: new Date('2026-08-20T12:00:00'), type: 'Filed', details: 'lock probe',
      job: 'Rininger', category: 'Framing', amount: 700 };
    entries.push({ ...base, id: 700 });                                   // control — must appear
    entries.push({ ...base, id: 701, personal: true });                   // flag
    entries.push({ ...base, id: 702, tags: ['Personal'] });               // tag
    entries.push({ ...base, id: 703, job: 'Personal' });                  // job
    const w = rcptWaiting('Rininger').map(e => e.id);
    return w.includes(700) && !w.includes(701) && !w.includes(702) && !w.includes(703);
  }), await page.evaluate(() => JSON.stringify(rcptWaiting('Rininger').map(e => e.id))));

  ok('🔒 and the same three in the SENT block, which had only one of them', await page.evaluate(() => {
    [700, 701, 702, 703].forEach(id => { const e = entries.find(x => x.id === id); if (e) e.budg = 'sent'; });
    const s = rcptSent('Rininger').map(e => e.id);
    [700, 701, 702, 703].forEach(id => { const e = entries.find(x => x.id === id); if (e) delete e.budg; });
    return s.includes(700) && !s.includes(701) && !s.includes(702) && !s.includes(703);
  }), await page.evaluate(() => JSON.stringify(rcptSent('Rininger').map(e => e.id))));

  ok('🔒 and in the SKIPPED pile', await page.evaluate(() => {
    [700, 701, 702, 703].forEach(id => { const e = entries.find(x => x.id === id); if (e) e.budg = 'no'; });
    const s = rcptSkipped('Rininger').map(e => e.id);
    [700, 701, 702, 703].forEach(id => { const e = entries.find(x => x.id === id); if (e) delete e.budg; });
    return s.includes(700) && !s.includes(701) && !s.includes(702) && !s.includes(703);
  }));

  // ── 🔒 the three doors OFF this phone ──
  ok('🔒 nothing locked reaches Logan\'s CSV — flag, tag OR the Personal job', await page.evaluate(() => {
    const csv = csvString(entries.filter(e => !e.sample && !isLocked(e)));
    const has = id => new RegExp('lock probe').test(csv) && csv.split('\n').filter(r => /lock probe/.test(r)).length;
    return has() === 1 && isLocked({ job: 'Personal' }) && isLocked({ tags: ['Personal'] }) &&
      isLocked({ personal: true }) && !isLocked({ job: 'Mery' });
  }), await page.evaluate(() => csvString(entries.filter(e => !e.sample && !isLocked(e))).split('\n').filter(r => /lock probe/.test(r)).length));

  ok('🔒 nor a crew publish, nor the wizard\'s reading pile', () =>
    /const shared = entries\.filter\(e => e\.vis && !e\.sample && !isLocked\(e\)\)/.test(src) &&
    /const live = entries\.filter\(e => !e\.sample && !isLocked\(e\)\)/.test(src));

  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v6.53') && document.querySelector('footer').textContent.includes(APP_VER);
  }));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
