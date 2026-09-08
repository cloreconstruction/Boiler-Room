// 📄 v6.52 — Eric: "i am unable to upload the excel report for list of invoices. it just says
// 0 of 1 made it. can i put it directly in clore daylog folder or can you take csv". Two faults:
// the upload threw away Dropbox's reason, and the picker only accepted .xlsx. A name Dropbox
// refuses (a colon is enough — "Invoice List by Date: All Dates.xlsx") failed silently forever.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { fileURLToPath } = require('url');
(async () => {
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };
  const appUrl = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const repo = path.dirname(fileURLToPath(appUrl));
  const src = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

  console.log('— 📄 v6.52 the books drop says why, and takes CSV —');

  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
  await page.goto(appUrl); await page.waitForTimeout(700);
  await page.evaluate(() => {
    window._sent = [];
    window.scheduleSave = () => {}; window.renderQbLights = () => {};
    dbx.refreshToken = 'tok';
  });

  // ── the picker ──
  ok('the picker takes Excel AND CSV now, not just .xlsx', await page.evaluate(() => {
    const a = $('qbDrop').getAttribute('accept');
    return /\.xlsx/.test(a) && /\.csv/.test(a) && /\.xls\b/.test(a) && /text\/csv/.test(a);
  }), await page.evaluate(() => $('qbDrop').getAttribute('accept')));

  ok('and the screen tells him both are fine, and where to put it by hand', await page.evaluate(() =>
    /Excel or CSV, either one/.test(document.body.textContent) && /Clore Project Tracker/.test(document.body.textContent)));

  // ── the name cleaner ──
  ok('a colon in a QuickBooks report name no longer kills the upload', await page.evaluate(() =>
    qbDropName('Invoice List by Date: All Dates.xlsx') === 'Invoice List by Date- All Dates.xlsx'));

  ok('every character Dropbox refuses is replaced, and the extension survives', await page.evaluate(() => {
    const n = qbDropName('a\\b/c:d*e?f"g<h>i|j.csv');
    return !/[\\/:*?"<>|]/.test(n) && /\.csv$/.test(n);
  }), await page.evaluate(() => qbDropName('a\\b/c:d*e?f"g<h>i|j.csv')));

  ok('a name that ends in a dot or a space is trimmed — Dropbox refuses those too', await page.evaluate(() =>
    qbDropName('Report.  ') === 'Report' && qbDropName('Report...') === 'Report' && qbDropName('   ') === 'export'));

  ok('a normal name is left completely alone', await page.evaluate(() =>
    qbDropName('Invoice List by Date.xlsx') === 'Invoice List by Date.xlsx' &&
    qbDropName('Sales by Product-Service Detail (1).csv') === 'Sales by Product-Service Detail (1).csv'));

  // ── the reason, carried up ──
  ok('dbxUpload now carries Dropbox\'s own words and the status code', await page.evaluate(async () => {
    window.getToken = async () => 't';
    window.fetch = async () => ({ ok: false, status: 409, json: async () => ({ error_summary: 'path/conflict/file/...' }) });
    try { await dbxUpload('/x/y.xlsx', new Blob(['x'])); return false; }
    catch (e) { return e.status === 409 && e.why === 'path/conflict/file' && /409/.test(e.message) && /conflict/.test(e.message); }
  }));

  const drop = (name, size, resp) => page.evaluate(async ([name, size, resp]) => {
    window.getToken = async () => 't';
    window._sent = [];
    window.fetch = async (u, init) => {
      window._sent.push(JSON.parse(init.headers['Dropbox-API-Arg']).path);
      if (resp === 'ok') return { ok: true, json: async () => ({}) };
      return { ok: false, status: resp.status, json: async () => ({ error_summary: resp.summary }) };
    };
    const f = new File([new Uint8Array(size)], name, { type: 'application/octet-stream' });
    const dt = new DataTransfer(); dt.items.add(f);
    const inp = $('qbDrop'); inp.files = dt.files;
    await qbDropUpload(inp);
    return { msg: $('qbDropMsg').textContent.replace(/\s+/g, ' '), sent: window._sent };
  }, [name, size, resp]);

  ok('a good file goes up under a cleaned name, into QB Exports', await (async () => {
    const r = await drop('Invoice List by Date: All Dates.xlsx', 40, 'ok');
    return /✓ 1 file in/.test(r.msg) && r.sent[0] === '/Clore Project Tracker/QB Exports/Invoice List by Date- All Dates.xlsx';
  })(), JSON.stringify(await drop('Invoice List by Date.xlsx', 40, 'ok')));

  ok('a CSV goes up exactly the same way', await (async () => {
    const r = await drop('Invoice List by Date.csv', 40, 'ok');
    return /✓ 1 file in/.test(r.msg) && /\/QB Exports\/Invoice List by Date\.csv$/.test(r.sent[0]);
  })());

  ok('a REFUSED upload now says why, instead of just "0 of 1 made it"', await (async () => {
    const r = await drop('Invoice List.xlsx', 40, { status: 507, summary: 'insufficient_space/...' });
    return /Only 0 of 1 made it/.test(r.msg) && /Dropbox is full/.test(r.msg);
  })(), JSON.stringify((await drop('Invoice List.xlsx', 40, { status: 507, summary: 'insufficient_space/...' })).msg));

  ok('no write permission is explained in his words', await (async () => {
    const r = await drop('Invoice List.xlsx', 40, { status: 403, summary: 'path/no_write_permission/...' });
    return /won't let the app write there/.test(r.msg) && /put it in the folder yourself/.test(r.msg);
  })());

  ok('a stale Dropbox connection points him at Setup', await (async () => {
    const r = await drop('Invoice List.xlsx', 40, { status: 401, summary: '' });
    return /reconnecting in ⚙ Setup/.test(r.msg);
  })());

  ok('an empty file is caught before it is ever sent', await (async () => {
    const r = await drop('Invoice List.xlsx', 0, 'ok');
    return /Only 0 of 1 made it/.test(r.msg) && /came through empty/.test(r.msg) && r.sent.length === 0;
  })());

  ok('and any failure tells him he can put it in the folder by hand', await (async () => {
    const r = await drop('Invoice List.xlsx', 40, { status: 500, summary: '' });
    return /Clore Project Tracker/.test(r.msg) && /QB Exports/.test(r.msg);
  })());

  // two walls, and the first one is enough: the name cleaner already strips < > " before esc()
  // ever sees it, because Dropbox refuses those characters anyway.
  ok('a booby-trapped file name cannot inject markup into the message', await (async () => {
    await drop('<img src=x onerror=alert(1)>.xlsx', 40, { status: 500, summary: '' });
    const html = await page.evaluate(() => $('qbDropMsg').innerHTML);
    return !/<img/i.test(html) && /-img src=x onerror=alert\(1\)-\.xlsx/.test(html) && errs.length === 0;
  })(), await page.evaluate(() => $('qbDropMsg').innerHTML.slice(0, 140)));

  ok('and a name that keeps its angle brackets would still be escaped', await page.evaluate(() => {
    const probe = esc('<b>x</b>');
    return probe === '&lt;b&gt;x&lt;/b&gt;';
  }));

  ok('a crew phone cannot use the books drop at all', /async function qbDropUpload\(inp\) \{\s*\n\s*if \(CREW_NAME\) return;/.test(src));

  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v6.52') && document.querySelector('footer').textContent.includes(APP_VER);
  }));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
