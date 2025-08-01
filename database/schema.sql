-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Books Table
CREATE TABLE books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    isbn VARCHAR(13),
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    image_url TEXT,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users Table (extends Supabase Auth)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    full_name VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Carts Table
CREATE TABLE carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    items JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders Table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    items JSONB NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    shipping_address JSONB NOT NULL,
    payment_intent_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events Table
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date TIMESTAMPTZ NOT NULL,
    location VARCHAR(255),
    max_attendees INTEGER,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event Registrations Table
CREATE TABLE event_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id),
    user_id UUID REFERENCES auth.users(id),
    status VARCHAR(50) NOT NULL DEFAULT 'confirmed',
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- Newsletter Subscribers Table
CREATE TABLE newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    subscribed_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Custom Services Table
CREATE TABLE custom_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    service_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'new',
    budget DECIMAL(10,2),
    deadline DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Review Table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    book_id UUID REFERENCES books(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, book_id)
);

-- Create update_updated_at function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to all tables
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_books_updated_at
    BEFORE UPDATE ON books
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_carts_updated_at
    BEFORE UPDATE ON carts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_custom_services_updated_at
    BEFORE UPDATE ON custom_services
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Row Level Security (RLS) Policies

-- Books RLS
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Books are viewable by everyone"
    ON books FOR SELECT
    USING (true);
CREATE POLICY "Books are insertable by admin"
    ON books FOR INSERT
    WITH CHECK (auth.role() = 'admin');
CREATE POLICY "Books are updatable by admin"
    ON books FOR UPDATE
    USING (auth.role() = 'admin');

-- Carts RLS
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own cart"
    ON carts FOR SELECT
    USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cart"
    ON carts FOR INSERT
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cart"
    ON carts FOR UPDATE
    USING (auth.uid() = user_id);

-- Orders RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own orders"
    ON orders FOR SELECT
    USING (auth.uid() = user_id);
CREATE POLICY "Users can create own orders"
    ON orders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Events RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Events are viewable by everyone"
    ON events FOR SELECT
    USING (true);
CREATE POLICY "Events are manageable by admin"
    ON events FOR ALL
    USING (auth.role() = 'admin');

-- Event Registrations RLS
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own registrations"
    ON event_registrations FOR SELECT
    USING (auth.uid() = user_id);
CREATE POLICY "Users can register themselves"
    ON event_registrations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Reviews RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews are viewable by everyone"
    ON reviews FOR SELECT
    USING (true);
CREATE POLICY "Users can create own reviews"
    ON reviews FOR INSERT
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews"
    ON reviews FOR UPDATE
    USING (auth.uid() = user_id);
