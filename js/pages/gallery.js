// Book Gallery with enhanced functionality
const BookGallery = {
    page: 1,
    pageSize: 12,
    books: [],
    filters: {
        search: '',
        category: '',
        price: '',
        sort: 'title'
    },

    async init() {
        this.setupEventListeners();
        await this.loadBooks();
        await this.loadCategories();
    },

    setupEventListeners() {
        // Search with debounce
        let searchTimeout;
        document.getElementById('book-search').addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.filters.search = e.target.value;
                this.refreshGallery();
            }, 300);
        });

        // Filters
        ['category', 'price', 'sort'].forEach(filter => {
            document.getElementById(`${filter}-filter`).addEventListener('change', (e) => {
                this.filters[filter] = e.target.value;
                this.refreshGallery();
            });
        });

        // Keyboard navigation
        document.addEventListener('keydown', this.handleKeyboardNavigation.bind(this));
    },

    async loadBooks() {
        try {
            const response = await BookHavenAPI.books.getAll({
                page: this.page,
                pageSize: this.pageSize,
                ...this.filters
            });

            this.books = this.page === 1 ? response.books : [...this.books, ...response.books];
            this.renderBooks();

            // Update load more button
            const loadMore = document.querySelector('.load-more');
            loadMore.hidden = !response.hasMore;
        } catch (error) {
            console.error('Error loading books:', error);
            this.showError('Failed to load books. Please try again later.');
        }
    },

    async loadCategories() {
        try {
            const categories = await BookHavenAPI.books.getCategories();
            const filter = document.getElementById('category-filter');
            
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                filter.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    },

    renderBooks() {
        const grid = document.getElementById('book-grid');
        const template = document.getElementById('book-card-template');

        if (this.page === 1) {
            grid.innerHTML = '';
        }

        this.books.forEach(book => {
            const card = template.content.cloneNode(true);
            
            // Set book data
            card.querySelector('img').src = book.image_url;
            card.querySelector('img').alt = book.title;
            card.querySelector('.book-title').textContent = book.title;
            card.querySelector('.book-author').textContent = `by ${book.author}`;
            card.querySelector('.book-price').textContent = `$${book.price.toFixed(2)}`;
            
            // Set up ratings
            if (book.average_rating) {
                card.querySelector('.book-rating').innerHTML = 
                    `${'★'.repeat(Math.round(book.average_rating))}${'☆'.repeat(5 - Math.round(book.average_rating))}`;
            }

            // Set up buttons
            card.querySelector('.view-details').onclick = () => this.showBookDetails(book);
            card.querySelector('.add-to-cart').onclick = (e) => {
                e.stopPropagation();
                CartManager.addItem(book);
            };

            grid.appendChild(card);
        });
    },

    async showBookDetails(book) {
        const template = document.getElementById('book-details-template');
        const content = template.content.cloneNode(true);

        // Fill book details
        content.querySelector('img').src = book.image_url;
        content.querySelector('.book-title').textContent = book.title;
        content.querySelector('.book-author').textContent = `by ${book.author}`;
        content.querySelector('.book-price').textContent = `$${book.price.toFixed(2)}`;
        content.querySelector('.book-description').textContent = book.description;
        content.querySelector('.book-isbn').textContent = `ISBN: ${book.isbn}`;
        content.querySelector('.book-category').textContent = `Category: ${book.category}`;
        content.querySelector('.book-stock').textContent = 
            `${book.stock_quantity} copies available`;

        // Set up add to cart
        const quantityInput = content.querySelector('.quantity-selector input');
        content.querySelector('.add-to-cart').onclick = () => {
            CartManager.addItem({
                ...book,
                quantity: parseInt(quantityInput.value)
            });
        };

        // Load and display reviews
        try {
            const reviews = await BookHavenAPI.books.getReviews(book.id);
            this.renderReviews(content, reviews);
        } catch (error) {
            console.error('Error loading reviews:', error);
        }

        // Set up review form
        const form = content.querySelector('.review-form');
        form.querySelector('[name="bookId"]').value = book.id;

        BookHaven.showModal({
            title: 'Book Details',
            content: content
        });
    },

    renderReviews(content, reviews) {
        const reviewsList = content.querySelector('.reviews-list');
        const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

        // Update average rating
        content.querySelector('.average-rating').innerHTML = `
            <div class="rating-number">${averageRating.toFixed(1)}</div>
            <div class="rating-stars">
                ${'★'.repeat(Math.round(averageRating))}${'☆'.repeat(5 - Math.round(averageRating))}
            </div>
            <div class="rating-count">${reviews.length} reviews</div>
        `;

        // Render rating distribution
        const ratingCounts = Array(5).fill(0);
        reviews.forEach(r => ratingCounts[r.rating - 1]++);
        
        content.querySelector('.rating-bars').innerHTML = ratingCounts
            .map((count, i) => {
                const percentage = (count / reviews.length) * 100;
                return `
                    <div class="rating-bar">
                        <span>${5 - i} ★</span>
                        <div class="bar">
                            <div class="fill" style="width: ${percentage}%"></div>
                        </div>
                        <span>${count}</span>
                    </div>
                `;
            })
            .join('');

        // Render review list
        reviewsList.innerHTML = reviews.length ? reviews.map(review => `
            <div class="review">
                <div class="review-header">
                    <div class="review-rating">
                        ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
                    </div>
                    <div class="review-date">
                        ${new Date(review.created_at).toLocaleDateString()}
                    </div>
                </div>
                <p class="review-comment">${review.comment}</p>
            </div>
        `).join('') : '<p>No reviews yet. Be the first to review!</p>';
    },

    handleKeyboardNavigation(e) {
        const modal = document.querySelector('.modal');
        if (!modal) return;

        if (e.key === 'Escape') {
            BookHaven.closeModal(modal);
        }
    },

    refreshGallery() {
        this.page = 1;
        this.loadBooks();
    },

    loadMore() {
        this.page++;
        this.loadBooks();
    },

    showError(message) {
        const grid = document.getElementById('book-grid');
        grid.innerHTML = `
            <div class="error-message">
                <p>${message}</p>
                <button class="btn" onclick="BookGallery.refreshGallery()">Try Again</button>
            </div>
        `;
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => BookGallery.init());
