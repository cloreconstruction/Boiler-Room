// ↔ v7.70 — THE WEEK COLUMNS RESIZE. Eric: "on the gantt chart i need to be able to resize the date column so i can see the
// words in the bars better". A row over the chart — ↔ WEEK WIDTH  −  150%  + — makes every week wider or narrower; a tap on
// the percent puts it back; with a mouse the edge of a week's date drags. It is a way of looking: kept on the device, never
// written anywhere. Every name and day below is made up; the dates are relative to today.
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
    const ctx = await browser.newContext({ viewport: vp, isMobile: !!phone, hasTouch: !!phone });
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
  });
  const plan = page => page.evaluate(() => {
    jobs = ['Oak House', 'Pine Cabin', 'Internal / Admin']; crew = ['Phil', 'Kevin']; prefs.office = ['Phil']; entries = []; todos = []; nextId = 1;
    delete prefs.subs; prefs.sched = { jobs: {} }; delete prefs.schedTaken; prefs.cards = {}; _portalIdx = null; _cardJob = '';
    localStorage.removeItem('daylog-sched-zoom'); _schedZoom = 1;
    renderJobSelects(); closePanels(); renderAll();
    // thirteen weeks of plan, the first step this week: a five-day step with a long name is a sliver at the sheet's own width
    schedPasteText('Oak House', 'framing wrap-up 5 days\nplumbing rough-in 1.5 weeks\nheat and ducting 5 days\nrough-in inspection 1 day\ninsulation and foam 6 days\ndrywall, mud, texture 2.5 weeks\npaint walls and ceilings 1 week\nfloors, doors, trim 2 weeks\nelectrical trim and fixtures 2 days\nmove in 2 days');
    schedPasteText('Pine Cabin', 'siding 2 weeks\ngutters 2 days');
    clearTimeout(_schedPubT); window._saves = 0; window._ups.length = 0; _said.length = 0;
  });
  const look = page => page.evaluate(() => { const g = document.querySelector('#schedBox .sch-grid'), bars = [...document.querySelectorAll('#schedBox .sch-bar:not(.mark)')], head = document.querySelector('#schedBox .sch-head span'), c = document.querySelector('#schedBox .sch-chart');
    const bar = n => { const b = bars.find(x => x.textContent.trim() === n); return b ? { w: b.getBoundingClientRect().width, cut: b.scrollWidth > b.clientWidth + 1 } : null; };
    return { word: $('schZoomN') ? $('schZoomN').textContent.trim() : '', inline: g.getAttribute('style'), wkw: getComputedStyle(g).getPropertyValue('--wkw').trim(), week: head.getBoundingClientRect().width, lane: c.scrollWidth, scroll: c.scrollLeft, cut: bars.filter(b => b.scrollWidth > b.clientWidth + 1).length, bars: bars.length, framing: bar('framing wrap-up'), minus: $('schZoomOut').disabled, plus: $('schZoomIn').disabled }; });

  // ---------------- the phone ----------------
  const { ctx, page } = await open({ width: 390, height: 844 }, true);
  await stub(page); await plan(page);
  await page.evaluate(() => openSchedule('Oak House')); await page.waitForTimeout(250);
  console.log('— ↔ the row over the chart —');
  const a0 = await look(page);
  ok('the window wears ↔ WEEK WIDTH with −, 100% and + between the who-filter and the chart; at 100% the sheet\'s own width stands (no width written on the grid) and the long names are cut', await page.evaluate(() => { const z = $('schZoom'); return !!z && /↔ WEEK WIDTH/.test(z.textContent) && !!(z.compareDocumentPosition($('schedList')) & Node.DOCUMENT_POSITION_FOLLOWING) && !!(document.querySelector('#schedBox .sch-who').compareDocumentPosition(z) & Node.DOCUMENT_POSITION_FOLLOWING) && $('schZoomOut').textContent.trim() === '−' && $('schZoomIn').textContent.trim() === '+'; })
    && a0.word === '100%' && !/--wkw/.test(a0.inline) && a0.wkw === '52px' && Math.round(a0.week) === 52 && a0.framing.cut && a0.cut >= 5 && !a0.minus && !a0.plus, JSON.stringify(a0));
  ok('each plate says what it does in words for a reader that cannot see it, and is a thumb tall; the row fits the phone', await page.evaluate(() => { const r = b => b.getBoundingClientRect(); return /narrower weeks/.test($('schZoomOut').getAttribute('aria-label')) && /wider weeks/.test($('schZoomIn').getAttribute('aria-label')) && /week width 100% — tap to put it back to 100%/.test($('schZoomN').getAttribute('aria-label'))
    && [$('schZoomOut'), $('schZoomN'), $('schZoomIn')].every(b => r(b).height >= 44 && r(b).width >= 44 && r(b).right <= innerWidth + 0.5) && document.documentElement.scrollWidth <= innerWidth + 0.5; }));
  ok('+ once: 150% — every week is half again as wide, the grid carries the width, the bars grew with it', await (async () => {
    await page.evaluate(() => $('schZoomIn').click()); await page.waitForTimeout(120);
    const a = await look(page);
    return a.word === '150%' && /--wkw:78px/.test(a.inline) && Math.round(a.week) === 78 && Math.abs(a.framing.w / a0.framing.w - 1.5) < 0.06 && a.lane > a0.lane;
  })(), JSON.stringify(await look(page)));
  ok('+ to the end (200 · 300 · 400 · 500%): the long name reads whole in its bar, fewer bars are cut, and + goes dark at the widest', await (async () => {
    const words = [];
    for (let i = 0; i < 4; i++) { await page.evaluate(() => $('schZoomIn').click()); await page.waitForTimeout(80); words.push((await look(page)).word); }
    const a = await look(page);
    await page.evaluate(() => $('schZoomIn').click());   // a tap on the dark plate changes nothing
    const b = await look(page);
    return words.join(' ') === '200% 300% 400% 500%' && a.plus && !a.minus && Math.round(a.week) === 260 && !a.framing.cut && a.cut < a0.cut && b.word === '500%';
  })(), JSON.stringify(await look(page)));
  ok('it is kept on THIS device (not in his prefs, not in a file): the window shut and opened again, and a real reload, still 500%', await (async () => {
    const kept = await page.evaluate(() => localStorage.getItem('daylog-sched-zoom'));
    await page.evaluate(() => { closeReview(); openSchedule('Oak House'); }); await page.waitForTimeout(150);
    const again = (await look(page)).word;
    const clean = await page.evaluate(() => window._saves === 0 && window._ups.length === 0 && !JSON.stringify(prefs).includes('zoom') && !('schedZoom' in prefs));
    return kept === '5' && again === '500%' && clean;
  })());
  ok('− steps back down; the percent tapped puts it at 100% in one go and takes the width off the grid', await (async () => {
    await page.evaluate(() => $('schZoomOut').click()); await page.waitForTimeout(80);
    const a = (await look(page)).word;
    await page.evaluate(() => $('schZoomN').click()); await page.waitForTimeout(80);
    const b = await look(page);
    return a === '400%' && b.word === '100%' && !/--wkw/.test(b.inline) && Math.round(b.week) === 52 && await page.evaluate(() => localStorage.getItem('daylog-sched-zoom') === '1');
  })());
  ok('− from 100%: 70% — more weeks on the screen; − goes dark at the narrowest', await (async () => {
    await page.evaluate(() => $('schZoomOut').click()); await page.waitForTimeout(80);
    const a = await look(page);
    return a.word === '70%' && Math.round(a.week) === 36 && a.minus && !a.plus && a.lane < a0.lane;
  })(), JSON.stringify(await look(page)));
  ok('the date at the left edge of the chart stays there through a change: scrolled a few weeks in, then twice as wide, the scroll is twice as far', await (async () => {
    await page.evaluate(() => { $('schZoomN').click(); }); await page.waitForTimeout(80);
    const lab = await page.evaluate(() => schedLabPx(document.querySelector('#schedBox .sch-chart')));
    await page.evaluate(() => { document.querySelector('#schedBox .sch-chart').scrollLeft = 156; });   // three weeks in at 52px
    await page.evaluate(() => { $('schZoomIn').click(); $('schZoomIn').click(); }); await page.waitForTimeout(120);   // 200%
    const a = await look(page);
    return a.word === '200%' && Math.abs(a.scroll - 312) <= 3 && lab === 148;
  })(), JSON.stringify(await look(page)));
  ok('today\'s line is still inside this week\'s column at any width', await page.evaluate(() => { const ck = () => { const t = document.querySelector('#schedBox .sch-today'), w = document.querySelector('#schedBox .sch-wk-now'); if (!t || !w) return false; const x = t.getBoundingClientRect().left, r = w.getBoundingClientRect(); return x >= r.left - 1 && x <= r.right + 1; };
    const a = ck(); schedZoomTo(5); const b = ck(); schedZoomTo(0.7); const c = ck(); schedZoomTo(1); return a && b && c && ck(); }));
  ok('📋 Every job: every band takes the same width, so the weeks still line up one under the other', await (async () => {
    await page.evaluate(() => { schedZoomTo(2); $('schedJob').value = '*'; $('schedJob').dispatchEvent(new Event('change')); }); await page.waitForTimeout(150);
    return await page.evaluate(() => { const gs = [...document.querySelectorAll('#schedBox .sch-grid')]; const xs = gs.map(g => [...g.querySelectorAll('.sch-head span')].map(s => Math.round(s.getBoundingClientRect().width)).join(',')); const ls = gs.map(g => Math.round(g.querySelector('.sch-head span').getBoundingClientRect().left - g.getBoundingClientRect().left));
      return gs.length === 2 && gs.every(g => /--wkw:104px/.test(g.getAttribute('style'))) && xs[0] === xs[1] && ls[0] === ls[1] && document.querySelectorAll('#schZoom').length === 1; });
  })());
  ok('a tap on a row still opens its editor, and a move still moves the plan — the width is only how it is drawn (nothing of it in the plan, the crew\'s copy or a page)', await (async () => {
    await page.evaluate(() => { $('schedJob').value = 'Oak House'; $('schedJob').dispatchEvent(new Event('change')); }); await page.waitForTimeout(120);
    const r = await page.evaluate(() => { const st = schedSorted('Oak House'); const was = st[1].start; document.querySelectorAll('#schedBox .sch-lab')[1].click(); const ed = !!$('schEdit') || !!document.querySelector('#schedBox .sch-edit'); const want = schedShift({ who: st[1].who, start: was }, 1, 0).start; schedMoveBy('Oak House', st[1].id, 1, 0); const moved = want > was && schedSorted('Oak House').find(s => s.id === st[1].id).start === want; schedMoveBy('Oak House', st[1].id, -1, 0);   /* v7.76 — a week later, the same weekday */
      const pub = JSON.stringify(schedPublish()), cut = JSON.stringify(schedPageCut('Oak House')); clearTimeout(_schedPubT); return { ed, moved, clean: !/zoom|wkw/i.test(pub) && !/zoom|wkw/i.test(cut) && !/zoom|wkw/i.test(JSON.stringify(prefs.sched)) }; });
    return r.ed && r.moved && r.clean;
  })());
  ok('a finger on the edge of a week\'s date does not resize (it scrolls the chart, as ever) — the grip is not even drawn on a touch screen', await page.evaluate(() => { const g = document.querySelector('#schedBox .sch-wk-grip'); if (!g) return false; const before = _schedZoom; const ev = new PointerEvent('pointerdown', { pointerType: 'touch', button: 0, clientX: 100, bubbles: true }); g.dispatchEvent(ev); window.dispatchEvent(new PointerEvent('pointermove', { pointerType: 'touch', clientX: 220 })); window.dispatchEvent(new PointerEvent('pointerup', { pointerType: 'touch' }));
    return _schedZoom === before && getComputedStyle(g).display === 'none' && getComputedStyle(document.querySelector('.sch-zoom-tip')).display === 'none'; }));
  await page.evaluate(() => { schedZoomTo(3); closeReview(); });
  await page.reload(); await page.waitForTimeout(900); await stub(page);
  ok('after a real reload the phone still draws the weeks at 300%', await (async () => {
    await page.evaluate(() => { jobs = ['Oak House']; prefs.sched = { jobs: {} }; schedPasteText('Oak House', 'framing wrap-up 5 days\ndrywall 2 weeks'); clearTimeout(_schedPubT); openSchedule('Oak House'); }); await page.waitForTimeout(200);
    const a = await look(page);
    await page.evaluate(() => { closeReview(); });
    return a.word === '300%' && Math.round(a.week) === 156;
  })());

  console.log('— 👷 a field phone (Kevin) —');
  await page.evaluate(() => { localStorage.setItem('daylog-crew-name', 'Kevin'); localStorage.removeItem('daylog-crew-office'); localStorage.removeItem('daylog-sched-zoom'); localStorage.setItem('daylog-crew-sched', JSON.stringify({ jobs: { 'Oak House': { steps: [{ id: 's1', n: 'framing wrap-up', days: 5, who: 'crew', start: new Date().toISOString().slice(0, 10), done: '' }, { id: 's2', n: 'drywall, mud, texture', days: 17, who: 'sub', start: new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10), done: '' }] } } })); localStorage.setItem('daylog-dbx', JSON.stringify({ appKey: 'k', refreshToken: 'test-token', accessToken: 'a', expiresAt: Date.now() + 3600000 })); });
  await page.reload(); await page.waitForTimeout(900); await stub(page);
  ok('a crew phone reads the plan and has the same ↔ row: wider weeks on its own screen, nothing written anywhere', await (async () => {
    await page.evaluate(() => { jobs = ['Oak House']; window._ups.length = 0; window._saves = 0; openSchedule('Oak House'); }); await page.waitForTimeout(250);
    const a = await look(page);
    await page.evaluate(() => { $('schZoomIn').click(); $('schZoomIn').click(); }); await page.waitForTimeout(120);
    const b = await look(page);
    const r = await page.evaluate(() => { const r = CREW_NAME === 'Kevin' && !document.querySelector('#schedBox .sch-tools') && localStorage.getItem('daylog-sched-zoom') === '2' && window._saves === 0 && window._ups.filter(p => !/pending\.json$/.test(p)).length === 0; closeReview(); return r; });
    return a.word === '100%' && b.word === '200%' && Math.round(b.week) === 104 && r;
  })());
  await page.evaluate(() => { localStorage.removeItem('daylog-crew-name'); localStorage.removeItem('daylog-crew-sched'); localStorage.removeItem('daylog-sched-zoom'); });
  await ctx.close();

  // ---------------- the PC, with a real mouse ----------------
  console.log('— 🖥 the PC: the edge of a week\'s date drags —');
  const pc = await open({ width: 1280, height: 860 }, false);
  await stub(pc.page); await plan(pc.page);
  await pc.page.evaluate(() => openSchedule('Oak House')); await pc.page.waitForTimeout(250);
  const p0 = await look(pc.page);
  ok('on a PC the row says the edge of a week\'s date drags, and the grip is there (a column-resize pointer) on every week', await pc.page.evaluate(() => { const tip = document.querySelector('.sch-zoom-tip'), gs = [...document.querySelectorAll('#schedBox .sch-wk-grip')], hs = document.querySelectorAll('#schedBox .sch-head span').length;
    return getComputedStyle(tip).display !== 'none' && /drag the edge of a week's date/.test(tip.textContent) && gs.length === hs && gs.every(g => getComputedStyle(g).display === 'block' && getComputedStyle(g).cursor === 'col-resize'); }), JSON.stringify(p0));
  ok('a real mouse drags the edge of the second week 80px to the right: the weeks follow the pointer while it moves, and let go keeps it (the percent says so, the device remembers)', await (async () => {
    const box = await pc.page.evaluate(() => { const g = document.querySelectorAll('#schedBox .sch-wk-grip')[1]; g.scrollIntoView({ block: 'center' }); const r = g.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, week: g.parentElement.getBoundingClientRect().width }; });
    await pc.page.mouse.move(box.x, box.y); await pc.page.mouse.down(); await pc.page.mouse.move(box.x + 40, box.y, { steps: 4 });
    const mid = await pc.page.evaluate(() => document.querySelector('#schedBox .sch-head span').getBoundingClientRect().width);
    await pc.page.mouse.move(box.x + 80, box.y, { steps: 4 }); await pc.page.mouse.up(); await pc.page.waitForTimeout(150);
    const a = await look(pc.page);
    const want = Math.round((box.week + 80) / 56 * 100) / 100;
    return mid > box.week + 30 && Math.abs(a.week - (box.week + 80)) <= 2 && Math.abs(parseFloat(await pc.page.evaluate(() => localStorage.getItem('daylog-sched-zoom'))) - want) < 0.03 && a.word === (Math.round(want * 20) * 5) + '%' && a.cut < p0.cut;
  })(), JSON.stringify(await look(pc.page)));
  ok('a click on the grip with no drag changes nothing; the plates step from wherever the drag left it', await (async () => {
    const before = (await look(pc.page)).word;
    const box = await pc.page.evaluate(() => { const r = document.querySelectorAll('#schedBox .sch-wk-grip')[0].getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    await pc.page.mouse.move(box.x, box.y); await pc.page.mouse.down(); await pc.page.mouse.up(); await pc.page.waitForTimeout(80);
    const same = (await look(pc.page)).word === before;
    await pc.page.evaluate(() => $('schZoomIn').click()); await pc.page.waitForTimeout(80);
    const up = await pc.page.evaluate(() => _schedZoom);
    return same && [3, 4, 5].includes(up);
  })(), JSON.stringify(await look(pc.page)));
  ok('− when every week is already on the screen says so and leaves the width alone (a short plan on a wide screen)', await (async () => {
    await pc.page.evaluate(() => { schedZoomTo(1); $('schedJob').value = 'Pine Cabin'; $('schedJob').dispatchEvent(new Event('change')); _said.length = 0; }); await pc.page.waitForTimeout(150);
    const fits = await pc.page.evaluate(() => [...document.querySelectorAll('#schedBox .sch-chart')].every(c => c.scrollWidth <= c.clientWidth + 1));
    await pc.page.evaluate(() => $('schZoomOut').click()); await pc.page.waitForTimeout(80);
    return fits && await pc.page.evaluate(() => _schedZoom === 1 && $('schZoomN').textContent.trim() === '100%' && _said.some(m => /Every week is already on the screen/.test(m)));
  })(), await pc.page.evaluate(() => JSON.stringify(_said)));
  ok('nothing was written through all of it — no save of his prefs for a width, no upload', await pc.page.evaluate(() => window._ups.length === 0 && !JSON.stringify(prefs).includes('sched-zoom') && !('schedZoom' in prefs)));
  await pc.ctx.close();

  ok('the homeowner\'s page has no word of it; the width never rides in a file (one key, on the device)', !/sched-zoom|schedZoom/.test(csrc) && (src.match(/daylog-sched-zoom/g) || []).length >= 2 && !/prefs\.schedZoom/.test(src));
  ok('version bumped — APP_VER and the footer agree', /const APP_VER = 'v7\.([7-9]\d)'/.test(src) && new RegExp('<footer>' + (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1].replace('.', '\\.') + ' ·').test(src));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
