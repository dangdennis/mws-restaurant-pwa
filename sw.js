// importScripts('/cache-polyfill.js');

// Default files to always cache
var cacheFiles = [
    '/',
    '/index.html',
    '/restaurant.html',
    '/js/main.js',
    '/js/dbhelper.js',
    '/js/restaurant_info.js',
    '/css/styles.css',
    '/img/1.jpg',
    '/img/2.jpg',
    '/img/3.jpg',
    '/img/4.jpg',
    '/img/5.jpg',
    '/img/6.jpg',
    '/img/7.jpg',
    '/img/8.jpg',
    '/img/9.jpg',
    '/img/10.jpg'
];

const version = '0.6.11';
const cacheName = `restaurant-mws-${version}`;
self.addEventListener('install', e => {
    console.log('Service worker installing');
    const timeStamp = Date.now();
    e.waitUntil(
        caches.open(cacheName).then(cache => {
            return cache.addAll(cacheFiles).then(() => self.skipWaiting());
        })
    );
});

self.addEventListener('activate', event => {
    console.log('Service worker activating');
    console.log(event.request.url);
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
    console.log('Service worker fetching');
    console.log({ event: event.request });
    event.respondWith(
        caches
            .open(cacheName)
            .then(cache => cache.match(event.request, { ignoreSearch: true }))
            .then(response => {
                return response || fetch(event.request);
            })
    );
});
