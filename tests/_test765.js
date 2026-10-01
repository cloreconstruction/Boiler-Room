// 💚 v7.65 — A COMPLETE CATEGORY THAT CAME IN UNDER STANDS OUT ON ITS BAR. Eric: "on the estimates page when one is done but
// didn't use all the budget make the progress bar do something that makes it stand out that we were under, like the rest." The
// part of the bar that was never needed is a loud green stripe and the word beside the bar says the money (✓ $n UNDER, green);
// one that ended over says ⚠ $n OVER in red; an exact one still reads ✓ complete; an open line is as it was. Every figure made up.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { fileURLToPath } = require('url');
(async () => {
  const appUrl = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const repo = path.dirname(fileURLToPath(appUrl));
  const src = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await ctx.route(u => !/^file:/.test(u.href), r => r.abort());
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
  await page.goto(appUrl); await page.waitForTimeout(700);
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };
  const CODE = 'oak-111111';
  await page.evaluate(([CODE]) => {
    jobs = ['Oak House']; crew = []; todos = []; window.scheduleSave = () => {}; dbx.refreshToken = 'test-token';
    _portalIdx = { clients: [{ key: 'oak', job: 'Oak House', code: CODE }] };
    window._dbxFiles = {}; window._ups = [];
    window.dbxDownload = async p => (window._dbxFiles || {})[p] ?? null;
    window.dbxUpload = async (p, body) => { (window._dbxFiles || {})[p] = body; window._ups.push(p); return {}; };
    window.dbxPathExists = async p => Object.prototype.hasOwnProperty.call(window._dbxFiles || {}, p);
    entries = []; nextId = 1;
    window._dbxFiles[estPath(CODE)] = JSON.stringify({ mk: 20, cats: [
      { n: 'Demo', appr: true, done: { at: '2026-09-20' }, bids: [{ e1: 20000, e2: 0, acc: true }] },       // came to $2,000 of $24,000 — $22,000 under
      { n: 'Roofing', appr: true, done: { at: '2026-09-22' }, bids: [{ e1: 4000, e2: 0, acc: true }] },     // $5,300 of $4,800 — $500 over
      { n: 'Siding', appr: true, done: { at: '2026-09-23' }, bids: [{ e1: 5000, e2: 0, acc: true }] },      // $6,000 of $6,000 — exact
      { n: 'Framing', appr: true, bids: [{ e1: 30000, e2: 0, acc: true }] }] });                               // open: $12,700 of $36,000
    window._dbxFiles[portalRoot() + '/' + CODE + '.json'] = JSON.stringify({ name: 'Oak House', show: { money: true }, invoiced: 26000, paid: 0, open: 0, journal: [],
      phases: [{ n: 1, name: 'Site', total: 26000, cats: [['Demo', 2000], ['Roofing', 5300], ['Siding', 6000], ['Framing', 12700]] }],
      budget: [{ n: 'Demo', est: 24000, done: 1 }, { n: 'Roofing', est: 4800, done: 1 }, { n: 'Siding', est: 6000, done: 1 }, { n: 'Framing', est: 36000 }] });
    _estIdx = -1; _estD = null; _estPage = null; _estSales = null;
  }, [CODE]);
  await page.evaluate(async () => { await openEstimates(0); }); await page.waitForTimeout(1300);
  const barOf = n => page.evaluate(n => { const ci = _estD.cats.findIndex(x => x.n === n), r = document.querySelector(`.est-row[data-ci="${ci}"]`); const bar = r.querySelector('.est-bar'), u = r.querySelector('.est-bar-under'), w = r.querySelector('.est-bar-word'), f = r.querySelector('.est-bar-fill');
    return { done: bar.classList.contains('done'), fill: f.style.width, under: u ? u.style.width : null, underBg: u ? getComputedStyle(u).backgroundImage : '', word: w.textContent.trim(), cls: w.className, color: getComputedStyle(w).color, good: getComputedStyle(document.documentElement).getPropertyValue('--good').trim(), label: bar.getAttribute('aria-label'), bg: getComputedStyle(bar).backgroundImage, row: bar.closest('.est-barrow').getBoundingClientRect().width, barW: bar.getBoundingClientRect().width }; }, n);
  const demo = await barOf('Demo'), roof = await barOf('Roofing'), sid = await barOf('Siding'), fr = await barOf('Framing');
  ok('COMPLETE and UNDER: what came in fills the bar, the rest is a green stripe as wide as what was never needed, and the word beside it says the money in green — ✓ $22,000 UNDER', demo.done && demo.fill === '8%' && demo.under === '92%' && /gradient/.test(demo.underBg) && demo.word === '✓ $22,000 UNDER' && /under/.test(demo.cls) && /^complete — \$2,000 of \$24,000$/.test(demo.label), JSON.stringify(demo));
  ok('the green is the board\'s own good colour, and the bar still has room beside the word at 390px', await page.evaluate(() => { const w = document.querySelector('.est-bar-word.under'); const c = getComputedStyle(w).color; const probe = document.createElement('span'); probe.style.color = 'var(--good, #8fd694)'; document.body.appendChild(probe); const g = getComputedStyle(probe).color; probe.remove(); return c === g; }) && demo.barW >= demo.row * 0.45, JSON.stringify([demo.color, demo.barW, demo.row]));
  ok('COMPLETE and OVER: the bar is full and red, no green stripe, the word reads ⚠ $500 OVER', roof.done && roof.fill === '100%' && roof.under === null && roof.word === '⚠ $500 OVER' && /over/.test(roof.cls), JSON.stringify(roof));
  ok('COMPLETE and exact: ✓ complete, no stripe', sid.done && sid.fill === '100%' && sid.under === null && sid.word === '✓ complete', JSON.stringify(sid));
  ok('an open line is as it was: n% in, no stripe, no done hatch', !fr.done && fr.fill === '35%' && fr.under === null && fr.word === '35% in' && !/gradient/.test(fr.bg), JSON.stringify(fr));
  ok('↩ Reopen takes the stripe and the word off again', await page.evaluate(async () => { const ci = _estD.cats.findIndex(x => x.n === 'Demo'); await estDone(ci); await new Promise(r => setTimeout(r, 200)); const r = document.querySelector(`.est-row[data-ci="${ci}"]`); return !r.querySelector('.est-bar-under') && r.querySelector('.est-bar-word').textContent.trim() === '8% in'; }));
  ok('at 390px the board does not run off the side', await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth && $('revBox').scrollWidth <= $('revBox').clientWidth + 1));
  await page.evaluate(() => closeEstimates());

  ok('version bumped — APP_VER and the footer agree', /const APP_VER = 'v7\.(6[5-9]|[7-9]\d)'/.test(src) && new RegExp('<footer>' + (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1].replace('.', '\\.') + ' ·').test(src));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
