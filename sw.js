const CACHE_NAME = "mapa-offline-v1.25";

const FILES_TO_CACHE = [
  "./manifest.json",
  "./config.js",
  "./gt_worker.js",
  "./js/utils.js",
  "./js/utils_c.js",
  "./js/simbology.js",
  "./js/compact2geojson.lite_.js",
  "./js/compacttp2geojson.lite_.js",
  "./js/geomGT.js",
  //"./js/shp2compact.js",
  "./js/lib/cborx.js",
  "./js/lib/FastBitSet.js",
  "./js/lib/FastIntegerCompression.js",
  "./js/lib/Flatbush.js",
  "./js/lib/shapefile.js",
  "./js/lib/topojson-client.min.js"
];



self.addEventListener("install", event => {
  
  //MODO DEV
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
        
        /*
        for(let l of FILES_TO_CACHE){
            console.log('Caching:',l);
            cache.add(l);
        }
        */

  );
});

// Activación
/*
self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});
*/


self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            )
        )
    );

    self.clients.claim();
});


self.addEventListener("fetch", event => {
    const request = event.request;
    event.respondWith(handleRequest(request));
});



async function handleRequest(request) {

    // HTML → Network First
    if (request.mode === "navigate") {
        return htmlNetworkFirst(request);
    }

    const pathname = new URL(request.url).pathname;

    // Scripts y BIN → Cache First
    if (
        request.destination === "script" ||
        pathname.endsWith(".bin")
    ) {
        return cacheFirst(request);
    }

    // Todo lo demás → Red
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

    if (response.ok && response.type === "basic") {
        console.log('caching:', request.url);
        await cache.put(request, response.clone());
    }

    return response;

}


async function htmlNetworkFirst(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    // Intenta red
    const response = await fetch(request);
    cache.put(request, response.clone()); // 👈 guarda el HTML exacto
    return response;
  } catch (err) {
    // Offline → usa el HTML correcto
    const cached = await cache.match(request);
    if (cached) return cached;

    // Fallback opcional
    return cache.match("/index.html");
  }
}

console.log('SW: '+CACHE_NAME);