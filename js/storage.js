// Local Storage Keys
const STORAGE_KEYS = {
    CART: 'bookhaven_cart',
    AUTH: 'bookhaven_auth',
    THEME: 'bookhaven_theme'
};

// Local Storage Utilities
export const LocalStorage = {
    // Cart Management
    getCart() {
        try {
            const cart = localStorage.getItem(STORAGE_KEYS.CART);
            return cart ? JSON.parse(cart) : [];
        } catch (error) {
            console.error('Error reading cart from localStorage:', error);
            return [];
        }
    },

    updateCart(items) {
        try {
            localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(items));
        } catch (error) {
            console.error('Error updating cart in localStorage:', error);
        }
    },

    clearCart() {
        localStorage.removeItem(STORAGE_KEYS.CART);
    },

    // Auth Management
    getAuthToken() {
        return localStorage.getItem(STORAGE_KEYS.AUTH);
    },

    setAuthToken(token) {
        localStorage.setItem(STORAGE_KEYS.AUTH, token);
    },

    clearAuthToken() {
        localStorage.removeItem(STORAGE_KEYS.AUTH);
    },

    // Theme Preferences
    getThemePreference() {
        return localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
    },

    setThemePreference(theme) {
        localStorage.setItem(STORAGE_KEYS.THEME, theme);
    }
};

// Session Storage Utilities
export const SessionStorage = {
    // Search History
    setRecentSearches(searches) {
        try {
            sessionStorage.setItem('recent_searches', JSON.stringify(searches));
        } catch (error) {
            console.error('Error saving recent searches:', error);
        }
    },

    getRecentSearches() {
        try {
            const searches = sessionStorage.getItem('recent_searches');
            return searches ? JSON.parse(searches) : [];
        } catch (error) {
            console.error('Error reading recent searches:', error);
            return [];
        }
    },

    // Form Data Backup
    saveFormData(formId, data) {
        try {
            sessionStorage.setItem(`form_${formId}`, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving form data:', error);
        }
    },

    getFormData(formId) {
        try {
            const data = sessionStorage.getItem(`form_${formId}`);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error reading form data:', error);
            return null;
        }
    },

    clearFormData(formId) {
        sessionStorage.removeItem(`form_${formId}`);
    }
};
