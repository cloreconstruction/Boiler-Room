// v7.22 — Eric, with a picture of 🎒 POCKET — not done on his phone: "The 'Just Me' and 'All Crew' buttons could be shrunk by
// width and all made on one line and the green outline around the Done button, I think, is confusing. Does that mean it's
// already done, or is it just a green outline? … I think a gray outline to match will work. On the [pocket item], if I push
// Just Phil right now, what happens? Show what would come up on his phone." The last one is rehearsed here end to end: his
// phone writes Crew/Phil/shared.json into a fake Dropbox, a real reload as Phil reads it. Names and words are made up.
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

  // ───────────────────────── Eric's phone ─────────────────────────
  const { ctx, page } = await open();
  await page.evaluate(() => {
    jobs = ['Oak House', 'Pine Cabin']; crew = ['Phil', 'Kevin']; prefs.office = ['Phil']; entries = []; todos = []; nextId = 1; pendingQueue = []; pendDone.clear();
    window.scheduleSave = () => {}; window.savePendingSoon = () => {};
    window._writes = {}; window.dbxUpload = async (p, b) => { _writes[p] = typeof b === 'string' ? b : await new Response(b).text(); return { path_display: p }; };
    window.dbxDownload = async () => null; window.dbxList = async () => ({ entries: [] }); window.dbxPathExists = async () => false;
    dbx.refreshToken = 'tok';
    renderJobSelects(); closePanels(); renderAll();
    prefs.pocketMax = 8; prefs.pocket = [];
    entries.unshift({ id: 900, ts: new Date(Date.now() - 3600e3), type: 'Note', details: '🎒 Not done — check the thermostats at the cabin', job: '—', tags: ['pocket'], pocket: 'swept', noSniff: true });
    renderPocket(); openReview('summary'); if (_sumSec !== 'pocket') sumSecTap('pocket');   // the page opens ON the pocket — a tap would fold it
    window._row = () => [...document.querySelectorAll('#revBox .rev-sec-body[data-sec="pocket"] .sum-line')].find(l => /thermostats/.test(l.textContent));
  });

  console.log('— ⚙ the four TO THE GRINDER plates on ONE line; ✓ Done in gray —');
  const m = await page.evaluate(() => {
    const row = _row(), sends = [...row.querySelectorAll('.pk-send')], acts = [...row.querySelectorAll('.pk-acts .pk-mini')];
    const r = b => b.getBoundingClientRect(), tops = new Set(sends.map(b => Math.round(r(b).top)));
    const edge = b => getComputedStyle(b).borderTopColor + ' ' + getComputedStyle(b).borderTopWidth + ' ' + getComputedStyle(b).borderTopStyle;
    return { n: sends.length, oneLine: tops.size === 1, widths: sends.map(b => Math.round(r(b).width)), fit: sends.every(b => b.scrollWidth <= b.clientWidth + 1 && b.scrollHeight <= b.clientHeight + 1),
      words: sends.map(b => [...b.children].map(c => c.textContent.trim()).join(' ')), done: edge(acts[2]), today: edge(acts[0]), tomorrow: edge(acts[1]),
      doneWord: acts[2].textContent.replace(/\s+/g, ' ').trim(), page: $('revBox').scrollWidth <= $('revBox').clientWidth + 1 && document.documentElement.scrollWidth <= document.documentElement.clientWidth };
  });
  ok('🔒 Just me · 📨 Just Phil · 🔓 All crew · ⚠ Needs attention sit on ONE line at phone width, each a real plate (60px+), the words inside their plates, nothing off the edge', m.n === 4 && m.oneLine && m.widths.every(w => w >= 60) && m.fit && m.page && m.words.join('|') === '🔒 Just me|📨 Just Phil|🔓 All crew|⚠ Needs attention', JSON.stringify(m));
  ok('✓ Done wears the SAME gray edge as ↩ Today and ➡ Tomorrow — no green that could read as "already done"; the ✓ and the word still say what it does', m.done === m.today && m.done === m.tomorrow && !/rgb\(46, 125, 50\)|rgb\(143, 214, 148\)/.test(m.done) && /✓\s*Done/.test(m.doneWord), JSON.stringify(m));

  console.log('— 📨 Just Phil on a leftover: what happens on Eric\'s phone —');
  const g = await page.evaluate(() => {
    _row().querySelector('.pk-send[data-v="buddy"]').click();
    return { shut: !$('revModal').classList.contains('show'), box: $('askText').value, vis: [...qnVisNames], ask: !!qnAsk, chips: $('qnVisChips').textContent.replace(/\s+/g, ' ').trim(), sent: entries.find(x => x.id === 900).pocket };
  });
  ok('the tap does NOT send: the Summary shuts, the words sit in ② SAY IT, ⑤ reads ✓ 📨 Just Phil, ⚠ is off — and the note is still a leftover until he SENDs', g.shut && g.box === 'check the thermostats at the cabin' && g.vis.join() === 'Phil' && !g.ask && /✓ 📨 Just Phil/.test(g.chips) && g.sent === 'swept', JSON.stringify(g));
  const out = await page.evaluate(async () => {
    qnJobPick = 'Pine Cabin'; $('qnJob').value = 'Pine Cabin';
    const n0 = entries.length; saveNoteFrom('askText'); await publishSharedNotes();
    const e = entries.find(x => x.id === 900), key = Object.keys(_writes).find(p => /Crew\/Phil\/shared\.json$/.test(p));
    const kev = Object.keys(_writes).find(p => /Crew\/Kevin\/shared\.json$/.test(p));
    return { n: entries.length - n0, note: { d: e.details, job: e.job, vis: e.vis, pocket: e.pocket, sent: e.pocketSent }, key, shared: _writes[key] || '', kevinHasIt: /thermostats/.test(_writes[kev] || ''), left: pocketLeftList().some(x => x.id === 900) };
  });
  ok('SEND: the SAME note is updated in place (no second copy) — the job, 📨 Phil, off the leftovers — and Eric\'s phone writes it into Crew/Phil/shared.json, NOT Kevin\'s', out.n === 0 && out.note.d === 'check the thermostats at the cabin' && out.note.job === 'Pine Cabin' && out.note.vis === 'Phil' && out.note.pocket === 'sent' && out.note.sent === true && !!out.key && /thermostats/.test(out.shared) && !out.kevinHasIt && !out.left, JSON.stringify({ ...out, shared: out.shared.slice(0, 80) }));
  await ctx.close();

  // ───────────────────────── Phil's phone ─────────────────────────
  console.log('— 📱 what comes up on Phil\'s phone —');
  const phil = await open(() => { try { localStorage.setItem('daylog-crew-name', 'Phil'); localStorage.setItem('daylog-crew-root', '/Phil'); localStorage.setItem('daylog-crew-jobs', JSON.stringify(['Oak House', 'Pine Cabin'])); } catch (e) {} });
  const seen = await phil.page.evaluate(async body => {
    window.scheduleSave = () => {}; window.savePendingSoon = () => {};
    window.dbxUpload = async () => ({}); window.dbxDownload = async p => /\/shared\.json$/.test(p) ? body : null; window.dbxList = async () => ({ entries: [] });
    dbx.refreshToken = 'tok'; entries = [];
    await checkSharedNotes(); renderCrewShared();
    const card = $('crewSharedCard'), t = card.textContent.replace(/\s+/g, ' ').trim();
    const row = [...card.querySelectorAll('*')].find(el => el.children.length && /thermostats/.test(el.textContent) && !/FROM ERIC/.test(el.textContent)) || card;
    return { shown: card.style.display !== 'none', head: /FROM ERIC/.test(t), words: /check the thermostats at the cabin/.test(t), job: /Pine Cabin/.test(t), tag: /pocket/.test(t), done: /✓ Done — tell Eric/.test(t), notes: /✎ Add your notes/.test(t), asks: !!document.querySelector('#crewAskCard') && $('crewAskCard').style.display !== 'none' && /thermostats/.test($('crewAskCard').textContent), t: t.slice(0, 300) };
  }, out.shared);
  ok('his FROM ERIC card shows it — the words, the job, 🏷 pocket, ✎ Add your notes and ✓ Done — tell Eric; it is NOT on his "Eric needs an answer" card (⚠ was off)', seen.shown && seen.head && seen.words && seen.job && seen.tag && seen.done && seen.notes && !seen.asks, JSON.stringify(seen));
  await phil.ctx.close();

  ok('version bumped — APP_VER and the footer agree', /const APP_VER = 'v7\.(2[2-9]|[3-9]\d)'/.test(src) && new RegExp('<footer>' + (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1].replace('.', '\\.')).test(src));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
