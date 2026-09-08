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
    renderJobSelects(); closePanels(); renderAll();
    window._dbxFiles = {}; window._dbxLog = [];
    window.dbxDownload = async path => (window._dbxFiles || {})[path] ?? null;
    window.dbxUpload = async (path, body) => { (window._dbxFiles || {})[path] = body; return {}; };
    window.scheduleSave = () => {};
    const ago = d => { const x = new Date(); x.setDate(x.getDate() - d); return localDay(x); };
    window._ago = ago;
  });

  console.log('— 🔝 v6.31 the project portal sits at the top of Setup —');

  ok('the portal section is the FIRST section on the Setup page', await page.evaluate(() => {
    const secs = [...document.querySelectorAll('#panel-settings .set-section')].map(s => s.id);
    return secs[0] === 'portalSec';
  }));

  ok('it comes before Appearance, Jobs, Crew and the QuickBooks updater', await page.evaluate(() => {
    const secs = [...document.querySelectorAll('#panel-settings .set-section')].map(s => s.id);
    const p = secs.indexOf('portalSec');
    return ['setAppear', 'setJobs', 'setCrew', 'qbSec'].every(id => secs.indexOf(id) > p);
  }));

  ok('nothing was lost in the move — every section is still there once', await page.evaluate(() => {
    const secs = [...document.querySelectorAll('#panel-settings .set-section')].map(s => s.id);
    return secs.length === new Set(secs).size &&
      ['portalSec', 'setAppear', 'setJobs', 'setCrew', 'qbSec', 'setDbx'].every(id => secs.includes(id));
  }));

  console.log('— 📊 v6.31 seven spaces, one per day —');

  ok('posted TODAY fills all seven and says so', await page.evaluate(() => {
    prefs.jrnRel = { 'mery-1': _ago(0) };
    const h = jrnMeterHtml('mery-1');
    const d = document.createElement('div'); d.innerHTML = h;
    return d.querySelectorAll('.jm-cell').length === 7 &&
      d.querySelectorAll('.jm-cell.on').length === 7 && /POSTED TODAY/.test(d.textContent);
  }));

  ok('one day old drains exactly one space', await page.evaluate(() => {
    prefs.jrnRel = { 'mery-1': _ago(1) };
    const d = document.createElement('div'); d.innerHTML = jrnMeterHtml('mery-1');
    return d.querySelectorAll('.jm-cell.on').length === 6 && /1 DAY OLD/.test(d.textContent);
  }));

  ok('three days old leaves four', await page.evaluate(() => {
    prefs.jrnRel = { 'mery-1': _ago(3) };
    const d = document.createElement('div'); d.innerHTML = jrnMeterHtml('mery-1');
    return d.querySelectorAll('.jm-cell.on').length === 4 && /3 DAYS OLD/.test(d.textContent);
  }));

  ok('six days old still has one space left — not yet overdue', await page.evaluate(() => {
    prefs.jrnRel = { 'mery-1': _ago(6) };
    const d = document.createElement('div'); d.innerHTML = jrnMeterHtml('mery-1');
    return d.querySelectorAll('.jm-cell.on').length === 1 &&
      d.querySelectorAll('.jm-cell.strobe').length === 0;
  }));

  ok('a full week empties it AND strobes the last space', await page.evaluate(() => {
    prefs.jrnRel = { 'mery-1': _ago(7) };
    const d = document.createElement('div'); d.innerHTML = jrnMeterHtml('mery-1');
    const cells = [...d.querySelectorAll('.jm-cell')];
    return cells.filter(c => c.classList.contains('on')).length === 0 &&
      cells[6].classList.contains('strobe') &&
      cells.filter(c => c.classList.contains('strobe')).length === 1;
  }));

  ok('and it SAYS what the strobe means — never a blinking light alone', await page.evaluate(() => {
    const d = document.createElement('div'); d.innerHTML = jrnMeterHtml('mery-1');
    return /POST IT NOW/.test(d.textContent) && /⚠/.test(d.textContent);
  }));

  ok('further past a week keeps strobing and counts the days', await page.evaluate(() => {
    prefs.jrnRel = { 'mery-1': _ago(21) };
    const d = document.createElement('div'); d.innerHTML = jrnMeterHtml('mery-1');
    return d.querySelectorAll('.jm-cell.strobe').length === 1 && /21 DAYS — POST IT NOW/.test(d.textContent);
  }));

  ok('a job that has never had a journal reads as overdue, not as fine', await page.evaluate(() => {
    prefs.jrnRel = {};
    const d = document.createElement('div'); d.innerHTML = jrnMeterHtml('never-1');
    return d.querySelectorAll('.jm-cell.on').length === 0 &&
      d.querySelectorAll('.jm-cell.strobe').length === 1 && /NO JOURNAL YET/.test(d.textContent);
  }));

  ok('a junk date is treated as unknown, not as a crash or a full meter', await page.evaluate(() => {
    prefs.jrnRel = { 'bad-1': 'not-a-date' };
    const d = document.createElement('div'); d.innerHTML = jrnMeterHtml('bad-1');
    return d.querySelectorAll('.jm-cell.on').length === 0 && /NO JOURNAL YET/.test(d.textContent);
  }));

  ok('the meter is readable to a screen reader too', await page.evaluate(() => {
    prefs.jrnRel = { 'mery-1': _ago(2) };
    const d = document.createElement('div'); d.innerHTML = jrnMeterHtml('mery-1');
    return /journal 2 DAYS OLD/.test(d.querySelector('.jm').getAttribute('aria-label'));
  }));

  console.log('— 🔄 v6.31 posting the journal resets it —');

  ok('a release stamps today against that job and refills the meter', await page.evaluate(async () => {
    _portalIdx = { clients: [{ code: 'mery-224374', job: 'Mery' }] };
    _jrnIdx = 0; _jrnEditIdx = null;
    prefs.jrnRel = { 'mery-224374': _ago(9) };
    const before = jrnAgeDays('mery-224374');
    window._dbxFiles[portalRoot() + '/mery-224374.json'] = JSON.stringify({ name: 'Mery' });
    // stand in for the journal window's own furniture
    const ta = document.createElement('textarea'); ta.id = 'jrnText'; ta.value = 'framed the south wall';
    document.body.appendChild(ta);
    await journalRelease();
    ta.remove();
    const after = jrnAgeDays('mery-224374');
    const d = document.createElement('div'); d.innerHTML = jrnMeterHtml('mery-224374');
    return before === 9 && after === 0 && d.querySelectorAll('.jm-cell.on').length === 7;
  }));

  ok('the release really did land on their page', await page.evaluate(() => {
    const pg = JSON.parse(window._dbxFiles[portalRoot() + '/mery-224374.json']);
    return (pg.journal || []).length === 1 && /framed the south wall/.test(pg.journal[0].text);
  }));

  console.log('— 📡 v6.31 the real dates come from the client files —');

  ok('reading the clients in fills the cache from their own journals', await page.evaluate(async () => {
    prefs.jrnRel = {};
    window._dbxFiles[portalRoot() + '/a-1.json'] = JSON.stringify({ journal: [{ released: _ago(2), text: 'x' }] });
    window._dbxFiles[portalRoot() + '/b-1.json'] = JSON.stringify({ journal: [{ released: _ago(11), text: 'y' }] });
    await refreshJrnAges([{ code: 'a-1' }, { code: 'b-1' }]);
    return jrnAgeDays('a-1') === 2 && jrnAgeDays('b-1') === 11;
  }));

  ok('a client whose file will not read keeps its cached date — a bad signal is not news', await page.evaluate(async () => {
    prefs.jrnRel = { 'c-1': _ago(3) };
    const real = window.dbxDownload;
    window.dbxDownload = async () => { throw new Error('offline'); };
    await refreshJrnAges([{ code: 'c-1' }]);
    window.dbxDownload = real;
    return jrnAgeDays('c-1') === 3;
  }));

  ok('every job in the list wears its own meter', await page.evaluate(async () => {
    dbx.refreshToken = dbx.refreshToken || 'test-token';
    prefs.jrnRel = { 'mery-224374': _ago(0), 'scr-1': _ago(9) };
    window._dbxFiles[portalRoot() + '/index.json'] = JSON.stringify({ clients: [
      { code: 'mery-224374', job: 'Mery' }, { code: 'scr-1', job: 'Scritchfield' }] });
    window._dbxFiles[portalRoot() + '/scr-1.json'] = JSON.stringify({ journal: [{ released: _ago(9) }] });
    _portalOpen = -1;
    await renderPortalList();
    // v6.54 hung a second meter (📗 the books) beside each journal one, so the journal meters
    // are now .jm:not(.jm-qb) — the guarantee is unchanged: one per job, saying the right thing.
    const meters = [...$('portalList').querySelectorAll('.jm:not(.jm-qb)')];
    const books = [...$('portalList').querySelectorAll('.jm-qb')];
    return meters.length === 2 && books.length === 2 &&
      /POSTED TODAY/.test(meters[0].textContent) && /POST IT NOW/.test(meters[1].textContent) &&
      meters[1].querySelectorAll('.jm-cell.strobe').length === 1 &&
      meters.every(m => /📖/.test(m.textContent)) && books.every(b => /📗/.test(b.textContent));
  }));

  ok('the meter rides the job NAME, where his eye already is', await page.evaluate(() =>
    !!$('portalList').querySelector('.sum-title .jm')));

  console.log('— 📖 v6.31 last week\'s words, where he can build on them —');

  const jrnBox = () => page.evaluate(() => {
    // stand in for the journal window's furniture
    ['jrnLast', 'jrnText'].forEach(id => { const el = document.getElementById(id); if (el) el.remove(); });
    const d = document.createElement('div'); d.id = 'jrnLast'; document.body.appendChild(d);
    const ta = document.createElement('textarea'); ta.id = 'jrnText'; document.body.appendChild(ta);
    _jrnLastOpen = true;
  });

  await jrnBox();
  ok('the last posted week shows, open, with its words readable', await page.evaluate(() => {
    renderJrnLast([{ week: 'Aug 24 – Aug 30', text: 'Framed the south wall and set the beam.' }]);
    const t = $('jrnLast').textContent;
    return /LAST POSTED · WEEK OF AUG 24/.test(t) && /Framed the south wall/.test(t);
  }));

  ok('it is READ-ONLY — nothing lands in the box he posts from', await page.evaluate(() =>
    $('jrnText').value === '' && !$('jrnLast').querySelector('textarea, input')));

  ok('it says plainly that it will not go out again on its own', await page.evaluate(() =>
    /will not go out again/.test($('jrnLast').textContent)));

  ok('⤵ Build on it copies it down into his box only when he taps', await page.evaluate(() => {
    jrnBuildOn();
    return $('jrnText').value === 'Framed the south wall and set the beam.';
  }));

  ok('…and it lands UNDER what he had already written, never over it', await page.evaluate(() => {
    $('jrnText').value = 'Roof goes on Tuesday.';
    jrnBuildOn();
    const v = $('jrnText').value;
    return v.indexOf('Roof goes on Tuesday.') === 0 && /Framed the south wall/.test(v);
  }));

  ok('it folds shut and back open, keeping the week', await page.evaluate(() => {
    jrnLastFold();
    const shut = !/Framed the south wall/.test($('jrnLast').textContent) &&
      /LAST POSTED · WEEK OF AUG 24/.test($('jrnLast').textContent);
    jrnLastFold();
    return shut && /Framed the south wall/.test($('jrnLast').textContent);
  }));

  await jrnBox();
  ok('a job with no journal yet says so instead of showing an empty box', await page.evaluate(() => {
    renderJrnLast([]);
    return /Nothing posted to this job yet/.test($('jrnLast').textContent) &&
      !$('jrnLast').querySelector('button');
  }));

  ok('a released week with no words is treated as nothing to build on', await page.evaluate(() => {
    renderJrnLast([{ week: 'Sep 1 – Sep 7', text: '   ' }]);
    return /Nothing posted to this job yet/.test($('jrnLast').textContent);
  }));

  ok('an ✎ edited week is labelled as edited', await page.evaluate(() => {
    renderJrnLast([{ week: 'Sep 1 – Sep 7', text: 'Poured the slab.', edited: '2026-09-04' }]);
    return /✎ EDITED/.test($('jrnLast').textContent);
  }));

  ok('the words are escaped — a client name with a bracket cannot break the panel', await page.evaluate(() => {
    renderJrnLast([{ week: 'x', text: '<img src=x onerror=alert(1)> & "quoted"' }]);
    const box = $('jrnLast');
    return !box.querySelector('img') && /onerror/.test(box.textContent);
  }));

  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v6.31') && document.querySelector('footer').textContent.includes(APP_VER);
  }));

  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
