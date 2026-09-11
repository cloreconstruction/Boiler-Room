// ⚙ v6.62 — THE WORKING BAND. Eric: "id like something to let me know when its thinking. the
// 'instant' light at the top of the main page does that but i think another way to tell it is
// when i click ask the wizard or uploading photos." A brass band across the top, in words, above
// every window; the ASK plate says THINKING…; the grinder plate wears the upload count.
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
    renderJobSelects(); closePanels(); renderAll();
    window.scheduleSave = () => {};
    dbx.refreshToken = 'test-token';
  });
  const band = () => page.evaluate(() => { const b = $('busyBand'); return { hidden: b.hidden, text: b.textContent, done: b.classList.contains('done') }; });

  console.log('— ⚙ v6.62 the band itself —');

  ok('the band exists, is hidden at rest, and is a status region a reader would announce', await page.evaluate(() => {
    const b = $('busyBand');
    return !!b && b.hidden && b.getAttribute('role') === 'status' && b.getAttribute('aria-live') === 'polite';
  }));

  ok('it pins across the top, above every window and the client preview', await page.evaluate(() => {
    busyShow('TEST');
    const s = getComputedStyle($('busyBand'));
    const z = +s.zIndex, modal = +getComputedStyle($('revModal')).zIndex, prev = +getComputedStyle($('cliPrev')).zIndex;
    const r = $('busyBand').getBoundingClientRect();
    busyDone('x'); $('busyBand').hidden = true;
    return s.position === 'fixed' && r.top === 0 && r.width >= 380 && z > modal && z > prev;
  }));

  ok('busyShow shows the words; busyDone says ✓ then clears itself', await (async () => {
    await page.evaluate(() => busyShow('📷 UPLOADING PHOTO 1 OF 3…'));
    const a = await band();
    await page.evaluate(() => busyDone('📷 ✓ 3 PHOTOS UP'));
    const b = await band();
    await page.waitForTimeout(1400);
    const c = await band();
    return !a.hidden && /UPLOADING PHOTO 1 OF 3/.test(a.text) && !b.hidden && b.done && /✓ 3 PHOTOS UP/.test(b.text) && c.hidden;
  })());

  console.log('— 🧙 v6.62 ask the wizard —');

  ok('THINKING lights the band AND the ASK plate, which stops taking taps', await page.evaluate(() => {
    setWizLamp('thinking');
    const b = $('busyBand'), btn = $('wizSideBtn');
    return !b.hidden && /THE WIZARD IS THINKING/.test(b.textContent) && btn.disabled && btn.classList.contains('busy') && /THINKING/.test(btn.textContent);
  }));

  ok('when the answer lands the band says ✓ and the plate is ASK again', await page.evaluate(() => {
    wizIdleLamp();
    const b = $('busyBand'), btn = $('wizSideBtn');
    return !b.hidden && b.classList.contains('done') && /🧙 ✓/.test(b.textContent) && !btn.disabled && /ASK/.test(btn.textContent) && !/THINKING/.test(btn.textContent);
  }));

  ok('a question that goes to the hourly check says so, in words', await page.evaluate(() => {
    setWizLamp('thinking'); setWizLamp('sent');
    return /SENT — the answer rides the hourly check/.test($('busyBand').textContent);
  }));

  ok('the real ask: band up while the Wizard works, down when it answers', await page.evaluate(async () => {
    window.aiKey = () => 'k';
    window.dbxRpc = async () => ({ matches: [] });
    let during = null;
    window.aiCall = async () => { during = { hidden: $('busyBand').hidden, text: $('busyBand').textContent, btn: $('wizSideBtn').disabled }; await new Promise(r => setTimeout(r, 150));
      return { r: { ok: true, json: async () => ({ content: [{ text: 'Tuesday you poured footings.' }] }) }, model: 'quick', fell: false }; };
    $('askText').value = 'what did we do tuesday';
    await askInstant('what did we do tuesday');
    const after = { done: $('busyBand').classList.contains('done'), text: $('busyBand').textContent, btn: $('wizSideBtn').disabled };
    closeWizFull();
    return during && !during.hidden && /THINKING/.test(during.text) && during.btn === true && after.done && /✓/.test(after.text) && after.btn === false;
  }));

  console.log('— 📷 v6.62 uploading photos —');

  ok('the band counts the photos as they go up, and the grinder plate wears the count', await page.evaluate(async () => {
    const seen = [];
    window.dbxUpload = async (path) => { seen.push({ band: $('busyBand').textContent, plate: document.querySelector('.plate-btn--grind').dataset.busy, disabled: getComputedStyle(document.querySelector('.plate-btn--grind')).pointerEvents }); await new Promise(r => setTimeout(r, 20)); return { path_display: path }; };
    const e = addEntry('Note', 'three shots', 'Mery', {});
    const files = [1, 2, 3].map(i => new File(['x'], 'p' + i + '.jpg', { type: 'image/jpeg' }));
    await attachEntryPhotos(e, files, 'Job Notes/Mery');
    const ph = seen.filter(s => /UPLOADING/.test(s.band));   // the entry sync uploads once first — only the photos count here
    return ph.length === 3 && /UPLOADING PHOTO 1 OF 3/.test(ph[0].band) && /UPLOADING PHOTO 3 OF 3/.test(ph[2].band) &&
      ph[1].plate === '⏳ 2 OF 3 UP' && ph[1].disabled === 'none';
  }));

  ok('when they are all up it says so and the plate is a plate again', await page.evaluate(() => {
    const b = $('busyBand'), p = document.querySelector('.plate-btn--grind');
    return b.classList.contains('done') && /📷 ✓ 3 PHOTOS UP/.test(b.textContent) && !p.classList.contains('busy') && !p.dataset.busy;
  }));

  ok('a photo that fails is counted honestly — ⚠ 2 OF 3 UP', await page.evaluate(async () => {
    let n = 0;
    window.dbxUpload = async (path) => { n++; if (n === 2) throw new Error('offline'); return { path_display: path }; };
    const e = addEntry('Note', 'one drops', 'Mery', {});
    const files = [1, 2, 3].map(i => new File(['x'], 'q' + i + '.jpg', { type: 'image/jpeg' }));
    await attachEntryPhotos(e, files, 'Job Notes/Mery');
    return /⚠ 2 OF 3 UP — check the connection/.test($('busyBand').textContent);
  }));

  ok('one photo reads PHOTO UP, not "1 PHOTOS"', await page.evaluate(async () => {
    window.dbxUpload = async (path) => ({ path_display: path });
    const e = addEntry('Note', 'single', 'Mery', {});
    await attachEntryPhotos(e, [new File(['x'], 's.jpg', { type: 'image/jpeg' })], 'Job Notes/Mery');
    return /📷 ✓ PHOTO UP/.test($('busyBand').textContent);
  }));

  console.log('— ♿ v6.62 never colour or motion alone —');

  ok('every state is spelled out in words', await page.evaluate(() => {
    const words = [];
    busyShow('🧙 THE WIZARD IS THINKING…'); words.push($('busyBand').textContent);
    busyDone(); words.push($('busyBand').textContent);
    return words.every(w => /[A-Z]{4,}/.test(w));
  }));

  await page.emulateMedia({ reducedMotion: 'reduce' });
  ok('with reduced motion the band and the plate hold still — same words', await page.evaluate(() => {
    busyShow('📷 UPLOADING PHOTO…'); setWizLamp('thinking');
    const a = getComputedStyle($('busyBand')).animationName, t = getComputedStyle($('wizSideBtn').querySelector('.wiz-side-tx')).animationName;
    const okNow = (a === 'none') && (t === 'none') && /UPLOADING|THINKING/.test($('busyBand').textContent);
    wizIdleLamp();
    return okNow;
  }));
  await page.emulateMedia({ reducedMotion: 'no-preference' });

  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v6.62') && document.querySelector('footer').textContent.includes(APP_VER);
  }));

  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
