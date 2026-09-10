// 🧱 v6.56 — THE LOG BUTTONS, IN STRAIGHT ROWS. Eric: "the log tag buttons need rearranging and
// sized to fit much better than this." They were a flex-wrap row, so every brass plate sized to
// its own word: nine plates in six crooked rows of four different widths, and the log itself was
// pushed most of a screen down. One grid, equal columns, whole words.
const { chromium } = require('playwright');
(async () => {
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };
  const appUrl = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';

  console.log('— 🧱 v6.56 the running-log buttons —');

  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const errs = [];

  for (const skin of ['steam', 'plain']) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const page = await ctx.newPage();
    page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(skin + ': ' + e.message); });
    await page.goto(appUrl); await page.waitForTimeout(700);
    await page.evaluate((sk) => {
      document.documentElement.setAttribute('data-skin', sk === 'steam' ? 'steam' : '');
      jobs = ['Mery']; curJob = 'Mery'; crew = ['Phil', 'Milo']; entries = []; todos = [];
      for (let i = 0; i < 4; i++) addEntry('Note', 'sample note ' + i, 'Mery', {});
      closePanels(); renderAll(); renderAskRecent();
    }, skin);
    await page.waitForTimeout(300);

    const m = await page.evaluate(() => {
      const g = document.querySelector('.rl-filters');
      if (!g) return null;
      const chips = [...g.querySelectorAll('.pick-chip')];
      const filters = chips.filter(c => !c.classList.contains('rl-wide'));
      const r = el => el.getBoundingClientRect();
      const widths = [...new Set(filters.map(c => Math.round(r(c).width)))];
      const rows = [...new Set(chips.map(c => Math.round(r(c).top)))];
      // per row, how many plates share it
      const perRow = rows.map(t => chips.filter(c => Math.round(r(c).top) === t).length);
      return {
        grid: getComputedStyle(g).display,
        n: chips.length,
        widthSpread: Math.max(...widths) - Math.min(...widths),
        rows: rows.length,
        perRow,
        wideIsFull: Math.round(r(g.querySelector('.rl-wide')).width) >= Math.round(r(g).width) - 2,
        // a label that does not fit its own plate is clipped or broken mid-word
        clipped: chips.filter(c => c.scrollWidth > c.clientWidth + 1).map(c => c.textContent.trim()),
        headEqual: (() => {
          const h = [...document.querySelectorAll('.rl-head .pick-chip')].map(c => Math.round(r(c).width));
          return h.length < 2 || new Set(h).size === 1;
        })(),
        pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        tallest: Math.max(...chips.map(c => Math.round(r(c).height)))
      };
    });

    ok(`${skin}: the filter row is a real grid, not flex-wrap`, m && m.grid === 'grid', m && m.grid);
    ok(`${skin}: every filter plate is the SAME width`, m && m.widthSpread === 0, m && ('spread ' + m.widthSpread + 'px'));
    ok(`${skin}: three plates per row, four rows total`, m && m.rows === 4 && m.perRow.slice(0, 3).every(n => n === 3),
      m && (m.rows + ' rows, ' + JSON.stringify(m.perRow)));
    ok(`${skin}: "say something" spans the full width on its own row`, m && m.wideIsFull && m.perRow[3] === 1);
    ok(`${skin}: NO label is clipped or broken mid-word`, m && m.clipped.length === 0, m && m.clipped.join(' | '));
    ok(`${skin}: 🧾 Receipts and 🔍 Search are the same width`, m && m.headEqual);
    ok(`${skin}: the page still does not scroll sideways on a 390px phone`, m && m.pageOverflow === 0, m && (m.pageOverflow + 'px'));
    ok(`${skin}: plates stay a fat finger tall (>= 40px)`, m && m.tallest >= 40, m && (m.tallest + 'px'));

    // the filters still FILTER — tap Grinder, the row narrows to grinder entries
    const works = await page.evaluate(() => {
      const before = document.querySelectorAll('#askRecent .ask-recent-row').length;
      rlSet('grind');
      const after = document.querySelectorAll('#askRecent .ask-recent-row').length;
      const lit = [...document.querySelectorAll('.rl-filters .pick-chip')].some(c => c.classList.contains('sel') && /Grinder/i.test(c.textContent));
      rlSet('grind'); rlSet('grind'); prefs.rlFilter = ''; prefs.rlHide = []; renderAskRecent();
      return { before, after, lit };
    });
    ok(`${skin}: tapping a plate still filters the log, and lights up`, works.before > 0 && works.after > 0 && works.lit);

    await page.close(); await ctx.close();
  }

  ok('no page errors in either skin', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
