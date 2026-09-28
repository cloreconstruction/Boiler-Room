// v7.33 — THE RESPOND THREAD. Eric: "on the 'from eric' and 'from phil' should have these buttons: 'open the picture', 'flush to
// the grinder' … take out 'done tell eric' and instead have a 'respond' button … the item will stay on both from eric and from
// phil on both pages and the response will come up and it can go back and forth … cube lights, first one lights up and pulses
// when there is a response … second one is when the other person flushes to grinder … once both have flushed to grinder it
// comes off" — "go on the thread, yes to all 4". Names, jobs and words made up. Eric's phone first (a faked crew folder), then
// a real reload as Phil (a faked shared.json).
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { fileURLToPath } = require('url');
(async () => {
  const appUrl = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const repo = path.dirname(fileURLToPath(appUrl));
  const src = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };
  const errs = [];
  const open = async init => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await ctx.route(u => !/^file:/.test(u.href), r => r.abort());
    if (init) await ctx.addInitScript(init);
    const page = await ctx.newPage();
    page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
    await page.goto(appUrl); await page.waitForTimeout(700);
    return { ctx, page };
  };
  const rowsOf = sel => `[...document.querySelectorAll('${sel} .sum-row')].map(r => r.textContent.replace(/\\s+/g, ' ').trim())`;

  console.log('— 💬 Eric\'s phone: WITH PHIL —');
  const eric = await open();
  await eric.page.evaluate(() => {
    window.scheduleSave = () => {}; window.savePendingSoon = () => {}; window.setAck = () => {};
    entries = []; todos = []; pendingQueue = []; jobs = ['Oak House']; crew = ['Phil']; prefs.office = ['Phil']; prefs.crewCfg716 = true; prefs.crewFeedGone = []; prefs.thSeen = {}; nextId = 100;
    renderJobSelects(); closePanels(); renderAll();
    dbx.refreshToken = 'tok';
    window._up = {}; window.dbxUpload = async (p, b) => { _up[p] = b; return {}; };
    window._said = []; const t0 = window.toast; window.toast = (m, g) => { if (m) _said.push(String(m)); return t0(m, g); };
    const m = n => new Date(Date.now() - n * 60000), iso = n => m(n).toISOString();
    entries = [
      { id: 5, ts: m(175), type: 'Note', details: 'Soffit color — tan or gray?', job: 'Oak House', vis: 'Phil', ask: true },
      { id: 6, ts: m(240), type: 'Note', details: 'Pick the soffit color', job: 'Oak House', vis: 'Phil' },
      { id: 7, ts: m(50), type: 'Note', details: '↩ Use the tan', job: 'Oak House', vis: 'Phil', re: { owner: 'Phil', id: 30 }, noSniff: true },
      { id: 8, ts: m(120), type: 'Note', details: '↩ ok', job: 'Oak House', vis: 'Phil', re: { owner: 'Phil', id: 35 }, noSniff: true }];
    window._phil = [
      { id: 30, ts: iso(60), type: 'Note', details: 'Need the gate code for Oak', job: 'Oak House', vis: 'Eric', route: 'Eric', urg: 'now' },
      { id: 31, ts: iso(90), type: 'Note', details: 'Trim delivered', job: 'Oak House', vis: 'Eric' },
      { id: 32, ts: iso(40), type: 'Note', details: '↩ Yes, tan is fine', job: 'Oak House', vis: 'Eric', re: { owner: 'Eric', id: 5 } },
      { id: 33, ts: iso(30), type: 'Note', details: 'Eric: Pick the soffit color', job: 'Oak House', sharedRef: 6, who: 'Eric' },
      { id: 34, ts: iso(20), type: 'Note', details: '↩ Thanks', job: 'Oak House', vis: 'Eric', re: { owner: 'Phil', id: 30 } },
      { id: 35, ts: iso(180), type: 'Note', details: 'Done with the trim', job: 'Oak House', vis: 'Eric', threadDone: iso(60) }];
    window._save = () => { window._files = { '/clore daylog/crew/phil/app data/entries.json': JSON.stringify({ entries: _phil }) }; }; _save();
    window.dbxList = async () => ({ entries: [{ '.tag': 'folder', name: 'Phil', path_lower: '/clore daylog/crew/phil', path_display: '/Clore DayLog/Crew/Phil' }] });
    window.dbxDownload = async p => window._files[p] ?? null;
  });
  await eric.page.evaluate(async () => { await checkCrewLogs(); });
  ok('the sweep: Phil\'s response closes the open ⚠ ask (askDone); his flushed copy (sharedRef) marks the note seen by Phil; neither becomes a Sort card — his three plain notes do', await eric.page.evaluate(() => {
    const has = id => pendingQueue.some(p => new RegExp('^crew:Phil:' + id + ':').test(p.id));
    return !!entries.find(e => e.id === 5).askDone && !!(entries.find(e => e.id === 6).seenBy || {}).Phil && !has(32) && !has(33) && !has(34) && has(30) && has(31) && has(35);
  }), await eric.page.evaluate(() => JSON.stringify({ cards: pendingQueue.map(p => p.id), e5: entries.find(e => e.id === 5), e6: entries.find(e => e.id === 6) })));
  ok('the card reads WITH PHIL; ⚠ first, then newest: Phil\'s ⚠ note, Trim delivered, Eric\'s own two-sided note (you → Phil), Phil\'s flushed one', await eric.page.evaluate(() => {
    const rows = [...document.querySelectorAll('#crewFeedList .sum-row')].map(r => r.textContent.replace(/\s+/g, ' ').trim());
    return /👷 WITH PHIL — /.test($('cfFoldBtn').textContent) && rows.length === 4 && /⚠ NEEDS YOUR ATTENTION/.test(rows[0]) && /gate code/.test(rows[0]) && /Trim delivered/.test(rows[1]) && /you → Phil/.test(rows[2]) && /Soffit color/.test(rows[2]) && /Done with the trim/.test(rows[3]);
  }), await eric.page.evaluate(() => JSON.stringify([...document.querySelectorAll('#crewFeedList .sum-row')].map(r => r.textContent.replace(/\s+/g, ' ').trim().slice(0, 90)))));
  ok('Phil\'s ⚠ note carries the back-and-forth (↩ you: Use the tan · ↩ Phil: Thanks); cube ① lit and PULSING (his Thanks is newer than my last word), cube ② unlit, the words say so; the plates read 📷-less · ⤵ Flush to the grinder · 💬 Respond', await eric.page.evaluate(() => {
    const row = [...document.querySelectorAll('#crewFeedList .sum-row')][0], t = row.textContent.replace(/\s+/g, ' ');
    const cubes = row.querySelectorAll('.th-cube'), btns = [...row.querySelectorAll('button')].map(b => b.textContent.trim());
    return /↩ you .*Use the tan/.test(t) && /↩ Phil .*Thanks/.test(t) && cubes.length === 2 && cubes[0].classList.contains('lit') && cubes[0].classList.contains('pulse') && !cubes[1].classList.contains('lit') && /↩ Phil responded — new/.test(t) &&
      btns.includes('⤵ Flush to the grinder') && btns.includes('💬 Respond') && !btns.some(b => /Add your notes|tell Eric/.test(b));
  }), await eric.page.evaluate(() => [...document.querySelectorAll('#crewFeedList .sum-row')][0].outerHTML.slice(0, 900)));
  ok('Phil\'s flushed note: cube ② lit (⤵ Phil flushed it), cube ① unlit (no response from him — mine does not count)', await eric.page.evaluate(() => {
    const row = [...document.querySelectorAll('#crewFeedList .sum-row')][3], cubes = row.querySelectorAll('.th-cube');
    return cubes.length === 2 && !cubes[0].classList.contains('lit') && cubes[1].classList.contains('lit') && /⤵ Phil flushed it/.test(row.textContent);
  }));
  ok('Eric\'s own note on the card: Phil\'s response under it, cube ① lit and pulsing, plates ⤵ Flush — done with it · 💬 Respond', await eric.page.evaluate(() => {
    const row = [...document.querySelectorAll('#crewFeedList .sum-row')][2], t = row.textContent.replace(/\s+/g, ' '), cubes = row.querySelectorAll('.th-cube'), btns = [...row.querySelectorAll('button')].map(b => b.textContent.trim());
    return /↩ Phil .*Yes, tan is fine/.test(t) && cubes[0].classList.contains('lit') && cubes[0].classList.contains('pulse') && !cubes[1].classList.contains('lit') && btns.includes('⤵ Flush — done with it') && btns.includes('💬 Respond');
  }));
  ok('💬 Respond on Phil\'s note: a box under it; ↩ Send makes a note in Eric\'s log with re → Phil:30, unlocked for Phil, ↩ in front of the words; the pulse rests; the thread shows ↩ you', await eric.page.evaluate(async () => {
    const row = [...document.querySelectorAll('#crewFeedList .sum-row')][0];
    [...row.querySelectorAll('button')].find(b => /💬 Respond/.test(b.textContent)).click();
    const ta = $('thT-Phil-30'); if (!ta) return false; ta.value = 'Try 4321';
    document.querySelector('#thBox-Phil-30 .th-send').click(); await new Promise(r => setTimeout(r, 60));
    const e = entries.find(x => /Try 4321/.test(x.details));
    const row2 = [...document.querySelectorAll('#crewFeedList .sum-row')].find(r => /gate code/.test(r.textContent));
    return !!e && e.details === '↩ Try 4321' && e.re && e.re.owner === 'Phil' && e.re.id === 30 && e.vis === 'Phil' && e.job === 'Oak House' && !!prefs.thSeen['Phil:30'] &&
      row2.querySelector('.th-cube').classList.contains('lit') && !row2.querySelector('.th-cube').classList.contains('pulse') && /↩ you .*Try 4321/.test(row2.textContent.replace(/\s+/g, ' '));
  }), await eric.page.evaluate(() => JSON.stringify({ e: entries.slice(0, 1), said: _said.slice(-2) })));
  ok('⤵ Flush on Phil\'s note: ONE entry in Eric\'s log with both sides\' words (Phil: … ↩ Eric: Use the tan ↩ Phil: Thanks ↩ Eric: Try 4321); the item STAYS on the card (two-sided, Phil has not flushed) reading ⤵ flushed by you ✓; shared.json now tells Phil it was seen and carries Eric\'s responses attached', await eric.page.evaluate(async () => {
    const row = [...document.querySelectorAll('#crewFeedList .sum-row')].find(r => /gate code/.test(r.textContent));
    row.querySelector('.cf-flush').click(); await new Promise(r => setTimeout(r, 60)); await publishSharedNotes();
    const c = entries.find(x => /^Phil: Need the gate code for Oak/.test(x.details || ''));
    const row2 = [...document.querySelectorAll('#crewFeedList .sum-row')].find(r => /gate code/.test(r.textContent));
    const upKey = Object.keys(_up).find(p => /\/Phil\/shared\.json$/i.test(p)); const sh = JSON.parse((upKey && _up[upKey]) || '{}');
    const reRows = (sh.notes || []).filter(n => n.re && n.re.owner === 'Phil' && n.re.id === 30);
    return !!c && c.who === 'Phil' && /\n↩ Eric: Use the tan\n↩ Phil: Thanks\n↩ Eric: Try 4321$/.test(c.details) && !!row2 && /⤵ flushed by you ✓/.test(row2.textContent) &&
      sh.seen && !!sh.seen['30'] && reRows.length === 2 && (sh.notes || []).some(n => n.id === 5 && n.ask === 'answered');
  }), await eric.page.evaluate(() => JSON.stringify({ c: entries.find(x => /^Phil: Need/.test(x.details || '')), up: Object.keys(_up), sh: (() => { try { const s = JSON.parse(_up[Object.keys(_up).find(p => /\/Phil\/shared\.json$/i.test(p))]); return { seen: s.seen, notes: s.notes.map(n => [n.id, n.ask, n.re, n.done]) }; } catch (e) { return String(e); } })() })));
  ok('⤵ Flush — done with it on Eric\'s own note: threadDone stamped, the thread kept on the entry, the row stays until Phil flushes it; when his flushed copy arrives (sharedRef 5) the row leaves; and Phil flushing his own ⚠ note (threadDone) takes that row off too — the plain Trim note leaves on Eric\'s flush alone', await eric.page.evaluate(async () => {
    thOwnFlush('5'); await new Promise(r => setTimeout(r, 30));
    const e5 = entries.find(x => x.id === 5);
    const stays = !!e5.threadDone && Array.isArray(e5.thread) && e5.thread.some(t => t.by === 'Phil' && /tan is fine/.test(t.t)) && [...document.querySelectorAll('#crewFeedList .sum-row')].some(r => /Soffit color/.test(r.textContent) && /⤵ flushed by you ✓/.test(r.textContent));
    _phil.unshift({ id: 36, ts: new Date().toISOString(), type: 'Note', details: 'Eric: Soffit color — tan or gray?\n↩ Phil: Yes, tan is fine', job: 'Oak House', sharedRef: 5, who: 'Eric' });
    _phil.find(x => x.id === 30).threadDone = new Date().toISOString(); _save();
    await checkCrewLogs();
    const rows = () => [...document.querySelectorAll('#crewFeedList .sum-row')].map(r => r.textContent.replace(/\s+/g, ' '));
    const gone = !rows().some(t => /Soffit color/.test(t)) && !rows().some(t => /gate code/.test(t)) && rows().some(t => /Trim delivered/.test(t));
    const trim = [...document.querySelectorAll('#crewFeedList .sum-row')].find(r => /Trim delivered/.test(r.textContent)); trim.querySelector('.cf-flush').click(); await new Promise(r => setTimeout(r, 30));
    return stays && gone && !rows().some(t => /Trim delivered/.test(t)) && !!entries.find(x => x.details === 'Phil: Trim delivered');
  }), await eric.page.evaluate(() => JSON.stringify({ rows: [...document.querySelectorAll('#crewFeedList .sum-row')].map(r => r.textContent.replace(/\s+/g, ' ').slice(0, 60)), e5: entries.find(x => x.id === 5) })));
  await eric.ctx.close();

  console.log('— 👷 Phil\'s phone: WITH ERIC —');
  const phil = await open(() => { try { localStorage.setItem('daylog-crew-name', 'Phil'); localStorage.setItem('daylog-crew-root', '/Phil'); localStorage.setItem('daylog-crew-jobs', JSON.stringify(['Oak House'])); localStorage.removeItem('daylog-shared-flushed'); localStorage.removeItem('daylog-board-done'); } catch (e) {} });
  await phil.page.evaluate(async () => {
    window.scheduleSave = () => {}; window.savePendingSoon = () => {}; window.dbxUpload = async () => ({}); window.dbxList = async () => ({ entries: [] });
    const m = n => new Date(Date.now() - n * 60000), iso = n => m(n).toISOString();
    const body = JSON.stringify({ from: 'Eric', notes: [
      { id: 5, ts: iso(180), text: 'Soffit color — tan or gray?', job: 'Oak House', ask: 'open' },
      { id: 6, ts: iso(240), text: 'Pick the soffit color', job: 'Oak House', board: { p: 1, sub: [] } },
      { id: 7, ts: iso(50), text: '↩ Use the tan', job: 'Oak House', re: { owner: 'Phil', id: 12 } },
      { id: 9, ts: iso(300), text: 'a plain old note', job: 'Oak House' }],
      seen: { '12': iso(30) }, asks: [{ id: 5, q: 'Soffit color — tan or gray?', job: 'Oak House' }], acks: {}, todos: [], unlocks: [], cards: {} });
    window.dbxDownload = async p => /\/shared\.json$/.test(p) ? body : null;
    dbx.refreshToken = 'tok'; entries = [{ id: 12, ts: m(60), type: 'Note', details: 'Need the gate code for Oak', job: 'Oak House', vis: 'Eric', route: 'Eric', urg: 'now' }]; nextId = 50; prefs.crewFold = false; prefs.thSeen = {};
    window._said = []; const t0 = window.toast; window.toast = (m2, g) => { if (m2) _said.push(String(m2)); return t0(m2, g); };
    await checkSharedNotes(); renderCrewShared(); renderCrewAsks();
  });
  ok('the 📢 ERIC NEEDS AN ANSWER card draws nothing; the card reads WITH ERIC; ⚠ items first (my own ⚠ note, then Eric\'s open ⚠ one), Eric\'s response is NOT a row of its own; then the rest newest first', await phil.page.evaluate(() => {
    const rows = [...document.querySelectorAll('#crewSharedList .sum-row')].map(r => r.textContent.replace(/\s+/g, ' ').trim());
    return CREW_NAME === 'Phil' && $('crewAskCard').style.display === 'none' && /📨 WITH ERIC — showing/.test($('crFoldBtn').textContent) && rows.length === 4 && /YOU → ERIC/.test(rows[0]) && /⚠ NEEDS ERIC’S ATTENTION|⚠ NEEDS ERIC'S ATTENTION/.test(rows[0]) && /gate code/.test(rows[0]) &&
      /⚠ NEEDS YOUR ATTENTION · Soffit color/.test(rows[1]) && /Pick the soffit color/.test(rows[2]) && /plain old note/.test(rows[3]) && !rows.some(t => /^↩|📨 ↩ Use the tan/.test(t));
  }), await phil.page.evaluate(() => JSON.stringify([...document.querySelectorAll('#crewSharedList .sum-row')].map(r => r.textContent.replace(/\s+/g, ' ').trim().slice(0, 80)))));
  ok('my own ⚠ note: Eric\'s response under it (↩ Eric: Use the tan), cube ① lit + pulsing, cube ② lit (⤵ Eric flushed it — from `seen`), plates ⤵ Flush — done with it · 💬 Respond', await phil.page.evaluate(() => {
    const row = [...document.querySelectorAll('#crewSharedList .sum-row')][0], t = row.textContent.replace(/\s+/g, ' '), cubes = row.querySelectorAll('.th-cube'), btns = [...row.querySelectorAll('button')].map(b => b.textContent.trim());
    return /↩ Eric .*Use the tan/.test(t) && cubes.length === 2 && cubes[0].classList.contains('lit') && cubes[0].classList.contains('pulse') && cubes[1].classList.contains('lit') && /⤵ Eric flushed it/.test(t) && btns.includes('⤵ Flush — done with it') && btns.includes('💬 Respond');
  }), await phil.page.evaluate(() => [...document.querySelectorAll('#crewSharedList .sum-row')][0].outerHTML.slice(0, 900)));
  ok('Eric\'s rows: 📷 (none here) · ⤵ Flush to the grinder · 💬 Respond — no ✎ Add your notes, no ✓ Done — tell Eric', await phil.page.evaluate(() => {
    const btns = [...document.querySelectorAll('#crewSharedList .sum-row')].slice(1).flatMap(r => [...r.querySelectorAll('button')].map(b => b.textContent.trim()));
    return btns.filter(b => b === '⤵ Flush to the grinder').length === 3 && btns.filter(b => b === '💬 Respond').length === 3 && !btns.some(b => /Add your notes|tell Eric/.test(b));
  }), await phil.page.evaluate(() => JSON.stringify([...document.querySelectorAll('#crewSharedList button')].map(b => b.textContent.trim()))));
  ok('💬 Respond on Eric\'s ⚠ note: ↩ Send makes a note in MY log with re → Eric:5, unlocked for Eric, ↩ in front — no ✓ Done chip (not a Board line)', await phil.page.evaluate(async () => {
    const row = [...document.querySelectorAll('#crewSharedList .sum-row')][1];
    [...row.querySelectorAll('button')].find(b => /💬 Respond/.test(b.textContent)).click();
    const noDone = !document.querySelector('#thBox-Eric-5 .th-done');
    $('thT-Eric-5').value = 'Tan'; document.querySelector('#thBox-Eric-5 .th-send').click(); await new Promise(r => setTimeout(r, 40));
    const e = entries.find(x => x.details === '↩ Tan');
    return noDone && !!e && e.re && e.re.owner === 'Eric' && e.re.id === 5 && e.vis === 'Eric' && e.job === 'Oak House' && !e.mine && /↩ you .*Tan/.test([...document.querySelectorAll('#crewSharedList .sum-row')].find(r => /Soffit color/.test(r.textContent)).textContent.replace(/\s+/g, ' '));
  }), await phil.page.evaluate(() => JSON.stringify(entries.slice(0, 2))));
  ok('💬 Respond on a Board line has a ✓ Done chip: it sends ↩ ✓ Done carrying boardRef (Eric\'s Board line ticks off) and the row shows ✓ DONE', await phil.page.evaluate(async () => {
    const row = [...document.querySelectorAll('#crewSharedList .sum-row')].find(r => /Pick the soffit/.test(r.textContent));
    [...row.querySelectorAll('button')].find(b => /💬 Respond/.test(b.textContent)).click();
    const chip = document.querySelector('#thBox-Eric-6 .th-done'); if (!chip) return false; chip.click(); await new Promise(r => setTimeout(r, 40));
    const e = entries.find(x => /^↩ ✓ Done/.test(x.details || ''));
    const row2 = [...document.querySelectorAll('#crewSharedList .sum-row')].find(r => /Pick the soffit/.test(r.textContent));
    return !!e && String(e.boardRef) === '6' && e.re && e.re.owner === 'Eric' && e.re.id === 6 && e.vis === 'Eric' && /✓ DONE/.test(row2.textContent) && crewBoardDoneSet().has('6');
  }), await phil.page.evaluate(() => JSON.stringify(entries.slice(0, 2))));
  ok('⤵ Flush to the grinder on Eric\'s Board line: a copy in MY log — "Eric: Pick the soffit color ↩ Phil: ✓ Done" — carrying sharedRef 6 (Eric\'s phone reads it as seen); the row STAYS (two-sided, Eric has not flushed) reading ⤵ flushed by you ✓; the plain note leaves on my flush alone', await phil.page.evaluate(async () => {
    const row = [...document.querySelectorAll('#crewSharedList .sum-row')].find(r => /Pick the soffit/.test(r.textContent));
    row.querySelector('.th-flush').click(); await new Promise(r => setTimeout(r, 40));
    const c = entries.find(x => /^Eric: Pick the soffit color/.test(x.details || ''));
    const row2 = [...document.querySelectorAll('#crewSharedList .sum-row')].find(r => /Pick the soffit/.test(r.textContent));
    const plain = [...document.querySelectorAll('#crewSharedList .sum-row')].find(r => /plain old note/.test(r.textContent)); plain.querySelector('.th-flush').click(); await new Promise(r => setTimeout(r, 40));
    const c2 = entries.find(x => x.details === 'Eric: a plain old note');
    return !!c && String(c.sharedRef) === '6' && c.who === 'Eric' && /\n↩ Phil: ✓ Done$/.test(c.details) && !!row2 && /⤵ flushed by you ✓/.test(row2.textContent) &&
      !!c2 && String(c2.sharedRef) === '9' && ![...document.querySelectorAll('#crewSharedList .sum-row')].some(r => /plain old note/.test(r.textContent));
  }), await phil.page.evaluate(() => JSON.stringify({ e: entries.slice(0, 3).map(x => [x.details, x.sharedRef]), rows: [...document.querySelectorAll('#crewSharedList .sum-row')].map(r => r.textContent.replace(/\s+/g, ' ').slice(0, 60)) })));
  ok('⤵ Flush — done with it on my own ⚠ note (Eric already flushed it): threadDone stamped, the thread kept, and the row leaves the card', await phil.page.evaluate(async () => {
    const row = [...document.querySelectorAll('#crewSharedList .sum-row')].find(r => /gate code/.test(r.textContent));
    row.querySelector('.th-flush').click(); await new Promise(r => setTimeout(r, 40));
    const e = entries.find(x => x.id === 12);
    return !!e.threadDone && Array.isArray(e.thread) && e.thread.some(t => t.by === 'Eric') && ![...document.querySelectorAll('#crewSharedList .sum-row')].some(r => /gate code/.test(r.textContent));
  }));
  ok('a response entry, a flushed copy and my own notes all ride to Eric (none is 🔒 mine); the words on the log start with ↩', await phil.page.evaluate(() => entries.filter(e => e.re || e.sharedRef != null).every(e => !e.mine) && entries.filter(e => e.re).every(e => /^↩ /.test(e.details))));
  await phil.ctx.close();

  ok('version bumped — APP_VER and the footer agree', /const APP_VER = 'v7\.(3[3-9]|[4-9]\d)'/.test(src) && new RegExp('<footer>' + (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1].replace('.', '\\.')).test(src));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
