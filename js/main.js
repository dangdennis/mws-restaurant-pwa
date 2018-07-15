let restaurants, neighborhoods, cuisines;
var map;
var markers = [];
let DB = new DBHelper();

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', async event => {
    console.log('initializing page');
    const restaurants = await DB.fetchRestaurants();
    fillNeighborhoodsHTML(DB.filterNeighborhoods(restaurants));
    fillCuisinesHTML(DB.filterCuisines(restaurants));
    updateRestaurants(restaurants);
});

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
    const select = document.getElementById('neighborhoods-select');
    neighborhoods.forEach(neighborhood => {
        const option = document.createElement('option');
        option.innerHTML = neighborhood;
        option.value = neighborhood;
        select.append(option);
    });
};

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
    const select = document.getElementById('cuisines-select');

    cuisines.forEach(cuisine => {
        const option = document.createElement('option');
        option.innerHTML = cuisine;
        option.value = cuisine;
        select.append(option);
    });
};

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
    let loc = {
        lat: 40.722216,
        lng: -73.987501
    };
    self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: loc,
        scrollwheel: false
    });
};

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = restaurants => {
    const cSelect = document.getElementById('cuisines-select');
    const nSelect = document.getElementById('neighborhoods-select');

    const cIndex = cSelect.selectedIndex;
    const nIndex = nSelect.selectedIndex;

    const cuisine = cSelect[cIndex].value;
    const neighborhood = nSelect[nIndex].value;

    DB.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, restaurants).then(filtered => {
        resetRestaurants(filtered);
        fillRestaurantsHTML(filtered);
    });
};

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = restaurants => {
    // Remove all restaurants
    self.restaurants = [];
    const ul = document.getElementById('restaurants-list');
    ul.innerHTML = '';

    // Remove all map markers
    self.markers.forEach(m => m.setMap(null));
    self.markers = [];
    self.restaurants = restaurants;
};

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
    const ul = document.getElementById('restaurants-list');
    restaurants.forEach(restaurant => {
        ul.append(createRestaurantHTML(restaurant));
    });
    addMarkersToMap();
};

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = restaurant => {
    const li = document.createElement('li');
    li.setAttribute('aria-label', 'restaurant');
    li.setAttribute('data-restaurant-id', restaurant.id);
    li.setAttribute('data-favorite', restaurant.is_favorite);

    const image = document.createElement('img');
    image.className = 'restaurant-img';
    image.src = DB.imageUrlForRestaurant(restaurant);
    image.alt = `Image of ${restaurant.name} Restaurant`;
    li.append(image);

    const name = document.createElement('h2');
    name.innerHTML = restaurant.name;
    li.append(name);

    const neighborhood = document.createElement('p');
    neighborhood.innerHTML = restaurant.neighborhood;
    li.append(neighborhood);

    const address = document.createElement('p');
    address.innerHTML = restaurant.address;
    li.append(address);

    const more = document.createElement('a');
    more.innerHTML = 'View Details';
    more.href = DB.urlForRestaurant(restaurant);
    li.append(more);

    const heart = document.createElement('i');
    heart.classList.add('fa-heart', 'fa-2x');
    if (restaurant.is_favorite === true || restaurant.is_favorite === 'true') {
        heart.classList.add('fas');
    } else {
        heart.classList.add('far');
    }
    heart.addEventListener('click', function(e) {
        const id = this.parentNode.getAttribute('data-restaurant-id');
        const isFavorite = this.parentNode.getAttribute('data-favorite');
        console.log({ isFavorite });
        DB.faveRestaurant(id, isFavorite, console.log);
        // TODO: AJAX this later
        // location.reload();
    });

    li.append(heart);

    return li;
};

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
    restaurants.forEach(restaurant => {
        // Add marker to the map
        const marker = DB.mapMarkerForRestaurant(restaurant, self.map);
        google.maps.event.addListener(marker, 'click', () => {
            window.location.href = marker.url;
        });
        self.markers.push(marker);
    });
};
