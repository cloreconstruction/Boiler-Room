// 🚚 v7.44 — FUEL AND MAINTENANCE GO ON A TRUCK. Eric: "on the what kind of cost is this pop up window when someone selects fuel a
// little pop up window should come up to select the truck also it could say fuel or maintenence so other truck related costs are
// assigned to that truck." The 🧾 cost window asks which truck for ⛽ Fuel and 🔧 Truck maintenance, the receipt carries the pick,
// and 📈 Business → 🚚 Truck mileage adds the truck's fuel and maintenance up. Every name and figure here is made up.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { fileURLToPath } = require('url');
(async () => {
  const appUrl = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const repo = path.dirname(fileURLToPath(appUrl));
  const src = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const errs = [];
  const open = async (init) => { const c = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }); await c.route(u => !/^file:/.test(u.href), r => r.abort()); if (init) await c.addInitScript(init); const p = await c.newPage(); p.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); }); await p.goto(appUrl); await p.waitForTimeout(700); return { ctx: c, page: p }; };
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };

  console.log('— 📱 Eric\'s phone —');
  const eric = await open();
  const page = eric.page;
  await page.evaluate(() => {
    window.scheduleSave = () => {}; window.savePendingSoon = () => {}; window.publishSharedNotes = async () => {};
    entries = []; todos = []; jobs = ['Oak House', 'Internal / Admin']; crew = ['Phil']; nextId = 100; pendingQueue = [];
    trucks = [{ name: '2021 Dodge', lastOdo: null }, { name: '2011 Dodge', lastOdo: null }, { name: 'F-250', lastOdo: null }];
    prefs.lastOdo = { '2021 Dodge': { odo: 50100, ts: new Date().toISOString() } }; prefs.lastTruck = 'F-250'; prefs.tags = ['Plumber'];
    renderJobSelects(); closePanels(); renderAll();
    window._said = []; const t0 = window.toast; window.toast = (m, g) => { if (m) _said.push(String(m)); return t0(m, g); };
    qnJobPick = 'Internal / Admin';
  });
  const box = () => page.evaluate(() => ({ shown: $('catModal').classList.contains('show'), t: $('catBox').textContent.replace(/\s+/g, ' ').trim(), kinds: [...document.querySelectorAll('#catKindGrid .pick-chip')].map(b => b.textContent.trim() + (b.getAttribute('aria-pressed') === 'true' ? ' [lit]' : '')), trucks: [...document.querySelectorAll('#catTruckGrid .pick-chip')].map(b => b.textContent.trim()) }));

  ok('the cost window: ⛽ Fuel and 🔧 Truck maintenance sit with the overhead (never billed to a client), and small print says they ask which truck', await page.evaluate(() => {
    qnRcptToggle(); const t = $('catBox').textContent.replace(/\s+/g, ' ');
    const chips = [...document.querySelectorAll('#catBox .pick-chip')].map(b => b.textContent.trim());
    return /What kind of cost is this/.test(t) && chips.includes('⛽ Fuel') && chips.includes('🔧 Truck maintenance') && chips.includes('🏢 Tools') && /⛽ Fuel and 🔧 Truck maintenance ask which truck next/.test(t)
      && OVERHEAD_CATS.includes('Truck maintenance') && RCPT_CATS.includes('Truck maintenance') && isOverheadEntry({ category: 'Truck maintenance', rcpt: true });
  }));
  ok('a tap on ⛽ Fuel does not close the window — it asks 🚚 Which truck?: what it was (⛽ Fuel lit · 🔧 Maintenance), a plate a truck, ○ Not a truck, ‹ Back', await (async () => {
    await page.evaluate(() => { [...document.querySelectorAll('#catBox .pick-chip')].find(b => b.textContent.trim() === '⛽ Fuel').click(); });
    const b = await box();
    return b.shown && /^🚚 Which truck\?/.test(b.t) && b.kinds.join('|') === '✓ ⛽ Fuel [lit]|🔧 Maintenance' && b.trucks.length === 3 && /Not a truck — a can, a generator, equipment/.test(b.t) && /Back to the categories/.test(b.t) && /never billed to a client/.test(b.t)
      && await page.evaluate(() => qnCat === '' && qnTruck === '');
  })(), JSON.stringify(await box()));
  ok('the trucks lead with the one he drove last, then his own order — every plate a name, big enough for a thumb', await page.evaluate(() => {
    const ps = [...document.querySelectorAll('#catTruckGrid .pick-chip')];
    return ps.map(b => b.textContent.trim()).join('|') === '🚚 F-250|🚚 2021 Dodge|🚚 2011 Dodge' && ps.every(b => b.getBoundingClientRect().height >= 36);
  }));
  ok('a tap on a truck: the window shuts, the pick is Fuel on that truck, the 🧾 chip names both, and a toast says it', await page.evaluate(() => {
    _said.length = 0; [...document.querySelectorAll('#catTruckGrid .pick-chip')].find(b => /2021 Dodge/.test(b.textContent)).click();
    const chip = document.querySelector('#qnTagFixed .pick-chip').textContent.trim();
    return !$('catModal').classList.contains('show') && qnRcpt && qnCat === 'Fuel' && qnTruck === '2021 Dodge' && chip === '🧾 Fuel · 🚚 2021 Dodge — tap to change' && _said.some(s => /⛽ Fuel → 🚚 2021 Dodge ✓/.test(s));
  }));
  ok('SEND: the receipt carries the category, the truck and where the truck stood (its last reading) — it is overhead, not billable; the pick lets go for the next note', await page.evaluate(async () => {
    $('askText').value = 'diesel $85.50 at the pump'; $('askText').dispatchEvent(new Event('input'));
    saveNoteFrom('askText'); await new Promise(r => setTimeout(r, 60));
    const e = entries.find(x => /diesel/.test(x.details));
    return !!e && e.category === 'Fuel' && e.truck === '2021 Dodge' && e.truckOdo === 50100 && e.odometer === undefined && e.billable === false && e.rcpt === true && isOverheadEntry(e) && qnTruck === '' && qnCat === '' && !qnRcpt;
  }));
  ok('the other way in: 🔧 Truck maintenance asks the truck with Maintenance lit; the kind can be switched in the little window; a truck with no reading yet carries no reading', await page.evaluate(async () => {
    qnJobPick = 'Internal / Admin'; qnRcptToggle();
    [...document.querySelectorAll('#catBox .pick-chip')].find(b => b.textContent.trim() === '🔧 Truck maintenance').click();
    const lit1 = [...document.querySelectorAll('#catKindGrid .pick-chip')].find(b => b.getAttribute('aria-pressed') === 'true').textContent.trim();
    [...document.querySelectorAll('#catKindGrid .pick-chip')].find(b => /Fuel/.test(b.textContent)).click();
    const lit2 = [...document.querySelectorAll('#catKindGrid .pick-chip')].find(b => b.getAttribute('aria-pressed') === 'true').textContent.trim();
    [...document.querySelectorAll('#catKindGrid .pick-chip')].find(b => /Maintenance/.test(b.textContent)).click();
    [...document.querySelectorAll('#catTruckGrid .pick-chip')].find(b => /F-250/.test(b.textContent)).click();
    const picked = qnCat === 'Truck maintenance' && qnTruck === 'F-250';
    $('askText').value = 'oil change and filters $140'; $('askText').dispatchEvent(new Event('input'));
    saveNoteFrom('askText'); await new Promise(r => setTimeout(r, 60));
    const e = entries.find(x => /oil change/.test(x.details));
    return lit1 === '✓ 🔧 Maintenance' && lit2 === '✓ ⛽ Fuel' && picked && !!e && e.category === 'Truck maintenance' && e.truck === 'F-250' && e.truckOdo === undefined && e.billable === false;
  }));
  ok('○ Not a truck keeps the category and puts it on no truck (a can, a generator); ‹ Back goes back to the categories with nothing picked', await page.evaluate(async () => {
    qnJobPick = 'Internal / Admin'; qnRcptToggle();
    [...document.querySelectorAll('#catBox .pick-chip')].find(b => b.textContent.trim() === '⛽ Fuel').click();
    [...document.querySelectorAll('#catBox .btn-ghost')].find(b => /Back to the categories/.test(b.textContent)).click();
    const back = /What kind of cost is this/.test($('catBox').textContent) && qnCat === '' && qnTruck === '';
    [...document.querySelectorAll('#catBox .pick-chip')].find(b => b.textContent.trim() === '⛽ Fuel').click();
    [...document.querySelectorAll('#catBox .btn-ghost')].find(b => /Not a truck/.test(b.textContent)).click();
    const chip = document.querySelector('#qnTagFixed .pick-chip').textContent.trim();
    const none = qnCat === 'Fuel' && qnTruck === '' && chip === '🧾 Fuel — tap to change' && !$('catModal').classList.contains('show');
    $('askText').value = 'gas for the generator $30'; $('askText').dispatchEvent(new Event('input'));
    saveNoteFrom('askText'); await new Promise(r => setTimeout(r, 60));
    const e = entries.find(x => /generator/.test(x.details));
    return back && none && !!e && e.category === 'Fuel' && e.truck === undefined;
  }));
  ok('any other category still picks in one tap, as before — and lets go of a truck picked a moment ago', await page.evaluate(() => {
    qnJobPick = 'Oak House'; qnRcptToggle();
    [...document.querySelectorAll('#catBox .pick-chip')].find(b => b.textContent.trim() === '⛽ Fuel').click();
    [...document.querySelectorAll('#catTruckGrid .pick-chip')][0].click();
    const had = qnTruck !== '';
    qnRcptToggle(); [...document.querySelectorAll('#catBox .pick-chip')].find(b => /Framing/.test(b.textContent)).click();
    const r = had && qnCat === 'Framing' && qnTruck === '' && !$('catModal').classList.contains('show') && !/🚚/.test(document.querySelector('#qnTagFixed .pick-chip').textContent);
    [...document.querySelectorAll('#catBox .btn-ghost')]; qnRcpt = false; qnCat = ''; renderTagChips();
    return r;
  }));
  ok('with no trucks on his list the window does not ask — Fuel picks in one tap', await page.evaluate(() => {
    const keep = trucks; trucks = []; qnJobPick = 'Internal / Admin'; qnRcptToggle();
    [...document.querySelectorAll('#catBox .pick-chip')].find(b => b.textContent.trim() === '⛽ Fuel').click();
    const r = qnCat === 'Fuel' && qnTruck === '' && !$('catModal').classList.contains('show');
    trucks = keep; qnRcpt = false; qnCat = ''; renderTagChips(); return r;
  }));

  console.log('— 📈 the truck window adds it up —');
  await page.evaluate(() => {
    const D = n => new Date(Date.now() - n * 86400000);
    entries.push({ id: 900, ts: D(3), type: 'Mileage', details: 'Trip', job: 'Oak House', miles: 100, truck: '2021 Dodge', odometer: 50100 });
    entries.push({ id: 901, ts: D(2), type: 'Mileage', details: 'Trip', job: 'Oak House', miles: 50, truck: 'F-250', odometer: 8150 });
    entries.push({ id: 902, ts: D(1), type: 'Note', details: 'his own fuel $999', job: '—', category: 'Fuel', truck: '2021 Dodge', rcpt: true, personal: true });
    entries.push({ id: 903, ts: D(4), type: 'Note', details: 'brake pads $210', job: 'Internal / Admin', category: 'Truck maintenance', truck: '2021 Dodge', truckOdo: 50000, rcpt: true, ai: '💵 $210' });
  });
  const tiles = () => page.evaluate(() => [...document.querySelectorAll('#bizBox .biz-tile')].map(t => [(t.querySelector('b') || {}).textContent || '', ((t.querySelector('span') || {}).textContent || '').replace(/\s+/g, ' ').trim()]));
  const yearOf = n => new Date(Date.now() - n * 86400000).getFullYear(), thisY = new Date().getFullYear();
  const fuelExp = (yearOf(0) === thisY ? 85.5 : 0), mntExp = (yearOf(0) === thisY ? 140 : 0) + (yearOf(4) === thisY ? 210 : 0);
  ok('🚚 Truck mileage, all trucks: ⛽ fuel this year and 🔧 maintenance this year add up the receipts put on a truck (the one on no truck and the personal one are not in), with the cost a mile', await (async () => {
    await page.evaluate(() => { _bizTruck = ''; _bizMSpan = 'month'; openMiles(); });
    const t = await tiles(), g = w => (t.find(x => x[1].includes(w)) || ['', ''])[0];
    const money = s => +String(s).replace(/[^\d.-]/g, '');
    return money(g('⛽ fuel this year')) === Math.round(fuelExp) && money(g('🔧 maintenance this year')) === mntExp && /a mile this year/.test(JSON.stringify(t)) && !/999/.test(await page.evaluate(() => $('bizBox').textContent));
  })(), JSON.stringify(await tiles()));
  ok('the ⛽ FUEL AND 🔧 MAINTENANCE card lists them newest first — the day, the amount, what it was, the truck, his words, where the truck stood', await page.evaluate(() => {
    const card = $('bizTruckCosts'); if (!card) return false;
    const rows = [...card.querySelectorAll('.biz-line')].map(r => r.textContent.replace(/\s+/g, ' ').trim());
    return rows.length === 3 && /\$140\.00 · 🔧 maintenance · F-250/.test(rows.join(' | ')) && /\$85\.50 · ⛽ fuel · 2021 Dodge/.test(rows.join(' | ')) && /diesel/.test(rows.join(' | ')) && /\$210\.00 · 🔧 maintenance · 2021 Dodge.*at 50,000/.test(rows.join(' | ')) && /brake pads/.test(rows[rows.length - 1])
      && /pick ⛽ Fuel or 🔧 Truck maintenance in the grinder/.test(card.textContent);
  }), await page.evaluate(() => ($('bizTruckCosts') || { textContent: 'no card' }).textContent.replace(/\s+/g, ' ').slice(0, 400)));
  ok('pick one truck: only its costs and its miles; its service line counts from the maintenance receipt put on it (100 miles since, off the reading it carried)', await (async () => {
    await page.evaluate(() => { _bizTruck = '2021 Dodge'; renderBusiness(); });
    const t = await tiles(), rows = await page.evaluate(() => [...document.querySelectorAll('#bizTruckCosts .biz-line')].map(r => r.textContent.replace(/\s+/g, ' ').trim()));
    const odo = t.find(x => /2021 Dodge · odometer now/.test(x[1])) || ['', ''];
    return rows.length === 2 && rows.every(r => /2021 Dodge/.test(r)) && !rows.some(r => /F-250/.test(r)) && odo[0] === '50,100' && /100 mi since the .* 🔧 maintenance receipt/.test(odo[1]);
  })(), JSON.stringify(await tiles()));
  ok('a truck with nothing spent on it shows no cost card and no cost tiles — nothing is made up', await (async () => {
    await page.evaluate(() => { _bizTruck = '2011 Dodge'; renderBusiness(); });
    return page.evaluate(() => !$('bizTruckCosts') && !/fuel this year/.test($('bizBox').textContent));
  })());
  ok('no figure of his can sit in the Business block (the scan the v7.38 suite runs)', (() => {
    const i = src.indexOf('// ================= 📈 v7.38 — BUSINESS'), j = src.indexOf('async function openMoneyPage(which) {', i), block = src.slice(i, j);
    return block.length > 20000 && /bizTruckCosts/.test(block) && !/(?<![v\d.])\d[\d,]*\.\d{2}\b/.test(block) && !/\b\d{1,3},\d{3}\b/.test(block);
  })());
  console.log('— 👷 a crew member\'s receipt, the log row, the Wizard —');
  ok('a crew member\'s fuel receipt keeps its truck on the way in: the Sort card carries the truck and the reading, and logging it puts both on the entry in Eric\'s log — the truck window counts it', await page.evaluate(async () => {
    window.setAck = () => {}; dbx.refreshToken = 'tok'; _bizTruck = ''; pendingQueue = [];
    const ago = h => new Date(Date.now() - h * 3600000).toISOString();
    window._files = { '/clore daylog/crew/phil/app data/entries.json': JSON.stringify({ entries: [{ id: 31, ts: ago(2), type: 'Note', details: 'filled the truck $72', job: 'Oak House', vis: 'Eric', category: 'Fuel', truck: 'F-250', truckOdo: 8150, rcpt: true }] }) };
    window.dbxList = async () => ({ entries: [{ '.tag': 'folder', name: 'Phil', path_lower: '/clore daylog/crew/phil', path_display: '/Clore DayLog/Crew/Phil' }] });
    window.dbxDownload = async p => window._files[p] ?? null;
    await checkCrewLogs();
    const card = pendingQueue.find(p => /^crew:Phil:31:/.test(p.id)); if (!card) return false;
    const onCard = card.payload.truck === 'F-250' && card.payload.truckOdo === 8150 && card.payload.category === 'Fuel';
    reviewAct(card.id, 'log'); await new Promise(r => setTimeout(r, 60));
    const e = entries.find(x => x.crewKey === card.id);
    return onCard && !!e && /^Phil: filled the truck/.test(e.details) && e.category === 'Fuel' && e.truck === 'F-250' && e.truckOdo === 8150 && e.odometer === undefined && isOverheadEntry(e)
      && bizTruckCosts().some(c => c.truck === 'F-250' && c.kind === 'Fuel' && c.v === 72 && c.odo === 8150);
  }), await page.evaluate(() => JSON.stringify(pendingQueue.map(p => [p.id, p.payload.truck, p.payload.truckOdo]))));
  const seen = await page.evaluate(() => {
    closeReview(); renderAll();
    const c = buildAskContext('how much did i spend on fuel for the 2021 dodge');
    const i = c.indexOf('diesel'), row = i < 0 ? '' : c.slice(c.lastIndexOf('{', i), c.indexOf('}', i) + 1);
    const logRow = [...document.querySelectorAll('#askRecent *')].map(n => n.children.length ? '' : n.textContent).join(' ');
    return { wizard: /"truck":"2021 Dodge"/.test(row) && /"cat":"Fuel"/.test(row), personalOut: !/his own fuel/.test(c), logNamesIt: /diesel/.test($('askRecent').textContent) && /2021 Dodge/.test($('askRecent').textContent), row, log: $('askRecent').textContent.replace(/\s+/g, ' ').slice(0, 300) };
  });
  ok('the Wizard\'s rows carry the truck with the category (and never the personal receipt)', seen.wizard && seen.personalOut, JSON.stringify(seen.row));
  ok('the running log row names the truck beside the receipt', seen.logNamesIt, seen.log);
  await eric.ctx.close();

  console.log('— 👷 Phil\'s phone —');
  const phil = await open(() => { try { localStorage.setItem('daylog-crew-name', 'Phil'); localStorage.setItem('daylog-crew-root', '/Phil'); localStorage.setItem('daylog-crew-jobs', JSON.stringify(['Oak House'])); } catch (e) {} });
  ok('a crew phone asks the same way, from the trucks Eric\'s list handed it: Fuel → which truck → the receipt carries it', await phil.page.evaluate(async () => {
    window.scheduleSave = () => {}; trucks = [{ name: '2021 Dodge', lastOdo: null }, { name: 'F-250', lastOdo: null }]; prefs.lastOdo = {};
    qnVis = 'Eric'; qnVisNames.clear(); if (typeof setVis === 'function') setVis('Eric'); qnJobPick = 'Oak House';
    qnRcptToggle();
    const fuel = [...document.querySelectorAll('#catBox .pick-chip')].find(b => b.textContent.trim() === '⛽ Fuel'); if (!fuel) return false;
    fuel.click();
    const asked = /Which truck/.test($('catBox').textContent) && document.querySelectorAll('#catTruckGrid .pick-chip').length === 2;
    [...document.querySelectorAll('#catTruckGrid .pick-chip')].find(b => /F-250/.test(b.textContent)).click();
    $('askText').value = 'fuel $60'; $('askText').dispatchEvent(new Event('input'));
    saveNoteFrom('askText'); await new Promise(r => setTimeout(r, 60));
    const e = entries.find(x => /fuel \$60/.test(x.details));
    return CREW_NAME === 'Phil' && asked && !!e && e.category === 'Fuel' && e.truck === 'F-250';
  }));
  await phil.ctx.close();

  ok('version bumped — APP_VER and the footer agree', /const APP_VER = 'v7\.(4[4-9]|[5-9]\d)'/.test(src) && new RegExp('<footer>' + (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1].replace('.', '\\.') + ' ·').test(src));
  ok('version.txt matches the build', fs.readFileSync(path.join(repo, 'version.txt'), 'utf8').trim() === (src.match(/const APP_VER = '(v[\d.]+)'/) || [])[1]);
  ok('no page errors', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
