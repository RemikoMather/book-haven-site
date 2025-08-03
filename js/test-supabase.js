import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qeoyopgtolnmtdaahdvn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlb3lvcGd0b2xubXRkYWFoZHZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNjY0MTUsImV4cCI6MjA2OTc0MjQxNX0.wqSrr2lLHO0JzG3426dVlMEaJne3gKbn8nqibn57FgM';

async function testSupabaseConnection() {
    console.log('Starting Supabase connection test...');
    
    try {
        // Initialize Supabase client
        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase client initialized');

        // Test connection by fetching products
        console.log('Testing product retrieval...');
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .limit(5);

        if (error) {
            throw error;
        }

        if (Array.isArray(data)) {
            console.log('✅ Successfully connected to Supabase');
            console.log(`Retrieved ${data.length} products`);
            if (data.length > 0) {
                console.log('Sample product:', JSON.stringify(data[0], null, 2));
            }
        } else {
            console.error('❌ Data is not in expected format');
        }
        
    } catch (error) {
        console.error('❌ Failed to connect to Supabase:', error.message);
        if (error.details) {
            console.error('Error details:', error.details);
        }
    }
}

// Run the test
testSupabaseConnection();
