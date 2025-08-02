// Utility Functions
function showAlert(message, duration = 3000) {
    const alert = document.createElement('div');
    alert.className = 'wireframe-alert';
    alert.textContent = message;
    document.body.appendChild(alert);
    
    // Show alert with animation
    setTimeout(() => alert.classList.add('show'), 10);
    
    // Remove alert after duration
    setTimeout(() => {
        alert.classList.remove('show');
        setTimeout(() => alert.remove(), 300);
    }, duration);
}

// Cart Functionality
let cartItems = [];

function updateCartCount() {
    const cartCount = document.querySelector('.wireframe-cart-count');
    if (cartCount) {
        cartCount.textContent = `Cart (${cartItems.length})`;
    }
}

function addToCart(productName) {
    cartItems.push(productName);
    updateCartCount();
    showAlert(`Added "${productName}" to cart`);
}

function clearCart() {
    cartItems = [];
    updateCartCount();
    showAlert('Cart cleared');
}

function processOrder() {
    if (cartItems.length === 0) {
        showAlert('Cart is empty');
        return;
    }
    showAlert(`Processing order for ${cartItems.length} items`);
    clearCart();
}

// Newsletter Subscription
function handleNewsletterSubmit(event) {
    event.preventDefault();
    const email = event.target.querySelector('input[type="email"]').value;
    if (email) {
        showAlert('Thank you for subscribing!');
        event.target.reset();
    }
}

// Contact Form
function handleContactSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const name = formData.get('name');
    showAlert(`Thank you for your message, ${name}! We'll get back to you soon.`);
    event.target.reset();
}

// Event Handlers
document.addEventListener('DOMContentLoaded', () => {
    // Newsletter Form
    const newsletterForm = document.querySelector('.wireframe-newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterSubmit);
    }

    // Contact Form
    const contactForm = document.querySelector('.wireframe-contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }

    // Add to Cart Buttons
    const addToCartButtons = document.querySelectorAll('.wireframe-add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const product = e.target.closest('.wireframe-product');
            const productName = product.querySelector('.wireframe-text').textContent;
            addToCart(productName);
        });
    });

    // Cart Controls
    const clearCartButton = document.querySelector('.wireframe-clear-cart');
    if (clearCartButton) {
        clearCartButton.addEventListener('click', clearCart);
    }

    const processOrderButton = document.querySelector('.wireframe-process-order');
    if (processOrderButton) {
        processOrderButton.addEventListener('click', processOrder);
    }

    // Initialize cart count
    const cartCountElement = document.createElement('div');
    cartCountElement.className = 'wireframe-cart-count';
    document.body.appendChild(cartCountElement);
    updateCartCount();
});
