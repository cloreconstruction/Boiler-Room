// 🗓 v7.00 — CREW HOURS: BY WEEK, A SPLIT DAY, TWO KINDS OF NOTE. Eric: "i really like the layout of the week calendar and
// how each box gets filled in. i also need more then just by job and by person, i also need by week, and i think if there
// is more than one job per day, the calendar box for the day could be split into 2 or more and hours are on each job and
// could have job when mouse hover and could even be two differnent shades or colors ? maybe just a slash mark to split the
// day into multiple jobs. also think i shold be able to click on the day or hours or in somewaay be able to see the
// categories worked as well and be able to put notes on it even if those notes are onlly for my record, make those
// sepereate from hour fixes notes i send to logan to fix payroll excel."
// The suite builds its own time-clock .xlsx in the page. Every name, job, hour and address below is made up.
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
    jobs = ['Oak House', 'Internal / Admin']; crew = ['Phil']; entries = []; todos = []; nextId = 1; pendingQueue = []; prefs.tags = ['Personal']; prefs.loganMail = 'books@example.test';
    window.scheduleSave = () => {}; window.savePendingSoon = () => {}; window.publishSharedNotes = () => {};
    renderJobSelects(); closePanels(); renderAll();
    dbx.refreshToken = 'test-token';
    window._dbxFiles = {}; let hn = 0;
    window.dbxDownload = async p => { const v = (window._dbxFiles || {})[p]; return typeof v === 'string' ? v : null; };
    window.dbxUpload = async (p, body, keepBoth) => { let q = p; if (keepBoth && q in window._dbxFiles) q = p.replace(/(\.\w+)$/, ' (1)$1'); window._dbxFiles[q] = body; return { path_display: q, content_hash: 'up' + (++hn) }; };
    window.dbxPathExists = async p => Object.prototype.hasOwnProperty.call(window._dbxFiles, p);
    window.dbxList = async () => ({ entries: [] });
    window.chDownloadBuf = async () => null;
    window._said = []; const t0 = window.toast; window.toast = (m, good) => { if (m) _said.push(String(m)); return t0(m, good); };
    const enc = new TextEncoder();
    window._zip = async list => {
      const parts = [], cds = []; let off = 0;
      for (const [nm, text] of list) {
        const name = enc.encode(nm), raw = enc.encode(text), data = new Uint8Array(await new Response(new Blob([raw]).stream().pipeThrough(new CompressionStream('deflate-raw'))).arrayBuffer());
        const lh = new Uint8Array(30 + name.length), dl = new DataView(lh.buffer); dl.setUint32(0, 0x04034b50, true); dl.setUint16(8, 8, true); dl.setUint32(18, data.length, true); dl.setUint32(22, raw.length, true); dl.setUint16(26, name.length, true); lh.set(name, 30);
        const cd = new Uint8Array(46 + name.length), dc = new DataView(cd.buffer); dc.setUint32(0, 0x02014b50, true); dc.setUint16(10, 8, true); dc.setUint32(20, data.length, true); dc.setUint32(24, raw.length, true); dc.setUint16(28, name.length, true); dc.setUint32(42, off, true); cd.set(name, 46);
        parts.push(lh, data); cds.push(cd); off += lh.length + data.length;
      }
      const cdLen = cds.reduce((s, x) => s + x.length, 0), eo = new Uint8Array(22), de = new DataView(eo.buffer); de.setUint32(0, 0x06054b50, true); de.setUint16(8, cds.length, true); de.setUint16(10, cds.length, true); de.setUint32(12, cdLen, true); de.setUint32(16, off, true);
      const all = [...parts, ...cds, eo], out = new Uint8Array(all.reduce((s, x) => s + x.length, 0)); let p = 0; all.forEach(x => { out.set(x, p); p += x.length; }); return out;
    };
    window._xlsx = async (ppe, P) => {
      const md = chDates(ppe).map(chMD), rows = [[`Made-up Co payroll hours, pay period ending ${ppe}`], [], ['', '', '', '', ...md.slice(0, 7), '', ...md.slice(7), '', ''],
        ['Employee', 'Project', 'Service', 'Billable?', 'SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'Total', 'SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'Total', 'Notes']];
      P.forEach(p => { p.lines.forEach(([proj, svc, hrs, note], li) => { const h = Array(14).fill(''); Object.entries(hrs).forEach(([k, v]) => { h[+k] = v; }); rows.push([li ? '' : p.name, proj, svc, '', ...h.slice(0, 7), '', ...h.slice(7), '', note || '']); }); rows.push(['Total:']); });
      const col = i => { let s = ''; i++; while (i) { s = String.fromCharCode(65 + (i - 1) % 26) + s; i = Math.floor((i - 1) / 26); } return s; }, ex = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
      const xml = '<?xml version="1.0"?><worksheet><sheetData>' + rows.map((r, ri) => r.length ? `<row r="${ri + 1}">` + r.map((v, ci) => v === '' || v == null ? '' : typeof v === 'number' ? `<c r="${col(ci)}${ri + 1}"><v>${v}</v></c>` : `<c r="${col(ci)}${ri + 1}" t="inlineStr"><is><t>${ex(v)}</t></is></c>`).join('') + '</row>' : `<row r="${ri + 1}"/>`).join('') + '</sheetData></worksheet>';
      return _zip([['xl/worksheets/sheet1.xml', xml]]);
    };
    // pay period ending Sat 2026-10-10: d0 = Sun 9/27 … d4 = Thu 10/1 … d8 = Mon 10/5 · d9 = Tue 10/6
    window._crew = (boMon = 10.5) => [
      { name: 'Alder, Ann (L3)', lines: [['OTM - Oak House [250101]', '5A3 - Framing', { 1: 10, 2: 10, 3: 10, 4: 10, 8: 4 }], ['O - Pine Cabin', '5A4 - Siding', { 8: 5.5, 9: 10.5 }, 'tools left on site'], ['O - Pine Cabin', '5A3 - Framing', { 8: 1 }]] },
      { name: 'Birch, Bo (L1)', lines: [['OTM - Oak House [250101]', '5A4 - Siding', { 1: boMon, 4: 3 }], ['UNKNOWN PROJECT', '5A7 - Logistic', { 4: 2 }], ['O - Pine Cabin', '5A4 - Siding', { 4: 1.5 }]] }];
    window._P = () => chStore().periods['2026-10-10'];
    window._txt = () => $('revBox').textContent.replace(/\s+/g, ' ');
    window._cell = (who, d) => { const w = d < 7 ? 1 : 2, row = [...document.querySelectorAll(`#revBox .ch-week[data-week="${w}"] .ch-pr:not(.all)`)].find(r => r.querySelector('.ch-pn').textContent.startsWith(who)); return row ? row.querySelectorAll('.ch-c')[d % 7] : null; };
    window._sheet = () => document.querySelector('#chSheetHost .ch-sheet-box');
    window._lit = () => [...document.querySelectorAll('#revBox .ch-cube')].map(c => c.getAttribute('aria-pressed') === 'true' ? 1 : 0).join('');
  });

  console.log('— 🗓 v7.00 by week —');

  ok('a phone that has never chosen opens BY WEEK; there are three views now — BY WEEK · BY JOB · BY PERSON — and the one he picks is remembered', await page.evaluate(async () => {
    await openCrewHours(); await chDrop([new File([await _xlsx('2026-10-10', _crew())], 'Clore-PPE-2026-10-10.xlsx')]);
    const tabs = [...document.querySelectorAll('#revBox .ch-tabs .pick-chip')], a = tabs.map(t => t.textContent.trim() + ':' + t.getAttribute('aria-pressed')).join(' | ');
    tabs[2].click(); const b = localStorage.getItem('daylog-chview') === 'who' && !document.querySelector('#revBox .ch-week');
    chSetView('week');
    return a === 'BY WEEK:true | BY JOB:false | BY PERSON:false' && b && localStorage.getItem('daylog-chview') === 'week' && document.querySelectorAll('#revBox .ch-week').length === 2;
  }));
  ok('the period\'s jobs lead the view, each with a LETTER (A = the most hours, the hours with no job wear ?) and its OK box — he can approve from here', await page.evaluate(() => {
    const rows = [...document.querySelectorAll('#revBox .ch-legend .ch-lg')].map(r => r.textContent.replace(/\s+/g, ' ').trim());
    document.querySelectorAll('#revBox .ch-legend .ch-ok')[0].click(); const one = /1 of 3 jobs OK'd/.test($('chWord').textContent);
    [...document.querySelectorAll('#revBox .ch-tabs .btn-ghost')].find(b => /OK every job — 2 left/.test(b.textContent)).click(); const all = _lit() === '1100';
    document.querySelectorAll('#revBox .ch-legend .ch-ok')[0].click();
    return rows.length === 3 && /^A ?OAK HOUSE57\.5 h · wk 1 53\.5 · wk 2 4\.0/.test(rows[0]) && /^B ?PINE CABIN18\.5 h · wk 1 1\.5 · wk 2 17\.0/.test(rows[1]) && /^\? ?⚠ NO JOB ON IT2\.0 h/.test(rows[2]) && one && all && _lit() === '1000';
  }));
  const wk = await page.evaluate(() => {
    const heads = [...document.querySelectorAll('#revBox .ch-week > .ch-wk')].map(x => x.textContent.trim());
    const one = _cell('Ann', 1), p1 = one.querySelector('.ch-part');
    const all = [...document.querySelectorAll('#revBox .ch-week[data-week="1"] .ch-pr.all')].map(r => r.textContent.replace(/\s+/g, ' ').trim());
    return { heads, oneCls: one.className, oneTxt: one.textContent.replace(/\s+/g, ''), oneTag: p1.querySelector('u').textContent, oneLg: p1.classList.contains('lg'), oneTitle: one.getAttribute('title'), all, names: [...document.querySelectorAll('#revBox .ch-week[data-week="2"] .ch-pr:not(.all) .ch-pn')].map(x => x.textContent) };
  });
  ok('a calendar a WEEK: a row a person who has hours that week with ALL his jobs in it, the week\'s total, and an "everyone" row of the days', wk.heads.join(' | ') === 'WEEK 1 · 9/27 – 10/3 · 57.0 h · 2 people | WEEK 2 · 10/4 – 10/10 · 21.0 h · 1 person' && /^everyone ?· ?20\.5 ?10\.0 ?10\.0 ?16\.5 ?· ?· ?57\.0$/.test(wk.all[0]) && wk.names.join(',') === 'AnnL3', JSON.stringify(wk));
  ok('a day on ONE job is a plain box — the hours and the job\'s letter; the hover says the job in words', !/split/.test(wk.oneCls) && wk.oneTxt === 'A10.0' && wk.oneTag === 'A' && wk.oneLg && wk.oneTitle === 'Ann · Mon 9/28 — A Oak House 10.0 h', JSON.stringify(wk));

  const sp = await page.evaluate(() => {
    const c = _cell('Ann', 8), parts = [...c.querySelectorAll('.ch-part')], c3 = _cell('Bo', 4), p3 = [...c3.querySelectorAll('.ch-part')];
    const bg = el => getComputedStyle(el).backgroundColor;
    return { cls: c.className, parts: parts.map(p => p.querySelector('u').textContent + ':' + p.textContent.replace(/\s+/g, '').slice(1) + ':' + [...p.classList].filter(x => /^s\d$/.test(x)).join('')), bgs: parts.map(bg), em: c.querySelector('em').textContent, title: c.getAttribute('title'), label: c.getAttribute('aria-label'),
      three: p3.map(p => p.querySelector('u').textContent + ':' + p.textContent.replace(/\s+/g, '').slice(1) + (p.classList.contains('unk') ? ':unk' : '')), em3: c3.querySelector('em').textContent, line: parseFloat(getComputedStyle(parts[1]).borderTopWidth) };
  });
  ok('a day on TWO jobs is a box SPLIT by a line, a part a job: its hours, its letter, one of two shades (the letter tells them apart, never the shade alone) and the day\'s total under it', /split/.test(sp.cls) && sp.parts.join(' | ') === 'A:4.0:s0 | B:6.5:s1' && sp.bgs[0] !== sp.bgs[1] && sp.em === '10.5' && sp.line >= 1.5, JSON.stringify(sp));
  ok('the hover — and the screen reader — say the jobs in words; three jobs in a day make three parts, the hours with no job wearing ? last', sp.title === 'Ann · Mon 10/5 — A Oak House 4.0 h · B Pine Cabin 6.5 h' && /Ann · Mon 10\/5 · 10\.5 hours — A Oak House 4\.0 h · B Pine Cabin 6\.5 h — tap for the work types and notes/.test(sp.label) && sp.three.join(' | ') === 'A:3.0 | B:1.5 | ?:2.0:unk' && sp.em3 === '6.5', JSON.stringify(sp));
  ok('on a 390px phone every part fits its box (10.5 is set a size smaller so its letter never covers it), nothing runs off the page, and the key under the calendar explains the split, ✎ and ●', await page.evaluate(() => {
    const parts = [...document.querySelectorAll('#revBox .ch-part')], key = (document.querySelector('#revBox .ch-key') || {}).textContent || '';
    return parts.length >= 9 && parts.every(p => p.scrollWidth <= p.clientWidth + 1) && $('revBox').scrollWidth <= $('revBox').clientWidth + 1 && document.documentElement.scrollWidth <= document.documentElement.clientWidth && /split by a line = more than one job/.test(key) && /✎ a fix for Logan · ● your own note/.test(key);
  }));

  console.log('— 👆 the day —');

  const dy = await page.evaluate(() => {
    _cell('Ann', 8).click();
    const box = _sheet(), host = $('chSheetHost'), r = box.getBoundingClientRect(), jobs = [...box.querySelectorAll('.ch-sh-job')].map(x => x.textContent.replace(/\s+/g, ' ').trim());
    return { inRev: $('revBox').contains(host), body: host.parentElement === document.body, pos: getComputedStyle(host.firstElementChild).position, z: +getComputedStyle(host.firstElementChild).zIndex, top: Math.round(r.top), head: box.querySelector('.ch-sh-head').textContent.replace(/\s+/g, ' ').trim(), jobs,
      labels: [...box.querySelectorAll('.ch-sh-l')].map(x => x.textContent.replace(/\s+/g, ' ').trim()), boxes: !!$('chNoteBox') && !!$('chMineBox'), fs: getComputedStyle($('chMineBox')).fontSize };
  });
  ok('a tap on a day opens THE DAY: who and when, the hours, and under each job the WORK TYPES he logged (and the time clock\'s own note)', /^Ann · Mon 10\/5 ?10\.5 h on 2 jobs$/.test(dy.head) && dy.jobs.length === 2 && /^A ?Oak House · 4\.0 h ?Framing 4\.0$/.test(dy.jobs[0]) && /^B ?Pine Cabin · 6\.5 h ?Siding 5\.5 · Framing 1\.0 ?the time clock's note: tools left on site$/.test(dy.jobs[1]), JSON.stringify(dy));
  ok('it sits outside the scrolling page, fixed at the TOP of the screen (the phone\'s keyboard never covers the boxes), over the window and under the toast', !dy.inRev && dy.body && dy.pos === 'fixed' && dy.z === 85 && dy.top < 40 && dy.fs === '16px', JSON.stringify(dy));
  ok('two boxes that never mix — ✎ A FIX FOR LOGAN (rides with the file; the hours are not changed here) and ● MY NOTE (his record only, never sent)', dy.boxes && dy.labels.length === 2 && /^✎ A FIX FOR LOGAN — rides with the file.*hours are not changed here/.test(dy.labels[0]) && /^● MY NOTE — your record only\. It is never sent to Logan or anyone\.$/.test(dy.labels[1]), JSON.stringify(dy.labels));
  const nt = await page.evaluate(() => {
    _said.length = 0; $('chNoteBox').value = 'Oak House should be 5, not 4'; $('chMineBox').value = 'PRIVATE-WORDS she split the day because the siding was late';
    $('chSheetDone').click();
    const c = _cell('Ann', 8), lists = [...document.querySelectorAll('#revBox .ch-notes .ch-nh')].map(x => x.textContent.trim()), rows = [...document.querySelectorAll('#revBox .ch-notes .ch-nf')].map(x => x.textContent.replace(/\s+/g, ' ').trim());
    const r = { gone: !_sheet(), cls: c.className, fx: !!c.querySelector('i.fx') && c.querySelector('i.fx').textContent === '✎', mn: !!c.querySelector('i.mn') && c.querySelector('i.mn').textContent === '●', label: c.getAttribute('aria-label'), lists, rows, said: _said.join(' | '), notes: _P().notes.length, mine: _P().mine.length, sig: _P().sig === chSig(_P()) };
    chSetView('job'); [...document.querySelectorAll('#revBox .ch-jt')][0].click(); const jc = [...document.querySelectorAll('#revBox .ch-job')][0].querySelectorAll('.ch-wk + .ch-dow + .ch-pr .ch-c');
    r.jobView = [...document.querySelectorAll('#revBox .ch-job .ch-c.nt.mn')].length; chSetView('week'); return r;
  });
  ok('DONE keeps both: the day\'s box wears ✎ (top corner) AND ● (bottom corner) — said in words too — in every view, and the two lists sit apart under their own headings', nt.gone && /\bnt\b/.test(nt.cls) && /\bmn\b/.test(nt.cls) && nt.fx && nt.mn && /has a fix for Logan · has your own note/.test(nt.label) && nt.lists.join(' | ') === '✎ FIXES FOR LOGAN — they ride with the file · 1 | ● MY NOTES — only you see these, never sent · 1' && /^Ann · Mon 10\/5 — Oak House should be 5, not 4/.test(nt.rows[0]) && /^Ann · Mon 10\/5 — PRIVATE-WORDS/.test(nt.rows[1]) && nt.notes === 1 && nt.mine === 1 && nt.sig && nt.jobView >= 1 && /the fix rides to Logan with the file · ● your note is kept — only you see it/.test(nt.said), JSON.stringify(nt));

  console.log('— 🧱 my note never leaves —');

  const wall = await page.evaluate(async () => {
    const P = _P(), words = chSendWords(P);
    chOkAll(); window._shared = null;
    Object.defineProperty(navigator, 'share', { value: d => { window._shared = d; return Promise.resolve(); }, configurable: true, writable: true });
    Object.defineProperty(navigator, 'canShare', { value: () => true, configurable: true, writable: true });
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.resolve() }, configurable: true });
    _chBuf['2026-10-10'] = _chBuf['2026-10-10'] || new Uint8Array([1, 2, 3]).buffer;
    $('chSendBtn').click(); await new Promise(r => setTimeout(r, 60));
    const txt = _shared ? await _shared.files[1].text() : '', e = entries[0] || {}; await chSaveNow();
    return { words, txt, text: _shared && _shared.text, log: JSON.stringify(e), lit: _lit(), file: String(_dbxFiles[CH_PATH()] || ''), csv: typeof csvString === 'function' ? csvString(entries) : '' };
  });
  ok('what goes to Logan carries the FIX and never MY NOTE — not in the words, not in the text file, not in the 📗 log note, not in the master log', /NOTES FROM ERIC:\n- Ann · Mon 10\/5: Oak House should be 5, not 4/.test(wall.words) && ![wall.words, wall.txt, wall.text, wall.log, wall.csv].some(s => /PRIVATE-WORDS/.test(String(s))) && /Oak House should be 5/.test(wall.txt) && wall.lit === '1110', wall.words);
  ok('my note IS kept in his own crew-hours file, so his other devices show it', /PRIVATE-WORDS/.test(wall.file) && /"mine"/.test(wall.file));
  ok('nothing about crew hours reaches the Wizard, a crew file or a client page: the notes are read only by the Crew Hours block', (() => {
    const a = src.indexOf('// ================= ⏱ v6.99 — CREW HOURS'), b = src.indexOf('// --- Eric\'s side: stand up one folder per crew member'), rest = src.slice(0, a) + src.slice(b);
    return a > 0 && b > a && !/chStore\(|chCur\(|\b_ch\b|CH_PATH|crew-hours\.json|daylog-crewhours|chSendWords/.test(rest);   // the store has ONE way in, and only the Crew Hours block uses it
  })());

  console.log('— ✎ changing, clearing, the empty day, the whole period —');

  ok('reopening the day shows both notes where he left them; clearing ONE box takes only that note off; the ✕ in a list does the same', await page.evaluate(() => {
    _cube = n => document.querySelectorAll('#revBox .ch-cube')[n - 1]; _cube(3).click(); _cube(3).click();   // 📗 back off, so the page is live again
    _cell('Ann', 8).click(); const a = $('chNoteBox').value === 'Oak House should be 5, not 4' && /^PRIVATE-WORDS/.test($('chMineBox').value);
    $('chMineBox').value = ''; $('chSheetDone').click();
    const b = _P().notes.length === 1 && _P().mine.length === 0 && !_cell('Ann', 8).querySelector('i.mn') && !!_cell('Ann', 8).querySelector('i.fx');
    _cell('Ann', 8).click(); $('chMineBox').value = 'second private thought'; $('chSheetDone').click();
    [...document.querySelectorAll('#revBox .ch-notes .ch-nf')].find(r => /second private thought/.test(r.textContent)).querySelector('.ch-nx').click();
    return a && b && _P().mine.length === 0 && _P().notes.length === 1;
  }));
  ok('a tap on the dim edge saves what is typed and closes — nothing typed is lost', await page.evaluate(() => {
    _cell('Bo', 4).click(); $('chMineBox').value = 'three jobs in a day — ask why'; document.querySelector('#chSheetHost .ch-sheet').click();
    return !_sheet() && _P().mine.length === 1 && _P().mine[0].f === 'Bo' && _P().mine[0].d === 4 && !!_cell('Bo', 4).querySelector('i.mn');
  }));
  ok('an EMPTY day opens too — "no hours this day", no jobs, both boxes — which is where a missing day gets its fix for Logan', await page.evaluate(() => {
    const c = _cell('Bo', 2); const dot = c.textContent.trim() === '·' && /no hours/.test(c.getAttribute('aria-label')); c.click();
    const box = _sheet(), a = /^Bo · Tue 9\/29 ?no hours this day$/.test(box.querySelector('.ch-sh-head').textContent.replace(/\s+/g, ' ').trim()) && !box.querySelector('.ch-sh-job');
    $('chNoteBox').value = 'he worked 10 and forgot to clock in'; $('chSheetDone').click();
    return dot && a && _P().notes.some(n => n.f === 'Bo' && n.d === 2) && /he worked 10 and forgot to clock in/.test(chSendWords(_P())) && !!_cell('Bo', 2).querySelector('i.fx');
  }));
  ok('"➕ a note for me" and "➕ a fix for Logan" open the same window for THE WHOLE PAY PERIOD, the right box ready', await page.evaluate(() => {
    const btns = [...document.querySelectorAll('#revBox .ch-notes .btn-ghost')]; btns.find(b => /a note for me/.test(b.textContent)).click();
    const a = /^The whole pay period ?ending 10\/10$/.test(_sheet().querySelector('.ch-sh-head').textContent.replace(/\s+/g, ' ').trim()) && document.activeElement === $('chMineBox') && !_sheet().querySelector('.ch-sh-job');
    $('chMineBox').value = 'good two weeks'; $('chSheetDone').click();
    return a && _P().mine.some(n => n.who === '' && n.d === -1 && n.t === 'good two weeks') && /the whole pay period — good two weeks/.test(_txt());
  }));
  ok('a job\'s name in the BY WEEK list opens BY JOB on that job; its heading and the BY PERSON lines wear the same letters', await page.evaluate(() => {
    document.querySelectorAll('#revBox .ch-legend .ch-lgn')[1].click();
    const open = document.querySelector('#revBox .ch-jt[aria-expanded="true"]'), a = _chView === 'job' && !!open && /^▾ B PINE CABIN/.test(open.textContent.replace(/\s+/g, ' ').trim()) && localStorage.getItem('daylog-chview') === 'job';
    chSetView('who'); [...document.querySelectorAll('#revBox .ch-jt')][0].click(); const pl = [...document.querySelectorAll('#revBox .ch-pl')].map(x => x.textContent.replace(/\s+/g, ' ').trim());
    chSetView('week'); return a && pl.includes('A Oak House') && pl.includes('B Pine Cabin');
  }));
  ok('a newer file with different hours keeps BOTH kinds of note', await page.evaluate(async () => {
    const n0 = _P().notes.length, m0 = _P().mine.length; await chDrop([new File([await _xlsx('2026-10-10', _crew(8))], 'Clore-PPE-2026-10-10.xlsx')]);
    return n0 >= 2 && m0 >= 2 && _P().notes.length === n0 && _P().mine.length === m0 && _lit() === '1000' && (_P().chg || []).length === 1;
  }));

  console.log('— 🖥 the PC —');
  await page.setViewportSize({ width: 1100, height: 900 }); await page.waitForTimeout(150);
  ok('on a PC the calendar keeps a readable width and a part\'s letter sits right beside its hours', await page.evaluate(() => {
    const row = document.querySelector('#revBox .ch-week .ch-pr'), u = document.querySelector('#revBox .ch-part u');
    return row.getBoundingClientRect().width <= 801 && getComputedStyle(u).position === 'static' && [...document.querySelectorAll('#revBox .ch-part')].every(p => p.scrollWidth <= p.clientWidth + 1);
  }));
  await page.setViewportSize({ width: 390, height: 844 });

  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v7.00') && document.querySelector('footer').textContent.includes(APP_VER);
  }));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  const ctx2 = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const p2 = await ctx2.newPage();
  await p2.addInitScript(() => { try { localStorage.setItem('daylog-crew-name', 'Phil'); localStorage.setItem('daylog-crewhours', JSON.stringify({ v: 1, periods: { '2026-10-10': { ppe: '2026-10-10', people: [{ n: 'Alder, Ann', f: 'Ann', g: 'L3', lines: [{ p: 'O - Pine Cabin', s: '5A3 - Framing', h: [0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }] }], ok: {}, notes: [], mine: [{ id: 'x', who: '', d: -1, t: 'mine' }] } } })); } catch (e) {} });
  await p2.goto(appUrl); await p2.waitForTimeout(700);
  ok('a CREW phone can open no day window and draws nothing of his notes', await p2.evaluate(() => { _chPpe = '2026-10-10'; chNoteOpen(0, 1); chNoteOpen(-1, -1, 'mine'); const h = document.getElementById('chSheetHost'); return CREW_NAME === 'Phil' && (!h || !h.innerHTML) && !/mine/.test(document.body.textContent.slice(0, 0) + ($('revBox') || {}).textContent); }));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
