// 🏠 v6.65 — THE PROJECT PORTAL IN ITS OWN WINDOW. Eric: "when i click on the project portal
// and it opens up in the setup menu, id like to separate that and have the project portal
// open to its own window and no longer in the setup." Plus the same build's small fixes.
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
  await page.goto(process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html');
  await page.waitForTimeout(700);
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };
  await page.evaluate(() => {
    jobs = ['Hertz', 'Josten/Weiser', 'Mery']; curJob = '—'; crew = []; entries = []; todos = []; nextId = 1;
    renderJobSelects(); closePanels(); renderAll();
    window.scheduleSave = () => {};
    dbx.refreshToken = 'test-token';
    window._dbxFiles = {};
    window.dbxDownload = async p => (window._dbxFiles || {})[p] ?? null;
    window.dbxUpload = async (p, body) => { (window._dbxFiles || {})[p] = body; return {}; };
    window.dbxPathExists = async p => Object.prototype.hasOwnProperty.call(window._dbxFiles || {}, p);
    window.dbxRpc = async () => ({ matches: [], entries: [] });
    const idx = { clients: [{ key: 'josten', job: 'Josten–Weiser Custom Home', code: 'josten-842d53' }, { key: 'mery', job: 'Mery Residence', code: 'mery-1a2b3c' }] };
    window._dbxFiles[portalRoot() + '/index.json'] = JSON.stringify(idx);
    for (const c of idx.clients) {
      window._dbxFiles[portalRoot() + '/' + c.code + '.json'] = JSON.stringify({ name: c.job, updated: '2026-09-11', show: { money: true, phases: true }, invoiced: 0, paid: 0, open: 0, phases: [], journal: [] });
      window._dbxFiles[estPath(c.code)] = JSON.stringify({ mk: 20, cats: [] });
    }
    _portalIdx = null;
  });
  const z = sel => page.evaluate(s => +getComputedStyle(document.querySelector(s)).zIndex, sel);
  const shown = sel => page.evaluate(s => document.querySelector(s).classList.contains('show'), sel);
  const locked = () => page.evaluate(() => document.body.classList.contains('modal-open'));

  console.log('— 🏠 v6.65 the portal left Setup —');

  ok('Setup has no portal section any more, and every other section is still there once', await page.evaluate(() => {
    const secs = [...document.querySelectorAll('#panel-settings .set-section')].map(s => s.id);
    return !secs.includes('portalSec') && !document.querySelector('#panel-settings #portalList') &&
      secs.length === new Set(secs).size && ['setAppear', 'setJobs', 'setCrew', 'qbSec', 'setDbx'].every(id => secs.includes(id));
  }));

  ok('the 🏠 plate on the main page opens the window, not Setup', await page.evaluate(() => {
    const b = [...document.querySelectorAll('#scRow .sc-btn')].find(x => /Project portal/.test(x.textContent));
    return !!b && /openPortalWin\(\)/.test(b.getAttribute('onclick') || '') && !/jumpSetup/.test(b.getAttribute('onclick') || '');
  }));

  ok('opening it: a full-screen window with the words, a ✕ at the top, the job list inside it, Setup shut', await (async () => {
    await page.evaluate(() => openPortalWin());
    await page.waitForTimeout(400);
    return page.evaluate(() => {
      const w = $('portalWin'), box = $('portalBox');
      const rows = [...box.querySelectorAll('.sum-title')].map(b => b.textContent);
      return w.classList.contains('show') && w.classList.contains('mat-full') && document.body.classList.contains('modal-open') &&
        /Project portal/i.test(box.querySelector('h3').textContent) && !!box.querySelector('.win-x') &&
        !!w.querySelector('#portalList') && rows.length === 2 && /Josten/.test(rows[0]) && /Mery/.test(rows[1]) &&
        !$('panel-settings').classList.contains('open') && getComputedStyle(w).position === 'fixed' && w.getBoundingClientRect().width >= 380;
    });
  })());

  ok('a job unfolds its plates in the window, same as before', await (async () => {
    await page.evaluate(() => portalFold(0));
    await page.waitForTimeout(300);
    return page.evaluate(() => { const t = $('portalBox').textContent; return /💰 Estimates/.test(t) && /🧾 Receipts to approve/.test(t) && /👁 View as this client/.test(t) && /📖 Journal/.test(t); });
  })());

  console.log('— 🪜 v6.65 the doors open ON TOP of it and close back to it —');

  ok('💰 Estimates opens over the portal window (higher z), and closing it lands back on the portal, page still locked', await (async () => {
    await page.evaluate(async () => { await openEstimates(0); });
    await page.waitForTimeout(200);
    const over = (await shown('#revModal')) && (await z('#revModal')) > (await z('#portalWin'));
    await page.evaluate(() => closeEstimates());
    return over && !(await shown('#revModal')) && (await shown('#portalWin')) && (await locked());
  })());

  ok('🧾 Receipts to approve — the same', await (async () => {
    await page.evaluate(async () => { await openRcptReview(0); });
    await page.waitForTimeout(200);
    const over = await shown('#revModal');
    await page.evaluate(() => closeRcptReview());
    return over && !(await shown('#revModal')) && (await shown('#portalWin')) && (await locked());
  })());

  ok('📖 Journal — the same (it closes through closeReview)', await (async () => {
    await page.evaluate(async () => { await openJournal(0); });
    await page.waitForTimeout(200);
    const over = await shown('#revModal');
    await page.evaluate(() => closeReview());
    return over && !(await shown('#revModal')) && (await shown('#portalWin')) && (await locked());
  })());

  ok('👁 View as this client opens over it (higher z) and comes back to it', await (async () => {
    await page.evaluate(() => clientPreviewOpen(0));
    await page.waitForTimeout(200);
    const over = (await shown('#cliPrev')) && (await z('#cliPrev')) > (await z('#portalWin'));
    await page.evaluate(() => clientPreviewClose());
    return over && (await shown('#portalWin')) && (await locked());
  })());

  ok('⚙ Setup opened and shut again over the portal window leaves the page locked for the window', await (async () => {
    await page.evaluate(() => openPanel('settings'));
    const setupOver = await page.evaluate(() => $('panel-settings').classList.contains('open') && !document.querySelector('#panel-settings #portalList'));
    await page.evaluate(() => openPanel('settings'));   // the same tap again = toggle shut
    const a = !(await page.evaluate(() => $('panel-settings').classList.contains('open'))) && (await locked()) && (await shown('#portalWin'));
    await page.evaluate(() => { openPanel('settings'); closePanels(); });
    const b = (await locked()) && (await shown('#portalWin'));
    return setupOver && a && b;
  })());

  ok('✕ closes the window and unlocks the page', await (async () => {
    await page.evaluate(() => $('portalBox').querySelector('.win-x').click());
    return !(await shown('#portalWin')) && !(await locked());
  })());

  ok('the old door, jumpSetup("portalSec"), lands in the window too — Setup stays shut', await (async () => {
    await page.evaluate(() => jumpSetup('portalSec'));
    await page.waitForTimeout(300);
    const r = (await shown('#portalWin')) && !(await page.evaluate(() => $('panel-settings').classList.contains('open'))) &&
      (await page.evaluate(() => $('portalWin').scrollTop === 0));
    await page.evaluate(() => closePortalWin());
    return r;
  })());

  ok('a crew phone can still open it (v5.44: Phil needs the portal)', await (async () => {
    await page.evaluate(() => { crewPreview = true; openPortalWin(); });
    await page.waitForTimeout(200);
    const r = await shown('#portalWin');
    await page.evaluate(() => { closePortalWin(); crewPreview = false; });
    return r;
  })());

  console.log('— ⏱ v6.65 the clock wheel stays on the shift job —');

  ok('the grinder job wheel reads CHOOSE JOB — no "(optional)"', await page.evaluate(() => {
    const o = [...$('qnJob').options].find(x => x.value === '');
    return !!o && /CHOOSE JOB/.test(o.textContent) && !/optional/i.test(o.textContent);
  }));

  ok('clocked in on Mery: the wheel says Mery, and stays on Mery however the list is rebuilt around it', await page.evaluate(() => {
    clockedInAt = null; clockJobName = null; renderJobSelects();
    $('clockJob').value = 'Mery'; toggleClock();
    const a = !!clockedInAt && $('clockJob').value === 'Mery';
    prefs.jobRecent = ['Hertz']; renderJobSelects();                 // a sync reorders the list, Hertz first
    const b = $('clockJob').value === 'Mery';
    $('clockJob').value = ''; renderJobSelects();                    // a stray blank
    const c = $('clockJob').value === 'Mery';
    jobs = ['Hertz', 'Josten/Weiser']; renderJobSelects();           // the list came back WITHOUT the shift job
    const d = $('clockJob').value === 'Mery' && [...$('clockJob').options].some(o => o.value === 'Mery');
    jobs = ['Hertz', 'Josten/Weiser', 'Mery']; prefs.jobRecent = []; renderJobSelects();
    return a && b && c && d;
  }));

  ok('a real reload with the shift still running: the wheel comes back on Mery, not the first name', await (async () => {
    await page.reload(); await page.waitForTimeout(900);
    const r = await page.evaluate(() => !!clockedInAt && clockJobName === 'Mery' && $('clockJob').value === 'Mery');
    await page.evaluate(() => { clockedInAt = null; clockJobName = null; localStorage.removeItem('daylog-shift'); clockWheelHome(); setClockBtn(false); });
    return r;
  })());

  ok('off the clock the wheel goes home to Choose job — nothing pre-picked', await page.evaluate(() => {
    jobs = ['Hertz', 'Josten/Weiser', 'Mery']; curJob = '—'; renderJobSelects();
    return $('clockJob').value === '' && /Choose job/.test([...$('clockJob').options][0].textContent);
  }));

  console.log('— 🚚📇 v6.65 nothing lights the first job by itself —');

  ok('mileage: with no job set, no job chip is lit; with a job set, that one is', await page.evaluate(() => {
    window.scheduleSave = () => {};
    curJob = '—'; mOpenInit();
    const none = mJobSel.size === 0 && !document.querySelector('#mBody .grid-chip.sel');
    curJob = 'Mery'; mOpenInit();
    const one = mJobSel.size === 1 && mJobSel.has('Mery');
    curJob = '—';
    return none && one;
  }));

  ok('mileage: a trip with no job asks for one instead of filing it under the first name', await page.evaluate(() => {
    trucks = [{ name: 'F-250' }]; curTruck = 'F-250'; renderTruckChips(); renderMileBody();
    mJobSel = new Set(); if ($('mStartOdo')) $('mStartOdo').value = '120000';
    startTrip();
    const t = trucks.find(x => x.name === 'F-250');
    return !t.trip && /Pick the job/i.test($('toast').textContent);
  }));

  ok('job cards: with nothing picked the wheel says ▲ Choose the job and no card is drawn', await page.evaluate(() => {
    _cardJob = ''; curJob = '—'; openJobCards();
    const sel = $('jcJob');
    const r = !!sel && sel.value === '' && /Choose the job/.test(sel.options[0].textContent) && /NOTHING PICKED YET/.test($('revBox').textContent) && !$('jcAddr');
    closeReview();
    return r;
  }));

  ok('job cards: with a job set, that job\'s card opens, and picking on the wheel switches it', await page.evaluate(() => {
    _cardJob = ''; curJob = 'Mery'; openJobCards();
    const a = $('jcJob').value === 'Mery' && /SHOWING — Mery/.test($('revBox').textContent) && !!$('jcAddr');
    openJobCard('Hertz');
    const b = $('jcJob').value === 'Hertz' && /SHOWING — Hertz/.test($('revBox').textContent);
    closeReview(); curJob = '—'; _cardJob = '';
    return a && b;
  }));

  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v6.65') && document.querySelector('footer').textContent.includes(APP_VER);
  }));

  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
