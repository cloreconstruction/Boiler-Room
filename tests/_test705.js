// 🧮 v7.05 — A TRACKER JOB CAN NAME ITS QUICKBOOKS JOB. Eric: "if carricks fourplex numbers are in there make sure thats
// taken out." One QuickBooks customer carried two jobs, and the Project Tracker (matching on the customer alone) added the
// older job into the newer one. A tracker entry whose customer reads "Customer:Job" now counts only that job; a bare
// customer name still counts every job under it. Every name and figure in this file is made up.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), { fileURLToPath } = require('url');
(async () => {
  const appUrl = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const src = fs.readFileSync(path.join(path.dirname(fileURLToPath(appUrl)), 'index.html'), 'utf8');
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
  await page.goto(appUrl); await page.waitForTimeout(700);
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };
  await page.evaluate(() => {
    jobs = ['Two']; entries = []; todos = []; pendingQueue = []; window.scheduleSave = () => {}; dbx.refreshToken = 'x';
    renderJobSelects(); closePanels(); renderAll();
    // the page as it was sorted in July: job "two" named by its JOB, job "bolt" by its customer only
    const JOBS = {
      two: { name: 'Job Two', customer: 'Acme Co:Job Two [2]', gap: 20, invoiced: 1020, paid: 1000, open: 20, lastDate: '2026-07-01', stage: 'Finish',
        phases: [{ n: 1, name: 'Shell', total: 900, cats: [['Framing', 900]] }], draws: {}, tosort: { 'Not yet categorized': 100 },
        invoices: [{ date: '2026-06-01', num: '11', amount: 1000, open: 0 }, { date: '2026-07-01', num: '12', amount: 20, open: 20 }] },
      bolt: { name: 'Bolt Shop', customer: 'Bolt Inc', gap: 0, invoiced: 300, paid: 300, open: 0, lastDate: '2026-06-01', stage: 'Done',
        phases: [{ n: 1, name: 'Shell', total: 300, cats: [['Framing', 300]] }], draws: {}, tosort: {}, invoices: [{ date: '2026-06-01', num: '31', amount: 300, open: 0 }] }
    };
    window._page = `<html><body><div class="banner"><b>Live QuickBooks data</b>, imported July 28, 2026 — every dollar ties to the books.</div><div id="jobMeta"></div>
<script>const JOBS = ${JSON.stringify(JOBS)};
function render(id){ document.getElementById('jobMeta').textContent = 'Updated July 28, 2026 · Figures come straight from QuickBooks'; }
</scr` + `ipt></body></html>`;
    window._ledger = { asOf: '2026-09-18', rows: [
      { num: '5',  n: 'Acme Co:Job One [1]', a: 777, o: 0, d: '2025-03-12' },      // the OLDER job under the same customer
      { num: '11', n: 'Acme Co:Job Two [2]', a: 1000, o: 0, d: '2026-06-01' },
      { num: '12', n: 'Acme Co:Job Two [2]', a: 20, o: 20, d: '2026-07-01' },
      { num: '13', n: 'Acme Co:Job Two [2]', a: 250, o: 250, d: '2026-08-10' },   // billed since the July sort
      { num: '31', n: 'Bolt Inc:Shop', a: 300, o: 0, d: '2026-06-01' },
      { num: '32', n: 'Bolt Inc:Yard', a: 50, o: 50, d: '2026-08-01' } ] };
    // a client page whose lifetime figure equals the WHOLE Acme customer — it must not join as a job of its own
    window._receipt = { clients: [{ code: 'two-aaaaaa', job: 'Job Two', invoiced: 1270 }, { code: 'acme-bbbbbb', job: 'Acme everything', invoiced: 2047 }] };
    const files = {
      [(DBX_ROOT + '/App Data/project-tracker.html').toLowerCase()]: _page,
      [(DBX_ROOT + '/App Data/qb-ledger.json').toLowerCase()]: JSON.stringify(_ledger),
      [(DBX_ROOT + '/App Data/qb-refresh.json').toLowerCase()]: JSON.stringify(_receipt) };
    window.dbxDownload = async p => { const k = String(p).toLowerCase(); return Object.prototype.hasOwnProperty.call(files, k) ? files[k] : null; };
  });

  console.log('— 🧮 v7.05 a tracker job can name its QuickBooks job —');

  ok('a job named "Customer:Job" counts ONLY that job: the older job under the same customer stays out of invoiced, paid, open and the history', await page.evaluate(async () => {
    await openMoneyPage('tracker');
    const j = trackerJobsBlock($('svFrame').srcdoc).jobs.two;
    return j.invoiced === 1270 && j.open === 270 && j.paid === 1000 && j.invoices.map(v => v.num).join(',') === '11,12,13' && !j.invoices.some(v => v.num === '5') && j.lastDate === '2026-08-10';
  }));
  ok('what was billed since the July sort rides as ONE line and the page still adds up to the job alone', await page.evaluate(() => {
    const j = trackerJobsBlock($('svFrame').srcdoc).jobs.two;
    const sum = j.phases.reduce((s, p) => s + p.total, 0) + Object.values(j.draws).reduce((s, v) => s + v, 0) + Object.values(j.tosort).reduce((s, v) => s + v, 0) + j.gap;
    return j.tosort[TRK_SINCE] === 250 && Math.round(sum * 100) === Math.round(j.invoiced * 100);
  }));
  ok('a bare customer name still counts every job under that customer, exactly as before', await page.evaluate(() => {
    const b = trackerJobsBlock($('svFrame').srcdoc).jobs.bolt;
    return b.invoiced === 350 && b.open === 50 && b.invoices.map(v => v.num).join(',') === '31,32';
  }));
  ok('a job-level entry also holds its customer: a client page whose figure matches the whole customer does not join as a job of its own', await page.evaluate(() => {
    const J = trackerJobsBlock($('svFrame').srcdoc).jobs;
    return Object.keys(J).sort().join(',') === 'bolt,two';
  }));
  ok('the match lives in trackerFresh, one helper for both the refresh and the join', /const mine = \(r, cust\) => String\(cust\)\.includes\(':'\)/.test(src) && /led\.rows\.filter\(r => mine\(r, j\.customer\)\)/.test(src) && /\[j\.customer, top\(j\.customer\)\]/.test(src));
  ok('no page errors', errs.length === 0, errs.join(' | '));
  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close(); process.exit(fail ? 1 : 0);
})();
