import { SimpleGallery } from './gallery-simple.js';

// Initialize gallery when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DEBUG: DOM content loaded');
    
    const states = {
        error: document.getElementById('errorState'),
        loading: document.getElementById('loadingState'),
        products: document.getElementById('productsContainer'),
        empty: document.getElementById('emptyState')
    };

    // Hide all states initially
    states.error?.setAttribute('hidden', 'true');
    states.loading?.setAttribute('hidden', 'true');
    states.empty?.setAttribute('hidden', 'true');
    if (states.products) {
        states.products.style.display = 'none';
    }
    
    // Show loading state
    states.loading?.removeAttribute('hidden');
    
    try {
        // Initialize gallery
        const gallery = new SimpleGallery();
        gallery.initialize();
        
        // Only show success if no error was thrown
        states.loading?.setAttribute('hidden', 'true');
        if (states.products) {
            states.products.style.display = 'grid';
        }
    } catch (error) {
        // Handle any initialization errors
        console.error('DEBUG: Error creating gallery:', error);
        states.loading?.setAttribute('hidden', 'true');
        states.error?.removeAttribute('hidden');
        return; // Exit early on error
    }
});
