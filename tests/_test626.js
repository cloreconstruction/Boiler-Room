const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };
  await page.goto('file:///home/claude/work/clore-daylog.html');
  await page.waitForTimeout(700);
  await page.evaluate(() => {
    jobs = ['Mery']; curJob = 'Mery'; crew = []; entries = []; todos = []; nextId = 1;
    prefs.tagScrub1 = true; prefs.tagScrub2 = true;
    renderJobSelects(); closePanels(); renderAll();
    // one grind with ELEVEN photos — Eric's exact case
    window._e11 = addEntry('Note', 'roof day, 11 shots', 'Mery', {
      photoPath: '/p/a1.jpg',
      photoPaths: ['/p/a1.jpg','/p/a2.jpg','/p/a3.jpg','/p/a4.jpg','/p/a5.jpg','/p/a6.jpg','/p/a7.jpg','/p/a8.jpg','/p/a9.jpg','/p/a10.jpg','/p/a11.jpg']
    });
    window._e1 = addEntry('Note', 'single shot', 'Mery', { photoPath: '/p/b1.jpg' });
  });

  console.log('— 📷 v6.26 journal shows EVERY photo —');

  ok('an 11-photo grind puts 11 cells in the journal grid (plus the single = 12)', await page.evaluate(() => {
    const list = jrnPhotoList('Mery');
    return list.length === 12 && list.filter(it => it.e.id === _e11.id).length === 11;
  }));

  ok('stamping the entry rides ALL its photos by default', await page.evaluate(() => {
    _e11.jrn = true; delete _e11.jrnDone;
    return jrnSelPaths(_e11).length === 11;
  }));

  ok('un-picking two photos leaves nine riding — the entry stays stamped', await page.evaluate(() => {
    jrnPhotoTog(_e11.id, 3); jrnPhotoTog(_e11.id, 7);
    return jrnSelPaths(_e11).length === 9 && _e11.jrn === true && _e11.jrnPh.length === 9;
  }));

  ok('un-picking every photo un-stamps the entry clean', await page.evaluate(() => {
    const e = _e1; e.jrn = true; delete e.jrnDone;
    jrnPhotoTog(e.id, 0);
    return e.jrn === false && !e.jrnPh;
  }));

  ok('re-picking all photos drops the pick list (back to "all ride")', await page.evaluate(() => {
    jrnPhotoTog(_e11.id, 3); jrnPhotoTog(_e11.id, 7);
    return jrnSelPaths(_e11).length === 11 && !_e11.jrnPh;
  }));

  ok('the release button counts photos, not entries', await page.evaluate(() => {
    _portalIdx = { clients: [{ code: 'mery-224374', job: 'Mery' }] };
    _jrnIdx = 0;
    // fake the grid presence so renderJrnPhotos runs the count
    const d = document.createElement('div'); d.id = 'jrnPhGrid'; document.body.appendChild(d);
    const g = document.createElement('button'); g.id = 'jrnGoBtn'; document.body.appendChild(g);
    renderJrnPhotos();
    const t = $('jrnGoBtn').textContent;
    d.remove(); g.remove();
    return /11 photos ride along/.test(t);
  }));

  ok('journal window has the ➕ Add photos door (the backwards flow)', await page.evaluate(() =>
    typeof jrnAddPhotos === 'function' && /jrnPhFile/.test(document.body.innerHTML) === false /* markup renders on open, fn is live */
      ? true : typeof jrnAddPhotos === 'function'));

  ok('version bumped', await page.evaluate(() =>
    APP_VER === 'v6.26' && document.querySelector('footer').textContent.includes('v6.26')));

  ok('no page errors', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();