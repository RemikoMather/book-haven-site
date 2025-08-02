class CartManager {
    static instance;

    constructor() {
        if (CartManager.instance) {
            return CartManager.instance;
        }
        this.cart = this.loadFromStorage();
        this.isProcessing = false;
        CartManager.instance = this;
        this.initialize();
    }

    static init() {
        return new CartManager();
    }

    initialize() {
        this.updateUI();
        this.setupEventListeners();
    }

    setupEventListeners() {
        const cartBtn = document.getElementById('view-cart');
        const cartClose = document.querySelector('.cart-close');
        const cartContainer = document.getElementById('cart-container');

        cartBtn?.addEventListener('click', () => {
            this.showCart();
        });

        cartClose?.addEventListener('click', () => {
            this.closeCart();
        });

        // Close cart when Escape key is pressed
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeCart();
            }
        });

        // Click outside to close
        document.addEventListener('click', (e) => {
            const modal = document.querySelector('.modal');
            if (modal && !modal.contains(e.target) && !e.target.closest('#view-cart')) {
                this.closeCart();
            }
        });
    }

    addItem(book) {
        if (!book || !book.id) {
            this.showError('Invalid book data');
            return;
        }

        const existingItem = this.cart.find(item => item.id === book.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
            this.showSuccess(`Quantity updated: ${book.title} (${existingItem.quantity})`);
        } else {
            this.cart.push({
                ...book,
                quantity: 1
            });
            this.showSuccess(`Added to cart: ${book.title}`);
        }

        this.saveToStorage();
        this.updateUI();
    }

    removeItem(itemId) {
        this.cart = this.cart.filter(item => item.id !== itemId);
        this.saveToStorage();
        this.updateUI();
        this.showCart(); // Refresh cart display
    }

    updateQuantity(itemId, quantity) {
        const item = this.cart.find(i => i.id === itemId);
        
        if (item) {
            item.quantity = Math.max(0, quantity);
            if (item.quantity === 0) {
                this.removeItem(itemId);
            } else {
                this.saveToStorage();
                this.updateUI();
            }
        }
    }

    clear() {
        this.cart = [];
        this.saveToStorage();
        this.updateUI();
        BookHaven.showModal({
            title: 'Cart Cleared',
            content: '<p>Your shopping cart has been cleared.</p>',
            footer: '<button class="btn" onclick="BookHaven.closeModal(this)">Close</button>'
        });
    }

    showCart() {
        const content = this.cart.length ? `
            <div class="cart-items" role="list">
                ${this.cart.map((item, index) => `
                    <div class="cart-item" role="listitem" tabindex="0">
                        <div class="item-image">
                            <img src="${item.image}" alt="${item.title}" />
                        </div>
                        <div class="item-details">
                            <h4>${item.title}</h4>
                            <p class="price">$${(item.price * item.quantity).toFixed(2)}</p>
                            <div class="quantity-controls">
                                <button class="btn btn-icon" onclick="CartManager.instance.updateQuantity('${item.id}', ${item.quantity - 1})" aria-label="Decrease quantity">-</button>
                                <span class="quantity">${item.quantity}</span>
                                <button class="btn btn-icon" onclick="CartManager.instance.updateQuantity('${item.id}', ${item.quantity + 1})" aria-label="Increase quantity">+</button>
                            </div>
                        </div>
                        <button class="btn btn-icon" onclick="CartManager.instance.removeItem('${item.id}')" aria-label="Remove item">×</button>
                    </div>
                `).join('')}
            </div>
            <div class="cart-summary">
                <div class="cart-total">
                    <span>Total:</span>
                    <span>$${this.getTotal().toFixed(2)}</span>
                </div>
            </div>
        ` : `
            <div class="empty-cart">
                <h4>Your Cart is Empty</h4>
                <p>Start adding some amazing books to your cart!</p>
            </div>
        `;

        BookHaven.showModal({
            title: 'Shopping Cart',
            content,
            footer: `
                ${this.cart.length ? `
                    <button class="btn btn-outline" onclick="CartManager.instance.clear()">Clear Cart</button>
                    <button class="btn" onclick="CartManager.instance.processOrder()">Checkout</button>
                ` : `
                    <button class="btn" onclick="BookHaven.closeModal(this)">Continue Shopping</button>
                `}
            `
        });
    }

    async processOrder() {
        if (this.cart.length === 0) {
            this.showError('Cannot process an empty cart');
            return;
        }

        if (this.isProcessing) {
            this.showInfo('Your order is already being processed...');
            return;
        }

        this.isProcessing = true;

        BookHaven.showModal({
            title: 'Processing Order',
            content: `
                <div class="processing-message">
                    <div class="spinner"></div>
                    <h4>Processing Your Order</h4>
                    <p>Please wait while we process your order...</p>
                </div>
            `
        });

        try {
            await new Promise(resolve => setTimeout(resolve, 2000));

            const orderDetails = {
                orderId: 'ORD-' + Date.now(),
                items: [...this.cart],
                total: this.getTotal(),
                date: new Date().toISOString()
            };

            sessionStorage.setItem('lastOrder', JSON.stringify(orderDetails));
            
            this.cart = [];
            this.saveToStorage();
            this.updateUI();

            this.showSuccess(`Order #${orderDetails.orderId} processed successfully!`);
        } catch (error) {
            this.showError('There was an error processing your order. Please try again.');
        } finally {
            this.isProcessing = false;
        }
    }

    loadFromStorage() {
        return JSON.parse(sessionStorage.getItem('cart')) || [];
    }

    saveToStorage() {
        sessionStorage.setItem('cart', JSON.stringify(this.cart));
        // Dispatch storage event for cross-tab sync
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'cart',
            newValue: JSON.stringify(this.cart)
        }));
    }

    getTotal() {
        return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    updateUI() {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems || '';
            cartCount.hidden = totalItems === 0;
        }
    }

    closeCart() {
        const modal = document.querySelector('.modal');
        if (modal) {
            BookHaven.closeModal(modal);
        }
    }
};

// Initialize cart manager on page load
document.addEventListener('DOMContentLoaded', () => CartManager.init());

// Make CartManager available globally
window.CartManager = CartManager;
