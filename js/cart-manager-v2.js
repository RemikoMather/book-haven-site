class CartManager {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart') || '[]');
        this.maxItems = 99;
        this.updateUI();
        this.setupListeners();
    }

    addItem(item) {
        const existingItem = this.items.find(i => i.id === item.id);
        const totalItems = this.items.reduce((sum, i) => sum + i.quantity, 0);
        
        if (totalItems >= this.maxItems) {
            this.showNotification('Cart is full (maximum 99 items)', 'error');
            return false;
        }

        if (existingItem) {
            if (existingItem.quantity >= 99) {
                this.showNotification('Maximum quantity reached for this item', 'error');
                return false;
            }
            existingItem.quantity += 1;
        } else {
            this.items.push({ 
                ...item, 
                quantity: 1,
                price: Number(item.price).toFixed(2),
                addedAt: new Date().toISOString()
            });
        }
        this.saveToStorage();
        this.updateUI();
        this.showNotification(`Added "${item.name}" to cart`, 'success');
        return true;
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
        localStorage.setItem('cart', JSON.stringify(this.items));
        // Backup to sessionStorage for redundancy
        sessionStorage.setItem('cart_backup', JSON.stringify(this.items));
    }

    updateUI() {
        const count = document.querySelector('.cart-count');
        if (count) {
            const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
            count.textContent = totalItems;
            // Add visual indication if cart is nearly full
            count.classList.toggle('cart-count--near-full', totalItems >= this.maxItems * 0.8);
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification--${type} fade-in`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
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
