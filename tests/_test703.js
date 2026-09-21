// 🖥 v7.03 — Eric: "on the phone the edit buttons on the summary works great but on the pc its hard to follow across and
// click the right edit pencil as is far apart on the big screen." A PC-size window and a real mouse: the pencil leads its
// line, the answer keeps a readable width, the line under the mouse lights as one band, a click anywhere on it opens the
// fix. Then a phone, where nothing changed. Every word is made up.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { fileURLToPath } = require('url');
(async () => {
  const appUrl = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const repo = path.dirname(fileURLToPath(appUrl));
  const src = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };
  const setup = async page => page.evaluate(() => {
    jobs = ['Oak House']; entries = []; todos = []; nextId = 1; prefs.wizFixes = []; _wizLog = []; lsSet('daylog-wizlog', '[]'); lsSet('daylog-wizpend', '');
    window.scheduleSave = () => {}; window.wizLogSave = () => {}; closePanels(); renderAll();
    const md = 'This week:\n- framed the pony wall at Oak House and set the beam pocket headers on the north side\n- hung siding\n- two dump runs\n\nNothing else.';
    const keep = wizKeep('summarize this week', md, [], 'quick brain').at; _lastAnswer = { q: 'summarize this week', text: md, srcIds: [], at: Date.now(), keep };
    showWizFull('summarize this week', md, [], 'quick brain', null);
    window._line = i => [...document.querySelectorAll('#wizFullBody .wl-line')][i];
  });

  console.log('— 🖥 v7.03 on the PC —');
  const pc = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  const errs = []; pc.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
  await pc.goto(appUrl); await pc.waitForTimeout(700); await setup(pc);
  const g = await pc.evaluate(() => { const l = _line(1), x = l.querySelector('.wl-x').getBoundingClientRect(), t = l.querySelector('.wl-t').getBoundingClientRect(), list = document.querySelector('#wizFullBody .wl-list').getBoundingClientRect(); return { xLeft: Math.round(x.left), tLeft: Math.round(t.left), gap: Math.round(t.left - x.right), listW: Math.round(list.width), rowW: Math.round(l.getBoundingClientRect().width), cursor: getComputedStyle(l).cursor }; });
  ok('the pencil LEADS its line — it sits just left of the words, not a screen-width away — and the answer keeps a readable width', g.xLeft < g.tLeft && g.gap >= 0 && g.gap <= 24 && g.listW <= 881 && g.rowW <= 881 && g.cursor === 'pointer', JSON.stringify(g));
  const before = await pc.evaluate(() => ({ bg: getComputedStyle(_line(2)).backgroundColor, op: getComputedStyle(_line(2).querySelector('.wl-t')).opacity, bc: getComputedStyle(_line(2).querySelector('.wl-x')).borderTopColor }));
  const box2 = await pc.evaluate(() => { const r = _line(2).getBoundingClientRect(); return { x: r.left + r.width * 0.6, y: r.top + r.height / 2 }; });
  await pc.mouse.move(box2.x, box2.y); await pc.waitForTimeout(80);
  const hov = await pc.evaluate(() => ({ bg: getComputedStyle(_line(2)).backgroundColor, op: getComputedStyle(_line(2).querySelector('.wl-t')).opacity, bc: getComputedStyle(_line(2).querySelector('.wl-x')).borderTopColor, other: getComputedStyle(_line(1)).backgroundColor }));
  ok('the line under the mouse lights up as ONE band with its pencil — so the eye never has to track across — and the others stay plain', hov.bg !== before.bg && hov.op === '1' && hov.bc !== before.bc && hov.other === before.bg, JSON.stringify({ before, hov }));
  await pc.mouse.click(box2.x, box2.y); await pc.waitForTimeout(80);
  ok('a click ANYWHERE on the line — out on the words — opens that line\'s fix, with the locked words above the box', await pc.evaluate(() => !!$('wlText-2') && /hung siding/.test($('wlBox-2').querySelector('.wl-lock').textContent) && $('wlBox-1').innerHTML === ''));
  ok('the fix box and a kept fix sit under the words, not out under the pencil', await pc.evaluate(() => { const b = $('wlBox-2').getBoundingClientRect(), t = _line(2).querySelector('.wl-t').getBoundingClientRect(); $('wlText-2').value = 'hung 54 sheets'; wizLineSave(2); const p = _line(2).nextElementSibling.getBoundingClientRect(); return Math.abs(b.left - t.left) <= 12 && Math.abs(p.left - t.left) <= 12 && /KEPT/.test(_line(2).nextElementSibling.textContent); }));
  const px = await pc.evaluate(() => { const r = _line(1).querySelector('.wl-x').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  await pc.mouse.click(px.x, px.y); await pc.waitForTimeout(80);
  ok('the pencil itself still works — ONE click opens the box (it does not open and shut)', await pc.evaluate(() => !!$('wlText-1')));
  ok('no page errors on the PC', errs.length === 0, errs.join(' | '));

  console.log('— 📱 the phone is as it was —');
  const ph = await (await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })).newPage();
  await ph.goto(appUrl); await ph.waitForTimeout(700); await setup(ph);
  ok('on the phone the pencil stays at the right of its line, and a tap on the words does nothing — only the pencil opens the fix', await ph.evaluate(() => {
    const l = _line(1), x = l.querySelector('.wl-x').getBoundingClientRect(), t = l.querySelector('.wl-t').getBoundingClientRect();
    l.querySelector('.wl-t').click(); const shut = !$('wlText-1');
    l.querySelector('.wl-x').click(); const open = !!$('wlText-1');
    return x.left > t.right - 2 && shut && open && document.documentElement.scrollWidth <= document.documentElement.clientWidth;
  }));
  ok('version bumped — APP_VER and the footer agree', await ph.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v7.03') && document.querySelector('footer').textContent.includes(APP_VER);
  }));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
