class SimpleGallery {
    constructor() {
        console.log('DEBUG: SimpleGallery constructor started');
        // Initialize container elements
        this.productsContainer = document.getElementById('productsContainer');
        this.loadingState = document.getElementById('loadingState');
        this.errorState = document.getElementById('errorState');
        this.emptyState = document.getElementById('emptyState');
        
        // Initialize products data
        this.products = [
            {
                name: 'The Great Gatsby',
                author: 'F. Scott Fitzgerald',
                price: 15.99,
                description: 'A masterpiece of American fiction that captures the essence of the Jazz Age.',
                category: 'fiction',
                image: 'https://cdn.pixabay.com/photo/2019/01/30/08/30/book-3964050_640.jpg'
            },
            {
                name: 'To Kill a Mockingbird',
                author: 'Harper Lee',
                price: 14.99,
                description: 'A timeless classic exploring racial injustice in a small Southern town.',
                category: 'fiction',
                image: 'https://cdn.pixabay.com/photo/2019/01/30/08/30/book-3964050_640.jpg'
            },
            {
                name: '1984',
                author: 'George Orwell',
                price: 12.99,
                description: 'A dystopian social science fiction novel exploring totalitarianism.',
                category: 'fiction',
                image: 'https://cdn.pixabay.com/photo/2019/01/30/08/30/book-3964050_640.jpg'
            }
        ];
        
        // Initialize cart
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.orderProcessed = false;
        
        // Initialize cart elements
        this.cartCountElement = document.querySelector('[data-cart-count]');
        this.cartItemsContainer = document.getElementById('cart-items');
        this.cartTotalElement = document.querySelector('[data-cart-total]');
        this.checkoutButton = document.querySelector('.checkout-btn');
        this.cartDropdown = document.querySelector('.cart-dropdown');
        
        // Add cart controls
        this.setupCartControls();
        
        console.log('DEBUG: Cart elements:', {
            cartCount: !!this.cartCountElement,
            cartItems: !!this.cartItemsContainer,
            cartTotal: !!this.cartTotalElement,
            checkoutBtn: !!this.checkoutButton
        });
        
        // Update cart display
        this.updateCartDisplay();

        // Log element status
        console.log({
            productsContainer: !!this.productsContainer,
            loadingState: !!this.loadingState,
            errorState: !!this.errorState,
            emptyState: !!this.emptyState
        });
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

    showProducts() {
        console.log('DEBUG: Showing products');
        this.loadingState?.setAttribute('hidden', 'true');
        this.errorState?.setAttribute('hidden', 'true');
        this.emptyState?.setAttribute('hidden', 'true');
        if (this.productsContainer) {
            this.productsContainer.style.display = 'grid';
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
            console.log('DEBUG: Adding clear cart listener');
            clearCartBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.clearCart();
            });
        } else {
            console.log('DEBUG: Clear cart button not found');
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
        console.log('DEBUG: Clear cart called');
        if (this.cart.length === 0) {
            this.showAlert('Cart is already empty');
            return;
        }
        
        if (confirm('Are you sure you want to clear your cart?')) {
            this.cart = [];
            localStorage.setItem('cart', JSON.stringify(this.cart));
            this.updateCartDisplay();
            this.showAlert('Cart has been cleared');
            this.orderProcessed = false;
            this.toggleCart(); // Close the cart dropdown
        }
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

        setTimeout(() => {
            alertDiv.classList.add('show');
        }, 10);

        setTimeout(() => {
            alertDiv.classList.remove('show');
            setTimeout(() => alertDiv.remove(), 300);
        }, 3000);
    }

    static init() {
        const gallery = new SimpleGallery();
        gallery.renderProducts();
        return gallery;
    }

