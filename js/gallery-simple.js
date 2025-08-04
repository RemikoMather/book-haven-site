/**
 * Gallery class for managing the book gallery functionality
 */
export class SimpleGallery {
    constructor() {
        console.log('DEBUG: SimpleGallery constructor started');
        
        // Initialize state variables
        this.initialized = false;
        
        // Initialize cart elements
        this.cartCountElement = document.querySelector('[data-cart-count]');
        this.cartDropdown = document.querySelector('.cart-dropdown');
        this.cartItemsContainer = document.querySelector('#cart-items');
        this.cartTotalElement = document.querySelector('[data-cart-total]');
        this.checkoutButton = document.querySelector('.checkout-btn');
        
        // Ensure cart count is visible initially
        if (this.cartCountElement) {
            this.cartCountElement.style.display = 'flex';
        }
        
        // Initialize cart from localStorage with error handling
        try {
            const savedCart = localStorage.getItem('cart');
            this.cart = savedCart ? JSON.parse(savedCart) : [];
            // Ensure cart is always an array
            if (!Array.isArray(this.cart)) {
                console.warn('Cart was not an array, resetting to empty array');
                this.cart = [];
                localStorage.setItem('cart', JSON.stringify(this.cart));
            }
        } catch (error) {
            console.error('Error loading cart from localStorage:', error);
            this.cart = [];
            localStorage.setItem('cart', JSON.stringify(this.cart));
        }
        
        this.orderProcessed = false;
        
        // Debug logging
        console.log('Cart initialized:', this.cart);
        
        // Initialize cart display
        this.updateCartDisplay();
        
        // Initialize products data
        this.products = [
            {
                name: "The Great Gatsby",
                author: "F. Scott Fitzgerald",
                description: "A masterpiece of American fiction that captures the essence of the Jazz Age.",
                price: 15.99,
                category: "fiction",
                image: "https://cdn.pixabay.com/photo/2019/01/30/08/30/book-3964050_640.jpg"
            },
            {
                name: "To Kill a Mockingbird",
                author: "Harper Lee",
                description: "A powerful story of racial injustice and loss of innocence in the American South.",
                price: 14.99,
                category: "fiction",
                image: "https://cdn.pixabay.com/photo/2019/07/02/11/18/book-4311279_640.jpg"
            },
            {
                name: "The Hobbit",
                author: "J.R.R. Tolkien",
                description: "An unforgettable tale that follows Bilbo Baggins on an incredible adventure.",
                price: 17.99,
                category: "fiction",
                image: "https://cdn.pixabay.com/photo/2019/07/05/10/25/book-4318559_640.jpg"
            },
            {
                name: "Beloved",
                author: "Toni Morrison",
                description: "A haunting chronicle of slavery and its aftermath, winner of the Pulitzer Prize.",
                price: 15.99,
                category: "fiction",
                image: "https://cdn.pixabay.com/photo/2019/07/05/10/25/book-4318560_640.jpg"
            },
            {
                name: "1984",
                author: "George Orwell",
                description: "A dystopian masterpiece that explores surveillance, truth, and power.",
                price: 12.99,
                category: "fiction",
                image: "https://cdn.pixabay.com/photo/2019/07/02/11/18/book-4311280_640.jpg"
            },
            {
                name: "The Road Not Taken",
                author: "Robert Frost",
                description: "A collection of Frost's most memorable and beloved poems.",
                price: 11.99,
                category: "poetry",
                image: "https://cdn.pixabay.com/photo/2019/07/02/11/18/book-4311281_640.jpg"
            }
        ];
    }

    initialize() {
        if (this.initialized) {
            console.log('DEBUG: Gallery already initialized');
            return;
        }

        console.log('DEBUG: Initializing gallery');
        
        try {
            // Show loading state
            const loadingState = document.getElementById('loadingState');
            if (loadingState) {
                loadingState.hidden = false;
            }

            // Hide error state initially
            this.hideError();

            // Setup cart controls and display
            this.setupCartControls();
            this.updateCartDisplay();

            // Check if we have products data
            if (!Array.isArray(this.products) || this.products.length === 0) {
                throw new Error('No products data available');
            }

            // Hide loading state and show products
            if (loadingState) {
                loadingState.hidden = true;
            }
            const productsContainer = document.getElementById('productsContainer');
            if (productsContainer) {
                productsContainer.style.display = 'grid';
                this.displayProducts();
            }

            this.initialized = true;
        } catch (error) {
            console.error('Error during initialization:', error);
            this.showError();
        }
    }

    addToCart(product) {
        console.log('DEBUG: Adding to cart:', product);
        
        try {
            // Ensure this.cart is an array
            if (!Array.isArray(this.cart)) {
                console.warn('Cart was not an array, resetting to empty array');
                this.cart = [];
            }
            
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
            
            // Show feedback and update display
            this.updateCartDisplay();
            this.showAlert('Item added to cart');
            
        } catch (error) {
            console.error('Error adding to cart:', error);
            this.showAlert('Error adding item to cart');
        }
    }

