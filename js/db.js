import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

// Books
export async function getBooks(filters = {}) {
    let query = supabase.from('books').select('*');
    
    if (filters.category) {
        query = query.eq('category', filters.category);
    }
    if (filters.search) {
        query = query.ilike('title', `%${filters.search}%`);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
}

// Cart
export const CartStorage = {
    async getCart(userId) {
        const { data, error } = await supabase
            .from('carts')
            .select('items')
            .eq('user_id', userId)
            .single();
        
        if (error) throw error;
        return data?.items || [];
    },

    async updateCart(userId, items) {
        const { error } = await supabase
            .from('carts')
            .upsert({ user_id: userId, items });
        
        if (error) throw error;
    }
};

// Orders
export const OrderStorage = {
    async createOrder(userId, orderData) {
        const { data, error } = await supabase
            .from('orders')
            .insert([{ 
                user_id: userId,
                ...orderData,
                status: 'pending',
                created_at: new Date()
            }]);
        
        if (error) throw error;
        return data;
    },

    async getUserOrders(userId) {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
    }
};

// Events
export const EventStorage = {
    async getEvents() {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .gte('date', new Date().toISOString())
            .order('date', { ascending: true });
        
        if (error) throw error;
        return data;
    },

    async registerForEvent(userId, eventId) {
        const { error } = await supabase
            .from('event_registrations')
            .insert([{ 
                user_id: userId,
                event_id: eventId,
                registered_at: new Date()
            }]);
        
        if (error) throw error;
    }
};

// Newsletter
export const NewsletterStorage = {
    async subscribe(email) {
        const { error } = await supabase
            .from('newsletter_subscribers')
            .insert([{ 
                email,
                subscribed_at: new Date()
            }]);
        
        if (error) throw error;
    }
};

// Custom Services
export const CustomServiceStorage = {
    async submitRequest(userId, requestData) {
        const { error } = await supabase
            .from('custom_services')
            .insert([{
                user_id: userId,
                ...requestData,
                status: 'new',
                created_at: new Date()
            }]);
        
        if (error) throw error;
    }
};
