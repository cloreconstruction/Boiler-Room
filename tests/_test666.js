// 🕯 v6.66 — CALM BRASS + THE ESTIMATES PAGE LAID OUT TO BE READ. Eric: "something still easy on
// the eyes in the dark but also easy to read … important things draw my eye … especially the
// estimates page … i quickly get overwheled with everything im trying to see." Then: "build calm
// brass and estimates page layout."
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
  await page.goto(process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html');
  await page.waitForTimeout(700);
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };
  await page.evaluate(() => {
    jobs = ['Josten/Weiser']; curJob = 'Josten/Weiser'; crew = []; entries = []; todos = []; nextId = 1;
    renderJobSelects(); closePanels(); renderAll();
    window.scheduleSave = () => {};
    dbx.refreshToken = 'test-token';
    _portalIdx = { clients: [{ key: 'josten', job: 'Josten–Weiser Custom Home', code: 'josten-842d53' }] };
    window._dbxFiles = {};
    window.dbxDownload = async p => (window._dbxFiles || {})[p] ?? null;
    window.dbxUpload = async (p, body) => { (window._dbxFiles || {})[p] = body; return {}; };
    window.dbxPathExists = async p => Object.prototype.hasOwnProperty.call(window._dbxFiles || {}, p);
    // a board with the real shapes on it: one approved, two bills waiting, one over, one custom, the rest empty
    window._dbxFiles[estPath('josten-842d53')] = JSON.stringify({ mk: 20, cats: [
      { n: 'Framing', appr: true, bids: [{ e1: 48200, e2: 0, acc: true, inc: true }] },
      { n: 'Interior Paint', appr: false, bids: [], pend: [{ a: 15600, v: '', ts: '2026-09-06', base: 0, eid: 2842 }] },
      { n: 'Garage Doors', appr: false, bids: [], pend: [{ a: 3290, v: 'Peninsula', ts: '2026-09-05', base: 9240, eid: 2776 }] },
      { n: 'Roofing', appr: true, bids: [{ e1: 8000, e2: 0, acc: true, inc: true }] },   // the books show 12,000 against it → over
      { n: 'Porch swing', appr: false, bids: [{ e1: 900, e2: 0, acc: true }] }] });
    window._dbxFiles[portalRoot() + '/josten-842d53.json'] = JSON.stringify({ name: 'Josten–Weiser Custom Home', updated: '2026-09-11', show: { money: true, phases: true },
      invoiced: 21240, paid: 21240, open: 0, phases: [{ name: 'Shell', cats: [['Garage doors', 9240], ['Roofing', 12000]] }], journal: [] });
    _estIdx = -1; _estD = null; _estPage = null; window._qUpBusy = false;
  });
  // WCAG contrast from two computed colours
  const contrast = (sel, prop, bgSel) => page.evaluate(([sel, prop, bgSel]) => {
    const lum = c => { const m = c.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]; };
    const fg = getComputedStyle(document.querySelector(sel))[prop], bg = getComputedStyle(document.querySelector(bgSel)).backgroundColor;
    const a = lum(fg), b = lum(bg);
    return Math.round((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) * 10) / 10;
  }, [sel, prop, bgSel]);

  console.log('— 🕯 v6.66 the Calm Brass skin —');

  ok('Calm Brass is an Appearance pick, named, and it takes', await page.evaluate(() => {
    const chip = $('skin-calm');
    if (!chip) return false;
    setSkin('calm');
    return document.documentElement.dataset.skin === 'calm' && chip.classList.contains('sel') && SKIN_NAMES.calm === 'Calm Brass' && prefs.skin === 'calm';
  }));

  ok('it is dark, warm and never pure black — and the toggle cannot make it light', await page.evaluate(() => {
    const bg = getComputedStyle(document.body).backgroundColor;
    const before = bg;
    toggleLightDark(); const after = getComputedStyle(document.body).backgroundColor; toggleLightDark();
    return /rgb\(20, 17, 13\)/.test(bg) && after === before && getComputedStyle(document.documentElement).colorScheme === 'dark';
  }));

  ok('text on the page reads at 7:1 or better (the strict bar), dim text at 4.5:1 or better', (await contrast('body', 'color', 'body')) >= 7 && (await (async () => {
    await page.evaluate(() => { const d = document.createElement('div'); d.id = 'tHint'; d.className = 'hint'; d.textContent = 'x'; document.body.appendChild(d); });
    const r = await contrast('#tHint', 'color', 'body');
    await page.evaluate(() => $('tHint').remove());
    return r;
  })()) >= 4.5);

  ok('the brass plate: dark words on brass at 4.5:1 or better; a plain chip is a quiet raised plate', await (async () => {
    await page.evaluate(() => { const b = document.createElement('button'); b.id = 'tChip'; b.className = 'pick-chip sel'; b.textContent = 'x'; document.body.appendChild(b);
      const q = document.createElement('button'); q.id = 'tQuiet'; q.className = 'pick-chip'; q.textContent = 'x'; document.body.appendChild(q); });
    const r = await contrast('#tChip', 'color', '#tChip');
    const quiet = await page.evaluate(() => { const s = getComputedStyle($('tQuiet')), t = getComputedStyle($('tChip')); return s.backgroundColor !== t.backgroundColor && parseFloat(s.minHeight) >= 40 && s.textTransform !== 'uppercase'; });
    await page.evaluate(() => { $('tChip').remove(); $('tQuiet').remove(); });
    return r >= 4.5 && quiet;
  })());

  console.log('— 💰 v6.66 the estimates page, laid out —');

  await page.evaluate(async () => { await openEstimates(0); });
  await page.waitForTimeout(300);
  const board = () => page.evaluate(() => $('revBox').textContent);

  ok('it opens on NEEDS YOU: the two bills first, then the phases in build order', await page.evaluate(() => {
    const heads = [...document.querySelectorAll('.est-phase')].map(h => h.textContent.replace(/\s+/g, ' ').trim());
    const firstRows = [...document.querySelectorAll('.est-phase.need ~ .est-row:not([hidden])')].slice(0, 2).map(r => r.querySelector('.est-name').textContent.trim());
    return /^⚠ Needs you 2 bills waiting$/.test(heads[0]) && /^Site & utilities/.test(heads[1]) && /^Foundation & shell/.test(heads[2]) && /^Mechanical/.test(heads[3]) && /^Interior finish/.test(heads[4]) && /^Other costs/.test(heads[5]) && heads.length === 6 &&
      firstRows.join('|') === '▸ Interior Paint|▸ Garage Doors';
  }));

  ok('the header says what is showing and what needs him; the how-it-works words are one tap away', await page.evaluate(() => {
    const t = $('revBox').textContent;
    const help = $('estHelpBox');
    const shut = help && getComputedStyle(help).display === 'none' && /Notes and bid papers NEVER reach the client/.test(help.textContent);
    estHelp();
    const open = getComputedStyle($('estHelpBox')).display !== 'none' && /▾ \? How this works/.test($('revBox').textContent);
    estHelp();
    return /2 showing on their page — \$56,200 approved/.test(t) && /⚠ 3 need you/.test(t) && /💹 markup 20%/.test(t) && shut && open;
  }));

  ok('each row: the name, the number in its own column, the lamp in words — and the detail on its own line', await page.evaluate(() => {
    const row = n => [...document.querySelectorAll('.est-row')].find(r => r.querySelector('.est-name').textContent.includes(n));
    const fr = row('Framing'), ip = row('Interior Paint'), gd = row('Garage Doors');
    return fr.querySelector('.est-num').textContent === '$48,200' && /✓ ON PAGE/.test(fr.querySelector('.est-lamp').textContent) && /✓ ON THEIR PAGE/.test(fr.querySelector('.est-sub').textContent) &&
      ip.querySelector('.est-num').textContent === '$18,720' && /🏢 office/.test(ip.querySelector('.est-lamp').textContent) && /📥 \$18,720 on the way/.test(ip.querySelector('.est-sub').textContent) &&
      gd.querySelector('.est-num').textContent === '$3,948' && /\$9,240 in/.test(gd.querySelector('.est-sub').textContent);
  }));

  ok('a category over its estimate is a NEEDS YOU too, and says over', await page.evaluate(() => {
    const row = n => [...document.querySelectorAll('.est-row')].find(r => r.querySelector('.est-name').textContent.includes(n));
    const rf = row('Roofing');
    return rf && rf.previousElementSibling !== null && /over \$4,000/.test(rf.querySelector('.est-sub').textContent) &&
      [...document.querySelectorAll('.est-phase.need ~ .est-row:not([hidden])')].slice(0, 3).some(r => r === rf);
  }));

  ok('empty rows fold away under their phase, with a line that says how many; the tap brings them back', await page.evaluate(() => {
    const hidden = [...document.querySelectorAll('.est-row[hidden]')];
    const site = [...document.querySelectorAll('.est-empty-fold')][0];   // the first fold line = Site & utilities, all 12 of them empty
    const n = +(site.textContent.match(/\+(\d+) empty/) || [])[1];
    const before = hidden.length;
    site.click();
    const shownNow = [...document.querySelectorAll('.est-row[hidden]')].length;
    const wordAfter = /hide the \d+ empty/.test([...document.querySelectorAll('.est-empty-fold')][0].textContent);
    [...document.querySelectorAll('.est-empty-fold')][0].click();
    return before >= 40 && n >= 10 && shownNow === before - n && wordAfter && [...document.querySelectorAll('.est-row[hidden]')].length === before;
  }));

  ok('a custom category with a bid sits under OTHER COSTS, visible', await page.evaluate(() => {
    const row = [...document.querySelectorAll('.est-row')].find(r => r.querySelector('.est-name').textContent.includes('Porch swing'));
    let h = row.previousElementSibling; while (h && !h.classList.contains('est-phase')) h = h.previousElementSibling;
    return !!row && !row.hidden && h && /Other costs/.test(h.textContent) && row.querySelector('.est-num').textContent === '$1,080';
  }));

  ok('a brand-new category does not vanish into the fold the moment it is made', await page.evaluate(() => {
    $('estNewCat').value = 'Sauna';
    estAddCat();
    const row = [...document.querySelectorAll('.est-row')].find(r => r.querySelector('.est-name').textContent.includes('Sauna'));
    return !!row && !row.hidden && row.classList.contains('est-open');
  }));

  ok('every control is still there: the lamp arms and lights, the bill strip holds the markup and the by-hand line', await page.evaluate(async () => {
    const ci = _estD.cats.findIndex(x => x.n === 'Porch swing');   // a bid picked, lamp dark → the first tap ARMS
    estApprove(ci);
    const armed = /⚠ SURE\?/.test([...document.querySelectorAll('.est-row')].find(r => r.querySelector('.est-name').textContent.includes('Porch swing')).querySelector('.est-lamp').textContent);
    _estArm = ''; renderEstimates();
    _estBillFold = true; renderEstimates();
    const mk = [...document.querySelectorAll('input')].find(i => i.getAttribute('onchange') === 'estSetMk(this.value)');
    const ok1 = armed && !!$('estHandA') && !!$('estHandC') && !!$('estHandV') && !!mk && mk.value === '20' && /BILLS THAT CAME IN/.test($('revBox').textContent);
    _estBillFold = false; renderEstimates();
    return ok1 && /💹 markup 20% · tap to file one by hand/.test($('revBox').textContent);
  }));

  ok('in Calm Brass the chips and buttons on the board are thumb-sized and the rows are hairlines', await page.evaluate(() => {
    const lamp = document.querySelector('.est-row:not([hidden]) .est-lamp');
    const btn = document.querySelector('.est-board .est-help-btn');
    const row = document.querySelector('.est-row:not([hidden]):not(.est-open)');
    const s = getComputedStyle(row);
    return parseFloat(getComputedStyle(lamp).minHeight) >= 36 && parseFloat(getComputedStyle(btn).minHeight) >= 44 &&
      s.borderTopWidth === '0px' && s.borderBottomWidth === '1px' && parseFloat(getComputedStyle(row.querySelector('.est-name')).fontSize) >= 16 && parseFloat(getComputedStyle(row.querySelector('.est-num')).fontSize) >= 17;
  }));

  ok('never colour alone: every lamp on the board carries a word', await page.evaluate(() =>
    [...document.querySelectorAll('.est-lamp')].every(l => /ON PAGE|office|SURE/.test(l.textContent))));

  ok('the other skins keep their look — Steamworks rows are still boxes, and the v6.42 floor still holds', await page.evaluate(() => {
    setSkin('steam'); renderEstimates();
    const row = document.querySelector('.est-row:not([hidden]):not(.est-open)');
    const boxed = parseFloat(getComputedStyle(row).borderTopWidth) >= 1;
    const css = [...document.styleSheets].flatMap(sh => { try { return [...sh.cssRules]; } catch (e) { return []; } });
    const rule = css.find(r => r.selectorText === '.est-board .pick-chip');
    setSkin('calm');
    return boxed && rule && parseFloat(rule.style.minHeight) >= 34;
  }));

  await page.evaluate(() => { closeEstimates(); setSkin(''); });

  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v6.66') && document.querySelector('footer').textContent.includes(APP_VER);
  }));

  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
