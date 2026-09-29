// notify.mjs — Eric's own push fan-out. Secret-gated; crew/owner subs only.
// 🔔 v7.39 — his hours and his switches (App Data/push-settings.json, written by his phone in ⚙ Setup → 🔔 Notifications) are
// checked HERE, so a push from any phone — his own, or a crew member's NOW note — obeys them; no file means everything
// rings, as before. A skipped push says why in the answer; the thing itself is still pinned in the app.
// 👷 v7.47 — a push with `to` is for the CREW's phones ('crew', 'office', a name, a list of names): each person's own hours
// and switches decide, and the words are the fixed ones in crew-push-core.mjs — whatever title or body came with it is not
// used. Without `to` it is Eric's, exactly as before.
import { sendToAll, loadJson } from './pushlib.mjs';
import { pushAllowed } from './push-rules.mjs';
import { ringCrew } from './crew-push.mjs';

export default async req => {
  if (req.method !== 'POST') return new Response('POST only', { status: 405 });
  if (req.headers.get('x-push-secret') !== process.env.PUSH_SECRET) return new Response('nope', { status: 401 });
  let b = {};
  try { b = await req.json(); } catch (e) {}
  if (b.to != null && b.to !== '' && b.to !== 'eric') {
    try { return Response.json(await ringCrew(b.to, String(b.kind || ''), b.from)); }
    catch (e) { return Response.json({ ok: false, to: 0, sent: 0, why: 'could not reach the crew folders' }); }
  }
  let settings = null;
  try { settings = await loadJson('/Clore DayLog/App Data/push-settings.json'); } catch (e) { settings = null; }
  const gate = pushAllowed(settings, b.kind, b.urgent === true, new Date());
  if (!gate.ok) return Response.json({ sent: 0, dead: 0, total: 0, skipped: gate.why });
  const res = await sendToAll(String(b.title || 'Boiler Room').slice(0, 80), String(b.body || '').slice(0, 200), b.tag);
  return Response.json(res);
};
