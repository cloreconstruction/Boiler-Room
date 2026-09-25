// v7.17 — (1) Eric: "No longer relevant. Button doesn't light up or do anything. I'm not sure if it's working." An answer opened
// again from the running log's 🧙 row (after a reload — loading v7.16 was one) came up without the app knowing which answer it
// was, so ✕ had no line to mark and did nothing. (2) Eric: "i think notes should be searched first yes" — his own notes ahead of
// texts and emails in what the Wizard reads. Names and words are made up.
const { chromium } = require('playwright');
(async () => {
  const appUrl = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };
  const errs = [];
  const open = async (width, init, arg) => {
    const ctx = await browser.newContext({ viewport: { width, height: width < 700 ? 844 : 900 }, isMobile: width < 700, hasTouch: width < 700 });
    await ctx.route(u => !/^file:/.test(u.href), r => r.abort());
    if (init) await ctx.addInitScript(init, arg);   // the page cannot see this file's variables — what it needs rides in as arg
    const page = await ctx.newPage();
    page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
    await page.goto(appUrl); await page.waitForTimeout(700);
    return { ctx, page };
  };
  const MD = 'This week:\n- Call the tile guy back\n- Trailer moves Tuesday\n- Order trim for Pine';
  // what his phone holds after a reload: the answer in the running log's recent answers AND kept in the Wizard's log — no _lastAnswer
  const seed = md => { try {
    localStorage.setItem('daylog-answers', JSON.stringify([{ q: 'summary of the week', a: md, ts: new Date().toISOString() }]));
    localStorage.setItem('daylog-wizlog', JSON.stringify([
      { at: '2026-09-25T20:00:00.000Z', q: 'what is due friday', a: 'Nothing is due Friday.', ids: [], by: 'test' },   // a NEWER kept answer
      { at: '2026-09-25T18:00:00.000Z', q: 'summary of the week', a: md, ids: [], by: 'test' }]));
  } catch (e) {} };

  for (const w of [1280, 390]) {
    const { ctx, page } = await open(w, seed, MD);
    console.log(`— ✕ (1) reopened from the running log, ${w}px —`);
    await page.evaluate(() => { window.scheduleSave = () => {}; window.wizLogSave = () => {}; closePanels(); });
    ok('fresh from a reload the app knows no answer yet (the state Eric was in)', await page.evaluate(() => _lastAnswer === null || _lastAnswer === undefined));
    await page.evaluate(() => reopenAnswer(0));
    await page.locator('#wizFullBody .wl-line[data-i="1"] .wl-gone').click();
    const a = await page.evaluate(() => { const l = document.querySelector('#wizFullBody .wl-line[data-i="1"]');
      return { struck: l.classList.contains('is-gone'), plate: l.querySelector('.wl-gone').innerText.replace(/\s+/g, ' ').trim(), note: (l.nextElementSibling || {}).textContent || '', pend: _wizPend.length, keep: (_lastAnswer || {}).keep }; });
    ok('a real tap on ✕ lights it: the line strikes through, says OFF THE LIST, and the plate turns to ↩ Keep it', a.struck && a.plate === '↩ Keep it' && /OFF THE LIST — not saved yet/.test(a.note) && a.pend === 1, JSON.stringify(a));
    ok('…and it opened the KEPT copy of that answer (the same words), so the save lands on the right one', a.keep === '2026-09-25T18:00:00.000Z', JSON.stringify(a));
    const s = await page.evaluate(() => { wizPendSave(false); const rows = wizLog();
      return { gone: (prefs.wizGone || []).map(g => g.line), onRight: (rows.find(r => r.at === '2026-09-25T18:00:00.000Z').fix || []).some(f => /NO LONGER RELEVANT/.test(f.t)), onNewest: !!(rows.find(r => r.at === '2026-09-25T20:00:00.000Z').fix || []).length }; });
    ok('saved: on the Wizard\'s list, on THAT kept answer — not on the newest one', JSON.stringify(s.gone) === JSON.stringify(['- Call the tile guy back']) && s.onRight && !s.onNewest, JSON.stringify(s));
    await ctx.close();
  }

  const { ctx, page } = await open(390, () => { try {
    localStorage.setItem('daylog-answers', JSON.stringify([{ q: 'old question', a: '- Old line one\n- Old line two', ts: new Date().toISOString() }]));
    localStorage.setItem('daylog-wizlog', JSON.stringify([{ at: '2026-09-25T20:00:00.000Z', q: 'what is due friday', a: 'Nothing is due Friday.', ids: [], by: 'test' }]));
  } catch (e) {} });
  await page.evaluate(() => { window.scheduleSave = () => {}; window.wizLogSave = () => {}; window._said = []; const t0 = window.toast; window.toast = (m, g) => { if (m) _said.push(String(m)); return t0(m, g); }; closePanels(); });
  ok('an answer with NO kept copy still works — the tap lights the line — and saving puts nothing on another answer', await page.evaluate(async () => {
    reopenAnswer(0);
    document.querySelector('#wizFullBody .wl-line[data-i="0"] .wl-gone').click();
    const lit = !!document.querySelector('#wizFullBody .wl-line[data-i="0"].is-gone');
    wizPendSave(false);
    return lit && prefs.wizGone[0].line === '- Old line one' && !(wizLog()[0].fix || []).length;
  }));
  ok('a tap that cannot find its line is never silent — it says so', await page.evaluate(() => {
    _lastAnswer = { q: '', text: '', lines: [] }; _said.length = 0; wizLineGone(5);
    return /Could not read that line/.test(_said.join(' '));
  }));

  console.log('— 📝 (2) his notes are searched first —');
  const ctxRows = () => page.evaluate(() => { const c = buildAskContext('anything new'); const s = c.slice(c.indexOf('RECENT LOG (')); return JSON.parse(s.slice(s.indexOf('): [') + 3)).map(r => String(r.x || '')); });
  await page.evaluate(() => {
    const now = Date.now(); entries = [];
    for (let i = 0; i < 100; i++) entries.push({ id: 1000 + i, ts: new Date(now - i * 60e3), type: 'Note', details: `Text from Bo: text ${i}`, job: '—', texted: true });
    for (let i = 0; i < 50; i++) entries.push({ id: 2000 + i, ts: new Date(now - (i + 5) * 60e3), type: 'Note', details: `Email from Supplier: mail ${i}`, job: '—', mail: { from: 'x' } });
    for (let i = 0; i < 30; i++) entries.push({ id: 3000 + i, ts: new Date(now - (i * 90 + 30) * 60e3), type: 'Note', details: `my note ${i}`, job: 'Oak House' });
  });
  const rows = await ctxRows();
  ok('his own notes lead what the Wizard reads — all 30 of them, newest first — though 150 texts and emails are newer', rows.slice(0, 30).every((x, i) => x === 'my note ' + i), JSON.stringify(rows.slice(0, 5)));
  ok('then the newest texts and emails — 40 of them, not 108', rows.length === 70 && rows.slice(30).every(x => /^(Text|Email) from/.test(x)), 'rows ' + rows.length);
  ok('in a word search, at the same score his note comes before a text', await page.evaluate(() => {
    const t = { id: 1, ts: new Date(), type: 'Note', details: 'Text from Bo: zzqword', texted: true }, n = { id: 2, ts: new Date(Date.now() - 864e5), type: 'Note', details: 'my zzqword note' };
    return askSweep([t, n], ['zzqword'], null, 5).map(e => e.id).join(',') === '2,1';
  }));
  ok('the Wizard is told the order: his notes first, then texts and emails', await page.evaluate(() => /RECENT LOG \(his own notes and records first, newest first; then the newest texts and emails/.test(buildAskContext('anything new'))));
  await ctx.close();

  ok('no page errors', errs.length === 0, errs.join(' | '));
  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close(); process.exit(fail ? 1 : 0);
})();
