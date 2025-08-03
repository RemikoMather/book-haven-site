// Book data
const books = [
    {
        id: 1,
        name: "The Great Gatsby",
        price: 19.99,
        category: "fiction",
        image: "https://cdn.pixabay.com/photo/2015/11/19/21/14/book-1052014_1280.jpg",
        thumbnail: "https://cdn.pixabay.com/photo/2015/11/19/21/14/book-1052014_640.jpg",
        description: "A classic novel by F. Scott Fitzgerald"
    },
    {
        id: 2,
        name: "Sapiens",
        price: 24.99,
        category: "non-fiction",
        image: "https://cdn.pixabay.com/photo/2018/07/01/20/01/book-3510326_1280.jpg",
        thumbnail: "https://cdn.pixabay.com/photo/2018/07/01/20/01/book-3510326_640.jpg",
        description: "A brief history of humankind"
    },
    {
        id: 3,
        name: "The Cat in the Hat",
        price: 14.99,
        category: "children",
        image: "https://cdn.pixabay.com/photo/2016/09/10/17/18/book-1659717_1280.jpg",
        thumbnail: "https://cdn.pixabay.com/photo/2016/09/10/17/18/book-1659717_640.jpg",
        description: "Dr. Seuss classic children's book"
    },
    {
        id: 4,
        name: "Milk and Honey",
        price: 16.99,
        category: "poetry",
        image: "https://cdn.pixabay.com/photo/2015/11/19/21/11/book-1052010_1280.jpg",
        thumbnail: "https://cdn.pixabay.com/photo/2015/11/19/21/11/book-1052010_640.jpg",
        description: "Modern poetry collection"
    },
    {
        id: 5,
        name: "1984",
        price: 21.99,
        category: "fiction",
        image: "https://cdn.pixabay.com/photo/2016/09/10/17/18/book-1659717_1280.jpg",
        thumbnail: "https://cdn.pixabay.com/photo/2016/09/10/17/18/book-1659717_640.jpg",
        description: "George Orwell's dystopian masterpiece"
    },
    {
        id: 6,
        name: "Think and Grow Rich",
        price: 18.99,
        category: "non-fiction",
        image: "https://cdn.pixabay.com/photo/2015/11/19/21/11/book-1052010_1280.jpg",
        thumbnail: "https://cdn.pixabay.com/photo/2015/11/19/21/11/book-1052010_640.jpg",
        description: "Napoleon Hill's success principles"
    }
];

class ProductManager {
    constructor() {
        this.products = books;
        this.filteredProducts = [...this.products];
        this.currentPage = 1;
        this.itemsPerPage = 6;
        this.cartManager = new CartManager();
        
        this.setupEventListeners();
        this.setupFilters();
        this.setupPagination();
        this.renderProducts();
    }

    filterProducts() {
        const category = document.getElementById('categoryFilter').value;
        const searchQuery = document.getElementById('searchInput').value.toLowerCase();
        const sortBy = document.getElementById('sortFilter').value;

        this.filteredProducts = this.products.filter(product => {
            const matchesCategory = !category || product.category === category;
            const matchesSearch = !searchQuery || 
                product.name.toLowerCase().includes(searchQuery) || 
                product.description.toLowerCase().includes(searchQuery);
            return matchesCategory && matchesSearch;
        });

        // Sort products
        this.filteredProducts.sort((a, b) => {
            switch(sortBy) {
                case 'price-low':
                    return a.price - b.price;
                case 'price-high':
                    return b.price - a.price;
                case 'name':
                    return a.name.localeCompare(b.name);
                default: // newest
                    return b.id - a.id;
            }
        });

        this.currentPage = 1;
        this.renderProducts();
        this.updatePagination();
    }

    getProductCard = (product) => {
        // Sanitize product data
        const sanitizedProduct = {
            id: Number(product.id),
            name: this.escapeHtml(product.name),
            description: this.escapeHtml(product.description),
            price: Number(product.price),
            image: this.escapeHtml(product.image),
            category: this.escapeHtml(product.category)
        };

        return `
            <article class="product-card fade-in" data-product-id="${sanitizedProduct.id}">
                <div class="product-image-container">
                    <img 
                        src="${sanitizedProduct.image}" 
                        alt="${sanitizedProduct.name}" 
                        class="product-image"
                        loading="lazy"
                        onerror="this.onerror=null; this.src='images/placeholder-book.jpg';"
                    >
                    <div class="product-category-badge">${sanitizedProduct.category}</div>
                </div>
                <div class="product-info">
                    <h3 class="product-title">${sanitizedProduct.name}</h3>
                    <p class="description">${sanitizedProduct.description}</p>
                    <p class="price" aria-label="Price: $${sanitizedProduct.price.toFixed(2)}">
                        $${sanitizedProduct.price.toFixed(2)}
                    </p>
                    <button 
                        class="btn btn-secondary add-to-cart" 
                        data-product-id="${sanitizedProduct.id}"
                        aria-label="Add ${sanitizedProduct.name} to cart"
                    >
                        <i class="fas fa-cart-plus" aria-hidden="true"></i>
                        Add to Cart
                    </button>
                </div>
            </article>
        `;
    }

    escapeHtml(unsafe) {
        if (typeof unsafe !== 'string') return '';
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    }

    renderProducts = () => {
        const grid = document.getElementById('productGrid');
        const productsContainer = document.getElementById('productsContainer');
        const loadingState = document.getElementById('loadingState');
        const errorState = document.getElementById('errorState');
        const emptyState = document.getElementById('emptyState');
        
        if (!grid || !productsContainer) return;

        // Show loading state
        this.setVisibility({ loading: true, error: false, empty: false });
        
        try {
            const startIndex = (this.currentPage - 1) * this.itemsPerPage;
            const endIndex = startIndex + this.itemsPerPage;
            const pageProducts = this.filteredProducts.slice(startIndex, endIndex);

            // Handle empty results
            if (this.filteredProducts.length === 0) {
                this.setVisibility({ loading: false, error: false, empty: true });
                return;
            }

            productsContainer.innerHTML = pageProducts.map(product => this.getProductCard(product)).join('');
            this.updatePaginationInfo();
            this.setVisibility({ loading: false, error: false, empty: false });
        } catch (error) {
            console.error('Error rendering products:', error);
            this.setVisibility({ loading: false, error: true, empty: false });
        }
    }

    setupFilters = () => {
        ['categoryFilter', 'searchInput', 'sortFilter'].forEach(id => {
            document.getElementById(id)?.addEventListener('change', () => this.filterProducts());
        });

        document.getElementById('searchInput')?.addEventListener('input', 
            debounce(() => this.filterProducts(), 300)
        );
    }

    setupPagination = () => {
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

    updatePagination = () => {
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

    updatePaginationInfo = () => {
        const info = document.getElementById('paginationInfo');
        if (!info) return;

        const startIndex = (this.currentPage - 1) * this.itemsPerPage + 1;
        const endIndex = Math.min(startIndex + this.itemsPerPage - 1, this.filteredProducts.length);
        const total = this.filteredProducts.length;

        info.textContent = `Showing products ${startIndex}-${endIndex} of ${total}`;
    }

    setVisibility = ({ loading, error, empty }) => {
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

    resetFilters = () => {
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

    setupEventListeners = () => {
        // Delegate event handling for add to cart buttons
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

// Debounce helper function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export the ProductManager class
export { ProductManager };

// Initialize Products when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.productManager = new ProductManager();
});
