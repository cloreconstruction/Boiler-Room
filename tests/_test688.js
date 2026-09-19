// 📊 v6.88 — THE PROJECT TRACKER REFRESHES ITSELF FROM THE LEDGER. Eric: "Check and see why the project tracker isn't
// updating." The weekly books run never rewrote that page (built once, July 28), so the app patches its money block from
// App Data/qb-ledger.json every time it opens. Every figure in this file is made up.
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
    jobs = ['Mery']; entries = []; todos = []; pendingQueue = []; window.scheduleSave = () => {}; dbx.refreshToken = 'x';
    renderJobSelects(); closePanels(); renderAll();
    const JOBS = {
      josten: { name: 'Josten Home', customer: 'Nicko Josten', gap: 600, invoiced: 1000, paid: 1000, open: 0, lastDate: '2026-07-24', stage: 'Interior Finish',
        phases: [{ n: 1, name: 'Site', total: 300, cats: [['Design', 300]] }], draws: { Draws: 100 }, tosort: {}, invoices: [{ date: '2026-07-24', num: '1293', amount: 1000, open: 0 }] },
      quiet: { name: 'Quiet Job', customer: 'Nobody Here', gap: 0, invoiced: 50, paid: 50, open: 0, lastDate: '2026-06-01', stage: 'Done', phases: [{ n: 1, name: 'Site', total: 50, cats: [['Design', 50]] }], draws: {}, tosort: {}, invoices: [{ date: '2026-06-01', num: '900', amount: 50, open: 0 }] }
    };
    window._mk = day => `<html><body><div class="banner"><b>Live QuickBooks data</b>, imported ${day} — every dollar ties to the books.</div><div id="jobMeta"></div>
<script>const JOBS = ${JSON.stringify(JOBS)};
function render(id){ document.getElementById('jobMeta').textContent = 'Updated ${day} · Figures come straight from QuickBooks'; }
</scr` + `ipt></body></html>`;
    window._files = {};
    window._ledger = { asOf: '2026-09-18', rows: [
      { num: '1293', n: 'Nicko Josten:OTM - Weiser', a: 1000, o: 0, d: '2026-07-24' },
      { num: '1330', n: 'Nicko Josten:OTM - Weiser', a: 250.5, o: 0, d: '2026-09-14' },
      { num: '1331', n: 'Nicko Josten', a: 100, o: 40 },                                   // no date on the row: falls back to the ledger's day
      { num: '1303', n: 'James & Melanie Scrithfield:OTM', a: 600.1, o: 0, d: '2026-08-10' },
      { num: '1327', n: 'James & Melanie Scrithfield:OTM', a: 300, o: 300, d: '2026-09-07' },
      { num: '2001', n: 'Twin A', a: 500, o: 0, d: '2026-08-01' }, { num: '2002', n: 'Twin B', a: 500, o: 0, d: '2026-08-02' } ] };
    window._receipt = { clients: [{ code: 'josten-842d53', job: 'Josten Home', invoiced: 1000 }, { code: 'scrithfield-7c4e19', job: 'Scritchfield Residence', invoiced: 900.1 },
      { code: 'twins-aaaaaa', job: 'Twins', invoiced: 500 }, { code: 'zero-000000', job: 'Nothing billed', invoiced: 0 }] };
    window.dbxDownload = async p => { const k = String(p).toLowerCase(); return Object.prototype.hasOwnProperty.call(_files, k) ? _files[k] : null; };
    window._set = (day, withLedger) => { _files = { [(DBX_ROOT + '/App Data/project-tracker.html').toLowerCase()]: _mk(day), [(DBX_ROOT + '/App Data/profit-ticker.html').toLowerCase()]: '<html><body>ticker const JOBS = {"a":1};</body></html>',
      [(DBX_ROOT + '/App Data/qb-refresh.json').toLowerCase()]: JSON.stringify(_receipt) }; if (withLedger) _files[(DBX_ROOT + '/App Data/qb-ledger.json').toLowerCase()] = JSON.stringify(_ledger); };
  });

  console.log('— 📊 v6.88 the money block comes from the ledger, every open —');

  ok('a job on the page gets invoiced, paid, open, last billed and the whole invoice history from the ledger, by its own QuickBooks customer name', await page.evaluate(async () => {
    _set('July 28, 2026', true);
    await openMoneyPage('tracker');
    const J = trackerJobsBlock($('svFrame').srcdoc).jobs, j = J.josten;
    return $('sumViewer').classList.contains('show') && j.invoiced === 1350.5 && j.open === 40 && j.paid === 1310.5 && j.invoices.length === 3 &&
      j.invoices.map(v => v.num).join(',') === '1293,1330,1331' && j.invoices[2].date === '2026-09-18' && j.invoices[2].open === 40 && j.lastDate === '2026-09-18';
  }));
  ok('the phase bars are left as they were, and what was billed since rides as ONE line so the page still adds up', await page.evaluate(() => {
    const j = trackerJobsBlock($('svFrame').srcdoc).jobs.josten;
    const sum = j.phases.reduce((s, p) => s + p.total, 0) + Object.values(j.draws).reduce((s, v) => s + v, 0) + Object.values(j.tosort).reduce((s, v) => s + v, 0) + j.gap;
    return j.phases.length === 1 && j.phases[0].total === 300 && j.tosort[TRK_SINCE] === 350.5 && Math.round(sum * 100) === Math.round(j.invoiced * 100);
  }));
  ok('a job whose customer has no ledger rows is left exactly as it was', await page.evaluate(() => {
    const q = trackerJobsBlock($('svFrame').srcdoc).jobs.quiet;
    return q.invoiced === 50 && q.invoices.length === 1 && !q.tosort[TRK_SINCE];
  }));
  ok('a client page with money and no place on the tracker joins when its receipt figure ties to ONE customer, to the cent; a tie with two customers adds nothing; zero adds nothing', await page.evaluate(() => {
    const J = trackerJobsBlock($('svFrame').srcdoc).jobs, s = J.scrithfield;
    return !!s && s.name === 'Scritchfield Residence' && s.customer === 'James & Melanie Scrithfield' && s.invoiced === 900.1 && s.open === 300 && s.paid === 600.1 && s.phases.length === 0 &&
      s.tosort['Not sorted into phases yet'] === 900.1 && s.invoices.length === 2 && !J.twins && !J.zero && Object.keys(J).join(',') === 'josten,quiet,scrithfield';
  }));
  ok('the page says so in words: the money is as of the ledger\'s day, the phase bars are still the July sort', await page.evaluate(() => {
    const h = $('svFrame').srcdoc;
    return /the money figures and invoice history are as of September 18, 2026 and tie to the books\./.test(h) && /The phase bars are still the July 28, 2026 sort/.test(h) &&
      /'Money as of September 18, 2026 · Figures come straight from QuickBooks'/.test(h) && !/imported July 28, 2026 —/.test(h);
  }));

  console.log('— 📊 v6.88 when to leave the page alone —');

  ok('a page the books run rebuilt AFTER the ledger\'s day is shown exactly as the run left it', await page.evaluate(async () => {
    _set('September 20, 2026', true); closeSumViewer && closeSumViewer();
    await openMoneyPage('tracker');
    return $('svFrame').srcdoc === _mk('September 20, 2026');
  }));
  ok('no ledger in Dropbox → the page opens untouched; the profit ticker is never patched', await page.evaluate(async () => {
    _set('July 28, 2026', false);
    await openMoneyPage('tracker'); const a = $('svFrame').srcdoc === _mk('July 28, 2026');
    _set('July 28, 2026', true);
    await openMoneyPage('ticker'); const b = $('svFrame').srcdoc === '<html><body>ticker const JOBS = {"a":1};</body></html>';
    return a && b;
  }));
  ok('a broken ledger file or a page with no JOBS block never stops the page from opening', await page.evaluate(async () => {
    _set('July 28, 2026', true); _files[(DBX_ROOT + '/App Data/qb-ledger.json').toLowerCase()] = '{not json';
    await openMoneyPage('tracker'); const a = $('svFrame').srcdoc === _mk('July 28, 2026');
    _files[(DBX_ROOT + '/App Data/project-tracker.html').toLowerCase()] = '<html><body>no data here</body></html>'; _files[(DBX_ROOT + '/App Data/qb-ledger.json').toLowerCase()] = JSON.stringify(_ledger);
    await openMoneyPage('tracker'); const b = $('svFrame').srcdoc === '<html><body>no data here</body></html>';
    return a && b;
  }));

  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v6.88') && document.querySelector('footer').textContent.includes(APP_VER);
  }));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
