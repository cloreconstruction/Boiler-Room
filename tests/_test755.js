// 🧾 v7.55 — THE RECEIPT'S ITEMS AS A LIST. Eric, with a Home Depot receipt: "is there a way sonnet or someone can read the lines or skus
// and make better sense of it? like … be able to sort out 'prm blnkt' and know to keep 'premium moving blankt' and could list it out in
// bullet point or listed much easier to read and see". The read pairs the code line with the description under it and carries each
// item's price and code; the items are ONE LINE EACH — in ③ SAY IT, on the saved entry, in the running log's open row, and in the
// estimates' what-is-in-it window; the 💵 line is still the one amount every reader parses. Every name, code and figure is made up.
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

  const READ = { vendor: 'Home Store', total: 148.69, rdate: '2026-09-29', items: [
    { n: 'Milwaukee AX 12" 5 TPI blades, 5-pack', q: 1, each: 24.97, total: 24.97, sku: '045242591428' },
    { n: 'HDX premium moving blanket 72x80', q: 2, each: 15.98, total: 31.96, sku: '810142297783' },
    { n: 'MOVG BLNKT', q: 2, each: 9.98, total: 19.96, sku: '817423016613', raw: true }] };
  const ai = await page.evaluate(READ => receiptLines(READ), READ);
  ok('the read comes out as a list — 📅 · 🏪 · 💵, then "🛒 n items:" and one line an item: name × q @ $each — $total · SKU code; a code the Wizard could not read stays in quotes', ai === '📅 2026-09-29\n🏪 Home Store\n💵 $148.69\n🛒 3 items:\n• Milwaukee AX 12" 5 TPI blades, 5-pack — $24.97 · SKU 045242591428\n• HDX premium moving blanket 72x80 × 2 @ $15.98 — $31.96 · SKU 810142297783\n• "MOVG BLNKT" × 2 @ $9.98 — $19.96 · SKU 817423016613', JSON.stringify(ai));
  ok('the 💵 line is still the ONE amount the readers parse — three prices on the item lines change nothing', await page.evaluate(ai => { const e = { ai, details: 'Tools\n' + ai, category: 'Tools' }; return estBillParse(e).amt === 148.69 && grindAmtOf(e) === 148.69; }, ai));
  ok('an old one-line read (v7.43) is still read whole by receiptItemsOf; a new list too', await page.evaluate(ai => receiptItemsOf('📅 2026-09-20\n🏪 A\n💵 $5\n🛒 2x4x8 stud × 12 · shims\n🗓 DUE 2026-10-01') === '🛒 2x4x8 stud × 12 · shims' && receiptItemsOf(ai) === ai.split('\n').slice(3).join('\n') && receiptItemsOf('plain words') === '', ai));

  console.log('— 📜 the running log —');
  const log = await page.evaluate(ai => {
    jobs = ['Oak House']; entries = []; nextId = 1; window.scheduleSave = () => {}; prefs.rlFilter = '';
    const e = addEntry('Note', 'Framing run\n' + ai, 'Oak House', { ai, rcpt: true, category: 'Framing' });
    renderAskRecent(); _rlOpen.add(e.id); renderAskRecent();
    const row = document.querySelector('.rl-openrow .log-main');
    return { ws: getComputedStyle(row).whiteSpace, h: row.getBoundingClientRect().height, lines: row.textContent.split('\n').length };
  }, ai);
  ok('the open row keeps the note\'s own lines (pre-wrap), so the items read as a list, not one run-on paragraph', log.ws === 'pre-wrap' && log.lines === 8 && log.h > 8 * 14, JSON.stringify(log));

  console.log('— 💵 the estimates\' what-is-in-it window —');
  await page.evaluate(([CODE, ai]) => {
    dbx.refreshToken = 'test-token'; _portalIdx = { clients: [{ key: 'oak', job: 'Oak House', code: CODE }] };
    window._dbxFiles = {}; window.dbxDownload = async p => (window._dbxFiles || {})[p] ?? null; window.dbxUpload = async (p, body) => { window._dbxFiles[p] = body; return {}; }; window.dbxPathExists = async p => Object.prototype.hasOwnProperty.call(window._dbxFiles, p);
    const e = entries[0];
    _dbxFiles[estPath(CODE)] = JSON.stringify({ mk: 20, cats: [{ n: 'Framing', appr: false, bids: [], pend: [{ a: 148.69, inc: false, v: 'Home Store', ts: '2026-09-29T20:00:00Z', base: 0, eid: e.id }] }] });
    _dbxFiles[portalRoot() + '/' + CODE + '.json'] = JSON.stringify({ name: 'Oak House', updated: '2026-09-21', show: { money: true }, invoiced: 0, paid: 0, open: 0, phases: [], journal: [], upcoming: { items: [{ n: 'Framing', a: 178.43 }], tot: 178.43, all: 1 } });
    _estIdx = -1; _estD = null; _estPage = null;
  }, [CODE, ai]);
  await page.evaluate(async () => { await openEstimates(0); }); await page.waitForTimeout(1200);
  const w = await page.evaluate(() => { const ci = _estD.cats.findIndex(x => x.n === 'Framing'); estWhatOpen(ci, 'way'); const r = document.querySelector('.est-what-sheet .ew-row[data-kind="way"]');
    return r ? { items: (r.querySelector('.ew-items') || { textContent: '' }).textContent, ws: r.querySelector('.ew-items') ? getComputedStyle(r.querySelector('.ew-items')).whiteSpace : '', words: (r.querySelector('.ew-words') || { textContent: '' }).textContent.trim(), fits: document.documentElement.scrollWidth <= document.documentElement.clientWidth } : null; });
  ok('the receipt row shows the items as their own list (one a line), and the words above it do not repeat them', !!w && w.items === ai.split('\n').slice(3).join('\n') && w.ws === 'pre-wrap' && w.words === 'Framing run' && w.fits, JSON.stringify(w));
  ok('a long receipt shows seven lines and says where the rest are', await page.evaluate(() => { const many = receiptLines({ vendor: 'A', total: 5, items: Array.from({ length: 12 }, (_, i) => ({ n: 'thing ' + (i + 1), total: 1 })) });
    entries[0].ai = many; estWhatDraw(); const t = document.querySelector('.est-what-sheet .ew-row[data-kind="way"] .ew-items').textContent; estWhatClose(); return t.split('\n').length === 8 && /• \+ 6 more — 📄 The whole entry has them all$/.test(t); }));
  await page.evaluate(() => { try { estClose(); } catch (e) { closeReview(); } });

  ok('the Wizard is told how: pair the code line with the description under it, keep the price and the code, copy what it cannot read exactly, never guess', /many receipts print a SHORT CODE LINE and then a FULLER DESCRIPTION LINE for the same item/.test(src) && /"each":price of one as a number when printed/.test(src) && /"sku":"the item\\'s own code as printed on its line/.test(src) && /copy that text EXACTLY as printed and set raw to true; never guess/.test(src));
  ok('version bumped — APP_VER and the footer agree', /const APP_VER = 'v7\.(5[5-9]|[6-9]\d)'/.test(src) && new RegExp('<footer>' + (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1].replace('.', '\\.') + ' ·').test(src));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
