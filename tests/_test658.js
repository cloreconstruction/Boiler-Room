// 👷 v6.58 — CREW LABOR FROM PHIL'S WEEKLY RECAP. Eric: "we know the crews' pay, and we have the
// crews' summary now … a crew labor hours page … pushing send to the homeowner's estimated summary."
// The recap email is recognised by sender + subject (never the judge), parsed, priced with Eric's
// Labor Hour Rate Schedule, and sent to a client's page as one labor line per week.
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

  // the email exactly as the pipe delivers it — CRLF, and a job header glued to the crew line above it
  const BODY = [
    ' Clore Construction · Job recap', 'Week of Aug 30 to Sep 5', '115 h across 5 jobs', 'mery · 62 h', '',
    'We got a lot done this week: the crew framed out the side sheeting, wrapped', 'up the demo work, and hung the siding.',
    'ready to forward to the homeowner', 'Work', 'Framing 27.59 h', 'Siding 20.77 h', 'Cleanup 4.49 h', 'Logistics / maintenance 3.7 h',
    'Decks 3.47 h', 'Demo 1 h', 'Kitchen cabinets and vanities 1 h', 'Crew', 'Fisher-Nelson, Canaan 27.72 h', 'Wynn, Nathaniel 27.34 h',
    'Kneeland, Philip 5.95 h', 'Clore, Milo 1 h rininger · 35.12 h', '',
    'We had three of us out there this week working roofing.', 'ready to forward to the homeowner', 'Work', 'Roofing 23.32 h',
    'Logistics / maintenance 11.8 h', 'Crew', 'Wynn, Nathaniel 14.29 h', 'Fisher-Nelson, Canaan 10.69 h', 'Kneeland, Philip 10.15 h Josten · 11.55 h', '',
    'We picked up your cabinets and got them stored in your garage.', 'ready to forward to the homeowner', 'Work', 'Cleanup 7.15 h',
    'Interior paint 2.65 h', 'Logistics / maintenance 1.22 h', 'Winter costs 0.54 h', 'Crew', 'Kneeland, Philip 6.62 h', 'Fisher-Nelson, Canaan 3.72 h',
    'Clore, Milo 1.22 h 939 baleen · 3.74 h', '', 'Got the new dryer picked up and installed this week.', 'ready to forward to the homeowner',
    'Work', 'Appliances 2.5 h', 'Logistics / maintenance 1.24 h', 'Crew', 'Clore, Eric 2.5 h', 'Clore, Milo 1.24 h Miranda duplex · 2.6 h', '',
    'Mowed the lawn at the duplex this week.', 'ready to forward to the homeowner', 'Work', 'Logistics / maintenance 2.6 h', 'Crew', 'Clore, Eric 2.6 h',
    'Still missing this week', 'Hughes, Aaron Mon 31 Tue 1 Wed 2 Thu 3 Fri 4', 'Clore, Milo Mon 31 Wed 2 Fri 4', 'The numbers above may grow.', 'Open the dashboard'
  ].join('\r\n');
  const TXT = 'FROM: Phil Kneeland<pdkneela@gmail.com>\r\nSUBJECT:Job recap, week of Aug 30: 115 h across 5 jobs\r\n\r\n' + BODY;

  await page.evaluate(() => {
    jobs = ['Mery', 'Josten/Weiser', 'Rininger', 'Shop / Admin', 'Miranda Duplex', 'Miranda Shop'];
    curJob = 'Mery'; crew = []; entries = []; todos = []; nextId = 1;
    prefs.tagScrub1 = true; prefs.tagScrub2 = true; prefs.laborWeeks = {}; prefs.recapJobs = {}; prefs.crewTier = {};
    prefs.mailOk = ['pdkneela@gmail.com']; prefs.mailNo = []; prefs.mailPersonal = []; prefs.mailSort = true;
    renderJobSelects(); closePanels(); renderAll();
    window._dbxFiles = {}; window._dbxLog = [];
    window.dbxDownload = async path => (window._dbxFiles || {})[path] ?? null;
    window.dbxUpload = async (path, body) => { (window._dbxFiles || {})[path] = body; return {}; };
    window.dbxPathExists = async path => Object.prototype.hasOwnProperty.call(window._dbxFiles || {}, path);
    window.scheduleSave = () => {};
    window.pendMarkDone = () => {}; window.archiveText = async () => {};
    window._judged = 0; window.mailJudge = async () => { window._judged++; return { bucket: 'maybe', why: 'other', gist: '', by: 'phone' }; };
    dbx.refreshToken = dbx.refreshToken || 'test-token';
  });

  console.log('— 👷 v6.58 the recap is read, never judged —');

  ok('the sweep knows the recap by sender + subject and never sends it to the judge', await page.evaluate(async TXT => {
    const m = mailParse(TXT);
    await mailSort(m, { name: 'Email -Job recap, week of Aug 30 115 h across 5 jobs.txt', path_lower: '/x', server_modified: '2026-09-10T16:58:00Z' }, 'id1');
    return window._judged === 0 && !!prefs.laborWeeks['2026-08-30'];
  }, TXT));

  ok('a different email from Phil still walks the normal door', await page.evaluate(async () => {
    const m = mailParse('FROM: Phil Kneeland<pdkneela@gmail.com>\r\nSUBJECT:need tuesday off\r\n\r\ncan I have tuesday off');
    await mailSort(m, { name: 'Email -need tuesday off.txt', path_lower: '/y', server_modified: '2026-09-10T17:00:00Z' }, 'id2');
    return window._judged === 1;
  }));

  ok('it is filed as an email entry under Shop / Admin with the week on it', await page.evaluate(() => {
    const e = entries.find(x => x.labor === '2026-08-30');
    return !!e && e.job === 'Shop / Admin' && /Job recap/.test(e.details);
  }));

  console.log('— 🔎 v6.58 the parser —');

  const r = await page.evaluate(() => prefs.laborWeeks['2026-08-30']);
  ok('week dated from the words, year from the email', r && r.week === '2026-08-30' && r.to === '2026-09-05' && r.total === 115);
  ok('five jobs, in order, with their hours', r && r.jobs.map(j => j.name + ':' + j.hours).join('|') === 'mery:62|rininger:35.12|Josten:11.55|939 baleen:3.74|Miranda duplex:2.6');
  ok('the glued header did not eat the crew line before it', r && r.jobs[0].crew.some(c => c.name === 'Clore, Milo' && c.h === 1) &&
    r.jobs[1].crew.some(c => c.name === 'Kneeland, Philip' && c.h === 10.15));
  ok('work types and hours, exactly', r && r.jobs[0].work.length === 7 && r.jobs[0].work[0].cat === 'Framing' && r.jobs[0].work[0].h === 27.59 &&
    r.jobs[0].work[6].cat === 'Kitchen cabinets and vanities');
  ok('the paragraph Phil wrote for the homeowner is kept, and only that', r && /framed out the side sheeting/.test(r.jobs[0].note) && !/ready to forward/.test(r.jobs[0].note) && !/Framing 27/.test(r.jobs[0].note));
  ok('who is still missing days', r && r.missing.length === 2 && r.missing[0].name === 'Hughes, Aaron' && r.missing[0].days.length === 5);

  console.log('— 💵 v6.58 hours × Eric\'s rate schedule —');

  ok('tiers: Canaan & Milo 1, Nathan 2, Phil & Aaron 3 — by first name, from "Last, First"', await page.evaluate(() =>
    laborTier('Fisher-Nelson, Canaan').tier === 1 && laborTier('Clore, Milo').tier === 1 && laborTier('Wynn, Nathaniel').tier === 2 &&
    laborTier('Kneeland, Philip').tier === 3 && laborTier('Hughes, Aaron').tier === 3));

  ok('a name Eric has not placed is flagged, not guessed', await page.evaluate(() => {
    const t = laborTier('Somebody, New');
    return t.known === false && t.tier === 1;
  }));

  ok('prefs.crewTier overrides the default', await page.evaluate(() => {
    prefs.crewTier = { canaan: 2 };
    const t = laborTier('Fisher-Nelson, Canaan').tier;
    prefs.crewTier = {};
    return t === 2;
  }));

  ok('the schedule is Eric\'s sheet, to the dollar', await page.evaluate(() =>
    LABOR_RATES['Foundation Labor'][2] === 135 && LABOR_RATES['Roofing'][1] === 115 && LABOR_RATES['Demo'][0] === 60 && Object.keys(LABOR_RATES).length === 15));

  ok('Mery\'s week prices from the crew mix — blended tier, each line saying its row and rate', await page.evaluate(() => {
    const p = laborPrice(prefs.laborWeeks['2026-08-30'].jobs[0]);
    // crew: Canaan 27.72 (t1) + Milo 1 (t1) = 28.72 ; Nathan 27.34 (t2) ; Phil 5.95 (t3) ; of 62.01
    const tot = 27.72 + 27.34 + 5.95 + 1;
    const fr = Math.round((28.72 / tot * 60 + 27.34 / tot * 80 + 5.95 / tot * 100) * 100) / 100;   // Framing & Siding row
    const framing = p.lines.find(l => l.cat === 'Framing');
    return framing.row === 'Framing & Siding' && Math.abs(framing.rate - fr) < 0.011 && Math.abs(framing.amt - Math.round(27.59 * fr * 100) / 100) < 0.02 &&
      p.hours === 62.02 && p.total > 0 && p.total === Math.round(p.lines.reduce((s, l) => s + l.amt, 0) * 100) / 100;
  }));

  ok('a work type not in the table bills as Misc and SAYS so', await page.evaluate(() => {
    const p = laborPrice({ hours: 2, work: [{ cat: 'Juggling', h: 2 }], crew: [{ name: 'Kneeland, Philip', h: 2 }] });
    return p.lines[0].row === 'Misc Labor' && p.lines[0].known === false && p.lines[0].rate === 100 && p.lines[0].amt === 200;
  }));

  ok('nobody listed on the crew → priced at tier 3, the safe side', await page.evaluate(() => {
    const p = laborPrice({ hours: 1, work: [{ cat: 'Roofing', h: 1 }], crew: [] });
    return p.lines[0].rate === 155;
  }));

  console.log('— 🔗 v6.58 which job is "josten" —');

  ok('exact name, or the one job that starts with it; two candidates = ask', await page.evaluate(() =>
    laborJobFor('mery') === 'Mery' && laborJobFor('Josten') === 'Josten/Weiser' && laborJobFor('939 baleen') === '' && laborJobFor('Miranda duplex') === 'Miranda Duplex' && laborJobFor('miranda') === ''));

  ok('taught once, remembered', await page.evaluate(() => {
    laborJobLearn('939 baleen', 'Shop / Admin');
    return laborJobFor('939 baleen') === 'Shop / Admin' && prefs.recapJobs['939 baleen'] === 'Shop / Admin';
  }));

  console.log('— 🏠 v6.58 send the week to their page —');

  const seedPortal = () => page.evaluate(() => {
    _portalIdx = { clients: [{ key: 'mery', job: 'Mery Addition & Remodel', code: 'mery-224374' }] };
    window._dbxFiles = {};
    window._dbxFiles[portalRoot() + '/mery-224374.json'] = JSON.stringify({ name: 'Mery', invoiced: 50000, phases: [] });
    window._dbxFiles[portalRoot() + '/index.json'] = JSON.stringify(_portalIdx);
    _rcptSel = new Set(); _estD = null; _estPaid = null; _estIdx = -1; window._qUpBusy = false;
  });

  await seedPortal();
  ok('the receipts window shows the week for Mery: hours, the priced lines, the crew, NOT ON IT', await page.evaluate(async () => {
    await openRcptReview(0);
    const t = $('revBox').textContent;
    return /CREW LABOR/.test(t) && /Week of Aug 30 — 62\.02 h/.test(t) && /Framing 27\.59 h → Framing & Siding/.test(t) &&
      /Fisher-Nelson, Canaan 27\.72 h · tier 1/.test(t) && /NOT ON IT/.test(t) && /SEND WEEK/.test(t);
  }));

  ok('the unmatched recap job is offered as a one-time pick, not guessed', await page.evaluate(() => {
    delete prefs.recapJobs['939 baleen'];
    renderRcptReview();
    const t = $('revBox').textContent;
    return /not matched to a job yet/.test(t) && /939 baleen/.test(t);
  }));

  ok('✓ SEND puts one labor line on their page — week, hours, dollars; no names, no rates', await page.evaluate(async () => {
    await laborSend('2026-08-30');
    const pg = JSON.parse(window._dbxFiles[portalRoot() + '/mery-224374.json']);
    const it = (pg.upcoming || { items: [] }).items.find(i => /^Labor — week of Aug 30 \(62\.02 h\)$/.test(i.n));
    const p = laborPrice(prefs.laborWeeks['2026-08-30'].jobs[0]);
    const s = JSON.stringify(pg.upcoming);
    return !!it && it.a === p.total && pg.upcoming.tot === p.total && !/Canaan|Kneeland|Nathaniel|tier|\/h|rate/i.test(s);
  }));

  ok('no markup on labor — the schedule is already loaded', await page.evaluate(() => {
    const b = JSON.parse(window._dbxFiles[estPath('mery-224374')]);
    const lab = b.cats.find(x => x.n === 'Labor');
    return lab && lab.pend[0].inc === true && lab.pend[0].kind === 'labor' && lab.pend[0].base === 50000 && estPendMk(lab.pend[0]) === lab.pend[0].a;
  }));

  ok('the window now reads ON THEIR PAGE, with a take-back', await page.evaluate(() => {
    const t = $('revBox').textContent;
    return /🟢 ✓ ON THEIR PAGE/.test(t) && /Take back/.test(t) && !/SEND WEEK/.test(t);
  }));

  ok('sending the same week twice is refused', await page.evaluate(async () => {
    await laborSend('2026-08-30');
    const b = JSON.parse(window._dbxFiles[estPath('mery-224374')]);
    return b.cats.find(x => x.n === 'Labor').pend.length === 1 && /already on their page/.test($('toast').textContent);
  }));

  ok('the week clears itself once their INVOICED total has grown by it', await page.evaluate(async () => {
    const p = laborPrice(prefs.laborWeeks['2026-08-30'].jobs[0]);
    const before = JSON.parse(window._dbxFiles[estPath('mery-224374')]);
    _estD = before; _estPage = { invoiced: 50000 + p.total };
    const n = estAutoClear();
    const okNow = n === 1 && !_estD.cats.find(x => x.n === 'Labor').pend && _estD.cleared[0].kind === 'labor' && _estD.cleared[0].wk === '2026-08-30' && _estD.cleared[0].why === 'qb';
    _estD = before; _estPage = null;
    return okNow;
  }));

  ok('…but not before the books have it', await page.evaluate(() => {
    const b = JSON.parse(window._dbxFiles[estPath('mery-224374')]);
    _estD = b; _estPage = { invoiced: 50000 + 10 };
    const n = estAutoClear();
    _estD = null; _estPage = null;
    return n === 0 && b.cats.find(x => x.n === 'Labor').pend.length === 1;
  }));

  ok('↩ Take back pulls it off their page and reopens the week', await page.evaluate(async () => {
    await laborTakeBack('2026-08-30');
    const pg = JSON.parse(window._dbxFiles[portalRoot() + '/mery-224374.json']);
    const t = $('revBox').textContent;
    return !pg.upcoming && /TAKEN BACK/.test(t) && /SEND WEEK/.test(t);
  }));

  console.log('— 📖 v6.58 the crew\'s words in the journal window —');

  ok('the journal window offers Phil\'s paragraph for this job, reading only', await page.evaluate(async () => {
    closeRcptReview();
    _jrnIdx = 0;
    await openJournal(0);
    const t = ($('jrnRecap') || {}).textContent || '';
    return /THE CREW'S WORDS · WEEK OF AUG 30 · 62 H/.test(t) && /framed out the side sheeting/.test(t) && $('jrnText').value === '';
  }));

  ok('⤵ Build on it lands it UNDER his own words', await page.evaluate(() => {
    $('jrnText').value = 'Roof goes on Tuesday.';
    jrnBuildOnRecap();
    const v = $('jrnText').value;
    closeReview();
    return v.indexOf('Roof goes on Tuesday.') === 0 && /framed out the side sheeting/.test(v);
  }));

  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v6.58') && document.querySelector('footer').textContent.includes(APP_VER);
  }));

  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
