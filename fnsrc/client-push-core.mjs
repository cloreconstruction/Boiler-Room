// client-push-core.mjs — 🔔 v6.68 HOMEOWNER PINGS, the logic. No imports, so the test suite can
// run it in plain node with everything stubbed; client-push.mjs wraps it with web-push + Dropbox.
//
// Eric's spec (parked since v6.35, built on his "do 1-5"): opt-in on the client page; each
// client's subscriptions in THEIR OWN file (Client Portal/push-<code>.json — never Eric's
// App Data/push-subs.json, so a NOW alert can never reach a homeowner and a homeowner ping can
// never reach the crew); ONLY two triggers — the journal was posted, the budget changed; the
// words are fixed and generic (no name, no dollar figure — a lock screen is public); one ping
// per burst (the same client + kind within 30 minutes is one ping); delivery only 9am–5pm
// Alaska — anything outside the window waits in push-queue.json for the 9am drain.
//
// Files (all function-owned, all under /Clore DayLog/App Data/Client Portal/):
//   push-<code>.json   [{ sub:{endpoint,keys}, ts, ua }]   written by client-portal on opt-in
//   push-queue.json    [{ c, kind, ts }]                     off-hours pings, drained at 9am
//   push-log.json      { "<code>:<kind>": "<iso of last send>" }  the burst rule's memory

export const BASE = '/Clore DayLog/App Data/Client Portal';
export const KINDS = ['journal', 'budget'];
export const WORDS = {
  journal: { title: '📖 Project update', body: 'A new journal entry was posted on your project page.' },
  budget: { title: '💰 Project update', body: 'The budget on your project page was updated.' },
};
export const WINDOW = { from: 9, to: 17 };          // Alaska local hours, 9:00 ≤ h < 17:00
export const BURST_MIN = 30;                          // one ping per client per kind per half hour
export const clean = s => String(s || '').replace(/[^a-z0-9-]/gi, '').slice(0, 40);

// the hour of the day in Alaska, whatever the server's own clock says
export function alaskaHour(d) {
  const s = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Anchorage', hour: 'numeric', hour12: false }).format(d);
  const h = parseInt(s, 10);
  return isNaN(h) ? 0 : h % 24;
}
export const inWindow = d => { const h = alaskaHour(d); return h >= WINDOW.from && h < WINDOW.to; };

// the words are FIXED — nothing from the request can reach a lock screen. The url is where the
// tap lands (their own page); it rides inside the encrypted payload, never in the words.
export function payloadFor(kind, c) {
  const w = WORDS[kind];
  return JSON.stringify({ title: w.title, body: w.body, tag: 'cp-' + kind, url: '/c/?c=' + clean(c) });
}
// a subscription is what the browser handed the page — nothing else is stored
export function subOk(s) {
  return !!(s && typeof s === 'object' && typeof s.endpoint === 'string' && /^https:\/\//.test(s.endpoint) && s.endpoint.length < 600 &&
    s.keys && typeof s.keys.p256dh === 'string' && typeof s.keys.auth === 'string');
}

// ---- the sender. deps: { dl(path)→text|null, up(path, text), send(sub, payload)→true|'dead', now()→Date, log?(s) }
async function readJson(deps, path, fallback) {
  try { const t = await deps.dl(path); const j = t == null ? null : JSON.parse(t); return j == null ? fallback : j; } catch (e) { return fallback; }
}
export async function sendKind(deps, c, kind) {
  const subsPath = `${BASE}/push-${c}.json`;
  const subs = await readJson(deps, subsPath, []);
  if (!Array.isArray(subs) || !subs.length) return { sent: 0, dead: 0, total: 0 };
  const payload = payloadFor(kind, c);
  let sent = 0, dead = 0;
  const keep = [];
  for (const row of subs) {
    const sub = row && row.sub ? row.sub : row;
    if (!subOk(sub)) continue;
    const r = await deps.send(sub, payload);
    if (r === 'dead') { dead++; continue; }          // 404 / 410 — the phone let the subscription go
    sent++; keep.push(row);
  }
  if (dead) await deps.up(subsPath, JSON.stringify(keep, null, 1));
  return { sent, dead, total: subs.length };
}
// the burst rule: the same client + kind inside BURST_MIN minutes is ONE ping
export async function burstOk(deps, c, kind, now) {
  const logPath = `${BASE}/push-log.json`;
  const log = await readJson(deps, logPath, {});
  const key = `${c}:${kind}`;
  const last = log && log[key] ? new Date(log[key]) : null;
  if (last && !isNaN(last) && now - last < BURST_MIN * 60000) return false;
  log[key] = now.toISOString();
  await deps.up(logPath, JSON.stringify(log, null, 1));
  return true;
}
// what the app calls: { c, kind } — send now inside the window, else queue for the drain
export async function ping(deps, body) {
  const c = clean(body && body.c), kind = String((body && body.kind) || '');
  if (!c || !KINDS.includes(kind)) return { ok: false, why: 'bad' };
  const now = deps.now();
  if (!inWindow(now)) {
    const qPath = `${BASE}/push-queue.json`;
    const q = await readJson(deps, qPath, []);
    const arr = Array.isArray(q) ? q : [];
    if (!arr.some(x => x && x.c === c && x.kind === kind)) { arr.push({ c, kind, ts: now.toISOString() }); await deps.up(qPath, JSON.stringify(arr, null, 1)); }
    return { ok: true, queued: true, hour: alaskaHour(now) };
  }
  if (!(await burstOk(deps, c, kind, now))) return { ok: true, skipped: 'burst' };
  const r = await sendKind(deps, c, kind);
  return { ok: true, ...r };
}
// what the 9am timer calls: send everything that waited, then clear the queue
export async function drain(deps) {
  const now = deps.now();
  if (!inWindow(now)) return { ok: true, held: true, hour: alaskaHour(now) };
  const qPath = `${BASE}/push-queue.json`;
  const q = await readJson(deps, qPath, []);
  const arr = Array.isArray(q) ? q.filter(x => x && clean(x.c) && KINDS.includes(x.kind)) : [];
  let sent = 0, skipped = 0;
  for (const x of arr) {
    if (!(await burstOk(deps, clean(x.c), x.kind, now))) { skipped++; continue; }
    const r = await sendKind(deps, clean(x.c), x.kind);
    sent += r.sent;
  }
  if (q != null && (Array.isArray(q) ? q.length : true)) await deps.up(qPath, '[]');
  return { ok: true, drained: arr.length, sent, skipped };
}
