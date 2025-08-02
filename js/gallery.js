// Book data
const books = [
    {
        id: 1,
        name: "The Great Gatsby",
        price: 19.99,
        category: "fiction",
        image: "/images/books/great-gatsby.webp",
        thumbnail: "/images/books/thumbnails/great-gatsby.webp",
        description: "A classic novel by F. Scott Fitzgerald"
    },
    {
        id: 2,
        name: "Sapiens",
        price: 24.99,
        category: "non-fiction",
        image: "https://via.placeholder.com/300x400/2E4057/ffffff?text=Sapiens",
        description: "A brief history of humankind"
    },
    {
        id: 3,
        name: "The Cat in the Hat",
        price: 14.99,
        category: "children",
        image: "https://via.placeholder.com/300x400/2E4057/ffffff?text=Cat+in+the+Hat",
        description: "Dr. Seuss classic children's book"
    },
    {
        id: 4,
        name: "Milk and Honey",
        price: 16.99,
        category: "poetry",
        image: "https://via.placeholder.com/300x400/2E4057/ffffff?text=Milk+and+Honey",
        description: "Modern poetry collection"
    },
    {
        id: 5,
        name: "1984",
        price: 21.99,
        category: "fiction",
        image: "https://via.placeholder.com/300x400/2E4057/ffffff?text=1984",
        description: "George Orwell's dystopian masterpiece"
    },
    {
        id: 6,
        name: "Think and Grow Rich",
        price: 18.99,
        category: "non-fiction",
        image: "https://via.placeholder.com/300x400/2E4057/ffffff?text=Think+and+Grow+Rich",
        description: "Napoleon Hill's success principles"
    }
];

class ProductManager {
    constructor() {
        this.products = books;
        this.filteredProducts = [...this.products];
        this.currentPage = 1;
        this.itemsPerPage = 6;
        this.renderProducts();
        this.setupFilters();
        this.setupPagination();
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

    getProductCard(product) {
        return `
            <div class="product-card fade-in">
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="description">${product.description}</p>
                    <p class="price">$${product.price.toFixed(2)}</p>
                    <button class="btn btn-secondary add-to-cart" 
                            onclick="window.cart.addItem({
                                id: ${product.id},
                                name: '${product.name.replace("'", "\\'")}',
                                price: ${product.price},
                                image: '${product.image}'
                            })">
                        Add to Cart
                    </button>
                </div>
            </div>
        `;
    }

    renderProducts() {
        const grid = document.getElementById('productGrid');
        if (!grid) return;

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageProducts = this.filteredProducts.slice(startIndex, endIndex);

        grid.innerHTML = pageProducts.map(product => this.getProductCard(product)).join('');
    }

    setupFilters() {
        ['categoryFilter', 'searchInput', 'sortFilter'].forEach(id => {
            document.getElementById(id)?.addEventListener('change', () => this.filterProducts());
        });

        document.getElementById('searchInput')?.addEventListener('input', 
            debounce(() => this.filterProducts(), 300)
        );
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

    updatePagination() {
        const pageNumbers = document.querySelector('.page-numbers');
        if (!pageNumbers) return;

        const totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
        let paginationHTML = '';

        for (let i = 1; i <= totalPages; i++) {
            paginationHTML += `
                <button class="btn ${i === this.currentPage ? 'active' : ''}">${i}</button>
            `;
        }

        pageNumbers.innerHTML = paginationHTML;
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

// Initialize Products when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ProductManager();
});
