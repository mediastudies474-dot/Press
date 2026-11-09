// ES-PRESS service worker — handles background push notifications so users
// receive breaking-news alerts even when the app is closed.

const CACHE = 'espress-shell-v1';
const ICON = '/icons/icon-192.png';
const BADGE = '/icons/icon-192.png';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Receive a push payload and surface a branded notification.
self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { title: 'ES-PRESS', body: event.data ? event.data.text() : '' };
  }

  const title = payload.title || 'ES-PRESS';
  const options = {
    body: payload.body || payload.message || '',
    icon: payload.icon || ICON,
    badge: BADGE,
    tag: payload.tag || payload.id || undefined,
    data: { url: payload.url || '/', id: payload.id },
    requireInteraction: false,
    vibrate: [80, 40, 80],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil((async () => {
    const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of allClients) {
      if ('focus' in client) {
        try { await client.focus(); } catch {}
        if (targetUrl && targetUrl !== '/' && 'navigate' in client) {
          try { await client.navigate(targetUrl); } catch {}
        }
        return;
      }
    }
    if (self.clients.openWindow) {
      await self.clients.openWindow(targetUrl);
    }
  })());
});
