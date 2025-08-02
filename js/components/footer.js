// Footer component with email validation and subscription modal
const Footer = {
    init() {
        const footer = document.createElement('footer');
        footer.className = 'wireframe-box';
        footer.innerHTML = `
            <div class="wireframe-label">FOOTER</div>
            <form class="newsletter-form" onsubmit="Footer.handleSubscribe(event)">
                <div class="form-group">
                    <label for="footer-email">Subscribe to our Newsletter</label>
                    <input type="email" id="footer-email" name="email" required 
                           placeholder="Enter your email">
                </div>
                <button type="submit" class="btn">Subscribe</button>
            </form>
        `;
        return footer;
    },

    handleSubscribe(event) {
        event.preventDefault();
        const form = event.target;
        const email = form.email.value;

        if (!Validator.email(email)) {
            Validator.showError(form.email, 'Please enter a valid email address');
            return;
        }

        // Store subscription in localStorage
        const subscribers = JSON.parse(localStorage.getItem('subscribers') || '[]');
        if (!subscribers.includes(email)) {
            subscribers.push(email);
            localStorage.setItem('subscribers', JSON.stringify(subscribers));
        }

        Modal.create({
            title: 'NEWSLETTER SIGNUP',
            content: `
                <div class="wireframe-box">
                    <div class="wireframe-label">SUCCESS</div>
                    <p>Thank you for subscribing to our newsletter!</p>
                    <p>Confirmation sent to: ${email}</p>
                </div>
            `
        });

        form.reset();
    }
};

// Make Footer available globally
window.Footer = Footer;
