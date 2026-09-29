// journal-reminder.mjs — 📖 v7.47 the timer behind "a job journal is due" (one of the nine crew alerts Eric said yes to,
// 2026-09-29). netlify.toml wakes it at 9 in the morning Alaska time on weekdays (two runs, so the hour lands in summer and
// in winter — the other run sees the wrong hour and holds). It READS Client Portal/index.json and each client's page (the
// newest journal week's `released` date, nothing else of it) and rings the OFFICE crew through crew-push — each by his own
// hours and switches, in fixed words: no job, no homeowner, no count. It WRITES only App Data/journal-reminder-state.json
// (the day it last rang). No HTTP door: Netlify refuses to invoke a scheduled function by URL (403).
import { dbxToken, dbxReadJson, dbxWrite } from './pushlib.mjs';
import { journalsDue, journalWhen } from './crew-push-core.mjs';
import { ringCrew } from './crew-push.mjs';

const BASE = '/Clore DayLog/App Data/Client Portal', STATE = '/Clore DayLog/App Data/journal-reminder-state.json';

export default async () => {
  if (!process.env.DBX_REFRESH_TOKEN || !process.env.DBX_APP_KEY || !process.env.VAPID_PRIVATE_KEY) { console.log(JSON.stringify({ ok: false, why: 'env' })); return new Response('env'); }
  const now = new Date();
  const t = await dbxToken();
  const when = journalWhen(now, await dbxReadJson(t, STATE));
  let due = 0, res = { to: 0, sent: 0 };
  if (when.send) {
    const idx = await dbxReadJson(t, BASE + '/index.json');
    const codes = ((idx && Array.isArray(idx.clients)) ? idx.clients : []).map(c => String((c && c.code) || '').replace(/[^a-z0-9-]/gi, '')).filter(Boolean).slice(0, 60);
    const pages = await Promise.all(codes.map(c => dbxReadJson(t, `${BASE}/${c}.json`)));
    due = journalsDue(pages, when.ymd);
    if (due) {
      res = await ringCrew('office', 'journal', '', now);
      if (res.sent) await dbxWrite(t, STATE, JSON.stringify({ last: when.ymd, at: now.toISOString(), sent: res.sent }));
    }
  }
  const out = { ok: true, why: when.send ? (due ? 'due' : 'none due') : when.why, due, to: res.to || 0, sent: res.sent || 0 };   // counts and fixed words only
  console.log(JSON.stringify(out));
  return Response.json(out);
};
