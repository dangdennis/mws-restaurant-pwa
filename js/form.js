class Form {
    constructor() {
        this.el = {};
    }
    initElements() {
        this.el.submitButton = document.querySelector('.js-submit-review-btn');
        this.el.form = document.querySelector('#ReviewForm');
    }
    initHandlers() {
        this.el.submitButton.addEventListener('click', this.handleReviewSubmission);
    }

    handleReviewSubmission(e) {
        e.preventDefault();
        console.log('submitting a form');
    }
}
