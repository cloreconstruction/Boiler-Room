// 🔔 v7.01 — THE HOURS REMINDER. Eric: "also i need some kind of reminder to look at payroll every week or two weeks,
// every week is better for the summary." Two halves: a count on the 👷 Crew portal plate when hours wait for him, and a
// push to his own phone on the day he chooses. The deciding runs here in node (no imports); the app half runs in a
// phone-size browser. Every name and hour is made up.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { fileURLToPath, pathToFileURL } = require('url');
(async () => {
  const appUrl = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const repo = path.dirname(fileURLToPath(appUrl));
  const src = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };

  console.log('— ⏰ the deciding (node) —');
  const core = await import(pathToFileURL(path.join(repo, 'fnsrc', 'hours-reminder-core.mjs')).href);
  const { due, alaskaParts, WORDS } = core;
  const at = iso => new Date(iso);
  // Friday 2026-09-25 is summer in Alaska (UTC-8): 8 am = 16:00Z. Friday 2026-12-04 is winter (UTC-9): 8 am = 17:00Z.
  const S = { on: true, every: 1, day: 5, at: 8 };
  ok('Alaska\'s day and hour are read right in summer and in winter', (() => { const a = alaskaParts(at('2026-09-25T16:00:00Z')), b = alaskaParts(at('2026-12-04T17:00:00Z')), c = alaskaParts(at('2026-09-26T05:30:00Z')); return a.ymd === '2026-09-25' && a.hour === 8 && a.dow === 5 && b.ymd === '2026-12-04' && b.hour === 8 && b.dow === 5 && c.ymd === '2026-09-25' && c.hour === 21; })());
  ok('it rings on HIS day at HIS hour — and only then: the hour before, the hour after, and every other day are a no', due(S, null, at('2026-09-25T16:00:00Z')).send === true && due(S, null, at('2026-09-25T15:00:00Z')).why === 'hour' && due(S, null, at('2026-09-25T17:00:00Z')).why === 'hour' && due(S, null, at('2026-09-24T16:00:00Z')).why === 'day' && due(S, null, at('2026-12-04T17:00:00Z')).send === true && due(S, null, at('2026-12-04T16:00:00Z')).why === 'hour');
  ok('it rings ONCE: the day it last rang is remembered', due(S, { last: '2026-09-25' }, at('2026-09-25T16:00:00Z')).why === 'already' && due(S, { last: '2026-09-18' }, at('2026-09-25T16:00:00Z')).send === true);
  ok('it fails closed: no settings, OFF, or a broken setting is a no — and an odd day or hour falls back to Friday 8 am', due(null, null, at('2026-09-25T16:00:00Z')).why === 'off' && due({ on: false, day: 5, at: 8 }, null, at('2026-09-25T16:00:00Z')).why === 'off' && due({ on: 'yes' }, null, at('2026-09-25T16:00:00Z')).why === 'off' && due({ on: true, day: 9, at: 99 }, null, at('2026-09-25T16:00:00Z')).send === true);
  ok('another day and hour: Mondays at 6 am', due({ on: true, every: 1, day: 1, at: 6 }, null, at('2026-09-28T14:00:00Z')).send === true && due({ on: true, every: 1, day: 1, at: 6 }, null, at('2026-09-25T14:00:00Z')).why === 'day');
  const F = { on: true, every: 2, day: 5, at: 8, anchor: '2026-09-12' };   // a pay period ended Sat 9/12 → it rings Fri 9/18, not 9/25, then 10/2
  ok('every 2 weeks rings the week right AFTER a pay period ends, skips the week between, and needs the anchor', due(F, null, at('2026-09-18T16:00:00Z')).send === true && due(F, null, at('2026-09-25T16:00:00Z')).why === 'off-week' && due(F, null, at('2026-10-02T16:00:00Z')).send === true && due({ ...F, anchor: '' }, null, at('2026-09-18T16:00:00Z')).why === 'no-anchor' && due({ ...F, day: 1 }, null, at('2026-09-14T16:00:00Z')).send === true && due({ ...F, day: 1 }, null, at('2026-09-21T16:00:00Z')).why === 'off-week');
  ok('the words on the lock screen are fixed: no name, no dollars, no number at all', !/[$\d@]/.test(WORDS.title + WORDS.body) && !/phil|eric|logan|clore|canaan|aaron|nathan/i.test(WORDS.title + WORDS.body) && /crew's hours/.test(WORDS.body));
  const fn = fs.readFileSync(path.join(repo, 'fnsrc', 'hours-reminder.mjs'), 'utf8'), toml = fs.readFileSync(path.join(repo, 'netlify.toml'), 'utf8'), bundle = fs.existsSync(path.join(repo, 'netlify', 'functions', 'hours-reminder.mjs')) ? fs.readFileSync(path.join(repo, 'netlify', 'functions', 'hours-reminder.mjs'), 'utf8') : '';
  ok('the timer: hourly in netlify.toml, bundled, reads the app\'s settings file, writes ONLY its own state file, rings Eric\'s own devices', /\[functions\."hours-reminder"\]\s*\n\s*schedule = "0 \* \* \* \*"/.test(toml) && bundle.length > 50000 && /Time to look at the crew/.test(bundle) && /off-week/.test(bundle) && /hours-reminder\.json/.test(fn) && (fn.match(/files\/upload/g) || []).length === 1 && /path: STATE/.test(fn) && /sendToAll\(WORDS\.title, WORDS\.body, 'hours'\)/.test(fn) && !/entries\.json|pending\.json|crew-hours\.json/.test(fn));

  console.log('— 📱 the app —');
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
  await page.goto(appUrl); await page.waitForTimeout(700);
  await page.evaluate(() => {
    jobs = ['Oak House']; crew = ['Phil']; entries = []; window.scheduleSave = () => {}; closePanels(); renderAll();
    dbx.refreshToken = 'test-token'; window._dbxFiles = {}; window._ups = []; window._lists = 0; window._found = [];
    window.dbxDownload = async p => { const v = window._dbxFiles[p]; return typeof v === 'string' ? v : null; };
    window.dbxUpload = async (p, body) => { window._ups.push(p); window._dbxFiles[p] = body; return { path_display: p, content_hash: 'h' + _ups.length }; };
    window.dbxPathExists = async p => Object.prototype.hasOwnProperty.call(window._dbxFiles, p);
    window.dbxList = async () => { window._lists++; return { entries: window._found }; };
    window._said = []; const t0 = window.toast; window.toast = (m, g) => { if (m) _said.push(String(m)); return t0(m, g); };
    window._period = (ppe, extra) => ({ ppe, name: 'x.xlsx', people: [{ n: 'Alder, Ann', f: 'Ann', g: 'L3', lines: [{ p: 'O - Pine Cabin', s: '5A3 - Framing', h: [0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }] }], ok: {}, notes: [], mine: [], hist: [], ...extra });
    window._rem = () => JSON.parse(_dbxFiles[CH_REM_PATH()] || 'null');
  });

  ok('he asked for a reminder, so the first time the window opens it is turned ON — every week, Fridays at 8 am — written to App Data/hours-reminder.json and SAID in words', await page.evaluate(async () => {
    _said.length = 0; await openCrewHours(); await new Promise(r => setTimeout(r, 120));
    const r = _rem(), box = ($('chRem') || {}).textContent || '';
    return !!r && r.on === true && r.every === 1 && r.day === 5 && r.at === 8 && /Reminder ON — a push every Friday at 8 am/.test(_said.join(' ')) && /REMINDER — a push to your phone/.test(box) && /✓ EVERY WEEK/.test(box) && $('chRemDay').value === '5' && $('chRemAt').value === '8' && /no names, no numbers/.test(box) && /Setup → 🔔 Notifications/.test(box);
  }));
  ok('his to change: the day, the hour, every 2 weeks (it counts from the newest pay period\'s Saturday — and says so when there is none), and OFF', await page.evaluate(async () => {
    const wait = () => new Promise(r => setTimeout(r, 60));
    $('chRemDay').value = '1'; $('chRemDay').onchange(); await wait(); $('chRemAt').value = '6'; $('chRemAt').onchange(); await wait();
    const a = _rem().day === 1 && _rem().at === 6 && /Reminder: every week — Mondays at 6 am/.test(_said.join(' '));
    _said.length = 0; chRemSet('mode', 2); await wait(); const b = _rem().every === 1 && /counts from a pay period — bring one in first/.test(_said.join(' '));
    chStore().periods['2026-10-10'] = _period('2026-10-10'); chRemSet('mode', 2); await wait();
    const c = _rem().every === 2 && _rem().anchor === '2026-10-10' && /✓ EVERY 2 WEEKS/.test($('chRem').textContent) && /rings the week right after a pay period ends/.test($('chRem').textContent);
    _said.length = 0; chRemSet('mode', 0); await wait();
    const d = _rem().on === false && /Reminder OFF/.test(_said.join(' ')) && /✓ OFF/.test($('chRem').textContent) && !$('chRemDay') && /still shows a count/.test($('chRem').textContent);
    chRemSet('mode', 1); await wait();
    return a && b && c && d && _rem().on === true && _rem().every === 1;
  }));
  ok('a setting that is already there is READ, never reset to the default', await page.evaluate(async () => {
    _dbxFiles[CH_REM_PATH()] = JSON.stringify({ on: false, every: 1, day: 3, at: 7 }); const n = _ups.length; _chRem = null;
    closeReview(); await openCrewHours(); await new Promise(r => setTimeout(r, 120));
    return _ups.length === n && _rem().on === false && _rem().day === 3 && /✓ OFF/.test($('chRem').textContent);
  }));
  ok('the 👷 Crew portal plate wears a COUNT of what waits for him — a period to approve, one to send, a new file in Dropbox — and nothing when all is sent', await page.evaluate(async () => {
    const S = chStore(); S.periods = { '2026-10-10': _period('2026-10-10'), '2026-09-26': _period('2026-09-26', { apAt: '2026-09-28' }), '2026-09-12': _period('2026-09-12', { apAt: 'x', sentAt: 'y' }), '2026-08-29': _period('2026-08-29', { apAt: 'x', sentAt: 'y', paidAt: 'z' }) };
    _chFound = []; chBadge(); const a = $('scCrewN').textContent === '2' && /2 waiting in crew hours/.test($('scCrewN').getAttribute('aria-label'));
    _found = [{ '.tag': 'file', name: 'Clore-PPE-2026-10-24.xlsx', path_lower: '/x', content_hash: 'new', server_modified: '2026-10-26T00:00:00Z' }]; await chScan(); const b = $('scCrewN').textContent === '3';
    S.periods = { '2026-09-12': _period('2026-09-12', { apAt: 'x', sentAt: 'y' }) }; _found = []; await chScan(); const c = $('scCrewN').textContent === '' && getComputedStyle($('scCrewN')).display === 'none';
    return a && b && c && $('scCrewN').closest('.sc-btn').textContent.includes('Crew portal');
  }));
  ok('when the app opens it looks in the Dropbox folder at most once every six hours', await page.evaluate(async () => {
    localStorage.removeItem('daylog-chscan-at'); _lists = 0; await chBoot(); const a = _lists === 1; await chBoot(); const b = _lists === 1;
    localStorage.setItem('daylog-chscan-at', String(Date.now() - 7 * 3600e3)); await chBoot();
    return a && b && _lists === 2;
  }));
  ok('the hook rides the Dropbox pull once a session, and nothing on the phone runs off the page', /if \(!window\._chBooted\) \{ window\._chBooted = true; chBoot\(\); \} else chBadge\(\);/.test(src) && await page.evaluate(() => $('revBox').scrollWidth <= $('revBox').clientWidth + 1 && document.documentElement.scrollWidth <= document.documentElement.clientWidth));
  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v7.01') && document.querySelector('footer').textContent.includes(APP_VER);
  }));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  const ctx2 = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const p2 = await ctx2.newPage();
  await p2.addInitScript(() => { try { localStorage.setItem('daylog-crew-name', 'Phil'); } catch (e) {} });
  await p2.goto(appUrl); await p2.waitForTimeout(700);
  ok('a CREW phone writes no reminder, reads none, looks in no folder and wears no count', await p2.evaluate(async () => {
    window._ups = []; window._reads = 0; window.dbxUpload = async p => { _ups.push(p); return {}; }; window.dbxDownload = async () => { _reads++; return null; }; window.dbxList = async () => { _reads++; return { entries: [] }; }; window.dbxPathExists = async () => { _reads++; return false; };
    dbx.refreshToken = 'tok'; await chRemLoad(); chRemSet('mode', 1); await chBoot(); await new Promise(r => setTimeout(r, 80));
    const el = document.getElementById('scCrewN');
    return CREW_NAME === 'Phil' && _ups.length === 0 && _reads === 0 && (!el || el.textContent === '') && chRemHtml() === '';
  }));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
