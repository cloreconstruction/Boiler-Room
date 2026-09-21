// ✎ v7.02 — WORK THROUGH THE WHOLE ANSWER, SAVE AT THE END. Eric: "when i ask for a summary and i edit the line id like to
// save it but not have it re ask the wizard right away, i want to work through the whole summary and make multiple edits
// and then save at the end." A line fix is KEPT on the page; one bar saves the lot. Every name and word is made up.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { fileURLToPath } = require('url');
(async () => {
  const appUrl = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const repo = path.dirname(fileURLToPath(appUrl));
  const src = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
  await page.goto(appUrl); await page.waitForTimeout(700);
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };

  await page.evaluate(() => {
    jobs = ['Oak House', 'Pine Cabin']; curJob = ''; crew = ['Phil']; entries = []; todos = []; nextId = 1; pendingQueue = []; prefs.pocket = []; prefs.wizFixes = []; _wizLog = []; lsSet('daylog-wizlog', '[]'); lsSet('daylog-wizpend', '');
    window.scheduleSave = () => {}; window.savePendingSoon = () => {}; window.publishSharedNotes = () => {}; window.wizLogSave = () => {};
    renderJobSelects(); closePanels(); renderAll();
    window._asked = []; window.askInstant = async q => { _asked.push(q); }; window.aiKey = () => 'k';
    window._said = []; const t0 = window.toast; window.toast = (m, g) => { if (m) _said.push(String(m)); return t0(m, g); };
    window._MD = 'This week:\n- framed the pony wall at Oak House\n- hung 40 sheets of siding at Pine Cabin\n- two dump runs\n- Bo was out Thursday\n\nNothing else.';
    window._open = () => { const s1 = addEntry('Note', 'framed the pony wall', 'Oak House', { noSniff: true }), s2 = addEntry('Note', 'siding at Pine Cabin', 'Pine Cabin', { noSniff: true }); const keep = wizKeep('summarize this week', _MD, [s1.id, s2.id], '⚡ quick brain').at; _lastAnswer = { q: 'summarize this week', text: _MD, srcIds: [s1.id, s2.id], at: Date.now(), keep }; showWizFull('summarize this week', _MD, [s1.id, s2.id], '⚡ quick brain', null); window._ids = [s1.id, s2.id]; return keep; };
    window._fix = (i, words) => { wizLineFix(i); $('wlText-' + i).value = words; [...$('wlBox-' + i).querySelectorAll('button')].find(b => /Keep this fix/.test(b.textContent)).click(); };
    window._line = i => [...document.querySelectorAll('#wizFullBody .wl-line')][i];
    window._notes = () => entries.filter(e => /^✎ /.test(e.details || ''));
  });

  console.log('— ✎ v7.02 keep as you go —');

  const k1 = await page.evaluate(() => {
    _open(); wizLineFix(2);
    const box = $('wlBox-2').textContent.replace(/\s+/g, ' ');
    _said.length = 0; $('wlText-2').value = 'it was 52 sheets'; [...$('wlBox-2').querySelectorAll('button')].find(b => /Keep this fix/.test(b.textContent)).click();
    const pend = _line(2).nextElementSibling, foot = $('wfPend').textContent.replace(/\s+/g, ' ');
    return { box, asked: _asked.length, notes: _notes().length, fixes: prefs.wizFixes.length, ai: entries.some(e => /ERIC CORRECTED/.test(e.ai || '')), kept: wizLog()[0].fix || [], open: $('wizFull').classList.contains('show'),
      pendCls: pend.className, pendTxt: pend.textContent, foot, said: _said.join(' | '), boxShut: $('wlBox-2').innerHTML === '', inBody: getComputedStyle(document.querySelector('#wizFullBody .wl-bar')).display };
  });
  ok('✎ on a line now offers "✓ Keep this fix" — and says nothing goes to the Wizard until he saves at the end', /Keep this fix/.test(k1.box) && !/ask again/.test(k1.box) && /nothing is sent to the Wizard until you save at the end/.test(k1.box));
  ok('keeping a fix does NOT ask the Wizard again, writes NOTHING yet (no note, no record, no list), and the answer stays up', k1.asked === 0 && k1.notes === 0 && k1.fixes === 0 && !k1.ai && k1.kept.length === 0 && k1.open && k1.boxShut, JSON.stringify(k1));
  ok('the line wears the fix in words — "✎ KEPT — not saved yet" (a dashed edge too, never the look alone) — and the foot of the screen shows ONE bar: how many are kept, SAVE, Save and ask again, Drop', /wl-fix pend/.test(k1.pendCls) && /KEPT — not saved yet: it was 52 sheets/.test(k1.pendTxt) && /1 fix kept — not saved yet/.test(k1.foot) && /✓ SAVE 1 FIX/.test(k1.foot) && /Save and ask again/.test(k1.foot) && /Drop them/.test(k1.foot) && k1.inBody === 'none' && /Kept — 1 waiting/.test(k1.said), JSON.stringify(k1));

  ok('he works through the rest: a second and a third fix; ✎ again on a kept line shows his words to CHANGE (it replaces, never doubles) or to take it off', await page.evaluate(() => {
    _fix(1, 'it was the rim joist, not the pony wall'); _fix(4, 'Bo was out Friday');
    const a = _wizPend.length === 3 && /3 fixes kept/.test($('wfPend').textContent) && /SAVE 3 FIXES/.test($('wfPend').textContent);
    wizLineFix(2); const pre = $('wlText-2').value === 'it was 52 sheets' && !!document.querySelector('#wlBox-2 button[onclick="wizLineDrop(2)"]');
    $('wlText-2').value = 'it was 54 sheets'; wizLineSave(2);
    const b = _wizPend.length === 3 && _wizPend.find(f => f.i === 2).t === 'it was 54 sheets' && /it was 54 sheets/.test(_line(2).nextElementSibling.textContent);
    wizLineFix(4); document.querySelector('#wlBox-4 button[onclick="wizLineDrop(4)"]').click();
    const c = _wizPend.length === 2 && !/KEPT/.test((_line(4).nextElementSibling || {}).textContent || '') && /2 fixes kept/.test($('wfPend').textContent);
    return a && pre && b && c && _asked.length === 0 && _notes().length === 0;
  }));
  ok('the kept fixes ride between the full screen and the card on the main page (the same answer) — the card shows them and its own bar — and they are mirrored on the phone', await page.evaluate(() => {
    showInstantAnswer('summarize this week', _MD, _ids);
    const card = $('aiBody'), bar = card.querySelector('.wl-bar'), m = JSON.parse(localStorage.getItem('daylog-wizpend') || 'null');
    return card.querySelectorAll('.wl-fix.pend').length === 2 && !!bar && !bar.hidden && getComputedStyle(bar).display !== 'none' && /SAVE 2 FIXES/.test(bar.textContent) && !!m && m.list.length === 2 && m.ctx.q === 'summarize this week' && _wizPend.length === 2;
  }));

  console.log('— ✓ save at the end —');

  const sv = await page.evaluate(() => {
    _said.length = 0; [...$('wfPend').querySelectorAll('button')].find(b => /SAVE 2 FIXES/.test(b.textContent)).click();
    const notes = _notes(), row = wizLog()[0], l1 = _line(1).nextElementSibling, l2 = _line(2).nextElementSibling;
    return { asked: _asked.length, open: $('wizFull').classList.contains('show'), notes: notes.map(n => n.details), job: notes[0] && notes[0].job, fixes: prefs.wizFixes.map(f => f.line + ' => ' + f.t), kept: (row.fix || []).map(f => f.line + ' => ' + f.t),
      ai: _ids.map(id => entries.find(e => e.id === id).ai || ''), foot: $('wfPend').innerHTML, l1: l1.className + '|' + l1.textContent, l2: l2.className + '|' + l2.textContent, pend: _wizPend.length, mirror: localStorage.getItem('daylog-wizpend'), said: _said.join(' | '),
      ctx: (buildAskContext('how many sheets').split('CORRECTIONS ERIC MADE')[1] || '').slice(0, 900) };
  });
  ok('✓ SAVE puts every kept fix where a fix always went — the records the answer came from, the kept answer with its line, the list the Wizard reads — WITHOUT asking again, and the answer stays up', sv.asked === 0 && sv.open && sv.fixes.length === 2 && sv.fixes.some(f => f === '- hung 40 sheets of siding at Pine Cabin => it was 54 sheets') && sv.fixes.some(f => /pony wall at Oak House => it was the rim joist/.test(f)) && sv.kept.length === 2 && sv.ai.every(a => /ERIC CORRECTED \(re "- hung 40 sheets/.test(a) && /ERIC CORRECTED \(re "- framed the pony wall/.test(a)) && /it was 54 sheets/.test(sv.ctx) && /rim joist/.test(sv.ctx), JSON.stringify(sv));
  ok('the log gets ONE note for the lot (under no job), the bar goes, the lines now read "✎ Eric: …" as saved, the mirror is cleared, and he is told', sv.notes.length === 1 && /^✎ 2 corrections — re "summarize this week": "- framed the pony wall at Oak House" → it was the rim joist, not the pony wall · "- hung 40 sheets of siding at Pine Cabin" → it was 54 sheets$/.test(sv.notes[0]) && sv.job === '—' && sv.foot === '' && /^wl-fix\|✎ Eric: it was the rim joist/.test(sv.l1) && /^wl-fix\|✎ Eric: it was 54 sheets/.test(sv.l2) && sv.pend === 0 && !sv.mirror && /2 fixes saved ✓ — every future answer uses them/.test(sv.said), JSON.stringify(sv));
  ok('"🧙 Save and ask again" saves them all and sends the question back ONCE, with every fix in; one fix alone still writes the old one-line note', await page.evaluate(() => {
    _asked.length = 0; const n0 = _notes().length; _fix(3, 'three dump runs');
    [...$('wfPend').querySelectorAll('button')].find(b => /Save and ask again/.test(b.textContent)).click();
    const note = _notes()[0];
    return _asked.length === 1 && _asked[0] === 'summarize this week' && !$('wizFull').classList.contains('show') && _notes().length === n0 + 1 && /^✎ Correction — re "- two dump runs": three dump runs$/.test(note.details) && prefs.wizFixes.length === 3 && _wizPend.length === 0;
  }));
  ok('"✕ Drop them" wants two taps and then nothing at all is saved', await page.evaluate(async () => {
    _open(); const n0 = _notes().length, f0 = prefs.wizFixes.length; _fix(1, 'a fix he will think better of');
    const drop = () => [...$('wfPend').querySelectorAll('button')].find(b => /Drop them|SURE/.test(b.textContent));
    drop().click(); const armed = /SURE\? tap again/.test(drop().textContent) && _wizPend.length === 1;
    drop().click();
    return armed && _wizPend.length === 0 && $('wfPend').innerHTML === '' && _notes().length === n0 && prefs.wizFixes.length === f0 && !document.querySelector('#wizFullBody .wl-fix.pend') && !localStorage.getItem('daylog-wizpend');
  }));

  console.log('— 🧷 nothing typed is lost —');

  ok('‹ Back with fixes kept but not saved: they are saved as he leaves (no asking again), and he is told', await page.evaluate(() => {
    _open(); _asked.length = 0; _said.length = 0; const f0 = prefs.wizFixes.length; _fix(2, 'it was 60 sheets');
    closeWizFull();
    return prefs.wizFixes.length === f0 + 1 && prefs.wizFixes[0].t === 'it was 60 sheets' && _wizPend.length === 0 && _asked.length === 0 && /1 fix you had kept was saved first/.test(_said.join(' ')) && !$('wizFull').classList.contains('show');
  }));
  ok('the ✕ on the card, and a DIFFERENT answer coming up, both save what was kept first — onto the answer it belongs to, not the new one', await page.evaluate(() => {
    const keepA = _open(); showInstantAnswer('summarize this week', _MD, _ids); closeWizFull(); const f0 = prefs.wizFixes.length;
    wizLineFix(4); $('wlText-4').value = 'Bo was out Wednesday'; wizLineSave(4); hideInlineAnswer();
    const a = prefs.wizFixes.length === f0 + 1 && _wizPend.length === 0 && $('askInline').style.display === 'none';
    const keepB = _open(); _fix(1, 'fix on answer B'); const idsB = _ids.slice();
    const s3 = addEntry('Note', 'another day', 'Oak House', { noSniff: true }), md2 = 'Another answer:\n- one line\n- two lines', keepC = wizKeep('what about monday', md2, [s3.id], '⚡').at;
    _lastAnswer = { q: 'what about monday', text: md2, srcIds: [s3.id], at: Date.now(), keep: keepC }; showWizFull('what about monday', md2, [s3.id], '⚡', null);
    const rowB = wizLog().find(r => r.at === keepB), rowC = wizLog().find(r => r.at === keepC);
    const b = (rowB.fix || []).some(f => f.t === 'fix on answer B') && !(rowC.fix || []).length && /ERIC CORRECTED[^\n]*fix on answer B/.test(entries.find(e => e.id === idsB[0]).ai) && !/fix on answer B/.test(entries.find(e => e.id === s3.id).ai || '') && _lastAnswer.q === 'what about monday' && _wizPend.length === 0 && !document.querySelector('#wizFullBody .wl-fix.pend');
    closeWizFull(); return a && b;
  }));
  ok('kept fixes survive a reload: the mirror brings them back when that answer is opened again', await page.evaluate(() => {
    const keep = _open(); _fix(3, 'four dump runs'); const mirror = localStorage.getItem('daylog-wizpend');
    _wizPend = []; _wizPendCtx = null; _wizPendRead = false; $('wizFull').classList.remove('show');   // what a reload leaves: memory empty, the mirror on the phone
    localStorage.setItem('daylog-wizpend', mirror); wizReopen(keep);
    const r = _wizPend.length === 1 && /KEPT — not saved yet: four dump runs/.test(_line(3).nextElementSibling.textContent) && /1 fix kept/.test($('wfPend').textContent);
    wizPendDrop(); wizPendDrop(); closeWizFull(); return r;
  }));
  ok('the whole-answer "✎ Wrong? Correct it" is as it was: saved on the spot with its own note, and it never asked again', await page.evaluate(() => {
    _open(); _asked.length = 0; const n0 = _notes().length; wizCorrectStart(); $('wizCorrText').value = 'the whole week was Pine Cabin'; saveCorrectionInline();
    const r = _notes().length === n0 + 1 && /^✎ Correction — re "summarize this week": the whole week was Pine Cabin$/.test(_notes()[0].details) && _asked.length === 0 && prefs.wizFixes[0].line === '';
    closeWizFull(); return r;
  }));
  ok('on the phone the bar fits: its buttons are tall enough to hit and nothing runs off the screen', await page.evaluate(() => {
    _open(); _fix(1, 'x'); const btns = [...$('wfPend').querySelectorAll('button')], w = $('wizFull');
    const r = btns.length === 3 && btns.every(b => b.getBoundingClientRect().height >= 43) && w.scrollWidth <= w.clientWidth + 1 && $('wfPend').getBoundingClientRect().bottom <= 844;
    wizPendDrop(); wizPendDrop(); closeWizFull(); return r;
  }));
  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v7.02') && document.querySelector('footer').textContent.includes(APP_VER);
  }));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
