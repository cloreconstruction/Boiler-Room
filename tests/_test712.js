// 👷 v7.12 — A CREW MEMBER'S DROPBOX ON A PHONE NEVER SET UP AS CREW. Eric sent Phil's screenshots: the 🏠 Project portal read
// "No portal set up yet — ask Claude to build the client pages" and the 📇 Job card listed only a job Phil had added himself. His
// phone was connected to HIS OWN Dropbox but never set up as a crew phone (⚙ Setup → 📱 This phone → 👷), so it ran as an owner's
// phone. Now an owner's phone that finds no portal looks for a crew folder in its Dropbox (a top folder holding crew.json — what
// crewJoin looks for) and, when there is one, says whose it is and puts the one button right there. Names are made up.
const { chromium } = require('playwright');
(async () => {
  const appUrl = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };
  const errs = [];
  const fresh = async () => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await ctx.route(u => !/^file:/.test(u.href), r => r.abort());   // nothing leaves the test
    const page = await ctx.newPage();
    page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
    await page.goto(appUrl); await page.waitForTimeout(700);
    return { ctx, page };
  };
  // a Dropbox as the phone sees it: its top folders, and the files inside them
  const stub = (page, folders, files) => page.evaluate(({ folders, files }) => {
    window.scheduleSave = () => {}; window.publishSharedNotes = () => {};
    dbx.refreshToken = 'tok'; window._rootLists = 0;
    window.dbxList = async a => { if (a && (a.path === '' || a.path === '/')) window._rootLists++; return { entries: folders.map(n => ({ '.tag': 'folder', name: n, path_display: '/' + n, path_lower: '/' + n.toLowerCase() })) }; };
    window.dbxDownload = async p => Object.prototype.hasOwnProperty.call(files, p) ? files[p] : null;
  }, { folders, files });

  console.log('— 👷 v7.12 an owner phone on a crew member\'s Dropbox says so, with the one button —');
  {
    const { ctx, page } = await fresh();
    await stub(page, ['Phil', 'Client Portal', 'Photos'], { '/phil/crew.json': JSON.stringify({ name: 'Phil', jobs: ['Oak House', 'Pine Cabin'], office: true, mates: ['Eric'] }) });
    const r = await page.evaluate(async () => {
      jobs = ['Test by Phil in setup']; renderJobSelects();
      openPortalWin(); await renderPortalList();
      const first = $('portalList').textContent;
      for (let i = 0; i < 30 && !document.querySelector('#portalList .crew-dbx'); i++) await new Promise(r => setTimeout(r, 50));
      const t = $('portalList').textContent;
      const btn = [...document.querySelectorAll('#portalList button')].find(b => /Set this phone up as Phil's/.test(b.textContent));
      return { first, t, btn: !!btn, crew: CREW_NAME };
    });
    ok('on an owner phone (not crew) the portal first says what it always said', r.crew === '' && /No portal set up yet/.test(r.first), JSON.stringify(r).slice(0, 200));
    ok('…then it finds Phil\'s crew folder in this Dropbox and says so in words: "This Dropbox is Phil\'s — a crew member\'s"', /This Dropbox is Phil's — a crew member's/.test(r.t) && /never set up as a crew phone/.test(r.t) && !/ask Claude to build/.test(r.t), r.t.slice(0, 200));
    ok('…with the one button right there: 👷 Set this phone up as Phil\'s', r.btn);
    ok('the 📇 Job card window says the same at its top (the job list there is only what this phone added)', await page.evaluate(() => {
      closePortalWin(); openJobCard('');
      const t = $('revBox').textContent, b = [...document.querySelectorAll('#revBox button')].some(x => /Set this phone up as Phil's/.test(x.textContent));
      closeReview(); return /This Dropbox is Phil's/.test(t) && b;
    }));
    ok('the Dropbox top was looked at ONCE for the whole session (the job card reused the answer)', await page.evaluate(() => window._rootLists === 1), await page.evaluate(() => window._rootLists));
    // the tap: crewJoin finds the same folder, keeps the crew settings and reloads the page as Phil's phone
    const said = await page.evaluate(async () => {
      openPortalWin(); await renderPortalList();
      for (let i = 0; i < 30 && !document.querySelector('#portalList .crew-dbx'); i++) await new Promise(r => setTimeout(r, 50));
      [...document.querySelectorAll('#portalList button')].find(b => /Set this phone up as Phil's/.test(b.textContent)).click();
      for (let i = 0; i < 20 && !/now Phil's/.test(($('crewJoinHere') || {}).textContent || ''); i++) await new Promise(r => setTimeout(r, 25));
      return { msg: ($('crewJoinHere') || {}).textContent || '', name: localStorage.getItem('daylog-crew-name'), root: localStorage.getItem('daylog-crew-root'), office: localStorage.getItem('daylog-crew-office'), jobs: localStorage.getItem('daylog-crew-jobs') };
    });
    ok('the tap says it where he tapped — "✓ This phone is now Phil\'s. Reloading…" — and keeps his crew folder, his jobs and the office flag', /This phone is now Phil's/.test(said.msg) && said.name === 'Phil' && said.root === '/Phil' && said.office === '1' && /Oak House/.test(said.jobs || ''), JSON.stringify(said));
    await page.waitForTimeout(1500);   // crewJoin reloads the page itself
    const after = await page.evaluate(() => ({ crew: CREW_NAME, mode: document.body.classList.contains('crew-mode'),
      budget: getComputedStyle(document.querySelector('.cap-btn[data-panel="budget"]')).display, vault: getComputedStyle(document.querySelector('.cap-btn[data-panel="vault"]')).display }));
    ok('after the reload it IS Phil\'s crew phone — crew mode on, and the Personal and Vault plates gone from the bottom bar', after.crew === 'Phil' && after.mode && after.budget === 'none' && after.vault === 'none', JSON.stringify(after));
    await ctx.close();
  }

  console.log('— 👷 v7.12 nothing changes where there is no crew folder, or on Eric\'s phone —');
  {
    const { ctx, page } = await fresh();
    await stub(page, ['Photos', 'Taxes'], {});
    const t = await page.evaluate(async () => {
      openPortalWin(); await renderPortalList(); await new Promise(r => setTimeout(r, 300));
      return $('portalList').textContent;
    });
    ok('an owner phone whose Dropbox holds no crew folder keeps the old words — no button, no guess', /No portal set up yet/.test(t) && !/crew member's/.test(t), t.slice(0, 160));
    ok('a bad signal is not an answer: a refused listing leaves the words alone and it looks again next time', await page.evaluate(async () => {
      _crewDbx = undefined; window.dbxList = async () => ({ error_summary: 'too_many_requests/..' });
      await renderPortalList(); await new Promise(r => setTimeout(r, 200));
      return /No portal set up yet/.test($('portalList').textContent) && _crewDbx === undefined;
    }));
    ok('Eric\'s phone (a portal in its Dropbox) never looks at the Dropbox top at all', await page.evaluate(async () => {
      _crewDbx = undefined; window._rootLists = 0;
      window.dbxList = async a => { if (a && a.path === '') window._rootLists++; return { entries: [] }; };
      window.dbxDownload = async p => /index\.json$/.test(p) ? JSON.stringify({ clients: [{ key: 'oak', job: 'Oak House', code: 'oak-111aaa' }] }) : null;
      await renderPortalList(); await new Promise(r => setTimeout(r, 200));
      return window._rootLists === 0 && /Oak House/.test($('portalList').textContent) && !/crew member's/.test($('portalList').textContent);
    }));
    ok('the Setup words point the right way: "Step 1 first: connect Dropbox (⚙ Setup → Dropbox)"', await page.evaluate(async () => {
      dbx.refreshToken = ''; await crewJoin(); return /Step 1 first: connect Dropbox \(⚙ Setup → Dropbox\)/.test($('crewJoinMsg').textContent);
    }));
    await ctx.close();
  }

  ok('no page errors', errs.length === 0, errs.join(' | '));
  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close(); process.exit(fail ? 1 : 0);
})();
