// v7.24 — Eric, with pictures of the Build List on his phone and his PC: "it's getting a little crowded on the phone. See if there's
// anything you can do to clean it up. Although I like the size of the buttons quite a bit I feel like the main button where the
// check mark actually goes when the thing is done next to the title I don't feel like that's really used because my eyes are
// jumping straight to the yellow cards that are lit up or not." On his phone the name's small words ("· pick needed · 🏷 Siding ·
// 🏠 client") ran UNDER the 🕘 ✎ ✕ plates. Every name here is made up.
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
  const seed = async page => page.evaluate(async () => {
    jobs = ['Oak House']; crew = ['Phil']; entries = []; todos = []; nextId = 1; pendingQueue = [];
    window.scheduleSave = () => {}; window.savePendingSoon = () => {}; window.publishSharedNotes = () => {};
    renderJobSelects(); closePanels(); renderAll();
    dbx.refreshToken = 't'; _portalIdx = { clients: [{ key: 'oak', job: 'Oak House', code: 'oak-111aaa' }] };
    window._dbxFiles = {}; window.dbxDownload = async p => (window._dbxFiles || {})[p] ?? null; window.dbxUpload = async (p, b) => { window._dbxFiles[p] = b; return {}; };
    const now = new Date().toISOString();
    _dbxFiles[portalRoot() + '/materials-office-oak-111aaa.json'] = JSON.stringify({ full: true, seq: 9, rooms: [{ name: 'Exterior', items: [
      { id: 'e1', n: 'Soffit', t: 'Misc', hm: true, s: 'pick', tg: ['Siding'], first: true, desc: 'Tan vinyl, vented', sel: 'need to find options', chg: [{ at: now, by: 'Eric', f: 'note', from: '', to: 'need to find options' }] },
      { id: 'e2', n: 'Roofing shingle color', t: 'Misc', hm: true, s: 'arrived', sch: true, tg: ['Roofing'], desc: 'Match next door' },
      { id: 'e3', n: 'Fascia', t: 'Misc', hm: true, s: 'picked', tg: ['Siding'], kids: [{ n: 'email the supplier' }], desc: 'Metal - Tan', chg: [{ at: now, by: 'the homeowner', f: 'what was picked', from: '', to: 'Metal - Tan' }] },
      { id: 'e4', n: 'Check the vents', t: 'Misc', s: 'todo' },
      { id: 'e5', n: 'Hood', t: 'Misc', buy: true, s: 'ordered' }] }] });
    await openMaterials(0); _matRmShut = new Set(); renderMatMgr();
    window._rows = () => [...document.querySelectorAll('#revBox .mat-item')];
    window._geo = () => _rows().map(r => {
      const nm = r.querySelector('.mat-nm'), q = r.querySelector('.mat-q, .mat-q-ph'), l2 = r.querySelector('.mat-line2'), hint = nm && nm.querySelector('.hint');
      const R = el => el.getBoundingClientRect();
      return { name: nm.querySelector('b').textContent, lamp: !!r.querySelector('.frow > button'), nmRight: Math.round(R(nm).right), plateLeft: Math.round(R(q).left), nmH: Math.round(R(nm).height),
        wrap: hint ? getComputedStyle(hint).whiteSpace : '', l2Left: Math.round(R(l2).left), nmLeft: Math.round(R(nm).left) };
    });
  });
  for (const [w, h, name] of [[390, 844, 'the phone'], [1280, 900, 'a PC']]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: w < 700, hasTouch: w < 700 });
    await ctx.route(u => !/^file:/.test(u.href), r => r.abort());
    const page = await ctx.newPage();
    page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
    await page.goto(appUrl); await page.waitForTimeout(700);
    await seed(page);
    const g = await page.evaluate(() => ({ rows: _geo(), over: $('revBox').scrollWidth > $('revBox').clientWidth + 1 || document.documentElement.scrollWidth > document.documentElement.clientWidth }));
    ok(`${name}: no round lamp at the front of any row — the lights are the controls`, g.rows.length === 5 && g.rows.every(r => !r.lamp), JSON.stringify(g.rows.map(r => r.lamp)));
    ok(`${name}: the name's small words stop BEFORE the 🕘 ✎ ✕ plates on every row (they wrap, they never run under the plates), and nothing runs off the side`, g.rows.every(r => r.nmRight <= r.plateLeft && r.wrap === 'normal') && !g.over, JSON.stringify(g.rows));
    ok(`${name}: the lights start under the name, not forty pixels in`, g.rows.every(r => Math.abs(r.l2Left - r.nmLeft) <= 4), JSON.stringify(g.rows.map(r => [r.l2Left, r.nmLeft])));
    if (w < 700) ok('the phone: a long line of small words wraps to a second line under the name (the Soffit row), a short one stays on one ("Hood · ordered")', g.rows[0].nmH > 30 && g.rows.find(r => r.name === 'Hood').nmH < 30, JSON.stringify(g.rows.map(r => [r.name, r.nmH])));
    else ok('a PC: every name and its small words read on ONE line', g.rows.every(r => r.nmH < 30), JSON.stringify(g.rows.map(r => [r.name, r.nmH])));
    if (w >= 700) ok('"? how this works" no longer speaks of a round lamp', await page.evaluate(() => { _matHelp = true; renderMatMgr(); const t = ($('matHelpBox') || {}).textContent || ''; _matHelp = false; renderMatMgr(); return t.length > 100 && !/round lamp/.test(t) && /Tap a light, then tap it again/.test(t); }));
    await ctx.close();
  }

  ok('version bumped — APP_VER and the footer agree', /const APP_VER = 'v7\.(2[4-9]|[3-9]\d)'/.test(src) && new RegExp('<footer>' + (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1].replace('.', '\\.')).test(src));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
