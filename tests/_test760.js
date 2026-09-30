// 📇 v7.60 — THE JOB CARD IN PLATES; 📐 PLANS UNDER THE PICK. Eric: "the job card, make address its own little box and people a
// box. that way its seperated easily by eye. also add a button just under pick the job and it'll say 'plans' and take me to the
// plans window on project portal." Every part of the card (Address · People · Codes · Worth knowing) is its own plate on both
// faces, and 📐 Plans sits right under PICK THE JOB — it opens the job's plan rack and the rack's ✕ comes back to the card.
// Every name, number and code below is made up.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { fileURLToPath } = require('url');
(async () => {
  const appUrl = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const repo = path.dirname(fileURLToPath(appUrl));
  const src = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await ctx.route(u => !/^file:/.test(u.href), r => r.abort());
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
  await page.goto(appUrl); await page.waitForTimeout(700);
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };

  const stub = () => page.evaluate(() => {
    window.scheduleSave = () => {}; window.publishSharedNotes = async () => {}; window.pushOut = () => false;
    window._dbxFiles = window._dbxFiles || {}; window._ups = [];
    window.dbxDownload = async p => (window._dbxFiles || {})[p] ?? null;
    window.dbxUpload = async (p, body) => { (window._dbxFiles || {})[p] = typeof body === 'string' ? body : '[file]'; window._ups.push(p); return {}; };
    window.dbxPathExists = async p => Object.prototype.hasOwnProperty.call(window._dbxFiles || {}, p);
    window.dbxList = async () => ({ entries: [] }); window.dbxRpc = async () => ({});
    if (!window._said) { window._said = []; const t0 = window.toast; window.toast = (m, g) => { if (m) _said.push(String(m)); return t0(m, g); }; }
    dbx.refreshToken = 'test-token';
  });
  await stub();
  const CARD = { job: 'Oak House', addr: '12 Birch Loop, Soldotna', people: [{ n: 'Dale Rininger', r: 'Homeowner', tel: '907-555-0100', em: 'dale@example.com' }, { n: 'Sue', r: 'spouse', tel: '907-555-0101', em: '' }], codes: [{ w: 'Front door', c: '1379#' }], notes: 'Dog in the back yard' };
  await page.evaluate(CARD => { jobs = ['Oak House', 'Pine Cabin']; crew = ['Phil', 'Kevin']; prefs.office = ['Phil']; entries = []; todos = []; nextId = 1; prefs.cards = { 'oak house': CARD };
    _portalIdx = { clients: [{ key: 'oak', job: 'Oak House', code: 'oak-111111' }] }; _cardJob = ''; localStorage.removeItem('daylog-cardjob'); renderJobSelects(); closePanels(); renderAll(); }, CARD);
  const secs = () => page.evaluate(() => [...$('revBox').querySelectorAll('.jc-sec')].map(s => { const cs = getComputedStyle(s), r = s.getBoundingClientRect(); return { k: [...s.classList].find(c => /^jc-sec-/.test(c)).slice(7), head: (s.querySelector('.jc-head') || { textContent: '' }).textContent.trim(), border: parseFloat(cs.borderTopWidth), radius: parseFloat(cs.borderTopLeftRadius), top: r.top, bottom: r.bottom, inputs: s.querySelectorAll('input, textarea').length, people: s.querySelectorAll('.jc-person').length, codes: s.querySelectorAll('.jc-code').length, big: !!s.querySelector('.jc-big'), map: !!s.querySelector('a.jc-map'), notes: !!s.querySelector('.jc-notes') }; }));

  console.log('— 📇 the card in plates —');
  await page.evaluate(() => openJobCard('Oak House'));
  const s0 = await secs();
  ok('the reading face: Address · People · Codes · Worth knowing are FOUR plates, each with its heading inside, in that order', s0.map(s => s.k).join('|') === 'addr|ppl|codes|notes' && s0.map(s => s.head).join('|') === '📍 Address|👤 People|🔑 Codes|📝 Worth knowing', JSON.stringify(s0));
  ok('the address plate holds the big address and the Maps plate; the people plate holds both person plates; the codes plate the code; the notes plate the notes', s0[0].big && s0[0].map && s0[1].people === 2 && s0[0].people === 0 && s0[2].codes === 1 && s0[3].notes, JSON.stringify(s0));
  ok('a plate is a plate: an edge all round (2px), a radius, and room between one and the next (nothing on the card is a bare heading any more)', s0.every(s => s.border >= 2 && s.radius >= 10) && s0.slice(1).every((s, i) => s.top - s0[i].bottom >= 8) && await page.evaluate(() => [...$('revBox').querySelectorAll('.jc-head')].filter(h => !h.closest('.jc-sec')).every(h => /Hand out|Subs on this job/.test(h.textContent))), JSON.stringify(s0));
  ok('the headings are still big and brass (v6.78 stands)', await page.evaluate(() => { const h = $('revBox').querySelector('.jc-sec .jc-head'), cs = getComputedStyle(h); return parseFloat(cs.fontSize) >= 16 && cs.color === getComputedStyle(document.querySelector('.jc-pick-lbl')).color && parseInt(cs.fontWeight) >= 700; }));
  ok('nothing runs off the right edge at 390px', await page.evaluate(() => { const b = $('revBox'); return b.scrollWidth <= b.clientWidth + 1; }));

  console.log('— 📐 Plans under the pick —');
  ok('📐 Plans sits right under PICK THE JOB, full width, and names the job', await page.evaluate(() => { const p = $('revBox').querySelector('.jc-plans'), pick = $('revBox').querySelector('.jc-pick'); return !!p && !!pick && pick.nextElementSibling === p && /^📐 Plans — the plan rack for Oak House$/.test(p.textContent.trim()) && p.getBoundingClientRect().height >= 44 && p.getBoundingClientRect().width >= pick.getBoundingClientRect().width - 2; }));
  ok('a tap opens that job\'s plan rack (the four standard slots) in place of the card', await (async () => {
    await page.evaluate(() => $('revBox').querySelector('.jc-plans').click());
    await page.waitForTimeout(400);
    return await page.evaluate(() => /📐 Oak House — plan rack/.test($('revBox').textContent) && document.querySelectorAll('.pk-slot').length === 4 && _pkIdx === 0 && $('revModal').classList.contains('mat-full') && !$('jcJob'));
  })());
  ok('the rack\'s ✕ comes back to the job card, on the same job — not to the main page', await (async () => {
    await page.evaluate(() => [...$('revBox').querySelectorAll('button')].find(b => b.getAttribute('onclick') === 'closePlanRack()').click());
    await page.waitForTimeout(150);
    return await page.evaluate(() => $('revModal').classList.contains('show') && !$('revModal').classList.contains('mat-full') && !!$('jcJob') && $('jcJob').value === 'Oak House' && /SHOWING — Oak House/.test($('revBox').textContent) && !!$('revBox').querySelector('.jc-plans') && _pkIdx === -1);
  })());
  ok('a rack opened from the portal (not the card) closes to wherever it was — the card is not put up', await (async () => {
    await page.evaluate(() => closeReview());
    await page.evaluate(async () => { await openPlanRack(0); });
    await page.waitForTimeout(200);
    await page.evaluate(() => closePlanRack());
    await page.waitForTimeout(100);
    return await page.evaluate(() => !$('revModal').classList.contains('show') && !$('jcJob'));
  })());
  ok('a job with no client page: the plate says so in words and a tap opens nothing', await (async () => {
    await page.evaluate(() => openJobCard('Pine Cabin'));
    const t = await page.evaluate(() => { const p = $('revBox').querySelector('.jc-plans'); _said.length = 0; p.click(); return p.textContent.trim(); });
    await page.waitForTimeout(150);
    return /^📐 Plans — this job has no client page yet, so no plan rack$/.test(t) && await page.evaluate(() => _pkIdx === -1 && !!$('jcJob') && _said.some(s => /^📐 The plan rack lives on the client page — give this job one first/.test(s)));
  })());
  ok('with no job picked there is no Plans plate (nothing to open)', await page.evaluate(() => { _cardJob = ''; openJobCard(''); const r = !$('revBox').querySelector('.jc-plans') && /NOTHING PICKED YET/.test($('revBox').textContent); return r; }));

  console.log('— ✎ the form in the same plates —');
  ok('✎ Edit: the form wears the same four plates — the address box inside Address, the person rows and ➕ Add a person inside People, the code row and ➕ Add a code inside Codes, the notes box inside Worth knowing', await (async () => {
    await page.evaluate(() => openJobCard('Oak House', true));
    const s = await secs();
    return s.map(x => x.k).join('|') === 'addr|ppl|codes|notes' && s[0].inputs === 1 && await page.evaluate(() => !!$('jcAddr') && $('jcAddr').closest('.jc-sec-addr') !== null && $('jcPn0').closest('.jc-sec-ppl') !== null && [...$('revBox').querySelectorAll('.jc-add')].filter(b => /^➕/.test(b.textContent.trim())).every(b => b.closest('.jc-sec') !== null) && $('jcCw0').closest('.jc-sec-codes') !== null && $('jcNotes').closest('.jc-sec-notes') !== null && !!$('revBox').querySelector('.jc-plans'));
  })(), JSON.stringify(await secs()));
  ok('and the form still reads back whole — a change to the address saves as before', await page.evaluate(() => { $('jcAddr').value = '14 Birch Loop, Soldotna'; cardSave(); const c = cardGet('Oak House'); return c.addr === '14 Birch Loop, Soldotna' && c.people.length === 2 && c.codes[0].c === '1379#' && !!$('revBox').querySelector('.jc-sec-addr .jc-big'); }));
  ok('📐 Plans from the form face saves the words first (nothing typed is lost), then opens the rack', await (async () => {
    await page.evaluate(() => { openJobCard('Oak House', true); $('jcNotes').value = 'Dog in the back yard · gate sticks'; });
    await page.evaluate(() => $('revBox').querySelector('.jc-plans').click());
    await page.waitForTimeout(400);
    const inRack = await page.evaluate(() => /plan rack/.test($('revBox').textContent) && cardGet('Oak House').notes === 'Dog in the back yard · gate sticks');
    await page.evaluate(() => closePlanRack());
    await page.waitForTimeout(100);
    return inRack && await page.evaluate(() => !!$('jcJob') && $('jcJob').value === 'Oak House');
  })());
  await page.evaluate(() => closeReview());

  console.log('— 👷 a field phone —');
  await page.evaluate(CARD => { localStorage.setItem('daylog-crew-name', 'Kevin'); localStorage.removeItem('daylog-crew-office'); localStorage.setItem('daylog-dbx', JSON.stringify({ appKey: 'k', refreshToken: 'test-token', accessToken: 'a', expiresAt: Date.now() + 3600000 })); localStorage.setItem('daylog-crew-cards-test', JSON.stringify({ 'oak house': CARD })); }, CARD);
  await page.reload(); await page.waitForTimeout(900); await stub();
  ok('a field phone reads the card in the same plates and gets NO Plans plate (the rack turns field crew away)', await page.evaluate(() => { crewCards = JSON.parse(localStorage.getItem('daylog-crew-cards-test')); _portalIdx = { clients: [] }; openJobCard('Oak House');
    const s = [...$('revBox').querySelectorAll('.jc-sec')].map(x => [...x.classList].find(c => /^jc-sec-/.test(c)).slice(7)).join('|'); const r = CREW_NAME === 'Kevin' && s === 'addr|ppl|codes|notes' && !$('revBox').querySelector('.jc-plans') && !$('jcAddr'); closeReview(); return r; }));
  ok('and wrote nothing', await page.evaluate(() => window._ups.length === 0));
  await page.evaluate(() => { localStorage.removeItem('daylog-crew-name'); localStorage.removeItem('daylog-crew-cards-test'); });

  ok('version bumped — APP_VER and the footer agree', /const APP_VER = 'v7\.(6\d|[7-9]\d)'/.test(src) && new RegExp('<footer>' + (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1].replace('.', '\\.') + ' ·').test(src));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
