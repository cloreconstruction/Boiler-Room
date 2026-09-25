// 🎒 v7.07 — THE POCKET LIST UP TOP, AND ITS OWN PLATE ON THE RUNNING LOG. Eric: "When I click Summary, I want the pocket
// list to be on the top of the page, just underneath [NEEDS] YOU … Also, on the running log, one of the top search filters I
// want is pocket list. We can take the crew button off the running log search." Every name in this file is made up.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), { fileURLToPath } = require('url');
(async () => {
  const appUrl = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
  await page.goto(appUrl); await page.waitForTimeout(700);
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };
  const seed = () => page.evaluate(() => {
    jobs = ['Oak House', 'Pine Cabin']; entries = []; nextId = 1; todos = []; pendingQueue = []; window.scheduleSave = () => {}; dbx.refreshToken = '';
    crew = ['Ann']; prefs.pocket = []; prefs.rlFilter = ''; prefs.rlWho = ''; prefs.rlHide = []; window._rlN = 30;
    const ago = h => new Date(Date.now() - h * 3600000);
    const add = (details, job, extra) => addEntry('Note', details, job, { noSniff: true, ...extra });
    window._e = {
      grind: add('framing walls going up', 'Oak House', { ts: ago(1) }),
      done: add('✓ screws for the deck', '—', { tags: ['pocket'], pocket: 'done', ts: ago(2) }),
      flushed: add('🎒 Flushed — call the gravel guy', '—', { tags: ['pocket'], pocket: 'flushed', ts: ago(3) }),
      swept: add('🎒 Not done — inspector callback', '—', { tags: ['pocket'], pocket: 'swept', ts: ago(26) }),
      back: add('🎒 Flushed — pick up the saw', '—', { tags: ['pocket'], pocket: 'back', ts: ago(27) }),
      dropped: add('🎒 Overflow — old paint cans', '—', { tags: ['pocket'], pocket: 'dropped', ts: ago(28) }),
      tagged: add('grout samples to the Pine Cabin', 'Pine Cabin', { tags: ['pocket'], ts: ago(4) }),
      text: add('Text from Bo: running late', '—', { texted: true, tags: ['Bo'], ts: ago(5) }),
      crewNote: add('hung the upper cabinets', 'Oak House', { who: 'Ann', ts: ago(6) }),
    };
    pocketAdd('gravel for the drive');
    pocketAdd('buy blue tape');
    prefs.pocket[0].day = pocketDay(1);   // "buy blue tape" is tomorrow's
    closePanels(); renderAll(); renderAskRecent();
  });
  await seed();

  // ───────────────────────── the summary ─────────────────────────
  console.log('— 🎒 v7.07 the pocket list at the top of the summary —');
  ok('the pocket\'s two headings sit right under ⚠ NEEDS YOU: 🎒 POCKET — not done, then 🎒 POCKET LIST (v7.14), then the rest', await page.evaluate(() => {
    pendingQueue = [{ id: 'bill:x', kind: 'bill', payload: { who: 'Enstar', amt: 1, due: '2026-10-10', text: 'Pay it' } }];
    openReview('summary');
    const keys = [...document.querySelectorAll('.rev-sec')].map(b => b.dataset.sec).join(',');
    const lab = document.querySelector('.rev-sec[data-sec="get"]').textContent;
    return keys === 'need,pocket,get,people,money,photos,wizard,sched,logan,record' && /🎒 POCKET LIST/.test(lab) && !/TO GET/.test($('revBox').textContent);
  }));
  // 🎒 v7.14 — Eric: "I want the pocket not done, just under the needs you." With leftovers waiting the page opens on THEM now;
  // the POCKET LIST below still reads today's, then tomorrow's, then what got done
  ok('with leftovers waiting the page opens on POCKET — not done (v7.14); the POCKET LIST still reads today\'s, then tomorrow\'s, then what got done — while NEEDS YOU keeps its count', await page.evaluate(() => {
    const open = [...document.querySelectorAll('.rev-sec-body')].filter(b => !b.hidden).map(b => b.dataset.sec).join();
    const t = document.querySelector('.rev-sec-body[data-sec="get"]').textContent;
    return open === 'pocket' && /gravel for the drive/.test(t) && /today/.test(t) && /buy blue tape/.test(t) && /tomorrow/.test(t) && /screws for the deck/.test(t)
      && t.indexOf('gravel for the drive') < t.indexOf('buy blue tape') && !/✓\s*✓/.test(t)   // today's first, as on the pocket card; one ✓ a done row
      && /1/.test(document.querySelector('.rev-sec[data-sec="need"]').textContent);
  }));
  ok('on the phone 🎒 POCKET — not done is on the first screen, the heading straight after NEEDS YOU (v7.14)', await page.evaluate(() => {
    const need = document.querySelector('.rev-sec[data-sec="need"]').getBoundingClientRect(), pk = document.querySelector('.rev-sec[data-sec="pocket"]').getBoundingClientRect();
    return pk.top >= need.bottom - 1 && pk.top - need.bottom < 20 && pk.bottom < innerHeight;
  }));
  ok('with nothing on the list but leftovers waiting, it opens on 🎒 POCKET — not done', await page.evaluate(() => {
    closeReview(); const keep = prefs.pocket; prefs.pocket = []; entries = entries.filter(e => e.pocket !== 'done');
    openReview('summary');
    const open = [...document.querySelectorAll('.rev-sec-body')].filter(b => !b.hidden).map(b => b.dataset.sec).join();
    prefs.pocket = keep; closeReview();
    return open === 'pocket';
  }));
  ok('with no pocket at all, it opens on the first heading that holds anything, as before', await page.evaluate(() => {
    const keepP = prefs.pocket, keepE = entries.slice();
    prefs.pocket = []; entries = entries.filter(e => !e.pocket);
    openReview('summary');
    const open = [...document.querySelectorAll('.rev-sec-body')].filter(b => !b.hidden).map(b => b.dataset.sec).join();
    prefs.pocket = keepP; entries = keepE; closeReview(); pendingQueue = [];
    return open === 'need';
  }));
  await seed();

  // ───────────────────────── the running log ─────────────────────────
  console.log('— 🎒 v7.07 the running log: a 🎒 Pocket list plate, the 👷 Crew plate off —');
  const plates = () => page.evaluate(() => [...document.querySelectorAll('#askRecent .rl-filters > .pick-chip')].map(b => b.textContent.replace(/\s+/g, ' ').trim()));
  ok('the top row reads ✳ All · ⚙ Grinder · 🎒 Pocket list, and the 👷 Crew plate is gone', await (async () => {
    const p = await plates();
    const top = await page.evaluate(() => { const cs = [...document.querySelectorAll('#askRecent .rl-filters > .pick-chip')]; const t0 = Math.round(cs[0].getBoundingClientRect().top); return cs.filter(c => Math.round(c.getBoundingClientRect().top) === t0).map(c => c.textContent.trim()); });
    return /All/.test(top[0]) && /Grinder/.test(top[1]) && /🎒 Pocket list/.test(top[2]) && top.length === 3 && !p.some(x => /Crew/.test(x)) && p.length === 10;
  })(), JSON.stringify(await plates()));
  for (const skin of ['calm', 'steam']) {
    ok(`every plate's words fit inside it (${skin})`, await page.evaluate(sk => {
      setSkin(sk); renderAskRecent();
      return [...document.querySelectorAll('#askRecent .rl-filters > .pick-chip')].every(c => c.scrollWidth <= c.clientWidth + 1);
    }, skin));
  }
  const rows = () => page.evaluate(() => [...document.querySelectorAll('#askRecent .ask-recent-row')].map(r => r.textContent.replace(/\s+/g, ' ').trim()));
  ok('🎒 Pocket list shows ONLY the pocket: what is on the list now leads (ON THE LIST · today / tomorrow), then every pocket note, newest first', await (async () => {
    await page.evaluate(() => rlSet('pocket'));
    const r = await rows();
    const i = s => r.findIndex(x => x.includes(s));
    return r.length === 8 && /ON THE LIST — gravel for the drive.*today/.test(r[0]) && /ON THE LIST — buy blue tape.*tomorrow/.test(r[1])
      && i('screws for the deck') < i('call the gravel guy') && i('call the gravel guy') < i('inspector callback')
      && i('grout samples') > 1 && i('framing walls') < 0 && i('running late') < 0 && i('upper cabinets') < 0;
  })(), JSON.stringify(await rows()));
  ok('each pocket note wears ONE 🎒, and says what became of it in words: back on the list, not needed', await (async () => {
    const r = await rows();
    return !r.some(x => /🎒\s*🎒/.test(x)) && r.some(x => /back on the list — pick up the saw/.test(x)) && r.some(x => /not needed — old paint cans/.test(x))   // the word first: a phone cuts the end of a long row
      && r.filter(x => x.startsWith('🎒')).length === 8;
  })(), JSON.stringify(await rows()));
  ok('the plate is lit with a ✓ while it holds (never the colour alone)', await page.evaluate(() => {
    const b = [...document.querySelectorAll('#askRecent .rl-filters > .pick-chip')].find(c => /Pocket list/.test(c.textContent));
    return b.classList.contains('sel') && /^✓/.test(b.textContent.trim());
  }));
  ok('the search box narrows it too: "gravel" finds the item on the list and the flushed note', await page.evaluate(() => {
    logQuery = 'gravel'; renderAskRecent();
    const r = [...document.querySelectorAll('#askRecent .ask-recent-row')].map(x => x.textContent);
    logQuery = ''; renderAskRecent();
    return r.length === 2 && r.some(x => /ON THE LIST.*gravel for the drive/.test(x)) && r.some(x => /call the gravel guy/.test(x));
  }));
  ok('a tap on a row still ON the list goes to the list on the main page — the search window shuts, the pocket card is lit', await page.evaluate(async () => {
    rlSearchShow(true);
    const inWin = $('rlWinBody').contains($('askRecent'));
    const row = [...document.querySelectorAll('#askRecent .ask-recent-row')].find(x => /ON THE LIST.*gravel/.test(x.textContent));
    row.click();
    await new Promise(r => setTimeout(r, 900));
    const c = $('pocketCard').getBoundingClientRect();
    return inWin && !$('rlWin').classList.contains('show') && $('pocketCard').classList.contains('pk-flash') && c.top >= 0 && c.bottom <= innerHeight;
  }));
  ok('under ✳ All the pocket notes are in the feed with their 🎒, the items still on the list are not (they are not on the log yet)', await (async () => {
    await page.evaluate(() => { prefs.rlFilter = ''; prefs.rlHide = []; renderAskRecent(); });
    const r = await rows();
    return r.some(x => /^🎒.*screws for the deck/.test(x)) && !r.some(x => /ON THE LIST/.test(x)) && r.some(x => /framing walls/.test(x)) && r.some(x => /^👷.*upper cabinets/.test(x));
  })(), JSON.stringify(await rows()));
  ok('⚙ Grinder is the grinder alone now — a pocket note is not in it', await (async () => {
    await page.evaluate(() => rlSet('grind'));
    const r = await rows();
    return r.some(x => /framing walls/.test(x)) && !r.some(x => /screws for the deck|gravel guy|grout samples/.test(x));
  })(), JSON.stringify(await rows()));
  ok('the third tap works as on every plate: 🚫 hides every pocket note, the rest stays', await (async () => {
    await page.evaluate(() => { prefs.rlFilter = ''; prefs.rlHide = []; rlSet('pocket'); rlSet('pocket'); });
    const r = await rows(), p = await plates();
    return !r.some(x => /^🎒/.test(x)) && r.some(x => /framing walls/.test(x)) && p.some(x => /^🚫 🎒 Pocket list/.test(x));
  })());
  ok('a phone that had 👷 Crew lit (or hidden) lets it go on the next draw — crew traffic is still under ✳ All', await page.evaluate(() => {
    prefs.rlFilter = 'crew'; prefs.rlHide = ['crew', 'text']; renderAskRecent();
    const r = [...document.querySelectorAll('#askRecent .ask-recent-row')].map(x => x.textContent);
    return prefs.rlFilter === '' && prefs.rlHide.join() === 'text' && r.some(x => /upper cabinets/.test(x)) && !r.some(x => /running late/.test(x));
  }));

  ok('no page errors', errs.length === 0, errs.join(' | '));
  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close(); process.exit(fail ? 1 : 0);
})();
