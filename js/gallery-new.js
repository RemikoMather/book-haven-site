import { CartManager } from './cart-manager.js';

export class ProductManager {
    constructor() {
        console.log('DEBUG: ProductManager constructor started');
        this.products = [];
        this.currentPage = 1;
        this.itemsPerPage = 6;
        
        // Get DOM elements
        this.productsContainer = document.getElementById('productsContainer');
        console.log('DEBUG: productsContainer found:', !!this.productsContainer);
        if (!this.productsContainer) {
            console.error('DEBUG: productsContainer element is missing');
        }
        
        this.loadingState = document.getElementById('loadingState');
        console.log('DEBUG: loadingState found:', !!this.loadingState);
        
        this.errorState = document.getElementById('errorState');
        console.log('DEBUG: errorState found:', !!this.errorState);
        
        this.emptyState = document.getElementById('emptyState');
        console.log('DEBUG: emptyState found:', !!this.emptyState);

        // Initialize with loading state
        this.showLoading();
    }

    static async init() {
        let manager;
        try {
            console.log('DEBUG: Creating new ProductManager instance...');
            manager = new ProductManager();
            
            // Verify required elements exist
            if (!manager.productsContainer) {
                throw new Error('Products container element not found');
            }
            if (!manager.loadingState) {
                throw new Error('Loading state element not found');
            }
            
            console.log('DEBUG: Required DOM elements found');
            console.log('DEBUG: Initializing CartManager...');
            manager.cartManager = new CartManager();
            console.log('DEBUG: Loading products...');
            await manager.loadProducts();
            console.log('DEBUG: Products loaded, setting up handlers...');
            manager.setupPaginationHandlers();
            manager.setupCartHandlers();
            console.log('DEBUG: All handlers set up');
            return manager;
        } catch (error) {
            console.error('DEBUG: ProductManager initialization failed:', error);
            if (manager) {
                manager.showError();
            }
            throw error; // Re-throw to be caught by the page init
        }
    }

    setupCartHandlers() {
        console.log('DEBUG: Setting up cart handlers');
        if (!this.productsContainer) {
            console.error('DEBUG: Cannot set up cart handlers - container not found');
            return;
        }

        this.productsContainer.addEventListener('click', (e) => {
            const addToCartBtn = e.target.closest('.add-to-cart');
            if (!addToCartBtn) return;

            const productId = Number(addToCartBtn.dataset.productId);
            const product = this.products.find(p => p.id === productId);

            if (!product) {
                console.error('Product not found:', productId);
                return;
            }

            // Show loading state
            const originalText = addToCartBtn.textContent;
            addToCartBtn.disabled = true;
            addToCartBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';

            try {
                this.cartManager.addItem({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    quantity: 1
                });

                // Show success state
                addToCartBtn.innerHTML = '<i class="fas fa-check"></i> Added';
                setTimeout(() => {
                    addToCartBtn.disabled = false;
                    addToCartBtn.textContent = originalText;
                }, 2000);
            } catch (error) {
                console.error('Error adding item to cart:', error);
                addToCartBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Error';
                setTimeout(() => {
                    addToCartBtn.disabled = false;
                    addToCartBtn.textContent = originalText;
                }, 2000);
            }
        });
    }

    setupPaginationHandlers() {
        // Previous page button
        const prevButton = document.getElementById('prevPage');
        if (prevButton) {
            prevButton.addEventListener('click', () => {
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.renderProducts();
                }
            });
        }

        // Next page button
        const nextButton = document.getElementById('nextPage');
        if (nextButton) {
            nextButton.addEventListener('click', () => {
                const totalPages = Math.ceil(this.products.length / this.itemsPerPage);
                if (this.currentPage < totalPages) {
                    this.currentPage++;
                    this.renderProducts();
                }
            });
        }

