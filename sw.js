const cacheVersion = 'rr-app-v2';

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

const resourcesToCache = [
    'index.html',
    'restaurant.html',
    'css/normalize.css',
    'css/styles.css',
    'js/main.js',
    'js/dbhelper.js',
    'js/restaurant_info.js',
    'https://use.fontawesome.com/releases/v5.1.0/css/all.css',
    'https://fonts.googleapis.com/css?family=Roboto:100,300,400,500',
    'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js',
    ...imagesToCache
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(cacheVersion).then(function(cache) {
      return cache.addAll(resourcesToCache);
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});