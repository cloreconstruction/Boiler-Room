// 🔔 v6.68 — HOMEOWNER PINGS. Eric's spec, parked since v6.35, built on his "do 1-5 and explain
// 6": opt-in on the client page; each client's phones in THEIR OWN file (never Eric's
// push-subs.json); two triggers only — a journal entry posted, the budget changed; fixed words
// (no name, no dollars on a lock screen); one ping per burst; 9am–5pm Alaska, the rest waits
// for the 9am drain. Three halves: the function logic in plain node, Eric's app firing the two
// triggers, and the homeowner's page turning it on and off.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { fileURLToPath } = require('url');
(async () => {
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };
  const appUrl = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const repo = path.dirname(fileURLToPath(appUrl));
  const fileUrl = p => 'file:///' + p.replace(/\\/g, '/');

  console.log('— ☁ v6.68 the function: window, queue, burst, fixed words —');
  const core = await import(fileUrl(path.join(repo, 'fnsrc', 'client-push-core.mjs')));
  const SUBS = '/Clore DayLog/App Data/Client Portal/push-test-1234.json';
  const QUEUE = '/Clore DayLog/App Data/Client Portal/push-queue.json';
  const LOG = '/Clore DayLog/App Data/Client Portal/push-log.json';
  const twoPhones = JSON.stringify([{ sub: { endpoint: 'https://push.example.com/a', keys: { p256dh: 'p', auth: 'a' } }, ts: 'x' }, { sub: { endpoint: 'https://push.example.com/b', keys: { p256dh: 'p', auth: 'a' } }, ts: 'y' }]);
  const mk = (files = {}, opts = {}) => {
    const state = { files: { ...files }, sends: [], ups: [], dls: [] };
    const deps = {
      now: () => opts.now || new Date('2026-09-12T18:30:00Z'),                 // 10:30 in Alaska (AKDT) — inside the window
      dl: async p => { state.dls.push(p); return Object.prototype.hasOwnProperty.call(state.files, p) ? state.files[p] : null; },
      up: async (p, t) => { state.ups.push(p); state.files[p] = t; },
      send: async (sub, payload) => { state.sends.push({ endpoint: sub.endpoint, payload: JSON.parse(payload) }); return opts.dead && opts.dead(sub) ? 'dead' : true; },
    };
    return { deps, state };
  };

  ok('the Alaska clock: 18:30Z in September is 10 (summer), 17:30Z in December is 8 (winter), and the window is 9 to 5', (() => {
    return core.alaskaHour(new Date('2026-09-12T18:30:00Z')) === 10 && core.alaskaHour(new Date('2026-12-12T17:30:00Z')) === 8 &&
      core.inWindow(new Date('2026-09-12T18:30:00Z')) && !core.inWindow(new Date('2026-09-12T06:00:00Z')) && !core.inWindow(new Date('2026-12-12T17:30:00Z')) && core.inWindow(new Date('2026-12-12T18:30:00Z')) &&
      core.inWindow(new Date('2026-09-12T17:00:00Z')) && !core.inWindow(new Date('2026-09-13T01:00:00Z'));   // 9:00 in, 17:00 out
  })());

  ok('a journal ping inside the window goes to every phone on THAT client\'s list, with the fixed words and the url of their page', await (async () => {
    const { deps, state } = mk({ [SUBS]: twoPhones });
    const r = await core.ping(deps, { c: 'test-1234', kind: 'journal' });
    const p = state.sends[0] && state.sends[0].payload;
    return r.ok && r.sent === 2 && state.sends.length === 2 && p.title === '📖 Project update' && /journal entry was posted/.test(p.body) && p.tag === 'cp-journal' && p.url === '/c/?c=test-1234';
  })());

  ok('the words carry no name and no dollar figure — they are the same for every client, every time', (() => {
    const j = JSON.parse(core.payloadFor('journal', 'josten-842d53')), b = JSON.parse(core.payloadFor('budget', 'mery-1'));
    const clean = s => !/\$|\d{3,}|josten|mery/i.test(s);
    return clean(j.title) && clean(j.body) && clean(b.title) && clean(b.body) && /budget/i.test(b.body);
  })());

  ok('it never reads or writes Eric\'s own push-subs.json — the homeowner list is its own file', await (async () => {
    const { deps, state } = mk({ [SUBS]: twoPhones });
    await core.ping(deps, { c: 'test-1234', kind: 'budget' });
    return ![...state.dls, ...state.ups].some(p => /push-subs\.json/.test(p)) && state.dls.includes(SUBS);
  })());

  ok('one ping per burst: the same client + kind again inside 30 minutes is skipped; a different kind still goes', await (async () => {
    const { deps, state } = mk({ [SUBS]: twoPhones });
    const a = await core.ping(deps, { c: 'test-1234', kind: 'budget' });
    const b = await core.ping(deps, { c: 'test-1234', kind: 'budget' });
    const c = await core.ping(deps, { c: 'test-1234', kind: 'journal' });
    return a.sent === 2 && b.skipped === 'burst' && c.sent === 2 && state.sends.length === 4;
  })());

  ok('after 30 minutes the same kind rings again', await (async () => {
    const { deps, state } = mk({ [SUBS]: twoPhones, [LOG]: JSON.stringify({ 'test-1234:budget': '2026-09-12T17:55:00Z' }) });
    const r = await core.ping(deps, { c: 'test-1234', kind: 'budget' });
    return r.sent === 2 && state.sends.length === 2;
  })());

  ok('outside the window nothing rings — the ping waits in the queue, once, however many times it is asked', await (async () => {
    const { deps, state } = mk({ [SUBS]: twoPhones }, { now: new Date('2026-09-13T06:00:00Z') });   // 10pm Alaska
    const a = await core.ping(deps, { c: 'test-1234', kind: 'journal' });
    const b = await core.ping(deps, { c: 'test-1234', kind: 'journal' });
    const q = JSON.parse(state.files[QUEUE] || '[]');
    return a.queued && b.queued && !state.sends.length && q.length === 1 && q[0].c === 'test-1234' && q[0].kind === 'journal';
  })());

  ok('the 9am drain sends what waited and empties the queue; before 9 it holds and touches nothing', await (async () => {
    const q = JSON.stringify([{ c: 'test-1234', kind: 'journal', ts: 'x' }, { c: 'test-1234', kind: 'budget', ts: 'y' }]);
    const early = mk({ [SUBS]: twoPhones, [QUEUE]: q }, { now: new Date('2026-09-13T15:00:00Z') });   // 7am
    const h = await core.drain(early.deps);
    const late = mk({ [SUBS]: twoPhones, [QUEUE]: q }, { now: new Date('2026-09-13T17:05:00Z') });    // 9:05
    const d = await core.drain(late.deps);
    return h.held && !early.state.sends.length && early.state.files[QUEUE] === q &&
      d.drained === 2 && d.sent === 4 && late.state.sends.length === 4 && late.state.files[QUEUE] === '[]';
  })());

  ok('a phone that let its subscription go (404/410) is dropped from the list; the others stay', await (async () => {
    const { deps, state } = mk({ [SUBS]: twoPhones }, { dead: s => /\/b$/.test(s.endpoint) });
    const r = await core.ping(deps, { c: 'test-1234', kind: 'journal' });
    const left = JSON.parse(state.files[SUBS]);
    return r.sent === 1 && r.dead === 1 && left.length === 1 && left[0].sub.endpoint === 'https://push.example.com/a';
  })());

  ok('a bad code or an unknown kind is refused; a client with no phones is a quiet no-op', await (async () => {
    const { deps, state } = mk({});
    const a = await core.ping(deps, { c: '../', kind: 'journal' });          // cleans to nothing → refused
    const b = await core.ping(deps, { c: 'test-1234', kind: 'money' });
    const c = await core.ping(deps, { c: 'test-1234', kind: 'journal' });
    const d = await core.ping(deps, { c: '../x', kind: 'journal' });         // cleans to "x" — a code with no page, no phones: quiet
    return a.ok === false && b.ok === false && c.ok === true && c.total === 0 && d.ok === true && d.total === 0 && !state.sends.length &&
      !state.dls.some(p => /\.\./.test(p));                                   // the dots never reach a Dropbox path
  })());

  ok('a subscription is only what the browser hands over — endpoint (https) and its two keys', (() =>
    core.subOk({ endpoint: 'https://p.example/x', keys: { p256dh: 'a', auth: 'b' } }) && !core.subOk({ endpoint: 'http://p.example/x', keys: { p256dh: 'a', auth: 'b' } }) &&
    !core.subOk({ endpoint: 'https://p.example/x' }) && !core.subOk('https://p.example/x'))());

  console.log('— ☁ v6.68 client-portal: the opt-in door, and a manifest per page —');
  const portal = (await import(fileUrl(path.join(repo, 'netlify', 'functions', 'client-portal.mjs')))).default;
  const mkPortal = (files = {}) => {
    const state = { files: { ...files }, ups: [] };
    global.fetch = async (url, init = {}) => {
      const u = String(url);
      if (u.includes('oauth2/token')) return { ok: true, json: async () => ({ access_token: 't' }) };
      const arg = init.headers && init.headers['Dropbox-API-Arg'] ? JSON.parse(init.headers['Dropbox-API-Arg']) : {};
      if (u.includes('files/download')) { const t = state.files[arg.path]; return t == null ? { ok: false, status: 409, text: async () => '' } : { ok: true, status: 200, text: async () => t }; }
      if (u.includes('files/upload')) { state.ups.push(arg.path); state.files[arg.path] = typeof init.body === 'string' ? init.body : Buffer.from(init.body).toString(); return { ok: true, status: 200 }; }
      return { ok: false, status: 500, text: async () => '' };
    };
    return state;
  };
  const PAGE = '/Clore DayLog/App Data/Client Portal/test-1234.json';
  const post = body => portal(new Request('http://x/.netlify/functions/client-portal', { method: 'POST', headers: { 'content-type': 'application/json', 'user-agent': 'iPhone Safari' }, body: JSON.stringify(body) }));
  const goodSub = { endpoint: 'https://push.example.com/abc', expirationTime: null, keys: { p256dh: 'p256', auth: 'auth' } };
  process.env.DBX_REFRESH_TOKEN = 'r'; process.env.DBX_APP_KEY = 'a';

  ok('POST {c, push:{sub}} lands the phone in push-<code>.json — the sub, a stamp, a bit of the browser name, nothing else', await (async () => {
    const st = mkPortal({ [PAGE]: JSON.stringify({ name: 'Josten–Weiser Custom Home' }) });
    const r = await post({ c: 'test-1234', push: { sub: goodSub } });
    const j = await r.json();
    const saved = JSON.parse(st.files[SUBS] || '[]');
    return r.status === 200 && j.ok && j.n === 1 && saved.length === 1 && saved[0].sub.endpoint === goodSub.endpoint && saved[0].sub.keys.auth === 'auth' && /iPhone/.test(saved[0].ua) && Object.keys(saved[0]).sort().join() === 'sub,ts,ua';
  })());

  ok('the same phone twice is one row; a second phone makes two; {push:{off}} takes one out again', await (async () => {
    const st = mkPortal({ [PAGE]: '{}' });
    await post({ c: 'test-1234', push: { sub: goodSub } });
    await post({ c: 'test-1234', push: { sub: goodSub } });
    await post({ c: 'test-1234', push: { sub: { ...goodSub, endpoint: 'https://push.example.com/second' } } });
    const two = JSON.parse(st.files[SUBS]).length === 2;
    const r = await post({ c: 'test-1234', push: { off: goodSub.endpoint } });
    const left = JSON.parse(st.files[SUBS]);
    return two && (await r.json()).n === 1 && left.length === 1 && left[0].sub.endpoint === 'https://push.example.com/second';
  })());

  ok('a made-up subscription is refused (400); an unknown code is refused (404); Eric\'s push-subs.json is never touched', await (async () => {
    const st = mkPortal({ [PAGE]: '{}' });
    const a = await post({ c: 'test-1234', push: { sub: { endpoint: 'http://not-https', keys: {} } } });
    const b = await post({ c: 'nobody-0000', push: { sub: goodSub } });
    return a.status === 400 && b.status === 404 && !st.ups.some(p => /push-subs\.json/.test(p)) && !st.files[SUBS];
  })());

  ok('GET ?c&manifest=1 is a web-app manifest for THAT page: opens on their code, standalone, with the icons', await (async () => {
    mkPortal({ [PAGE]: JSON.stringify({ name: 'Josten–Weiser Custom Home' }) });
    const r = await portal(new Request('http://x/.netlify/functions/client-portal?c=test-1234&manifest=1'));
    const m = await r.json();
    return r.status === 200 && /manifest\+json/.test(r.headers.get('content-type')) && m.start_url === '/c/?c=test-1234' && m.display === 'standalone' && /Josten/.test(m.name) && m.icons.length === 2;
  })());

  console.log('— 📱 v6.68 Eric\'s app: the two triggers, and only those —');
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
  await page.goto(appUrl);
  await page.waitForTimeout(700);
  await page.evaluate(() => {
    jobs = ['Josten/Weiser']; curJob = 'Josten/Weiser'; crew = []; entries = []; todos = []; nextId = 1;
    renderJobSelects(); closePanels(); renderAll();
    window.scheduleSave = () => {}; window.savePendingSoon = () => {};
    dbx.refreshToken = 'test-token'; prefs.pushSecret = 'sec';
    _portalIdx = { clients: [{ key: 'josten', job: 'Josten–Weiser Custom Home', code: 'test-1234' }] };
    window._dbxFiles = {}; window._pings = [];
    window.dbxDownload = async p => (window._dbxFiles || {})[p] ?? null;
    window.dbxUpload = async (p, body) => { (window._dbxFiles || {})[p] = body; return {}; };
    window.dbxPathExists = async p => Object.prototype.hasOwnProperty.call(window._dbxFiles || {}, p);
    window.dbxRpc = async () => ({});
    const real = window.fetch; window.fetch = (u, o) => { if (String(u).includes('/client-push')) { window._pings.push({ headers: o.headers, body: JSON.parse(o.body) }); return Promise.resolve({ ok: true, json: async () => ({ ok: true }) }); } return real(u, o); };
    window._dbxFiles[portalRoot() + '/test-1234.json'] = JSON.stringify({ name: 'Josten–Weiser Custom Home', updated: '2026-09-11', show: { money: true, phases: true }, invoiced: 0, paid: 0, open: 0, phases: [], journal: [{ week: 'Aug 28 – Sep 3', released: '2026-09-04', text: 'old week' }] });
    _estIdx = 0; _estD = { mk: 20, cats: [{ n: 'Framing', appr: true, bids: [{ e1: 48200, e2: 0, acc: true, inc: true }] }] }; _estPage = null;
  });

  ok('a budget change on their page fires ONE budget ping, with the secret, naming only the page code and the kind', await page.evaluate(async () => {
    await estPublish(_portalIdx.clients[0], estCut());
    const p = window._pings[0];
    return window._pings.length === 1 && p.body.c === 'test-1234' && p.body.kind === 'budget' && p.headers['x-push-secret'] === 'sec' && !/\$|Josten/.test(JSON.stringify(p.body));
  }));

  ok('publishing the SAME budget again is not news — no ping; a changed number is', await page.evaluate(async () => {
    await estPublish(_portalIdx.clients[0], estCut());
    const same = window._pings.length === 1;
    _estD.cats[0].bids[0].e1 = 50000;
    await estPublish(_portalIdx.clients[0], estCut());
    return same && window._pings.length === 2 && window._pings[1].body.kind === 'budget';
  }));

  ok('a journal release fires ONE journal ping; an ✎ edit of a released week does not', await page.evaluate(async () => {
    window._pings = [];
    document.body.insertAdjacentHTML('beforeend', '<textarea id="jrnText">Framing is up, roof next week.</textarea>');
    _jrnIdx = 0; _jrnEditIdx = null; _jrnLastOpen = false;
    await journalRelease();
    const one = window._pings.length === 1 && window._pings[0].body.kind === 'journal' && window._pings[0].body.c === 'test-1234';
    $('jrnText').value = 'Framing is up, roof next week — edited.'; _jrnEditIdx = 0;
    await journalRelease();
    return one && window._pings.length === 1;
  }));

  ok('with no push secret on the phone nothing is sent; a kind that is not journal or budget is refused', await page.evaluate(() => {
    window._pings = [];
    const had = prefs.pushSecret; delete prefs.pushSecret;
    cpPush('test-1234', 'journal');
    prefs.pushSecret = had;
    cpPush('test-1234', 'money'); cpPush('', 'journal');
    return window._pings.length === 0;
  }));

  await page.close();

  console.log('— 🏠 v6.68 the homeowner\'s page: the 🔔 switch —');
  const cpage = await ctx.newPage();
  const cerrs = []; cpage.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) cerrs.push(e.message); });
  await cpage.addInitScript(() => {
    window.__posts = [];
    const realFetch = window.fetch;
    window.fetch = async (u, o) => {
      const url = String(u);
      if (!url.includes('/client-portal')) return realFetch(u, o);
      if (o && o.method === 'POST') { window.__posts.push(JSON.parse(o.body)); return { ok: true, status: 200, json: async () => ({ ok: true, n: 1 }), text: async () => 'ok' }; }
      const j = url.includes('a=1') ? [] : url.includes('mat=1') ? { rooms: [] } : url.includes('boards=1') ? { boards: [] }
        : { name: 'Josten–Weiser Custom Home', updated: '2026-09-12', show: { money: true, phases: true }, invoiced: 0, paid: 0, open: 0, phases: [], journal: [{ week: 'Sep 5 – Sep 11', released: '2026-09-11', text: 'Garage doors in.' }] };
      return { ok: true, status: 200, json: async () => j, text: async () => JSON.stringify(j) };
    };
    const fakeSub = { endpoint: 'https://push.example.com/abc123', keys: { p256dh: 'p256', auth: 'auth' }, toJSON() { return { endpoint: this.endpoint, expirationTime: null, keys: this.keys }; }, unsubscribe: async () => true };
    const reg = { pushManager: { subscribe: async () => fakeSub, getSubscription: async () => fakeSub } };
    Object.defineProperty(navigator, 'serviceWorker', { value: { register: async () => reg, getRegistration: async () => reg }, configurable: true });
    window.PushManager = function () {};
    window.Notification = { permission: 'default', requestPermission: async () => 'granted' };
  });
  const cUrl = fileUrl(path.join(repo, 'c', 'index.html')) + '?c=test-1234';
  await cpage.goto(cUrl);
  await cpage.waitForTimeout(900);

  ok('the page carries a manifest link for ITS code, and the 🔔 card with Turn on and the two triggers in words', await cpage.evaluate(() => {
    const l = document.querySelector('link[rel="manifest"]');
    const card = document.getElementById('bellCard');
    return !!l && /manifest=1/.test(l.getAttribute('href')) && /c=test-1234/.test(l.getAttribute('href')) &&
      !!card && /journal entry is posted or the budget changes/.test(card.textContent) && /9am and 5pm/.test(card.textContent) && document.getElementById('bellBtn').textContent === 'Turn on';
  }));

  ok('Turn on: permission, a subscription, and ONE post to the page\'s own door — {c, push:{sub}}; the card says ✓ On', await (async () => {
    await cpage.click('#bellBtn');
    await cpage.waitForTimeout(400);
    return cpage.evaluate(() => {
      const p = window.__posts.find(x => x.push && x.push.sub);
      return !!p && p.c === 'test-1234' && p.push.sub.endpoint === 'https://push.example.com/abc123' && p.push.sub.keys.auth === 'auth' &&
        /✓ On/.test(document.getElementById('bellTxt').textContent) && document.getElementById('bellBtn').textContent === 'Turn off' && localStorage.getItem('clore-bell-test-1234') === 'on';
    });
  })());

  ok('Turn off: the endpoint goes back with off, the phone unsubscribes, the card says so', await (async () => {
    await cpage.click('#bellBtn');
    await cpage.waitForTimeout(400);
    return cpage.evaluate(() => {
      const p = window.__posts.find(x => x.push && x.push.off);
      return !!p && p.push.off === 'https://push.example.com/abc123' && /Off — no more pings/.test(document.getElementById('bellTxt').textContent) && document.getElementById('bellBtn').textContent === 'Turn on' && !localStorage.getItem('clore-bell-test-1234');
    });
  })());

  ok('in Eric\'s preview (pv=1) the switch is words only — his phone can never land on a homeowner\'s list', await (async () => {
    await cpage.goto(cUrl + '&pv=1');
    await cpage.waitForTimeout(900);
    return cpage.evaluate(() => { const c = document.getElementById('bellCard'); return !!c && /homeowner's switch/.test(c.textContent) && !document.getElementById('bellBtn'); });
  })());

  ok('no page errors on either page', errs.length === 0 && cerrs.length === 0, [...errs, ...cerrs].join(' | '));

  ok('version bumped — APP_VER and the footer agree', (() => {
    const src = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    const ver = (src.match(/const APP_VER = '([^']+)'/) || [])[1];
    return num(ver) >= num('v6.68') && src.includes('<footer>' + ver);
  })());

  ok('the drain is on the timer, and netlify.toml says why', (() => {
    const toml = fs.readFileSync(path.join(repo, 'netlify.toml'), 'utf8');
    return /\[functions\."client-push-drain"\]\s*\n\s*schedule = "0 17,18 \* \* \*"/.test(toml) && fs.existsSync(path.join(repo, 'netlify', 'functions', 'client-push-drain.mjs')) && fs.existsSync(path.join(repo, 'netlify', 'functions', 'client-push.mjs'));
  })());

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
