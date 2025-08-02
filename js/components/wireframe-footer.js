// Shared Footer Component
class WireframeFooter extends HTMLElement {
    constructor() {
        super();
        this.render();
        this.setupListeners();
    }

    render() {
        this.innerHTML = `
            <footer class="wireframe-footer">
                <div class="wireframe-box" data-label="Newsletter Signup">
                    <form class="wireframe-newsletter-form" id="newsletterForm">
                        <div class="wireframe-input-group">
                            <input type="email" 
                                   class="wireframe-input" 
                                   placeholder="Enter your email"
                                   required
                                   aria-label="Email address">
                            <div class="wireframe-tooltip">Enter a valid email address</div>
                        </div>
                        <button type="submit" class="wireframe-button">Subscribe</button>
                    </form>
                </div>

                <div class="wireframe-box" data-label="Social Links">
                    <div class="wireframe-social">
                        <div class="wireframe-social-icon has-tooltip">
                            FB
                            <div class="wireframe-tooltip">Facebook</div>
                        </div>
                        <div class="wireframe-social-icon has-tooltip">
                            TW
                            <div class="wireframe-tooltip">Twitter</div>
                        </div>
                        <div class="wireframe-social-icon has-tooltip">
                            IG
                            <div class="wireframe-tooltip">Instagram</div>
                        </div>
                    </div>
                </div>

                <div class="wireframe-text" data-width="short">© 2025 Book Haven</div>
            </footer>
        `;
    }

    setupListeners() {
        const form = this.querySelector('#newsletterForm');
        const emailInput = form?.querySelector('input[type="email"]');

        emailInput?.addEventListener('input', (e) => {
            const input = e.target;
            if (input.validity.valid) {
                input.classList.remove('error');
                input.classList.add('success');
            } else {
                input.classList.remove('success');
                input.classList.add('error');
            }
        });

        form?.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = emailInput?.value;

            if (email && this.validateEmail(email)) {
                // Store subscription in localStorage
                const subscriptions = JSON.parse(localStorage.getItem('newsletterSubscriptions') || '[]');
                if (!subscriptions.includes(email)) {
                    subscriptions.push(email);
                    localStorage.setItem('newsletterSubscriptions', JSON.stringify(subscriptions));
                }

                const modal = new WireframeModal('newsletter', 'Subscription Confirmed');
                modal.show(`
                    <div class="wireframe-box" data-label="Success">
                        <p>Thank you for subscribing to our newsletter!</p>
                        <p>Confirmation sent to: ${email}</p>
                    </div>
                `);
                form.reset();
            }
        });
    }

    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
}

// Register the custom element
customElements.define('wireframe-footer', WireframeFooter);
