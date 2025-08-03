-- Create the products table
CREATE OR REPLACE FUNCTION create_products_table()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    CREATE TABLE IF NOT EXISTS products (
        id BIGSERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        category VARCHAR(50),
        stock INTEGER DEFAULT 0,
        image VARCHAR(500),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Create an index on category for faster filtering
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
    
    -- Create an index on created_at for sorting
    CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
END;
$$;
