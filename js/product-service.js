import { createClient } from '@supabase/supabase-js';
import { config } from './config.js';

export class ProductService {
    static instance = null;
    
    constructor() {
        if (ProductService.instance) {
            return ProductService.instance;
        }
        this.SUPABASE_URL = config.get('SUPABASE_URL');
        this.SUPABASE_ANON_KEY = config.get('SUPABASE_ANON_KEY');
        this.retryAttempts = 3;
        this.retryDelay = 1000;
        this.initSupabase();
        ProductService.instance = this;
    }

    initSupabase() {
        try {
            console.log('Initializing Supabase with URL:', this.SUPABASE_URL);
            this.supabase = createClient(this.SUPABASE_URL, this.SUPABASE_ANON_KEY);
            console.log('Supabase client initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Supabase:', error);
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
            if (!this.supabase) {
                return await this.fetchMockProducts();
            }

            return await this.fetchWithRetry(async () => {
                const { data, error } = await this.supabase
                    .from('products')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw new Error(`Failed to fetch products: ${error.message}`);
                return data;
            });
        } catch (error) {
            console.error('Failed to fetch products from Supabase:', error);
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
        try {
            console.log('Fetching mock products...');
            const response = await fetch('./data/mock-products.json');
            if (!response.ok) {
                console.error('Mock data response not OK:', response.status, response.statusText);
                throw new Error(`Failed to fetch mock data: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            if (!data || !Array.isArray(data.products)) {
                console.error('Invalid mock data format:', data);
                throw new Error('Invalid mock data format');
            }
            console.log('Mock products loaded successfully:', data.products.length, 'items');
            return data.products;
        } catch (error) {
            console.error('Failed to fetch mock products:', error);
            console.error('Stack trace:', error.stack);
            throw error;
        }
    }
}

export const productService = new ProductService();
