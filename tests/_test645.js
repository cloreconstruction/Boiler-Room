// 🧹 v6.45 — SORT THE PILE. Eric, at 97 waiting: "could you help me sort it and get it to zero
// then i can take over?" The app owns removal, so the pile clears on HIS tap, in the Review
// window, one row per kind. This suite proves each row is nothing more than that kind's own
// card button pressed N times, that two taps are needed, that emails are never swept, and
// that a skipped QuickBooks line STAYS skipped (it used to come back after 300 taps).
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { fileURLToPath } = require('url');
(async () => {
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };
  const appUrl = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const repo = path.dirname(fileURLToPath(appUrl));
  const src = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

  console.log('— 🧹 v6.45 sort the pile: one tap per kind, his tap, nothing thrown away —');

  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
  await page.goto(appUrl); await page.waitForTimeout(700);

  // the same mix his real pile had (97 → qb 61, quiet-job nags 18, texts 9, crew 8, mail 1), shrunk
  const seed = () => page.evaluate(() => {
    jobs = ['Mery', 'Ashman']; curJob = 'Mery'; crew = ['Phil']; entries = []; todos = []; nextId = 1;
    prefs.qbMatched = {}; prefs.qbSkipped = {}; prefs.tags = []; pendDone.clear();
    window._moves = []; window._saves = 0; window._toasts = [];
    window.dbxRpc = async (ep, arg) => { if (ep === 'files/move_v2') window._moves.push(arg.from_path); return ep === 'files/list_folder' ? { entries: [] } : { metadata: {} }; };
    window.dbxDownload = async () => null; window.dbxUpload = async () => ({});
    window.scheduleSave = () => {}; window.savePendingSoon = () => { window._saves++; };
    window.toast = (m) => { window._toasts.push(String(m)); };
    dbx.refreshToken = 'tok';
    const qb = (q, d, amt, who) => ({ id: 'qb:' + q, kind: 'qb', payload: { qid: q, d, amt, who, memo: '', acct: '1111 OPEX - R5609' } });
    const nag = (job) => ({ id: `jobsilence:${job}:w2957`, kind: 'todo', payload: { text: `🕸 Nothing logged on ${job} in 11 days — still rolling, or wrap it up?`, pri: 1, job, note: 'If the job is done, remove it in ⚙ Setup → Jobs so the radar stops watching it.' } });
    const txt = (n, from, body) => ({ id: 'text:TEXT -' + n + '.txt', kind: 'text', source: 'TEXT -' + n + '.txt', payload: { from, body, path: '/clore daylog/inbox/text -' + n + '.txt', photos: [], hot: true, ts: '2026-09-0' + n + 'T17:00:00Z' } });
    const cr = (i, text) => ({ id: 'crew:Phil:' + i + ':2026-08-08', kind: 'crew', source: 'Phil', payload: { from: 'Phil', type: 'Note', text, job: 'Mery', category: '', route: '', urg: '', truck: '', srcRef: '', day: '2026-08-08', vis: '' } });
    pendingQueue = [
      qb('q1', '2026-07-21', 228.43, 'Intuit'), qb('q2', '2026-07-22', 50000, 'Insulated Concrete Solutions, LLC'), qb('q3', '2026-07-23', 678.39, 'First National Bank Alaska'),
      qb('q4', '2026-08-30', 61.12, 'Speedway'), qb('q5', '2026-09-05', 312.5, 'Home Depot'),
      nag('C&C General'), nag('939'), nag('937'),
      { id: 'todo:plain1', kind: 'todo', payload: { text: 'Call the truss guy back', pri: 1, job: 'Mery' } },
      txt(1, '+12083390772', 'Let’s get the clear coating done on the trim and posts asap'),
      txt(2, '+19072524305', 'I have the Ashman job scheduled for template today. Is that ok?'),
      cr(14, 'No I haven’t been paid for Carrick’s'), cr(13, 'Just give me the number to invoice'),
      { id: 'text:Email -Crew time.txt', kind: 'mail', source: 'Email -Crew time.txt', payload: { from: 'Phil Kneeland', addr: 'pdkneela@gmail.com', subj: 'Crew time Aug 16 to Aug 29', body: 'waiting on Hughes', why: 'other', gist: 'crew time', by: 'phone', known: true, entryId: null, ts: '2026-09-07T18:00:00Z' } }
    ];
    renderReview();
    return pendingQueue.length;
  });

  ok('the seed is a pile: 14 waiting', (await seed()) === 14);

  const plate = () => page.evaluate(() => { const b = $('revBulk'); return b ? b.textContent.replace(/\s+/g, ' ') : ''; });
  const btns = () => page.evaluate(() => [...document.querySelectorAll('#revBulk button')].map(b => b.textContent.trim()));

  ok('the plate is there with a row per kind and honest counts', await (async () => {
    const t = await plate();
    return /Sort the pile/.test(t) && /5 QuickBooks bank lines/.test(t) && /3 quiet-job nags/.test(t) && /2 texts/.test(t) && /2 crew notes/.test(t);
  })(), await plate());

  ok('every row spells its verb — no colour-only meaning', JSON.stringify(await btns()) === JSON.stringify(['✕ SKIP ALL 5', '✕ CLEAR ALL 3', '📚 PILE ALL 2', '✓ LOG ALL 2']), JSON.stringify(await btns()));

  ok('the QuickBooks row shows the date span so he knows what he is skipping', /Jul 21 – Sep 5/.test(await plate()), await plate());

  ok('it says how many need his eyes one at a time (the email + the plain to-do)', /2 more below need your eyes/.test(await plate()), await plate());

  ok('emails have NO bulk row — those need his eyes', !/email/i.test((await btns()).join(' ')) && !/mail/.test(JSON.stringify(Object.keys(await page.evaluate(() => REV_BULK)))));

  // ── two taps, or nothing happens ──
  ok('first tap only ARMS: ⚠ SURE? in words, nothing leaves the pile', await page.evaluate(() => {
    revBulk('qb');
    const b = [...document.querySelectorAll('#revBulk button')][0];
    return pendingQueue.length === 14 && /⚠ SURE\?/.test(b.textContent) && /5 leave the pile/.test(b.textContent) && b.classList.contains('arm') && window._saves === 0;
  }));

  ok('arming one row then tapping ANOTHER re-arms, it does not fire', await page.evaluate(() => {
    revBulk('nag');
    const bs = [...document.querySelectorAll('#revBulk button')];
    return pendingQueue.length === 14 && !/SURE/.test(bs[0].textContent) && /⚠ SURE\?/.test(bs[1].textContent);
  }));

  ok('an armed row disarms itself after 4 seconds', await page.evaluate(async () => {
    await new Promise(r => setTimeout(r, 4300));
    return ![...document.querySelectorAll('#revBulk button')].some(b => /SURE/.test(b.textContent)) && pendingQueue.length === 14;
  }));

  // ── the QuickBooks sweep ──
  ok('✕ SKIP ALL: the five bank lines leave, nothing else does, ONE toast', await page.evaluate(() => {
    window._toasts = [];
    revBulk('qb'); revBulk('qb');
    const kinds = pendingQueue.map(p => p.kind);
    return pendingQueue.length === 9 && !kinds.includes('qb') && kinds.filter(k => k === 'todo').length === 4 && kinds.filter(k => k === 'text').length === 2 &&
      kinds.filter(k => k === 'crew').length === 2 && kinds.includes('mail') && window._toasts.length === 1 && /5 QuickBooks lines skipped/.test(window._toasts[0]);
  }), await page.evaluate(() => JSON.stringify(window._toasts)));

  ok('skipped lines are remembered on the phone (done ring) AND in synced prefs (qbSkipped)', await page.evaluate(() =>
    ['q1', 'q2', 'q3', 'q4', 'q5'].every(q => pendDone.has('qb:' + q) && /^\d{4}-\d{2}-\d{2}$/.test(prefs.qbSkipped[q]))));

  ok('a skipped line does NOT come back from qb-costs.json — a new one still does', await page.evaluate(() => {
    pendDone.clear();   // the 300-ring rolled over, or a reinstall — prefs still know
    qbCosts = { fieldEraStart: '2026-07-21', lines: [
      { qid: 'q1', d: '2026-07-21', amt: 228.43, who: 'Intuit', memo: '' },
      { qid: 'q2', d: '2026-07-22', amt: 50000, who: 'Insulated Concrete Solutions, LLC', memo: '' },
      { qid: 'qNEW', d: '2026-09-06', amt: 44.1, who: 'Speedway', memo: '' } ] };
    qbVerifySweep();
    const qbs = pendingQueue.filter(p => p.kind === 'qb').map(p => p.payload.qid);
    return JSON.stringify(qbs) === '["qNEW"]';
  }));
  await page.evaluate(() => { pendingQueue = pendingQueue.filter(p => p.kind !== 'qb'); renderReview(); });

  ok('nothing was logged by the skip — his log is still empty', await page.evaluate(() => entries.length === 0));

  // ── the quiet-job nags ──
  ok('✕ CLEAR ALL nags: the three radar cards go, the plain to-do STAYS', await page.evaluate(() => {
    revBulk('nag'); revBulk('nag');
    const todos_ = pendingQueue.filter(p => p.kind === 'todo');
    return pendingQueue.length === 6 && todos_.length === 1 && todos_[0].id === 'todo:plain1' && todos.length === 0;
  }));

  // ── the texts ──
  ok('📚 PILE ALL texts: each is on the log under its sender, and its file leaves the Inbox', await page.evaluate(() => {
    revBulk('text'); revBulk('text');
    const notes = entries.filter(e => /^Text from \+1/.test(e.details || ''));
    // a bare phone number is a junky tag by the app's own rule (tagLooksJunky), so the sender
    // rides in the WORDS — "Text from +1208…" — exactly as one tap of 📚 Pile it does today
    return pendingQueue.filter(p => p.kind === 'text').length === 0 && notes.length === 2 &&
      notes.some(e => /^Text from \+12083390772: .*clear coating/.test(e.details)) &&
      notes.some(e => /^Text from \+19072524305: .*Ashman job/.test(e.details)) &&
      window._moves.filter(p => /inbox\/text -/.test(p)).length === 2;
  }), await page.evaluate(() => JSON.stringify({ n: entries.length, moves: window._moves })));

  // ── the crew notes ──
  ok('✓ LOG ALL crew: each note lands on the log under Phil', await page.evaluate(() => {
    revBulk('crew'); revBulk('crew');
    const ph = entries.filter(e => /^Phil: /.test(e.details || '') && e.who === 'Phil');
    return pendingQueue.filter(p => p.kind === 'crew').length === 0 && ph.length === 2 && ph.some(e => /paid for Carrick/.test(e.details));
  }));

  ok('the email is still there, untouched by every sweep, and the plate is gone under 6', await page.evaluate(() => {
    const left = pendingQueue.map(p => p.kind).sort().join(',');
    return left === 'mail,todo' && !$('revBulk') && /2 waiting/.test($('revBox').textContent);
  }), await page.evaluate(() => pendingQueue.map(p => p.id).join(' | ')));

  ok('the queue was saved back after the sweeps — the app owns removal', await page.evaluate(() => window._saves >= 4));

  // ── a single ✕ on a QuickBooks card records the same durable skip ──
  ok('tapping ✕ on ONE QuickBooks card also remembers it in qbSkipped', await page.evaluate(() => {
    pendingQueue.push({ id: 'qb:q9', kind: 'qb', payload: { qid: 'q9', d: '2026-09-01', amt: 10, who: 'WalMart', memo: '', acct: '' } });
    reviewAct('qb:q9', false);
    return !pendingQueue.some(p => p.id === 'qb:q9') && !!prefs.qbSkipped.q9;
  }));

  ok('the plate never shows for a couple of cards (under 6)', await page.evaluate(() => {
    pendingQueue = [1, 2, 3].map(i => ({ id: 'qb:s' + i, kind: 'qb', payload: { qid: 's' + i, d: '2026-09-01', amt: 1, who: 'x', memo: '', acct: '' } }));
    renderReview();
    return !$('revBulk');
  }));

  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v6.45') && document.querySelector('footer').textContent.includes(APP_VER);
  }));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  // ── 👷 a crew phone never gets the plate (real reload) ──
  const ctx2 = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const p2 = await ctx2.newPage();
  await p2.addInitScript(() => { try { localStorage.setItem('daylog-crew-name', 'Phil'); } catch (e) {} });
  await p2.goto(appUrl); await p2.waitForTimeout(700);
  ok('a CREW phone never sees the sort-the-pile plate', await p2.evaluate(() => {
    pendingQueue = Array.from({ length: 8 }, (_, i) => ({ id: 'qb:c' + i, kind: 'qb', payload: { qid: 'c' + i, d: '2026-09-01', amt: 1, who: 'x', memo: '', acct: '' } }));
    return CREW_NAME === 'Phil' && renderRevBulk() === '';
  }));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
