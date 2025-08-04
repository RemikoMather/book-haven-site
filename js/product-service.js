let SUPABASE_CONFIG;
try {
    SUPABASE_CONFIG = await import('./supabase-config.js');
} catch (error) {
    console.log('DEBUG: Supabase config not available, will use mock data');
    SUPABASE_CONFIG = { url: null, anonKey: null };
}

export class ProductService {
    static instance = null;
    
    constructor() {
        if (ProductService.instance) {
            return ProductService.instance;
        }
        console.log('DEBUG: Creating new ProductService instance');
        this.supabase = null;
        this.retryAttempts = 3;
        this.retryDelay = 1000;
        
        ProductService.instance = this;
    }

    initSupabase() {
        try {
            console.log('DEBUG: Initializing Supabase with URL:', SUPABASE_CONFIG.url);
            if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
                console.warn('DEBUG: Missing Supabase credentials, falling back to mock data');
                this.supabase = null;
                return;
            }
            
            // Check if Supabase is ready
            if (!window.supabase) {
                console.log('DEBUG: Waiting for Supabase to be initialized...');
                return; // Will retry when supabaseReady event fires
            }
            
            // Create client instance
            this.supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
            
            console.log('DEBUG: Supabase client initialized successfully');
        } catch (error) {
            console.error('DEBUG: Failed to initialize Supabase:', error);
            this.supabase = null;
        }
    }

    async fetchWithRetry(operation) {
        let lastError;
        
        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error;
                console.warn(`Attempt ${attempt} failed:`, error);
                
                if (attempt < this.retryAttempts) {
                    await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
                }
            }
        }
        
        throw lastError;
    }

    async fetchProducts() {
        try {
            console.log('DEBUG: fetchProducts called');
            return await this.fetchMockProducts();
        } catch (error) {
            console.error('DEBUG: Failed to fetch products:', error);
            throw error;
        }
    }

    async fetchProductsByCategory(category) {
        try {
            if (!this.supabase) {
                const products = await this.fetchMockProducts();
                return products.filter(p => p.category === category);
            }

            return await this.fetchWithRetry(async () => {
                const { data, error } = await this.supabase
                    .from('products')
                    .select('*')
                    .eq('category', category)
                    .order('created_at', { ascending: false });

                if (error) throw new Error(`Failed to fetch products by category: ${error.message}`);
                return data;
            });
        } catch (error) {
            console.error('Failed to fetch products by category:', error);
            const products = await this.fetchMockProducts();
            return products.filter(p => p.category === category);
        }
    }

    async searchProducts(query) {
        try {
            if (!this.supabase) {
                const products = await this.fetchMockProducts();
                return products.filter(p => 
                    p.name.toLowerCase().includes(query.toLowerCase()) ||
                    p.description.toLowerCase().includes(query.toLowerCase())
                );
            }

            return await this.fetchWithRetry(async () => {
                const { data, error } = await this.supabase
                    .from('products')
                    .select('*')
                    .or(`name.ilike.%${query}%,description.ilike.%${query}%`);

                if (error) throw new Error(`Failed to search products: ${error.message}`);
                return data;
            });
        } catch (error) {
            console.error('Failed to search products:', error);
            const products = await this.fetchMockProducts();
            return products.filter(p => 
                p.name.toLowerCase().includes(query.toLowerCase()) ||
                p.description.toLowerCase().includes(query.toLowerCase())
            );
        }
    }

    async fetchMockProducts() {
        console.log('DEBUG: Starting fetchMockProducts');
        
        // Add a small delay to simulate network request
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('DEBUG: Creating mock products array');
        return [
            {
                id: 1,
                name: "The Great Gatsby",
                author: "F. Scott Fitzgerald",
                description: "A masterpiece of American fiction, capturing the essence of the Jazz Age",
                price: 15.99,
                category: "fiction",
                stock: 50,
                image: "https://cdn.pixabay.com/photo/2019/01/30/08/30/book-3964050_640.jpg"
            },
            {
                id: 2,
                name: "To Kill a Mockingbird",
                author: "Harper Lee",
                description: "A timeless classic about justice and racial inequality in the American South",
                price: 12.99,
                category: "fiction",
                stock: 45,
                image: "https://cdn.pixabay.com/photo/2019/01/30/08/30/book-3964050_640.jpg"
            },
            {
                id: 3,
                name: "A Brief History of Time",
                author: "Stephen Hawking",
                description: "A landmark exploration of cosmic mysteries",
                price: 18.99,
                category: "non-fiction",
                stock: 30,
                image: "https://cdn.pixabay.com/photo/2019/01/30/08/30/book-3964050_640.jpg"
            },
            {
                id: 4,
                name: "Where the Wild Things Are",
                author: "Maurice Sendak",
                description: "A beloved children's tale of imagination and adventure",
                price: 9.99,
                category: "children",
                stock: 60,
                image: "https://cdn.pixabay.com/photo/2019/01/30/08/30/book-3964050_640.jpg"
            },
            {
                id: 5,
                name: "Milk and Honey",
                author: "Rupi Kaur",
                description: "A collection of poetry and prose about survival",
                price: 14.99,
                category: "poetry",
                stock: 40,
                image: "https://cdn.pixabay.com/photo/2019/01/30/08/30/book-3964050_640.jpg"
            }
        ];
        
        return mockProducts;
    }
}

export const productService = new ProductService();
