// Initialize cart functionality
document.addEventListener('DOMContentLoaded', () => {
    // Initialize cart
    const cartManager = new CartManager();
    window.cartManager = cartManager;  // Make it globally available

    // Add event listeners to all "Add to Cart" buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', handleAddToCart);
    });
});

/**
 * Handle click events on "Add to Cart" buttons
 * @param {Event} e - Click event
 */
function handleAddToCart(e) {
    const card = e.target.closest('.gallery-item');
    if (!card) return;
    
    const bookData = {
        id: card.dataset.id,
        title: card.querySelector('h3').textContent,
        price: parseFloat(card.dataset.price || '0'),
        image: card.querySelector('img').src
    };

    if (bookData.id && bookData.title && bookData.price) {
        window.cartManager.addItem(bookData);
    }
}
