import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client
const SUPABASE_URL = 'https://qeoyopgtolnmtdaahdvn.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export class ProductService {
    static instance = null;

    constructor() {
        if (ProductService.instance) {
            return ProductService.instance;
        }
        ProductService.instance = this;
    }

    async fetchProducts() {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                throw new Error(`Failed to fetch products: ${error.message}`);
            }

            return data;
        } catch (error) {
            console.error('Product fetch error:', error);
            throw error;
        }
    }

    async fetchProductsByCategory(category) {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('category', category)
                .order('created_at', { ascending: false });

            if (error) {
                throw new Error(`Failed to fetch products by category: ${error.message}`);
            }

            return data;
        } catch (error) {
            console.error('Product category fetch error:', error);
            throw error;
        }
    }

    async searchProducts(query) {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .or(`name.ilike.%${query}%,description.ilike.%${query}%`);

            if (error) {
                throw new Error(`Failed to search products: ${error.message}`);
            }

            return data;
        } catch (error) {
            console.error('Product search error:', error);
            throw error;
        }
    }
}

export const productService = new ProductService();
