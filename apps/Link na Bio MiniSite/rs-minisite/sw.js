
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Simple pass-through fetch for now to satisfy PWA requirements
  // In a real production app, caching strategies would go here
  event.respondWith(fetch(event.request));
});
