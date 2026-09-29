// 📷 v7.43 — THE GRINDER: THE PHOTO FIRST, THE WIZARD READS ON HIS TAP, THE RECEIPT'S ITEMS, ④'S TWO CHIPS ABOVE THE FOLD.
// Eric: "lets swap 2 and 3 on the grinder, i want to add photo first and them have a button to have the wizard read it instead of
// auto read, and on reciepts, id like the date, store, amount, and summary of items and if agent reads it and it has some weird
// name because of the store sku and it can't figure out what it was, just put exactly what it ways on the reciept." and "Lets leave
// the tag it drop down so that it always shows receipt and build list but then the drop down is all the other tags". And, asked the
// same hour, where a note sits until it is unlocked — the small print in ⑤ says it now. Every name and figure here is made up.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { fileURLToPath } = require('url');
(async () => {
  const appUrl = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const repo = path.dirname(fileURLToPath(appUrl));
  const src = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const errs = [];
  const open = async (init) => { const c = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }); await c.route(u => !/^file:/.test(u.href), r => r.abort()); if (init) await c.addInitScript(init); const p = await c.newPage(); p.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); }); await p.goto(appUrl); await p.waitForTimeout(700); return { ctx: c, page: p }; };
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };
  const wait = async (fn, ms = 5000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { try { if (await fn()) return true; } catch (e) {} await new Promise(r => setTimeout(r, 60)); } return false; };

  console.log('— 📱 Eric\'s phone —');
  const eric = await open();
  const page = eric.page;
  await page.evaluate(() => {
    window.scheduleSave = () => {}; window.savePendingSoon = () => {}; window.publishSharedNotes = async () => {};
    entries = []; todos = []; jobs = ['Oak House', 'Pine Cabin']; crew = ['Phil']; nextId = 100; pendingQueue = [];
    prefs.tags = ['Plumber', 'Inspector', 'Lumber yard']; prefs.aiPhotos = true; prefs.vendCat = {};
    lsSet('daylog-aikey', 'test-key');
    renderJobSelects(); closePanels(); renderAll();
    window._reads = 0;
    window.READ = { desc: '', category: 'Framing', vendor: 'Spenard Builders', total: 412.55, rdate: '2026-09-20',
      items: [{ n: '2x4x8 stud', q: 12, raw: false }, { n: 'deck screws 5 lb', q: 1, raw: false }, { n: 'PT 4X4-8 GC', q: 2, raw: true }] };
    window.aiDescribePhoto = async () => { _reads++; await new Promise(r => setTimeout(r, 30)); return JSON.parse(JSON.stringify(READ)); };
    window.billMaybeSuggest = () => {}; window.renewMaybeSuggest = () => {}; window.aiMaybeSuggestCat = () => {}; window.aiMaybePrefillAmt = () => {};
    window._said = []; const t0 = window.toast; window.toast = (m, g) => { if (m) _said.push(String(m)); return t0(m, g); };
    window.png = name => new File([new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 0])], name, { type: 'image/png' });
    window.stage = name => noteAddPhotos({ files: [png(name)], value: '' });
  });
  const flow = () => page.evaluate(() => { const st = [...document.querySelectorAll('#qnCard .g-step')]; return { order: st.map(e => e.dataset.step).join(''), next: (st.find(e => e.classList.contains('next')) || { dataset: {} }).dataset.step || '', done: st.filter(e => e.classList.contains('done')).map(e => e.dataset.step).join(''),
    labels: st.map(e => e.querySelector('.g-step-label').textContent.replace(/\s+/g, ' ').trim()) }; });

  ok('the steps read ① job · ② ADD A PHOTO OR FILE · ③ SAY IT · ④ TAG IT · ⑤ UNLOCK IT · ⑥ SEND — and on the screen the photo plate sits above the writing box', await (async () => {
    const f = await flow();
    const pos = await page.evaluate(() => ({ cam: document.querySelector('#qnCard .cam-btn--wide').getBoundingClientRect().top, box: $('askText').getBoundingClientRect().top, camStep: document.querySelector('#qnCard .cam-btn--wide').closest('.g-step').dataset.step, boxStep: $('askText').closest('.g-step').dataset.step }));
    return f.order === '123456' && /^2 ADD A PHOTO OR FILE/.test(f.labels[1]) && /^3 SAY IT/.test(f.labels[2]) && /^4 TAG IT/.test(f.labels[3]) && pos.cam < pos.box && pos.camStep === '2' && pos.boxStep === '3';
  })(), JSON.stringify(await flow()));
  ok('the lamp walks his order: no job → ①; the job picked → ② the photo; a photo in → ③ SAY IT (and ② reads ✓ DONE · 📷 1 attached); words in → ⑥ the lever', await (async () => {
    const a = await flow();
    await page.evaluate(() => { qnJobPick = 'Oak House'; updateStepFlow(); });
    const b = await flow();
    await page.evaluate(() => stage('receipt one.png'));
    const c = await flow(), sum = await page.evaluate(() => document.querySelector('#qnCard .g-step[data-step="2"] .g-step-sum').textContent);
    await page.evaluate(() => { $('askText').value = 'lumber for the deck'; $('askText').dispatchEvent(new Event('input')); });
    const d = await flow();
    await page.evaluate(() => { $('askText').value = ''; $('askText').dispatchEvent(new Event('input')); });
    return a.next === '1' && b.next === '2' && c.next === '3' && /2/.test(c.done) && /📷 1 attached/.test(sum) && d.next === '6' && /3/.test(d.done);
  })());

  console.log('— 🧙 the Wizard reads on his tap —');
  ok('NOTHING reads the photo by itself: with the key in and "read photos automatically" on, the staged photo is not sent to the Wizard, the note box stays empty and nothing is drafted', await (async () => {
    await page.waitForTimeout(400);
    return page.evaluate(() => _reads === 0 && $('askText').value === '' && !_said.some(s => /Drafted from the photo/.test(s)) && !(fcMeta.get(notePhotos[0]) || {}).ai);
  })());
  ok('under the photo plate a plate of its own: 🧙 Have the Wizard read it — and a line that says nothing reads a photo by itself; with 🧾 Receipt lit the line says what the read will fill in', await page.evaluate(() => {
    const b = $('wizReadBtn'), why = document.querySelector('#qnReadRow .wiz-read-why').textContent;
    const inStep2 = !!b && b.closest('.g-step').dataset.step === '2' && b.getBoundingClientRect().height >= 44;
    qnRcpt = true; renderNotePhotoList(); const why2 = document.querySelector('#qnReadRow .wiz-read-why').textContent; qnRcpt = false; renderNotePhotoList();
    return inStep2 && b.textContent.trim() === '🧙 Have the Wizard read it' && /Nothing reads a photo by itself/.test(why) && /the date, the store, the amount and the items/.test(why2);
  }));
  ok('a tap reads it: the working band says so, the words land in ③ SAY IT — 📅 the date · 🏪 the store · 💵 the amount · 🛒 the items — and the plate turns to ✓ READ', await (async () => {
    await page.evaluate(() => { $('wizReadBtn').click(); });
    const busy = await page.evaluate(() => /READING/.test(($('wizReadBtn') || {}).textContent || '') || /READING THE PHOTO/.test(($('busyBand') || {}).textContent || ''));
    await wait(() => page.evaluate(() => /✓ READ/.test(($('wizReadBtn') || {}).textContent || '')));
    const r = await page.evaluate(() => ({ v: $('askText').value, reads: _reads, plate: $('wizReadBtn').textContent.trim(), ai: (fcMeta.get(notePhotos[0]) || {}).ai, said: _said.join(' | ') }));
    return busy && r.reads === 1 && r.v === '📅 2026-09-20\n🏪 Spenard Builders\n💵 $412.55\n🛒 2x4x8 stud × 12 · deck screws 5 lb · "PT 4X4-8 GC" × 2' && r.ai === r.v && /^🧙 ✓ READ — the words are in ③ SAY IT/.test(r.plate) && /the words are in ③ SAY IT/.test(r.said);
  })(), await page.evaluate(() => JSON.stringify({ v: $('askText').value, reads: _reads })));
  ok('an item the Wizard could not read as a product rides EXACTLY as the receipt printed it, in quotes — the others in plain words; a quantity of one is not written', await page.evaluate(() => {
    const line = $('askText').value.split('\n')[3];
    return /"PT 4X4-8 GC" × 2/.test(line) && /2x4x8 stud × 12/.test(line) && / · deck screws 5 lb · /.test(line) && !/"2x4x8/.test(line);
  }));
  ok('reading again does not double the words: the second read takes the first one\'s place, and his own words around it stay', await (async () => {
    await page.evaluate(() => { $('askText').value = 'for the back deck\n' + $('askText').value; READ.total = 420; $('wizReadBtn').click(); });
    await wait(() => page.evaluate(() => _reads === 2 && /✓ READ/.test($('wizReadBtn').textContent)));
    return page.evaluate(() => { const v = $('askText').value; return v.startsWith('for the back deck\n') && (v.match(/🏪 Spenard Builders/g) || []).length === 1 && /💵 \$420/.test(v) && !/412\.55/.test(v); });
  })());
  ok('SEND: the saved entry carries the reading, so the receipts window reads its store and its amount — and the items line never confuses the amount', await page.evaluate(async () => {
    saveNoteFrom('askText'); await new Promise(r => setTimeout(r, 60));
    const e = entries.find(x => /Spenard Builders/.test(x.ai || ''));
    const p = e && estBillParse(e);
    return !!e && /🛒 2x4x8 stud/.test(e.ai) && /for the back deck/.test(e.details) && !!p && p.amt === 420 && grindAmtOf(e) === 420;
  }));
  ok('receiptLines by itself: no items → no 🛒 line; more than twelve → "+ n more"; a dollar sign never rides on the items line; plain strings are taken as names', await page.evaluate(() => {
    const a = receiptLines({ vendor: 'A', total: 5, rdate: '2026-09-01' });
    const many = receiptLines({ vendor: 'A', total: 5, items: Array.from({ length: 15 }, (_, i) => ({ n: 'thing ' + (i + 1), q: 1 })) });
    const money = receiptLines({ vendor: 'A', total: 5, items: [{ n: 'caulk $4.99 ea', q: 3 }, 'shims'] });
    return !/🛒/.test(a) && /🛒 thing 1 · /.test(many) && / · \+ 3 more$/.test(many) && !/thing 13/.test(many) && /🛒 caulk 4\.99 ea × 3 · shims$/.test(money) && (money.match(/\$/g) || []).length === 1;
  }));
  ok('the Wizard is TOLD to copy what it cannot read: the prompt asks for the items, says EXACTLY as printed and never guess, and has the room for them', /"items":\[\{"n":"what was bought, in a few plain words/.test(src) && /copy that text EXACTLY as printed and set raw to true; never guess/.test(src) && /max_tokens: 700,   \/\/ 🛒 v7\.43/.test(src));
  ok('with no Claude key the plate says what it needs, and a tap reads nothing', await (async () => {
    await page.evaluate(() => { lsSet('daylog-aikey', ''); stage('receipt two.png'); });
    const r = await page.evaluate(() => { const before = _reads; _said.length = 0; const why = document.querySelector('#qnReadRow .wiz-read-why').textContent; $('wizReadBtn').click(); return { why, same: _reads === before, said: _said.join(' | ') }; });
    await page.evaluate(() => { lsSet('daylog-aikey', 'test-key'); noteClearPhotos(); $('askText').value = ''; $('askText').dispatchEvent(new Event('input')); });
    return /needs your Claude key first/.test(r.why) && r.same && /Add your Anthropic key/.test(r.said);
  })());
  ok('the Setup switch says what it still covers: the grinder reads only on his tap', /In the GRINDER nothing reads a photo by itself: tap 🧙 Have the Wizard read it/.test(src));

  console.log('— 🏷 ④ TAG IT: two chips above the fold —');
  ok('folded, ④ still shows 🧾 Receipt and 📋 Build List — and only those; his own tags are inside the fold, behind "▸ tap for your other tags"', await page.evaluate(() => {
    window._gOpen = {}; qnSel.clear(); qnRcpt = false; renderTagChips();
    const st = document.querySelector('#qnCard .g-step[data-step="4"]'), fx = [...document.querySelectorAll('#qnTagFixed .pick-chip')], vis = e => !!e && e.offsetParent !== null && getComputedStyle(e).display !== 'none';
    return st.classList.contains('fold') && fx.length === 2 && /🧾 Receipt/.test(fx[0].textContent) && /📋 Build List/.test(fx[1].textContent) && fx.every(vis) && fx.every(b => b.getBoundingClientRect().height >= 40)
      && !vis($('qnTagChips')) && !document.querySelector('#qnTagChips .tag-fixed') && /tap for your other tags/.test(st.querySelector('.g-step-label').textContent);
  }));
  ok('a tap on the label opens the fold: every other tag, ➕ tag and ✎ arrange — the two fixed chips stay where they were, drawn once', await page.evaluate(() => {
    gFold(4);
    const st = document.querySelector('#qnCard .g-step[data-step="4"]'), tags = [...document.querySelectorAll('#qnTagChips .pick-chip')].map(b => b.textContent.trim());
    return !st.classList.contains('fold') && getComputedStyle($('qnTagChips')).display !== 'none' && ['Plumber', 'Inspector', 'Lumber yard'].every(t => tags.some(x => x.includes(t))) && tags.some(x => /➕ tag/.test(x))
      && document.querySelectorAll('#qnCard .g-step[data-step="4"] .tag-fixed').length === 1 && !tags.some(x => /Receipt|Build List/.test(x));
  }));
  ok('folded again, one of his own tags picked opens it by itself and the label names the tag; 🧾 Receipt lit alone leaves it folded (the chip itself says RECEIPT)', await page.evaluate(() => {
    gFold(4); const st = document.querySelector('#qnCard .g-step[data-step="4"]'), folded = st.classList.contains('fold');
    tagToggle('Plumber'); const open1 = !st.classList.contains('fold') && /🏷 Plumber/.test(st.querySelector('.g-step-sum').textContent);
    tagToggle('Plumber');
    qnRcpt = true; renderTagChips(); const f2 = st.classList.contains('fold') && /RECEIPT/.test(document.querySelector('#qnTagFixed .pick-chip').textContent) && st.classList.contains('done');
    qnRcpt = false; renderTagChips();
    return folded && open1 && f2;
  }));
  ok('⑤ UNLOCK IT says where a note sits until it is unlocked: on his phone — this phone and his own Dropbox, never a crew phone', await page.evaluate(() => { renderVisChips(); const t = $('visExplain').textContent; return /🔒 just yours — saved on this phone and in your own Dropbox; no crew phone gets it/.test(t) && /📨 goes to Phil's phone/.test(t) && /⚠ stays up big on their page until somebody answers/.test(t); }));
  ok('the writing box is still on the first phone screen, under the photo step — no scroll to write and ask', await page.evaluate(() => {
    noteClearPhotos(); $('askText').value = ''; $('askText').style.height = ''; window.scrollTo(0, 0);
    const r = $('askText').getBoundingClientRect(), w = $('wizSideBtn').getBoundingClientRect(), bar = document.querySelector('.capture').getBoundingClientRect();
    return r.top < 700 && r.bottom <= bar.top && w.bottom <= bar.top;   // whole, above the bottom bar
  }), await page.evaluate(() => JSON.stringify({ top: Math.round($('askText').getBoundingClientRect().top), bottom: Math.round($('askText').getBoundingClientRect().bottom), ask: Math.round($('wizSideBtn').getBoundingClientRect().bottom) })));
  ok('nothing runs off the side at 390px', await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth));
  await eric.ctx.close();

  console.log('— 👷 Phil\'s phone —');
  const phil = await open(() => { try { localStorage.setItem('daylog-crew-name', 'Phil'); localStorage.setItem('daylog-crew-root', '/Phil'); localStorage.setItem('daylog-crew-jobs', JSON.stringify(['Oak House'])); } catch (e) {} });
  ok('a crew phone: the same order (② the photo, ③ the words); behind 🔒 Just me the two fixed chips are dead with the rest of the tags; ⑤ says a locked note stays on this phone only', await phil.page.evaluate(() => {
    window.scheduleSave = () => {}; qnVis = ''; qnVisNames.clear(); renderVisChips(); renderTagChips(); lockGate();
    const st = [...document.querySelectorAll('#qnCard .g-step')].map(e => e.querySelector('.g-step-label').textContent.replace(/\s+/g, ' ').trim());
    const fx = [...document.querySelectorAll('#qnTagFixed .pick-chip')];
    return CREW_NAME === 'Phil' && /^2 ADD A PHOTO OR FILE/.test(st[1]) && /^3 SAY IT/.test(st[2]) && document.body.classList.contains('crew-locked') && fx.length >= 1 && fx.every(b => b.disabled) && /🔒 stays on this phone only — never syncs/.test($('visExplain').textContent);
  }));
  await phil.ctx.close();

  ok('version bumped — APP_VER and the footer agree', /const APP_VER = 'v7\.(4[3-9]|[5-9]\d)'/.test(src) && new RegExp('<footer>' + (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1].replace('.', '\\.') + ' ·').test(src));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
