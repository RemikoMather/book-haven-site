import { supabase } from './config.js';

class FeedbackSystem {
    constructor() {
        this.feedbackForm = document.getElementById('feedback-form');
        this.feedbackList = document.getElementById('feedback-list');
        this.setupEventListeners();
        this.loadFeedback();
    }

    setupEventListeners() {
        this.feedbackForm?.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Star rating interaction
        const ratingStars = document.querySelectorAll('.rating-star');
        ratingStars.forEach(star => {
            star.addEventListener('click', (e) => this.handleStarRating(e));
            star.addEventListener('mouseover', (e) => this.handleStarHover(e));
            star.addEventListener('mouseout', () => this.handleStarHoverOut());
        });
    }

    async handleSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const rating = form.querySelector('input[name="rating"]').value;
        const comment = form.querySelector('textarea[name="comment"]').value;
        const name = form.querySelector('input[name="name"]').value;

        const submitButton = form.querySelector('button[type="submit"]');
        const loadingIndicator = submitButton.querySelector('.loading-indicator');

        try {
            submitButton.disabled = true;
            loadingIndicator.style.display = 'inline-block';

            const { data, error } = await supabase
                .from('feedback')
                .insert([{
                    rating: parseInt(rating),
                    comment,
                    name,
                    created_at: new Date().toISOString()
                }]);

            if (error) throw error;

            this.showSuccess('Thank you for your feedback!');
            form.reset();
            await this.loadFeedback();

        } catch (error) {
            console.error('Error submitting feedback:', error);
            this.showError('Error submitting feedback. Please try again.');
        } finally {
            submitButton.disabled = false;
            loadingIndicator.style.display = 'none';
        }
    }

    async loadFeedback() {
        try {
            const { data, error } = await supabase
                .from('feedback')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) throw error;

            this.renderFeedback(data);
        } catch (error) {
            console.error('Error loading feedback:', error);
            this.showError('Error loading feedback.');
        }
    }

    renderFeedback(feedbackData) {
        if (!this.feedbackList) return;

        if (feedbackData.length === 0) {
            this.feedbackList.innerHTML = '<p>No feedback yet. Be the first to leave a review!</p>';
            return;
        }

        this.feedbackList.innerHTML = feedbackData.map(feedback => `
            <div class="feedback-item" data-feedback-id="${feedback.id}">
                <div class="feedback-header">
                    <span class="feedback-name">${this.escapeHtml(feedback.name)}</span>
                    <span class="feedback-date">${new Date(feedback.created_at).toLocaleDateString()}</span>
                </div>
                <div class="feedback-rating">
                    ${this.generateStars(feedback.rating)}
                </div>
                <p class="feedback-comment">${this.escapeHtml(feedback.comment)}</p>
            </div>
        `).join('');
    }

    handleStarRating(event) {
        const stars = document.querySelectorAll('.rating-star');
        const rating = event.target.dataset.value;
        const ratingInput = document.querySelector('input[name="rating"]');
        
        stars.forEach(star => {
            star.classList.toggle('active', star.dataset.value <= rating);
        });
        
        ratingInput.value = rating;
    }

    handleStarHover(event) {
        const stars = document.querySelectorAll('.rating-star');
        const rating = event.target.dataset.value;
        
        stars.forEach(star => {
            star.classList.toggle('hover', star.dataset.value <= rating);
        });
    }

    handleStarHoverOut() {
        const stars = document.querySelectorAll('.rating-star');
        const currentRating = document.querySelector('input[name="rating"]').value;
        
        stars.forEach(star => {
            star.classList.remove('hover');
            star.classList.toggle('active', star.dataset.value <= currentRating);
        });
    }

    generateStars(rating) {
        return Array.from({ length: 5 }, (_, i) => `
            <span class="star ${i < rating ? 'filled' : ''}">★</span>
        `).join('');
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    showSuccess(message) {
        const alert = document.createElement('div');
        alert.className = 'alert alert-success';
        alert.textContent = message;
        document.body.appendChild(alert);
        
        setTimeout(() => {
            alert.remove();
        }, 3000);
    }

    showError(message) {
        const alert = document.createElement('div');
        alert.className = 'alert alert-error';
        alert.textContent = message;
        document.body.appendChild(alert);
        
        setTimeout(() => {
            alert.remove();
        }, 3000);
    }
}

// Initialize feedback system
document.addEventListener('DOMContentLoaded', () => {
    new FeedbackSystem();
});
