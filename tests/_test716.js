// v7.16 — ERIC'S LIST OF 2026-09-25. (1) "The pocket list needs to be separated from the grinder 5 steps. It's in the same bigger
// window." (2) "I don't think everything that I send to Phil looks like it's going into his drop box." (3) "Under the 'Eric needs
// an answer,' there can be a 'flush it' or 'log it' button." (4) "When I ask the wizard for a summary … I also need a button that
// says 'No longer relevant' or 'Delete'." (5) "The wizard's not coming up with very good answers." (6) "he had all my tags on step
// 4. Tag it … There's no reason he should have any personal tags from me." (7) "Phil did a photo entry. And the wizard tried to
// read it like a receipt and comes up with gibberish … if it's not a receipt, it gets just blank." Names and words are made up.
const { chromium } = require('playwright');
(async () => {
  const appUrl = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };
  const errs = [];
  const open = async (init, width) => {
    const w = width || 390;
    const ctx = await browser.newContext({ viewport: { width: w, height: w < 700 ? 844 : 900 }, isMobile: w < 700, hasTouch: w < 700 });
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
    renderJobSelects(); closePanels(); renderAll();
    dbx.refreshToken = 'tok';
  });

  console.log('— 🎒 (1) the pocket list is its own window —');
  ok('the pocket list is its own card, OUTSIDE the grinder card, right above it (still just above ①)', await page.evaluate(() => {
    const k = [...document.querySelector('.wrap').children].map(e => e.id).filter(Boolean);
    const pk = $('pocketCard');
    return pk.classList.contains('card') && !$('qnCard').contains(pk) && k.indexOf('pocketCard') === k.indexOf('scRow') + 1 && k.indexOf('qnCard') === k.indexOf('pocketCard') + 1;
  }));
  ok('…with its own edge and a gap before the grinder card', await page.evaluate(() => {
    const pk = $('pocketCard').getBoundingClientRect(), qn = $('qnCard').getBoundingClientRect();
    return qn.top - pk.bottom >= 10 && parseFloat(getComputedStyle($('pocketCard')).borderTopWidth) >= 1;
  }));

  console.log('— 📨 (2) everything Eric sends reaches Phil —');
  // a fake Dropbox: records every upload and copy; Phil's photos folder already holds old.jpg
  await page.evaluate(() => {
    window._up = {}; window._copies = []; window._copyAnswer = {};
    window.dbxUpload = async (p, body) => { _up[p] = body; return {}; };
    window.dbxDownload = async () => null;
    window.dbxList = async a => /\/phil\/photos$/i.test(a.path) ? { entries: [{ '.tag': 'file', name: 'old.jpg' }] } : { error_summary: 'path/not_found/..' };
    window.dbxRpc = async (ep, a) => { if (ep === 'files/copy_v2') { _copies.push(a.to_path); const f = a.to_path.split('/').pop(); return _copyAnswer[f] || { metadata: {} }; } return {}; };
    const day = 864e5, now = Date.now();
    const mk = (i, extra) => ({ id: 5000 - i, ts: new Date(now - i * 3600e3), type: 'Note', details: 'note ' + i, job: 'Oak House', vis: 'crew', ...extra });
    entries = [];
    for (let i = 0; i < 200; i++) entries.push(mk(i));
    for (let i = 0; i < 30; i++) entries.push({ ...mk(300 + i), vis: 'Kevin', details: 'kevin only ' + i });
    entries[100].photoPath = '/Clore DayLog/Job Notes/Oak House/Photos/old.jpg';   // past the 40th — its copy is already there
    entries[5].photoPath = '/Clore DayLog/Job Notes/Oak House/Photos/new.jpg';
    entries[6].photoPath = '/Clore DayLog/Job Notes/Oak House/Photos/bad.jpg';
    entries[7].photoPath = '/Clore DayLog/Job Notes/Oak House/Photos/dup.jpg';
    _copyAnswer['bad.jpg'] = { error_summary: 'from_lookup/not_found/..' };
    _copyAnswer['dup.jpg'] = { error_summary: 'to/conflict/file/..' };
    entries[3].ask = true; entries[3].askDone = new Date().toISOString(); entries[3].details = 'Did the trim come?';
    entries[4].ask = true; entries[4].details = 'Where is the ladder?';
    prefs.crewCfg716 = true;   // the one-time crew.json rewrite has its own check below
    for (const k in _sharedCache) delete _sharedCache[k];
    for (const k in _crewPhCache) delete _crewPhCache[k];
    for (const k in _crewPhHave) delete _crewPhHave[k];
  });
  await page.evaluate(() => publishSharedNotes());
  const sh = await page.evaluate(() => { const j = JSON.parse(_up['/Clore DayLog/Crew/Phil/shared.json'] || '{}'); return { n: (j.notes || []).length, notes: j.notes || [], asks: j.asks || [], copies: _copies.slice() }; });
  ok('Phil gets every note for him — 199 (the 200 less the one still open as a question); the list was the newest 120 for the WHOLE crew', sh.n === 199, 'notes: ' + sh.n);
  const row = id => sh.notes.find(n => n.id === id) || {};
  const philCopies = re => sh.copies.filter(p => /\/Crew\/Phil\/photos\//.test(p) && re.test(p));   // Kevin's folder gets its own copies
  ok('a note past the 40th points at the copy already in his photos folder — no second copy made', row(4900).ph === '/Clore DayLog/Crew/Phil/photos/old.jpg' && !philCopies(/old\.jpg$/).length, JSON.stringify(row(4900)));
  ok('a new photo is copied once and pointed at', row(4995).ph === '/Clore DayLog/Crew/Phil/photos/new.jpg' && philCopies(/new\.jpg$/).length === 1);
  ok('a copy Dropbox REFUSED is not counted as done (no dead picture link); "already there" is', !row(4994).ph && row(4993).ph === '/Clore DayLog/Crew/Phil/photos/dup.jpg');
  ok('an ANSWERED question joins his FROM ERIC log, marked; an open one rides only on the 📢 card', row(4997).ask === 'answered' && !sh.notes.some(n => n.id === 4996) && sh.asks.some(a => a.id === 4996));
  ok('new copies are capped per sweep (25), the next sweep carries on', await page.evaluate(async () => {
    for (let i = 0; i < 40; i++) entries[20 + i].photoPath = `/Clore DayLog/Job Notes/Oak House/Photos/p${i}.jpg`;
    _copies = []; for (const k in _sharedCache) delete _sharedCache[k];
    await publishSharedNotes(); const a = _copies.filter(p => /\/Crew\/Phil\/photos\/p\d+\.jpg$/.test(p)).length;
    _copies = []; for (const k in _sharedCache) delete _sharedCache[k];
    await publishSharedNotes(); const b = _copies.filter(p => /\/Crew\/Phil\/photos\/p\d+\.jpg$/.test(p)).length;
    return a === 25 && b === 15;
  }));
  ok('Phil\'s phone keeps up to 300 of them (it kept the newest 100)', await page.evaluate(() => CREW_NOTES_MAX === 300));

  console.log('— 🏷 (6) Eric\'s tags stay on Eric\'s phone —');
  ok('crew.json hands Phil only the tags on notes Eric SENT him — not Eric\'s list, never 🔒 Personal', await page.evaluate(() => {
    prefs.tags = ['Grandma', 'Fishing', 'Personal', 'Lists', 'Jason'];
    entries[0].tags = ['Lists', 'Jason']; entries[1].tags = ['Personal'];
    entries.push({ id: 7001, ts: new Date(), type: 'Note', details: 'dinner', job: 'Oak House', vis: 'crew', personal: true, tags: ['Grandma', 'Personal'] });
    const c = JSON.parse(crewCfgBody('Phil'));
    return JSON.stringify(c.tags) === JSON.stringify(['Lists', 'Jason']) && c.name === 'Phil' && Array.isArray(c.jobs) && !JSON.stringify(c).includes('Grandma');
  }));
  ok('ONCE, quietly: the next sweep writes every crew.json again (the old one carried Eric\'s whole list), then never again', await page.evaluate(async () => {
    prefs.crewCfg716 = false; _up = {};
    await publishSharedNotes();
    const a = Object.keys(_up).filter(p => /crew\.json$/.test(p)).sort().join('|');
    _up = {}; await publishSharedNotes();
    const b = Object.keys(_up).filter(p => /crew\.json$/.test(p)).length;
    return a === '/Clore DayLog/Crew/Kevin/crew.json|/Clore DayLog/Crew/Phil/crew.json' && prefs.crewCfg716 === true && b === 0;
  }));

  console.log('— 📢 (3) "seen — no answer needed" reaches Eric —');
  await page.evaluate(() => {
    entries = [{ id: 900, ts: new Date(), type: 'Note', details: 'The owner okayed moving the trailer', job: 'Oak House', vis: 'crew', ask: true }];
    pendingQueue = []; pendDone.clear();
    const philLog = [{ id: 31, ts: new Date().toISOString(), type: 'Note', details: '⤵ Seen — no answer needed: The owner okayed moving the trailer', job: 'Oak House', askRef: 900, askFlush: true }];
    window.dbxList = async () => ({ entries: [{ '.tag': 'folder', name: 'Phil', path_lower: '/clore daylog/crew/phil', path_display: '/Clore DayLog/Crew/Phil' }] });
    window.dbxDownload = async p => /\/phil\/app data\/entries\.json$/i.test(p) ? JSON.stringify({ entries: philLog }) : null;
    window.publishSharedNotes = () => {};
  });
  ok('Phil\'s flush closes the ask on Eric\'s phone as SEEN by Phil — no card in his sort pile, nothing on his FROM THE CREW card', await page.evaluate(async () => {
    await checkCrewLogs(); renderAskStrip();
    const e = entries.find(x => x.id === 900);
    return !!e.askDone && e.askFlush === 'Phil' && !pendingQueue.some(p => /^crew:Phil:31:/.test(p.id)) && !(_crewFeed.Phil || []).length
      && /✓ SEEN by Phil — no answer needed/.test($('askStrip').textContent);
  }));

  console.log('— ✕ (4) "No longer relevant" on a Wizard line —');
  await page.evaluate(() => {
    entries = [
      { id: 11, ts: new Date(), type: 'Note', details: 'Chafin wants a call back', job: 'Oak House' },
      { id: 12, ts: new Date(), type: 'Note', details: 'container moves Tuesday', job: 'Oak House' },
      { id: 13, ts: new Date(), type: 'Note', details: 'order trim for Pine', job: 'Pine Cabin' }];
    const md = '- Call Chafin back (entry 11)\n- Container moves Tuesday\n- Order trim for Pine';
    const row = wizKeep('summary of the week', md, [11, 12, 13], 'test');
    _lastAnswer = { q: 'summary of the week', text: md, md, srcIds: [11, 12, 13], at: Date.now(), keep: row.at };
    _wizPend = []; _wizPendCtx = null; prefs.wizGone = []; prefs.wizFixes = [];
    let host = $('t716'); if (!host) { host = document.createElement('div'); host.id = 't716'; document.body.appendChild(host); }
    host.innerHTML = wizLinesHtml(md);
  });
  ok('every line wears ✎ and a second plate: ✕ over "Delete" on the phone', await page.evaluate(() => {
    const lines = [...document.querySelectorAll('#t716 .wl-line')];
    return lines.length === 3 && lines.every(l => l.querySelector('.wl-x') && l.querySelector('.wl-gone')) &&
      getComputedStyle(document.querySelector('#t716 .wl-gone .wl-g-short')).display !== 'none' && getComputedStyle(document.querySelector('#t716 .wl-gone .wl-g-long')).display === 'none' &&
      /✕\s*Delete/.test(document.querySelector('#t716 .wl-gone').innerText.replace(/\s+/g, ' '));
  }));
  ok('a tap KEEPS it with his fixes: the line is struck through and says "✕ OFF THE LIST — not saved yet"; the plate turns to ↩ Keep it', await page.evaluate(() => {
    wizLineGone(0);
    const l = document.querySelector('#t716 .wl-line[data-i="0"]');
    const note = l.nextElementSibling;
    return _wizPend.length === 1 && _wizPend[0].gone && l.classList.contains('is-gone') && getComputedStyle(l.querySelector('.wl-t')).textDecorationLine.includes('line-through') &&
      /OFF THE LIST — not saved yet/.test(note.textContent) && /↩\s*Keep it/.test(l.querySelector('.wl-gone').innerText.replace(/\s+/g, ' ')) && l.querySelector('.wl-gone').getAttribute('aria-pressed') === 'true';
  }));
  ok('↩ Keep it takes it back; nothing was written', await page.evaluate(() => {
    wizLineGone(0);
    return _wizPend.length === 0 && !document.querySelector('#t716 .wl-line.is-gone') && !(prefs.wizGone || []).length;
  }));
  ok('saved: the line goes on the list the Wizard reads (LINES ERIC TOOK OFF HIS LISTS), ONE log note, and ONLY the entry the line names gets the mark', await page.evaluate(() => {
    wizLineGone(0); const before = entries.length;
    wizPendSave(false);
    const ctx = buildAskContext('what is open');
    const note = entries.find(e => /Correction — re "- Call Chafin back/.test(e.details || ''));
    return prefs.wizGone.length === 1 && prefs.wizGone[0].line === '- Call Chafin back (entry 11)' && ctx.includes('LINES ERIC TOOK OFF HIS LISTS') && ctx.includes('Call Chafin back (entry 11)') &&
      entries.length === before + 1 && !!note && /no longer relevant/.test(note.details) &&
      /NO LONGER RELEVANT/.test(entries.find(e => e.id === 11).ai || '') && !entries.find(e => e.id === 12).ai && !entries.find(e => e.id === 13).ai && !(prefs.wizFixes || []).length;
  }));
  ok('reopened, the saved line stays struck through and says it is off the list — no plate to take it off twice', await page.evaluate(() => {
    $('t716').innerHTML = wizLinesHtml(_lastAnswer.md);
    const l = document.querySelector('#t716 .wl-line[data-i="0"]');
    return l.classList.contains('is-gone') && !l.querySelector('.wl-gone') && /OFF THE LIST — you said it is no longer relevant/.test($('t716').textContent);
  }));

  console.log('— 🧙 (5) better answers —');
  ok('a line FIX lands only on the record the line names — not on every record the answer cited', await page.evaluate(() => {
    entries.forEach(e => delete e.ai);
    _lastAnswer.srcIds = [11, 12, 13];
    applyCorrection('he called back Monday', '- Call Chafin back (entry 11)', true);
    const a = !!entries.find(e => e.id === 11).ai && !entries.find(e => e.id === 12).ai && !entries.find(e => e.id === 13).ai;
    entries.forEach(e => delete e.ai);
    applyCorrection('it moves Wednesday', '- Container moves Tuesday', true);   // names no entry, three sources: no record is stamped
    const b = !entries.some(e => e.ai) && prefs.wizFixes[0].t === 'it moves Wednesday';
    _lastAnswer.srcIds = [12];
    applyCorrection('Wednesday', '- Container moves Tuesday', true);            // the answer's ONE record still gets it
    return a && b && /ERIC CORRECTED/.test(entries.find(e => e.id === 12).ai || '');
  }));
  ok('the words of ASKING are not searched: "bring up a list of what I need to talk to Logan about this week" searches for Logan only', await page.evaluate(() =>
    JSON.stringify(askTerms('bring up a list of what I need to talk to Logan about this week')) === '["logan"]'));
  ok('"the newest" is the newest by DATE — an old-dated note at the top of the book is not in it', await page.evaluate(() => {
    const now = Date.now();
    entries = [{ id: 1, ts: new Date(now - 40 * 864e5), type: 'Note', details: 'zzqold August marker', job: 'Oak House' }];
    for (let i = 0; i < 150; i++) entries.push({ id: 100 + i, ts: new Date(now - i * 60e3), type: 'Note', details: 'fresh ' + i, job: 'Oak House' });
    const ctx = buildAskContext('anything new');
    return !ctx.includes('zzqold') && ctx.includes('fresh 0');
  }));
  ok('a date span too big for the pool says how many made it — never "all of them are included"', await page.evaluate(() => {
    const now = new Date(); entries = [];
    for (let i = 0; i < 520; i++) entries.push({ id: 2000 + i, ts: new Date(now.getTime() - i * 1000), type: 'Note', details: 'today item ' + i, job: 'Oak House' });
    const ctx = buildAskContext('what happened this week');   // "today" is its own thing to the Wizard; a week is a span
    return /520 log entries exist in that span \(only \d+ of them fit in RECENT LOG below/.test(ctx) && !/520 log entries exist in that span \(all of them/.test(ctx);
  }));
  ok('a pocket leftover is on the Wizard\'s list once (POCKET NOT DONE), not again as a board line', await page.evaluate(() => {
    entries = [{ id: 3000, ts: new Date(), type: 'Note', details: '🎒 Flushed — buy zzqcaulk', job: '—', pocket: 'flushed', tags: ['pocket'] }];
    const ctx = buildAskContext('what is on my board');
    const board = ctx.split('BOARD — OPEN LINES')[1].split('BOARD — DONE THIS WEEK')[0];
    const left = ctx.split('POCKET NOT DONE')[1].split('BOARD — OPEN LINES')[0];
    return !board.includes('zzqcaulk') && left.includes('zzqcaulk');
  }));
  ok('a crew member\'s note logged into his book (⤵ Flush / ✓ Log it) is not a line on his board — unless he touched it', await page.evaluate(() => {
    const a = { id: 1, ts: new Date(), type: 'Note', details: 'Phil: ✅ FINISHED: siding done', job: 'Oak House', who: 'Phil', crewKey: 'crew:Phil:9:2026-09-25' };
    const b = { id: 2, ts: new Date(), type: 'Note', details: 'Phil: trim is here', job: 'Oak House', who: 'Phil' };
    const c = { id: 3, ts: new Date(), type: 'Note', details: 'Phil: call the inspector', job: 'Oak House', who: 'Phil', board: { p: 2, sub: [], at: '' } };
    const d = { id: 4, ts: new Date(), type: 'Note', details: 'my own thought', job: 'Oak House' };
    return !boardOn(a) && !boardOn(b) && boardOn(c) && boardOn(d);
  }));
  ok('the Wizard is told: a summary lists open items ONCE, leaves out what is done or taken off, cites only ids it was shown', await page.evaluate(() => {
    const src = String(askInstant);
    return /For a SUMMARY or a LIST of what is open: open items only, and each item ONCE/.test(src) && /every line in LINES ERIC TOOK OFF HIS LISTS/.test(src);
  }));

  console.log('— 📄 (7) a photo that is not paper reads as nothing —');
  ok('a jobsite picture\'s scramble (no word Tesseract was sure of) reads as NOTHING — no draft, nothing on the entry', await page.evaluate(() => {
    const junk = ['NS', 'RY', '—', 'NR', '19', 'N\\', '|', 'Gata', 'SHE', 'Ji'].map(t => ({ text: t, confidence: 20 + (t.length * 7) % 40 }));
    return ocrClean({ words: junk, lines: [{ words: junk }] }) === '' && ocrClean(null) === '' && ocrClean({}) === '';
  }));
  ok('a receipt keeps ONLY the words it was sure of, line by line (a scrambled line falls away)', await page.evaluate(() => {
    const sure = s => s.split(' ').map(t => ({ text: t, confidence: 92 }));
    const junk = s => s.split(' ').map(t => ({ text: t, confidence: 31 }));
    const l1 = sure('SPENARD BUILDERS SUPPLY'), l2 = junk('Go Sle WEEE TE'), l3 = sure('INVOICE 613000 TOTAL 48.87'), l4 = sure('THANK YOU');
    const words = [...l1, ...l2, ...l3, ...l4];
    return ocrClean({ words, lines: [{ words: l1 }, { words: l2 }, { words: l3 }, { words: l4 }] }) === 'SPENARD BUILDERS SUPPLY\nINVOICE 613000 TOTAL 48.87\nTHANK YOU';
  }));
  ok('fewer than 8 sure words is not paper either', await page.evaluate(() => {
    const w = 'BIG RED TRUCK here'.split(' ').map(t => ({ text: t, confidence: 95 }));
    return ocrClean({ words: w, lines: [{ words: w }] }) === '';
  }));

  console.log('— ⬆ (8) the running log takes 30 back off —');
  // Eric: "The bottom of the running log says 'A Next 30,' but it needs a button to take 30 back off"
  const pager = () => page.evaluate(() => ({ rows: document.querySelectorAll('#askRecent .ask-recent-row').length,
    btns: [...document.querySelectorAll('#askRecent .rl-pager button')].map(b => b.textContent.replace(/\s+/g, ' ').trim()) }));
  await page.evaluate(() => {
    entries = []; pendingQueue = []; prefs.rlFilter = ''; prefs.rlWho = ''; prefs.rlHide = []; prefs.pocket = [];
    for (let i = 0; i < 100; i++) entries.push({ id: 8000 + i, ts: new Date(Date.now() - i * 60e3), type: 'Note', details: 'log line ' + i, job: 'Oak House' });
    window._rlN = 12; renderAskRecent();
  });
  const p0 = await pager();
  ok('at the first 12 there is nothing to take off — Next 30 and Show all, as before', p0.rows === 12 && p0.btns.join('|') === '⬇ Next 30 · 88 more|Show all 100', JSON.stringify(p0));
  await page.evaluate(() => rlMore(30));
  const p1 = await pager();
  ok('after ⬇ Next 30 (42 showing), "⬆ Back to the first 12" leads the row', p1.rows === 42 && p1.btns[0] === '⬆ Back to the first 12', JSON.stringify(p1));
  await page.evaluate(() => { rlMore(30); rlMore(30); });
  const p2 = await pager();
  ok('with 102-plus asked for and all 100 showing, the row still offers "⬆ Take 30 back off" — there is always a way back', p2.rows === 100 && p2.btns.join('|') === '⬆ Take 30 back off', JSON.stringify(p2));
  await page.evaluate(() => document.querySelector('#askRecent .rl-pager button').click());
  const p3 = await pager();
  ok('…a tap takes 30 back off (100 → 70), and Next 30 is back beside it', p3.rows === 70 && p3.btns[0] === '⬆ Take 30 back off' && /Next 30|Next 30 ·/.test(p3.btns[1]), JSON.stringify(p3));
  await page.evaluate(() => { rlMore(0); rlLess(30); rlLess(30); rlLess(30); });
  const p4 = await pager();
  ok('from Show all, three taps walk it 100 → 70 → 40 → 12, never under the first 12', p4.rows === 12 && !p4.btns.some(b => /⬆/.test(b)), JSON.stringify(p4));
  await ctx.close();

  // ───────────────────────── a PC ─────────────────────────
  const pc = await open(null, 1280);
  ok('on a PC the plate says it in full: "✕ No longer relevant"', await pc.page.evaluate(() => {
    const md = '- Call Chafin back';
    _lastAnswer = { q: 'summary', text: md, md, srcIds: [], at: Date.now(), keep: '' };
    const host = document.createElement('div'); host.id = 't716'; document.body.appendChild(host); host.innerHTML = wizLinesHtml(md);
    const g = document.querySelector('#t716 .wl-gone');
    return getComputedStyle(g.querySelector('.wl-g-long')).display !== 'none' && getComputedStyle(g.querySelector('.wl-g-short')).display === 'none' && /✕\s*No longer relevant/.test(g.innerText.replace(/\s+/g, ' '));
  }));
  await pc.ctx.close();

  // ───────────────────────── Phil's phone ─────────────────────────
  const phil = await open(() => { try {
    localStorage.setItem('daylog-crew-name', 'Phil'); localStorage.setItem('daylog-crew-root', '/Phil'); localStorage.setItem('daylog-crew-jobs', JSON.stringify(['Oak House']));
    localStorage.setItem('daylog-crew-tags', JSON.stringify(['Grandma', 'Fishing', 'Personal', 'Home Depot']));   // what joining took in from Eric's crew.json before v7.16
  } catch (e) {} });
  console.log('— 🏷 (6) Phil\'s tags are his own —');
  ok('on boot his phone no longer takes Eric\'s tags in, and a fresh phone does not start with Eric\'s people', await phil.page.evaluate(() =>
    CREW_NAME === 'Phil' && !knownTags().includes('Grandma') && !knownTags().includes('Shevaun')));
  ok('once: the tags Eric\'s list handed over are swept out — except one he used on his own notes; 🔒 Personal (the lock) stays', await phil.page.evaluate(() => {
    window.scheduleSave = () => {};
    prefs.crewTagScrub716 = false;
    prefs.tags = ['Rebar', 'Grandma', 'Fishing', 'Home Depot', 'Kids'];          // his own Rebar + Eric's merged in earlier
    entries = [{ id: 1, ts: new Date(), type: 'Note', details: 'bought screws', job: 'Oak House', tags: ['Home Depot'] }];
    const gone = crewTagScrub(['Kids']);                                      // a crew.json still carrying Eric's list
    const k = knownTags();
    return gone === 3 && JSON.stringify(prefs.tags) === JSON.stringify(['Rebar', 'Home Depot']) && k.includes('Personal') && !k.includes('Grandma') && !k.includes('Kids') &&
      prefs.crewTagScrub716 === true && crewTagScrub(['Grandma']) === 0;
  }));
  ok('the tags on the notes Eric SENT him are offered too — and ④ TAG IT draws exactly his + those + 🔒 Personal', await phil.page.evaluate(() => {
    crewShared = [{ id: 5, ts: new Date().toISOString(), text: 'pick up the lists', job: 'Oak House', tags: ['Lists', 'Personal'] }];
    prefs.tagRows = 5; prefs.tagCols = 3; renderTagChips();
    const k = knownTags();
    return JSON.stringify(k) === JSON.stringify(['Rebar', 'Home Depot', 'Lists', 'Personal']) && /Lists/.test($('qnTagChips').textContent) && !/Grandma|Fishing/.test($('qnTagChips').textContent);
  }));
  ok('a crew.json that still carries Eric\'s list adds NOTHING to his tags', await phil.page.evaluate(async () => {
    window.dbxDownload = async p => /crew\.json$/.test(p) ? JSON.stringify({ name: 'Phil', jobs: ['Oak House'], tags: ['Grandma', 'Fishing', 'Tilly'] }) : null;
    dbx.refreshToken = 'tok';
    await refreshCrewCfg();
    return !knownTags().some(t => ['Grandma', 'Fishing', 'Tilly'].includes(t));
  }));
  console.log('— 📢 (3) ⤵ Flush it on his "ERIC NEEDS AN ANSWER" card —');
  ok('under the answer box: "⤵ Flush it — no answer needed · it goes in your log"', await phil.page.evaluate(() => {
    crewAsks = [{ id: 900, q: 'The owner okayed moving the trailer', job: 'Oak House' }];
    renderCrewAsks();
    const b = document.querySelector('#crewAskCard .crew-ask-flush');
    return !!b && /⤵ Flush it — no answer needed · it goes in your log/.test(b.textContent) && $('crewAskCard').style.display !== 'none';
  }));
  ok('a tap: into his running log (the words, the job), off the card, and the note to Eric says it was seen — no answer box to fill', await phil.page.evaluate(() => {
    document.querySelector('#crewAskCard .crew-ask-flush').click();
    const e = entries.find(x => x.askRef === 900);
    return !!e && e.askFlush === true && e.job === 'Oak House' && /^⤵ Seen — no answer needed: The owner okayed moving the trailer/.test(e.details) && !e.mine && $('crewAskCard').style.display === 'none';
  }));
  ok('an answered question sits in his FROM ERIC log marked "📢 ANSWERED"', await phil.page.evaluate(() => {
    crewShared = [{ id: 7, ts: new Date().toISOString(), text: 'Did the trim come?', job: 'Oak House', toAll: true, ask: 'answered' }];
    prefs.crewFold = false; renderCrewShared();
    return /📢 ANSWERED · Did the trim come\?/.test($('crewSharedList').textContent.replace(/\s+/g, ' '));
  }));
  await phil.ctx.close();

  ok('no page errors', errs.length === 0, errs.join(' | '));
  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close(); process.exit(fail ? 1 : 0);
})();
