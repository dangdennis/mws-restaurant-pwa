/**
 * Common database helper functions.
 */
class DBHelper {
    constructor() {
        this.IDB = new IDB();
    }

    /**
     * Database URL.
     * Returns an object of all endpoints
     */
    get DATABASE_URL() {
        const domain = `http://localhost:`;
        const port = 1337; // Change this to your server port
        const origin = `${domain}${port}`;
        return {
            restaurants: `${origin}/restaurants/`, // GET: All restaurants, or 1 with ID
            restaurantsFavorites: `${origin}/restaurants/?is_favorite=true`, // GET: All favorited restaurants
            restaurantReviews: `${origin}/reviews/?restaurant_id=`, // GET: All reviews by restaurant ID
            reviews: `${origin}/reviews/`, // GET: All reviews, or 1 with ID
            faveRestaurant: id => `${origin}/restaurants/${id}/?is_favorite=true`, // PUT: Favorite a restaurant by ID
            unfaveRestaurant: id => `${origin}/restaurants/${id}/?is_favorite=false`, // PUT: Unfavorite a restaurant by ID
            editReview: id => `${origin}/reviews/${id}` // PUT = update, DELETE = delete review
        };
    }

    /**
     * General fetch utility
     * @param {String} url
     * @param {String} method
     */
    async apiFetcher(url, method = 'GET') {
        try {
            const options = {
                method
            };
            const result = await fetch(url, options).then(res => res.json());
            console.log({ result });
            return result;
        } catch (error) {
            console.warn('You got a network error:', error);
        }
    }

    /**
     * Fetches all favorite restaurants only
     * @param {function} callback
     */
    async fetchFavoriteRestaurants(callback) {
        const url = this.DATABASE_URL.restaurantsFavorites;
        const res = await this.apiFetcher(url);
        if (callback) {
            callback(res);
        }
    }

    /**
     * A user can favorite a restaurant
     * @param {String} id
     * @param {Boolean} faveState
     * @param {Function} callback
     */
    async faveRestaurant(id, faveState, callback) {
        let url;
        if (!faveState) {
            url = this.DATABASE_URL.faveRestaurant(id);
        } else {
            url = this.DATABASE_URL.unfaveRestaurant(id);
        }
        const res = await this.apiFetcher(url, 'PUT');
        if (callback) {
            callback(res);
        }
    }

    /**
     * Fetches all restaurants
     */
    async fetchRestaurants() {
        let restaurants;

        try {
            const _ = await this.IDB.createObjectStore('restaurants');
            // Get restaurants from indexedDB if it exists
            restaurants = await this.IDB.get('restaurants', 'restaurants').then(res => res);
            if (restaurants) {
                console.log('got restaurants from idb', restaurants);
                return restaurants;
            }

            // Fetch restaurants if still undefined after Idb attempt
            if (!restaurants) {
                const url = this.DATABASE_URL.restaurants;
                restaurants = await this.apiFetcher(url);
                this.IDB.set('restaurants', restaurants, 'restaurants');
                console.log('fetching restaurants from network');
                return restaurants;
            }
        } catch (error) {
            console.log('Request failed: ', error);
            return [];
        }
    }

    /**
     * Fetch a restaurant by its ID.
     */
    async fetchRestaurantById(id, callback) {
        let restaurant;
        const objStoreName = `restaurant`;
        try {
            const idbPromise = await this.IDB.createObjectStore(objStoreName);

            restaurant = await this.IDB.get(id, objStoreName).then(res => res);
            if (restaurant) {
                console.log('fetch restaurant from idb');
                if (callback) {
                    callback(null, restaurant);
                }
                return restaurant;
            }

            if (!restaurant) {
                const url = this.DATABASE_URL.restaurants + id;
                restaurant = await this.apiFetcher(url);
                this.IDB.set(id, restaurant, objStoreName);
                console.log('fetch restaurant from network');
                if (callback) {
                    callback(null, restaurant);
                }
                return restaurant;
            }
        } catch (error) {
            console.log('Request failed: ', error);
            return {};
        }
    }

    /**
     * Fetch Restaurant reviews by ID
     */
    async fetchRestaurantReviewsById(id, callback) {
        const url = this.DATABASE_URL.restaurantReviews + id;
        const res = await this.apiFetcher(url);
        if (callback) {
            callback(null, res);
        }
    }

