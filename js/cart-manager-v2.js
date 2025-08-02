class CartManager {
    constructor() {
        this.items = JSON.parse(sessionStorage.getItem('cart') || '[]');
        this.updateUI();
        this.setupListeners();
    }

    addItem(item) {
        const existingItem = this.items.find(i => i.id === item.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({ ...item, quantity: 1 });
        }
        this.saveToStorage();
        this.updateUI();
        this.showNotification(`Added "${item.name}" to cart`);
    }

    removeItem(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.saveToStorage();
        this.updateUI();
    }

    updateQuantity(id, quantity) {
        const item = this.items.find(i => i.id === id);
        if (item) {
            item.quantity = Math.max(0, quantity);
            if (item.quantity === 0) {
                this.removeItem(id);
            } else {
                this.saveToStorage();
                this.updateUI();
            }
        }
    }

    clearCart() {
        this.items = [];
        this.saveToStorage();
        this.updateUI();
        this.showNotification('Cart cleared');
    }

    saveToStorage() {
        sessionStorage.setItem('cart', JSON.stringify(this.items));
    }

    updateUI() {
        const count = document.querySelector('.cart-count');
        if (count) {
            const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
            count.textContent = totalItems;
        }
    }

    getTotal() {
        return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
    }

    showCart() {
        const modal = document.createElement('div');
        modal.className = 'modal fade-in';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Shopping Cart</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    ${this.items.length ? this.getCartContent() : this.getEmptyCartContent()}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.querySelector('.modal-close').onclick = () => modal.remove();
    }

    getCartContent() {
        return `
            <div class="cart-items">
                ${this.items.map(item => `
                    <div class="cart-item fade-in">
                        <div class="item-info">
                            <h3>${item.name}</h3>
                            <p>$${item.price} × ${item.quantity}</p>
                        </div>
                        <div class="item-controls">
                            <button class="btn btn-small" onclick="window.cart.updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                            <span>${item.quantity}</span>
                            <button class="btn btn-small" onclick="window.cart.updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                            <button class="btn btn-secondary" onclick="window.cart.removeItem(${item.id})">Remove</button>
                        </div>
                    </div>
                `).join('')}
                <div class="cart-total">
                    <h3>Total: $${this.getTotal()}</h3>
                </div>
                <div class="cart-actions">
                    <button class="btn" onclick="window.cart.processOrder()">Checkout</button>
                    <button class="btn btn-secondary" onclick="window.cart.clearCart()">Clear Cart</button>
                </div>
            </div>
        `;
    }

    getEmptyCartContent() {
        return `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart fa-3x"></i>
                <p>Your cart is empty</p>
                <button class="btn" onclick="document.querySelector('.modal').remove()">Continue Shopping</button>
            </div>
        `;
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification slide-up';
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    processOrder() {
        if (this.items.length === 0) return;
        
        const modal = document.createElement('div');
        modal.className = 'modal fade-in';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Order Confirmation</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Thank you for your order!</p>
                    <p>Total Items: ${this.items.reduce((sum, item) => sum + item.quantity, 0)}</p>
                    <p>Total Amount: $${this.getTotal()}</p>
                    <button class="btn" onclick="window.cart.completeOrder()">Complete Order</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.querySelector('.modal-close').onclick = () => modal.remove();
    }

    completeOrder() {
        this.clearCart();
        document.querySelector('.modal').remove();
        this.showNotification('Order completed successfully!');
    }

    setupListeners() {
        document.getElementById('viewCart')?.addEventListener('click', () => this.showCart());
    }
}

// Initialize cart and make it globally available
window.cart = new CartManager();
