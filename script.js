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
            showAlert('Your cart is empty!', 'warning');
            return { success: false, error: 'Cart is empty' };
        }

        // Calculate total with error checking
        let total = 0;
        try {
            total = cart.reduce((sum, item) => {
                if (!item.price || !item.quantity) {
                    throw new Error(`Invalid item in cart: ${JSON.stringify(item)}`);
                }
                return sum + (item.price * item.quantity);
            }, 0);
        } catch (error) {
            console.error('Error calculating total:', error);
            showAlert('Error processing cart items', 'error');
            return { success: false, error: 'Invalid cart items' };
        }
        
        // Here you would typically integrate with a payment processor
        // Simulating payment process
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Save order to local storage for reference
            const orderDetails = {
                items: cart,
                total,
                orderId: `ORD-${Date.now()}`,
                orderDate: new Date().toISOString()
            };
            localStore.set(`order_${orderDetails.orderId}`, orderDetails);
            
            showAlert('Order processed successfully!', 'success');
            cartManager.clearCart();
            return { success: true, orderId: orderDetails.orderId };
        } catch (error) {
            throw new Error('Payment processing failed');
        }
    } catch (error) {
        console.error('Order processing failed:', error);
        showAlert('Failed to process order. Please try again.', 'error');
        return { success: false, error: error.message };
    }
}

// Newsletter subscription
export async function subscribeToNewsletter(email) {
    if (!email) {
        throw new Error('Email is required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address');
    }

    try {
        // Check if already subscribed
        const { data: existing } = await supabase
            .from('subscriptions')
            .select('email')
            .eq('email', email)
            .single();

        if (existing) {
            throw new Error('This email is already subscribed');
        }

        const { data, error } = await supabase
            .from('subscriptions')
            .insert([{ 
                email,
                subscribed_at: new Date().toISOString(),
                status: 'active'
            }]);
        
        if (error) {
            throw new Error(error.message);
        }

        showAlert('Thank you for subscribing!', 'success');
        return { success: true, data };
    } catch (error) {
        console.error('Subscription error:', error);
        throw new Error(error.message || 'Failed to subscribe');
    }
}

// Contact form
export async function submitContactForm(formData) {
    // Validate form data
    const required = ['name', 'email', 'message'];
    for (const field of required) {
        if (!formData[field]?.trim()) {
            throw new Error(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
        }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        throw new Error('Please enter a valid email address');
    }

    try {
        const { data, error } = await supabase
            .from('contact_messages')
            .insert([{
                name: formData.name.trim(),
                email: formData.email.trim(),
                message: formData.message.trim(),
                submitted_at: new Date().toISOString(),
                status: 'unread'
            }]);
        
        if (error) {
            throw new Error(error.message);
        }

        showAlert('Thank you for your message!', 'success');
        return { success: true, data };
    } catch (error) {
        console.error('Contact form error:', error);
        throw new Error(error.message || 'Failed to send message');
    }
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
function showAlert(message, type = 'info') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;

    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());

    document.body.appendChild(alert);
    
    // Ensure alert is always removed
    try {
        setTimeout(() => {
            if (alert && alert.parentNode) {
                alert.remove();
            }
        }, 3000);
    } catch (error) {
        console.error('Error removing alert:', error);
    }
}

// Cart UI management with error handling
function setupCartUI() {
    try {
        const cartToggles = document.querySelectorAll('.cart-toggle');
        const cartDropdowns = document.querySelectorAll('.cart-dropdown');
        const closeButtons = document.querySelectorAll('.close-cart');
        
        cartToggles.forEach((toggle, index) => {
            const dropdown = cartDropdowns[index];
            if (toggle && dropdown) {
                toggle.addEventListener('click', (e) => {
                    e.stopPropagation();
                    cartDropdowns.forEach((d, i) => {
                        if (i !== index) d.classList.remove('active');
                    });
                    dropdown.classList.toggle('active');
                });
            }
        });

        closeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                cartDropdowns.forEach(dropdown => dropdown.classList.remove('active'));
            });
        });

        // Close cart when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-cart')) {
                cartDropdowns.forEach(dropdown => dropdown.classList.remove('active'));
            }
        });

        // Handle checkout button clicks
        document.querySelectorAll('.checkout-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                try {
                    btn.disabled = true;
                    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
                    
                    const result = await processOrder();
                    
                    if (result.success) {
                        cartDropdowns.forEach(dropdown => dropdown.classList.remove('active'));
                    }
                } catch (error) {
                    console.error('Checkout error:', error);
                    showAlert('Failed to process order. Please try again.', 'error');
                } finally {
                    btn.disabled = false;
                    btn.textContent = 'Proceed to Checkout';
                }
            });
        });
    } catch (error) {
        console.error('Error setting up cart UI:', error);
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
            e.preventDefault();
            const submitButton = e.target.querySelector('button[type="submit"]');
            const emailInput = e.target.email;

            try {
                if (submitButton) submitButton.disabled = true;
                await subscribeToNewsletter(emailInput.value);
                e.target.reset();
                showAlert('Successfully subscribed to newsletter!', 'success');
            } catch (error) {
                console.error('Newsletter subscription failed:', error);
                showAlert(error.message || 'Failed to subscribe. Please try again.', 'error');
            } finally {
                if (submitButton) submitButton.disabled = false;
            }
        });
    }
    
    const contactForm = document.getElementById('contact-form')
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitButton = e.target.querySelector('button[type="submit"]');
            const formData = {
                name: e.target.name.value,
                email: e.target.email.value,
                message: e.target.message.value
            };

            try {
                if (submitButton) submitButton.disabled = true;
                await submitContactForm(formData);
                e.target.reset();
                showAlert('Message sent successfully!', 'success');
            } catch (error) {
                console.error('Contact form submission failed:', error);
                showAlert(error.message || 'Failed to send message. Please try again.', 'error');
            } finally {
                if (submitButton) submitButton.disabled = false;
            }
        });
    }
})
