-- Loyalty Program Tables
-- Complete points, tiers, and rewards system

-- ============================================
-- LOYALTY TIERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS loyalty_tiers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  min_points INTEGER NOT NULL,
  benefits TEXT[] DEFAULT '{}',
  discount_percentage DECIMAL(5,2) DEFAULT 0,
  icon VARCHAR(10) DEFAULT '⭐',
  color VARCHAR(20) DEFAULT 'gray',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default tiers
INSERT INTO loyalty_tiers (name, min_points, benefits, discount_percentage, icon, color) VALUES
  ('Bronze', 0, ARRAY['1 point par euro dépensé', 'Accès aux promotions'], 0, '🥉', 'orange'),
  ('Argent', 500, ARRAY['1.5 points par euro', 'Réductions exclusives', 'Livraison prioritaire'], 5, '🥈', 'gray'),
  ('Or', 1500, ARRAY['2 points par euro', '10% de réduction', 'Livraison gratuite', 'Accès anticipé nouveautés'], 10, '🥇', 'yellow'),
  ('Platine', 3000, ARRAY['3 points par euro', '15% de réduction', 'Livraison gratuite', 'Support prioritaire', 'Cadeaux exclusifs'], 15, '💎', 'purple')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- LOYALTY POINTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS loyalty_points (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  points_balance INTEGER DEFAULT 0 NOT NULL,
  lifetime_points INTEGER DEFAULT 0 NOT NULL,
  current_tier_id UUID REFERENCES loyalty_tiers(id),
  tier_updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_loyalty_points_user_id ON loyalty_points(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_points_tier ON loyalty_points(current_tier_id);

-- ============================================
-- LOYALTY TRANSACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  points INTEGER NOT NULL,
  transaction_type VARCHAR(50) NOT NULL, -- 'earned', 'redeemed', 'expired', 'bonus', 'adjustment'
  reason TEXT,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  reward_id UUID, -- References loyalty_rewards (added below)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for transaction history
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_user_id ON loyalty_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_type ON loyalty_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_created_at ON loyalty_transactions(created_at);

-- ============================================
-- LOYALTY REWARDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS loyalty_rewards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  points_cost INTEGER NOT NULL,
  reward_type VARCHAR(50) NOT NULL, -- 'discount_percentage', 'discount_fixed', 'free_delivery', 'free_dish', 'custom'
  reward_value DECIMAL(10,2), -- Percentage or fixed amount
  min_tier_required UUID REFERENCES loyalty_tiers(id), -- Optional minimum tier
  max_redemptions_per_user INTEGER DEFAULT NULL, -- NULL = unlimited
  total_available INTEGER DEFAULT NULL, -- NULL = unlimited
  total_redeemed INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for active rewards
CREATE INDEX IF NOT EXISTS idx_loyalty_rewards_active ON loyalty_rewards(is_active);
CREATE INDEX IF NOT EXISTS idx_loyalty_rewards_points_cost ON loyalty_rewards(points_cost);

-- Insert default rewards
INSERT INTO loyalty_rewards (name, description, points_cost, reward_type, reward_value, is_active) VALUES
  ('5€ de réduction', 'Bon de 5€ valable sur votre prochaine commande', 250, 'discount_fixed', 5.00, true),
  ('10€ de réduction', 'Bon de 10€ valable sur votre prochaine commande', 500, 'discount_fixed', 10.00, true),
  ('Livraison gratuite', 'Frais de livraison offerts sur une commande', 150, 'free_delivery', 0, true),
  ('15% de réduction', 'Réduction de 15% sur votre prochaine commande', 400, 'discount_percentage', 15.00, true),
  ('Plat gratuit', 'Un plat gratuit jusqu''à 12€', 600, 'free_dish', 12.00, true)
ON CONFLICT DO NOTHING;

-- ============================================
-- LOYALTY REDEMPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS loyalty_redemptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reward_id UUID REFERENCES loyalty_rewards(id) ON DELETE CASCADE NOT NULL,
  points_spent INTEGER NOT NULL,
  promo_code_id UUID REFERENCES promo_codes(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL, -- Order where reward was used
  redeemed_at TIMESTAMPTZ DEFAULT NOW(),
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  status VARCHAR(50) DEFAULT 'active' -- 'active', 'used', 'expired'
);

-- Index for redemptions
CREATE INDEX IF NOT EXISTS idx_loyalty_redemptions_user_id ON loyalty_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_redemptions_status ON loyalty_redemptions(status);

-- Add foreign key now that loyalty_redemptions exists
ALTER TABLE loyalty_transactions
ADD CONSTRAINT fk_loyalty_transactions_reward
FOREIGN KEY (reward_id) REFERENCES loyalty_rewards(id) ON DELETE SET NULL;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Loyalty tiers: Public read
ALTER TABLE loyalty_tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view loyalty tiers"
  ON loyalty_tiers FOR SELECT
  USING (true);

-- Loyalty points: Users can view their own
ALTER TABLE loyalty_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own loyalty points"
  ON loyalty_points FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all loyalty points"
  ON loyalty_points FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can update loyalty points"
  ON loyalty_points FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "System can insert loyalty points"
  ON loyalty_points FOR INSERT
  WITH CHECK (true);

-- Loyalty transactions: Users can view their own
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own transactions"
  ON loyalty_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions"
  ON loyalty_transactions FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "System can insert transactions"
  ON loyalty_transactions FOR INSERT
  WITH CHECK (true);

-- Loyalty rewards: Public read, admin write
ALTER TABLE loyalty_rewards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active rewards"
  ON loyalty_rewards FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage rewards"
  ON loyalty_rewards FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Loyalty redemptions: Users can view their own
ALTER TABLE loyalty_redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own redemptions"
  ON loyalty_redemptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can redeem rewards"
  ON loyalty_redemptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all redemptions"
  ON loyalty_redemptions FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to calculate user's current tier based on lifetime points
CREATE OR REPLACE FUNCTION calculate_user_tier(user_lifetime_points INTEGER)
RETURNS UUID AS $$
DECLARE
  tier_id UUID;
BEGIN
  SELECT id INTO tier_id
  FROM loyalty_tiers
  WHERE min_points <= user_lifetime_points
  ORDER BY min_points DESC
  LIMIT 1;

  RETURN tier_id;
END;
$$ LANGUAGE plpgsql;

-- Function to award points for an order
CREATE OR REPLACE FUNCTION award_loyalty_points(
  p_user_id UUID,
  p_order_id UUID,
  p_order_total DECIMAL
)
RETURNS INTEGER AS $$
DECLARE
  v_points_earned INTEGER;
  v_tier_id UUID;
  v_multiplier DECIMAL;
BEGIN
  -- Get user's current tier
  SELECT current_tier_id INTO v_tier_id
  FROM loyalty_points
  WHERE user_id = p_user_id;

  -- Calculate points multiplier based on tier (1, 1.5, 2, or 3 points per euro)
  v_multiplier := CASE
    WHEN v_tier_id IN (SELECT id FROM loyalty_tiers WHERE name = 'Platine') THEN 3
    WHEN v_tier_id IN (SELECT id FROM loyalty_tiers WHERE name = 'Or') THEN 2
    WHEN v_tier_id IN (SELECT id FROM loyalty_tiers WHERE name = 'Argent') THEN 1.5
    ELSE 1
  END;

  -- Calculate points (1 point per euro, multiplied by tier bonus)
  v_points_earned := FLOOR(p_order_total * v_multiplier);

  -- Insert transaction record
  INSERT INTO loyalty_transactions (user_id, points, transaction_type, reason, order_id)
  VALUES (p_user_id, v_points_earned, 'earned', 'Points gagnés pour commande', p_order_id);

  -- Update user's points balance
  INSERT INTO loyalty_points (user_id, points_balance, lifetime_points)
  VALUES (p_user_id, v_points_earned, v_points_earned)
  ON CONFLICT (user_id) DO UPDATE
  SET
    points_balance = loyalty_points.points_balance + v_points_earned,
    lifetime_points = loyalty_points.lifetime_points + v_points_earned,
    updated_at = NOW();

  -- Update tier if necessary
  UPDATE loyalty_points
  SET
    current_tier_id = calculate_user_tier(lifetime_points),
    tier_updated_at = CASE
      WHEN current_tier_id != calculate_user_tier(lifetime_points) THEN NOW()
      ELSE tier_updated_at
    END
  WHERE user_id = p_user_id;

  RETURN v_points_earned;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-award points when order is delivered
CREATE OR REPLACE FUNCTION auto_award_loyalty_points()
RETURNS TRIGGER AS $$
BEGIN
  -- Only award points when order status changes to 'delivered'
  IF NEW.status = 'delivered' AND (OLD.status IS NULL OR OLD.status != 'delivered') THEN
    PERFORM award_loyalty_points(NEW.user_id, NEW.id, NEW.total);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_award_loyalty_points ON orders;
CREATE TRIGGER trigger_auto_award_loyalty_points
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION auto_award_loyalty_points();

-- Updated_at trigger for loyalty_points
CREATE OR REPLACE FUNCTION update_loyalty_points_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_loyalty_points_updated_at ON loyalty_points;
CREATE TRIGGER trigger_loyalty_points_updated_at
  BEFORE UPDATE ON loyalty_points
  FOR EACH ROW
  EXECUTE FUNCTION update_loyalty_points_updated_at();

COMMENT ON TABLE loyalty_tiers IS 'Loyalty program tiers with benefits and requirements';
COMMENT ON TABLE loyalty_points IS 'User loyalty points balances and tier status';
COMMENT ON TABLE loyalty_transactions IS 'History of all points earned, spent, and adjusted';
COMMENT ON TABLE loyalty_rewards IS 'Available rewards that can be redeemed with points';
COMMENT ON TABLE loyalty_redemptions IS 'Track when users redeem rewards';
