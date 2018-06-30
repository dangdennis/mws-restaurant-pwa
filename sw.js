const STATIC_CACHE_NAME = 'mws-restaurant';
const CONTENT_IMG_CACHE = 'mws-restaurant-imgs';

// all the caches we care about
const allCaches = [STATIC_CACHE_NAME, CONTENT_IMG_CACHE];

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME).then(function(cache) {
            return cache.addAll([
                'index.html',
                'js/main.js',
                'js/dbhelper.js',
                'js/restaurant_info.js',
                'css/styles.css',
                'data/restaurants.json',
                'restaurant.html',
                'img/1.jpg',
                'img/2.jpg',
                'img/3.jpg',
                'img/4.jpg',
                'img/5.jpg',
                'img/6.jpg',
                'img/7.jpg',
                'img/8.jpg',
                'img/9.jpg',
                'img/10.jpg',
            ]);
        }),
    );
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames
                    .filter(cacheName => {
                        return cacheName.startsWith('mws-') && !allCaches.includes(cacheName);
                    })
                    .map(cacheName => caches.delete(cacheName)),
            );
        }),
    );
});

self.addEventListener('fetch', function(event) {
    const requestUrl = new URL(event.request.url);

    if (requestUrl.origin === location.origin) {
        // app shell (static)
        if (requestUrl.pathname === '/') {
            event.respondWith(caches.match('index.html'));
            return;
        }

        if (requestUrl.pathname.startsWith('restaurant.html')) {
            console.log('fetching');
            console.log({ requestUrl });
            console.log({ pathname });
            event.respondWith(caches.match('restaurant.html'));
            return;
        }

        event.respondWith(async function() {
            // Try to get the response from a cache.
            const cache = await caches.open(STATIC_CACHE_NAME);
            const cachedResponse = await cache.match(event.request);

            if (cachedResponse) {
                // If we found a match in the cache, return it, but also
                // update the entry in the cache in the background.
                event.waitUntil(cache.add(event.request));
                return cachedResponse;
            }
        });
    }
});

function servePhoto(request) {
    const storageUrl = request.url.replace(/-\d+px\.jpg$/, '');

    return caches.open(CONTENT_IMG_CACHE).then(cache =>
        cache.match(storageUrl).then(function(response) {
            if (response) return response;

            return fetch(request).then(function(networkResponse) {
                cache.put(storageUrl, networkResponse.clone());
                return networkResponse;
            });
        }),
    );
}
