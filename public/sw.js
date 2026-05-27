const CACHE_VERSION = 'prode-mundial-v3';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;

// Assets that rarely change – cached on install
const STATIC_ASSETS = [
  '/manifest.json',
  '/favicon.svg',
  '/icons/icon-192x192.svg',
  '/icons/icon-512x512.svg'
];

// Pages – served network-first so updates appear instantly
const APP_ROUTES = ['/', '/draft', '/matches', '/rules', '/admin'];

// ─── Install ───────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  // Activate immediately – don't wait for old tabs to close
  self.skipWaiting();
});

// ─── Activate ──────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  // Take control of all open tabs immediately
  self.clients.claim();
});

// ─── Fetch ─────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET and API/sync requests – always go to network
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  // API calls: never cache, always network
  if (url.pathname.startsWith('/api/')) return;

  // Navigation requests (HTML pages): Network-First
  // This ensures the user always gets the latest version of the app
  if (request.mode === 'navigate' || APP_ROUTES.includes(url.pathname)) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Static assets (icons, manifest, fonts, images): Stale-While-Revalidate
  // Serves from cache instantly, then updates in the background
  event.respondWith(staleWhileRevalidate(request));
});

// ─── Strategies ────────────────────────────────────────────

/**
 * Network-First: try network, fall back to cache.
 * Ensures the app always shows the latest deployed version when online.
 */
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    // Cache a copy for offline use
    const cache = await caches.open(DYNAMIC_CACHE);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch {
    const cached = await caches.match(request);
    return cached || caches.match('/');
  }
}

/**
 * Stale-While-Revalidate: serve from cache immediately,
 * fetch a fresh copy in the background for next time.
 */
async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse && networkResponse.status === 200) {
        const cache = caches.open(STATIC_CACHE).then((c) =>
          c.put(request, networkResponse.clone())
        );
      }
      return networkResponse;
    })
    .catch(() => cached);

  return cached || fetchPromise;
}

// ─── Background Sync (optional future enhancement) ─────────
// Listen for messages from the app (e.g., force update)
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