    updateCartDisplay() {
        try {
            // Ensure this.cart is an array
            if (!Array.isArray(this.cart)) {
                this.cart = [];
            }
            
            // Update cart count
            const totalItems = this.cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
            if (this.cartCountElement) {
                this.cartCountElement.textContent = totalItems;
                this.cartCountElement.style.display = 'flex';
                this.cartCountElement.style.visibility = totalItems === 0 ? 'hidden' : 'visible';
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
            const checkoutButton = document.querySelector('.checkout-btn');
            if (checkoutButton) {
                const hasItems = this.cart.length > 0;
                checkoutButton.disabled = !hasItems;
                checkoutButton.setAttribute('aria-disabled', !hasItems);
                checkoutButton.title = hasItems ? 'Proceed to checkout' : 'Add items to cart to checkout';
            }
        } catch (error) {
            console.error('Error updating cart display:', error);
        }
    }

    removeFromCart(productName) {
        try {
            this.cart = this.cart.filter(item => item.name !== productName);
            localStorage.setItem('cart', JSON.stringify(this.cart));
            this.updateCartDisplay();
            this.showAlert('Item removed from cart');
        } catch (error) {
            console.error('Error removing from cart:', error);
            this.showAlert('Error removing item from cart');
        }
    }

    clearCart() {
        try {
            this.cart = [];
            localStorage.setItem('cart', JSON.stringify(this.cart));
            this.updateCartDisplay();
            this.showAlert('Cart has been cleared');
            this.orderProcessed = false;
        } catch (error) {
            console.error('Error clearing cart:', error);
            this.showAlert('Error clearing cart');
        }
    }

    processOrder() {
        try {
            if (this.orderProcessed) {
                this.showAlert('This order has already been processed!', 'warning');
                return;
            }

            if (this.cart.length === 0) {
                this.showAlert('Your cart is empty!', 'warning');
                return;
            }

            // Calculate total
            const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            
            this.orderProcessed = true;
            this.showAlert(`Order processed successfully! Total: $${total.toFixed(2)}. Thank you for your purchase.`, 'success');
            this.cart = [];
            localStorage.setItem('cart', JSON.stringify(this.cart));
            this.updateCartDisplay();
            
            // Close cart dropdown after successful order
            const cartDropdown = document.querySelector('.cart-dropdown');
            if (cartDropdown) {
                cartDropdown.classList.remove('show');
            }
        } catch (error) {
            console.error('Error processing order:', error);
            this.showAlert('Error processing order');
        }
    }

    showAlert(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `cart-alert ${type}`;
        alertDiv.textContent = message;
        
        // Add icon based on type
        const icon = document.createElement('i');
        icon.className = 'fas ' + (type === 'success' ? 'fa-check-circle' : 
                                 type === 'warning' ? 'fa-exclamation-triangle' : 
                                 type === 'error' ? 'fa-times-circle' : 'fa-info-circle');
        alertDiv.insertBefore(icon, alertDiv.firstChild);
        
        document.body.appendChild(alertDiv);
        
        // Add animation classes
        alertDiv.classList.add('slide-in');
        
        setTimeout(() => {
            alertDiv.classList.add('slide-out');
            setTimeout(() => alertDiv.remove(), 300);
        }, 3000);
    }

    showError() {
        // Hide loading state if it exists
        const loadingState = document.getElementById('loadingState');
        if (loadingState) {
            loadingState.hidden = true;
        }

        // Show error state
        const errorState = document.getElementById('errorState');
        if (errorState) {
            errorState.hidden = false;
        }

        // Hide products container
        const productsContainer = document.getElementById('productsContainer');
        if (productsContainer) {
            productsContainer.style.display = 'none';
        }
    }

    hideError() {
        const errorState = document.getElementById('errorState');
        if (errorState) {
            errorState.hidden = true;
        }
    }

    setupCartControls() {
        // Setup cart toggle button
        const cartToggle = document.querySelector('.cart-toggle');
        const cartDropdown = document.querySelector('.cart-dropdown');
        
        if (cartToggle && cartDropdown) {
            cartToggle.addEventListener('click', (event) => {
                event.stopPropagation();
                cartDropdown.classList.toggle('show');
            });

            // Close cart when clicking outside
            document.addEventListener('click', (event) => {
                if (!cartDropdown.contains(event.target) && !cartToggle.contains(event.target)) {
                    cartDropdown.classList.remove('show');
                }
            });
        }

        // Setup clear cart button
        const clearCartButton = document.querySelector('.clear-cart');
        if (clearCartButton) {
            clearCartButton.addEventListener('click', () => {
                this.clearCart();
            });
        }

        // Setup checkout button
        const checkoutButton = document.querySelector('.checkout-btn');
        if (checkoutButton) {
            checkoutButton.addEventListener('click', () => {
                this.processOrder();
            });
        }

        // Setup close cart button
        const closeCartButton = document.querySelector('.close-cart');
        if (closeCartButton) {
            closeCartButton.addEventListener('click', () => {
                cartDropdown.classList.remove('show');
            });
        }

        console.log('DEBUG: Cart controls initialized');
    }

    displayProducts() {
        const productsContainer = document.getElementById('productsContainer');
        if (!productsContainer) return;

        try {
            productsContainer.innerHTML = this.products.map(product => `
                <article class="product-card">
                    <div class="product-image">
                        <img src="${product.image}" alt="${product.name}" loading="lazy">
                    </div>
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <p class="author">by ${product.author}</p>
                        <p class="description">${product.description}</p>
                        <p class="price">$${product.price.toFixed(2)}</p>
                        <button class="btn btn-primary add-to-cart" data-product="${product.name}">
                            Add to Cart <i class="fas fa-shopping-cart"></i>
                        </button>
                    </div>
                </article>
            `).join('');

            // Add click handlers for add to cart buttons
            productsContainer.querySelectorAll('.add-to-cart').forEach(button => {
                button.addEventListener('click', () => {
                    const productName = button.dataset.product;
                    const product = this.products.find(p => p.name === productName);
                    if (product) {
                        this.addToCart(product);
                    }
                });
            });
        } catch (error) {
            console.error('Error displaying products:', error);
            this.showError();
        }
    }
}
