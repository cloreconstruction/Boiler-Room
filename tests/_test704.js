// 🔗 v7.04 — Eric: "on the summary it has the entry number which i really like but i think i should be able to click on
// that and see the entry." The Wizard writes "entry 12", "(entry 12, 15)", "entries 12 and 15", "Entry #14" — each number
// that IS a record becomes a link; the entry opens over the answer. Every word below is made up.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { fileURLToPath } = require('url');
(async () => {
  const appUrl = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const repo = path.dirname(fileURLToPath(appUrl));
  const src = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };
  const setup = page => page.evaluate(() => {
    jobs = ['Oak House', 'Personal']; entries = []; todos = []; nextId = 12; prefs.wizFixes = []; _wizLog = []; lsSet('daylog-wizlog', '[]'); lsSet('daylog-wizpend', '');
    window.scheduleSave = () => {}; window.wizLogSave = () => {}; closePanels(); renderAll();
    addEntry('Note', 'Windows are in at the supplier.\nSecond line: they want a pickup by Friday.', 'Oak House', { noSniff: true, tags: ['Supplier'] });                       // 12
    addEntry('Expense', 'Lumber for the pony wall', 'Oak House', { noSniff: true, amount: 412.5 });                                                                                   // 13
    addEntry('Note', 'Delivery ticket', 'Oak House', { noSniff: true, photoPath: '/x/ticket.jpg', photoPaths: ['/x/ticket.jpg', '/x/ticket2.jpg'], ai: 'two pallets of sheathing\nERIC CORRECTED: it was three' });   // 14
    addEntry('Note', 'a private thought', 'Personal', { noSniff: true, personal: true, tags: ['Personal'] });                                                                        // 15
    const md = 'This week:\n- **Windows are in** at the supplier (entry 12, Sep 14)\n- lumber and the ticket (entry 13, 14)\n- see entries 12 and 15, also Entry #14\n- Invoice **#1330** went out; entry 99999 is gone; tool entry fee 25\n\nNothing else.';
    const keep = wizKeep('summarize this week', md, [12], 'quick brain').at; _lastAnswer = { q: 'summarize this week', text: md, srcIds: [12], at: Date.now(), keep };
    showWizFull('summarize this week', md, [12], 'quick brain', null);
    window._links = i => [...[...document.querySelectorAll('#wizFullBody .wl-line')][i].querySelectorAll('a.wl-ent')].map(a => a.textContent);
    window._box = () => document.querySelector('#wizEntHost .we-box');
  });

  console.log('— 🔗 v7.04 entry numbers are links —');
  const ph = await (await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })).newPage();
  const errs = []; ph.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
  await ph.goto(appUrl); await ph.waitForTimeout(700); await setup(ph);
  const lk = await ph.evaluate(() => ({ l1: _links(1), l2: _links(2), l3: _links(3), l4: _links(4), text4: [...document.querySelectorAll('#wizFullBody .wl-line')][4].textContent, style: (() => { const a = document.querySelector('#wizFullBody a.wl-ent'), c = getComputedStyle(a); return { u: c.textDecorationLine, w: +c.fontWeight, h: a.getBoundingClientRect().height }; })() }));
  ok('every number after the word entry / entries that IS a record is a link — one, a list, "and", "Entry #14" — inside bold too', lk.l1.join() === '12' && lk.l2.join() === '13,14' && lk.l3.join() === '12,15,#14', JSON.stringify(lk));
  ok('an invoice number (#1330), an entry that is no longer in the log, and a plain number after other words stay plain', lk.l4.length === 0 && /#1330/.test(lk.text4) && /entry 99999/.test(lk.text4), JSON.stringify(lk.l4));
  ok('a link is underlined and heavy as well as brass — never the colour alone', /underline/.test(lk.style.u) && lk.style.w >= 700, JSON.stringify(lk.style));

  const op = await ph.evaluate(() => {
    document.querySelector('#wizFullBody a.wl-ent').click();
    const b = _box(), sheet = document.querySelector('#wizEntHost .we-sheet'), r = b.getBoundingClientRect();
    return { head: b.querySelector('.we-head').textContent.replace(/\s+/g, ' ').trim(), meta: b.querySelector('.we-meta').textContent.replace(/\s+/g, ' ').trim(), words: b.querySelector('.we-words').textContent, ws: getComputedStyle(b.querySelector('.we-words')).whiteSpace,
      tags: b.textContent.includes('🏷 Supplier'), z: +getComputedStyle(sheet).zIndex, wz: +getComputedStyle($('wizFull')).zIndex, under: $('wizFull').classList.contains('show'), top: Math.round(r.top), onTop: !!document.elementFromPoint(195, r.top + 20).closest('.we-box'), fixBox: !!document.querySelector('#wizFullBody .wl-box textarea') };
  });
  ok('a tap opens THE ENTRY over the answer — its number, the day and time, the kind and the job, the WHOLE of its words, its tags — and the answer stays where it was underneath', /^ENTRY 12(?!\d)/.test(op.head) && /\d{4} · \d/.test(op.head) && /Note · Oak House/.test(op.meta) && /Windows are in at the supplier\.\nSecond line: they want a pickup by Friday\./.test(op.words) && /pre-wrap/.test(op.ws) && op.tags && op.z > op.wz && op.under && op.onTop && op.top < 60 && !op.fixBox, JSON.stringify(op));
  ok('it closes three ways — ✕, ‹ Back to the answer, a tap on the dim edge — and the answer is still up', await ph.evaluate(() => {
    document.querySelector('#wizEntHost .x-plate').click(); const a = !_box();
    wizEntryOpen(13); [...document.querySelectorAll('#wizEntHost button')].find(b => /Back to the answer/.test(b.textContent)).click(); const b = !_box();
    wizEntryOpen(13); document.querySelector('#wizEntHost .we-sheet').click(); const c = !_box();
    return a && b && c && $('wizFull').classList.contains('show');
  }));
  ok('money, a photo and what was read off it show too: the amount, 📷 See the photos, the read and his correction; a personal entry says it stays on this phone', await ph.evaluate(() => {
    wizEntryOpen(13); const a = /Expense · Oak House · \$412\.50/.test(_box().querySelector('.we-meta').textContent.replace(/\s+/g, ' ')) && !/See the photo/.test(_box().textContent);
    wizEntryOpen(14); const b = /📷 See the photos · 2/.test(_box().textContent) && /two pallets of sheathing/.test(_box().querySelector('.we-ai').textContent) && /ERIC CORRECTED: it was three/.test(_box().querySelector('.we-ai').textContent);
    wizEntryOpen(15); const c = /🔒 personal — it stays on this phone/.test(_box().textContent);
    window._said = []; const t0 = window.toast; window.toast = (m, g) => { _said.push(String(m)); return t0(m, g); };
    wizEntryClose(); wizEntryOpen(424242); const d = !_box() && /not in the log any more/.test(_said.join(' '));
    return a && b && c && d;
  }));
  ok('a photo now opens OVER the full-screen answer and the entry window (it used to open underneath), the working band over the photo, and a toast is seen there too', await ph.evaluate(() => {
    wizEntryOpen(14); $('lightbox').classList.add('show');
    const el = document.elementFromPoint(195, 420), z = s => +getComputedStyle(document.querySelector(s)).zIndex;
    const r = !!el.closest('#lightbox') && z('#lightbox') > z('#wizEntHost .we-sheet') && z('#wizEntHost .we-sheet') > z('#wizFull') && z('#busyBand') > z('#lightbox') && z('#toast') > z('#wizFull');
    $('lightbox').classList.remove('show'); wizEntryClose(); return r;
  }));
  ok('the links live on through a kept fix and its redraw', await ph.evaluate(() => { wizLineFix(2); $('wlText-2').value = 'the ticket was for three pallets'; wizLineSave(2); const r = _links(2).join() === '13,14' && /KEPT/.test([...document.querySelectorAll('#wizFullBody .wl-line')][2].nextElementSibling.textContent); wizPendDrop(); wizPendDrop(); return r; }));
  ok('no page errors on the phone', errs.length === 0, errs.join(' | '));

  console.log('— 🖥 on the PC —');
  const pc = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await pc.goto(appUrl); await pc.waitForTimeout(700); await setup(pc);
  const at = await pc.evaluate(() => { const r = document.querySelector('#wizFullBody a.wl-ent').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  await pc.mouse.click(at.x, at.y); await pc.waitForTimeout(80);
  ok('a click on the number opens the ENTRY — not the line\'s fix box (a click anywhere else on the line still does)', await pc.evaluate(() => !!_box() && /^ENTRY 12/.test(_box().querySelector('.we-head').textContent.trim()) && !document.querySelector('#wizFullBody .wl-box textarea')));

  ok('version bumped — APP_VER and the footer agree', await pc.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v7.04') && document.querySelector('footer').textContent.includes(APP_VER);
  }));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
