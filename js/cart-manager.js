class CartManager {
    constructor() {
        this.cart = JSON.parse(sessionStorage.getItem('bookCart')) || [];
        this.listeners = new Set();
        this.lastOrder = JSON.parse(sessionStorage.getItem('lastOrder') || 'null');
        this.isProcessing = false;
        this.updateCartDisplay();
        
        // Listen for storage events to sync cart across tabs
        window.addEventListener('storage', (e) => {
            if (e.key === 'bookCart') {
                this.cart = JSON.parse(e.newValue || '[]');
                this.notifyListeners();
                this.updateCartDisplay();
            }
            if (e.key === 'lastOrder') {
                this.lastOrder = JSON.parse(e.newValue || 'null');
            }
        });
    }

    // Add listener for cart updates
    addListener(callback) {
        this.listeners.add(callback);
    }

    // Remove listener
    removeListener(callback) {
        this.listeners.delete(callback);
    }

    // Notify all listeners of cart changes
    notifyListeners() {
        this.listeners.forEach(callback => callback(this.cart));
    }

    addItem(book) {
        if (!book || !book.id) {
            this.showAlert('Invalid book data', 'error');
            return;
        }

        const existingItem = this.cart.find(item => item.id === book.id);
        if (existingItem) {
            existingItem.quantity += 1;
            this.showAlert(`Increased quantity of "${book.title}" (${existingItem.quantity} in cart)`, 'success');
        } else {
            this.cart.push({
                id: book.id,
                title: book.title,
                price: book.price,
                image: book.image,
                quantity: 1
            });
            this.showAlert(`"${book.title}" added to cart!`, 'success');
        }
        this.saveCart();
        this.notifyListeners();
    }

    removeItem(bookId) {
        this.cart = this.cart.filter(item => item.id !== bookId);
        this.saveCart();
        this.updateCartDisplay();
    }

    updateQuantity(bookId, newQuantity) {
        const item = this.cart.find(item => item.id === bookId);
        if (item) {
            item.quantity = Math.max(1, parseInt(newQuantity) || 1);
            this.saveCart();
            this.updateCartDisplay();
        }
    }

    clearCart() {
        if (this.cart.length === 0) {
            this.showAlert('Cart is already empty', 'info');
            return;
        }
        const itemCount = this.cart.reduce((total, item) => total + item.quantity, 0);
        this.cart = [];
        this.saveCart();
        this.showAlert(`Cart cleared - ${itemCount} item${itemCount !== 1 ? 's' : ''} removed`, 'info');
        this.updateCartDisplay();
    }

    getTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
    }

    async processOrder() {
        if (this.isProcessing) {
            this.showAlert('Order is already being processed...', 'info');
            return;
        }

        if (this.cart.length === 0) {
            this.showAlert('Your cart is empty!', 'error');
            return;
        }

        const orderDetails = {
            items: this.cart,
            total: this.getTotal(),
            orderDate: new Date().toISOString()
        };

        try {
            this.isProcessing = true;
            this.showAlert('Processing your order...', 'info');
            
            // In a real app, this would make an API call to process the order
            await this.simulateOrderProcessing();
            
            // Store order details in session storage
            this.lastOrder = {
                ...orderDetails,
                orderId: 'ORD-' + Date.now(),
                status: 'completed'
            };
            sessionStorage.setItem('lastOrder', JSON.stringify(this.lastOrder));
            
            // Clear the cart
            this.cart = [];
            this.saveCart();
            
            this.showAlert(`Order #${this.lastOrder.orderId} processed successfully! Total: $${this.lastOrder.total}`, 'success');
        } catch (error) {
            this.showAlert('Error processing order. Please try again.', 'error');
        } finally {
            this.isProcessing = false;
        }
    }

    simulateOrderProcessing() {
        return new Promise(resolve => setTimeout(resolve, 1500));
    }

    saveCart() {
        const cartData = JSON.stringify(this.cart);
        sessionStorage.setItem('bookCart', cartData);
        this.updateCartCount();
        // Dispatch storage event for cross-tab sync
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'bookCart',
            newValue: cartData,
            url: window.location.href
        }));
    }

    updateCartCount() {
        requestAnimationFrame(() => {
            const count = this.cart.reduce((total, item) => total + item.quantity, 0);
            document.querySelectorAll('.cart-count').forEach(el => {
                el.textContent = count;
            });
        });
    }

    showAlert(message, type = 'info') {
        const alertEl = document.createElement('div');
        alertEl.className = `alert alert-${type}`;
        alertEl.textContent = message;
        
        // Remove any existing alerts
        document.querySelectorAll('.alert').forEach(el => el.remove());
        
        // Add new alert
        document.body.appendChild(alertEl);
        
        // Animate
        setTimeout(() => alertEl.classList.add('show'), 10);
        
        // Remove after delay
        setTimeout(() => {
            alertEl.classList.remove('show');
            setTimeout(() => alertEl.remove(), 300);
        }, 3000);
    }

    updateCartDisplay() {
        const cartContainer = document.getElementById('cart-items');
        const cartSidebar = document.getElementById('cart-sidebar');
        if (!cartContainer) return;

        // Update cart visibility
        if (cartSidebar) {
            cartSidebar.classList.toggle('empty', this.cart.length === 0);
        }

        // Show empty cart message
        if (this.cart.length === 0) {
            cartContainer.innerHTML = `
                <div class="empty-cart">
                    <p class="empty-cart-message">Your cart is empty</p>
                    <p class="empty-cart-sub">Add some books to get started!</p>
                </div>`;
            document.getElementById('cart-total').textContent = '0.00';
            return;
        }

        // Show cart items
        cartContainer.innerHTML = this.cart.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <div class="item-details">
                    <h3>${item.title}</h3>
                    <div class="item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                </div>
                <div class="item-controls">
                    <input type="number" value="${item.quantity}" min="1" 
                           onchange="cartManager.updateQuantity('${item.id}', this.value)">
                    <button onclick="cartManager.removeItem('${item.id}')" class="btn-remove">
                        Remove
                    </button>
                </div>
            </div>
        `).join('');

        document.getElementById('cart-total').textContent = this.getTotal();
    }

    showAlert(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.textContent = message;

        const container = document.querySelector('.container');
        container.insertBefore(alertDiv, container.firstChild);

        setTimeout(() => {
            alertDiv.remove();
        }, 3000);
    }
}

// Initialize cart manager
const cartManager = new CartManager();
