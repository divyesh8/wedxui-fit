/* WEDXUI FIT service worker.
 *
 * Deliberately conservative so it can never serve stale app content:
 *   - Navigations  → NETWORK FIRST (cache is only a fallback when offline)
 *   - /_next/static, icons → CACHE FIRST (filenames are content-hashed/immutable)
 *   - /api/*       → NEVER cached (auth + plan data must always be live)
 * Bump CACHE_VERSION to invalidate everything on the next activation.
 */
const CACHE_VERSION = 'wedxui-v1';
const OFFLINE_URL = '/offline';

const PRECACHE = [OFFLINE_URL, '/icon.svg', '/icon-maskable.svg', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      // Individual failures must not abort the whole install.
      .then((cache) => Promise.allSettled(PRECACHE.map((url) => cache.add(url))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // let cross-origin pass through
  if (url.pathname.startsWith('/api/')) return; // never cache API responses

  // Immutable build assets: cache first for instant repeat loads.
  const isStatic =
    url.pathname.startsWith('/_next/static/') ||
    url.pathname === '/icon.svg' ||
    url.pathname === '/icon-maskable.svg';

  if (isStatic) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(CACHE_VERSION).then((c) => c.put(request, copy));
            }
            return res;
          })
      )
    );
    return;
  }

  // Page navigations: always try the network so content is never stale.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() => caches.match(request).then((hit) => hit || caches.match(OFFLINE_URL)))
    );
  }
});
