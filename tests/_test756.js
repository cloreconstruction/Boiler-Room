// 👷 v7.56 — THE SUBS IN SETUP; ⚡ PICK BY TRADE. Eric: "i want to add all the subs names and numbers in setup and then just click
// through the list for each category when i make a new job or in project portal. and can change it as bids come in." The master
// list gets its own place in ⚙ Setup → 👷 Subs (add · ✎ · 🗑, grouped by trade in the one order); a job's window gets ⚡ PICK BY
// TRADE — every trade with a sub on the list, a plate a sub, lit when on this job, one tap on, one tap off; the Setup → Jobs pills
// wear 👷 for a new job. Every name and number below is made up.
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

  const stub = () => page.evaluate(() => {
    window.scheduleSave = () => {}; window.publishSharedNotes = async () => {}; window.pushOut = () => false;
    window._dbxFiles = window._dbxFiles || {}; window._ups = [];
    window.dbxDownload = async p => (window._dbxFiles || {})[p] ?? null;
    window.dbxUpload = async (p, body) => { (window._dbxFiles || {})[p] = typeof body === 'string' ? body : '[file]'; window._ups.push(p); return {}; };
    window.dbxPathExists = async p => Object.prototype.hasOwnProperty.call(window._dbxFiles || {}, p);
    window.dbxList = async () => ({ entries: [] }); window.dbxRpc = async () => ({});
    if (!window._said) { window._said = []; const t0 = window.toast; window.toast = (m, g) => { if (m) _said.push(String(m)); return t0(m, g); }; }
    dbx.refreshToken = 'test-token';
  });
  await stub();
  await page.evaluate(() => { jobs = ['Oak House', 'Pine Cabin']; crew = ['Phil', 'Kevin']; prefs.office = ['Phil']; entries = []; todos = []; nextId = 1; delete prefs.subs; _portalIdx = { clients: [{ key: 'oak', job: 'Oak House', code: 'oak-111111' }] }; renderJobSelects(); closePanels(); renderAll(); });
  const fill = v => page.evaluate(v => { Object.entries(v).forEach(([id, val]) => { const el = $(id); if (!el) throw new Error('no ' + id); if (el.tagName === 'SELECT') { el.value = [...el.options].find(o => o.textContent === val || o.value === val).value; el.dispatchEvent(new Event('change')); } else el.value = val; }); }, v);
  const setup = () => page.evaluate(() => { const b = $('subsSetupBox'); return { add: !!$('subsSetupAdd'), form: !!$('subsForm'), jobBox: !!$('sbJobNote'), heads: [...b.querySelectorAll('.sb-head')].map(h => h.textContent.replace(/\s+/g, ' ').trim()),
    rows: [...b.querySelectorAll('.sb-master')].map(r => ({ sid: r.dataset.sid, name: r.querySelector('.jc-name').textContent.replace(/\s+/g, ' ').trim(), call: (r.querySelector('.sb-call') || { getAttribute: () => '' }).getAttribute('href'), on: (r.querySelector('.sb-onjobs') || { textContent: '' }).textContent.trim(), acts: [...r.querySelectorAll('.sb-acts .btn-ghost')].map(a => a.textContent.trim()) })), title: (b.querySelector('#subsForm .jc-head') || { textContent: '' }).textContent.trim() }; });
  const pick = () => page.evaluate(() => { const p = $('subsPick'); if (!p) return null; return { hint: p.querySelector('.hint').textContent.replace(/\s+/g, ' ').trim(), heads: [...p.querySelectorAll('.sb-head')].map(h => h.textContent.replace(/\s+/g, ' ').trim()),
    plates: [...p.querySelectorAll('.sb-pickbtn')].map(b => ({ sid: b.dataset.pick, t: b.textContent.replace(/\s+/g, ' ').trim(), on: b.classList.contains('sel'), h: b.getBoundingClientRect().height })), adds: [...p.querySelectorAll('.sb-pickadd')].map(b => b.textContent.trim()), by: [...document.querySelectorAll('#subsBox .sb-by .pick-chip')].map(b => b.textContent.trim()), fits: $('revBox').scrollWidth <= $('revBox').clientWidth + 1 }; });

  console.log('— ⚙ Setup → 👷 Subs —');
  ok('the 👷 Subs section is in ⚙ Setup with ➕ Add a sub, empty to start — and the box draws only while Setup is open', await page.evaluate(() => { const before = $('subsSetupBox').innerHTML === ''; openPanel('settings'); const s = !!$('setSubs') && /Every sub you use/.test($('setSubs').textContent) && !!$('subsSetupAdd') && /No subs on the list yet/.test($('subsSetupBox').textContent); return before && s; }));
  ok('➕ Add a sub opens the master form — the trade, the company, who, the number, about them — and NO "on this job" box (it is the list, not a job)', await page.evaluate(() => { $('subsSetupAdd').click(); const f = $('subsForm'); return !!f && f.closest('#subsSetupBox') !== null && /➕ Add a sub to your list/.test(f.textContent) && !!$('sbTrade') && !!$('sbCo') && !!$('sbNote') && !$('sbJobNote') && !$('sbPick') && /^✓ Save$/.test($('sbSave').textContent.trim()); }));
  await fill({ sbTrade: 'Plumbing', sbCo: 'Pipe Pros', sbWho: 'Dan', sbPh: '907-555-0101' }); await page.evaluate(() => $('sbSave').click()); await page.waitForTimeout(80);
  await page.evaluate(() => $('subsSetupAdd').click()); await fill({ sbTrade: 'Plumbing', sbCo: 'Drain Kings', sbWho: 'Rosa', sbPh: '907-555-0104' }); await page.evaluate(() => $('sbSave').click()); await page.waitForTimeout(80);
  await page.evaluate(() => $('subsSetupAdd').click()); await fill({ sbTrade: 'Electrical', sbCo: 'Spark Bros', sbPh: '907-555-0102' }); await page.evaluate(() => $('sbSave').click()); await page.waitForTimeout(80);
  await page.evaluate(() => $('subsSetupAdd').click()); await fill({ sbTrade: 'Dirt work', sbWho: 'Walt', sbPh: '907-555-0103' }); await page.evaluate(() => $('sbSave').click()); await page.waitForTimeout(80);
  const s1 = await setup();
  ok('four subs typed once: the list groups them by trade in the one order (the build), with the number to tap and "on no job yet"', s1.add && !s1.form && s1.heads.join('|') === 'Dirt work 1|Plumbing 2|Electrical 1' && s1.rows.map(r => r.name).join('|') === 'Walt|Drain Kings · Rosa|Pipe Pros · Dan|Spark Bros' && s1.rows[2].call === 'tel:9075550101' && s1.rows.every(r => /on no job yet/.test(r.on)) && s1.rows.every(r => r.acts.join('|') === '✎ Edit|🗑 Delete') && await page.evaluate(() => Object.values(prefs.subs.subs).filter(s => !s.gone).length === 4 && Object.keys(prefs.subs.on).length === 0 && _said.some(t => /^👷 Pipe Pros — on your subs list ✓/.test(t))), JSON.stringify(s1));
  ok('✎ Edit on the list changes the sub everywhere; the same name typed again is never a twin', await (async () => {
    await page.evaluate(() => document.querySelector('#subsSetupBox .sb-master[data-sid] .sb-ed').click());
    const t = await page.evaluate(() => (setup => setup)($('subsForm') ? $('subsForm').querySelector('.jc-head').textContent.trim() : ''));
    await fill({ sbPh: '907-555-0199' }); await page.evaluate(() => $('sbSave').click()); await page.waitForTimeout(80);
    await page.evaluate(() => $('subsSetupAdd').click()); await fill({ sbTrade: 'Plumbing', sbCo: 'pipe pros', sbWho: 'dan' }); await page.evaluate(() => $('sbSave').click()); await page.waitForTimeout(80);
    const s = await setup();
    return t === '✎ Edit this sub' && s.rows.find(r => /Walt/.test(r.name)).call === 'tel:9075550199' && s.rows.length === 4;
  })());

  console.log('— ⚡ pick by trade —');
  ok('the Setup → Jobs pills wear 👷 — a tap opens that job\'s subs window on ⚡ PICK BY TRADE', await page.evaluate(() => { renderJobsManager(); const b = [...document.querySelectorAll('#jobList .job-pill button')].find(x => x.textContent === '👷' && /Oak House/.test(x.parentElement.textContent)); if (!b) return false; b.click(); return !!$('subsBox') && _subsJob === 'Oak House' && _subsBy === 'pick' && !!$('subsPick'); }));
  const p1 = await pick();
  ok('the trades with a sub on the list, in the one order, a plate a sub with the number — nobody picked yet — and ➕ a <trade> sub under each; 📋 THE LIST · ✓ ⚡ PICK BY TRADE at the top', !!p1 && p1.heads.join('|') === 'Dirt work ○ nobody picked|Plumbing ○ nobody picked|Electrical ○ nobody picked' && p1.plates.map(x => x.t).join('|') === 'Walt · 907-555-0199|Drain Kings · Rosa · 907-555-0104|Pipe Pros · Dan · 907-555-0101|Spark Bros · 907-555-0102' && p1.plates.every(x => !x.on && x.h >= 44) && p1.adds.join('|') === '➕ a Dirt work sub|➕ a Plumbing sub|➕ a Electrical sub' && p1.by.join('|') === '📋 THE LIST|✓ ⚡ PICK BY TRADE — who is on this job' && /0 on this job/.test(p1.hint) && p1.fits, JSON.stringify(p1));
  ok('one tap puts a sub on the job — lit, ✓, the heading counts it, the portal plate too; a second plumber can be on at once; a tap again takes him off', await (async () => {
    const sid = p1.plates[2].sid, sid2 = p1.plates[1].sid;
    await page.evaluate(sid => document.querySelector(`#subsPick [data-pick="${sid}"]`).click(), sid); const a = await pick();
    await page.evaluate(sid => document.querySelector(`#subsPick [data-pick="${sid}"]`).click(), sid2); const b = await pick();
    await page.evaluate(sid => document.querySelector(`#subsPick [data-pick="${sid}"]`).click(), sid2); const c = await pick();
    return a.plates[2].on && /^✓ Pipe Pros/.test(a.plates[2].t) && a.heads[1] === 'Plumbing ✓ 1 on' && /1 on this job/.test(a.hint) && b.heads[1] === 'Plumbing ✓ 2 on' && b.plates[1].on && c.heads[1] === 'Plumbing ✓ 1 on' && !c.plates[1].on && await page.evaluate(() => subsCount('Oak House') === 1 && _said.some(t => /^✓ Pipe Pros is on Oak House/.test(t)) && _said.some(t => /^✕ Drain Kings is off Oak House$/.test(t)));
  })());
  ok('➕ a <trade> sub from the pick view: the form with the trade set, saved = on the list AND on this job', await (async () => {
    await page.evaluate(() => [...document.querySelectorAll('#subsPick .sb-pickadd')].find(b => /Electrical/.test(b.textContent)).click());
    const f = await page.evaluate(() => ({ form: !!$('subsForm'), trade: $('sbTrade') ? $('sbTrade').options[$('sbTrade').selectedIndex].textContent : '', jobBox: !!$('sbJobNote'), title: $('subsForm').querySelector('.jc-head').textContent.trim() }));
    await fill({ sbCo: 'Volt Works', sbPh: '907-555-0177' }); await page.evaluate(() => $('sbSave').click()); await page.waitForTimeout(80);
    const p = await pick();
    return f.form && f.trade === 'Electrical' && !f.jobBox && /Add a sub to your list/.test(f.title) && !!p && p.heads[2] === 'Electrical ✓ 1 on' && p.plates.some(x => /Volt Works/.test(x.t) && x.on) && await page.evaluate(() => subsCount('Oak House') === 2 && _said.some(t => /^👷 Volt Works — on your list and on Oak House ✓/.test(t)));
  })());
  ok('▸ Every construction category shows the whole build, each with its ➕ — and folds back', await page.evaluate(() => { [...$('subsPick').querySelectorAll('button')].find(b => /Every construction category/.test(b.textContent)).click(); const n = $('subsPick').querySelectorAll('.sb-head').length, first = $('subsPick').querySelector('.sb-head').textContent.replace(/\s+/g, ' ').trim(); [...$('subsPick').querySelectorAll('button')].find(b => /Only the trades with a sub/.test(b.textContent)).click(); return n === CATS_IN_ORDER.length && /none on the list/.test(first) && $('subsPick').querySelectorAll('.sb-head').length === 3; }));
  ok('📋 THE LIST shows the same picks as rows (with ✎ and ✕ Off this job); a job that HAS subs opens on the list, one with none opens on ⚡', await page.evaluate(() => { subsBy('job'); const rows = [...document.querySelectorAll('#subsBox .sb-row')].map(r => r.querySelector('.jc-name').textContent.replace(/\s+/g, ' ').trim()); closeReview(); openSubs('Oak House'); const a = _subsBy; closeReview(); openSubs('Pine Cabin'); const b = _subsBy; closeReview(); return rows.join('|') === 'Pipe Pros · Dan|Volt Works' && a === 'job' && b === 'pick'; }));

  console.log('— 👷 a field phone —');
  const book = await page.evaluate(() => JSON.stringify(subsPublish()));
  await page.evaluate(([book]) => { localStorage.setItem('daylog-crew-name', 'Kevin'); localStorage.removeItem('daylog-crew-office'); localStorage.removeItem('daylog-crew-subs'); localStorage.setItem('daylog-dbx', JSON.stringify({ appKey: 'k', refreshToken: 'test-token', accessToken: 'a', expiresAt: Date.now() + 3600000 })); localStorage.setItem('daylog-subs-book-test', book); }, [book]);
  await page.reload(); await page.waitForTimeout(900); await stub();
  await page.evaluate(async () => { jobs = ['Oak House', 'Pine Cabin']; _dbxFiles[DBX_ROOT + '/shared.json'] = JSON.stringify({ from: 'Eric', notes: [], todos: [], asks: [], cards: {}, subs: JSON.parse(localStorage.getItem('daylog-subs-book-test')) }); await checkSharedNotes(); });
  ok('a field phone reads: the Setup box says who keeps the list, the 👷 pill is not on its Jobs, and a job opens on the list — never on ⚡', await page.evaluate(() => { openPanel('settings'); const s = /Eric and the office keep the subs list/.test($('subsSetupBox').textContent) && !$('subsSetupAdd'); renderJobsManager(); const pill = [...document.querySelectorAll('#jobList .job-pill button')].some(x => x.textContent === '👷'); closePanels(); openSubs('Oak House', 'pick'); const r = _subsBy === 'job' && !$('subsPick') && !document.querySelector('#subsBox .sb-by') && document.querySelectorAll('#subsBox .sb-row').length === 2; closeReview(); return s && !pill && r; }));
  ok('and wrote nothing', await page.evaluate(() => window._ups.length === 0));

  ok('version bumped — APP_VER and the footer agree', /const APP_VER = 'v7\.(5[6-9]|[6-9]\d)'/.test(src) && new RegExp('<footer>' + (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1].replace('.', '\\.') + ' ·').test(src));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
