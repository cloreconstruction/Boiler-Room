// 📚 v6.94 — THE CLIENT BUDGETS WINDOW CHECKS THE PAGES ITSELF. Eric, looking at "⚠ 1 of 9 client budgets refreshed · 8 did
// not": "i think theres still problems with budgets updating? check through the process start to finish and see." The
// process held (exports = ledger row for row; eight pages tied to the books to the cent). The WINDOW was wrong: it called a
// page good only when the run had REWRITTEN it, so "checked, nothing changed, left alone" read ✕ NOT UPDATED every week —
// and a page made after the run's client list was not on the receipt at all, so the one real miss never showed.
// Every name and figure in this file is made up.
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
    entries = []; todos = []; nextId = 1; pendingQueue = []; window.scheduleSave = () => {}; window.savePendingSoon = () => {}; window.publishSharedNotes = () => {};
    dbx.refreshToken = 'x'; window.getToken = async () => 'x'; lsDel('daylog-qbfresh-seen'); _portalIdx = null;
    const R = portalRoot(); window._dl = {}; window._writes = [];
    window._files = {
      [QB_FRESH_PATH()]: JSON.stringify({ ranAt: '2026-09-18T20:00:00Z', importDate: '2026-09-18', source: ['Invoice List.xlsx'], clients: [
        { code: 'oak-111aaa', job: 'Oak House', updated: true, at: '2026-09-18T20:00:00Z', invoiced: 1200.5, paid: 1000, open: 200.5, why: 'a new invoice' },
        { code: 'elm-222bbb', job: 'Elm Cabin', updated: false, invoiced: 800, paid: 800, open: 0, why: 'still paid in full, no activity' },
        { code: 'fir-333ccc', job: 'Fir Garage', updated: false, invoiced: 450.25, paid: 0, open: 450.25, why: 'unchanged' },
        { code: 'ash-444ddd', job: 'Ash Remodel', updated: false, why: 'no Ash customer exists anywhere in the QuickBooks ledger' }] }),
      [R + '/index.json']: JSON.stringify({ clients: [{ code: 'oak-111aaa', job: 'Oak House' }, { code: 'elm-222bbb', job: 'Elm Cabin' }, { code: 'fir-333ccc', job: 'Fir Garage' }, { code: 'ash-444ddd', job: 'Ash Remodel' }, { code: 'yew-555eee', job: 'Yew Pantry' }] }),
      [R + '/oak-111aaa.json']: JSON.stringify({ name: 'Oak House', invoiced: 1200.5, paid: 1000, open: 200.5, journal: [] }),
      [R + '/elm-222bbb.json']: JSON.stringify({ name: 'Elm Cabin', invoiced: 800, paid: 800, open: 0 }),
      [R + '/fir-333ccc.json']: JSON.stringify({ name: 'Fir Garage', invoiced: 300, paid: 0, open: 300 }),          // the page and the books disagree
      [R + '/ash-444ddd.json']: JSON.stringify({ name: 'Ash Remodel', invoiced: 0, paid: 0, open: 0 }),
      [R + '/yew-555eee.json']: JSON.stringify({ name: 'Yew Pantry', invoiced: 0, paid: 0, open: 0 }) };        // a page the run has never heard of
    window.dbxDownload = async p => { window._dl[p] = (window._dl[p] || 0) + 1; return Object.prototype.hasOwnProperty.call(window._files, p) ? window._files[p] : null; };
    window.dbxUpload = async p => { window._writes.push(p); return {}; };
    window._rows = () => [...document.querySelectorAll('#qbfBody .qbf-row')].map(r => ({ state: r.dataset.state, glyph: r.querySelector('.qbf-w').textContent.trim(), t: r.textContent.replace(/\s+/g, ' ').trim() }));
    window._wait = async () => { for (let i = 0; i < 80; i++) { await new Promise(r => setTimeout(r, 25)); if (_qbfCheck && _qbfCheck.ok) return; } };
  });

  const r = await page.evaluate(async () => {
    await checkQbFresh(); await _wait(); await new Promise(z => setTimeout(z, 60));
    const banner = $('qbFreshStrip').textContent.replace(/\s+/g, ' ').trim();
    openQbFresh(); await new Promise(z => setTimeout(z, 250));
    return { banner, tally: $('qbfTally').textContent.replace(/\s+/g, ' ').trim(), rows: _rows(), foot: $('qbfBody').textContent.replace(/\s+/g, ' '), writes: _writes.length, fits: $('revBox').scrollWidth <= $('revBox').clientWidth + 1 };
  });
  const row = j => r.rows.find(x => x.t.includes(j)) || {};
  ok('a page the run REWROTE reads ✓ UPDATED — and the window has checked that it matches the books', row('Oak House').state === 'updated' && row('Oak House').glyph === '✓' && /UPDATED .* — the page matches the books · invoiced \$1,201 · paid \$1,000 · open \$201/.test(row('Oak House').t), JSON.stringify(row('Oak House')));
  ok('a page the run checked and LEFT ALONE reads ✓ CURRENT — not "NOT UPDATED": nothing moved in QuickBooks and the page matches the books to the cent', row('Elm Cabin').state === 'current' && row('Elm Cabin').glyph === '✓' && /CURRENT — nothing moved in QuickBooks; the page matches the books · invoiced \$800 · paid \$800 · open \$0/.test(row('Elm Cabin').t) && !/NOT UPDATED/.test(r.foot), JSON.stringify(row('Elm Cabin')));
  ok('a page that does NOT say what the books say is called out with both sets of figures — whatever the run\'s flag said', row('Fir Garage').state === 'mismatch' && row('Fir Garage').glyph === '⚠' && /DOES NOT MATCH THE BOOKS — their page: invoiced \$300 · paid \$0 · open \$300 · the books: invoiced \$450 · paid \$0 · open \$450\. Tell Claude\./.test(row('Fir Garage').t), JSON.stringify(row('Fir Garage')));
  ok('a job with no customer in QuickBooks reads ○ NOTHING IN QUICKBOOKS YET with the run\'s reason — said, but not counted as a fault', row('Ash Remodel').state === 'nobooks' && row('Ash Remodel').glyph === '○' && /NOTHING IN QUICKBOOKS YET — no Ash customer exists/.test(row('Ash Remodel').t), JSON.stringify(row('Ash Remodel')));
  ok('a client page the run has NEVER HEARD OF finally shows: ⚠ NOT ON THE BOOKS RUN\'S LIST, with what its homeowner is looking at', row('Yew Pantry').state === 'unlisted' && row('Yew Pantry').glyph === '⚠' && /NOT ON THE BOOKS RUN'S LIST — the run has never been told about this page, so its money never moves \(their page shows invoiced \$0 · paid \$0 · open \$0\)\. Tell Claude which QuickBooks customer it is\./.test(row('Yew Pantry').t), JSON.stringify(row('Yew Pantry')));
  ok('what needs him rides on TOP (does not match, not on the list), then not-in-QuickBooks, then the pages that are fine', r.rows.map(x => x.state).join() === 'mismatch,unlisted,nobooks,updated,current', r.rows.map(x => x.state).join());
  ok('the tally and the banner count what MATCHES THE BOOKS, in words: 2 of 5 · 1 not in QuickBooks yet · 2 need a look', /^⚠ 2 of 5 client budgets match the books · 1 not in QuickBooks yet · 2 need a look$/.test(r.tally) && /⚠ BOOKS — A PAGE NEEDS A LOOK/.test(r.banner) && /2 of 5 client budgets match the books · 1 not in QuickBooks yet — 2 need a look/.test(r.banner), JSON.stringify({ tally: r.tally, banner: r.banner }));
  ok('it only READS: checking the pages writes nothing to Dropbox, and nothing runs off the phone', r.writes === 0 && r.fits);

  ok('every page matching (one of them left alone by the run) is a CLEAN banner: 📚 BOOKS UPDATED — every page is current', await page.evaluate(async () => {
    const R = portalRoot(); closeReview();
    _files[R + '/fir-333ccc.json'] = JSON.stringify({ name: 'Fir Garage', invoiced: 450.25, paid: 0, open: 450.25 });
    _files[R + '/index.json'] = JSON.stringify({ clients: [{ code: 'oak-111aaa', job: 'Oak House' }, { code: 'elm-222bbb', job: 'Elm Cabin' }, { code: 'fir-333ccc', job: 'Fir Garage' }, { code: 'ash-444ddd', job: 'Ash Remodel' }] });
    _portalIdx = null; await qbFreshVerify(true); renderQbFresh();
    const b = $('qbFreshStrip').textContent.replace(/\s+/g, ' ').trim();
    return /📚 BOOKS UPDATED/.test(b) && /3 of 4 client budgets match the books · 1 not in QuickBooks yet — every page is current/.test(b) && !!$('qbFreshStrip').querySelector('.qb-fresh.ok');
  }));

  ok('the pages are read once per run for the banner (not on every sync), again when he opens the window, and never after he has cleared it', await page.evaluate(async () => {
    const R = portalRoot(), p = R + '/elm-222bbb.json'; const n0 = _dl[p];
    await checkQbFresh(); await new Promise(z => setTimeout(z, 120)); const sameRun = _dl[p] === n0;
    openQbFresh(); await new Promise(z => setTimeout(z, 200)); const onOpen = _dl[p] === n0 + 1;
    qbFreshDismiss(); const n1 = _dl[p]; await checkQbFresh(); await new Promise(z => setTimeout(z, 120));
    return sameRun && onOpen && _dl[p] === n1 && $('qbFreshStrip').innerHTML === '';
  }));

  ok('if the pages cannot be read, nothing is called good or bad on a guess: the run\'s own words stand, softened — NOT REWRITTEN, "could not be read to check"', await page.evaluate(async () => {
    lsDel('daylog-qbfresh-seen'); _portalIdx = null; const keep = window.dbxDownload;
    window.dbxDownload = async p => /qb-refresh\.json$/.test(p) ? _files[p] : null;   // the receipt reads, the portal does not
    await checkQbFresh(); await new Promise(z => setTimeout(z, 150)); openQbFresh(); await new Promise(z => setTimeout(z, 250));
    const rows = _rows(), t = $('qbfTally').textContent.replace(/\s+/g, ' ');
    window.dbxDownload = keep; closeReview();
    const elm = rows.find(x => x.t.includes('Elm Cabin')) || {};
    return elm.state === 'unchecked' && /NOT REWRITTEN — still paid in full, no activity · the pages have not been checked yet/.test(elm.t) && /the pages could not be read to check them/.test(t) && !rows.some(x => x.state === 'unlisted') && !/NOT UPDATED/.test(rows.map(x => x.t).join(' '));
  }));

  ok('no receipt yet says so in plain words; a crew phone never reads the books', await page.evaluate(async () => {
    const keep = _files[QB_FRESH_PATH()]; delete _files[QB_FRESH_PATH()]; await checkQbFresh(); openQbFresh();
    const none = /No QuickBooks run has left a receipt yet/.test($('qbfBody').textContent) && $('qbFreshStrip').innerHTML === '';
    closeReview(); _files[QB_FRESH_PATH()] = keep;
    return none && /if \(CREW_NAME \|\| !dbx\.refreshToken\) return;/.test(checkQbFresh.toString());
  }));

  ok('nothing runs off the right edge of the main page', await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth));
  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v6.94') && document.querySelector('footer').textContent.includes(APP_VER);
  }));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
