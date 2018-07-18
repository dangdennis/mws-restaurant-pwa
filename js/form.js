class Form {
    constructor() {
        this.el = {};
        this.isInitialLoad = true;
        this.DB = new DBHelper();
    }
    initElements() {
        this.el.submitButton = document.querySelector('.js-submit-review-btn');
        this.el.form = document.querySelector('#ReviewForm');
        this.el.restaurantInput = document.querySelector('#RestaurantId');
        this.el.nameInput = document.querySelector('#ReviewerName');
        this.el.commentInput = document.querySelector('#ReviewComments');
        this.el.ratingInput = document.querySelector('#ReviewRating');
        this.el.reviewList = document.querySelector('#reviews-list');
    }
    initHandlers() {
        this.el.submitButton.addEventListener('click', this.handleReviewSubmission.bind(this));
    }

    getReview() {
        const body = {
            restaurant_id: this.el.restaurantInput.value,
            name: this.el.nameInput.value,
            rating: parseInt(this.el.ratingInput.value),
            comments: this.el.commentInput.value
        };
        return body;
    }

    handleReviewSubmission(e) {
        // e.preventDefault();
        if (this.validateForm.call(this)) {
            console.log('submitting');
            const review = this.getReview();
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

                    let toast = VanillaToasts.create({
                        title: 'Review submitted!',
                        text: 'Thanks for sharing your thoughts.',
                        type: 'success',
                        timeout: 6000
                    });
                    this.fetchMoreReviews();
                    this.resetForm();
                })
                .catch(error => {
                    // Cuz I don't know how else to check for network errors
                    if (error.message === 'Failed to fetch') {
                        let toast = VanillaToasts.create({
                            title: 'Out of network!',
                            text: 'Thanks for the review! Once you have connection, your review will be sent.',
                            type: 'error',
                            timeout: 6000
                        });
                        const review = this.getReview();
                        this.saveReviewToIDB(review);
                        this.resetForm();
                    }
                });
        }
    }

    validateForm() {
        if (this.el.nameInput.value.length === 0) {
            this.el.nameInput.setAttribute('aria-invalid', true);
            this.el.nameInput.style.border = '1px solid red';
            return false;
        }
        const rating = parseInt(this.el.ratingInput.value);
        if (isNaN(rating) || rating < 0 || rating > 5) {
            this.el.ratingInput.setAttribute('aria-invalid', true);
            this.el.ratingInput.style.border = '1px solid red';
            return false;
        }
        if (this.el.commentInput.value.length === 0) {
            this.el.commentInput.setAttribute('aria-invalid', true);
            this.el.commentInput.style.border = '1px solid red';
            return false;
        }

        return true;
    }

    setRestaurantIdToForm() {
        var restaurantId = location.search[location.search.indexOf('id=') + 3];
        this.el.restaurantInput.value = restaurantId;
    }

    resetForm() {
        this.el.nameInput.value = '';
        this.el.nameInput.setAttribute('aria-invalid', false);
        this.el.nameInput.style.border = '';
        this.el.commentInput.value = '';
        this.el.commentInput.setAttribute('aria-invalid', false);
        this.el.commentInput.style.border = '';
        this.el.ratingInput.value = '';
        this.el.ratingInput.setAttribute('aria-invalid', false);
        this.el.ratingInput.style.border = '';
    }

    saveReviewToIDB(review) {
        console.log('saving review');
    }

    fetchMoreReviews() {
        const id = getParameterByName('id');
        DB.fetchRestaurantReviewsById(id, (error, reviews) => {
            this.el.reviewList.innerHTML = '';
            fillReviewsHTML(reviews);
        });
    }

    init() {
        this.initElements();
        this.initHandlers();
        this.setRestaurantIdToForm();
    }
}
