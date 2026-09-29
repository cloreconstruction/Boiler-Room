// push-rules.mjs — 🔔 v7.39 — the one rule every push to Eric's own devices obeys at the cloud door (notify.mjs): the same
// words as pushRule() in index.html, which the app runs first. His hours are a window on his own clock (the settings carry
// his phone's time zone); a kind he turned off never rings; "only urgent" lets through only what the sender marked urgent.
// No settings file, or a broken one, means everything rings — the way it always did. No imports, so the suite runs it in node.
export function hourIn(now, tz) {
  try { return parseInt(new Intl.DateTimeFormat('en-US', { timeZone: tz || 'America/Anchorage', hour: '2-digit', hour12: false }).format(now || new Date()), 10) % 24; }
  catch (e) { return (now || new Date()).getHours(); }
}
export function pushWindowOpen(win, hour) {
  const from = win.from, to = win.to;
  if (from === to) return true;   // all day
  return from < to ? (hour >= from && hour < to) : (hour >= from || hour < to);   // an overnight window wraps midnight
}
export function pushRule(settings, kind, urgent, hour) {
  if (!settings || typeof settings !== 'object') return { ok: true, why: 'no settings' };
  const k = String(kind || 'other'), kinds = settings.kinds && typeof settings.kinds === 'object' ? settings.kinds : {};
  if (kinds[k] === false) return { ok: false, why: k + ' is off' };
  if (settings.urgent === true && !urgent) return { ok: false, why: 'only urgent' };
  if (settings.win && !pushWindowOpen(settings.win, hour)) return { ok: false, why: 'outside his hours' };
  return { ok: true, why: '' };
}
const num = (v, d) => { const x = parseInt(v, 10); return x >= 0 && x <= 23 ? x : d; };
export function pushAllowed(settings, kind, urgent, now) {
  if (!settings || typeof settings !== 'object') return { ok: true, why: 'no settings' };
  const win = settings.win && typeof settings.win === 'object' ? { from: num(settings.win.from, 7), to: num(settings.win.to, 20) } : null;
  return pushRule({ ...settings, win }, kind, urgent, hourIn(now, settings.tz));
}
