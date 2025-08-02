// Enhanced Cart with sessionStorage persistence
const Cart = {
    init() {
        this.loadFromStorage();
        this.updateUI();
    },

    items: [],

    loadFromStorage() {
        const stored = sessionStorage.getItem('cart');
        if (stored) {
            this.items = JSON.parse(stored);
        }
    },

    saveToStorage() {
        sessionStorage.setItem('cart', JSON.stringify(this.items));
    },

    add(item) {
        this.items.push(item);
        this.saveToStorage();
        this.updateUI();
        this.showAddedFeedback(item);
    },

    remove(index) {
        this.items.splice(index, 1);
        this.saveToStorage();
        this.updateUI();
        this.showCart(); // Refresh cart modal
    },

    clear() {
        this.items = [];
        sessionStorage.removeItem('cart');
        this.updateUI();
        Modal.create({
            title: 'CART CLEARED',
            content: '<p>Your shopping cart has been cleared.</p>'
        });
    },

    showCart() {
        const content = this.items.length ? `
            <div class="cart-items">
                ${this.items.map((item, index) => `
                    <div class="cart-item wireframe-box">
                        <div class="wireframe-label">ITEM ${index + 1}</div>
                        <div class="cart-item-details">
                            <span>${item.title}</span>
                            <span>${item.price}</span>
                        </div>
                        <button class="btn" onclick="Cart.remove(${index})">Remove</button>
                    </div>
                `).join('')}
            </div>
            <div class="cart-total">
                Total: $${this.getTotal().toFixed(2)}
            </div>
        ` : '<div class="wireframe-box"><div class="wireframe-label">EMPTY CART</div><p>Your cart is empty</p></div>';

        Modal.create({
            title: 'SHOPPING CART',
            content,
            footer: `
                <button class="btn" onclick="Cart.clear()">Clear Cart</button>
                ${this.items.length ? '<button class="btn" onclick="Cart.processOrder()">Process Order</button>' : ''}
                <button class="btn" onclick="Modal.close(this)">Close</button>
            `
        });
    },

    processOrder() {
        if (this.items.length === 0) return;

        Modal.create({
            title: 'ORDER PROCESSING',
            content: `
                <div class="wireframe-box">
                    <div class="wireframe-label">ORDER SUMMARY</div>
                    <p>Items: ${this.items.length}</p>
                    <p>Total: $${this.getTotal().toFixed(2)}</p>
                </div>
                <div class="wireframe-box">
                    <div class="wireframe-label">PROCESSING</div>
                    <div class="processing-indicator"></div>
                </div>
            `
        });

        // Clear cart after successful order
        setTimeout(() => {
            this.clear();
            Modal.create({
                title: 'ORDER CONFIRMED',
                content: '<div class="wireframe-box"><div class="wireframe-label">SUCCESS</div><p>Your order has been processed successfully!</p></div>'
            });
        }, 2000);
    },

    getTotal() {
        return this.items.reduce((sum, item) => sum + parseFloat(item.price.replace('$', '')), 0);
    },

    updateUI() {
        const count = document.querySelector('.cart-count');
        if (count) count.textContent = this.items.length;
    },

    showAddedFeedback(item) {
        Modal.create({
            title: 'ITEM ADDED',
            content: `
                <div class="wireframe-box">
                    <div class="wireframe-label">ADDED TO CART</div>
                    <p>${item.title} has been added to your cart</p>
                </div>
            `
        });
    }
};

// Initialize cart when script loads
document.addEventListener('DOMContentLoaded', () => Cart.init());

// Make Cart available globally
window.Cart = Cart;
