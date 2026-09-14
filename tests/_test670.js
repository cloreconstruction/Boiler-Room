// 🗑 v6.70 — THE SUGGESTED TO-DOS ARE OUT. Eric, on the sort page: "take out the suggested to dos
// as well the ones that say 'nothing logged on carrick…' isn't useful." The three radars that only
// suggested a to-do (quiet-job nag, estimate chase, oil-change nudge) no longer card; what was
// waiting from them is swept out once; the real events still card.
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
    jobs = ['Carrick', 'Mery']; curJob = 'Mery'; crew = []; entries = []; todos = []; nextId = 1; pendingQueue = [];
    trucks = [{ name: 'F-250' }];
    renderJobSelects(); closePanels(); renderAll();
    window.scheduleSave = () => {}; window._saves = 0; window.savePendingSoon = () => { window._saves++; };
    dbx.refreshToken = 'test-token';
    window._dbxFiles = {};
    window.dbxDownload = async p => (window._dbxFiles || {})[p] ?? null;
    window.dbxUpload = async (p, body) => { (window._dbxFiles || {})[p] = body; return {}; };
    const ago = d => { const x = new Date(); x.setDate(x.getDate() - d); return x; };
    // a job nobody touched in 20 days, an estimate that went out 15 days ago, a truck 6,000 miles past its oil note
    entries.push({ id: 1, ts: ago(20), type: 'Note', details: 'set forms at Carrick', job: 'Carrick' });
    entries.push({ id: 2, ts: ago(15), type: 'Note', details: 'sent the estimate for the garage to Dale', job: 'Mery' });
    entries.push({ id: 3, ts: ago(40), type: 'Mileage', details: 'oil change', job: '—', truck: 'F-250', odometer: 100000 });
    entries.push({ id: 4, ts: ago(1), type: 'Mileage', details: 'to Mery', job: 'Mery', truck: 'F-250', odometer: 106200 });
    nextId = 5;
    lsSet('daylog-radar-day', ''); lsSet('daylog-weather-day', localDay(new Date()));
  });

  console.log('— 🗑 v6.70 the radar no longer suggests to-dos —');

  ok('a silent job, an unanswered estimate and an overdue oil change make NO cards any more', await page.evaluate(() => {
    pendingQueue = [];
    radarSweep();
    return RADAR_TODOS === false && pendingQueue.length === 0;
  }));

  ok('what was still waiting from those radars is swept out of the pile once, marked done, and saved — the rest stays', await page.evaluate(async () => {
    window._dbxFiles[PENDING_PATH()] = JSON.stringify([
      { id: 'jobsilence:Carrick:w2957', kind: 'todo', payload: { text: '🕸 Nothing logged on Carrick in 11 days — still rolling, or wrap it up?', pri: 1, job: 'Carrick' } },
      { id: 'estchase:22', kind: 'todo', payload: { text: '📄 Mery — that estimate went out 12 days ago — any answer yet?', pri: 1, job: 'Mery' } },
      { id: 'truck:F-250:100000', kind: 'todo', payload: { text: '🛢 F-250: 6,200 miles since the last oil/service note — book it?', pri: 1, job: '' } },
      { id: 'ml:1', kind: 'mail', payload: { from: 'Bob', addr: 'bob@sub.com', subj: 'Invoice', body: 'x', why: 'invoice', gist: '', by: 'phone', known: true, entryId: 2 } },
      { id: 'renew:2026-10-01:state farm', kind: 'todo', payload: { text: '🔁 Renew: State Farm — expires 2026-10-01', due: '2026-10-01', pri: 2, job: '' } },
    ]);
    window._saves = 0;
    await checkPending();
    const ids = pendingQueue.map(p => p.id);
    return ids.join(',') === 'ml:1,renew:2026-10-01:state farm' && pendDone.has('jobsilence:Carrick:w2957') && pendDone.has('estchase:22') && pendDone.has('truck:F-250:100000') && window._saves >= 1;
  }));

  ok('swept once means once: a later load with nothing to sweep does not save again', await page.evaluate(async () => {
    window._dbxFiles[PENDING_PATH()] = JSON.stringify([{ id: 'ml:1', kind: 'mail', payload: { from: 'Bob', addr: 'bob@sub.com', subj: 'Invoice', body: 'x', why: 'invoice', gist: '', by: 'phone', known: true, entryId: 2 } }]);
    window._saves = 0;
    await checkPending();
    return pendingQueue.length === 1 && window._saves === 0;
  }));

  ok('the real events still card: a policy about to expire makes its 🔁 Renew card', await page.evaluate(() => {
    pendingQueue = [];
    const d = new Date(); d.setDate(d.getDate() + 20);
    const when = localDay(d);
    renewMaybeSuggest({ name: 'policy.jpg' }, { ai: '[State Farm — policy]', aiExpires: when });
    return pendingQueue.length === 1 && /🔁 Renew: State Farm/.test(pendingQueue[0].payload.text) && pendingQueue[0].payload.due === when;
  }));

  ok('the 🧹 plate has no quiet-job row left to offer', await page.evaluate(() => {
    pendingQueue = [1, 2, 3, 4, 5, 6, 7].map(i => ({ id: 'qb:' + i, kind: 'qb', payload: { qid: String(i), amt: 10 * i, who: 'Spenard', d: '2026-09-10', memo: 'x' } }));
    const t = renderRevBulk();
    return /Sort the pile/.test(t) && /QuickBooks/.test(t) && !/quiet-job/.test(t);
  }));

  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v6.70') && document.querySelector('footer').textContent.includes(APP_VER);
  }));

  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
