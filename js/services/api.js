// Core API Services
const BookHavenAPI = {
    baseUrl: '/api',
    
    // Authentication
    auth: {
        async login(email, password) {
            // Implementation will use Supabase Auth
            return await this.post('/auth/login', { email, password });
        },
        
        async register(email, password, userData) {
            return await this.post('/auth/register', { email, password, ...userData });
        },
        
        async logout() {
            return await this.post('/auth/logout');
        }
    },

    // Books
    books: {
        async getAll(params = {}) {
            return await this.get('/books', params);
        },
        
        async getById(id) {
            return await this.get(`/books/${id}`);
        },
        
        async search(query) {
            return await this.get('/books/search', { query });
        },
        
        async getReviews(bookId) {
            return await this.get(`/books/${bookId}/reviews`);
        },
        
        async addReview(bookId, review) {
            return await this.post(`/books/${bookId}/reviews`, review);
        }
    },

    // Cart
    cart: {
        async get() {
            return await this.get('/cart');
        },
        
        async addItem(item) {
            return await this.post('/cart/items', item);
        },
        
        async updateItem(itemId, updates) {
            return await this.patch(`/cart/items/${itemId}`, updates);
        },
        
        async removeItem(itemId) {
            return await this.delete(`/cart/items/${itemId}`);
        },
        
        async clear() {
            return await this.delete('/cart');
        }
    },

    // Orders
    orders: {
        async create(orderData) {
            return await this.post('/orders', orderData);
        },
        
        async getAll() {
            return await this.get('/orders');
        },
        
        async getById(orderId) {
            return await this.get(`/orders/${orderId}`);
        }
    },

    // Newsletter
    newsletter: {
        async subscribe(email) {
            return await this.post('/newsletter/subscribe', { email });
        },
        
        async unsubscribe(email) {
            return await this.post('/newsletter/unsubscribe', { email });
        }
    },

    // Custom Services
    customServices: {
        async submit(serviceRequest) {
            return await this.post('/custom-services', serviceRequest);
        },
        
        async getAll() {
            return await this.get('/custom-services');
        },
        
        async getById(requestId) {
            return await this.get(`/custom-services/${requestId}`);
        }
    },

    // HTTP method implementations
    async get(endpoint, params = {}) {
        const url = new URL(this.baseUrl + endpoint);
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
        
        try {
            const response = await fetch(url, {
                headers: this.getHeaders()
            });
            return this.handleResponse(response);
        } catch (error) {
            this.handleError(error);
        }
    },

    async post(endpoint, data = {}) {
        try {
            const response = await fetch(this.baseUrl + endpoint, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });
            return this.handleResponse(response);
        } catch (error) {
            this.handleError(error);
        }
    },

    async patch(endpoint, data = {}) {
        try {
            const response = await fetch(this.baseUrl + endpoint, {
                method: 'PATCH',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });
            return this.handleResponse(response);
        } catch (error) {
            this.handleError(error);
        }
    },

    async delete(endpoint) {
        try {
            const response = await fetch(this.baseUrl + endpoint, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            return this.handleResponse(response);
        } catch (error) {
            this.handleError(error);
        }
    },

    // Helper methods
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        const token = localStorage.getItem('auth_token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        return headers;
    },

    async handleResponse(response) {
        const data = await response.json();
        
        if (!response.ok) {
            throw {
                status: response.status,
                message: data.message || 'An error occurred',
                data
            };
        }
        
        return data;
    },

    handleError(error) {
        console.error('API Error:', error);
        throw error;
    }
};

// State Management
const BookHavenState = {
    cart: {
        items: [],
        total: 0
    },
    user: null,
    books: [],
    searchResults: [],
    
    // Initialize state from localStorage
    init() {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            this.cart = JSON.parse(savedCart);
        }
        
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            this.user = JSON.parse(savedUser);
        }
        
        window.addEventListener('beforeunload', () => this.saveState());
    },
    
    // Save state to localStorage
    saveState() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
        if (this.user) {
            localStorage.setItem('user', JSON.stringify(this.user));
        }
    },
    
    // Sync with backend
    async syncWithBackend() {
        if (this.user) {
            try {
                // Sync cart
                const serverCart = await BookHavenAPI.cart.get();
                this.mergeCart(serverCart);
                
                // Sync other data as needed
            } catch (error) {
                console.error('Sync error:', error);
            }
        }
    },
    
    // Cart operations
    mergeCart(serverCart) {
        // Merge local and server cart items
        const localItems = new Map(this.cart.items.map(item => [item.id, item]));
        const serverItems = new Map(serverCart.items.map(item => [item.id, item]));
        
        // Use server values but keep local items not yet synced
        this.cart.items = [...new Map([...serverItems, ...localItems]).values()];
        this.updateCartTotal();
    },
    
    updateCartTotal() {
        this.cart.total = this.cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        this.saveState();
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    BookHavenState.init();
    BookHavenState.syncWithBackend();
});

// Make available globally
window.BookHavenAPI = BookHavenAPI;
window.BookHavenState = BookHavenState;
