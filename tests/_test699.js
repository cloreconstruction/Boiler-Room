// ⏱ v6.99 — CREW HOURS. Eric: "i want to make a place for me to upload an excel spreadsheet from phils time clock app and
// have it readable on my boiler room … arrange by job and week … approve and pass onto logan and want to have the cube
// lights for: need to gather and approve hours, approved, sent to logan, paid" · "lets do every two weeks pay period" ·
// "lets make that how i send the excel sheet" · "it shoudbe on the crew portal button at the top."
// The suite builds its own time-clock .xlsx in the page (a real zip, shared strings, stored and deflated).
// Every name, job, hour, dollar and address below is made up.
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
    jobs = ['Oak House', 'Internal / Admin']; crew = ['Phil']; entries = []; todos = []; nextId = 1; pendingQueue = []; prefs.tags = ['Personal']; prefs.loganMail = '';
    window.scheduleSave = () => {}; window.savePendingSoon = () => {}; window.publishSharedNotes = () => {};
    renderJobSelects(); closePanels(); renderAll();
    dbx.refreshToken = 'test-token';
    window._dbxFiles = {}; window._ups = []; window._bufs = {}; window._found = []; let hn = 0;
    window.dbxDownload = async p => { const v = (window._dbxFiles || {})[p]; return typeof v === 'string' ? v : null; };
    window.dbxUpload = async (p, body, keepBoth) => { let q = p; if (keepBoth && q in window._dbxFiles) q = p.replace(/(\.\w+)$/, ' (1)$1'); window._ups.push(q); window._dbxFiles[q] = body; return { path_display: q, content_hash: 'up' + (++hn) }; };
    window.dbxPathExists = async p => Object.prototype.hasOwnProperty.call(window._dbxFiles, p);
    window.dbxList = async () => ({ entries: window._found });
    window.chDownloadBuf = async p => window._bufs[p] || null;
    window._said = []; const t0 = window.toast, u0 = window.toastUndo;
    window.toast = (m, good) => { if (m) _said.push(String(m)); return t0(m, good); };
    window.toastUndo = (m, fn) => { _said.push(String(m)); window._undo = fn; return u0(m, fn); };
    // ---- a real .xlsx, built here ----
    const enc = new TextEncoder();
    window._zip = async (list, deflate) => {
      const parts = [], cds = []; let off = 0;
      for (const [nm, text] of list) {
        const name = enc.encode(nm), raw = enc.encode(text), data = deflate ? new Uint8Array(await new Response(new Blob([raw]).stream().pipeThrough(new CompressionStream('deflate-raw'))).arrayBuffer()) : raw;
        const lh = new Uint8Array(30 + name.length), dl = new DataView(lh.buffer); dl.setUint32(0, 0x04034b50, true); dl.setUint16(8, deflate ? 8 : 0, true); dl.setUint32(18, data.length, true); dl.setUint32(22, raw.length, true); dl.setUint16(26, name.length, true); lh.set(name, 30);
        const cd = new Uint8Array(46 + name.length), dc = new DataView(cd.buffer); dc.setUint32(0, 0x02014b50, true); dc.setUint16(10, deflate ? 8 : 0, true); dc.setUint32(20, data.length, true); dc.setUint32(24, raw.length, true); dc.setUint16(28, name.length, true); dc.setUint32(42, off, true); cd.set(name, 46);
        parts.push(lh, data); cds.push(cd); off += lh.length + data.length;
      }
      const cdLen = cds.reduce((s, x) => s + x.length, 0), eo = new Uint8Array(22), de = new DataView(eo.buffer); de.setUint32(0, 0x06054b50, true); de.setUint16(8, cds.length, true); de.setUint16(10, cds.length, true); de.setUint32(12, cdLen, true); de.setUint32(16, off, true);
      const all = [...parts, ...cds, eo], out = new Uint8Array(all.reduce((s, x) => s + x.length, 0)); let p = 0; all.forEach(x => { out.set(x, p); p += x.length; }); return out;
    };
    window._rows = (ppe, P, o = {}) => {
      const d = chDates(ppe), md = d.map(x => o.iso ? x : chMD(x));
      const rows = o.detailOnly ? [] : [[`Made-up Co payroll hours, pay period ending ${o.titlePpe || ppe}`], ['Employee', 'Reg Hrs Wk1', 'OT Hrs Wk1', 'Reg Hrs Wk2', 'OT Hrs Wk2', 'Total Reg Hrs', 'Total OT Hrs', 'QOT Hrs', 'Gross Reg Pay', 'Gross OT Pay', 'Average Cost/Hr'], ...P.map(p => [p.name, ...p.sum, ...(p.pay || [])]), []];
      rows.push(['', '', '', '', ...md.slice(0, 7), '', ...md.slice(7), '', '']);
      rows.push(o.head || ['Employee', 'Project', 'Service', 'Billable?', 'SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'Total', 'SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'Total', 'Notes']);
      P.forEach(p => {
        const tot = Array(14).fill(0);
        p.lines.forEach(([proj, svc, hrs], li) => { const h = Array(14).fill(''); Object.entries(hrs).forEach(([k, v]) => { h[+k] = v; tot[+k] += v; }); const s = a => a.reduce((x, y) => x + (+y || 0), 0); rows.push([li ? '' : p.name, proj, svc, '', ...h.slice(0, 7), s(h.slice(0, 7)) || '', ...h.slice(7), s(h.slice(7)) || '', '']); });
        rows.push(['Total:', '', '', '', ...tot.slice(0, 7), tot.slice(0, 7).reduce((a, b) => a + b, 0), ...tot.slice(7), tot.slice(7).reduce((a, b) => a + b, 0), '']);
      });
      if (o.warn) rows.push([o.warn]);
      return rows;
    };
    window._xlsx = async (rows, deflate) => {
      const ss = [], col = i => { let s = ''; i++; while (i) { s = String.fromCharCode(65 + (i - 1) % 26) + s; i = Math.floor((i - 1) / 26); } return s; };
      const ex = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const xml = '<?xml version="1.0"?><worksheet><sheetData>' + rows.map((r, ri) => r.length ? `<row r="${ri + 1}" spans="1:21">` + r.map((v, ci) => v === '' || v == null ? '' : typeof v === 'number' ? `<c r="${col(ci)}${ri + 1}"><v>${v}</v></c>` : ci === 0 ? (ss.push(v), `<c r="${col(ci)}${ri + 1}" t="s"><v>${ss.length - 1}</v></c>`) : `<c r="${col(ci)}${ri + 1}" t="inlineStr"><is><t>${ex(v)}</t></is></c>`).join('') + '</row>' : `<row r="${ri + 1}"/>`).join('') + '</sheetData></worksheet>';
      const sst = '<?xml version="1.0"?><sst>' + ss.map(s => `<si><t xml:space="preserve">${ex(s)}</t></si>`).join('') + '</sst>';
      return _zip([['[Content_Types].xml', '<Types/>'], ['xl/sharedStrings.xml', sst], ['xl/worksheets/sheet1.xml', xml]], deflate);
    };
    window._csv = rows => rows.map(r => r.map(v => /[",]/.test(String(v)) ? '"' + String(v).replace(/"/g, '""') + '"' : v).join(',')).join('\r\n');
    const WARN = 'WARNING: no pay grade is set for this person, so they are shown at L1, the lowest grade, which is a fallback and not a fact: Birch, Bo (L1). Check the grade before paying from this file.';
    window._WARN = WARN;
    // pay period ending Sat 2026-10-10: d0 = Sun 9/27 … d6 = Sat 10/3 · d7 = Sun 10/4 … d13 = Sat 10/10
    window._crew = (annTue = 10) => [
      { name: 'Alder, Ann (L3)', sum: [40, 0, 17.5, 0, 57.5, 0, 0], pay: [1234.56, 0, 31.07], lines: [['OTM - Oak House [250101]', '5A3 - Framing', { 1: 10, 2: annTue, 3: 10, 4: 10, 9: 8 }], ['O - Pine Cabin', '5A4 - Siding', { 8: 9.5 }]] },
      { name: 'Birch, Bo (L1)', sum: [26, 3.5, 0, 0, 21, 5, 1.5], pay: [777.77, 55.55, 22.22], lines: [['OTM - Oak House [250101]', '5A4 - Siding', { 1: 10.5, 2: 13 }], ['UNKNOWN PROJECT', '5A7 - Logistic', { 5: 2.5 }]] },
      { name: 'Cedar, Cy (L2)', sum: [0, 0, 4, 0, 4, 0, 0], pay: [99.99, 0, 25], lines: [['O - Pine Cabin', 'XXX - UNKNOWN SERVICE', { 10: 4 }]] }];
    window._P = () => chStore().periods['2026-10-10'];
    window._txt = () => $('revBox').textContent.replace(/\s+/g, ' ');
    window._fold = re => [...document.querySelectorAll('#revBox .ch-jt')].find(b => re.test(b.textContent));
    window._okBox = re => _fold(re).closest('.ch-jh').querySelector('.ch-ok');
    window._cube = n => document.querySelectorAll('#revBox .ch-cube')[n - 1];
    window._lit = () => [...document.querySelectorAll('#revBox .ch-cube')].map(c => c.getAttribute('aria-pressed') === 'true' ? 1 : 0).join('');
  });

  console.log('— ⏱ v6.99 the door —');

  ok('the ⏱ Crew hours plate is the FIRST plate under the 👷 Crew portal button, and it opens the window — empty, saying what it waits for', await page.evaluate(async () => {
    crewViewMenu(); const plates = [...document.querySelectorAll('#crewViewSheet .sc-btn')], first = plates[0];
    const a = !!first && first.id === 'chDoor' && /Crew hours/.test(first.textContent) && plates.length === 3;
    first.click(); await new Promise(r => setTimeout(r, 80));
    return a && !$('crewViewSheet') && $('revModal').classList.contains('show') && $('revModal').classList.contains('mat-full') && /No pay period here yet/.test(_txt()) && /Clore-PPE/.test(_txt()) && !!$('chFile');
  }));

  console.log('— 📄 reading the file —');

  const rd = await page.evaluate(async () => {
    window._orig = await _xlsx(_rows('2026-10-10', _crew(), { warn: _WARN }), true);
    _ups.length = 0; _said.length = 0;
    await chDrop([new File([_orig], 'Clore-PPE-2026-10-10.xlsx')]); await chSaveNow();
    const P = _P(), kept = _dbxFiles[CH_KEEP() + '/Clore-PPE-2026-10-10.xlsx'], kb = kept ? new Uint8Array(kept) : new Uint8Array(0);
    const stored = await _xlsx(_rows('2026-10-10', _crew(), { warn: _WARN }), false), Q = chParse(await chXlsxRows(stored.buffer), 'x-2026-10-10.xlsx');
    return { ppl: P && P.people.map(p => [p.n, p.f, p.g, p.lines.length].join('|')).join(' / '), tot: P && chTot(P), days: P && P.people[0].lines[0].h.length, annTue: P && P.people[0].lines[0].h[2], sum: P && JSON.stringify(P.people[1].sum),
      head: _txt(), sameBytes: kb.length === _orig.length && kb.every((x, i) => x === _orig[i]), saved: _ups.includes(CH_PATH()), keep: P && P.keep, storedSame: !Q.err && Q.sig === P.sig, said: _said.join(' | ') };
  });
  ok('a dropped .xlsx (a real zip: shared strings, deflated — and stored reads the same) becomes the pay period: three people, their grades, every line, fourteen days', rd.ppl === 'Alder, Ann|Ann|L3|2 / Birch, Bo|Bo|L1|2 / Cedar, Cy|Cy|L2|1' && rd.days === 14 && rd.annTue === 10 && Math.abs(rd.tot - 87.5) < 0.001 && rd.storedSame && rd.sum === '{"r1":26,"o1":3.5,"r2":0,"o2":0,"q":1.5,"ot":5}', JSON.stringify(rd));
  ok('the heading reads the period in words — ending SAT 10/10, 9/27 – 10/10, the hours, the people — and he is told it is in', /PAY PERIOD ENDING SAT 10\/10/.test(rd.head) && /9\/27 – 10\/10 · 87\.5 h · 3 people/.test(rd.head) && /Pay period ending 10\/10 is in — 87\.5 h · 3 people/.test(rd.said), rd.head.slice(0, 300) + ' || ' + rd.said);
  ok('the ORIGINAL file is kept byte for byte in App Data/Time Clock, and the page saves itself to App Data/crew-hours.json', rd.sameBytes && rd.saved && /Time Clock\/Clore-PPE-2026-10-10\.xlsx$/.test(rd.keep || ''), JSON.stringify({ keep: rd.keep, saved: rd.saved, same: rd.sameBytes }));
  ok('HOURS ONLY — the pay columns in the file (gross pay, cost an hour) are never read, so they are nowhere in what is kept or mirrored', await page.evaluate(() => {
    const all = JSON.stringify(chStore()) + (localStorage.getItem('daylog-crewhours') || '') + String(_dbxFiles[CH_PATH()] || '');
    return all.length > 400 && !/1234\.56|777\.77|99\.99|55\.55|31\.07|22\.22|Gross|Cost\/Hr/i.test(all);
  }));

  const fl = await page.evaluate(() => [...document.querySelectorAll('#revBox .ch-need .ch-nf')].map(x => x.textContent.replace(/\s+/g, ' ').trim()));
  ok('⚠ NEEDS A LOOK says what the file shows, nothing guessed: hours with no job, hours with no work type, a 13-hour day, a weekday nobody worked, no pay grade', fl.length === 5 && fl.some(t => /^Bo — 2\.5 h with no job on it \(Fri 10\/2 · 2\.5\)$/.test(t)) && fl.some(t => /^Cy — 4\.0 h with no work type on it$/.test(t)) && fl.some(t => /^Bo — 13\.0 h on Tue 9\/29$/.test(t)) && fl.some(t => /^Thu 10\/8 — nobody has hours$/.test(t)) && fl.some(t => /^Bo — no pay grade set in the time clock/.test(t)), JSON.stringify(fl));
  ok('an empty Friday is NOT a flag (the crew works four tens) — the day boxes show the holes instead', !fl.some(t => /Fri 10\/9|Fri 10\/2 — nobody/.test(t)));

  console.log('— 🗂 by job, by person —');

  const bj = await page.evaluate(async () => {
    chSetView('job');   // 🗓 v7.00 — BY WEEK opens first now; this suite walks BY JOB and BY PERSON (the week view has its own suite, _test700)
    const heads = [...document.querySelectorAll('#revBox .ch-jt')].map(b => b.textContent.replace(/\s+/g, ' ').trim());
    _fold(/OAK HOUSE/).click(); await new Promise(r => setTimeout(r, 40));
    const job = _fold(/OAK HOUSE/).closest('.ch-job'), rows = [...job.querySelectorAll('.ch-pr')].map(r => r.textContent.replace(/\s+/g, ' ').trim());
    const cells = [...job.querySelectorAll('.ch-pr')[0].querySelectorAll('.ch-c')].map(c => c.textContent.trim()), wk = [...job.querySelectorAll('.ch-wk')].map(x => x.textContent.trim());
    return { heads, rows, cells, wk, svc: job.querySelector('.ch-ps').textContent, exp: _fold(/OAK HOUSE/).getAttribute('aria-expanded'), label: job.querySelector('.ch-c.h').getAttribute('aria-label'), title: _fold(/OAK HOUSE/).getAttribute('title') };
  });
  ok('BY JOB: the jobs by hours with the QuickBooks prefix off the name (the full name stays in the title), the hours with no job LAST', bj.heads.length === 3 && /^▸ A OAK HOUSE71\.5 h · 2 people · wk 1 63\.5 · wk 2 8\.0$/.test(bj.heads[0].replace('▾', '▸')) && /PINE CABIN13\.5 h · 2 people · wk 1 0\.0 · wk 2 13\.5/.test(bj.heads[1]) && /⚠ NO JOB ON IT2\.5 h · 1 person/.test(bj.heads[2]) && bj.title === 'OTM - Oak House [250101]', JSON.stringify(bj.heads));
  ok('an open job shows each week it has hours in, a row a person with the seven day boxes and the week\'s total, and the work types underneath', bj.exp === 'true' && bj.wk.length === 2 && /^WEEK 1 · 9\/27 – 10\/3 · 63\.5 h$/.test(bj.wk[0]) && /^WEEK 2 · 10\/4 – 10\/10 · 8\.0 h$/.test(bj.wk[1]) && bj.cells.join(',') === '·,10.0,10.0,10.0,10.0,·,·' && /^AnnL3.*40\.0$/.test(bj.rows[0]) && /^BoL1.*23\.5$/.test(bj.rows[1]) && /Framing 48\.0 · Siding 23\.5/.test(bj.svc) && /Ann · Mon 9\/28 · 10\.0 hours/.test(bj.label), JSON.stringify(bj));
  ok('BY PERSON: a person\'s two weeks, job by job, with what the clock counts as overtime — a cross-check, nothing to tap but notes', await page.evaluate(async () => {
    chSetView('who'); const hs = [...document.querySelectorAll('#revBox .ch-jt')].map(b => b.textContent.replace(/\s+/g, ' ').trim());
    _fold(/^. BO/).click(); await new Promise(r => setTimeout(r, 40));
    const job = _fold(/^. BO/).closest('.ch-job'), t = job.textContent.replace(/\s+/g, ' ');
    const r = hs.length === 3 && /ANN L357\.5 h · wk 1 40\.0 · wk 2 17\.5/.test(hs[0]) && /BO L126\.0 h · wk 1 26\.0 · wk 2 0\.0 · the clock counts 5\.0 h as overtime/.test(hs[1]) && /Oak House/.test(t) && /NO JOB ON IT/.test(t) && /WEEK 2 · 10\/4 – 10\/10 · no hours/.test(t) && !document.querySelector('#revBox .ch-ok');
    chSetView('job'); return r;
  }));

  console.log('— 💡 the four lights —');

  ok('a new pay period wears ① GATHER alone; 📗 send is off and says why; the word under the lights counts what is left', await page.evaluate(() => {
    _said.length = 0; chSend();
    const off = document.querySelector('#revBox .ch-send.off');
    return _lit() === '1000' && !!off && off.getAttribute('aria-disabled') === 'true' && /lights up when every job is OK'd/.test(off.textContent) && /① GATHER — 0 of 3 jobs OK'd · 5 to look at/.test($('chWord').textContent) && /OK every job first/.test(_said.join(' ')) &&
      [...document.querySelectorAll('#revBox .ch-cube')].every(c => c.querySelector('b').textContent.length > 2 && /—/.test(c.getAttribute('aria-label')));
  }));
  ok('he OKs a JOB with one tap (tap again reopens it); the hours with no job can be OK\'d as they are; when EVERY job is OK\'d ② APPROVED lights by itself', await page.evaluate(async () => {
    _okBox(/OAK HOUSE/).click(); const a = /1 of 3 jobs OK'd/.test($('chWord').textContent) && _okBox(/OAK HOUSE/).getAttribute('aria-pressed') === 'true' && /OK'D/.test(_okBox(/OAK HOUSE/).textContent) && _lit() === '1000';
    _okBox(/OAK HOUSE/).click(); const b = /0 of 3/.test($('chWord').textContent);
    const unk = _okBox(/NO JOB ON IT/); const c = /OK AS IS\?/.test(unk.textContent) && unk.classList.contains('warn');
    _said.length = 0; _okBox(/OAK HOUSE/).click(); _okBox(/PINE CABIN/).click(); _okBox(/NO JOB ON IT/).click();
    const d = _lit() === '1100' && /② APPROVED/.test($('chWord').textContent) && !!_P().apAt && /Every job is OK'd — the pay period is APPROVED/.test(_said.join(' ')) && !!$('chSendBtn');
    _okBox(/PINE CABIN/).click(); const e = _lit() === '1000' && !_P().apAt && !$('chSendBtn');
    return a && b && c && d && e;
  }));
  ok('"✓ OK every job — n left" does the rest in one tap, and its Undo puts it back exactly', await page.evaluate(() => {
    const btn = [...document.querySelectorAll('#revBox .ch-tabs .btn-ghost')].find(b => /OK every job — 1 left/.test(b.textContent)); if (!btn) return false;
    btn.click(); const a = _lit() === '1100'; window._undo(); const b = _lit() === '1000' && /2 of 3 jobs OK'd/.test($('chWord').textContent);
    _cube(2).click(); return a && b && _lit() === '1100';   // tapping the ② light while gathering is the same one tap
  }));

  console.log('— ✎ notes, not edits —');

  ok('tapping a day box opens a note FOR LOGAN on that person and day — the hours themselves are never changed here; the box wears a ✎, the note is listed', await page.evaluate(async () => {
    const sig0 = _P().sig; _fold(/OAK HOUSE/).click(); await new Promise(r => setTimeout(r, 30));
    const cell = [..._fold(/OAK HOUSE/).closest('.ch-job').querySelectorAll('.ch-pr')[1].querySelectorAll('.ch-c')][2]; cell.click();
    const head = (document.querySelector('#chSheetHost .ch-sheet-box') || {}).textContent || '';   // 🗓 v7.00 — the note lives in THE DAY window now
    $('chNoteBox').value = 'should be 10, he left at 4'; chNoteSave();
    const c2 = [..._fold(/OAK HOUSE/).closest('.ch-job').querySelectorAll('.ch-pr')[1].querySelectorAll('.ch-c')][2], list = document.querySelector('#revBox .ch-notes').textContent.replace(/\s+/g, ' ');
    chNoteOpen(-1, -1); $('chNoteBox').value = 'Bo gets a pay grade next week'; chNoteSave();
    return /Bo · Tue 9\/29/.test(head) && /13\.0 h/.test(head) && /A FIX FOR LOGAN/.test(head) && /hours are not changed here/.test(head) && c2.classList.contains('nt') && /✎/.test(c2.textContent) && /has a fix for Logan/.test(c2.getAttribute('aria-label')) && /FIXES FOR LOGAN — they ride with the file · 1/.test(list) && /Bo · Tue 9\/29 — should be 10, he left at 4/.test(list) &&
      _P().notes.length === 2 && _P().notes[1].who === '' && _P().sig === sig0 && chSig(_P()) === sig0 && _lit() === '1100';
  }));

  console.log('— 📗 to Logan —');

  ok('the first send asks ONCE where Logan\'s mail goes (nothing is shared yet), refuses a thing that is not an address, and remembers the real one in prefs', await page.evaluate(() => {
    window._shared = null; Object.defineProperty(navigator, 'share', { value: d => { window._shared = d; return new Promise(r => { window._shareDone = r; }); }, configurable: true, writable: true });
    Object.defineProperty(navigator, 'canShare', { value: d => !!(d && d.files && d.files.length), configurable: true, writable: true });
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: t => { window._clip = t; return Promise.resolve(); } }, configurable: true });
    _said.length = 0; $('chSendBtn').click();
    const a = !_shared && !!$('chMailBox') && /Type his portal address once/.test(_said.join(' '));
    $('chMailBox').value = 'not an address'; chMailSave(); const b = !prefs.loganMail && /does not look like an email/.test(_said.join(' '));
    $('chMailBox').value = 'books@example.test'; chMailSave();
    return a && b && prefs.loganMail === 'books@example.test' && !$('chMailBox') && /to books@example\.test/.test(_txt());
  }));
  const sd = await page.evaluate(async () => {
    _said.length = 0; window._clip = ''; const n0 = entries.length;
    $('chSendBtn').click();
    const rode = !!_shared, litBefore = _lit();                     // the sheet must ride the tap: it is already up, and nothing is lit yet
    const f = _shared ? _shared.files : [], xb = f[0] ? new Uint8Array(await f[0].arrayBuffer()) : new Uint8Array(0), words = f[1] ? await f[1].text() : '';
    _shareDone(); await new Promise(r => setTimeout(r, 60));
    const e = entries[0] || {};
    return { rode, litBefore, names: f.map(x => x.name + '|' + x.type), same: xb.length === _orig.length && xb.every((x, i) => x === _orig[i]), words, text: _shared && _shared.text, title: _shared && _shared.title, clip: _clip, lit: _lit(), word: $('chWord').textContent,
      added: entries.length - n0, e: { d: e.details, job: e.job, tags: e.tags, ref: e.chRef, type: e.type }, said: _said.join(' | '), tag: prefs.tags.includes('Bookkeeper') };
  });
  ok('📗 SEND rides the tap onto the phone\'s send sheet with TWO files: the time clock\'s Excel exactly as it came — same name, same bytes — and his approval as a text file', sd.rode && sd.litBefore === '1100' && sd.same && sd.names.join(',') === 'Clore-PPE-2026-10-10.xlsx|application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,Clore-PPE-2026-10-10 - approved by Eric.txt|text/plain', JSON.stringify({ rode: sd.rode, names: sd.names, same: sd.same }));
  ok('the words say it is approved and unchanged, each person\'s two weeks, his notes, and what is worth a look — and Logan\'s address is copied for the To line (a web page cannot fill it when a file rides along)', /pay period ending Sat 10\/10\/2026 \(9\/27 – 10\/10\)/.test(sd.words) && /APPROVED by Eric/.test(sd.words) && /attached, unchanged/.test(sd.words) && /Alder, Ann \(L3\): week 1 40\.0 h · week 2 17\.5 h · total 57\.5 h/.test(sd.words) && /Birch, Bo \(L1\).*the time clock counts 5\.0 h of that as overtime/.test(sd.words) && /All together: 87\.5 h/.test(sd.words) &&
    /NOTES FROM ERIC:\n- Bo · Tue 9\/29: should be 10, he left at 4\n- the whole pay period: Bo gets a pay grade next week/.test(sd.words) && /WORTH A LOOK[\s\S]*- Bo — 2\.5 h with no job on it/.test(sd.words) && !/</.test(sd.words) && sd.text === sd.words && /APPROVED$/.test(sd.title) && sd.clip === 'books@example.test' && /is copied — paste it on the To line/.test(sd.said), sd.words);
  ok('when the sheet comes back ③ TO LOGAN lights, and a 📗 note lands in the log under Internal / Admin tagged Bookkeeper (it shows under SENT TO LOGAN)', sd.lit === '1110' && /③ SENT TO LOGAN/.test(sd.word) && sd.added === 1 && sd.e.type === 'Note' && sd.e.job === 'Internal / Admin' && (sd.e.tags || []).includes('Bookkeeper') && sd.e.ref === '2026-10-10' && /Crew hours → Logan: pay period ending 10\/10 · 87\.5 h · 3 people · 2 notes from you/.test(sd.e.d) && sd.tag, JSON.stringify(sd.e));
  ok('once it has gone the OK boxes are locked, in words — a light comes off only from the far end, and only on a second tap', await page.evaluate(async () => {
    _said.length = 0; _okBox(/OAK HOUSE/).click(); const a = /take the 📗 light off first/.test(_said.join(' ')) && _lit() === '1110';
    _cube(3).click(); const b = _cube(3).classList.contains('armed') && /SURE\?/.test(_cube(3).textContent) && /tap again to take it off/.test(_cube(3).getAttribute('aria-label')) && _lit() === '1110';
    await new Promise(r => setTimeout(r, 4200)); const c = !_cube(3).classList.contains('armed') && _lit() === '1110';
    return a && b && c;
  }));
  ok('💵 PAID is his tap, only after 📗 — with an Undo — and it too comes off only on a second tap; then 📗 can come off and the period reads APPROVED again', await page.evaluate(() => {
    _cube(4).click(); const a = _lit() === '1111' && /④ PAID/.test($('chWord').textContent); window._undo(); const b = _lit() === '1110';
    _cube(4).click(); _cube(4).click(); const c = _lit() === '1111' && _cube(4).classList.contains('armed'); _cube(4).click(); const d = _lit() === '1110';
    _said.length = 0; _cube(3).click(); _cube(3).click(); const e = _lit() === '1100' && /reads APPROVED again/.test(_said.join(' '));
    _said.length = 0; _cube(4).click(); const f = _lit() === '1100' && /Send it to Logan first/.test(_said.join(' '));
    return a && b && c && d && e && f;
  }));
  ok('with no send sheet in the browser: both files go to the downloads, the mail app opens with the address, the subject and the words — and because only he knows whether it went, HE says so', await page.evaluate(async () => {
    Object.defineProperty(navigator, 'share', { value: undefined, configurable: true, writable: true });
    const clicks = [], real = HTMLAnchorElement.prototype.click; HTMLAnchorElement.prototype.click = function () { clicks.push({ href: this.href, dl: this.download }); };
    const n0 = entries.length; $('chSendBtn').click(); HTMLAnchorElement.prototype.click = real;
    const dls = clicks.filter(c => c.dl).map(c => c.dl), mail = (clicks.find(c => /^mailto:/.test(c.href)) || {}).href || '';
    const a = dls.join(',') === 'Clore-PPE-2026-10-10.xlsx,Clore-PPE-2026-10-10 - approved by Eric.txt' && /^mailto:books@example\.test\?subject=Crew%20hours/.test(mail) && /APPROVED%20by%20Eric/.test(mail) && _lit() === '1100' && /Did it go\?/.test(_txt()) && entries.length === n0;
    [...document.querySelectorAll('#revBox .ch-ask button')].find(b => /Yes — mark it SENT/.test(b.textContent)).click();
    return a && _lit() === '1110' && entries.length === n0 + 1 && !/Did it go\?/.test(_txt());
  }));

  console.log('— 🔁 a newer file —');

  const nf = await page.evaluate(async () => {
    const newer = await _xlsx(_rows('2026-10-10', _crew(8), { warn: _WARN }), true);
    _said.length = 0; await chDrop([new File([newer], 'Clore-PPE-2026-10-10.xlsx')]); await chSaveNow();
    const P = _P(), need = [...document.querySelectorAll('#revBox .ch-need .ch-nf')].map(x => x.textContent.replace(/\s+/g, ' ').trim());
    const r = { lit: _lit(), ok: Object.keys(P.ok).sort().join('|'), need, hist: P.hist.map(h => h.t).join(' | '), keep: P.keep, notes: P.notes.length, said: _said.join(' | '), twoKept: Object.keys(_dbxFiles).filter(k => /Time Clock\//.test(k)).length };
    _okBox(/OAK HOUSE/).click(); r.after = [...document.querySelectorAll('#revBox .ch-need .ch-nf')].some(x => /changed since/.test(x.textContent)); r.lit2 = _lit();
    _said.length = 0; await chDrop([new File([newer], 'Clore-PPE-2026-10-10.xlsx')]); r.again = _said.join(' | '); r.lit3 = _lit();
    return r;
  });
  ok('a newer file for the SAME period with different hours drops it back to ① and says exactly what moved; only the job that changed loses its OK; his notes stay; the history keeps that it HAD been sent', nf.lit === '1000' && nf.ok === 'O - Pine Cabin|UNKNOWN PROJECT' && nf.need.some(t => /^🔁 changed since you OK'd it — Ann · Oak House · Tue 9\/29: 10\.0 → 8\.0 h$/.test(t)) && nf.notes === 2 && /HAD been sent to Logan/.test(nf.hist) && /The hours CHANGED in this file — 1 day/.test(nf.said), JSON.stringify(nf));
  ok('the first original is not written over — the newer file is kept beside it; OK-ing the changed job clears the 🔁 line and re-approves; the same file again changes nothing', nf.twoKept === 2 && / \(1\)\.xlsx$/.test(nf.keep) && nf.after === false && nf.lit2 === '1100' && /Already in — the hours in this file are the same/.test(nf.again) && nf.lit3 === '1100', JSON.stringify({ keep: nf.keep, two: nf.twoKept, again: nf.again }));

  console.log('— 📥 found in Dropbox · other doors · bad files —');

  const fd = await page.evaluate(async () => {
    const p2 = [{ name: 'Dale, Di (L2)', sum: [8, 0, 0, 0, 8, 0, 0], lines: [['O - Pine Cabin', '5A3 - Framing', { 3: 8 }]] }];
    const b24 = await _xlsx(_rows('2026-10-24', p2), true); _bufs['/clore project tracker/qb exports/clore-ppe-2026-10-24 (1).xlsx'] = b24.buffer;
    _found = [{ '.tag': 'file', name: 'Clore-PPE-2026-10-24.xlsx', path_lower: '/clore project tracker/qb exports/clore-ppe-2026-10-24.xlsx', content_hash: 'old24', server_modified: '2026-10-26T10:00:00Z' },
      { '.tag': 'file', name: 'Clore-PPE-2026-10-24 (1).xlsx', path_lower: '/clore project tracker/qb exports/clore-ppe-2026-10-24 (1).xlsx', content_hash: 'new24', server_modified: '2026-10-27T10:00:00Z' },
      { '.tag': 'file', name: 'Clore-PPE-2026-09-26.xlsx', path_lower: '/x/clore-ppe-2026-09-26.xlsx', content_hash: 'h926', server_modified: '2026-09-28T10:00:00Z' },
      { '.tag': 'file', name: 'Invoice List by Date.xlsx', path_lower: '/x/i.xlsx', content_hash: 'zz', server_modified: '2026-10-27T10:00:00Z' }, { '.tag': 'folder', name: 'Archive' }];
    await chScan(); renderCrewHours();
    const offers = [...document.querySelectorAll('#revBox .ch-found-b')].map(b => b.textContent.replace(/\s+/g, ' ').trim()), kinds = _chFound.map(f => f.ppe + ':' + f.name + ':' + f.kind).join(' | ');
    [...document.querySelectorAll('#revBox .ch-found-x')][1].click(); const skipped = _chFound.length === 1 && chStore().skip.h926 === 1;
    document.querySelector('#revBox .ch-found-b').click(); await new Promise(r => setTimeout(r, 120)); await chSaveNow();
    const P = chStore().periods['2026-10-24']; await chScan();
    closeReview(); crewViewMenu(); await new Promise(r => setTimeout(r, 60)); const doorWord = $('chDoor').textContent.replace(/\s+/g, ' '); $('crewViewSheet').remove();
    await openCrewHours();
    const others = [...document.querySelectorAll('#revBox .ch-other')].map(b => b.textContent.replace(/\s+/g, ' ').trim()), cur = _chPpe;
    document.querySelector('#revBox .ch-other').click(); const switched = _chPpe;
    return { offers, kinds, skipped, in24: !!P && P.srcHash === 'new24' && chTot(P) === 8, left: _chFound.length, doorWord, others, cur, switched };
  });
  ok('the file the email pipe already put in Dropbox is FOUND — the newest copy of each period, never a QuickBooks export — and offered for his tap; ✕ stops one being offered again', fd.offers.length === 2 && /FOUND IN DROPBOX ?pay period ending 10\/24 — tap to bring it in/.test(fd.offers[0]) && fd.kinds === '2026-10-24:Clore-PPE-2026-10-24 (1).xlsx:new | 2026-09-26:Clore-PPE-2026-09-26.xlsx:new' && fd.skipped, JSON.stringify(fd));
  ok('his tap brings it in; it is not offered again; the door under 👷 Crew portal says what is waiting; the window opens on the period that needs him and lists the others with their lights', fd.in24 && fd.left === 0 && /Crew hours — pay periods · 1 to approve · 1 to send/.test(fd.doorWord) && fd.cur === '2026-10-24' && fd.others.length === 1 && /ending 10\/10\/26 · 85\.5 h.*② APPROVED/.test(fd.others[0]) && fd.switched === '2026-10-10', JSON.stringify(fd));
  ok('the time clock\'s detail .csv reads to the very same hours as its .xlsx (the period comes off the dates row)', await page.evaluate(() => {
    const rows = _rows('2026-10-10', _crew(8), { detailOnly: true, iso: true, warn: _WARN }), Q = chParse(chCsvRows(_csv(rows)), 'detail.csv');
    return !Q.err && Q.ppe === '2026-10-10' && Q.sig === _P().sig && Q.people[1].sum === null && Q.warn.length === 1;
  }));
  ok('a file that is not the time clock\'s, one with a week missing, one whose period does not end on a Saturday, and a file of junk are each refused IN WORDS — and nothing is stored', await page.evaluate(async () => {
    const n0 = Object.keys(chStore().periods).length; _said.length = 0;
    await chDrop([new File([await _xlsx([['Invoice List'], ['Date', 'Num', 'Amount'], ['9/1', 1, 2]], true)], 'Invoice List.xlsx')]);
    await chDrop([new File([await _xlsx(_rows('2026-10-10', _crew(), { head: ['Employee', 'Project', 'Service', 'Billable?', 'SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'Total', 'Notes'] }), true)], 'Clore-PPE-2026-10-10.xlsx')]);
    await chDrop([new File([await _xlsx(_rows('2026-10-10', _crew(), { titlePpe: '2026-10-09' }), true)], 'x.xlsx')]);
    await chDrop([new File([new TextEncoder().encode('not a zip at all')], 'Clore-PPE-2026-11-07.xlsx')]);
    await chDrop([new File(['x'], 'hours.pdf')]);
    const s = _said.join(' | ');
    return Object.keys(chStore().periods).length === n0 && /not the time clock's pay-period file/.test(s) && /two Sunday-to-Saturday weeks — this one has 7 day columns/.test(s) && /2026-10-09, which is not a Saturday/.test(s) && /would not open here/.test(s) && /not an Excel file/.test(s);
  }));
  ok('saving is read-modify-write: a pay period that is only in the Dropbox file (this phone mirrors just the newest few) is still there after a save', await page.evaluate(async () => {
    const j = JSON.parse(_dbxFiles[CH_PATH()]); j.periods['2026-01-03'] = { ppe: '2026-01-03', name: 'old.xlsx', people: [{ n: 'Elm, Ed', f: 'Ed', g: 'L1', lines: [{ p: 'O - Pine Cabin', s: '5A3 - Framing', h: [0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }] }], ok: {}, notes: [], hist: [], paidAt: '2026-01-10' };
    _dbxFiles[CH_PATH()] = JSON.stringify(j);
    chSaveSoon(_P()); await chSaveNow();
    const k = Object.keys(JSON.parse(_dbxFiles[CH_PATH()]).periods).sort().join(',');
    return k === '2026-01-03,2026-10-10,2026-10-24';
  }));

  console.log('— 📱 the phone · 🧱 the walls —');

  ok('on a 390px phone with a job open nothing runs off the page: four lights on one line, day boxes you can hit, fold headings that the fold-anchor can hold', await page.evaluate(async () => {
    chPick('2026-10-10'); _fold(/OAK HOUSE/).click(); await new Promise(r => setTimeout(r, 40));
    const cubes = [...document.querySelectorAll('#revBox .ch-cube')], tops = new Set(cubes.map(c => Math.round(c.getBoundingClientRect().top))), cell = document.querySelector('#revBox .ch-c').getBoundingClientRect();
    return tops.size === 1 && cubes.every(c => c.getBoundingClientRect().height >= 48) && cell.height >= 33 && cell.width >= 26 && $('revBox').scrollWidth <= $('revBox').clientWidth + 1 && document.documentElement.scrollWidth <= document.documentElement.clientWidth &&
      [...document.querySelectorAll('#revBox .ch-jt')].every(b => b.hasAttribute('aria-expanded')) && _okBox(/OAK HOUSE/).getBoundingClientRect().height >= 44;
  }));
  ok('"take this pay period off the list" wants two taps, leaves the Excel file in Dropbox, and a save does not bring the period back', await page.evaluate(async () => {
    chPick('2026-10-24'); const link = () => [...document.querySelectorAll('#revBox .ch-foot a')].find(a => /off the list|SURE/.test(a.textContent));
    link().click(); const a = /SURE\? tap again/.test(link().textContent) && !!chStore().periods['2026-10-24'];
    link().click(); await chSaveNow();
    return a && !chStore().periods['2026-10-24'] && !JSON.parse(_dbxFiles[CH_PATH()]).periods['2026-10-24'] && Object.keys(_dbxFiles).some(k => /Time Clock\/Clore-PPE-2026-10-24/.test(k));
  }));
  ok('Logan\'s address is typed by Eric and kept in his prefs — this public file never holds it, and no push or client page hears about crew hours', !/loganMail\s*(?:=|\|\|)\s*['"`][^'"`]*@/.test(src) && (src.match(/prefs\.loganMail = /g) || []).length === 1 && /prefs\.loganMail = v;/.test(src) && !/cpPush\([^)]*ch|notify[^\n]{0,80}crew hours/i.test(src) && (src.match(/prefs\.loganMail/g) || []).length >= 3);
  ok('the crew preview cannot open it', await page.evaluate(async () => { closeReview(); crewPreview = true; await openCrewHours(); const r = !$('revModal').classList.contains('show'); crewPreview = false; return r; }));
  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v6.99') && document.querySelector('footer').textContent.includes(APP_VER);
  }));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  // ── 🧱 a crew phone: a real reload with the crew name set, not a stubbed flag ──
  const ctx2 = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const p2 = await ctx2.newPage();
  await p2.addInitScript(() => { try { localStorage.setItem('daylog-crew-name', 'Phil'); localStorage.setItem('daylog-crewhours', JSON.stringify({ v: 1, periods: { '2026-10-10': { ppe: '2026-10-10', people: [], ok: {}, notes: [] } } })); } catch (e) {} });
  await p2.goto(appUrl); await p2.waitForTimeout(700);
  ok('a CREW phone has no door, opens nothing, reads nothing, takes no file and writes nothing', await p2.evaluate(async () => {
    window._ups = []; window._reads = []; window.dbxUpload = async p => { _ups.push(p); return {}; }; window.dbxDownload = async p => { _reads.push(p); return null; }; window.dbxList = async () => { _reads.push('list'); return { entries: [] }; };
    dbx.refreshToken = 'tok'; crew = ['Nathan'];
    crewViewMenu(); const noDoor = !document.getElementById('chDoor');
    await openCrewHours(); await chLoad(); await chScan(); await chDrop([new File(['x'], 'Clore-PPE-2026-10-10.xlsx')]); chSaveSoon(); await chSaveNow(); chSend();
    return CREW_NAME === 'Phil' && noDoor && !$('revModal').classList.contains('show') && _ups.length === 0 && _reads.length === 0;
  }));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
