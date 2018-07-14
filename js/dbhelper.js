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
     * Quick and dirty way to store all my urls
     */
    get DATABASE_URL() {
        const domain = `http://localhost:`;
        const port = 1337; // Change this to your server port
        const origin = `${domain}${port}`;
        return {
            restaurants: `${origin}/restaurants`, // All restaurants, or 1 with ID
            restaurantsFavorites: `${origin}/restaurants/?is_favorite=true`, // All favorited restaurants
            restaurantReviews: `${origin}/reviews/?restaurant_id=`, // All reviews by restaurant ID
            reviews: `${origin}/reviews/`, // All reviews, or 1 with ID
            faveRestaurant: id => `${origin}/restaurants/${id}/is_favorite=true`, // Favorite a restaurant by ID
            unFaveRestaurant: id => `${origin}/restaurants/${id}/is_favorite=false`, // Unfavorite a restaurant by ID
            editReview: id => `${origin}/reviews/${id}` // PUT = update, DELETE = delete review
        };
    }

    async apiFetcher(url) {
        try {
            const result = await fetch(url).then(res => res.json);
            console.log({ result });
            return result;
        } catch (error) {
            console.warn('You got a network error:', error);
        }
    }

    async fetchFavoriteRestaurants(callback) {
        const url = this.DATABASE_URL().restaurantsFavorites;
        const res = await this.apiFetcher(url);
        console.log({ res });
        callback(res);
    }

    async faveRestaurantAction() {}

    /**
     * Fetch all restaurants.
     */
    async fetchRestaurants(callback) {
        let restaurants;

        try {
            // Get restaurants from indexedDB if it exists
            if (this.IDB.isIndexedDBSupported) {
                await this.IDB.createObjectStore('firstOS');
                restaurants = await this.IDB.get('restaurants').then(res => res);
            }

            // Fetch restaurants if still undefined after Idb attempt
            if (!restaurants) {
                restaurants = await fetch(this.DATABASE_URL.restaurants).then(res => res.json());
                this.IDB.set('restaurants', restaurants);
            }

            callback(null, restaurants);
        } catch (error) {
            console.log('Request failed: ', error);
            callback(error, null);
        }
    }

    /**
     * Fetch a restaurant by its ID.
     */
    fetchRestaurantById(id, callback) {
        // fetch all restaurants with proper error handling.
        this.fetchRestaurants((error, restaurants) => {
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
    fetchRestaurantByCuisine(cuisine, callback) {
        // Fetch all restaurants  with proper error handling
        this.fetchRestaurants((error, restaurants) => {
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
    fetchRestaurantByNeighborhood(neighborhood, callback) {
        // Fetch all restaurants
        this.fetchRestaurants((error, restaurants) => {
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
    fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
        // Fetch all restaurants
        this.fetchRestaurants((error, restaurants) => {
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
    fetchNeighborhoods(callback) {
        // Fetch all restaurants
        this.fetchRestaurants((error, restaurants) => {
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
    fetchCuisines(callback) {
        // Fetch all restaurants
        this.fetchRestaurants((error, restaurants) => {
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
     * Fetch Restaurant reviews by ID
     */
    async fetchRestaurantReviewsById(id, callback) {
        try {
            if (this.IDB.isIndexedDBSupported) {
                await this.IDB.createObjectStore();
                reviews = await this.IDB.get(`restaurants-${id}`).then(res => res);
            }

            // Fetch reviews if still undefined after Idb attempt
            if (!reviews) {
                reviews = await fetch(this.DATABASE_URL.restaurants).then(res => res.json());
                this.IDB.set(`restaurants-${id}`, reviews);
            }
        } catch (error) {
            console.log('Request failed: ', error);
            callback(error, null);
        }
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
}

class IDB {
    static get DATABASE_NAME() {
        return 'mws-restaurant';
    }

    static get STORE_NAME() {
        return 'firstOS';
    }

    isIndexedDBSupported() {
        if (!('indexedDB' in window)) {
            console.log("This browser doesn't support IndexedDB");
            return false;
        }
        return true;
    }

    createObjectStore(storeName) {
        const dbPromise = idb.open(IDB.DATABASE_NAME, 1, upgradeDb => {
            console.log({ upgradeDb });

            if (!upgradeDb.objectStoreNames.contains(storeName)) {
                console.log('creating object store name: ', storeName);
                upgradeDb.createObjectStore(storeName);
            }
        });
    }

    set(key, val) {
        const dbPromise = idb.open(IDB.DATABASE_NAME, 1);
        dbPromise
            .then(db => {
                const tx = db.transaction(IDB.STORE_NAME, 'readwrite');
                tx.objectStore(IDB.STORE_NAME).put(val, key);
                return tx.complete;
            })
            .then(() => console.log('Successfully stored data'));
    }

    get(key) {
        const dbPromise = idb.open(IDB.DATABASE_NAME, 1);
        return dbPromise.then(db => {
            const retrieved = db
                .transaction(IDB.STORE_NAME)
                .objectStore(IDB.STORE_NAME)
                .get(key);
            return retrieved;
        });
    }
}
