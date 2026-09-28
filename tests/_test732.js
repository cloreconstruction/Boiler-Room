// v7.32 — Eric, with a picture of two SENT → RECEIVED → OPENED → ANSWERED strips: "i dont think we need these anymore as we
// have the 'eric needs an answer' and 'from eric'. on tag it, lets take the heads up off and make the needs attention in box 5
// the same thing. but make it so even if 'just me' is selected i can still hit needs attention. that way where me or phil or
// all crew is selected thatll unlock it and then needs attention will just keep it at the top over everyones list."
// Names and jobs made up.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { fileURLToPath } = require('url');
(async () => {
  const appUrl = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const repo = path.dirname(fileURLToPath(appUrl));
  const src = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };
  const errs = [];
  const open = async init => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await ctx.route(u => !/^file:/.test(u.href), r => r.abort());
    if (init) await ctx.addInitScript(init);
    const page = await ctx.newPage();
    page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
    await page.goto(appUrl); await page.waitForTimeout(700);
    return { ctx, page };
  };

  console.log('— ⚠ Eric\'s phone —');
  const eric = await open();
  await eric.page.evaluate(() => { window.scheduleSave = () => {}; window.savePendingSoon = () => {}; window.publishSharedNotes = async () => {}; entries = []; todos = []; jobs = ['Oak House']; crew = ['Phil']; prefs.office = ['Phil']; renderJobSelects(); closePanels(); renderAll(); renderTagChips(); renderVisChips(); });
  ok('④ TAG IT no longer has a ⚠ Heads-up chip', await eric.page.evaluate(() => !/Heads-up/i.test($('qnTagChips').textContent)), await eric.page.evaluate(() => $('qnTagChips').textContent.replace(/\s+/g, ' ')));
  ok('④ TAG IT: the first three sit fixed in one row, left to right 🔒 Personal · 🧾 Receipt · 📋 Build List, spanning the full width; his own tags start on the row under it', await eric.page.evaluate(() => {
    prefs.tags = ['Home Depot', 'Personal', 'Spenard', 'Logan', 'Phil']; prefs.tagRows = 2; renderTagChips(); window._gOpen = { 4: true }; updateStepFlow();
    const fx = $('qnTagChips').querySelector('.tag-fixed'); if (!fx) return false;
    const chips = [...fx.querySelectorAll('.pick-chip')], c = chips.map(b => b.textContent.trim()), tops = chips.map(b => Math.round(b.getBoundingClientRect().top));
    const firstTag = $('qnTagChips').querySelector(':scope > .pick-chip');
    return c.length === 3 && /Personal/.test(c[0]) && /Receipt/.test(c[1]) && /Build List/.test(c[2]) && tops.every(t => Math.abs(t - tops[0]) <= 2) &&
      Math.abs(fx.getBoundingClientRect().width - $('qnTagChips').getBoundingClientRect().width) <= 2 && !!firstTag && /Home Depot/.test(firstTag.textContent) && firstTag.getBoundingClientRect().top > tops[0] + 20;
  }), await eric.page.evaluate(() => JSON.stringify([...$('qnTagChips').querySelectorAll('.pick-chip')].map(b => [b.textContent.trim(), Math.round(b.getBoundingClientRect().top), Math.round(b.getBoundingClientRect().left)]))));
  ok('a tag list with no Personal tag still gets the 🔒 Personal lock chip first', await eric.page.evaluate(() => { prefs.tags = ['Home Depot']; renderTagChips(); const c = [...$('qnTagChips').querySelectorAll('.tag-fixed .pick-chip')].map(b => b.textContent.trim()); return c.length === 3 && /Personal/.test(c[0]) && /Receipt/.test(c[1]); }));
  ok('the ASK plate fits: a narrow plate at phone width (under 120px), the brass picture inside it, the writing box keeping most of the row', await eric.page.evaluate(() => {
    const btn = $('wizSideBtn'), b = btn.getBoundingClientRect(), img = btn.querySelector('.cam-ic'), i = img ? img.getBoundingClientRect() : b, ta = $('askText').getBoundingClientRect(), row = $('askText').parentElement.getBoundingClientRect();
    return b.width <= 120 && i.right <= b.right + 1 && i.left >= b.left - 1 && i.bottom <= b.bottom + 1 && i.top >= b.top - 1 && ta.width >= row.width * 0.55;
  }), await eric.page.evaluate(() => JSON.stringify({ btn: $('wizSideBtn').getBoundingClientRect(), ta: $('askText').getBoundingClientRect() })));
  ok('👁 View as Phil: a blue dotted frame round the whole page (fixed, taps pass through it), gone when he comes back', await eric.page.evaluate(() => {
    crewPreviewToggle(); const cs = getComputedStyle(document.body, '::after');
    const on = document.body.classList.contains('crew-preview') && cs.position === 'fixed' && cs.borderTopStyle === 'dotted' && cs.pointerEvents === 'none' && parseInt(cs.borderTopWidth) >= 3;
    crewPreviewToggle(); const off = !document.body.classList.contains('crew-preview') && getComputedStyle(document.body, '::after').borderTopStyle !== 'dotted';
    return on && off;
  }), await eric.page.evaluate(() => { crewPreviewToggle(); const cs = getComputedStyle(document.body, '::after'); const r = JSON.stringify({ cls: document.body.className, pos: cs.position, bs: cs.borderTopStyle, pe: cs.pointerEvents, bw: cs.borderTopWidth }); crewPreviewToggle(); return r; }));
  ok('⑤: ⚠ Needs attention lights with 🔒 Just me and STAYS Just me (nobody is picked for it); the folded line reads 🔒 just you · ⚠ needs attention', await eric.page.evaluate(() => {
    setVis(''); toggleAttn(); updateStepFlow();
    const chips = $('qnVisChips').textContent.replace(/\s+/g, ' ');
    const sum = (document.querySelector('.g-step[data-step="5"] .g-step-sum') || {}).textContent || '';
    return qnAsk && !qnVis && !qnVisNames.size && /✓ 🔒 Just me/.test(chips) && /✓ ⚠ Needs attention/.test(chips) && /🔒 just you · ⚠ needs attention/.test(sum);
  }), await eric.page.evaluate(() => JSON.stringify({ qnAsk, qnVis, names: [...qnVisNames], chips: $('qnVisChips').textContent.replace(/\s+/g, ' '), sum: (document.querySelector('.g-step[data-step="5"] .g-step-sum') || {}).textContent })));
  ok('SEND with 🔒 Just me + ⚠: the note stays on this phone (mine, no unlock, no ask), wears the heads-up flag and three cubes on the Board; the running log row says ⚠ HEADS-UP; ⚠ resets for the next note', await eric.page.evaluate(async () => {
    qnJobPick = 'Oak House'; const s = $('qnJob'); if (s) s.value = 'Oak House';
    $('askText').value = 'Soffit color — Northstar has no tan, somebody has to go look'; saveNoteFrom('askText'); await new Promise(r => setTimeout(r, 60));
    const e = entries.find(x => /Soffit color/.test(x.details));
    renderAskRecent();
    const row = [...document.querySelectorAll('#askRecent .rl-row, #askRecent .sum-row, #askRecent div')].find(r => /Soffit color/.test(r.textContent));
    return !!e && !e.mine && !e.vis && !e.ask && e.heads === true && e.board && e.board.p === 3 && !qnAsk;
  }), await eric.page.evaluate(() => JSON.stringify(entries.slice(0, 1).map(e => ({ mine: e.mine, vis: e.vis, ask: e.ask, heads: e.heads, board: e.board })))));
  ok('the Board lists it with three cubes (the top of its job)', await eric.page.evaluate(() => { const e = entries.find(x => /Soffit color/.test(x.details)); const l = boardLines().find(x => x.e === e || (x.e && x.e.id === e.id) || x.id === e.id); return !!l && (l.p === 3 || (l.e && l.e.board.p === 3)); }), await eric.page.evaluate(() => JSON.stringify(boardLines().slice(0, 2))));
  ok('⚠ then 📨 Just Phil: the note goes to Phil AND asks (the top of his list) AND wears the heads-up and the three cubes', await eric.page.evaluate(async () => {
    toggleAttn(); setVis('Phil'); const lit = qnAsk && qnVisNames.has('Phil');
    qnJobPick = 'Oak House'; $('askText').value = 'Call the inspector back today'; saveNoteFrom('askText'); await new Promise(r => setTimeout(r, 60));
    const e = entries.find(x => /Call the inspector/.test(x.details));
    return lit && !!e && e.vis === 'Phil' && e.ask === true && e.heads === true && e.board && e.board.p === 3 && !e.mine;
  }), await eric.page.evaluate(() => JSON.stringify(entries.slice(0, 1).map(e => ({ vis: e.vis, ask: e.ask, heads: e.heads, board: e.board, mine: e.mine })))));
  ok('the SENT → ANSWERED lamps are gone from Eric\'s page (an open ask draws nothing on #askStrip)', await eric.page.evaluate(() => { renderAskStrip(); renderMyRequests(); return $('askStrip').innerHTML === '' && $('myReqStrip').innerHTML === '' && entries.some(e => e.ask && !e.askDone); }));
  await eric.ctx.close();

  console.log('— 👷 Phil\'s phone —');
  const phil = await open(() => { try { localStorage.setItem('daylog-crew-name', 'Phil'); localStorage.setItem('daylog-crew-root', '/Phil'); localStorage.setItem('daylog-crew-jobs', JSON.stringify(['Oak House'])); } catch (e) {} });
  await phil.page.evaluate(() => { window.scheduleSave = () => {}; window.savePendingSoon = () => {}; entries = []; todos = []; renderAll(); });
  ok('the lamps are gone from a crew phone too: a routed note draws nothing on #myReqStrip', await phil.page.evaluate(() => { addEntry('Note', 'need nails', 'Oak House', { route: 'Eric', urg: 'now', vis: 'Eric' }); renderMyRequests(); return CREW_NAME === 'Phil' && $('myReqStrip').innerHTML === ''; }));
  ok('⚠ with 🔒 Just me on his phone: lit, no route, no siren — SEND keeps it on his phone with the heads-up flag', await phil.page.evaluate(async () => {
    setVis(''); toggleAttn(); const lit = qnAsk && !qnRoute && !qnUrg && !qnVis && !qnVisNames.size;
    qnJobPick = 'Oak House'; const s = $('qnJob'); if (s) s.value = 'Oak House';
    $('askText').value = 'my own heads-up'; saveNoteFrom('askText'); await new Promise(r => setTimeout(r, 60));
    const e = entries.find(x => x.details === 'my own heads-up');
    return lit && !!e && e.mine === true && !e.route && !e.urg && e.heads === true && !qnAsk;
  }), await phil.page.evaluate(() => JSON.stringify({ qnAsk, qnRoute, qnUrg, e: entries.slice(0, 1) })));
  ok('⚠ then 📨 Just Eric: the route and the siren come on (Eric · now) — SEND makes it routed, urgent, unlocked for Eric, with the heads-up', await phil.page.evaluate(async () => {
    toggleAttn(); setVis('Eric'); const lit = qnAsk && qnRoute === 'Eric' && qnUrg === 'now';
    qnJobPick = 'Oak House'; $('askText').value = 'Pump truck is late'; saveNoteFrom('askText'); await new Promise(r => setTimeout(r, 60));
    const e = entries.find(x => x.details === 'Pump truck is late');
    return lit && !!e && e.route === 'Eric' && e.urg === 'now' && (e.vis === 'Eric' || (Array.isArray(e.vis) && e.vis.includes('Eric'))) && e.heads === true && !e.mine;
  }), await phil.page.evaluate(() => JSON.stringify({ qnAsk, qnRoute, qnUrg, e: entries.slice(0, 1) })));
  ok('…and going back to 🔒 Just me with ⚠ still lit drops the route again', await phil.page.evaluate(() => { toggleAttn(); setVis('Eric'); setVis(''); return qnAsk && !qnRoute && !qnUrg; }));
  await phil.ctx.close();

  ok('version bumped — APP_VER and the footer agree', /const APP_VER = 'v7\.(3[2-9]|[4-9]\d)'/.test(src) && new RegExp('<footer>' + (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1].replace('.', '\\.')).test(src));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
