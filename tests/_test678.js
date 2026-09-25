// 📒 v6.78 — ACCRUAL, WRITTEN WHERE THE EXPORTS GET MADE; A BIGGER DROP BOX. Eric: "accrual with the
// reports correct?" — yes — then: "put that in the quickbooks updater instructins next to sales by
// product. make the box for dragging qb exports to, bigger."
// Then five eye-catch asks the same day: the closers, ADDRESS/PEOPLE first on the job card, the working
// band while a photo loads, a POCKET heading on the summary, and RUNNING LOG bigger than the ALL plate.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { fileURLToPath } = require('url');
(async () => {
  const appUrl = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const repo = path.dirname(fileURLToPath(appUrl));
  const src = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
  await page.goto(appUrl); await page.waitForTimeout(700);
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };
  await page.evaluate(() => {
    jobs = ['Mery', 'Hertz', 'Rininger']; curJob = 'Mery'; entries = []; todos = []; nextId = 1; pendingQueue = []; prefs.pocket = [];
    window.scheduleSave = () => {}; window.savePendingSoon = () => {}; window.publishSharedNotes = () => {};
    renderJobSelects(); closePanels(); renderAll(); jumpSetup('qbSec'); $('qbSec').classList.add('open');   // the Setup sections fold to their heading (v5.11) — open this one
  });

  console.log('— 📒 v6.78 the words beside Sales by Product/Service —');

  const words = await page.evaluate(() => {
    const t = $('qbSec').textContent.replace(/\s+/g, ' ');
    const i = t.indexOf('Sales by Product/Service Detail'), j = t.indexOf('Invoice List by Date');
    return { t, line1: i >= 0 && j > i ? t.slice(i, j) : '' };
  });
  ok('the QuickBooks updater says ACCRUAL right beside Sales by Product/Service — where to set it, the footer check, and why',
    /ACCRUAL/.test(words.line1) && /Customize/.test(words.line1) && /Accounting method/.test(words.line1) && /Accrual Basis/.test(words.line1) && /Cash Basis/.test(words.line1) && /PAID/.test(words.line1),
    words.line1.slice(0, 200));
  ok('the other two reports are not told to change their method — accrual sits on the Sales line only', (words.t.match(/ACCRUAL/g) || []).length === 1);
  ok('it still asks for ALL DATES on every report, and says the ticker needs it', /ALL DATES/.test(words.t) && /Profit Ticker/.test(words.t));

  console.log('— 📥 v6.78 the drop box —');

  const zone = await page.evaluate(() => {
    const z = $('qbDropZone'); const r = z.getBoundingClientRect(), sec = $('qbSec').getBoundingClientRect();
    return { h: Math.round(r.height), w: Math.round(r.width), secW: Math.round(sec.width), fs: parseFloat(getComputedStyle(z).fontSize),
      drop: !!z.getAttribute('ondrop'), over: !!z.getAttribute('ondragover'), tap: /qbDrop/.test(z.getAttribute('onclick') || ''), words: z.textContent.replace(/\s+/g, ' ').trim(),
      border: parseFloat(getComputedStyle(z).borderTopWidth) };
  });
  ok('it is BIG now — at least 140px tall, the full width of the section', zone.h >= 140 && zone.w >= zone.secW - 40, JSON.stringify(zone));
  ok('it is still a drop zone and a tap target, and says so in words', zone.drop && zone.over && zone.tap && /Drag QB exports here/.test(zone.words) && /tap to pick files/.test(zone.words));
  ok('the words in it read at 16px or more, and the dashed edge is thick enough to see', zone.fs >= 16 && zone.border >= 3);
  ok('the file picker behind it still takes Excel and CSV', await page.evaluate(() => /xlsx/.test($('qbDrop').getAttribute('accept')) && /csv/.test($('qbDrop').getAttribute('accept'))));

  console.log('— ✕ v6.78 the closers catch the eye —');

  ok('the panel ✕ and the ← Back to dashboard button wear a 3px brass edge and bold words', await page.evaluate(() => {
    const c = document.querySelector('.panel-close'), b = document.querySelector('.panel-back');
    const cc = c && getComputedStyle(c), bc = b && getComputedStyle(b);
    const brass = getComputedStyle(document.querySelector('.qn-div-label')).backgroundColor;
    return !!c && parseFloat(cc.borderTopWidth) >= 3 && cc.borderTopColor === brass && parseInt(cc.fontWeight) >= 700 &&
      !!b && parseFloat(bc.borderTopWidth) >= 3 && bc.borderTopColor === brass && parseInt(bc.fontWeight) >= 700 && parseFloat(bc.fontSize) >= 16;
  }));
  ok('every ✕ window closer (.win-x) is a filled brass plate with a heavy edge and 17px words, a finger tall', await page.evaluate(() => {
    closePanels(); openReview('summary');
    const x = $('revBox').querySelector('.win-x'); const cs = getComputedStyle(x);
    const brass = getComputedStyle(document.querySelector('.qn-div-label')).backgroundColor;
    const r = !!x && parseFloat(cs.borderTopWidth) >= 3 && cs.backgroundColor === brass && parseFloat(cs.fontSize) >= 17 && x.getBoundingClientRect().height >= 44 && cs.boxShadow !== 'none' &&
      cs.color === 'rgb(17, 17, 17)';   // v6.80 — Eric: "make the X black" — black on the brass plate in every skin
    closeReview(); return r;
  }));

  console.log('— 📇 v6.78 ADDRESS and PEOPLE first —');

  ok('on the job card the ADDRESS and PEOPLE words are big and brass — the first thing after the pick window', await page.evaluate(() => {
    prefs.cards = { rininger: { job: 'Rininger', addr: '38210 K-Beach Rd', people: [{ n: 'Dale', r: 'Homeowner', tel: '907-555-0100', em: '' }], codes: [], notes: '' } };
    _cardJob = ''; openJobCard('Rininger');
    const heads = [...$('revBox').querySelectorAll('.jc-head')]; const h = heads[0], cs = getComputedStyle(h);
    const brass = getComputedStyle(document.querySelector('.jc-pick-lbl')).color;
    const r = heads.length >= 2 && /Address/i.test(h.textContent) && /People/i.test(heads[1].textContent) && parseFloat(cs.fontSize) >= 16 && cs.color === brass && parseInt(cs.fontWeight) >= 700 &&
      parseFloat(cs.borderBottomWidth) >= 2;
    closeReview(); return r;
  }));

  console.log('— 📷 v6.78 the working band while a photo loads —');

  ok('📷 Look at it puts the working band up while the photo loads, then ✓ PHOTO', await page.evaluate(async () => {
    window.getToken = async () => 'tok';
    const realFetch = window.fetch; let release;
    window.fetch = (u, o) => /get_thumbnail_v2/.test(String(u)) ? new Promise(res => { release = () => res({ ok: true, blob: async () => new Blob([new Uint8Array([137, 80, 78, 71])], { type: 'image/png' }) }); }) : realFetch(u, o);
    const p = showPhoto('/Clore DayLog/Photos/x.jpg');
    await new Promise(r => setTimeout(r, 30));
    const during = busyIs(/LOADING THE PHOTO/);
    release(); await p;
    const after = busyIs(/✓ PHOTO/) && $('lightbox').classList.contains('show');
    closeLightbox(); window.fetch = realFetch;
    return during && after;
  }));
  ok('…and says so in words when the photo does not come', await page.evaluate(async () => {
    window.getToken = async () => 'tok';
    const realFetch = window.fetch;
    window.fetch = (u, o) => /get_thumbnail_v2/.test(String(u)) ? Promise.reject(new Error('offline')) : realFetch(u, o);
    await showPhoto('/Clore DayLog/Photos/x.jpg');
    const r = busyIs(/DID NOT LOAD/);
    window.fetch = realFetch; return r;
  }));

  console.log('— 🎒 v6.78 a POCKET heading on the summary —');

  ok('what left the pocket unfinished (flushed, overflow, not done) sits under 🎒 POCKET — not the done ones, which stay under the POCKET LIST (TO GET until v7.07)', await page.evaluate(() => {
    entries = []; nextId = 1; prefs.pocket = [];
    addEntry('Note', '🎒 Flushed — call the gravel guy', '—', { noSniff: true, tags: ['pocket'], pocket: 'flushed' });
    addEntry('Note', '🎒 Overflow — pick up the saw', '—', { noSniff: true, tags: ['pocket'], pocket: 'over' });
    addEntry('Note', '🎒 Not done — inspector callback', '—', { noSniff: true, tags: ['pocket'], pocket: 'swept' });
    addEntry('Note', '✓ screws for Hertz', 'Hertz', { noSniff: true, tags: ['pocket'], pocket: 'done' });
    openReview('summary');
    const keys = [...document.querySelectorAll('.rev-sec')].map(b => b.dataset.sec);
    const pk = document.querySelector('.rev-sec-body[data-sec="pocket"]').textContent.replace(/\s+/g, ' ');
    const get = document.querySelector('.rev-sec-body[data-sec="get"]').textContent.replace(/\s+/g, ' ');
    const head = document.querySelector('.rev-sec[data-sec="pocket"]').textContent;
    return keys.indexOf('pocket') === keys.indexOf('need') + 1 && keys.indexOf('get') === keys.indexOf('pocket') + 1 && /POCKET — not done/.test(head) && /3/.test(head) &&   // 🎒 v7.14 — the leftovers sit right under NEEDS YOU, the list after them
      /call the gravel guy/.test(pk) && /pick up the saw/.test(pk) && /inspector callback/.test(pk) && /flushed/.test(pk) && /overflow/.test(pk) && /not done/.test(pk) &&
      !/screws for Hertz/.test(pk) && /screws for Hertz/.test(get) && !/gravel guy/.test(get) &&
      document.querySelectorAll('.rev-sec-body[data-sec="pocket"] .pk-acts').length === 3;   // v6.87 — four plates a row now, plus the clear-all bar
  }));
  ok('➡ Tomorrow (v6.87 — it was "↩ Pocket it for tomorrow") puts it back on tomorrow\'s pocket and off the heading', await page.evaluate(() => {
    const btn = [...document.querySelectorAll('.rev-sec-body[data-sec="pocket"] .pk-acts button')].find(b => /Tomorrow/.test(b.textContent) && /gravel guy/.test(b.closest('.sum-line').textContent));
    btn.click();
    const it = pocket()[0];
    const pk = document.querySelector('.rev-sec-body[data-sec="pocket"]').textContent.replace(/\s+/g, ' ');
    const e = entries.find(x => /gravel guy/.test(x.details));
    const r = !!it && it.t === 'call the gravel guy' && it.day === pocketDay(1) && e.pocket === 'back' && !/gravel guy/.test(pk) && /2/.test(document.querySelector('.rev-sec[data-sec="pocket"]').textContent) &&
      /gravel guy/.test($('pocketList').textContent) && /TOMORROW/.test($('pocketList').textContent);
    closeReview(); return r;
  }));

  console.log('— 📜 v6.78 RUNNING LOG, bigger than the ALL plate —');

  ok('the RUNNING LOG words are big and bold — bigger type than the ALL filter plate under them', await page.evaluate(() => {
    closePanels();
    const l = document.querySelector('#runLogCard .qn-div-label');
    const all = [...document.querySelectorAll('#runLogCard .pick-chip')].find(c => /\bALL\b/.test(c.textContent));
    const ls = getComputedStyle(l);
    return !!l && /RUNNING LOG/.test(l.textContent) && parseFloat(ls.fontSize) >= 16 && parseInt(ls.fontWeight) >= 800 && (!all || parseFloat(ls.fontSize) > parseFloat(getComputedStyle(all).fontSize));
  }));

  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v6.78') && document.querySelector('footer').textContent.includes(APP_VER);
  }));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
