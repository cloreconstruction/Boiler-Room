// v7.21 — four of Eric's asks, 2026-09-25. (1) "When I click on Edit in the build list and I'm changing a single item I want the
// photo window to be at the top, just under the name. Then the note next then the rest can stay in that order." (2) "when I put
// the photo in and the Wizard reads it and puts the description … that description needs to go at the top. But I still want the
// note to be able to have notes in it and be able to be changed and updated … the text description needs to be up next to the
// note, or in a different place than the note." (3) "sonnet 5 is good to go." (4) "Where is my 'From Phil' button on the running
// log?" Every name and figure here is made up.
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
    jobs = ['Oak House']; crew = ['Phil', 'Kevin']; entries = []; todos = []; nextId = 1; pendingQueue = [];
    window.scheduleSave = () => {}; window.savePendingSoon = () => {}; window.publishSharedNotes = () => {};
    renderJobSelects(); closePanels(); renderAll();
    dbx.refreshToken = 't'; _portalIdx = { clients: [{ key: 'oak', job: 'Oak House', code: 'oak-111aaa' }] };
    window._dbxFiles = {}; window.dbxDownload = async p => (window._dbxFiles || {})[p] ?? null; window.dbxUpload = async (p, b) => { window._dbxFiles[p] = b; return {}; };
    window.dbxPathExists = async p => Object.prototype.hasOwnProperty.call(window._dbxFiles, p);
    _dbxFiles[portalRoot() + '/materials-office-oak-111aaa.json'] = JSON.stringify({ full: true, seq: 9, rooms: [
      { name: 'KITCHEN', items: [
        { id: 'p1', n: 'Faucet', t: 'Misc', buy: true, s: 'picked', sel: 'his note' },
        { id: 'p2', n: 'Hood', t: 'Misc', buy: true, s: 'pick' },
        { id: 'p3', n: 'Their tile', t: 'Misc', hm: true, s: 'picked', pick: 'White subway', sel: 'office words' },
        { id: 'c1', n: 'Check vents', t: 'Misc', s: 'todo' }] }] });
    await openMaterials(0);
    window._folded = { n: _matRmShut.size, rooms: _matD.rooms.length, rows: document.querySelectorAll('#revBox .mat-item').length, head: (document.querySelector('#revBox .mat-rm-head') || {}).textContent || '' };
    _matRmShut = new Set(); renderMatMgr();   // the checks below look at open rows
    window._it = id => _matD.rooms.flatMap(r => r.items).find(x => x.id === id);
    window._rowId = id => document.querySelector('#revBox .mat-item[data-id="' + id + '"]');
    window._secs = () => [...document.querySelectorAll('#matSheet .ms-h, #matSheet .ms-fold')].map(x => x.textContent.replace(/\s+/g, ' ').trim());
  });

  console.log('— 📁 (5) the board opens with every category folded —');
  ok('on open every category is folded: no rows drawn, the heading says its counts and how many are open', await page.evaluate(() => _folded.n === _folded.rooms && _folded.rooms === 1 && _folded.rows === 0 && /KITCHEN/.test(_folded.head) && /4 open/.test(_folded.head.replace(/\s+/g, ' '))), await page.evaluate(() => JSON.stringify(_folded)));
  ok('a tap on the heading opens it; a working-list chip unfolds every category; ➕ item unfolds its own', await page.evaluate(() => {
    _matRmShut = new Set([0]); renderMatMgr(); const a = document.querySelectorAll('#revBox .mat-item').length === 0;
    document.querySelector('#revBox .mat-rm-head button[aria-expanded]').click(); const b = _matRmShut.size === 0 && document.querySelectorAll('#revBox .mat-item').length === 4;
    _matRmShut = new Set([0]); renderMatMgr();
    [...$('matStageChips').querySelectorAll('button')].find(x => /to pick/.test(x.textContent)).click(); const c = _matRmShut.size === 0 && _matStageF === 'topick' && document.querySelectorAll('#revBox .mat-item').length === 1;
    _matStageF = ''; _matRmShut = new Set([0]); renderMatMgr();
    matAddItem(0); const d = _matRmShut.size === 0 && !!_matEdit; matEditClose();
    _matD.rooms[0].items = _matD.rooms[0].items.filter(x => x.id !== _matEdit && x.n !== 'New item'); renderMatMgr();
    return a && b && c && d;
  }));

  console.log('— 📷 (1) the photos right under the name; 👆 (2) what was picked in its own box —');
  ok('a thing to buy: Name · 📷 Photos · 👆 Picked — what it is · Note · What kind · Its lights · then the folds as before', await page.evaluate(() => {
    matEditOpen('p1'); const s = _secs();
    const r = s.slice(0, 6).join(' | ') === 'Name | 📷 Photos | 👆 Picked — what it is | Note — shows on the row | What kind of row | Its lights — tap one, then tap it again' &&
      /💵 Money/.test(s[6]) && /📁 Pocket/.test(s[s.length - 2]) && /🕘 Changes/.test(s[s.length - 1]) && !!$('matDesc-p1') && $('matDesc-p1').value === '' && $('matSel-p1').value === 'his note';
    matEditClose(); return r;
  }), await page.evaluate(() => { matEditOpen('p1'); const s = _secs().join(' | '); matEditClose(); return s; }));
  ok('a checklist row has no 👆 box — Name · 📷 Photos · Note …', await page.evaluate(() => {
    matEditOpen('c1'); const s = _secs(); const r = s.slice(0, 3).join(' | ') === 'Name | 📷 Photos | Note — shows on the row' && !$('matDesc-c1'); matEditClose(); return r;
  }));
  ok('what he types in 👆 Picked lands on the row FIRST (bold, a 👆 on it), the note after it untouched — and the 🕘 history writes it down', await page.evaluate(() => {
    matEditOpen('p1');
    $('matDesc-p1').value = 'Delta pull-down, matte black'; $('matDesc-p1').dispatchEvent(new Event('change'));
    matEditClose(); renderMatMgr();
    const it = _it('p1'), line = _rowId('p1').querySelector('.mat-sel'), d = line.querySelector('.mat-desc'), c = it.chg[it.chg.length - 1];
    return it.desc === 'Delta pull-down, matte black' && it.sel === 'his note' && !!d && d.textContent === '👆 Delta pull-down, matte black' && /^👆 Delta pull-down, matte black · his note/.test(line.textContent.trim()) &&
      parseInt(getComputedStyle(d).fontWeight, 10) >= 600 && c.f === 'picked — what it is' && c.from === '' && c.to === 'Delta pull-down, matte black' && c.by === 'Eric';
  }));
  ok('a tap on the 👆 words opens the row; a tap on the note still edits the NOTE in place and never the 👆', await page.evaluate(() => {
    _rowId('p1').querySelector('.mat-desc').click(); const a = _matEdit === 'p1' && !!$('matSheet'); matEditClose(); renderMatMgr();
    _rowId('p1').querySelector('.mat-seltxt').click();
    const b = !!$('matSelIn-p1') && $('matSelIn-p1').value === 'his note';
    $('matSelIn-p1').value = 'his note, updated'; matSelDone('p1', true);
    return a && b && _it('p1').sel === 'his note, updated' && _it('p1').desc === 'Delta pull-down, matte black';
  }));
  ok('a 🏠 row: the homeowner\'s own pick leads its line the same way, the office note after it', await page.evaluate(() => {
    const line = _rowId('p3').querySelector('.mat-sel').textContent.trim();
    return /^👆 White subway · office words/.test(line);
  }));
  ok('the Wizard\'s reading of a photo fills 👆 Picked (and the SKU and the price) — NEVER the note; it says so in the row\'s 🕘 history as the Wizard; a second read writes over nothing', await page.evaluate(async () => {
    lsSet('daylog-aikey', 'k'); window.shrinkForAi = async () => 'AAAA'; window._aiCalls = 0;
    const aiCall0 = window.aiCall;   // put back at the end — the Sonnet checks below need the real one
    window.aiCall = async (body, kind) => { _aiCalls++; return { r: new Response(JSON.stringify({ content: [{ type: 'text', text: '{"title": "Acme range hood, 30 in, stainless", "model": "RH-30", "sku": "44001", "price": 289.5}' }] }), { status: 200 }), model: 'x', fell: false }; };
    _it('p2').phs = ['/x/a.jpg'];
    await matPhotoRead('p2', 0, new File(['x'], 'a.jpg', { type: 'image/jpeg' }));
    const it = _it('p2'), rd = it.phRead || {}, byWiz = (it.chg || []).filter(c => c.by === 'the Wizard');
    const a = it.desc === 'Acme range hood, 30 in, stainless' && !it.sel && it.sku === 'model RH-30 · SKU 44001' && it.est === 289.5 && JSON.stringify(rd.filled) === '["SKU","price","what it is"]' &&
      byWiz.length === 3 && byWiz[2].f === 'picked — what it is' && byWiz[2].to === 'Acme range hood, 30 in, stainless';
    await matPhotoRead('p2', 0, new File(['x'], 'a.jpg', { type: 'image/jpeg' }));
    lsSet('daylog-aikey', ''); window.aiCall = aiCall0;
    return a && _aiCalls === 2 && JSON.stringify(_it('p2').phRead.filled) === '[]' && _it('p2').desc === 'Acme range hood, 30 in, stainless' && !_it('p2').sel;
  }));
  ok('the drop box says the Wizard reads what it is too', await page.evaluate(() => { lsSet('daylog-aikey', 'k'); matEditOpen('p2'); const t = ($('matDrop-p2') || {}).textContent || ''; matEditClose(); lsSet('daylog-aikey', ''); return /reads the SKU and the price off it, and what it is/.test(t); }));
  ok('THE WALL: 👆 Picked never rides to the homeowner\'s file (the office file keeps it)', await page.evaluate(async () => {
    await matSave();
    const cl = JSON.parse(_dbxFiles[portalRoot() + '/materials-oak-111aaa.json'] || '{}'), off = JSON.parse(_dbxFiles[portalRoot() + '/materials-office-oak-111aaa.json'] || '{}');
    const c = (cl.rooms || []).flatMap(r => r.items), o = (off.rooms || []).flatMap(r => r.items);
    return c.length > 0 && c.every(x => !('desc' in x) && !('sel' in x)) && o.find(x => x.id === 'p1').desc === 'Delta pull-down, matte black' && o.find(x => x.id === 'p2').desc === 'Acme range hood, 30 in, stainless';
  }));
  await page.evaluate(() => matClose());

  console.log('— 🧠 (3) Sonnet 5 —');
  await page.evaluate(() => {
    window._reqs = []; window._fail = null; const f0 = window.fetch;
    window.fetch = async (url, opts) => {
      if (!/api\.anthropic\.com/.test(String(url))) return f0(url, opts);
      const b = JSON.parse(opts.body); _reqs.push(b);
      if (_fail && b.model === _fail) return new Response('{"error":"no"}', { status: 400 });
      const md = '**Two things happened.**\n\n- the framing went up\n- the paint is picked';
      return new Response(JSON.stringify({ content: [{ type: 'thinking', thinking: '', signature: 'abc' }, { type: 'text', text: md }] }), { status: 200, headers: { 'content-type': 'application/json' } });
    };
    lsSet('daylog-aikey', 'k'); prefs.aiModel = 'auto';
  });
  ok('the smart brain IS Sonnet 5; a Wizard question goes to it thinking at MEDIUM effort inside max_tokens 4000, with no thinking switch of its own', await page.evaluate(async () => {
    _reqs.length = 0; const { model } = await aiCall({ max_tokens: 4000, system: 's', messages: [{ role: 'user', content: 'q' }] }, 'wizard', 'q');
    const b = _reqs[0];
    return AI_SMART === 'claude-sonnet-5' && model === 'claude-sonnet-5' && b.model === 'claude-sonnet-5' && JSON.stringify(b.output_config) === '{"effort":"medium"}' && !('thinking' in b) && b.max_tokens === 4000;
  }), await page.evaluate(() => JSON.stringify(_reqs[0])));
  ok('every OTHER smart call (a journal draft, advice, a long paste) runs Sonnet 5 with thinking OFF, so its small max_tokens is all answer', await page.evaluate(async () => {
    _reqs.length = 0;
    await aiCall({ max_tokens: 400, system: 's', messages: [{ role: 'user', content: 'x' }] }, 'journal', 'x');
    await aiCall({ max_tokens: 700, system: 's', messages: [{ role: 'user', content: 'x' }] }, 'advice', 'x');
    await aiCall({ max_tokens: 300, system: 's', messages: [{ role: 'user', content: 'x' }] }, 'note', 'how much did I spend at the lumber yard this month, total it up');
    return _reqs.length === 3 && _reqs.every(b => b.model === 'claude-sonnet-5' && JSON.stringify(b.thinking) === '{"type":"disabled"}' && !('output_config' in b));
  }), await page.evaluate(() => JSON.stringify(_reqs)));
  ok('the quick brain is untouched: a photo, mail sorting and a plain lookup ride Haiku with neither field', await page.evaluate(async () => {
    _reqs.length = 0;
    await aiCall({ max_tokens: 300, system: 's', messages: [{ role: 'user', content: 'x' }] }, 'photo');
    await aiCall({ max_tokens: 256, system: 's', messages: [{ role: 'user', content: 'x' }] }, 'mailsort');
    await aiCall({ max_tokens: 300, system: 's', messages: [{ role: 'user', content: 'x' }] }, 'note', 'where is the permit');
    prefs.aiModel = 'fast'; await aiCall({ max_tokens: 4000, system: 's', messages: [{ role: 'user', content: 'q' }] }, 'wizard', 'q'); prefs.aiModel = 'auto';
    return _reqs.length === 4 && _reqs.every(b => b.model === AI_FAST && !('thinking' in b) && !('output_config' in b));
  }), await page.evaluate(() => JSON.stringify(_reqs.map(b => b.model))));
  ok('when Sonnet 5 refuses, the call falls back to the quick brain as before', await page.evaluate(async () => {
    _reqs.length = 0; _fail = 'claude-sonnet-5';
    const { model, fell } = await aiCall({ max_tokens: 4000, system: 's', messages: [{ role: 'user', content: 'q' }] }, 'wizard', 'q');
    _fail = null;
    return fell === true && model === AI_FAST && _reqs.length === 2 && _reqs[1].model === AI_FAST && !('output_config' in _reqs[1]);
  }));
  ok('end to end: a real question — the answer\'s THINKING block comes first and has no text, and the answer still reads on the screen line by line, from the 🧠 smart brain', await page.evaluate(async () => {
    _reqs.length = 0;
    $('askText').value = 'what happened this week';
    await askInstant('what happened this week');
    await new Promise(r => setTimeout(r, 300));
    const lines = [...document.querySelectorAll('.wl-line .wl-t')].map(x => x.textContent.replace(/\s+/g, ' ').trim());
    const b = _reqs.find(x => x.max_tokens === 4000) || {};
    return b.model === 'claude-sonnet-5' && JSON.stringify(b.output_config) === '{"effort":"medium"}' && lines.some(l => /Two things happened/.test(l)) && lines.some(l => /paint is picked/.test(l)) && /smart brain/.test(document.body.textContent);
  }), await page.evaluate(() => [...document.querySelectorAll('.wl-line .wl-t')].map(x => x.textContent).join(' | ').slice(0, 300)));
  await page.evaluate(() => { lsSet('daylog-aikey', ''); if (typeof hideInlineAnswer === 'function') try { hideInlineAnswer(); } catch (e) {} });

  console.log('— 👷 (4) From Phil on the running log —');
  await page.evaluate(() => {
    const ago = h => new Date(Date.now() - h * 36e5);   // the log's ts is a Date, never a string
    window._add = (details, job, extra) => { const e = Object.assign({ id: nextId++, type: 'Note', details, job, ts: ago(1) }, extra || {}); entries.unshift(e); return e; };
    entries = []; prefs.rlFilter = ''; prefs.rlWho = ''; prefs.rlHide = []; window._rlN = 30;
    _add('framing walls going up', 'Oak House');
    _add('Text from Bo: running late', '—', { texted: true, tags: ['Bo'] });
    _add('Phil: hung the doors', 'Oak House', { who: 'Phil' });
    renderAskRecent();
    window._plates = () => [...document.querySelectorAll('#askRecent .rl-filters > .pick-chip')].map(b => b.textContent.replace(/\s+/g, ' ').trim());
    // the Wizard's kept answer from (3) rides in the log as a 🧙 row — not what these checks count
    window._rows = () => [...document.querySelectorAll('#askRecent .ask-recent-row')].map(r => r.textContent.replace(/\s+/g, ' ').trim()).filter(t => !/what happened this week|Two things happened/.test(t));
  });
  ok('with Phil\'s notes in the log the plate reads 👷 From Phil, leading the second row of three; ➕ Say something fills out 💬 Feedback\'s row', await page.evaluate(() => {
    const p = _plates(), cs = [...document.querySelectorAll('#askRecent .rl-filters > .pick-chip')];
    const top = i => Math.round(cs[i].getBoundingClientRect().top);
    const say = cs.find(c => /Say something/.test(c.textContent)), fb = cs.find(c => /💬 Feedback/.test(c.textContent));
    return p[3] === '👷 From Phil' && p.length === 11 && top(3) === top(4) && top(3) === top(5) && top(3) > top(2) && say.classList.contains('rl-two') && !say.classList.contains('rl-wide') &&
      Math.round(say.getBoundingClientRect().top) === Math.round(fb.getBoundingClientRect().top) && say.getBoundingClientRect().left > fb.getBoundingClientRect().right;
  }), await page.evaluate(() => JSON.stringify(_plates())));
  ok('a tap lights it — ✓ 👷 From Phil — and the log shows only his notes; tap again hides them (🚫); ✳ All brings everything back', await page.evaluate(() => {
    [...document.querySelectorAll('#askRecent .rl-filters > .pick-chip')].find(c => c.textContent.trim() === '👷 From Phil').click();
    const r1 = _rows(), lit = _plates().includes('✓ 👷 From Phil');
    const only = prefs.rlFilter === 'crew' && r1.length === 1 && /hung the doors/.test(r1[0]);
    [...document.querySelectorAll('#askRecent .rl-filters > .pick-chip')].find(c => /👷 From Phil/.test(c.textContent)).click();
    const r2 = _rows(), hid = prefs.rlFilter === '' && prefs.rlHide.includes('crew') && !r2.some(x => /hung the doors/.test(x)) && r2.some(x => /framing walls/.test(x)) && _plates().includes('🚫 👷 From Phil');
    [...document.querySelectorAll('#askRecent .rl-filters > .pick-chip')].find(c => /✳ All/.test(c.textContent)).click();
    const r3 = _rows();
    return lit && only && hid && prefs.rlHide.length === 0 && r3.some(x => /hung the doors/.test(x)) && r3.length === 3;
  }), await page.evaluate(() => JSON.stringify({ f: prefs.rlFilter, h: prefs.rlHide, p: _plates() })));
  ok('two crew names in the log → 👷 From the crew; none → no plate, and ➕ Say something is full width again; a stale crew filter clears itself', await page.evaluate(() => {
    _add('Kevin: swept the garage', 'Oak House', { who: 'Kevin' }); renderAskRecent();
    const two = _plates()[3] === '👷 From the crew';
    entries = entries.filter(e => !e.who); prefs.rlFilter = 'crew'; renderAskRecent();
    const say = [...document.querySelectorAll('#askRecent .rl-filters > .pick-chip')].find(c => /Say something/.test(c.textContent));
    return two && !_plates().some(x => /👷 From/.test(x)) && _plates().length === 10 && say.classList.contains('rl-wide') && prefs.rlFilter === '' && _rows().length === 2;
  }), await page.evaluate(() => JSON.stringify(_plates())));

  console.log('— 🏗 (6) the Wizard answers about the job the question names —');
  await page.evaluate(() => {
    jobs = ['Oak House', 'Pine Cabin', 'Little, Tyler, Duplex27', 'Smith, Troy', 'Smith, Todd, Shop Framing', 'Personal']; entries = [];
    _add('shower tile picked — the blue hex', 'Oak House');
    _add('shower tile quote came in from the sub', 'Pine Cabin');
    _add('tile guy called back about the shower', '—');
    _add('deck stain picked', 'Smith, Troy');
    todos = [{ id: 901, text: 'order the pine tile', job: 'Pine Cabin', done: false, ts: new Date().toISOString() }, { id: 902, text: 'oak tile grout', job: 'Oak House', done: false, ts: new Date().toISOString() }];
    entries[0].board = { p: 1, at: new Date().toISOString() };   // an Oak House board line
    entries[1].board = { p: 2, at: new Date().toISOString() };   // a Pine Cabin board line
    window._ctx = q => {
      const c = buildAskContext(q); const log = (c.match(/\nRECENT LOG[^\n]*/) || [''])[0], js = {};
      (log.match(/"j":"([^"]*)"/g) || []).forEach(x => { const k = x.slice(5, -1); js[k] = (js[k] || 0) + 1; });
      return { js, line: (c.match(/\nJOBS? NAMED IN THE QUESTION[^\n]*/) || [''])[0], todos: (c.match(/\nOPEN TO-DOS: ([^\n]*)/) || ['', ''])[1], board: (c.match(/\nBOARD — OPEN LINES[^\n]*/) || [''])[0] };
    };
  });
  ok('a job named by a word of its own name — exactly, and only a word no other job shares — is the one the question is about; a shared word (Smith) picks neither; a common word in a name (Little, House) never picks', await page.evaluate(() =>
    JSON.stringify(askJobsNamed('for the Oak House job, bring up the shower tile')) === '["Oak House"]' && JSON.stringify(askJobsNamed('what did the oak shower tile cost')) === '["Oak House"]' &&
    JSON.stringify(askJobsNamed("what is left on Tyler's duplex")) === '["Little, Tyler, Duplex27"]' && JSON.stringify(askJobsNamed('bring up a little summary of the house and the deck this week')) === '[]' &&
    JSON.stringify(askJobsNamed('did smith pay')) === '[]' && JSON.stringify(askJobsNamed('did troy pay')) === '["Smith, Troy"]' && JSON.stringify(askJobsNamed('compare oak and pine')) === '["Oak House","Pine Cabin"]'),
    await page.evaluate(() => JSON.stringify(askJobWords())));
  ok('one job named: the Wizard gets THAT job\'s records and the unfiled ones — the other job\'s "shower tile" note is left out, and the context says so', await page.evaluate(() => {
    const r = _ctx('for the Oak House job, bring up the shower tile');
    return r.js['Oak House'] === 1 && r.js['—'] === 1 && !('Pine Cabin' in r.js) && !('Smith, Troy' in r.js) && /^\nJOB NAMED IN THE QUESTION: "Oak House"/.test(r.line) && /left out on purpose/.test(r.line) &&
      // the open to-dos and the board lines follow the same rule — the other job's to-do and board line are out
      /oak tile grout/.test(r.todos) && !/order the pine tile/.test(r.todos) && /the blue hex/.test(r.board) && !/quote came in/.test(r.board);
  }), await page.evaluate(() => JSON.stringify(_ctx('for the Oak House job, bring up the shower tile'))));
  ok('two jobs named: both come first, nothing is left out; no job named: the log as before, no job line', await page.evaluate(() => {
    const two = _ctx('compare the oak and pine shower tile'), none = _ctx('bring up the shower tile');
    return two.js['Oak House'] === 1 && two.js['Pine Cabin'] === 1 && two.js['Smith, Troy'] === 1 && /^\nJOBS NAMED IN THE QUESTION: "Oak House", "Pine Cabin"/.test(two.line) && /order the pine tile/.test(two.todos) && /oak tile grout/.test(two.todos) &&
      none.js['Oak House'] === 1 && none.js['Pine Cabin'] === 1 && none.line === '' && /order the pine tile/.test(none.todos) && /quote came in/.test(none.board);
  }));

  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v7.21') && document.querySelector('footer').textContent.includes(APP_VER);
  }));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
