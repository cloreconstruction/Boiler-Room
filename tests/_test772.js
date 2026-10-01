// 📤 v7.72 — THE WHOLE CHART AS ONE PICTURE. Eric: "how can i get a screenshot or download this chart in a way i can see or
// share the whole thing if i need it on more than the app?" One plate under the chart draws every week of what the window is
// showing into one picture: on a phone it goes to the share sheet, on a PC it lands in Downloads. It may be handed to anyone,
// so it never carries a sub's name or his step notes. Every name below is made up; the days are worked out from today.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { fileURLToPath } = require('url');
(async () => {
  const appUrl = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const repo = path.dirname(fileURLToPath(appUrl));
  const src = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
  const csrc = fs.readFileSync(path.join(repo, 'c', 'index.html'), 'utf8');
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };
  const errs = [];
  const open = async (vp, phone) => {
    const ctx = await browser.newContext({ viewport: vp, isMobile: !!phone, hasTouch: !!phone, acceptDownloads: true });
    await ctx.route(u => !/^file:/.test(u.href), r => r.abort());
    const page = await ctx.newPage();
    page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
    await page.goto(appUrl); await page.waitForTimeout(700);
    return { ctx, page };
  };
  const stub = page => page.evaluate(() => {
    window._saves = 0; window.scheduleSave = () => { window._saves++; };
    window._dbxFiles = window._dbxFiles || {}; window._ups = [];
    window.dbxDownload = async p => (window._dbxFiles || {})[p] ?? null;
    window.dbxUpload = async (p, body) => { (window._dbxFiles || {})[p] = typeof body === 'string' ? body : '[file]'; window._ups.push(p); return { path_display: p }; };
    window.dbxPathExists = async p => Object.prototype.hasOwnProperty.call(window._dbxFiles || {}, p);
    window.dbxList = async () => ({ entries: [] }); window.dbxRpc = async () => ({});
    window.pushOut = () => false; window.cpPush = () => {}; window.cpReload = () => {};
    if (!window._said) { window._said = []; const t0 = window.toast; window.toast = (m, g) => { if (m) _said.push(String(m)); return t0(m, g); }; }
    dbx.refreshToken = 'test-token';
    // every download the page starts is noted (the anchor is clicked by the app itself)
    if (!window._dl) { window._dl = []; const c0 = HTMLAnchorElement.prototype.click; HTMLAnchorElement.prototype.click = function () { if (this.hasAttribute('download')) { window._dl.push({ name: this.download, href: this.href }); if (window._dlHold) return; } return c0.call(this); }; }
  });
  const plan = page => page.evaluate(() => {
    jobs = ['Oak House', 'Pine Cabin', 'Internal / Admin']; crew = ['Phil', 'Kevin']; prefs.office = ['Phil']; entries = []; todos = []; nextId = 1;
    delete prefs.subs; prefs.sched = { jobs: {} }; delete prefs.schedTaken; prefs.cards = {}; _portalIdx = null; _cardJob = '';
    localStorage.removeItem('daylog-sched-shade'); localStorage.removeItem('daylog-sched-zoom'); _schedShade = { we: false, fr: false, ho: false }; _schedZoom = 1; _schedWho = '';
    subsPut('subs', { id: 'sDK', co: 'Drain Kings', who: 'Pat', trade: 'Plumbing', ph: '907-555-0101', em: '' }); subsPut('on', { id: 'jDK', job: 'Oak House', sid: 'sDK', note: '' }); clearTimeout(_subsPubT);
    const mon = schedAddDays(schedMonday(localDay(new Date())), 7), d = n => schedAddDays(mon, n), put = (job, x) => schedPlan(job, true).steps.push(schedClean(x));
    window._mon = mon;
    put('Oak House', { n: 'a two day crew step with a long name', start: d(0), days: 2, who: 'crew' });
    put('Oak House', { n: 'drywall', start: d(2), days: 14, who: 'sub', sid: 'sDK', note: 'Pat said Tuesday, waiting on the permit' });
    put('Oak House', { n: 'rough-in inspection', start: d(9), days: 1, who: 'inspection' });   // mid-sheet: room for its name to the right
    put('Oak House', { n: 'move in to the new house at last', start: d(20), days: 1, who: 'homeowner' });   // the last day of the last week: no room to its right
    put('Oak House', { n: 'demo', start: schedAddDays(mon, -6), days: 3, who: 'crew', done: schedAddDays(mon, -4) });
    put('Pine Cabin', { n: 'siding', start: d(1), days: 10, who: 'crew' });
    renderJobSelects(); closePanels(); renderAll(); clearTimeout(_schedPubT); window._saves = 0; window._ups.length = 0; _said.length = 0;
    openSchedule('Oak House');
  });
  const shareStub = (page, mode) => page.evaluate(mode => { window._shared = null; window._shareCalls = 0;
    Object.defineProperty(navigator, 'canShare', { configurable: true, value: mode === 'none' ? undefined : d => !!(d && d.files && d.files.length) });
    Object.defineProperty(navigator, 'share', { configurable: true, value: mode === 'none' ? undefined : d => { window._shareCalls++; window._shared = d; return mode === 'abort' ? Promise.reject(Object.assign(new Error('he backed out'), { name: 'AbortError' })) : mode === 'fail' ? Promise.reject(Object.assign(new Error('not allowed'), { name: 'NotAllowedError' })) : Promise.resolve(); } }); }, mode);
  const png = buf => ({ sig: buf.slice(0, 8).toString('hex') === '89504e470d0a1a0a', w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) });

  // ---------------- the phone ----------------
  const { ctx, page } = await open({ width: 390, height: 844 }, true);
  await stub(page); await plan(page); await page.waitForTimeout(250);
  const today = await page.evaluate(() => localDay(new Date()));
  console.log('— 📤 the plate —');
  ok('under the chart, above ‹ Back: 📤 Share or save the whole chart — one picture, every week (a thumb tall, inside the phone); a job with no steps has no plate', await (async () => {
    const a = await page.evaluate(() => { const b = $('schPic'); if (!b) return false; const r = b.getBoundingClientRect(), back = [...$('revBox').querySelectorAll('button')].find(x => /^‹ Back/.test(x.textContent.trim()));
      return b.textContent.trim() === '📤 Share or save the whole chart — one picture, every week' && !!($('schedList').compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) && !!(b.compareDocumentPosition(back) & Node.DOCUMENT_POSITION_FOLLOWING) && r.height >= 48 && r.left >= 0 && r.right <= innerWidth + 0.5 && document.documentElement.scrollWidth <= innerWidth + 0.5; });
    await page.evaluate(() => { $('schedJob').value = 'Internal / Admin'; $('schedJob').dispatchEvent(new Event('change')); }); await page.waitForTimeout(120);
    const none = await page.evaluate(() => !$('schPic'));
    await page.evaluate(() => { $('schedJob').value = 'Oak House'; $('schedJob').dispatchEvent(new Event('change')); }); await page.waitForTimeout(120);
    return a && none;
  })());

  console.log('— 🖼 what is in the picture —');
  const m = await page.evaluate(() => schedPicModel(['Oak House']));
  // 🗓 v7.76 — a bar is as wide as the days it COVERS (its work days and the days off in between): the sub's 14 work days from a Wednesday cover 20
  const geo = await page.evaluate(() => { const w = schedWindow(['Oak House']); return { weeks: w.weeks, lo: w.lo, idx: n => 0, days: schedSorted('Oak House').map(s => [s.n, Math.round((schedDate(s.start) - schedDate(w.lo)) / 86400000), schedSpanDays(s), s.days]) }; });
  ok('the whole plan, every week of it: the sheet is as wide as ALL its weeks (no scrolling in a picture), a row a step in the order they start', m.weeks === geo.weeks && m.W === 28 * 2 + 300 + geo.weeks * 7 * 18 && m.chartW === geo.weeks * 126 && m.rowsN === 5 && m.bands.length === 1 && m.bands[0].job === 'Oak House'
    && m.bands[0].rows.map(r => r.n).join('|') === geo.days.map(d => d[0]).join('|') && m.heads.length === geo.weeks && m.heads.filter(h => h.now).length === 1, JSON.stringify({ W: m.W, weeks: m.weeks, rows: m.bands[0].rows.map(r => r.n) }));
  ok('every bar sits on its days: its left edge is its start day, its width the days it covers — its work days and the days off in between (a mark is one day wide)', m.bands[0].rows.every((r, i) => r.x === geo.days[i][1] * 18 && (r.mark ? r.w === 18 : r.w === geo.days[i][2] * 18))
    && geo.days.find(d => d[0] === 'drywall')[2] >= 20 && geo.days.find(d => d[0] === 'drywall')[3] === 14 && geo.days.find(d => d[0] === 'a two day crew step with a long name')[2] === 2, JSON.stringify(m.bands[0].rows.map(r => [r.n, r.x, r.w])));
  ok('🗓 the days a step does not work are struck through IN the bar: the sub\'s three weekends are three runs two days wide, right where they fall; a step that crosses none wears none; the key says so in words', (() => { const by = n => m.bands[0].rows.find(r => r.n === n), xs = by('drywall').xs;
    const covers = k => xs.some(o => o.x <= k * 18 && o.x + o.w >= (k + 2) * 18);   // the Saturday and Sunday that fall k days into the bar (a holiday beside them only makes the run wider)
    return xs.length >= 3 && covers(3) && covers(10) && covers(17) && xs.every(o => o.x >= 18 && o.x + o.w <= by('drywall').w - 18) && by('a two day crew step with a long name').xs.length === 0 && by('rough-in inspection').xs.length === 0 && by('move in to the new house at last').xs.length === 0 && m.legend.some(x => x[0] === 'x' && x[1] === 'not worked, not counted'); })(), JSON.stringify(m.bands[0].rows.map(r => [r.n, r.xs])));
  ok('the name goes IN the bar when it fits, BESIDE it when the bar is too short (to the right — or to the left when the sheet ends there); a mark\'s name is beside it', (() => { const by = n => m.bands[0].rows.find(r => r.n === n);
    return by('drywall').side === 'in' && by('a two day crew step with a long name').side === 'right' && by('rough-in inspection').side === 'right' && by('rough-in inspection').mark && by('move in to the new house at last').side === 'left' && by('demo').done === true; })(), JSON.stringify(m.bands[0].rows.map(r => [r.n, r.side])));
  ok('the left column says each step\'s days and who by KIND (crew · sub · inspection · homeowner), done in words; the head says what it is and as of when; the foot says the dates move', (() => { const by = n => m.bands[0].rows.find(r => r.n === n);
    return /^.+ to .+ · 2 work days · crew$/.test(by('a two day crew step with a long name').meta) && / · 14 work days · sub$/.test(by('drywall').meta) && / · 1 work day · inspection$/.test(by('rough-in inspection').meta) && / · 1 day · homeowner$/.test(by('move in to the new house at last').meta) && / · 3 work days · crew · done$/.test(by('demo').meta)
      && m.title === 'Oak House schedule' && m.sub.indexOf('As of ') === 0 && m.sub.endsWith(', ' + today.slice(0, 4)) && m.foot === 'A working plan. Dates move with weather, inspections and subs.' && m.legend.map(x => x[1]).join('|') === 'crew|sub|inspection|homeowner|not worked, not counted'; })(), JSON.stringify({ sub: m.sub, legend: m.legend, metas: m.bands[0].rows.map(r => r.meta) }));
  ok('🧱 it may be handed to anyone: the sub\'s NAME and his step note are nowhere in the picture\'s content', !/Drain Kings|Pat said|permit|sDK/.test(JSON.stringify(m)) && await page.evaluate(() => schedSteps('Oak House').some(s => s.sid === 'sDK' && /Pat said/.test(s.note))));
  ok('the drawing: a white sheet twice as sharp as its layout; the crew bar is solid, the sub\'s bar is an outline with a white middle, an empty lane is white, today\'s line is there', await page.evaluate(() => { const m = schedPicModel(['Oak House']), c = schedPicDraw(m), g = c.getContext('2d'), sc = c.width / m.W, P = SCHED_PIC, X0 = P.M + P.LAB;
    const px = (x, y) => [...g.getImageData(Math.round(x * sc), Math.round(y * sc), 1, 1).data].slice(0, 3), near = (a, b, t) => a.every((v, i) => Math.abs(v - b[i]) <= (t || 12));
    const by = n => m.bands[0].rows.find(r => r.n === n), crew = by('a two day crew step with a long name'), sub = by('drywall');
    let wkd = 5; while (sub.xs.some(o => o.x <= wkd * 18 && o.x + o.w > wkd * 18)) wkd++;   // a day the sub WORKS, past its name (v7.76 stripes the days it does not)
    const solid = near(px(X0 + crew.x + crew.w / 2, crew.y + 19), [138, 100, 24]), hollow = near(px(X0 + sub.x + wkd * 18 + 9, sub.y + 19), [255, 255, 255]), edge = near(px(X0 + sub.x + wkd * 18 + 9, sub.y + 8.8), [138, 100, 24], 60);
    // 🗓 v7.76 — across the sub's first weekend the bar is striped: both the black and the yellow are there, and no white
    let blk = 0, yel = 0, wht = 0; for (let k = 2; k < sub.xs[0].w - 2; k += 1) { const p = px(X0 + sub.x + sub.xs[0].x + k, sub.y + 19); if (p[0] < 60 && p[1] < 60 && p[2] < 60) blk++; else if (p[0] > 200 && p[1] > 160 && p[2] < 90) yel++; else if (p[0] > 240 && p[1] > 240 && p[2] > 240) wht++; }
    if (!(blk >= 3 && yel >= 3 && wht === 0)) return false;
    const empty = near(px(X0 + crew.x + crew.w + 200, by('rough-in inspection').y + 6), [255, 255, 255]) && near(px(4, 4), [255, 255, 255]);
    let red = false; for (let y = P.HEAD + 2; y < m.bottom; y += 1) { const p = px(X0 + m.todayX + 0.5, y); if (p[0] > 150 && p[1] < 90 && p[2] < 90) { red = true; break; } }
    return Math.abs(sc - 2) < 0.01 && c.width === Math.round(m.W * 2) && c.height === Math.round(m.H * 2) && solid && hollow && edge && empty && red && m.todayX >= 0; }));
  ok('with ☑ Weekends on the picture shades them too (a grey column a week) and its key names it; off again, they are gone', await page.evaluate(() => { _schedShade.we = true; const m = schedPicModel(['Oak House']), c = schedPicDraw(m), g = c.getContext('2d'), sc = c.width / m.W, P = SCHED_PIC, X0 = P.M + P.LAB;
    const we = m.off.filter(o => o.k === 'we'), p = [...g.getImageData(Math.round((X0 + we[we.length - 1].x + 18) * sc), Math.round((m.bands[0].rows[0].y + 4) * sc), 1, 1).data].slice(0, 3);
    _schedShade.we = false; const m2 = schedPicModel(['Oak House']);
    return we.length === m.weeks && we.every((o, i) => o.x === (i * 7 + 5) * 18 && o.w === 36) && m.legend.some(x => x[0] === 'we' && x[1] === 'weekend') && p.every(v => Math.abs(v - 233) <= 6) && m2.off.length === 0 && !m2.legend.some(x => x[0] === 'we'); }));

  console.log('— 📱 the phone: the share sheet rides the tap —');
  await shareStub(page, 'ok');
  ok('a tap hands ONE picture to the phone\'s share sheet in the same breath (nothing awaited before it) — a PNG named for the job and the day; nothing is downloaded', await (async () => {
    const r = await page.evaluate(async () => { window._dl.length = 0; $('schPic').click(); const sync = !!window._shared; const d = window._shared; if (!d) return { sync };
      const f = d.files[0], b = new Uint8Array(await f.arrayBuffer()), m = schedPicModel(['Oak House']);
      return { sync, n: d.files.length, name: f.name, type: f.type, size: f.size, sig: [...b.slice(0, 8)].map(x => x.toString(16).padStart(2, '0')).join(''), w: (b[16] << 24 | b[17] << 16 | b[18] << 8 | b[19]) >>> 0, h: (b[20] << 24 | b[21] << 16 | b[22] << 8 | b[23]) >>> 0, W: m.W, H: m.H, title: d.title, dl: window._dl.length, calls: window._shareCalls }; });
    return r.sync && r.n === 1 && r.name === 'Oak House schedule ' + today + '.png' && r.type === 'image/png' && r.size > 8000 && r.sig === '89504e470d0a1a0a' && r.w === r.W * 2 && r.h === r.H * 2 && r.title === 'Oak House schedule ' + today && r.dl === 0 && r.calls === 1;
  })());
  ok('he backs out of the share sheet: nothing else happens — no download, no warning', await (async () => {
    await shareStub(page, 'abort');
    await page.evaluate(() => { window._dl.length = 0; _said.length = 0; $('schPic').click(); }); await page.waitForTimeout(150);
    return await page.evaluate(() => window._shareCalls === 1 && window._dl.length === 0 && _said.length === 0);
  })(), await page.evaluate(() => JSON.stringify({ dl: window._dl, said: _said })));
  ok('a share sheet that FAILS (not his doing) falls back to the file, and says where it went; so does a phone with no share sheet for files', await (async () => {
    await shareStub(page, 'fail');
    await page.evaluate(() => { window._dlHold = true; window._dl.length = 0; _said.length = 0; $('schPic').click(); }); await page.waitForTimeout(200);
    const a = await page.evaluate(() => ({ dl: window._dl.map(x => x.name), blob: window._dl.every(x => /^blob:/.test(x.href)), said: _said.slice() }));
    await shareStub(page, 'none');
    await page.evaluate(() => { window._dl.length = 0; _said.length = 0; $('schPic').click(); }); await page.waitForTimeout(150);
    const b = await page.evaluate(() => ({ dl: window._dl.map(x => x.name), said: _said.slice() }));
    const name = 'Oak House schedule ' + today + '.png';
    return a.dl.join() === name && a.blob && a.said.some(s => s === '⬇ ' + name + ' — saved to your Downloads') && b.dl.join() === name && b.said.length === 1;
  })());
  ok('📋 Every job: one picture with a band a job, named "Every job schedule <day>.png"; the 👷 CREW ONLY filter rides into the picture and the head says so', await (async () => {
    await shareStub(page, 'ok');
    await page.evaluate(() => { $('schedJob').value = '*'; $('schedJob').dispatchEvent(new Event('change')); }); await page.waitForTimeout(150);
    const all = await page.evaluate(() => { $('schPic').click(); const m = schedPicModel(schedPicJobs()); return { name: window._shared.files[0].name, bands: m.bands.map(b => b.job + ':' + b.rows.length).join('|'), title: m.title, sameCols: m.W === 28 * 2 + 300 + m.weeks * 126 }; });
    await page.evaluate(() => { $('schedJob').value = 'Oak House'; $('schedJob').dispatchEvent(new Event('change')); schedWho('crew'); }); await page.waitForTimeout(150);
    const crew = await page.evaluate(() => { const m = schedPicModel(schedPicJobs()); const r = { rows: m.bands[0].rows.map(x => x.who).join('|'), sub: m.sub, legend: m.legend.map(x => x[1]).join('|') }; schedWho('crew'); return r; });
    return all.name === 'Every job schedule ' + today + '.png' && all.bands === 'Oak House:5|Pine Cabin:1' && all.title === 'Schedule, every job' && all.sameCols && crew.rows === 'crew|crew' && / · crew steps only$/.test(crew.sub) && crew.legend === 'crew';
  })());
  ok('nothing was written through all of it: no save, no upload — the picture is the only thing made', await page.evaluate(() => window._saves === 0 && window._ups.length === 0));

  console.log('— 👷 a field phone (Kevin) —');
  await page.evaluate(() => { closeReview(); localStorage.setItem('daylog-crew-name', 'Kevin'); localStorage.removeItem('daylog-crew-office');
    const d = new Date(), iso = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    localStorage.setItem('daylog-crew-sched', JSON.stringify({ jobs: { 'Oak House': { steps: [{ id: 's1', n: 'framing', days: 6, who: 'crew', start: iso, done: '' }] } } }));
    localStorage.setItem('daylog-dbx', JSON.stringify({ appKey: 'k', refreshToken: 'test-token', accessToken: 'a', expiresAt: Date.now() + 3600000 })); });
  await page.reload(); await page.waitForTimeout(900); await stub(page); await shareStub(page, 'ok');
  ok('a crew phone reads the plan and can share the same picture of it; nothing written', await (async () => {
    await page.evaluate(() => { jobs = ['Oak House']; window._ups.length = 0; window._saves = 0; openSchedule('Oak House'); }); await page.waitForTimeout(250);
    return await page.evaluate(() => { $('schPic').click(); const f = window._shared && window._shared.files[0]; const r = CREW_NAME === 'Kevin' && !!f && /^Oak House schedule \d{4}-\d\d-\d\d\.png$/.test(f.name) && f.size > 4000 && window._saves === 0 && window._ups.filter(p => !/pending\.json$/.test(p)).length === 0; closeReview(); return r; });
  })());
  await page.evaluate(() => { localStorage.removeItem('daylog-crew-name'); localStorage.removeItem('daylog-crew-sched'); });
  await ctx.close();

  // ---------------- the PC ----------------
  console.log('— 🖥 the PC: the picture lands in Downloads —');
  const pc = await open({ width: 1280, height: 860 }, false);
  await pc.page.evaluate(() => { dbx.refreshToken = 'test-token'; window._saves = 0; window.scheduleSave = () => { window._saves++; }; window._ups = []; window.dbxUpload = async p => { window._ups.push(p); return {}; }; window.dbxDownload = async () => null; window.dbxList = async () => ({ entries: [] }); window.dbxRpc = async () => ({}); window.pushOut = () => false;
    window._said = []; const t0 = window.toast; window.toast = (m, g) => { if (m) _said.push(String(m)); return t0(m, g); }; });
  await plan(pc.page); await pc.page.waitForTimeout(250);
  await shareStub(pc.page, 'ok');
  ok('on a PC a real click downloads the PNG (the share sheet is not used even where the browser has one): the file is named for the job and the day and is the whole chart', await (async () => {
    const [dl] = await Promise.all([pc.page.waitForEvent('download', { timeout: 15000 }), pc.page.click('#schPic')]);
    const file = await dl.path(), buf = fs.readFileSync(file), p = png(buf);
    const r = await pc.page.evaluate(() => { const m = schedPicModel(['Oak House']); return { W: m.W, H: m.H, calls: window._shareCalls, said: _said.slice(-1)[0] }; });
    return dl.suggestedFilename() === 'Oak House schedule ' + today + '.png' && p.sig && p.w === r.W * 2 && p.h === r.H * 2 && buf.length > 8000 && r.calls === 0 && /^⬇ Oak House schedule .+\.png — saved to your Downloads$/.test(r.said);
  })());
  ok('nothing was written by it on the PC either', await pc.page.evaluate(() => window._saves === 0 && window._ups.length === 0));
  await pc.ctx.close();

  ok('the homeowner\'s page has no word of it', !/schedPic|sch-pic/.test(csrc));
  ok('version bumped — APP_VER and the footer agree', /const APP_VER = 'v7\.(7[2-9]|[89]\d)'/.test(src) && new RegExp('<footer>' + (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1].replace('.', '\\.') + ' ·').test(src));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
