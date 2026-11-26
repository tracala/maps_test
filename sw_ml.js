// Service worker for offline support.
// Strategy: HTML -> network-first, scripts/.bin -> cache-first, everything
// else -> network only.

const CACHE_NAME = 'mapa-offline-v1.30';

// Files that exist with a stable name in both dev and build. The hashed
// bundles produced by Vite are not listed: they are served with long-term
// caching by their immutable names, and the .bin data files are cached on
// demand by the cache-first fetch handler below.
const FILES_TO_CACHE = [
  './index.html',
  './main.html',
  './manifest.json',
  './sw.js'
];

self.addEventListener('install', (event) => {
  // Dev mode: activate immediately without waiting for other clients.
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  // HTML pages: network first, fall back to cache when offline.
  if (request.mode === 'navigate') {
    return htmlNetworkFirst(request);
  }

  const pathname = new URL(request.url).pathname;

  // Scripts and compact data files: cache first.
  if (request.destination === 'script' || pathname.endsWith('.bin')) {
    return cacheFirst(request);
  }

  // Everything else: straight to the network.
  return fetch(request);
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);

  const cached = await cache.match(request);
  if (cached) {
    console.log('get from cache:', request.url);
    return cached;
  }

  const response = await fetch(request);
  if (response.ok && response.type === 'basic') {
    console.log('caching:', request.url);
    await cache.put(request, response.clone());
  }
  return response;
}

async function htmlNetworkFirst(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const response = await fetch(request);
    cache.put(request, response.clone());
    return response;
  } catch {
    // Offline: use the cached page, or the cached index as a last resort.
    const cached = await cache.match(request);
    if (cached) return cached;
    return cache.match('/index.html');
  }
}

console.log('SW: ' + CACHE_NAME);
