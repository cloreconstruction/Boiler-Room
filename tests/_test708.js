// ✎ v7.08 — THE BUILD LIST ROW: EDIT AND DELETE ALWAYS THERE, THE NOTE EDITS IN PLACE, PHOTO ICONS; THE WIZARD READS A PHOTO.
// Eric: "when i click on the item and it open up the buttons across the bottom some of which are edit and delete. i want
// those buttons always open but keep the click and hold for edit as well. the words next to the light up buttons, i want to be
// able to click and edit without having to click the edit button and pull up the window. but keep both … add a photo or two to
// each item but keep them small and make it clickable … drag and drop and wizard can read it and pull sku number and price and
// add markup etc. lets keep that in the edit window … build list just has photo icons to click on."
// Every name, SKU and price in this file is made up.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { fileURLToPath } = require('url');
(async () => {
  const appUrl = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
  await page.goto(appUrl); await page.waitForTimeout(700);
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };
  const P = n => '/Clore DayLog/App Data/Client Portal/mat-photos-oak-111aaa/p' + n + '.jpg';

  await page.evaluate(async (ph) => {
    jobs = ['Oak House']; crew = ['Ann']; entries = []; todos = []; nextId = 1; pendingQueue = [];
    window.scheduleSave = () => {}; window.savePendingSoon = () => {}; window.publishSharedNotes = () => {};
    renderJobSelects(); closePanels(); renderAll();
    dbx.refreshToken = 't'; _portalIdx = { clients: [{ key: 'oak', job: 'Oak House', code: 'oak-111aaa' }] };
    window._dbxFiles = {}; window._ups = [];
    window.dbxDownload = async p => (window._dbxFiles || {})[p] ?? null;
    window.dbxUpload = async (p, b) => { window._dbxFiles[p] = b; window._ups.push(p); return { path_display: p }; };
    window.getToken = async () => 't';
    // Dropbox's thumbnails: a tiny picture for any path
    const png = await new Promise(r => { const c = document.createElement('canvas'); c.width = c.height = 4; c.toBlob(r, 'image/png'); });
    window._png = png;
    const f0 = window.fetch; window.fetch = async (u, o) => /get_thumbnail_v2/.test(String(u)) ? new Response(png, { status: 200, headers: { 'content-type': 'image/png' } }) : f0(u, o);
    window._shown = []; window.showPhoto = p => { window._shown.push(p); };
    window._said = []; const t0 = window.toast; window.toast = (m, g) => { if (m) _said.push(String(m)); return t0(m, g); };
    _dbxFiles[portalRoot() + '/estimates-oak-111aaa.json'] = JSON.stringify({ mk: 15, cats: [] });
    _dbxFiles[portalRoot() + '/materials-office-oak-111aaa.json'] = JSON.stringify({ full: true, seq: 9, rooms: [{ name: 'BATH', items: [
      { id: 'm1', n: 'Countertop', t: 'Misc', buy: true, s: 'picked', sel: 'Stone slab from the yard' },
      { id: 'm2', n: 'Toilet', t: 'Misc', buy: true, s: 'picked', sel: 'Two-piece, white', phs: [ph[0], ph[1]] },
      { id: 'm3', n: 'Vanity light', t: 'Misc', buy: true, s: 'pick', phs: [ph[0], ph[1], ph[2], ph[3], ph[4]] },
      { id: 'm4', n: 'Check the vents', t: 'Misc', s: 'todo' },
      { id: 'm5', n: 'Their faucet', t: 'Misc', hm: true, s: 'picked', pick: 'Matte black', sel: 'office words', est: 50, sku: 'SKU 111', phRead: { title: 'x', price: 50 } },
      { id: 'm6', n: 'Delete me', t: 'Misc', s: 'todo' }] }] });
    await openMaterials(0); _matRmShut = new Set(); renderMatMgr();
    window._row = n => [...document.querySelectorAll('#revBox .mat-item')].find(r => r.querySelector('b') && r.querySelector('b').textContent === n);
    window._it = id => _matD.rooms[0].items.find(x => x.id === id);
  }, [P(1), P(2), P(3), P(4), P(5)]);

  console.log('— ✎ v7.08 the row —');
  ok('EVERY row wears ✎ and ✕ on its name line without being opened — and nothing is open', await page.evaluate(() => {
    const rows = [...document.querySelectorAll('#revBox .mat-item')];
    return rows.length === 6 && rows.every(r => r.querySelector('.mat-quick .mat-q-ed') && r.querySelector('.mat-quick .mat-q-del') && /^✕$/.test(r.querySelector('.mat-q-del').textContent.trim())) && _matItOpen.size === 0;
  }));
  ok('✎ on the row opens the edit window for THAT row', await page.evaluate(() => {
    _row('Countertop').querySelector('.mat-q-ed').click();
    const a = _matEdit === 'm1' && !!$('matSheet'); matEditClose();
    return a && !$('matSheet');
  }));
  ok('holding the name still opens the edit window (kept, as he asked)', await page.evaluate(async () => {
    const nm = _row('Toilet').querySelector('[role="button"].mat-nm');
    nm.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    await new Promise(r => setTimeout(r, 700));
    nm.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    const a = _matEdit === 'm2'; matEditClose(); return a;
  }));
  ok('✕ asks first: the plate says ⚠ SURE? and the row stays; the second tap takes it off', await page.evaluate(() => {
    _row('Delete me').querySelector('.mat-q-del').click();
    const b = _row('Delete me').querySelector('.mat-q-del');
    const armed = /⚠ SURE\?/.test(b.textContent) && b.classList.contains('armed') && !!_it('m6');
    b.click();
    return armed && !_it('m6') && !_row('Delete me');
  }));
  ok('an OPENED row no longer repeats ✎ edit / ✕ delete in its bottom strip — they live on the name line', await page.evaluate(() => {
    matItToggle('m1');
    const chips = [..._row('Countertop').querySelectorAll('.chips-row button')].map(b => b.textContent);
    const r = !chips.some(t => /✎ edit|✕ delete/.test(t)) && !!_row('Countertop').querySelector('.mat-quick .mat-q-ed');
    matItToggle('m1'); return r;
  }));
  // 🎛 v7.09 — Eric: "Pick Needed · Picked · Ordered · Arrived … get rid of the rest because we already have that in the new buttons on top"
  ok('an opened row has NO bottom strip of lights at all now (pick needed · picked · ordered · arrived) — the P·O·R·S·I boxes on the row are the lights', await page.evaluate(() => {
    matItToggle('m1');
    const t = _row('Countertop').textContent;
    const r = !/pick needed.*picked.*ordered.*arrived/i.test(t.replace(/\s+/g, ' ')) && !_row('Countertop').querySelector('.chips-row [onclick^="matLampTap"]') && _row('Countertop').querySelectorAll('.mat-strip:not(.mat-rowbtns) .mat-box').length === 5;
    matItToggle('m1'); return r;
  }));
  // ✍ v7.09 — Eric: "there's a box that says 'Reply: Go straight onto their page.' I want that reply box gone." and "I don't think
  // anything needs to fold because this will be really simple, especially with the edit window that opens for all details."
  ok('NOTHING folds: a tap on the name opens the edit window; no row ever opens under itself; the steps count rides on the name line', await page.evaluate(async () => {
    _it('m1').kids = [{ n: 'measure' }, { n: 'order', ok: true }]; renderMatMgr();
    const trail = /1 open/.test(_row('Countertop').textContent);
    _itHeld = false;   // the hold test above left the "swallow the tap that trails a hold" flag up, as a real hold does until its own tap lands
    _row('Countertop').querySelector('.mat-nm').click(); await new Promise(r => setTimeout(r, 60));
    const win = _matEdit === 'm1' && !!$('matSheet');
    matEditClose(); matItToggle('m1');
    const r = { trail, win, noSteps: !_row('Countertop').querySelector('.mat-steps'), names: document.querySelectorAll('#revBox .mat-item .mat-nm').length, rows: document.querySelectorAll('#revBox .mat-item').length };
    return r.trail && r.win && r.noSteps && r.names === r.rows ? true : JSON.stringify(r);
  }) === true);
  ok('the steps can be checked off IN the edit window (☐ → ☑), where the ☑ Steps fold opens on its own for a row that has some', await page.evaluate(async () => {
    matEditOpen('m1'); await new Promise(r => setTimeout(r, 60));
    const body = document.querySelector('#matSheet .ms-foldsec[data-fold="steps"] .ms-foldbody');
    const boxes = [...body.querySelectorAll('button[aria-pressed]')].filter(b => /^[☐☑]$/.test(b.textContent.trim()));
    const before = boxes.map(b => b.textContent.trim()).join('');
    boxes[0].click();
    const after = [...document.querySelector('#matSheet .ms-foldsec[data-fold="steps"] .ms-foldbody').querySelectorAll('button[aria-pressed]')].filter(b => /^[☐☑]$/.test(b.textContent.trim())).map(b => b.textContent.trim()).join('');
    const okNow = _it('m1').kids[0].ok === true;
    matEditClose(); delete _it('m1').kids; renderMatMgr();
    return !body.hidden && before === '☐☑' && after === '☑☑' && okNow;
  }));
  ok('a 🏠 homeowner row has no Reply box and no 💬 Reply plate anywhere — the client\'s remarks read in the edit window\'s 🏠 fold', await page.evaluate(async () => {
    _it('m5').remarks = [{ from: 'client', text: 'we like the black one', ts: '2026-09-20T10:00:00.000Z' }];
    renderMatMgr();
    const rowT = _row('Their faucet').textContent;
    matEditOpen('m5'); await new Promise(r => setTimeout(r, 60));
    const t = $('matSheet').textContent;
    const r = !document.querySelector('textarea[id^="cvR-"]') && !/💬 Reply|goes straight onto their page/.test(t + rowT) && /we like the black one/.test(t) && !/we like the black one/.test(rowT);
    matEditClose(); return r;
  }));

  console.log('— 📷 v7.08 photo icons on the row —');
  ok('a row with two photos shows two small 📷 icons (1 and 2); five photos show three and "+2"; a row with none shows none; the old "📷2" word is gone', await page.evaluate(() => {
    const ic = n => [..._row(n).querySelectorAll('.mat-q-ph')].map(b => b.textContent.trim());
    const t = ic('Toilet'), v = ic('Vanity light');
    const more = _row('Vanity light').querySelector('.mat-quick').textContent.includes('+2');
    return t.join() === '📷1,📷2' && v.join() === '📷1,📷2,📷3' && more && ic('Countertop').length === 0 && !/·\s*📷\d/.test(_row('Toilet').textContent);
  }));
  ok('a tap on 📷2 shows THAT photo, and the row does not open or fold', await page.evaluate(ph2 => {
    _shown.length = 0; _row('Toilet').querySelectorAll('.mat-q-ph')[1].click();
    return _shown.join() === ph2 && !_matItOpen.has('m2');
  }, P(2)));

  console.log('— ✎ v7.08 the note edits in place —');
  ok('a tap on the note words turns them into a writing box RIGHT THERE — the edit window does not open', await page.evaluate(async () => {
    _row('Countertop').querySelector('.mat-seltxt').click(); await new Promise(r => setTimeout(r, 60));
    const box = $('matSelIn-m1');
    return !!box && _row('Countertop').contains(box) && box.tagName === 'TEXTAREA' && box.value === 'Stone slab from the yard' && document.activeElement === box && !$('matSheet');
  }));
  ok('Enter keeps it: the row shows the new words and the item carries them', await page.evaluate(() => {
    const box = $('matSelIn-m1'); box.value = 'Quartz, 3 cm, eased edge'; box.dispatchEvent(new Event('input'));
    box.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    return _it('m1').sel === 'Quartz, 3 cm, eased edge' && !$('matSelIn-m1') && /Quartz, 3 cm, eased edge/.test(_row('Countertop').querySelector('.mat-sel').textContent) && _matDirty === true;
  }));
  ok('Esc lets it go — nothing changes', await page.evaluate(async () => {
    _row('Countertop').querySelector('.mat-seltxt').click(); await new Promise(r => setTimeout(r, 60));
    const box = $('matSelIn-m1'); box.value = 'something else'; box.dispatchEvent(new Event('input'));
    box.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    return _it('m1').sel === 'Quartz, 3 cm, eased edge' && !$('matSelIn-m1');
  }));
  ok('what he is typing survives a redraw of the board, and a tap away keeps it', await page.evaluate(async () => {
    _row('Countertop').querySelector('.mat-seltxt').click(); await new Promise(r => setTimeout(r, 60));
    let box = $('matSelIn-m1'); box.value = 'Quartz, 3 cm, eased edge — confirm color'; box.dispatchEvent(new Event('input'));
    renderMatMgr();
    box = $('matSelIn-m1'); const kept = box && box.value === 'Quartz, 3 cm, eased edge — confirm color';
    box.dispatchEvent(new Event('blur'));
    return kept && _it('m1').sel === 'Quartz, 3 cm, eased edge — confirm color';
  }));
  ok('it is the SAME note the edit window shows (both ways kept)', await page.evaluate(() => {
    matEditOpen('m1'); const v = $('matSel-m1').value; matEditClose();
    return v === 'Quartz, 3 cm, eased edge — confirm color';
  }));
  ok('on the phone nothing runs off the edge, and the five lights + ⚠ 1st + ⇄ still sit on one line', await page.evaluate(() => {
    const box = $('revBox');
    const plates = [..._row('Toilet').querySelectorAll('.mat-line2 .mat-box')].map(b => Math.round(b.getBoundingClientRect().top));
    return box.scrollWidth <= box.clientWidth + 1 && plates.length === 7 && new Set(plates).size === 1 && [...document.querySelectorAll('#revBox .mat-quick')].every(q => q.getBoundingClientRect().right <= innerWidth);
  }));

  console.log('— 📷 v7.08 the edit window: photos and the Wizard —');
  // 📷 v7.21 — Eric: "I want the photo window to be at the top, just under the name. Then the note next" — so 📷 Photos is the
  // second section (right under Name), 👆 Picked and the Note follow, 💵 Money is a fold further down
  ok('📷 Photos is its own open section, right under the Name (v7.21); the old fold is now 📁 Pocket alone', await page.evaluate(() => {
    matEditOpen('m2');
    const secs = [...document.querySelectorAll('#matSheet .ms-h, #matSheet .ms-fold')].map(x => x.textContent.replace(/\s+/g, ' ').trim());
    const iPh = secs.findIndex(s => /^📷 Photos · 2$/.test(s)), iMoney = secs.findIndex(s => /💵 Money/.test(s));
    return iPh === 1 && secs[0] === 'Name' && /^👆 Picked/.test(secs[2]) && /^Note/.test(secs[3]) && iMoney > iPh && secs.some(s => /^▸ 📁 Pocket/.test(s)) && !secs.some(s => /Photos · 📁 Pocket/.test(s));
  }));
  ok('the photos are small thumbnails you tap to look at, each with 🧙 read and ✕', await page.evaluate(async () => {
    await new Promise(r => setTimeout(r, 200));
    const imgs = [...document.querySelectorAll('#matSheet .ms-ph img')];
    const small = [...document.querySelectorAll('#matSheet .ms-ph')].every(b => b.getBoundingClientRect().width <= 70 && b.getBoundingClientRect().height <= 70);
    _shown.length = 0; document.querySelectorAll('#matSheet .ms-ph')[1].click();
    const btns = [...document.querySelectorAll('#matSheet .ms-phbtns')].map(s => s.textContent.replace(/\s+/g, ''));
    return imgs.length === 2 && imgs.every(i => /^blob:/.test(i.getAttribute('src') || '')) && small && _shown.length === 1 && btns.join() === '🧙✕,🧙✕';
  }));

  // the Wizard answers with a made-up product
  await page.evaluate(() => {
    localStorage.setItem('daylog-aikey', 'k');
    window.shrinkForAi = async () => 'AAAA';
    window._aiCalls = 0;
    window.aiCall = async (body, kind) => { window._aiCalls++; window._aiKind = kind; window._aiSys = body.system;
      return { r: new Response(JSON.stringify({ content: [{ type: 'text', text: '{"title": "Acme Tall Toilet, white", "brand": "Acme", "model": "AT-100", "sku": "5550001", "item": "99887766", "price": 123.45, "store": "Big Box"}' }] }), { status: 200 }) }; };
    renderMatMgr();
  });
  ok('with the Claude key on the phone the drop box says the Wizard will read the SKU and price', await page.evaluate(() => /Wizard reads the SKU and the price/.test($('matDrop-m2').textContent)));
  const drop = await page.evaluate(async () => {
    const dt = new DataTransfer(); dt.items.add(new File([_png], 'x'.repeat(80) + '.jpeg', { type: 'image/jpeg' }));
    $('matDrop-m2').dispatchEvent(new DragEvent('drop', { dataTransfer: dt, bubbles: true, cancelable: true }));
    for (let i = 0; i < 40 && !_it('m2').phRead; i++) await new Promise(r => setTimeout(r, 50));
    const it = _it('m2'), up = _ups.find(p => /mat-photos-oak-111aaa\/m2 /.test(p)) || '';
    return { n: (it.phs || []).length, up, name: up.split('/').pop(), sku: it.sku, est: it.est, sel: it.sel, desc: it.desc, filled: (it.phRead || {}).filled, kind: _aiKind,
      card: ($('matSheet') && $('matSheet').querySelector('.ms-read') || {}).textContent || '', money: document.querySelector('#matSheet .ms-foldsec[data-fold="money"] .ms-foldbody') };
  });
  ok('a photo dropped on the box goes up (a long name keeps its .jpeg ending) and lands on the item', drop.n === 3 && /\.jpeg$/.test(drop.up) && drop.name.replace(/^m2 /, '').length <= 60, JSON.stringify(drop).slice(0, 300));
  // 👆 v7.21 — what it IS goes into its own 👆 Picked box, never into his note (which is kept)
  ok('the Wizard reads it at once (the quick brain, a photo): SKU, price and what it is go into the EMPTY boxes — the note he wrote is kept', drop.sku === 'model AT-100 · SKU 5550001 · item #99887766' && drop.est === 123.45 && drop.sel === 'Two-piece, white' && drop.desc === 'Acme Tall Toilet, white' && JSON.stringify(drop.filled) === '["SKU","price","what it is"]' && drop.kind === 'photo', JSON.stringify(drop).slice(0, 300));
  ok('what it read shows under the photos: the product, model, SKU, the price, and the price with THIS job\'s markup (15%, off its estimates board)', /From the photo/.test(drop.card) && /Acme Tall Toilet/.test(drop.card) && /model AT-100/.test(drop.card) && /\$123\.45/.test(drop.card) && /15% markup \$141\.97/.test(drop.card) && /nothing you typed was changed/.test(drop.card), drop.card);
  ok('💵 Money opens with the SKU box filled and the marked-up price in words — office only', await page.evaluate(() => {
    const body = document.querySelector('#matSheet .ms-foldsec[data-fold="money"] .ms-foldbody');
    return !body.hidden && $('matSku-m2').value === 'model AT-100 · SKU 5550001 · item #99887766' && /15% markup: \$141\.97/.test(body.textContent) && /client never sees a markup/.test(body.textContent);
  }));
  ok('🧙 again never writes over what is there: his own price and SKU stay', await page.evaluate(async () => {
    const it = _it('m2'); it.est = 200; it.sku = 'mine';
    await matPhotoRead('m2', 0);
    return it.est === 200 && it.sku === 'mine' && JSON.stringify(it.phRead.filled) === '[]' && _aiCalls === 2;
  }));
  ok('with NO key the photo still goes on the item and the box says what the key would add; 🧙 says so in words', await page.evaluate(async () => {
    localStorage.removeItem('daylog-aikey'); renderMatMgr();
    const words = /with the Claude key on this phone/.test($('matDrop-m2').textContent);
    const dt = new DataTransfer(); dt.items.add(new File([_png], 'site.jpg', { type: 'image/jpeg' }));
    $('matDrop-m2').dispatchEvent(new DragEvent('drop', { dataTransfer: dt, bubbles: true, cancelable: true }));
    await new Promise(r => setTimeout(r, 300));
    const n = _it('m2').phs.length, calls = _aiCalls;
    _said.length = 0; await matPhotoRead('m2', 0);
    return words && n === 4 && calls === 2 && _said.some(s => /needs the Claude key/.test(s));
  }));
  await page.evaluate(() => matEditClose());

  console.log('— 🏠 v7.08 the wall —');
  ok('the homeowner\'s file never carries the SKU or what the Wizard read (nor the note or the price); the office file keeps them', await page.evaluate(async () => {
    await matSave();
    const cl = JSON.parse(_dbxFiles[portalRoot() + '/materials-oak-111aaa.json'] || '{}');
    const off = JSON.parse(_dbxFiles[portalRoot() + '/materials-office-oak-111aaa.json'] || '{}');
    const c5 = (cl.rooms || []).flatMap(r => r.items).find(x => x.id === 'm5') || {};
    const o5 = (off.rooms || []).flatMap(r => r.items).find(x => x.id === 'm5') || {};
    return c5.n === 'Their faucet' && !('sku' in c5) && !('phRead' in c5) && !('est' in c5) && !('sel' in c5) && o5.sku === 'SKU 111' && !!o5.phRead;
  }));

  ok('no page errors', errs.length === 0, errs.join(' | '));
  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close(); process.exit(fail ? 1 : 0);
})();
