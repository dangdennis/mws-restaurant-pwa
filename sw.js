var staticCacheName = "restaurant-static-v1";

var allCaches = [staticCacheName];

self.addEventListener("install", function(event) {
    event.waitUntil(
        caches.open(staticCacheName).then(function(cache) {
            return cache.addAll([
                "/",
                "/restaurant.html",
                "js/index.js",
                "js/dbhelper.js",
                "js/main.js",
                "js/restaurant_info.js",
                "css/styles.css",
            ]);
        }),
    );
});

self.addEventListener("activate", function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames
                    .filter(function(cacheName) {
                        return (
                            cacheName.startsWith("restaurant-") && !allCaches.includes(cacheName)
                        );
                    })
                    .map(function(cacheName) {
                        return caches.delete(cacheName);
                    }),
            );
        }),
    );
});

self.addEventListener("fetch", function(event) {
    var requestUrl = new URL(event.request.url);

    if (requestUrl.origin === location.origin) {
        if (requestUrl.pathname === "/") {
            event.respondWith(caches.match("/"));
            return;
        }

        if (requestUrl.pathname === "/restaurant.html") {
            event.respondWith(caches.match("/restaurant.html"));
            return;
        }
    }

    event.respondWith(
        caches.match(event.request).then(function(response) {
            return response || fetch(event.request);
        }),
    );
});
