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
async function processOrder() {
    const cart = cartManager.getCart();
    if (cart.length === 0) {
        showAlert('Your cart is empty!')
        return
    }
    // Here you would typically integrate with a payment processor
    showAlert('Order processed successfully!')
    cartManager.clearCart();
}

// Newsletter subscription
async function subscribeToNewsletter(email) {
    try {
        const { data, error } = await supabase
            .from('subscriptions')
            .insert([{ email: email }])
        
        if (error) throw error
        showAlert('Thank you for subscribing!')
    } catch (error) {
        showAlert('Error subscribing. Please try again.')
        console.error('Error:', error)
    }
}

// Contact form
async function submitContactForm(formData) {
    try {
        const { data, error } = await supabase
            .from('contact_messages')
            .insert([{
                name: formData.name,
                email: formData.email,
                message: formData.message
            }])
        
        if (error) throw error
        showAlert('Thank you for your message!')
    } catch (error) {
        showAlert('Error sending message. Please try again.')
        console.error('Error:', error)
    }
}

// Custom orders
function saveCustomOrder(orderDetails) {
    localStore.set('customOrder', orderDetails)
    showAlert('Custom order details saved!')
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
        subscribeForm.addEventListener('submit', (e) => {
            e.preventDefault()
            const email = e.target.email.value
            subscribeToNewsletter(email)
        })
    }
    
    const contactForm = document.getElementById('contact-form')
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault()
            const formData = {
                name: e.target.name.value,
                email: e.target.email.value,
                message: e.target.message.value
            }
            submitContactForm(formData)
        })
    }
})
