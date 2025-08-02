// BookHaven UI Components and Utilities
const BookHaven = {
    // Initialize all components
    init() {
        this.initializeNavigation();
        if (window.CartManager) CartManager.init();
        if (window.ContactForm) ContactForm.init();
        if (window.CustomPage) CustomPage.init();
    },

    // Navigation highlighting
    initializeNavigation() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-links a');
        navLinks.forEach(link => {
            if (link.getAttribute('href') === currentPath) {
                link.setAttribute('aria-current', 'page');
            }
        });
    },

    // Modal System
    showModal({ title, content, footer }) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                ${title ? `<div class="modal-header"><h3>${title}</h3></div>` : ''}
                <div class="modal-body">${content}</div>
                ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
            </div>
        `;
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('active'), 10);
    },

    closeModal(element) {
        const modal = element.closest('.modal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }
    },

    // Footer with newsletter
    initializeFooter() {
        const footer = document.createElement('footer');
        footer.innerHTML = `
            <div class="container">
                <div class="footer-grid">
                    <div class="footer-newsletter">
                        <h3>Subscribe to Our Newsletter</h3>
                        <form onsubmit="BookHaven.handleNewsletter(event)" class="newsletter-form">
                            <div class="form-group">
                                <label for="footer-email">Email Address</label>
                                <input type="email" id="footer-email" name="email" required 
                                       placeholder="Enter your email address">
                            </div>
                            <button type="submit" class="btn">Subscribe</button>
                        </form>
                    </div>
                    <div class="footer-links">
                        <h3>Quick Links</h3>
                        <nav>
                            <a href="index.html">Home</a>
                            <a href="gallery.html">Gallery</a>
                            <a href="about.html">About</a>
                            <a href="custom.html">Custom Services</a>
                        </nav>
                    </div>
                    <div class="footer-contact">
                        <h3>Contact Us</h3>
                        <p>123 Book Street</p>
                        <p>Literary Town, BK 12345</p>
                        <p>Phone: (555) 123-4567</p>
                        <p>Email: info@bookhaven.com</p>
                    </div>
                </div>
                <div class="footer-bottom">
                    <p>&copy; 2025 Book Haven. All rights reserved.</p>
                </div>
            </div>
        `;
        document.body.appendChild(footer);
    },

    // Newsletter Subscription
    handleNewsletter(event) {
        event.preventDefault();
        const form = event.target;
        const email = form.email.value;

        if (!this.validateEmail(email)) {
            this.showError(form.email, 'Please enter a valid email address');
            return;
        }

        // Store subscription
        const subscribers = JSON.parse(localStorage.getItem('subscribers') || '[]');
        if (!subscribers.includes(email)) {
            subscribers.push(email);
            localStorage.setItem('subscribers', JSON.stringify(subscribers));
        }

        this.showModal({
            title: 'Newsletter Subscription',
            content: `
                <div class="success-message">
                    <h4>Thank You for Subscribing!</h4>
                    <p>You've been successfully added to our newsletter list.</p>
                    <p>A confirmation email has been sent to: ${email}</p>
                </div>
            `
        });

        form.reset();
    },

    // Form Validation
    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    showError(element, message) {
        element.classList.add('error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        element.parentNode.appendChild(errorDiv);
    },

    clearError(element) {
        element.classList.remove('error');
        const errorDiv = element.parentNode.querySelector('.error-message');
        if (errorDiv) errorDiv.remove();
    },

    // Modal System
    showModal({ title, content, footer }) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                <div class="modal-footer">
                    ${footer || '<button class="btn" onclick="BookHaven.closeModal(this)">Close</button>'}
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('active'), 10);
    },

    closeModal(element) {
        const modal = element.closest('.modal');
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    },

    // Loading States
    showLoading(element) {
        element.classList.add('loading');
        element.disabled = true;
    },

    hideLoading(element) {
        element.classList.remove('loading');
        element.disabled = false;
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => BookHaven.init());

// Make BookHaven available globally
window.BookHaven = BookHaven;
