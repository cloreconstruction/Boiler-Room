// 🎨📊 v6.85 — TWO THEMES, FIVE CALM TONES; ONE SUMMARY BUTTON ON THE PC. Eric: "In the appearance and theme I'd like
// you to get rid of everything but Steamworks and Calm Brass. Then use the calm brass THEME as its the best, but make a
// few different color schemes with different background colors. Make them very neutral and easy on the eyes." and
// "Looks like we have two summary buttons at the top. Let's keep the one at the very top between the Instant and the
// Setup buttons, at least on the PC version."
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
    jobs = ['Mery', 'Hertz']; curJob = ''; crew = ['Phil']; entries = []; todos = []; nextId = 1; pendingQueue = []; prefs.pocket = [];
    window.scheduleSave = () => {}; window.savePendingSoon = () => {}; window.publishSharedNotes = () => {};
    renderJobSelects(); closePanels(); renderAll();
  });
  const SIX = 'calm,calm-slate,calm-graphite,calm-moss,calm-stone,steam';

  console.log('— 🎨 v6.85 six picks, the rest in the museum —');

  ok('Appearance offers exactly six picks — Calm Brass, four more Calm tones, Steamworks — each with its words and a colour dot, and no Light / dark button', await page.evaluate(() => {
    // v7.19 — the 🔤 Letters row (A–E) shares the Appearance box; the six THEME picks are the #skinChips row
    const chips = [...document.querySelectorAll('#setAppear #skinChips .pick-chip')];
    return chips.map(c => c.id).join(',') === 'skin-calm,skin-calm-slate,skin-calm-graphite,skin-calm-moss,skin-calm-stone,skin-steam' && chips.every(c => /Calm|Steamworks/.test(c.textContent) && c.querySelector('.skin-dot')) &&
      !$('lightDarkBtn') && Object.keys(SKIN_NAMES).join(',') === 'calm,calm-slate,calm-graphite,calm-moss,calm-stone,steam' && SKIN_NAMES.calm === 'Calm Brass' && SKIN_NAMES.steam === 'Steamworks';
  }));

  ok('the museum took the rest: no Clore Gold, Command Center, Steel, High-Vis, Blueprint, Winter Night or Daylight chip, and their CSS is gone from the file', await page.evaluate(() =>
    ['skin-default', 'skin-command', 'skin-steel', 'skin-hiviz', 'skin-blueprint', 'skin-winter', 'skin-daylight'].every(id => !$(id))) && !/data-skin="(command|steel|hiviz|blueprint|winter|daylight)"/.test(src) && /data-skin="calm"\]\[data-tone="stone"\]/.test(src));

  ok('a Calm tone pick takes: data-skin calm + data-tone on the root, the pref, the phone\'s memory, the lit chip, the page colour', await page.evaluate(() => {
    setSkin('calm-slate');
    const d = document.documentElement.dataset;
    return d.skin === 'calm' && d.tone === 'slate' && prefs.skin === 'calm-slate' && lsGet('daylog-skin') === 'calm-slate' && $('skin-calm-slate').classList.contains('sel') && !$('skin-calm').classList.contains('sel') &&
      getComputedStyle(document.body).backgroundColor === 'rgb(19, 22, 25)' && /Calm Slate/.test($('toast').textContent);
  }));

  ok('back to Calm Brass clears the tone and the warm canvas returns', await page.evaluate(() => {
    setSkin('calm');
    const d = document.documentElement.dataset;
    return d.skin === 'calm' && !d.tone && prefs.skin === 'calm' && $('skin-calm').classList.contains('sel') && !$('skin-calm-slate').classList.contains('sel') && getComputedStyle(document.body).backgroundColor === 'rgb(20, 17, 13)';
  }));

  ok('an old name or nothing at all lands on Calm Brass — Command Center, Daylight, Winter Night, the empty Clore Gold pref', await page.evaluate(() => {
    setSkin('command');
    const a = document.documentElement.dataset.skin === 'calm' && !document.documentElement.dataset.tone && prefs.skin === 'calm' && /Calm Brass/.test($('toast').textContent);
    applySkin('daylight'); const b = document.documentElement.dataset.skin === 'calm' && lsGet('daylog-skin') === 'calm';
    applySkin(''); const c = document.documentElement.dataset.skin === 'calm';
    return a && b && c && skinKey('winter') === 'calm' && skinKey('') === 'calm' && skinKey('steam') === 'steam' && skinKey('calm-moss') === 'calm-moss' && curSkin() === 'calm';
  }));

  console.log('— 🎨 v6.85 every tone dark, neutral and readable —');

  const tones = await page.evaluate(() => {
    const rgb = c => { c = String(c).trim(); if (c[0] === '#') { const h = c.length === 4 ? c.slice(1).split('').map(x => x + x).join('') : c.slice(1); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)); } return (c.match(/\d+(\.\d+)?/g) || []).slice(0, 3).map(Number); };
    const lum = c => { const m = rgb(c).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]; };
    const ratio = (a, b) => { const x = lum(a), y = lum(b); return Math.round((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05) * 10) / 10; };
    const out = {};
    ['calm', 'calm-slate', 'calm-graphite', 'calm-moss', 'calm-stone'].forEach(k => {
      setSkin(k);
      const cs = getComputedStyle(document.documentElement), v = n => cs.getPropertyValue(n).trim();
      const page = v('--page'), surf = v('--surface-1'), p = rgb(page);
      out[k] = { page, surf, scheme: cs.colorScheme, spread: Math.max(...p) - Math.min(...p),
        text: Math.min(ratio(v('--ink-1'), page), ratio(v('--ink-1'), surf)), dim: ratio(v('--ink-2'), surf), muted: ratio(v('--ink-muted'), surf),
        brass: ratio(v('--accent'), surf), onBrass: ratio(v('--accent-ink'), v('--accent')), good: ratio(v('--good'), surf), warn: ratio(v('--warn'), surf), err: ratio(v('--err'), surf),
        bodyBg: getComputedStyle(document.body).backgroundColor, raised: v('--raised'), field: v('--field') };
    });
    return out;
  });
  const bad = Object.entries(tones).filter(([k, t]) => !(t.scheme === 'dark' && t.page !== '#000000' && t.spread <= 12 && t.text >= 7 && t.dim >= 4.5 && t.muted >= 4.5 && t.brass >= 4.5 && t.onBrass >= 4.5 && t.good >= 4.5 && t.warn >= 4.5 && t.err >= 4.5 && t.raised && t.field));
  ok('each of the five tones is dark, never pure black, near-grey (channel spread ≤ 12), and reads: text 7:1+, dim and muted text 4.5:1+, brass, green, orange and coral 4.5:1+ on the surface, dark words on brass 4.5:1+', bad.length === 0, JSON.stringify(bad));
  ok('no two tones share a canvas, and each one really paints the body', new Set(Object.values(tones).map(t => t.page)).size === 5 && new Set(Object.values(tones).map(t => t.bodyBg)).size === 5);

  ok('the calm chips and writing boxes follow the tone — an unlit chip plate reads the tone\'s raised colour, an input its field colour', await page.evaluate(() => {
    setSkin('calm-slate');
    const chip = getComputedStyle($('skin-steam')).backgroundColor, inp = getComputedStyle($('sDayGoal')).backgroundColor;
    setSkin('calm-stone');
    const chip2 = getComputedStyle($('skin-steam')).backgroundColor, inp2 = getComputedStyle($('sDayGoal')).backgroundColor;
    return chip === 'rgb(38, 43, 49)' && inp === 'rgb(23, 26, 30)' && chip2 === 'rgb(63, 58, 50)' && inp2 === 'rgb(43, 39, 35)';
  }));

  ok('Steamworks still applies as itself, with no tone, and the calm rules step aside', await page.evaluate(() => {
    setSkin('steam');
    const d = document.documentElement.dataset;
    return d.skin === 'steam' && !d.tone && prefs.skin === 'steam' && $('skin-steam').classList.contains('sel') && getComputedStyle(document.body).backgroundColor === 'rgb(28, 22, 16)';
  }));

  ok('the ✕ closers are black on the gold plate in Calm Brass, in a tone and in Steamworks — the calm and steam ghost rules no longer wash them out', await page.evaluate(() => {
    const r = [];
    for (const k of ['calm', 'calm-slate', 'steam']) {
      setSkin(k); openReview('summary');
      const x = $('revBox').querySelector('.win-x'), cs = getComputedStyle(x);
      openPortalWin(); renderPortalList();
      const back = [...$('portalWin').querySelectorAll('button')].filter(b => /Back to the main page/.test(b.textContent)).pop(); const bs = getComputedStyle(back);
      r.push(cs.color === 'rgb(17, 17, 17)' && parseFloat(cs.fontSize) >= 17 && parseFloat(cs.borderTopWidth) >= 3 && cs.backgroundColor !== 'rgb(17, 17, 17)' &&
        bs.color === 'rgb(17, 17, 17)' && bs.backgroundColor === cs.backgroundColor && parseFloat(bs.fontSize) >= 16);
      closePortalWin(); closeReview();
    }
    setSkin('calm');
    return r.every(Boolean);
  }));

  console.log('— 📊 v6.85 one summary button on the PC —');

  ok('the header SUMMARY button wears the waiting count, on the phone too, and hides it at zero', await page.evaluate(() => {
    setSkin('calm');
    pendingQueue = [{ id: 'x1', kind: 'todo', payload: { text: 'call Dale' } }]; renderPendBanner();
    const hn = $('hbSumN');
    const on = hn.textContent === '1' && $('scSumN').textContent === '1' && getComputedStyle(hn).display !== 'none' && hn.getBoundingClientRect().width > 0;
    pendingQueue = []; renderPendBanner();
    return on && hn.textContent === '' && getComputedStyle(hn).display === 'none';
  }));
  ok('the phone shows three plates under the clock — since v6.86 the header SUMMARY is the one summary button there too', await page.evaluate(() => {
    const vis = [...document.querySelectorAll('#scRow .sc-btn')].filter(b => getComputedStyle(b).display !== 'none');
    return vis.length === 3 && !vis.some(b => /Summary/.test(b.textContent)) && getComputedStyle($('summaryBtn')).display !== 'none';
  }));

  const ctx2 = await browser.newContext({ viewport: { width: 1200, height: 900 } });
  const p2 = await ctx2.newPage();
  await p2.goto(appUrl); await p2.waitForTimeout(700);
  ok('on a PC there is ONE summary button — the header one, between the Wizard lamp and SETUP; the plate under the clock is gone and the row holds three', await p2.evaluate(() => {
    const vis = [...document.querySelectorAll('#scRow .sc-btn')].filter(b => getComputedStyle(b).display !== 'none');
    const sum = $('summaryBtn'), order = [...document.querySelectorAll('.header-right > button')].map(b => b.id).join(',');
    return vis.length === 3 && !vis.some(b => /Summary/.test(b.textContent)) && getComputedStyle(sum).display !== 'none' && sum.getBoundingClientRect().width > 0 && order === 'syncChip,wizLamp,summaryBtn,setupBtn' && getComputedStyle($('setupBtn')).display !== 'none' &&
      getComputedStyle($('scRow')).gridTemplateColumns.split(' ').length === 3;
  }));
  ok('…and its count rides the header there', await p2.evaluate(() => {
    pendingQueue = [{ id: 'x1', kind: 'todo', payload: { text: 'call Dale' } }, { id: 'x2', kind: 'todo', payload: { text: 'order glass' } }]; renderPendBanner();
    const hn = $('hbSumN');
    return hn.textContent === '2' && hn.getBoundingClientRect().width > 0 && $('scSumN').getBoundingClientRect().width === 0;
  }));
  ok('a crew phone on a PC still shows its own two plates', await p2.evaluate(() => {
    document.body.classList.add('crew-mode');
    const vis = [...document.querySelectorAll('#scRow .sc-btn')].filter(b => getComputedStyle(b).display !== 'none');
    document.body.classList.remove('crew-mode');
    return vis.length === 2;
  }));
  ok('nothing runs off the right edge on the PC', await p2.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth));
  await ctx2.close();

  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v6.85') && document.querySelector('footer').textContent.includes(APP_VER);
  }));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
