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
    renderJobSelects(); closePanels(); renderAll();
    window._dbxFiles = {};
    window.dbxDownload = async path => (window._dbxFiles || {})[path] ?? null;
    window.dbxUpload = async (path, body) => { (window._dbxFiles || {})[path] = body; return {}; };
    window.dbxPathExists = async path => Object.prototype.hasOwnProperty.call(window._dbxFiles || {}, path);
    window.scheduleSave = () => {};
    dbx.refreshToken = dbx.refreshToken || 'test-token';
    _portalIdx = { clients: [{ key: 'mery', job: 'Mery Addition & Remodel', code: 'mery-224374' }] };
  });

  // 🧾 v6.36 — Eric: "lets add the ones i dont have and he does to the app and anywhere there
  // are categories to choose from. although the landfill one just make it say trash or
  // constructin debris as there will be more then just landfill fees in the trash category."
  const NEW = ['Surveying', 'Water Softener', 'Bathrooms', 'Contingency', 'Trash / Construction Debris', 'Snow Plowing', 'Temporary Electric'];
  console.log('— 🧾 v6.36 seven categories join from Logan\'s QuickBooks list —');

  ok('the standing list is 55 — the 48 plus seven, no doubles', await page.evaluate(() =>
    EST_DEFAULT_CATS.length === 55 && new Set(EST_DEFAULT_CATS.map(c => c.toLowerCase())).size === 55));

  ok('all seven are on the standing list, spelled exactly', await page.evaluate(N => N.every(n => EST_DEFAULT_CATS.includes(n)), NEW));

  ok('Landfill, Garbage/Janitorial and "Softner" never made it — one Trash bucket and the right spelling did', await page.evaluate(() =>
    !EST_DEFAULT_CATS.includes('Landfill') && !EST_DEFAULT_CATS.includes('Water Softner') && !EST_DEFAULT_CATS.some(c => /janitorial|garbage/i.test(c))));

  ok('each new one sits beside its own trade, so a fresh board still reads in build order', await page.evaluate(() => {
    const i = n => EST_DEFAULT_CATS.indexOf(n);
    return i('Temporary Electric') === i('HEA') + 1 && i('Water Softener') === i('Air') + 1 && i('Bathrooms') === i('Vanities and sinks') + 1 &&
      i('Snow Plowing') === i('Winter costs') + 1 && i('Trash / Construction Debris') === i('Snow Plowing') + 1 && i('Contingency') === i('Misc') + 1 &&
      i('Surveying') === i('Engineering') + 1;
  }));

  ok('the 48 he already had keep their relative order', await page.evaluate(N => {
    const kept = EST_DEFAULT_CATS.filter(n => !N.includes(n));
    const was = ['Demo', 'Well line, sewerline to house', 'Septic', 'Dirt work', 'Enstar', 'HEA', 'Well', 'Plumbing', 'Heating', 'Air', 'Concrete and foundation', 'ICF Walls', 'Window Wells', 'Framing', 'Trusses', 'Roofing', 'Windows', 'Exterior Doors', 'Gypcrete', 'Electrical', 'Insulation', 'Urethane', 'Drywall, Mud and Texture', 'Interior Paint', 'Siding', 'Decks', 'Helical Piers', 'Ext Painting', 'Kitchen cabinets', 'Countertops', 'Vanities and sinks', 'Int Doors', 'Trim', 'Drop ceiling', 'Tile (floors)', 'Tile (Showers)', 'Flooring', 'Carpet', 'Garage Doors', 'Gutters', 'Closet Interiors', 'Appliances', 'Woodstove or fireplace', 'Winter costs', 'Misc', 'Inspections / Permit', 'Engineering', 'Add ons'];
    return kept.length === 48 && kept.join('|') === was.join('|');
  }, NEW));

  ok('they ride into the receipt list and the file cabinet list for free', await page.evaluate(N => N.every(n => RCPT_CATS.includes(n) && FC_CATS.includes(n)), NEW));

  ok('none of them is overhead — every one may reach a client page', await page.evaluate(N => N.every(n => !OVERHEAD_CATS.includes(n)), NEW));

  ok('the wage list is untouched — no hourly rate was invented for them', await page.evaluate(N => N.every(n => !HOUR_CATS.includes(n)), NEW));

  ok('a brand-new board opens with all 55, in the standing order, and the names are on screen', await page.evaluate(async () => {
    window._dbxFiles = {};
    await openEstimates(0);
    const names = (_estD && _estD.cats || []).map(x => x.n);
    const t = $('revBox').textContent;
    const good = names.length === 55 && names.join('|') === EST_DEFAULT_CATS.join('|') &&
      /Trash \/ Construction Debris/.test(t) && /Water Softener/.test(t) && /Surveying/.test(t) && /Snow Plowing/.test(t);
    closeEstimates();
    return good;
  }));

  ok('a board that ALREADY exists keeps its order and its bids — the seven join at the BOTTOM', await page.evaluate(async N => {
    const old48 = EST_DEFAULT_CATS.filter(n => !N.includes(n));
    const saved = { updated: '2026-09-01', mk: 20, cats: old48.map(n => ({ n, appr: n === 'Framing', bids: n === 'Framing' ? [{ e1: 1000, e2: 0, note: '', docs: [], acc: true }] : [] })) };
    window._dbxFiles = {}; window._dbxFiles[estPath('mery-224374')] = JSON.stringify(saved);
    await openEstimates(0);
    const names = (_estD && _estD.cats || []).map(x => x.n);
    const appended = EST_DEFAULT_CATS.filter(n => N.includes(n));
    const fr = (_estD.cats || []).find(x => x.n === 'Framing');
    const good = names.length === 55 && names.slice(0, 48).join('|') === old48.join('|') && names.slice(48).join('|') === appended.join('|') &&
      !!fr && fr.appr && estTotal(fr) === 1200;
    closeEstimates();
    return good;
  }, NEW));

  ok('a board with nothing approved shows NOTHING on the client page — empty categories never publish', await page.evaluate(async () => {
    window._dbxFiles = {};
    await openEstimates(0);
    const showing = _estD.cats.filter(x => x.appr && estTotal(x) > 0).length;
    closeEstimates();
    return showing === 0;
  }));

  ok('the 🧾 category window offers all seven', await page.evaluate(N => {
    qnRcpt = true; qnCat = ''; qnJobPick = 'Mery';
    catModalOpen();
    const t = $('catBox').textContent;
    catModalClose();
    return N.every(n => t.includes(n));
  }, NEW));

  ok('the file cabinet dropdown offers all seven', await page.evaluate(N => {
    fcOpenInit();
    const opts = [...$('fcCat').options].map(o => o.textContent);
    return N.every(n => opts.includes(n));
  }, NEW));

  ok('version bumped — APP_VER and the footer agree', await page.evaluate(() => {
    const num = v => (String(v).match(/(\d+)\.(\d+)/) || []).slice(1).reduce((a, b) => a * 1000 + +b, 0);
    return num(APP_VER) >= num('v6.36') && document.querySelector('footer').textContent.includes(APP_VER);
  }));

  ok('no page errors through all of it', errs.length === 0, errs.join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
