// 📷 v6.60 — JOURNAL PHOTOS: THE TWO CAPS. Eric, on Josten's journal: "trying to add more photos,
// but I think the number of photos in the preview is limited … the photos I added are not showing
// up." The app's picker stopped at 24 in array order; the client page drew a week's first 8 and
// silently dropped the rest. Picker: picked-and-unsent first, newest first, room for 48. Client
// page: 8 shown, the rest behind one button that says how many.
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
  const APP = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  await page.goto(APP);
  await page.waitForTimeout(700);
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };

  console.log('— 📷 v6.60 the picker in the app —');

  ok('a busy job: the photos he just picked are FIRST, whatever the pile looks like', await page.evaluate(() => {
    jobs = ['Josten/Weiser']; entries = []; nextId = 1;
    window.scheduleSave = () => {};
    // the pile: 47 single-photo entries from the last month, newest at the top of the array
    for (let i = 0; i < 47; i++) {
      const e = addEntry('Note', 'progress ' + i, 'Josten/Weiser', { photoPath: '/p/old' + i + '.jpg' });
      e.ts = new Date(Date.now() - (i + 2) * 3600000 * 6);
    }
    // what he just ground and stamped — but dated a day back, so it is NOT first by time
    const mine = addEntry('Note', '📖 Journal photos — week of today', 'Josten/Weiser', {
      jrn: true, photoPath: '/p/new1.jpg', photoPaths: ['/p/new1.jpg', '/p/new2.jpg', '/p/new3.jpg'] });
    mine.ts = new Date(Date.now() - 26 * 3600000);
    // and shove it to the END of the array, the worst place the old code could have found it
    entries = entries.filter(e => e.id !== mine.id).concat([mine]);
    const list = jrnPhotoList('Josten/Weiser');
    window._list = list;
    return list.length === 48 && list[0].path === '/p/new1.jpg' && list[1].path === '/p/new2.jpg' && list[2].path === '/p/new3.jpg';
  }));

  ok('after the picked ones, newest first', await page.evaluate(() => {
    const rest = window._list.slice(3).map(it => +new Date(it.e.ts));
    return rest.every((t, i) => i === 0 || t <= rest[i - 1]);
  }));

  ok('the cap is 48, not 24 — and it is the OLDEST that fall off, never the picked', await page.evaluate(() => {
    const paths = window._list.map(it => it.path);
    return paths.length === 48 && paths.includes('/p/old0.jpg') && !paths.includes('/p/old46.jpg') && paths.includes('/p/new3.jpg');
  }));

  ok('a photo sent in a past week still shows (the grid never clears itself) — and sits by date', await page.evaluate(() => {
    const e = entries.find(x => x.photoPath === '/p/old0.jpg');
    e.jrn = true; e.jrnDone = true;                         // went out already
    const list = jrnPhotoList('Josten/Weiser');
    return list.some(it => it.path === '/p/old0.jpg') && list[0].path === '/p/new1.jpg';
  }));

  ok('personal and other-job photos are never in the grid', await page.evaluate(() => {
    const p = addEntry('Note', 'personal shot', 'Josten/Weiser', { photoPath: '/p/personal.jpg' }); p.personal = true;
    const o = addEntry('Note', 'other job', 'Mery', { photoPath: '/p/other.jpg' });
    const paths = jrnPhotoList('Josten/Weiser').map(it => it.path);
    entries = entries.filter(e => e.id !== p.id && e.id !== o.id);
    return !paths.includes('/p/personal.jpg') && !paths.includes('/p/other.jpg');
  }));

  console.log('— 🏠 v6.60 the client page —');

  const cpage = await ctx.newPage();
  const cerrs = []; cpage.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) cerrs.push(e.message); });   // the page's other pings have no server on file://
  const week = { week: 'Aug 28 – Sep 3', released: '2026-09-04', text: 'Garage doors installed.', photos: Array.from({ length: 11 }, (_, i) => `progress ${i + 1}.heic`) };
  const older = { week: 'Aug 21 – Aug 27', released: '2026-08-27', text: 'Paint.', photos: ['a.jpg', 'b.jpg', 'c.jpg'] };
  // a file:// page's fetch never becomes a network request, so stand in for the function inside the page
  const pageJson = JSON.stringify({ name: 'Josten–Weiser Custom Home', updated: '2026-09-04', show: {}, journal: [week, older] });
  await cpage.addInitScript(json => {
    const real = window.fetch.bind(window);
    window.fetch = (url, opts) => {
      if (/client-portal/.test(String(url)) && !(opts && opts.method === 'POST')) {
        return Promise.resolve(new Response(json, { status: 200, headers: { 'content-type': 'application/json' } }));
      }
      return real(url, opts);
    };
  }, pageJson);
  await cpage.goto(APP.replace(/index\.html$/, 'c/index.html') + '?c=josten-test');
  await cpage.waitForTimeout(900);

  ok('the newest week shows 8 photos and ONE button that says how many are waiting', await cpage.evaluate(() => {
    const grid = document.querySelector('.jr-shots');
    if (!grid) return false;
    const imgs = [...grid.querySelectorAll('img')];
    const shown = imgs.filter(i => i.style.display !== 'none').length;
    const btn = document.querySelector('.jr-morebtn');
    return imgs.length === 11 && shown === 8 && !!btn && /\+3 more photos/.test(btn.textContent);
  }));

  ok('tap it and all 11 show, and the button goes away', await cpage.evaluate(() => {
    document.querySelector('.jr-morebtn').click();
    const grid = document.querySelector('.jr-shots');
    const shown = [...grid.querySelectorAll('img')].filter(i => i.style.display !== 'none').length;
    return shown === 11 && !document.querySelector('.jr-morebtn');
  }));

  ok('a week with 8 or fewer has no button at all', await cpage.evaluate(() => {
    const grids = document.querySelectorAll('.jr-shots');
    const past = grids[grids.length - 1];
    return grids.length === 2 && past.querySelectorAll('img').length === 3 && !past.parentElement.querySelector('.jr-morebtn');
  }));

  ok('the hidden photos are not fetched until asked for (the page stays light)', await cpage.evaluate(() => {
    // lazy + display:none images carry no box, so the browser does not request them
    return [...document.querySelectorAll('.jr-shots img')].every(i => i.getAttribute('loading') === 'lazy');
  }));

  ok('no page errors on either page', errs.length === 0 && cerrs.length === 0, [...errs, ...cerrs].join(' | '));
  await cpage.close();

  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v6.60') && document.querySelector('footer').textContent.includes(APP_VER);
  }));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