    /**
     * Fetch restaurants by a cuisine type with proper error handling.
     */
    fetchRestaurantByCuisine(cuisine, callback) {
        // Fetch all restaurants  with proper error handling
        this.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Filter restaurants to have only given cuisine type
                const results = restaurants.filter(r => r.cuisine_type == cuisine);
                if (callback) {
                    callback(null, results);
                }
            }
        });
    }

    /**
     * Fetch restaurants by a neighborhood with proper error handling.
     */
    fetchRestaurantByNeighborhood(neighborhood, callback) {
        // Fetch all restaurants
        this.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Filter restaurants to have only given neighborhood
                const results = restaurants.filter(r => r.neighborhood == neighborhood);
                if (callback) {
                    callback(null, results);
                }
            }
        });
    }

    /**
     * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
     */
    async fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, restaurants) {
        // Fetch all restaurants
        if (!restaurants || !restaurants.length) {
            restaurants = await this.fetchRestaurants();
        }
        let results = restaurants;
        if (cuisine != 'all') {
            // filter by cuisine
            results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') {
            // filter by neighborhood
            results = results.filter(r => r.neighborhood == neighborhood);
        }

        return results;
    }

    /**
     * Fetch all neighborhoods with proper error handling.
     */
    filterNeighborhoods(restaurants) {
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood);
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i);
        return uniqueNeighborhoods;
    }

    /**
     * Fetch all cuisines with proper error handling.
     */
    filterCuisines(restaurants) {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i);
        return uniqueCuisines;
    }

    /**
     * Restaurant page URL.
     */
    urlForRestaurant(restaurant) {
        return `./restaurant.html?id=${restaurant.id}`;
    }

    /**
     * Restaurant image URL.
     */
    imageUrlForRestaurant(restaurant) {
        return `/img/${restaurant.photograph}.jpg`;
    }

    /**
     * Map marker for a restaurant.
     */
    mapMarkerForRestaurant(restaurant, map) {
        const marker = new google.maps.Marker({
            position: restaurant.latlng,
            title: restaurant.name,
            url: this.urlForRestaurant(restaurant),
            map: map,
            animation: google.maps.Animation.DROP
        });
        return marker;
    }

    /**
     * Unused
     * @param {Function} callback
     */
    async fetchAllReviews(callback) {
        const url = this.DATABASE_URL.faveRestaurant;
        const res = await this.apiFetcher(url);
        if (callback) {
            callback(res);
        }
    }

    /**
     * Unused
     * @param {String} id
     * @param {Function} callback
     */
    async fetchAReview(id, callback) {
        const url = this.DATABASE_URL.faveRestaurant + id;
        const res = await this.apiFetcher(url);
        if (callback) {
            callback(res);
        }
    }
}

class IDB {
    static get DATABASE_NAME() {
        return 'mws-restaurant';
    }

    isIndexedDBSupported() {
        if (!('indexedDB' in window)) {
            console.log("This browser doesn't support IndexedDB");
            return false;
        }
        return true;
    }

    createObjectStore(storeName) {
        if (this.isIndexedDBSupported) {
            const idbPromise = idb.open(IDB.DATABASE_NAME, 1, upgradeDb => {
                console.log({ upgradeDb });

                if (!upgradeDb.objectStoreNames.contains('restaurants')) {
                    console.log('creating object store name: ', 'restaurants');
                    upgradeDb.createObjectStore('restaurants');
                }
                if (!upgradeDb.objectStoreNames.contains('restaurant')) {
                    console.log('creating object store name: ', 'restaurant');
                    upgradeDb.createObjectStore('restaurant');
                }
                if (!upgradeDb.objectStoreNames.contains('reviews')) {
                    console.log('creating object store name: ', 'reviews');
                    const reviewsOS = upgradeDb.createObjectStore('reviews', { autoIncrement: true });
                    reviewsOS.createIndex('id', 'name', { unique: false });
                }
            });
            return idbPromise;
        }
    }

    set(key, val, storeName) {
        const dbPromise = idb.open(IDB.DATABASE_NAME, 1, upgradeDB => {
            if (!upgradeDb.objectStoreNames.contains(storeName)) {
                upgradeDB.createObjectStore(storeName);
            }
        });
        dbPromise
            .then(db => {
                const tx = db.transaction(storeName, 'readwrite');
                tx.objectStore(storeName).put(val, key);
                return tx.complete;
            })
            .then(() => console.log('Successfully stored data'));
    }

    get(key, storeName) {
        const dbPromise = idb.open(IDB.DATABASE_NAME, 1, upgradeDB => {
            if (!upgradeDb.objectStoreNames.contains(storeName)) {
                upgradeDB.createObjectStore(storeName);
            }
        });
        return dbPromise.then(db => {
            const retrieved = db
                .transaction(storeName)
                .objectStore(storeName)
                .get(key);
            return retrieved;
        });
    }

    delete(key, storeName) {
        const dbPromise = idb.open(IDB.DATABASE_NAME, 1, upgradeDB => {
            if (!upgradeDb.objectStoreNames.contains(storeName)) {
                upgradeDB.createObjectStore(storeName);
            }
        });
        dbPromise
            .then(function(db) {
                var tx = db.transaction(storeName, 'readwrite');
                var store = tx.objectStore(storeName);
                store.delete(key);
                return tx.complete;
            })
            .then(function() {
                console.log('Item deleted');
            });
    }

    getAll(storeName) {
        const dbPromise = idb.open(IDB.DATABASE_NAME, 1, upgradeDB => {
            if (!upgradeDb.objectStoreNames.contains(storeName)) {
                upgradeDB.createObjectStore(storeName);
            }
        });
        return dbPromise
            .then(db => {
                const tx = db.transaction(storeName, 'readonly');
                const store = tx.objectStore(storeName);
                return store.getAll();
            })
            .then(function(items) {
                return items;
            });
    }

    cursor(callback, storeName) {
        const dbPromise = idb.open(IDB.DATABASE_NAME, 1, upgradeDB => {
            if (!upgradeDb.objectStoreNames.contains(storeName)) {
                upgradeDB.createObjectStore(storeName);
            }
        });
        dbPromise
            .then(function(db) {
                var tx = db.transaction(storeName, 'readonly');
                var store = tx.objectStore(storeName);
                return store.openCursor();
            })
            .then(async function mapCursors(cursor) {
                if (!cursor) {
                    return;
                }
                if (callback) {
                    await callback(cursor.value, cursor.key);
                }
                return cursor.continue().then(mapCursors);
            })
            .then(function() {
                console.log('Done checking for offline reviews');
            });
    }
}
