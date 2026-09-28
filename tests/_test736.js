// v7.36 — Eric, 2026-09-28, an hour after v7.35: "i bought more usage, but that didn't seem to be the problem? i just asked wizard a
// question again and said its at its limits." Anthropic pauses an ACCOUNT two ways — the monthly spending cap of its tier (a 429 with
// error_code enforced_spend_limit_reached and no retry-after) and a spend limit set by hand in the Console (a 400) — and buying credits
// lifts neither. The Wizard now says which, when access comes back on his own clock, and where in the Console it is lifted.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { fileURLToPath } = require('url');
(async () => {
  const appUrl = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const repo = path.dirname(fileURLToPath(appUrl));
  const src = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, timezoneId: 'America/Anchorage' });
  await ctx.route(u => !/^file:/.test(u.href), r => r.abort());
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
  await page.goto(appUrl); await page.waitForTimeout(700);
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };

  await page.evaluate(() => {
    window.scheduleSave = () => {}; window.savePendingSoon = () => {}; window.dbxUpload = async () => ({});
    entries = []; todos = []; jobs = ['Oak House']; crew = ['Phil']; nextId = 100; renderJobSelects(); closePanels(); renderAll();
    lsSet('daylog-aikey', 'sk-ant-made-up-for-this-test'); lsSet('daylog-wizlog', '[]'); _wizLog = null; renderAiKeyStatus(); wizIdleLamp();
    window._said = []; const t0 = window.toast; window.toast = (m, g) => { _said.push(String(m)); return t0(m, g); };
    window._dones = []; const d0 = window.busyDone; window.busyDone = (w, ms) => { _dones.push({ w: String(w || ''), ms: ms || 1100 }); return d0(w, ms); };
    window._api = { calls: 0, step: null };
    const f0 = window.fetch;
    window.fetch = (u, init) => {
      if (!/api\.anthropic\.com/.test(String(u))) return f0(u, init);
      _api.calls++; const s = _api.step;
      return Promise.resolve(new Response(JSON.stringify(s.json), { status: s.status, headers: { 'content-type': 'application/json' } }));
    };
    window.ask = async (q, step) => { _api.step = step; _api.calls = 0; _said.length = 0; _dones.length = 0; $('askText').value = q; await askClaude(); };
  });
  ok('the monthly CAP (a 429, enforced_spend_limit_reached): the words say Anthropic has paused the account, until WHEN on his own clock (00:00 UTC Oct 1 = 4:00 PM Sep 30 in Alaska), that buying credits does not lift it, and where in the Console it is lifted — Settings → Limits', await page.evaluate(async () => {
    await ask('what is open on Oak House', { status: 429, json: { type: 'error', error: { type: 'rate_limit_error', message: "You have reached your API usage limits: your organization has crossed its monthly API usage threshold, set based on your organization's API tier. You will regain access on 2026-10-01 at 00:00 UTC.", details: { error_code: 'enforced_spend_limit_reached' } } } });
    const st = $('askStatus').textContent, band = (_dones.find(d => /⚠/.test(d.w)) || {}).w || '';
    return _api.calls === 2 && /Anthropic has paused your account until/.test(st) && /Sep 30/.test(st) && /4:00 PM/.test(st) && /monthly spending cap/.test(st) && /Buying credits does not lift it/.test(st) && /Settings, then Limits/.test(st) &&
      !/too many questions/.test(st) && _said.some(m => /paused your account/.test(m)) && /ANTHROPIC HAS PAUSED YOUR ACCOUNT UNTIL/.test(band) && $('askText').value === 'what is open on Oak House';
  }), await page.evaluate(() => JSON.stringify({ st: $('askStatus').textContent, dones: _dones, calls: _api.calls })));
  ok('a spend limit he set HIMSELF (a 400, "reached your specified API usage limits"): the words say so and point at Settings → Billing → Spend limits', await page.evaluate(async () => {
    await ask('who is the plumber', { status: 400, json: { type: 'error', error: { type: 'invalid_request_error', message: 'You have reached your specified API usage limits. You will regain access on 2026-10-01 at 00:00 UTC.' } } });
    const st = $('askStatus').textContent;
    return /Anthropic has paused your account until/.test(st) && /Sep 30/.test(st) && /spend limit set in your Anthropic account/.test(st) && /Buying credits does not lift it/.test(st) && /Settings, then Billing, then Spend limits/.test(st) && !/the request was refused/.test(st);
  }), await page.evaluate(() => $('askStatus').textContent));
  ok('a plain per-minute rate limit (a 429 with no cap words) still reads as the rate limit — wait a minute', await page.evaluate(async () => {
    await ask('when is the inspector due', { status: 429, json: { type: 'error', error: { type: 'rate_limit_error', message: 'This request would exceed the rate limit for your organization of 400,000 output tokens per minute.' } } });
    return /too many questions at once/.test($('askStatus').textContent) && !/paused your account/.test($('askStatus').textContent);
  }), await page.evaluate(() => $('askStatus').textContent));
  ok('a message with no date says "the first of next month" rather than nothing', await page.evaluate(() => /first of next month/.test(wizBackOn('crossed its monthly API usage threshold')) && /Sep 30|Oct 1/.test(wizBackOn('You will regain access on 2026-10-01 at 00:00 UTC.'))));
  ok('the docs\' word on the ceiling stands: max_tokens plays no part in a rate limit, so the v7.35 ceiling stays at 12000', /const WIZ_MAX_TOKENS = 12000;/.test(src));

  ok('version bumped — APP_VER and the footer agree', /const APP_VER = 'v7\.(3[6-9]|[4-9]\d)'/.test(src) && new RegExp('<footer>' + (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1].replace('.', '\\.')).test(src));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
