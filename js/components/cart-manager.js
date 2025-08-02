// Enhanced Cart Manager
const CartManager = {
    async init() {
        this.loadFromStorage();
        await this.syncWithServer();
        this.setupEventListeners();
        this.updateUI();
    },

    setupEventListeners() {
        // Listen for storage events for cross-tab synchronization
        window.addEventListener('storage', (e) => {
            if (e.key === 'cart') {
                this.loadFromStorage();
                this.updateUI();
            }
        });

        // Add keyboard navigation for cart items
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeCart();
            }
        });
    },

    async syncWithServer() {
        if (BookHavenState.user) {
            try {
                const serverCart = await BookHavenAPI.cart.get();
                await this.mergeWithServer(serverCart);
            } catch (error) {
                console.error('Cart sync error:', error);
            }
        }
    },

    async mergeWithServer(serverCart) {
        const localItems = new Map(BookHavenState.cart.items.map(item => [item.id, item]));
        const serverItems = new Map(serverCart.items.map(item => [item.id, item]));

        // Merge items, preferring server quantities but keeping local items
        const mergedItems = [];
        for (const [id, serverItem] of serverItems) {
            const localItem = localItems.get(id);
            if (localItem) {
                mergedItems.push({
                    ...serverItem,
                    quantity: Math.max(serverItem.quantity, localItem.quantity)
                });
                localItems.delete(id);
            } else {
                mergedItems.push(serverItem);
            }
        }

        // Add remaining local items
        mergedItems.push(...localItems.values());

        BookHavenState.cart.items = mergedItems;
        this.saveToStorage();
        this.updateUI();
    },

    async addItem(item) {
        const existingItem = BookHavenState.cart.items.find(i => i.id === item.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            BookHavenState.cart.items.push({
                ...item,
                quantity: 1
            });
        }

        BookHavenState.updateCartTotal();
        this.saveToStorage();
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

        // Sync with server if logged in
        if (BookHavenState.user) {
            try {
                await BookHavenAPI.cart.addItem(item);
            } catch (error) {
                console.error('Error syncing cart:', error);
            }
        }
    },

    async removeItem(itemId) {
        BookHavenState.cart.items = BookHavenState.cart.items.filter(item => item.id !== itemId);
        BookHavenState.updateCartTotal();
        this.saveToStorage();
        this.updateUI();

        if (BookHavenState.user) {
            try {
                await BookHavenAPI.cart.removeItem(itemId);
            } catch (error) {
                console.error('Error removing item:', error);
            }
        }
    },

    async updateQuantity(itemId, quantity) {
        const item = BookHavenState.cart.items.find(i => i.id === itemId);
        if (item) {
            item.quantity = Math.max(0, quantity);
            if (item.quantity === 0) {
                await this.removeItem(itemId);
            } else {
                BookHavenState.updateCartTotal();
                this.saveToStorage();
                this.updateUI();

                if (BookHavenState.user) {
                    try {
                        await BookHavenAPI.cart.updateItem(itemId, { quantity });
                    } catch (error) {
                        console.error('Error updating quantity:', error);
                    }
                }
            }
        }
    },

    async clear() {
        BookHavenState.cart.items = [];
        BookHavenState.updateCartTotal();
        this.saveToStorage();
        this.updateUI();

        if (BookHavenState.user) {
            try {
                await BookHavenAPI.cart.clear();
            } catch (error) {
                console.error('Error clearing cart:', error);
            }
        }
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

    async checkout() {
        if (!BookHavenState.user) {
            BookHaven.showModal({
                title: 'Sign In Required',
                content: `
                    <p>Please sign in to complete your purchase.</p>
                    <form id="login-form" onsubmit="CartManager.handleLogin(event)">
                        <div class="form-group">
                            <label for="email">Email</label>
                            <input type="email" id="email" required>
                        </div>
                        <div class="form-group">
                            <label for="password">Password</label>
                            <input type="password" id="password" required>
                        </div>
                    </form>
                `,
                footer: `
                    <button class="btn btn-outline" onclick="BookHaven.closeModal(this)">Cancel</button>
                    <button class="btn" form="login-form">Sign In & Checkout</button>
                `
            });
            return;
        }

        try {
            const order = await BookHavenAPI.orders.create({
                items: BookHavenState.cart.items,
                total: BookHavenState.cart.total
            });

            await this.clear();

            BookHaven.showModal({
                title: 'Order Confirmed',
                content: `
                    <div class="success-message">
                        <h4>Thank You for Your Order!</h4>
                        <p>Order #: ${order.id}</p>
                        <p>We'll send you an email confirmation shortly.</p>
                    </div>
                `
            });
        } catch (error) {
            BookHaven.showModal({
                title: 'Checkout Error',
                content: `
                    <div class="error-message">
                        <p>Sorry, there was an error processing your order.</p>
                        <p>${error.message}</p>
                    </div>
                `
            });
        }
    },

    loadFromStorage() {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            BookHavenState.cart = JSON.parse(savedCart);
        }
    },

    saveToStorage() {
        localStorage.setItem('cart', JSON.stringify(BookHavenState.cart));
    },

    updateUI() {
        // Update cart count badge
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            const totalItems = BookHavenState.cart.items.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
            cartCount.hidden = totalItems === 0;
        }

        // Update cart button state
        const cartButton = document.querySelector('[onclick="CartManager.showCart()"]');
        if (cartButton) {
            cartButton.disabled = BookHavenState.cart.items.length === 0;
        }
    },

    closeCart() {
        BookHaven.closeModal(document.querySelector('.modal'));
    }
};

// Initialize cart manager on page load
document.addEventListener('DOMContentLoaded', () => CartManager.init());

// Make CartManager available globally
window.CartManager = CartManager;
