// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');
    
    try {
        // Initialize the SimpleGallery instance
        const gallery = new SimpleGallery();
        
        // Make gallery instance globally available
        window.gallery = gallery;
        
        console.log('Gallery initialized successfully');
    } catch (error) {
        console.error('Failed to initialize gallery:', error);
    }
});
