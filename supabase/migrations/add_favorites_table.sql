-- =====================================================
-- FAVORITES (PLATS FAVORIS)
-- =====================================================
-- User Story M9.1: Plats favoris
-- Permet aux utilisateurs de sauvegarder leurs plats préférés
-- =====================================================

CREATE TABLE IF NOT EXISTS favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  dish_id UUID REFERENCES dishes(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, dish_id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_dish_id ON favorites(dish_id);

-- RLS Policies
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- Function to get favorite count for a dish
-- =====================================================
CREATE OR REPLACE FUNCTION get_dish_favorite_count(dish_uuid UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM favorites
  WHERE dish_id = dish_uuid;
$$ LANGUAGE SQL STABLE;
