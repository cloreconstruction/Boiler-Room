// 📧💳 v6.67 — CAPTURE EVERYTHING, THE DOUBLE CHECK, AND THE BILL CARD. Eric: "maybe we just
// capture all of them and the ones that are junk will just never be used" · "how do i know im not
// missing important emails? wheres the double check?" · "i like always keep and then later it
// shows up and i have to push seen" · "i read pay this bill $30.3 and i think: i have no idea what
// this is for … logan pays most of them or they are on auto pay."
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
  // ---- the harness: a fake Inbox in Dropbox, a fake judge, a fake lock screen (same as _test641) ----
  await page.evaluate(() => {
    jobs = ['Mery', 'Hertz']; curJob = 'Mery'; crew = []; entries = []; todos = []; nextId = 1; pendingQueue = [];
    prefs.tagScrub1 = true; prefs.tagScrub2 = true; prefs.mailAsk = []; prefs.mailOk = []; prefs.mailNo = []; prefs.mailLoud = []; prefs.mailHush = []; prefs.mailPersonal = []; prefs.mailIgnored = []; delete prefs.mailSort; delete prefs.billAuto;
    renderJobSelects(); closePanels(); renderAll();
    window._dbxFiles = {}; window._inbox = []; window._moves = []; window._aiCalls = []; window._notify = [];
    window.dbxRpc = async (ep, args) => {
      if (ep === 'files/list_folder') return { entries: window._inbox.map(f => ({ '.tag': 'file', name: f.name, path_lower: '/clore daylog/inbox/' + f.name.toLowerCase(), server_modified: f.ts || new Date().toISOString() })) };
      if (ep === 'files/move_v2') { window._moves.push(args); return { metadata: { path_lower: String(args.to_path).toLowerCase() } }; }
      return {};
    };
    window.dbxDownload = async p => { const f = window._inbox.find(f => '/clore daylog/inbox/' + f.name.toLowerCase() === p); if (f) return f.txt; return (window._dbxFiles || {})[p] ?? null; };
    window.dbxUpload = async (p, body) => { (window._dbxFiles || {})[p] = body; return {}; };
    window.scheduleSave = () => {}; window.savePendingSoon = () => {};
    const realFetch = window.fetch; window.fetch = (u, o) => { if (String(u).includes('/notify')) { window._notify.push(o); return Promise.resolve({ ok: true }); } return realFetch(u, o); };
    dbx.refreshToken = 'test-token';
    lsSet('daylog-aikey', 'test-key');
    window._verdict = { bucket: 'maybe', why: 'other', gist: '' };
    window.aiCall = async (body, kind) => { window._aiCalls.push({ body, kind }); const v = typeof window._verdict === 'function' ? window._verdict() : window._verdict;
      return { r: { ok: true, json: async () => ({ content: [{ text: typeof v === 'string' ? v : JSON.stringify(v) }] }) }, model: 'claude-haiku-4-5', fell: false }; };
    window.T = {
      mail: (name, from, subj, body, ts) => ({ name, txt: `FROM: ${from}\nSUBJECT: ${subj}\n\n${body}`, ts: ts || new Date().toISOString() }),
      sweep: async files => { window._inbox = files; await checkInboxTexts(); },
      cards: () => pendingQueue.filter(p => p.kind === 'mail'),
      reset: () => { entries = []; nextId = 1; pendingQueue = []; window._aiCalls = []; window._moves = []; window._notify = []; prefs.mailAsk = []; prefs.mailIgnored = []; _mcFold = ''; }
    };
  });
  const card = () => page.evaluate(() => { renderMailAsk(); return $('mailAskCard').textContent; });

  console.log('— 📥 v6.67 capture everything —');

  ok('a brand-new sender + maybe → on the log at once, no question, no card', await page.evaluate(async () => {
    T.reset(); window._verdict = { bucket: 'maybe', why: 'receipt', gist: 'Your order shipped.' };
    await T.sweep([T.mail('Email -order.txt', 'Kenai Supply <orders@kenaisupply.com>', 'order shipped', 'Your order 1234 has shipped.')]);
    const e = entries[0];
    return !!e && e.mail && e.mailBucket === 'maybe' && !mailAsk().length && !T.cards().length && !mailOk().length;
  }));

  ok('a brand-new sender + important → on the log AND a card, the KNOWN kind, ✓ Got it clears it', await page.evaluate(async () => {
    T.reset(); window._verdict = { bucket: 'important', why: 'invoice', gist: 'Invoice for the rough-in.' };
    await T.sweep([T.mail('Email -inv.txt', 'Bob Ashman <bob@ashmanplumbing.com>', 'Invoice 4471', 'Please find the invoice attached. Due in 30 days.')]);
    renderReview();
    const c = T.cards()[0];
    const good = !!c && c.payload.known === true && !!c.payload.entryId && entries.length === 1 && /✓ Got it/.test($('revBox').textContent) && !/Always \+ log it/.test($('revBox').textContent);
    reviewAct(String(c.id), 'log');
    return good && !T.cards().length && entries.length === 1;
  }));

  ok('a brand-new sender + ignore → on the log with its word and in the skipped list; the log filter and the Wizard can still find it', await page.evaluate(async () => {
    T.reset(); window._verdict = { bucket: 'ignore', why: 'newsletter', gist: 'Weekend deals.' };
    await T.sweep([T.mail('Email -deals.txt', 'Lowes <news@lowes.com>', 'weekend deals', 'Save on lumber this weekend.')]);
    const e = entries[0];
    return !!e && e.mailBucket === 'ignore' && mailIgnored().length === 1 && mailIgnored()[0].known === true && !T.cards().length;
  }));

  ok('🚫 NEVER and 🔒 PERSONAL still win — a Never sender is never logged, a personal one is locked', await page.evaluate(async () => {
    T.reset(); prefs.mailNo = ['deals@junkmail.com']; prefs.mailPersonal = ['private@example.com']; window._verdict = { bucket: 'important', why: 'money', gist: 'x' };
    await T.sweep([T.mail('Email -junk.txt', 'Junk <deals@junkmail.com>', 'junk', 'Free money!'), T.mail('Email -hi.txt', 'Somebody <private@example.com>', 'hi', 'personal note')]);
    const good = entries.length === 1 && entries[0].personal === true && !T.cards().length && mailIgnored().length === 1 && mailIgnored()[0].by === 'list';
    prefs.mailNo = []; prefs.mailPersonal = []; return good;
  }));

  ok('✓ Always from Setup files what was waiting as SEEN — it never comes back asking (item 1)', await page.evaluate(() => {
    T.reset();
    prefs.mailAsk = [{ a: 'sub@example.com', s: 'quote', w: 'A Sub', b: 'Here is the quote you asked for.', ts: new Date().toISOString(), bucket: 'maybe', why: 'other', by: 'phone' }];
    $('mailAddInput') || document.body.insertAdjacentHTML('beforeend', '<input id="mailAddInput">');
    $('mailAddInput').value = 'sub@example.com';
    mailListAdd(true);
    const e = entries.find(x => x.mailAddr === 'sub@example.com');
    return !!e && e.mailSeen === true && !mailAsk().length && mailOk().includes('sub@example.com');
  }));

  ok('leftover "keep them or not?" rows file themselves on the next sweep, as seen; a row with no words is dropped', await page.evaluate(async () => {
    T.reset();
    prefs.mailAsk = [{ a: 'x@y.com', s: 'old one', w: 'X', b: 'old body', ts: new Date().toISOString() }, { a: 'nowords@y.com', s: 'no body kept' }];
    await T.sweep([]);
    const e = entries.find(x => x.mailAddr === 'x@y.com');
    return !!e && e.mailSeen === true && !mailAsk().length && entries.length === 1;
  }));

  console.log('— 🔎 v6.67 the double check —');

  ok('the card counts the week in words: important · maybe · skipped', await (async () => {
    await page.evaluate(async () => {
      T.reset();
      window._verdict = { bucket: 'important', why: 'invoice', gist: 'a bill' };
      await T.sweep([T.mail('Email -a.txt', 'A <a@sub.com>', 'invoice 1', 'Invoice attached, $1,200 due Oct 1.')]);
      window._verdict = { bucket: 'maybe', why: 'other', gist: 'hm' };
      await T.sweep([T.mail('Email -b.txt', 'B <b@sub.com>', 'hello', 'just checking in')]);
      window._verdict = { bucket: 'ignore', why: 'newsletter', gist: 'promo' };
      await T.sweep([T.mail('Email -c.txt', 'C <news@bigbox.com>', 'sale', 'Save $5 on paint this weekend')]);
    });
    const t = await card();
    return /this week: 1 important · 1 maybe · 1 skipped/.test(t);
  })());

  ok('a skipped email that mentions money from a real sender is LISTED, with the words it saw; a $5 flyer from a bulk address is not', await page.evaluate(async () => {
    window._verdict = { bucket: 'ignore', why: 'other', gist: 'looked like a flyer' };
    await T.sweep([T.mail('Email -d.txt', 'Vendor <vendor@x.com>', 'flyer', 'Actually this is a bill for $300 due next week.')]);
    renderMailAsk();
    const t = $('mailAskCard').textContent;
    return /DOUBLE CHECK — 1 skipped this week mentions money, a date or a job/.test(t) && /vendor@x\.com/.test(t) && /saw "\$300"/.test(t) && !/news@bigbox\.com/.test(t.split('DOUBLE CHECK')[1] || '');
  }));

  ok('a skipped email that names one of his JOBS is listed too, and says which job', await page.evaluate(async () => {
    await T.sweep([T.mail('Email -e.txt', 'Neighbor <pat@example.com>', 'the Hertz driveway', 'The truck blocked the Hertz driveway again this morning.')]);
    renderMailAsk();
    const t = $('mailAskCard').textContent;
    return /DOUBLE CHECK — 2 skipped/.test(t) && /the job name "Hertz"/.test(t);
  }));

  ok('✓ Fine waves one off — it stays in the skipped list but leaves the check; ↩ Rescue puts the other on the log as a maybe', await page.evaluate(() => {
    const before = mailIgnored().length;
    const hertz = mailIgnored().findIndex(r => /Hertz/.test(r.s || ''));
    mailCheckOk(hertz);
    const t1 = $('mailAskCard').textContent;
    const a = /DOUBLE CHECK — 1 skipped/.test(t1) && !/the job name "Hertz"/.test(t1) && mailIgnored().length === before;
    const vendor = mailIgnored().findIndex(r => /flyer/.test(r.s || ''));
    mailRescue(vendor);
    const e = entries.find(x => x.mailAddr === 'vendor@x.com');
    return a && !!e && e.mailBucket === 'maybe' && e.mailRescued === true && mailIgnored().length === before - 1 && /nothing skipped this week mentions money, a date or a job name\. ✓/.test($('mailAskCard').textContent);
  }));

  ok('the check ALWAYS speaks — with nothing flagged it says so, so silence never has to be trusted', await page.evaluate(async () => {
    T.reset(); window._verdict = { bucket: 'ignore', why: 'newsletter', gist: 'promo' };
    await T.sweep([T.mail('Email -f.txt', 'Shop <noreply@shop.com>', 'new arrivals', 'Fresh styles for fall')]);
    renderMailAsk();
    return /🔎 Double check: nothing skipped this week mentions money, a date or a job name\. ✓/.test($('mailAskCard').textContent);
  }));

  ok('? MAYBE is a list to read, not a chore: no ✓ Seen anywhere on the card', await page.evaluate(async () => {
    window._verdict = { bucket: 'maybe', why: 'question', gist: 'asks about stain' };
    await T.sweep([T.mail('Email -g.txt', 'Dale <dale@rininger.com>', 'stain', 'Can we go darker?')]);
    _mcFold = 'maybe'; renderMailAsk();
    const t = $('mailAskCard').textContent;
    return /on your log already/.test(t) && /asks about stain/.test(t) && !/✓ Seen/.test(t) && !/Seen all/.test(t);
  }));

  console.log('— 💳 v6.67 the bill card —');

  const seedBill = () => page.evaluate(() => { pendingQueue = []; pendDone.clear && pendDone.clear(); delete prefs.billAuto; window._notify = []; todos = []; curJob = 'Mery'; });
  const F = name => ({ name });

  ok('a PAID receipt with a date printed on it is NOT a bill — no card', await page.evaluate(async () => {
    pendingQueue = []; window._notify = []; curJob = 'Mery';
    billMaybeSuggest({ name: 'IMG_0001.jpg' }, { ai: '📅 2026-09-10\n🏪 Home Depot\n💵 $30.30', ocr: 'HOME DEPOT ... THANK YOU FOR YOUR PURCHASE ... 10/10/2026 ... APPROVED', aiTotal: 30.3, aiDue: '2026-10-10' });
    return !pendingQueue.length && !window._notify.length;
  }));

  ok('an INVOICE with a due date becomes a 💳 card: the vendor, the amount to the cent, the date, what the read saw', await page.evaluate(async () => {
    pendingQueue = []; window._notify = []; curJob = 'Mery';
    billMaybeSuggest({ name: 'IMG_0002.jpg' }, { ai: '📅 2026-09-10\n🏪 Peninsula Overhead Doors\n💵 $3,290\n🗓 DUE 2026-10-10', ocr: 'INVOICE 8812 ... Balance due $3,290.00 ... Due 10/10/2026', aiTotal: 3290, aiDue: '2026-10-10' });
    const p = pendingQueue[0];
    renderReview();
    const t = $('revBox').textContent;
    window._bill = p;
    return !!p && p.kind === 'bill' && p.payload.who === 'Peninsula Overhead Doors' && p.payload.amt === 3290 && p.payload.due === '2026-10-10' && p.payload.job === 'Mery' && p.payload.fname === 'IMG_0002.jpg' &&
      /Bill spotted — who pays it\?/.test(t) && /\$3,290\.00 · due 2026-10-10/.test(t) && /from Peninsula Overhead Doors/.test(t) && /🏪 Peninsula Overhead Doors/.test(t) &&
      /📗 Logan pays it/.test(t) && /🔁 Autopay — never ask about Peninsula Overhead Doo/.test(t) && /✓ I'll pay it — remind me/.test(t) && /✕ Not a bill/.test(t) && !/ADD IT/.test(t);
  }));

  ok('the job wheel on the card starts where the wheel was when he took the photo — his own pick, pre-lit', await page.evaluate(() =>
    $(revJobId(_bill.id)).value === 'Mery'));

  ok('the push says only that a bill is waiting — no amount, no vendor', await page.evaluate(() => {
    prefs.pushSecret = 's'; pendingQueue = []; window._notify = [];
    billMaybeSuggest({ name: 'IMG_0003.jpg' }, { ai: '🏪 Enstar\n💵 $412.55\n🗓 DUE 2026-10-02', ocr: 'Amount due $412.55 Due date 10/02/2026', aiTotal: 412.55, aiDue: '2026-10-02' });
    delete prefs.pushSecret;
    const b = JSON.parse((window._notify[0] || {}).body || '{}');
    return window._notify.length === 1 && !/\$|\d{3}|Enstar/.test(b.body || '') && /bill/i.test(b.body || '');
  }));

  ok('$30.3 reads $30.30', await page.evaluate(() => {
    pendingQueue = [];
    billMaybeSuggest({ name: 'IMG_0004.jpg' }, { ai: '🏪 Laun Pant\n💵 $30.3\n🗓 DUE 2026-10-10', ocr: 'balance due 30.3 due 10/10/2026', aiTotal: 30.3, aiDue: '2026-10-10' });
    renderReview();
    return /\$30\.30 · due 2026-10-10/.test($('revBox').textContent) && pendingQueue[0].payload.amt === 30.3;   // the amount line is to the cent; the raw read below it stays as the photo said
  }));

  ok('✓ I\'ll pay it → a to-do with the date, on the job the wheel says', await page.evaluate(() => {
    pendingQueue = []; todos = [];
    billMaybeSuggest({ name: 'IMG_0005.jpg' }, { ai: '🏪 Enstar\n💵 $412.55\n🗓 DUE 2026-10-02', ocr: 'Amount due $412.55', aiTotal: 412.55, aiDue: '2026-10-02' });
    const p = pendingQueue[0]; renderReview();
    $(revJobId(p.id)).value = 'Hertz'; qbJobPick(String(p.id), 'Hertz');
    reviewAct(String(p.id), 'pay');
    const t = todos[0];
    return !!t && /Pay Enstar — \$412\.55/.test(t.text) && t.due === '2026-10-02' && t.job === 'Hertz' && !pendingQueue.length;
  }));

  ok('🔁 Autopay → that exact vendor never asks again; another vendor still does', await page.evaluate(() => {
    pendingQueue = [];
    billMaybeSuggest({ name: 'IMG_0006.jpg' }, { ai: '🏪 Enstar\n💵 $400\n🗓 DUE 2026-11-02', ocr: 'Amount due', aiTotal: 400, aiDue: '2026-11-02' });
    const p = pendingQueue[0]; renderReview();
    reviewAct(String(p.id), 'auto');
    const learned = !!(prefs.billAuto || {}).enstar && !pendingQueue.length;
    billMaybeSuggest({ name: 'IMG_0007.jpg' }, { ai: '🏪 Enstar\n💵 $410\n🗓 DUE 2026-12-02', ocr: 'Amount due', aiTotal: 410, aiDue: '2026-12-02' });
    const quiet = !pendingQueue.length;
    billMaybeSuggest({ name: 'IMG_0008.jpg' }, { ai: '🏪 HEA\n💵 $210\n🗓 DUE 2026-12-02', ocr: 'Amount due', aiTotal: 210, aiDue: '2026-12-02' });
    return learned && quiet && pendingQueue.length === 1 && pendingQueue[0].payload.who === 'HEA';
  }));

  ok('📗 Logan pays it → the photo\'s entry wears the Bookkeeper tag, the mark the receipts window reads', await page.evaluate(() => {
    pendingQueue = [];
    const e = addEntry('Note', 'HEA bill', 'Mery', { noSniff: true, photoPath: '/Clore DayLog/Job Notes/Mery/2026-09-12 IMG_0009.jpg' });
    billMaybeSuggest({ name: 'IMG_0009.jpg' }, { ai: '🏪 HEA\n💵 $210\n🗓 DUE 2026-12-05', ocr: 'Amount due', aiTotal: 210, aiDue: '2026-12-05' });
    const p = pendingQueue[0]; renderReview();
    const shows = /📷 Look at it/.test($('revBox').textContent);
    reviewAct(String(p.id), 'logan');
    return shows && (e.tags || []).includes('Bookkeeper') && !pendingQueue.length && /Logan pays it/.test($('toast').textContent);
  }));

  ok('✕ Not a bill → the card goes, nothing is learned, nothing is added', await page.evaluate(() => {
    pendingQueue = []; const nT = todos.length;
    billMaybeSuggest({ name: 'IMG_0010.jpg' }, { ai: '🏪 Somebody\n💵 $99\n🗓 DUE 2026-12-09', ocr: 'Amount due', aiTotal: 99, aiDue: '2026-12-09' });
    const p = pendingQueue[0]; renderReview();
    reviewAct(String(p.id), false);
    return !pendingQueue.length && todos.length === nT && !(prefs.billAuto || {}).somebody;
  }));

  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v6.67') && document.querySelector('footer').textContent.includes(APP_VER);
  }));

  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
