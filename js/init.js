// Immediately initialize global configuration
window.BookHaven = {
    baseUrl: location.hostname === 'remikomather.github.io' ? '/book-haven-site' : '',
    getAssetUrl(path) {
        return `${this.baseUrl}${path}`;
    }
};
