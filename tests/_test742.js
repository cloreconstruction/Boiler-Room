// 🔔 v7.42 — THE ALERTS SAY WHERE THEY COME FROM. Eric, with a picture of ⚙ Setup → Notifications: "its a little unclear where the
// notification alerts are coming from. maybe a now note can have the ! with triangle around it so that we know if we hit that when
// unlocking it it'll push a notification. or suggestions to make this more clear; small text explanation under each? what does off
// but only urgen mean? all of the email and bill spotted are off? but still only rings during the set hours right?" Every alert
// is a row: its switch, what sets it off, who sends it, and what it will do right now, in words. And the v7.39 cut-off line is
// mended: the personal-names box in Setup fills again. Every name and value here is made up.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { fileURLToPath } = require('url');
(async () => {
  const appUrl = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const repo = path.dirname(fileURLToPath(appUrl));
  const src = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const errs = [];
  const open = async (init) => { const c = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }); await c.route(u => !/^file:/.test(u.href), r => r.abort()); if (init) await c.addInitScript(init); const p = await c.newPage(); p.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); }); await p.goto(appUrl); await p.waitForTimeout(700); return { ctx: c, page: p }; };
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };

  console.log('— 📱 Eric\'s phone —');
  const eric = await open();
  const page = eric.page;
  await page.evaluate(() => {
    window.scheduleSave = () => {}; window.savePendingSoon = () => {};
    entries = []; todos = []; jobs = ['Oak House']; crew = ['Phil']; nextId = 100; renderJobSelects(); closePanels(); renderAll();
    prefs.pushWin = null; prefs.pushKinds = null; prefs.pushUrgent = false; prefs.pushSecret = ''; prefs.personalFolks = ['Ann', 'Bo'];
    dbx.refreshToken = 'tok'; window._up = {}; window.dbxUpload = async (p, body) => { _up[p] = body; return {}; }; window.dbxDownload = async () => null;
    window._said = []; const t0 = window.toast; window.toast = (m, g) => { _said.push(String(m)); return t0(m, g); };
    _mailRulesLast = '';
  });
  const rows = () => page.evaluate(() => [...document.querySelectorAll('#ntBox .nt-row')].map(r => ({ k: r.dataset.kind, sw: r.querySelector('.nt-sw').textContent.replace(/\s+/g, ' ').trim(), on: r.querySelector('.nt-sw').getAttribute('aria-pressed') === 'true',
    what: (r.querySelector('.nt-what') || {}).textContent || '', from: (r.querySelector('.nt-from') || {}).textContent || '', st: (r.querySelector('.nt-state') || {}).textContent || '', cls: (r.querySelector('.nt-state') || {}).className || '' })));
  const row = async k => (await rows()).find(r => r.k === k) || {};

  ok('🔒 Setup opens with the personal-names box FILLED again (a v7.39 note had landed mid-line and cut that code off)', await page.evaluate(() => {
    openPanel('settings'); const v = $('sPersonal').value;
    return v === 'Ann, Bo';
  }) && /renderPushSetup\(\); if \(\$\('sPushSec'\)\) \$\('sPushSec'\)\.value = prefs\.pushSecret \|\| ''; if \(\$\('sPersonal'\)\) \$\('sPersonal'\)\.value = personalFolks\(\)\.join\(', '\);/.test(src));

  ok('every alert is a ROW: its switch in words, what sets it off, who sends it, and what it will do right now — five of them on his phone', await (async () => {
    const r = await rows();
    return r.length === 5 && r.map(x => x.k).join('|') === 'text|crew|bill|weather|mail' && r.every(x => /^(✓ ON|○ OFF) — /.test(x.sw) && /^Sets it off: /.test(x.what) && /Sent by/.test(x.from) && /[A-Za-z]{3,}/.test(x.st) && /^[✓○🔕⚠]/u.test(x.st));
  })(), JSON.stringify(await rows()).slice(0, 600));
  ok('the crew\'s alert wears the ⚠ of the plate that sends it, and says so: a crew member unlocks a note in ⑤ UNLOCK IT and taps ⚠ Needs attention', await (async () => {
    const c = await row('crew');
    return /^✓ ON — ⚠ From the crew/.test(c.sw) && /⑤ UNLOCK IT/.test(c.what) && /⚠ Needs attention \(urgent\)/.test(c.what) && /answers a ⚠ note of yours \(not urgent\)/.test(c.what) && /crew member's phone, when they tap SEND/.test(c.from);
  })());
  ok('where each one comes from: a text, a bill and the weather are sent by Boiler Room on one of his devices; an important email by the cloud every 15 minutes, the app closed or not', await (async () => {
    const r = await rows(), g = k => r.find(x => x.k === k);
    return ['text', 'bill', 'weather'].every(k => /Sent by Boiler Room, on whichever of your devices has it open/.test(g(k).from)) && /Sent by the cloud, every 15 minutes — the app can be closed/.test(g('mail').from);
  })());
  ok('with no push secret on the phone the page says which ones CANNOT RING YET (a text, the crew, a bill, the weather) and which can (the email, in his hours) — and the box to paste it is right there, with where to find it', await (async () => {
    const r = await rows(), g = k => r.find(x => x.k === k), t = await page.evaluate(() => $('ntBox').textContent.replace(/\s+/g, ' '));
    return ['text', 'crew', 'bill', 'weather'].every(k => /^⚠ CANNOT RING YET — the push secret is not on this phone/.test(g(k).st) && /cant/.test(g(k).cls)) && /^✓ RINGS 7 AM – 8 PM$/.test(g('mail').st) && /rings/.test(g('mail').cls)
      && await page.evaluate(() => !!$('ntSecret') && $('ntSecret').type === 'password') && /push secret is not on this phone yet/.test(t) && /Site configuration → Environment variables → PUSH_SECRET/.test(t);
  })());
  ok('pasting the secret there saves it (the Crew box shows the same), the rows turn to ✓ RINGS in his hours, the settings go up to the cloud door — and the secret itself is never printed on the page', await (async () => {
    await page.evaluate(() => { const b = $('ntSecret'); b.value = '  made-up-secret-xyz  '; b.dispatchEvent(new Event('change')); });
    await page.waitForTimeout(1100);
    const r = await rows(), g = k => r.find(x => x.k === k);
    return await page.evaluate(() => prefs.pushSecret === 'made-up-secret-xyz' && $('sPushSec').value === 'made-up-secret-xyz' && !$('ntSecret') && /✓ The push secret is on this phone/.test($('ntBox').textContent) && /Change the push secret/.test($('ntBox').textContent)
        && !/made-up-secret-xyz/.test($('ntBox').innerHTML) && !!_up[DBX_ROOT + '/App Data/push-settings.json'] && !/made-up-secret-xyz/.test(_up[DBX_ROOT + '/App Data/push-settings.json']))
      && /^✓ RINGS 7 AM – 8 PM$/.test(g('text').st) && /^✓ RINGS 7 AM – 8 PM$/.test(g('bill').st) && /^✓ RINGS 7 AM – 8 PM · the crew phones get the secret when you tap 📤/.test(g('crew').st);
  })());
  ok('⚠ Only the urgent ones says what it does in BOTH states, and names the urgent things: OFF = everything switched on rings; ON = only a text that needs you, a crew ⚠ note, a bill past due', await (async () => {
    const off = await page.evaluate(() => ({ b: document.querySelector('#ntBox .nt-urg').textContent.trim(), t: $('ntBox').textContent.replace(/\s+/g, ' ') }));
    await page.evaluate(() => document.querySelector('#ntBox .nt-urg').click());
    const on = await page.evaluate(() => ({ b: document.querySelector('#ntBox .nt-urg').textContent.trim(), p: document.querySelector('#ntBox .nt-urg').getAttribute('aria-pressed'), u: prefs.pushUrgent }));
    return off.b === '○ OFF — everything switched on above rings' && /Urgent means: 🔥 a text that needs you · ⚠ a crew note sent with ⚠ Needs attention · 💳 a bill past its due date/.test(off.t) && /an email, a weather warning, a crew member's answer and a bill that is not late stay quiet/.test(off.t)
      && on.b === '✓ ON — only the urgent ones ring' && on.p === 'true' && on.u === true;
  })());
  ok('with it ON the rows answer his question: the email and the weather read 🔕 QUIET, a bill rings only when it is past due, the crew only for a ⚠ note, a text still rings — and his hours still apply', await (async () => {
    const r = await rows(), g = k => r.find(x => x.k === k), t = await page.evaluate(() => $('ntBox').textContent.replace(/\s+/g, ' '));
    return /^🔕 QUIET — ⚠ Only the urgent ones is on$/.test(g('mail').st) && /^🔕 QUIET/.test(g('weather').st) && /^✓ RINGS 7 AM – 8 PM — only for a bill past its due date$/.test(g('bill').st) && /^✓ RINGS 7 AM – 8 PM — only for a ⚠ Needs attention note/.test(g('crew').st) && /^✓ RINGS 7 AM – 8 PM$/.test(g('text').st)
      && /Your hours still apply either way — nothing rings outside 7 AM to 8 PM\./.test(t) && /outside that, nothing rings, urgent or not/.test(t);
  })());
  ok('the rule agrees with the words: with only-urgent on, inside his hours, a weather warning and a bill that is not late are held, an overdue bill and a text go', await page.evaluate(() => {
    const h = new Date().getHours(); prefs.pushWin = { from: h, to: (h + 1) % 24 };
    const r = pushAllowed('weather', false).ok === false && pushAllowed('bill', false).ok === false && pushAllowed('bill', true).ok === true && pushAllowed('text', true).ok === true && mailQuietRule().from === '00:00' && mailQuietRule().to === '24:00';
    prefs.pushWin = null; return r;
  }));
  ok('a switch turned off reads ○ OFF — never rings; ☀ All day makes the rest read ✓ RINGS at any hour', await (async () => {
    await page.evaluate(() => { document.querySelector('#ntBox .nt-urg').click(); [...document.querySelectorAll('#ntBox .nt-row')].find(r => r.dataset.kind === 'weather').querySelector('.nt-sw').click(); });
    const w = await row('weather');
    await page.evaluate(() => ntAllDay());
    const r = await rows(), g = k => r.find(x => x.k === k), t = await page.evaluate(() => $('ntBox').textContent.replace(/\s+/g, ' '));
    await page.evaluate(() => { prefs.pushWin = null; prefs.pushKinds = null; renderPushSetup(); });
    return /^○ OFF — 🌧 A weather warning$/.test(w.sw) && w.st === '○ OFF — never rings' && g('text').st === '✓ RINGS at any hour' && g('mail').st === '✓ RINGS at any hour' && /Alerts ring at any hour\./.test(t) && /Your hours still apply either way\./.test(t);
  })());
  ok('the top line says whether THIS phone is signed up to ring at all, in words', await page.evaluate(() => { const p = document.querySelector('#ntBox .nt-phone'); return !!p && /^[✓○⚠]/u.test(p.textContent) && /This phone|This browser|Notifications are blocked/.test(p.textContent); }));
  // 👷 v7.47 — the crew's phones can be rung now, so the words changed: ⚠ rings them (each in his own hours) once the secret is in
  ok('⑤ UNLOCK IT on his phone says what ⚠ does: it stays up big on their page and rings their phones — or says the bell waits on the push secret', await page.evaluate(() => { closePanels(); renderVisChips(); const t = $('visExplain').textContent;
    return (prefs.pushSecret ? /⚠ stays up big on their page until somebody answers and rings their phones, each in his own hours\./ : /⚠ stays up big on their page until somebody answers \(their phones ring once the push secret is in/).test(t) && !/cannot ring their phone yet/.test(t); }));
  ok('nothing in the section depends on colour alone: every state leads with a glyph and says itself in words', await page.evaluate(() => { openPanel('settings'); return [...document.querySelectorAll('#ntBox .nt-state, #ntBox .nt-phone')].every(e => /^[✓○🔕⚠]/u.test(e.textContent.trim()) && /[A-Za-z]{4,}/.test(e.textContent)) && [...document.querySelectorAll('#ntBox .pick-chip')].every(b => /[A-Za-z]{3,}/.test(b.textContent)); }));
  ok('at 390px nothing in the section runs off the side', await page.evaluate(() => { const b = $('ntBox').getBoundingClientRect(); return [...document.querySelectorAll('#ntBox *')].every(e => { const r = e.getBoundingClientRect(); return r.width === 0 || r.right <= b.right + 1; }); }));
  await eric.ctx.close();

  console.log('— 👷 Phil\'s phone —');
  const phil = await open(() => { try { localStorage.setItem('daylog-crew-name', 'Phil'); localStorage.setItem('daylog-crew-root', '/Phil'); localStorage.setItem('daylog-crew-jobs', JSON.stringify(['Oak House'])); } catch (e) {} });
  // 👷 v7.47 — a crew phone rings now: six rows on a field phone (nine on an office one — _test747), each saying in words what it
  // will do; in this test browser the phone is not signed up, and every row says so
  ok('a crew phone: six rows of its own (Eric needs an answer wears the ⚠ and leads), every one says in words that this phone is not signed up yet, no push-secret box, and the foot says it rings by its own hours and switches', await phil.page.evaluate(() => {
    window.scheduleSave = () => {}; renderPushSetup();
    const rs = [...document.querySelectorAll('#ntBox .nt-row')], t = $('ntBox').textContent.replace(/\s+/g, ' ');
    return CREW_NAME === 'Phil' && rs.length === 6 && rs.map(r => r.dataset.kind).join('|') === 'ask|eric|reply|board|card|plans' && /✓ ON — ⚠ Eric needs an answer/.test(t) && /✓ ON — 📨 From Eric/.test(t)
      && rs.every(r => /^○ NOT YET — this phone is not signed up \(Turn on notifications, above\)$/.test(r.querySelector('.nt-state').textContent)) && rs.every(r => /Sent by Eric's phone/.test(r.querySelector('.nt-from').textContent))
      && !$('ntSecret') && !/push secret/i.test(t) && /This phone rings by YOUR hours and YOUR switches/.test(t) && !/nothing rings this phone yet/.test(t) && /Urgent means: ⚠ a note Eric sent with ⚠ Needs attention\./.test(t);
  }));
  ok('⑤ UNLOCK IT on a crew phone WITHOUT the secret: ⚠ pins it at the top of Eric\'s page — it does not claim to ring him', await phil.page.evaluate(() => { renderVisChips(); const t = $('visExplain').textContent; return /⚠ pins it at the top of Eric's page until it is answered\./.test(t) && !/rings his phone/.test(t); }));
  await phil.ctx.close();
  const phil2 = await open(() => { try { localStorage.setItem('daylog-crew-name', 'Phil'); localStorage.setItem('daylog-crew-root', '/Phil'); localStorage.setItem('daylog-crew-jobs', JSON.stringify(['Oak House'])); localStorage.setItem('daylog-push-secret', 'made-up'); } catch (e) {} });
  ok('…and WITH the secret handed over: ⚠ pins it at the top of Eric\'s page and rings his phone, in his hours', await phil2.page.evaluate(() => { renderVisChips(); return /⚠ pins it at the top of Eric's page until it is answered and rings his phone, in his hours\./.test($('visExplain').textContent); }));
  await phil2.ctx.close();

  ok('version bumped — APP_VER and the footer agree', /const APP_VER = 'v7\.(4[2-9]|[5-9]\d)'/.test(src) && new RegExp('<footer>' + (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1].replace('.', '\\.') + ' ·').test(src));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
