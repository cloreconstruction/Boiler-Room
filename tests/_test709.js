// 🏢 v7.09 — PHIL'S PHONE, ERIC'S WAY. Eric: "Start with the job cards. He should be able to see everything in the job card
// except the thing on the bottom where I can choose whether it's private or crew … he should be able to edit any of the ones
// that are open to the crew. Next is project portal … all the jobs. At the bottom where I can give a job a client page, he
// should not be able to see that, so put a dotted line around that, right? The selection at the top where you choose what the
// client sees, Phil does not need to see that. He should not have the Remove, Rename, or Rotate codes. I don't want him to
// have the Project Tracker, Receipts, or estimates but he should be able to click on Plans, Build List, and Journal."
// Two phones: Eric's (the dashed edges, the edits coming back) and an OFFICE crew phone (a real reload as Phil, the folder
// mounted under another name). Every name, address and number in this file is made up.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { fileURLToPath } = require('url');
(async () => {
  const appUrl = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };
  const errs = [];

  // ───────────────────────── Eric's phone ─────────────────────────
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push('eric: ' + e.message); });
  await page.goto(appUrl); await page.waitForTimeout(700);
  await page.evaluate(() => {
    jobs = ['Oak House', 'Pine Cabin']; crew = ['Phil', 'Ann']; entries = []; todos = []; nextId = 1; pendingQueue = [];
    window.scheduleSave = () => {}; window.savePendingSoon = () => {}; window._pubs = 0; window.publishSharedNotes = async () => { window._pubs++; };
    renderJobSelects(); closePanels(); renderAll();
    dbx.refreshToken = 't'; prefs.office = ['Phil'];
    _portalIdx = { clients: [{ key: 'oak', job: 'Oak House', code: 'oak-111aaa' }, { key: 'pine', job: 'Pine Cabin', code: 'pine-222bbb' }] };
    window._dbxFiles = { [portalRoot() + '/index.json']: JSON.stringify(_portalIdx) };
    window.dbxDownload = async p => (window._dbxFiles || {})[p] ?? null;
    window.dbxUpload = async (p, b) => { window._dbxFiles[p] = b; return { path_display: p }; };
    window._said = []; const t0 = window.toast; window.toast = (m, g) => { if (m) _said.push(String(m)); return t0(m, g); };
  });
  console.log('— ┄ v7.09 Eric\'s portal: what Phil does not get wears the dashed edge —');
  const fold = await page.evaluate(async () => {
    openPortalWin(); await renderPortalList(); _portalOpen = 0; await renderPortalList(); _visCache['oak-111aaa'] = {}; await renderPortalList();
    const txt = b => b.textContent.replace(/\s+/g, ' ').trim();
    const dashed = [...document.querySelectorAll('#portalList .only-me')].map(b => txt(b).slice(0, 28));
    const plain = [...document.querySelectorAll('#portalList .pf-acts .btn-ghost:not(.only-me)')].map(txt);
    const key = document.querySelector('#portalList .only-me-key');
    const cs = key && getComputedStyle(key);
    return { dashed, plain, key: key ? txt(key) : '', keyDashed: cs && cs.borderTopStyle === 'dashed', btnDashed: getComputedStyle(document.querySelector('#portalList .pf-acts .only-me')).outlineStyle === 'dashed' };
  });
  ok('on Eric\'s portal the Estimates, Receipts and Project Tracker plates, Rotate / Rename / Remove, the 🎛 they-can-see block and ➕ Give a job a client page all wear the dashed edge',
    fold.dashed.some(t => /Estimates/.test(t)) && fold.dashed.some(t => /Receipts/.test(t)) && fold.dashed.some(t => /Project Tracker/.test(t)) && fold.dashed.some(t => /Rotate/.test(t)) && fold.dashed.some(t => /Rename/.test(t)) && fold.dashed.some(t => /Remove/.test(t)) && fold.dashed.some(t => /They can see/.test(t)) && fold.dashed.some(t => /Give a job a client/.test(t)) && fold.btnDashed, JSON.stringify(fold));
  ok('Plans, Journal, Build List and View as are plain — Phil gets those (v7.14: Copy link and What they look at are only Eric\x27s)', fold.plain.join('|') === '📐 Plans|📖 Journal|📋 Build List|👁 View as this client', fold.plain.join('|'));
  ok('the line at the top says it in words, and names him', /dashed edge means only you see it — Phil does not/.test(fold.key) && fold.keyDashed, fold.key);
  ok('with no office crew there is nothing to keep from anyone: no dashes, no line', await page.evaluate(async () => {
    prefs.office = []; await renderPortalList();
    const r = !document.querySelector('#portalList .only-me') && !document.querySelector('#portalList .only-me-key');
    prefs.office = ['Phil']; await renderPortalList(); closePortalWin(); return r;
  }));
  ok('on Eric\'s phone the folder names are already his own — canonPath and localPath change nothing', await page.evaluate(() => {
    const a = '/Clore DayLog/App Data/Client Portal/mat-photos-oak-111aaa/m1 a.jpg';
    return canonPath(a) === a && localPath(a) === a && localPath('/Clore DayLog/Crew/Phil/photos/x.jpg') === '/Clore DayLog/Crew/Phil/photos/x.jpg';
  }));

  console.log('— 📇 v7.09 Eric\'s phone takes Phil\'s card edits —');
  ok('a card edit NEWER than his card lands (address, people, codes, notes), the card is stamped with the edit\'s time and Phil\'s name, and it is published back out', await page.evaluate(() => {
    prefs.cards = { 'oak house': { job: 'Oak House', addr: '1 Oak St', people: [{ n: 'Al', r: 'owner', tel: '907-555-0100', em: '' }], codes: [{ w: 'Gate', c: '1234' }], notes: 'dog', updated: '2026-09-20T10:00:00.000Z' },
      'pine cabin': { job: 'Pine Cabin', addr: '9 Pine Rd', people: [], codes: [], notes: '', lock: true, updated: '2026-09-20T10:00:00.000Z' } };
    _pubs = 0;
    cardEditsTake('Phil', { edits: { 'oak house': { at: '2026-09-24T09:00:00.000Z', by: 'Phil', card: { job: 'Oak House', addr: '1 Oak St, back lot', people: [{ n: 'Al', r: 'owner', tel: '907-555-0100', em: 'al@example.com' }, { n: 'Bo', r: 'plumber', tel: '', em: '' }], codes: [{ w: 'Gate', c: '4321' }], notes: 'dog · park on the gravel' } } } });
    const c = prefs.cards['oak house'];
    return c.addr === '1 Oak St, back lot' && c.people.length === 2 && c.people[0].em === 'al@example.com' && c.codes[0].c === '4321' && c.notes === 'dog · park on the gravel' && c.updated === '2026-09-24T09:00:00.000Z' && c.editedBy === 'Phil' && _pubs === 1 && _said.some(s => /Phil updated 1 job card/.test(s));
  }));
  ok('an edit OLDER than the card is left alone, and a LOCKED card is never touched, whatever the edit says', await page.evaluate(() => {
    _pubs = 0;
    cardEditsTake('Phil', { edits: { 'oak house': { at: '2026-09-23T09:00:00.000Z', by: 'Phil', card: { job: 'Oak House', addr: 'stale', people: [], codes: [], notes: '' } },
      'pine cabin': { at: '2026-09-25T09:00:00.000Z', by: 'Phil', card: { job: 'Pine Cabin', addr: 'HACKED', people: [], codes: [], notes: '' } } } });
    return prefs.cards['oak house'].addr === '1 Oak St, back lot' && prefs.cards['pine cabin'].addr === '9 Pine Rd' && prefs.cards['pine cabin'].lock === true && _pubs === 0;
  }));
  ok('the crew sweep reads card-edits.json out of an OFFICE crew folder only (Ann is field — hers is never read)', await page.evaluate(async () => {
    const reads = [];
    window.dbxList = async () => ({ entries: [{ '.tag': 'folder', name: 'Phil', path_lower: '/clore daylog/crew/phil' }, { '.tag': 'folder', name: 'Ann', path_lower: '/clore daylog/crew/ann' }] });
    window.dbxDownload = async p => { reads.push(p); if (/phil\/app data\/card-edits\.json$/.test(p)) return JSON.stringify({ edits: { 'oak house': { at: '2026-09-24T12:00:00.000Z', by: 'Phil', card: { job: 'Oak House', addr: '1 Oak St, the back lot', people: [], codes: [], notes: '' } } } }); if (/ann\/app data\/card-edits/.test(p)) return JSON.stringify({ edits: { 'oak house': { at: '2026-09-30T00:00:00.000Z', card: { job: 'Oak House', addr: 'ANN', people: [], codes: [], notes: '' } } } }); return null; };
    await checkCrewLogs();
    return prefs.cards['oak house'].addr === '1 Oak St, the back lot' && reads.some(p => /phil\/app data\/card-edits\.json$/.test(p)) && !reads.some(p => /ann\/app data\/card-edits/.test(p));
  }));
  ok('Eric saving a card stamps it — so a crew edit made before his save can never write over his', await page.evaluate(() => {
    _cardJob = 'Oak House'; openJobCard('Oak House', true); $('jcAddr').value = '2 Oak St'; cardSave();
    const c = prefs.cards['oak house'], stamped = c.updated > '2026-09-24T12:00:00.000Z';
    cardEditsTake('Phil', { edits: { 'oak house': { at: '2026-09-24T12:30:00.000Z', by: 'Phil', card: { job: 'Oak House', addr: 'late', people: [], codes: [], notes: '' } } } });
    closeReview(); return stamped && c.addr === '2 Oak St';
  }));
  ok('Eric\'s own card window still has the 👷/🔒 line, on both faces', await page.evaluate(() => {
    openJobCard('Oak House', false); const a = !!document.querySelector('#revBox .jc-lock');
    openJobCard('Oak House', true); const b = !!document.querySelector('#revBox .jc-lock'); closeReview(); return a && b;
  }));
  await ctx.close();

  // ───────────────────────── Phil's phone: OFFICE crew, the folders under his own names ─────────────────────────
  const p2ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await p2ctx.addInitScript(() => { try { localStorage.setItem('daylog-crew-name', 'Phil'); localStorage.setItem('daylog-crew-root', '/Phil'); localStorage.setItem('daylog-crew-office', '1'); localStorage.setItem('daylog-portal-root', '/Client Portal'); localStorage.setItem('daylog-crew-jobs', JSON.stringify(['Oak House'])); } catch (e) {} });
  const p2 = await p2ctx.newPage();
  p2.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push('phil: ' + e.message); });
  await p2.goto(appUrl); await p2.waitForTimeout(900);
  await p2.evaluate(() => {
    window.scheduleSave = () => {}; window.savePendingSoon = () => {}; dbx.refreshToken = 't'; window.getToken = async () => 't';
    window._files = {
      '/Client Portal/index.json': JSON.stringify({ clients: [{ key: 'oak', job: 'Oak House', code: 'oak-111aaa' }] }),
      '/Client Portal/oak-111aaa.json': JSON.stringify({ name: 'Oak House', journal: [{ released: '2026-09-22' }] }),
      '/Client Portal/materials-office-oak-111aaa.json': JSON.stringify({ full: true, seq: 2, rooms: [{ name: 'BATH', items: [{ id: 'm1', n: 'Toilet', t: 'Misc', buy: true, s: 'picked', phs: ['/Clore DayLog/App Data/Client Portal/mat-photos-oak-111aaa/m1 old.jpg'] }] }] }),
      '/Client Portal/plans-oak-111aaa.json': JSON.stringify({ slots: [{ key: 'whole', name: 'Whole project', cur: { rev: 1, date: '2026-09-01', file: '/Clore DayLog/App Data/Client Portal/Plans/oak-111aaa/whole/R1 oak.pdf', fname: 'R1 oak.pdf', note: 'first set' }, hist: [] }] }),
    };
    window._ups = [];
    window.dbxDownload = async p => Object.prototype.hasOwnProperty.call(_files, p) ? _files[p] : null;
    window.dbxUpload = async (p, b) => { _ups.push(p); if (typeof b === 'string') _files[p] = b; return { path_display: p }; };
    window.dbxList = async () => ({ entries: [{ '.tag': 'folder', name: 'Phil', path_display: '/Phil', path_lower: '/phil' }, { '.tag': 'folder', name: 'Client Portal', path_display: '/Client Portal', path_lower: '/client portal' }] });
    window._fetched = []; const f0 = window.fetch;
    window.fetch = async (u, o) => { if (/content\.dropboxapi\.com/.test(String(u))) { let p = ''; try { const a = JSON.parse(o.headers['Dropbox-API-Arg']); p = a.path || (a.resource && a.resource.path) || ''; } catch (e) {} _fetched.push(p); return new Response(new Blob(['%PDF-1.4 x'], { type: 'application/pdf' }), { status: 200, headers: { 'content-type': 'application/pdf' } }); } return f0(u, o); };
    window._said = []; const t0 = window.toast; window.toast = (m, g) => { if (m) _said.push(String(m)); return t0(m, g); };
  });
  console.log('— 🗺 v7.09 one folder, two names —');
  ok('a path stored the way Eric\'s phone sees the Client Portal folder opens under Phil\'s own name for it — and back again when Phil writes one', await p2.evaluate(() =>
    CREW_NAME === 'Phil' && amOffice() && localPath('/Clore DayLog/App Data/Client Portal/mat-photos-oak-111aaa/m1 a.jpg') === '/Client Portal/mat-photos-oak-111aaa/m1 a.jpg'
      && canonPath('/Client Portal/Plans/oak-111aaa/whole/R2 b.pdf') === '/Clore DayLog/App Data/Client Portal/Plans/oak-111aaa/whole/R2 b.pdf'
      && localPath('/Clore DayLog/Crew/Phil/photos/site.jpg') === '/Phil/photos/site.jpg' && localPath('/somewhere/else.jpg') === '/somewhere/else.jpg'));

  console.log('— 🏠 v7.09 the portal on an office phone —');
  const pf = await p2.evaluate(async () => {
    openPortalWin(); await renderPortalList(); _portalOpen = 0; await renderPortalList(); await new Promise(r => setTimeout(r, 300));
    const txt = b => b.textContent.replace(/\s+/g, ' ').trim();
    return { btns: [...document.querySelectorAll('#portalList .pf-acts button')].map(txt), all: txt($('portalList')), meter: txt(document.querySelector('#portalList .jm-word') || { textContent: '' }), dashed: document.querySelectorAll('#portalList .only-me').length };
  });
  ok('the fold reads Plans · Journal · Build List · View as — nothing else (v7.14: no Copy link, no What they look at)', pf.btns.join('|') === '📐 Plans|📖 Journal|📋 Build List|👁 View as this client', pf.btns.join('|'));
  ok('no Estimates, Receipts, Project Tracker, Rotate, Rename, Remove, no 🎛 they-can-see switches, no ➕ Give a job a client page — and no dashed edges (there is nothing to mark on his own phone)',
    !/Estimates|Receipts|Project Tracker|Rotate|Rename|Remove|They can see|Give a job a client page/.test(pf.all) && pf.dashed === 0, pf.all.slice(0, 300));
  ok('the journal meter reads the real date off the page (it said NO JOURNAL YET on every job before)', /DAYS? OLD|POSTED TODAY|POST IT NOW/.test(pf.meter) && !/NO JOURNAL YET/.test(pf.meter), pf.meter);
  ok('the foot says he is OFFICE and what is his to work', /You are OFFICE — Plans, the Journal and the Build List are yours to work/.test(pf.all));
  ok('a direct call to the estimates board or the receipts window is turned away in words — the money stays on Eric\'s phone', await p2.evaluate(async () => {
    _said.length = 0; await openEstimates(0); await openRcptReview(0);
    return _said.filter(s => /the money stays on his phone/.test(s)).length === 2 && !/— estimates/.test(($('revBox') || {}).textContent || '');
  }));
  ok('📋 Build List opens the real board (no "coming to office phones next"), reading the shared folder', await p2.evaluate(async () => {
    _said.length = 0; await openMaterials(0); _matRmShut = new Set(); renderMatMgr(); await new Promise(r => setTimeout(r, 300));
    return !!_matD && _matD.rooms.length === 1 && /Toilet/.test($('revBox').textContent) && !_said.some(s => /coming to office phones/.test(s));
  }));
  ok('a Build List photo Eric put on (stored under his name for the folder) opens on this phone under Phil\'s', await p2.evaluate(async () => {
    _fetched.length = 0; window.showPhoto('/Clore DayLog/App Data/Client Portal/mat-photos-oak-111aaa/m1 old.jpg'); await new Promise(r => setTimeout(r, 200));
    return _fetched[0] === '/Client Portal/mat-photos-oak-111aaa/m1 old.jpg';
  }));
  ok('a photo Phil adds goes up under his name for the folder and is stored under Eric\'s — so Eric\'s phone opens it too', await p2.evaluate(async () => {
    const it = _matD.rooms[0].items[0];
    await matAddPhotos('m1', [new File(['x'], 'new.jpg', { type: 'image/jpeg' })]);
    return _ups.some(p => p === '/Client Portal/mat-photos-oak-111aaa/m1 new.jpg') && it.phs[1] === '/Clore DayLog/App Data/Client Portal/mat-photos-oak-111aaa/m1 new.jpg';
  }));
  ok('📐 Plans opens the rack; the current set (stored under Eric\'s name) opens under Phil\'s', await p2.evaluate(async () => {
    matClose(); await openPlanRack(0); await new Promise(r => setTimeout(r, 200));
    const rack = /plan rack/.test($('revBox').textContent) && /OPEN THE CURRENT SET — R1/.test($('revBox').textContent);
    _fetched.length = 0; pkOpen('whole'); await new Promise(r => setTimeout(r, 200));
    return rack && _fetched[0] === '/Client Portal/Plans/oak-111aaa/whole/R1 oak.pdf';
  }));
  ok('a new set Phil stamps goes up INSIDE the shared folder (Plans/<code>/<slot>/) and is stored under Eric\'s name for it', await p2.evaluate(async () => {
    _pkPend.whole = new File(['%PDF-1.4'], 'oak rev 2.pdf', { type: 'application/pdf' }); renderPlanRack(); $('pkNote-whole').value = 'garage moved';
    await pkStamp('whole');
    const s = _pkD.slots[0];
    return _ups.includes('/Client Portal/Plans/oak-111aaa/whole/R2 oak rev 2.pdf') && s.cur.rev === 2 && s.cur.file === '/Clore DayLog/App Data/Client Portal/Plans/oak-111aaa/whole/R2 oak rev 2.pdf' && s.hist[0].rev === 1 && _ups.includes('/Client Portal/plans-oak-111aaa.json');
  }));
  ok('the picture on a FROM ERIC note (copied into his crew folder under Eric\'s name) opens under Phil\'s', await p2.evaluate(async () => {
    closePlanRack(); _fetched.length = 0; window.showPhoto('/Clore DayLog/Crew/Phil/photos/site.jpg'); await new Promise(r => setTimeout(r, 200));
    return _fetched[0] === '/Phil/photos/site.jpg';
  }));

  console.log('— 📇 v7.09 job cards on an office phone —');
  ok('a card Eric handed out reads with the hand-out ticks and ✎ Edit — and WITHOUT the 👷/🔒 line', await p2.evaluate(() => {
    crewCards = { 'oak house': { job: 'Oak House', addr: '1 Oak St', people: [{ n: 'Al', r: 'owner', tel: '907-555-0100', em: '' }], codes: [{ w: 'Gate', c: '1234' }], notes: 'dog', updated: '2026-09-20T10:00:00.000Z' } };
    openJobCard('Oak House');
    const t = $('revBox').textContent;
    return /1 Oak St/.test(t) && /Hand out this job/.test(t) && !!document.querySelector('#revBox .jc-edit') && !document.querySelector('#revBox .jc-lock') && /You can edit them/.test(t);
  }));
  ok('✎ Edit opens the form — no 👷/🔒 line on it either', await p2.evaluate(() => {
    openJobCard('Oak House', true);
    return !!$('jcAddr') && $('jcAddr').value === '1 Oak St' && !document.querySelector('#revBox .jc-lock') && _jcEdit === true;
  }));
  const saved = await p2.evaluate(async () => {
    $('jcAddr').value = '1 Oak St, back lot'; $('jcNotes').value = 'dog · park on the gravel';
    cardAddPerson(); $('jcPn1').value = 'Bo'; $('jcPr1').value = 'plumber';
    cardSave(); await new Promise(r => setTimeout(r, 200));
    const f = JSON.parse(_files['/Phil/App Data/card-edits.json'] || '{}');
    const e = (f.edits || {})['oak house'] || {};
    return { up: _ups.includes('/Phil/App Data/card-edits.json'), by: f.by, addr: (e.card || {}).addr, people: ((e.card || {}).people || []).map(p => p.n).join(','), notes: (e.card || {}).notes, at: e.at, local: crewCards['oak house'].addr, face: !_jcEdit && /back lot/.test($('revBox').textContent), said: _said.some(s => /Eric's phone gets it on its next sync/.test(s)) };
  });
  ok('✓ Save writes the edit into HIS OWN folder (App Data/card-edits.json — the folder Eric\'s sweep reads): the address, the new person, the notes, his name and the time', saved.up && saved.by === 'Phil' && saved.addr === '1 Oak St, back lot' && saved.people === 'Al,Bo' && saved.notes === 'dog · park on the gravel' && /^\d{4}-\d{2}-\d{2}T/.test(saved.at || ''), JSON.stringify(saved));
  ok('the card on his own screen shows the edit at once, back on the reading face, and the toast says Eric gets it on the next sync', saved.local === '1 Oak St, back lot' && saved.face && saved.said, JSON.stringify(saved));
  ok('Eric\'s cards arriving again (older than the edit) do not wipe it — his edit stays on top until Eric\'s copy carries it', await p2.evaluate(async () => {
    _files['/Phil/shared.json'] = JSON.stringify({ from: 'Eric', cards: { 'oak house': { job: 'Oak House', addr: '1 Oak St', people: [{ n: 'Al', r: 'owner', tel: '907-555-0100', em: '' }], codes: [{ w: 'Gate', c: '1234' }], notes: 'dog', updated: '2026-09-20T10:00:00.000Z' } } });
    await checkSharedNotes();
    return crewCards['oak house'].addr === '1 Oak St, back lot' && crewCards['oak house'].people.length === 2 && !!cardEditsMine()['oak house'];
  }));
  ok('once Eric\'s copy carries it (his card stamped with the edit\'s time, or newer) the local edit lets go and Eric\'s words win', await p2.evaluate(async () => {
    const at = cardEditsMine()['oak house'].at;
    _files['/Phil/shared.json'] = JSON.stringify({ from: 'Eric', cards: { 'oak house': { job: 'Oak House', addr: '1 Oak St, back lot (Eric)', people: [], codes: [], notes: '', updated: at } } });
    await checkSharedNotes();
    return crewCards['oak house'].addr === '1 Oak St, back lot (Eric)' && !cardEditsMine()['oak house'];
  }));
  ok('a card Eric locked never reaches this phone at all, so there is nothing to edit; and the 👷/🔒 switch does nothing here', await p2.evaluate(() => {
    const before = JSON.stringify(crewCards); cardLock(); return JSON.stringify(crewCards) === before && !crewCards['pine cabin'];
  }));

  console.log('— 👷 v7.09 a FIELD crew phone is as it was —');
  ok('read-only cards (no ✎ Edit, no form), and the portal fold is the plain 👁 Open the client\'s page', await p2.evaluate(async () => {
    lsSet('daylog-crew-office', ''); _portalRoot = ''; _rootHunted = true;
    openJobCard('Oak House'); const card = !document.querySelector('#revBox .jc-edit') && !document.querySelector('#revBox .jc-lock') && !$('jcAddr') && cardRead() === null;
    _files['/Phil/portal.json'] = JSON.stringify({ clients: [{ job: 'Oak House', code: 'oak-111aaa' }] });
    closeReview(); openPortalWin(); await renderPortalList(); _portalOpen = 0; await renderPortalList();
    const t = $('portalList').textContent;
    return card && /Open the client's page/.test(t) && !/Build List|Plans|Journal/.test(t);
  }));
  ok('an OFFICE phone whose share has not turned up gets the field fold plus the words that say why — never the office buttons writing into its own folder', await p2.evaluate(async () => {
    lsSet('daylog-crew-office', '1'); _portalRoot = ''; _rootHunted = true;
    await renderPortalList(); _portalOpen = 0; await renderPortalList();
    const t = $('portalList').textContent;
    return /You are OFFICE, but the shared Client Portal folder has not turned up/.test(t) && !/Build List/.test(t) && /Open the client's page/.test(t);
  }));
  await p2ctx.close();

  ok('no page errors', errs.length === 0, errs.join(' | '));
  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close(); process.exit(fail ? 1 : 0);
})();
