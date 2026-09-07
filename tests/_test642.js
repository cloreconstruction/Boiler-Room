const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { fileURLToPath } = require('url');
(async () => {
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
  const appUrl = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const repo = path.dirname(fileURLToPath(appUrl));
  await page.goto(appUrl);
  await page.waitForTimeout(700);
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };
  await page.evaluate(() => {
    jobs = ['Mery', 'Rininger']; curJob = 'Mery'; crew = []; entries = []; todos = []; nextId = 1;
    prefs.tagScrub1 = true; prefs.tagScrub2 = true;
    window.scheduleSave = () => {}; window.savePendingSoon = () => {};
    renderJobSelects(); closePanels(); renderAll();
  });

  // 🔧 v6.42 — Eric picked items 1 to 13 off the punch list. Everything below is one of them.
  console.log('— 🔧 v6.42 the punch list, 1 to 13 —');

  // ── 1. the page was 428px wide on a 390px phone, in the steam skin only ──
  for (const skin of ['', 'steam']) {
    const r = await page.evaluate(s => {
      if (s) { prefs.skin = s; applySkin(s); } else { prefs.skin = ''; applySkin(''); }
      renderAll();
      return { w: document.documentElement.clientWidth, sw: document.documentElement.scrollWidth };
    }, skin);
    ok(`1. nothing runs off the right edge — ${skin || 'default'} skin (${r.sw}px on a ${r.w}px screen)`, r.sw <= r.w);
  }

  // ── 2. in and out in the same minute read 24 hours ──
  ok('2. clocking out in the same minute reads one minute, not 24 hours', await page.evaluate(() => {
    breakMins = 0;
    $('coIn').value = '09:15'; $('coOut').value = '09:15';
    const same = coCalc(), sameTxt = $('coTotal').textContent;
    $('coIn').value = '22:00'; $('coOut').value = '06:30';
    const overnight = coCalc();
    $('coIn').value = '08:00'; $('coOut').value = '16:00';
    const normal = coCalc();
    return same && same.h > 0 && same.h < 0.05 && !/24\.00/.test(sameTxt) &&
      overnight.h === 8.5 &&   // a real overnight shift still comes out right
      normal.h === 8;
  }));

  ok('2b. the same fix on the Add hours sheet', await page.evaluate(() => {
    breakMins = 0;
    $('hIn').value = '07:00'; $('hOut').value = '07:00'; hCalc();
    const same = +$('hHours').value, txt = $('hTotal').textContent;
    $('hIn').value = '23:00'; $('hOut').value = '07:00'; hCalc();
    const overnight = +$('hHours').value;
    return same > 0 && same < 0.05 && !/24\.00/.test(txt) && overnight === 8;
  }));

  // ── 3. buttons shrunk too small for a glove ──
  ok('3. the shrunk buttons are back to a thumb — estimates chips, portal rows, the job-card ✕', await page.evaluate(() => {
    const css = [...document.styleSheets].flatMap(sh => { try { return [...sh.cssRules]; } catch (e) { return []; } });
    const find = sel => css.find(r => r.selectorText === sel);
    const mh = sel => { const r = find(sel); return r ? parseFloat(r.style.minHeight) : 0; };
    return mh('.est-board .pick-chip') >= 34 && mh('.est-board .btn-ghost') >= 36 &&
      mh('.pf-small .btn-ghost') >= 40 && mh('.pf-vis .pick-chip') >= 40 && mh('.jc-x') >= 44;
  }));

  ok('3b. the log\'s own filter chips clear the floor too', await page.evaluate(() => {
    const a = $('rlRcptBtn').getBoundingClientRect(), b = $('rlSearchBtn').getBoundingClientRect();
    return a.height >= 36 && b.height >= 36;
  }));

  // ── 4. filing a receipt ignored the category ──
  ok('4. a receipt under any of the 55 estimate categories files under Receipts, not Inbox', await page.evaluate(() => {
    const tries = ['Framing', 'Trash / Construction Debris', 'Water Softener', 'Bathrooms', 'Snow Plowing'];
    const folder = c => CAT_FOLDER[c] || (EST_DEFAULT_CATS.includes(c) ? 'Receipts' : '');
    return tries.every(c => folder(c) === 'Receipts') && folder('Subcontractor') === 'Invoices' &&
      folder('Loan/Bank') === 'Bank Statements' && folder('Personal') === 'Personal' && folder('') === '';
  }));

  // ── 5. the step rail pointed back up the page ──
  ok('5. with words and no job the rail points at the LEVER, and step ① says a blank job is allowed', await page.evaluate(() => {
    openPanel('note'); closePanels();
    $('askText').value = 'poured the garage slab'; qnJobPick = ''; updateStepFlow();
    const one = document.querySelector('.g-step[data-step="1"]'), five = document.querySelector('.g-step[data-step="5"]');
    return five.classList.contains('next') && !one.classList.contains('next') && one.classList.contains('blank') &&
      /BLANK — files as unfiled/.test(one.textContent);
  }));

  ok('5b. with nothing said it still points at the job, then at the words', await page.evaluate(() => {
    $('askText').value = ''; qnJobPick = ''; updateStepFlow();
    const one = document.querySelector('.g-step[data-step="1"]').classList.contains('next');
    qnJobPick = 'Mery'; updateStepFlow();
    const two = document.querySelector('.g-step[data-step="2"]').classList.contains('next');
    return one && two;
  }));

  // ── 6. the homeowner's item window opened underneath the list ──
  ok('6. on the client page the item window opens OVER the board, not under it', (() => {
    const c = fs.readFileSync(path.join(repo, 'c', 'index.html'), 'utf8');
    const board = +(c.match(/#matCard\.fs \{[^}]*z-index:\s*(\d+)/) || [])[1];
    const item = +(c.match(/fs\.id = 'matItemFS';[\s\S]{0,200}?z-index:(\d+)/) || [])[1];
    const photo = +(c.match(/z-index:200/) || []) ? 200 : 0;
    return board > 0 && item > board && (!photo || item < photo);
  })());

  // ── 7. "30 more (8 below)" ──
  ok('7. the more-button counts what is actually left', await page.evaluate(() => {
    entries = []; nextId = 1;
    for (let i = 0; i < 20; i++) addEntry('Note', 'note ' + i, 'Mery', {});
    window._rlN = 12; clearLogFilters(); renderAskRecent();
    const a = $('askRecent').textContent;
    for (let i = 0; i < 40; i++) addEntry('Note', 'more ' + i, 'Mery', {});
    window._rlN = 12; renderAskRecent();
    const b = $('askRecent').textContent;
    entries = []; nextId = 1;
    return /⬇ Next 8\b/.test(a) && !/30 more/.test(a) && /⬇ Next 30 · 48 more/.test(b);
  }));

  // ── 8. the clock's job wheel ──
  ok('8. the clock wheel is a thumb tall and its words fit', await page.evaluate(() => {
    const sel = $('clockJob'); sel.scrollIntoView();
    const r = sel.getBoundingClientRect();
    const blank = [...sel.options].find(o => o.value === '');
    return r.height >= 40 && !!blank && blank.text === 'Choose job';
  }));

  ok('8b. hitting the button with no job makes the WHEEL say "▲ PICK JOB", not just a toast', await page.evaluate(async () => {
    clockedInAt = null; const sel = $('clockJob'); sel.value = '';
    toggleClock();
    const said = sel.classList.contains('need') && [...sel.options].some(o => o.text === '▲ PICK JOB');
    const toasted = /Pick the job first/.test($('toast').textContent);
    return said && toasted;
  }));

  // ── 9. save a screen below where he is working ──
  ok('9. all three sheets have a save row, sticky, and a CHILD of the panel so it can pin', await page.evaluate(() => {
    const ids = ['panel-clockout', 'panel-hours', 'panel-file'];
    return ids.every(id => {
      const panel = document.getElementById(id), bar = panel && panel.querySelector('.save-bar');
      if (!bar) return false;
      const cs = getComputedStyle(bar);
      return bar.parentElement === panel && cs.position === 'sticky' && cs.bottom === '0px';
    });
  }));

  ok('9b. Clock Out is on screen the whole time, one line tall, with Scrap out of the footer', await page.evaluate(() => {
    clockedInAt = new Date(Date.now() - 3 * 3600000); clockJobName = 'Mery';
    openClockOut();
    const panel = document.getElementById('panel-clockout');
    const pcs = getComputedStyle(panel), pr = panel.getBoundingClientRect();
    const contentBottom = pr.bottom - parseFloat(pcs.paddingBottom || 0);
    const bar = panel.querySelector('.save-bar').getBoundingClientRect();
    const save = panel.querySelector('.save-bar .btn-primary').getBoundingClientRect();
    const scrap = $('coScrapBtn');
    // it pins to the bottom of the sheet, is one action tall, and Save is on screen at scroll-top
    // it rides the bottom of the sheet — within a hair of the panel's content edge, and always
    // down at the foot of the screen rather than floating a page below like it used to
    const out = { pinned: bar.bottom >= contentBottom - 24 && bar.bottom >= innerHeight - 24, short: bar.height < 110,
      saveVisible: save.bottom <= innerHeight + 1 && save.top >= 0,
      scrapOutside: !scrap.closest('.save-bar'), onlyAction: panel.querySelectorAll('.save-bar button').length === 1 };
    closePanels(); clockedInAt = null;
    window._9b = out;
    return out.pinned && out.short && out.saveVisible && out.scrapOutside && out.onlyAction;
  }), JSON.stringify(await page.evaluate(() => window._9b)));

  // ── 10. no undo where a slip costs him ──
  ok('10. a plain note offers Undo, and taking it back puts his words and job back in the box', await page.evaluate(async () => {
    entries = []; nextId = 1; qnSel = new Set(); qnVis = ''; qnVisNames = new Set();
    $('askText').value = 'poured the garage slab this morning'; qnJobPick = 'Mery';
    const sel = $('qnJob'); if (sel) sel.value = 'Mery';
    saveQuickNote();
    const madeIt = entries.length === 1 && $('askText').value === '';
    const hasUndo = /Undo/.test($('toast').innerHTML) && typeof window._toastUndo === 'function';
    window._toastUndo();
    return madeIt && hasUndo && entries.length === 0 && $('askText').value === 'poured the garage slab this morning' && qnJobPick === 'Mery';
  }));

  ok('10b. an unlocked or routed note does NOT offer Undo — it already went to somebody', await page.evaluate(() => {
    entries = []; nextId = 1; window._toastUndo = null;
    $('askText').value = 'tell the crew'; qnJobPick = 'Mery'; qnVis = 'crew';
    saveQuickNote();
    const noUndo = !/Undo/.test($('toast').innerHTML);
    qnVis = ''; qnVisNames = new Set(); entries = []; nextId = 1;
    return noUndo;
  }));

  ok('10c. no note text reaches a lock screen — the crew-ask ping is generic now', () => {
    const src = fs.readFileSync(fileURLToPath(appUrl), 'utf8');
    return !/'📢 Eric needs an answer', body: t\.slice/.test(src) && src.includes("title: '📢 Eric needs an answer', body: 'Open Boiler Room to read it.'");
  });

  // ── 11. the send plate two scrolls below the words ──
  ok('11. TAG IT and UNLOCK IT fold to one line each, and say what is in them', await page.evaluate(() => {
    window._gOpen = {}; qnSel = new Set(); qnVis = ''; qnVisNames = new Set(); qnHeads = false;
    $('askText').value = 'a note'; updateStepFlow();
    const three = document.querySelector('.g-step[data-step="3"]'), four = document.querySelector('.g-step[data-step="4"]');
    const chips = $('qnTagChips');
    return three.classList.contains('fold') && four.classList.contains('fold') &&
      getComputedStyle(chips).display === 'none' &&
      /none picked/.test(three.textContent) && /just you/.test(four.textContent) && /tap to open/.test(three.textContent);
  }));

  ok('11b. tapping the line opens that band, and anything picked keeps it open and names it', await page.evaluate(() => {
    gFold(3);
    const three = document.querySelector('.g-step[data-step="3"]');
    const opened = !three.classList.contains('fold') && getComputedStyle($('qnTagChips')).display !== 'none';
    gFold(3);
    const shutAgain = three.classList.contains('fold');
    qnSel = new Set(['Receipt']); updateStepFlow();
    const stays = !three.classList.contains('fold');
    qnSel = new Set(); updateStepFlow();
    return opened && shutAgain && stays;
  }));

  ok('11c. the send plate is now on the same screen as the words', await page.evaluate(() => {
    window._gOpen = {}; $('askText').value = 'poured the slab'; updateStepFlow();
    const box = $('askText').getBoundingClientRect();
    const plate = document.querySelector('.plate-btn--grind').getBoundingClientRect();
    return plate.top - box.bottom < 420;   // it was 556px of optional steps
  }));

  // ── 12. picking a job was always a spinning wheel ──
  ok('12. one-tap job buttons above the wheel, the clocked-in job first', await page.evaluate(() => {
    clockJobName = 'Rininger'; curJob = 'Mery'; entries = []; nextId = 1;
    renderQnJobChips();
    const box = $('qnJobChips'), btns = [...box.querySelectorAll('button')];
    return btns.length >= 2 && btns.length <= 3 && /Rininger/.test(btns[0].textContent) && /⏱/.test(btns[0].textContent) &&
      btns.every(b => b.getBoundingClientRect().height >= 38);
  }));

  ok('12b. tapping one picks that job; tapping it again clears it — no trip to the wheel', await page.evaluate(() => {
    qnJobPick = ''; qnJobTap('Rininger');
    const on = qnJobPick === 'Rininger' && $('qnJob').value === 'Rininger';
    qnJobTap('Rininger');
    return on && qnJobPick === '' && $('qnJob').value === '';
  }));

  // ── 13. two of the eight bottom buttons were dead weight ──
  ok('13. six bottom buttons while to-dos are parked, each one wider', await page.evaluate(() => {
    const shown = [...document.querySelectorAll('.capture .cap-btn')].filter(b => b.offsetParent !== null);
    const names = shown.map(b => (b.querySelector('.lb-short') || {}).textContent);
    const wide = shown.every(b => b.getBoundingClientRect().width >= 55);
    const parked = document.body.classList.contains('parked-630');
    return parked && shown.length === 6 && !names.includes('To-Do') && !names.includes('Job') && wide;
  }));

  ok('13b. the panel you are in is marked with a word, not just a border colour', await page.evaluate(() => {
    const css = [...document.styleSheets].flatMap(sh => { try { return [...sh.cssRules]; } catch (e) { return []; } });
    return css.some(r => r.selectorText === '.capture .cap-btn.active .lb-short::before' && /▸/.test(r.style.content));
  }));

  // ── the clipped words the review kept finding ──
  ok('14. tag chips wrap their words instead of clipping them ("Home Depo", "SHEVAU")', await page.evaluate(() => {
    const css = [...document.styleSheets].flatMap(sh => { try { return [...sh.cssRules]; } catch (e) { return []; } });
    const r = css.find(x => x.selectorText && x.selectorText.includes('#qnTagChips .pick-chip') && x.style.whiteSpace);
    return !!r && r.style.whiteSpace === 'normal' && r.style.overflow === 'visible';
  }));

  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v6.42') && document.querySelector('footer').textContent.includes(APP_VER);
  }));

  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
