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
    jobs = ['Mery']; curJob = 'Mery'; crew = []; entries = []; todos = []; nextId = 1;
    prefs.tagScrub1 = true; prefs.tagScrub2 = true;
    prefs.mailAsk = []; prefs.mailOk = []; prefs.mailNo = [];
    renderJobSelects(); closePanels(); renderAll();
    window._dbxFiles = {};
    window.dbxDownload = async path => (window._dbxFiles || {})[path] ?? null;
    window.dbxUpload = async (path, body) => { (window._dbxFiles || {})[path] = body; return {}; };
    window.dbxPathExists = async path => Object.prototype.hasOwnProperty.call(window._dbxFiles || {}, path);
    window.scheduleSave = () => {};
    dbx.refreshToken = dbx.refreshToken || 'test-token';
    _portalIdx = { clients: [{ key: 'mery', job: 'Mery Addition & Remodel', code: 'mery-224374' }] };
  });

  // 📧 v6.38 — Eric: "now where are these email showing up on the app?" Nowhere: the
  // NEW EMAIL SENDERS card lived inside the crew-only block, hidden on his phone.
  console.log('— 📧 v6.38 the new-sender card is on Eric\'s screen; a missing portal index no longer crashes —');

  // the exact file the Zap wrote on 2026-09-06 (raw bytes, CRLF and all)
  const RAW = 'FROM: Eric Clore<cloreeric@gmail.com>\nSUBJECT:test from cloreeric@gmail.com to the boiler room\n\ntesting body of email\r\n\n';

  ok('the Zap\'s file parses: who, address, subject, body', await page.evaluate(raw => {
    const m = mailParse(raw); window._m = m;
    return m.who === 'Eric Clore' && m.addr === 'cloreeric@gmail.com' && m.subj === 'test from cloreeric@gmail.com to the boiler room' && m.body === 'testing body of email';
  }, RAW));

  // 📥 v6.67 — capture everything: nobody is asked "keep them or not?" any more. A row left over
  // from before files itself onto the log, already seen; the oldest rows carried no words and drop.
  ok('v6.67: a leftover "keep them or not?" row files itself onto the log as seen — nobody is asked', await page.evaluate(() => {
    mailAsk().push({ a: _m.addr, s: _m.subj, w: _m.who, b: _m.body, ts: '2026-09-07T02:43:19Z' });
    mailAsk().push({ a: 'old@nowords.com', s: 'no words kept' });
    const n = mailFileLegacyAsks();
    renderMailAsk();
    const e = entries.find(x => x.mailAddr === _m.addr);
    return n === 1 && !mailAsk().length && !!e && e.mailSeen === true && e.mailBucket === 'maybe' && !/NEW EMAIL SENDERS/.test($('mailAskCard').textContent);
  }));

  ok('the card is no longer inside the crew-only block', await page.evaluate(() => !$('mailAskCard').closest('#crewRoute')));

  ok('a crew phone never sees it — the render still gates on CREW_NAME (it is Eric\'s decision, not theirs)', await page.evaluate(() =>
    /if \(CREW_NAME\)/.test(renderMailAsk.toString()) && CREW_NAME === ''));   // v6.41 — the card gates on CREW_NAME first thing

  ok('✓ Always (Setup) still keeps the sender, and the toast says so in words', await page.evaluate(() => {
    mailSay('cloreeric@gmail.com', true);
    return mailOk().includes('cloreeric@gmail.com') && !mailAsk().length && /kept from now on/.test($('toast').textContent);
  }));

  ok('a kept sender\'s email files onto the running log as a 📧 note', await page.evaluate(() => {
    autoLogMail(_m, '2026-09-07T02:43:19Z');
    const e = entries[0];
    clearLogFilters(); renderLog();
    return e && e.mail === true && /^Email from Eric Clore: test from cloreeric@gmail.com to the boiler room — testing body of email$/.test(e.details) && e.job === '—' && (e.tags || []).includes('Eric Clore') && $('askRecent').innerHTML.includes('📧');
  }));

  ok('🚫 Never blocks that address; "everyone @domain" blocks the whole domain', await page.evaluate(() => {
    mailAsk().push({ a: 'deals@junkmail.com', s: 'sale' }); mailSay('deals@junkmail.com', false);
    mailAsk().push({ a: 'a@spammy.co', s: 'x' }); mailSayDom('a@spammy.co', false);
    return mailListed(mailNo(), 'deals@junkmail.com') && mailListed(mailNo(), 'b@spammy.co') && !mailListed(mailNo(), 'cloreeric@gmail.com') && !mailAsk().length;
  }));
  // 🏠 v6.65 — the list lives in the portal's own window now, not in Setup: open it once for the checks below
  await page.evaluate(async () => { openPortalWin(); await renderPortalList(); });

  ok('a MISSING client index no longer crashes the portal list — the list he has stays ON SCREEN', await page.evaluate(async () => {
    delete window._dbxFiles[portalRoot() + '/index.json'];
    _portalOpen = 0;
    await renderPortalList();
    const t = $('portalList').textContent;
    return !!_portalIdx && Array.isArray(_portalIdx.clients) && _portalIdx.clients.length === 1 && /Mery Addition/.test(t) && /Receipts to approve/.test(t) && !/No portal set up yet/.test(t);
  }));

  ok('an index that reads "null" (a bad read, a 429) is treated the same way — nothing wiped', await page.evaluate(async () => {
    window._dbxFiles[portalRoot() + '/index.json'] = 'null';
    await renderPortalList();
    const t = $('portalList').textContent;
    return !!_portalIdx && _portalIdx.clients.length === 1 && /Mery Addition/.test(t) && !/No portal set up yet/.test(t);
  }));

  ok('an EMPTY index file (0 bytes) or a half-written one keeps the cached list too — nothing wiped, no crash', await page.evaluate(async () => {
    window._dbxFiles[portalRoot() + '/index.json'] = '';
    await renderPortalList();
    const a = /Mery Addition/.test($('portalList').textContent) && !/No portal set up yet/.test($('portalList').textContent);
    window._dbxFiles[portalRoot() + '/index.json'] = '{"clients":[{';
    await renderPortalList();
    const b = /Mery Addition/.test($('portalList').textContent) && !/No portal set up yet/.test($('portalList').textContent);
    return a && b && !!_portalIdx && _portalIdx.clients.length === 1;
  }));

  ok('with NOTHING cached and no index, it says "No portal set up yet" in words — no crash', await page.evaluate(async () => {
    const keep = _portalIdx; _portalIdx = null;
    delete window._dbxFiles[portalRoot() + '/index.json'];
    await renderPortalList();
    const good = _portalIdx === null && /No portal set up yet/.test($('portalList').textContent);
    _portalIdx = keep;
    return good;
  }));

  // — the three flow findings the pre-ship review confirmed —
  ok('HOURS are never overhead by category name — an Office/Admin shift with the toggle left ON stays billable in Logan\'s CSV', await page.evaluate(() => {
    entries = []; nextId = 1;
    const h = addEntry('Clock', '8:00 → 16:00', 'Mery', { hours: 8, category: 'Office/Admin' });
    const hNo = addEntry('Clock', '8:00 → 12:00', 'Mery', { hours: 4, category: 'Fuel', billable: false });
    const r = addEntry('Note', 'new blade $40', 'Mery', { rcpt: true, category: 'Tools' });
    const csvH = csvString([h]), csvNo = csvString([hNo]);
    return !isOverheadEntry(h) && isOverheadEntry(hNo) === false && !/"no"/.test(csvH) && /"no"/.test(csvNo) && isOverheadEntry(r);
  }));

  ok('a receipt SENT before v6.35 under Fuel is still SENT — on their list with its lights, not "overhead, never billed"', await page.evaluate(() => {
    entries = []; nextId = 1;
    const old = addEntry('Note', 'fuel for the pump', 'Mery', { rcpt: true, category: 'Fuel' }); old.ai = '💵 $180.00 🏪 Tesoro'; old.budg = 'sent';
    const fresh = addEntry('Note', 'fuel for the truck', 'Mery', { rcpt: true, category: 'Fuel', billable: false }); fresh.ai = '💵 $60.00 🏪 Tesoro';
    _estD = { mk: 20, cats: [], cleared: [] };
    const sentIds = rcptSent('Mery').map(e => e.id), ovhIds = rcptOverhead('Mery').map(e => e.id);
    const good = sentIds.includes(old.id) && !ovhIds.includes(old.id) && ovhIds.includes(fresh.id) && !sentIds.includes(fresh.id) &&
      /ON THE LIST/.test(rcptLampHtml(old)) && /OVERHEAD/.test(rcptLampHtml(fresh));
    _estD = null;
    return good;
  }));

  ok('a real index still renders the job list', await page.evaluate(async () => {
    window._dbxFiles[portalRoot() + '/index.json'] = JSON.stringify({ clients: [{ key: 'mery', job: 'Mery Addition & Remodel', code: 'mery-224374' }] });
    _portalOpen = 0;
    await renderPortalList();
    return /Mery Addition/.test($('portalList').textContent) && /Receipts to approve/.test($('portalList').textContent);
  }));
  await page.evaluate(() => closePortalWin());

  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v6.38') && document.querySelector('footer').textContent.includes(APP_VER);
  }));

  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
