import { SimpleGallery } from './gallery-simple.js';

// Wait for DOM and ensure error state is hidden
document.addEventListener('DOMContentLoaded', () => {
    console.log('DEBUG: DOM fully loaded, initializing page');
    
    // Get all state elements
    const states = {
        error: document.getElementById('errorState'),
        loading: document.getElementById('loadingState'),
        products: document.getElementById('productsContainer'),
        empty: document.getElementById('emptyState')
    };
    
    // Log initial state
    console.log('DEBUG: Initial states:', {
        errorExists: !!states.error,
        loadingExists: !!states.loading,
        productsExists: !!states.products,
        emptyExists: !!states.empty,
        errorHidden: states.error?.hasAttribute('hidden'),
        loadingHidden: states.loading?.hasAttribute('hidden')
    });
    
    // Hide all states initially
    states.error?.setAttribute('hidden', 'true');
    states.loading?.setAttribute('hidden', 'true');
    states.empty?.setAttribute('hidden', 'true');
    if (states.products) {
        states.products.style.display = 'none';
    }
    
    // Log state after hiding
    console.log('DEBUG: States after hiding:', {
        errorHidden: states.error?.hasAttribute('hidden'),
        loadingHidden: states.loading?.hasAttribute('hidden')
    });
    
    // Initialize gallery
    try {
    if (errorState) {
        errorState.setAttribute('hidden', 'true');
    }
    
        const gallery = new SimpleGallery();
        gallery.init().then(() => {
            console.log('DEBUG: Gallery initialized successfully');
            // Verify states after successful initialization
            console.log('DEBUG: Final states:', {
                errorHidden: states.error?.hasAttribute('hidden'),
                loadingHidden: states.loading?.hasAttribute('hidden'),
                productsDisplay: states.products?.style.display
            });
        }).catch(error => {
            console.error('DEBUG: Failed to initialize gallery:', error);
            states.loading?.setAttribute('hidden', 'true');
            states.error?.removeAttribute('hidden');
            // Log error state
            console.log('DEBUG: Error state after failure:', {
                errorHidden: states.error?.hasAttribute('hidden'),
                loadingHidden: states.loading?.hasAttribute('hidden')
            });
        });
    } catch (error) {
        console.error('DEBUG: Error creating gallery:', error);
        states.loading?.setAttribute('hidden', 'true');
        states.error?.removeAttribute('hidden');
        // Log error state
        console.log('DEBUG: Error state after creation failure:', {
            errorHidden: states.error?.hasAttribute('hidden'),
            loadingHidden: states.loading?.hasAttribute('hidden')
        });
    }
});
});
