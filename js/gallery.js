import { productService } from './product-service.js';
import { CartManager } from './cart-manager.js';

export class ProductManager {
    static init() {
        window.productManager = new ProductManager();
    }
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.currentPage = 1;
        this.itemsPerPage = 6;
        this.cartManager = new CartManager();
        this.retryCount = 0;
        this.isLoading = false;
        this.hasError = false;
        this.lastFilters = {
            category: '',
            searchQuery: '',
            sortBy: 'newest'
        };

        this.setupEventListeners();
        this.setupFilters();
        this.setupPagination();
        this.loadProducts();
    }

    async loadProducts(isRetry = false) {
        if (this.isLoading && !isRetry) return;

        try {
            console.log('Starting to load products...');
            console.log('ProductService instance:', productService);
            this.isLoading = true;
            this.setVisibility({ loading: true, error: false, empty: false });

            const products = await productService.fetchProducts();
            console.log('Products received:', products);
            
            if (!products || !Array.isArray(products)) {
                throw new Error('Invalid products data received');
            }

            this.products = products;
            this.retryCount = 0;
            this.hasError = false;
            console.log('Products loaded successfully:', this.products.length, 'items');
            
            this.filteredProducts = [...this.products];
            this.renderProducts();
            this.updatePagination();
            
            await this.applyFilters();
        } catch (error) {
            console.error('Error loading products:', error);
            this.hasError = true;
            this.setVisibility({ loading: false, error: true, empty: false });
            
            // Show error message to user
            const errorMessage = document.querySelector('.error-message p');
            if (errorMessage) {
                errorMessage.textContent = `Error loading products: ${error.message}. Please try again.`;
            }
            
            // Enable retry button
            const retryButton = document.querySelector('.error-actions button');
            if (retryButton) {
                retryButton.addEventListener('click', () => this.loadProducts(true));
            }
        } finally {
            this.isLoading = false;
        }
    }

    // Removed duplicate setupEventListeners method to resolve syntax error.

    async applyFilters() {
        if (this.isLoading) return;

        try {
            this.isLoading = true;
            this.setVisibility({ loading: true, error: false, empty: false });

            const category = document.getElementById('categoryFilter').value;
            const searchQuery = document.getElementById('searchInput').value.toLowerCase();
            const sortBy = document.getElementById('sortFilter').value;

            // Save current filter state
            this.lastFilters = { category, searchQuery, sortBy };

            let filteredProducts = [];

            if (category) {
                filteredProducts = await productService.fetchProductsByCategory(category);
            } else {
                filteredProducts = [...this.products];
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

            this.filteredProducts = filteredProducts;
            this.currentPage = 1;

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
            this.isLoading = false;
        }
    }

    clearFilters() {
        const categoryFilter = document.getElementById('categoryFilter');
        const searchInput = document.getElementById('searchInput');
        const sortFilter = document.getElementById('sortFilter');

        if (categoryFilter) categoryFilter.value = '';
        if (searchInput) searchInput.value = '';
        if (sortFilter) sortFilter.value = 'newest';

        this.lastFilters = {
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

        pagination.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn')) {
                if (e.target.getAttribute('aria-label') === 'Previous page') {
                    this.currentPage = Math.max(1, this.currentPage - 1);
                } else if (e.target.getAttribute('aria-label') === 'Next page') {
                    const maxPage = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
                    this.currentPage = Math.min(maxPage, this.currentPage + 1);
                } else {
                    this.currentPage = parseInt(e.target.textContent);
                }
                this.renderProducts();
                this.updatePagination();
            }
        });
    }

    // Removed duplicate updatePagination arrow function to fix syntax error.

    updatePaginationInfo = () => {
        const info = document.getElementById('paginationInfo');
        if (!info) return;

        const startIndex = (this.currentPage - 1) * this.itemsPerPage + 1;
        const endIndex = Math.min(startIndex + this.itemsPerPage - 1, this.filteredProducts.length);
        const total = this.filteredProducts.length;

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

        const totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
        let paginationHTML = '';

        for (let i = 1; i <= totalPages; i++) {
            paginationHTML += `
                <button 
                    class="btn ${i === this.currentPage ? 'active' : ''}"
                    aria-label="Page ${i}"
                    aria-current="${i === this.currentPage ? 'page' : 'false'}"
                >${i}</button>
            `;
        }

        pageNumbers.innerHTML = paginationHTML;

        // Update prev/next buttons
        if (prevButton) {
            prevButton.disabled = this.currentPage === 1;
        }
        if (nextButton) {
            nextButton.disabled = this.currentPage === totalPages;
        }
    }

    updatePaginationInfo() {
        const info = document.getElementById('paginationInfo');
        if (!info) return;

        const startIndex = (this.currentPage - 1) * this.itemsPerPage + 1;
        const endIndex = Math.min(startIndex + this.itemsPerPage - 1, this.filteredProducts.length);
        const total = this.filteredProducts.length;

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

    resetFilters() {
        const categoryFilter = document.getElementById('categoryFilter');
        const sortFilter = document.getElementById('sortFilter');
        const searchInput = document.getElementById('searchInput');

        if (categoryFilter) categoryFilter.value = '';
        if (sortFilter) sortFilter.value = 'newest';
        if (searchInput) searchInput.value = '';

        this.filteredProducts = [...this.products];
        this.currentPage = 1;
        this.renderProducts();
        this.updatePagination();
    }

    renderProducts() {
        const productsContainer = document.getElementById('productsContainer');
        if (!productsContainer) {
            console.error('Products container not found');
            return;
        }

        console.log('Rendering products:', this.filteredProducts.length, 'total items');

        // Get the current page's products
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const currentProducts = this.filteredProducts.slice(startIndex, endIndex);

        console.log('Current page products:', currentProducts.length, 'items');

        if (this.filteredProducts.length === 0) {
            this.setVisibility({ loading: false, error: false, empty: true });
            return;
        }

        productsContainer.innerHTML = currentProducts.map(product => this.getProductCard(product)).join('');
        this.updatePaginationInfo();
        this.setVisibility({ loading: false, error: false, empty: false });
    }

    // Add a stub for getProductCard if missing
    getProductCard(product) {
        return `
            <article class="product-card">
                <div class="product-image">
                    <img 
                        src="${product.thumbnail || product.image}" 
                        alt="${product.name}"
                        loading="lazy"
                        onerror="this.onerror=null; this.src='https://cdn.pixabay.com/photo/2015/11/19/21/14/book-1052014_640.jpg'"
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
                    this.retryCount = 0; // Reset retry count on manual retry
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
                const product = this.products.find(p => p.id === productId);

                if (!product) {
                    console.error('Product not found:', productId);
                    return;
                }

                // Show loading state
                const originalText = addToCartBtn.innerHTML;
                addToCartBtn.disabled = true;
                addToCartBtn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Adding...';

                try {
                    this.cartManager.addItem({
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
