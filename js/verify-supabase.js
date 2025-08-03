import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qeoyopgtolnmtdaahdvn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlb3lvcGd0b2xubXRkYWFoZHZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNjY0MTUsImV4cCI6MjA2OTc0MjQxNX0.wqSrr2lLHO0JzG3426dVlMEaJne3gKbn8nqibn57FgM';

async function verifySupabaseSetup() {
    console.log('🔍 Starting Supabase verification...\n');
    
    try {
        // Initialize Supabase client
        console.log('1. Initializing Supabase client...');
        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase client initialized successfully\n');

        // Check products table existence and structure
        console.log('2. Checking products table...');
        const { data: tableInfo, error: tableError } = await supabase
            .from('products')
            .select('*')
            .limit(1);

        if (tableError) {
            throw new Error(`Failed to access products table: ${tableError.message}`);
        }
        console.log('✅ Products table exists and is accessible\n');

        // Count total products
        console.log('3. Counting total products...');
        const { count, error: countError } = await supabase
            .from('products')
            .select('*', { count: 'exact' });

        if (countError) {
            throw new Error(`Failed to count products: ${countError.message}`);
        }
        console.log(`✅ Found ${count} products in the database\n`);

        // Test category filtering
        console.log('4. Testing category filtering...');
        const categories = ['fiction', 'non-fiction', 'children', 'poetry'];
        for (const category of categories) {
            const { data: categoryData, error: categoryError } = await supabase
                .from('products')
                .select('*')
                .eq('category', category);

            if (categoryError) {
                throw new Error(`Failed to filter by category ${category}: ${categoryError.message}`);
            }
            console.log(`   ✅ ${category}: ${categoryData.length} books found`);
        }
        console.log('\n5. Testing price range query...');
        const { data: priceData, error: priceError } = await supabase
            .from('products')
            .select('*')
            .gte('price', 10)
            .lte('price', 20)
            .order('price', { ascending: true });

        if (priceError) {
            throw new Error(`Failed to query price range: ${priceError.message}`);
        }
        console.log(`✅ Found ${priceData.length} books between $10 and $20`);
        console.log('   Price range samples:');
        priceData.slice(0, 3).forEach(book => {
            console.log(`   - ${book.name}: $${book.price}`);
        });

        // Test search functionality
        console.log('\n6. Testing text search...');
        const searchTerm = 'the';
        const { data: searchData, error: searchError } = await supabase
            .from('products')
            .select('*')
            .ilike('name', `%${searchTerm}%`);

        if (searchError) {
            throw new Error(`Failed to perform text search: ${searchError.message}`);
        }
        console.log(`✅ Found ${searchData.length} books containing '${searchTerm}' in the title`);
        console.log('   Search results sample:');
        searchData.slice(0, 3).forEach(book => {
            console.log(`   - ${book.name}`);
        });

        console.log('\n✨ All verification checks passed successfully! ✨');
        
    } catch (error) {
        console.error('\n❌ Verification failed:', error.message);
        if (error.details) {
            console.error('Error details:', error.details);
        }
        process.exit(1);
    }
}

// Run the verification
verifySupabaseSetup();
