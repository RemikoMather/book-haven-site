// Alert System
const AlertSystem = {
    show(message, type = 'info') {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        document.body.appendChild(alert);

        setTimeout(() => {
            alert.remove();
        }, 3000);
    }
};

// Modal System
const ModalSystem = {
    show(content) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="wireframe-label">MODAL</div>
                ${content}
                <button class="btn" onclick="this.closest('.modal').remove()">Close</button>
            </div>
        `;
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('active'), 10);
    }
};

// Shopping Cart
const CartSystem = {
    items: [],

    add(item) {
        this.items.push(item);
        this.updateCount();
        AlertSystem.show('Item added to cart');
    },

    clear() {
        this.items = [];
        this.updateCount();
        AlertSystem.show('Cart cleared');
    },

    updateCount() {
        const count = document.querySelector('.cart-count');
        if (count) {
            count.textContent = this.items.length;
        }
    },

    processOrder() {
        if (this.items.length === 0) {
            AlertSystem.show('Cart is empty', 'error');
            return;
        }
        ModalSystem.show(`
            <h2>Order Processing</h2>
            <div class="wireframe-box">
                <div class="wireframe-label">ORDER SUMMARY</div>
                <p>Items in cart: ${this.items.length}</p>
            </div>
        `);
        this.clear();
    }
};

// Form Handler
const FormHandler = {
    handleSubmit(event, type) {
        event.preventDefault();
        const form = event.target;
        
        // Validate required fields
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.style.borderColor = 'red';
            } else {
                field.style.borderColor = '';
            }
        });

        if (!isValid) {
            AlertSystem.show('Please fill in all required fields', 'error');
            return;
        }

        // Show success message based on form type
        switch (type) {
            case 'newsletter':
                AlertSystem.show('Thank you for subscribing!');
                break;
            case 'contact':
                ModalSystem.show(`
                    <h2>Thank You!</h2>
                    <p>Your message has been sent successfully.</p>
                `);
                break;
            case 'event':
                AlertSystem.show('Registration successful!');
                break;
        }

        form.reset();
    }
};