        // Page number buttons
        const pageNumbers = document.querySelector('.page-numbers');
        if (pageNumbers) {
            pageNumbers.addEventListener('click', (e) => {
                const button = e.target.closest('button');
                if (button && !button.classList.contains('active')) {
                    this.currentPage = parseInt(button.textContent);
                    this.renderProducts();
                }
            });
        }
    }

    showLoading() {
        console.log('DEBUG: Showing loading state');
        if (this.loadingState) this.loadingState.removeAttribute('hidden');
        if (this.errorState) this.errorState.setAttribute('hidden', 'true');
        if (this.emptyState) this.emptyState.setAttribute('hidden', 'true');
        if (this.productsContainer) this.productsContainer.style.display = 'none';
    }

    showError() {
        console.log('DEBUG: Showing error state');
        if (this.loadingState) this.loadingState.setAttribute('hidden', 'true');
        if (this.errorState) this.errorState.removeAttribute('hidden');
        if (this.emptyState) this.emptyState.setAttribute('hidden', 'true');
        if (this.productsContainer) this.productsContainer.style.display = 'none';
    }

    showEmpty() {
        console.log('DEBUG: Showing empty state');
        if (this.loadingState) this.loadingState.setAttribute('hidden', 'true');
        if (this.errorState) this.errorState.setAttribute('hidden', 'true');
        if (this.emptyState) this.emptyState.removeAttribute('hidden');
        if (this.productsContainer) this.productsContainer.style.display = 'none';
    }

    showProducts() {
        console.log('DEBUG: Showing products');
        if (this.loadingState) this.loadingState.setAttribute('hidden', 'true');
        if (this.errorState) this.errorState.setAttribute('hidden', 'true');
        if (this.emptyState) this.emptyState.setAttribute('hidden', 'true');
        if (this.productsContainer) this.productsContainer.style.display = 'grid';
    }

    async loadProducts() {
        try {
            console.log('DEBUG: Load products started');
            this.showLoading();
            
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Use hardcoded products for now
            this.products = [
                {
                    id: 1,
                    name: "The Great Gatsby",
                    author: "F. Scott Fitzgerald",
                    description: "A masterpiece of American fiction",
                    price: 15.99,
                    image: "https://cdn.pixabay.com/photo/2019/01/30/08/30/book-3964050_640.jpg"
                },
                {
                    id: 2,
                    name: "To Kill a Mockingbird",
                    author: "Harper Lee",
                    description: "A classic of modern American literature",
                    price: 14.99,
                    image: "https://cdn.pixabay.com/photo/2019/01/30/08/30/book-3964050_640.jpg"
                },
                {
                    id: 3,
                    name: "1984",
                    author: "George Orwell",
                    description: "A dystopian social science fiction",
                    price: 12.99,
                    image: "https://cdn.pixabay.com/photo/2019/01/30/08/30/book-3964050_640.jpg"
                }
            ];
            
            console.log('DEBUG: Products loaded:', this.products.length);
            
            if (this.products.length === 0) {
                console.log('DEBUG: No products found, showing empty state');
                this.showEmpty();
                return;
            }

            console.log('DEBUG: Rendering products...');
            await this.renderProducts();
            console.log('DEBUG: Products rendered, showing container');
            this.showProducts();
        } catch (error) {
            console.error('DEBUG: Failed to load products:', error);
            this.showError();
            throw error;
        }
    }

    async renderProducts() {
        console.log('DEBUG: Starting renderProducts');
        if (!this.productsContainer) {
            console.error('DEBUG: productsContainer element not found');
            this.showError();
            return;
        }

        console.log('DEBUG: Products array length:', this.products.length);
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const currentProducts = this.products.slice(startIndex, endIndex);
        console.log('DEBUG: Current page products:', currentProducts.length);

        console.log('DEBUG: Building product HTML');
        const productsHtml = currentProducts.map(product => `
            <div class="gallery-item">
                <div class="img-container">
                    <img src="${product.image}" 
                         alt="${product.name}" 
                         loading="lazy">
                </div>
                <div class="product-details">
                    <h3>${product.name}</h3>
                    <p class="book-author">By ${product.author}</p>
                    <p class="price">$${product.price.toFixed(2)}</p>
                    <button class="btn add-to-cart" data-product-id="${product.id}">
                        Add to Cart
                    </button>
                    <p class="book-description">${product.description || ''}</p>
                </div>
            </div>
        `).join('');

        console.log('DEBUG: Updating container HTML');
        this.productsContainer.innerHTML = productsHtml;
        this.updatePagination();
    }

    updatePagination() {
        const totalPages = Math.ceil(this.products.length / this.itemsPerPage);
        const startItem = ((this.currentPage - 1) * this.itemsPerPage) + 1;
        const endItem = Math.min(this.currentPage * this.itemsPerPage, this.products.length);

        // Update pagination info
        const paginationInfo = document.getElementById('paginationInfo');
        if (paginationInfo) {
            paginationInfo.textContent = `Showing ${startItem}-${endItem} of ${this.products.length} books`;
        }

        // Update navigation buttons
        const prevButton = document.getElementById('prevPage');
        const nextButton = document.getElementById('nextPage');

        if (prevButton) {
            prevButton.disabled = this.currentPage <= 1;
        }
        if (nextButton) {
            nextButton.disabled = this.currentPage >= totalPages;
        }

        // Update page numbers
        const pageNumbers = document.querySelector('.page-numbers');
        if (pageNumbers) {
            let pageHtml = '';
            for (let i = 1; i <= totalPages; i++) {
                pageHtml += `
                    <button class="btn ${i === this.currentPage ? 'active' : ''}" 
                            ${i === this.currentPage ? 'aria-current="page"' : ''}>
                        ${i}
                    </button>
                `;
            }
            pageNumbers.innerHTML = pageHtml;
        }
    }
}
