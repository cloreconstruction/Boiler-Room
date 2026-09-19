// 🧷💡 v6.95 — Eric: "whenever i click on a drop down menu make sure when the card opens it doesnt change in relation to
// where my mouse is. it makes it jump and i have to move my mouse to get to the drop down again" · "on the running log
// where i can select a person in a drop down list, when someone is selected make sure its highlighted to show that filter
// is on". A PC-size window and real mouse clicks: the heading he clicks must still be under the pointer when the card
// has opened — also when another card above it shut, and also when the window cannot scroll far enough to make it up.
// Every name and word below is made up.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { fileURLToPath } = require('url');
(async () => {
  const appUrl = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const repo = path.dirname(fileURLToPath(appUrl));
  const src = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
  await page.goto(appUrl); await page.waitForTimeout(700);
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };

  await page.evaluate(() => {
    jobs = ['Mery', 'Oak Street']; curJob = ''; crew = ['Phil', 'Nathan']; entries = []; todos = []; nextId = 1; pendingQueue = []; prefs.pocket = []; prefs.rlWho = ''; prefs.rlFilter = ''; prefs.rlHide = [];
    window.scheduleSave = () => {}; window.savePendingSoon = () => {}; window.publishSharedNotes = () => {};
    // a tall POCKET section (22 leftovers), a few people rows, some sent-to-Logan rows and a record — enough to scroll
    for (let i = 1; i <= 22; i++) addEntry('Note', '🎒 Flushed — leftover number ' + i + ' about the porch steps', '—', { pocket: 'flushed', tags: ['pocket'], ts: new Date(Date.now() - i * 3600e3) });
    for (let i = 1; i <= 6; i++) addEntry('Note', 'Sent the receipt batch ' + i, 'Mery', { tags: ['Bookkeeper'], ts: new Date(Date.now() - i * 5400e3) });
    addEntry('Note', 'Text from Phil: the trusses are here', '—', { texted: true, who: 'Phil', tags: ['Phil'] });
    addEntry('Note', 'Text from Nathan: on my way', '—', { texted: true, who: 'Nathan', tags: ['Nathan'] });
    renderJobSelects(); closePanels(); renderAll();
    window._head = k => [...document.querySelectorAll('#revBox [aria-expanded]')].find(b => (b.getAttribute('onclick') || '') === `sumSecTap('${k}')`);
    window._top = k => Math.round(_head(k).getBoundingClientRect().top);
  });

  console.log('— 🧷 v6.95 the heading he clicks stays under the pointer —');

  // open the summary, open the tall POCKET section, scroll down to the headings under it
  await page.evaluate(() => { openReview('summary'); _sumSpan = 'week'; _sumSec = 'pocket'; renderReview(); });
  await page.waitForTimeout(100);
  const s1 = await page.evaluate(() => { const m = $('revModal'); _head('logan').scrollIntoView({ block: 'center' }); return { st: Math.round(m.scrollTop), tall: Math.round(document.querySelector('.rev-sec-body[data-sec="pocket"]').getBoundingClientRect().height) }; });
  const clickHead = async k => { const b = await page.evaluate(k => { const r = _head(k).getBoundingClientRect(); return { x: r.left + 60, y: r.top + r.height / 2, top: Math.round(r.top) }; }, k); await page.mouse.click(b.x, b.y); await page.waitForTimeout(260); return b; };
  const under = (k, b) => page.evaluate(({ k, b }) => { const el = document.elementFromPoint(b.x, b.y); return { top: _top(k), onIt: !!el && !!el.closest('[aria-expanded]') && el.closest('[aria-expanded]') === _head(k), open: _head(k).getAttribute('aria-expanded') }; }, { k, b });

  const b1 = await clickHead('logan'); const a1 = await under('logan', b1);
  ok('a tall card is open ABOVE; he clicks a heading below it: that card shuts, the new one opens — and the heading he clicked is still exactly under the mouse', s1.tall > 900 && s1.st > 300 && a1.open === 'true' && Math.abs(a1.top - b1.top) <= 2 && a1.onIt, JSON.stringify({ s1, b1, a1 }));

  const b2 = await clickHead('logan'); const a2 = await under('logan', b2);
  ok('clicking it again shuts it without the heading moving — the same spot twice', a2.open === 'false' && Math.abs(a2.top - b2.top) <= 2 && a2.onIt, JSON.stringify({ b2, a2 }));

  // the hard case: a short-ish card above, the window scrolled to its very top — it cannot scroll up to make the difference
  const s3 = await page.evaluate(async () => { _sumSec = 'people'; renderReview(); $('revModal').scrollTop = 0; await new Promise(r => setTimeout(r, 60)); return { st: $('revModal').scrollTop, h: Math.round(document.querySelector('.rev-sec-body[data-sec="people"]').getBoundingClientRect().height), y: _top('money') }; });
  const b3 = await clickHead('money'); const a3 = await under('money', b3);
  const pad3 = await page.evaluate(() => parseFloat($('revBox').style.paddingTop) || 0);
  ok('at the very top of the window, where it cannot scroll to make up the difference, the heading STILL does not move — the card takes blank room at its top instead', s3.st === 0 && s3.h > 60 && s3.y < 760 && a3.open === 'true' && Math.abs(a3.top - b3.top) <= 2 && a3.onIt && pad3 > 50, JSON.stringify({ s3, b3, a3, pad3 }));

  const melt = await page.evaluate(async () => {
    const m = $('revModal'), before = _top('money'), pad0 = parseFloat($('revBox').style.paddingTop) || 0;
    m.scrollTop = 40; await new Promise(r => setTimeout(r, 120));
    const pad1 = parseFloat($('revBox').style.paddingTop) || 0, mid = _top('money');
    m.scrollTop = m.scrollTop + 4000; await new Promise(r => setTimeout(r, 120)); m.scrollTop = 0; await new Promise(r => setTimeout(r, 120));
    return { pad0, pad1, moved: before - mid, padEnd: parseFloat($('revBox').style.paddingTop) || 0 };
  });
  ok('that blank room melts away as he scrolls down — the page moves by what he scrolled and no more — and it is gone for good after', melt.pad1 < melt.pad0 && Math.abs(melt.moved - 40) <= 2 && melt.padEnd === 0, JSON.stringify(melt));

  ok('closing the window clears any blank room left, so the next window opens clean', await page.evaluate(async () => {
    _sumSec = 'people'; renderReview(); $('revModal').scrollTop = 0; await new Promise(r => setTimeout(r, 40));
    _head('money').click(); await new Promise(r => setTimeout(r, 200));
    const had = (parseFloat($('revBox').style.paddingTop) || 0) > 0;
    closeReview(); const gone = !$('revBox').style.paddingTop;
    return had && gone;
  }));

  const brd = await page.evaluate(async () => {
    entries = []; nextId = 1;
    for (let i = 1; i <= 14; i++) addEntry('Note', 'Mery board line ' + i, 'Mery', { board: { p: 0, done: '', sub: [], at: new Date().toISOString() } });
    for (let i = 1; i <= 5; i++) addEntry('Note', 'Oak board line ' + i, 'Oak Street', { board: { p: 0, done: '', sub: [], at: new Date().toISOString() } });
    openReview('board'); _brdShow = 'Mery'; renderReview(); await new Promise(r => setTimeout(r, 60));
    const h = () => [...document.querySelectorAll('#revBox [aria-expanded]')].find(b => /brdFold\('Oak Street'\)/.test(b.getAttribute('onclick') || ''));
    h().scrollIntoView({ block: 'center' }); await new Promise(r => setTimeout(r, 60));
    const t0 = Math.round(h().getBoundingClientRect().top); h().click(); await new Promise(r => setTimeout(r, 220));
    const r = { moved: Math.abs(Math.round(h().getBoundingClientRect().top) - t0), open: h().getAttribute('aria-expanded') };
    closeReview(); return r;
  });
  ok('the same on the board (and every other fold in the app — one listener): Mery open above, he opens Oak Street, the heading holds still', brd.moved <= 2 && brd.open === 'true', JSON.stringify(brd));

  ok('it only ever touches a FOLD\'s heading — a plain button that scrolls on purpose is left alone, and one listener serves the app', (() => {
    return /const FOLD = '\[aria-expanded\], \[onclick\^="gFold\("\], \[onclick\^="brdOpen\("\]';/.test(src) && (src.match(/\(function foldAnchor\(\)/g) || []).length === 1 && /if \(window\.foldPadReset\) foldPadReset\(\);/.test(src);
  })());

  console.log('— 💡 v6.95 a wheel that is holding a filter is lit —');

  const w = await page.evaluate(async () => {
    entries = []; nextId = 1;
    addEntry('Note', 'Text from Phil: the trusses are here', '—', { texted: true, who: 'Phil', tags: ['Phil'] });
    addEntry('Note', 'Text from Nathan: on my way', '—', { texted: true, who: 'Nathan', tags: ['Nathan'] });
    addEntry('Note', 'Ordered the hangers', 'Mery', {});
    prefs.rlWho = ''; renderAskRecent();
    const sel = () => $('rlWhoSel'); const cs = () => getComputedStyle(sel());
    const off = { has: !!sel(), lit: sel().classList.contains('sel-on'), first: sel().options[0].textContent, bw: cs().borderTopWidth, fw: cs().fontWeight };
    sel().value = 'Phil'; sel().dispatchEvent(new Event('change'));
    const on = { lit: sel().classList.contains('sel-on'), picked: sel().options[sel().selectedIndex].textContent, value: sel().value, first: sel().options[0].textContent, bw: cs().borderTopWidth, fw: cs().fontWeight, label: sel().getAttribute('aria-label'),
      rows: [...document.querySelectorAll('#askRecent .ask-recent-row')].map(r => r.textContent).join(' | '), all: [...document.querySelectorAll('#askRecent .rl-filters .pick-chip')][0].classList.contains('sel') };
    sel().value = ''; sel().dispatchEvent(new Event('change'));
    const back = { lit: sel().classList.contains('sel-on'), who: prefs.rlWho, first: sel().options[0].textContent };
    return { off, on, back };
  });
  ok('with nobody picked the person wheel is plain ("👤 person…"); pick Phil and it is LIT — a heavy brass edge, heavy words — and reads "✓ ONLY Phil", with the first line turned into "✕ everyone — clear this filter"', w.off.has && !w.off.lit && /person…/.test(w.off.first) && w.on.lit && w.on.picked === '✓ ONLY Phil' && w.on.value === 'Phil' && /everyone — clear this filter/.test(w.on.first) && parseFloat(w.on.bw) >= 2 && parseFloat(w.off.bw) < 2 && +w.on.fw >= 700 && /person filter ON — only Phil/.test(w.on.label), JSON.stringify(w));
  ok('the filter really is on (only Phil\'s traffic, ✳ All no longer lit), and the first line clears it and the light', /Phil/.test(w.on.rows) && !/Nathan|hangers/.test(w.on.rows) && !w.on.all && !w.back.lit && w.back.who === '' && /person…/.test(w.back.first), JSON.stringify(w));

  ok('the search window\'s wheels and boxes do the same: whatever is holding something is lit and its label says ✓ ON — and lets go when it is cleared', await page.evaluate(() => {
    rlSearchShow(true);
    const lab = id => $(id).closest('.field').querySelector('label').textContent;
    $('lfWho').value = 'Phil'; $('lfWho').dispatchEvent(new Event('change'));
    $('logSearch').value = 'trusses'; $('logSearch').dispatchEvent(new Event('input'));
    const a = $('lfWho').classList.contains('sel-on') && lab('lfWho') === 'Who ✓ ON' && $('logSearch').classList.contains('sel-on') && !$('lfJob').classList.contains('sel-on') && lab('lfJob') === 'Job';
    clearLogFilters();
    const b = !$('lfWho').classList.contains('sel-on') && lab('lfWho') === 'Who' && !$('logSearch').classList.contains('sel-on');
    rlSearchShow(false);
    return a && b;
  }));

  ok('nothing runs off the right edge of the main page', await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth));
  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v6.95') && document.querySelector('footer').textContent.includes(APP_VER);
  }));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
