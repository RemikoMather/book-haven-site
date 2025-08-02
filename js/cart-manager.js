class CartManager {
    constructor() {
        this.cart = JSON.parse(sessionStorage.getItem('bookCart')) || [];
        this.updateCartDisplay();
    }

    addItem(book) {
        const existingItem = this.cart.find(item => item.id === book.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                id: book.id,
                title: book.title,
                price: book.price,
                quantity: 1
            });
        }
        this.saveCart();
        this.showAlert('Item added to cart!', 'success');
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
        this.cart = [];
        this.saveCart();
        this.showAlert('Cart has been cleared', 'info');
        this.updateCartDisplay();
    }

    getTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
    }

    async processOrder() {
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
            // In a real app, this would make an API call to process the order
            await this.simulateOrderProcessing();
            sessionStorage.setItem('lastOrder', JSON.stringify(orderDetails));
            this.clearCart();
            this.showAlert('Order processed successfully!', 'success');
        } catch (error) {
            this.showAlert('Error processing order. Please try again.', 'error');
        }
    }

    simulateOrderProcessing() {
        return new Promise(resolve => setTimeout(resolve, 1500));
    }

    saveCart() {
        sessionStorage.setItem('bookCart', JSON.stringify(this.cart));
        this.updateCartCount();
    }

    updateCartCount() {
        const count = this.cart.reduce((total, item) => total + item.quantity, 0);
        document.querySelectorAll('.cart-count').forEach(el => {
            el.textContent = count;
        });
    }

    updateCartDisplay() {
        const cartContainer = document.getElementById('cart-items');
        if (!cartContainer) return;

        if (this.cart.length === 0) {
            cartContainer.innerHTML = '<p class="empty-cart-message">Your cart is empty</p>';
            document.getElementById('cart-total').textContent = '0.00';
            return;
        }

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
