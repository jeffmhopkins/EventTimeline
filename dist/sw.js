const CACHE_NAME = 'event-timeline-v1';
const urlsToCache = [
  '/EventTimeline/',
  '/EventTimeline/index.html',
  '/EventTimeline/assets/',
  '/EventTimeline/manifest.json'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  // Only cache requests for our app scope
  if (event.request.url.includes('/EventTimeline/')) {
    event.respondWith(
      caches.match(event.request)
        .then(function(response) {
          // Return cached version or fetch from network
          return response || fetch(event.request);
        })
    );
  }
});