// ✎🖥🔒 v6.83 — LINE BY LINE; THE PC BAR AT THE BOTTOM; BIGGER LINES IN THE VAULT. Eric: "In the vault, I want
// bigger lines between the different entries. yes to the line by line, also on the pc version id like the mileage
// and vault 4 buttons to be on the very bottom, theyre fine on the phone." The line-by-line spec (2026-09-13): "the
// words are in the text box maybe greyed out a little and not editable but i can click anywhere around it and add
// more text so that i can correct each line or item or bullet point and then you will read those corrections and
// update the wizard".
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
    jobs = ['Mery', 'Hertz']; curJob = ''; crew = ['Phil']; entries = []; todos = []; nextId = 1; pendingQueue = []; prefs.pocket = []; prefs.wizFixes = []; _wizLog = []; lsSet('daylog-wizlog', '[]');
    window.scheduleSave = () => {}; window.savePendingSoon = () => {}; window.publishSharedNotes = () => {}; window.wizLogSave = () => {};
    renderJobSelects(); closePanels(); renderAll();
  });

  console.log('— 🔒 v6.83 bigger lines in the Vault —');

  ok('Vault entries sit apart — 18px of room and a 3px rule between them', await page.evaluate(() => {
    vaultData = [{ id: 1, site: 'Enstar', user: 'eric', pass: 'x' }, { id: 2, site: 'HEA', user: 'eric', pass: 'y' }]; vaultKey = {}; vaultRevealed = new Set();
    vaultShowView('main'); vaultShowTab('login');
    const rows = [...$('vaultList').querySelectorAll('.vault-row')]; const cs = getComputedStyle(rows[0]);
    return rows.length === 2 && parseFloat(cs.paddingTop) >= 16 && parseFloat(cs.borderBottomWidth) >= 3 && parseFloat(getComputedStyle(rows[1]).borderBottomWidth) === 0;
  }));

  console.log('— ✎ v6.83 the answer, one locked line at a time —');

  ok('the full-screen answer draws each line locked and greyed with its own ✎ — not editable; the whole-answer ✎ Wrong? stays', await page.evaluate(() => {
    const src1 = addEntry('Note', 'poured footings at Mery, 2 kings delivered', 'Mery', { noSniff: true, ai: 'the photo: two kings on the truck' });
    const md = 'Tuesday you:\n- poured footings at Mery\n- took delivery of 2 kings\n\nNothing at Hertz.';
    const keep = wizKeep('what did we do tuesday', md, [src1.id], '⚡ quick brain').at;
    _lastAnswer = { q: 'what did we do tuesday', text: md, srcIds: [src1.id], at: Date.now(), keep };
    showWizFull('what did we do tuesday', md, [src1.id], '⚡ quick brain', null);
    const lines = [...document.querySelectorAll('#wizFullBody .wl-line')];
    const t = lines[2] && lines[2].querySelector('.wl-t');
    return $('wizFull').classList.contains('show') && lines.length === 4 && lines.every(l => l.querySelector('.wl-x')) && /2 kings/.test(t.textContent) &&
      parseFloat(getComputedStyle(t).opacity) < 1 && !t.isContentEditable && !t.querySelector('input, textarea') &&
      !!document.querySelector('#wizFullBody button[onclick="wizCorrectStart()"]') && _lastAnswer.lines.length === 4;
  }));

  ok('✎ on a line opens a box right under it with the locked words above, and closes the others', await page.evaluate(() => {
    wizLineFix(2);
    const box = $('wlBox-2'), lock = box && box.querySelector('.wl-lock');
    const a = !!lock && /took delivery of 2 kings/.test(lock.textContent) && !!$('wlText-2') && /Keep this fix/.test(box.textContent);   // ✎ v7.02 — a fix is KEPT; the saving (and the asking again) is at the end
    wizLineFix(1);
    return a && $('wlBox-2').innerHTML === '' && !!$('wlText-1');
  }));

  ok('a line fix lands everywhere: the record it came from, the log, the kept answer with its line, the durable LAST FIXES list — and it asks again', await page.evaluate(() => {
    window.askInstant = async q => { window._reasked = q; };
    window.aiKey = () => 'k';
    wizLineFix(2);
    $('wlText-2').value = 'it was 3 kings, the ticket is smudged';
    wizLineSave(2);
    wizPendSave(true);   // ✎ v7.02 — "Save and ask again" at the end does what the one button used to do per line (_test702 walks the keeping)
    const src1 = entries.find(e => e.ai && /two kings on the truck/.test(e.ai));
    const note = entries.find(e => /^✎ Correction/.test(e.details || ''));
    const row = wizLog()[0];
    return /ERIC CORRECTED \(re "- took delivery of 2 kings"\): it was 3 kings/.test(src1.ai) &&
      !!note && /re "- took delivery of 2 kings": it was 3 kings/.test(note.details) && note.job === '—' &&
      row.fix && row.fix.length === 1 && row.fix[0].t === 'it was 3 kings, the ticket is smudged' && row.fix[0].line === '- took delivery of 2 kings' &&
      prefs.wizFixes.length === 1 && prefs.wizFixes[0].line === '- took delivery of 2 kings' && prefs.wizFixes[0].q === 'what did we do tuesday' &&
      window._reasked === 'what did we do tuesday' && !$('wizFull').classList.contains('show');
  }));

  ok('the Wizard reads the fixes on every question, in words, under CORRECTIONS ERIC MADE', await page.evaluate(() => {
    const c = buildAskContext('how many kings came tuesday');
    const blk = c.split('CORRECTIONS ERIC MADE')[1] || '';
    return /they beat the records/.test(blk) && /it was 3 kings/.test(blk) && /"line":"- took delivery of 2 kings"/.test(blk);
  }));

  ok('opening the kept answer again shows the fix under the line it fixed', await page.evaluate(() => {
    const at = wizLog()[0].at;
    wizReopen(at);
    const line = [...document.querySelectorAll('#wizFullBody .wl-line')][2];
    const fix = line && line.nextElementSibling;
    const r = !!fix && fix.classList.contains('wl-fix') && /Eric: it was 3 kings/.test(fix.textContent);
    closeWizFull(); return r;
  }));

  ok('the sort page\'s WIZARD heading opens with ✎ LAST FIXES, not counted as waiting', await page.evaluate(() => {
    openReview();
    const body = document.querySelector('.rev-sec-body[data-sec="wizard"]');
    const card = body && body.querySelector('.rev-wizfix');
    const n = revWizRows().n;
    const r = !!card && /LAST FIXES/.test(card.textContent) && /it was 3 kings/.test(card.textContent) && /re "- took delivery of 2 kings"/.test(card.textContent) && n === 1 && body.querySelectorAll('.rev-wiz').length === 1;
    closeReview(); return r;
  }));

  ok('a whole-answer correction still works, with no line on it', await page.evaluate(() => {
    _lastAnswer = { q: 'what did we do tuesday', text: 'x', srcIds: [], at: Date.now(), keep: wizLog()[0].at };
    applyCorrection('the whole thing was Wednesday, not Tuesday');
    return prefs.wizFixes.length === 2 && prefs.wizFixes[0].line === '' && /Wednesday/.test(prefs.wizFixes[0].t) && wizLog()[0].fix.length === 2 && !wizLog()[0].fix[1].line;
  }));

  // ── the PC ──
  console.log('— 🖥 v6.83 the plate bar on the PC —');
  const ctx2 = await browser.newContext({ viewport: { width: 1200, height: 900 } });
  const p2 = await ctx2.newPage();
  await p2.goto(appUrl); await p2.waitForTimeout(700);
  ok('on a PC the plate bar is fixed to the very bottom, centred to the page, and the page leaves room for it', await p2.evaluate(() => {
    const c = document.querySelector('.capture'); const cs = getComputedStyle(c), r = c.getBoundingClientRect();
    return cs.position === 'fixed' && Math.abs(r.bottom - innerHeight) < 2 && r.width <= 1062 && Math.abs((r.left + r.right) / 2 - innerWidth / 2) < 3 && parseFloat(getComputedStyle(document.body).paddingBottom) >= 90;
  }));
  ok('…and the PC keeps its four plates — Mileage, Budget, Hours, Vault (Setup lives in the header there; the File Cabinet is in the museum, v6.84)', await p2.evaluate(() => [...document.querySelectorAll('.capture .cap-btn')].filter(b => getComputedStyle(b).display !== 'none').map(b => b.dataset.panel).join(',') === 'mileage,budget,hours,vault'));
  await ctx2.close();
  ok('on the phone the bar is still the fixed bottom bar it was', await page.evaluate(() => { const cs = getComputedStyle(document.querySelector('.capture')); return cs.position === 'fixed' && Math.abs(document.querySelector('.capture').getBoundingClientRect().bottom - innerHeight) < 2; }));

  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v6.83') && document.querySelector('footer').textContent.includes(APP_VER);
  }));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
