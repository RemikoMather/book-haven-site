import { supabase } from './config.js';

// Newsletter subscription handling
class NewsletterSubscription {
    constructor() {
        this.form = document.getElementById('footer-subscribe-form');
        this.setupEventListeners();
    }

    setupEventListeners() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const email = form.email.value;
        const errorElement = form.querySelector('.error-message');
        const submitButton = form.querySelector('button[type="submit"]');
        const loadingIndicator = submitButton.querySelector('.loading-indicator');

        // Email validation
        if (!this.validateEmail(email)) {
            this.showError(errorElement, 'Please enter a valid email address');
            return;
        }

        try {
            // Show loading state
            submitButton.disabled = true;
            loadingIndicator.style.display = 'inline-block';

            await this.subscribeToNewsletter(email);
            
            // Success handling
            form.reset();
            this.showSuccess(form);
        } catch (error) {
            // Error handling
            this.showError(errorElement, 'Error subscribing. Please try again.');
            console.error('Subscription error:', error);
        } finally {
            // Reset UI state
            submitButton.disabled = false;
            loadingIndicator.style.display = 'none';
        }
    }

    validateEmail(email) {
        // RFC 5322 compliant email regex
        const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return emailRegex.test(email.toLowerCase());
    }

    async subscribeToNewsletter(email) {
        if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
            throw new Error('Supabase configuration missing');
        }

        const { data, error } = await supabase
            .from('subscriptions')
            .insert([{ 
                email: email,
                subscribed_at: new Date().toISOString(),
                status: 'active'
            }]);

        if (error) throw error;
        return data;
    }

    showError(errorElement, message) {
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    showSuccess(form) {
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.textContent = 'Thank you for subscribing!';
        
        // Insert after form
        form.insertAdjacentElement('afterend', successMessage);
        
        // Remove after 3 seconds
        setTimeout(() => {
            successMessage.remove();
        }, 3000);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    new NewsletterSubscription();
});
