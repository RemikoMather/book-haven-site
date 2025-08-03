class CartManager {
    constructor() {
        this.cart = JSON.parse(sessionStorage.getItem('cart')) || [];
        this.cartModal = document.getElementById('cart-modal');
        this.cartButton = document.getElementById('view-cart-btn');
        this.setupEventListeners();
        this.updateCartCount();
    }

    setupEventListeners() {
        this.cartButton?.addEventListener('click', () => this.openCart());
        
        // Event delegation for cart item actions
        this.cartModal?.addEventListener('click', (e) => {
            if (e.target.matches('.remove-item')) {
                const itemId = e.target.closest('.cart-item').dataset.id;
                this.removeItem(itemId);
            } else if (e.target.matches('.quantity-adjust')) {
                const itemId = e.target.closest('.cart-item').dataset.id;
                const adjustment = e.target.dataset.adjust;
                this.adjustQuantity(itemId, adjustment);
            }
        });

        // Close modal on outside click or escape
        window.addEventListener('click', (e) => {
            if (e.target === this.cartModal) {
                this.closeCart();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.cartModal.style.display === 'block') {
                this.closeCart();
            }
        });
    }

    openCart() {
        this.renderCart();
        this.cartModal.style.display = 'block';
        this.trapFocus(this.cartModal);
    }

    closeCart() {
        this.cartModal.style.display = 'none';
    }

    renderCart() {
        const cartContent = document.querySelector('.cart-content');
        if (!cartContent) return;

        if (this.cart.length === 0) {
            cartContent.innerHTML = '<p>Your cart is empty</p>';
            return;
        }

        const total = this.calculateTotal();
        
        cartContent.innerHTML = `
            ${this.cart.map(item => this.renderCartItem(item)).join('')}
            <div class="cart-total">
                <strong>Total: $${total.toFixed(2)}</strong>
            </div>
            <div class="cart-actions">
                <button class="btn btn-primary" onclick="cartManager.processOrder()">Checkout</button>
                <button class="btn btn-secondary" onclick="cartManager.clearCart()">Clear Cart</button>
            </div>
        `;
    }

    renderCartItem(item) {
        return `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h3>${item.name}</h3>
                    <p>$${item.price.toFixed(2)}</p>
                    <div class="quantity-controls">
                        <button class="quantity-adjust" data-adjust="decrease">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-adjust" data-adjust="increase">+</button>
                    </div>
                </div>
                <button class="remove-item" aria-label="Remove ${item.name} from cart">×</button>
            </div>
        `;
    }

    addToCart(item) {
        const existingItem = this.cart.find(i => i.id === item.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({ ...item, quantity: 1 });
        }

        this.updateStorage();
        this.updateCartCount();
        this.showAlert('Item added to cart!');
    }

    removeItem(itemId) {
        this.cart = this.cart.filter(item => item.id !== itemId);
        this.updateStorage();
        this.updateCartCount();
        this.renderCart();
    }

    adjustQuantity(itemId, adjustment) {
        const item = this.cart.find(i => i.id === itemId);
        if (!item) return;

        if (adjustment === 'increase') {
            item.quantity += 1;
        } else if (adjustment === 'decrease') {
            item.quantity = Math.max(0, item.quantity - 1);
            if (item.quantity === 0) {
                this.removeItem(itemId);
                return;
            }
        }

        this.updateStorage();
        this.updateCartCount();
        this.renderCart();
    }

    calculateTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    updateStorage() {
        sessionStorage.setItem('cart', JSON.stringify(this.cart));
    }

    updateCartCount() {
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
        }
    }

    clearCart() {
        this.cart = [];
        this.updateStorage();
        this.updateCartCount();
        this.renderCart();
        this.showAlert('Cart cleared!');
    }

    async processOrder() {
        if (this.cart.length === 0) {
            this.showAlert('Your cart is empty!');
            return;
        }

        try {
            // Here you would integrate with a payment processor
            this.showAlert('Processing your order...');
            
            // Simulate order processing
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            this.clearCart();
            this.closeCart();
            this.showAlert('Order processed successfully!');
        } catch (error) {
            console.error('Order processing error:', error);
            this.showAlert('Error processing order. Please try again.');
        }
    }

    showAlert(message) {
        const alert = document.createElement('div');
        alert.className = 'alert';
        alert.textContent = message;
        document.body.appendChild(alert);
        
        setTimeout(() => {
            alert.remove();
        }, 3000);
    }

    trapFocus(element) {
        const focusableElements = element.querySelectorAll(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;

        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        element.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusable) {
                        lastFocusable.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastFocusable) {
                        firstFocusable.focus();
                        e.preventDefault();
                    }
                }
            }
        });

        firstFocusable.focus();
    }
}

// Initialize cart manager
const cartManager = new CartManager();
