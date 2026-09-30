// ☑ v7.59 — THE PLATE SAYS SELECT, NOT ADD; 📄 OPEN THE RECEIPT FROM THE BOARD. Eric, with two vanity bids on one line: "i need to
// be able to select multiple bids, for example the two bathroom vanities i want sepereated but both need to be selected" — v7.49
// built it as ➕ add this too, and ➕ is the add-a-line glyph, so he could not find it; now the pair reads ○ use this instead ·
// ☐ use this too — both count, and a used bid reads ☑ USING BOTH — tap to take this off. And on a receipt on the way: "here i need
// to be able to open the receipt and move to another category if its in the wrong one" — every receipt on the way wears
// 📄 The receipt (the whole entry, with 🏷 Move it inside it), and an old File Cabinet filing with no picture on its entry gets
// 🔍 Find the paper — found by its own name and day, never guessed. Every name and figure made up.
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
  const CODE = 'oak-111111';

  const seed = (board, pg) => page.evaluate(([CODE, board, pg]) => {
    jobs = ['Oak House']; crew = []; todos = []; window.scheduleSave = () => {}; dbx.refreshToken = 'test-token';
    _portalIdx = { clients: [{ key: 'oak', job: 'Oak House', code: CODE }] };
    window._dbxFiles = {}; window._ups = []; window._searches = [];
    window.dbxDownload = async p => (window._dbxFiles || {})[p] ?? null;
    window.dbxUpload = async (p, body) => { (window._dbxFiles || {})[p] = body; window._ups.push(p); return {}; };
    window.dbxPathExists = async p => Object.prototype.hasOwnProperty.call(window._dbxFiles || {}, p);
    // a made-up Dropbox name search: files under many names — only the one with the entry's own label AND day is the paper
    window.dbxRpc = async (ep, arg) => {
      if (ep === 'files/search_v2') { window._searches.push(arg.query); const files = window._dbxSearch || []; return { matches: files.filter(n => n.toLowerCase().includes(String(arg.query).toLowerCase().split(' ')[0])).map(n => ({ metadata: { metadata: { '.tag': 'file', name: n.split('/').pop(), path_display: n, path_lower: n.toLowerCase() } } })) }; }
      return {};
    };
    if (!window._said) { window._said = []; const t0 = window.toast; window.toast = (m, g) => { if (m) _said.push(String(m)); return t0(m, g); }; }
    _said.length = 0;
    entries = []; nextId = 1;
    // 1: an old File Cabinet filing — the paper in Dropbox under its own name, nothing on the entry; 2: a receipt with a picture; 3: a typed note
    const e1 = addEntry('Filed', 'Trailer rental invoice', 'Oak House', { amount: 384.17, category: 'Subcontractor', filedTo: 'Inbox' }); e1.id = 1; e1.ts = new Date(2026, 6, 24, 8, 7);
    const e2 = addEntry('Note', 'receipt Lumber Co', 'Oak House', { rcpt: true, category: 'Framing', ai: '📅 2026-09-18\n🏪 Lumber Co\n💵 $1,240.00', budg: 'sent', photoPath: '/Clore DayLog/photos/lumber.jpg' }); e2.id = 2;
    const e3 = addEntry('Note', 'two vanities', 'Oak House', {}); e3.id = 3;
    nextId = 100;
    window._dbxFiles[estPath(CODE)] = JSON.stringify(board);
    window._dbxFiles[portalRoot() + '/' + CODE + '.json'] = JSON.stringify(pg);
    _estIdx = -1; _estD = null; _estPage = null; _estSales = null;
  }, [CODE, board, pg]);
  const open = async () => { await page.evaluate(async () => { await openEstimates(0); }); await page.waitForTimeout(1300); };
  const rowOf = n => page.evaluate(n => { const ci = _estD.cats.findIndex(x => x.n === n), r = document.querySelector(`.est-row[data-ci="${ci}"]`);
    return r ? { num: r.querySelector('.est-num').textContent.trim(), sub: (r.querySelector('.est-sub') || { textContent: '' }).textContent.replace(/\s+/g, ' ').trim(), sum: (r.querySelector('.est-sum-say') || { textContent: '' }).textContent.replace(/\s+/g, ' ').trim(),
      plates: [...r.querySelectorAll('.est-bid')].map(b => [...b.querySelectorAll('.est-use, .est-also')].map(p => p.textContent.trim())),
      pends: [...r.querySelectorAll('.est-pend-row')].map(p => ({ t: p.textContent.replace(/\s+/g, ' ').trim(), plates: [...p.querySelectorAll('button')].map(b => b.textContent.trim()) })) } : null; }, n);
  const unfold = n => page.evaluate(n => { const ci = _estD.cats.findIndex(x => x.n === n); _estOpenCats = new Set([ci]); renderEstimates(); }, n);
  const pend = (a, ts, eid) => ({ a, inc: false, v: '', ts, base: 0, eid });
  const board = () => ({ mk: 20, cats: [
    { n: 'Vanities and sinks', appr: false, bids: [{ e1: 1400, e2: 0, acc: true, note: 'Master bath vanity L&M' }, { e1: 1400, e2: 0, guess: true, note: 'Second bath, L&M' }] },
    { n: 'Plumbing', appr: false, bids: [{ e1: 9000, e2: 0, acc: true }, { e1: 3000, e2: 0 }, { e1: 500, e2: 0 }] },
    { n: 'Demo', appr: false, bids: [], pend: [pend(384.17, '2026-09-29', 1), pend(1240, '2026-09-20', 2), pend(50, '2026-09-21', 77)] },
    { n: 'Framing', appr: false, bids: [] }] });
  const pg = { name: 'Oak House', updated: '2026-09-28', show: { money: true }, invoiced: 0, paid: 0, open: 0, journal: [], phases: [], upcoming: { items: [], tot: 0, all: 1 } };

  console.log('— ☑ the two vanities —');
  await seed(board(), pg);
  await open();
  await unfold('Vanities and sinks');
  const v0 = await rowOf('Vanities and sinks');
  ok('his case: the first vanity reads ✓ USING THIS ONE; the second offers ○ use this instead AND ☐ use this too — both count (no ➕ anywhere on the plates; the row is not ≈ until the placeholder bid is used)', v0.num === '$1,680' && JSON.stringify(v0.plates) === JSON.stringify([['✓ USING THIS ONE'], ['○ use this instead', '☐ use this too — both count']]), JSON.stringify(v0));
  ok('☐ use this too: both are used, the number is the two added together, the row says ☑ USING BOTH BIDS, and the placeholder part is still said', await (async () => {
    await page.evaluate(() => document.querySelectorAll('.est-row.est-open .est-bid')[1].querySelector('.est-also').click());
    await page.waitForTimeout(150);
    const r = await rowOf('Vanities and sinks');
    return r.num === '≈ $3,360' && /☑ USING BOTH BIDS/.test(r.sub) && /≈ PART PLACEHOLDER — \$1,680 of it is your best guess/.test(r.sub) && await page.evaluate(() => { const x = _estD.cats.find(k => k.n === 'Vanities and sinks'); return estRaw(x) === 2800 && estTotal(x) === 3360 && x.bids.every(b => b.acc); });
  })(), JSON.stringify(await rowOf('Vanities and sinks')));
  ok('both bids read ☑ USING BOTH — tap to take this off', JSON.stringify((await rowOf('Vanities and sinks')).plates) === JSON.stringify([['☑ USING BOTH — tap to take this off'], ['☑ USING BOTH — tap to take this off']]), JSON.stringify((await rowOf('Vanities and sinks')).plates));
  ok('the open category says it in words: ☑ USING BOTH BIDS — the sum, what the client sees', /^☑ USING BOTH BIDS — \$1,400 \+ \$1,400 = \$2,800 → \$3,360 to the client\. That total is this category's number\.$/.test((await rowOf('Vanities and sinks')).sum), (await rowOf('Vanities and sinks')).sum);
  ok('the toast says "uses both bids now"', await page.evaluate(() => _said.some(t => /^☑ Vanities and sinks uses both bids now — \$1,400 \+ \$1,400 = \$2,800 \(\$3,360 to the client\)$/.test(t))), await page.evaluate(() => JSON.stringify(_said.slice(-2))));
  ok('tap to take this off: back to one bid — ✓ USING THIS ONE and ☐ use this too — both count', await (async () => {
    await page.evaluate(() => document.querySelectorAll('.est-row.est-open .est-bid')[1].querySelector('.est-use').click());
    await page.waitForTimeout(150);
    const r = await rowOf('Vanities and sinks');
    return r.num === '$1,680' && JSON.stringify(r.plates) === JSON.stringify([['✓ USING THIS ONE'], ['○ use this instead', '☐ use this too — both count']]) && !r.sum;
  })(), JSON.stringify(await rowOf('Vanities and sinks')));
  ok('three bids, two used: ☑ USING 2 OF 3 — and the third reads ☐ use this too (both count would be wrong there); all three used: ☑ USING ALL 3', await (async () => {
    await unfold('Plumbing');
    await page.evaluate(() => document.querySelectorAll('.est-row.est-open .est-bid')[1].querySelector('.est-also').click());
    await page.waitForTimeout(150);
    const two = await rowOf('Plumbing');
    await page.evaluate(() => document.querySelectorAll('.est-row.est-open .est-bid')[2].querySelector('.est-also').click());
    await page.waitForTimeout(150);
    const three = await rowOf('Plumbing');
    return JSON.stringify(two.plates) === JSON.stringify([['☑ USING 2 OF 3 — tap to take this off'], ['☑ USING 2 OF 3 — tap to take this off'], ['○ use this instead', '☐ use this too']]) && /☑ USING 2 OF 3 BIDS/.test(two.sub)
      && JSON.stringify(three.plates) === JSON.stringify([['☑ USING ALL 3 — tap to take this off'], ['☑ USING ALL 3 — tap to take this off'], ['☑ USING ALL 3 — tap to take this off']]) && /☑ USING ALL 3 BIDS/.test(three.sub) && three.num === '$15,000'
      && await page.evaluate(() => _said.some(t => /^☑ Plumbing uses 2 of its 3 bids now/.test(t)) && _said.some(t => /^☑ Plumbing uses all 3 bids now — \$9,000 \+ \$3,000 \+ \$500 = \$12,500 \(\$15,000 to the client\)$/.test(t)));
  })(), JSON.stringify(await rowOf('Plumbing')));
  ok('the ➕ glyph is off the bid plates for good, and ? How this works says it with the vanities', await page.evaluate(() => ![...document.querySelectorAll('.est-use, .est-also')].some(p => /➕/.test(p.textContent)) && /☑ Two separate things in one category \(two vanities, say\)/.test($('estHelpBox').textContent) && /📄 A receipt on the way: tap 📄 The receipt/.test($('estHelpBox').textContent)));

  console.log('— 📄 the receipt on the way —');
  await unfold('Demo');
  const d0 = await rowOf('Demo');
  ok('every receipt on the way wears 📄 The receipt; one with a picture wears 📷 picture too; one whose entry is not in this log says so in words', d0.pends.length === 3 && d0.pends[0].plates[0] === '📄 The receipt' && !d0.pends[0].plates.includes('📷 picture') && d0.pends[1].plates.slice(0, 2).join('|') === '📄 The receipt|📷 picture' && !d0.pends[2].plates.includes('📄 The receipt') && /📄 its entry is not in this device's log/.test(d0.pends[2].t), JSON.stringify(d0.pends));
  ok('the money reads to the cent and the day as a day: $384.17 → $461.00 on their page · sent Sep 29, 2026 (toLocaleString had been dropping the zeros)', /📥 \$384\.17 → \$461\.00 on their page · sent Sep 29, 2026/.test(d0.pends[0].t), d0.pends[0].t);
  ok('📄 opens the entry over the board — its words, the day, the amount, the category — with ‹ Back to the board, 🏷 Wrong category? Move it, and 🔍 Find the paper (an old filing, no picture on it)', await (async () => {
    await page.evaluate(() => document.querySelector('.est-row.est-open .est-pend-row .est-pend-open').click());
    await page.waitForTimeout(100);
    const box = await page.evaluate(() => { const b = document.querySelector('#wizEntHost .we-box'); return b ? { t: b.textContent.replace(/\s+/g, ' '), btns: [...b.querySelectorAll('button')].map(x => x.textContent.trim()), top: b.getBoundingClientRect().top, z: getComputedStyle(b.parentElement).zIndex } : null; });
    return !!box && /ENTRY 1/.test(box.t) && /Trailer rental invoice/.test(box.t) && /\$384\.17/.test(box.t) && /🏷 Subcontractor/.test(box.t) && box.btns.includes('🔍 Find the paper in Dropbox') && box.btns.includes('🏷 Wrong category? Move it') && box.btns.includes('‹ Back to the board') && !box.btns.some(b => /📷/.test(b)) && +box.z > 80;
  })(), await page.evaluate(() => (document.querySelector('#wizEntHost .we-box') || { textContent: '' }).textContent.replace(/\s+/g, ' ')));
  ok('🔍 with nothing under that name and day: said in words — nothing written on the entry, nothing guessed', await (async () => {
    await page.evaluate(() => { window._dbxSearch = ['/Clore DayLog/Invoices/Trailer rental invoice — Subcontractor — Oak House — 2026-08-01 0900.jpeg', '/Clore DayLog/Invoices/Other paper — 2026-07-24 0807.jpeg']; });
    await page.evaluate(() => document.querySelector('#wizEntHost .we-paper-find').click());
    await page.waitForTimeout(250);
    const box = await page.evaluate(() => document.querySelector('#wizEntHost .we-box').textContent.replace(/\s+/g, ' '));
    return /🔍 no paper named "Trailer rental invoice" dated 2026-07-24 in Dropbox — the entry says it was filed under Inbox/.test(box) && await page.evaluate(() => { const e = entries.find(k => k.id === 1); return !e.photoPath && !e.paper && _searches.length === 1 && document.querySelector('#wizEntHost .we-paper-find') !== null; });
  })(), await page.evaluate(() => (document.querySelector('#wizEntHost .we-box') || { textContent: '' }).textContent.replace(/\s+/g, ' ')));
  ok('🔍 finds the paper by its OWN name and day (a same-name file from another day and a same-day file with another name are left alone): the image becomes the entry\'s photo, a PDF its paper, the window shows both, the board row gains 📷', await (async () => {
    await page.evaluate(() => { window._dbxSearch = ['/Clore DayLog/Invoices/Trailer rental invoice — Subcontractor — Oak House — 2026-08-01 0900.jpeg', '/Clore DayLog/Invoices/Other paper — 2026-07-24 0807.jpeg',
      '/Clore DayLog/Invoices/Trailer rental invoice — Subcontractor — Oak House — 2026-07-24 0807.jpeg', '/Clore DayLog/Invoices/Trailer rental invoice — Subcontractor — Oak House — 2026-07-24 0807.pdf']; window.showPhoto = async p => { window._shown = p; }; });
    await page.evaluate(() => document.querySelector('#wizEntHost .we-paper-find').click());
    await page.waitForTimeout(300);
    const box = await page.evaluate(() => ({ btns: [...document.querySelectorAll('#wizEntHost .we-box button')].map(x => x.textContent.trim()), miss: !!document.querySelector('#wizEntHost .we-paper-miss') }));
    const e = await page.evaluate(() => { const e = entries.find(k => k.id === 1); return { ph: e.photoPath, phs: e.photoPaths || null, paper: e.paper || null, shown: window._shown }; });
    const row = (await rowOf('Demo')).pends[0];
    return e.ph === '/Clore DayLog/Invoices/Trailer rental invoice — Subcontractor — Oak House — 2026-07-24 0807.jpeg' && e.phs === null && JSON.stringify(e.paper) === JSON.stringify(['/Clore DayLog/Invoices/Trailer rental invoice — Subcontractor — Oak House — 2026-07-24 0807.pdf']) && e.shown === e.ph
      && box.btns.includes('📷 See the photo') && box.btns.includes('📄 Open the paper') && !box.btns.includes('🔍 Find the paper in Dropbox') && !box.miss && row.plates.slice(0, 2).join('|') === '📄 The receipt|📷 picture';
  })(), await page.evaluate(() => JSON.stringify({ e: entries.find(k => k.id === 1), btns: [...document.querySelectorAll('#wizEntHost .we-box button')].map(x => x.textContent.trim()) })));
  ok('🏷 Wrong category? Move it inside the entry window: the window closes and the mover opens under that receipt', await (async () => {
    await page.evaluate(() => document.querySelector('#wizEntHost .we-move').click());
    await page.waitForTimeout(150);
    return await page.evaluate(() => !document.querySelector('#wizEntHost .we-box') && !!document.querySelector('#ewMove') && !!document.querySelector('#ewMoveTo') && _estWhat && _estWhat.move && _estWhat.move.ci === _estD.cats.findIndex(c => c.n === 'Demo') && _estWhat.move.pi === 0);
  })());
  ok('…and the move lands it on the right line: off Demo, onto Framing, the log entry follows', await (async () => {
    await page.evaluate(async () => { const to = _estD.cats.findIndex(c => c.n === 'Framing'); $('ewMoveTo').value = String(to); await estMoveGo(); });
    await page.waitForTimeout(300);
    return await page.evaluate(() => { const d = _estD.cats.find(c => c.n === 'Demo'), f = _estD.cats.find(c => c.n === 'Framing'); return (d.pend || []).every(p => p.eid !== 1) && (f.pend || []).some(p => p.eid === 1 && p.mv && p.mv[0].from === 'Demo') && entries.find(k => k.id === 1).category === 'Framing' && _said.some(t => /^🏷 Moved — off Demo, onto Framing/.test(t)); });
  })());
  ok('a receipt that already has its picture opens with 📷 See the photo and no 🔍', await (async () => {
    await page.evaluate(() => estWhatClose());
    await unfold('Demo');
    await page.evaluate(() => document.querySelector('.est-row.est-open .est-pend-row .est-pend-open').click());
    await page.waitForTimeout(100);
    const btns = await page.evaluate(() => [...document.querySelectorAll('#wizEntHost .we-box button')].map(x => x.textContent.trim()));
    await page.evaluate(() => wizEntryClose());
    return btns.includes('📷 See the photo') && !btns.includes('🔍 Find the paper in Dropbox') && btns.includes('🏷 Wrong category? Move it');
  })());
  ok('at 390px the board does not run off the side and the receipt plates take a thumb', await page.evaluate(() => { const b = document.querySelector('.est-board') || document.body; return b.scrollWidth <= b.clientWidth + 1 && [...document.querySelectorAll('.est-pend-open')].every(p => p.getBoundingClientRect().height >= 28 && p.getBoundingClientRect().width >= 60); }));
  await page.evaluate(() => closeEstimates());

  ok('the old plate words are gone from the app: no plate reads "➕ add this too" or "✓ COUNTED — tap to take it off" (the comments may still tell the story)', !/>➕ add this too</.test(src) && !/>✓ COUNTED — tap to take it off</.test(src));
  ok('version bumped — APP_VER and the footer agree', /const APP_VER = 'v7\.(59|[6-9]\d)'/.test(src) && new RegExp('<footer>' + (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1].replace('.', '\\.') + ' ·').test(src));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