    renderProducts() {
        console.log('DEBUG: Rendering products');
        if (!this.productsContainer) {
            console.error('DEBUG: Products container not found');
            return;
        }

        const mockProducts = [
            {
                name: "The Great Gatsby",
                author: "F. Scott Fitzgerald",
                description: "A masterpiece of American fiction that captures the essence of the Jazz Age, following the mysterious millionaire Jay Gatsby and his obsession with Daisy Buchanan.",
                price: 15.99,
                image: "https://cdn.pixabay.com/photo/2019/01/30/08/30/book-3964050_640.jpg"
            },
            {
                name: "To Kill a Mockingbird",
                author: "Harper Lee",
                description: "A timeless classic exploring racial injustice in a small Southern town through the eyes of young Scout Finch. Winner of the Pulitzer Prize.",
                price: 14.99,
                image: "https://cdn.pixabay.com/photo/2019/01/30/08/30/book-3964050_640.jpg"
            },
            {
                name: "1984",
                author: "George Orwell",
                description: "A dystopian social science fiction novel that explores the consequences of totalitarianism, mass surveillance, and repressive regimentation.",
                price: 12.99,
                image: "https://cdn.pixabay.com/photo/2019/01/30/08/30/book-3964050_640.jpg"
            },
            {
                name: "Pride and Prejudice",
                author: "Jane Austen",
                description: "A romantic novel of manners that follows the emotional development of Elizabeth Bennet and her relationship with the proud Mr. Darcy.",
                price: 11.99,
                image: "https://cdn.pixabay.com/photo/2019/01/30/08/30/book-3964050_640.jpg"
            },
            {
                name: "The Catcher in the Rye",
                author: "J.D. Salinger",
                description: "A story of teenage alienation and loss of innocence in America, following Holden Caulfield's experiences in New York City.",
                price: 13.99,
                image: "https://cdn.pixabay.com/photo/2019/01/30/08/30/book-3964050_640.jpg"
            },
            {
                name: "One Hundred Years of Solitude",
                author: "Gabriel García Márquez",
                description: "A landmark of magical realism that tells the multi-generational story of the Buendía family in the mythical town of Macondo.",
                price: 16.99,
                image: "https://cdn.pixabay.com/photo/2019/01/30/08/30/book-3964050_640.jpg"
            },
            {
                name: "The Hobbit",
                author: "J.R.R. Tolkien",
                description: "A fantasy novel about the adventures of Bilbo Baggins, a hobbit who embarks on a quest to help a group of dwarves reclaim their mountain home.",
                price: 17.99,
                image: "https://cdn.pixabay.com/photo/2019/01/30/08/30/book-3964050_640.jpg"
            },
            {
                name: "Beloved",
                author: "Toni Morrison",
                description: "A powerful examination of the psychological and physical effects of slavery, following a family's struggle with the past.",
                price: 15.99,
                image: "https://cdn.pixabay.com/photo/2019/01/30/08/30/book-3964050_640.jpg"
            }
        ];

        const productsHtml = mockProducts.map(product => `
            <div class="gallery-item">
                <div class="img-container">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                </div>
                <div class="product-details">
                    <h3>${product.name}</h3>
                    <p class="book-author">By ${product.author}</p>
                    <p class="price">$${product.price.toFixed(2)}</p>
                    <p class="book-description">${product.description}</p>
                    <button class="btn btn-primary add-to-cart" data-product="${product.name}">
                        <i class="fas fa-shopping-cart"></i>
                        Add to Cart
                    </button>
                </div>
            </div>
        `).join('');

        console.log('DEBUG: Setting container HTML');
        
        // Set products HTML
        this.productsContainer.innerHTML = productsHtml;
        
        // Add event listeners to all cart buttons
        const cartButtons = this.productsContainer.querySelectorAll('.add-to-cart');
        cartButtons.forEach((button, index) => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const product = mockProducts[index];
                this.addToCart(product);
            });
        });
    }

    async init() {
        try {
            console.log('DEBUG: Starting initialization');
            this.showLoading();

            // Simulate loading delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            this.renderProducts();
            this.showProducts();
            
            // Make sure cart display is updated initially
            this.updateCartDisplay();
            
            console.log('DEBUG: Initialization complete');
        } catch (error) {
            console.error('DEBUG: Initialization failed:', error);
            this.showError();
        }
    }
}

// Create and initialize gallery when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DEBUG: DOM Content Loaded');
    const gallery = new SimpleGallery();
    gallery.init().catch(console.error);
});
