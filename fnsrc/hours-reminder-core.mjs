// hours-reminder-core.mjs — ⏱ v7.01 the "look at the crew's hours" nudge: THE DECIDING, with no imports, so the suite
// can run it in node. Eric: "i need some kind of reminder to look at payroll every week or two weeks, every week is
// better for the summary." The timer wakes every hour; this says yes ONCE — on the day and the Alaska hour he chose, and
// (every two weeks) only in the week right after a pay period ended. It fails closed: no settings, or OFF, is a no.
// The words are fixed — no name, no dollars, no hours (a lock screen is public).
export const WORDS = { title: '⏱ Crew hours', body: 'Time to look at the crew\'s hours for the week. Open Boiler Room, then Crew portal, then Crew hours.' };
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export function alaskaParts(d) {
  const f = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Anchorage', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hour12: false, weekday: 'short' }).formatToParts(d);
  const g = t => (f.find(x => x.type === t) || {}).value || '';
  return { ymd: `${g('year')}-${g('month')}-${g('day')}`, hour: parseInt(g('hour'), 10) % 24, dow: DOW.indexOf(g('weekday')) };
}
export function due(settings, state, now) {
  const s = settings || {};
  if (s.on !== true) return { send: false, why: 'off' };
  const day = Number.isInteger(s.day) && s.day >= 0 && s.day <= 6 ? s.day : 5, at = Number.isInteger(s.at) && s.at >= 5 && s.at <= 20 ? s.at : 8;
  const p = alaskaParts(now);
  if (p.hour !== at) return { send: false, why: 'hour', ...p };
  if (p.dow !== day) return { send: false, why: 'day', ...p };
  if (state && state.last === p.ymd) return { send: false, why: 'already', ...p };
  if (s.every === 2) {   // the week right after a pay period ends: the Saturday on or before today is the anchor Saturday + a whole number of fortnights
    const anchor = Date.parse(String(s.anchor || '') + 'T12:00:00Z');
    if (isNaN(anchor)) return { send: false, why: 'no-anchor', ...p };
    const lastSat = Date.parse(p.ymd + 'T12:00:00Z') - ((p.dow + 1) % 7) * 86400e3, weeks = Math.round((lastSat - anchor) / (7 * 86400e3));
    if (weeks % 2 !== 0) return { send: false, why: 'off-week', ...p };
  }
  return { send: true, why: 'due', ...p };
}
