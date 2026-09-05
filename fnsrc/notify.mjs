// notify.mjs — Eric's own push fan-out. Secret-gated; crew/owner subs only.
import { sendToAll } from './pushlib.mjs';

export default async req => {
  if (req.method !== 'POST') return new Response('POST only', { status: 405 });
  if (req.headers.get('x-push-secret') !== process.env.PUSH_SECRET) return new Response('nope', { status: 401 });
  let b = {};
  try { b = await req.json(); } catch (e) {}
  const res = await sendToAll(String(b.title || 'Boiler Room').slice(0, 80), String(b.body || '').slice(0, 200), b.tag);
  return Response.json(res);
};
