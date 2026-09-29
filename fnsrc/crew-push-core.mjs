// crew-push-core.mjs — 👷 v7.47 THE ROAD TO THE CREW'S PHONES: the deciding, with no npm imports, so the suite runs it in node.
// Eric, 2026-09-29, with the list of nine crew alerts in front of him: "Yes to all." Until now nothing could ring a crew
// phone — a crew phone's subscription sits in ITS OWN folder (Crew/<name>/App Data/push-subs.json, where its Turn on
// notifications always saved it) and the sender only ever read Eric's. This is who gets a push, whether it rings, and what it
// says:
//   · WHO — the names the app asks for, or 'crew' (everyone) / 'office' (the office crew), checked against the crew folders
//     that are really there; an office-only alert reaches office people whatever was asked; the sender is never rung himself.
//   · WHETHER — that person's own hours and switches (Crew/<name>/App Data/push-settings.json, written by THEIR phone in
//     ⚙ Setup → 🔔 Notifications). No file yet = the hours the app starts with, 7 AM to 8 PM Alaska — never "at any hour".
//     A kind that can come in bursts rings once and then rests (THROTTLE_MIN).
//   · WHAT — fixed words, kept HERE: no name, no job, no dollars, none of the note's own words (a lock screen is public).
//     Whatever title or body a caller sends for a crew push is ignored.
import { pushAllowed } from './push-rules.mjs';

export const CREW_DIR = '/Clore DayLog/Crew';
export const cleanName = s => String(s || '').replace(/[\\/:*?"<>|#%&{}]/g, '-').replace(/\s+/g, ' ').trim();   // the app's cleanName, word for word

export const CREW_WORDS = {
  ask: { title: '⚠ Eric needs an answer', body: 'Open Boiler Room — it is at the top of WITH ERIC.', urgent: true },
  eric: { title: '📨 From Eric', body: 'A note is waiting for you in Boiler Room.' },
  reply: { title: '↩ Eric answered you', body: 'Open Boiler Room to read it.' },
  board: { title: '📋 Your board', body: 'Something new is on your board in Boiler Room.' },
  card: { title: '📇 A job card changed', body: 'An address, a contact or a code changed — look before you go.' },
  plans: { title: '📐 New plans', body: 'A new set is on the plan rack — build from the newest one.' },
  journal: { title: '📖 A job journal is due', body: 'A homeowner has gone a week without a journal. Open Boiler Room, then Project portal.' },
  client: { title: '🏠 A homeowner picked or asked', body: 'Open Boiler Room, then Project portal.' },
  stuck: { title: '🚧 The Build List needs a look', body: 'A row was marked first or stuck — open the Build List.' } };
export const OFFICE_KINDS = ['journal', 'client', 'stuck'];
export const THROTTLE_MIN = { client: 30, card: 10, stuck: 10, plans: 5 };
export const CREW_DEFAULTS = { win: { from: 7, to: 20 }, kinds: {}, urgent: false, tz: 'America/Anchorage' };

// who is rung: roster = [{ name, office }] read off the crew folders
export function targetsOf(to, roster, from, kind) {
  const key = x => cleanName(x).toLowerCase();   // a roster name IS its folder's name — the asked-for names are cleaned the same way
  const me = key(from);
  let list = (roster || []).filter(r => r && r.name && key(r.name) !== me);
  if (OFFICE_KINDS.includes(kind)) list = list.filter(r => r.office);
  if (to === 'crew') return list.map(r => r.name);
  if (to === 'office') return list.filter(r => r.office).map(r => r.name);
  const want = (Array.isArray(to) ? to : [to]).map(key).filter(Boolean);
  return list.filter(r => want.includes(key(r.name))).map(r => r.name).slice(0, 40);
}
// does it ring THIS person now? his own settings (or the starting ones), then the rest a bursty kind takes
export function decide(settings, kind, now, state, name) {
  const w = CREW_WORDS[kind];
  if (!w) return { ok: false, why: 'unknown kind' };
  const s = settings && typeof settings === 'object' ? { ...CREW_DEFAULTS, ...settings } : CREW_DEFAULTS;
  const gate = pushAllowed(s, kind, !!w.urgent, now);
  if (!gate.ok) return gate;
  const min = THROTTLE_MIN[kind] || 0;
  if (min) {
    const last = Date.parse((((state || {}).last) || {})[name + ':' + kind] || '');
    if (!isNaN(last) && (+now - last) < min * 60000) return { ok: false, why: 'rang a moment ago' };
  }
  return { ok: true, why: '' };
}
// the state file keeps only what a throttle needs, and forgets after a day
export function stateAfter(state, rang, now) {
  const last = { ...(((state || {}).last) || {}) };
  Object.keys(last).forEach(k => { const t = Date.parse(last[k]); if (isNaN(t) || (+now - t) > 86400e3) delete last[k]; });
  rang.forEach(k => { last[k] = new Date(+now).toISOString(); });
  return { v: 1, last };
}

// ---------- 📖 the journal reminder ----------
// A journal is DUE when a job's newest week went out seven days ago or more; a job quiet for three weeks is dormant and is
// left out (a finished job would ring for ever). It rings the office crew at 9 in the morning Alaska time, Monday to Friday,
// and then rests three days — two nudges a week at the most.
export const JRN_DUE = 7, JRN_DORMANT = 21, JRN_REST_DAYS = 3, JRN_HOUR = 9;
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export function alaskaParts(d) {
  const f = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Anchorage', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hour12: false, weekday: 'short' }).formatToParts(d);
  const g = t => (f.find(x => x.type === t) || {}).value || '';
  return { ymd: `${g('year')}-${g('month')}-${g('day')}`, hour: parseInt(g('hour'), 10) % 24, dow: DOW.indexOf(g('weekday')) };
}
const dayNum = ymd => Math.round(Date.parse(String(ymd).slice(0, 10) + 'T12:00:00Z') / 86400e3);
export function journalsDue(pages, ymd) {
  const today = dayNum(ymd);
  return (pages || []).filter(p => {
    if (!p || typeof p !== 'object' || (p.show && p.show.journal === false)) return false;
    const rel = String(((p.journal || [])[0] || {}).released || '').slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(rel)) return false;   // never posted = never promised; the portal's own meter chases that one
    const age = today - dayNum(rel);
    return age >= JRN_DUE && age < JRN_DORMANT;
  }).length;
}
export function journalWhen(now, state) {
  const p = alaskaParts(now);
  if (p.dow === 0 || p.dow === 6) return { send: false, why: 'weekend', ...p };
  if (p.hour !== JRN_HOUR) return { send: false, why: 'hour', ...p };
  const last = String((state || {}).last || '').slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(last) && dayNum(p.ymd) - dayNum(last) < JRN_REST_DAYS) return { send: false, why: 'rang lately', ...p };
  return { send: true, why: 'due', ...p };
}
