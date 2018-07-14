let map;
let DB = new DBHelper();

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
    fetchRestaurantFromURL((error, restaurant) => {
        if (error) {
            // Got an error!
            console.error(error);
        } else {
            self.map = new google.maps.Map(document.getElementById('map'), {
                zoom: 16,
                center: restaurant.latlng,
                scrollwheel: false
            });
            fillBreadcrumb(restaurant);
            DB.mapMarkerForRestaurant(restaurant, self.map);
        }
    });
};

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = callback => {
    const id = getParameterByName('id');
    if (!id) {
        // no id found in URL
        error = 'No restaurant id in URL';
        callback(error, null);
    } else {
        DB.fetchRestaurantById(id, (error, restaurant) => {
            console.log({ restaurant });
            // if (!restaurant) {
            //     console.error(error);
            //     return;
            // }
            fillRestaurantHTML(restaurant);
            callback(null, restaurant);
        });
        DB.fetchRestaurantReviewsById(id, (error, reviews) => {
            // fill reviews
            fillReviewsHTML(reviews);
        });
    }
};

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
    const name = document.getElementById('restaurant-name');
    name.innerHTML = restaurant.name;

    const address = document.getElementById('restaurant-address');
    address.innerHTML = restaurant.address;

    const image = document.getElementById('restaurant-img');
    image.className = 'restaurant-img';
    image.src = DB.imageUrlForRestaurant(restaurant);
    image.alt = `Image fo ${restaurant.name} Restaurant`;

    const cuisine = document.getElementById('restaurant-cuisine');
    cuisine.innerHTML = restaurant.cuisine_type;

    // fill operating hours
    if (restaurant.operating_hours) {
        fillRestaurantHoursHTML(restaurant.operating_hours);
    }
};

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
    const hours = document.getElementById('restaurant-hours');
    for (let key in operatingHours) {
        const row = document.createElement('tr');

        const day = document.createElement('td');
        day.innerHTML = key;
        row.appendChild(day);

        const time = document.createElement('td');
        time.innerHTML = operatingHours[key];
        row.appendChild(time);

        hours.appendChild(row);
    }
};

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = reviews => {
    const container = document.getElementById('reviews-container');
    const title = document.createElement('h3');
    title.innerHTML = 'Reviews';
    container.appendChild(title);

    if (!reviews) {
        const noReviews = document.createElement('p');
        noReviews.innerHTML = 'No reviews yet!';
        container.appendChild(noReviews);
        return;
    }
    const ul = document.getElementById('reviews-list');
    reviews.forEach(review => {
        ul.appendChild(createReviewHTML(review));
    });
    container.appendChild(ul);
};

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = review => {
    const header = document.createElement('div');
    header.classList.add('header');
    const li = document.createElement('li');
    li.setAttribute('aria-label', 'Review');

    const name = document.createElement('p');
    name.innerHTML = review.name;
    name.classList.add('name');
    header.appendChild(name);

    const date = document.createElement('p');
    if (review.updatedAt) {
        date.innerHTML = new Date(review.updatedAt).toLocaleDateString();
    } else {
        date.innerHTML = new Date(review.createdAt).toLocaleDateString();
    }
    date.classList.add('date');
    header.appendChild(date);

    const rating = document.createElement('p');
    rating.innerHTML = `Rating: ${review.rating}`;
    rating.classList.add('rating');

    const comments = document.createElement('p');
    comments.innerHTML = review.comments;
    li.appendChild(header);
    li.appendChild(rating);
    li.appendChild(comments);

    return li;
};

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = restaurant => {
    const breadcrumb = document.getElementById('breadcrumb');
    const li = document.createElement('li');
    li.innerHTML = restaurant.name;
    breadcrumb.appendChild(li);
};

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

function timeConverter(UNIX_timestamp) {
    var a = new Date(UNIX_timestamp);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var time = `${date} ${month} ${year}`;
    console.log(a.toDateString());
    return time;
}
