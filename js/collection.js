document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.querySelector('.search-form');
    const categorySelect = document.getElementById('category');
    const sortSelect = document.getElementById('sort');
    const bookGrid = document.querySelector('.book-grid');
    const pagination = document.querySelector('.pagination');
    const modal = document.getElementById('book-modal');

    let currentPage = 1;
    let currentCategory = '';
    let currentSort = 'newest';
    let currentSearch = '';
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

    async function fetchBooks(page = 1) {
        const params = new URLSearchParams({
            page,
            category: currentCategory,
            sort: currentSort,
            search: currentSearch
        });

        try {
            // Replace with your actual API endpoint
            const response = await fetch(`/api/books?${params}`);
            const data = await response.json();
            renderBooks(data.books);
            updatePagination(data.totalPages);
        } catch (error) {
            console.error('Error fetching books:', error);
            bookGrid.innerHTML = '<p class="error-message">Failed to load books. Please try again later.</p>';
        }
    }

    function renderBooks(books) {
        bookGrid.innerHTML = books.map(book => `
            <article class="book-card">
                <img src="${book.coverImage}" 
                     alt="Cover of ${book.title}" 
                     loading="lazy"
                     onerror="this.src='images/placeholder-cover.jpg'">
                <div class="book-info">
                    <h2>${book.title}</h2>
                    <p class="author">By ${book.author}</p>
                    <p class="category">${book.category}</p>
                    <p class="status ${book.inStock ? 'available' : 'unavailable'}">
                        ${book.inStock ? 'In Stock' : 'Out of Stock'}
                    </p>
                    <a href="/book/${book.id}" class="btn btn-secondary">More Details</a>
                </div>
                <button class="quick-view-btn" data-book-id="${book.id}">Quick View</button>
                <button class="wishlist-btn" data-book-id="${book.id}">
                    <span class="heart-icon">${wishlist.includes(book.id) ? '♥' : '♡'}</span>
                </button>
                <button class="add-to-cart" data-book-id="${book.id}">Add to Cart</button>
            </article>
        `).join('');
    }

    // Event Listeners
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        currentSearch = document.getElementById('search').value;
        currentPage = 1;
        fetchBooks();
    });

    categorySelect.addEventListener('change', () => {
        currentCategory = categorySelect.value;
        currentPage = 1;
        fetchBooks();
    });

    sortSelect.addEventListener('change', () => {
        currentSort = sortSelect.value;
        fetchBooks();
    });

    pagination.addEventListener('click', (e) => {
        if (e.target.classList.contains('prev') && !e.target.disabled) {
            currentPage--;
            fetchBooks(currentPage);
        } else if (e.target.classList.contains('next') && !e.target.disabled) {
            currentPage++;
            fetchBooks(currentPage);
        }
    });

    bookGrid.addEventListener('click', (e) => {
        const quickViewBtn = e.target.closest('.quick-view-btn, .quick-view');
        const wishlistBtn = e.target.closest('.wishlist-btn');
        const addToCartBtn = e.target.closest('.add-to-cart');

        if (quickViewBtn) {
            const bookId = quickViewBtn.dataset.bookId;
            openQuickView(bookId);
        } else if (wishlistBtn) {
            toggleWishlist(wishlistBtn.dataset.bookId);
        } else if (addToCartBtn) {
            addToCart(addToCartBtn.dataset.bookId);
        }
    });

    async function openQuickView(bookId) {
        try {
            const book = await fetchBookDetails(bookId);
            updateModalContent(book);
            modal.classList.add('active');
            modal.setAttribute('aria-hidden', 'false');
        } catch (error) {
            console.error('Error loading book details:', error);
        }
    }

    function updateWishlistUI() {
        document.querySelectorAll('.wishlist-btn').forEach(btn => {
            const bookId = btn.dataset.bookId;
            const isWishlisted = wishlist.includes(bookId);
            btn.classList.toggle('active', isWishlisted);
            btn.querySelector('.heart-icon').textContent = isWishlisted ? '♥' : '♡';
        });
    }

    function toggleWishlist(bookId) {
        const index = wishlist.indexOf(bookId);
        if (index === -1) {
            wishlist.push(bookId);
        } else {
            wishlist.splice(index, 1);
        }
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        updateWishlistUI();
    }

    // Add to cart functionality
    function addToCart(bookId) {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart.push(bookId);
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Show confirmation message
        showToast('Book added to cart!');
    }

    // Close modal when clicking outside or on close button
    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.classList.contains('modal-close')) {
            modal.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');
        }
    });

    // Initial load
    fetchBooks();
});
