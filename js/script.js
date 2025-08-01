import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

// Cart Management
class ShoppingCart {
    constructor() {
        this.items = JSON.parse(sessionStorage.getItem('cart')) || [];
    }

    addItem(book) {
        this.items.push(book);
        this.saveCart();
        return 'Item added to cart';
    }

    removeItem(bookId) {
        this.items = this.items.filter(item => item.id !== bookId);
        this.saveCart();
    }

    clearCart() {
        this.items = [];
        this.saveCart();
    }

    saveCart() {
        sessionStorage.setItem('cart', JSON.stringify(this.items));
    }

    getTotal() {
        return this.items.reduce((total, item) => total + item.price, 0).toFixed(2);
    }
}

// Initialize cart
const cart = new ShoppingCart();

// Newsletter subscription
async function handleSubscribe(event) {
    event.preventDefault();
    const emailInput = document.getElementById('subscribeEmail');
    const email = emailInput.value.trim();
    
    if (!validateEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }

    try {
        const { error } = await supabase
            .from('subscriptions')
            .insert([{ email, subscribed_at: new Date() }]);
            
        if (error) throw error;
        
        showNotification('Thank you for subscribing!', 'success');
        emailInput.value = '';
    } catch (error) {
        console.error('Error:', error);
        showNotification('Something went wrong. Please try again.', 'error');
    }
}

// Contact form handling
async function handleContact(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const contactData = Object.fromEntries(formData);

    if (!validateContactForm(contactData)) {
        showNotification('Please fill all required fields', 'error');
        return;
    }

    try {
        const { error } = await supabase
            .from('contact_messages')
            .insert([{ ...contactData, submitted_at: new Date() }]);

        if (error) throw error;

        showNotification('Thank you for your message!', 'success');
        form.reset();
    } catch (error) {
        console.error('Error:', error);
        showNotification('Failed to send message. Please try again.', 'error');
    }
}

// Staff picks storage
function saveStaffPick(pick) {
    const staffPicks = JSON.parse(localStorage.getItem('staffPicks')) || [];
    staffPicks.push({ ...pick, timestamp: new Date() });
    localStorage.setItem('staffPicks', JSON.stringify(staffPicks));
}

// Utility functions
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateContactForm(data) {
    return data.name && data.email && data.message && validateEmail(data.email);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Subscribe form
    const subscribeForm = document.getElementById('subscribeForm');
    if (subscribeForm) {
        subscribeForm.addEventListener('submit', handleSubscribe);
    }

    // Contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContact);
    }

    // Cart buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            const bookId = e.target.dataset.bookId;
            const book = {
                id: bookId,
                title: e.target.dataset.title,
                price: parseFloat(e.target.dataset.price)
            };
            showNotification(cart.addItem(book), 'success');
        });
    });
});

// Export functions for use in other files
export {
    cart,
    handleSubscribe,
    handleContact,
    saveStaffPick,
    showNotification
};