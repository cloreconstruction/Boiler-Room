// crew-push.mjs — 👷 v7.47 the doing behind crew-push-core.mjs: read the crew folders, ask the core who and whether, ring.
// Used by notify.mjs (a push the app or the homeowner's door asked for) and journal-reminder.mjs (the timer). It READS each
// person's crew.json (office or field), push-settings.json and push-subs.json, and WRITES only App Data/crew-push-state.json
// (when a bursty kind last rang — nothing else). It never touches a log, a note or a client page.
import { dbxToken, dbxReadJson, dbxWrite, dbxFolders, sendSubs } from './pushlib.mjs';
import { CREW_DIR, CREW_WORDS, THROTTLE_MIN, targetsOf, decide, stateAfter } from './crew-push-core.mjs';

const STATE = '/Clore DayLog/App Data/crew-push-state.json';

export async function crewRoster(t) {
  const names = await dbxFolders(t, CREW_DIR);
  const cfgs = await Promise.all(names.map(n => dbxReadJson(t, `${CREW_DIR}/${n}/crew.json`)));
  return names.map((n, i) => ({ name: n, office: !!(cfgs[i] && cfgs[i].office) })).filter((r, i) => cfgs[i]);   // a folder with no crew.json is not a crew member's
}

export async function ringCrew(to, kind, from, now = new Date()) {
  const w = CREW_WORDS[kind];
  if (!w) return { ok: false, why: 'unknown kind', to: 0, sent: 0 };
  const t = await dbxToken();
  const names = targetsOf(to, await crewRoster(t), from, kind);
  if (!names.length) return { ok: true, to: 0, sent: 0, why: 'nobody to ring' };
  const throttled = !!THROTTLE_MIN[kind];
  const state = throttled ? await dbxReadJson(t, STATE) : null;
  const rang = [], skipped = {};
  let sent = 0, phones = 0;
  await Promise.all(names.map(async name => {
    const base = `${CREW_DIR}/${name}/App Data`;
    const gate = decide(await dbxReadJson(t, base + '/push-settings.json'), kind, now, state, name);
    if (!gate.ok) { skipped[name] = gate.why; return; }
    const subs = await dbxReadJson(t, base + '/push-subs.json');
    if (!Array.isArray(subs) || !subs.length) { skipped[name] = 'not signed up'; return; }
    const r = await sendSubs(subs, { title: w.title, body: w.body, tag: 'crew-' + kind });
    phones += subs.length; sent += r.sent;
    if (r.sent) rang.push(name + ':' + kind); else skipped[name] = 'no phone took it';
  }));
  if (throttled && rang.length) { try { await dbxWrite(t, STATE, JSON.stringify(stateAfter(state, rang, now), null, 1)); } catch (e) { /* the next one may ring twice — better than not at all */ } }
  return { ok: true, to: names.length, sent, phones, skipped };
}
