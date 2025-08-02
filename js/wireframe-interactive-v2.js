// Form Validation
const Validator = {
    email(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
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

    validateForm(form) {
        let isValid = true;
        const fields = form.querySelectorAll('input, textarea, select');
        
        fields.forEach(field => {
            this.clearError(field);
            
            if (field.required && !field.value.trim()) {
                this.showError(field, 'This field is required');
                isValid = false;
            }
            
            if (field.type === 'email' && field.value && !this.email(field.value)) {
                this.showError(field, 'Please enter a valid email address');
                isValid = false;
            }
        });

        return isValid;
    }
};

// Modal System
const Modal = {
    create(options) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content wireframe-box">
                <div class="wireframe-label">${options.title || 'MODAL'}</div>
                <div class="modal-body">${options.content}</div>
                <div class="modal-footer">
                    ${options.footer || '<button class="btn" onclick="Modal.close(this)">Close</button>'}
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('active'), 10);
        return modal;
    },

    close(element) {
        const modal = element.closest('.modal');
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
};

// Cart System
const Cart = {
    items: [],

    add(item) {
        this.items.push(item);
        this.updateUI();
        this.showAddedFeedback(item);
    },

    remove(index) {
        this.items.splice(index, 1);
        this.updateUI();
    },

    clear() {
        this.items = [];
        this.updateUI();
        Modal.create({
            title: 'CART CLEARED',
            content: '<p>Your shopping cart has been cleared.</p>'
        });
    },

    showCart() {
        const content = this.items.length ? `
            <div class="cart-items">
                ${this.items.map((item, index) => `
                    <div class="cart-item wireframe-box">
                        <div class="wireframe-label">ITEM ${index + 1}</div>
                        <div class="cart-item-details">
                            <span>${item.title}</span>
                            <span>${item.price}</span>
                        </div>
                        <button class="btn" onclick="Cart.remove(${index})">Remove</button>
                    </div>
                `).join('')}
            </div>
            <div class="cart-total">
                Total: $${this.getTotal().toFixed(2)}
            </div>
        ` : '<div class="wireframe-box"><div class="wireframe-label">EMPTY CART</div><p>Your cart is empty</p></div>';

        Modal.create({
            title: 'SHOPPING CART',
            content,
            footer: `
                <button class="btn" onclick="Cart.clear()">Clear Cart</button>
                ${this.items.length ? '<button class="btn" onclick="Cart.processOrder()">Process Order</button>' : ''}
                <button class="btn" onclick="Modal.close(this)">Close</button>
            `
        });
    },

    processOrder() {
        if (this.items.length === 0) {
            Modal.create({
                title: 'ERROR',
                content: '<p>Cannot process an empty cart</p>'
            });
            return;
        }

        Modal.create({
            title: 'ORDER PROCESSING',
            content: `
                <div class="wireframe-box">
                    <div class="wireframe-label">ORDER SUMMARY</div>
                    <p>Items: ${this.items.length}</p>
                    <p>Total: $${this.getTotal().toFixed(2)}</p>
                </div>
                <div class="wireframe-box">
                    <div class="wireframe-label">PROCESSING</div>
                    <div class="processing-indicator"></div>
                </div>
            `
        });

        this.clear();
    },

    getTotal() {
        return this.items.reduce((sum, item) => sum + parseFloat(item.price.replace('$', '')), 0);
    },

    updateUI() {
        const count = document.querySelector('.cart-count');
        if (count) count.textContent = this.items.length;
    },

    showAddedFeedback(item) {
        Modal.create({
            title: 'ITEM ADDED',
            content: `
                <div class="wireframe-box">
                    <div class="wireframe-label">ADDED TO CART</div>
                    <p>${item.title} has been added to your cart</p>
                </div>
            `
        });
    }
};

// Form Handler
const FormHandler = {
    handleSubmit(event, type) {
        event.preventDefault();
        const form = event.target;

        if (!Validator.validateForm(form)) {
            return;
        }

        switch (type) {
            case 'newsletter':
                this.handleNewsletter(form);
                break;
            case 'contact':
                this.handleContact(form);
                break;
            case 'event':
                this.handleEvent(form);
                break;
        }

        form.reset();
    },

    handleNewsletter(form) {
        Modal.create({
            title: 'NEWSLETTER SIGNUP',
            content: `
                <div class="wireframe-box">
                    <div class="wireframe-label">SUCCESS</div>
                    <p>Thank you for subscribing to our newsletter!</p>
                    <p>Confirmation email sent to: ${form.querySelector('input[type="email"]').value}</p>
                </div>
            `
        });
    },

    handleContact(form) {
        Modal.create({
            title: 'MESSAGE SENT',
            content: `
                <div class="wireframe-box">
                    <div class="wireframe-label">SUCCESS</div>
                    <p>Your message has been sent successfully.</p>
                    <p>We will respond to your inquiry within 24 hours.</p>
                </div>
            `
        });
    },

    handleEvent(form) {
        Modal.create({
            title: 'EVENT REGISTRATION',
            content: `
                <div class="wireframe-box">
                    <div class="wireframe-label">SUCCESS</div>
                    <p>You have successfully registered for the event.</p>
                    <p>A confirmation email has been sent with the details.</p>
                </div>
            `
        });
    }
};
