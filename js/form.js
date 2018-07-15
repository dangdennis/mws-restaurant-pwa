class Form {
    constructor() {
        this.el = {};
    }
    initElements() {
        this.el.submitButton = document.querySelector('.js-submit-review-btn');
        this.el.form = document.querySelector('#ReviewForm');
        this.el.restaurantInput = document.querySelector('#RestaurantId');
        this.el.nameInput = document.querySelector('#ReviewerName');
        this.el.commentInput = document.querySelector('#ReviewComments');
        this.el.ratingInput = document.querySelector('#ReviewRating');
    }
    initHandlers() {
        this.el.submitButton.addEventListener('click', this.handleReviewSubmission.bind(this));
    }

    handleReviewSubmission(e) {
        // e.preventDefault();
        if (this.validateForm.call(this)) {
            console.log('submitting');
            const body = {
                restaurant_id: this.el.restaurantInput.value,
                name: this.el.nameInput.value,
                rating: parseInt(this.el.ratingInput.value),
                comments: this.el.commentInput.value
            };
            fetch('http://localhost:1337/reviews/', {
                body: JSON.stringify(body),
                mode: 'cors',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                }
            })
                .then(res => {
                    console.log({ res });
                    console.log('Post successful');

                    // TODO: AJAX render new reviews
                    // this.resetForm();
                    // let DB = new DBHelper();
                    // const restaurantId = this.el.restaurantInput.value;
                    // DB.fetchRestaurantReviewsById(restaurantId, (error, reviews) => {
                    //     // fill reviews
                    //     fillReviewsHTML(reviews);
                    // });

                    location.reload();
                })
                .catch(error => console.error('error', error));
        }
    }

    validateForm() {
        if (this.el.nameInput.value.length === 0) {
            return false;
        }
        if (this.el.commentInput.length === 0) {
            return false;
        }
        const rating = parseInt(this.el.ratingInput.value);
        if (isNaN(rating) || rating < 0 || rating > 5) {
            return false;
        }
        return true;
    }

    setRestaurantIdToForm() {
        var restaurantId = location.search[location.search.indexOf('id=') + 3];
        this.el.restaurantInput.value = restaurantId;
    }

    resetForm() {
        this.el.restaurantInput.value = '';
        this.el.nameInput.value = '';
        this.el.commentInput.value = '';
        this.el.ratingInput.value = '';
    }

    triggerFormState(state) {
        if (state === 'error') {
        }
    }

    init() {
        this.initElements();
        this.initHandlers();
        this.setRestaurantIdToForm();
    }
}
