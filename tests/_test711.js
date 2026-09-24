// 📅 v7.11 — A WAITING CARD SITS WHERE IT CAME IN. Eric: "on the running log a grinder 'pay spenard builers supply' has been
// stuck at the top row for a while". It was a 💳 bill card from a statement photo; the running log placed each waiting card
// at `payload.ts || payload.d || payload.due`, and a bill's only date is its DUE date — in the future — so it sorted above
// everything until the bill came due. A 🔁 renew card did the same with an expiry date, and the 👷 crew cards (a day, no
// time) read as "right now" on every draw. Now every card is stamped once with the moment it came in (`p.at`, saved with
// the pile); an old bill takes the time of the photo it was read off (the same reading, word for word). Names and figures
// here are made up.
const { chromium } = require('playwright');
(async () => {
  const appUrl = process.env.APP_URL || 'file:///home/claude/work/clore-daylog.html';
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => { if (!/Failed to fetch/.test(e.message)) errs.push(e.message); });
  await page.goto(appUrl); await page.waitForTimeout(700);
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { if (c) { pass++; console.log('  ok  ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' -> ' + x : '')); } };

  const seed = await page.evaluate(async () => {
    jobs = ['Oak House']; crew = ['Ann']; todos = []; nextId = 100; pendDone.clear();
    window.scheduleSave = () => {}; window.publishSharedNotes = () => {};
    const ago = (d, h = 0) => new Date(Date.now() - d * 86400000 - h * 3600000);
    const iso = (d, h) => ago(d, h).toISOString();
    const day = d => localDay(ago(d));
    const READ = '📅 2026-09-10\n🏪 Lumber Yard Co\n💵 $812.40\n🗓 DUE 2099-01-15\n🔢 acct ••••1234';
    entries = [
      { id: 1, ts: ago(0, 1), type: 'Note', details: 'Newest note of the day', job: 'Oak House' },
      { id: 2, ts: ago(1), type: 'Note', details: 'Yesterday note', job: 'Oak House' },
      { id: 3, ts: ago(6), type: 'Note', details: 'Statement photo', job: 'Oak House', photoPath: '/p/stmt.jpg', ai: READ },
      { id: 4, ts: ago(8), type: 'Note', details: 'Eight days back', job: 'Oak House' },
      { id: 5, ts: ago(30), type: 'Note', details: 'A month back', job: 'Oak House' },
    ];
    renderJobSelects(); closePanels(); renderAll();
    const crewCard = i => ({ id: 'crew:Ann:' + i + ':' + day(20), kind: 'crew', source: 'Ann', payload: { from: 'Ann', type: 'Note', text: 'crew note ' + i, job: 'Oak House', day: day(20) } });
    const pile = [
      { id: 'bill:2099-01-15:lumber yard co', kind: 'bill', payload: { who: 'Lumber Yard Co', amt: 812.4, due: '2099-01-15', overdue: false, job: 'Oak House', fname: 'image.jpg',
        what: READ.replace(/\s+/g, ' ').trim().slice(0, 240), text: 'Pay Lumber Yard Co — $812.40', pri: 2, note: 'From the statement photo' } },
      { id: 'renew:2099-03-01:some policy', kind: 'todo', payload: { text: '🔁 Renew: Some policy — expires 2099-03-01', due: '2099-03-01', waitUntil: '2099-02-15', pri: 2, job: '' } },
      crewCard(1), crewCard(2), crewCard(3),
      { id: 'text:TEXT -a.txt', kind: 'text', source: 'TEXT -a.txt', payload: { from: 'Bo', body: 'see you at 8', ts: iso(2), photos: [] } },
      { id: 'qb:q1', kind: 'qb', payload: { qid: 'q1', d: day(4), amt: 61.12, who: 'Fuel Stop', memo: '', acct: '1111' } },
    ];
    window._files = { [PENDING_PATH()]: JSON.stringify(pile) };
    window._ups = [];
    dbx.refreshToken = 'tok';
    window.dbxDownload = async p => window._files[p] ?? null;
    window.dbxUpload = async (p, b) => { window._ups.push(p); window._files[p] = b; return {}; };
    await checkPending();
    await new Promise(r => setTimeout(r, 1100));   // savePendingSoon's debounce
    return { photoTs: entries.find(e => e.id === 3).ts.toISOString() };   // the app keeps its entries newest first — find the photo by id
  });

  console.log('— 📅 v7.11 every waiting card is stamped with the moment it came in, once —');
  const st = await page.evaluate(() => {
    const by = id => pendingQueue.find(p => p.id === id) || {};
    const saved = JSON.parse(window._files[PENDING_PATH()] || '[]');
    return { all: pendingQueue.every(p => p.at), bill: by('bill:2099-01-15:lumber yard co').at, renew: by('renew:2099-03-01:some policy').at,
      savedAll: saved.length === pendingQueue.length && saved.every(p => p.at), ups: window._ups.filter(p => p === PENDING_PATH()).length };
  });
  ok('every card on the pile carries `at` after it loads', st.all, JSON.stringify(st));
  ok('the old 💳 bill takes the time of the statement photo it was read off (the same reading, word for word) — not today, not its due date', st.bill === new Date(seed.photoTs).toISOString(), `${st.bill} vs ${seed.photoTs}`);
  ok('a card with no photo to go by (the renew card) takes the moment this app first held it — today, never its expiry', Math.abs(Date.parse(st.renew) - Date.now()) < 60000, st.renew);
  ok('the stamps are SAVED with the pile (one write), so every device reads the same times', st.savedAll && st.ups === 1, JSON.stringify(st));
  ok('loading the pile again keeps every stamp and writes nothing new', await page.evaluate(async () => {
    const before = JSON.stringify(pendingQueue.map(p => [p.id, p.at])); window._ups.length = 0;
    await checkPending(); await new Promise(r => setTimeout(r, 1100));
    return JSON.stringify(pendingQueue.map(p => [p.id, p.at])) === before && window._ups.length === 0;
  }));

  console.log('— 📜 v7.11 the running log files each waiting card at that moment, never in the future —');
  const rows = await page.evaluate(() => {
    prefs.rlFilter = ''; prefs.rlWho = ''; prefs.rlHide = []; window._rlN = 40; renderAskRecent();
    window._rlW = [...document.querySelectorAll('#askRecent .ask-recent-row .arw')].map(w => w.textContent.trim());   // the time label alone
    return [...document.querySelectorAll('#askRecent .ask-recent-row')].map(r => r.textContent.replace(/\s+/g, ' ').trim());
  });
  const at = re => rows.findIndex(t => re.test(t));
  const rowW = await page.evaluate(() => window._rlW);
  const iNewest = at(/Newest note of the day/), iBill = at(/Lumber Yard Co/), iPhoto = at(/Statement photo/), iEight = at(/Eight days back/);
  ok('the 💳 bill is no longer the top row — the newest note leads', iBill > 0 && at(/Newest note of the day/) < iBill, JSON.stringify(rows.slice(0, 4)));
  ok('the bill sits beside its statement photo — below everything newer, above everything older', iBill > at(/Yesterday note/) && Math.abs(iBill - iPhoto) === 1 && iBill < iEight, JSON.stringify(rows));
  ok('the row says what it is: ⏳ waiting: 💳 bill — Pay Lumber Yard Co — $812.40', /⏳ waiting: 💳 bill — Pay Lumber Yard Co — \$812\.40/.test(rows[iBill] || ''), rows[iBill]);
  ok('the three 👷 crew cards (a day, no time) fold into one row at THEIR day — between eight days back and a month back, not "right now"', (() => {
    const i = at(/3 crew messages waiting/); return i > iEight && i < at(/A month back/);
  })(), JSON.stringify(rows));
  ok('a text card still sits at its arrival and a QuickBooks line at its date (as before)', (() => {
    const t = at(/see you at 8/), q = at(/QuickBooks line — Fuel Stop/);
    return t > at(/Yesterday note/) && t < iPhoto && q > t && q < iPhoto;
  })(), JSON.stringify(rows));
  ok('the renew card sits at today (when this app first held it), never above today — its row reads a time of day, not a date in 2099', (() => {
    const i = at(/Renew: Some policy/); return i >= 0 && i <= iNewest + 1 && /^\d{1,2}:\d{2}/.test(rowW[i] || '');
  })(), JSON.stringify({ rows: rows.slice(0, 3), when: rowW.slice(0, 3) }));

  console.log('— 🆕 v7.11 a card made on this phone is stamped as it is saved —');
  ok('a new card pushed and saved gets its stamp at once (and a due date in the future still never places it)', await page.evaluate(async () => {
    pendingQueue.push({ id: 'bill:2099-06-01:new vendor', kind: 'bill', payload: { who: 'New Vendor', amt: 10, due: '2099-06-01', text: 'Pay New Vendor — $10.00', what: 'not on any entry' } });
    savePendingSoon();
    const p = pendingQueue.find(x => x.id === 'bill:2099-06-01:new vendor');
    renderAskRecent();
    const first = (document.querySelector('#askRecent .ask-recent-row') || {}).textContent || '';
    return !!p.at && Math.abs(Date.parse(p.at) - Date.now()) < 60000 && !/2099/.test(first);
  }));

  ok('no page errors', errs.length === 0, errs.join(' | '));
  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close(); process.exit(fail ? 1 : 0);
})();
