class Form {
    constructor() {
        this.el = {};
        this.isInitialLoad = true;
        this.IDB = new IDB();
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

    getReviewFromForm() {
        const body = {
            restaurant_id: this.el.restaurantInput.value,
            name: this.el.nameInput.value,
            rating: parseInt(this.el.ratingInput.value),
            comments: this.el.commentInput.value
        };
        return body;
    }

    fetchReviewsFromNetwork() {
        const id = getParameterByName('id');
        DB.fetchRestaurantReviewsById(id, (error, reviews) => {
            this.el.reviewList.innerHTML = '';
            fillReviewsHTML(reviews);
        });
    }

    handleReviewSubmission(e) {
        if (this.validateForm.call(this)) {
            const review = this.getReviewFromForm();
            this.postReview(review)
                .then(this.onFormSubmissionSuccess.bind(this))
                .catch(this.onFormSubmissionError.bind(this));
        }
    }

    postReview(reviewData) {
        return fetch('http://localhost:1337/reviews/', {
            body: JSON.stringify(reviewData),
            mode: 'cors',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            }
        });
    }

    onFormSubmissionSuccess(res) {
        if (res.status === 201) {

            let toast = VanillaToasts.create({
                title: 'Review submitted!',
                text: 'Thanks for sharing your thoughts.',
                type: 'success',
                timeout: 6000
            });
            this.fetchReviewsFromNetwork();
            this.resetForm();
        }
    }

    onFormSubmissionError(error) {
        // Cuz I don't know how else to check for network errors
        if (error.message === 'Failed to fetch') {
            let toast = VanillaToasts.create({
                title: 'Out of network!',
                text: 'Thanks for the review! Once you have connection, your review will be sent.',
                type: 'error',
                timeout: 6000
            });
            const review = this.getReviewFromForm();
            this.saveReviewToIDB(review);
            this.resetForm();
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
        const objStoreName = 'reviews';
        this.IDB.set(undefined, review, objStoreName);
    }

    async getReviewsFromIDB() {
        const objStoreName = 'reviews';
        const reviews = await this.IDB.getAll(objStoreName);
        return reviews;
    }

    submitReviewsFromIDB() {
        const objStoreName = 'reviews';
        this.IDB.cursor(postReviewWithinIDB, objStoreName);

        let postReview = this.postReview.bind(this);
        let idbDelete = this.IDB.delete.bind(this);
        let fetchReviewsFromNetwork = this.fetchReviewsFromNetwork.bind(this);

        function postReviewWithinIDB(review, key) {
            postReview(review).then(res => {
                if (res.status === 201) {
                    idbDelete(key, objStoreName);
                    fetchReviewsFromNetwork();
                }
            });
        }
    }

    init() {
        this.initElements();
        this.initHandlers();
        this.setRestaurantIdToForm();
        if (this.isInitialLoad) {
            this.isInitialLoad = false;
            this.submitReviewsFromIDB();
        }
    }
}
