// client-push-drain.mjs — 🔔 v6.68 the 9am timer. netlify.toml runs it at 17:00 and 18:00 UTC
// (9am Alaska in summer, 9am in winter — the other run falls outside the window and holds).
// It sends whatever waited in push-queue.json overnight, then empties the queue. No HTTP door:
// Netlify refuses to invoke a scheduled function by URL (403), which is how it should be.
import { mkDeps } from './client-push.mjs';
import { drain } from './client-push-core.mjs';

export default async () => {
  if (!process.env.DBX_REFRESH_TOKEN || !process.env.DBX_APP_KEY || !process.env.VAPID_PRIVATE_KEY) { console.log(JSON.stringify({ ok: false, why: 'env' })); return new Response('env'); }
  const r = await drain(await mkDeps());
  console.log(JSON.stringify(r));   // counts and fixed words only — no client code, no name
  return Response.json(r);
};
