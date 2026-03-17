// Service Worker Neutralized for Restoration
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map(cacheName => caches.delete(cacheName))
            );
        })
    );
});

self.addEventListener('fetch', (event) => {
    // Pass-through everything, no caching
    return;
});