class SimpleGallery {
    constructor() {
        console.log('DEBUG: SimpleGallery constructor started');
        console.log('Document ready state:', document.readyState);
        
        // Bind methods to this instance
        this.init = this.init.bind(this);
        this.showProducts = this.showProducts.bind(this);
        this.createProductElement = this.createProductElement.bind(this);
        this.renderProducts = this.renderProducts.bind(this);
        
        // Initialize products data
        this.products = [
            {
                name: "The Great Gatsby",
                author: "F. Scott Fitzgerald",
                description: "A masterpiece of American fiction that captures the essence of the Jazz Age.",
                price: 15.99,
                image: "https://cdn.pixabay.com/photo/2019/01/30/08/30/book-3964050_640.jpg"
            },
            {
                name: "To Kill a Mockingbird",
                author: "Harper Lee",
                description: "A timeless classic exploring racial injustice in a small Southern town.",
                price: 14.99,
                image: "https://cdn.pixabay.com/photo/2019/01/30/08/30/book-3964050_640.jpg"
            },
            {
                name: "1984",
                author: "George Orwell",
                description: "A dystopian social science fiction novel exploring totalitarianism.",
                price: 12.99,
                image: "https://cdn.pixabay.com/photo/2019/01/30/08/30/book-3964050_640.jpg"
            }
        ];

        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            console.log('Document still loading, adding DOMContentLoaded listener');
            document.addEventListener('DOMContentLoaded', () => {
                console.log('DOMContentLoaded fired');
                this.init();
            });
        } else {
            console.log('Document already loaded, initializing immediately');
            this.init();
        }
    }

    init() {
        console.log('DEBUG: init called');
        try {
            this.initializeElements();
            this.renderProducts();
            console.log('DEBUG: initialization complete');
        } catch (error) {
            console.error('ERROR during initialization:', error);
            this.showError();
        }
    }

    initializeElements() {
        console.log('DEBUG: initializeElements started');
        
        // Initialize container elements
        this.productsContainer = document.getElementById('productsContainer');
        console.log('DEBUG: productsContainer found:', !!this.productsContainer);
        
        this.loadingState = document.querySelector('#loadingState');
        this.errorState = document.querySelector('#errorState');
        this.emptyState = document.querySelector('#emptyState');
        
        console.log('DEBUG: State elements found:', {
            loading: !!this.loadingState,
            error: !!this.errorState,
            empty: !!this.emptyState
        });
        
        // Initialize cart elements
        this.cartCountElement = document.querySelector('[data-cart-count]');
        this.cartItemsContainer = document.getElementById('cart-items');
        this.cartTotalElement = document.querySelector('[data-cart-total]');
        this.checkoutButton = document.querySelector('.checkout-btn');
        this.cartDropdown = document.querySelector('.cart-dropdown');
        
        // Initialize cart
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.orderProcessed = false;
        
        // Add cart controls
        this.setupCartControls();
        
        // Update initial cart display
        this.updateCartDisplay();
    }

    showError() {
        console.error('ERROR: Showing error state');
        this.loadingState?.setAttribute('hidden', 'true');
        this.errorState?.removeAttribute('hidden');
        this.emptyState?.setAttribute('hidden', 'true');
        if (this.productsContainer) {
            this.productsContainer.style.display = 'none';
        }
    }

    showLoading() {
        console.log('DEBUG: Showing loading state');
        this.loadingState?.removeAttribute('hidden');
        this.errorState?.setAttribute('hidden', 'true');
        this.emptyState?.setAttribute('hidden', 'true');
        if (this.productsContainer) {
            this.productsContainer.style.display = 'none';
        }
    }

    createProductElement(product) {
        console.log('Creating element for product:', product);
        
        if (!product || !product.name || !product.author || !product.price) {
            console.error('Invalid product data:', product);
            return null;
        }

        const div = document.createElement('div');
        div.className = 'gallery-item';
        
        const template = `
            <div class="img-container">
                <img src="${product.image || 'https://via.placeholder.com/300x400'}" alt="${product.name}" loading="lazy">
            </div>
            <div class="product-details">
                <h3>${product.name}</h3>
                <p class="book-author">By ${product.author}</p>
                <p class="price">$${product.price.toFixed(2)}</p>
                <p class="book-description">${product.description || 'No description available.'}</p>
                <button class="btn btn-primary add-to-cart" data-product="${product.name}">
                    <i class="fas fa-shopping-cart"></i>
                    Add to Cart
                </button>
            </div>
        `;
        
        div.innerHTML = template;
        console.log('Created element HTML:', div.outerHTML);

        const addToCartBtn = div.querySelector('.add-to-cart');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', () => this.addToCart(product));
        } else {
            console.error('Add to cart button not found in created element');
        }
        
        return div;
    }

    renderProducts() {
        console.log('DEBUG: Starting renderProducts');
        if (!this.productsContainer) {
            console.error('DEBUG: Products container not found');
            this.showError();
            return;
        }

        try {
            this.showLoading();

            // Clear container and show loading state
            this.productsContainer.innerHTML = '';
            
            // Add each product to the container
            this.products.forEach((product, index) => {
                console.log(`Creating product element ${index}:`, product);
                const productElement = this.createProductElement(product);
                if (productElement) {
                    this.productsContainer.appendChild(productElement);
                }
            });

            // Hide loading state and show products
            this.loadingState?.setAttribute('hidden', 'true');
            this.productsContainer.style.display = 'grid';

        } catch (error) {
            console.error('ERROR in renderProducts:', error);
            this.showError();
        }
    }

    addToCart(product) {
        console.log('DEBUG: Adding to cart:', product);
        
        // Find if product already exists in cart
        const existingProduct = this.cart.find(item => item.name === product.name);
        
        if (existingProduct) {
            existingProduct.quantity = (existingProduct.quantity || 1) + 1;
        } else {
            this.cart.push({
                ...product,
                quantity: 1
            });
        }

        // Save to localStorage
        localStorage.setItem('cart', JSON.stringify(this.cart));
        
        // Show feedback
        const button = this.productsContainer.querySelector(`[data-product="${product.name}"]`);
        if (button) {
            const originalText = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i> Added to Cart';
            button.classList.add('added');
            
            setTimeout(() => {
                button.innerHTML = originalText;
                button.classList.remove('added');
            }, 2000);
        }

        // Update cart display
        this.updateCartDisplay();
    }

    updateCartDisplay() {
        // Update cart count
        const totalItems = this.cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        if (this.cartCountElement) {
            this.cartCountElement.textContent = totalItems;
            this.cartCountElement.hidden = totalItems === 0;
        }

        // Update cart items
        if (this.cartItemsContainer) {
            this.cartItemsContainer.innerHTML = this.cart.map(item => `
                <div class="cart-item">
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <p>by ${item.author}</p>
                        <p>$${item.price.toFixed(2)} × ${item.quantity}</p>
                    </div>
                    <div class="cart-item-actions">
                        <button class="btn-remove" data-product="${item.name}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');

            // Add remove button listeners
            this.cartItemsContainer.querySelectorAll('.btn-remove').forEach(button => {
                button.addEventListener('click', () => {
                    const productName = button.dataset.product;
                    this.removeFromCart(productName);
                });
            });
        }

        // Update total
        if (this.cartTotalElement) {
            const total = this.cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
            this.cartTotalElement.textContent = total.toFixed(2);
        }

        // Update checkout button
        if (this.checkoutButton) {
            this.checkoutButton.disabled = this.cart.length === 0;
        }
    }

    removeFromCart(productName) {
        this.cart = this.cart.filter(item => item.name !== productName);
        localStorage.setItem('cart', JSON.stringify(this.cart));
        this.updateCartDisplay();
        this.showAlert('Item removed from cart');
    }

    setupCartControls() {
        // Add cart toggle button
        const cartToggle = document.querySelector('.cart-toggle');
        if (cartToggle) {
            cartToggle.addEventListener('click', () => this.toggleCart());
        }

        // Add close cart button
        const closeCart = document.querySelector('.close-cart');
        if (closeCart) {
            closeCart.addEventListener('click', () => this.toggleCart());
        }

        // Add clear cart listener
        const clearCartBtn = document.querySelector('.clear-cart');
        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', () => {
                if (this.cart.length === 0) {
                    this.showAlert('Cart is already empty');
                    return;
                }
                
                if (confirm('Are you sure you want to clear your cart?')) {
                    this.clearCart();
                }
            });
        }

        // Add checkout listener
        if (this.checkoutButton) {
            this.checkoutButton.addEventListener('click', () => this.processOrder());
        }
    }

    toggleCart() {
        if (this.cartDropdown) {
            this.cartDropdown.classList.toggle('show');
        }
    }

    clearCart() {
        // Clear cart array and localStorage
        this.cart = [];
        localStorage.setItem('cart', JSON.stringify(this.cart));
        
        // Update UI
        this.updateCartDisplay();
        
        // Show feedback
        this.showAlert('Cart has been cleared');
        
        // Reset order state
        this.orderProcessed = false;
        
        // Close the cart dropdown
        this.toggleCart();
    }

    processOrder() {
        if (this.orderProcessed) {
            this.showAlert('This order has already been processed!');
            return;
        }

        if (this.cart.length === 0) {
            this.showAlert('Your cart is empty!');
            return;
        }

        this.orderProcessed = true;
        this.showAlert('Order processed successfully! Thank you for your purchase.');
        this.cart = [];
        localStorage.setItem('cart', JSON.stringify(this.cart));
        this.updateCartDisplay();
    }

    showAlert(message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'cart-alert';
        alertDiv.textContent = message;
        document.body.appendChild(alertDiv);

        setTimeout(() => alertDiv.classList.add('show'), 10);
        setTimeout(() => {
            alertDiv.classList.remove('show');
            setTimeout(() => alertDiv.remove(), 300);
        }, 3000);
    }
}

// Create and initialize gallery when DOM is ready
document.addEventListener('DOMContentLoaded', () => new SimpleGallery());
