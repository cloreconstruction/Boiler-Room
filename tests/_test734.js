// v7.34 — Eric, with a picture of one note drawn five times (you → Shevaun, you → Milo, you → Aaron…): "whats happening? why is
// it sending to all crew separately?" A note to 🔓 All crew rode out ONCE, but WITH THE CREW drew it once per man. One row per
// note now; the thread under it names who responded and who flushed. Names, jobs and words made up.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { fileURLToPath } = require('url');
(async () => {
  const appUrl = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const repo = path.dirname(fileURLToPath(appUrl));
  const src = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await ctx.route(u => !/^file:/.test(u.href), r => r.abort());
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
  await page.goto(appUrl); await page.waitForTimeout(700);
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };

  await page.evaluate(async () => {
    window.scheduleSave = () => {}; window.savePendingSoon = () => {}; window.setAck = () => {}; window.publishSharedNotes = async () => {};
    entries = []; todos = []; pendingQueue = []; jobs = ['Oak House']; crew = ['Phil', 'Nathan', 'Aaron']; prefs.office = ['Phil']; prefs.crewCfg716 = true; prefs.crewFeedGone = []; prefs.thSeen = {}; nextId = 100;
    renderJobSelects(); closePanels(); renderAll(); dbx.refreshToken = 'tok';
    window._said = []; const t0 = window.toast; window.toast = (m, g) => { if (m) _said.push(String(m)); return t0(m, g); };
    const m = n => new Date(Date.now() - n * 60000), iso = n => m(n).toISOString();
    entries = [
      { id: 5, ts: m(120), type: 'Note', details: 'Move the container Tuesday, then cut the top off that bush', job: 'Oak House', vis: 'crew', ask: true, heads: true, board: { p: 3, sub: [], at: iso(120) } },
      { id: 6, ts: m(90), type: 'Note', details: 'Phil, call the inspector back', job: 'Oak House', vis: 'Phil', ask: true }];
    const phil = [{ id: 30, ts: iso(60), type: 'Note', details: '↩ Chase is on it', job: 'Oak House', vis: 'Eric', re: { owner: 'Eric', id: 5 } },
      { id: 31, ts: iso(40), type: 'Note', details: '↩ Will do', job: 'Oak House', vis: 'Eric', re: { owner: 'Eric', id: 6 } }];
    const nathan = [{ id: 40, ts: iso(30), type: 'Note', details: '↩ I can cut the bush Monday', job: 'Oak House', vis: 'Eric', re: { owner: 'Eric', id: 5 } },
      { id: 41, ts: iso(20), type: 'Note', details: 'Eric: Move the container Tuesday, then cut the top off that bush\n↩ Phil: Chase is on it\n↩ Nathan: I can cut the bush Monday', job: 'Oak House', sharedRef: 5, who: 'Eric' }];
    window._files = { '/clore daylog/crew/phil/app data/entries.json': JSON.stringify({ entries: phil }), '/clore daylog/crew/nathan/app data/entries.json': JSON.stringify({ entries: nathan }), '/clore daylog/crew/aaron/app data/entries.json': JSON.stringify({ entries: [] }) };
    window.dbxList = async () => ({ entries: ['Phil', 'Nathan', 'Aaron'].map(n => ({ '.tag': 'folder', name: n, path_lower: '/clore daylog/crew/' + n.toLowerCase(), path_display: '/Clore DayLog/Crew/' + n })) });
    window.dbxDownload = async p => window._files[p] ?? null;
    await checkCrewLogs(); renderCrewFeed();
  });
  const rows = () => page.evaluate(() => [...document.querySelectorAll('#crewFeedList .sum-row')].map(r => r.textContent.replace(/\s+/g, ' ').trim()));
  ok('a note to 🔓 All crew is ONE row — "you → the crew" — not one per man; the note to Phil alone is one row "you → Phil"; the card reads WITH THE CREW', await page.evaluate(() => {
    const own = [...document.querySelectorAll('#crewFeedList .th-own')].map(r => r.textContent.replace(/\s+/g, ' '));
    return own.length === 2 && own.filter(t => /Move the container/.test(t)).length === 1 && /you → the crew/.test(own.find(t => /Move the container/.test(t))) && /you → Phil/.test(own.find(t => /call the inspector/.test(t))) && /👷 WITH THE CREW — /.test($('cfFoldBtn').textContent);
  }), JSON.stringify(await rows()));
  ok('under the crew-wide note: every man\'s response with his name (↩ Phil, ↩ Nathan); cube ① lit and pulsing, the words name them both; cube ② lit and the words say who flushed it (Nathan); the ask is closed by the first response', await page.evaluate(() => {
    const row = [...document.querySelectorAll('#crewFeedList .th-own')].find(r => /Move the container/.test(r.textContent)), t = row.textContent.replace(/\s+/g, ' '), cubes = row.querySelectorAll('.th-cube');
    return /↩ Phil .*Chase is on it/.test(t) && /↩ Nathan .*cut the bush/.test(t) && cubes[0].classList.contains('lit') && cubes[0].classList.contains('pulse') && cubes[1].classList.contains('lit') &&
      /↩ Phil, Nathan responded — new/.test(t) && /⚙ Nathan took it to the grinder/.test(t) && !!entries.find(e => e.id === 5).askDone && !/NEEDS THEIR ATTENTION/.test(t);
  }), await page.evaluate(() => [...document.querySelectorAll('#crewFeedList .th-own')].map(r => r.textContent.replace(/\s+/g, ' ')).join(' || ')));
  ok('💬 Respond on the crew-wide note: the reply is unlocked for the WHOLE crew (vis crew), attached to the note; the toast says the crew', await page.evaluate(async () => {
    const row = [...document.querySelectorAll('#crewFeedList .th-own')].find(r => /Move the container/.test(r.textContent));
    [...row.querySelectorAll('button')].find(b => /💬 Respond/.test(b.textContent)).click();
    $('thT-Eric-5').value = 'Monday works, thanks'; _said.length = 0; document.querySelector('#thBox-Eric-5 .th-send').click(); await new Promise(r => setTimeout(r, 50));
    const e = entries.find(x => x.details === '↩ Monday works, thanks');
    return !!e && e.vis === 'crew' && e.re && e.re.owner === 'Eric' && e.re.id === 5 && _said.some(m => /↩ Sent to the crew/.test(m));
  }), await page.evaluate(() => JSON.stringify({ e: entries.slice(0, 1), said: _said })));
  ok('…and a reply on the note to Phil alone goes to Phil alone', await page.evaluate(async () => {
    const row = [...document.querySelectorAll('#crewFeedList .th-own')].find(r => /call the inspector/.test(r.textContent));
    [...row.querySelectorAll('button')].find(b => /💬 Respond/.test(b.textContent)).click();
    $('thT-Eric-6').value = 'Before noon'; document.querySelector('#thBox-Eric-6 .th-send').click(); await new Promise(r => setTimeout(r, 50));
    const e = entries.find(x => x.details === '↩ Before noon');
    return !!e && e.vis === 'Phil' && e.re.id === 6;
  }));
  ok('⤵ Flush — done with it on the crew-wide note takes it off the card at once (waiting for every man would keep it forever); the note to Phil alone stays after Eric\'s flush until Phil flushes it too', await page.evaluate(async () => {
    thOwnFlush('5'); thOwnFlush('6'); await new Promise(r => setTimeout(r, 40));
    const own = [...document.querySelectorAll('#crewFeedList .th-own')].map(r => r.textContent.replace(/\s+/g, ' '));
    const gone5 = !own.some(t => /Move the container/.test(t)), stays6 = own.some(t => /call the inspector/.test(t) && /⚙ you are done with it ✓/.test(t));
    window._files['/clore daylog/crew/phil/app data/entries.json'] = JSON.stringify({ entries: [{ id: 31, ts: new Date().toISOString(), type: 'Note', details: '↩ Will do', job: 'Oak House', vis: 'Eric', re: { owner: 'Eric', id: 6 } }, { id: 32, ts: new Date().toISOString(), type: 'Note', details: 'Eric: Phil, call the inspector back\n↩ Phil: Will do', job: 'Oak House', sharedRef: 6, who: 'Eric' }] });
    await checkCrewLogs(); renderCrewFeed();
    const own2 = [...document.querySelectorAll('#crewFeedList .th-own')].map(r => r.textContent.replace(/\s+/g, ' '));
    return gone5 && stays6 && !own2.some(t => /call the inspector/.test(t));
  }), JSON.stringify(await rows()));
  ok('the person wheel never lists "crew" as a person', await page.evaluate(() => ![...document.querySelectorAll('#crewFeedList select option')].some(o => /^crew$/i.test(o.textContent.trim()))));
  ok('version bumped — APP_VER and the footer agree', /const APP_VER = 'v7\.(3[4-9]|[4-9]\d)'/.test(src) && new RegExp('<footer>' + (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1].replace('.', '\\.')).test(src));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
