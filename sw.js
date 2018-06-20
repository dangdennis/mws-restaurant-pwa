const STATIC_CACHE_NAME = "mws-restaurant";
const CONTENT_IMG_CACHE = "mws-restaurant-imgs";

// all the caches we care about
const allCaches = [STATIC_CACHE_NAME, CONTENT_IMG_CACHE];

self.addEventListener("install", function(event) {
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME).then(function(cache) {
            return cache.addAll([
                "index.html",
                "js/main.js",
                "js/dbhelper.js",
                "js/restaurant_info.js",
                "css/styles.css",
                "data/restaurants.json",
                "restaurant.html",
            ]);
        }),
    );
});

self.addEventListener("activate", function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames
                    .filter(cacheName => {
                        return cacheName.startsWith("mws-") && !allCaches.includes(cacheName);
                    })
                    .map(cacheName => caches.delete(cacheName)),
            );
        }),
    );
});

self.addEventListener("fetch", function(event) {
    const requestUrl = new URL(event.request.url);

    if (requestUrl.origin === location.origin) {
        // app shell (static)
        if (requestUrl.pathname === "/") {
            event.respondWith(caches.match("index.html"));
            return;
        }

        // photos (non-static)
        if (requestUrl.pathname.startsWith("restaurant.html")) {
            event.respondWith(caches.match("restaurant.html"));
            return;
        }
    }

    event.respondWith(
        caches.match(event.request).then(function(response) {
            return response || fetch(event.request);
        }),
    );
});
