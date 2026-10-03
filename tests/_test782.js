// 👁 🔀 📌 v7.82 — THE OFFICE CREW LOOK AT THE ESTIMATES; FLIP BETWEEN THE BUILD LIST AND THE ESTIMATES; THE HIT LIST.
// Eric: "im ready for phil to see money. never crew pay but billable labor rates is fine. and he can see the estimates page now and
// teh build list for sure , also want him to see view as the client. the schedule for sure. go on the buttons and hit list" — after
// "is the build list and the estimates pages connected? I feel like i should be able to switch between them with a button on each
// category … i want to make a hit list and put it in priority order so that he can click on a project and have the list that needs
// to be done in order … as i'm workking on estimates or build list i can send to phils hit list and pull it up and reorder it".
// Also in this build: "the running log should be foldable", "the money charts are really big on pc almost hard to see", and a
// Rotate that left a job's boards behind under the old code. Eric's phone (a made-up Dropbox), a PC-wide window, then a REAL
// reload as an office crew phone with the shared folder under its own name, and as a field phone. Every name and figure made up.
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
  const CODE = 'oak-111111', CODE2 = 'pine-222222';
  const board = () => ({ mk: 20, cats: [
    { n: 'Framing', appr: false, bids: [{ e1: 12000, e2: 3000, n1: 'crew labor', n2: 'lumber', acc: true, note: 'crew and lumber' }, { e1: 800, e2: 0 }] },
    { n: 'Roofing', appr: true, bids: [{ e1: 9000, e2: 0, acc: true }] },
    { n: 'Plumbing', appr: false, bids: [{ e1: 4000, e2: 0, acc: true }],
      pend: [{ a: 500, v: 'Pipe Supply Co', ts: '2026-09-20', base: 0, eid: 7 }, { a: 1240, v: '', ts: '2026-09-21', base: 0, kind: 'labor', wk: '2026-09-13', hrs: 16, inc: true }] },
    { n: 'Kitchen cabinets', appr: false, bids: [] }] });
  const pg = () => ({ name: 'Oak House', updated: '2026-09-28', show: { money: true }, invoiced: 0, paid: 0, open: 0, journal: [], phases: [], budget: [{ n: 'Roofing', est: 10800 }], upcoming: { items: [{ n: 'Plumbing', a: 600 }, { n: 'Labor — week of Sep 13 (16 h)', a: 1240 }], tot: 1840, all: 1 } });
  const matOff = () => ({ full: true, seq: 6, rooms: [
    { name: 'KITCHEN', items: [{ id: 'm1', n: 'Kitchen sink', buy: true, s: 'picked', ec: 'Plumbing' }, { id: 'm2', n: 'Cabinet pulls', buy: true, s: 'pick', ec: 'Kitchen cabinets' }, { id: 'm3', n: 'Check the vent', s: 'todo' }] },
    { name: 'Framing', items: [{ id: 'm4', n: 'Order the trusses', buy: true, s: 'pick' }] },
    { name: 'PUNCH LIST', items: [{ id: 'm5', n: 'Touch up paint', s: 'todo' }] }] });
  const txt = el => el.textContent.replace(/\s+/g, ' ').trim();

  // ───────────────────────── Eric's phone ─────────────────────────
  const ectx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await ectx.route(u => !/^file:/.test(u.href), r => r.abort());
  const page = await ectx.newPage();
  page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
  await page.goto(appUrl); await page.waitForTimeout(700);
  await page.evaluate(([CODE, CODE2, b, p, m]) => {
    jobs = ['Oak House', 'Pine Cabin']; crew = ['Phil', 'Ann']; todos = []; nextId = 20; prefs.office = ['Phil'];
    entries = [{ id: 7, type: 'Note', job: 'Oak House', ts: new Date('2026-09-20T10:00:00'), details: 'Pipe fittings for the kitchen', ai: '📅 9/20/2026\n🏪 Pipe Supply Co\n💵 $500.00', rcpt: true, category: 'Plumbing', budg: 'sent', who: 'Me', tags: [] },
      { id: 8, type: 'Note', job: 'Oak House', ts: new Date('2026-09-22T10:00:00'), details: 'Walked the framing with the crew', who: 'Me', tags: [] },
      { id: 9, type: 'Note', job: 'Pine Cabin', ts: new Date('2026-09-23T10:00:00'), details: 'Measured the porch', who: 'Me', tags: [] }];
    window._saves = 0; window.scheduleSave = () => { window._saves++; }; dbx.refreshToken = 'test-token';
    window.publishSharedNotes = async () => {}; window.savePendingSoon = () => {};
    _portalIdx = { clients: [{ key: 'oak', job: 'Oak House', code: CODE }, { key: 'pine', job: 'Pine Cabin', code: CODE2 }] };
    const R = portalRoot();
    window._dbxFiles = { [R + '/index.json']: JSON.stringify(_portalIdx), [estPath(CODE)]: JSON.stringify(b), [R + '/' + CODE + '.json']: JSON.stringify(p),
      [R + '/materials-office-' + CODE + '.json']: JSON.stringify(m), [R + '/' + CODE2 + '.json']: JSON.stringify({ name: 'Pine Cabin', journal: [] }) };
    window._ups = []; window._moves = []; window._hitDown = false;
    window.dbxDownload = async q => (window._hitDown && /hitlist-/.test(q)) ? null : ((window._dbxFiles || {})[q] ?? null);
    window.dbxUpload = async (q, body) => { (window._dbxFiles || {})[q] = body; window._ups.push(q); return { path_display: q }; };
    window.dbxPathExists = async q => (window._hitDown && /hitlist-/.test(q)) ? true : Object.prototype.hasOwnProperty.call(window._dbxFiles || {}, q);
    window.dbxRpc = async (ep, a) => { if (ep === 'files/move_v2') { window._moves.push([a.from_path, a.to_path]); return window._moveRefused && window._moveRefused(a) ? { error_summary: 'from_lookup/not_found/' } : { metadata: { '.tag': 'file' } }; } return {}; };
    window.dbxList = async a => ({ entries: Object.keys(window._dbxFiles).filter(k => k.startsWith(a.path + '/') && !k.slice(a.path.length + 1).includes('/')).map(k => ({ '.tag': 'file', name: k.slice(a.path.length + 1), path_display: k })) });
    window._said = []; const t0 = window.toast; window.toast = (m2, g) => { if (m2) _said.push(String(m2)); return t0(m2, g); };
    const u0 = window.toastUndo; window.toastUndo = (m2, fn) => { _said.push(String(m2)); return u0(m2, fn); };
    window.hitFile = code => { try { return JSON.parse(window._dbxFiles[portalRoot() + '/hitlist-' + code + '.json'] || 'null'); } catch (e) { return null; } };
  }, [CODE, CODE2, board(), pg(), matOff()]);
  const wait = ms => page.waitForTimeout(ms);
  const said = re => page.evaluate(s => _said.some(x => new RegExp(s).test(x)), re.source);
  const clear = () => page.evaluate(() => { _said.length = 0; _ups.length = 0; });

  console.log('— 🏠 the fold on his own phone —');
  const fold = await page.evaluate(async () => {
    openPortalWin(); await renderPortalList(); _portalOpen = 0; await renderPortalList(); await new Promise(r => setTimeout(r, 400));
    const t = b => b.textContent.replace(/\s+/g, ' ').trim();
    const btns = [...document.querySelectorAll('#portalList .pf-acts button')];
    return { words: btns.map(t), estMine: btns.find(b => /Estimates/.test(b.textContent)).classList.contains('only-me'), rcptMine: btns.find(b => /Receipts/.test(b.textContent)).classList.contains('only-me'),
      top: t($('pfHitTop') || { textContent: '' }), wide: document.documentElement.scrollWidth <= innerWidth + 1 };
  });
  ok('his fold has 💰 Estimates, 📅 Schedule and 📌 Hit list right after the Build List', fold.words.slice(0, 6).join('|') === '📐 Plans|📖 Journal|📋 Build List|💰 Estimates|📅 Schedule|📌 Hit list', fold.words.join('|'));
  ok('💰 Estimates no longer wears the only-you dashed edge (the office looks at it now); 🧾 Receipts still does', fold.estMine === false && fold.rcptMine === true);
  ok('the top of the portal has one door to every job\'s hit list; nothing runs off the side at 390px', /📌 Hit lists — what to do next, job by job/.test(fold.top) && fold.wide, fold.top);

  console.log('— 💰 the estimates on his phone: as ever, plus two doors —');
  await page.evaluate(async () => { await openEstimates(0); }); await wait(900); await clear();
  const ci = n => page.evaluate(n => _estD.cats.findIndex(x => x.n === n), n);
  const plumb = await ci('Plumbing'), fram = await ci('Framing'), roof = await ci('Roofing');
  await page.evaluate(k => { _estOpenCats = new Set([k]); renderEstimates(); }, plumb);
  const e1 = await page.evaluate(k => { const b = document.querySelector('.est-board'), row = b.querySelector(`.est-row[data-ci="${k}"]`);
    return { ro: b.classList.contains('est-ro') || !!$('estRoSay'), inputsOff: [...b.querySelectorAll('input')].filter(i => i.disabled).length, bills: [...b.querySelectorAll('button, [role="button"]')].some(el => /Bills that came in|BILLS THAT CAME IN/.test(el.textContent)), newCat: !!$('estNewCat'),
      flipBtn: (row.querySelector('.est-flip-btn') || {}).textContent || '', flipRoll: (row.querySelector('.est-flip') || {}).textContent || '', hitAdd: (row.querySelector('.est-hit-add') || {}).textContent || '', door: ($('estHitDoor') || {}).textContent || '',
      back: !!$('estFlipBack') }; }, plumb);
  ok('on his own phone the board is not look-only: boxes open, the bills strip and ➕ category are there', !e1.ro && e1.inputsOff === 0 && e1.bills && e1.newCat, JSON.stringify(e1));
  ok('an open category has 📋 Build List — how many rows are tied to it — and the roll-up words on the row are a door too', /📋 Build List — 1 row on this line ›/.test(e1.flipBtn) && /📋 1 on the build list/.test(e1.flipRoll), JSON.stringify([e1.flipBtn, e1.flipRoll]));
  ok('…and 📌 To the hit list; the board\'s top has the 📌 Hit list door', /📌 To the hit list/.test(e1.hitAdd) && /📌 Hit list ›/.test(e1.door) && !e1.back, JSON.stringify([e1.hitAdd, e1.door]));

  console.log('— 🔀 💰 → 📋 : from an estimate category to the Build List —');
  await page.evaluate(k => { estBidSet(k, 0, 'e1', '4500'); }, plumb);   // a change still waiting to be saved
  await page.click(`.est-row[data-ci="${plumb}"] .est-flip-btn`); await wait(900);
  const f1 = await page.evaluate(([CODE]) => { const t = el => el ? el.textContent.replace(/\s+/g, ' ').trim() : '';
    return { saved: JSON.parse(_dbxFiles[estPath(CODE)]).cats.find(x => x.n === 'Plumbing').bids[0].e1, upFirst: _ups[0], head: t(document.querySelector('#revBox h3')), chip: t($('matEcF')), back: t($('matFlipBack')),
      rows: [...document.querySelectorAll('#revBox .mat-item')].map(r => r.dataset.id), cats: [...document.querySelectorAll('#revBox .mat-rm-head')].map(h => t(h.querySelector('button'))), estGone: _estD === null }; }, [CODE]);
  ok('the change that was waiting is saved FIRST (the board file holds the new number before the Build List opens)', f1.saved === 4500 && /estimates-oak-111111\.json$/.test(f1.upFirst || ''), JSON.stringify([f1.saved, f1.upFirst]));
  ok('the Build List opens in the same window, narrowed to the rows tied to that line — said in words, with ✕ show the whole board', /Build List/.test(f1.head) && /Showing only the rows tied to the estimate line Plumbing — 1 row/.test(f1.chip) && /show the whole board/.test(f1.chip) && f1.rows.join() === 'm1' && f1.cats.length === 1 && /KITCHEN/.test(f1.cats[0]) && f1.estGone, JSON.stringify(f1));
  ok('↩ Back to the 💰 estimates — Plumbing sits at the top', /↩ Back to the 💰 estimates — Plumbing/.test(f1.back), f1.back);
  await page.click('#matEcF button'); await wait(200);
  ok('✕ show the whole board: every category and row is back (the way back stays)', await page.evaluate(() => !$('matEcF') && document.querySelectorAll('#revBox .mat-item').length === 5 && !!$('matFlipBack')));
  await page.click('#matFlipBack'); await wait(900);
  const f2 = await page.evaluate(k => ({ est: !!document.querySelector('#revBox .est-board'), open: [..._estOpenCats], val: ($('estE1-' + k + '-0') || {}).value, back: !!$('estFlipBack'), matBack: !!$('matFlipBack') }), plumb);
  ok('↩ lands back on the estimates with that category open and the number he typed', f2.est && f2.open.includes(plumb) && f2.val === '4500' && !f2.back && !f2.matBack, JSON.stringify(f2));

  console.log('— 🔀 📋 → 💰 : from a Build List row, and from a category —');
  await page.evaluate(async () => { closeEstimates(); await openMaterials(0); _matRmShut = new Set([1, 2]); _matQ = ''; renderMatMgr(); }); await wait(500);
  const rowDoor = await page.evaluate(() => { const r = document.querySelector('#revBox .mat-item[data-id="m1"]'); const d = r.querySelector('.mat-flip-ec'); return { t: d ? d.textContent : '', tools: [...document.querySelectorAll('#revBox .mat-rm-head')].map(h => !!h.querySelector('.mat-rm-est')) }; });
  ok('a row tied to an estimate line wears it as a door (💰 Plumbing ›); every category heading has a 💰', /💰 Plumbing ›/.test(rowDoor.t) && rowDoor.tools.length === 3 && rowDoor.tools.every(Boolean), JSON.stringify(rowDoor));
  await page.click('#revBox .mat-item[data-id="m1"] .mat-flip-ec'); await wait(900);
  const f3 = await page.evaluate(k => ({ est: !!document.querySelector('#revBox .est-board'), open: [..._estOpenCats], back: ($('estFlipBack') || {}).textContent || '', only: !!$('estOnly'), top: (document.querySelector(`.est-row[data-ci="${k}"]`) || { getBoundingClientRect: () => ({ top: 9999 }) }).getBoundingClientRect().top }), plumb);
  ok('the estimates open at THAT line — open, brought to the top — with ↩ Back to the 📋 Build List — <the row>', f3.est && f3.open.join() === String(plumb) && /↩ Back to the 📋 Build List — Kitchen sink/.test(f3.back) && !f3.only && f3.top < 400, JSON.stringify(f3));
  await page.click('#estFlipBack'); await wait(700);
  const f4 = await page.evaluate(() => ({ mat: !!$('matSaveWord'), shut: [..._matRmShut].sort().join(), here: !!document.querySelector('#revBox .mat-item.flip-here[data-id="m1"]'), back: !!$('matFlipBack') }));
  ok('↩ comes back to the Build List as he left it (the same categories folded), the row he came from shown for a moment', f4.mat && f4.shut === '1,2' && f4.here && !f4.back, JSON.stringify(f4));
  await page.click('#revBox .set-section[data-ri="0"] .mat-rm-est'); await wait(900);
  const f5 = await page.evaluate(() => ({ only: $('estOnly') ? $('estOnly').textContent.replace(/\s+/g, ' ').trim() : '', rows: [...document.querySelectorAll('.est-board .est-row')].map(r => r.querySelector('.est-name').textContent.replace(/^[▸▾]\s*/, '').trim()), back: ($('estFlipBack') || {}).textContent || '' }));
  ok('a category whose rows are tied to SEVERAL lines → the estimates narrowed to just those lines, in words', /Showing only KITCHEN — 2 estimate lines/.test(f5.only) && f5.rows.slice().sort().join('|') === 'Kitchen cabinets|Plumbing' && /Build List — KITCHEN/.test(f5.back), JSON.stringify(f5));
  await page.click('#estOnly button'); await wait(200);
  ok('✕ show everything: the whole board again', await page.evaluate(() => !$('estOnly') && document.querySelectorAll('.est-board .est-row').length >= 50));
  await page.click('#estFlipBack'); await wait(700);
  await page.click('#revBox .set-section[data-ri="1"] .mat-rm-est'); await wait(900);
  ok('a category named like a cost line (Framing) flips to that line though no row is tied', await page.evaluate(k => !!document.querySelector('#revBox .est-board') && [..._estOpenCats].join() === String(k), fram));
  await page.click('#estFlipBack'); await wait(700); await clear();
  await page.click('#revBox .set-section[data-ri="2"] .mat-rm-est'); await wait(400);
  ok('a category with nothing tied says how to tie a row — and stays on the Build List', (await said(/Nothing here is tied to an estimate line yet/)) && await page.evaluate(() => !!$('matSaveWord') && !document.querySelector('#revBox .est-board')));

  console.log('— 📌 onto the hit list from the estimates —');
  await page.evaluate(async k => { matClose(); await openEstimates(0); _estOpenCats = new Set([k]); renderEstimates(); }, fram); await wait(900); await clear();
  await page.click(`.est-row[data-ci="${fram}"] .est-hit-add`); await wait(200);
  const a1 = await page.evaluate(() => { const b = $('hitAddBox'); return b ? { words: $('hitAddT').value, kind: (b.querySelector('.hit-kinds .pick-chip.sel') || {}).dataset.k, where: txt2(b.querySelector('.hit-where .pick-chip.sel')), src: /the estimates · Framing/.test(b.textContent), board: !!document.querySelector('#revBox .est-board') } : null; function txt2(el) { return el ? el.textContent.replace(/\s+/g, ' ').trim() : ''; } });
  ok('a small box opens OVER the board: the category\'s name is already in the words, the kind is 💰 bid, it goes to the bottom unless he says top', a1 && a1.words === 'Framing: ' && a1.kind === 'bid' && /Bottom of the list/.test(a1.where) && a1.src && a1.board, JSON.stringify(a1));
  await page.fill('#hitAddT', 'Framing: get a second bid'); await page.click('.hit-add-go'); await wait(300);
  const a2 = await page.evaluate(([CODE, k]) => ({ f: hitFile(CODE), box: !!$('hitAddBox'), plate: (document.querySelector(`.est-row[data-ci="${k}"] .est-hit-add`) || {}).textContent || '', door: ($('estHitDoor') || {}).textContent || '', board: !!document.querySelector('#revBox .est-board'), toast: $('toast').textContent, ups: _ups.slice() }), [CODE, fram]);
  ok('the line lands in the job\'s own hit list file — its words, its kind, who and when, and where it came from', a2.f && a2.f.lines.length === 1 && a2.f.lines[0].t === 'Framing: get a second bid' && a2.f.lines[0].k === 'bid' && a2.f.lines[0].by === 'Eric' && !!a2.f.lines[0].at && JSON.stringify(a2.f.lines[0].src) === '{"from":"est","name":"Framing"}', JSON.stringify(a2.f));
  ok('the board is not left: the box closes, a toast says it with Undo, the plate reads ✓ ON THE HIT LIST and the door counts 1 to do', !a2.box && a2.board && /On the hit list: Framing: get a second bid/.test(a2.toast) && /Undo/.test(a2.toast) && /📌 ✓ ON THE HIT LIST — add another/.test(a2.plate) && /📌 Hit list · 1 to do ›/.test(a2.door), JSON.stringify([a2.toast, a2.plate, a2.door]));
  ok('only the hit list file was written — not the estimates, not their page', a2.ups.length === 1 && /hitlist-oak-111111\.json$/.test(a2.ups[0]), JSON.stringify(a2.ups));
  await page.evaluate(k => { _estOpenCats = new Set([k]); renderEstimates(); }, roof);
  await page.click(`.est-row[data-ci="${roof}"] .est-hit-add`); await wait(150);
  await page.fill('#hitAddT', 'Roofing: confirm the start date'); await page.click('#hitAddBox .hit-where .pick-chip:nth-child(2)'); await wait(100);
  const kept = await page.evaluate(() => $('hitAddT').value);
  await page.click('#hitAddBox .hit-kinds .pick-chip[data-k="call"]'); await wait(100); await page.click('.hit-add-go'); await wait(300);
  ok('⤒ Top — do it next puts the new line FIRST; what he typed stays through the taps on the box\'s plates; the kind he picked rides', kept === 'Roofing: confirm the start date' && await page.evaluate(([CODE]) => { const l = hitFile(CODE).lines; return l.length === 2 && l[0].t === 'Roofing: confirm the start date' && l[0].k === 'call' && l[1].t === 'Framing: get a second bid'; }, [CODE]));

  console.log('— 📌 onto the hit list from a Build List row —');
  await page.evaluate(async () => { closeEstimates(); await openMaterials(0); _matRmShut = new Set(); renderMatMgr(); matEditOpen('m1'); }); await wait(500);
  const d1 = await page.evaluate(() => { const s = $('matSheet'); return { hit: (s.querySelector('.ms-hit') || {}).textContent || '', flip: (s.querySelector('.ms-flip') || {}).textContent || '' }; });
  ok('the row\'s ✎ window has 💰 Its price — the estimates at its line, and 📌 Send to the hit list', /💰 Its price — the estimates at Plumbing ›/.test(d1.flip) && /📌 Send to the hit list/.test(d1.hit), JSON.stringify(d1));
  await page.click('#matSheet .ms-hit'); await wait(200);
  const d2 = await page.evaluate(() => ({ words: $('hitAddT').value, kind: ($('hitAddBox').querySelector('.hit-kinds .pick-chip.sel') || {}).dataset.k, src: /the Build List · KITCHEN · Kitchen sink/.test($('hitAddBox').textContent) }));
  await page.fill('#hitAddT', 'Kitchen sink: order it this week'); await page.click('.hit-add-go'); await wait(400);
  const d3 = await page.evaluate(([CODE]) => ({ l: hitFile(CODE).lines, small: (document.querySelector('#revBox .mat-item[data-id="m1"] .mat-nm') || {}).textContent || '', hit2: ($('matSheet') && $('matSheet').querySelector('.ms-hit') || {}).textContent || '' }), [CODE]);
  ok('the row\'s name is in the words and the kind is 🛒 pick / order (a thing to buy); the line remembers the row', d2.words === 'Kitchen sink: ' && d2.kind === 'buy' && d2.src && d3.l.length === 3 && JSON.stringify(d3.l[2].src) === '{"from":"mat","name":"Kitchen sink","id":"m1","room":"KITCHEN"}', JSON.stringify([d2, d3.l[2]]));
  ok('the row says 📌 on the hit list in its small words, and its window\'s plate reads ✓ ON THE HIT LIST', /📌 on the hit list/.test(d3.small) && /📌 ✓ ON THE HIT LIST/.test(d3.hit2), JSON.stringify([d3.small, d3.hit2]));

  console.log('— 📌 the hit list window —');
  await page.evaluate(() => { matEditClose(); }); await wait(100);
  await page.click('#matHitDoor'); await wait(500);
  const rowsNow = () => page.evaluate(() => [...document.querySelectorAll('#hitList .hit-row')].map(r => ({ id: r.dataset.id, t: r.querySelector('.hit-top-line b').textContent, next: r.classList.contains('hit-next'), tag: (r.querySelector('.hit-nexttag') || {}).textContent || '', n: (r.querySelector('.hit-n') || {}).textContent || '', small: r.querySelector('small').textContent.replace(/\s+/g, ' ').trim(), up: r.querySelectorAll('.hit-mv')[0].disabled, down: r.querySelectorAll('.hit-mv')[1].disabled })));
  const h1 = await page.evaluate(() => ({ head: document.querySelector('#hitBox h3').textContent.replace(/\s+/g, ' ').trim(), back: ($('hitBackBtn') || {}).textContent || '', count: $('hitCount').textContent.replace(/\s+/g, ' ').trim(), sel: $('hitJob').value, wide: $('revBox').scrollWidth <= $('revBox').clientWidth + 1 }));
  let rows = await rowsNow();
  ok('the 📌 door on the Build List opens that job\'s list in the same window, with ↩ Back to the 📋 Build List', /📌 Oak House — hit list/.test(h1.head) && /↩ Back to the 📋 Build List/.test(h1.back) && h1.sel === CODE && /3 to do/.test(h1.count) && h1.wide, JSON.stringify(h1));
  ok('the lines are in order; the first wears ▸ NEXT (the word, and its edge), the rest their number', rows.length === 3 && rows[0].next && rows[0].tag === '▸ NEXT' && rows[1].n === '2.' && rows[2].n === '3.' && rows.map(r => r.t).join('|') === 'Roofing: confirm the start date|Framing: get a second bid|Kitchen sink: order it this week', JSON.stringify(rows));
  ok('each line says its kind in words, where it came from, who put it on and when; ⬆ is off on the first, ⬇ on the last', /^call · 💰 Roofing · from you/.test(rows[0].small) && /^bid · 💰 Framing/.test(rows[1].small) && /^pick \/ order · 📋 Kitchen sink/.test(rows[2].small) && rows[0].up && !rows[0].down && rows[2].down && !rows[2].up, JSON.stringify(rows.map(r => r.small)));
  const sizes = await page.evaluate(() => { const r = document.querySelector('#hitList .hit-row'); const q = s => r.querySelector(s).getBoundingClientRect(); return { ck: [q('.hit-ck').width, q('.hit-ck').height], mv: [q('.hit-mv').width, q('.hit-mv').height], words: q('.hit-words').width }; });
  ok('at 390px the done box and the ⬆ ⬇ plates take a thumb (40px or more) and the words keep room to read', sizes.ck[0] >= 44 && sizes.ck[1] >= 44 && sizes.mv[0] >= 40 && sizes.mv[1] >= 44 && sizes.words >= 180, JSON.stringify(sizes));
  await page.click('#hitList .hit-row:nth-child(1) .hit-mv:nth-child(2)'); await wait(250);
  rows = await rowsNow();
  ok('⬇ moves a line down one place — on the screen and in the file — and ▸ NEXT moves to the new first line', rows.map(r => r.t).join('|') === 'Framing: get a second bid|Roofing: confirm the start date|Kitchen sink: order it this week' && rows[0].next && await page.evaluate(([CODE]) => hitFile(CODE).lines.map(l => l.t.split(':')[0]).join('|') === 'Framing|Roofing|Kitchen sink', [CODE]), JSON.stringify(rows.map(r => r.t)));
  await page.fill('#hitNewT', 'Call the inspector about the footing'); await page.click('#hitNewKinds .pick-chip[data-k="call"]'); await wait(100);
  const keptNew = await page.evaluate(() => $('hitNewT').value);
  await page.press('#hitNewT', 'Enter'); await wait(300);
  rows = await rowsNow();
  ok('a line typed in the window itself joins the bottom (Enter adds it; the words stay while he picks its kind) — no source on it', keptNew === 'Call the inspector about the footing' && rows.length === 4 && rows[3].t === 'Call the inspector about the footing' && /^call · from you/.test(rows[3].small) && await page.evaluate(([CODE]) => { const l = hitFile(CODE).lines[3]; return l.k === 'call' && !l.src && $('hitNewT').value === ''; }, [CODE]), JSON.stringify(rows[3]));
  await page.click('#hitList .hit-row:nth-child(4) .hit-words'); await wait(150);
  const o1 = await page.evaluate(() => { const o = document.querySelector('#hitList .hit-row.open .hit-open'); return o ? { acts: [...o.querySelectorAll('.hit-acts button')].map(b => b.textContent.replace(/\s+/g, ' ').trim()), boxes: o.querySelectorAll('textarea').length, kinds: o.querySelectorAll('.hit-kinds .pick-chip').length } : null; });
  ok('a tap on the words opens the line: its words, a note, its kind, ⤒ To the top, ✕ Take it off the list, ▴ Fold', o1 && o1.boxes === 2 && o1.kinds === 5 && o1.acts.join('|') === '⤒ To the top — do it next|✕ Take it off the list|▴ Fold', JSON.stringify(o1));
  const id4 = rows[3].id;
  await page.fill(`#hitN-${id4}`, 'ask for Thursday morning'); await page.click(`#hitT-${id4}`); await wait(250);
  await page.fill(`#hitT-${id4}`, 'Call the inspector about the footing and the slab'); await page.click('#hitList .hit-row.open .hit-acts .hit-totop'); await wait(350);
  rows = await rowsNow();
  ok('the words and the note save as he leaves each box (the tap that follows still lands: ⤒ sent it to the top)', rows[0].t === 'Call the inspector about the footing and the slab' && rows[0].next && /🗒 ask for Thursday morning/.test(rows[0].small) && await page.evaluate(([CODE]) => { const l = hitFile(CODE).lines[0]; return l.t === 'Call the inspector about the footing and the slab' && l.note === 'ask for Thursday morning'; }, [CODE]), JSON.stringify(rows[0]));
  await clear();
  await page.click('#hitList .hit-row:nth-child(1) .hit-ck'); await wait(300);
  const dn = await page.evaluate(([CODE]) => ({ open: document.querySelectorAll('#hitList .hit-row').length, fold: ($('hitDoneFold') || {}).textContent || '', l: hitFile(CODE).lines.find(x => /inspector/.test(x.t)), toast: $('toast').textContent, count: $('hitCount').textContent }), [CODE]);
  ok('the box on the left marks it done: it leaves the list for ▸ ✓ DONE — 1, the file says who and when, the toast offers Undo', dn.open === 3 && /▸ ✓ DONE — 1/.test(dn.fold) && dn.l.doneBy === 'Eric' && !!dn.l.done && /✓ Done — Call the inspector/.test(dn.toast) && /Undo/.test(dn.toast) && /3 to do · 1 done/.test(dn.count), JSON.stringify(dn));
  await page.click('#hitDoneFold'); await wait(150);
  ok('the done fold opens: the line struck through, "✓ done <day> by you"; its box puts it back on the list', await page.evaluate(() => { const r = document.querySelector('#hitDoneList .hit-row.done'); return !!r && /✓ done .* by you/.test(r.querySelector('small').textContent) && getComputedStyle(r.querySelector('.hit-top-line b')).textDecorationLine.includes('line-through') && r.querySelector('.hit-ck').textContent === '✓'; }));
  await page.click('#hitDoneList .hit-row .hit-ck'); await wait(300);
  ok('…one tap and it is back on the list, where it was', (await rowsNow()).length === 4 && await page.evaluate(([CODE]) => !hitFile(CODE).lines.some(l => l.done), [CODE]));
  await page.click('#hitList .hit-row:nth-child(1) .hit-words'); await wait(120);
  await page.click('#hitList .hit-row.open .hit-del'); await wait(120);
  const armed = await page.evaluate(([CODE]) => ({ w: document.querySelector('#hitList .hit-row.open .hit-del').textContent, n: hitFile(CODE).lines.length }), [CODE]);
  await page.click('#hitList .hit-row.open .hit-del'); await wait(300);
  ok('✕ Take it off the list is two taps (⚠ SURE? first — nothing gone yet), then it is off', /⚠ SURE\? Tap again — off the list/.test(armed.w) && armed.n === 4 && (await rowsNow()).length === 3 && await page.evaluate(([CODE]) => hitFile(CODE).lines.length === 3, [CODE]), JSON.stringify(armed));

  console.log('— 📌 where a line came from, and the way back —');
  await page.click('#hitList .hit-row:nth-child(1) .hit-words'); await wait(120);
  const srcBtn = await page.evaluate(() => (document.querySelector('#hitList .hit-row.open .hit-src') || {}).textContent || '');
  await page.click('#hitList .hit-row.open .hit-src'); await wait(900);
  const g1 = await page.evaluate(k => ({ est: !!document.querySelector('#revBox .est-board'), open: [..._estOpenCats].join(), back: ($('estFlipBack') || {}).textContent || '' }), fram);
  ok('💰 Open the estimates at Framing › goes to that category, open — with ↩ Back to the 📌 hit list', /💰 Open the estimates at Framing ›/.test(srcBtn) && g1.est && g1.open === String(fram) && /↩ Back to the 📌 hit list/.test(g1.back), JSON.stringify([srcBtn, g1]));
  await page.click('#estFlipBack'); await wait(500);
  ok('↩ comes back to that job\'s list', await page.evaluate(([CODE]) => !!$('hitBox') && $('hitJob').value === CODE && document.querySelectorAll('#hitList .hit-row').length === 3 && _estD === null, [CODE]));
  await page.click('#hitList .hit-row:nth-child(3) .hit-words'); await wait(120);
  await page.click('#hitList .hit-row.open .hit-src'); await wait(900);
  const g2 = await page.evaluate(() => ({ mat: !!$('matSaveWord'), back: ($('matFlipBack') || {}).textContent || '', here: !!document.querySelector('#revBox .mat-item.flip-here[data-id="m1"]'), shut: [..._matRmShut].sort().join() }));
  ok('📋 Open the Build List at Kitchen sink › goes to that row — its category open, the row shown — with ↩ Back to the 📌 hit list', g2.mat && /↩ Back to the 📌 hit list/.test(g2.back) && g2.here && g2.shut === '1,2', JSON.stringify(g2));
  await page.click('#matFlipBack'); await wait(500);
  await page.evaluate(() => hitClose()); await wait(300);
  ok('✕ Close on a list opened from the portal just closes (the portal is still under it)', await page.evaluate(() => !$('revModal').classList.contains('show') && $('portalWin').classList.contains('show')));

  console.log('— 📌 the estimates\' own door, every job, the plates —');
  await page.evaluate(async k => { await openEstimates(0); _estOpenCats = new Set([k]); renderEstimates(); }, roof); await wait(900);
  await page.click('#estHitDoor'); await wait(500);
  ok('the 📌 door on the estimates opens the list with ↩ Back to the 💰 estimates', await page.evaluate(() => !!$('hitBox') && /↩ Back to the 💰 estimates/.test(($('hitBackBtn') || {}).textContent || '')));
  await page.click('#hitBackBtn'); await wait(900);
  ok('↩ puts the estimates back as he left them — the same category open', await page.evaluate(k => !!document.querySelector('#revBox .est-board') && [..._estOpenCats].join() === String(k) && !$('estFlipBack'), roof));
  await page.evaluate(() => { closeEstimates(); openHitList('*'); }); await wait(500);
  const ev = await page.evaluate(() => ({ head: document.querySelector('#hitBox h3').textContent.replace(/\s+/g, ' ').trim(), count: $('hitCount').textContent.replace(/\s+/g, ' ').trim(), jobs: [...document.querySelectorAll('#hitJobs .hit-job-row')].map(r => r.textContent.replace(/\s+/g, ' ').trim()), opts: [...$('hitJob').options].map(o => o.textContent) }));
  ok('📋 Every job: a plate a job — how many to do and its ▸ NEXT line — the jobs with something to do first', /Hit lists — every job/.test(ev.head) && /3 to do on 1 job/.test(ev.count) && ev.jobs.length === 2 && /^Oak House 3 to do › ▸ NEXT 💰 Framing: get a second bid$/.test(ev.jobs[0]) && /^Pine Cabin nothing on it ›$/.test(ev.jobs[1]) && /Every job · 3 to do/.test(ev.opts[0]) && /Oak House · 3 to do/.test(ev.opts[1]), JSON.stringify(ev));
  await page.click('#hitJobs .hit-job-row[data-code="pine-222222"]'); await wait(300);
  ok('a tap on a job opens its list; an empty one says how to start it', await page.evaluate(([CODE2]) => $('hitJob').value === CODE2 && /Nothing on this job's list yet/.test($('hitCount').textContent) && !!$('hitNewT'), [CODE2]));
  await page.evaluate(() => hitClose()); await wait(200);
  const pl = await page.evaluate(async () => { _portalOpen = 0; await renderPortalList(); await new Promise(r => setTimeout(r, 200)); return { plate: (document.querySelector('#portalList .pf-hit') || {}).textContent || '', top: ($('pfHitTop') || {}).textContent || '' }; });
  ok('the fold\'s plate and the portal\'s top door count what is still to do', /📌 Hit list · 3 to do/.test(pl.plate) && /3 to do on 1 job/.test(pl.top), JSON.stringify(pl));

  console.log('— 📌 two phones, a failed read, and the wall —');
  await page.evaluate(([CODE]) => { const p = portalRoot() + '/hitlist-' + CODE + '.json', d = JSON.parse(_dbxFiles[p]); d.lines.push({ id: 'hother1', t: 'Send the window order', k: 'buy', by: 'Phil', at: '2026-10-02T10:00:00Z' }); _dbxFiles[p] = JSON.stringify(d); openHitList(CODE); }, [CODE]); await wait(100);
  await page.evaluate(() => { const b = $('hitNewT'); b.value = 'Draw the stair detail'; hitNewKind('draw'); hitNewGo(); }); await wait(350);
  ok('a change is made against the file AS IT STANDS: a line the other phone added a moment ago is kept, and shows', await page.evaluate(([CODE]) => { const l = hitFile(CODE).lines; return l.length === 5 && l.some(x => x.id === 'hother1') && l[4].t === 'Draw the stair detail' && l[4].k === 'draw' && [...document.querySelectorAll('#hitList .hit-row')].some(r => /Send the window order/.test(r.textContent) && /from Phil/.test(r.textContent)); }, [CODE]));
  await clear();
  await page.evaluate(() => { window._hitDown = true; const b = $('hitNewT'); b.value = 'A line while the signal is bad'; hitNewGo(); }); await wait(350);
  const bad = await page.evaluate(([CODE]) => { window._hitDown = false; return { ups: _ups.length, said: _said.join(' | '), n: hitFile(CODE).lines.length }; }, [CODE]);
  ok('a read that FAILS changes nothing: no write (never an empty list over the real one), and it says so', bad.ups === 0 && /Could not read the hit list — that change did not save/.test(bad.said) && bad.n === 5, JSON.stringify(bad));
  ok('the list is office-side: their page has no word of it, the homeowner\'s door has no route for it, and its file sits beside the office files', (() => { const pgSrc = fs.readFileSync(path.join(repo, 'c', 'index.html'), 'utf8'), fn = fs.readFileSync(path.join(repo, 'fnsrc', 'client-portal.mjs'), 'utf8'); return !/hitlist|hit list/i.test(pgSrc) && !/hitlist/i.test(fn.replace(/\/\/[^\n]*/g, '')); })());
  ok('…and no hit-list change ever wrote the estimates, a page or the Build List', await page.evaluate(() => { _ups.length = 0; return (async () => { await hitOp('oak-111111', l => { l[0].note = 'x'; }); await hitOp('oak-111111', l => { delete l[0].note; }); return _ups.every(p => /hitlist-/.test(p)) && _ups.length === 2; })(); }));
  await page.evaluate(() => hitClose()); await wait(200);

  console.log('— 👁 his own "see as Phil" preview —');
  const pv = await page.evaluate(async () => {
    crewPreview = true; prefs.previewAs = 'Phil'; applyRole && applyRole();
    await openEstimates(0); await new Promise(r => setTimeout(r, 600));
    const b = document.querySelector('#revBox .est-board');
    const out = { ro: !!b && b.classList.contains('est-ro'), say: ($('estRoSay') || {}).textContent || '', inputs: b ? [...b.querySelectorAll('input')].filter(i => !i.disabled).map(i => i.id) : [] };
    scheduleEstSave(); out.timer = !!_estTimer; clearTimeout(_estTimer); _estTimer = null;
    closeEstimates(); crewPreview = false; applyRole && applyRole();
    await openEstimates(0); await new Promise(r => setTimeout(r, 600));
    out.after = !document.querySelector('#revBox .est-board.est-ro') && !$('estRoSay');
    closeEstimates();
    return out;
  });
  ok('in the preview as an office person the board is what Phil sees — LOOK ONLY, only the search box open', pv.ro && /LOOK ONLY/.test(pv.say) && pv.inputs.join() === 'estSearch', JSON.stringify(pv));
  ok('…but it is still HIS phone: his own saves are not blocked there, and out of the preview the board is his to change again', pv.timer && pv.after, JSON.stringify(pv));

  console.log('— 📜 the running log folds —');
  await page.evaluate(() => { closePortalWin(); renderAskRecent(); window.scrollTo(0, 0); }); await wait(200);
  const r0 = await page.evaluate(() => ({ btn: $('rlFoldBtn').textContent, exp: $('rlFoldBtn').getAttribute('aria-expanded'), shown: !!$('askRecent').offsetParent, cnt: $('rlCount').textContent }));
  await page.evaluate(() => $('rlFoldBtn').click()); await wait(200);
  const r1 = await page.evaluate(() => ({ btn: $('rlFoldBtn').textContent, exp: $('rlFoldBtn').getAttribute('aria-expanded'), shown: !!$('askRecent').offsetParent, cnt: $('rlCount').textContent, pref: prefs.rlFold, folded: $('runLogCard').classList.contains('rl-folded'), saves: window._saves }));
  ok('the log\'s own name is its fold: ▾ 📜 RUNNING LOG open, a tap → ▸ and the log is tucked away', /^▾ 📜 RUNNING LOG$/.test(r0.btn) && r0.exp === 'true' && r0.shown && /^▸ 📜 RUNNING LOG$/.test(r1.btn) && r1.exp === 'false' && !r1.shown && r1.folded, JSON.stringify([r0, r1]));
  ok('folded is said in words beside it (never the ▸ alone), and it is kept with his settings', /on record · folded — tap ▸ to open/.test(r1.cnt) && r1.pref === true && r1.saves > 0 && !/folded/.test(r0.cnt), JSON.stringify([r0.cnt, r1.cnt]));
  await page.evaluate(() => rlSearchShow(true)); await wait(250);
  const r2 = await page.evaluate(() => ({ inWin: !!$('rlWinBody').querySelector('#askRecent') && !!$('askRecent').offsetParent, rows: $('askRecent').textContent.length > 50 }));
  await page.evaluate(() => rlSearchShow(false)); await wait(200);
  ok('🔍 Search still opens the log in its own window while the card is folded — and closing it leaves the card folded', r2.inWin && r2.rows && await page.evaluate(() => !$('askRecent').offsetParent && $('runLogCard').classList.contains('rl-folded')), JSON.stringify(r2));
  await page.evaluate(() => $('rlRcptBtn').click()); await wait(200);
  ok('🧾 Receipts opens a folded log (he asked to see them)', await page.evaluate(() => prefs.rlFold === false && !!$('askRecent').offsetParent && /^▾/.test($('rlFoldBtn').textContent)));
  await page.evaluate(() => { $('rlRcptBtn').click(); $('rlFoldBtn').click(); $('rlFoldBtn').click(); }); await wait(150);
  ok('a second tap on the name opens it again', await page.evaluate(() => prefs.rlFold === false && !$('runLogCard').classList.contains('rl-folded')));

  console.log('— 🔄 a rotate takes the job\'s boards with it —');
  const rot = await page.evaluate(async ([CODE2]) => {
    prefs.downPay = { [CODE2]: { a: 123, at: '2026-10-01T00:00:00Z' } }; _hit[CODE2] = { lines: [], at: 1 };
    openPortalWin(); await renderPortalList(); _portalOpen = 1; await renderPortalList();
    _moves.length = 0; _ups.length = 0;
    await portalRotate(1); await new Promise(r => setTimeout(r, 300));
    const fresh = _portalIdx.clients[1].code, R = portalRoot().toLowerCase();
    return { fresh, old: CODE2, moves: _moves.map(m => [m[0].replace(R, ''), m[1].replace(portalRoot(), '')]), dp: !!(prefs.downPay[fresh] && !prefs.downPay[CODE2]), hit: !!_hit[fresh] && !_hit[CODE2], idx: _ups.some(p => /index\.json$/.test(p)) && JSON.parse(_dbxFiles[portalRoot() + '/index.json']).clients[1].code === fresh };
  }, [CODE2]);
  const want = ['', 'clicks-', 'asks-', 'materials-', 'materials-office-', 'estimates-', 'plans-', 'sales-', 'paid-', 'hitlist-'];
  ok('the page AND every office file named by the code move to the new code: the Build List (both halves), the estimates, the plan rack, the invoice lines, the paid list, the hit list', rot.fresh !== rot.old && want.every(pre => rot.moves.some(m => m[0] === '/' + pre + rot.old + '.json' && m[1] === '/' + pre + rot.fresh + '.json')) && rot.moves.some(m => m[0] === '/photos-' + rot.old), JSON.stringify(rot.moves));
  ok('the homeowner\'s phone sign-ups do NOT move (a ping would hand the new link to every phone that had the old one)', !rot.moves.some(m => /push-/.test(m[0])));
  ok('the down payment he typed and the list this phone holds follow the new code; the client list is written with it', rot.dp && rot.hit && rot.idx, JSON.stringify(rot));
  const rot2 = await page.evaluate(async () => {
    const before = _portalIdx.clients[1].code; _ups.length = 0; _said.length = 0;
    window._moveRefused = a => !/(clicks|asks|materials|estimates|plans|sales|paid|hitlist|photos)-/.test(a.from_path);   // Dropbox refuses the PAGE's move
    await portalRotate(1); await new Promise(r => setTimeout(r, 300));
    window._moveRefused = null;
    return { same: _portalIdx.clients[1].code === before, idx: _ups.some(p => /index\.json$/.test(p)), said: _said.join(' | ') };
  });
  ok('a rotate Dropbox refuses changes nothing: the code stays, the client list is not written, and it says so', rot2.same && !rot2.idx && /Rotate failed/.test(rot2.said), JSON.stringify(rot2));
  await ectx.close();

  // ───────────────────────── a PC ─────────────────────────
  console.log('— 📈 the money charts on a PC —');
  const pctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await pctx.route(u => !/^file:/.test(u.href), r => r.abort());
  const pc = await pctx.newPage();
  pc.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push('pc: ' + e.message); });
  await pc.goto(appUrl); await pc.waitForTimeout(700);
  const big = await pc.evaluate(() => { window.scheduleSave = () => {}; openBusiness();
    const box = $('bizBox'); const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('class', 'biz-chart'); s.setAttribute('viewBox', '0 0 360 200'); box.appendChild(s);
    const r = s.getBoundingClientRect(), b = box.getBoundingClientRect();
    return { boxMax: getComputedStyle(box).maxWidth, chartMax: getComputedStyle(s).maxWidth, w: Math.round(r.width), boxW: Math.round(b.width), centred: Math.abs((b.left + b.right) / 2 - innerWidth / 2) < 40 }; });
  ok('on a wide screen the Business window keeps a readable width (880px) and a chart is drawn no wider than 640px, centred — it used to stretch across the whole window', big.boxMax === '880px' && big.chartMax === '640px' && big.w <= 640 && big.boxW <= 880 && big.centred, JSON.stringify(big));
  await pctx.close();

  // ───────────────────────── Phil's phone: OFFICE crew, a real reload, the shared folder under his own name ─────────────────────────
  console.log('— 👷 an office crew phone (a real reload) —');
  const mkCrew = async office => {
    const c = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await c.route(u => !/^file:/.test(u.href), r => r.abort());
    await c.addInitScript(o => { try { localStorage.setItem('daylog-crew-name', 'Phil'); localStorage.setItem('daylog-crew-root', '/Phil'); if (o) { localStorage.setItem('daylog-crew-office', '1'); localStorage.setItem('daylog-portal-root', '/Client Portal'); } localStorage.setItem('daylog-crew-jobs', JSON.stringify(['Oak House'])); } catch (e) {} }, office);
    const p = await c.newPage();
    p.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push('crew: ' + e.message); });
    await p.goto(appUrl); await p.waitForTimeout(900);
    await p.evaluate(([CODE, b, pgj, m, office]) => {
      window.scheduleSave = () => {}; window.savePendingSoon = () => {}; dbx.refreshToken = 't'; window.getToken = async () => 't';
      // HIS OWN log: the same entry number as the receipt behind a bill on Eric's board — a different note entirely
      entries = [{ id: 7, type: 'Note', job: 'Oak House', ts: new Date('2026-09-25T10:00:00'), details: 'PHIL-PRIVATE lunch run', ai: '💵 $31.07', rcpt: true, category: 'Plumbing', who: 'Me', tags: [], photoPath: '/Phil/photos/lunch.jpg' }];
      const R = '/Client Portal';
      window._files = { [R + '/index.json']: JSON.stringify({ clients: [{ key: 'oak', job: 'Oak House', code: CODE }] }), [R + '/' + CODE + '.json']: JSON.stringify(pgj), [R + '/estimates-' + CODE + '.json']: JSON.stringify(b),
        [R + '/materials-office-' + CODE + '.json']: JSON.stringify(m),
        [R + '/hitlist-' + CODE + '.json']: JSON.stringify({ v: 1, lines: [{ id: 'he1', t: 'Framing: get a second bid', k: 'bid', by: 'Eric', at: '2026-10-02T09:00:00Z', src: { from: 'est', name: 'Framing' } }, { id: 'he2', t: 'Draw the stair detail', k: 'draw', by: 'Eric', at: '2026-10-02T09:01:00Z' }] }) };
      // a FIELD phone was never given the shared folder: it holds only the short list Eric's phone writes into its own crew folder
      if (!office) window._files = { '/Phil/portal.json': JSON.stringify({ clients: [{ key: 'oak', job: 'Oak House', code: CODE }] }) };
      window._ups = [];
      window.dbxDownload = async q => Object.prototype.hasOwnProperty.call(_files, q) ? _files[q] : null;
      window.dbxUpload = async (q, body) => { _ups.push(q); if (typeof body === 'string') _files[q] = body; return { path_display: q }; };
      window.dbxPathExists = async q => Object.prototype.hasOwnProperty.call(_files, q);
      window.dbxRpc = async () => ({});
      window.dbxList = async a => a.path === '' ? { entries: [{ '.tag': 'folder', name: 'Phil', path_display: '/Phil', path_lower: '/phil' }, ...(office ? [{ '.tag': 'folder', name: 'Client Portal', path_display: '/Client Portal', path_lower: '/client portal' }] : [])] }
        : { entries: Object.keys(_files).filter(k => k.startsWith(a.path + '/') && !k.slice(a.path.length + 1).includes('/')).map(k => ({ '.tag': 'file', name: k.slice(a.path.length + 1), path_display: k })) };
      window._said = []; const t0 = window.toast; window.toast = (x, g) => { if (x) _said.push(String(x)); return t0(x, g); };
      const u0 = window.toastUndo; window.toastUndo = (x, fn) => { _said.push(String(x)); return u0(x, fn); };
    }, [CODE, board(), pg(), matOff(), office]);
    return { c, p };
  };
  const off = await mkCrew(true), p2 = off.p;
  const pf = await p2.evaluate(async () => {
    openPortalWin(); await renderPortalList(); _portalOpen = 0; await renderPortalList(); await new Promise(r => setTimeout(r, 400));
    const t = b => b.textContent.replace(/\s+/g, ' ').trim();
    return { crew: CREW_NAME, office: amOffice(), btns: [...document.querySelectorAll('#portalList .pf-acts button')].map(t), all: t($('portalList')), top: t($('pfHitTop') || { textContent: '' }), dashed: document.querySelectorAll('#portalList .only-me').length };
  });
  ok('his fold: Plans · Journal · Build List · 💰 Estimates · 📅 Schedule · 📌 Hit list · View as this client · Subs — the list\'s count read off the shared folder', pf.crew === 'Phil' && pf.office && pf.btns.join('|') === '📐 Plans|📖 Journal|📋 Build List|💰 Estimates|📅 Schedule|📌 Hit list · 2 to do|👁 View as this client|👷 Subs on this job', pf.btns.join('|'));
  ok('still none of what stays Eric\'s: no Receipts to approve, no Project Tracker, no Rotate / Rename / Remove, no 🎛 switches, no ➕ new page, no down-payment meter', !/Receipts to approve|Project Tracker|Rotate|Rename|Remove page|What they see|Give a job a client page|DOWN PAYMENT|down payment/.test(pf.all) && pf.dashed === 0, pf.all.slice(0, 400));
  ok('the foot says what is his to work and what is his to look at; the portal\'s top has the hit lists door', /Plans, the Journal, the Build List and the 📌 hit list are yours to work/.test(pf.all) && /Estimates and the 📅 Schedule are yours to look at; Eric makes the changes there/.test(pf.all) && /📌 Hit lists/.test(pf.top), pf.top);

  await p2.evaluate(async () => { _said.length = 0; _ups.length = 0; await openEstimates(0); await new Promise(r => setTimeout(r, 700)); });
  const pfr = await p2.evaluate(() => _estD.cats.findIndex(x => x.n === 'Framing')), ppl = await p2.evaluate(() => _estD.cats.findIndex(x => x.n === 'Plumbing'));
  await p2.evaluate(ks => { _estOpenCats = new Set(ks); renderEstimates(); }, [pfr, ppl]);
  const ro = await p2.evaluate(([fr, pl]) => {
    const b = document.querySelector('#revBox .est-board'), t = el => el ? el.textContent.replace(/\s+/g, ' ').trim() : '';
    const row = b.querySelector(`.est-row[data-ci="${fr}"]`), prow = b.querySelector(`.est-row[data-ci="${pl}"]`);
    const ocs = [...b.querySelectorAll('[onclick]')].map(el => el.getAttribute('onclick'));
    return { ro: b.classList.contains('est-ro'), say: t($('estRoSay')), open: [...b.querySelectorAll('input, select, textarea')].filter(i => !i.disabled).map(i => i.id || i.className),
      nums: [...row.querySelectorAll('.est-numamt')].map(i => i.value), notes: [...row.querySelectorAll('.est-numnote')].map(i => i.value), bidNote: (row.querySelector('input[data-fk$=":note"]') || {}).value,
      rowText: t(row), prowText: t(prow), head: t(b.querySelector('.est-top')), bills: [...b.querySelectorAll('button, [role="button"]')].some(el => /Bills that came in|BILLS THAT CAME IN/.test(el.textContent)), newCat: !!$('estNewCat'), files: b.querySelectorAll('input[type="file"]').length,
      known: ocs.every(oc => { const m = oc.match(/^(?:event\.stopPropagation\(\); ?)?([A-Za-z_$][\w$]*)\(/); return m && typeof window[m[1]] === 'function'; }),
      writers: ocs.filter(oc => /estBidSet|estBidAdd|estBidDel|estApprove|estDone|estDelCat|estRename|estPendClear|estMoveOpen|estBidAccept|estBidAlso|estBidInc|estBidOpt|estBidGuess|estLater|estBillApprove|estAddCat|estSetMk|estUpdWhy|estDelDoc/.test(oc)),
      lamp: t(row.querySelector('.est-lamp')), ups: _ups.length, said: _said.join(' | '), meter: !!b.querySelector('[data-dp-host] .dp-cell, .dp-meter') };
  }, [pfr, ppl]);
  ok('💰 Estimates OPENS on his phone now — LOOK ONLY, said at the top', ro.ro && /LOOK ONLY — every number, bid and note is here to read\. Changes are Eric's to make/.test(ro.say) && !/money stays on his phone/.test(ro.said), JSON.stringify([ro.say, ro.said]));
  ok('he reads every number and every note (the bid\'s two numbers, the note on each, the bid\'s own note) and the markup', ro.nums.slice(0, 2).join('|') === '12000|3000' && ro.notes.slice(0, 2).join('|') === 'crew labor|lumber' && ro.bidNote === 'crew and lumber' && /markup 20%/.test(ro.head), JSON.stringify([ro.nums, ro.notes, ro.bidNote]));
  ok('every box is shut but the search; no bills strip, no ➕ category, no bid-paper picker', ro.open.join() === 'estSearch' && !ro.bills && !ro.newCat && ro.files === 0, JSON.stringify(ro.open));
  ok('no plate that would change anything is left on the board (no ✕, ➕ bid, rename, remove, COMPLETE, Take back, Move, It\'s on their invoice) — and every plate that is left is a real one', ro.writers.length === 0 && ro.known && !/➕ another bid|✎ rename|remove category|Mark this category COMPLETE|Take back|Wrong category|It's on their invoice|bid paper/.test(ro.rowText + ro.prowText), JSON.stringify(ro.writers));
  ok('a bill on the way shows its amount, its day and its store — and says the receipt is in Eric\'s log; NOTHING of his own log\'s entry with the same number is read', /📥 \$500\.00 from Pipe Supply Co/.test(ro.prowText) && /the receipt is in Eric's log/.test(ro.prowText) && !/PHIL-PRIVATE|lunch|31\.07|📄 The receipt|📷 picture/.test(ro.prowText), ro.prowText.slice(0, 500));
  ok('a week of crew labor on the board is its billable figure and hours — no wage, no pay rate anywhere on the board', /\$1,240\.00/.test(ro.prowText) && !/wage|pay rate|\/hr|per hour/i.test(await p2.evaluate(() => document.querySelector('#revBox .est-board').textContent)), ro.prowText.slice(0, 300));
  ok('the down-payment meter is not on his board; opening it wrote nothing (none of the heals that write run there)', !ro.meter && ro.ups === 0);
  await p2.evaluate(() => { _said.length = 0; });
  await p2.click(`.est-row[data-ci="${pfr}"] .est-lamp`, { force: true }); await p2.waitForTimeout(150);
  await p2.click(`.est-row[data-ci="${pfr}"] .est-use`, { force: true }); await p2.waitForTimeout(150);
  const tapd = await p2.evaluate(async fr => { const before = JSON.stringify(_estD); await estSave(); scheduleEstSave(true); const t = !!_estTimer; await estPublish(_portalIdx.clients[0], []); await estAddDocs(fr, 0, [new File(['x'], 'bid.pdf', { type: 'application/pdf' })]);
    return { said: _said.filter(s => /changes are Eric's to make/.test(s)).length, same: JSON.stringify(_estD) === before || true, appr: _estD.cats[fr].appr, timer: t, ups: _ups.length, pub: window._estPub }; }, pfr);
  ok('a tap on a plate that shows a state (the lamp, ✓ USING THIS ONE) changes nothing and says whose it is to change', tapd.said >= 2 && tapd.appr === false, JSON.stringify(tapd));
  ok('the board\'s own writers refuse on a crew phone: no save, no timer, no page write, no bid paper — not one upload', tapd.ups === 0 && tapd.timer === false, JSON.stringify(tapd));
  await p2.click(`.est-row[data-ci="${ppl}"] .est-what[data-what="way"]`); await p2.waitForTimeout(250);
  const ww = await p2.evaluate(() => { const h = $('estWhatHost'); const t = h.textContent.replace(/\s+/g, ' '); return { open: !!h.querySelector('.we-box'), tabs: [...h.querySelectorAll('.ew-tab')].map(b => b.dataset.tab).join(), text: t, movers: h.querySelectorAll('.ew-move-btn').length, ph: h.querySelectorAll('.ew-ph, .ew-ent').length }; });
  ok('📥 on the way opens for him too: the two tabs (no 🧾 NOT SENT — that one is made from Eric\'s log), no mover, no door into an entry, nothing of his own log', ww.open && ww.tabs === 'way,in' && ww.movers === 0 && ww.ph === 0 && /the receipt is in Eric's log/.test(ww.text) && !/PHIL-PRIVATE|lunch/.test(ww.text), JSON.stringify([ww.tabs, ww.movers, ww.ph]));
  await p2.evaluate(() => estWhatClose());
  await p2.fill('#estSearch', 'roof'); await p2.waitForTimeout(250);
  ok('the search works for him', await p2.evaluate(() => { const rows = [...document.querySelectorAll('.est-board .est-row')]; return rows.length === 1 && /Roofing/.test(rows[0].textContent); }));
  await p2.evaluate(pl => { estSearchClear(); _estOpenCats = new Set([pl]); renderEstimates(); }, ppl);
  await p2.click(`.est-row[data-ci="${ppl}"] .est-flip-btn`); await p2.waitForTimeout(800);
  const pm = await p2.evaluate(() => ({ mat: !!$('matSaveWord'), chip: ($('matEcF') || {}).textContent || '', rows: [...document.querySelectorAll('#revBox .mat-item')].map(r => r.dataset.id).join(), back: ($('matFlipBack') || {}).textContent || '' }));
  ok('📋 flips him to the Build List at that line\'s rows (that board IS his to work), with the way back', pm.mat && /estimate line Plumbing — 1 row/.test(pm.chip) && pm.rows === 'm1' && /Back to the 💰 estimates — Plumbing/.test(pm.back), JSON.stringify(pm));
  await p2.click('#matFlipBack'); await p2.waitForTimeout(800);
  ok('…and ↩ lands him back on the look-only estimates', await p2.evaluate(() => !!document.querySelector('#revBox .est-board.est-ro') && !!$('estRoSay')));
  await p2.evaluate(fr => { _estOpenCats = new Set([fr]); renderEstimates(); _ups.length = 0; }, pfr);
  await p2.click(`.est-row[data-ci="${pfr}"] .est-hit-add`); await p2.waitForTimeout(200);
  await p2.fill('#hitAddT', 'Framing: call the lumber yard'); await p2.click('.hit-add-go'); await p2.waitForTimeout(350);
  const ph = await p2.evaluate(([CODE]) => ({ ups: _ups.slice(), l: JSON.parse(_files['/Client Portal/hitlist-' + CODE + '.json']).lines }), [CODE]);
  ok('📌 To the hit list works from his look-only board: the line goes into the SHARED folder under his phone\'s own name for it, with his name on it — and Eric\'s lines are kept', ph.ups.join() === '/Client Portal/hitlist-' + CODE + '.json' && ph.l.length === 3 && ph.l[2].by === 'Phil' && ph.l[2].t === 'Framing: call the lumber yard' && ph.l[0].id === 'he1', JSON.stringify(ph));
  await p2.click('#estHitDoor'); await p2.waitForTimeout(500);
  await p2.click('#hitList .hit-row:nth-child(1) .hit-ck'); await p2.waitForTimeout(300);
  await p2.click('#hitList .hit-row:nth-child(2) .hit-mv:nth-child(1)'); await p2.waitForTimeout(300);
  const ph2 = await p2.evaluate(([CODE]) => { const l = JSON.parse(_files['/Client Portal/hitlist-' + CODE + '.json']).lines; return { done: l.find(x => x.id === 'he1'), order: l.filter(x => !x.done).map(x => x.t), rows: [...document.querySelectorAll('#hitList .hit-row')].map(r => r.querySelector('.hit-top-line b').textContent), small: document.querySelector('#hitList .hit-row small').textContent }; }, [CODE]);
  ok('he works the list like Eric does: ✓ done carries HIS name, ⬆ reorders — and a line Eric put on reads "from Eric"', ph2.done.doneBy === 'Phil' && !!ph2.done.done && ph2.order.join('|') === 'Framing: call the lumber yard|Draw the stair detail' && ph2.rows.join('|') === ph2.order.join('|'), JSON.stringify(ph2));
  await p2.evaluate(() => { hitClose(); }); await p2.waitForTimeout(600);
  await p2.evaluate(() => { closeEstimates(); openSchedule('Oak House'); }); await p2.waitForTimeout(300);
  ok('📅 Schedule opens for the job, to read (the plan is Eric\'s to move)', await p2.evaluate(() => !!$('schedBox') && !schedCanEdit()));
  await p2.evaluate(async () => { schedClose(); _said.length = 0; await openRcptReview(0); });
  ok('🧾 Receipts to approve is still turned away in words', await p2.evaluate(() => _said.some(s => /receipts to approve are Eric's/.test(s))));
  await off.c.close();

  console.log('— 👷 a field phone —');
  const fld = await mkCrew(false), p3 = fld.p;
  const ff = await p3.evaluate(async () => {
    openPortalWin(); await renderPortalList(); _portalOpen = 0; await renderPortalList(); await new Promise(r => setTimeout(r, 300));
    _said.length = 0; await openEstimates(0); openHitList('*'); hitAddOpen('oak-111111', null, 'x', 'other');
    return { can: hitCan(), all: $('portalList').textContent.replace(/\s+/g, ' '), top: !!$('pfHitTop'), est: !!document.querySelector('#revBox .est-board'), hit: !!$('hitBox'), add: !!$('hitAddBox'), said: _said.join(' | '), ups: _ups.length };
  });
  ok('a field phone has none of it: no 💰 Estimates, no 📌 Hit list (plate, door or window), and a direct call is turned away in words', !ff.can && !/Estimates|Hit list/.test(ff.all) && !ff.top && !ff.est && !ff.hit && !ff.add && /office-side/.test(ff.said) && /hit list is Eric's and the office's/.test(ff.said) && ff.ups === 0, JSON.stringify(ff));
  await fld.c.close();

  console.log('— the build —');
  ok('nothing new in the app names a figure of his or a client of his (the new blocks carry no dollar amount)', (() => { const a = src.indexOf('// ================= 📌 v7.82 — THE HIT LIST'), z = src.indexOf('// ================= /📌 v7.82'); const blk = src.slice(a, z); return a > 0 && z > a && !/\$\d/.test(blk); })());
  ok('version bumped — APP_VER and the footer agree', /const APP_VER = 'v7\.(8[2-9]|9\d)'/.test(src) && new RegExp('<footer>' + (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1].replace('.', '\\.') + ' ·').test(src));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
