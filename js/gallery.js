// Sample books data (in a real app, this would come from an API)
const books = [
    {
        id: '1',
        title: 'The Great Adventure',
        author: 'John Smith',
        price: 24.99,
        image: 'images/books/adventure1.jpg',
        category: 'fiction'
    },
    {
        id: '2',
        title: 'Mystery of the Lost Key',
        author: 'Sarah Johnson',
        price: 19.99,
        image: 'images/books/mystery1.jpg',
        category: 'mystery'
    },
    {
        id: '3',
        title: 'The Art of Cooking',
        author: 'Chef Michael Brown',
        price: 34.99,
        image: 'images/books/cooking1.jpg',
        category: 'non-fiction'
    }
];

// Create cart manager instance
const cartManager = new CartManager();

document.addEventListener('DOMContentLoaded', () => {
    // Initialize gallery
    const bookGrid = document.getElementById('book-grid');
    const searchInput = document.getElementById('book-search');
    const categoryFilter = document.getElementById('category-filter');
    const priceFilter = document.getElementById('price-filter');
    const sortFilter = document.getElementById('sort-filter');
    const cartSidebar = document.getElementById('cart-sidebar');
    const closeCartBtn = document.querySelector('.close-cart');
    
    // Listen for cart updates
    cartManager.addListener(() => {
        // Update any book cards that are in the cart
        document.querySelectorAll('.book-card').forEach(card => {
            const bookId = card.dataset.id;
            const inCart = cartManager.cart.some(item => item.id === bookId);
            card.querySelector('.add-to-cart').classList.toggle('in-cart', inCart);
        });
    });

    // Populate category filter
    const categories = [...new Set(books.map(book => book.category))];
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        categoryFilter.appendChild(option);
    });

    // Initialize book grid
    function renderBooks(booksToRender) {
        bookGrid.innerHTML = booksToRender.map(book => `
            <div class="book-card" data-id="${book.id}" data-category="${book.category}">
                <div class="book-image">
                    <img src="${book.image}" alt="${book.title}" 
                         onerror="this.src='images/placeholder.jpg'">
                    <div class="book-overlay">
                        <button class="btn btn-primary add-to-cart" 
                                data-book-id="${book.id}">
                            Add to Cart
                        </button>
                    </div>
                </div>
                <div class="book-info">
                    <h3>${book.title}</h3>
                    <p class="author">by ${book.author}</p>
                    <p class="price">$${book.price.toFixed(2)}</p>
                </div>
            </div>
        `).join('');

        // Add event listeners to Add to Cart buttons
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', (e) => {
                const bookId = e.target.dataset.bookId;
                const book = books.find(b => b.id === bookId);
                if (book) {
                    // Add loading state to button
                    const btn = e.target;
                    btn.disabled = true;
                    btn.classList.add('loading');
                    
                    // Add item to cart
                    cartManager.addItem(book);
                    
                    // Remove loading state
                    setTimeout(() => {
                        btn.disabled = false;
                        btn.classList.remove('loading');
                        btn.classList.add('in-cart');
                    }, 300);
                }
            });
        });
    }

    // Initial render
    renderBooks(books);

    // Filter and search functionality
    function filterBooks() {
        const searchTerm = searchInput.value.toLowerCase();
        const category = categoryFilter.value;
        const priceRange = priceFilter.value;
        const sortBy = sortFilter.value;

        let filtered = books.filter(book => {
            const matchesSearch = book.title.toLowerCase().includes(searchTerm) ||
                                book.author.toLowerCase().includes(searchTerm);
            const matchesCategory = !category || book.category === category;
            const matchesPrice = !priceRange || (() => {
                const [min, max] = priceRange.split('-').map(Number);
                return max ? book.price >= min && book.price <= max : book.price >= min;
            })();

            return matchesSearch && matchesCategory && matchesPrice;
        });

        // Sort books
        filtered.sort((a, b) => {
            if (sortBy === 'title') return a.title.localeCompare(b.title);
            if (sortBy === '-title') return b.title.localeCompare(a.title);
            if (sortBy === 'price') return a.price - b.price;
            if (sortBy === '-price') return b.price - a.price;
            return 0;
        });

        renderBooks(filtered);
        document.getElementById('no-results').style.display = 
            filtered.length === 0 ? 'block' : 'none';
    }

    // Event listeners
    searchInput.addEventListener('input', filterBooks);
    categoryFilter.addEventListener('change', filterBooks);
    priceFilter.addEventListener('change', filterBooks);
    sortFilter.addEventListener('change', filterBooks);

    // Cart sidebar toggle
    closeCartBtn.addEventListener('click', () => {
        cartSidebar.classList.remove('open');
    });
    const lightboxCaption = lightbox?.querySelector('.lightbox-caption');
    const closeBtn = lightbox?.querySelector('.lightbox-close');
    const prevBtn = lightbox?.querySelector('.lightbox-prev');
    const nextBtn = lightbox?.querySelector('.lightbox-next');

    // Cart elements
    const cartModal = document.getElementById('cart-modal');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const viewCartBtn = document.getElementById('view-cart');
    const clearCartBtn = document.getElementById('clear-cart');
    const processOrderBtn = document.getElementById('process-order');
    const cartCount = document.getElementById('cart-count');

    // State management
    let currentIndex = 0;
    let galleryItems = [];
    let cart = JSON.parse(sessionStorage.getItem('cart')) || [];

    // Filter functionality
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            document.querySelectorAll('.gallery-item').forEach(item => {
                if (filter === 'all' || item.dataset.category === filter) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    // Cart functionality
    function updateCartDisplay() {
        if (cartCount) {
            cartCount.textContent = cart.length.toString();
        }

        if (cartItems && cartTotal) {
            cartItems.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.title}" width="50">
                    <div class="cart-item-details">
                        <h4>${item.title}</h4>
                        <p>$${item.price.toFixed(2)}</p>
                    </div>
                    <button class="remove-item" data-id="${item.id}">×</button>
                </div>
            `).join('');

            const total = cart.reduce((sum, item) => sum + item.price, 0);
            cartTotal.textContent = `Total: $${total.toFixed(2)}`;
        }
    }

    function addToCart(bookData) {
        cart.push(bookData);
        sessionStorage.setItem('cart', JSON.stringify(cart));
        updateCartDisplay();
        showAlert('Item added to cart!');
    }

    function removeFromCart(id) {
        cart = cart.filter(item => item.id !== id);
        sessionStorage.setItem('cart', JSON.stringify(cart));
        updateCartDisplay();
        showAlert('Item removed from cart!');
    }

    function clearCart() {
        cart = [];
        sessionStorage.removeItem('cart');
        updateCartDisplay();
        showAlert('Cart cleared!');
    }

    function processOrder() {
        if (cart.length === 0) {
            showAlert('Your cart is empty!');
            return;
        }
        // Here you would typically integrate with a payment processor
        showAlert('Order processed successfully!');
        clearCart();
        if (cartModal) {
            cartModal.style.display = 'none';
        }
    }

    // Event Listeners for Gallery and Cart
    if (gallery) {
        gallery.addEventListener('click', (e) => {
            // Handle add to cart
            if (e.target.classList.contains('add-to-cart')) {
                const bookItem = e.target.closest('.gallery-item');
                const bookData = {
                    id: bookItem.dataset.id,
                    title: bookItem.querySelector('h3').textContent,
                    price: parseFloat(bookItem.dataset.price),
                    image: bookItem.querySelector('img').src
                };
                addToCart(bookData);
                return;
            }

            // Handle lightbox
            const item = e.target.closest('.gallery-item');
            if (item && !e.target.classList.contains('add-to-cart')) {
                galleryItems = Array.from(document.querySelectorAll('.gallery-item:not([style*="display: none"])'));
                const index = galleryItems.indexOf(item);
                openLightbox(index);
            }
        });
    }

    if (cartItems) {
        cartItems.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-item')) {
                const id = e.target.dataset.id;
                removeFromCart(id);
            }
        });
    }

    if (viewCartBtn && cartModal) {
        viewCartBtn.addEventListener('click', () => {
            updateCartDisplay();
            cartModal.style.display = 'block';
        });
    }

    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', clearCart);
    }

    if (processOrderBtn) {
        processOrderBtn.addEventListener('click', processOrder);
    }

    // Close modal when clicking outside
    if (cartModal) {
        window.addEventListener('click', (e) => {
            if (e.target === cartModal) {
                cartModal.style.display = 'none';
            }
        });
    }

    // Initialize cart display
    updateCartDisplay();

    // Lightbox functionality
    function openLightbox(index) {
        galleryItems = Array.from(document.querySelectorAll('.gallery-item:not([style*="display: none"])'));
        currentIndex = index;
        updateLightboxContent();
        lightbox.classList.add('active');
    }

    function updateLightboxContent() {
        const item = galleryItems[currentIndex];
        const img = item.querySelector('img');
        const caption = item.querySelector('figcaption');
        
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightboxCaption.textContent = caption.textContent;
    }

    // Lightbox event handlers are now combined with the gallery click handler above

    closeBtn.addEventListener('click', () => {
        lightbox.classList.remove('active');
    });

    prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
        updateLightboxContent();
    });

    nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % galleryItems.length;
        updateLightboxContent();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        
        switch(e.key) {
            case 'Escape': 
                lightbox.classList.remove('active');
                break;
            case 'ArrowLeft':
                prevBtn.click();
                break;
            case 'ArrowRight':
                nextBtn.click();
                break;
        }
    });
});
