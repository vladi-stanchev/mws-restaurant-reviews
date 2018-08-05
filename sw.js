const cacheVersion = 'restaurant-v80';

// Images to cache - later to be added to a dedicated cache
const imagesToCache = [
    '/img/1.webp',
    '/img/2.webp',
    '/img/3.webp',
    '/img/4.webp',
    '/img/5.webp',
    '/img/6.webp',
    '/img/7.webp',
    '/img/8.webp',
    '/img/9.webp',
    '/img/10.webp'
  ];
// resources to cache + images array
const resourcesToCache = [
    '/index.html',
    '/restaurant.html',
    '/manifest.json',
    '/css/normalize.css',
    '/css/styles.css',
    '/js/main.js',
    '/js/dbhelper.js',
    '/js/restaurant_info.js',
    '/js/localforage.min.js',
    '/js/sw_reg.js',
    'https://use.fontawesome.com/releases/v5.1.0/css/all.css',
    'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js',
    ...imagesToCache
];

// Installing the SW
self.addEventListener('install', event => {
    event.waitUntil(
      caches.open(cacheVersion)
        .then(cache => cache.addAll(resourcesToCache))
        .then(() => self.skipWaiting()) 
    );
});

// Activating the SW and getting rid of any previous versions of the cache
self.addEventListener("activate", event => {
    event.waitUntil(
      caches.keys().then(keyList => {
        return Promise.all(
          keyList.map(key => {
            if (key !== cacheVersion) {
              return caches.delete(key);
            }
          })
        );
      })
    );
  return self.clients.claim();
}); 

//In tercepting the response to see if possible to serve from cache; if not, requests are fetched from web
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    if (url.pathname === '/') {
        event.respondWith(
            caches.match('index.html')
            .then(response => response || fetch(event.request))
        );
        return;
    };

    if (url.pathname.startsWith("/img/")) {
        event.respondWith(servePhoto(event.request));
        return;
      };

    event.respondWith(
        caches.match(url.pathname)
        .then(response => response || fetch(event.request))
    );
});

//Checking the cache for a photo. If not there - network request to get it
function servePhoto(request) {
    return caches.open(cacheVersion).then(cache => {
        return cache.match(request).then(response => (
            response || cacheAndFetch(cache, request)
        ));
    });
}

function cacheAndFetch(cache, request) {
    cache.add(request);
    return fetch(request);
}