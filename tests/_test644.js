// 📮 v6.44 — THE HANDSHAKE. v6.43 built a watcher that fails closed with no mail-rules.json,
// and then only wrote that file when Eric happened to open ⚙ → 📧 Email senders. So the whole
// cloud half could sit dead forever and never say why. Now every app open hands the cloud his
// rules. This suite is the handshake: the phone writes exactly what the watcher reads.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { fileURLToPath } = require('url');
(async () => {
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };
  const appUrl = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const repo = path.dirname(fileURLToPath(appUrl));
  const src = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
  const fn = fs.readFileSync(path.join(repo, 'fnsrc', 'mail-watch.mjs'), 'utf8');

  console.log('— 📮 v6.44 the handshake: the phone tells the cloud his rules —');

  // ── the gap that made this build: the only writer was a Setup card nobody has to open ──
  ok('the sweep publishes the rules, not just the Setup card', (() => {
    const start = src.indexOf('async function checkInboxTexts(');
    if (start < 0) return false;
    let i = src.indexOf('{', start), d = 0, end = -1;
    for (; i < src.length; i++) { if (src[i] === '{') d++; else if (src[i] === '}') { d--; if (!d) { end = i; break; } } }
    return end > 0 && src.slice(start, end).includes('publishMailRules()');
  })());

  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
  await page.goto(appUrl); await page.waitForTimeout(700);

  const RULES = '/App Data/mail-rules.json';
  await page.evaluate(() => {
    jobs = ['Mery']; curJob = 'Mery'; crew = []; entries = []; todos = []; nextId = 1; pendingQueue = [];
    prefs.mailOk = ['bob@sub.com']; prefs.mailNo = ['spam@junk.com']; prefs.mailAsk = [];
    prefs.mailLoud = ['boss@loud.com']; prefs.mailHush = ['noisy@vendor.com']; prefs.mailPersonal = ['her@home.com'];
    prefs.mailIgnored = [];
    renderJobSelects(); closePanels(); renderAll();
    window._dbxFiles = {}; window._inbox = []; window._ups = [];
    window.dbxRpc = async (ep) => ep === 'files/list_folder'
      ? { entries: window._inbox.map(f => ({ '.tag': 'file', name: f.name, path_lower: '/clore daylog/inbox/' + f.name.toLowerCase(), server_modified: '2026-09-07T15:00:00Z' })) }
      : { metadata: {} };
    window.dbxDownload = async p => { const f = window._inbox.find(f => '/clore daylog/inbox/' + f.name.toLowerCase() === p); return f ? f.txt : ((window._dbxFiles || {})[p] ?? null); };
    window.dbxUpload = async (p, b) => { window._dbxFiles[p] = b; window._ups.push(p); return {}; };
    window.scheduleSave = () => {}; window.savePendingSoon = () => {};
    dbx.refreshToken = 'tok';
  });

  ok('a phone that has NEVER opened the Setup card still publishes his rules', await page.evaluate(async (RULES) => {
    _mailRulesLast = '';
    window._ups = [];
    await checkInboxTexts();
    return window._ups.filter(p => p.endsWith(RULES)).length === 1;
  }, RULES));

  // ── the handshake itself: every field the watcher reaches for is a field the phone wrote ──
  const wants = [...new Set((fn.match(/rules\.[a-zA-Z]+/g) || []).map(s => s.slice(6)))].filter(k => k !== 'json');
  const wrote = await page.evaluate((RULES) => JSON.parse(window._dbxFiles[DBX_ROOT + RULES] || '{}'), RULES);
  for (const k of wants) {
    ok(`the watcher reads rules.${k} — and the phone writes it`, Object.prototype.hasOwnProperty.call(wrote, k), JSON.stringify(Object.keys(wrote)));
  }

  ok('his five lists ride across intact', JSON.stringify([wrote.ok, wrote.no, wrote.loud, wrote.hush, wrote.personal]) ===
    JSON.stringify([['bob@sub.com'], ['spam@junk.com'], ['boss@loud.com'], ['noisy@vendor.com'], ['her@home.com']]),
    JSON.stringify(wrote));

  ok('sorting is ON by default and quiet hours are 8pm–7am, the same defaults the watcher assumes',
    wrote.sort === true && wrote.quiet && wrote.quiet.from === '20:00' && wrote.quiet.to === '07:00' &&
    /'20:00'/.test(fn) && /'07:00'/.test(fn), JSON.stringify(wrote.quiet));

  ok('the rules file carries lists and nothing else — no entries, no email words, no wages', (() => {
    const keys = Object.keys(wrote).sort().join(',');
    const body = JSON.stringify(wrote);
    return keys === 'at,hush,loud,no,ok,personal,personalNames,quiet,sort,v' &&
      !/entries|details|rate|wage|amount|body/i.test(body);
  })(), Object.keys(wrote).join(','));

  ok('a second sweep in the same session does NOT re-upload the same rules', await page.evaluate(async (RULES) => {
    window._ups = [];
    await checkInboxTexts(); await checkInboxTexts();
    return window._ups.filter(p => p.endsWith(RULES)).length === 0;
  }, RULES));

  ok('changing a list DOES republish it — the cloud never runs on stale rules', await page.evaluate(async (RULES) => {
    window._ups = [];
    prefs.mailNo.push('newspam@junk.com');
    await checkInboxTexts();
    const out = JSON.parse(window._dbxFiles[DBX_ROOT + RULES] || '{}');
    return window._ups.filter(p => p.endsWith(RULES)).length === 1 && out.no.includes('newspam@junk.com');
  }, RULES));

  ok('turning sorting off says so in the file, and the watcher idles on it', await page.evaluate(async (RULES) => {
    prefs.mailSort = false;
    await checkInboxTexts();
    return JSON.parse(window._dbxFiles[DBX_ROOT + RULES] || '{}').sort === false;
  }, RULES) && /rules\.sort === false/.test(fn));

  ok('no Dropbox, no upload — an unconnected phone stays a phone', await page.evaluate(async (RULES) => {
    prefs.mailSort = true; _mailRulesLast = ''; window._ups = [];
    const keep = dbx.refreshToken; dbx.refreshToken = '';
    publishMailRules();
    dbx.refreshToken = keep;
    return window._ups.filter(p => p.endsWith(RULES)).length === 0;
  }, RULES));

  ok('a failed upload is retried next sweep, not swallowed', await page.evaluate(async (RULES) => {
    _mailRulesLast = ''; window._ups = [];
    const good = window.dbxUpload;
    window.dbxUpload = async () => { throw new Error('offline'); };
    publishMailRules();
    await new Promise(r => setTimeout(r, 20));
    window.dbxUpload = good;
    publishMailRules();
    await new Promise(r => setTimeout(r, 20));
    return window._ups.filter(p => p.endsWith(RULES)).length === 1;
  }, RULES));

  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v6.44') && document.querySelector('footer').textContent.includes(APP_VER);
  }));

  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() ===
    (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);

  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  // ── 🔒 a crew phone never publishes Eric's lists. Real reload, not a stubbed flag. ──
  const ctx2 = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const p2 = await ctx2.newPage();
  await p2.addInitScript(() => { try { localStorage.setItem('daylog-crew-name', 'Phil'); } catch (e) {} });
  await p2.goto(appUrl); await p2.waitForTimeout(700);
  ok('a CREW phone never publishes his sender lists', await p2.evaluate((RULES) => {
    window._ups = [];
    window.dbxUpload = async (p) => { window._ups.push(p); return {}; };
    dbx.refreshToken = 'tok';
    publishMailRules();
    return CREW_NAME === 'Phil' && window._ups.filter(p => p.endsWith(RULES)).length === 0;
  }, RULES));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
