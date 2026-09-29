// v7.39 — 🔔 HIS HOURS AND HIS SWITCHES. Eric, 2026-09-28: "in setup under notifications (besides clients) there should be a
// time selector for: 'notifications only between these times' and also be able to turn on or off different type alerts,
// decide which ones, like 'from eric' or 'only urgent'." One rule in the app (pushOut) and at the cloud door (notify.mjs
// + push-rules.mjs), the mail sorter's quiet hours from the same window, a crew phone's own switches. Names made up.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { fileURLToPath, pathToFileURL } = require('url');
(async () => {
  const appUrl = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const repo = path.dirname(fileURLToPath(appUrl));
  const src = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const errs = [];
  const open = async (init) => { const c = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }); await c.route(u => !/^file:/.test(u.href), r => r.abort()); if (init) await c.addInitScript(init); const p = await c.newPage(); p.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); }); await p.goto(appUrl); await p.waitForTimeout(700); return { ctx: c, page: p }; };
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };

  console.log('— ☁ the cloud rule (fnsrc/push-rules.mjs, in node) —');
  const R = await import(pathToFileURL(path.join(repo, 'fnsrc', 'push-rules.mjs')).href);
  const at = h => new Date(Date.UTC(2026, 8, 28, (h + 8) % 24, 30));   // 8 hours behind UTC in Alaska, late September
  const S0 = { win: { from: 7, to: 20 }, kinds: { text: true, weather: false }, urgent: false, tz: 'America/Anchorage' };
  ok('no settings file = everything rings, as it always did', R.pushAllowed(null, 'text', true, at(3)).ok && R.pushAllowed('junk', 'weather', false, at(3)).ok);
  ok('inside his hours a text rings; at 10 PM it does not; an overnight window (8 PM–7 AM) rings at 11 PM and not at noon; from = to means all day', R.pushAllowed(S0, 'text', true, at(9)).ok && !R.pushAllowed(S0, 'text', true, at(22)).ok && R.pushAllowed(S0, 'text', true, at(19)).ok && !R.pushAllowed(S0, 'text', true, at(20)).ok &&
    R.pushAllowed({ win: { from: 20, to: 7 } }, 'text', true, at(23)).ok && !R.pushAllowed({ win: { from: 20, to: 7 } }, 'text', true, at(12)).ok && R.pushAllowed({ win: { from: 5, to: 5 } }, 'text', false, at(3)).ok);
  ok('a kind he turned off never rings; a kind he never touched does; "only urgent" lets through only what the sender marked urgent', !R.pushAllowed(S0, 'weather', false, at(9)).ok && R.pushAllowed(S0, 'bill', false, at(9)).ok &&
    !R.pushAllowed({ ...S0, urgent: true }, 'bill', false, at(9)).ok && R.pushAllowed({ ...S0, urgent: true }, 'bill', true, at(9)).ok && R.pushAllowed(S0, 'weather', false, at(9)).why === 'weather is off');
  ok('a broken window falls back to 7 AM–8 PM', !R.pushAllowed({ win: { from: 'x', to: null } }, 'text', true, at(22)).ok && R.pushAllowed({ win: { from: 'x', to: null } }, 'text', true, at(9)).ok);
  const bundle = fs.readFileSync(path.join(repo, 'netlify', 'functions', 'notify.mjs'), 'utf8');
  ok('the shipped notify function carries the rule: it reads App Data/push-settings.json and answers "skipped" with why', /push-settings\.json/.test(bundle) && /skipped/.test(bundle) && /only urgent/.test(bundle) && /outside his hours/.test(bundle));

  console.log('— 📱 Eric\'s phone —');
  const eric = await open();
  const page = eric.page;
  await page.evaluate(() => {
    window.scheduleSave = () => {}; window.savePendingSoon = () => {};
    entries = []; todos = []; jobs = ['Oak House']; crew = ['Phil']; nextId = 100; renderJobSelects(); closePanels(); renderAll();
    prefs.pushWin = null; prefs.pushKinds = null; prefs.pushUrgent = false; prefs.pushSecret = '';
    dbx.refreshToken = 'tok'; window._up = {}; window.dbxUpload = async (p, body) => { _up[p] = body; return {}; }; window.dbxDownload = async () => null;
    window._sent = []; const f0 = window.fetch; window.fetch = (u, init) => { if (/functions\/notify/.test(String(u))) { _sent.push(JSON.parse(init.body)); return Promise.resolve(new Response('{}', { status: 200 })); } return f0(u, init); };
    window._said = []; const t0 = window.toast; window.toast = (m, g) => { _said.push(String(m)); return t0(m, g); };
    _mailRulesLast = '';
  });
  ok('the two rules agree, word for word, on a table of cases', await page.evaluate(() => {
    const cases = [[{ win: { from: 7, to: 20 }, kinds: { weather: false }, urgent: false }, 'text', true, 9], [{ win: { from: 7, to: 20 } }, 'text', true, 22], [{ win: { from: 20, to: 7 } }, 'bill', false, 23], [{ win: { from: 5, to: 5 } }, 'x', false, 3], [{ kinds: { weather: false } }, 'weather', false, 9], [{ urgent: true }, 'bill', false, 9], [{ urgent: true }, 'bill', true, 9], [null, 'text', false, 2]];
    return JSON.stringify(cases.map(c => pushRule(...c)));
  }) === JSON.stringify([[S0, 'text', true, 9], [{ win: { from: 7, to: 20 } }, 'text', true, 22], [{ win: { from: 20, to: 7 } }, 'bill', false, 23], [{ win: { from: 5, to: 5 } }, 'x', false, 3], [{ kinds: { weather: false } }, 'weather', false, 9], [{ urgent: true }, 'bill', false, 9], [{ urgent: true }, 'bill', true, 9], [null, 'text', false, 2]].map(c => R.pushRule(...c))));
  ok('⚙ Setup → 🔔 Notifications draws the hours (7 AM to 8 PM to start, with ☀ All day), one switch per kind in words (✓ ON — / ○ OFF —), and ⚠ Only urgent; the old words about an evening reminder are gone', await page.evaluate(() => {
    renderPushSetup(); const t = $('ntBox').textContent.replace(/\s+/g, ' ');
    return $('ntFrom').value === '7' && $('ntTo').value === '20' && /Only between these times/.test(t) && /Alerts ring from 7 AM to 8 PM/.test(t) && /All day/.test(t) &&
      [...$('ntBox').querySelectorAll('.nt-kinds .pick-chip')].length === 5 && /✓ ON — 🔥 A text that needs you/.test(t) && /✓ ON — 📧 An important email/.test(t) && /○ OFF — ⚠ Only urgent/.test(t) &&
      !/evening reminder/.test($('setNotif').textContent) && /push secret is not on this phone yet/.test(t);
  }), await page.evaluate(() => $('ntBox').textContent.replace(/\s+/g, ' ').slice(0, 400)));
  ok('a tap on 🌧 turns it off in words and in prefs; the hours wheels set the window; the settings file and the mail rules go up to Dropbox — the sorter\'s quiet hours are the window turned inside out', await page.evaluate(async () => {
    [...$('ntBox').querySelectorAll('.nt-kinds .pick-chip')].find(b => /weather/i.test(b.textContent)).click();
    $('ntFrom').value = '6'; $('ntFrom').dispatchEvent(new Event('change')); $('ntTo').value = '21'; $('ntTo').dispatchEvent(new Event('change'));
    await new Promise(r => setTimeout(r, 1000));
    const ps = JSON.parse(_up[DBX_ROOT + '/App Data/push-settings.json'] || '{}'), mr = JSON.parse(_up[DBX_ROOT + '/App Data/mail-rules.json'] || '{}');
    return prefs.pushKinds.weather === false && /○ OFF — 🌧 A weather warning/.test($('ntBox').textContent) && prefs.pushWin.from === 6 && prefs.pushWin.to === 21 && /Alerts ring from 6 AM to 9 PM/.test($('ntBox').textContent) &&
      ps.win.from === 6 && ps.win.to === 21 && ps.kinds.weather === false && ps.urgent === false && typeof ps.tz === 'string' && mr.quiet.from === '21:00' && mr.quiet.to === '06:00' && Object.keys(mr).sort().join(',') === 'at,hush,loud,no,ok,personal,personalNames,quiet,sort,v';
  }), await page.evaluate(() => JSON.stringify({ k: prefs.pushKinds, w: prefs.pushWin, up: Object.keys(_up), mr: (_up[DBX_ROOT + '/App Data/mail-rules.json'] || '').slice(0, 200) })));
  ok('📧 off, or ⚠ only urgent, puts the mail sorter to sleep all day; ☀ All day makes it never sleep; the defaults are the 8 PM–7 AM the sorter has always assumed', await page.evaluate(() => {
    prefs.pushKinds = { mail: false }; const a = mailQuietRule();
    prefs.pushKinds = {}; prefs.pushUrgent = true; const b = mailQuietRule(); prefs.pushUrgent = false;
    prefs.pushWin = { from: 9, to: 9 }; const c = mailQuietRule();
    prefs.pushWin = null; const d = mailQuietRule();
    return a.from === '00:00' && a.to === '24:00' && b.from === '00:00' && b.to === '24:00' && c.from === '00:00' && c.to === '00:00' && d.from === '20:00' && d.to === '07:00';
  }));
  ok('pushOut: with no secret nothing goes (as ever); with it, a hot text inside his hours goes out carrying its kind and urgency; a kind he turned off does not; ⚠ only urgent stops a weather warning; outside his hours nothing goes; a push meant for the crew never rings his own devices', await page.evaluate(() => {
    const h = new Date().getHours(), r = [];
    prefs.pushSecret = ''; prefs.pushWin = { from: h, to: h }; prefs.pushKinds = {}; prefs.pushUrgent = false; _sent.length = 0;
    r.push(pushOut('text', true, '🔥 A text needs you', 'x', 'hot-text') === false && _sent.length === 0);
    prefs.pushSecret = 'made-up';
    r.push(pushOut('text', true, '🔥 A text needs you', 'It is pinned at the top of Boiler Room.', 'hot-text') === true && _sent.length === 1 && _sent[0].kind === 'text' && _sent[0].urgent === true && _sent[0].tag === 'hot-text');
    prefs.pushKinds = { text: false }; r.push(pushOut('text', true, '🔥', 'x', 'hot-text') === false && _sent.length === 1);
    prefs.pushKinds = {}; prefs.pushUrgent = true; r.push(pushOut('weather', false, '🌧', 'x', 'weather') === false && pushOut('bill', true, '💳', 'x', 'bill-due') === true && _sent.length === 2);
    prefs.pushUrgent = false; prefs.pushWin = { from: (h + 2) % 24, to: (h + 4) % 24 }; r.push(pushOut('text', true, '🔥', 'x', 'hot-text') === false && _sent.length === 2);
    prefs.pushWin = { from: h, to: h }; r.push(pushOut('ask', true, '📢 Eric needs an answer', 'x', 'crew-ask', 'crew') === false && pushOut('board', false, '📋', 'x', 'board', 'crew') === false && _sent.length === 2);
    return r.every(Boolean);
  }), await page.evaluate(() => JSON.stringify(_sent)));
  ok('every push the app sends walks through pushOut — the cloud door is called from one place only, and no push carries a note\'s own words', (src.match(/fetch\('\/\.netlify\/functions\/notify'/g) || []).length === 1 && !/body: t\.slice\(0, 140\)/.test(src) && !/body: txt\.slice\(0, 140\)/.test(src) && /pushOut\('text', true, '🔥 A text needs you'/.test(src) && /pushOut\('bill', !!overdue/.test(src) && /pushOut\('weather', false/.test(src));
  await page.evaluate(() => { prefs.pushSecret = ''; prefs.pushWin = null; prefs.pushKinds = null; prefs.pushUrgent = false; });

  console.log('— 👷 Phil\'s phone —');
  const phil = await open(() => { try { localStorage.setItem('daylog-crew-name', 'Phil'); localStorage.setItem('daylog-crew-root', '/Phil'); localStorage.setItem('daylog-crew-jobs', JSON.stringify(['Oak House'])); localStorage.setItem('daylog-push-secret', 'made-up'); } catch (e) {} });
  ok('a crew phone keeps its own switches — 📨 From Eric · 📢 Eric needs an answer · 📋 your board — and says in words that nothing rings it yet; its NOW note to Eric still goes out with its kind (Eric\'s rules are checked at the cloud door)', await phil.page.evaluate(() => {
    window.scheduleSave = () => {};
    window._sent = []; const f0 = window.fetch; window.fetch = (u, init) => { if (/functions\/notify/.test(String(u))) { _sent.push(JSON.parse(init.body)); return Promise.resolve(new Response('{}', { status: 200 })); } return f0(u, init); };
    renderPushSetup(); const t = $('ntBox').textContent.replace(/\s+/g, ' ');
    const went = pushOut('crew', true, '🔥 Phil needs it NOW', 'Open Boiler Room — it is pinned at the top.', 'crew-now');
    return CREW_NAME === 'Phil' && /✓ ON — 📨 From Eric/.test(t) && /Eric needs an answer/.test(t) && /your board/.test(t) && /nothing rings this phone yet/.test(t) && !/A text that needs you/.test(t) && went === true && _sent.length === 1 && _sent[0].kind === 'crew' && _sent[0].urgent === true && !/pinned/.test(_sent[0].title);
  }), await phil.page.evaluate(() => $('ntBox').textContent.replace(/\s+/g, ' ').slice(0, 300)));

  console.log('— 💬 the Respond box survives the card\'s redraw —');
  await page.evaluate(async () => {
    window.setAck = () => {}; window.publishSharedNotes = async () => {};
    entries = [{ id: 6, ts: new Date(Date.now() - 90 * 60000), type: 'Note', details: 'Phil, call the inspector back', job: 'Oak House', vis: 'Phil', ask: true }];
    pendingQueue = []; prefs.crewCfg716 = true; prefs.crewFeedGone = []; prefs.thSeen = {};
    window._files = { '/clore daylog/crew/phil/app data/entries.json': JSON.stringify({ entries: [{ id: 31, ts: new Date(Date.now() - 40 * 60000).toISOString(), type: 'Note', details: '↩ Will do', job: 'Oak House', vis: 'Eric', re: { owner: 'Eric', id: 6 } }] }) };
    window.dbxList = async () => ({ entries: [{ '.tag': 'folder', name: 'Phil', path_lower: '/clore daylog/crew/phil', path_display: '/Clore DayLog/Crew/Phil' }] });
    window.dbxDownload = async p => (window._files[p] != null ? window._files[p] : null);
    await checkCrewLogs(); renderCrewFeed();
  });
  ok('💬 Respond opens the box; the words typed into it are still there after the card redraws itself (a sync), the caret at the end and the box still focused; ✕ Never mind lets them go', await page.evaluate(async () => {
    const row = [...document.querySelectorAll('#crewFeedList .sum-row')].find(r => /call the inspector/.test(r.textContent)); if (!row) return false;
    [...row.querySelectorAll('button')].find(b => /💬 Respond/.test(b.textContent)).click();
    const t = $('thT-Eric-6'); if (!t) return false;
    t.focus(); t.value = 'Before noon, after the inspec'; t.dispatchEvent(new Event('input'));
    renderCrewFeed(); renderCrewFeed();   // two syncs while he types
    const t2 = $('thT-Eric-6'), back = !!t2 && t2.value === 'Before noon, after the inspec' && document.activeElement === t2 && t2.selectionStart === t2.value.length && !!$('thBox-Eric-6').dataset.open && !!document.querySelector('#thBox-Eric-6 .th-send');
    document.querySelector('#thBox-Eric-6 .th-never').click();
    return back && !$('thT-Eric-6') && !_thOpen && _thDraft === '';
  }), await page.evaluate(() => JSON.stringify({ open: _thOpen, draft: _thDraft, box: ($('thBox-Eric-6') || {}).innerHTML })));
  ok('↩ Send still works from the restored box, and closes it for good', await page.evaluate(async () => {
    const row = [...document.querySelectorAll('#crewFeedList .sum-row')].find(r => /call the inspector/.test(r.textContent));
    [...row.querySelectorAll('button')].find(b => /💬 Respond/.test(b.textContent)).click();
    $('thT-Eric-6').value = 'Before noon'; $('thT-Eric-6').dispatchEvent(new Event('input')); renderCrewFeed();
    document.querySelector('#thBox-Eric-6 .th-send').click(); await new Promise(r => setTimeout(r, 50));
    return entries.some(e => e.details === '↩ Before noon' && e.re && e.re.id === 6) && !_thOpen && !$('thT-Eric-6');
  }), await page.evaluate(() => JSON.stringify({ open: _thOpen, notes: entries.map(e => e.details) })));

  console.log('— 📈 the parked plates say what they do —');
  ok('on a deposit whose money went back out later, the first plate reads "⇄ Parked — off the bars AND the line until <day>" and the second "↩ Returned — off the bars only"; tapping Returned then Parked ends parked, and the line drops', await page.evaluate(() => {
    _biz = { v: 1, accts: { '1234': { last4: '1234', name: 'Savings', lines: [
      { id: 'a', alt: 'a', d: '2026-06-03', amt: 900, desc: 'Transfer from Receiving', bal: 900 }, { id: 'b', alt: 'b', d: '2026-07-24', amt: 7000, desc: 'Manual transfer from OPEX', bal: 7900 },
      { id: 'c', alt: 'c', d: '2026-08-05', amt: 800, desc: 'Transfer from Receiving', bal: 8700 }, { id: 'd', alt: 'd', d: '2026-09-11', amt: -7000, desc: 'To OPEX', bal: 1700 }, { id: 'e', alt: 'e', d: '2026-09-20', amt: 300, desc: 'Transfer from Receiving', bal: 2000 }], bal: 2000, balAt: '2026-09-20', file: 'savings.csv' } }, marks: {} };
    prefs.bizSav = '1234'; prefs.bizFrom = '2026-06'; renderBusiness(true);
    const card = () => [...document.querySelectorAll('.biz-card')].find(c => /TEMPORARY MONEY/.test(c.textContent));
    const plates = () => [...card().querySelectorAll('.biz-line .pick-chip')].map(b => b.textContent.trim());
    const p0 = plates();
    [...card().querySelectorAll('.pick-chip')].find(b => /Returned/.test(b.textContent)).click();
    const afterR = bizSeries('1234', '2026-06').rows.map(r => [r.added, r.adj]);
    [...card().querySelectorAll('.pick-chip')].find(b => /Parked/.test(b.textContent)).click();
    const afterP = bizSeries('1234', '2026-06').rows.map(r => [r.added, r.adj]), tag = card().textContent;
    return p0.length === 2 && /^⇄ Parked — off the bars AND the line until Sep 11$/.test(p0[0]) && /^↩ Returned — off the bars only$/.test(p0[1]) &&
      JSON.stringify(afterR) === JSON.stringify([[900, 900], [0, 7900], [800, 8700], [300, 2000]]) && JSON.stringify(afterP) === JSON.stringify([[900, 900], [0, 900], [800, 1700], [300, 2000]]) && /⇄ PARKED — off the bars and the line until Sep 11/.test(tag) && bizStore().marks.b.kind === 'parked';
  }), await page.evaluate(() => JSON.stringify({ marks: bizStore().marks, rows: bizSeries('1234', '2026-06').rows.map(r => [r.mk, r.added, r.adj]) })));
  await page.evaluate(() => { _biz = null; lsSet('daylog-bizbank', ''); prefs.bizSav = ''; prefs.bizFrom = ''; });

  ok('version bumped — APP_VER and the footer agree', /const APP_VER = 'v7\.(39|[4-9]\d)'/.test(src) && new RegExp('<footer>' + (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1].replace('.', '\\.')).test(src));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
