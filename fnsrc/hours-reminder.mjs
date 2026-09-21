// hours-reminder.mjs — ⏱ v7.01 the timer for the crew-hours nudge. netlify.toml wakes it every hour; the deciding is in
// hours-reminder-core.mjs. It READS App Data/hours-reminder.json (the app owns it — the Crew hours window writes it) and
// WRITES only its own App Data/hours-reminder-state.json (the day it last rang). It rings Eric's own devices
// (App Data/push-subs.json — a crew phone's subscription lives in that man's own folder, never here). No HTTP door:
// Netlify refuses to invoke a scheduled function by URL (403), which is how it should be.
import { sendToAll, dbxToken } from './pushlib.mjs';
import { due, WORDS } from './hours-reminder-core.mjs';

const SET = '/Clore DayLog/App Data/hours-reminder.json', STATE = '/Clore DayLog/App Data/hours-reminder-state.json';

export default async () => {
  if (!process.env.DBX_REFRESH_TOKEN || !process.env.DBX_APP_KEY || !process.env.VAPID_PRIVATE_KEY) { console.log(JSON.stringify({ ok: false, why: 'env' })); return new Response('env'); }
  const t = await dbxToken();
  const dl = async path => { const r = await fetch('https://content.dropboxapi.com/2/files/download', { method: 'POST', headers: { Authorization: 'Bearer ' + t, 'Dropbox-API-Arg': JSON.stringify({ path }) } }); return r.ok ? r.text() : null; };
  const read = async path => { try { return JSON.parse(await dl(path) || 'null'); } catch (e) { return null; } };
  const d = due(await read(SET), await read(STATE), new Date());
  let sent = 0;
  if (d.send) {
    sent = (await sendToAll(WORDS.title, WORDS.body, 'hours')).sent;
    await fetch('https://content.dropboxapi.com/2/files/upload', { method: 'POST',
      headers: { Authorization: 'Bearer ' + t, 'Dropbox-API-Arg': JSON.stringify({ path: STATE, mode: 'overwrite', mute: true }), 'Content-Type': 'application/octet-stream' },
      body: JSON.stringify({ last: d.ymd, sent, at: new Date().toISOString() }) });
  }
  const out = { ok: true, sent, why: d.why };   // counts and fixed words only
  console.log(JSON.stringify(out));
  return Response.json(out);
};
