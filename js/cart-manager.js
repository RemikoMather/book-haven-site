import { StorageManager } from './storage-manager.js';

// Cart Manager for handling shopping cart operations
export class CartManager {
    constructor() {
        this.cartStorage = new StorageManager('session');
        this.CART_KEY = 'book_haven_cart';
        this.cart = this.cartStorage.get(this.CART_KEY) || [];
    }

    // Add item to cart
    addItem(item) {
        const existingItem = this.cart.find(cartItem => cartItem.id === item.id);
        if (existingItem) {
            existingItem.quantity += item.quantity || 1;
        } else {
            this.cart.push({
                ...item,
                quantity: item.quantity || 1
            });
        }
        this._saveCart();
        this._updateCartUI();
    }

    // Remove item from cart
    removeItem(itemId) {
        this.cart = this.cart.filter(item => item.id !== itemId);
        this._saveCart();
        this._updateCartUI();
    }

    // Update item quantity
    updateQuantity(itemId, quantity) {
        const item = this.cart.find(item => item.id === itemId);
        if (item) {
            item.quantity = quantity;
            if (quantity <= 0) {
                this.removeItem(itemId);
            } else {
                this._saveCart();
                this._updateCartUI();
            }
        }
    }

    // Clear the entire cart
    clearCart() {
        this.cart = [];
        this._saveCart();
        this._updateCartUI();
    }

    // Get cart contents
    getCart() {
        return this.cart;
    }

    // Get cart total
    getTotal() {
        return this.cart.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }

    // Get total number of items
    getItemCount() {
        return this.cart.reduce((count, item) => count + item.quantity, 0);
    }

    // Private method to save cart to storage
    _saveCart() {
        this.cartStorage.set(this.CART_KEY, this.cart);
    }

    // Private method to update cart UI
    _updateCartUI() {
        const cartCountElement = document.getElementById('cart-count');
        const cartTotalElement = document.getElementById('cart-total');
        const cartItemsContainer = document.getElementById('cart-items');

        if (cartCountElement) {
            cartCountElement.textContent = this.getItemCount();
        }

        if (cartTotalElement) {
            cartTotalElement.textContent = `$${this.getTotal().toFixed(2)}`;
        }

        if (cartItemsContainer) {
            cartItemsContainer.innerHTML = '';
            this.cart.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'cart-item';
                itemElement.innerHTML = `
                    <span>${item.title}</span>
                    <span>Qty: ${item.quantity}</span>
                    <span>$${(item.price * item.quantity).toFixed(2)}</span>
                    <button onclick="cartManager.removeItem('${item.id}')">Remove</button>
                `;
                cartItemsContainer.appendChild(itemElement);
            });
        }
    }
}

// Initialize cart manager
const cartManager = new CartManager();
