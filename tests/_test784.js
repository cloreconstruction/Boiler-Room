// 📥 v7.84 — PHOTOS WAITING FOR HIS TAP; the journal reaches every photo; a client page that covers a second job.
// Eric, with a year of job photos in a Dropbox folder: "just send them to grinder basically, want them just in the job notes
// under photos, and selectable to send to the job journal. as if i just put a bunch of progress photos in the grinder".
// Nothing outside the app may write his log, so the pictures are put in the job's Photos folder and a LIST of them is dropped
// into App Data/photo-inbox.json, which the app only READS: the 📥 SORT tab offers each set under 📷 PHOTOS and his tap makes
// it a grinder note on the job with every picture — pickable in that job's 📖 journal. Every name below is made up.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { fileURLToPath } = require('url');
(async () => {
  const appUrl = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const repo = path.dirname(fileURLToPath(appUrl));
  const src = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
  const csrc = fs.readFileSync(path.join(repo, 'c', 'index.html'), 'utf8');
  const fsrc = fs.readFileSync(path.join(repo, 'fnsrc', 'client-portal.mjs'), 'utf8');
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const errs = [];
  const open = async init => { const c = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }); await c.route(u => !/^file:/.test(u.href), r => r.abort()); if (init) await c.addInitScript(init); const p = await c.newPage(); p.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); }); await p.goto(appUrl); await p.waitForTimeout(700); return p; };
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };

  // the fake Dropbox: one store; a folder listing is the files that sit straight under it; every read and write is noted
  const stub = () => {
    window._saves = 0; window.scheduleSave = () => { window._saves++; }; window.savePendingSoon = () => {};
    window._dbxFiles = {}; window._ups = []; window._downs = []; window._lists = []; window._listFail = false;
    window.dbxDownload = async p => { _downs.push(p); return _dbxFiles[p] ?? null; };
    window.dbxUpload = async (p, body) => { _dbxFiles[p] = typeof body === 'string' ? body : '[file]'; _ups.push(p); return { path_display: p }; };
    window.dbxPathExists = async p => Object.prototype.hasOwnProperty.call(_dbxFiles, p);
    window.dbxList = async a => { _lists.push(a.path); if (_listFail) return { error_summary: 'too_many_requests/..' }; const pre = String(a.path).toLowerCase() + '/'; return { entries: Object.keys(_dbxFiles).filter(k => k.toLowerCase().startsWith(pre) && !k.slice(pre.length).includes('/')).map(k => ({ name: k.slice(pre.length), path_display: k, '.tag': 'file' })) }; };
    window.dbxRpc = async () => ({});
    window.pushOut = () => false; window.cpPush = () => {}; window.publishSharedNotes = async () => {};
    window._said = []; const t0 = window.toast; window.toast = (m, g) => { if (m) _said.push(String(m)); return t0(m, g); };
    const u0 = window.toastUndo; window.toastUndo = (m, f) => { _said.push(String(m)); return u0(m, f); };
    const d0 = window.toastDo; window.toastDo = (m, l, f) => { _said.push(String(m) + ' [' + l + ']'); return d0(m, l, f); };
    window._shown = []; window.showPhoto = async p => { _shown.push({ p, lb: lbPaths.slice(), i: lbIdx }); };
    window._th = []; window.matThumb = async (p, id) => { _th.push(p); const el = document.getElementById(id); if (el) el.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACw='; };
    dbx.refreshToken = 'test-token';
  };

  console.log('— 📥 Eric\'s phone —');
  const page = await open();
  await page.evaluate(stub);
  const R = await page.evaluate(() => {
    jobs = ['Oak House, Pavilion', 'Oak House, Garage', 'Pine Cabin', 'Personal', 'Internal / Admin']; crew = ['Phil']; prefs.office = []; entries = []; todos = []; nextId = 1; pendingQueue = [];
    delete prefs.photoTaken; delete prefs.jrnAlso; _phInbox = null; _portalIdx = { clients: [{ key: 'oak', job: 'Oak House — Pavilion & Garage', code: 'oak-111111' }, { key: 'pine', job: 'Pine Cabin', code: 'pine-222222' }] };
    localStorage.removeItem('daylog-phin-told');
    renderJobSelects(); closePanels(); renderAll(); _ups.length = 0; _downs.length = 0; _said.length = 0;
    return { root: DBX_ROOT, inbox: phInPath(), portal: portalRoot() };
  });
  const PAV = R.root + '/Job Notes/Oak House, Pavilion/Photos/', GAR = R.root + '/Job Notes/Oak House, Garage/Photos/', PAP = R.root + '/Job Notes/Oak House, Pavilion/Plans and Papers/';
  const nn = (pre, n, ext) => Array.from({ length: n }, (_, i) => pre + String(i + 1).padStart(2, '0') + '.' + (ext || 'jpg'));
  const A = nn(PAV + 'Pavilion site 2026-06-', 10), B = nn(GAR + 'Garage design ', 3, 'png'), C = nn(PAV + 'Site ', 2), P = nn(PAP + 'Paper ', 2, 'png'), Q = nn(PAV + 'Pers ', 1);
  const FILE = { sets: [
    { id: 'set-a', job: 'oak house, pavilion', text: 'Pavilion — progress photos on site · 10 photos taken May – Jul 2026', from: 'Claude — your Transfer and delete folder', files: A },
    { id: 'set-b', job: 'Oak House, Garage', text: 'Garage — renderings and drawings', from: 'Claude', files: [...B, '/Somewhere else/x.jpg', R.root + '/Job Notes/Oak House, Garage/../../App Data/entries.json', GAR + 'iphone.heic', B[0]] },
    { id: 'set-c', job: 'Maple Barn', text: 'Site photos I could not place', files: C },
    { id: 'set-p', job: 'Oak House, Pavilion', text: 'Screenshots of paid screens and orders', paper: 1, files: P },
    { id: 'pers', job: 'Personal', text: 'A set aimed at the personal job', files: Q },
    { id: '', job: 'Pine Cabin', text: 'no id', files: C },
    { id: 'no-files', job: 'Pine Cabin', text: 'nothing in it', files: [] },
    { id: 'bad-paths', job: 'Pine Cabin', text: 'only pictures that are not under Job Notes', files: ['/Other/x.jpg', R.root + '/App Data/entries.json', PAV + 'x.heic', PAV + '../y.jpg'] },
    { id: 'no-words', job: 'Pine Cabin', text: '  ', files: C },
    { id: 'set-a', job: 'Pine Cabin', text: 'the same id a second time', files: C },
    'not a set', null ] };
  const put = (files, some) => page.evaluate(([files, some]) => { files.forEach((p, i) => { if (some == null || i < some) _dbxFiles[p] = '[photo]'; }); }, [files, some]);

  ok('no file in Dropbox: nothing waits, nothing is drawn, no number on the SUMMARY button — and nothing is written', await page.evaluate(async () => {
    await phInLoad(true);
    openReview('sort'); await new Promise(r => setTimeout(r, 50));
    const r = { w: phInWaiting().length, card: !!document.querySelector('#revBox .ph-in'), badge: $('hbSumN').textContent, ups: _ups.length, read: _downs.includes(phInPath()) };
    closeReview(); return r.w === 0 && !r.card && r.badge === '' && r.ups === 0 && r.read;
  }));
  ok('a broken file is "nothing waits", never an error', await page.evaluate(async () => { _dbxFiles[phInPath()] = '{ "sets": [ {'; await phInLoad(true); return phInWaiting().length === 0 && Array.isArray(_phInbox); }));

  await page.evaluate(([path, f]) => { _dbxFiles[path] = JSON.stringify(f); _said.length = 0; }, [R.inbox, FILE]);
  ok('the file is read: five sets are kept — one with no id, no pictures, no words, only pictures outside Job Notes, or a second copy of an id is not a set', await page.evaluate(async () => {
    await phInLoad(true);
    return phInWaiting().map(s => s.id).join(',') === 'set-a,set-b,set-c,set-p,pers';
  }), await page.evaluate(() => JSON.stringify((_phInbox || []).map(s => s.id))));
  ok('inside a set, a picture that is not under Job Notes, climbs out of it, is an iPhone HEIC or is listed twice is left out — the good ones stay', await page.evaluate(B => {
    const b = _phInbox.find(s => s.id === 'set-b'); return b.files.length === 3 && b.files.join('|') === B.join('|');
  }, B));
  ok('he is told once, with a plate that goes there — and not again on the next read', await (async () => {
    const said1 = await page.evaluate(() => _said.filter(s => /waiting to go into your log/.test(s)));
    await page.evaluate(async () => { _said.length = 0; await phInLoad(true); _phInbox = null; await phInLoad(true); });
    const said2 = await page.evaluate(() => _said.filter(s => /waiting to go into your log/.test(s)).length);
    await page.evaluate(() => window._toastUndo && null);
    return said1.length === 1 && /^📥 18 photos are waiting to go into your log — SUMMARY → 📥 SORT → 📷 PHOTOS \[Look ›\]$/.test(said1[0]) && said2 === 0;
  })(), await page.evaluate(() => JSON.stringify(_said)));
  ok('the SUMMARY button counts the sets that wait', await page.evaluate(() => { renderPendBanner(); return $('hbSumN').textContent === '5' && $('scSumN').textContent === '5'; }));
  ok('the plate on that toast opens the 📥 SORT tab on 📷 PHOTOS: one card for all of them, then a card a set', await page.evaluate(async () => {
    phInGo(); await new Promise(r => setTimeout(r, 80));
    const head = document.querySelector('#revBox .rev-sec[data-sec="photos"]'), body = document.querySelector('#revBox .rev-sec-body[data-sec="photos"]');
    const cards = [...body.querySelectorAll('.rev-card')];
    return $('revModal').classList.contains('show') && head.getAttribute('aria-expanded') === 'true' && /5 waiting/.test(head.textContent) && !body.hidden &&
      cards.length === 6 && cards[0].classList.contains('ph-in-all') && /5 sets of photos are waiting — 18 photos, not in your log yet/i.test(cards[0].textContent) &&
      cards.slice(1).every(c => c.classList.contains('ph-in')) && /6 waiting · nothing is added until you tap/.test(document.querySelector('#revBox .rev-sub').textContent) === false &&
      /5 waiting · nothing is added until you tap/.test(document.querySelector('#revBox .rev-sub').textContent);
  }), await page.evaluate(() => (document.querySelector('#revBox .rev-sub') || {}).textContent));
  const card = id => `#revBox .ph-in[data-phin="${id}"]`;
  ok('a card says how many, the words its note will carry, where the files are, and shows the first six pictures with one plate for the rest', await page.evaluate(() => {
    const c = document.querySelector('#revBox .ph-in[data-phin="set-a"]'), t = c.textContent.replace(/\s+/g, ' ');
    return /10 photos — Pavilion — progress photos on site · 10 photos taken May – Jul 2026/.test(t) && /From Claude — your Transfer and delete folder · the files are in Dropbox under Oak House, Pavilion → Photos/.test(t) &&
      c.querySelectorAll('.ph-in-th').length === 6 && /^▸ \+4 more — tap to see them all$/.test(c.querySelector('.ph-in-more').textContent.trim()) && !document.querySelector('#revBox .ph-in[data-phin="set-b"] .ph-in-more');
  }));
  ok('the job wheel is pre-lit when the set\'s job IS a job on his list (the exact name, case aside); a job that is not on his list is said in words and left for him to pick; the Personal job is never on the wheel', await page.evaluate(() => {
    const sel = id => document.querySelector(`#revBox .ph-in[data-phin="${id}"] select`), card = id => document.querySelector(`#revBox .ph-in[data-phin="${id}"]`);
    const opts = [...sel('set-a').options].map(o => o.textContent.trim());
    return sel('set-a').value === 'Oak House, Pavilion' && sel('set-a').classList.contains('sel-on') && opts.includes('✓ Oak House, Pavilion') && !opts.some(o => /Personal/.test(o)) &&
      sel('set-b').value === 'Oak House, Garage' && sel('set-c').value === '' && !sel('set-c').classList.contains('sel-on') && /“Maple Barn” is not a job on your list — pick one/.test(card('set-c').textContent) &&
      sel('pers').value === '' && /pick the job first/.test(card('pers').querySelector('.ph-in-go').textContent) && /✓ Put these 10 in your log$/.test(card('set-a').querySelector('.ph-in-go').textContent.trim());
  }));
  ok('a set marked paper says so on its card', await page.evaluate(() => /🧾 PAPER \(screenshots, not progress photos\)/i.test(document.querySelector('#revBox .ph-in[data-phin="set-p"] .rev-kind').textContent)));
  await page.click(card('set-a') + ' .ph-in-more');
  ok('▸ +4 more shows all ten; a tap on a picture looks at THAT one, with the whole set to page through', await (async () => {
    const n = await page.evaluate(() => document.querySelectorAll('#revBox .ph-in[data-phin="set-a"] .ph-in-th').length);
    await page.click(card('set-a') + ' .ph-in-th:nth-child(8)');
    const s = await page.evaluate(() => _shown[_shown.length - 1]);
    return n === 10 && s && s.p === A[7] && s.i === 7 && s.lb.length === 10 && s.lb[0] === A[0];
  })());
  ok('the small pictures are asked for one at a time, only for the tiles that show', await page.evaluate(async A => { await new Promise(r => setTimeout(r, 120)); return _th.includes(A[0]) && _th.includes(A[9]) && document.querySelector('#revBox .ph-in[data-phin="set-a"] .ph-in-th img').classList.contains('on'); }, A));

  console.log('— his tap —');
  await page.evaluate(() => { _said.length = 0; });
  await page.click(card('set-c') + ' .ph-in-go');
  ok('no job picked: the tap is refused in words and nothing is added', await page.evaluate(() => entries.length === 0 && _said.some(s => /^▲ Pick the job first/.test(s))));
  await put(A, 7);
  await page.evaluate(() => { _said.length = 0; _lists.length = 0; });
  await page.click(card('set-a') + ' .ph-in-go'); await page.waitForTimeout(150);
  ok('three of the ten pictures have not reached Dropbox yet: refused in words — nothing is added, the set still waits', await page.evaluate(() =>
    entries.length === 0 && phInWaiting().some(s => s.id === 'set-a') && _said.some(s => /^⏳ 3 of these 10 photos have not reached Dropbox yet — nothing was added\. Try again in a few minutes\.$/.test(s)) && _lists.length === 1), await page.evaluate(() => JSON.stringify(_said)));
  await put(A);
  await page.evaluate(() => { _said.length = 0; _listFail = true; });
  await page.click(card('set-a') + ' .ph-in-go'); await page.waitForTimeout(150);
  ok('Dropbox cannot be asked: refused in words, nothing is added', await page.evaluate(() => { _listFail = false; return entries.length === 0 && _said.some(s => /^⚠ Could not look in Dropbox just now — nothing was added/.test(s)); }));
  await page.evaluate(() => { _said.length = 0; _saves = 0; });
  await page.click(card('set-a') + ' .ph-in-go'); await page.waitForTimeout(200);
  ok('all ten are there: ONE grinder note on the job — his words, every picture, dated now — and the toast says where to pick them', await page.evaluate(A => {
    const e = entries[0];
    return entries.length === 1 && e.type === 'Note' && e.job === 'Oak House, Pavilion' && e.details === 'Pavilion — progress photos on site · 10 photos taken May – Jul 2026' && e.photoPath === A[0] && e.photoPaths.join('|') === A.join('|') &&
      e.noSniff === true && e.phIn === 'set-a' && !e.paper && Math.abs(Date.now() - +new Date(e.ts)) < 60000 && _saves > 0 &&
      _said.some(s => /^📥 10 photos in your log on Oak House, Pavilion — pick any of them in that job's 📖 Journal$/.test(s));
  }, A), await page.evaluate(() => JSON.stringify(_said)));
  ok('the set is off the page, remembered by its id with the day, and the count on SUMMARY goes down', await page.evaluate(() =>
    !document.querySelector('#revBox .ph-in[data-phin="set-a"]') && prefs.photoTaken['set-a'] === localDay(new Date()) && $('hbSumN').textContent === '4' && /4 sets of photos are waiting — 8 photos/i.test(document.querySelector('#revBox .ph-in-all').textContent)));
  ok('↩ Undo takes the note back out of his log and the set waits again', await page.evaluate(() => { window._toastUndo(); return entries.length === 0 && !prefs.photoTaken['set-a'] && !!document.querySelector('#revBox .ph-in[data-phin="set-a"]') && $('hbSumN').textContent === '5'; }));
  await page.click(card('set-a') + ' .ph-in-go'); await page.waitForTimeout(200);
  ok('taken again — and never offered again, on a fresh read of the same file either', await page.evaluate(async () => { _phInbox = null; await phInLoad(true); return entries.length === 1 && !phInWaiting().some(s => s.id === 'set-a') && phInWaiting().length === 4; }));
  await page.evaluate(() => { phInGo(); _said.length = 0; });
  await page.click(card('set-b') + ' .ph-in-no');
  ok('✕ Not these: the set is not offered again (its files stay in Dropbox) — and ↩ Undo brings it back', await page.evaluate(() => {
    const gone = !document.querySelector('#revBox .ph-in[data-phin="set-b"]') && prefs.photoTaken['set-b'] === 'no' && entries.length === 1 && _said.some(s => /^✕ Those 3 photos will not be offered again — the files are still in Dropbox$/.test(s));
    window._toastUndo();
    return gone && !!document.querySelector('#revBox .ph-in[data-phin="set-b"]') && !prefs.photoTaken['set-b'];
  }));
  await put(C); await put(P); await put(B); await put(Q);
  await page.selectOption(card('set-c') + ' select', 'Pine Cabin');
  ok('he picks a job on the wheel: it lights, the plate loses its "pick the job first" — and the note lands on HIS pick', await (async () => {
    const lit = await page.evaluate(() => { const c = document.querySelector('#revBox .ph-in[data-phin="set-c"]'); return c.querySelector('select').classList.contains('sel-on') && c.querySelector('select').value === 'Pine Cabin' && /^✓ Put these 2 in your log$/.test(c.querySelector('.ph-in-go').textContent.trim()); });
    await page.click(card('set-c') + ' .ph-in-go'); await page.waitForTimeout(200);
    return lit && await page.evaluate(() => entries[0].job === 'Pine Cabin' && entries[0].phIn === 'set-c' && entries[0].photoPaths.length === 2);
  })());
  await page.click(card('set-p') + ' .ph-in-go'); await page.waitForTimeout(200);
  ok('a paper set\'s note is marked paper — the journal will ask twice before one of its pictures goes to a homeowner', await page.evaluate(() => { const e = entries.find(x => x.phIn === 'set-p'); return !!e && e.paper === true && jrnPaperLike(e) === true && !jrnPaperLike(entries.find(x => x.phIn === 'set-a')); }));

  console.log('— all at once —');
  ok('✓ Put all in: the first tap only asks, with how many will go; nothing is added', await (async () => {
    const before = await page.evaluate(() => entries.length);
    await page.click('#phInAllBtn');
    return await page.evaluate(n => entries.length === n && /^⚠ SURE\? Tap again — 1 set goes into your log$/.test($('phInAllBtn').textContent.trim()) && $('phInAllBtn').classList.contains('armed'), before);
  })(), await page.evaluate(() => ($('phInAllBtn') || {}).textContent));
  await page.evaluate(() => { _said.length = 0; });
  await page.click('#phInAllBtn'); await page.waitForTimeout(300);
  ok('the second tap puts in every set that has a job; the one that has none stays, and the toast says so', await page.evaluate(() =>
    entries.some(e => e.phIn === 'set-b' && e.job === 'Oak House, Garage') && !entries.some(e => e.phIn === 'pers') && phInWaiting().map(s => s.id).join() === 'pers' &&
    _said.some(s => /^📥 1 set in your log — 3 photos · ▲ 1 still needs a job$/.test(s))), await page.evaluate(() => JSON.stringify(_said)));
  ok('the app never wrote the list: it is in Dropbox exactly as it was dropped', await page.evaluate(([p, f]) => !_ups.includes(p) && _dbxFiles[p] === JSON.stringify(f), [R.inbox, FILE]));
  ok('a read that gets nothing back (no signal) leaves the offers this session already holds', await page.evaluate(async () => { const keep = _dbxFiles[phInPath()]; delete _dbxFiles[phInPath()]; await phInLoad(true); const n = phInWaiting().length; _dbxFiles[phInPath()] = keep; return n === 1; }));
  ok('his own 👁 crew preview is offered nothing and can take nothing', await page.evaluate(async () => { const was = crewPreview; crewPreview = true; const n = phInWaiting().length, r = await phInTake('pers'); crewPreview = was; return n === 0 && r === 'no'; }));
  ok('at 390px a card does not run off the side, and its plates take a thumb', await page.evaluate(() => {
    const c = document.querySelector('#revBox .ph-in'), go = c.querySelector('.ph-in-go'), no = c.querySelector('.ph-in-no'), sel = c.querySelector('select');
    return $('revBox').scrollWidth <= $('revBox').clientWidth + 1 && document.documentElement.scrollWidth <= document.documentElement.clientWidth &&
      go.getBoundingClientRect().height >= 44 && no.getBoundingClientRect().height >= 40 && sel.getBoundingClientRect().height >= 44 && c.querySelector('.ph-in-th').getBoundingClientRect().height >= 44;
  }));
  await page.evaluate(() => closeReview());

  console.log('— 📖 the journal reaches every one of them —');
  // sixty more pictures on the same job, so the job holds seventy — more than the old grid ever listed
  await page.evaluate(PAV => {
    const big = Array.from({ length: 60 }, (_, i) => PAV + 'Big ' + String(i + 1).padStart(2, '0') + '.jpg');
    addEntry('Note', 'Sixty more progress photos', 'Oak House, Pavilion', { noSniff: true, photoPath: big[0], photoPaths: big });
    addEntry('Note', 'A garage note of this week — the slab is poured', 'Oak House, Garage', {});
    window._thumbs = []; window.getToken = async () => 'tok';
    const f0 = window.fetch; window.fetch = async (u, o) => { if (/get_thumbnail_v2/.test(String(u))) { _thumbs.push(JSON.parse(o.headers['Dropbox-API-Arg']).resource.path); return new Response(new Blob([new Uint8Array([1, 2, 3])], { type: 'image/jpeg' })); } return f0(u, o); };
    window._draws = 0; const r0 = renderJrnPhotos; window.renderJrnPhotos = function () { _draws++; return r0.apply(this, arguments); };
    _dbxFiles[portalRoot() + '/oak-111111.json'] = JSON.stringify({ name: 'Oak House', journal: [] });
  }, PAV);
  ok('the grid lists all 72 of the job\'s pictures (it stopped at 48) — six showing, one plate for the rest', await page.evaluate(async () => {
    await openJournal(0); await new Promise(r => setTimeout(r, 250));
    const tiles = [...document.querySelectorAll('#jrnPhGrid [data-jph]')];
    return jrnPhotoList('Oak House, Pavilion').length === 72 && tiles.length === 72 && tiles.filter(t => !t.hidden).length === 6 && /^▸ \+66 more photos — tap to see them all$/.test($('jrnPhMoreBtn').textContent.trim());
  }), await page.evaluate(() => jrnPhotoList('Oak House, Pavilion').length + ' / ' + document.querySelectorAll('#jrnPhGrid [data-jph]').length));
  ok('opening the window fetches a thumbnail only for the six that show — not for all 72 — and each lands in its own tile without the grid being redrawn', await page.evaluate(async () => {
    await new Promise(r => setTimeout(r, 300));
    const six = _thumbs.length === 6, imgs = document.querySelectorAll('#jrnPhGrid [data-jph]:not([hidden]) img').length, d = _draws;
    return six && imgs === 6 && d === 1;
  }), await page.evaluate(() => _thumbs.length + ' thumbs · ' + _draws + ' draws'));
  ok('▸ see them all: the rest are fetched then — one line of fetches, none asked for twice', await page.evaluate(async () => {
    jrnPhMore(); await new Promise(r => setTimeout(r, 900));
    return _thumbs.length === 72 && new Set(_thumbs).size === 72 && document.querySelectorAll('#jrnPhGrid [data-jph] img').length === 72;
  }), await page.evaluate(() => _thumbs.length + ' thumbs'));
  ok('a tap picks one for this week — as with any photo he ground himself', await page.evaluate(() => {
    const e = entries.find(x => x.phIn === 'set-a'); jrnPhotoTog(e.id, 2);
    return e.jrn === true && e.jrnPh.length === 1 && jrnRiding('Oak House, Pavilion').length === 1 && /1 photo rides along/.test($('jrnGoBtn').textContent);
  }));
  ok('a picture of the paper note wears 🧾 RECEIPT? and its first tap only asks', await page.evaluate(() => {
    const e = entries.find(x => x.phIn === 'set-p'), t = document.querySelector(`#jrnPhGrid [data-jph="${e.id}_0"]`);
    jrnPhotoTog(e.id, 0);
    return t.classList.contains('jrn-paper') && !e.jrn && _jrnPaperArm === e.id + '_0';
  }));

  console.log('— ☑ a client page that covers a second job —');
  ok('the page\'s journal reads ONE job; the other job its key names is offered as a ☐ plate — off until he taps', await page.evaluate(() => {
    const b = $('jrnAlsoBox'), p = b.querySelector('.jrn-also'), g = entries.find(x => x.phIn === 'set-b');
    return /This page's photos and notes come from Oak House, Pavilion\. It can cover more:/.test(b.textContent) && b.querySelectorAll('.jrn-also').length === 1 &&
      p.textContent.trim() === '☐ Oak House, Garage — show its photos and notes here too' && p.getAttribute('aria-pressed') === 'false' && getComputedStyle(p).borderTopStyle === 'dashed' &&
      !document.querySelector(`#jrnPhGrid [data-jph="${g.id}_0"]`) && !jrnJobHit(g, 'Oak House, Pavilion');
  }), await page.evaluate(() => $('jrnAlsoBox').textContent));
  await page.evaluate(() => { _said.length = 0; });
  await page.click('#jrnAlsoBox .jrn-also');
  ok('his tap: the plate reads ☑, the garage job\'s three pictures join the grid, and it is kept with his settings', await page.evaluate(() => {
    const p = document.querySelector('#jrnAlsoBox .jrn-also'), g = entries.find(x => x.phIn === 'set-b');
    return /^☑ Oak House, Garage — shows here too · tap to take it off$/.test(p.textContent.trim()) && p.getAttribute('aria-pressed') === 'true' && JSON.stringify(prefs.jrnAlso) === JSON.stringify({ 'Oak House, Pavilion': ['Oak House, Garage'] }) &&
      [0, 1, 2].every(i => !!document.querySelector(`#jrnPhGrid [data-jph="${g.id}_${i}"]`)) && jrnPhotoList('Oak House, Pavilion').length === 75 &&
      _said.some(s => /^☑ Oak House, Garage shows here too — its photos and notes can go to Oak House — Pavilion & Garage's page$/.test(s));
  }), await page.evaluate(() => JSON.stringify(_said)));
  ok('a garage picture he picks rides the release, and the garage job\'s week joins the draft', await page.evaluate(() => {
    const g = entries.find(x => x.phIn === 'set-b'); jrnPhotoTog(g.id, 1);
    const riding = jrnRiding('Oak House, Pavilion').map(r => r.p), draft = journalDraft('Oak House, Pavilion', 'oak-111111');
    return riding.includes(g.photoPaths[1]) && jrnStamped('Oak House, Pavilion').includes(g) && /the slab is poured/.test(draft);
  }));
  await page.click('#jrnAlsoBox .jrn-also');
  ok('the same plate takes it off: the garage job\'s pictures leave the grid and nothing of it rides', await page.evaluate(() => {
    const g = entries.find(x => x.phIn === 'set-b');
    return !prefs.jrnAlso['Oak House, Pavilion'] && !document.querySelector(`#jrnPhGrid [data-jph="${g.id}_0"]`) && !jrnStamped('Oak House, Pavilion').includes(g) && /^☐ Oak House, Garage/.test(document.querySelector('#jrnAlsoBox .jrn-also').textContent.trim());
  }));
  ok('a page whose key names one job draws no plate; a job that is not one the key names cannot be added', await page.evaluate(async () => {
    closeReview(); _dbxFiles[portalRoot() + '/pine-222222.json'] = JSON.stringify({ name: 'Pine', journal: [] });
    await openJournal(1); await new Promise(r => setTimeout(r, 150));
    const none = $('jrnAlsoBox').innerHTML === '' && getComputedStyle($('jrnAlsoBox')).display === 'none';
    jrnAlsoToggle('Oak House, Garage');
    const still = !prefs.jrnAlso || !prefs.jrnAlso['Pine Cabin'];
    closeReview(); return none && still;
  }));
  ok('nothing here wrote the list, and no page of a homeowner was written', await page.evaluate(p => !_ups.includes(p) && !_ups.some(u => /oak-111111\.json|pine-222222\.json/.test(u)), R.inbox));

  console.log('— 👷 a crew phone —');
  const phil = await open(() => { try { localStorage.setItem('daylog-crew-name', 'Phil'); localStorage.setItem('daylog-crew-root', '/Phil'); localStorage.setItem('daylog-crew-jobs', JSON.stringify(['Oak House, Pavilion'])); } catch (e) {} });
  await phil.evaluate(stub);
  ok('a crew phone never reads the list, is offered nothing and can take nothing', await phil.evaluate(async FILE => {
    _dbxFiles[phInPath()] = JSON.stringify(FILE); _downs.length = 0;
    await phInLoad(true);
    const read = _downs.includes(phInPath());
    _phInbox = FILE.sets.map(phInClean).filter(Boolean);
    const r = await phInTake('set-a');
    return CREW_NAME === 'Phil' && !read && phInWaiting().length === 0 && phInRows().n === 0 && r === 'no' && entries.every(e => !e.phIn);
  }, FILE));

  console.log('— the wall —');
  ok('the homeowner\'s page and the homeowner\'s door have no word of it', !/photo-inbox|phIn|jrnAlso/.test(csrc) && !/photo-inbox/.test(fsrc));
  ok('the app only ever READS the list — no upload names it anywhere in the source', !/dbxUpload\(\s*phInPath\(\)/.test(src) && (src.match(/phInPath\(\)/g) || []).length >= 2 && !/dbxUpload\([^)]*photo-inbox/.test(src));
  ok('version bumped — APP_VER and the footer agree', /const APP_VER = 'v7\.(8[4-9]|9\d)'/.test(src) && new RegExp('<footer>' + (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1].replace('.', '\\.')).test(src));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
