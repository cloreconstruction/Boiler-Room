// 🧹 v6.87 — CLEAR THE POCKET LEFTOVERS. Eric, looking at 18 rows under 🎒 POCKET — not done, each with only
// "↩ Pocket it for tomorrow": "i need a way to clear these: add them back onto todays list, tomorrows, or check them as
// done or no longer relevant".
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
    jobs = ['Mery', 'Hertz', 'Personal']; curJob = ''; crew = ['Phil']; entries = []; todos = []; nextId = 1; pendingQueue = []; prefs.pocket = []; prefs.pocketMax = 8;
    window.scheduleSave = () => {}; window.savePendingSoon = () => {}; window.publishSharedNotes = () => {};
    lsSet('daylog-revtab', ''); renderJobSelects(); closePanels(); renderAll();
    const ago = d => { const x = new Date(); x.setDate(x.getDate() - d); x.setHours(8, 0, 0, 0); return x; };
    const add = (details, extra) => addEntry('Note', details, '—', { noSniff: true, tags: ['pocket'], ...extra });
    window._e = {};
    _e.doors = add('🎒 Not done — check on the doors', { pocket: 'swept', ts: ago(0) });
    _e.cody = add('🎒 Flushed — text Cody the roof numbers', { pocket: 'flushed', ts: ago(0) });
    _e.tools = add('🎒 Overflow — tools for the crew', { pocket: 'over', ts: ago(1) });
    _e.old3 = add('🎒 Not done — license renewal', { pocket: 'swept', ts: ago(3) });
    _e.touched = add('🎒 Not done — get the timeline done', { pocket: 'swept', ts: ago(2), board: { p: 3, done: '', by: '', sub: [], at: new Date().toISOString() } });
    _e.aged = add('🎒 Not done — from three weeks back', { pocket: 'swept', ts: ago(20) });
    _e.mine = add('🎒 Not done — a private thing', { pocket: 'swept', ts: ago(0), personal: true });
    _e.bdone = add('🎒 Not done — already ticked on the board', { pocket: 'swept', ts: ago(1), board: { p: 0, done: new Date().toISOString(), by: 'Eric', sub: [], at: new Date().toISOString() } });
  });
  const pk = () => page.evaluate(() => document.querySelector('.rev-sec-body[data-sec="pocket"]').textContent.replace(/\s+/g, ' '));

  console.log('— 🧹 v6.87 every leftover has four ways out —');

  ok('the heading lists every leftover still waiting — even on TODAY a three-day-old one is there — and never a personal one, a board-✓ one, or one past 14 days', await page.evaluate(() => {
    _sumSpan = 'today'; _sumSec = 'pocket'; openReview('summary');
    const t = document.querySelector('.rev-sec-body[data-sec="pocket"]').textContent.replace(/\s+/g, ' ');
    const head = document.querySelector('.rev-sec[data-sec="pocket"]').textContent;
    return /check on the doors/.test(t) && /text Cody/.test(t) && /tools for the crew/.test(t) && /license renewal/.test(t) && /get the timeline done/.test(t) &&
      !/three weeks back/.test(t) && !/a private thing/.test(t) && !/already ticked/.test(t) && /5/.test(head) && pocketLeftList().length === 5;
  }));
  ok('each row wears four plates in words — ↩ Today · ➡ Tomorrow · ✓ Done · ✕ Not needed — a finger tall, and nothing runs off the phone', await page.evaluate(() => {
    const rows = [...document.querySelectorAll('.rev-sec-body[data-sec="pocket"] .pk-acts')];
    const words = rows.map(r => [...r.querySelectorAll('button')].map(b => b.textContent.replace(/\s+/g, ' ').trim().replace(/^(\S)\s*(?=\S)/, '$1 ')).join('|'));   // v6.91 — an icon over its word now: "↩" + "Today"
    const tall = [...rows[0].querySelectorAll('button')].every(b => b.getBoundingClientRect().height >= 40);
    const box = $('revBox');
    return rows.length === 5 && words.every(w => w === '↩ Today|➡ Tomorrow|✓ Done|✕ Not needed') && tall && box.scrollWidth <= box.clientWidth + 1;
  }));

  console.log('— ↩ back onto the list —');

  ok('↩ Today puts it on TODAY\'s pocket, ➡ Tomorrow on tomorrow\'s; the note turns "back", leaves the heading and the board; a touched line keeps its cubes', await page.evaluate(() => {
    const tap = (re, word) => [...document.querySelectorAll('.rev-sec-body[data-sec="pocket"] .sum-line')].find(l => re.test(l.textContent)).querySelector('.pk-acts').querySelectorAll('button')[word].click();
    tap(/check on the doors/, 0);
    const a = pocket()[0].t === 'check on the doors' && pocket()[0].day === pocketDay(0) && _e.doors.pocket === 'back' && /today's pocket/.test($('toast').textContent);
    tap(/text Cody/, 1);
    const b = pocket()[0].t === 'text Cody the roof numbers' && pocket()[0].day === pocketDay(1) && _e.cody.pocket === 'back' && /tomorrow's pocket/.test($('toast').textContent);
    tap(/get the timeline done/, 1);
    const c = pocket()[0].t === 'get the timeline done' && pocket()[0].p === 3 && _e.touched.pocket === 'back' && !boardOn(_e.touched) && !boardLines().some(l => l.k === 'e' && String(l.id) === String(_e.touched.id));
    const t = document.querySelector('.rev-sec-body[data-sec="pocket"]').textContent;
    return a && b && c && !/check on the doors|text Cody|timeline/.test(t) && pocketLeftList().length === 2 && /check on the doors/.test($('pocketList').textContent);
  }));
  ok('a FULL pocket refuses in words and leaves the leftover where it is — nothing gets bounced back out as a new leftover', await page.evaluate(() => {
    prefs.pocketMax = 3;   // three are on it now
    const n = entries.length;
    [...document.querySelectorAll('.rev-sec-body[data-sec="pocket"] .sum-line')].find(l => /license renewal/.test(l.textContent)).querySelector('.pk-acts button').click();
    const r = pocket().length === 3 && entries.length === n && _e.old3.pocket === 'swept' && /pocket is full \(3\/3\)/.test($('toast').textContent) && $('toast').classList.contains('bad') && pocketLeftList().length === 2;
    prefs.pocketMax = 8; return r;
  }));

  console.log('— ✓ done, ✕ not needed —');

  ok('✓ Done checks it off: the note reads "✓ …", leaves the heading and the board, the Wizard hears DONE; Undo puts it back as it was', await page.evaluate(() => {
    const line = [...document.querySelectorAll('.rev-sec-body[data-sec="pocket"] .sum-line')].find(l => /license renewal/.test(l.textContent));
    line.querySelectorAll('.pk-acts button')[2].click();
    const done = _e.old3.pocket === 'done' && _e.old3.details === '✓ license renewal' && !!_e.old3.pocketAt && !boardOn(_e.old3) && pocketLeftList().length === 1 && /checked off/.test($('toast').textContent) && /Undo/.test($('toast').innerHTML);
    const c = buildAskContext('what is left on my pocket list');
    const heard = /DONE — he checked it off his pocket list/.test(c);
    window._toastUndo();
    return done && heard && _e.old3.pocket === 'swept' && _e.old3.details === '🎒 Not done — license renewal' && !_e.old3.pocketAt && pocketLeftList().length === 2;
  }));
  ok('✕ Not needed clears it: "dropped", off the heading and the board, the log keeps the note, the Wizard hears DROPPED — not NOT DONE; Undo brings it back', await page.evaluate(() => {
    const n = entries.length;
    const line = [...document.querySelectorAll('.rev-sec-body[data-sec="pocket"] .sum-line')].find(l => /tools for the crew/.test(l.textContent));
    line.querySelectorAll('.pk-acts button')[3].click();
    const gone = _e.tools.pocket === 'dropped' && _e.tools.details === '🎒 Overflow — tools for the crew' && entries.length === n && !boardOn(_e.tools) && pocketLeftList().length === 1 && /not needed/.test($('toast').textContent);
    const c = buildAskContext('what is left on my pocket list');
    const heard = /DROPPED — he said it is no longer needed/.test(c);
    window._toastUndo();
    return gone && heard && _e.tools.pocket === 'over' && pocketLeftList().length === 2;
  }));

  console.log('— 🧹 the whole heading at once —');

  ok('the bar on top says how many; the first tap only arms it (⚠ SURE?), the second clears them all, and ONE Undo brings them all back', await page.evaluate(() => {
    const bar = () => document.querySelector('.rev-sec-body[data-sec="pocket"] .pk-bulk');
    const btn = re => [...bar().querySelectorAll('button')].find(b => re.test(b.textContent));
    const has = /All 2 at once/.test(bar().textContent) && !!btn(/All done/) && !!btn(/None needed/);
    btn(/None needed/).click();
    const armed = pocketLeftList().length === 2 && /⚠ SURE\? tap again — all 2/.test(bar().textContent) && !!btn(/All done/);
    btn(/SURE/).click();
    const cleared = pocketLeftList().length === 0 && _e.tools.pocket === 'dropped' && _e.old3.pocket === 'dropped' && /2 pocket leftovers cleared/.test($('toast').textContent) && /○ nothing/.test(document.querySelector('.rev-sec[data-sec="pocket"]').textContent);
    window._toastUndo();
    const back = pocketLeftList().length === 2 && _e.tools.pocket === 'over' && _e.old3.pocket === 'swept';
    return has && armed && cleared && back;
  }));
  ok('✓ All done works the same way, and a lone leftover has no bar — its own four plates are enough', await page.evaluate(() => {
    const bar = () => document.querySelector('.rev-sec-body[data-sec="pocket"] .pk-bulk');
    [...bar().querySelectorAll('button')].find(b => /All done/.test(b.textContent)).click();
    [...bar().querySelectorAll('button')].find(b => /SURE/.test(b.textContent)).click();
    const all = pocketLeftList().length === 0 && _e.tools.pocket === 'done' && _e.tools.details === '✓ tools for the crew' && /2 pocket leftovers checked off/.test($('toast').textContent);
    window._toastUndo();
    pocketLeftDone(_e.tools.id);
    const lone = pocketLeftList().length === 1 && !bar() && document.querySelectorAll('.rev-sec-body[data-sec="pocket"] .pk-acts').length === 1;
    closeReview(); return all && lone;
  }));

  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v6.87') && document.querySelector('footer').textContent.includes(APP_VER);
  }));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
