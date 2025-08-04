// Book Haven Global Configuration
window.BookHaven = {
    // Base URL configuration
    baseUrl: location.hostname === 'remikomather.github.io' ? '/book-haven-site' : '',
    isInitialized: false,
    
    // Environment-aware asset URL helper
    getAssetUrl(path) {
        // Remove leading slash if present in both base and path
        if (this.baseUrl.endsWith('/') && path.startsWith('/')) {
            path = path.substring(1);
        }
        // Add slash between base and path if neither has it
        else if (!this.baseUrl.endsWith('/') && !path.startsWith('/')) {
            path = '/' + path;
        }
        return this.baseUrl + path;
    }
};

// Initialize immediately
window.BookHaven.isInitialized = true;
