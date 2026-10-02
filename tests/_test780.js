// 💬 v7.80 — THE CONVERSATION FOLDS; A LIGHT FOR WHAT WAITS ON HIM. Eric: "On the From Phil, I'd like the conversations to be folded
// with just the recent alert and the original message. Everything else can be folded until unfolded but there should be a light for
// response waiting or alert waiting that pulses". On his WITH PHIL card a conversation shows the original note and the newest words
// (every word from the other side since his own last, so two answers in a row are never half-hidden); the earlier back-and-forth sits
// under one plate that opens it in place. A pulsing lamp with words — ↩ RESPONSE WAITING / ⚠ ALERT WAITING — leads a row's top line,
// and the card's head counts them behind the same lamp. A crew phone's WITH ERIC card is as it was. Every name and word made up.
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
  const open = async (opts, init) => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, ...(opts || {}) });
    await ctx.route(u => !/^file:/.test(u.href), r => r.abort());
    if (init) await ctx.addInitScript(init);
    const page = await ctx.newPage();
    page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
    await page.goto(appUrl); await page.waitForTimeout(800);
    return { ctx, page };
  };
  // Eric's phone with a faked crew folder. Phil's note 30 is a long conversation; 31 is his ⚠ note nobody has answered; 32 has one
  // answer only; 33 is a plain note. Eric's own note 5 has Phil's two answers, both newer than anything Eric did.
  const seed = page => page.evaluate(async () => {
    window.scheduleSave = () => {}; window.savePendingSoon = () => {}; window.setAck = () => {}; window.pushOut = () => false; window.publishSharedNotes = async () => {};
    const m = n => new Date(Date.now() - n * 60000), iso = n => m(n).toISOString();
    jobs = ['Oak House', 'Pine Cabin']; crew = ['Phil']; prefs.office = ['Phil']; prefs.crewCfg716 = true; prefs.crewFeedGone = []; prefs.thSeen = {}; prefs.crewFeedN = 'all'; prefs.crewFeedFold = false;
    todos = []; pendingQueue = []; nextId = 500;
    entries = [
      { id: 5, ts: m(2 * 1440), type: 'Note', details: 'Order the long screws for the deck', job: 'Oak House', vis: 'Phil' },
      // Eric's own answers on Phil's note 30 (they live in his log, re → Phil:30)
      { id: 101, ts: m(300), type: 'Note', details: '↩ Use the tan', job: 'Oak House', vis: 'Phil', re: { owner: 'Phil', id: 30 } },
      { id: 103, ts: m(200), type: 'Note', details: '↩ Yes, both sides', job: 'Oak House', vis: 'Phil', re: { owner: 'Phil', id: 30 } },
      { id: 105, ts: m(500), type: 'Note', details: '↩ Two sticks short — I will bring them', job: 'Pine Cabin', vis: 'Phil', re: { owner: 'Phil', id: 32 } },
    ];
    renderJobSelects(); closePanels(); renderAll();
    dbx.refreshToken = 'tok'; window.dbxUpload = async () => ({});
    window._phil = [
      { id: 30, ts: iso(400), type: 'Note', details: 'Soffit color for Oak — tan or white?', job: 'Oak House', vis: 'Eric' },
      { id: 102, ts: iso(250), type: 'Note', details: '↩ Tan on both sides of the house?', job: 'Oak House', vis: 'Eric', re: { owner: 'Phil', id: 30 } },
      { id: 104, ts: iso(20), type: 'Note', details: '↩ Got it, ordering tan today', job: 'Oak House', vis: 'Eric', re: { owner: 'Phil', id: 30 } },
      { id: 31, ts: iso(15), type: 'Note', details: 'Inspector is here now — need you', job: 'Oak House', vis: 'Eric', route: 'Eric', urg: 'now' },
      { id: 32, ts: iso(600), type: 'Note', details: 'Trim delivered to Pine', job: 'Pine Cabin', vis: 'Eric' },
      { id: 33, ts: iso(700), type: 'Note', details: 'Dumpster swapped at Pine', job: 'Pine Cabin', vis: 'Eric' },
      { id: 106, ts: iso(40), type: 'Note', details: '↩ Ordered, here Friday', job: 'Oak House', vis: 'Eric', re: { owner: 'Eric', id: 5 } },
      { id: 107, ts: iso(10), type: 'Note', details: '↩ Also got the washers', job: 'Oak House', vis: 'Eric', re: { owner: 'Eric', id: 5 } },
    ];
    window._files = { '/clore daylog/crew/phil/app data/entries.json': JSON.stringify({ entries: _phil }) };
    window.dbxList = async () => ({ entries: [{ '.tag': 'folder', name: 'Phil', path_lower: '/clore daylog/crew/phil', path_display: '/Clore DayLog/Crew/Phil' }] });
    window.dbxDownload = async p => window._files[p] ?? null;
    if (!window._said) { window._said = []; const t0 = window.toast; window.toast = (mm, g) => { if (mm) _said.push(String(mm)); return t0(mm, g); }; }
    await checkCrewLogs();
  });
  const rowOf = (page, th) => page.evaluate(th => {
    const r = document.querySelector(`#crewFeedList .sum-row[data-th="${th}"]`); if (!r) return null;
    const seen = el => !!el && el.getClientRects().length > 0 && getComputedStyle(el).display !== 'none';
    const lines = [...r.querySelectorAll('.th-line')].map(l => ({ t: l.textContent.replace(/\s+/g, ' ').trim(), seen: seen(l) }));
    const plate = r.querySelector('.th-fold'), lamp = r.querySelector('.hint .cf-lamp');
    return { top: r.querySelector('.hint').textContent.replace(/\s+/g, ' ').trim(), lines, shown: lines.filter(l => l.seen).map(l => l.t), plate: plate ? { t: plate.textContent.trim(), exp: plate.getAttribute('aria-expanded'), seen: seen(plate), h: Math.round(plate.getBoundingClientRect().height) } : null,
      lamp: lamp ? { alert: lamp.classList.contains('alert'), anim: getComputedStyle(lamp).animationName, w: Math.round(lamp.getBoundingClientRect().width), seen: seen(lamp), shadow: getComputedStyle(lamp).boxShadow, bg: getComputedStyle(lamp).backgroundColor } : null,
      cls: r.className, outline: getComputedStyle(r).outlineStyle, outlineColor: getComputedStyle(r).outlineColor, all: r.textContent.replace(/\s+/g, ' ').trim() };
  }, th);

  console.log('— 💬 Eric\'s phone: a conversation folds —');
  const E = await open();
  const page = E.page;
  await seed(page);
  const r30 = await rowOf(page, 'Phil:30');
  ok('a long conversation opens FOLDED: the original note, one plate "▸ 3 earlier messages — tap to see the whole conversation", then the newest words', r30 && /Soffit color for Oak/.test(r30.all) && r30.plate && r30.plate.t === '▸ 3 earlier messages — tap to see the whole conversation' && r30.plate.exp === 'false' && r30.shown.length === 1 && /^↩ Phil .*Got it, ordering tan today$/.test(r30.shown[0]), JSON.stringify(r30));
  ok('the earlier back-and-forth is not on the screen (it is on the page, hidden — nothing that reads the row\'s words lost them)', r30.lines.length === 4 && r30.lines.slice(0, 3).every(l => !l.seen) && /Use the tan/.test(r30.all) && /Tan on both sides/.test(r30.all), JSON.stringify(r30.lines));
  ok('the earlier messages fold in their place: the plate sits right under the original note, the newest under the plate', await page.evaluate(() => { const r = document.querySelector('#crewFeedList .sum-row[data-th="Phil:30"]'), p = r.querySelector('.th-fold'), n = r.querySelector('.th-line.th-recent'), o = p.closest('.th-lines').previousElementSibling; return !!o && /Soffit color/.test(o.textContent) && p.getBoundingClientRect().bottom <= n.getBoundingClientRect().top + 1; }));
  ok('the plate takes a thumb (36px or more) and the card does not run off the side at 390px', r30.plate.h >= 36 && await page.evaluate(() => { const c = $('crewFeedCard'); return c.scrollWidth <= c.clientWidth + 1; }), String(r30.plate.h));

  console.log('— the light —');
  ok('↩ RESPONSE WAITING: Phil answered after Eric\'s last word — a lamp leads the top line, it pulses, the words follow it, and the row wears its edge', /^↩ RESPONSE WAITING · 👷 Phil · /.test(r30.top) && r30.lamp && r30.lamp.seen && !r30.lamp.alert && r30.lamp.anim === 'cfLamp' && r30.lamp.w >= 10 && /th-new/.test(r30.cls) && r30.outline === 'solid', JSON.stringify({ top: r30.top, lamp: r30.lamp, cls: r30.cls }));
  const r31 = await rowOf(page, 'Phil:31');
  ok('⚠ ALERT WAITING: Phil\'s ⚠ Needs attention note nobody has answered — its own lamp (the alert colour, pulsing), the words, an orange edge; no conversation, so no plate', /^⚠ ALERT WAITING · 👷 Phil · .*⚠ NEEDS YOUR ATTENTION/.test(r31.top) && r31.lamp && r31.lamp.alert && r31.lamp.anim === 'cfLamp' && /th-alert/.test(r31.cls) && r31.outline === 'solid' && r31.outlineColor !== r30.outlineColor && !r31.plate && !r31.lines.length, JSON.stringify(r31));
  const r32 = await rowOf(page, 'Phil:32'), r33 = await rowOf(page, 'Phil:33');
  ok('a conversation with ONE answer shows it with no plate; a plain note shows no lamp and no edge', r32 && !r32.plate && r32.shown.length === 1 && /Two sticks short/.test(r32.shown[0]) && !r32.lamp && !/th-new|th-alert/.test(r32.cls) && r33 && !r33.lamp && !r33.lines.length && r33.outline !== 'solid', JSON.stringify([r32, r33]));
  const r5 = await rowOf(page, 'Eric:5');
  ok('his own note with Phil\'s TWO answers since: both are shown (two in a row are never half-hidden), no plate, ↩ RESPONSE WAITING on top', r5 && !r5.plate && r5.shown.length === 2 && /Ordered, here Friday/.test(r5.shown[0]) && /Also got the washers/.test(r5.shown[1]) && /^↩ RESPONSE WAITING · 📨 you → Phil/.test(r5.top) && r5.lamp && !r5.lamp.alert, JSON.stringify(r5));
  const head = await page.evaluate(() => ({ t: $('cfFoldBtn').textContent.trim(), lamp: !!$('cfFoldBtn').querySelector('.cf-lamp.alert'), anim: ($('cfFoldBtn').querySelector('.cf-lamp') ? getComputedStyle($('cfFoldBtn').querySelector('.cf-lamp')).animationName : '') }));
  ok('the card\'s head counts them behind the same pulsing lamp: · ⚠ 1 alert waiting · ↩ 2 responses waiting', /^▾ 👷 WITH PHIL — showing 5 of 5 · ⚠ 1 alert waiting · ↩ 2 responses waiting, tap to fold$/.test(head.t) && head.lamp && head.anim === 'cfLamp', JSON.stringify(head));
  ok('…and with the card folded too, so it is seen without opening it', await page.evaluate(() => { crewFeedFold(); const t = $('cfFoldBtn').textContent.trim(), l = !!$('cfFoldBtn').querySelector('.cf-lamp'); crewFeedFold(); return /^▸ 👷 WITH PHIL — 5 notes · ⚠ 1 alert waiting · ↩ 2 responses waiting, tap to open$/.test(t) && l; }));
  ok('the order is v7.74\'s: words he has not answered first, then ⚠, then newest', await page.evaluate(() => [...document.querySelectorAll('#crewFeedList .sum-row')].map(r => r.dataset.th).join('|')) === 'Phil:30|Eric:5|Phil:31|Phil:32|Phil:33', await page.evaluate(() => [...document.querySelectorAll('#crewFeedList .sum-row')].map(r => r.dataset.th).join('|')));

  console.log('— a tap opens the whole conversation, in place —');
  const before = await page.evaluate(() => { const r = document.querySelector('#crewFeedList .sum-row[data-th="Phil:30"]'); window._r30 = r; r.querySelector('.th-fold').scrollIntoView({ block: 'center' }); return Math.round(r.querySelector('.th-fold').getBoundingClientRect().top); });   // on the screen first, as under his thumb (a click on something off the screen scrolls to it)
  await page.click('#crewFeedList .sum-row[data-th="Phil:30"] .th-fold');
  await page.waitForTimeout(150);
  const o30 = await rowOf(page, 'Phil:30');
  const same = await page.evaluate(b => { const r = document.querySelector('#crewFeedList .sum-row[data-th="Phil:30"]'); return { node: r === window._r30, top: Math.round(r.querySelector('.th-fold').getBoundingClientRect().top), b }; }, before);
  ok('a tap on the plate shows every message, oldest first, and the plate says how to fold it — on the same row (nothing redrawn), the plate where it was', o30.shown.length === 4 && /Use the tan/.test(o30.shown[0]) && /Tan on both sides/.test(o30.shown[1]) && /Yes, both sides/.test(o30.shown[2]) && /Got it, ordering tan/.test(o30.shown[3]) && o30.plate.t === '▾ The whole conversation, 4 messages — tap to fold it' && o30.plate.exp === 'true' && same.node && Math.abs(same.top - same.b) <= 2, JSON.stringify([o30, same]));
  ok('his own words in it are marked as his (↩ you), the other side\'s by name', o30.shown.filter(t => /^↩ you /.test(t)).length === 2 && o30.shown.filter(t => /^↩ Phil /.test(t)).length === 2, JSON.stringify(o30.shown));
  await page.evaluate(() => renderCrewFeed());
  ok('it stays open through a redraw (a sync)', (await rowOf(page, 'Phil:30')).shown.length === 4 && (await rowOf(page, 'Phil:30')).plate.exp === 'true');
  await page.click('#crewFeedList .sum-row[data-th="Phil:30"] .th-fold');
  await page.waitForTimeout(100);
  ok('a second tap folds it again', (await rowOf(page, 'Phil:30')).shown.length === 1 && (await rowOf(page, 'Phil:30')).plate.t === '▸ 3 earlier messages — tap to see the whole conversation');

  console.log('— when he answers, the light rests —');
  await page.evaluate(() => { thRespondOpen('Phil', '30', 'Phil'); $('thT-Phil-30').value = 'Great, thanks'; thRespondSend('Phil', '30', 'Phil'); });
  await page.waitForTimeout(150);
  const a30 = await rowOf(page, 'Phil:30');
  ok('after his response: his own words are the newest and the only ones shown, the four before them fold, and the lamp is gone (nothing waits on him)', a30.shown.length === 1 && /^↩ you .*Great, thanks$/.test(a30.shown[0]) && a30.plate.t === '▸ 4 earlier messages — tap to see the whole conversation' && !a30.lamp && !/RESPONSE WAITING/.test(a30.top) && !/th-new/.test(a30.cls), JSON.stringify(a30));
  ok('…and the head counts one response waiting now', /· ⚠ 1 alert waiting · ↩ 1 response waiting, tap to fold$/.test(await page.evaluate(() => $('cfFoldBtn').textContent.trim())), await page.evaluate(() => $('cfFoldBtn').textContent.trim()));
  await page.evaluate(() => { const r = crewFeedRows().find(x => !x.own && x.e.id === 31); crewFeedFlushOne(r.key); });
  await page.waitForTimeout(150);
  const g31 = await rowOf(page, 'Phil:31');
  ok('the alert rests once he takes it to the grinder (it stays on the card until Phil is done with it too, with no lamp)', g31 && !g31.lamp && !/ALERT WAITING/.test(g31.top) && !/th-alert/.test(g31.cls) && /⚠ NEEDS YOUR ATTENTION/.test(g31.top), JSON.stringify(g31));
  ok('the head now counts only what still waits: Phil\'s two answers on Eric\'s own note (↩ 1 response waiting), no alert', /· ↩ 1 response waiting, tap to fold$/.test(await page.evaluate(() => $('cfFoldBtn').textContent.trim())) && !(await page.evaluate(() => $('cfFoldBtn').textContent)).includes('alert'), await page.evaluate(() => $('cfFoldBtn').textContent.trim()));
  await E.ctx.close();

  console.log('— an alert already in his log, and a reader that wants no motion —');
  const R = await open({ reducedMotion: 'reduce' });
  await seed(R.page);
  await R.page.evaluate(async () => {   // the ⚠ note was logged through the Sort card before he opened this card: handled
    const key = crewFeedRows().find(x => !x.own && x.e.id === 31).key;
    entries.push({ id: 900, ts: new Date(), type: 'Note', details: 'Phil: Inspector is here now — need you', job: 'Oak House', who: 'Phil', crewKey: key });
    renderCrewFeed();
  });
  const l31 = await rowOf(R.page, 'Phil:31'), l30 = await rowOf(R.page, 'Phil:30');
  ok('a ⚠ note he already logged is not waiting: no lamp, no orange edge (its words still say what it was)', l31 && !l31.lamp && !/th-alert/.test(l31.cls) && /⚠ NEEDS YOUR ATTENTION/.test(l31.top), JSON.stringify(l31));
  ok('with reduced motion the lamp holds still and wears a ring instead of pulsing; the words are there either way', l30.lamp && l30.lamp.anim === 'none' && /rgb/.test(l30.lamp.shadow) && /RESPONSE WAITING/.test(l30.top), JSON.stringify(l30.lamp));
  await R.ctx.close();

  console.log('— a crew phone\'s WITH ERIC card is as it was —');
  const P = await open({}, () => { try { localStorage.setItem('daylog-crew-name', 'Phil'); localStorage.removeItem('daylog-crew-office'); localStorage.setItem('daylog-dbx', JSON.stringify({ appKey: 'k', refreshToken: 'test-token', accessToken: 'a', expiresAt: Date.now() + 3600000 })); } catch (e) {} });
  await P.page.evaluate(async () => {
    window.scheduleSave = () => {}; window.savePendingSoon = () => {}; window._dbxFiles = {}; window.dbxDownload = async p => (window._dbxFiles || {})[p] ?? null; window.dbxUpload = async () => ({}); window.dbxList = async () => ({ entries: [] }); window.dbxRpc = async () => ({}); window.pushOut = () => false;
    dbx.refreshToken = 'test-token';
    const m = n => new Date(Date.now() - n * 60000), iso = n => m(n).toISOString();
    jobs = ['Oak House']; todos = []; nextId = 100; prefs.thSeen = {}; prefs.crewShowN = 'all'; prefs.crewFold = false;
    entries = [{ id: 10, ts: m(600), type: 'Note', details: 'Which stain for the deck?', job: 'Oak House', vis: 'Eric' },
      { id: 11, ts: m(300), type: 'Note', details: '↩ Walnut or cedar?', job: 'Oak House', vis: 'Eric', re: { owner: 'Phil', id: 10 } }];
    const notes = [{ id: 301, ts: iso(400), text: '↩ Use the walnut', job: 'Oak House', re: { owner: 'Phil', id: 10 } }, { id: 302, ts: iso(5), text: '↩ Walnut, two coats', job: 'Oak House', re: { owner: 'Phil', id: 10 } }];
    _dbxFiles[DBX_ROOT + '/shared.json'] = JSON.stringify({ from: 'Eric', notes, todos: [], asks: [], seen: {} });
    renderJobSelects(); closePanels(); renderAll();
    await checkSharedNotes();
  });
  const pr = await P.page.evaluate(() => { const r = document.querySelector('#crewSharedList .sum-row[data-th="Phil:10"]'); return r ? { plate: !!r.querySelector('.th-fold'), lamp: !!r.querySelector('.cf-lamp'), lines: [...r.querySelectorAll('.th-line')].filter(l => l.getClientRects().length).length, t: r.textContent.replace(/\s+/g, ' ').trim() } : null; });
  ok('on Phil\'s phone his own note with three back-and-forth lines shows all of them, no plate, no lamp — and still says ↩ NEW REPLY', pr && !pr.plate && !pr.lamp && pr.lines === 3 && /^↩ NEW REPLY · /.test(pr.t), JSON.stringify(pr));
  await P.ctx.close();

  ok('the homeowner\'s page knows nothing of it', !/th-fold|cf-lamp|RESPONSE WAITING/.test(fs.readFileSync(path.join(repo, 'c', 'index.html'), 'utf8')));
  ok('version bumped — APP_VER and the footer agree', /const APP_VER = 'v7\.(8\d|9\d)'/.test(src) && new RegExp('<footer>' + (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1].replace('.', '\\.') + ' ·').test(src));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
