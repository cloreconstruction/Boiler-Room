// plan-reminder.mjs — the 5pm "line out tomorrow" nudge.
// 🌙🅿 v5.26 — the SCHEDULE is parked in netlify.toml; the function itself still works.
import { sendToAll } from './pushlib.mjs';

export default async () => {
  const res = await sendToAll('🌙 Plan tomorrow', 'Two minutes: line out tomorrow before you knock off. Open Boiler Room.', 'plan');
  return Response.json(res);
};
