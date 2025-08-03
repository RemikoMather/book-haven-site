import { StorageManager } from './storage-manager.js';
import { config } from './config.js';

// Cart Manager for handling shopping cart operations
export class CartManager {
    constructor() {
        this.cartStorage = new StorageManager('local'); // Change                                     onerror="this.onerror=null; this.src=BookHaven.getAssetUrl('/images/placeholder-book.jpg');"; to local for persistence
        this.CART_KEY = 'book_haven_cart';
        this.cart = this.loadCart();
        
        // Initialize cart UI when DOM is loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this._updateCartUI());
        } else {
            this._updateCartUI();
        }
        
        // Listen for storage events to sync cart across tabs
        window.addEventListener('storage', (e) => {
            if (e.key === this.CART_KEY) {
                this.cart = JSON.parse(e.newValue || '[]');
                this._updateCartUI();
            }
        });
    }

    // Load cart from storage with validation
    loadCart() {
        try {
            const savedCart = this.cartStorage.get(this.CART_KEY) || [];
            
            // Validate cart data
            if (!Array.isArray(savedCart)) return [];
            
            return savedCart.filter(item => (
                item && 
                typeof item === 'object' &&
                typeof item.id === 'number' &&
                typeof item.name === 'string' &&
                typeof item.price === 'number' &&
                typeof item.quantity === 'number' &&
                item.quantity > 0
            ));
        } catch (error) {
            console.error('Error loading cart:', error);
            return [];
        }
    }

    // Add item to cart with enhanced validation and quantity limits
    addItem(item) {
        if (!this._validateItem(item)) {
            console.error('Invalid item:', item);
            return { success: false, error: 'Invalid item data' };
        }

        try {
            const existingItem = this.cart.find(cartItem => cartItem.id === item.id);
            const newQuantity = (existingItem?.quantity || 0) + (item.quantity || 1);
            
            // Check quantity limits
            if (newQuantity > 10) {
                return { 
                    success: false, 
                    error: 'Maximum quantity limit reached (10 items)' 
                };
            }

            if (existingItem) {
                existingItem.quantity = newQuantity;
            } else {
                const sanitizedItem = {
                    id: Number(item.id),
                    name: String(item.name).trim(),
                    price: Number(parseFloat(item.price).toFixed(2)),
                    image: String(item.image),
                    quantity: Math.max(1, Math.min(10, Number(item.quantity || 1))),
                    added_at: new Date().toISOString()
                };

                if (this._calculateCartTotal() + sanitizedItem.price > 10000) {
                    return { 
                        success: false, 
                        error: 'Cart total exceeds maximum limit ($10,000)' 
                    };
                }

                this.cart.push(sanitizedItem);
            }

            this._saveCart();
            this._updateCartUI();
            return { success: true, cart: this.getCartSummary() };
        } catch (error) {
            console.error('Error adding item to cart:', error);
            return { success: false, error: 'Failed to add item to cart' };
        }
    }

    // Validate item data
    _validateItem(item) {
        if (!item || typeof item !== 'object') return false;
        
        const requiredFields = {
            id: 'number',
            name: 'string',
            price: 'number',
            image: 'string'
        };

        for (const [field, type] of Object.entries(requiredFields)) {
            if (!item[field] || typeof item[field] !== type) {
                return false;
            }
        }

        if (item.price <= 0 || !isFinite(item.price)) {
            return false;
        }

        return true;
    }

    // Calculate cart total
    _calculateCartTotal() {
        return this.cart.reduce((total, item) => 
            total + (item.price * item.quantity), 0
        );
    }

    // Get cart summary
    getCartSummary() {
        const total = this._calculateCartTotal();
        const itemCount = this.cart.reduce((count, item) => 
            count + item.quantity, 0
        );

        return {
            items: this.cart,
            itemCount,
            total: parseFloat(total.toFixed(2)),
            lastUpdated: new Date().toISOString()
        };
    }

    // Remove item from cart with validation
    removeItem(itemId) {
        if (!itemId || !this.cart.some(item => item.id === itemId)) {
            return { success: false, error: 'Item not found in cart' };
        }

        try {
            this.cart = this.cart.filter(item => item.id !== itemId);
            this._saveCart();
            this._updateCartUI();
            return { success: true, cart: this.getCartSummary() };
        } catch (error) {
            console.error('Error removing item from cart:', error);
            return { success: false, error: 'Failed to remove item from cart' };
        }
    }

    // Update item quantity with validation
    updateQuantity(itemId, quantity) {
        if (!itemId || typeof quantity !== 'number' || quantity < 0 || quantity > 10) {
            return { 
                success: false, 
                error: 'Invalid quantity. Must be between 0 and 10.' 
            };
        }

        try {
            const item = this.cart.find(item => item.id === itemId);
            if (!item) {
                return { success: false, error: 'Item not found in cart' };
            }

            if (quantity === 0) {
                return this.removeItem(itemId);
            }

            // Calculate new cart total with updated quantity
            const currentTotal = this._calculateCartTotal();
            const newTotal = currentTotal - (item.price * item.quantity) + (item.price * quantity);

            if (newTotal > 10000) {
                return { 
                    success: false, 
                    error: 'Cart total would exceed maximum limit ($10,000)' 
                };
            }

            item.quantity = quantity;
            item.updated_at = new Date().toISOString();

            this._saveCart();
            this._updateCartUI();
            
            return { success: true, cart: this.getCartSummary() };
        } catch (error) {
            console.error('Error updating quantity:', error);
            return { success: false, error: 'Failed to update quantity' };
        }
    }

    // Clear the entire cart with confirmation
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
        try {
            // Update cart count
            const cartCountElements = document.querySelectorAll('[data-cart-count]');
            cartCountElements.forEach(element => {
                element.textContent = this.getItemCount();
                element.hidden = this.getItemCount() === 0;
            });

            // Update cart total
            const cartTotalElements = document.querySelectorAll('[data-cart-total]');
            cartTotalElements.forEach(element => {
                element.textContent = this.getTotal().toFixed(2);
            });

            // Update cart items
            const cartItemsContainer = document.getElementById('cart-items');
            if (cartItemsContainer) {
                if (this.cart.length === 0) {
                    cartItemsContainer.innerHTML = `
                        <div class="cart-empty">
                            <i class="fas fa-shopping-cart"></i>
                            <p>Your cart is empty</p>
                        </div>
                    `;
                } else {
                    cartItemsContainer.innerHTML = this.cart.map(item => `
                        <div class="cart-item" data-item-id="${item.id}">
                            <div class="cart-item-image">
                                <img src="${item.image}" alt="${item.name}" 
                                     loading="lazy"
                                     onerror="this.onerror=null; this.src='/book-haven-site/images/placeholder-book.jpg';">
                            </div>
                            <div class="cart-item-details">
                                <h4 class="cart-item-title">${item.name}</h4>
                                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                            </div>
                            <div class="cart-item-controls">
                                <button class="quantity-btn minus" data-action="decrease" aria-label="Decrease quantity">
                                    <i class="fas fa-minus"></i>
                                </button>
                                <span class="quantity">${item.quantity}</span>
                                <button class="quantity-btn plus" data-action="increase" aria-label="Increase quantity">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                            <div class="cart-item-subtotal">
                                $${(item.price * item.quantity).toFixed(2)}
                            </div>
                            <button class="remove-item" data-action="remove" aria-label="Remove ${item.name}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `).join('');

                    // Add event listeners for cart item controls
                    cartItemsContainer.querySelectorAll('.cart-item').forEach(cartItem => {
                        const itemId = Number(cartItem.dataset.itemId);
                        
                        cartItem.querySelector('[data-action="decrease"]')?.addEventListener('click', () => {
                            const item = this.cart.find(i => i.id === itemId);
                            if (item) this.updateQuantity(itemId, item.quantity - 1);
                        });
                        
                        cartItem.querySelector('[data-action="increase"]')?.addEventListener('click', () => {
                            const item = this.cart.find(i => i.id === itemId);
                            if (item) this.updateQuantity(itemId, item.quantity + 1);
                        });
                        
                        cartItem.querySelector('[data-action="remove"]')?.addEventListener('click', () => {
                            this.removeItem(itemId);
                        });
                    });
                }

                // Update cart dropdown visibility
                const cartDropdown = document.querySelector('.cart-dropdown');
                const emptyMessage = cartDropdown?.querySelector('.cart-empty');
                const checkoutBtn = cartDropdown?.querySelector('.checkout-btn');
                
                if (cartDropdown && checkoutBtn) {
                    checkoutBtn.disabled = this.cart.length === 0;
                    emptyMessage?.classList.toggle('hidden', this.cart.length > 0);
                }
            }
        } catch (error) {
            console.error('Error updating cart UI:', error);
        }
    }
}

// Export a singleton instance
export const cartManager = new CartManager();
