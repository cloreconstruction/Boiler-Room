// Boiler Room service worker — push notifications (v4.51). No fetch caching here.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data.json(); } catch (err) { d = { title: 'Boiler Room', body: e.data ? e.data.text() : '' }; }
  // 🔔 v6.68 — a homeowner ping carries the url of THEIR page (inside the encrypted payload,
  // never in the words); a tap lands there instead of on Eric's app. His own pings carry none.
  e.waitUntil(self.registration.showNotification(d.title || 'Boiler Room', {
    body: d.body || '', tag: d.tag || 'boiler-room', icon: 'icon-192.png', badge: 'icon-192.png', data: { url: String(d.url || '') }
  }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const want = (e.notification.data && e.notification.data.url) || '';
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    const hit = want ? list.find(c => String(c.url).includes(want)) : list.find(c => 'focus' in c);
    if (hit && 'focus' in hit) return hit.focus();
    return clients.openWindow(want || './');
  }));
});
