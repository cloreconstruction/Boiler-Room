// 🏠 v6.49 — Eric, on a text from a dental office in Review: "when I push Log It, where does it
// go?" It went to jobs[0] — Shop / Admin on his phone — silently, because a text carries no job
// and the fallback took the first one in the list. "yes that needs to be sorted on the review.
// add personal to the job list if its not already on the wheel." So the text card wears the same
// wheel the QuickBooks card has had since v6.19, an untouched wheel means '— unfiled' rather
// than a real client's job, and picking Personal now actually LOCKS the entry.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { fileURLToPath } = require('url');
(async () => {
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };
  const appUrl = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const repo = path.dirname(fileURLToPath(appUrl));
  const src = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

  console.log('— 🏠 v6.49 the text card gets a job wheel, and Personal locks —');

  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
  await page.goto(appUrl); await page.waitForTimeout(700);

  // his real job list order — Shop / Admin really is jobs[0], which is what made this a bug
  const seed = () => page.evaluate(() => {
    jobs = ['Shop / Admin', 'Ashman', 'Scritchfield', 'Personal', 'Mery'];
    curJob = 'Mery'; crew = ['Phil']; entries = []; todos = []; nextId = 1; pendDone.clear();
    prefs.jobRecent = []; prefs.tags = []; prefs.qbSkipped = {}; prefs.qbMatched = {};
    window._moves = [];
    window.dbxRpc = async (ep, arg) => { if (ep === 'files/move_v2') window._moves.push(arg.from_path); return { metadata: {} }; };
    window.dbxDownload = async () => null; window.dbxUpload = async () => ({});
    window.scheduleSave = () => {}; window.savePendingSoon = () => {};
    dbx.refreshToken = 'tok';
    pendingQueue = [
      { id: 'text:t1', kind: 'text', source: 'TEXT -1.txt', payload: { from: 'Saldana Dental Arts', body: 'Can we move the tile date?', path: '/clore daylog/inbox/text -1.txt', photos: [], hot: true, ts: '2026-09-05T17:00:00Z' } },
      { id: 'text:t2', kind: 'text', source: 'TEXT -2.txt', payload: { from: 'Saldana Dental Arts', body: 'second one', path: '/clore daylog/inbox/text -2.txt', photos: [], hot: true, ts: '2026-09-05T18:00:00Z' } },
      { id: 'text:t3', kind: 'text', source: 'TEXT -3.txt', payload: { from: 'Shevaun', body: 'private thing', path: '/clore daylog/inbox/text -3.txt', photos: [], hot: true, ts: '2026-09-05T19:00:00Z' } },
      { id: 'qb:q1', kind: 'qb', payload: { qid: 'q1', d: '2026-09-01', amt: 100, who: 'Home Depot', memo: '', acct: '' } }
    ];
    openReview();
    return pendingQueue.length;
  });
  ok('seeded three texts and a QuickBooks line', (await seed()) === 4);

  const wheel = id => page.evaluate(i => {
    const s = document.getElementById('revJob-' + i.replace(/[^a-zA-Z0-9:_-]/g, ''));
    return s ? { opts: [...s.options].map(o => o.value || o.textContent), value: s.value } : null;
  }, id);

  ok('the TEXT card now has a job wheel — it never did before', !!(await wheel('text:t1')));
  ok('the QuickBooks card still has its wheel', !!(await wheel('qb:q1')));

  const w = await wheel('text:t1');
  ok('the wheel opens on "— I\'ll pick it later", not on a real job', w.value === '—', JSON.stringify(w.value));
  ok('every job is on it, and Personal is there', ['Shop / Admin', 'Ashman', 'Scritchfield', 'Personal', 'Mery'].every(x => w.opts.includes(x)), JSON.stringify(w.opts));
  ok('the card asks in his words which job the TEXT is about', await page.evaluate(() => /Which job is this text about/.test($('revBox').textContent)));

  // ── the bug itself ──
  ok('✓ Log it with NO pick files on "—", NOT on Shop / Admin', await page.evaluate(() => {
    reviewAct('text:t1', 'log');
    const e = entries[0];
    return !!e && e.job === '—' && /Saldana Dental Arts/.test(e.details) && !e.personal;
  }), await page.evaluate(() => JSON.stringify((entries[0] || {}).job)));

  ok('the toast says plainly that nothing was filed', await page.evaluate(() => /no job on it/.test($('toast').textContent)));

  ok('picking a job files it THERE', await page.evaluate(() => {
    qbJobPick('text:t2', 'Mery');
    reviewAct('text:t2', 'pile');
    const e = entries.find(x => /second one/.test(x.details || ''));
    return !!e && e.job === 'Mery' && (e.tags || []).includes('Saldana Dental Arts');
  }), await page.evaluate(() => JSON.stringify(entries.map(e => [e.job, e.tags]))));

  // ── 🔒 the Personal job carries the Personal lock ──
  ok('picking Personal LOCKS the entry — it never did before', await page.evaluate(() => {
    qbJobPick('text:t3', 'Personal');
    reviewAct('text:t3', 'log');
    const e = entries.find(x => /private thing/.test(x.details || ''));
    return !!e && e.job === 'Personal' && e.personal === true;
  }), await page.evaluate(() => JSON.stringify(entries.map(e => [e.job, !!e.personal]))));

  ok('the toast says it stays on his phone', await page.evaluate(() => /stays on your phone/.test($('toast').textContent)));

  // the lock is enforced where the file is WRITTEN, not inside csvString — so test that path
  ok('a locked text is walled out of master-log.csv, the same as any personal entry', await page.evaluate(() => {
    const e = entries.find(x => x.personal);
    const csv = csvString(entries.filter(x => !x.sample && !x.personal));   // exactly what the sync writes
    return !!e && /private thing/.test(e.details) && !/private thing/.test(csv) && /Saldana/.test(csvString(entries.filter(x => !x.personal)));
  }));

  // v6.53 widened this from !e.personal to isLocked(e) — the flag, the Personal TAG, or the
  // Personal JOB. Assert the guarantee, not one spelling of it.
  ok('and the sync still applies that filter — nobody has quietly dropped it', /master-log\.csv', csvString\(entries\.filter\(e => !e\.sample && !isLocked\(e\)\)\)\)/.test(src));

  ok('and the filter now catches the Personal JOB too, not just the flag', await page.evaluate(() =>
    isLocked({ job: 'Personal' }) && isLocked({ tags: ['Personal'] }) && isLocked({ personal: true }) && !isLocked({ job: 'Mery' })));

  ok('the wheel warns IN WORDS before he taps, when Personal is chosen', await page.evaluate(() => {
    pendingQueue = [{ id: 'text:t9', kind: 'text', payload: { from: 'Someone', body: 'x', path: '/p/t9.txt', photos: [] } }];
    qbJobPick('text:t9', 'Personal'); renderReview();
    return /stays on your phone/i.test($('revBox').textContent);
  }));

  ok('isPersonalJob matches the name exactly — never a guess', await page.evaluate(() =>
    isPersonalJob('Personal') && isPersonalJob(' personal ') && !isPersonalJob('Personal Shop') && !isPersonalJob('Impersonal') && !isPersonalJob('')));

  // ── nothing else changed ──
  ok('a QuickBooks line still files on its wheel', await page.evaluate(() => {
    qbJobPick('qb:q1', 'Ashman');
    pendingQueue.push({ id: 'qb:q1', kind: 'qb', payload: { qid: 'q1', d: '2026-09-01', amt: 100, who: 'Home Depot', memo: '', acct: '' } });
    reviewAct('qb:q1', 'log');
    const e = entries.find(x => /Home Depot/.test(x.details || ''));
    return !!e && e.job === 'Ashman' && e.amount === 100;
  }));

  ok('a crew note still rides in on the job the crew sent — no wheel, no change', await page.evaluate(() => {
    entries = []; nextId = 1;
    pendingQueue = [{ id: 'crew:Phil:1:2026-09-01', kind: 'crew', source: 'Phil', payload: { from: 'Phil', type: 'Note', text: 'framing done', job: 'Scritchfield', day: '2026-09-01', vis: '' } }];
    reviewAct('crew:Phil:1:2026-09-01', 'log');
    return entries[0] && entries[0].job === 'Scritchfield';
  }));

  ok('a radar to-do still lands on the job it named', await page.evaluate(() => {
    todos = [];
    pendingQueue = [{ id: 'jobsilence:Mery:w1', kind: 'todo', payload: { text: 'still rolling?', pri: 1, job: 'Mery' } }];
    reviewAct('jobsilence:Mery:w1', true);
    return todos[0] && todos[0].job === 'Mery';
  }));

  ok('two wheels set, then two taps — each files where it was set', await page.evaluate(() => {
    entries = []; nextId = 1;
    pendingQueue = [
      { id: 'text:a', kind: 'text', payload: { from: 'A', body: 'aaa', path: '/p/a.txt', photos: [] } },
      { id: 'text:b', kind: 'text', payload: { from: 'B', body: 'bbb', path: '/p/b.txt', photos: [] } }];
    renderReview();
    qbJobPick('text:a', 'Ashman'); qbJobPick('text:b', 'Mery');
    reviewAct('text:a', 'log'); reviewAct('text:b', 'log');
    const a = entries.find(e => /aaa/.test(e.details)), b = entries.find(e => /bbb/.test(e.details));
    return a.job === 'Ashman' && b.job === 'Mery';
  }));

  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v6.49') && document.querySelector('footer').textContent.includes(APP_VER);
  }));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
