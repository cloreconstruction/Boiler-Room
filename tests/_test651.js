// 🧾 v6.51 — Eric, in the receipts window: "how can i click on a receipt to look at it before i
// sort it" and "also if something gets on there that doesn't belong i should be able to edit it
// or send it back to a sort pile". He was approving money onto a homeowner's page off a one-line
// summary, with no way to see the picture and no way off the list.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { fileURLToPath } = require('url');
(async () => {
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };
  const appUrl = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const repo = path.dirname(fileURLToPath(appUrl));
  const src = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

  console.log('— 🧾 v6.51 look at it, fix it, or send it back —');

  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
  await page.goto(appUrl); await page.waitForTimeout(700);

  const seed = () => page.evaluate(() => {
    jobs = ['Mery', 'Ashman']; curJob = 'Mery'; crew = []; todos = []; nextId = 1;
    window._shown = []; window._saves = 0;
    window.dbxDownload = async () => null; window.dbxUpload = async () => ({});
    window.dbxRpc = async () => ({ metadata: {} });
    window.scheduleSave = () => { window._saves++; };
    window.showPhoto = p => { window._shown.push(p); };
    window.renderPortalList = () => {};
    dbx.refreshToken = 'tok';
    _portalIdx = { clients: [{ code: 'abc', job: 'Mery', name: 'Mery' }] };
    _estD = null; _estPage = null; _estPaid = null;
    // a real receipt carries its money in the `ai` block — that is what estBillParse reads
    const mk = (id, det, amt, cat, vend, ph) => ({ id, ts: new Date('2026-09-05T12:00:00'), type: 'Expense',
      details: det, job: 'Mery', category: cat, amount: amt, rcpt: true,
      ai: `🧾 RECEIPT\n🏪 ${vend}\n💵 $${amt.toFixed(2)}\n📅 2026-09-05`,
      ...(ph ? { photoPath: '/p/' + id + '.jpg', ...(ph > 1 ? { photoPaths: ['/p/' + id + 'a.jpg', '/p/' + id + 'b.jpg'] } : {}) } : {}) });
    entries = [
      mk(1, 'Home Depot — lumber', 240.5, 'Framing', 'Home Depot', 1),
      mk(2, 'Spenard — trim', 88.25, 'Finish', 'Spenard Builders Supply', 2),
      mk(3, 'Speedway — fuel receipt with no picture', 61.12, 'Framing', 'Speedway', 0)
    ];
    nextId = 4;
    _rcptIdx = 0; _rcptSel = new Set();
    renderRcptReview();
    return rcptWaiting('Mery').length;
  });
  ok('three receipts are waiting on Mery', (await seed()) === 3);

  const box = () => page.evaluate(() => $('revBox').textContent.replace(/\s+/g, ' '));

  ok('every row offers 📷 Look at it, ✏️ Fix it and ⏏ Not for them', await page.evaluate(() => {
    const t = $('revBox').innerHTML;
    return (t.match(/📷 Look at it/g) || []).length === 2 && (t.match(/✏️ Fix it/g) || []).length === 3 &&
      (t.match(/⏏ Not for them/g) || []).length === 3;
  }), await box());

  ok('a receipt with two pictures says how many', /📷 Look at it \(2\)/.test(await page.evaluate(() => $('revBox').innerHTML)));

  ok('one with no picture SAYS so instead of a dead button', /no picture on this one/.test(await box()));

  ok('📷 opens the actual receipt, and the second picture is reachable', await page.evaluate(async () => {
    window._shown = [];
    await openEntryPhoto(2, { stopPropagation() {} });
    const first = window._shown.slice();
    lbNav(1);
    return first.length === 1 && first[0] === '/p/2a.jpg' && window._shown[1] === '/p/2b.jpg';
  }), await page.evaluate(() => JSON.stringify(window._shown)));

  // ── ✏️ Fix it has to open OVER the window he tapped it from ──
  ok('the log editor outranks the receipts window — the v6.42 z-index trap', (() => {
    const panelZ = +((src.match(/\.panel \{[\s\S]*?z-index: (\d+);/) || [])[1] || 0);
    const modalZ = +((src.match(/\.rev-modal \{[\s\S]*?z-index: (\d+);/) || [])[1] || 0);
    const editZ = +((src.match(/#panel-logedit \{ z-index: (\d+); \}/) || [])[1] || 0);
    return panelZ > 0 && modalZ > panelZ && editZ > modalZ;
  })(), src.match(/#panel-logedit \{[^}]*\}/));

  ok('✏️ Fix it really opens the editor on that receipt, on top', await page.evaluate(() => {
    openLogEdit(1, { stopPropagation() {} });
    const p = $('panel-logedit');
    const z = +getComputedStyle(p).zIndex;
    const modal = +getComputedStyle(document.querySelector('.rev-modal')).zIndex;
    return p.classList.contains('open') && editingLogId === 1 && $('leText').value === 'Home Depot — lumber' && z > modal;
  }));

  ok('fixing the job moves it off this client and the window redraws itself', await page.evaluate(() => {
    $('leJob').value = 'Ashman';
    saveLogEdit();
    return entries.find(e => e.id === 1).job === 'Ashman' && rcptWaiting('Mery').length === 2 &&
      !/Home Depot/.test($('revBox').textContent);
  }), await box());

  // ── ⏏ the sort pile ──
  ok('⏏ Not for them drops it into ⚪ SKIPPED, still in his log', await page.evaluate(() => {
    rcptSkip(2, { stopPropagation() {} });
    const e = entries.find(x => x.id === 2);
    const t = $('revBox').textContent;
    return e.budg === 'no' && !!e && rcptWaiting('Mery').length === 1 &&
      /⚪ SKIPPED — 1 off this list/.test(t) && /Spenard/.test(t) && /Still in your log/.test(t);
  }), await box());

  ok('a skipped one can never ride an approve — it un-checks itself', await page.evaluate(() => {
    rcptTog(3); const had = _rcptSel.has(3);
    rcptSkip(3, { stopPropagation() {} });
    return had && !_rcptSel.has(3) && _rcptSel.size === 0;
  }));

  ok('↩ Put it back returns it to the waiting list', await page.evaluate(() => {
    const before = rcptWaiting('Mery').length;
    rcptUnskip(3);
    return !entries.find(e => e.id === 3).budg && rcptWaiting('Mery').length === before + 1 &&
      rcptWaiting('Mery').some(e => e.id === 3);
  }));

  ok('the skipped pile lets him look and fix from there too', await page.evaluate(() => {
    const html = $('revBox').innerHTML;
    const i = html.indexOf('⚪ SKIPPED');
    const tail = html.slice(i);
    return i > 0 && /✏️ Fix it/.test(tail) && /↩ Put it back/.test(tail) && /no picture on this one|📷 Look at it/.test(tail);
  }));

  ok('⏏ is undoable — one tap and it is back where it was', await page.evaluate(async () => {
    const before = rcptWaiting('Mery').length;
    rcptSkip(3, { stopPropagation() {} });
    const gone = rcptWaiting('Mery').length === before - 1 && !rcptWaiting('Mery').some(e => e.id === 3);
    const btn = document.querySelector('#toast button');
    if (!btn || !/Undo/.test(btn.textContent)) return false;
    btn.click();
    return gone && !entries.find(e => e.id === 3).budg && rcptWaiting('Mery').length === before;
  }), await page.evaluate(() => $('toast').textContent));

  ok('a skipped receipt is off the client list but still counts in his own book', await page.evaluate(() => {
    rcptSkip(3, { stopPropagation() {} });
    const e = entries.find(x => x.id === 3);
    const csv = csvString(entries.filter(x => !x.sample && !x.personal));
    return e.budg === 'no' && /Speedway/.test(csv) && !rcptWaiting('Mery').some(x => x.id === 3);
  }));

  ok('nothing here touches a client file — approving is still its own tap', await page.evaluate(() => window._saves > 0) &&
    !/rcptSkip[\s\S]{0,400}(estSave|dbxUpload)/.test(src));

  ok('a personal or overhead receipt never appears in the skipped pile either', await page.evaluate(() => {
    entries.push({ id: 90, ts: new Date(), type: 'Expense', details: 'private', job: 'Mery',
      category: 'Framing', amount: 10, rcpt: true, budg: 'no', personal: true,
      ai: '\ud83e\uddfe RECEIPT\n\ud83c\udfea X\n\ud83d\udcb5 $10.00' });
    return !rcptSkipped('Mery').some(e => e.id === 90);
  }));

  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v6.51') && document.querySelector('footer').textContent.includes(APP_VER);
  }));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
