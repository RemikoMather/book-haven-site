// Utility function for showing alerts
function showAlert(message) {
    const alert = document.createElement('div');
    alert.className = 'alert';
    alert.textContent = message;
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.remove();
    }, 3000);
}

document.addEventListener('DOMContentLoaded', () => {
    // Gallery and lightbox elements
    const gallery = document.querySelector('.gallery-grid');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const lightbox = document.querySelector('.lightbox');
    const lightboxImg = lightbox?.querySelector('.lightbox-image');
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

    // Lightbox functionality
    function openLightbox(index) {
        currentIndex = index;
        updateLightboxContent();
        lightbox?.classList.add('active');
    }

    function updateLightboxContent() {
        if (!lightboxImg || !lightboxCaption || galleryItems.length === 0) return;
        
        const item = galleryItems[currentIndex];
        const img = item.querySelector('img');
        const caption = item.querySelector('figcaption');
        
        if (img) {
            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt;
        }
        
        if (caption) {
            lightboxCaption.textContent = caption.textContent;
        }
    }

    // Event Listeners
    if (gallery) {
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

        // Gallery click events
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

    // Cart event listeners
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

    // Lightbox event listeners
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            lightbox?.classList.remove('active');
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
            updateLightboxContent();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % galleryItems.length;
            updateLightboxContent();
        });
    }

    // Close modal when clicking outside
    if (cartModal) {
        window.addEventListener('click', (e) => {
            if (e.target === cartModal) {
                cartModal.style.display = 'none';
            }
        });
    }

    // Keyboard navigation for lightbox
    document.addEventListener('keydown', (e) => {
        if (!lightbox?.classList.contains('active')) return;
        
        switch(e.key) {
            case 'Escape': 
                lightbox.classList.remove('active');
                break;
            case 'ArrowLeft':
                prevBtn?.click();
                break;
            case 'ArrowRight':
                nextBtn?.click();
                break;
        }
    });

    // Initialize cart display
    updateCartDisplay();
});
