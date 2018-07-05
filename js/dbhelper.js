/**
 * Common database helper functions.
 */
class DBHelper {
    /**
     * Database URL.
     * Change this to restaurants.json file location on your server.
     */
    static get IDB() {
        return new IDB();
    }

    static get DATABASE_URL() {
        const port = 1337; // Change this to your server port
        return `http://localhost:${port}/restaurants`;
    }

    /**
     * Fetch all restaurants.
     */
    static async fetchRestaurants(callback) {
        let restaurants;

        try {
            // Get restaurants from indexedDB if it exists
            if (IDB.isIndexedDBSupported) {
                await IDB.createObjectStore();
                restaurants = await IDB.get('restaurants');
            }

            // Fetch restaurants if still undefined after Idb attempt
            // if (!restaurants) {
            //     console.log('we have to fetch restaurants from a server');
            //     restaurants = await fetch(DBHelper.DATABASE_URL).then(res => res.json());
            //     IDB.set('restaurants', restaurants);
            // }

            callback(null, restaurants);
        } catch (error) {
            console.log('Request failed: ', error);
            callback(error, null);
        }
    }

    /**
     * Fetch a restaurant by its ID.
     */
    static fetchRestaurantById(id, callback) {
        // fetch all restaurants with proper error handling.
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                const restaurant = restaurants.find(r => r.id == id);
                if (restaurant) {
                    // Got the restaurant
                    callback(null, restaurant);
                } else {
                    // Restaurant does not exist in the database
                    callback('Restaurant does not exist', null);
                }
            }
        });
    }

    /**
     * Fetch restaurants by a cuisine type with proper error handling.
     */
    static fetchRestaurantByCuisine(cuisine, callback) {
        // Fetch all restaurants  with proper error handling
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Filter restaurants to have only given cuisine type
                const results = restaurants.filter(r => r.cuisine_type == cuisine);
                callback(null, results);
            }
        });
    }

    /**
     * Fetch restaurants by a neighborhood with proper error handling.
     */
    static fetchRestaurantByNeighborhood(neighborhood, callback) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Filter restaurants to have only given neighborhood
                const results = restaurants.filter(r => r.neighborhood == neighborhood);
                callback(null, results);
            }
        });
    }

    /**
     * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
     */
    static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                let results = restaurants;
                if (cuisine != 'all') {
                    // filter by cuisine
                    results = results.filter(r => r.cuisine_type == cuisine);
                }
                if (neighborhood != 'all') {
                    // filter by neighborhood
                    results = results.filter(r => r.neighborhood == neighborhood);
                }
                callback(null, results);
            }
        });
    }

    /**
     * Fetch all neighborhoods with proper error handling.
     */
    static fetchNeighborhoods(callback) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Get all neighborhoods from all restaurants
                const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood);
                // Remove duplicates from neighborhoods
                const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i);
                callback(null, uniqueNeighborhoods);
            }
        });
    }

    /**
     * Fetch all cuisines with proper error handling.
     */
    static fetchCuisines(callback) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Get all cuisines from all restaurants
                const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
                // Remove duplicates from cuisines
                const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i);
                callback(null, uniqueCuisines);
            }
        });
    }

    /**
     * Restaurant page URL.
     */
    static urlForRestaurant(restaurant) {
        return `./restaurant.html?id=${restaurant.id}`;
    }

    /**
     * Restaurant image URL.
     */
    static imageUrlForRestaurant(restaurant) {
        return `/img/${restaurant.photograph}.jpg`;
    }

    /**
     * Map marker for a restaurant.
     */
    static mapMarkerForRestaurant(restaurant, map) {
        const marker = new google.maps.Marker({
            position: restaurant.latlng,
            title: restaurant.name,
            url: DBHelper.urlForRestaurant(restaurant),
            map: map,
            animation: google.maps.Animation.DROP
        });
        return marker;
    }
}

class IDB {
    static get DATABASE_NAME() {
        return 'mws-restaurant';
    }

    static get STORE_NAME() {
        return 'firstOS';
    }

    static isIndexedDBSupported() {
        if (!('indexedDB' in window)) {
            console.log("This browser doesn't support IndexedDB");
            return false;
        }
        return true;
    }

    static createObjectStore() {
        const dbPromise = idb.open(IDB.DATABASE_NAME, 1, upgradeDb => {
            console.log({ upgradeDb });

            if (!upgradeDb.objectStoreNames.contains('firstOS')) {
                console.log('creating first os');
                upgradeDb.createObjectStore('firstOS');
            }
        });
    }

    static set(key, val) {
        const dbPromise = idb.open(IDB.DATABASE_NAME, 1);
        dbPromise
            .then(db => {
                const tx = db.transaction(IDB.STORE_NAME, 'readwrite');
                tx.objectStore(IDB.STORE_NAME).put(val, key);
                return tx.complete;
            })
            .then(() => console.log('Successfully stored data'));
    }

    static get(key) {
        const dbPromise = idb.open(IDB.DATABASE_NAME, 1);
        return dbPromise.then(db => {
            return db
                .transaction(IDB.STORE_NAME)
                .objectStore(IDB.STORE_NAME)
                .get(key);
        });
    }
}
