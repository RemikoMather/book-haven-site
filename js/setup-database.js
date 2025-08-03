import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qeoyopgtolnmtdaahdvn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlb3lvcGd0b2xubXRkYWFoZHZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNjY0MTUsImV4cCI6MjA2OTc0MjQxNX0.wqSrr2lLHO0JzG3426dVlMEaJne3gKbn8nqibn57FgM';

const sampleProducts = [
    {
        name: "The Great Gatsby",
        description: "F. Scott Fitzgerald's masterpiece of American fiction, capturing the essence of the Jazz Age",
        price: 15.99,
        category: "fiction",
        stock: 50,
        image: "https://cdn.pixabay.com/photo/2015/11/19/21/14/book-1052014_640.jpg",
        created_at: new Date().toISOString()
    },
    {
        name: "To Kill a Mockingbird",
        description: "Harper Lee's timeless classic about justice and racial inequality in the American South",
        price: 12.99,
        category: "fiction",
        stock: 45,
        image: "https://cdn.pixabay.com/photo/2015/11/19/21/14/book-1052014_640.jpg",
        created_at: new Date().toISOString()
    },
    {
        name: "A Brief History of Time",
        description: "Stephen Hawking's landmark exploration of cosmic mysteries",
        price: 18.99,
        category: "non-fiction",
        stock: 30,
        image: "https://cdn.pixabay.com/photo/2015/11/19/21/14/book-1052014_640.jpg",
        created_at: new Date().toISOString()
    },
    {
        name: "Where the Wild Things Are",
        description: "Maurice Sendak's beloved children's tale of imagination and adventure",
        price: 9.99,
        category: "children",
        stock: 60,
        image: "https://cdn.pixabay.com/photo/2015/11/19/21/14/book-1052014_640.jpg",
        created_at: new Date().toISOString()
    },
    {
        name: "Milk and Honey",
        description: "Rupi Kaur's collection of poetry and prose about survival and the experience of violence, abuse, love, loss, and femininity",
        price: 14.99,
        category: "poetry",
        stock: 40,
        image: "https://cdn.pixabay.com/photo/2015/11/19/21/14/book-1052014_640.jpg",
        created_at: new Date().toISOString()
    },
    {
        name: "The Alchemist",
        description: "Paulo Coelho's mystical story of Santiago, an Andalusian shepherd boy who yearns to travel in search of a worldly treasure",
        price: 13.99,
        category: "fiction",
        stock: 55,
        image: "https://cdn.pixabay.com/photo/2015/11/19/21/14/book-1052014_640.jpg",
        created_at: new Date().toISOString()
    },
    {
        name: "Sapiens",
        description: "Yuval Noah Harari's exploration of human history, from the Stone Age to the Silicon Age",
        price: 19.99,
        category: "non-fiction",
        stock: 35,
        image: "https://cdn.pixabay.com/photo/2015/11/19/21/14/book-1052014_640.jpg",
        created_at: new Date().toISOString()
    },
    {
        name: "The Very Hungry Caterpillar",
        description: "Eric Carle's colorful tale of a caterpillar eating his way through the week",
        price: 8.99,
        category: "children",
        stock: 70,
        image: "https://cdn.pixabay.com/photo/2015/11/19/21/14/book-1052014_640.jpg",
        created_at: new Date().toISOString()
    },
    {
        name: "The Prophet",
        description: "Kahlil Gibran's poetic essays touching on the deeper aspects of life",
        price: 11.99,
        category: "poetry",
        stock: 25,
        image: "https://cdn.pixabay.com/photo/2015/11/19/21/14/book-1052014_640.jpg",
        created_at: new Date().toISOString()
    },
    {
        name: "1984",
        description: "George Orwell's dystopian masterpiece about surveillance and totalitarian control",
        price: 16.99,
        category: "fiction",
        stock: 42,
        image: "https://cdn.pixabay.com/photo/2015/11/19/21/14/book-1052014_640.jpg",
        created_at: new Date().toISOString()
    }
];

async function setupDatabase() {
    console.log('Starting database setup...');
    
    try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase client initialized');

        // Try to insert products to check if table exists
        console.log('Checking if products table exists...');
        const { data: testData, error: testError } = await supabase
            .from('products')
            .select('*')
            .limit(1);

        if (testError) {
            console.log('Products table does not exist. Please create it in the Supabase dashboard with these columns:');
            console.log('- id: bigint (auto-increment primary key)');
            console.log('- name: varchar(255) NOT NULL');
            console.log('- description: text');
            console.log('- price: decimal(10,2) NOT NULL');
            console.log('- category: varchar(50)');
            console.log('- stock: integer DEFAULT 0');
            console.log('- image: varchar(500)');
            console.log('- created_at: timestamptz DEFAULT now()');
            console.log('- updated_at: timestamptz DEFAULT now()');
            console.log('\nAfter creating the table, run this script again to insert sample data.');
            return;
        }

        // If we get here, the table exists, so let's insert sample products
        console.log('Products table exists, inserting sample data...');
        const { data: insertedProducts, error: insertError } = await supabase
            .from('products')
            .insert(sampleProducts)
            .select();

        if (insertError) {
            throw insertError;
        }

        console.log('✅ Sample products inserted successfully');
        console.log('Inserted products:', insertedProducts);
        
    } catch (error) {
        console.error('❌ Failed to set up database:', error.message);
        if (error.details) {
            console.error('Error details:', error.details);
        }
    }
}

// Run the setup
setupDatabase();
