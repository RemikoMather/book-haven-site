// Initialize gallery after DOM content is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded');
    
    // Add error handlers for all error states
    window.onerror = function(msg, url, lineNo, columnNo, error) {
        console.error('Global error:', { msg, url, lineNo, columnNo, error });
        return false;
    };

    // Check if SimpleGallery is loaded
    if (typeof SimpleGallery === 'undefined') {
        console.error('SimpleGallery class not loaded. Please check script loading order.');
        document.getElementById('errorState').hidden = false;
        return;
    }
    
    try {
        // Initialize the gallery
        window.gallery = new SimpleGallery();
        console.log('Gallery initialized successfully');
        
        // Show loading state
        const loadingState = document.getElementById('loadingState');
        if (loadingState) loadingState.hidden = false;
        
        // Hide loading state after gallery is initialized
        setTimeout(() => {
            if (loadingState) loadingState.hidden = true;
        }, 1000);
    } catch (error) {
        console.error('Failed to initialize gallery:', error);
        const errorState = document.getElementById('errorState');
        if (errorState) errorState.hidden = false;
    }
});
