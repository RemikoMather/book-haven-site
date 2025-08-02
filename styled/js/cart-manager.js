class CartManager {
    constructor() {
        // Initialize cart state
        this.cart = JSON.parse(sessionStorage.getItem('bookCart')) || [];
        this.lastOrder = JSON.parse(sessionStorage.getItem('lastOrder') || 'null');
        this.isProcessing = false;
        this.isOpen = false;
        this.listeners = new Set();

        // Initialize UI
        this.updateCartDisplay();
        this.setupEventListeners();
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

        try {
            this.isProcessing = true;
            this.showAlert('Processing your order...', 'info');
            
            // In a real app, this would make an API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const orderDetails = {
                orderId: 'ORD-' + Date.now(),
                items: [...this.cart],
                total: this.getTotal(),
                date: new Date().toISOString()
            };
            
            sessionStorage.setItem('lastOrder', JSON.stringify(orderDetails));
            this.lastOrder = orderDetails;
            
            this.cart = [];
            this.saveCart();
            
            this.showAlert(`Order #${orderDetails.orderId} processed successfully! Total: $${orderDetails.total}`, 'success');
        } catch (error) {
            this.showAlert('Error processing order. Please try again.', 'error');
        } finally {
            this.isProcessing = false;
        }
    }

    saveCart() {
        sessionStorage.setItem('bookCart', JSON.stringify(this.cart));
        this.updateCartDisplay();
        this.updateCartCount();
    }

    updateCartCount() {
        const count = this.cart.reduce((total, item) => total + item.quantity, 0);
        document.querySelectorAll('.cart-count').forEach(el => {
            el.textContent = count || '';
            el.hidden = !count;
        });
    }

    updateCartDisplay() {
        const cartContainer = document.getElementById('cart-items');
        const cartSidebar = document.getElementById('cart-sidebar');
        const totalElement = document.getElementById('cart-total');
        
        if (!cartContainer) return;

        if (cartSidebar) {
            cartSidebar.classList.toggle('empty', this.cart.length === 0);
        }

        if (this.cart.length === 0) {
            cartContainer.innerHTML = `
                <div class="empty-cart">
                    <div class="empty-cart-icon">🛒</div>
                    <p class="empty-cart-message">Your cart is empty</p>
                    <p class="empty-cart-sub">Browse our collection and add some books!</p>
                </div>`;
            if (totalElement) totalElement.textContent = '0.00';
            return;
        }

        cartContainer.innerHTML = this.cart.map((item, index) => `
            <div class="cart-item" data-id="${item.id}">
                <div class="item-details">
                    <h3>${item.title}</h3>
                    <div class="item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                </div>
                <div class="item-controls">
                    <input type="number" value="${item.quantity}" min="1" 
                           data-book-id="${item.id}" class="quantity-input">
                    <button data-book-id="${item.id}" class="btn-remove">
                        Remove
                    </button>
                </div>
            </div>
        `).join('');

        if (totalElement) {
            totalElement.textContent = this.getTotal();
        }

        // Add event listeners
        cartContainer.querySelectorAll('.quantity-input').forEach(input => {
            input.addEventListener('change', (e) => {
                this.updateQuantity(e.target.dataset.bookId, e.target.value);
            });
        });

        cartContainer.querySelectorAll('.btn-remove').forEach(button => {
            button.addEventListener('click', (e) => {
                this.removeItem(e.target.dataset.bookId);
            });
        });
    }

    toggleCart() {
        const cartSidebar = document.getElementById('cart-sidebar');
        if (!cartSidebar) return;

        this.isOpen = !this.isOpen;
        cartSidebar.classList.toggle('open', this.isOpen);
        
        if (this.isOpen) {
            this.updateCartDisplay();
        }
    }

    showAlert(message, type = 'info') {
        const alertEl = document.createElement('div');
        alertEl.className = `alert alert-${type}`;
        alertEl.textContent = message;
        
        document.querySelectorAll('.alert').forEach(el => el.remove());
        
        const container = document.querySelector('.container') || document.body;
        container.insertBefore(alertEl, container.firstChild);
        
        setTimeout(() => alertEl.classList.add('show'), 10);
        setTimeout(() => {
            alertEl.classList.remove('show');
            setTimeout(() => alertEl.remove(), 300);
        }, 3000);
    }
}
