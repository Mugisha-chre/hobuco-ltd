const CACHE_NAME = 'my-site-cache-v1';
const urlsToCache = [
  '/',
  '/about',
  '/contact-us',
  '/css/web/styles.css',
  '/js/web/home.js',
  '/js/web/contact-us.js',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached response if found, otherwise fetch from network
        return response || fetch(event.request);
      })
  );
});
