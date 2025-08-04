// Simple test gallery implementation
class GalleryTest {
    constructor() {
        this.products = [];
        this.productsContainer = document.getElementById('productsContainer');
        this.loadingState = document.getElementById('loadingState');
        this.errorState = document.getElementById('errorState');
        this.emptyState = document.getElementById('emptyState');
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

    showError() {
        console.log('DEBUG: Showing error state');
        this.loadingState?.setAttribute('hidden', 'true');
        this.errorState?.removeAttribute('hidden');
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

    async loadMockProducts() {
        return [
            {
                id: 1,
                name: "Test Book 1",
                author: "Author 1",
                description: "Description 1",
                price: 9.99,
                image: "https://cdn.pixabay.com/photo/2019/01/30/08/30/book-3964050_640.jpg"
            },
            {
                id: 2,
                name: "Test Book 2",
                author: "Author 2",
                description: "Description 2",
                price: 14.99,
                image: "https://cdn.pixabay.com/photo/2019/01/30/08/30/book-3964050_640.jpg"
            }
        ];
    }

    renderProducts() {
        console.log('DEBUG: Rendering products:', this.products);
        if (!this.productsContainer) {
            console.error('DEBUG: Products container not found');
            return;
        }

        const productsHtml = this.products.map(product => `
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

        this.productsContainer.innerHTML = productsHtml;
    }

    async init() {
        try {
            console.log('DEBUG: Gallery test initialization started');
            this.showLoading();
            
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            this.products = await this.loadMockProducts();
            console.log('DEBUG: Mock products loaded:', this.products);
            
            if (!this.products || this.products.length === 0) {
                console.log('DEBUG: No products found');
                this.showError();
                return;
            }
            
            this.renderProducts();
            this.showProducts();
            console.log('DEBUG: Gallery test initialization complete');
        } catch (error) {
            console.error('DEBUG: Gallery initialization failed:', error);
            this.showError();
        }
    }
}

// Initialize when the document is ready
function initGallery() {
    console.log('DEBUG: Starting gallery test initialization');
    const gallery = new GalleryTest();
    gallery.init().catch(error => {
        console.error('DEBUG: Fatal error during gallery initialization:', error);
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGallery);
} else {
    initGallery();
}
