import { StorageManager } from './storage-manager.js';
import { CartManager } from './cart-manager.js';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client
const SUPABASE_URL = 'https://qeoyopgtolnmtdaahdvn.supabase.co'
const SUPABASE_ANON_KEY = process.env.SUPABASE_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Initialize storage and cart managers
export const localStore = new StorageManager('local');
export const sessionStore = new StorageManager('session');
export const cartManager = new CartManager();

// Process order using cart manager
export async function processOrder() {
    try {
        const cart = cartManager.getCart();
        if (cart.length === 0) {
            showAlert('Your cart is empty!')
            return
        }
        // Calculate total
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Here you would typically integrate with a payment processor
        // Simulating payment process
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        showAlert('Order processed successfully!')
        cartManager.clearCart();
        return true;
    } catch (error) {
        console.error('Order processing failed:', error)
        showAlert('Failed to process order. Please try again.')
        return false;
    }
}

// Newsletter subscription
export async function subscribeToNewsletter(email) {
    if (!email || !email.includes('@')) {
        throw new Error('Invalid email address');
    }

    const { data, error } = await supabase
        .from('subscriptions')
        .insert([{ 
            email,
            subscribed_at: new Date().toISOString()
        }]);
    
    if (error) {
        console.error('Subscription error:', error);
        throw new Error('Failed to subscribe');
    }

    showAlert('Thank you for subscribing!');
    return data;
}

// Contact form
export async function submitContactForm(formData) {
    // Validate form data
    if (!formData.name || !formData.email || !formData.message) {
        throw new Error('All fields are required');
    }

    if (!formData.email.includes('@')) {
        throw new Error('Invalid email address');
    }

    const { data, error } = await supabase
        .from('contact_messages')
        .insert([{
            name: formData.name,
            email: formData.email,
            message: formData.message,
            submitted_at: new Date().toISOString()
        }]);
    
    if (error) {
        console.error('Contact form error:', error);
        throw new Error('Failed to send message');
    }

    showAlert('Thank you for your message!');
    return data;
}

// Custom orders
export function saveCustomOrder(orderDetails) {
    try {
        // Validate order details
        if (!orderDetails || typeof orderDetails !== 'object') {
            throw new Error('Invalid order details');
        }

        const requiredFields = ['title', 'description', 'email'];
        for (const field of requiredFields) {
            if (!orderDetails[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }

        // Add timestamp and format data
        const customOrder = {
            ...orderDetails,
            saved_at: new Date().toISOString(),
            status: 'pending'
        };

        localStore.set('customOrder', customOrder);
        showAlert('Custom order details saved!');
        return true;
    } catch (error) {
        console.error('Failed to save custom order:', error);
        showAlert('Failed to save custom order. Please try again.');
        return false;
    }
}

// Utility functions
function showAlert(message) {
    const alert = document.createElement('div')
    alert.className = 'alert'
    alert.textContent = message
    document.body.appendChild(alert)
    
    setTimeout(() => {
        alert.remove()
    }, 3000)
}

// Cart UI management
function setupCartUI() {
    const cartToggle = document.querySelector('.cart-toggle');
    const cartDropdown = document.querySelector('.cart-dropdown');
    
    if (cartToggle && cartDropdown) {
        cartToggle.addEventListener('click', () => {
            cartDropdown.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!cartToggle.contains(e.target) && !cartDropdown.contains(e.target)) {
                cartDropdown.classList.remove('active');
            }
        });
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Setup cart UI
    setupCartUI();
    
    // Setup event listeners
    const subscribeForm = document.getElementById('subscribe-form')
    if (subscribeForm) {
        subscribeForm.addEventListener('submit', async (e) => {
            e.preventDefault()
            const emailInput = e.target.email
            try {
                await subscribeToNewsletter(emailInput.value)
                e.target.reset()
            } catch (error) {
                console.error('Newsletter subscription failed:', error)
            }
        })
    }
    
    const contactForm = document.getElementById('contact-form')
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault()
            const formData = {
                name: e.target.name.value,
                email: e.target.email.value,
                message: e.target.message.value
            }
            try {
                await submitContactForm(formData)
                e.target.reset()
            } catch (error) {
                console.error('Contact form submission failed:', error)
            }
        })
    }
})
