const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };
  await page.goto(process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html');
  await page.waitForTimeout(700);
  await page.evaluate(() => {
    jobs = ['Mery', 'Scritchfield']; curJob = 'Mery'; crew = []; entries = []; todos = []; nextId = 1;
    prefs.tagScrub1 = true; prefs.tagScrub2 = true;
    renderJobSelects(); closePanels(); renderAll();
    window._dbxFiles = {}; window._dbxLog = [];
    window.dbxDownload = async path => { window._dbxLog.push(['get', path]); return (window._dbxFiles || {})[path] ?? null; };
    window.dbxUpload = async (path, body) => { window._dbxLog.push(['put', path, body]); (window._dbxFiles || {})[path] = body; return {}; };
    window.scheduleSave = () => {};
  });

  console.log('— 🔀 v6.30 pick the job FIRST —');

  ok('the job wheel is step ①, the writing box is step ②', await page.evaluate(() =>
    $('qnJob').closest('.g-step').dataset.step === '1' &&
    $('askText').closest('.g-step').dataset.step === '2'));

  ok('the job plate is physically ABOVE the writing box on the page', await page.evaluate(() =>
    $('qnJob').getBoundingClientRect().top < $('askText').getBoundingClientRect().top));

  ok('the plates still run 1,2,3,4,5 in order down the card', await page.evaluate(() => {
    const steps = Array.from(document.querySelectorAll('#qnCard .g-step')).map(el => +el.dataset.step);
    return JSON.stringify(steps) === '[1,2,3,4,5]';
  }));

  ok('the labels swapped too — ① says PICK THE JOB, ② says SAY IT', await page.evaluate(() => {
    const l = n => document.querySelector(`.g-step[data-step="${n}"] .g-step-label`).textContent;
    return /PICK THE JOB/.test(l(1)) && /SAY IT/.test(l(2));
  }));

  ok('nothing picked → ① PICK THE JOB wears ▸ NEXT', await page.evaluate(() => {
    $('askText').value = ''; qnJobPick = ''; notePhotos.length = 0; updateStepFlow();
    return document.querySelector('.g-step[data-step="1"]').classList.contains('next');
  }));

  ok('job picked → ① goes ✓ DONE and ② SAY IT lights up', await page.evaluate(() => {
    qnJobPick = 'Mery'; updateStepFlow();
    const s1 = document.querySelector('.g-step[data-step="1"]'), s2 = document.querySelector('.g-step[data-step="2"]');
    return s1.classList.contains('done') && !s1.classList.contains('next') && s2.classList.contains('next');
  }));

  ok('words in → the eye goes to ⑤ SEND IT, tags and unlock stay optional', await page.evaluate(() => {
    $('askText').value = 'ran conduit under the slab'; updateStepFlow();
    const s2 = document.querySelector('.g-step[data-step="2"]'), s5 = document.querySelector('.g-step[data-step="5"]');
    const s3 = document.querySelector('.g-step[data-step="3"]');
    return s2.classList.contains('done') && s5.classList.contains('next') && !s3.classList.contains('next');
  }));

  // ▸ v6.42 REVERSES the second half of this. v6.30's own words: "picking it first means the wheel
  // is never the thing standing between him and the lever after he has already said his piece" —
  // but the code did the opposite, sending him back UP to ① once he had written, which Eric read
  // as the app being wrong. The job still leads when nothing is said; once his words are in, the
  // lever is next and ① says in words that a blank job is allowed. Job-first is intact.
  ok('words WITHOUT a job point at the LEVER, and ① says a blank job is allowed (v6.42)', await page.evaluate(() => {
    qnJobPick = ''; $('askText').value = 'some words'; updateStepFlow();
    const one = document.querySelector('.g-step[data-step="1"]');
    return document.querySelector('.g-step[data-step="5"]').classList.contains('next') &&
      !one.classList.contains('next') && one.classList.contains('blank') &&
      /BLANK — files as unfiled/.test(one.textContent);
  }));

  ok('with nothing said yet, the job is still the gate — ① leads (v6.30, unchanged)', await page.evaluate(() => {
    qnJobPick = ''; $('askText').value = ''; updateStepFlow();
    return document.querySelector('.g-step[data-step="1"]').classList.contains('next') &&
      !document.querySelector('.g-step[data-step="5"]').classList.contains('next');
  }));

  ok('NEXT is still a word and a glyph, not a colour', await page.evaluate(() => {
    const el = document.querySelector('.g-step.next .g-step-next');
    return el && getComputedStyle(el).display !== 'none' && /▸ NEXT/.test(el.textContent);
  }));

  ok('filing still works end to end with the new order', await page.evaluate(() => {
    entries = []; nextId = 1;
    $('askText').value = 'poured the footings'; qnJobPick = 'Mery';
    saveQuickNote();
    return entries.length === 1 && entries[0].job === 'Mery' && /footings/.test(entries[0].details);
  }));

  console.log('— 🅿 v6.30 parked: 🔥 needs-you and the to-dos —');

  ok('the 🔥 needs-you strip is not shown', await page.evaluate(() => {
    const el = $('hotStrip');
    return !!el && getComputedStyle(el).display === 'none';
  }));

  ok('the to-do card is not shown', await page.evaluate(() => {
    const el = $('todoCard');
    return !!el && getComputedStyle(el).display === 'none';
  }));

  ok('the open-to-dos counter tile is not shown either', await page.evaluate(() => {
    const el = $('kpiTodoTile');
    return !!el && getComputedStyle(el).display === 'none';
  }));

  ok('PARKED, not deleted — both still exist and still render underneath', await page.evaluate(() => {
    todos = [{ id: 1, text: 'call the inspector', done: false, ts: new Date().toISOString() }];
    renderTodos(); renderKpis();
    return !!$('todoCard') && !!$('hotStrip') && typeof renderHotCards === 'function' &&
      $('kpiTodos').textContent === '1';   // the number is still computed, just not on screen
  }));

  ok('dropping the class brings them both straight back', await page.evaluate(() => {
    document.body.classList.remove('parked-630');
    const back = getComputedStyle($('todoCard')).display !== 'none' &&
      getComputedStyle($('hotStrip')).display !== 'none';
    document.body.classList.add('parked-630');
    return back;
  }));

  console.log('— 🧾 v6.30 the receipt review window on the tracker —');

  const seed = () => page.evaluate(() => {
    entries = []; nextId = 1;
    _portalIdx = { clients: [{ code: 'mery-224374', job: 'Mery' }] };
    window._dbxFiles = {};
    window._dbxFiles[estPath('mery-224374')] = JSON.stringify({ updated: '', mk: 15, cats: [
      { n: 'Framing', appr: false, bids: [{ e1: 20000, acc: true, note: 'Hansen bid' }] }] });
    window._dbxFiles[portalRoot() + '/mery-224374.json'] = JSON.stringify({ name: 'Mery', budget: [] });
    const mk = (txt, cat, amt, extra = {}) => {
      const e = addEntry('Note', txt, 'Mery', {});
      e.ai = `💵 $${amt.toLocaleString(undefined, { minimumFractionDigits: 2 })} 🏪 Spenard`;
      e.rcpt = true; if (cat) e.category = cat;
      Object.assign(e, extra);
      return e;
    };
    window._a = mk('lumber package', 'Framing', 1000);
    window._b = mk('gravel load', 'Framing', 500);
    window._c = mk('no category yet', '', 300);
    window._p = mk('personal tools', 'Framing', 900, { personal: true });
    const other = addEntry('Note', 'other job receipt', 'Scritchfield', {});
    other.ai = '💵 $700.00'; other.rcpt = true; other.category = 'Framing';
    window._qUpBusy = false; _estD = null; _estPage = null;
  });

  await seed();
  ok('the count sees this job\'s waiting receipts and nobody else\'s', await page.evaluate(() =>
    rcptCount('Mery') === 3 && rcptCount('Scritchfield') === 1));

  ok('a PERSONAL receipt is never counted — the lock wins', await page.evaluate(() =>
    !rcptWaiting('Mery').some(e => e.personal)));

  ok('the tracker button carries the number so he can see it from outside', await page.evaluate(async () => {
    // renderPortalList re-reads the portal index from Dropbox and needs a token to try at all
    dbx.refreshToken = dbx.refreshToken || 'test-token';
    window._dbxFiles[portalRoot() + '/index.json'] = JSON.stringify({ clients: [{ code: 'mery-224374', job: 'Mery' }] });
    _portalOpen = 0;   // the accordion has to be unfolded for that job's buttons to be drawn
    openPortalWin();   // 🏠 v6.65 — the list lives in the portal's own window now, not in Setup
    await renderPortalList();
    const r = /🧾 Receipts to approve · 3 WAITING/.test(document.body.innerHTML);
    closePortalWin();
    return r;
  }));

  ok('the window opens and lists all three', await page.evaluate(async () => {
    await openRcptReview(0);
    const t = $('revBox').textContent;
    return /receipts waiting/.test(t) && /lumber package/.test(t) && /gravel load/.test(t) && /no category yet/.test(t);
  }));

  ok('it never lists the personal one, or the other job\'s', await page.evaluate(() => {
    const t = $('revBox').textContent;
    return !/personal tools/.test(t) && !/other job receipt/.test(t);
  }));

  ok('each row shows HIM the vendor and the client-facing number side by side', await page.evaluate(() => {
    const t = $('revBox').textContent;
    return /Spenard/.test(t) && /\$1,150\.00/.test(t) && /\$1,000\.00/.test(t);   // 15% board
  }));

  ok('nothing is checked until he taps — no pre-selection', await page.evaluate(() => {
    const t = $('revBox').textContent;
    return /Nothing checked yet/.test(t) && !/☑ CHECKED/.test(t);
  }));

  ok('a receipt with no category is flagged, not silently dropped', await page.evaluate(() =>
    /NO CATEGORY/.test($('revBox').textContent)));

  ok('checking two shows the running total THEY will see', await page.evaluate(() => {
    rcptTog(_a.id); rcptTog(_b.id);
    const t = $('revBox').textContent;
    return /2 checked/.test(t) && /\$1,725\.00/.test(t);   // (1000+500) × 1.15
  }));

  ok('checking the categoryless one does not let it count toward the send', await page.evaluate(() => {
    rcptTog(_c.id);
    const t = $('revBox').textContent;
    return /2 checked/.test(t);   // still 2 — the third has no budget line to land on
  }));

  ok('APPROVE sends the checked ones and leaves the rest alone', await page.evaluate(async () => {
    await rcptApprove();
    const saved = JSON.parse(window._dbxFiles[estPath('mery-224374')]);
    const fr = saved.cats.find(x => x.n === 'Framing');
    return (fr.pend || []).length === 2 && _a.budg === 'sent' && _b.budg === 'sent' &&
      !_c.budg && !_p.budg;
  }));

  ok('the real board survived — bids and notes still there', await page.evaluate(() => {
    const saved = JSON.parse(window._dbxFiles[estPath('mery-224374')]);
    return saved.cats.find(x => x.n === 'Framing').bids[0].note === 'Hansen bid' && saved.mk === 15;
  }));

  ok('their page got the upcoming block, marked up, no vendor', await page.evaluate(() => {
    const pg = JSON.parse(window._dbxFiles[portalRoot() + '/mery-224374.json']);
    return pg.upcoming && pg.upcoming.tot === 1725 && !/Spenard/.test(JSON.stringify(pg.upcoming));
  }));

  ok('the window and the count both drop to what is left', await page.evaluate(() =>
    rcptCount('Mery') === 1 && /1 waiting/.test($('revBox').textContent)));

  await seed();
  ok('a bad signal sends NOTHING and does not touch the board', await page.evaluate(async () => {
    await openRcptReview(0);
    rcptTog(_a.id);
    window.dbxDownload = async () => { throw new Error('offline'); };
    const before = window._dbxFiles[estPath('mery-224374')];
    await rcptApprove();
    return !_a.budg && window._dbxFiles[estPath('mery-224374')] === before &&
      /nothing sent/i.test(document.body.textContent);
  }));


  console.log('— 🔦 v6.30 the job card wheel, and hand-out copy —');

  const card = () => page.evaluate(() => {
    jobs = ['Mery', 'Scritchfield'];   // CREW_NAME is a const — this page is already Eric's
    const c = cardMake('Mery');
    c.addr = '38210 K-Beach Rd, Soldotna';
    c.people = [{ n: 'Dale Rininger', r: 'Homeowner', tel: '907-555-0100', em: 'dale@example.com' }];
    c.codes = [{ w: 'Front door', c: '1379#' }];
    _jcPick = new Set(); _jcPickJob = '';
    openJobCard('Mery');
  });

  await card();
  ok('the job wheel on the card is loud — brass rim, its own glow, big type', await page.evaluate(() => {
    const box = document.querySelector('.jc-pick'), sel = $('jcJob');
    if (!box || !sel) return false;
    const bs = getComputedStyle(box), ss = getComputedStyle(sel);
    return parseFloat(bs.borderTopWidth) >= 3 && bs.boxShadow !== 'none' &&
      parseFloat(ss.fontSize) >= 18 && parseFloat(ss.minHeight) >= 48;
  }));

  ok('it is louder than the ordinary fields around it', await page.evaluate(() => {
    const pickW = parseFloat(getComputedStyle(document.querySelector('.jc-pick')).borderTopWidth);
    const plain = $('jcAddr');
    return !plain || pickW > parseFloat(getComputedStyle(plain).borderTopWidth);
  }));

  ok('brightness is never the only signal — it SAYS pick the job, and which one', await page.evaluate(() => {
    const t = document.querySelector('.jc-pick').textContent;
    return /▸ PICK THE JOB FIRST/.test(t) && /✓ SHOWING — Mery/.test(t);
  }));

  ok('the wheel still switches cards', await page.evaluate(() => {
    openJobCard('Scritchfield');
    const okNow = /✓ SHOWING — Scritchfield/.test(document.querySelector('.jc-pick').textContent);
    openJobCard('Mery');
    return okNow;
  }));

  console.log('— 📋 v6.30 tick it, copy it, paste it —');

  await card();
  ok('every handable part is offered — address, name, phone, email', await page.evaluate(() => {
    const t = $('jcShareChips').textContent;
    return /📍 Address/.test(t) && /Dale Rininger/.test(t) && /907-555-0100/.test(t) && /dale@example.com/.test(t);
  }));

  ok('🔑 door and gate CODES are never offered for copying', await page.evaluate(() => {
    const t = $('jcShareChips').textContent;
    return !/1379/.test(t) && !/Front door/.test(t);
  }));

  ok('nothing is ticked until he ticks it', await page.evaluate(() =>
    _jcPick.size === 0 && /tick something first/.test(document.body.textContent)));

  ok('ticking shows how many are going', await page.evaluate(() => {
    jcPickTog('addr'); jcPickTog('pt0');
    return _jcPick.size === 2 && /COPY 2 TICKED/.test(document.body.textContent);
  }));

  ok('copy puts ONLY the ticked parts on the clipboard, job name at the top', await page.evaluate(async () => {
    let got = '';
    const real = navigator.clipboard;
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async t => { got = t; } } });
    await jcCopyPicked();
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: real });
    return /^Mery\n/.test(got) && /38210 K-Beach/.test(got) && /907-555-0100/.test(got) &&
      !/dale@example\.com/.test(got) && !/1379/.test(got);
  }));

  ok('untick and it stops going out', await page.evaluate(async () => {
    jcPickTog('addr');
    let got = '';
    const real = navigator.clipboard;
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async t => { got = t; } } });
    await jcCopyPicked();
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: real });
    return !/38210 K-Beach/.test(got) && /907-555-0100/.test(got);
  }));

  ok('tick all takes everything offered, and again clears it', await page.evaluate(() => {
    jcPickAll();
    const all = _jcPick.size === (window._jcBits || []).length && _jcPick.size >= 4;
    jcPickAll();
    return all && _jcPick.size === 0;
  }));

  ok('ticks never follow you to another job\'s card', await page.evaluate(() => {
    jcPickTog('addr');
    const had = _jcPick.size === 1;
    openJobCard('Scritchfield');
    const cleared = _jcPick.size === 0;
    openJobCard('Mery');
    return had && cleared;
  }));

  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v6.30') && document.querySelector('footer').textContent.includes(APP_VER);
  }));

  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
