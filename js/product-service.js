import SUPABASE_CONFIG from './supabase-config.js';

export class ProductService {
    static instance = null;
    
    constructor() {
        if (ProductService.instance) {
            return ProductService.instance;
        }
        this.supabase = null;
        this.retryAttempts = 3;
        this.retryDelay = 1000;
        
        // Try initial initialization
        this.initSupabase();
        
        // Listen for Supabase initialization
        window.addEventListener('supabaseReady', () => {
            console.log('DEBUG: ProductService detected Supabase ready event');
            this.initSupabase();
        });
        
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
            
            if (!this.supabase) {
                console.log('DEBUG: Supabase client not initialized, falling back to mock data');
                return await this.fetchMockProducts();
            }

            console.log('DEBUG: Attempting to fetch products from Supabase');
            return await this.fetchWithRetry(async () => {
                const { data, error } = await this.supabase
                    .from('products')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error('DEBUG: Supabase query error:', error);
                    throw new Error(`Failed to fetch products: ${error.message}`);
                }
                
                console.log('DEBUG: Successfully fetched products from Supabase:', data?.length || 0, 'items');
                return data;
            });
        } catch (error) {
            console.error('DEBUG: Failed to fetch products from Supabase:', error);
            console.log('DEBUG: Falling back to mock products');
            return await this.fetchMockProducts();
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
        console.log('DEBUG: Using fallback mock products');
        
        // Hardcoded fallback data
        return [
            {
                id: 1,
                name: "The Great Gatsby",
                description: "F. Scott Fitzgerald's masterpiece of American fiction, capturing the essence of the Jazz Age",
                price: 15.99,
                category: "fiction",
                stock: 50,
                image: BookHaven.getAssetUrl('/images/placeholder-book.jpg')
            },
            {
                id: 2,
                name: "To Kill a Mockingbird",
                description: "Harper Lee's timeless classic about justice and racial inequality in the American South",
                price: 12.99,
                category: "fiction",
                stock: 45,
                image: BookHaven.getAssetUrl('/images/placeholder-book.jpg')
            },
            {
                id: 3,
                name: "A Brief History of Time",
                description: "Stephen Hawking's landmark exploration of cosmic mysteries",
                price: 18.99,
                category: "non-fiction",
                stock: 30,
                image: BookHaven.getAssetUrl('/images/placeholder-book.jpg')
            },
            {
                id: 4,
                name: "Where the Wild Things Are",
                description: "Maurice Sendak's beloved children's tale of imagination and adventure",
                price: 9.99,
                category: "children",
                stock: 60,
                image: BookHaven.getAssetUrl('/images/placeholder-book.jpg')
            },
            {
                id: 5,
                name: "Milk and Honey",
                description: "Rupi Kaur's collection of poetry and prose about survival",
                price: 14.99,
                category: "poetry",
                stock: 40,
                image: "https://cdn.pixabay.com/photo/2015/11/19/21/14/book-1052014_640.jpg"
            }
        ];
    }
}

export const productService = new ProductService();
