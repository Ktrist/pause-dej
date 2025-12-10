-- Migration pour la gestion des livraisons
-- A4.1: Planifier tournées
-- A4.2: Gérer créneaux
-- A4.3: Gérer zones

-- Table pour les zones de livraison (A4.3)
CREATE TABLE IF NOT EXISTS delivery_zones (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  postal_codes TEXT[] NOT NULL, -- Array of postal codes
  city VARCHAR(100),
  delivery_fee DECIMAL(10,2) DEFAULT 0.00,
  min_order_amount DECIMAL(10,2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_delivery_zones_active ON delivery_zones(is_active);
CREATE INDEX IF NOT EXISTS idx_delivery_zones_postal_codes ON delivery_zones USING GIN(postal_codes);

-- Table pour les créneaux horaires de livraison (A4.2)
CREATE TABLE IF NOT EXISTS delivery_slots (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Dimanche, 6 = Samedi
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_orders INTEGER DEFAULT 20,
  delivery_fee DECIMAL(10,2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(day_of_week, start_time, end_time)
);

CREATE INDEX IF NOT EXISTS idx_delivery_slots_active ON delivery_slots(is_active);
CREATE INDEX IF NOT EXISTS idx_delivery_slots_day ON delivery_slots(day_of_week);

-- Table pour les tournées de livraison (A4.1)
CREATE TABLE IF NOT EXISTS delivery_routes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  route_name VARCHAR(100) NOT NULL,
  delivery_date DATE NOT NULL,
  slot_id UUID REFERENCES delivery_slots(id) ON DELETE SET NULL,
  zone_id UUID REFERENCES delivery_zones(id) ON DELETE SET NULL,
  driver_name VARCHAR(100),
  status VARCHAR(20) DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
  total_orders INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_delivery_routes_date ON delivery_routes(delivery_date);
CREATE INDEX IF NOT EXISTS idx_delivery_routes_status ON delivery_routes(status);
CREATE INDEX IF NOT EXISTS idx_delivery_routes_slot ON delivery_routes(slot_id);
CREATE INDEX IF NOT EXISTS idx_delivery_routes_zone ON delivery_routes(zone_id);

-- Table de liaison entre commandes et tournées
CREATE TABLE IF NOT EXISTS route_orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  route_id UUID REFERENCES delivery_routes(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  sequence_number INTEGER, -- Ordre de livraison
  estimated_delivery_time TIME,
  actual_delivery_time TIMESTAMPTZ,
  delivery_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(route_id, order_id)
);

CREATE INDEX IF NOT EXISTS idx_route_orders_route ON route_orders(route_id);
CREATE INDEX IF NOT EXISTS idx_route_orders_order ON route_orders(order_id);

-- Ajouter des colonnes à la table orders pour lier aux zones et créneaux
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS delivery_zone_id UUID REFERENCES delivery_zones(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS delivery_slot_id UUID REFERENCES delivery_slots(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_orders_zone ON orders(delivery_zone_id);
CREATE INDEX IF NOT EXISTS idx_orders_slot ON orders(delivery_slot_id);

-- RLS Policies pour delivery_zones
ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active delivery zones"
  ON delivery_zones FOR SELECT
  USING (is_active = true);

CREATE POLICY "Only authenticated users can manage zones"
  ON delivery_zones FOR ALL
  USING (auth.role() = 'authenticated');

-- RLS Policies pour delivery_slots
ALTER TABLE delivery_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active delivery slots"
  ON delivery_slots FOR SELECT
  USING (is_active = true);

CREATE POLICY "Only authenticated users can manage slots"
  ON delivery_slots FOR ALL
  USING (auth.role() = 'authenticated');

-- RLS Policies pour delivery_routes
ALTER TABLE delivery_routes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view routes"
  ON delivery_routes FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage routes"
  ON delivery_routes FOR ALL
  USING (auth.role() = 'authenticated');

-- RLS Policies pour route_orders
ALTER TABLE route_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view route orders"
  ON route_orders FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage route orders"
  ON route_orders FOR ALL
  USING (auth.role() = 'authenticated');

-- Fonction pour obtenir les créneaux disponibles pour une date donnée
CREATE OR REPLACE FUNCTION get_available_slots(target_date DATE)
RETURNS TABLE (
  slot_id UUID,
  day_of_week INTEGER,
  start_time TIME,
  end_time TIME,
  max_orders INTEGER,
  current_orders BIGINT,
  is_available BOOLEAN,
  delivery_fee DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ds.id as slot_id,
    ds.day_of_week,
    ds.start_time,
    ds.end_time,
    ds.max_orders,
    COUNT(o.id) as current_orders,
    (COUNT(o.id) < ds.max_orders) as is_available,
    ds.delivery_fee
  FROM delivery_slots ds
  LEFT JOIN orders o ON o.delivery_slot_id = ds.id
    AND DATE(o.delivery_date) = target_date
  WHERE ds.is_active = true
    AND ds.day_of_week = EXTRACT(DOW FROM target_date)::INTEGER
  GROUP BY ds.id, ds.day_of_week, ds.start_time, ds.end_time, ds.max_orders, ds.delivery_fee
  ORDER BY ds.start_time;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour vérifier si un code postal est dans une zone de livraison
CREATE OR REPLACE FUNCTION check_postal_code_in_zone(postal_code TEXT)
RETURNS TABLE (
  zone_id UUID,
  zone_name VARCHAR,
  delivery_fee DECIMAL,
  min_order_amount DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    dz.id as zone_id,
    dz.name as zone_name,
    dz.delivery_fee,
    dz.min_order_amount
  FROM delivery_zones dz
  WHERE dz.is_active = true
    AND postal_code = ANY(dz.postal_codes)
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Insérer quelques créneaux horaires par défaut
INSERT INTO delivery_slots (day_of_week, start_time, end_time, max_orders, delivery_fee) VALUES
  -- Lundi
  (1, '11:30', '13:30', 30, 0.00),
  (1, '18:30', '20:30', 30, 0.00),
  -- Mardi
  (2, '11:30', '13:30', 30, 0.00),
  (2, '18:30', '20:30', 30, 0.00),
  -- Mercredi
  (3, '11:30', '13:30', 30, 0.00),
  (3, '18:30', '20:30', 30, 0.00),
  -- Jeudi
  (4, '11:30', '13:30', 30, 0.00),
  (4, '18:30', '20:30', 30, 0.00),
  -- Vendredi
  (5, '11:30', '13:30', 30, 0.00),
  (5, '18:30', '20:30', 30, 0.00)
ON CONFLICT (day_of_week, start_time, end_time) DO NOTHING;

-- Insérer quelques zones de livraison par défaut (Paris et proche banlieue)
INSERT INTO delivery_zones (name, postal_codes, city, delivery_fee, min_order_amount) VALUES
  ('Paris Centre', ARRAY['75001', '75002', '75003', '75004'], 'Paris', 0.00, 15.00),
  ('Paris Nord', ARRAY['75009', '75010', '75017', '75018', '75019'], 'Paris', 2.50, 15.00),
  ('Paris Sud', ARRAY['75013', '75014', '75015'], 'Paris', 2.50, 15.00),
  ('Paris Est', ARRAY['75011', '75012', '75020'], 'Paris', 2.50, 15.00),
  ('Paris Ouest', ARRAY['75007', '75008', '75016'], 'Paris', 3.00, 20.00),
  ('Proche Banlieue', ARRAY['92100', '92200', '93100', '94200'], 'Banlieue', 5.00, 25.00)
ON CONFLICT DO NOTHING;
