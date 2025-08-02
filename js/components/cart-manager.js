class CartManager {
    constructor() {
        this.cart = JSON.parse(sessionStorage.getItem('bookCart')) || [];
        this.initialize();
    }

    initialize() {
        this.updateCartDisplay();
        this.updateCartCount();
        this.setupEventListeners();
    }

    setupEventListeners() {
        const cartBtn = document.getElementById('view-cart');
        const cartClose = document.querySelector('.cart-close');
        const cartContainer = document.getElementById('cart-container');

        cartBtn?.addEventListener('click', () => {
            cartContainer.classList.add('active');
        });

        cartClose?.addEventListener('click', () => {
            cartContainer.classList.remove('active');
        });

        // Close cart when Escape key is pressed
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && cartContainer?.classList.contains('active')) {
                cartContainer.classList.remove('active');
            }
        });
    }

    addItem(book) {
        const existingItem = this.cart.find(item => item.id === book.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                ...item,
                quantity: 1
            });
        }

        sessionStorage.setItem('cart', JSON.stringify(cart));
        this.updateUI();

        // Show success feedback
        BookHaven.showModal({
            title: 'Added to Cart',
            content: `
                <div class="success-message">
                    <h4>${item.title}</h4>
                    <p>Has been added to your cart</p>
                    <div class="item-preview">
                        <img src="${item.image}" alt="${item.title}" />
                        <div class="item-details">
                            <p class="price">$${item.price.toFixed(2)}</p>
                            <p class="quantity">Quantity: ${existingItem ? existingItem.quantity : 1}</p>
                        </div>
                    </div>
                </div>
            `,
            footer: `
                <button class="btn btn-outline" onclick="BookHaven.closeModal(this)">Continue Shopping</button>
                <button class="btn" onclick="CartManager.showCart()">View Cart</button>
            `
        });

    },

    async removeItem(itemId) {
        const cart = JSON.parse(sessionStorage.getItem('cart')) || [];
        const updatedCart = cart.filter(item => item.id !== itemId);
        sessionStorage.setItem('cart', JSON.stringify(updatedCart));
        this.updateUI();
        this.showCart(); // Refresh cart display
    },

    async updateQuantity(itemId, quantity) {
        const cart = JSON.parse(sessionStorage.getItem('cart')) || [];
        const item = cart.find(i => i.id === itemId);
        
        if (item) {
            item.quantity = Math.max(0, quantity);
            if (item.quantity === 0) {
                await this.removeItem(itemId);
            } else {
                sessionStorage.setItem('cart', JSON.stringify(cart));
                this.updateUI();
            }
        }
    },

    async clear() {
        sessionStorage.removeItem('cart');
        this.updateUI();
        BookHaven.showModal({
            title: 'Cart Cleared',
            content: '<p>Your shopping cart has been cleared.</p>',
            footer: '<button class="btn" onclick="BookHaven.closeModal(this)">Close</button>'
        });
    },

    showCart() {
        const content = BookHavenState.cart.items.length ? `
            <div class="cart-items" role="list">
                ${BookHavenState.cart.items.map((item, index) => `
                    <div class="cart-item" role="listitem" tabindex="0">
                        <div class="item-image">
                            <img src="${item.image}" alt="${item.title}" />
                        </div>
                        <div class="item-details">
                            <h4>${item.title}</h4>
                            <p class="price">$${(item.price * item.quantity).toFixed(2)}</p>
                            <div class="quantity-controls">
                                <button class="btn btn-icon" onclick="CartManager.updateQuantity('${item.id}', ${item.quantity - 1})" aria-label="Decrease quantity">-</button>
                                <span class="quantity">${item.quantity}</span>
                                <button class="btn btn-icon" onclick="CartManager.updateQuantity('${item.id}', ${item.quantity + 1})" aria-label="Increase quantity">+</button>
                            </div>
                        </div>
                        <button class="btn btn-icon" onclick="CartManager.removeItem('${item.id}')" aria-label="Remove item">×</button>
                    </div>
                `).join('')}
            </div>
            <div class="cart-summary">
                <div class="cart-total">
                    <span>Total:</span>
                    <span>$${BookHavenState.cart.total.toFixed(2)}</span>
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
                ${BookHavenState.cart.items.length ? `
                    <button class="btn btn-outline" onclick="CartManager.clear()">Clear Cart</button>
                    <button class="btn" onclick="CartManager.checkout()">Checkout</button>
                ` : `
                    <button class="btn" onclick="BookHaven.closeModal(this)">Continue Shopping</button>
                `}
            `
        });
    },

    async processOrder() {
        const cart = JSON.parse(sessionStorage.getItem('cart')) || [];
        if (cart.length === 0) {
            BookHaven.showModal({
                title: 'Error',
                content: '<p>Cannot process an empty cart</p>',
                footer: '<button class="btn" onclick="BookHaven.closeModal(this)">Close</button>'
            });
            return;
        }

        // Show processing state
        BookHaven.showModal({
            title: 'Processing Order',
            content: `
                <div class="processing-message">
                    <h4>Processing Your Order</h4>
                    <p>Please wait while we process your order...</p>
                    <div class="spinner"></div>
                </div>
            `
        });

        // Simulate order processing
        setTimeout(async () => {
            await this.clear();
            BookHaven.showModal({
                title: 'Order Confirmed',
                content: `
                    <div class="success-message">
                        <h4>Thank You for Your Order!</h4>
                        <p>Your order has been processed successfully!</p>
                        <p>We'll send you an email confirmation shortly.</p>
                    </div>
                `,
                footer: '<button class="btn" onclick="BookHaven.closeModal(this)">Continue Shopping</button>'
            });
        }, 2000);
    },

    loadFromStorage() {
        const cart = sessionStorage.getItem('cart');
        return cart ? JSON.parse(cart) : [];
    },

    getTotal() {
        const cart = this.loadFromStorage();
        return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },

    updateUI() {
        // Update cart count badge
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            const cart = this.loadFromStorage();
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
            cartCount.hidden = totalItems === 0;
        }
    },

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
