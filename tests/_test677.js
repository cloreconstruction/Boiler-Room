// 📇🎒 v6.77 — THE JOB CARD READS FIRST and opens where he left it; the pocket says POCKET LIST in its
// own frame. Eric: "on the job card make it so it starts empty or at least on the last one opened, its
// always opened on hertz. and rework the job card layout and font etc i like the size of the pick the
// job first window its great but after that gets confusing to the eye" — and, mid-build: "make the
// pocket say pocket list and make it seperate from the pick the job 1".
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
    jobs = ['Shop / Admin', 'Mery', 'Hertz', 'Rininger']; curJob = 'Hertz'; crew = ['Phil']; entries = []; todos = []; nextId = 1; pendingQueue = [];
    window.scheduleSave = () => {}; window.savePendingSoon = () => {}; window.publishSharedNotes = () => {};
    prefs.cards = {}; _cardJob = ''; _jcEdit = false; lsSet('daylog-cardjob', '');
    const c = cardMake('Rininger'); c.addr = '38210 K-Beach Rd, Soldotna';
    c.people = [{ n: 'Dale Rininger', r: 'Homeowner', tel: '907-555-0100', em: 'dale@example.com' }, { n: 'Sue Rininger', r: 'Spouse', tel: '907-555-0101', em: '' }];
    c.codes = [{ w: 'Front door', c: '1379#' }, { w: 'Gate', c: '2468' }]; c.notes = 'Dog in the back yard · park on the gravel';
    renderJobSelects(); closePanels(); renderAll();
  });

  console.log('— 📇 v6.77 where the card opens —');

  ok('clocked in on Hertz with no card opened yet, the 📇 plate opens on ▲ Choose the job — never Hertz', await page.evaluate(() => {
    curJob = 'Hertz'; _cardJob = ''; lsSet('daylog-cardjob', '');
    openJobCards();
    const t = $('revBox').textContent;
    const r = $('jcJob').value === '' && /Choose the job/.test($('jcJob').options[0].textContent) && /NOTHING PICKED YET/.test(t) && !/SHOWING — Hertz/.test(t);
    closeReview(); return r;
  }));

  ok('the last card opened is remembered on this phone: pick Rininger, close, open again — Rininger, though the clock still says Hertz', await page.evaluate(() => {
    openJobCard('Rininger'); closeReview();
    _cardJob = '';                       // a fresh app open forgets the in-memory card
    curJob = 'Hertz'; openJobCards();
    const r = $('jcJob').value === 'Rininger' && /SHOWING — Rininger/.test($('revBox').textContent) && lsGet('daylog-cardjob') === 'Rininger';
    closeReview(); return r;
  }));

  ok('a remembered job that is gone from the list falls back to ▲ Choose the job', await page.evaluate(() => {
    _cardJob = ''; lsSet('daylog-cardjob', 'Scritchfield'); openJobCards();
    const r = $('jcJob').value === '' && /NOTHING PICKED YET/.test($('revBox').textContent);
    closeReview(); return r;
  }));

  console.log('— 📇 v6.77 the card reads first —');

  ok('Rininger opens READ-ONLY: no input boxes; the address big with a Maps plate; the pick window untouched', await page.evaluate(() => {
    _cardJob = ''; openJobCard('Rininger');
    const big = document.querySelector('.jc-big'), pick = document.querySelector('.jc-pick');
    return !$('jcAddr') && !$('jcPn0') && !!big && /38210 K-Beach/.test(big.textContent) && parseFloat(getComputedStyle(big).fontSize) >= 18 &&
      !!document.querySelector('a.jc-map') && !!pick && /PICK THE JOB FIRST/.test(pick.textContent) && parseFloat(getComputedStyle($('jcJob')).fontSize) >= 18;
  }));

  ok('each person is a plate: name bold, who they are in words, tap-to-call and tap-to-email rows a finger tall', await page.evaluate(() => {
    const ppl = [...document.querySelectorAll('.jc-person')];
    const dale = ppl[0], tel = dale && dale.querySelector('a[href^="tel:"]'), em = dale && dale.querySelector('a[href^="mailto:"]');
    const tall = [...document.querySelectorAll('.jc-tap')].every(a => a.getBoundingClientRect().height >= 44);
    return ppl.length === 2 && /Dale Rininger/.test(dale.querySelector('.jc-name').textContent) && /Homeowner/.test(dale.textContent) &&
      parseFloat(getComputedStyle(dale.querySelector('.jc-name')).fontSize) >= 16 &&
      !!tel && tel.getAttribute('href') === 'tel:9075550100' && /907-555-0100/.test(tel.textContent) &&
      !!em && em.getAttribute('href') === 'mailto:dale@example.com' && tall &&
      ppl[1].querySelectorAll('a[href^="mailto:"]').length === 0;   // Sue has no email — no empty plate for it
  }));

  ok('codes are big numbers beside what they open; the notes sit under WORTH KNOWING', await page.evaluate(() => {
    const codes = [...document.querySelectorAll('.jc-code')];
    return codes.length === 2 && /Front door/.test(codes[0].textContent) && codes[0].querySelector('b').textContent === '1379#' &&
      parseFloat(getComputedStyle(codes[0].querySelector('b')).fontSize) >= 20 && /Dog in the back yard/.test(document.querySelector('.jc-notes').textContent);
  }));

  ok('the hand-out ticks sit on the reading card (codes still never offered), then ✎ Edit, then the crew/lock words', await page.evaluate(() => {
    const t = $('jcShareChips').textContent, box = $('revBox');
    const edit = box.querySelector('.jc-edit'), lock = box.querySelector('.jc-lock');
    return /📍 Address/.test(t) && /907-555-0100/.test(t) && !/1379/.test(t) && !!edit && /Edit this card/.test(edit.textContent) &&
      !!lock && /CREW GETS THIS ONE/.test(lock.textContent) &&
      !!(edit.compareDocumentPosition($('jcShareChips')) & Node.DOCUMENT_POSITION_PRECEDING) && !!(lock.compareDocumentPosition(edit) & Node.DOCUMENT_POSITION_PRECEDING);
  }));

  ok('nothing runs off the right edge of the card', await page.evaluate(() => { const b = $('revBox'); return b.scrollWidth <= b.clientWidth; }));

  console.log('— 📇 v6.77 ✎ Edit, and the words never vanish —');

  ok('✎ Edit turns the form on — the same values in boxes — and the code row\'s ✕ is not clipped', await page.evaluate(() => {
    $('revBox').querySelector('.jc-edit').click();
    const x = document.querySelector('.jc-coderow .jc-x'), blk = x && x.closest('.jc-blk');
    return !!$('jcAddr') && $('jcAddr').value === '38210 K-Beach Rd, Soldotna' && $('jcPn0').value === 'Dale Rininger' && $('jcCc1').value === '2468' &&
      !document.querySelector('.jc-edit') && !$('jcShareChips') && !!x && x.getBoundingClientRect().right <= blk.getBoundingClientRect().right + 0.5 && x.getBoundingClientRect().height >= 40 &&
      [...document.querySelectorAll('.jc-blk input')].every(i => i.getBoundingClientRect().right <= i.closest('.jc-blk').getBoundingClientRect().right - 4);   // no box runs past its block (the 120px input floor did)
  }));

  ok('➕ Add a person keeps the form open; ✓ Save puts the card back to reading with the new words on it', await page.evaluate(() => {
    cardAddPerson();
    const stillForm = !!$('jcPn2');
    $('jcPn2').value = 'Ron Inspector'; $('jcPr2').value = 'Inspector'; $('jcPt2').value = '907-555-0199';
    $('jcAddr').value = '38210 K-Beach Rd, Soldotna, AK';
    cardSave();
    const t = $('revBox').textContent;
    return stillForm && !$('jcAddr') && /Soldotna, AK/.test(t) && document.querySelectorAll('.jc-person').length === 3 && /Ron Inspector/.test(t) && prefs.cards.rininger.people[2].tel === '907-555-0199';
  }));

  ok('turning the wheel mid-edit saves what was typed before it switches cards', await page.evaluate(() => {
    openJobCard('Rininger', true);
    $('jcNotes').value = 'Dog in the back yard · park on the gravel · water shutoff under the deck';
    openJobCard('Mery');                   // what the wheel's onchange does
    const kept = /water shutoff under the deck/.test(prefs.cards.rininger.notes);
    const meryForm = !!$('jcAddr');        // Mery's card is empty — nothing to read, so it opens on the form
    return kept && meryForm && /SHOWING — Mery/.test($('revBox').textContent);
  }));

  ok('closing the window mid-edit saves too, and the next open reads', await page.evaluate(() => {
    openJobCard('Rininger', true);
    $('jcAddr').value = '38212 K-Beach Rd, Soldotna, AK';
    closeReview();
    const kept = prefs.cards.rininger.addr === '38212 K-Beach Rd, Soldotna, AK';
    _cardJob = ''; openJobCards();
    const reads = !$('jcAddr') && /38212 K-Beach/.test($('revBox').textContent);
    closeReview(); return kept && reads;
  }));

  ok('an empty card opens straight on the form — there is nothing to read yet', await page.evaluate(() => {
    openJobCard('Hertz');
    const r = !!$('jcAddr') && !document.querySelector('.jc-edit') && /SHOWING — Hertz/.test($('revBox').textContent);
    closeReview(); return r;
  }));

  ok('every state is spelled out — PICK THE JOB FIRST, SHOWING, the crew/lock line', await page.evaluate(() => {
    openJobCard('Rininger');
    const t = $('revBox').textContent;
    const r = /▸ PICK THE JOB FIRST/.test(t) && /✓ SHOWING — Rininger/.test(t) && /(CREW GETS THIS ONE|ERIC ONLY)/.test(t);
    closeReview(); return r;
  }));

  console.log('— 🎒 v6.77 the pocket says POCKET LIST, in its own frame above ① —');

  // 🎒 v7.16 — its own card now, OUTSIDE the grinder's window (Eric: "It's in the same bigger window"), still right above it
  ok('the pocket is titled POCKET LIST, framed as its own card, outside the grinder card with a gap before ① Pick the job', await page.evaluate(() => {
    const pk = $('pocketCard'), t = pk && pk.querySelector('.pk-title');
    const step1 = document.querySelector('#qnCard .g-step[data-step="1"]');
    const cs = pk && getComputedStyle(pk);
    return !!t && /POCKET LIST/.test(t.textContent) && !pk.closest('#qnCard') && !!step1 && !!(pk.compareDocumentPosition(step1) & Node.DOCUMENT_POSITION_FOLLOWING) &&
      parseFloat(cs.borderTopWidth) >= 1.5 && parseFloat(cs.borderLeftWidth) >= 1.5 && parseFloat(cs.borderTopLeftRadius) >= 8 &&
      step1.getBoundingClientRect().top - pk.getBoundingClientRect().bottom >= 8;
  }));

  ok('the writing box is still within a thumb\'s reach with the pocket framed (v6.12 / v6.75)', await page.evaluate(() =>
    $('askText').getBoundingClientRect().top + scrollY < 600));

  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v6.77') && document.querySelector('footer').textContent.includes(APP_VER);
  }));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
