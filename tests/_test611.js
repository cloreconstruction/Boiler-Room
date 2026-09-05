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
    jobs = ['Scritchfield', 'Rininger', 'Mery']; curJob = 'Scritchfield'; crew = [];
    entries = []; todos = []; nextId = 1;
    clockedInAt = null; clockJobName = null;
    renderJobSelects(); closePanels(); renderAll();
  });

  console.log('— ⏱ v6.21 the clock wheel sits on CHOOSE JOB until he is actually on it —');

  ok('off the clock the wheel is blank and SAYS choose job', await page.evaluate(() => {
    const s = $('clockJob');
    return s.value === '' && /Choose job/.test(s.options[0].textContent) && s.options[0].value === '';
  }));

  ok('every real job is still on the wheel behind the blank', await page.evaluate(() => {
    const v = [...$('clockJob').options].map(o => o.value);
    return v.length === 4 && v[0] === '' && v.includes('Scritchfield') && v.includes('Rininger') && v.includes('Mery');
  }));

  ok('tapping clock-in with nothing picked is REFUSED — no phantom shift', await page.evaluate(() => {
    toggleClock();
    return clockedInAt === null && clockJobName === null && /Pick the job first/.test(document.body.textContent);
  }));

  ok('pick a job and it clocks in on THAT job', await page.evaluate(() => {
    $('clockJob').value = 'Rininger';
    toggleClock();
    return !!clockedInAt && clockJobName === 'Rininger';
  }));

  ok('on the clock the blank is GONE — a stray thumb cannot unset a running shift', await page.evaluate(() => {
    const s = $('clockJob');
    return s.value === 'Rininger' && ![...s.options].some(o => o.value === '');
  }));

  ok('a job added mid-shift does not bring the blank back', await page.evaluate(() => {
    jobs.push('Gilbreath'); renderJobSelects();
    const s = $('clockJob');
    return s.value === 'Rininger' && ![...s.options].some(o => o.value === '') &&
      [...s.options].some(o => o.value === 'Gilbreath');
  }));

  ok('undoing the punch sends the wheel home to CHOOSE JOB', await page.evaluate(() => {
    undoPunch();
    const s = $('clockJob');
    return clockedInAt === null && s.value === '' && /Choose job/.test(s.options[0].textContent);
  }));

  ok('a real clock-out lands the shift AND blanks the wheel', await page.evaluate(async () => {
    $('clockJob').value = 'Mery';
    toggleClock();
    clockedInAt = new Date(Date.now() - 2 * 3600000);   // two hours ago
    openClockOut();
    saveClockOut();
    const s = $('clockJob');
    const e = entries.find(x => x.type === 'Clock');
    return e && e.job === 'Mery' && clockedInAt === null && s.value === '' &&
      /Choose job/.test(s.options[0].textContent);
  }));

  ok('undoing the clock-OUT puts him back on, wheel shows the job, no blank', await page.evaluate(() => {
    undoPunch();
    const s = $('clockJob');
    return !!clockedInAt && clockJobName === 'Mery' && s.value === 'Mery' &&
      ![...s.options].some(o => o.value === '');
  }));

  ok('scrapping a punch also sends it home', await page.evaluate(() => {
    scrapPunch(); scrapPunch();          // arm, then fire
    const s = $('clockJob');
    return clockedInAt === null && s.value === '' && /Choose job/.test(s.options[0].textContent);
  }));

  ok('a shift resumed after a reload shows its job, not the blank', await page.evaluate(() => {
    lsSet('daylog-shift', JSON.stringify({ at: new Date(Date.now() - 3600000).toISOString(), job: 'Scritchfield' }));
    restoreShift();
    const s = $('clockJob');
    return !!clockedInAt && clockJobName === 'Scritchfield' && s.value === 'Scritchfield' &&
      ![...s.options].some(o => o.value === '');
  }));

  ok('the OTHER wheel (project tracker) never grows a blank', await page.evaluate(() => {
    const v = [...$('ptJob').options].map(o => o.value);
    return v.length > 0 && !v.includes('');
  }));

  ok('a job name that is not on his list can never start a shift', await page.evaluate(() => {
    undoPunch(); undoPunch();                       // get off the clock
    const s = $('clockJob');
    s.innerHTML = '<option value="Ghost Job">Ghost Job</option>';
    s.value = 'Ghost Job';
    toggleClock();
    return clockedInAt === null;
  }));

  console.log('page errors:', errs.length); errs.forEach(e => console.log('  ' + e));
  console.log(`${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail || errs.length ? 1 : 0);
})();
