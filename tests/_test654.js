// 📗 v6.54 — THE BOOKS METER. Eric: "i really like the 7 day cube countdown for how often the
// journal is posted, i want one next to it for the qb updates too." Same seven cubes, same
// drain, same strobe — counting the days since the books run last looked at that client.
// Logan's run is weekly, so seven cubes is exactly one cycle.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { fileURLToPath } = require('url');
(async () => {
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };
  const appUrl = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const repo = path.dirname(fileURLToPath(appUrl));
  const src = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

  console.log('— 📗 v6.54 the books meter, beside the journal one —');

  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
  await page.goto(appUrl); await page.waitForTimeout(700);

  // his real qb-refresh.json shape: a run stamp, per-client `at`, and clients read but unchanged
  const RUN = {
    ranAt: '2026-09-06T06:00:00Z', importDate: '2026-09-05',
    clients: [
      { code: 'mery-224374', updated: true, at: '2026-09-06T05:58:38Z' },
      { code: 'carrick-2bcf5c', updated: true, at: '2026-08-30T05:58:38Z' },
      { code: 'rininger-cbc69d', updated: false, why: 'ledger agrees with the page exactly - nothing to change' },
      { code: 'old-000000', updated: true, at: '2026-08-01T00:00:00Z' }
    ]
  };
  await page.evaluate(run => {
    jobs = ['Mery']; curJob = 'Mery'; crew = []; nextId = 900;
    window._dbx = { [DBX_ROOT + '/App Data/qb-refresh.json']: JSON.stringify(run) };
    window.dbxDownload = async p => window._dbx[p] ?? null;
    window.dbxUpload = async () => ({}); window.dbxRpc = async () => ({ metadata: {} });
    window.scheduleSave = () => {}; window.renderPortalList = () => {};
    dbx.refreshToken = 'tok';
    prefs.qbRel = {};
    // localDay is a const arrow, so it cannot be stubbed from out here — every age assertion
    // below is therefore built RELATIVE to the real today, using the app's own localDay.
    window.daysAgo = n => { const d = new Date(); d.setDate(d.getDate() - n); return localDay(d); };
  }, RUN);

  ok('one file feeds every client — the run is read once, not once per job', await page.evaluate(async () => {
    let hits = 0;
    const real = window.dbxDownload;
    window.dbxDownload = async p => { hits++; return real(p); };
    await refreshQbAges();
    window.dbxDownload = real;
    return hits === 1 && Object.keys(prefs.qbRel).length === 4;
  }), await page.evaluate(() => JSON.stringify(prefs.qbRel)));

  ok('a client rewritten by the run takes its OWN date, not the run\'s', await page.evaluate(() =>
    prefs.qbRel['mery-224374'] === '2026-09-06' && prefs.qbRel['carrick-2bcf5c'] === '2026-08-30'));

  ok('a client READ but unchanged takes the run\'s date — it was looked at', await page.evaluate(() =>
    prefs.qbRel['rininger-cbc69d'] === '2026-09-06'));

  ok('the age is the days between that date and today', await page.evaluate(() => {
    prefs.qbRel.probe = daysAgo(3);
    return qbAgeDays('probe') === 3 && qbAgeDays('mery-224374') !== null;
  }));

  ok('a client the run has never seen reads as unknown, not as fresh', await page.evaluate(() =>
    qbAgeDays('never-heard-of') === null && /NO BOOKS RUN YET/.test(qbMeterHtml('never-heard-of'))));

  const cells = code => page.evaluate(c => {
    const d = document.createElement('div'); d.innerHTML = qbMeterHtml(c);
    const all = [...d.querySelectorAll('.jm-cell')];
    return { n: all.length, on: all.filter(x => x.classList.contains('on')).length,
      strobe: all.filter(x => x.classList.contains('strobe')).length,
      word: (d.querySelector('.jm-word') || {}).textContent || '', dead: !!d.querySelector('.jm-dead') };
  }, code);

  ok('seven cubes, always', (await cells('mery-224374')).n === 7 && (await cells('never-heard-of')).n === 7);

  const atAge = n => page.evaluate(days => {
    prefs.qbRel.probe = daysAgo(days);
    const d = document.createElement('div'); d.innerHTML = qbMeterHtml('probe');
    const all = [...d.querySelectorAll('.jm-cell')];
    return { n: all.length, on: all.filter(x => x.classList.contains('on')).length,
      strobe: all.filter(x => x.classList.contains('strobe')).length,
      word: (d.querySelector('.jm-word') || {}).textContent || '', dead: /jm-dead/.test(d.innerHTML) };
  }, n);

  ok('two days old drains two cubes and says so in words', await (async () => {
    const c = await atAge(2);
    return c.on === 5 && c.strobe === 0 && !c.dead && c.word === 'BOOKS 2 DAYS OLD';
  })(), JSON.stringify(await atAge(2)));

  ok('one day old says DAY, not DAYS', (await atAge(1)).word === 'BOOKS 1 DAY OLD', JSON.stringify(await atAge(1)));

  ok('nine days old is empty, strobes the last cube, and spells out that the books are due', await (async () => {
    const c = await atAge(9);
    return c.on === 0 && c.strobe === 1 && c.dead && /9 DAYS — BOOKS ARE DUE/.test(c.word) && /⚠/.test(c.word);
  })(), JSON.stringify(await atAge(9)));

  ok('a client never run reads as overdue on purpose — that is the one to chase', await (async () => {
    const c = await cells('never-heard-of');
    return c.on === 0 && c.strobe === 1 && c.dead;
  })());

  ok('run today = all seven lit, and the word says today', await (async () => {
    const c = await atAge(0);
    return c.on === 7 && c.strobe === 0 && !c.dead && c.word === 'BOOKS TODAY';
  })(), JSON.stringify(await atAge(0)));

  ok('seven days exactly is the edge — one cycle: 6 still has a cube, 7 is due', await (async () => {
    const six = await atAge(6), seven = await atAge(7);
    return six.on === 1 && !six.dead && /BOOKS 6 DAYS OLD/.test(six.word) &&
      seven.on === 0 && seven.dead && /7 DAYS — BOOKS ARE DUE/.test(seven.word);
  })(), JSON.stringify([await atAge(6), await atAge(7)]));

  // ── it must not depend on colour, and must not be confusable with the journal ──
  ok('never colour alone — every state carries a glyph and a spelled word', await page.evaluate(() => {
    const two = qbMeterHtml('mery-224374'), dead = qbMeterHtml('carrick-2bcf5c'), none = qbMeterHtml('nope');
    return [two, dead, none].every(h => /jm-glyph/.test(h) && /📗/.test(h) && /jm-word/.test(h)) &&
      /BOOKS/.test(two) && /BOOKS/.test(dead) && /BOOKS/.test(none);
  }));

  ok('the two meters are told apart by glyph AND by words, not by position', await page.evaluate(() => {
    prefs.jrnRel = { probe: daysAgo(2) }; prefs.qbRel.probe = daysAgo(2);
    const j = jrnMeterHtml('probe'), q = qbMeterHtml('probe');
    return /📖/.test(j) && /📗/.test(q) && !/📗/.test(j) && !/📖/.test(q) &&
      /2 DAYS OLD/.test(j) && !/BOOKS/.test(j) && /BOOKS 2 DAYS OLD/.test(q);
  }));

  ok('the books meter renders BELOW the journal one, and neither is cut off at 390px', await page.evaluate(() => {
    const host = document.createElement('div');
    host.style.cssText = 'width: 340px; position: fixed; left: 0; top: 0;';   // a fold header's real width
    host.innerHTML = jrnMeterHtml('probe') + qbMeterHtml('probe');
    document.body.appendChild(host);
    const j = host.querySelector('.jm:not(.jm-qb)').getBoundingClientRect();
    const q = host.querySelector('.jm-qb').getBoundingClientRect();
    const fits = host.scrollWidth <= host.clientWidth + 1;
    document.body.removeChild(host);
    return q.top >= j.bottom - 1 && fits && q.height > 8;
  }), await page.evaluate(() => {
    const h = document.createElement('div'); h.style.cssText = 'width:340px;position:fixed;left:0;top:0;';
    h.innerHTML = jrnMeterHtml('probe') + qbMeterHtml('probe');
    document.body.appendChild(h);
    const r = JSON.stringify({ scroll: h.scrollWidth, client: h.clientWidth });
    document.body.removeChild(h); return r;
  }));

  ok('a phone set to reduce motion gets a steady cube, not a dead one', /prefers-reduced-motion: reduce\) \{ \.jm-cell\.strobe \{ animation: none; opacity: 1; \} \}/.test(src));

  // ── the guards ──
  ok('a crew phone shows no books meter at all', await (async () => {
    const c2 = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const p2 = await c2.newPage();
    await p2.addInitScript(() => { try { localStorage.setItem('daylog-crew-name', 'Phil'); } catch (e) {} });
    await p2.goto(appUrl); await p2.waitForTimeout(600);
    const r = await p2.evaluate(async () => {
      prefs.qbRel = { x: '2026-09-06' };
      dbx.refreshToken = 'tok';
      let hit = 0; window.dbxDownload = async () => { hit++; return null; };
      await refreshQbAges();
      return CREW_NAME === 'Phil' && qbMeterHtml('x') === '' && hit === 0;
    });
    await c2.close();
    return r;
  })());

  ok('a bad or missing run file leaves the cached dates alone', await page.evaluate(async () => {
    const keep = JSON.stringify(prefs.qbRel);
    window.dbxDownload = async () => 'not json at all';
    await refreshQbAges();
    const a = JSON.stringify(prefs.qbRel) === keep;
    window.dbxDownload = async () => null;
    await refreshQbAges();
    return a && JSON.stringify(prefs.qbRel) === keep;
  }));

  ok('the meter is on the job header, next to the journal one, in both list renders',
    (src.match(/\$\{jrnMeterHtml\(c\.code\)\}\$\{qbMeterHtml\(c\.code\)\}/g) || []).length === 2);

  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v6.54') && document.querySelector('footer').textContent.includes(APP_VER);
  }));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
