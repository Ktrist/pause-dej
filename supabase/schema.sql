-- =====================================================
-- PAUSE DEJ' - DATABASE SCHEMA
-- =====================================================
-- Supabase PostgreSQL Schema
-- Version: 1.0
-- Date: 2025-12-07
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROFILES (extends Supabase auth.users)
-- =====================================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- =====================================================
-- ADDRESSES
-- =====================================================
CREATE TABLE addresses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  label TEXT NOT NULL, -- "Domicile", "Bureau", etc.
  street_address TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  additional_info TEXT, -- Apt, floor, code, etc.
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_addresses_user_id ON addresses(user_id);

-- RLS Policies
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own addresses"
  ON addresses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own addresses"
  ON addresses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addresses"
  ON addresses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own addresses"
  ON addresses FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- CATEGORIES
-- =====================================================
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Public read access for categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  TO public
  USING (true);

-- =====================================================
-- DISHES (PLATS)
-- =====================================================
CREATE TABLE dishes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  long_description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  category_id UUID REFERENCES categories(id),
  stock INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT TRUE,
  is_popular BOOLEAN DEFAULT FALSE,
  is_vegetarian BOOLEAN DEFAULT FALSE,
  is_vegan BOOLEAN DEFAULT FALSE,
  allergens TEXT[], -- Array of allergens
  calories INTEGER,
  protein INTEGER,
  carbs INTEGER,
  fat INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_dishes_category ON dishes(category_id);
CREATE INDEX idx_dishes_available ON dishes(is_available);
CREATE INDEX idx_dishes_popular ON dishes(is_popular);

-- RLS Policies
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dishes are viewable by everyone"
  ON dishes FOR SELECT
  TO public
  USING (true);

-- =====================================================
-- PROMO CODES
-- =====================================================
CREATE TABLE promo_codes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  max_discount DECIMAL(10,2),
  usage_limit INTEGER, -- NULL = unlimited
  usage_count INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active promo codes are viewable by everyone"
  ON promo_codes FOR SELECT
  TO public
  USING (is_active = true AND (valid_until IS NULL OR valid_until > NOW()));

-- =====================================================
-- TIME SLOTS (CRÉNEAUX)
-- =====================================================
CREATE TABLE time_slots (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slot_date DATE NOT NULL,
  slot_time TIME NOT NULL,
  max_orders INTEGER DEFAULT 50,
  current_orders INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(slot_date, slot_time)
);

-- Index
CREATE INDEX idx_time_slots_date ON time_slots(slot_date);

-- RLS Policies
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Time slots are viewable by everyone"
  ON time_slots FOR SELECT
  TO public
  USING (slot_date >= CURRENT_DATE);

-- =====================================================
-- ORDERS (COMMANDES)
-- =====================================================
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'preparing', 'ready', 'in_delivery', 'delivered', 'cancelled');

CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL, -- e.g., "PDJ-20251207-001"
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Delivery info
  delivery_address_id UUID REFERENCES addresses(id),
  delivery_street TEXT NOT NULL,
  delivery_city TEXT NOT NULL,
  delivery_postal_code TEXT NOT NULL,
  delivery_additional_info TEXT,

  -- Time slot
  time_slot_id UUID REFERENCES time_slots(id),
  delivery_date DATE NOT NULL,
  delivery_time TIME NOT NULL,

  -- Pricing
  subtotal DECIMAL(10,2) NOT NULL,
  delivery_fee DECIMAL(10,2) DEFAULT 3.90,
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,

  -- Promo
  promo_code_id UUID REFERENCES promo_codes(id),
  promo_code_used TEXT,

  -- Payment
  payment_method TEXT, -- 'card', 'apple_pay', 'google_pay'
  payment_intent_id TEXT, -- Stripe Payment Intent ID

  -- Status
  status order_status DEFAULT 'pending',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  preparing_at TIMESTAMPTZ,
  ready_at TIMESTAMPTZ,
  in_delivery_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,

  -- Notes
  customer_notes TEXT,
  admin_notes TEXT
);

-- Indexes
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_date ON orders(delivery_date);
CREATE INDEX idx_orders_number ON orders(order_number);

-- RLS Policies
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- ORDER ITEMS
-- =====================================================
CREATE TABLE order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  dish_id UUID REFERENCES dishes(id),

  -- Snapshot of dish at order time
  dish_name TEXT NOT NULL,
  dish_price DECIMAL(10,2) NOT NULL,
  dish_image_url TEXT,

  quantity INTEGER NOT NULL CHECK (quantity > 0),
  subtotal DECIMAL(10,2) NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_order_items_order ON order_items(order_id);

-- RLS Policies
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- =====================================================
-- PAYMENT METHODS (Stripe Cards)
-- =====================================================
CREATE TABLE payment_methods (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  stripe_payment_method_id TEXT UNIQUE NOT NULL,
  card_brand TEXT, -- 'visa', 'mastercard', etc.
  card_last4 TEXT,
  card_exp_month INTEGER,
  card_exp_year INTEGER,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_payment_methods_user ON payment_methods(user_id);

-- RLS Policies
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payment methods"
  ON payment_methods FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payment methods"
  ON payment_methods FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own payment methods"
  ON payment_methods FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_dishes_updated_at BEFORE UPDATE ON dishes
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
  order_count INTEGER;
BEGIN
  -- Count orders for today
  SELECT COUNT(*) INTO order_count
  FROM orders
  WHERE DATE(created_at) = CURRENT_DATE;

  -- Generate order number: PDJ-YYYYMMDD-XXX
  NEW.order_number := 'PDJ-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD((order_count + 1)::TEXT, 3, '0');

  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_order_number BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE PROCEDURE generate_order_number();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- =====================================================
-- SEED DATA (Optional - for development)
-- =====================================================

-- Insert default categories
INSERT INTO categories (name, slug, display_order) VALUES
  ('Entrées', 'entrees', 1),
  ('Plats', 'plats', 2),
  ('Desserts', 'desserts', 3),
  ('Boissons', 'boissons', 4),
  ('Salades', 'salades', 5),
  ('Bowls', 'bowls', 6),
  ('Snacks', 'snacks', 7)
ON CONFLICT (slug) DO NOTHING;

-- Insert default promo codes
INSERT INTO promo_codes (code, discount_type, discount_value, min_order_amount, max_discount) VALUES
  ('BIENVENUE10', 'percentage', 10, 0, 15),
  ('PAUSEDEJ20', 'percentage', 20, 30, 20),
  ('LIVRAISON', 'fixed', 3.90, 0, NULL),
  ('PROMO5', 'fixed', 5, 25, NULL)
ON CONFLICT (code) DO NOTHING;

-- Insert default time slots for next 7 days
INSERT INTO time_slots (slot_date, slot_time, max_orders)
SELECT
  CURRENT_DATE + i,
  time::TIME,
  50
FROM generate_series(0, 6) AS i,
     UNNEST(ARRAY['12:00', '12:30', '13:00', '13:30', '19:00', '19:30', '20:00', '20:30']) AS time
ON CONFLICT (slot_date, slot_time) DO NOTHING;
