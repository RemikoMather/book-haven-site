document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.querySelector('.search-form');
    const categorySelect = document.getElementById('category');
    const sortSelect = document.getElementById('sort');
    const bookGrid = document.querySelector('.book-grid');
    const pagination = document.querySelector('.pagination');

    let currentPage = 1;
    let currentCategory = '';
    let currentSort = 'newest';
    let currentSearch = '';

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

    // Initial load
    fetchBooks();
});
