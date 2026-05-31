// RAGE Tracker Service Worker
// Einmal hochladen – danach nie mehr anfassen.
// Stellt sicher, dass index.html immer aktuell vom Server geladen wird.

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', e => {
  // Alle alten Caches löschen
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // index.html und Navigation immer frisch vom Server (kein Cache)
  if (e.request.mode === 'navigate' ||
      url.pathname.endsWith('index.html') ||
      url.pathname === '/' ||
      url.pathname.endsWith('/')) {
    e.respondWith(
      fetch(e.request, { cache: 'no-store' })
        .catch(() => caches.match(e.request))
    );
    return;
  }
  // Firebase + externe Ressourcen: immer Netzwerk
  if (url.hostname.includes('firebase') ||
      url.hostname.includes('gstatic') ||
      url.hostname.includes('googleapis')) {
    e.respondWith(fetch(e.request));
    return;
  }
  // Sonstige Ressourcen: Netzwerk, Fallback Cache
  e.respondWith(
    fetch(e.request, { cache: 'no-store' })
      .catch(() => caches.match(e.request))
  );
});
