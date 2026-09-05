const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };
  await page.goto('file:///home/claude/work/clore-daylog.html');
  await page.waitForTimeout(700);
  await page.evaluate(() => {
    jobs = ['Scritchfield', 'Rininger', 'Mery']; curJob = 'Scritchfield'; crew = []; entries = []; todos = []; nextId = 1;
    prefs.tagScrub1 = true; prefs.tagScrub2 = true;
    renderJobSelects(); closePanels(); renderAll();
  });

  console.log('— 📅 v6.24 one calendar —');

  ok('a note saying "tomorrow" gets back-stamped against ITS OWN date, not today', await page.evaluate(() => {
    const ts = new Date(2026, 7, 18, 9, 0); // Tue Aug 18
    const r = resolveDayWords('call the inspector tomorrow about the footing', ts);
    return /tomorrow→Wed Aug 19 2026-08-19/.test(r);
  }));

  ok('a bare weekday in a note points FORWARD from the note', await page.evaluate(() => {
    const ts = new Date(2026, 7, 18, 9, 0); // Tue
    const r = resolveDayWords('concrete pour friday at Mery', ts);
    return /friday→Fri Aug 21 2026-08-21/.test(r);
  }));

  ok('"last friday" in a note points BACK from the note', await page.evaluate(() => {
    const ts = new Date(2026, 7, 18, 9, 0);
    return /last friday→Fri Aug 14 2026-08-14/.test(resolveDayWords('paid the sub last friday', ts));
  }));

  ok('no day-words = empty, no noise on plain notes', await page.evaluate(() =>
    resolveDayWords('picked up 40 bags of concrete', new Date()) === ''));

  ok('question "last friday" becomes ONE exact day range', await page.evaluate(() => {
    const r = askDateRange('what happened last friday');
    const now = new Date(); let n = ((now.getDay() - 5 + 6) % 7) + 1;
    const d = new Date(now); d.setDate(d.getDate() - n);
    return r && r[0] === localDay(d) && r[1] === r[0];
  }));

  ok('question "tomorrow" pins a FUTURE day, never a log range', await page.evaluate(() => {
    const dr = askDayRef('what do I need to do tomorrow');
    const d = new Date(); d.setDate(d.getDate() + 1);
    return dr && dr.kind === 'future' && localDay(dr.day) === localDay(d) && !askDateRange('what do I need to do tomorrow');
  }));

  ok('bare "thursday" question offers BOTH candidates for the Wizard to pick from', await page.evaluate(() => {
    const dr = askDayRef('what about thursday');
    return dr && dr.kind === 'either' && dr.past && dr.next && localDay(dr.past) < localDay(new Date()) && localDay(dr.next) >= localDay(new Date());
  }));

  ok('Wizard context: entries carry their weekday, saidDay rides notes with day-words', await page.evaluate(() => {
    entries = []; nextId = 1;
    const e = addEntry('Note', 'inspector comes tomorrow', 'Scritchfield', {});
    e.ts = new Date(2026, 7, 18, 9, 0);
    const c = buildAskContext('inspector');
    return /"d":"2026-08-18 Tue"/.test(c) && /saidDay/.test(c) && /tomorrow→Wed Aug 19/.test(c);
  }));

  ok('Wizard context pins the coming day when the question says tomorrow', await page.evaluate(() => {
    const c = buildAskContext('what do I need to do tomorrow');
    return /THE QUESTION POINTS AT A COMING DAY/.test(c);
  }));

  console.log('— ⚠ v6.24 heads-up —');

  ok('the ⚠ chip is built into the tag row, first thing', await page.evaluate(() => {
    renderTagChips();
    const first = document.querySelector('#qnTagChips .pick-chip');
    return first && /Heads-up/.test(first.textContent);
  }));

  ok('tapped ⚠ + saved note = heads flag on the entry, then the chip resets', await page.evaluate(() => {
    entries = []; nextId = 1; qnHeads = false; qnHeadsToggle();
    $('askText').value = 'water line runs 3 ft left of the stakes';
    qnJobPick = 'Mery';
    saveQuickNote();
    const e = entries[0];
    return e && e.heads === true && qnHeads === false;
  }));

  ok('heads-up entries reach the Wizard flagged and instructed', await page.evaluate(() => {
    const c = buildAskContext('what do I need to know at Mery');
    return /"headsUp":true/.test(c);
  }));

  ok('the job card counts the landmines', await page.evaluate(() => {
    openJobCard('Mery');
    const t = $('revBox').textContent;
    closeReview();
    return /1 HEADS-UP on this job/.test(t);
  }));

  ok('heads-only log view shows just that job\'s ⚠, with a way back', await page.evaluate(() => {
    addEntry('Note', 'plain note no flag', 'Mery', {});
    openHeadsLog('Mery');
    const txt = $('askRecent').textContent;
    const banner = ($('logDayBanner') || {}).textContent || '';
    const one = entries.filter(e => e.heads).length === 1;
    headsLogOff();
    return one && /Heads-ups on Mery/.test(banner) && /water line/.test(txt) && !/plain note/.test(txt);
  }));

  console.log('— 🧾 v6.24 receipt category funnel —');

  ok('the 🧾 chip is built in next to ⚠', await page.evaluate(() => {
    const chips = Array.from(document.querySelectorAll('#qnTagChips .pick-chip')).map(c => c.textContent);
    return chips.some(t => /🧾 Receipt/.test(t));
  }));

  ok('v6.25: tapping 🧾 opens its OWN window, not more chips by the tags', await page.evaluate(() => {
    qnRcpt = false; qnCat = ''; prefs.jobCats = {}; qnRcptToggle();
    const open = $('catModal').classList.contains('show');
    const txt = $('catBox').textContent;
    return qnRcpt && open && /What kind of cost is this/.test(txt) && ($('qnCatRow') === null);
  }));

  ok('v6.25: the window lists the categories A → Z', await page.evaluate(() => {
    const names = Array.from($('catBox').querySelectorAll('.chips-row .pick-chip')).map(b => b.textContent.replace(/^\S+\s+/, ''));
    const sorted = [...names].sort((a, b) => a.localeCompare(b));
    return names.length >= 50 && JSON.stringify(names) === JSON.stringify(sorted);
  }));

  ok('v6.25: the job\'s own picks ride on top, starred', await page.evaluate(() => {
    prefs.jobCats = { mery: ['Framing', 'Septic'] };
    qnJobPick = 'Mery'; catModalOpen();
    const rows = $('catBox').querySelectorAll('.chips-row');
    const star = rows[0].textContent;
    return /USED ON THIS JOB/.test($('catBox').textContent) && /⭐ Framing/.test(star) && /⭐ Septic/.test(star);
  }));

  ok('v6.25: picking closes the window and stamps the 🧾 chip with the pick', await page.evaluate(() => {
    qnCatPick('Framing');
    const chip = Array.from(document.querySelectorAll('#qnTagChips .pick-chip')).map(c => c.textContent).find(t => /🧾/.test(t));
    return !$('catModal').classList.contains('show') && qnCat === 'Framing' && /🧾 Framing/.test(chip);
  }));

  ok('v6.25: ✕ Not a receipt clears the whole thing', await page.evaluate(() => {
    catModalOpen();
    qnRcpt = false; qnCat = ''; catModalClose(); renderCatRow();
    const chip = Array.from(document.querySelectorAll('#qnTagChips .pick-chip')).map(c => c.textContent).find(t => /🧾/.test(t));
    return !$('catModal').classList.contains('show') && /🧾 Receipt$/.test(chip.trim());
  }));

  ok('typed receipt with a $ saves category + a bill-strip-readable read', await page.evaluate(() => {
    entries = []; nextId = 1;
    qnRcpt = true; qnCat = 'Framing'; qnJobPick = 'Mery';
    $('askText').value = 'lumber package from Spenard $4,318.55';
    saveQuickNote();
    const e = entries[0];
    return e && e.rcpt === true && e.category === 'Framing' && /💵 \$4,318\.55/.test(e.ai || '') && qnRcpt === false;
  }));

  ok('that receipt is a bill-strip candidate for its job', await page.evaluate(() => {
    _portalIdx = { clients: [{ code: 'mery-224374', job: 'Mery' }] };
    _estIdx = 0; _estD = { mk: 20, cats: [{ n: 'Demo', bids: [] }, { n: 'Framing', bids: [] }] };
    const c = estBillCands();
    return c.length === 1 && c[0].category === 'Framing';
  }));

  ok('the strip pre-selects HIS category by exact name — no token guessing', await page.evaluate(() =>
    estBillGuess(entries[0]) === 1));

  ok('vendor tap-to-learn: catLearn writes the exact-name book', await page.evaluate(() => {
    prefs.vendCat = {}; prefs.jobCats = {};
    catLearn('Mery', 'Framing', 'Spenard Builders Supply');
    return prefs.vendCat['spenard builders supply'] === 'Framing' && (prefs.jobCats.mery || [])[0] === 'Framing';
  }));

  ok('one vocabulary: receipt list = estimates list + money buckets; file cabinet keeps both', await page.evaluate(() =>
    RCPT_CATS[0] === 'Demo' && RCPT_CATS.includes('Fuel') && FC_CATS.includes('Drywall, Mud and Texture') && FC_CATS.includes('HVAC')));

  console.log('— 💰 v6.24 budget jump + 🧹 scrub + 🔓 wording —');

  ok('a receipt entry in the log wears the 💰 → Budget jump', await page.evaluate(() => {
    window._logHeadsOnly = ''; clearLogFilters(); renderLog();
    return /💰 → Budget/.test($('askRecent').innerHTML);
  }));

  ok('approving learns AND retires the offer (budg=sent shows "on their page")', await page.evaluate(() => {
    const e = entries[0]; e.budg = 'sent';
    window._rlOpen = new Set([e.id]); renderLog(); // unfolded row shows the receipt's fate
    const h = $('askRecent').innerHTML;
    window._rlOpen = new Set();
    return !/💰 → Budget/.test(h) && /💰 on their page/.test(h);
  }));

  ok('tagClean: names pass, numbers/emails/filenames never become tags', await page.evaluate(() =>
    JSON.stringify(tagClean('Phil')) === '["Phil"]' && tagClean('+19073980384') === undefined &&
    tagClean('webqueen.wq1@gmail.com') === undefined && tagClean('Aug 20, 2026 at 8:25 PM.txt') === undefined));

  ok('scrub v2 sweeps junk off old ENTRIES once, keeps the names', await page.evaluate(() => {
    entries.push({ id: 900, ts: new Date(), type: 'Note', details: 'x', job: '—', filedTo: 'Inbox', tags: ['Phil', '+19073980384', 'a@b.com'] });
    prefs.tagScrub2 = false; prefs.tags = ['Phil', '+15551234567'];
    knownTags();
    const e = entries.find(x => x.id === 900);
    return prefs.tagScrub2 === true && JSON.stringify(e.tags) === '["Phil"]' && !prefs.tags.includes('+15551234567');
  }));

  ok('who-sees row now reads as an UNLOCK', await page.evaluate(() =>
    /🔓 Unlock it for…/.test(document.body.innerHTML)));

  console.log('— 🪜 v6.25 the five steps —');

  ok('the grinder card is five numbered plates, in order', await page.evaluate(() => {
    const steps = Array.from(document.querySelectorAll('#qnCard .g-step')).map(el => +el.dataset.step);
    return JSON.stringify(steps) === '[1,2,3,4,5]' &&
      $('askText').closest('.g-step').dataset.step === '1' &&
      $('qnJob').closest('.g-step').dataset.step === '2' &&
      $('qnTagChips').closest('.g-step').dataset.step === '3' &&
      $('qnVisChips').closest('.g-step').dataset.step === '4' &&
      document.querySelector('.plate-row').closest('.g-step').dataset.step === '5';
  }));

  ok('empty box → step ① wears ▸ NEXT', await page.evaluate(() => {
    $('askText').value = ''; qnJobPick = ''; notePhotos.length = 0; updateStepFlow();
    return document.querySelector('.g-step[data-step="1"]').classList.contains('next');
  }));

  ok('words in → ① goes ✓ DONE, ② PICK THE JOB lights up', await page.evaluate(() => {
    $('askText').value = 'ran conduit under the slab'; updateStepFlow();
    const s1 = document.querySelector('.g-step[data-step="1"]'), s2 = document.querySelector('.g-step[data-step="2"]');
    return s1.classList.contains('done') && !s1.classList.contains('next') && s2.classList.contains('next');
  }));

  ok('job picked → the eye goes straight to ⑤ SEND IT (tags and unlock stay optional)', await page.evaluate(() => {
    qnJobPick = 'Mery'; updateStepFlow();
    const s2 = document.querySelector('.g-step[data-step="2"]'), s5 = document.querySelector('.g-step[data-step="5"]');
    const s3 = document.querySelector('.g-step[data-step="3"]');
    return s2.classList.contains('done') && s5.classList.contains('next') && !s3.classList.contains('next');
  }));

  ok('NEXT is a word and a glyph, not just a colour', await page.evaluate(() => {
    const el = document.querySelector('.g-step.next .g-step-next');
    return el && getComputedStyle(el).display !== 'none' && /▸ NEXT/.test(el.textContent);
  }));

  ok('version bumped everywhere it matters', await page.evaluate(() =>
    APP_VER === 'v6.26' && document.querySelector('footer').textContent.includes('v6.26')));

  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();