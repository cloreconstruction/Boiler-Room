// 🗂 v6.69 — THE SORT PAGE. Eric: "the review … feels complicated and long list … drop down each
// section … a 10 minute sort per day might get a lot done if its organized … but dont want it
// get too complex too quick." Same cards, same buttons, five fixed headings, one open at a time.
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
    jobs = ['Mery', 'Hertz']; curJob = 'Mery'; crew = ['Phil']; entries = []; todos = []; nextId = 1;
    renderJobSelects(); closePanels(); renderAll();
    window.scheduleSave = () => {}; window.savePendingSoon = () => {}; window.publishSharedNotes = () => {};
    dbx.refreshToken = 'test-token';
    window._dbxFiles = {};
    window.dbxDownload = async p => (window._dbxFiles || {})[p] ?? null;
    window.dbxUpload = async (p, body) => { (window._dbxFiles || {})[p] = body; return {}; };
    window.dbxPathExists = async p => Object.prototype.hasOwnProperty.call(window._dbxFiles || {}, p);
    _portalIdx = null;
    window.T = {
      seed: () => { pendingQueue = [
        { id: 'ca:1', kind: 'clientask', payload: { client: 'Mery', tag: 'General', text: 'When does the roof go on?', code: 'mery-1', ts: 'x' } },
        { id: 'tx:hot', kind: 'text', payload: { from: 'Kevin', body: 'pouring Mery today at 8', hot: true } },
        { id: 'tx:cold', kind: 'text', payload: { from: 'Dentist', body: 'your appointment is Tuesday' } },
        { id: 'ml:1', kind: 'mail', payload: { from: 'Bob Ashman', addr: 'bob@sub.com', subj: 'Invoice 4471', body: 'attached', why: 'invoice', gist: 'a bill', by: 'phone', known: true, entryId: 1 } },
        { id: 'cw:note', kind: 'crew', source: 'Phil', payload: { from: 'Phil', type: 'Note', text: 'need more screws at Hertz', job: 'Hertz' } },
        { id: 'cw:photo', kind: 'crew', source: 'Phil', payload: { from: 'Phil', type: 'Note', text: 'walls are up', job: 'Hertz', photoPath: '/Clore DayLog/Crew/Phil/walls.jpg' } },
        { id: 'bill:2026-10-10:enstar', kind: 'bill', payload: { who: 'Enstar', amt: 412.55, due: '2026-10-10', job: 'Mery', what: '🏪 Enstar', text: 'Pay Enstar — $412.55', pri: 2 } },
        { id: 'qb:77', kind: 'qb', payload: { qid: '77', amt: 88.4, who: 'Spenard', d: '2026-09-10', memo: 'lumber' } },
        { id: 'todo:1', kind: 'todo', payload: { text: 'call the inspector', job: 'Mery' } },
      ]; _revSec = null; renderReview(); },
      heads: () => [...document.querySelectorAll('.rev-sec')].map(b => ({ key: b.dataset.sec, text: b.textContent.replace(/\s+/g, ' ').trim(), open: b.classList.contains('open') })),
      visible: () => [...document.querySelectorAll('.rev-sec-body')].filter(b => !b.hidden).map(b => b.dataset.sec),
      cardsIn: key => document.querySelector(`.rev-sec-body[data-sec="${key}"]`).querySelectorAll('.rev-card').length,
    };
  });

  console.log('— 🗂 v6.69 five headings, same order, every card under its own —');

  ok('the headings come in the fixed order, each with a word and a count; WIZARD says ○ nothing', await page.evaluate(() => {
    T.seed();
    const h = T.heads();
    return h.map(x => x.key).join(',') === 'need,people,money,photos,wizard' &&
      /NEEDS YOU 3 waiting/.test(h[0].text) && /PEOPLE 3 waiting/.test(h[1].text) && /MONEY 2 waiting/.test(h[2].text) &&
      /PHOTOS 1 waiting/.test(h[3].text) && /WIZARD ○ nothing/.test(h[4].text);
  }));

  ok('each card sits under the right heading: the client question, the hot text and the suggested to-do under NEEDS YOU; the dentist, the email and Phil\'s note under PEOPLE; the bill and the QuickBooks line under MONEY; Phil\'s photo under PHOTOS', await page.evaluate(() => {
    const ids = key => [...document.querySelectorAll(`.rev-sec-body[data-sec="${key}"] .rev-card`)].map(c => c.dataset.pid).join(',');
    return ids('need') === 'ca:1,tx:hot,todo:1' && ids('people') === 'tx:cold,ml:1,cw:note' && ids('money') === 'bill:2026-10-10:enstar,qb:77' && ids('photos') === 'cw:photo' && ids('wizard') === '';
  }));

  ok('it opens on the fullest section (a tie goes to the earlier heading); the others are folded but still hold their cards', await page.evaluate(() => {
    const h = T.heads();
    return h[0].open && h.filter(x => x.open).length === 1 && T.visible().join() === 'need' && document.querySelectorAll('.rev-card').length === 9 && T.cardsIn('money') === 2;
  }));

  ok('tap a heading: it opens and the other folds; tap it again and it folds too', await page.evaluate(() => {
    revSecTap('money');
    const a = T.visible().join() === 'money' && T.heads().find(x => x.key === 'money').open && !T.heads().find(x => x.key === 'need').open;
    revSecTap('money');
    const b = T.visible().length === 0;
    revSecTap('people');
    return a && b && T.visible().join() === 'people';
  }));

  ok('the same buttons still work: acting on both MONEY cards empties it, and the page moves on to the fullest section left', await page.evaluate(() => {
    revSecTap('money');
    reviewAct('qb:77', false); reviewAct('bill:2026-10-10:enstar', false);
    const h = T.heads();
    return pendingQueue.length === 7 && /MONEY ○ nothing/.test(h[2].text) && T.visible().join() === 'need';
  }));

  ok('the 🧹 sort-the-pile plate still sits at the top when six or more wait', await page.evaluate(() => {
    T.seed();
    const html = $('revBox').innerHTML;
    return /🧹/.test(html) && html.indexOf('🧹') < html.indexOf('rev-sec');
  }));

  ok('a heading folded shut keeps its words on the page — the pile can still be searched and counted', await page.evaluate(() =>
    /pouring Mery today/.test($('revBox').textContent) && /Invoice 4471/.test($('revBox').textContent) && /walls are up/.test($('revBox').textContent)));

  console.log('— 🧾 v6.69 receipts to approve live under MONEY, and the door comes back here —');

  ok('a job with receipts waiting shows as a MONEY row with the count and an Open button', await page.evaluate(() => {
    _portalIdx = { clients: [{ key: 'mery', job: 'Mery', code: 'mery-1' }] };
    window._dbxFiles[estPath('mery-1')] = JSON.stringify({ updated: '', mk: 20, cats: [{ n: 'Framing', appr: false, bids: [] }] });
    window._dbxFiles[portalRoot() + '/mery-1.json'] = JSON.stringify({ name: 'Mery', budget: [] });
    const mk = (txt, cat, amt) => { const e = addEntry('Note', txt, 'Mery', {}); e.ai = `💵 $${amt.toFixed(2)} 🏪 Spenard`; e.rcpt = true; e.category = cat; return e; };
    mk('lumber package', 'Framing', 1000); mk('gravel load', 'Framing', 500);
    pendingQueue = []; _revSec = null; renderReview();
    const h = T.heads();
    const row = document.querySelector('.rev-sec-body[data-sec="money"] .rev-rcpt');
    return /MONEY 2 waiting/.test(h[2].text) && !!row && /Mery/.test(row.textContent) && /2 waiting/.test(row.textContent) && /Open/.test(row.textContent) && T.visible().join() === 'money';
  }));

  ok('Open goes to that job\'s receipts window; closing it lands back on the sort page, on MONEY', await page.evaluate(async () => {
    document.querySelector('.rev-rcpt button').click();
    await new Promise(r => setTimeout(r, 400));
    const inRcpt = /Receipts to approve|RECEIPTS/i.test($('revBox').textContent) && !document.querySelector('.rev-sec');
    closeRcptReview();
    return inRcpt && $('revModal').classList.contains('show') && !!document.querySelector('.rev-sec') && T.visible().join() === 'money';
  }));

  ok('with nothing waiting anywhere it still says All caught up', await page.evaluate(() => {
    entries = []; pendingQueue = []; _portalIdx = null; renderReview();
    return /All caught up/.test($('revBox').textContent) && !document.querySelector('.rev-sec');
  }));

  ok('every heading is a word and a count — never a colour alone', await page.evaluate(() => {
    T.seed();
    return [...document.querySelectorAll('.rev-sec')].every(b => /[A-Z]{4,}/.test(b.textContent) && /(waiting|nothing)/.test(b.textContent));
  }));

  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v6.69') && document.querySelector('footer').textContent.includes(APP_VER);
  }));

  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
