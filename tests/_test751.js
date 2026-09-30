// 👷 💰 v7.51 — SUBS ON THIS JOB, AND THE DOWN-PAYMENT METER.
// (1) Eric: "probably under the project portal need a button that says 'Subs on this job', and then I need to list out the subs and
//     be able to edit, add, and delete. Then all the crew knows who to call on what job because I'm going to have multiple plumbers
//     going at the same time." — "crew and can see all subs on all jobs, phil and office can edit".
// (2) Eric: "I get a … down payment before any project starts and I would like a meter at the top of each client page that only the
//     office can see … I want it to show me when we're getting close to being at or over that down payment (so that I can stop the
//     job and wait for more money)."
// Every name, number and figure here is made up.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { fileURLToPath } = require('url');
(async () => {
  const appUrl = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const repo = path.dirname(fileURLToPath(appUrl));
  const src = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
  const csrc = fs.readFileSync(path.join(repo, 'c', 'index.html'), 'utf8');
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await ctx.route(u => !/^file:/.test(u.href), r => r.abort());
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
  await page.goto(appUrl); await page.waitForTimeout(700);
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };
  const OAK = 'oak-111111', PINE = 'pine-222222';
  const pageOf = (name, extra) => ({ name, stage: 'Framing', updated: '2026-09-21', show: { money: true }, invoiced: 5000, paid: 4600, open: 400, phases: [], journal: [], ...extra });

  // the fake Dropbox: one store; the listing knows the crew folders
  const stub = () => page.evaluate(([OAK, PINE, pOak, pPine]) => {
    window.scheduleSave = () => { window._saves = (window._saves || 0) + 1; };
    window._dbxFiles = window._dbxFiles || {}; window._ups = [];
    window.dbxDownload = async p => (window._dbxFiles || {})[p] ?? null;
    window.dbxUpload = async (p, body) => { (window._dbxFiles || {})[p] = typeof body === 'string' ? body : '[file]'; window._ups.push(p); return { path_display: p }; };
    window.dbxPathExists = async p => Object.prototype.hasOwnProperty.call(window._dbxFiles || {}, p);
    window.dbxList = async () => ({ entries: [] });
    window.dbxRpc = async () => ({});
    window.pushOut = () => false; window.cpPush = () => {};
    if (!window._said) { window._said = []; const t0 = window.toast; window.toast = (m, g) => { if (m) _said.push(String(m)); return t0(m, g); };
      const u0 = window.toastUndo; window.toastUndo = (m, fn) => { _said.push(String(m)); return u0(m, fn); }; }
    dbx.refreshToken = 'test-token';
    if (pOak) { _dbxFiles[portalRoot() + '/index.json'] = JSON.stringify({ clients: [{ key: 'oak', job: 'Oak House', code: OAK }, { key: 'pine', job: 'Pine Cabin', code: PINE }] });
      _dbxFiles[portalRoot() + '/' + OAK + '.json'] = JSON.stringify(pOak); _dbxFiles[portalRoot() + '/' + PINE + '.json'] = JSON.stringify(pPine); }
  }, [OAK, PINE, pageOf('Oak House', { upcoming: { items: [{ n: 'Framing', a: 200 }, { n: 'Plumbing', a: 100 }], tot: 300, all: 1 } }), pageOf('Pine Cabin', { open: 0, budget: [{ n: 'Framing', est: 5000, up: 250 }], upcoming: { items: [{ n: 'Trim', a: 50 }], tot: 50 } })]);
  await stub();
  await page.evaluate(() => {
    jobs = ['Oak House', 'Pine Cabin', 'Internal / Admin']; crew = ['Phil', 'Kevin']; prefs.office = ['Phil']; entries = []; todos = []; nextId = 1;
    delete prefs.subs; delete prefs.downPay; localStorage.removeItem('daylog-dpseen'); _dpSeen = {};
    prefs.cards = { 'oak house': { job: 'Oak House', addr: '12 Oak Lane', people: [{ n: 'Pat Owner', r: 'Homeowner', tel: '907-555-0199', em: '' }], codes: [], notes: '' } };
    renderJobSelects(); closePanels(); renderAll();
  });
  const pageWrites = () => page.evaluate(([OAK, PINE]) => window._ups.filter(p => p === portalRoot() + '/' + OAK + '.json' || p === portalRoot() + '/' + PINE + '.json' || /estimates-/.test(p)).length, [OAK, PINE]);
  const subs = () => page.evaluate(() => { const b = $('subsBox'); if (!b) return null;
    return { h: b.querySelector('h3').textContent.replace(/✕/g, '').replace(/\s+/g, ' ').trim(), now: $('subsNow').textContent.trim(), hint: b.querySelector('.hint').textContent.trim(), wheel: [...$('subsJob').options].map(o => o.textContent.trim()), picked: $('subsJob').value,
      heads: [...b.querySelectorAll('.sb-head')].map(x => x.textContent.replace(/\s+/g, ' ').trim()), add: !!$('subsAdd'), form: !!$('subsForm'), none: (b.querySelector('.sb-none') || { textContent: '' }).textContent.trim(), by: [...b.querySelectorAll('.sb-by .pick-chip')].map(x => x.textContent.trim()),
      rows: [...b.querySelectorAll('.sb-row')].map(r => ({ name: r.querySelector('.jc-name').textContent.replace(/\s+/g, ' ').trim(), call: (r.querySelector('.sb-call') || { getAttribute: () => '' }).getAttribute('href'), callWord: (r.querySelector('.sb-call') || { textContent: '' }).textContent.trim(), text: (r.querySelector('.sb-text') || { getAttribute: () => '' }).getAttribute('href'), mail: (r.querySelector('.sb-mail') || { getAttribute: () => '' }).getAttribute('href'),
        notes: [...r.querySelectorAll('.sb-note')].map(n => n.textContent.trim()), acts: [...r.querySelectorAll('.sb-acts .btn-ghost')].map(a => a.textContent.trim()), tapH: Math.min(...[...r.querySelectorAll('.jc-tap, .sb-acts .btn-ghost')].map(a => a.getBoundingClientRect().height), 999) })),
      fits: document.documentElement.scrollWidth <= document.documentElement.clientWidth && $('revBox').scrollWidth <= $('revBox').clientWidth + 1 }; });
  const fill = v => page.evaluate(v => { Object.entries(v).forEach(([id, val]) => { const el = $(id); if (!el) throw new Error('no ' + id); if (el.tagName === 'SELECT') { el.value = [...el.options].find(o => o.textContent === val || o.value === val).value; el.dispatchEvent(new Event('change')); } else el.value = val; }); }, v);
  const addSub = async (job, v) => { await page.evaluate(job => { subsPick(job); subsAddOpen(); }, job); if (v.sbTrade) { await fill({ sbTrade: v.sbTrade }); } const rest = { ...v }; delete rest.sbTrade; await fill(rest); await page.evaluate(() => $('sbSave').click()); await page.waitForTimeout(80); };

  // ───────────────────────── 👷 Eric's phone ─────────────────────────
  console.log('— 👷 subs on this job: Eric\'s phone —');
  ok('with no sub on any job yet, the 📇 Job Card with nothing picked offers no door to a list that is empty', await page.evaluate(() => { openJobCard(''); const r = /NOTHING PICKED YET/.test($('revBox').textContent) && !document.querySelector('.sb-door'); closeReview(); return r; }));
  await page.evaluate(async () => { openPortalWin(); await new Promise(r => setTimeout(r, 300)); portalFold(0); });
  await page.waitForTimeout(500);
  ok('the job\'s fold in the 🏠 Project portal has the plate: 👷 Subs on this job', await page.evaluate(() => { const b = document.querySelector('#portalList .pf-subs'); return !!b && /^👷 Subs on this job$/.test(b.textContent.trim()) && b.getBoundingClientRect().height >= 40; }), await page.evaluate(() => JSON.stringify([...document.querySelectorAll('#portalList .pf-acts .btn-ghost')].map(b => b.textContent.trim()))));
  await page.evaluate(() => document.querySelector('#portalList .pf-subs').click());
  await page.waitForTimeout(150);
  const s0 = await subs();
  ok('it opens the list on THAT job — the job wheel on it, every job on the wheel, "every job" at its head — and says there are none yet', !!s0 && s0.h === '👷 Subs on this job' && s0.now === '✓ SHOWING — Oak House · 0 subs' && s0.picked === 'Oak House' && s0.wheel[0] === '📋 Every job · 0 subs' && s0.wheel.slice(1).join('|') === 'Oak House|Pine Cabin|Internal / Admin' && /^○ No subs on Oak House yet\.$/.test(s0.none) && s0.add, JSON.stringify(s0));
  await page.evaluate(() => $('subsAdd').click());
  ok('➕ Add a sub: a form — the trade off the list of construction categories (by phase), the company, who to ask for, the phone, the email, a word for THIS job, a word about them', await page.evaluate(() => { const f = $('subsForm'); if (!f) return false; const t = $('sbTrade');
    return [...t.querySelectorAll('optgroup')].map(g => g.label).join('|') === 'Site & utilities|Foundation & shell|Mechanical|Interior finish|Other costs' && [...t.querySelectorAll('optgroup option')].map(o => o.textContent).join('|') === CATS_IN_ORDER.join('|') && t.options[t.options.length - 1].textContent === '✎ another trade…' &&
      ['sbCo', 'sbWho', 'sbPh', 'sbEm', 'sbJobNote', 'sbNote', 'sbSave'].every(id => !!$(id)) && !$('sbPick') && /➕ Add a sub to Oak House/.test(f.textContent); }));
  ok('with no company and no name it is not saved, and says so', await page.evaluate(() => { $('sbSave').click(); return !!$('subsForm') && subsCount('Oak House') === 0 && _said.some(t => /^Give it a company or a name first$/.test(t)); }));
  await fill({ sbTrade: 'Plumbing' }); await fill({ sbCo: 'Pipe Pros', sbWho: 'Dan', sbPh: '907-555-0101', sbEm: 'dan@pipepros.example', sbJobNote: 'rough-in only', sbNote: 'text first' });
  await page.evaluate(() => $('sbSave').click());
  await page.waitForTimeout(100);
  await addSub('Oak House', { sbTrade: 'Electrical', sbCo: 'Spark Bros', sbPh: '(907) 555-0102' });
  await addSub('Oak House', { sbTrade: 'Dirt work', sbWho: 'Walt', sbPh: '907 555 0103' });
  const s1 = await subs();
  ok('each sub is a plate under its TRADE, the trades in the one order (the build) — the company, the person, and what they are here for', !!s1 && s1.heads.join('|') === 'Dirt work 1|Plumbing 1|Electrical 1' && s1.rows.map(r => r.name).join('|') === 'Walt|Pipe Pros · Dan|Spark Bros' && s1.rows[1].notes.join('|') === '📝 on this job: rough-in only|about them: text first' && s1.now === '✓ SHOWING — Oak House · 3 subs', JSON.stringify(s1 && [s1.heads, s1.rows]));
  ok('who to call is ONE TAP: 📞 calls, 💬 texts, ✉ writes — each a finger tall', s1.rows[1].call === 'tel:9075550101' && s1.rows[1].callWord === '📞 907-555-0101' && s1.rows[1].text === 'sms:9075550101' && s1.rows[1].mail === 'mailto:dan@pipepros.example' && s1.rows[0].call === 'tel:9075550103' && s1.rows[2].call === 'tel:9075550102' && s1.rows.every(r => r.tapH >= 44), JSON.stringify(s1.rows.map(r => [r.call, r.tapH])));
  ok('each row has ✎ Edit and ✕ Off this job', s1.rows.every(r => r.acts.join('|') === '✎ Edit|✕ Off this job'));
  ok('the plate in the portal — still open under the list — counts them as they are added', await page.evaluate(() => { const b = document.querySelector('#portalList .pf-subs'); return !!b && b.dataset.job === 'Oak House' && b.textContent.trim() === '👷 Subs on this job · 3'; }));
  console.log('— 👷 more than one plumber going at the same time —');
  await addSub('Pine Cabin', { sbTrade: 'Plumbing', sbCo: 'Drain Kings', sbWho: 'Rosa', sbPh: '907-555-0104' });
  ok('on the next job the form offers the subs he ALREADY has (by trade) — pick one and the boxes fill themselves', await (async () => {
    await page.evaluate(() => { subsPick('Pine Cabin'); subsAddOpen(); });
    const pick = await page.evaluate(() => ({ groups: [...$('sbPick').querySelectorAll('optgroup')].map(g => g.label + ':' + [...g.querySelectorAll('option')].map(o => o.textContent).join('+')), first: $('sbPick').options[0].textContent }));
    await fill({ sbPick: 'Spark Bros' });
    const filled = await page.evaluate(() => ({ co: $('sbCo').value, ph: $('sbPh').value, trade: $('sbTrade').options[$('sbTrade').selectedIndex].textContent }));
    await fill({ sbJobNote: 'service panel only' });
    await page.evaluate(() => $('sbSave').click());
    await page.waitForTimeout(100);
    return pick.first === '— a new sub —' && pick.groups.join('|') === 'Dirt work:Walt|Plumbing:Pipe Pros · Dan|Electrical:Spark Bros' && filled.co === 'Spark Bros' && filled.ph === '(907) 555-0102' && filled.trade === 'Electrical' &&
      await page.evaluate(() => Object.values(prefs.subs.subs).filter(s => !s.gone).length === 4 && subsCount('Pine Cabin') === 2);
  })());
  ok('a sub on two jobs says so on each — and each job keeps its own word for it', await (async () => { const a = (await subs()).rows.find(r => /Spark Bros/.test(r.name)); await page.evaluate(() => subsPick('Oak House')); const b = (await subs()).rows.find(r => /Spark Bros/.test(r.name));
    return a.notes.join('|') === '📝 on this job: service panel only|also on: Oak House' && b.notes.join('|') === 'also on: Pine Cabin'; })());
  await page.evaluate(() => subsPick('*'));
  const s2 = await subs();
  ok('📋 Every job: every sub on every job, job by job — each row says its trade', s2.h === '👷 Subs on every job' && s2.now === '✓ SHOWING — every job · 5 subs on the jobs' && s2.heads.join('|') === '🏠 Oak House 3|🏠 Pine Cabin 2' && s2.rows.map(r => r.name).join('|') === 'Walt Dirt work|Pipe Pros · Dan Plumbing|Spark Bros Electrical|Drain Kings · Rosa Plumbing|Spark Bros Electrical' && !s2.add && s2.by.join('|') === '✓ BY JOB|BY TRADE — who is where', JSON.stringify(s2 && [s2.heads, s2.rows.map(r => r.name), s2.by]));
  await page.evaluate(() => subsBy('trade'));
  const s3 = await subs();
  ok('BY TRADE — who is where: the two plumbers side by side, each with its job', s3.heads.join('|') === 'Dirt work 1|Plumbing 2|Electrical 2' && s3.rows.filter(r => /Plumbing|Pipe|Drain/.test(r.name)).map(r => r.name).join('|') === 'Drain Kings · Rosa 🏠 Pine Cabin|Pipe Pros · Dan 🏠 Oak House' && s3.by.join('|') === 'BY JOB|✓ BY TRADE — who is where', JSON.stringify(s3 && [s3.heads, s3.rows.map(r => r.name)]));
  ok('✎ Edit: a change to a sub\'s number shows on EVERY job it is on, and the form says how many that is', await (async () => {
    await page.evaluate(() => { subsPick('Oak House'); [...document.querySelectorAll('.sb-row')].find(r => /Spark Bros/.test(r.textContent)).querySelector('.sb-ed').click(); });
    const said = await page.evaluate(() => /This sub is on 2 jobs — a change to the name, the trade or the numbers shows on every one of them\./.test($('subsForm').textContent) && /✎ Edit this sub/.test($('subsForm').textContent) && !$('sbPick'));
    await fill({ sbPh: '907-555-0999', sbWho: 'Lee' });
    await page.evaluate(() => $('sbSave').click());
    await page.waitForTimeout(100);
    const a = (await subs()).rows.find(r => /Spark Bros/.test(r.name)); await page.evaluate(() => subsPick('Pine Cabin')); const b = (await subs()).rows.find(r => /Spark Bros/.test(r.name));
    return said && a.call === 'tel:9075550999' && b.call === 'tel:9075550999' && a.name === 'Spark Bros · Lee' && b.notes[0] === '📝 on this job: service panel only';
  })());
  ok('the same company and person typed in again is the one he already has — never a twin', await (async () => {
    await addSub('Internal / Admin', { sbTrade: 'Plumbing', sbCo: 'pipe pros', sbWho: 'dan' });
    return await page.evaluate(() => Object.values(prefs.subs.subs).filter(s => !s.gone).length === 4 && subsCount('Internal / Admin') === 1 && subsJobsOf(Object.values(prefs.subs.subs).find(s => s.co === 'Pipe Pros').id).length === 2);
  })());
  ok('a trade that is not on the list can be typed — it sorts after the list\'s', await (async () => {
    await page.evaluate(() => { subsPick('Oak House'); subsAddOpen(); });
    await fill({ sbTrade: '✎ another trade…' });
    const box = await page.evaluate(() => !!$('sbTradeOther'));
    await fill({ sbTradeOther: 'Crane', sbCo: 'Lift It' });
    await page.evaluate(() => $('sbSave').click());
    await page.waitForTimeout(100);
    const s = await subs();
    return box && s.heads.join('|') === 'Dirt work 1|Plumbing 1|Electrical 1|Crane 1';
  })());
  ok('✕ Off this job takes two taps, says SURE in words — and the sub stays on its other job', await (async () => {
    await page.evaluate(() => { subsPick('Pine Cabin'); [...document.querySelectorAll('.sb-row')].find(r => /Spark Bros/.test(r.textContent)).querySelector('.sb-off').click(); });
    const armed = await page.evaluate(() => { const b = [...document.querySelectorAll('.sb-row')].find(r => /Spark Bros/.test(r.textContent)).querySelector('.sb-off'); return /^⚠ SURE\? Tap again — off this job$/.test(b.textContent.trim()) && b.classList.contains('armed') && subsCount('Pine Cabin') === 2; });
    await page.evaluate(() => [...document.querySelectorAll('.sb-row')].find(r => /Spark Bros/.test(r.textContent)).querySelector('.sb-off').click());
    await page.waitForTimeout(100);
    return armed && await page.evaluate(() => subsCount('Pine Cabin') === 1 && subsCount('Oak House') === 4 && _said.some(t => /^✕ Spark Bros is off Pine Cabin — still on 1 other job$/.test(t)) && Object.values(prefs.subs.on).some(l => l.gone));
  })());
  ok('🗑 Delete this sub from every job (in its ✎ window, two taps) takes it off all of them', await (async () => {
    await page.evaluate(() => { subsPick('Oak House'); [...document.querySelectorAll('.sb-row')].find(r => /Pipe Pros/.test(r.textContent)).querySelector('.sb-ed').click(); });
    await page.evaluate(() => document.querySelector('#subsForm .sb-del').click());
    const armed = await page.evaluate(() => /^⚠ SURE\? Tap again — off EVERY job \(2\)$/.test(document.querySelector('#subsForm .sb-del').textContent.trim()));
    await page.evaluate(() => document.querySelector('#subsForm .sb-del').click());
    await page.waitForTimeout(100);
    return armed && await page.evaluate(() => subsCount('Oak House') === 3 && subsCount('Internal / Admin') === 0 && !subsRows('').some(r => r.s.co === 'Pipe Pros') && _said.some(t => /^🗑 Pipe Pros is off every job — and off your list$/.test(t)));
  })());
  ok('a ⚠ SURE? that lets go by itself (four seconds) keeps what he typed in the form since', await (async () => {
    await page.evaluate(() => { subsPick('Oak House'); [...document.querySelectorAll('.sb-row')].find(r => /Spark Bros/.test(r.textContent)).querySelector('.sb-ed').click(); });
    await page.evaluate(() => document.querySelector('#subsForm .sb-del').click());
    await fill({ sbNote: 'typed after the first tap' });
    await page.waitForTimeout(4300);
    const r = await page.evaluate(() => !!$('subsForm') && /^🗑 Delete this sub from every job$/.test(document.querySelector('#subsForm .sb-del').textContent.trim()) && $('sbNote').value === 'typed after the first tap' && subsRows('').some(x => x.s.co === 'Spark Bros'));
    await page.evaluate(() => subsFormClose());
    return r;
  })());

  console.log('— 📤 the road to the crew —');
  await page.evaluate(async () => { clearTimeout(_subsPubT); _portalIdx = null; await publishSharedNotes(); });
  await page.waitForTimeout(200);
  ok('every crew member\'s folder gets the WHOLE list — every job — field and office alike', await page.evaluate(() => ['Phil', 'Kevin'].every(n => { const j = JSON.parse(_dbxFiles['/Clore DayLog/Crew/' + n + '/shared.json'] || 'null'); if (!j || !j.subs) return false;
    const live = Object.values(j.subs.on).filter(l => !l.gone).map(l => l.job + ':' + (j.subs.subs[l.sid] || {}).co).sort().join('|');
    return live === 'Oak House:|Oak House:Lift It|Oak House:Spark Bros|Pine Cabin:Drain Kings'; })), await page.evaluate(() => JSON.stringify(Object.keys(_dbxFiles))));
  ok('🧱 THE WALL: not one homeowner page and not one estimates file was written by any of it, and no sub is in the list of client pages the crew get', (await pageWrites()) === 0 && await page.evaluate(() => !/Spark Bros|Drain Kings|Lift It/.test(String(_dbxFiles['/Clore DayLog/Crew/Kevin/portal.json'] || '') + _dbxFiles[portalRoot() + '/oak-111111.json'] + _dbxFiles[portalRoot() + '/pine-222222.json'])));
  ok('the homeowner\'s page has no word of subs in it at all', !/subs-edits|subsBook|Subs on this job/.test(csrc));
  ok('📇 the job card shows who to call on THAT job, with the taps — and the door to the whole list', await page.evaluate(() => { closeReview(); openJobCard('Oak House');
    const b = $('revBox'), rows = [...b.querySelectorAll('.sb-card')].map(r => r.querySelector('.jc-name').textContent.replace(/\s+/g, ' ').trim());
    const r = [...b.querySelectorAll('.jc-head')].some(h => /👷 Subs on this job/.test(h.textContent)) && rows.join('|') === 'Walt Dirt work|Spark Bros · Lee Electrical|Lift It Crane' && b.querySelector('.sb-card .sb-call').getAttribute('href') === 'tel:9075550103' && /^👷 Open the subs list — add, edit, take off$/.test(b.querySelector('.sb-open').textContent.trim());
    b.querySelector('.sb-open').click();
    return r && !!$('subsBox') && $('subsJob').value === 'Oak House'; }));
  ok('a job with subs and an EMPTY card opens on the form — and who to call is still there, under ✓ Save', await page.evaluate(() => { closeReview(); openJobCard('Pine Cabin');
    const b = $('revBox'), save = [...b.querySelectorAll('.btn-primary')].find(x => /Save this card/.test(x.textContent)), rows = [...b.querySelectorAll('.sb-card')];
    return !!$('jcAddr') && !!save && rows.length === 1 && /Drain Kings/.test(rows[0].textContent) && rows[0].querySelector('.sb-call').getAttribute('href') === 'tel:9075550104' && !!(save.compareDocumentPosition(rows[0]) & Node.DOCUMENT_POSITION_FOLLOWING); }));
  ok('the door to the list from a card that is mid-edit keeps what was typed on the card', await page.evaluate(() => { $('jcAddr').value = '7 Pine Road'; $('revBox').querySelector('.sb-open').click();
    const r = !!$('subsBox') && $('subsJob').value === 'Pine Cabin' && (prefs.cards['pine cabin'] || {}).addr === '7 Pine Road'; closeReview(); delete prefs.cards['pine cabin']; return r; }));
  ok('with NO job picked on the 📇 Job Card the door to every job\'s subs is there, and says how many', await page.evaluate(() => { openJobCard('');
    const d = document.querySelector('#revBox .sb-door'), w = d ? d.textContent.trim() : '', tall = d ? d.getBoundingClientRect().height : 0; if (d) d.click();
    const r = /^👷 Subs on every job — who to call · 4$/.test(w) && tall >= 44 && !!$('subsBox') && $('subsJob').value === '*' && /^✓ SHOWING — every job · 4 subs on the jobs$/.test($('subsNow').textContent.trim()); closeReview(); return r; }));
  ok('🧙 the Wizard is handed who to call, job by job', await page.evaluate(() => { const c = buildAskContext('who is the electrician on oak house'); return /SUBS ON THE JOBS/.test(c) && /Spark Bros/.test(c) && /907-555-0999/.test(c); }));
  ok('a job that is renamed keeps its subs', await page.evaluate(() => { closeReview(); const ok0 = renameJob('Pine Cabin', 'Pine Lodge'); return ok0 && subsCount('Pine Lodge') === 1 && subsCount('Pine Cabin') === 0; }));
  ok('an OFFICE phone\'s changes come back on the crew sweep: the newer of the two stands, an older one is left, a take-off is taken — and it says who', await page.evaluate(() => {
    const b = prefs.subs, spark = Object.values(b.subs).find(s => s.co === 'Spark Bros'), lift = Object.values(b.subs).find(s => s.co === 'Lift It'), liftOn = Object.values(b.on).find(l => l.sid === lift.id && !l.gone);
    const later = new Date(Date.now() + 5000).toISOString(), older = '2020-01-01T00:00:00.000Z';
    _said.length = 0;
    const n = subsEditsTake('Phil', { by: 'Phil', subs: { [spark.id]: { ...spark, ph: '907-555-0777', at: later, by: 'Phil' }, [lift.id]: { ...lift, co: 'WRONG', at: older }, newone: { id: 'newone', co: 'Tile Team', trade: 'Tile (floors)', ph: '907-555-0105', at: later }, bad: { id: 'bad', at: later } },
      on: { [liftOn.id]: { ...liftOn, gone: true, at: later }, newlink: { id: 'newlink', job: 'Oak House', sid: 'newone', note: '', at: later } } });
    return n === 4 && b.subs[spark.id].ph === '907-555-0777' && b.subs[spark.id].by === 'Phil' && b.subs[lift.id].co === 'Lift It' && !b.subs.bad && subsRows('Oak House').map(r => r.s.co || r.s.who).sort().join('|') === 'Spark Bros|Tile Team|Walt' && _said.some(t => /^👷 Phil changed the subs list \(4\)$/.test(t)); }));
  ok('a change from the office that lands WHILE HE TYPES in the form leaves his words alone — the list catches up when the form shuts', await (async () => {
    await page.evaluate(() => { openSubs('Oak House'); subsAddOpen(); });
    await fill({ sbCo: 'Half Typed', sbPh: '907-555-01' });
    return await page.evaluate(() => { const box = $('sbCo'), walt = Object.values(prefs.subs.subs).find(s => s.who === 'Walt'), was = JSON.parse(JSON.stringify(walt));
      const n = subsEditsTake('Phil', { subs: { [walt.id]: { ...was, ph: '907-555-0188', at: new Date(Date.now() + 6000).toISOString() } }, on: {} });
      const same = $('sbCo') === box && box.isConnected && $('sbCo').value === 'Half Typed' && $('sbPh').value === '907-555-01' && !!$('subsForm');
      subsFormClose();
      const row = [...document.querySelectorAll('.sb-row')].find(x => /Walt/.test(x.textContent)), took = !!row && row.querySelector('.sb-call').getAttribute('href') === 'tel:9075550188';
      const back = subsEditsTake('Phil', { subs: { [walt.id]: { ...was, at: new Date(Date.now() + 7000).toISOString() } }, on: {} });   // (put back: the checks after this one read his number)
      closeReview();
      return n === 1 && same && took && back === 1 && prefs.subs.subs[walt.id].ph === was.ph; }); })());
  ok('in the 👁 crew preview the list is a look, not a phone: nothing to edit', await page.evaluate(() => { crewPreview = true; openSubs('Oak House'); const r = !subsCanEdit() && !$('subsAdd') && !document.querySelector('.sb-ed'); crewPreview = false; closeReview(); return r; }));
  ok('at 390px the list and the form do not run off the side', await (async () => { await page.evaluate(() => { openSubs('Oak House'); }); const a = await subs(); await page.evaluate(() => subsAddOpen()); const b = await subs(); await page.evaluate(() => closeReview()); return a.fits && b.fits && b.form; })());

  // ───────────────────────── 💰 the down-payment meter ─────────────────────────
  console.log('— 💰 the down-payment meter: Eric\'s phone —');
  const meter = where => page.evaluate(where => { const h = document.querySelector(`[data-dp-host][data-dp-where="${where}"]`), b = h && h.querySelector('.dp-box'); if (!b) return null; const cs = getComputedStyle(b);
    return { state: b.dataset.state, word: (b.querySelector('.dp-word') || { textContent: '' }).textContent.trim(), pct: (b.querySelector('.dp-pct') || { textContent: '' }).textContent.trim(), on: b.querySelectorAll('.dp-cell.on').length, cells: b.querySelectorAll('.dp-cell').length,
      lines: [...b.querySelectorAll('.dp-line')].map(l => l.textContent.replace(/\s+/g, ' ').trim()), btn: [...b.querySelectorAll('button')].map(x => x.textContent.trim()), form: !!b.querySelector('.dp-form'), label: b.getAttribute('aria-label') || '', edgeW: parseFloat(cs.borderTopWidth), edge: cs.borderTopStyle,
      minBtn: Math.min(...[...b.querySelectorAll('button')].map(x => x.getBoundingClientRect().height), 999) }; }, where);
  const setDp = (where, v) => page.evaluate(([where, v]) => { const h = document.querySelector(`[data-dp-host][data-dp-where="${where}"]`); h.querySelector('.dp-edit, .dp-setbtn').click(); $('dpIn-' + where).value = v; document.querySelector(`[data-dp-host][data-dp-where="${where}"] .dp-save`).click(); }, [where, v]);
  await page.evaluate(async () => { renameJob('Pine Lodge', 'Pine Cabin'); clearTimeout(_subsPubT); await publishSharedNotes(); await new Promise(r => setTimeout(r, 300)); window._ups.length = 0; _portalOpen = 0; await renderPortalList(); });
  await page.waitForTimeout(700);
  const m0 = await meter('portal');
  ok('each job\'s fold in the portal starts with the meter — with no down payment set it says so and offers to set one', !!m0 && m0.state === 'unset' && m0.btn.join('|') === '💰 ○ No down payment set for this job — tap to set one' && m0.edge === 'dashed' && m0.minBtn >= 44 && await page.evaluate(() => { const f = document.querySelector('#portalList .sum-row'), h = f.querySelector('[data-dp-host]'), acts = f.querySelector('.pf-acts'); return !!(h.compareDocumentPosition(acts) & Node.DOCUMENT_POSITION_FOLLOWING) && !document.querySelector('[data-dp-lamp]'); }), JSON.stringify(m0));
  await setDp('portal', '1000');
  await page.waitForTimeout(700);
  const m1 = await meter('portal');
  ok('the down payment typed in: what is OUT against it — the receipts not invoiced plus the invoices not paid — ten cells, the percent and the words', !!m1 && m1.state === 'under' && m1.word === '✓ UNDER' && m1.pct === '70%' && m1.on === 7 && m1.cells === 10 && m1.lines[0] === '$700.00 out of $1,000.00 held · $300.00 of room' && /^🧾 \$300\.00 receipts not invoiced \+ 📄 \$400\.00 invoices not paid \(the invoices: as of the last QuickBooks run\)$/.test(m1.lines[1]) && /✓ UNDER — 70% of the down payment is out$/.test(m1.label) && m1.btn.join('|') === '✎ Change the down payment', JSON.stringify(m1));
  ok('it is kept on HIS side — in his own prefs — and nothing was written to their page, the estimates or a crew folder for it', await page.evaluate(OAK => prefs.downPay[OAK].a === 1000 && !window._ups.some(p => /Client Portal|estimates-|\/Crew\//.test(p)) && !Object.values(_dbxFiles).some(f => /downPay/.test(String(f))), OAK) && await page.evaluate(() => _said.some(t => /^💰 Down payment saved — \$1,000\.00 held · 70% of it is out$/.test(t))), await page.evaluate(() => JSON.stringify([window._ups, _said.slice(-3), Object.keys(_dbxFiles).filter(k => /downPay/.test(String(_dbxFiles[k])))])));
  ok('the job\'s own row wears it too, so every job reads at one glance — and a job with none set wears nothing', await page.evaluate(([OAK, PINE]) => { const l = document.querySelector(`[data-dp-lamp="${OAK}"]`); return !!l && l.querySelector('.jm-word').textContent.trim() === '✓ 70% OF THE DOWN PAYMENT' && l.querySelectorAll('.dp-cell.on').length === 7 && !!l.closest('.sum-title') && !document.querySelector(`[data-dp-lamp="${PINE}"]`); }, [OAK, PINE]));
  ok('from three quarters of it: ⚠ GETTING CLOSE — a heavier edge, the word, the glyph', await (async () => { await setDp('portal', '900'); await page.waitForTimeout(200); const m = await meter('portal'), l = await page.evaluate(OAK => document.querySelector(`[data-dp-lamp="${OAK}"] .jm-word`).textContent.trim(), OAK);
    return m.state === 'close' && m.word === '⚠ GETTING CLOSE' && m.pct === '78%' && m.on === 8 && m.lines[0] === '$700.00 out of $900.00 held · $200.00 of room' && m.edgeW > m1.edgeW && l === '⚠ 78% OF THE DOWN PAYMENT — CLOSE'; })());
  ok('AT the down payment: ⛔ stop and wait for money — every cell lit', await (async () => { await setDp('portal', '700'); await page.waitForTimeout(200); const m = await meter('portal');
    return m.state === 'over' && m.word === '⛔ AT THE DOWN PAYMENT — stop and wait for money' && m.pct === '100%' && m.on === 10 && m.lines[0] === '$700.00 out of $700.00 held' && m.edgeW >= 3; })());
  ok('OVER it: it says by how much', await (async () => { await setDp('portal', '500'); await page.waitForTimeout(200); const m = await meter('portal'), l = await page.evaluate(OAK => document.querySelector(`[data-dp-lamp="${OAK}"]`).textContent.replace(/\s+/g, ' ').trim(), OAK);
    return m.state === 'over' && m.word === '⛔ OVER BY $200.00 — stop and wait for money' && m.pct === '140%' && m.on === 10 && /⛔ 140% OF THE DOWN PAYMENT — STOP/.test(l); })());
  ok('a page in the older shape (an approved line\'s receipts kept inside the line) is counted whole', await (async () => { await page.evaluate(async () => { portalFold(1); await new Promise(r => setTimeout(r, 300)); }); await setDp('portal', '1000'); await page.waitForTimeout(300); const m = await meter('portal');
    return !!m && m.state === 'under' && m.pct === '30%' && m.on === 3 && /^🧾 \$300\.00 receipts not invoiced \+ 📄 \$0\.00 invoices not paid/.test(m.lines[1]); })(), JSON.stringify(await meter('portal')));
  ok('the box emptied and saved takes the meter off that job', await (async () => { await setDp('portal', ''); await page.waitForTimeout(300); const m = await meter('portal');
    return m.state === 'unset' && await page.evaluate(PINE => !(PINE in prefs.downPay) && !document.querySelector(`[data-dp-lamp="${PINE}"]`) && _said.some(t => /^💰 The down payment is off this job — no meter$/.test(t)), PINE); })());

  console.log('— 💰 where he enters the receipts —');
  await page.evaluate(OAK => { prefs.downPay[OAK] = { a: 1000, at: new Date().toISOString() };
    _dbxFiles[estPath(OAK)] = JSON.stringify({ mk: 20, cats: [{ n: 'Framing', appr: false, bids: [], pend: [{ a: 200, inc: true, v: 'Lumber Co', ts: '2026-09-11', base: 0 }] }, { n: 'Plumbing', appr: false, bids: [], pend: [{ a: 100, inc: true, v: 'Pipe Shop', ts: '2026-09-12', base: 0 }] }] }); _said.length = 0; }, OAK);
  await page.evaluate(async () => { await openEstimates(0); });
  await page.waitForTimeout(1500);
  const e1 = await meter('est');
  ok('the top of the job\'s estimates board has the meter', !!e1 && e1.state === 'under' && e1.pct === '70%' && await page.evaluate(() => { const h = document.querySelector('[data-dp-where="est"]'), first = document.querySelector('.est-board .est-phase'); return !!(h.compareDocumentPosition(first) & Node.DOCUMENT_POSITION_FOLLOWING); }), JSON.stringify(e1));
  ok('a bill put on their page moves it at once — and the toast says when the job is close to its down payment', await (async () => {
    await page.evaluate(() => { _estBillFold = true; renderEstimates(); const c = $('estHandC'); c.value = [...c.options].find(o => o.textContent === 'Framing').value; $('estHandA').value = '100'; $('estHandV').value = 'Truss Co'; });
    await page.evaluate(async () => { await estBillHand(); });
    await page.waitForTimeout(400);
    const m = await meter('est');
    return m.state === 'close' && m.pct === '82%' && m.lines[0] === '$820.00 out of $1,000.00 held · $180.00 of room' && await page.evaluate(() => _said.some(t => /RECEIPTS RECEIVED — Framing, \$120 ✓ · ⚠ 82% of the down payment is out — getting close$/.test(t)));
  })(), JSON.stringify([await meter('est'), await page.evaluate(() => _said.slice(-3))]));
  ok('one that takes it over says STOP', await (async () => {
    await page.evaluate(() => { _estBillFold = true; renderEstimates(); const c = $('estHandC'); c.value = [...c.options].find(o => o.textContent === 'Plumbing').value; $('estHandA').value = '200'; });
    await page.evaluate(async () => { await estBillHand(); });
    await page.waitForTimeout(400);
    const m = await meter('est');
    return m.state === 'over' && m.word === '⛔ OVER BY $60.00 — stop and wait for money' && await page.evaluate(() => _said.some(t => / · ⛔ 106% of the down payment is out — stop and wait for money$/.test(t)));
  })(), JSON.stringify([await meter('est'), await page.evaluate(() => _said.slice(-2))]));
  ok('their page never hears of it: no down payment, no meter, no such word in the file that was just written', await page.evaluate(OAK => { const t = _dbxFiles[portalRoot() + '/' + OAK + '.json'], e = _dbxFiles[estPath(OAK)]; return /"upcoming"/.test(t) && !/downPay|down payment|"held"/i.test(t) && !/downPay/.test(e); }, OAK));
  await page.evaluate(() => closeEstimates());
  await page.waitForTimeout(200);
  ok('shut the board and the portal row still says it — from what their page now carries', await (async () => { await page.evaluate(async () => { _portalOpen = 0; await renderPortalList(); }); await page.waitForTimeout(700); const m = await meter('portal');
    return !!m && m.state === 'over' && m.pct === '106%' && m.lines[0] === '$1,060.00 out of $1,000.00 held'; })(), JSON.stringify(await meter('portal')));
  ok('the top of the job\'s 🧾 receipts window has it', await (async () => { await page.evaluate(async () => { await openRcptReview(0); }); await page.waitForTimeout(600); const m = await meter('rcpt'); await page.evaluate(() => closeRcptReview()); return !!m && m.state === 'over' && m.pct === '106%'; })());
  ok('👁 the client viewer wears it at ITS top — in the app\'s own frame, above their page, not inside it', await (async () => {
    await page.evaluate(() => clientPreviewOpen(0));
    await page.waitForTimeout(200);
    const r = await page.evaluate(() => { const m = $('cpMeter'), b = m.querySelector('.dp-box'), fr = $('cpFrame'); return { has: !!b, state: b && b.dataset.state, word: b && b.querySelector('.dp-word').textContent.trim(), above: !!(m.compareDocumentPosition(fr) & Node.DOCUMENT_POSITION_FOLLOWING), inFrame: !!fr.closest('#cpMeter'), src: fr.getAttribute('src') || fr.src }; });
    await page.evaluate(() => clientPreviewClose());
    const gone = await page.evaluate(() => !$('cpMeter').querySelector('.dp-box'));
    return r.has && r.state === 'over' && /^⛔ OVER BY \$60\.00/.test(r.word) && r.above && !r.inFrame && /[?&]pv=1/.test(r.src) && !/down|dp=|held|1000/i.test(r.src) && gone;
  })());
  ok('the homeowner\'s page has no word of a down payment in it at all', !/downPay|down payment|dpMeter/i.test(csrc));
  ok('not one of his figures is in the meter\'s code: the block holds no dollar amount', (() => { const a = src.indexOf('// ================= 💰 v7.51 — THE DOWN-PAYMENT METER'), z = src.indexOf('// ================= /DOWN-PAYMENT METER');
    const block = a >= 0 && z > a ? src.slice(a, z) : ''; return block.length > 2000 && !/\$\s?\d/.test(block) && !/\b\d{1,3},\d{3}\b/.test(block) && !/\b\d{4,}\b/.test(block.replace(/v6\.\d+|v7\.\d+/g, '')); })());
  ok('at 390px the meter does not run off the side, in the portal or on the board', await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth && [...document.querySelectorAll('.dp-box')].every(b => b.scrollWidth <= b.clientWidth + 1)));
  await page.evaluate(() => { closePortalWin(); });

  // ───────────────────────── 👷 a field phone, an office phone ─────────────────────────
  console.log('— 👷 a field phone (Kevin) —');
  const book = await page.evaluate(() => JSON.stringify(subsPublish()));
  const crewPhone = async (name, office) => {
    await page.evaluate(([name, office]) => { localStorage.setItem('daylog-crew-name', name); if (office) localStorage.setItem('daylog-crew-office', '1'); else localStorage.removeItem('daylog-crew-office');
      localStorage.removeItem('daylog-crew-subs'); localStorage.removeItem('daylog-subs-edits'); localStorage.setItem('daylog-dbx', JSON.stringify({ appKey: 'k', refreshToken: 'test-token', accessToken: 'a', expiresAt: Date.now() + 3600000 })); }, [name, office]);
    await page.reload(); await page.waitForTimeout(900);
    await stub();
    await page.evaluate(([name, book]) => { jobs = ['Oak House', 'Pine Cabin']; _said.length = 0;
      _dbxFiles[DBX_ROOT + '/shared.json'] = JSON.stringify({ from: 'Eric', notes: [], todos: [], asks: [], cards: { 'oak house': { job: 'Oak House', addr: '12 Oak Lane', people: [], codes: [], notes: '' } }, subs: JSON.parse(book) });
      _dbxFiles[DBX_ROOT + '/portal.json'] = JSON.stringify({ clients: [{ job: 'Oak House', code: 'oak-111111' }, { job: 'Pine Cabin', code: 'pine-222222' }] }); }, [name, book]);
    await page.evaluate(async () => { await checkSharedNotes(); });
    await page.waitForTimeout(200);
  };
  await crewPhone('Kevin', false);
  await page.evaluate(() => openSubs('*'));
  const k = await subs();
  ok('a field phone sees EVERY sub on EVERY job — with the taps to call', !!k && k.now === '✓ SHOWING — every job · 4 subs on the jobs' && k.heads.join('|') === '🏠 Oak House 3|🏠 Pine Cabin 1' && k.rows.map(r => r.call).join('|') === 'tel:9075550103|tel:9075550777|tel:9075550105|tel:9075550104' && k.rows.every(r => r.tapH >= 44), JSON.stringify(k && [k.now, k.heads, k.rows.map(r => [r.name, r.call])]));
  ok('it reads, it does not change: no ➕, no ✎, no ✕ — and the words say who keeps the list', !k.add && k.rows.every(r => !r.acts.length) && /Eric and the office keep this list/.test(k.hint) && await page.evaluate(() => { subsPick('Oak House'); const none = !$('subsAdd') && !document.querySelector('.sb-ed, .sb-off'); subsAddOpen(); subsEditOpen(Object.keys(subsBookNow().on)[0]); const p = subsPut('subs', { id: 'x1', co: 'Nope' }); return none && !$('subsForm') && p === null && !subsCanEdit(); }));
  ok('its Project portal has the plate on every job, and its job card shows who to call', await (async () => {
    await page.evaluate(async () => { closeReview(); openPortalWin(); await new Promise(r => setTimeout(r, 500)); portalFold(0); });
    await page.waitForTimeout(300);
    const plate = await page.evaluate(() => { const b = document.querySelector('#portalList .pf-subs'); return !!b && /^👷 Subs on this job · 3$/.test(b.textContent.trim()); });
    const card = await page.evaluate(() => { closePortalWin(); openJobCard('Oak House'); const b = $('revBox'); const r = [...b.querySelectorAll('.sb-card')].length === 3 && /^👷 Open the subs list — every job$/.test(b.querySelector('.sb-open').textContent.trim()); closeReview(); return r; });
    return plate && card;
  })());
  ok('💰 no meter on a crew phone — not in the portal, not anywhere', await page.evaluate(() => { prefs.downPay = { 'oak-111111': { a: 1000 } }; _dpSeen = { 'oak-111111': { way: 300, open: 400 } };
    const r = !dpMine() && dpMeterHtml('oak-111111', 'portal') === '' && dpLampHtml('oak-111111') === '' && dpHost('oak-111111', 'x') === '' && dpSay('oak-111111') === '' && !document.querySelector('.dp-box, [data-dp-lamp]'); delete prefs.downPay; return r; }));
  ok('a field phone wrote nothing for any of it', await page.evaluate(() => window._ups.length === 0));

  console.log('— 🏢 an office phone (Phil) —');
  await crewPhone('Phil', true);
  await page.evaluate(() => { window._ups.length = 0; openSubs('Oak House'); });
  ok('an OFFICE phone can add, edit and take off', await (async () => { const s = await subs(); return s.add && s.rows.length === 3 && s.rows.every(r => r.acts.join('|') === '✎ Edit|✕ Off this job') && /Every crew phone gets the whole list/.test(s.hint) && await page.evaluate(() => subsCanEdit() && amOffice()); })());
  await addSub('Oak House', { sbTrade: 'Roofing', sbCo: 'Top Shingle', sbPh: '907-555-0106' });
  await page.waitForTimeout(400);
  ok('his change shows on his own screen at once, goes into HIS OWN folder for Eric\'s phone to take — and says so', await page.evaluate(() => { const f = JSON.parse(_dbxFiles[DBX_ROOT + '/App Data/subs-edits.json'] || 'null'), s = f && Object.values(f.subs).find(x => x.co === 'Top Shingle');
    return subsRows('Oak House').some(r => r.s.co === 'Top Shingle') && !!s && s.by === 'Phil' && f.by === 'Phil' && Object.values(f.on).some(l => l.sid === s.id && l.job === 'Oak House') && window._ups.join('|') === DBX_ROOT + '/App Data/subs-edits.json|' + DBX_ROOT + '/App Data/subs-edits.json' && _said.some(t => /^👷 Top Shingle — on Oak House ✓ · Eric's phone gets it on its next sync$/.test(t)); }), await page.evaluate(() => JSON.stringify([window._ups, _said.slice(-2)])));
  ok('when Eric\'s list comes back carrying it, his own copy of the change is done with — and the sub is still there', await page.evaluate(async () => {
    const mine = JSON.parse(localStorage.getItem('daylog-subs-edits')), sh = JSON.parse(_dbxFiles[DBX_ROOT + '/shared.json']);
    const had = Object.keys(mine.subs).length === 1 && Object.keys(mine.on).length === 1;
    Object.assign(sh.subs.subs, mine.subs); Object.assign(sh.subs.on, mine.on);
    _dbxFiles[DBX_ROOT + '/shared.json'] = JSON.stringify(sh);
    await checkSharedNotes();
    const after = JSON.parse(localStorage.getItem('daylog-subs-edits'));
    return had && !Object.keys(after.subs).length && !Object.keys(after.on).length && subsRows('Oak House').some(r => r.s.co === 'Top Shingle') && subsCount('Oak House') === 4; }));
  ok('💰 the money stays on Eric\'s phone: an office phone draws no meter either', await page.evaluate(() => { prefs.downPay = { 'oak-111111': { a: 1000 } }; const r = dpMeterHtml('oak-111111', 'portal') === '' && dpLampHtml('oak-111111') === ''; delete prefs.downPay; return r; }));
  await page.evaluate(() => { localStorage.removeItem('daylog-crew-name'); localStorage.removeItem('daylog-crew-office'); localStorage.removeItem('daylog-crew-subs'); localStorage.removeItem('daylog-subs-edits'); localStorage.removeItem('daylog-dbx'); });

  ok('version bumped — APP_VER and the footer agree', /const APP_VER = 'v7\.(5[1-9]|[6-9]\d)'/.test(src) && new RegExp('<footer>' + (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1].replace('.', '\\.') + ' ·').test(src));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
