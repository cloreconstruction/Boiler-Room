// 📋 v6.89 — THE BUILD LIST, ERIC'S FINISH-OUT TRACKER. Eric built a Word tracker by hand on a walkthrough — rooms, an item
// a row, what was picked ON the row, a strip of boxes that fills in — and said: "It should probably have 'installed' or
// 'scheduled' or something on there too, probably a couple more checkboxes for the total cost of each item. This is what
// I'm trying to accomplish on the build list. I think the build list and the estimate sheets could eventually be combined."
// Then: "Yes, build it all." Every name and figure in this file is made up.
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
    jobs = ['Oak House']; curJob = ''; crew = []; entries = []; todos = []; nextId = 1; pendingQueue = [];
    window.scheduleSave = () => {}; window.savePendingSoon = () => {}; window.publishSharedNotes = () => {};
    renderJobSelects(); closePanels(); renderAll();
    dbx.refreshToken = 'test-token';
    _portalIdx = { clients: [{ key: 'oak', job: 'Oak House', code: 'oak-111aaa' }] };
    window._dbxFiles = {};
    window.dbxDownload = async p => (window._dbxFiles || {})[p] ?? null;
    window.dbxUpload = async (p, body) => { (window._dbxFiles || {})[p] = body; return {}; };
    window.dbxPathExists = async p => Object.prototype.hasOwnProperty.call(window._dbxFiles || {}, p);
    window._T = '\t';
    // a walkthrough list the way Word hands it over: a title, a legend, rooms on their own lines, a heading row per table,
    // spacer rows, ticked and empty boxes, and a by-trade summary page at the end that must NOT turn into items
    window._paste = ['OAK HOUSE - FINISH-OUT TRACKER', '☒ = selected/confirmed | ☐ = not yet confirmed', 'WHOLE HOUSE / TRIM',
      ['Item', 'Selection / Notes', 'Picked / Confirmed', 'Ordered', 'Received'].join(_T), ['', '', '', '', ''].join(_T),
      ['Baseboard throughout', 'Stained wood; Acme Lumber or the box store', '☒', '☐', '☐'].join(_T), ['', '', '', '', ''].join(_T),
      ['Interior doors', '2-panel', '☒', '☒', '☐'].join(_T),
      ['Reinstall window screens', '', '☐', '☐', '☐'].join(_T),
      'KITCHEN', ['Item', 'Selection / Notes', 'Picked / Confirmed', 'Ordered', 'Received'].join(_T),
      ['Countertops', 'Quartz - Snowfield', '☒', '☒', '☒'].join(_T), ['Kitchen faucet', 'Pull-down, brushed bronze', '☒', '☐', '☐'].join(_T),
      'BY SUB / RESPONSIBILITY - QUICK SUMMARY', 'Finish Carpentry', 'Baseboard • Interior doors • Window sills', 'Plumbing', 'Kitchen faucet • Master sinks'].join('\n');
  });

  console.log('— 📋 v6.89 paste a list —');

  ok('an empty board offers 📋 Paste a list; the box opens at the top with its words and a Preview plate', await page.evaluate(async () => {
    await openMaterials(0);
    const btn = [...$('revBox').querySelectorAll('button')].find(b => /Paste a list/.test(b.textContent)); if (!btn) return false;
    btn.click();
    return !!$('matPasteSec') && !!$('matPasteBox') && /A line on its own names the room/.test($('matPasteSec').textContent) && !![...$('matPasteSec').querySelectorAll('button')].find(b => /Preview/.test(b.textContent)) && !$('matPastePrev');
  }));
  ok('👁 Preview reads the Word table: rooms from the lines on their own, the heading row maps the columns, ☒ ticks the box; the title, the legend and the by-trade page fall away', await page.evaluate(() => {
    $('matPasteBox').value = _paste; matPastePreview();
    const pr = _matPasteRows, t = $('matPastePrev').textContent.replace(/\s+/g, ' ');
    const wh = pr.rooms.find(r => r.name === 'WHOLE HOUSE / TRIM'), k = pr.rooms.find(r => r.name === 'KITCHEN');
    return pr.table === true && pr.rooms.length === 2 && wh.items.length === 3 && k.items.length === 2 &&
      wh.items[0].n === 'Baseboard throughout' && wh.items[0].sel === 'Stained wood; Acme Lumber or the box store' && wh.items[0].s === 'picked' && wh.items[1].s === 'ordered' && wh.items[2].s === 'pick' && k.items[0].s === 'arrived' &&
      /2 categories · 5 items · 4 picked · 2 ordered · 1 received/.test(t) && !/Finish Carpentry|QUICK SUMMARY|selected\/confirmed/.test(pr.rooms.map(r => r.name + r.items.map(i => i.n).join()).join()) && _matD.rooms.length === 0;
  }));
  ok('✓ Add them lands every row as 🛒 something to buy, office-side, with its selection and its stage; a category can be skipped first', await page.evaluate(() => {
    matPasteRoomFlip(1); const skipped = /1 categor(y|ies) · 3 items/.test($('matPastePrev').textContent.replace(/\s+/g, ' ')); matPasteRoomFlip(1);
    matPasteAdd();
    const all = _matD.rooms.flatMap(r => r.items), ids = new Set(all.map(x => x.id));
    return skipped && _matD.rooms.map(r => r.name).join('|') === 'WHOLE HOUSE / TRIM|KITCHEN' && all.length === 5 && ids.size === 5 && all.every(x => x.buy === true && !x.hm) &&
      all.find(x => x.n === 'Interior doors').s === 'ordered' && !!all.find(x => x.n === 'Interior doors').odate && all.find(x => x.n === 'Countertops').s === 'arrived' && all.find(x => x.n === 'Kitchen faucet').sel === 'Pull-down, brushed bronze' &&
      !$('matPasteSec') && /5 items added/.test($('toast').textContent) && /2 new categories/.test($('toast').textContent);
  }));
  ok('pasting again updates the row with the same name — never a second copy, never a step backwards — and adds only what is new', await page.evaluate(() => {
    matPasteOpen();
    $('matPasteBox').value = ['KITCHEN', ['Countertops', 'Quartz - Snowfield, 3cm', '☒', '☐', '☐'].join(_T), ['Kitchen faucet', '', '☒', '☒', '☐'].join(_T), ['Dishwasher', 'verify the model', '☐', '☐', '☐'].join(_T)].join('\n');
    matPastePreview(); matPasteAdd();
    const k = _matD.rooms.find(r => r.name === 'KITCHEN').items;
    return k.length === 3 && k.find(x => x.n === 'Countertops').s === 'arrived' && k.find(x => x.n === 'Countertops').sel === 'Quartz - Snowfield, 3cm' && k.find(x => x.n === 'Kitchen faucet').s === 'ordered' &&
      k.find(x => x.n === 'Kitchen faucet').sel === 'Pull-down, brushed bronze' && k.find(x => x.n === 'Dishwasher').s === 'pick' && /1 item added · 2 updated/.test($('toast').textContent);
  }));
  ok('plain lines work too: CAPITALS or a colon name the room, "name - what was picked" splits, a ☒ in front means picked; extra columns map by their heading and an estimate line only by its exact name', await page.evaluate(() => {
    const a = matParseList('LAUNDRY:\nWasher - front loader, white\n☒ Dryer\n- Cabinets above\n\nFoyer tile | not a table');
    const L = a.rooms[0];
    const cat = EST_DEFAULT_CATS.find(c => /Plumbing/.test(c));
    const b = matParseList(['BATH 2', ['Item', 'Selection', 'Picked', 'Ordered', 'Received', 'Scheduled', 'Installed', 'Estimate', 'Actual', 'Estimate line'].join(_T),
      ['Toilet', 'Elongated, white', '☒', '☒', '☒', '☒', '☒', '$1,250', '1310.40', cat.toLowerCase()].join(_T), ['Mirror', '', '', '', '', '', '', '', '', 'no such line'].join(_T)].join('\n'));
    const T = b.rooms[0].items[0], M = b.rooms[0].items[1];
    matPasteOpen(); _matPasteRows = b; matPasteAdd();
    const t2 = _matD.rooms.find(r => r.name === 'BATH 2').items;
    return a.table === false && a.rooms.length === 1 && L.name === 'LAUNDRY' && L.items.length === 4 && L.items[0].n === 'Washer' && L.items[0].sel === 'front loader, white' && L.items[1].n === 'Dryer' && L.items[1].s === 'picked' && L.items[2].n === 'Cabinets above' &&
      T.s === 'arrived' && T.sch === true && T.ins === true && T.est === 1250 && T.act === 1310.4 && M.s === 'pick' &&
      t2[0].ec === cat && !!t2[0].ins && t2[0].sch === true && t2[0].est === 1250 && !t2[1].ec;
  }));

  console.log('— ☒ v6.89 the row: what was picked, five boxes, the money —');

  ok('every 🛒 row wears a five-box strip — a glyph AND a letter AND a spelled label, a finger wide — with the selection beside it', await page.evaluate(() => {
    _matHelp = true; renderMatMgr(); const legend = ($('matHelpBox') || {}).textContent || ''; _matHelp = false; renderMatMgr();   // v6.91 — the legend lives behind ? how this works
    const row = [...document.querySelectorAll('.mat-item')].find(r => /Baseboard throughout/.test(r.textContent));
    const boxes = [...row.querySelectorAll('.mat-strip:not(.mat-rowbtns) .mat-box')];   // v6.91 — the ⚠ 1st and ⇄ plates sit beside the lights, in their own group
    return boxes.length === 5 && boxes.map(b => (b.getAttribute('aria-pressed') === 'true' ? '☒' : '☐') + b.querySelector('b').textContent).join(' ') === '☒P ☐O ☐R ☐S ☐I' && !!boxes[0].querySelector('.mb-ck') && !boxes[1].querySelector('.mb-ck') && boxes.every(b => !!b.querySelector('.mb-i').textContent) && boxes[0].getAttribute('aria-label') === 'Picked — yes' && boxes[4].getAttribute('aria-label') === 'Installed — not yet' &&
      boxes.every(b => b.getBoundingClientRect().width >= 34 && b.getBoundingClientRect().height >= 34) && /Stained wood; Acme Lumber/.test(row.querySelector('.mat-sel').textContent) && /👆 picked · 🛒 ordered · 📦 received · 📅 scheduled · 🔧 installed/.test(legend);
  }));
  ok('tap O and it is ordered (with the date), tap P and the row walks back to nothing, tap I and it is received AND installed — the row folds to its name and ✓ FINISHED (v7.19), and walks back out when un-ticked; S is its own tick', await page.evaluate(() => {
    const it = _matD.rooms[0].items.find(x => x.n === 'Baseboard throughout'), tap = k => { const row = [...document.querySelectorAll('.mat-item')].find(r => /Baseboard throughout/.test(r.textContent)); [...row.querySelectorAll('.mat-strip:not(.mat-rowbtns) .mat-box')].find(b => b.querySelector('b').textContent === k).click(); };
    tap('O'); const a = it.s === 'ordered' && !!it.odate;
    tap('P'); const b = it.s === 'pick' && !it.ins;
    tap('S'); const c = it.sch === true; tap('S'); const c2 = !it.sch;
    tap('I'); const row = [...document.querySelectorAll('.mat-item')].find(r => /Baseboard throughout/.test(r.textContent));
    // ✓ v7.19 — Eric: "when the item is completed, it should be folded to just the name. And a green light that says 'finished'"
    const d = it.s === 'arrived' && !!it.ins && row.classList.contains('mi-done') && row.classList.contains('mi-fin') && /✓ FINISHED/.test(row.textContent) && !row.querySelector('.mat-strip');
    matBoxTap(it.id, 'R');   // its lights live in the edit window now — the same function they call
    const row2 = [...document.querySelectorAll('.mat-item')].find(r => /Baseboard throughout/.test(r.textContent));
    const e = it.s === 'ordered' && !it.ins && !row2.classList.contains('mi-fin') && !!row2.querySelector('.mat-strip');
    return a && b && c && c2 && d && e;
  }));
  ok('each category says where it stands in words; the four working lists filter the board — picked-not-ordered shows only those rows and hides the empty categories', await page.evaluate(() => {
    const dw = _matD.rooms.find(r => r.name === 'KITCHEN').items.find(x => x.n === 'Dishwasher'); matBoxTap(dw.id, 'P');   // one row picked and not yet ordered
    const k = [...document.querySelectorAll('#revBox .set-section')].find(s => /KITCHEN/.test(s.querySelector('h4').textContent));
    const counts = /🛒 3\/3 picked|🛒 2\/3 picked/.test(k.querySelector('.mat-counts').textContent) && /ordered · \d received · 0 installed/.test(k.querySelector('.mat-counts').textContent);
    const chip = [...$('matStageChips').querySelectorAll('button')].find(b => /picked, not ordered/.test(b.textContent)); const n = +(chip.textContent.match(/\((\d+)\)/) || [])[1];
    chip.click();
    const rows = [...document.querySelectorAll('#revBox .mat-item')], all = _matD.rooms.flatMap(r => r.items).filter(x => x.s === 'picked').length;
    const r = rows.length === n && n === all && n > 0 && _matStageF === 'toorder';
    [...$('matStageChips').querySelectorAll('button')].find(b => /picked, not ordered/.test(b.textContent)).click();
    return counts && r && _matStageF === '' && document.querySelectorAll('#revBox .mat-item').length === _matD.rooms.flatMap(x => x.items).length;
  }));
  ok('estimate and actual go in on the item and show on the row, the category and the whole house — over or under in words', await page.evaluate(() => {
    const it = _matD.rooms.find(r => r.name === 'KITCHEN').items.find(x => x.n === 'Kitchen faucet');
    _matEdit = it.id; renderMatMgr();
    $('matEst-' + it.id).value = '$1,250'; $('matEst-' + it.id).dispatchEvent(new Event('change'));
    $('matAct-' + it.id).value = '1310'; $('matAct-' + it.id).dispatchEvent(new Event('change'));
    $('matSel-' + it.id).value = 'Pull-down, brushed bronze — from the plumbing house'; $('matSel-' + it.id).dispatchEvent(new Event('change'));
    _matEdit = ''; renderMatMgr();
    const row = [...document.querySelectorAll('.mat-item')].find(r => /Kitchen faucet/.test(r.textContent)).textContent.replace(/\s+/g, ' ');
    const k = [...document.querySelectorAll('#revBox .set-section')].find(s => /KITCHEN/.test(s.querySelector('h4').textContent)).querySelector('.mat-counts').textContent;
    return it.est === 1250 && it.act === 1310 && /est \$1,250 · paid \$1,310 · ⚠ over by \$60/.test(row) && /from the plumbing house/.test(row) && /est \$1,250 · paid \$1,310/.test(k) && /whole house: est \$2,500 · paid \$2,620/.test($('revBox').querySelector('.mat-legend').textContent);
  }));
  ok('an office row is 🛒 something to buy or a ✅ checklist item — one tap flips it and the lamp maps across; a checklist row wears its own three lights (v6.91), never "pick needed"', await page.evaluate(() => {
    const it = _matD.rooms[0].items.find(x => x.n === 'Reinstall window screens');
    matBuyToggle(it.id); const a = !it.buy && it.s === 'todo';
    const row = [...document.querySelectorAll('.mat-item')].find(r => /Reinstall window screens/.test(r.textContent));
    const b = [...row.querySelectorAll('.mat-strip:not(.mat-rowbtns) .mat-box')].map(x => x.querySelector('b').textContent).join('') === 'ASD' && /to do/.test(row.textContent) && !/pick needed/.test(row.textContent);
    matCycle(it.id); matCycle(it.id); const c = it.s === 'done';
    matBuyToggle(it.id); const d = it.buy === true && it.s === 'arrived' && !!it.ins;
    matBuyToggle(it.id); const e = !it.buy && it.s === 'done';
    const wh = [...document.querySelectorAll('#revBox .set-section')].find(s => /WHOLE HOUSE/.test(s.querySelector('h4').textContent)).querySelector('.mat-counts').textContent;
    return a && b && c && d && e && /✅ 1\/1 done/.test(wh);
  }));

  console.log('— 🧱 v6.89 the wall —');

  ok('📤 to their page: a 🏠 item rides WITHOUT his selection notes, his costs or the estimate line — the supplier\'s name never leaves the office file', await page.evaluate(async () => {
    const it = _matD.rooms[0].items.find(x => x.n === 'Baseboard throughout');
    matHmToggle(it.id); it.pick = 'Stained wood'; it.ec = EST_DEFAULT_CATS[0]; it.est = 900;
    const kept = it.hm === true && it.buy === true && it.s === 'ordered';
    await matSave();
    const cli = _dbxFiles[portalRoot() + '/materials-oak-111aaa.json'], off = JSON.parse(_dbxFiles[portalRoot() + '/materials-office-oak-111aaa.json']);
    const c = JSON.parse(cli).rooms.flatMap(r => r.items);
    const o = off.rooms.flatMap(r => r.items).find(x => x.n === 'Baseboard throughout');
    return kept && c.length === 1 && c[0].n === 'Baseboard throughout' && c[0].pick === 'Stained wood' && c[0].s === 'ordered' && !('sel' in c[0]) && !('est' in c[0]) && !('act' in c[0]) && !('ec' in c[0]) &&
      !/Acme Lumber|box store|1250|1,250/.test(cli) && o.sel === 'Stained wood; Acme Lumber or the box store' && o.est === 900 && o.ec === EST_DEFAULT_CATS[0];
  }));
  ok('a saved process template keeps what KIND of row it is and its estimate line, never a selection or a cost', await page.evaluate(async () => {
    await matTplSave(0);
    const t = _matTpl.find(x => x.name === 'WHOLE HOUSE / TRIM');
    return !!t && t.items.some(x => x.buy === true) && t.items.some(x => x.ec === EST_DEFAULT_CATS[0]) && !t.items.some(x => 'sel' in x || 'est' in x || 'act' in x || 'ins' in x);
  }));

  console.log('— 📄 v6.89 the Word file itself —');

  ok('a .docx is read in the browser — stored or deflated — into the same lines a paste gives, and dropping it fills the box and previews it', await page.evaluate(async () => {
    const xml = '<?xml version="1.0"?><w:document xmlns:w="x"><w:body><w:p><w:r><w:t>PANTRY</w:t></w:r></w:p><w:tbl><w:tr><w:tc><w:p><w:r><w:t>Item</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>Selection / Notes</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>Picked</w:t></w:r></w:p></w:tc></w:tr>' +
      '<w:tr><w:tc><w:p><w:r><w:t xml:space="preserve">Pocket </w:t></w:r><w:r><w:t>door</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>Install &amp; trim</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>☒</w:t></w:r></w:p></w:tc></w:tr></w:tbl><w:sectPr/></w:body></w:document>';
    const enc = new TextEncoder(), name = enc.encode('word/document.xml');
    const zip = async deflate => {
      const raw = enc.encode(xml); const data = deflate ? new Uint8Array(await new Response(new Blob([raw]).stream().pipeThrough(new CompressionStream('deflate-raw'))).arrayBuffer()) : raw;
      const lh = new Uint8Array(30 + name.length), dl = new DataView(lh.buffer); dl.setUint32(0, 0x04034b50, true); dl.setUint16(8, deflate ? 8 : 0, true); dl.setUint32(18, data.length, true); dl.setUint32(22, raw.length, true); dl.setUint16(26, name.length, true); lh.set(name, 30);
      const cd = new Uint8Array(46 + name.length), dc = new DataView(cd.buffer); dc.setUint32(0, 0x02014b50, true); dc.setUint16(10, deflate ? 8 : 0, true); dc.setUint32(20, data.length, true); dc.setUint32(24, raw.length, true); dc.setUint16(28, name.length, true); dc.setUint32(42, 0, true); cd.set(name, 46);
      const eo = new Uint8Array(22), de = new DataView(eo.buffer); de.setUint32(0, 0x06054b50, true); de.setUint16(8, 1, true); de.setUint16(10, 1, true); de.setUint32(12, cd.length, true); de.setUint32(16, lh.length + data.length, true);
      const out = new Uint8Array(lh.length + data.length + cd.length + eo.length); out.set(lh, 0); out.set(data, lh.length); out.set(cd, lh.length + data.length); out.set(eo, lh.length + data.length + cd.length); return out;
    };
    const want = 'PANTRY\nItem\tSelection / Notes\tPicked\nPocket door\tInstall & trim\t☒';
    const a = await matDocxText((await zip(false)).buffer), b = await matDocxText((await zip(true)).buffer), junk = await matDocxText(enc.encode('not a zip at all').buffer);
    matPasteClose();
    await matDocxDrop([new File([await zip(true)], 'walkthrough.docx')]);
    const p = _matPasteRows && _matPasteRows.rooms[0];
    const r = a === want && b === want && junk === null && _matPaste === true && $('matPasteBox').value === want && !!p && p.name === 'PANTRY' && p.items[0].n === 'Pocket door' && p.items[0].sel === 'Install & trim' && p.items[0].s === 'picked';
    matPasteClose(); return r;
  }));

  console.log('— 💰 v6.89 the estimates board rolls the build list up —');

  ok('an estimate line shows what the build list holds under it — how many, how far along, est and paid — and that line no longer folds away as empty', await page.evaluate(async () => {
    const cat = EST_DEFAULT_CATS.find(c => /Plumbing/.test(c)), lone = EST_DEFAULT_CATS[EST_DEFAULT_CATS.length - 1];
    matClose(); await new Promise(r => setTimeout(r, 50));
    _dbxFiles[portalRoot() + '/materials-office-oak-111aaa.json'] = JSON.stringify({ full: true, rooms: [{ name: 'BATH 2', items: [
      { id: 'm1', n: 'Toilet', buy: true, s: 'ordered', ec: cat, est: 400, act: 380 }, { id: 'm2', n: 'Faucet', buy: true, s: 'pick', ec: cat, est: 200 }, { id: 'm3', n: 'Mirror', buy: true, s: 'arrived', ins: '2026-09-01', ec: lone }, { id: 'm4', n: 'Loose', buy: true, s: 'picked' }] }] });
    _dbxFiles[estPath('oak-111aaa')] = JSON.stringify({ mk: 20, cats: [] });
    await openEstimates(0);
    const rowOf = n => [...document.querySelectorAll('#revBox .est-row')].find(r => r.querySelector('.est-name') && r.querySelector('.est-name').textContent.replace(/^[▸▾]\s*/, '') === n);
    const a = rowOf(cat), b = rowOf(lone), other = rowOf(EST_DEFAULT_CATS[0]);
    const r = !!a && !a.hidden && /📋 2 on the build list · 1 picked · 1 ordered · 0 received · 0 installed · est \$600 · paid \$380/.test(a.querySelector('.est-sub').textContent) &&
      !!b && !b.hidden && /📋 1 on the build list · 1 picked · 1 ordered · 1 received · 1 installed/.test(b.querySelector('.est-sub').textContent) && !!other && other.hidden === true;
    closeEstimates(); return r;
  }));

  ok('nothing runs off the right edge of the board on a phone', await page.evaluate(async () => {
    delete _dbxFiles[portalRoot() + '/materials-office-oak-111aaa.json']; _dbxFiles[portalRoot() + '/materials-office-oak-111aaa.json'] = JSON.stringify({ full: true, rooms: [{ name: 'KITCHEN', items: [{ id: 'm1', n: 'A very long item name that has to wrap inside the row without pushing anything', buy: true, s: 'ordered', sel: 'A long selection note, the model, the colour, the finish, the size and where it is coming from', est: 12500, act: 13100, ec: EST_DEFAULT_CATS[0] }] }] });
    await openMaterials(0);
    const b = $('revBox'); const r = b.scrollWidth <= b.clientWidth + 1; matClose(); return r;
  }));
  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v6.89') && document.querySelector('footer').textContent.includes(APP_VER);
  }));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
