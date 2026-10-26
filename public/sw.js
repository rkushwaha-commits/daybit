// Daybit Service Worker for Progressive Web App (PWA)
// Version: 2.5.0
const CACHE_NAME = 'daybit-cache-v7';

const STATIC_PRECACHE = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
  '/icons/daybit-emblem.png',
  '/icons/daybit-emblem-dark.png',
  '/favicon.png'
];

// Install: Cache initial app shell and skip waiting immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_PRECACHE).catch((err) => {
        console.warn('[Daybit SW] Precache warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate: Clean up old cache versions and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch handler: Stale-while-revalidate for local static assets, Network-only for Supabase/APIs
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Skip non-GET requests (e.g. POST, PUT, DELETE)
  if (req.method !== 'GET') {
    return;
  }

  // 1. Never cache Supabase, analytics, auth, or external API calls
  if (
    url.hostname.includes('supabase.co') ||
    url.pathname.startsWith('/rest/') ||
    url.pathname.startsWith('/auth/') ||
    url.pathname.startsWith('/realtime/')
  ) {
    return; // Standard network fetch
  }

  // 2. Navigation request (HTML document) -> Network first, fallback to cached /index.html
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          if (networkRes.status === 200) {
            const resClone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          }
          return networkRes;
        })
        .catch(() => {
          return caches.match('/index.html') || caches.match('/');
        })
    );
    return;
  }

  // 3. Static assets (JS, CSS, fonts, images) -> Cache-first with background network refresh
  if (
    url.origin === self.location.origin ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com')
  ) {
    event.respondWith(
      caches.match(req).then((cachedRes) => {
        const fetchPromise = fetch(req)
          .then((networkRes) => {
            if (networkRes && networkRes.status === 200) {
              const resClone = networkRes.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
            }
            return networkRes;
          })
          .catch(() => {
            // Network fail, return nothing extra
          });

        return cachedRes || fetchPromise;
      })
    );
  }
});

// Allow client pages to trigger immediate activation
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
