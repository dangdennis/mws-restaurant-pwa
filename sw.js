// Set a name for the current cache
var cacheName = 'v1';

// Default files to always cache
var cacheFiles = [
    '/',
    '/restaurant.html',
    '/js/index.js',
    '/js/dbhelper.js',
    '/js/main.js',
    '/js/restaurant_info.js',
    '/css/styles.css',
];

const version = '0.6.11';
const cacheName = `restaurant-mws-${version}`;
self.addEventListener('install', e => {
    console.log('Service worker installing');
    const timeStamp = Date.now();
    e.waitUntil(
        caches.open(cacheName).then(cache => {
            return cache.addAll(cacheFiles).then(() => self.skipWaiting());
        }),
    );
});

self.addEventListener('activate', event => {
    console.log('Service worker activating');
    console.log(event.request.url);
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
    console.log('Service worker fetching');
    event.respondWith(
        caches
            .open(cacheName)
            .then(cache => cache.match(event.request, { ignoreSearch: true }))
            .then(response => {
                return response || fetch(event.request);
            }),
    );
});
