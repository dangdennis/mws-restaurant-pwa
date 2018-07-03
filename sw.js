// Set a name for the current cache
var cacheName = "v1";

// Default files to always cache
var cacheFiles = [
    "./",
    "./restaurant.html",
    "./js/index.js",
    "./js/dbhelper.js",
    "./js/main.js",
    "./js/restaurant_info.js",
    "./css/styles.css",
];

self.addEventListener("install", function(e) {
    console.log("[ServiceWorker] Installed");

    // e.waitUntil Delays the event until the Promise is resolved
    e.waitUntil(
        // Open the cache
        caches.open(cacheName).then(function(cache) {
            // Add all the default files to the cache
            console.log("[ServiceWorker] Caching cacheFiles");
            return cache.addAll(cacheFiles);
        }),
    ); // end e.waitUntil
});

self.addEventListener("activate", function(e) {
    console.log("[ServiceWorker] Activated");

    e.waitUntil(
        // Get all the cache keys (cacheName)
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(thisCacheName) {
                    // If a cached item is saved under a previous cacheName
                    if (thisCacheName !== cacheName) {
                        // Delete that cached file
                        console.log(
                            "[ServiceWorker] Removing Cached Files from Cache - ",
                            thisCacheName,
                        );
                        return caches.delete(thisCacheName);
                    }
                }),
            );
        }),
    ); // end e.waitUntil
});

self.addEventListener("fetch", function(e) {
    console.log("[ServiceWorker] Fetch", e.request.url);

    var requestUrl = new URL(e.request.url);

    if (requestUrl.origin === location.origin) {
        if (requestUrl.pathname === "/") {
            e.respondWith(caches.match("/"));
            return;
        }

        if (requestUrl.pathname === "/restaurant.html") {
            e.respondWith(caches.match("/restaurant.html"));
            return;
        }
    }

    // e.respondWidth Responds to the fetch event
    e.respondWith(
        // Check in cache for the request being made
        caches.match(e.request).then(function(response) {
            // If the request is in the cache
            if (response) {
                console.log("[ServiceWorker] Found in Cache", e.request.url, response);
                // Return the cached version
                return response;
            }
            // If the request is NOT in the cache, fetch and cache

            var requestClone = e.request.clone();
            return fetch(requestClone)
                .then(function(response) {
                    if (!response) {
                        console.log("[ServiceWorker] No response from fetch ");
                        return response;
                    }

                    var responseClone = response.clone();

                    //  Open the cache
                    caches.open(cacheName).then(function(cache) {
                        // Put the fetched response in the cache
                        cache.put(e.request, responseClone);
                        console.log("[ServiceWorker] New Data Cached", e.request.url);

                        // Return the response
                        return response;
                    }); // end caches.open
                })
                .catch(function(err) {
                    console.log("[ServiceWorker] Error Fetching & Caching New Data", err);
                });
        }), // end caches.match(e.request)
    ); // end e.respondWith
});

// var staticCacheName = "restaurant-static-v1";

// var allCaches = [staticCacheName];

// self.addEventListener("install", function(event) {
//     event.waitUntil(
//         caches.open(staticCacheName).then(function(cache) {
//             return cache.addAll([
//                 "/",
//                 "/restaurant.html",
//                 "js/index.js",
//                 "js/dbhelper.js",
//                 "js/main.js",
//                 "js/restaurant_info.js",
//                 "css/styles.css",
//             ]);
//         }),
//     );
// });

// self.addEventListener("activate", function(event) {
//     event.waitUntil(
//         caches.keys().then(function(cacheNames) {
//             return Promise.all(
//                 cacheNames
//                     .filter(function(cacheName) {
//                         return (
//                             cacheName.startsWith("restaurant-") && !allCaches.includes(cacheName)
//                         );
//                     })
//                     .map(function(cacheName) {
//                         return caches.delete(cacheName);
//                     }),
//             );
//         }),
//     );
// });

// self.addEventListener("fetch", function(event) {
//     var requestUrl = new URL(event.request.url);

//     if (requestUrl.origin === location.origin) {
//         if (requestUrl.pathname === "/") {
//             event.respondWith(caches.match("/"));
//             return;
//         }

//         if (requestUrl.pathname === "/restaurant.html") {
//             event.respondWith(caches.match("/restaurant.html"));
//             return;
//         }
//     }

//     event.respondWith(
//         caches.match(event.request).then(function(response) {
//             return response || fetch(event.request);
//         }),
//     );
// });
