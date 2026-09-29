// v7.35 — (1) THE WIZARD SAYS WHY. Eric, 2026-09-28: "i asked the wizard a question and it had the wizard is thinking banner but
// then no popup or anything came up in the running log." (His 8:17 question failed on the instant path and fell to the hourly
// request file with a whisper on the status line.) Sonnet 5 bills its thinking inside max_tokens; the ceiling was 4000, a list
// question thought it all away and answered nothing. Now: a 12000 ceiling, a second try with thinking OFF, the band counting the
// seconds, a three-minute clock, and a failure SAID in words with the question kept in the box. (2) The 🔒 Personal chip is off
// ④ TAG IT. (3) ✎ on every pocket row of the Summary. Made-up questions, jobs and words.
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

  console.log('— 🧙 (1) the Wizard says why —');
  await page.evaluate(() => {
    window.scheduleSave = () => {}; window.savePendingSoon = () => {}; window._ups = 0; window.dbxUpload = async () => { _ups++; return {}; };
    entries = []; todos = []; jobs = ['Oak House', 'Pine Cabin']; crew = ['Phil']; nextId = 100; renderJobSelects(); closePanels(); renderAll();
    lsSet('daylog-aikey', 'sk-ant-made-up-for-this-test'); lsSet('daylog-wizlog', '[]'); _wizLog = null; renderAiKeyStatus(); wizIdleLamp();
    window._said = []; const t0 = window.toast; window.toast = (m, g) => { _said.push(String(m)); return t0(m, g); };
    window._dones = []; const d0 = window.busyDone; window.busyDone = (w, ms) => { _dones.push({ w: String(w || ''), ms: ms || 1100 }); return d0(w, ms); };
    // the API, scripted: every call takes the next step off the list
    window._api = { calls: [], steps: [] };
    const f0 = window.fetch;
    const reply = (status, json) => new Response(JSON.stringify(json), { status, headers: { 'content-type': 'application/json' } });
    window.fetch = (u, init) => {
      if (!/api\.anthropic\.com/.test(String(u))) return f0(u, init);
      const body = JSON.parse(init.body);
      const rec = { model: body.model, max_tokens: body.max_tokens, thinking: body.thinking || null, output_config: body.output_config || null, band: $('busyBand').textContent, aborted: false };
      _api.calls.push(rec);
      const s = _api.steps.shift() || { json: { content: [{ type: 'text', text: 'ok' }], stop_reason: 'end_turn' } };
      return new Promise((res, rej) => {
        if (init.signal) init.signal.addEventListener('abort', () => { rec.aborted = true; rej(Object.assign(new Error('The user aborted a request.'), { name: 'AbortError' })); });
        setTimeout(() => { if (s.throw) rej(new TypeError(s.throw)); else if (!s.hang) res(reply(s.status || 200, s.json)); }, s.delay || 10);
      });
    };
    window.TXT = (t, stop) => ({ json: { content: [{ type: 'thinking', thinking: '' }, { type: 'text', text: t }], stop_reason: stop || 'end_turn' } });
    window.THINK_ONLY = { json: { content: [{ type: 'thinking', thinking: '' }], stop_reason: 'max_tokens' } };
    window.ask = async (q, steps) => { _api.steps = steps.slice(); _api.calls = []; _said.length = 0; _dones.length = 0; $('askText').value = q; await askClaude(); };
  });
  ok('the ceiling is 12000 now (it was 4000, and Sonnet 5 bills its thinking inside it); the first try still thinks at MEDIUM effort on the smart brain with no thinking switch of its own (v7.21); the answer shows and is kept', await page.evaluate(async () => {
    await ask('what did we spend on the Oak House framing', [TXT('About **$8,930** on framing.\n\nSOURCES: 1')]);
    const c = _api.calls[0] || {};
    const good = _api.calls.length === 1 && c.max_tokens === 12000 && c.model === AI_SMART && JSON.stringify(c.output_config) === '{"effort":"medium"}' && !c.thinking &&
      $('wizFull').classList.contains('show') && /About/.test($('wizFullBody').textContent) && /✓ Answered/.test($('askStatus').textContent) && wizLog().length === 1 && $('askText').value === '' && /✓ DONE/.test((_dones[_dones.length - 1] || {}).w);
    closeWizFull(); return good;
  }), await page.evaluate(() => JSON.stringify({ calls: _api.calls, st: $('askStatus').textContent, dones: _dones })));
  ok('the thinking ate the whole ceiling (no words, stop_reason max_tokens): a second try goes out at once — the same smart brain, thinking OFF, no effort field, 4000 for the answer — the band said THINKING AGAIN, and the answer shows', await page.evaluate(async () => {
    await ask('make a list for this week by project', [THINK_ONLY, TXT('**Oak House**: trusses Tuesday.\n**Pine Cabin**: windows Friday.')]);
    const a = _api.calls[0] || {}, b = _api.calls[1] || {};
    const good = _api.calls.length === 2 && !a.thinking && JSON.stringify(b.thinking) === '{"type":"disabled"}' && !b.output_config && b.model === AI_SMART && b.max_tokens === 4000 && /THINKING AGAIN/.test(b.band) &&
      $('wizFull').classList.contains('show') && /trusses Tuesday/.test($('wizFullBody').textContent) && !/cut short/.test($('wizFullBody').textContent) && wizLog().length === 2 && /trusses/.test(wizLog()[0].a) && $('askText').value === '';
    closeWizFull(); return good;
  }), await page.evaluate(() => JSON.stringify({ calls: _api.calls, body: $('wizFullBody').textContent.slice(0, 200) })));
  ok('a second try that ALSO comes back with no words is SAID: the ⚠ band stays 6 s, a ⚠ toast, the status line says why and that the question is still in the box — and it is; nothing kept, nothing sent to the hourly file, no "Connect Dropbox" noise', await page.evaluate(async () => {
    const ups = _ups, kept = wizLog().length;
    await ask('list this week by project', [THINK_ONLY, { json: { content: [], stop_reason: 'end_turn' } }]);
    const d = _dones.find(x => /⚠ THE WIZARD DID NOT ANSWER/.test(x.w));
    return _api.calls.length === 2 && !!d && d.ms >= 5000 && _said.some(m => /⚠ The Wizard did not answer — it came back with no words/.test(m)) && !_said.some(m => /Connect Dropbox/.test(m)) &&
      /did not answer/.test($('askStatus').textContent) && /still in the box/.test($('askStatus').textContent) && $('askText').value === 'list this week by project' &&
      !$('wizFull').classList.contains('show') && wizLog().length === kept && _ups === ups && !$('wizSideBtn').disabled;
  }), await page.evaluate(() => JSON.stringify({ said: _said, dones: _dones, st: $('askStatus').textContent, box: $('askText').value })));
  ok('Anthropic overloaded (529) on the smart brain and then on the quick one: the words say overloaded, try again in a minute', await page.evaluate(async () => {
    const over = { status: 529, json: { type: 'error', error: { type: 'overloaded_error', message: 'Overloaded' } } };
    await ask('what is open on Pine Cabin', [over, over]);
    return _api.calls.length === 2 && _api.calls[0].model === AI_SMART && _api.calls[1].model === AI_FAST && _said.some(m => /overloaded right now/.test(m)) && /overloaded/.test($('askStatus').textContent) && $('askText').value === 'what is open on Pine Cabin';
  }), await page.evaluate(() => JSON.stringify({ said: _said, st: $('askStatus').textContent })));
  ok('the key refused (401): the words say to check the key in Setup', await page.evaluate(async () => {
    const bad = { status: 401, json: { type: 'error', error: { type: 'authentication_error', message: 'invalid x-api-key' } } };
    await ask('who is the plumber on Oak House', [bad, bad]);
    return _said.some(m => /key was refused/.test(m)) && /⚙ Setup/.test($('askStatus').textContent);
  }), await page.evaluate(() => JSON.stringify({ said: _said, st: $('askStatus').textContent })));
  ok('the connection drops mid-think (a TypeError, the way a locked phone kills a fetch): the words say so and to keep the app open', await page.evaluate(async () => {
    await ask('when is the inspector due', [{ throw: 'Load failed' }]);
    return _api.calls.length === 1 && _said.some(m => /connection dropped/.test(m)) && /Keep the app open/.test($('askStatus').textContent) && $('askText').value === 'when is the inspector due';
  }), await page.evaluate(() => JSON.stringify({ said: _said, st: $('askStatus').textContent })));
  ok('an answer cut short (words came, stop_reason max_tokens) still shows — with a ⚠ line under it that says so, kept with the answer', await page.evaluate(async () => {
    await ask('summarize the month', [TXT('**Oak House**: trusses set, siding started, then', 'max_tokens')]);
    const good = $('wizFull').classList.contains('show') && /siding started/.test($('wizFullBody').textContent) && /⚠ The answer was cut short/.test($('wizFullBody').textContent) && /cut short/.test(wizLog()[0].a);
    closeWizFull(); return good;
  }), await page.evaluate(() => $('wizFullBody').textContent.slice(0, 300)));
  await page.evaluate(() => { window._p = ask('a slow one', [Object.assign({ delay: 2600 }, TXT('slow but sure'))]); });
  await page.waitForTimeout(2300);
  const mid = await page.evaluate(() => ({ hidden: $('busyBand').hidden, text: $('busyBand').textContent, btn: $('wizSideBtn').textContent.replace(/\s+/g, ' ') }));
  await page.evaluate(() => window._p);
  await page.waitForTimeout(1500);
  const after = await page.evaluate(() => ({ text: $('busyBand').textContent, tick: !!_wizTick, dones: _dones.map(d => d.w) }));
  ok('the band counts the seconds while the Wizard works — "THE WIZARD IS THINKING… 2 s" — and the plate reads THINKING…; when the answer lands the count stops and the band says ✓ DONE', !mid.hidden && /THE WIZARD IS THINKING… \d+ s/.test(mid.text) && /THINKING/.test(mid.btn) && !after.tick && /✓ DONE/.test(after.dones[after.dones.length - 1] || ''), JSON.stringify({ mid, after }));
  await page.evaluate(() => closeWizFull());
  ok('three minutes with no answer (the clock, shortened for the test): the request is ABORTED and the words say it took too long — try again or ask a smaller question', await page.evaluate(async () => {
    window._wizTimeoutMs = 400;
    await ask('a question that never comes back', [{ hang: true }]);
    delete window._wizTimeoutMs;
    return _api.calls.length === 1 && _api.calls[0].aborted === true && _said.some(m => /more than three minutes/.test(m)) && /smaller question/.test($('askStatus').textContent) && !$('wizSideBtn').disabled && !_wizTick;
  }), await page.evaluate(() => JSON.stringify({ calls: _api.calls, said: _said })));
  ok('a no-key phone still walks the old hourly road (askViaFlag), and an instant failure no longer does', src.includes('if (aiKey()) return askInstant(what);') && src.includes('return askViaFlag(what);') && !src.includes('await askViaFlag(what, true)'));

  console.log('— 🔒 (2) the Personal chip is off ④ TAG IT —');
  ok('④ TAG IT: the fixed row is 🧾 Receipt · 📋 Build List — two across, one line, the full width; no Personal chip anywhere in ④ even when his list has the tag; his own tags start under the row', await page.evaluate(() => {
    prefs.tags = ['Home Depot', 'Personal', 'Spenard']; prefs.tagRows = 2; renderTagChips(); window._gOpen = { 4: true }; updateStepFlow();
    const fx = $('qnTagFixed').querySelector('.tag-fixed'); if (!fx) return false;   // 🏷 v7.43 — above the fold
    const chips = [...fx.querySelectorAll('.pick-chip')], c = chips.map(b => b.textContent.trim()), r = chips.map(b => b.getBoundingClientRect());
    const firstTag = $('qnTagChips').querySelector(':scope > .pick-chip');
    return c.length === 2 && /Receipt/.test(c[0]) && /Build List/.test(c[1]) && Math.abs(r[0].top - r[1].top) <= 2 && Math.abs(r[0].width - r[1].width) <= 3 &&
      Math.abs(fx.getBoundingClientRect().width - $('qnTagChips').getBoundingClientRect().width) <= 2 && !/Personal/.test($('qnTagChips').textContent) && !!firstTag && /Home Depot/.test(firstTag.textContent) && firstTag.getBoundingClientRect().top > r[0].top + 20;
  }), await page.evaluate(() => JSON.stringify([...$('qnTagChips').querySelectorAll('.pick-chip')].map(b => [b.textContent.trim(), Math.round(b.getBoundingClientRect().top), Math.round(b.getBoundingClientRect().width)]))));
  ok('a family name still wears its own lock chip among his tags, and the lock itself is untouched (a Personal tag or the Personal job still locks a note)', await page.evaluate(() => {
    prefs.personalFolks = ['Wifey']; prefs.tags = ['Home Depot', 'Wifey']; renderTagChips();
    const chip = [...$('qnTagChips').querySelectorAll('.pick-chip')].find(b => /Wifey/.test(b.textContent));
    return !!chip && chip.classList.contains('lockchip') && /🔓 Wifey/.test(chip.textContent) && isLocked({ tags: ['Personal'] }) && isLocked({ personal: true });
  }));

  console.log('— ✎ (3) the words on a Summary pocket row —');
  await page.evaluate(() => {
    prefs.pocket = [{ id: 'it1', t: 'grab the compressor', day: pocketDay(0), ts: new Date().toISOString() }];
    entries.unshift({ id: 900, ts: new Date(Date.now() - 3600e3), type: 'Note', details: '🎒 Not done — check the thermostats at the cabin', job: '—', tags: ['pocket'], pocket: 'swept', noSniff: true });
    entries.unshift({ id: 901, ts: new Date(Date.now() - 1800e3), type: 'Note', details: '✓ call the gravel guy', job: '—', tags: ['pocket'], pocket: 'done', noSniff: true });
    renderPocket(); openReview('summary'); if (_sumSec !== 'pocket') sumSecTap('pocket');
    window._line = (re, sec) => [...document.querySelectorAll('#revBox .rev-sec-body[data-sec="' + sec + '"] .sum-line')].find(l => re.test(l.textContent));
  });
  ok('every pocket row of the Summary — the live item, the ✓ done note, the not-done leftover — carries a ✎ after its words, outside the four Today · Tomorrow · Done · Not needed plates and the four ⚙ TO THE GRINDER plates', await page.evaluate(() => {
    const rows = [_line(/thermostats/, 'pocket'), _line(/compressor/, 'get'), _line(/gravel guy/, 'get')];
    return rows.every(r => r && r.querySelector('.pk-edw') && r.querySelector('.pk-w')) && rows[0].querySelectorAll('.pk-acts .pk-mini').length === 4 && !rows[0].querySelector('.pk-acts .pk-edw') && !rows[0].querySelector('.pk-sendrow .pk-edw') && rows[1].querySelectorAll('.pk-send').length === 4;
  }), await page.evaluate(() => [...document.querySelectorAll('#revBox .rev-sec-body .sum-line')].map(l => l.textContent.replace(/\s+/g, ' ').slice(0, 60)).join(' | ')));
  ok('✎ on the not-done leftover: the words become a box right there with the words in it; Enter keeps them — the note keeps its 🎒 Not done stamp, the row reads the new words, and ⚙ TO THE GRINDER now sends the NEW words', await page.evaluate(async () => {
    const row = _line(/thermostats/, 'pocket'); row.querySelector('.pk-edw').click();
    const inp = row.querySelector('input.pk-edit'); if (!inp) return false;
    const had = inp.value === 'check the thermostats at the cabin';
    inp.value = 'Phil: check every thermostat at the cabin, set them to 55';
    inp.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await new Promise(r => setTimeout(r, 30));
    const e = entries.find(x => x.id === 900), row2 = _line(/every thermostat/, 'pocket');
    _said.length = 0; pocketToGrinder('n', 900, 'buddy');
    return had && e.details === '🎒 Not done — Phil: check every thermostat at the cabin, set them to 55' && e.pocket === 'swept' && !!row2 && !row2.querySelector('input.pk-edit') && $('askText').value === 'Phil: check every thermostat at the cabin, set them to 55' && (qnVisNames.has('Phil') || qnVis === 'Phil');
  }), await page.evaluate(() => JSON.stringify({ d: (entries.find(x => x.id === 900) || {}).details, box: $('askText').value, vis: qnVis, names: [...qnVisNames] })));
  await page.evaluate(() => { $('askText').value = ''; setVis(''); openReview('summary'); if (_sumSec !== 'get') sumSecTap('get'); });
  ok('✎ on a live pocket item: the words change on the Summary AND on the pocket card; Esc lets go without changing anything', await page.evaluate(async () => {
    const row = _line(/compressor/, 'get'); row.querySelector('.pk-edw').click();
    const inp = row.querySelector('input.pk-edit'); if (!inp) return false;
    inp.value = 'grab the big compressor from the shop';
    inp.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await new Promise(r => setTimeout(r, 30));
    const it = pocket().find(x => x.id === 'it1'), onCard = /big compressor/.test($('pocketCard').textContent), onSum = !!_line(/big compressor/, 'get');
    const row2 = _line(/big compressor/, 'get'); row2.querySelector('.pk-edw').click();
    const inp2 = row2.querySelector('input.pk-edit'); inp2.value = 'something else'; inp2.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await new Promise(r => setTimeout(r, 30));
    return it.t === 'grab the big compressor from the shop' && onCard && onSum && pocket().find(x => x.id === 'it1').t === 'grab the big compressor from the shop' && !!_line(/big compressor/, 'get') && !document.querySelector('#revBox input.pk-edit');
  }), await page.evaluate(() => JSON.stringify({ p: pocket(), card: $('pocketCard').textContent.replace(/\s+/g, ' ').slice(0, 120) })));
  ok('✎ on a ✓ done note keeps the ✓ and changes only the words (a tap away keeps them too)', await page.evaluate(async () => {
    const row = _line(/gravel guy/, 'get'); row.querySelector('.pk-edw').click();
    const inp = row.querySelector('input.pk-edit'); if (!inp) return false;
    inp.value = 'called the gravel guy — 12 yards Friday'; inp.dispatchEvent(new Event('blur'));
    await new Promise(r => setTimeout(r, 30));
    return entries.find(x => x.id === 901).details === '✓ called the gravel guy — 12 yards Friday' && !!_line(/12 yards Friday/, 'get');
  }), await page.evaluate(() => (entries.find(x => x.id === 901) || {}).details));
  await page.evaluate(() => closeReview());

  ok('version bumped — APP_VER and the footer agree', /const APP_VER = 'v7\.(3[5-9]|[4-9]\d)'/.test(src) && new RegExp('<footer>' + (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1].replace('.', '\\.')).test(src));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
