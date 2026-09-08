// 🖼 v6.50 — OPTION BOARDS. Eric: "I'm making these posters... I want to create a portion on the
// client page where they can click through this by category and just browse as if they were
// browsing through Pinterest... I would need a place to build that and also a place for the
// clients to see it on their page." And on the mechanism: "so make check boxes? and a send to
// eric button? or a comment page if they check what they wants thats close and describe the
// rest?" — both. Three parts here: his building side, the portal function in the middle, and
// the homeowner's page, each driven for real.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { fileURLToPath } = require('url');
(async () => {
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };
  const appUrl = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const repo = path.dirname(fileURLToPath(appUrl));
  const src = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
  const cSrc = fs.readFileSync(path.join(repo, 'c', 'index.html'), 'utf8');

  console.log('— 🖼 v6.50 option boards: he builds them, they browse and choose —');

  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});

  // ═══ 1. HIS SIDE — Setup → 🖼 Options boards ═══
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
  await page.goto(appUrl); await page.waitForTimeout(700);
  await page.evaluate(() => {
    jobs = ['Mery']; curJob = 'Mery'; crew = []; entries = []; nextId = 1;
    window._up = {}; window._ups = [];
    window.dbxUpload = async (p, b) => { window._up[p] = b; window._ups.push(p); return {}; };
    window.dbxDownload = async p => window._up[p] ?? null;
    window.scheduleSave = () => {};
    dbx.refreshToken = 'tok'; _boards = null;
  });

  ok('no boards yet says so plainly', await page.evaluate(async () => {
    await bdLoad(); renderBoardsSet();
    return /No boards yet/.test($('boardsBox').textContent);
  }));

  ok('➕ New board needs a name first', await page.evaluate(() => {
    $('bdNewName').value = '  '; bdAdd();
    return (_boards || []).length === 0 && /name/i.test($('toast').textContent);
  }));

  ok('naming one makes it, switched ON, and opens it for editing', await page.evaluate(() => {
    $('bdNewName').value = 'Sheetrock / Drywall'; bdAdd();
    const b = _boards[0];
    return _boards.length === 1 && b.name === 'Sheetrock / Drywall' && b.id === 'sheetrock-drywall' && b.on === true && _bdEdit === b.id;
  }), await page.evaluate(() => JSON.stringify(_boards)));

  // his real poster: three headings, their choices under each
  const POSTER = ['Corners', 'Bullnose Corner', 'Square Corner', '',
    'Window Wrap Options', '3-Sided Drywall Wrap + Sill', '4-Sided Drywall Wrap', 'Wood Wrap + Trim (Painted White)', 'Wood Wrap + Trim (Natural Wood)', '',
    'Wall Textures', 'Knockdown', 'Hand Texture', 'Orange Peel', 'Smooth'].join('\n');

  ok('his poster typed in as headings + choices parses into the right groups', await page.evaluate(txt => {
    $('bdGroups-sheetrock-drywall').value = txt;
    bdGroupsSave('sheetrock-drywall');
    const g = bdFind('sheetrock-drywall').groups;
    return g.length === 3 && g[0].n === 'Corners' && g[0].o.length === 2 &&
      g[1].n === 'Window Wrap Options' && g[1].o.length === 4 && g[1].o[3] === 'Wood Wrap + Trim (Natural Wood)' &&
      g[2].n === 'Wall Textures' && g[2].o.join(',') === 'Knockdown,Hand Texture,Orange Peel,Smooth';
  }, POSTER), await page.evaluate(() => JSON.stringify((bdFind('sheetrock-drywall') || {}).groups)));

  ok('a heading with nothing under it is not a group', await page.evaluate(() =>
    bdGroupsParse('Corners\nBullnose\n\nJustAHeading\n\nTextures\nSmooth').length === 2));

  ok('what he typed comes back into the box exactly, so he can edit it again', await page.evaluate(txt => {
    const round = bdGroupsText(bdFind('sheetrock-drywall'));
    return round.trim() === txt.trim();
  }, POSTER));

  ok('it saved to Dropbox as one shared library, not a copy per client', await page.evaluate(() => {
    const p = Object.keys(window._up).find(k => /Option Boards\/boards\.json$/.test(k));
    if (!p) return false;
    const j = JSON.parse(window._up[p]);
    return j.v === 1 && j.boards.length === 1 && j.boards[0].groups.length === 3 && !/Client Portal/.test(p);
  }), await page.evaluate(() => Object.keys(window._up).join(' | ')));

  ok('the card says in words what is still missing', await page.evaluate(() => {
    renderBoardsSet();
    const t = $('boardsBox').textContent;
    return /no picture yet/.test(t) && /3 groups, 10 choices/.test(t) && /ON — on every client page/.test(t);
  }), await page.evaluate(() => $('boardsBox').textContent.replace(/\s+/g, ' ').slice(0, 200)));

  ok('a picture uploads beside the library and gets remembered', await page.evaluate(async () => {
    _bdEdit = 'sheetrock-drywall';
    const f = new File([new Uint8Array([1, 2, 3, 4])], 'drywall poster.PNG', { type: 'image/png' });
    const dt = new DataTransfer(); dt.items.add(f);
    const inp = $('bdImg'); inp.files = dt.files;
    await bdImgPick(inp);
    const b = bdFind('sheetrock-drywall');
    return /^sheetrock-drywall-\d+\.png$/.test(b.img) && Object.keys(window._up).some(k => k.endsWith('/' + b.img));
  }), await page.evaluate(() => JSON.stringify((bdFind('sheetrock-drywall') || {}).img)));

  ok('✓ ON / ○ OFF flips it for every client at once', await page.evaluate(() => {
    bdOn('sheetrock-drywall');
    const off = bdFind('sheetrock-drywall').on === false && /OFF — nobody sees it/.test($('boardsBox').textContent);
    bdOn('sheetrock-drywall');
    return off && bdFind('sheetrock-drywall').on === true;
  }));

  ok('removing one takes two taps (⚠ SURE?) and leaves the picture in Dropbox', await page.evaluate(() => {
    $('bdNewName').value = 'Siding'; bdAdd();
    const before = _boards.length;
    bdDel('siding');
    const armed = _boards.length === before && /⚠ SURE\?/.test($('boardsBox').textContent);
    bdDel('siding');
    return armed && _boards.length === before - 1 && !bdFind('siding') &&
      Object.keys(window._up).some(k => /sheetrock-drywall-\d+\.png$/.test(k));
  }));

  ok('two boards named the same never collide', await page.evaluate(() => {
    $('bdNewName').value = 'Tile'; bdAdd();
    $('bdNewName').value = 'Tile'; bdAdd();
    const ids = _boards.map(b => b.id);
    return ids.includes('tile') && ids.includes('tile-2') && new Set(ids).size === ids.length;
  }));

  ok('no page errors on his side', errs.length === 0, errs.join(' | '));

  // ═══ 2. THE MIDDLE — the portal function ═══
  const fnUrl = 'file:///' + path.join(repo, 'netlify', 'functions', 'client-portal.mjs').replace(/\\/g, '/');
  const mod = await import(fnUrl);
  const LIB = { v: 1, boards: [
    { id: 'drywall', name: 'Sheetrock / Drywall', img: 'drywall.png', on: true, groups: [
      { n: 'Corners', o: ['Bullnose Corner', 'Square Corner'] },
      { n: 'Wall Textures', o: ['Knockdown', 'Smooth'] }] },
    { id: 'siding', name: 'Siding', img: '', on: false, groups: [{ n: 'Kind', o: ['Vinyl'] }] }
  ] };
  const mkFn = (opts = {}) => {
    const st = { wrote: {}, headers: [] };
    const files = { '/Clore DayLog/App Data/Client Portal/abc.json': JSON.stringify(opts.page || { name: 'Mery', updated: '2026-09-07' }),
      '/Clore DayLog/App Data/Option Boards/boards.json': JSON.stringify(opts.lib === null ? {} : (opts.lib || LIB)),
      '/Clore DayLog/App Data/Client Portal/asks-abc.json': JSON.stringify(opts.asks || []) };
    global.fetch = async (url, init = {}) => {
      const u = String(url);
      Object.values(init.headers || {}).forEach(v => st.headers.push(String(v)));
      if (u.includes('oauth2/token')) return { ok: true, json: async () => ({ access_token: 't' }) };
      if (u.includes('files/download')) {
        const p = JSON.parse(init.headers['Dropbox-API-Arg']).path;
        return files[p] != null ? { ok: true, text: async () => files[p], arrayBuffer: async () => new ArrayBuffer(4) } : { ok: false };
      }
      if (u.includes('get_thumbnail_v2')) return opts.noThumb ? { ok: false } : { ok: true, arrayBuffer: async () => new ArrayBuffer(9) };
      if (u.includes('files/upload')) {
        const p = JSON.parse(init.headers['Dropbox-API-Arg']).path;
        st.wrote[p] = init.body; files[p] = init.body; return { ok: true };
      }
      return { ok: false };
    };
    return st;
  };
  const GET = q => mod.default(new Request('https://x/.netlify/functions/client-portal?' + q));
  const POST = body => mod.default(new Request('https://x/.netlify/functions/client-portal', { method: 'POST', body: JSON.stringify(body) }));

  ok('the library is served to a real code — and OFF boards never travel', await (async () => {
    mkFn();
    const r = await GET('c=abc&boards=1');
    const j = await r.json();
    return r.status === 200 && j.boards.length === 1 && j.boards[0].id === 'drywall' && !j.boards.some(b => b.id === 'siding');
  })());

  ok('a made-up code gets nothing', await (async () => {
    mkFn();
    const r = await GET('c=nope&boards=1');
    return r.status === 404;
  })());

  ok('a poster picture is served as JPEG, and the code is checked first', await (async () => {
    const st = mkFn();
    const r = await GET('c=abc&bimg=drywall.png');
    const bad = await GET('c=nope&bimg=drywall.png');
    return r.status === 200 && r.headers.get('content-type') === 'image/jpeg' && bad.status === 404 &&
      st.headers.some(h => /Option Boards\/drywall\.png/.test(h));
  })());

  ok('their choices come back, land on their page AND in his review pile', await (async () => {
    const st = mkFn();
    const r = await POST({ c: 'abc', board: { id: 'drywall', picks: ['Bullnose Corner', 'Smooth'], note: 'the second one but softer' } });
    const pg = JSON.parse(st.wrote['/Clore DayLog/App Data/Client Portal/abc.json']);
    const asks = JSON.parse(st.wrote['/Clore DayLog/App Data/Client Portal/asks-abc.json']);
    return r.status === 200 && pg.boardPicks.drywall.picks.length === 2 && pg.boardPicks.drywall.note === 'the second one but softer' &&
      asks.length === 1 && /🖼 CHOSE — Sheetrock \/ Drywall/.test(asks[0].text) &&
      /Bullnose Corner, Smooth/.test(asks[0].text) && /the second one but softer/.test(asks[0].text) && asks[0].tag === 'Materials';
  })());

  ok('a name that is NOT on the poster cannot be smuggled back', await (async () => {
    const st = mkFn();
    await POST({ c: 'abc', board: { id: 'drywall', picks: ['Bullnose Corner', 'Gold Leaf Everything'], note: '' } });
    const pg = JSON.parse(st.wrote['/Clore DayLog/App Data/Client Portal/abc.json']);
    return JSON.stringify(pg.boardPicks.drywall.picks) === JSON.stringify(['Bullnose Corner']);
  })());

  ok('changing their mind updates the SAME entry — never a second alert (the v5.92 rule)', await (async () => {
    const st = mkFn();
    await POST({ c: 'abc', board: { id: 'drywall', picks: ['Bullnose Corner'] } });
    await POST({ c: 'abc', board: { id: 'drywall', picks: ['Square Corner'] } });
    await POST({ c: 'abc', board: { id: 'drywall', picks: ['Smooth'] } });
    const asks = JSON.parse(st.wrote['/Clore DayLog/App Data/Client Portal/asks-abc.json']);
    return asks.length === 1 && /Smooth/.test(asks[0].text) && /changed their mind 2×/.test(asks[0].text);
  })());

  ok('📞 call me alone is a valid message', await (async () => {
    const st = mkFn();
    const r = await POST({ c: 'abc', board: { id: 'drywall', picks: [], note: '', call: true } });
    const asks = JSON.parse(st.wrote['/Clore DayLog/App Data/Client Portal/asks-abc.json']);
    return r.status === 200 && /asked you to CALL/.test(asks[0].text);
  })());

  ok('an empty send, or one against an OFF board, is refused', await (async () => {
    mkFn();
    const empty = await POST({ c: 'abc', board: { id: 'drywall', picks: [], note: '' } });
    const off = await POST({ c: 'abc', board: { id: 'siding', picks: ['Vinyl'] } });
    return empty.status === 400 && off.status === 404;
  })());

  ok('every Dropbox header it builds stays Latin-1 — the v6.47 bug cannot come back here', await (async () => {
    const st = mkFn();
    await GET('c=abc&bimg=poster.png');
    await POST({ c: 'abc', board: { id: 'drywall', picks: ['Smooth'], note: 'café — 4_50 PM' } });
    return st.headers.length > 0 && !st.headers.some(h => /[^ -ÿ]/.test(h));
  })());

  // ═══ 3. THEIR SIDE — the real client page in a browser ═══
  const cUrl = 'file:///' + path.join(repo, 'c', 'index.html').replace(/\\/g, '/') + '?c=abc';
  const ctx2 = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const p2 = await ctx2.newPage();
  const cErrs = []; p2.on('pageerror', e => cErrs.push(e.message));
  await p2.addInitScript(lib => {
    window.__posts = [];
    const page = { name: 'Mery', updated: '2026-09-07', journal: [], budget: [] };
    window.fetch = async (u, init) => {
      const s = String(u);
      if (init && init.method === 'POST') { window.__posts.push(JSON.parse(init.body)); return { ok: true, text: async () => 'ok' }; }
      if (/boards=1/.test(s)) return { ok: true, json: async () => ({ boards: lib.boards.filter(b => b.on !== false) }) };
      if (/bimg=/.test(s)) return { ok: true };
      return { ok: true, json: async () => page };
    };
  }, LIB);
  await p2.goto(cUrl); await p2.waitForTimeout(900);

  ok('their page loads with no errors and the 🖼 Options tile is live', await p2.evaluate(() => {
    const t = document.getElementById('boardTile');
    return !!t && t.classList.contains('live') && /1 to look through/.test(t.textContent);
  }), cErrs.join(' | '));

  ok('opening it lists the boards — OFF ones are simply not there', await p2.evaluate(async () => {
    await boardsOpen();
    const c = document.getElementById('boardCard');
    return c.style.display !== 'none' && /Sheetrock \/ Drywall/.test(c.textContent) && !/Siding/.test(c.textContent);
  }));

  ok('tapping one shows the poster big, with the choices grouped like the poster', await p2.evaluate(() => {
    boardOpen('drywall');
    const c = document.getElementById('boardCard');
    const img = c.querySelector('.bd-poster');
    const grps = [...c.querySelectorAll('.bd-grp-n')].map(e => e.textContent);
    return !!img && /bimg=drywall.png/.test(img.getAttribute('src')) &&
      grps.includes('Corners') && grps.includes('Wall Textures') &&
      c.querySelectorAll('.bd-opt input[type=checkbox]').length === 4;
  }), await p2.evaluate(() => document.getElementById('boardCard').textContent.replace(/\s+/g, ' ').slice(0, 160)));

  ok('a tick reads as picked in WORDS, not just a colour', await p2.evaluate(() => {
    boardTick('drywall', 'Bullnose Corner');
    const lab = [...document.querySelectorAll('.bd-opt')].find(l => /Bullnose/.test(l.textContent));
    return lab.classList.contains('on') && lab.querySelector('input').checked &&
      getComputedStyle(lab.querySelector('span'), '::after').content.includes('picked');
  }));

  ok('nothing is sent until they tap Send, and an empty send is refused kindly', await p2.evaluate(async () => {
    const before = window.__posts.length;
    boardTick('drywall', 'Bullnose Corner');   // untick it again
    await boardSend();
    return window.__posts.length === before && /Tick something/.test(document.getElementById('bdStatus').textContent);
  }));

  ok('ticks + their words go together in ONE send', await p2.evaluate(async () => {
    boardTick('drywall', 'Square Corner'); boardTick('drywall', 'Smooth');
    document.getElementById('bdNote').value = 'that one but softer';
    await boardSend();
    const p = window.__posts[window.__posts.length - 1];
    return p && p.board.id === 'drywall' && p.board.picks.length === 2 &&
      p.board.picks.includes('Square Corner') && p.board.note === 'that one but softer' && !p.board.call;
  }), await p2.evaluate(() => JSON.stringify(window.__posts.slice(-1))));

  ok('after sending, their page says what they chose and lets them change it', await p2.evaluate(() => {
    const c = document.getElementById('boardCard');
    return /✓ You sent this/.test(c.textContent) && /Square Corner/.test(c.textContent) &&
      /that one but softer/.test(c.textContent) && /send again/.test(c.textContent);
  }));

  ok('📞 call me sends on its own', await p2.evaluate(async () => {
    await boardSend(true);
    const p = window.__posts[window.__posts.length - 1];
    return p.board.call === true && /Eric will call you/.test(document.getElementById('bdStatus').textContent);
  }));

  ok('the tile now says it is answered', await p2.evaluate(() => /1 of 1 answered/.test(document.getElementById('boardTile').textContent)));

  ok('their picks survive a reload — the page itself remembers', await (async () => {
    await p2.evaluate(() => { _bAns = { drywall: { picks: ['Knockdown'], note: 'from the server', ts: '2026-09-07T00:00:00Z' } }; _bOpen = 'drywall'; renderBoards(); });
    return await p2.evaluate(() => /Knockdown/.test(document.getElementById('boardCard').textContent) && /from the server/.test(document.getElementById('boardCard').textContent));
  })());

  ok('a board with no groups yet still opens without breaking', await p2.evaluate(() => {
    _boards = [{ id: 'bare', name: 'Bare', img: '', on: true, groups: [] }];
    _bAns = {}; boardOpen('bare');
    return /Bare/.test(document.getElementById('boardCard').textContent);
  }));

  ok('no errors on their page through all of it', cErrs.length === 0, cErrs.join(' | '));

  // ═══ locks and versions ═══
  ok('a crew phone never sees the boards section', /body\.crew-mode #setBoards/.test(src));
  ok('a crew phone never fetches the library', /if \(!dbx\.refreshToken \|\| CREW_NAME\) return _boards;/.test(src));
  // 🔒 a board is pictures and names only. Markup and vendor names never go client-side, so the
  // board code must not read a money or supplier field off anything it is handed.
  ok('a board carries no price and no vendor — the client code never reads one', (() => {
    const blk = (cSrc.match(/let _boards[\s\S]*?\/\/ 📋 v5\.28/) || [''])[0];
    return blk.length > 500 && !/\b(markup|vendor|supplier|cost|price)\b/i.test(blk) &&
      !/\.(est|amt|amount|mk)\b/.test(blk) && !/\$\{[^}]*money/.test(blk);
  })());

  ok('and what the function stores for a board is names and words only', (() => {
    const blk = (fs.readFileSync(path.join(repo, 'netlify', 'functions', 'client-portal.mjs'), 'utf8')
      .match(/if \(b\.board && typeof b\.board === 'object'\)[\s\S]*?return new Response\('ok'\);/) || [''])[0];
    return blk.length > 500 && /picks/.test(blk) && !/\b(est|amt|amount|markup|vendor|price)\b/i.test(blk);
  })());

  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v6.50') && document.querySelector('footer').textContent.includes(APP_VER);
  }));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
