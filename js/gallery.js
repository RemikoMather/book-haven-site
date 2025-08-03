import { productService } from './product-service.js';
import { CartManager } from './cart-manager.js';

export class ProductManager {
    #products = [];
    #filteredProducts = [];
    #currentPage = 1;
    #itemsPerPage = 6;
    #cartManager;
    #retryCount = 0;
    #isLoading = false;
    #hasError = false;
    #lastFilters = {
        category: '',
        searchQuery: '',
        sortBy: 'newest'
    };

    constructor() {
        this.#cartManager = new CartManager();
        this.setupEventListeners();
        this.setupFilters();
        this.setupPagination();
        this.loadProducts();
    }

    static init() {
        window.productManager = new ProductManager();
        console.log('DEBUG: ProductManager initialized');
    }

    async loadProducts(isRetry = false) {
        if (this.#isLoading && !isRetry) return;

        try {
            console.log('DEBUG: Starting to load products...');
            console.log('DEBUG: ProductService instance:', productService);
            this.#isLoading = true;
            this.setVisibility({ loading: true, error: false, empty: false });

            if (!productService) {
                throw new Error('ProductService is not initialized');
            }

            const products = await productService.fetchProducts();
            console.log('Products received:', products);
            
            if (!products || !Array.isArray(products)) {
                throw new Error('Invalid products data received');
            }

            this.#products = products;
            this.#retryCount = 0;
            this.#hasError = false;
            console.log('Products loaded successfully:', this.#products.length, 'items');
            
            this.#filteredProducts = [...this.#products];
            this.renderProducts();
            this.updatePagination();
            
            await this.applyFilters();
        } catch (error) {
            console.error('DEBUG: Error in loadProducts:', error);
            this.#hasError = true;
            this.setVisibility({ loading: false, error: true, empty: false });
            
            // Show detailed error message to user
            const errorMessage = document.querySelector('.error-message p');
            if (errorMessage) {
                errorMessage.textContent = `Error loading products: ${error.message}. `;
                errorMessage.textContent += 'We are currently experiencing technical difficulties. ';
                errorMessage.textContent += 'The system will try to load from our backup data source.';
            }
            
            // Enable retry button with fallback
            const retryButton = document.querySelector('.error-actions button');
            if (retryButton) {
                retryButton.onclick = () => {
                    console.log('DEBUG: Retry button clicked');
                    this.loadProducts(true);
                };
            }

            // Try to load mock products as fallback
            try {
                const mockProducts = await productService.fetchMockProducts();
                if (mockProducts && mockProducts.length > 0) {
                    this.#products = mockProducts;
                    this.#filteredProducts = [...this.#products];
                    this.#hasError = false;
                    this.setVisibility({ loading: false, error: false, empty: false });
                    this.renderProducts();
                    this.updatePagination();
                }
            } catch (fallbackError) {
                console.error('DEBUG: Fallback to mock products also failed:', fallbackError);
            }
        } finally {
            this.#isLoading = false;
        }
    }

    async applyFilters() {
        if (this.#isLoading) return;

        try {
            this.#isLoading = true;
            this.setVisibility({ loading: true, error: false, empty: false });

            const category = document.getElementById('categoryFilter')?.value;
            const searchQuery = document.getElementById('searchInput')?.value?.toLowerCase();
            const sortBy = document.getElementById('sortFilter')?.value;

            // Save current filter state
            this.#lastFilters = { category, searchQuery, sortBy };

            let filteredProducts = [];

            if (category) {
                filteredProducts = await productService.fetchProductsByCategory(category);
            } else {
                filteredProducts = [...this.#products];
            }

            // Apply search filter
            if (searchQuery) {
                if (category) {
                    filteredProducts = filteredProducts.filter(product =>
                        product.name.toLowerCase().includes(searchQuery) || 
                        product.description.toLowerCase().includes(searchQuery)
                    );
                } else {
                    filteredProducts = await productService.searchProducts(searchQuery);
                }
            }

            // Sort products
            filteredProducts.sort((a, b) => {
                switch(sortBy) {
                    case 'price-low':
                        return a.price - b.price;
                    case 'price-high':
                        return b.price - a.price;
                    case 'name':
                        return a.name.localeCompare(b.name);
                    default: // newest
                        return new Date(b.created_at) - new Date(a.created_at);
                }
            });

            this.#filteredProducts = filteredProducts;
            this.#currentPage = 1;

            if (filteredProducts.length === 0) {
                this.setVisibility({ loading: false, error: false, empty: true });
            } else {
                this.renderProducts();
                this.updatePagination();
            }
        } catch (error) {
            console.error('Error applying filters:', error);
            this.setVisibility({ loading: false, error: true, empty: false });
        } finally {
            this.#isLoading = false;
        }
    }

    clearFilters() {
        const categoryFilter = document.getElementById('categoryFilter');
        const searchInput = document.getElementById('searchInput');
        const sortFilter = document.getElementById('sortFilter');

        if (categoryFilter) categoryFilter.value = '';
        if (searchInput) searchInput.value = '';
        if (sortFilter) sortFilter.value = 'newest';

        this.#lastFilters = {
            category: '',
            searchQuery: '',
            sortBy: 'newest'
        };

        this.loadProducts(true);
    }

    setupFilters() {
        const filters = ['categoryFilter', 'searchInput', 'sortFilter'];
        filters.forEach(filterId => {
            const element = document.getElementById(filterId);
            if (element) {
                element.addEventListener('change', () => this.applyFilters());
            }
        });

        // Add input event listener for search with debounce
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            let debounceTimeout;
            searchInput.addEventListener('input', () => {
                clearTimeout(debounceTimeout);
                debounceTimeout = setTimeout(() => this.applyFilters(), 300);
            });
        }
    }

    setupPagination() {
        const pagination = document.querySelector('.pagination');
        if (!pagination) return;

        const pageNumbers = document.querySelector('.page-numbers');
        const prevButton = document.getElementById('prevPage');
        const nextButton = document.getElementById('nextPage');
        
        if (prevButton) {
            prevButton.addEventListener('click', () => {
                if (this.#currentPage > 1) {
                    this.#currentPage--;
                    this.renderProducts();
                    this.updatePagination();
                }
            });
        }

        if (nextButton) {
            nextButton.addEventListener('click', () => {
                const totalPages = Math.ceil(this.#filteredProducts.length / this.#itemsPerPage);
                if (this.#currentPage < totalPages) {
                    this.#currentPage++;
                    this.renderProducts();
                    this.updatePagination();
                }
            });
        }

        if (pageNumbers) {
            pageNumbers.addEventListener('click', (e) => {
                const pageButton = e.target.closest('button');
                if (pageButton && !pageButton.classList.contains('active')) {
                    this.#currentPage = parseInt(pageButton.textContent);
                    this.renderProducts();
                    this.updatePagination();
                }
            });
        }
    }

    updatePaginationInfo() {
        const info = document.getElementById('paginationInfo');
        if (!info) return;

        const startIndex = (this.#currentPage - 1) * this.#itemsPerPage + 1;
        const endIndex = Math.min(startIndex + this.#itemsPerPage - 1, this.#filteredProducts.length);
        const total = this.#filteredProducts.length;

        info.textContent = `Showing products ${startIndex}-${endIndex} of ${total}`;
    }

    setVisibility({ loading, error, empty }) {
        const states = {
            loadingState: loading,
            errorState: error,
            emptyState: empty,
            productsContainer: !loading && !error && !empty
        };

        Object.entries(states).forEach(([id, visible]) => {
            const element = document.getElementById(id);
            if (element) {
                element.hidden = !visible;
            }
        });
    }

    updatePagination() {
        const pageNumbers = document.querySelector('.page-numbers');
        const prevButton = document.getElementById('prevPage');
        const nextButton = document.getElementById('nextPage');
        
        if (!pageNumbers) return;

        const totalPages = Math.ceil(this.#filteredProducts.length / this.#itemsPerPage);
        let paginationHTML = '';

        for (let i = 1; i <= totalPages; i++) {
            paginationHTML += `
                <button 
                    class="btn ${i === this.#currentPage ? 'active' : ''}"
                    aria-label="Page ${i}"
                    aria-current="${i === this.#currentPage ? 'page' : 'false'}"
                >${i}</button>
            `;
        }

        pageNumbers.innerHTML = paginationHTML;

        if (prevButton) {
            prevButton.disabled = this.#currentPage === 1;
        }
        if (nextButton) {
            nextButton.disabled = this.#currentPage === totalPages;
        }
    }

    renderProducts() {
        const productsContainer = document.getElementById('productsContainer');
        if (!productsContainer) {
            console.error('Products container not found');
            return;
        }

        const startIndex = (this.#currentPage - 1) * this.#itemsPerPage;
        const endIndex = startIndex + this.#itemsPerPage;
        const currentProducts = this.#filteredProducts.slice(startIndex, endIndex);

        if (this.#filteredProducts.length === 0) {
            this.setVisibility({ loading: false, error: false, empty: true });
            return;
        }

        productsContainer.innerHTML = currentProducts.map(product => this.getProductCard(product)).join('');
        this.updatePaginationInfo();
        this.setVisibility({ loading: false, error: false, empty: false });
    }

    getProductCard(product) {
        return `
            <article class="product-card">
                <div class="product-image">
                    <img 
                        src="${product.thumbnail || product.image || BookHaven.getAssetUrl('/images/placeholder-book.jpg')}" 
                        alt="${product.name}"
                        loading="lazy"
                        onerror="this.onerror=null; this.src=BookHaven.getAssetUrl('/images/placeholder-book.jpg');"
                    />
                </div>
                <div class="product-details">
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-info">
                        <span class="product-category">${product.category}</span>
                        <span class="product-stock">Stock: ${product.stock}</span>
                    </div>
                    <div class="product-footer">
                        <span class="product-price">$${product.price.toFixed(2)}</span>
                        <button 
                            class="btn btn-primary add-to-cart" 
                            data-product-id="${product.id}"
                            aria-label="Add ${product.name} to cart"
                            ${product.stock <= 0 ? 'disabled' : ''}
                        >
                            ${product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                    </div>
                </div>
            </article>
        `;
    }

    setupEventListeners() {
        // Retry button click handler
        const errorState = document.getElementById('errorState');
        if (errorState) {
            const retryButton = errorState.querySelector('button');
            if (retryButton) {
                retryButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.#retryCount = 0; // Reset retry count on manual retry
                    this.loadProducts();
                });
            }
        }

        // Delegate event handling for add to cart buttons
        const grid = document.getElementById('productGrid');
        if (grid) {
            grid.addEventListener('click', (e) => {
                const addToCartBtn = e.target.closest('.add-to-cart');
                if (!addToCartBtn) return;

                const productId = Number(addToCartBtn.dataset.productId);
                const product = this.#products.find(p => p.id === productId);

                if (!product) {
                    console.error('Product not found:', productId);
                    return;
                }

                // Show loading state
                const originalText = addToCartBtn.innerHTML;
                addToCartBtn.disabled = true;
                addToCartBtn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Adding...';

                try {
                    this.#cartManager.addItem({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image: product.image,
                        quantity: 1
                    });

                    // Show success state
                    addToCartBtn.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i> Added';
                    setTimeout(() => {
                        addToCartBtn.disabled = false;
                        addToCartBtn.innerHTML = originalText;
                    }, 2000);
                } catch (error) {
                    console.error('Error adding item to cart:', error);
                    addToCartBtn.innerHTML = '<i class="fas fa-exclamation-triangle" aria-hidden="true"></i> Error';
                    setTimeout(() => {
                        addToCartBtn.disabled = false;
                        addToCartBtn.innerHTML = originalText;
                    }, 2000);
                }
            });
        }
    }
}
