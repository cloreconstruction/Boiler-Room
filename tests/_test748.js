// 🗂 v7.48 — ONE ORDER, EVERYWHERE. Eric: "When I edit a build list item, the tags in there need to have all of the construction
// categories that we normally use. Look through everywhere that there is a full list of construction categories and make sure
// they're always in the same order." The order is the build — site, shell, mechanical, interior finish, other costs — and inside
// a phase his own list's order. Every window that shows the whole list is read here and compared with it — and the homeowner's
// page, whose lines follow the same order. Names and figures made up.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { fileURLToPath } = require('url');
(async () => {
  const appUrl = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const repo = path.dirname(fileURLToPath(appUrl));
  const src = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await ctx.route(u => !/^file:/.test(u.href), r => r.abort());
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
  await page.goto(appUrl); await page.waitForTimeout(700);
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };

  await page.evaluate(async () => {
    jobs = ['Oak House']; crew = ['Phil', 'Kevin']; entries = []; todos = []; nextId = 1; pendingQueue = [];
    window.scheduleSave = () => {}; window.savePendingSoon = () => {}; window.publishSharedNotes = async () => {};
    prefs.matTags = ['Inspector']; prefs.jobCats = {};
    renderJobSelects(); closePanels(); renderAll();
    dbx.refreshToken = 't'; _portalIdx = { clients: [{ key: 'oak', job: 'Oak House', code: 'oak-111aaa' }] };
    window._dbxFiles = {}; window.dbxDownload = async p => (window._dbxFiles || {})[p] ?? null; window.dbxUpload = async (p, b) => { window._dbxFiles[p] = b; return {}; };
    window.dbxPathExists = async p => Object.prototype.hasOwnProperty.call(window._dbxFiles, p);
    window.ORDER = CATS_IN_ORDER.slice();
    window.inOrder = names => { const known = names.filter(n => ORDER.includes(n)); return known.join('|') === ORDER.filter(n => known.includes(n)).join('|'); };
  });
  const ORDER = await page.evaluate(() => ORDER);

  console.log('— 🗂 the one order —');
  ok('the list is the 55 he uses — every one in a phase, none twice, none left out', await page.evaluate(() => ORDER.length === 55 && new Set(ORDER).size === 55 && EST_DEFAULT_CATS.every(n => ORDER.includes(n)) && ORDER.every(n => EST_DEFAULT_CATS.includes(n))));
  ok('the phases run in build order — site, shell, mechanical, interior finish, other costs — and inside a phase the names follow HIS OWN list', await page.evaluate(() =>
    EST_PHASES.map(p => p[0]).join() === 'site,shell,mech,finish,other' && EST_PHASES.every(p => p[2].every((n, i) => i === 0 || EST_DEFAULT_CATS.indexOf(n) > EST_DEFAULT_CATS.indexOf(p[2][i - 1])))));
  ok('anything sorted by it: the known names in the one order, a name it does not know after them in the order it was given — and the sort never loses one', await page.evaluate(() => {
    const out = catSort(['Zebra paint', 'Trim', 'Demo', 'my own thing', 'Roofing', 'Plumbing']);
    return out.join('|') === 'Demo|Roofing|Plumbing|Trim|Zebra paint|my own thing' && catGroups(['Trim', 'Demo', 'Custom X']).map(g => g[0] + ':' + g[2].join('+')).join(' ') === 'site:Demo finish:Trim other:Custom X';
  }));
  ok('the money lists stand on it: the log\'s and the File Cabinet\'s list starts with the 55 in order, then the money buckets, then the old names', await page.evaluate(() =>
    FC_CATS[0] === '—' && FC_CATS.slice(1, 56).join('|') === ORDER.join('|') && FC_CATS.slice(56, 62).join('|') === 'Materials|Tools|Fuel|Truck maintenance|Office/Admin|Personal' && FC_CATS.includes('HVAC') && new Set(FC_CATS).size === FC_CATS.length && RCPT_CATS.slice(0, 55).join('|') === EST_DEFAULT_CATS.join('|')));

  console.log('— 📋 the Build List: the tags —');
  await page.evaluate(async () => {
    _dbxFiles[portalRoot() + '/materials-office-oak-111aaa.json'] = JSON.stringify({ full: true, seq: 5, rooms: [{ name: 'KITCHEN', items: [
      { id: 'a1', n: 'Faucet', t: 'Plumbing', tg: ['Plumbing', 'Tile', 'Phil'], buy: true, s: 'pick' },
      { id: 'a2', n: 'Check the vents', t: 'Misc', s: 'todo' },
      { id: 'a3', n: 'Trim the window', t: 'Misc', tg: ['Trim', 'Demo', 'Inspector'], s: 'todo' }] }] });
    window.scheduleMatSave = () => {}; await openMaterials(0); _matRmShut = new Set(); renderMatMgr();
    matEditOpen('a2'); if (!_matEdOpen.has('tags')) { const b = [...document.querySelectorAll('#matSheetHost .ms-fold')].find(x => /🏷/.test(x.textContent)); if (b) b.click(); }
  });
  const tags = () => page.evaluate(() => { const box = document.querySelector('#matSheetHost .mat-tagbox'); if (!box) return null;
    const heads = [...box.querySelectorAll('.bl-ph-h')].map(h => h.textContent.trim()), rows = [...box.querySelectorAll('.mat-tagrow')].map(r => [...r.querySelectorAll('.pick-chip')].map(b => b.textContent.replace(/^✓ /, '').replace(/^🏷 /, '').trim()));
    return { heads, rows, all: rows.flat(), on: [...document.querySelectorAll('#matSheetHost .mat-tags-on .pick-chip')].map(b => b.textContent.trim()), h: box.getBoundingClientRect().height, scrolls: box.scrollHeight > box.clientHeight + 2, min: Math.min(...[...box.querySelectorAll('.pick-chip')].map(b => b.getBoundingClientRect().height)) }; });
  const t0 = await tags();
  ok('✎ edit a row → 🏷 Tags: EVERY construction category is there to tap — all 55', !!t0 && ORDER.every(n => t0.all.includes(n)), JSON.stringify(t0 && t0.all.length));
  ok('they sit under their phases, in build order, and inside each phase in the one order', !!t0 && t0.heads.slice(0, 5).join('|') === '🏗 Site & utilities|🏗 Foundation & shell|🏗 Mechanical|🏗 Interior finish|🏗 Other costs' && t0.rows.slice(0, 5).flat().join('|') === ORDER.join('|'), JSON.stringify(t0 && t0.heads));
  ok('after them: his own tags and the tags a row on this board still wears (an old trade tag too) — never lost', !!t0 && /Your own tags/.test(t0.heads[5] || '') && ['Inspector', 'Tile', 'Phil'].every(n => t0.rows[5].includes(n)) && !t0.rows[5].some(n => ORDER.includes(n)), JSON.stringify(t0 && t0.rows[5]));
  ok('the box scrolls inside the window (it is never taller than the screen) and every plate takes a thumb', !!t0 && t0.scrolls && t0.h <= 844 * 0.46 && t0.min >= 30, JSON.stringify(t0 && [t0.h, t0.min]));
  ok('a tap lights a category on the row — and what the row wears is shown on top, without a scroll; a second tap takes it off', await (async () => {
    await page.evaluate(() => { [...document.querySelectorAll('#matSheetHost .mat-tagbox .pick-chip')].find(b => /Electrical$/.test(b.textContent.trim())).click(); });
    const a = await tags(), it = await page.evaluate(() => matFindItem('a2').tg);
    await page.evaluate(() => { [...document.querySelectorAll('#matSheetHost .mat-tags-on .pick-chip')].find(b => /Electrical/.test(b.textContent)).click(); });
    const b = await tags(), it2 = await page.evaluate(() => matFindItem('a2').tg);
    return JSON.stringify(it) === '["Electrical"]' && a.on.join() === '✓ 🏷 Electrical' && it2.length === 0 && b.on.length === 0;
  })());
  ok('a row that already wears tags shows them on top, and lit in their places in the list', await (async () => { await page.evaluate(() => { matEditClose(); matEditOpen('a3'); if (!_matEdOpen.has('tags')) { const b = [...document.querySelectorAll('#matSheetHost .ms-fold')].find(x => /🏷/.test(x.textContent)); if (b) b.click(); } });
    const lit = await page.evaluate(() => [...document.querySelectorAll('#matSheetHost .mat-tagbox .pick-chip.sel')].map(b => b.textContent.replace(/^✓ 🏷 /, '').trim())), t = await tags();
    return lit.join('|') === 'Demo|Trim|Inspector' && t.on.length === 3; })());
  ok('👷 whose list (under a checklist row): the crew first, then the same categories in the same order, then his own tags', await page.evaluate(() => { matEditClose(); _matWhoFor = 'a2'; renderMatMgr();
    const box = document.querySelector('#matWho-a2 .mat-tagbox'); if (!box) return false;
    const heads = [...box.querySelectorAll('.bl-ph-h')].map(h => h.textContent.trim()), rows = [...box.querySelectorAll('.mat-tagrow')].map(r => [...r.querySelectorAll('.pick-chip')].map(b => b.textContent.replace(/^✓ /, '').trim()));
    const r = heads[0] === '👷 The crew' && rows[0].join() === 'Phil,Kevin' && rows.slice(1, 6).flat().join('|') === ORDER.join('|') && /Your own tags/.test(heads[6]) && rows[6].includes('Inspector') && !rows[6].includes('Phil');
    _matWhoFor = ''; renderMatMgr(); return r; }));
  ok('🏷 at the top of the board sorts the tags in use the same way: the categories in the one order, then the other tags A → Z', await page.evaluate(() => {
    const chips = [...document.querySelectorAll('#revBox .chips-row .pick-chip')].map(b => b.textContent.trim()).filter(t => /^(✓ )?🏷 /.test(t)).map(t => t.replace(/^(✓ )?🏷 /, '').replace(/ \(\d+\)$/, ''));
    return chips.join('|') === 'Demo|Plumbing|Trim|Inspector|Phil|Tile'; }), await page.evaluate(() => JSON.stringify([...document.querySelectorAll('#revBox .chips-row .pick-chip')].map(b => b.textContent.trim()).slice(0, 12))));
  ok('the estimate-line wheel in the edit window: the same order, under the same phases', await page.evaluate(() => { matEditOpen('a1'); const sel = document.querySelector('#matSheetHost select[id^="matEc-"]'); if (!sel) return false;
    const groups = [...sel.querySelectorAll('optgroup')].map(g => g.label), names = [...sel.querySelectorAll('optgroup option')].map(o => o.textContent);
    const r = groups.join('|') === 'Site & utilities|Foundation & shell|Mechanical|Interior finish|Other costs' && names.join('|') === ORDER.join('|') && sel.options[0].textContent === '— none —';
    matEditClose(); matClose(); return r; }));

  console.log('— 🧾 the cost window, the grinder\'s Build List window —');
  ok('🧾 What kind of cost is this: the project costs are in build order under the five phases (it was A → Z); the overhead plates lead as before', await page.evaluate(() => { qnJobPick = 'Oak House'; qnRcptToggle();
    const box = $('catBox'), heads = [...box.querySelectorAll('#catPhases .bl-ph-h')].map(h => h.textContent.trim()), names = [...box.querySelectorAll('#catPhases .pick-chip')].map(b => b.textContent.replace(/^\S+ /, '').trim());
    const known = names.filter(n => ORDER.includes(n)), over = [...box.querySelectorAll('.cat-grid')][0].textContent;
    const r = heads.join('|') === '🏗 Site & utilities|🏗 Foundation & shell|🏗 Mechanical|🏗 Interior finish|🏗 Other costs' && known.join('|') === ORDER.join('|') && names.slice(-2).join('|') === 'Materials|Personal' && /Tools/.test(over) && /Fuel/.test(over) && !/A → Z/.test(box.textContent) && /PROJECT COSTS — in build order/.test(box.textContent);
    [...box.querySelectorAll('#catPhases .pick-chip')].find(b => /Framing$/.test(b.textContent.trim())).click();
    return r && qnCat === 'Framing'; }), await page.evaluate(() => $('catBox').textContent.replace(/\s+/g, ' ').slice(0, 300)));
  ok('a job\'s own ⭐ USED ON THIS JOB row still leads, and the list under it is whole and in order', await page.evaluate(() => { prefs.jobCats = { 'oak house': ['Trim', 'Framing'] }; qnRcpt = true; catModalOpen();
    const box = $('catBox'), grids = [...box.querySelectorAll('.cat-grid')], first = [...grids[0].querySelectorAll('.pick-chip')].map(b => b.textContent.trim());
    const names = [...box.querySelectorAll('#catPhases .pick-chip')].map(b => b.textContent.replace(/^\S+ /, '').trim()).filter(n => ORDER.includes(n));
    const r = /USED ON THIS JOB/.test(box.textContent) && first.join('|') === '⭐ Trim|✓ Framing' && names.join('|') === ORDER.join('|');
    catModalClose(); qnRcpt = false; qnCat = ''; prefs.jobCats = {}; renderTagChips(); return r; }));
  ok('📋 the grinder\'s Build List window lists them the same way', await page.evaluate(async () => { qnJobPick = 'Oak House'; renderTagChips(); await qnBLToggle(); await new Promise(r => setTimeout(r, 200));
    const names = [...document.querySelectorAll('#blPhases .bl-cat')].map(b => b.textContent.replace(/^\S+ /, '').trim()), heads = [...document.querySelectorAll('#blPhases .bl-ph-h')].map(h => h.textContent.trim());
    const r = heads.join('|') === '🏗 Site & utilities|🏗 Foundation & shell|🏗 Mechanical|🏗 Interior finish|🏗 Other costs' && names.join('|') === ORDER.join('|');
    catModalClose(); qnBL = false; qnBLRoom = ''; renderTagChips(); return r; }), await page.evaluate(() => JSON.stringify([...document.querySelectorAll('#blPhases .bl-cat')].map(b => b.textContent.trim()).slice(0, 6))));

  console.log('— 💰 the estimates board —');
  ok('a board saved in ANOTHER order (an old one, with later categories at its bottom and one of his own) shows every phase in the one order; his own category comes last', await page.evaluate(async () => {
    const shuffled = [...ORDER.filter((n, i) => i % 2), 'Porch swing', ...ORDER.filter((n, i) => !(i % 2)).reverse()];
    _dbxFiles[estPath('oak-111aaa')] = JSON.stringify({ mk: 20, cats: shuffled.map(n => ({ n, appr: false, bids: [{ e1: 100, e2: 0, acc: true, inc: true }] })) });
    _dbxFiles[portalRoot() + '/oak-111aaa.json'] = JSON.stringify({ name: 'Oak House', show: {}, phases: [], journal: [] });
    await openEstimates(0);
    const rows = [...document.querySelectorAll('.est-board .est-row')].map(r => r.querySelector('.est-name').textContent.replace(/[▸▾]/g, '').trim());
    const saved = _estD.cats.map(x => x.n).join('|') === shuffled.join('|');   // the file's own order is not touched — only how it is shown
    window._rows = rows;
    return rows.length === 56 && rows.slice(0, 55).join('|') === ORDER.join('|') && rows[55] === 'Porch swing' && saved; }), await page.evaluate(() => JSON.stringify((window._rows || []).slice(0, 14))));
  ok('the 📥 bills strip\'s category wheels: the same order under the same phases — and a pick still lands on the right row of the board', await page.evaluate(async () => { _estBillFold = true; renderEstimates();
    const sel = $('estHandC'); if (!sel) return false;
    const groups = [...sel.querySelectorAll('optgroup')].map(g => g.label), names = [...sel.querySelectorAll('option')].map(o => o.textContent);
    const okOrder = groups.join('|') === 'Site & utilities|Foundation & shell|Mechanical|Interior finish|Other costs' && names.slice(0, 55).join('|') === ORDER.join('|') && names[55] === 'Porch swing';
    const opt = [...sel.options].find(o => o.textContent === 'Trusses'); sel.value = opt.value; $('estHandA').value = '250'; $('estHandV').value = 'Truss Co';
    await estBillHand(); await new Promise(r => setTimeout(r, 100));
    const hit = _estD.cats.filter(x => (x.pend || []).length).map(x => x.n).join();
    closeEstimates(); return okOrder && hit === 'Trusses'; }));

  console.log('— 📜 the log\'s wheel —');
  ok('the running log\'s category wheel: the 55 in the one order first', await page.evaluate(() => { logOpenInit(); const names = [...$('lfCat').options].map(o => o.textContent); return names[0] === 'All categories' && names.slice(1, 56).join('|') === ORDER.join('|'); }));
  ok('nowhere in the app is the whole list sorted A → Z any more, and the phases table is written once', !/RCPT_CATS\.filter\([^)]*\)\.sort\(\(a, b\) => a\.localeCompare\(b\)\)/.test(src) && (src.match(/^const EST_PHASES = \[/gm) || []).length === 1 && src.indexOf('const EST_PHASES = [') < src.indexOf('const FC_CATS = ') && !/A → Z<\/div>/.test(src));
  ok('at 390px nothing runs off the side', await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth));

  // the homeowner's page lists their lines in the same order as his board — it is how the page is DRAWN; its data is not touched
  console.log('— 🏠 the homeowner\'s page —');
  const csrc = fs.readFileSync(path.join(repo, 'c', 'index.html'), 'utf8');
  const tableOf = s => ((s.match(/const EST_PHASES = \[\r?\n[\s\S]*?\r?\n\];/) || [])[0] || '').replace(/\r\n/g, '\n');
  ok('their page stands on the SAME table as the app — the two are identical, and it is written once', tableOf(src).length > 500 && tableOf(src) === tableOf(csrc) && (csrc.match(/^const EST_PHASES = \[/gm) || []).length === 1);
  const home = async (json, q = '') => {
    const p = await ctx.newPage();
    p.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push('client: ' + e.message); });
    await p.addInitScript(json => {
      window._posts = [];
      window.fetch = (url, opts) => {
        if (!/client-portal/.test(String(url))) return Promise.reject(new TypeError('Failed to fetch'));
        if (opts && opts.method === 'POST') { try { window._posts.push(JSON.parse(opts.body)); } catch (e) { window._posts.push(String(opts.body)); } return Promise.resolve(new Response('{"ok":true}', { status: 200, headers: { 'content-type': 'application/json' } })); }
        return Promise.resolve(new Response(json, { status: 200, headers: { 'content-type': 'application/json' } }));
      };
    }, JSON.stringify(json));
    await p.goto(appUrl.replace(/index\.html$/, 'c/index.html') + '?c=oak-111aaa' + q);
    await p.waitForTimeout(900);
    return p;
  };
  const given = ['Trim', 'Siding', 'Porch swing', 'Demo', 'Plumbing'];
  const hp = await home({ name: 'Oak House', updated: '2026-09-21', show: { money: true }, invoiced: 0, paid: 0, open: 0, phases: [], journal: [],
    budget: [{ n: 'Trim', est: 500 }, { n: 'Siding', opts: [{ t: 'Vinyl', est: 8000 }, { t: 'Repaint', est: 3000 }], def: 0 }, { n: 'Porch swing', est: 50 }, { n: 'Demo', est: 1000 }, { n: 'Plumbing', est: 3600 }],
    upcoming: { items: [{ n: 'Trim', a: 900 }, { n: 'Labor — week of Aug 30 (62 h)', a: 700 }, { n: 'Demo', a: 100 }, { n: 'Plumbing', a: 300 }], tot: 2000, all: 1 } });
  const hread = () => hp.evaluate(() => ({
    bud: [...document.querySelectorAll('#budgetCard .bud-row')].map(r => r.querySelector('span').textContent.replace(/ — (YOUR CHOICE|CHOOSE YOUR OPTION)$/, '').trim()),
    rc: [...document.querySelectorAll('#upcomingCard .rc-row')].map(r => r.querySelector('span').textContent.trim()),
    tot: document.querySelector('#budgetCard .bud-total').textContent.trim(), rcTot: document.querySelector('#upcomingCard .bud-total').textContent.trim(),
    data: _d.budget.map(b => b.n), fits: document.documentElement.scrollWidth <= document.documentElement.clientWidth }));
  const h0 = await hread();
  ok('ESTIMATED REMAINING COSTS: the lines in the one order, whatever order the page was written in — a category of his own last', h0.bud.join('|') === 'Demo|Siding|Plumbing|Trim|Porch swing', JSON.stringify(h0.bud));
  ok('RECEIPTS RECEIVED: the same order (it was largest first) — a week of labor after the categories', h0.rc.join('|') === 'Demo|Plumbing|Trim|Labor — week of Aug 30 (62 h)', JSON.stringify(h0.rc));
  ok('a name on both cards sits in the same order on both', ['Demo', 'Plumbing', 'Trim'].every((n, i, a) => i === 0 || (h0.bud.indexOf(n) > h0.bud.indexOf(a[i - 1]) && h0.rc.indexOf(n) > h0.rc.indexOf(a[i - 1]))));
  ok('the sums are the same as ever, and the page\'s own data keeps the order it came in', h0.tot === '$13,150.00' && h0.rcTot === '$2,000.00' && h0.data.join('|') === given.join('|'), JSON.stringify([h0.tot, h0.rcTot, h0.data]));
  ok('a tap on a choice still names the line it was made on, and the total follows it', await (async () => {
    await hp.evaluate(() => [...document.querySelectorAll('#budgetCard .opt-pick')].find(b => /Repaint/.test(b.textContent)).click());
    await hp.waitForTimeout(200);
    const h1 = await hread(), posts = await hp.evaluate(() => window._posts.filter(x => x && x.pick));
    return posts.length === 1 && posts[0].pick.n === 'Siding' && posts[0].pick.o === 1 && h1.tot === '$8,150.00' && h1.bud.join('|') === h0.bud.join('|') && await hp.evaluate(() => _d.budget[1].n === 'Siding' && _d.budget[1].pick === 1 && !('pick' in _d.budget[0]));
  })());
  ok('at 390px their page does not run off the side', h0.fits);
  await hp.close();
  // a line drawn in a DIFFERENT place than it holds in the data: the tap must reach the line that was tapped
  const hp2 = await home({ name: 'Oak House', updated: '2026-09-21', show: { money: true }, invoiced: 0, paid: 0, open: 0, phases: [], journal: [],
    budget: [{ n: 'Flooring', opts: [{ t: 'Oak', est: 9000 }, { t: 'Vinyl plank', est: 4000 }], def: 0 }, { n: 'Trim', est: 500 }, { n: 'Siding', opts: [{ t: 'Vinyl', est: 8000 }, { t: 'Repaint', est: 3000 }], def: 0 }] });
  ok('two lines with choices, drawn in another order than the data holds them: each tap lands on its own line', await (async () => {
    const drawn = await hp2.evaluate(() => [...document.querySelectorAll('#budgetCard .bud-row')].map(r => r.querySelector('span').textContent.replace(/ — (YOUR CHOICE|CHOOSE YOUR OPTION)$/, '').trim()));
    await hp2.evaluate(() => [...document.querySelectorAll('#budgetCard .opt-pick')].find(b => /Vinyl plank/.test(b.textContent)).click());
    await hp2.waitForTimeout(200);
    await hp2.evaluate(() => [...document.querySelectorAll('#budgetCard .opt-pick')].find(b => /Repaint/.test(b.textContent)).click());
    await hp2.waitForTimeout(200);
    const posts = await hp2.evaluate(() => window._posts.filter(x => x && x.pick).map(x => x.pick.n + ':' + x.pick.o)), d = await hp2.evaluate(() => _d.budget.map(b => b.n + ':' + (Number.isInteger(b.pick) ? b.pick : '-')));
    return drawn.join('|') === 'Siding|Trim|Flooring' && posts.join('|') === 'Flooring:1|Siding:1' && d.join('|') === 'Flooring:1|Trim:-|Siding:1' && (await hp2.evaluate(() => document.querySelector('#budgetCard .bud-total').textContent.trim())) === '$7,500.00';
  })());
  await hp2.close();

  ok('version bumped — APP_VER and the footer agree', /const APP_VER = 'v7\.(4[8-9]|[5-9]\d)'/.test(src) && new RegExp('<footer>' + (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1].replace('.', '\\.') + ' ·').test(src));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
