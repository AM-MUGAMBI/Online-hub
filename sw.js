const CACHE_NAME = 'jil-radio-shell-v2';
const PRECACHE_URLS = [
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (event.request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  // Navigation requests (the page itself) and the manifest must ALWAYS come
  // from the network, never a cached copy — otherwise updates you push never
  // show up for returning visitors. Only the unchanging icon files are safe
  // to serve from cache.
  const isPageOrManifest = event.request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname.endsWith('manifest.json');

  if (isPageOrManifest) {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});