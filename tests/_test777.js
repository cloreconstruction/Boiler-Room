// v7.77 — Eric, with a crew receipt on his WITH PHIL card: "what buttons did phil push in what order to get here? meaning did he
// file this receipt correctly? did he push 'to the bookkeeper'?" — he had, and none of it would have reached Eric's log (the read,
// the 🧾 mark and the Bookkeeper mark were dropped on the way in). Then: "yes fix the flush. lets find a new name for flush, sounds
// to toilet like. to the grinder? grind it? If he pushed receipt it should automatically highlight send to eric. so when he pushes
// to grinder or bookkeeper on his phone it comes to my from phil … yes to bookkeeper mark counts. lets change logan to bookkeeper
// on the app" — and, mid-build: "on bills that came in the button that says onto their page is lit up with gold, make is not lit
// up and put send to their page". Names, stores, jobs and amounts are made up. Eric's phone first (a faked crew folder and a
// faked estimates board), then a real reload as a crew phone.
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
  const open = async init => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await ctx.route(u => !/^file:/.test(u.href), r => r.abort());
    if (init) await ctx.addInitScript(init);
    const page = await ctx.newPage();
    page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
    await page.goto(appUrl); await page.waitForTimeout(700);
    return { ctx, page };
  };
  // every word a reader could meet on the page: the text (scripts and styles left out), the titles and the labels
  const WORDS = `(() => { const b = document.body.cloneNode(true); b.querySelectorAll('script, style').forEach(n => n.remove());
    return b.textContent + ' ' + [...document.querySelectorAll('[title], [aria-label], [placeholder]')].map(e => [e.getAttribute('title'), e.getAttribute('aria-label'), e.getAttribute('placeholder')].filter(Boolean).join(' ')).join(' '); })()`;

  console.log('— 🧾 Eric\'s phone: a crew receipt arrives whole —');
  const eric = await open();
  const page = eric.page;
  await page.evaluate(async () => {
    window.scheduleSave = () => {}; window.savePendingSoon = () => {}; window.publishSharedNotes = async () => {}; window.setAck = () => {};
    entries = []; todos = []; pendingQueue = []; jobs = ['Oak House', 'Pine Cabin']; crew = ['Phil']; prefs.office = ['Phil']; prefs.crewCfg716 = true; prefs.crewFeedGone = []; prefs.thSeen = {}; prefs.crewFeedN = 'all'; prefs.crewFeedFold = false; nextId = 100;
    renderJobSelects(); closePanels(); renderAll();
    dbx.refreshToken = 'tok';
    window._said = []; const t0 = window.toast; window.toast = (m, g) => { if (m) _said.push(String(m)); return t0(m, g); };
    window._dbxFiles = {};
    window.dbxUpload = async (p, b) => { _dbxFiles[p] = b; return {}; };
    window.dbxPathExists = async p => Object.prototype.hasOwnProperty.call(_dbxFiles, p);
    const ago = h => new Date(Date.now() - h * 3600000).toISOString();
    window.READ = '📅 ' + localDay(new Date()) + '\n🏪 Hill Supply\n💵 $48.20\n🛒 1 item:\n• blade 3-pack — $46.80 · SKU AB12345';
    window._phil = [
      { id: 41, ts: ago(1), type: 'Note', details: READ, ai: READ, rcpt: true, category: 'Demo', tags: ['Bookkeeper', 'Framing crew'], vis: 'Eric', job: 'Oak House', photoPath: '/Phil/Job Notes/Oak House/Receipts/r1.jpg' },
      { id: 42, ts: ago(2), type: 'Note', details: 'dump run, lost the slip amount', rcpt: true, category: 'Framing', vis: 'crew', job: 'Oak House' },
      { id: 43, ts: ago(3), type: 'Note', details: 'Trim delivered to the garage', vis: 'Eric', job: 'Oak House' },
      { id: 44, ts: ago(4), type: 'Note', details: 'fuel for the truck', ai: '🏪 Gas Stop\n💵 $60.00', rcpt: true, category: 'Fuel', billable: false, vis: 'Eric', job: 'Oak House' }];
    window._save = () => { window._files = { '/clore daylog/crew/phil/app data/entries.json': JSON.stringify({ entries: _phil }) }; }; _save();
    window.dbxList = async () => ({ entries: [{ '.tag': 'folder', name: 'Phil', path_lower: '/clore daylog/crew/phil', path_display: '/Clore DayLog/Crew/Phil' }] });
    window.dbxDownload = async p => (window._files[p] ?? window._dbxFiles[p] ?? null);
    window._card = id => pendingQueue.find(p => new RegExp('^crew:Phil:' + id + ':').test(p.id));
    window._row = re => [...document.querySelectorAll('#crewFeedList .cf-row')].find(r => re.test(r.textContent));
    await checkCrewLogs(); renderCrewFeed();
  });

  ok('the Sort cards carry what the crew phone filed: the Wizard\'s read, the 🧾 mark and the Bookkeeper mark on the receipt — and none of the crew member\'s own tags; a plain note carries none of it', await page.evaluate(() => {
    const a = _card(41).payload, b = _card(42).payload, c = _card(43).payload, d = _card(44).payload;
    return a.ai === READ && a.rcpt === true && a.bk === true && a.category === 'Demo' && !('tags' in a)
      && b.rcpt === true && !b.ai && !b.bk && !c.rcpt && !c.ai && !c.bk && d.billable === false && d.rcpt === true && /💵 \$60\.00/.test(d.ai);
  }), await page.evaluate(() => JSON.stringify(pendingQueue.map(p => [p.id, Object.keys(p.payload).join(',')]))));

  ok('the WITH PHIL row says how it was filed before he sends it on: 🧾 and the category, 📗 bookkeeper, and ⚠ no amount read when the crew member skipped the read; a plain note says none of it', await page.evaluate(() => {
    const t = re => _row(re).querySelector('.hint').textContent.replace(/\s+/g, ' ');
    const a = t(/Hill Supply/), b = t(/dump run/), c = t(/Trim delivered/);
    return /🧾 Demo/.test(a) && /📗 bookkeeper/.test(a) && !/no amount read/.test(a) && /🧾 Framing/.test(b) && /⚠ no amount read/.test(b) && !/bookkeeper/.test(b) && !/🧾/.test(c) && !/bookkeeper/.test(c);
  }), await page.evaluate(() => JSON.stringify([...document.querySelectorAll('#crewFeedList .cf-row .hint')].map(h => h.textContent.replace(/\s+/g, ' ')))));

  ok('⚙ the plates say the grinder: ⚙ Grind all 4 on the card\'s head, ⚙ To the grinder on every row — and the word "flush" is nowhere on the page (text, titles, labels)', await page.evaluate(w => {
    const btns = [...document.querySelectorAll('#crewFeedList .cf-flush')].map(b => b.textContent.trim());
    return $('cfFlushBtn').textContent === '⚙ Grind all 4' && btns.length === 4 && btns.every(t => t === '⚙ To the grinder') && !/flush/i.test(eval(w));
  }, WORDS), await page.evaluate(w => JSON.stringify({ head: $('cfFlushBtn').textContent, m: (eval(w).match(/.{30}flush.{30}/i) || [''])[0] }), WORDS));

  ok('⚙ To the grinder on the receipt: it lands in his log under Phil WITH the read (the amount, the store), the 🧾 mark, its category, the picture and the Bookkeeper mark (and who marked it) — so it parses as a bill and waits on its job like one of his own', await page.evaluate(() => {
    _said.length = 0; _row(/Hill Supply/).querySelector('.cf-flush').click();
    const e = entries.find(x => /^crew:Phil:41:/.test(x.crewKey || '')), p = e && estBillParse(e);
    window._e41 = e;
    return !!e && e.who === 'Phil' && /^Phil: /.test(e.details) && e.job === 'Oak House' && e.ai === READ && e.rcpt === true && e.category === 'Demo' && JSON.stringify(e.tags) === '["Bookkeeper"]' && e.bkBy === 'Phil' && e.cg === 'arb'
      && e.photoPath === '/Clore DayLog/Crew/Phil/Job Notes/Oak House/Receipts/r1.jpg' && p && p.amt === 48.2 && p.v === 'Hill Supply' && rcptWaiting('Oak House').includes(e) && !_row(/Hill Supply/);
  }), await page.evaluate(() => JSON.stringify(entries.map(e => ({ d: e.details.slice(0, 30), ai: !!e.ai, rcpt: e.rcpt, tags: e.tags, cg: e.cg, bkBy: e.bkBy })))));
  ok('…and the toast says where it went and where it waits: ⚙ In your grinder — off the card ✓ · 🧾 the receipt waits under Oak House → 📥 Bills that came in', await page.evaluate(() =>
    /⚙ In your grinder — off the card ✓ · 🧾 the receipt waits under Oak House → 📥 Bills that came in/.test(_said.join(' | '))), await page.evaluate(() => _said.join(' | ')));

  ok('"yes to bookkeeper mark counts": the receipt sits under 📗 SENT TO THE BOOKKEEPER on the Summary, said "to the bookkeeper"', await page.evaluate(async () => {
    openReview('summary'); await new Promise(r => setTimeout(r, 60));
    const head = [...document.querySelectorAll('.rev-sec')].find(b => b.dataset.sec === 'logan'), body = document.querySelector('.rev-sec-body[data-sec="logan"]');
    const r = !!head && /📗 SENT TO THE BOOKKEEPER/.test(head.textContent) && !!body && /Hill Supply/.test(body.textContent) && /to the bookkeeper/.test(body.textContent);
    closeReview(); return r;
  }));

  ok('a receipt the crew member never had read: it goes in with its 🧾 mark and category, no amount — and the toast says so instead of promising a bill', await page.evaluate(() => {
    _said.length = 0; _row(/dump run/).querySelector('.cf-flush').click();
    const e = entries.find(x => /^crew:Phil:42:/.test(x.crewKey || ''));
    return !!e && e.rcpt === true && e.category === 'Framing' && !e.ai && e.cg === 'r' && !estBillParse(e) && !(e.tags || []).length && /⚠ no amount was read off that receipt/.test(_said.join(' | '));
  }), await page.evaluate(() => _said.join(' | ')));

  ok('⚙ Grind all takes the rest: the plain note with no marks, the fuel receipt as overhead (not billable — never offered to a client), and the toast counts them "into your grinder"', await page.evaluate(() => {
    _said.length = 0; $('cfFlushBtn').click();
    const t = entries.find(x => /^crew:Phil:43:/.test(x.crewKey || '')), f = entries.find(x => /^crew:Phil:44:/.test(x.crewKey || ''));
    return !!t && !t.ai && !t.rcpt && !(t.tags || []).length && t.cg === '' && !!f && f.billable === false && f.rcpt === true && isOverheadEntry(f) && !rcptWaiting('Oak House').includes(f)
      && /⚙ 2 off the card — 2 into your grinder ✓/.test(_said.join(' | ')) && !/Bills that came in/.test(_said.join(' | ')) && getComputedStyle($('crewFeedCard')).display === 'none';
  }), await page.evaluate(() => _said.join(' | ')));

  console.log('— 🩹 what came in before this build catches up —');
  ok('a card made BEFORE the read landed (or by an older build) catches up on the next sweep; with the crew file out of reach the card alone still carries it into his log', await page.evaluate(async () => {
    entries = []; pendingQueue = []; prefs.crewFeedGone = []; pendDone.clear();   // a fresh phone: nothing handled yet
    const key = 'crew:Phil:41:' + String(_phil[0].ts).slice(0, 10);
    pendingQueue.push({ id: key, kind: 'crew', source: 'Phil', payload: { from: 'Phil', type: 'Note', text: READ, job: 'Oak House', category: 'Demo', day: String(_phil[0].ts).slice(0, 10), vis: 'Eric', ph: '', phs: [], jrn: false } });
    await checkCrewLogs();
    const caught = _card(41).payload.ai === READ && _card(41).payload.rcpt === true && _card(41).payload.bk === true;
    _crewLog.Phil = [];   // the crew file out of reach
    reviewAct(key, 'log');
    const e = entries.find(x => x.crewKey === key);
    return caught && !!e && e.ai === READ && e.rcpt === true && JSON.stringify(e.tags) === '["Bookkeeper"]' && e.cg === 'arb';
  }));
  ok('the crew member\'s own entry wins over the card: a read that landed on his phone AFTER the card was made rides into the log', await page.evaluate(async () => {
    entries = []; pendingQueue = []; prefs.crewFeedGone = [];
    const key = 'crew:Phil:42:' + String(_phil[1].ts).slice(0, 10);
    pendingQueue.push({ id: key, kind: 'crew', source: 'Phil', payload: { from: 'Phil', type: 'Note', text: 'dump run, lost the slip amount', job: 'Oak House', category: 'Framing', rcpt: true, day: String(_phil[1].ts).slice(0, 10), vis: 'crew' } });
    _crewLog.Phil = _phil.map(x => x.id === 42 ? { ...x, ai: '🏪 Transfer Site\n💵 $22.00' } : x);
    reviewAct(key, 'log');
    const e = entries.find(x => x.crewKey === key);
    return !!e && /💵 \$22\.00/.test(e.ai) && estBillParse(e).amt === 22 && e.cg === 'ar';
  }));
  ok('a crew receipt that went into his log BEFORE this build is healed on the next sweep — the read, the 🧾 mark, the Bookkeeper mark, each added ONCE; what he takes off afterwards stays off', await page.evaluate(async () => {
    entries = []; pendingQueue = []; prefs.crewFeedGone = [];
    const key = 'crew:Phil:41:' + String(_phil[0].ts).slice(0, 10);
    entries.push({ id: 7, ts: new Date(), type: 'Note', details: 'Phil: ' + READ, job: 'Oak House', who: 'Phil', category: 'Demo', crewKey: key, noSniff: true });
    entries.push({ id: 8, ts: new Date(), type: 'Note', details: 'my own note about Hill Supply', job: 'Oak House' });
    _save(); await checkCrewLogs();
    const e = entries.find(x => x.id === 7), mine = entries.find(x => x.id === 8);
    const healed = e.ai === READ && e.rcpt === true && JSON.stringify(e.tags) === '["Bookkeeper"]' && e.bkBy === 'Phil' && e.cg === 'arb' && estBillParse(e).amt === 48.2 && !mine.ai && !mine.rcpt && !mine.cg;
    e.tags = []; e.ai = 'ERIC CORRECTED: the total was different'; await checkCrewLogs();
    return healed && e.tags.length === 0 && e.ai === 'ERIC CORRECTED: the total was different' && e.cg === 'arb';
  }), await page.evaluate(() => JSON.stringify(entries.map(e => ({ id: e.id, ai: (e.ai || '').slice(0, 20), rcpt: e.rcpt, tags: e.tags, cg: e.cg })))));

  ok('a receipt on a job with NO client page is not promised a bills strip — the toast says it stays in his log', await page.evaluate(async () => {
    entries = []; pendingQueue = []; prefs.crewFeedGone = []; pendDone.clear();
    _portalIdx = { clients: [{ key: 'pine', job: 'Pine Cabin Remodel', code: 'pine-222bbb' }] };   // the client list is read, and Oak House is not on it
    _save(); await checkCrewLogs(); renderCrewFeed();
    _said.length = 0; _row(/Hill Supply/).querySelector('.cf-flush').click();
    const r = /⚙ In your grinder — off the card ✓ · 🧾 a receipt — its job has no client page, so it stays in your log/.test(_said.join(' | '));
    _portalIdx = null; return r;
  }), await page.evaluate(() => _said.join(' | ')));

  console.log('— 📤 bills that came in: send to their page —');
  ok('the receipt waits in 📥 BILLS THAT CAME IN on its job\'s estimates board, marked 📗 with the bookkeeper; the plate reads 📤 Send to their page and is NOT lit (Eric: "make is not lit up and put send to their page")', await page.evaluate(async () => {
    entries = []; pendingQueue = []; nextId = 300;
    _portalIdx = { clients: [{ key: 'oak', job: 'Oak House Custom Home', code: 'oak-111aaa' }] };
    const e = addEntry('Note', 'Phil: ' + READ, 'Oak House', { who: 'Phil', ai: READ, rcpt: true, category: 'Demo', tags: ['Bookkeeper'], bkBy: 'Phil', noSniff: true });
    window._eb = e;
    _dbxFiles[estPath('oak-111aaa')] = JSON.stringify({ updated: '', mk: 20, cats: [{ n: 'Demo', appr: false, bids: [] }] });
    _dbxFiles[portalRoot() + '/oak-111aaa.json'] = JSON.stringify({ name: 'Oak House' });
    _estIdx = -1; _estD = null; _estPage = null; window._qUpBusy = false; _estBillFold = null;
    await openEstimates(0);
    const b = document.querySelector('#revBox .est-bill-send'), t = $('revBox').textContent;
    return !!b && b.textContent.trim() === '📤 Send to their page' && !b.classList.contains('sel') && !/ONTO THEIR PAGE/.test(t) && /📗 with the bookkeeper/.test(t) && /Hill Supply/.test(t) && /BILLS THAT CAME IN — yours to approve first \(1\)/.test(t)
      && /📤 Send to their page = it shows on their page under RECEIPTS RECEIVED/.test(t);
  }), await page.evaluate(() => $('revBox').textContent.replace(/\s+/g, ' ').slice(0, 400)));
  ok('…and it does not wear the lit plate\'s colours: its background is not the accent the lit "+20% rides on top" plate beside it wears', await page.evaluate(() => {
    const b = document.querySelector('#revBox .est-bill-send'), lit = [...document.querySelectorAll('#revBox .pick-chip.sel')].find(x => /rides on top/.test(x.textContent));
    return !!b && !!lit && getComputedStyle(b).backgroundColor !== getComputedStyle(lit).backgroundColor;
  }));
  ok('one tap sends it: on their page under RECEIPTS RECEIVED with the markup folded in, the vendor nowhere in their file, the entry marked sent', await page.evaluate(async () => {
    $('estBillC-' + _eb.id).value = String(_estD.cats.findIndex(x => x.n === 'Demo'));
    document.querySelector('#revBox .est-bill-send').click();
    await new Promise(r => setTimeout(r, 300));
    const raw = _dbxFiles[portalRoot() + '/oak-111aaa.json'], pg = JSON.parse(raw);
    closeEstimates();
    return _eb.budg === 'sent' && pg.upcoming && pg.upcoming.tot === 57.84 && !/Hill Supply/.test(raw) && !/Bookkeeper|Phil/.test(raw);
  }), await page.evaluate(() => _dbxFiles[portalRoot() + '/oak-111aaa.json']));

  console.log('— 🎒 the pocket says the grinder too —');
  ok('the pocket\'s head plate reads ⚙ Grind all, a row\'s plate ⚙ Grind; an item sent on is stamped "🎒 To the grinder — …" (state still flushed inside), and the toasts say grinder', await page.evaluate(() => {
    entries = []; prefs.pocket = []; _said.length = 0;
    pocketAdd('order the trim'); pocketAdd('call the tile setter'); renderPocket();
    const head = document.querySelector('#pocketCard .pk-flush').textContent.trim(), rows = [...document.querySelectorAll('#pocketList .pk-row')].map(r => r.textContent.replace(/\s+/g, ' '));
    pocketFlushOne(pocket().find(x => x.t === 'order the trim').id);
    const one = entries[0].details === '🎒 To the grinder — order the trim' && entries[0].pocket === 'flushed';
    const n = pocketFlush(), all = n === 1 && entries[0].details === '🎒 To the grinder — call the tile setter';
    const none = pocketFlush() === 0;
    return head === '⚙ Grind all' && rows.length === 2 && rows.every(t => /⚙ Grind/.test(t) && /✓ Done/.test(t)) && one && all && none && /⚙ To the grinder — it is on the board and the summary now ✓/.test(_said.join(' | ')) && /🎒 Nothing to grind/.test(_said.join(' | '));
  }), await page.evaluate(() => _said.join(' | ')));
  ok('a note stamped the old way still reads right everywhere: the stamp comes off on the Summary and the board, the Summary says "sent to the grinder", the log row reads "To the grinder — …"', await page.evaluate(async () => {
    entries = [{ id: 900, ts: new Date(Date.now() - 3600e3), type: 'Note', details: '🎒 Flushed — pick up the long level', job: '—', tags: ['pocket'], pocket: 'flushed', noSniff: true }];
    const pw = pocketWords(entries[0]) === 'pick up the long level' && brdWords(entries[0].details) === 'pick up the long level' && pocketWords({ details: '🎒 To the grinder — x' }) === 'x';
    openReview('summary'); await new Promise(r => setTimeout(r, 60));
    const body = document.querySelector('.rev-sec-body[data-sec="pocket"]'), sum = !!body && /pick up the long level/.test(body.textContent) && /sent to the grinder ·/.test(body.textContent) && !/flushed/i.test(body.textContent);
    closeReview();
    prefs.rlFilter = 'pocket'; renderAskRecent();
    const log = $('askRecent').textContent.replace(/\s+/g, ' ');
    prefs.rlFilter = ''; renderAskRecent();
    return pw && sum && /To the grinder — pick up the long level/.test(log) && !/Flushed/.test(log);
  }), await page.evaluate(() => { prefs.rlFilter = 'pocket'; renderAskRecent(); const t = $('askRecent').textContent.replace(/\s+/g, ' ').slice(0, 200); prefs.rlFilter = ''; renderAskRecent(); return t; }));

  console.log('— 📗 the bookkeeper, by role —');
  ok('nowhere on his main page — text, titles, labels — does the app say "Logan" or "flush" (his own notes aside: there are none here)', await page.evaluate(w => { entries = []; renderAll(); renderPocket(); const t = eval(w); return !/logan/i.test(t) && !/flush/i.test(t); }, WORDS),
    await page.evaluate(w => JSON.stringify((eval(w).match(/.{40}(logan|flush).{40}/i) || [''])[0]), WORDS));
  ok('the crew-hours lights read GATHER · APPROVED · SENT · PAID, the third said in words "sent to the bookkeeper"; the bill card\'s plate is 📗 The bookkeeper pays it', await page.evaluate(() =>
    CH_LIGHTS.map(l => l[1]).join('·') === 'GATHER·APPROVED·SENT·PAID' && CH_LIGHTS[2][2] === 'sent to the bookkeeper'), await page.evaluate(() => JSON.stringify(CH_LIGHTS)));
  {
    // the app's own words in the source: comment lines and trailing notes set aside, the names of functions and settings set aside
    const code = src.replace(/<!--[\s\S]*?-->/g, '').replace(/\/\*[\s\S]*?\*\//g, '').split(/\r?\n/).filter(l => !/^\s*\/\//.test(l)).map(l => l.replace(/\s\/\/\s.*$/, '')).join('\n');
    const lg = code.replace(/loganMail|estBillToLogan|estPendLogan|toLogan|'logan'|S\.logan|Logan = bookkeeper/g, '');
    const hit = (lg.match(/.{0,60}logan.{0,60}/i) || [''])[0];
    ok('in the source too: every word the app SHOWS says "the bookkeeper" — "Logan" is left only in the names of functions and settings, and in the one line that tells the Wizard who Logan is', !/logan/i.test(lg), hit);
    const fl = (code.match(/.{0,40}(⤵\s*Flush|Flush to the grinder|flushed by you|flushed it|Nothing to flush|Nothing here to flush|Flush — |Flush these|flushed into).{0,40}/) || [''])[0];
    ok('…and no plate, toast or label says Flush', !fl, fl);
    ok('the Wizard still knows who Logan is (a question that names him must still work)', /Logan = bookkeeper/.test(src));
  }

  console.log('— 📅 the receipt read knows the date is month-first —');
  ok('the read is told these papers are American (month first), is given today\'s date to check itself against, and leaves a date empty rather than guess', /DATES on these papers are AMERICAN, MONTH FIRST/.test(src) && /never guess a date/.test(src) && /' Today is ' \+ localDay\(new Date\(\)\) \+ '\.'/.test(src));
  ok('a purchase "dated" in the future is a misread: no 📅 line is written for it; today\'s and yesterday\'s dates are kept', await page.evaluate(() => {
    const d = n => { const x = new Date(); x.setDate(x.getDate() + n); return localDay(x); };
    return !/📅/.test(receiptLines({ vendor: 'A', total: 5, rdate: d(40) })) && new RegExp('^📅 ' + d(0)).test(receiptLines({ vendor: 'A', total: 5, rdate: d(0) })) && new RegExp('^📅 ' + d(-1)).test(receiptLines({ vendor: 'A', total: 5, rdate: d(-1) }));
  }));
  await eric.ctx.close();

  console.log('— 👷 a crew phone: a receipt goes to Eric by itself —');
  const phil = await open(() => { try { localStorage.setItem('daylog-crew-name', 'Phil'); localStorage.setItem('daylog-crew-root', '/Phil'); localStorage.setItem('daylog-crew-jobs', JSON.stringify(['Oak House'])); localStorage.removeItem('daylog-shared-flushed'); } catch (e) {} });
  const pp = phil.page;
  await pp.evaluate(async () => {
    window.scheduleSave = () => {}; window.savePendingSoon = () => {}; window.dbxUpload = async () => ({}); window.dbxList = async () => ({ entries: [] }); window.publishSharedNotes = async () => {};
    const iso = n => new Date(Date.now() - n * 60000).toISOString();
    const body = JSON.stringify({ from: 'Eric', notes: [{ id: 9, ts: iso(300), text: 'bring the long level tomorrow', job: 'Oak House' }], seen: {}, asks: [], acks: {}, todos: [], unlocks: [], cards: {} });
    window.dbxDownload = async p => /\/shared\.json$/.test(p) ? body : null;
    dbx.refreshToken = 'tok'; entries = []; nextId = 50; prefs.tags = ['Framing crew']; prefs.crewFold = false; prefs.thSeen = {}; prefs.pocket = [];
    window._said = []; const t0 = window.toast; window.toast = (m, g) => { if (m) _said.push(String(m)); return t0(m, g); };
    Object.defineProperty(navigator, 'share', { value: d => { window._shared = d; return Promise.resolve(); }, configurable: true, writable: true });
    qnSel = new Set(); qnRcpt = false; qnCat = ''; visReset(); renderTagChips();
    window._gOpen = { 4: true }; updateStepFlow();
    await checkSharedNotes(); renderCrewShared();
    window._eric = () => !qnVis && qnVisNames.size === 1 && qnVisNames.has('Eric');
    window._chip = () => document.querySelector('#qnTagFixed .rcpt-chip');
  });
  ok('it is a crew phone resting on 📨 Just Eric; behind 🔒 Just me his own tags go dead — and the 🧾 Receipt chip alone stays live (not disabled, not dimmed, tappable)', await pp.evaluate(() => {
    const rest = CREW_NAME === 'Phil' && _eric();
    setVis('');
    const c = _chip(), own = [...document.querySelectorAll('#qnTagChips button')];
    return rest && document.body.classList.contains('crew-locked') && !!c && !c.disabled && getComputedStyle(c).pointerEvents !== 'none' && +getComputedStyle(c).opacity === 1
      && own.length >= 1 && own.every(b => b.disabled) && getComputedStyle($('qnTagChips')).pointerEvents === 'none';
  }), await pp.evaluate(() => JSON.stringify({ crew: CREW_NAME, locked: document.body.className, chip: !!_chip() && _chip().disabled })));
  ok('a tap on 🧾 Receipt behind 🔒 Just me: 📨 Just Eric lights by itself, the lock lets go, the toast says why, and the category window opens', await pp.evaluate(() => {
    _said.length = 0; _chip().click();
    const lit = document.querySelector('#qnVisChips [data-v="Eric"]');
    return qnRcpt === true && _eric() && !document.body.classList.contains('crew-locked') && !!lit && lit.classList.contains('sel') && /✓\s*📨 Just Eric/.test(lit.textContent)
      && /🧾 A receipt goes to Eric — 📨 Just Eric is lit/.test(_said.join(' | ')) && $('catModal').classList.contains('show');
  }), await pp.evaluate(() => JSON.stringify({ rc: qnRcpt, vis: qnVis, names: [...qnVisNames], said: _said })));
  ok('…he picks the category and SENDs: the note is a receipt FOR ERIC (not locked to the phone), with its category and the amount he typed', await pp.evaluate(() => {
    qnCatPick('Demo');
    const word = _chip().textContent.trim();
    $('askText').value = 'blades for the demo saw $48.20'; qnJobPick = 'Oak House'; saveQuickNote();
    const e = entries[0];
    return /^🧾 Demo — tap to change$/.test(word) && e.vis === 'Eric' && !e.mine && e.rcpt === true && e.category === 'Demo' && e.ai === '💵 $48.20' && e.job === 'Oak House' && _eric();
  }), await pp.evaluate(() => JSON.stringify(entries[0])));
  ok('from 🔓 All crew a receipt goes to Just Eric too (a receipt is not for every crew phone); already on Just Eric nothing moves and nothing is said', await pp.evaluate(() => {
    setVis('crew'); _said.length = 0; qnRcptToggle();
    const a = _eric() && /A receipt goes to Eric/.test(_said.join(' | '));
    catModalClose(); qnRcpt = false; qnCat = ''; renderTagChips();
    _said.length = 0; qnRcptToggle();
    const b = _eric() && !/A receipt goes to Eric/.test(_said.join(' | '));
    catModalClose(); qnRcpt = false; qnCat = ''; renderTagChips();
    return a && b;
  }));
  ok('a personal tag still wins: with it on, 🧾 Receipt does not unlock anything — the note stays on the phone', await pp.evaluate(() => {
    qnSel = new Set(['Personal']); renderVisChips();
    qnRcptToggle();
    const r = !qnVis && qnVisNames.size === 0 && qnRcpt === true;
    catModalClose(); qnRcpt = false; qnCat = ''; qnSel = new Set(); visReset(); renderTagChips();
    return r;
  }));
  ok('📗 To the bookkeeper behind 🔒 Just me: it no longer stays on the phone — the note goes to Eric wearing the Bookkeeper mark (the send sheet still opens)', await pp.evaluate(() => {
    setVis(''); window._shared = null;
    $('askText').value = 'receipt for the dump run $22'; qnJobPick = 'Oak House'; toBookkeeper();
    const e = entries[0];
    return /dump run/.test(e.details) && e.vis === 'Eric' && !e.mine && (e.tags || []).includes('Bookkeeper') && !!_shared && _shared.title === 'For the bookkeeper';
  }), await pp.evaluate(() => JSON.stringify(entries[0])));
  ok('the small print under ⑤ says it: 🧾 Receipt and 📗 To the bookkeeper light 📨 Just Eric by themselves', await pp.evaluate(() => /🧾 Receipt and 📗 To the bookkeeper light 📨 Just Eric by themselves\./.test($('visExplain').textContent)));
  ok('his WITH ERIC card and his pocket say the grinder: ⚙ To the grinder on Eric\'s note (then ⚙ in your grinder ✓, with ↩ Undo), ⚙ Grind all / ⚙ Grind on the pocket — and no "flush" anywhere on his page', await pp.evaluate(async w => {
    const row = [...document.querySelectorAll('#crewSharedList .sum-row')].find(r => /long level/.test(r.textContent));
    const plate = row.querySelector('.th-flush').textContent.trim();
    _said.length = 0; row.querySelector('.th-flush').click(); await new Promise(r => setTimeout(r, 60));
    const after = $('crewSharedList').textContent, toastW = $('toast').textContent;
    pocketAdd('caulk for the tub'); renderPocket();
    const pk = document.querySelector('#pocketCard .pk-flush').textContent.trim() + ' | ' + $('pocketList').textContent.replace(/\s+/g, ' ');
    window._dbg = { plate, after: after.replace(/\s+/g, ' ').slice(0, 160), toastW, pk, copies: entries.filter(e => e.sharedRef != null).length };
    // a plain note leaves the card on my own "to the grinder" (the card hides and its list is emptied); the copy is in my log
    return plate === '⚙ To the grinder' && !/long level/.test(after) && getComputedStyle($('crewSharedCard')).display === 'none' && entries.some(e => e.sharedRef === 9 && /^Eric: bring the long level/.test(e.details))
      && /^⚙ In your grinder ✓ — Eric sees you took it/.test(toastW) && !!$('toast').querySelector('button')
      && /^⚙ Grind all \|/.test(pk) && /⚙ Grind/.test(pk.split('|')[1]) && !/flush/i.test(eval(w));
  }, WORDS), await pp.evaluate(w => JSON.stringify({ dbg: window._dbg, m: (eval(w).match(/.{30}flush.{30}/i) || [''])[0] }), WORDS));
  await phil.ctx.close();

  ok('version bumped — APP_VER and the footer agree', /const APP_VER = 'v7\.(7[7-9]|[89]\d)'/.test(src) && new RegExp('<footer>' + (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1].replace('.', '\\.') + ' ·').test(src));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
