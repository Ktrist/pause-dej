-- ============================================
-- REFERRAL SYSTEM
-- Complete referral program with tracking and rewards
-- ============================================

-- Create referral_codes table
CREATE TABLE IF NOT EXISTS referral_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code VARCHAR(20) NOT NULL UNIQUE,
  uses_count INTEGER DEFAULT 0,
  max_uses INTEGER DEFAULT NULL, -- NULL = unlimited
  bonus_per_referral DECIMAL(10,2) DEFAULT 10.00,
  referrer_bonus DECIMAL(10,2) DEFAULT 10.00,
  is_active BOOLEAN DEFAULT true,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create referrals table to track who referred whom
CREATE TABLE IF NOT EXISTS referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code_id UUID NOT NULL REFERENCES referral_codes(id) ON DELETE CASCADE,
  code_used VARCHAR(20) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'cancelled'
  referrer_reward_amount DECIMAL(10,2) DEFAULT 0,
  referred_reward_amount DECIMAL(10,2) DEFAULT 0,
  referrer_rewarded_at TIMESTAMPTZ,
  referred_rewarded_at TIMESTAMPTZ,
  first_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  first_order_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(referred_user_id) -- A user can only be referred once
);

-- Create referral_rewards table to track rewards given
CREATE TABLE IF NOT EXISTS referral_rewards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referral_id UUID NOT NULL REFERENCES referrals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_type VARCHAR(50) NOT NULL, -- 'credit', 'discount', 'points', 'promo_code'
  reward_amount DECIMAL(10,2) NOT NULL,
  promo_code_id UUID REFERENCES promo_codes(id) ON DELETE SET NULL,
  loyalty_transaction_id UUID REFERENCES loyalty_transactions(id) ON DELETE SET NULL,
  is_claimed BOOLEAN DEFAULT false,
  claimed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_referral_codes_user_id ON referral_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_referral_codes_active ON referral_codes(is_active);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);

CREATE INDEX IF NOT EXISTS idx_referral_rewards_user_id ON referral_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_referral_id ON referral_rewards(referral_id);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Referral codes: Users can view and manage their own
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referral codes"
ON referral_codes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own referral codes"
ON referral_codes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own referral codes"
ON referral_codes FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view active codes by code"
ON referral_codes FOR SELECT
USING (is_active = true);

-- Referrals: Users can view their referrals
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view referrals where they are referrer"
ON referrals FOR SELECT
USING (auth.uid() = referrer_user_id);

CREATE POLICY "Users can view referrals where they are referred"
ON referrals FOR SELECT
USING (auth.uid() = referred_user_id);

CREATE POLICY "System can insert referrals"
ON referrals FOR INSERT
WITH CHECK (true);

CREATE POLICY "System can update referrals"
ON referrals FOR UPDATE
USING (true);

-- Referral rewards: Users can view their own rewards
ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referral rewards"
ON referral_rewards FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert rewards"
ON referral_rewards FOR INSERT
WITH CHECK (true);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code(user_id_param UUID)
RETURNS VARCHAR AS $$
DECLARE
  user_email TEXT;
  user_name TEXT;
  code_base TEXT;
  random_suffix TEXT;
  final_code TEXT;
  code_exists BOOLEAN;
BEGIN
  -- Get user info
  SELECT email INTO user_email FROM auth.users WHERE id = user_id_param;

  -- Extract name part from email (before @)
  code_base := UPPER(SUBSTRING(SPLIT_PART(user_email, '@', 1) FROM 1 FOR 6));

  -- Remove special characters
  code_base := REGEXP_REPLACE(code_base, '[^A-Z0-9]', '', 'g');

  -- If code_base is too short, pad with random characters
  IF LENGTH(code_base) < 4 THEN
    code_base := code_base || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4));
  END IF;

  -- Try to create unique code
  FOR i IN 1..10 LOOP
    random_suffix := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4));
    final_code := code_base || random_suffix;

    -- Check if code exists
    SELECT EXISTS(SELECT 1 FROM referral_codes WHERE code = final_code) INTO code_exists;

    IF NOT code_exists THEN
      RETURN final_code;
    END IF;
  END LOOP;

  -- If still not unique, use full random
  RETURN 'REF' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
END;
$$ LANGUAGE plpgsql;

-- Function to create referral code for user
CREATE OR REPLACE FUNCTION create_user_referral_code(user_id_param UUID)
RETURNS UUID AS $$
DECLARE
  new_code VARCHAR;
  code_id UUID;
BEGIN
  -- Check if user already has an active code
  SELECT id INTO code_id
  FROM referral_codes
  WHERE user_id = user_id_param AND is_active = true
  LIMIT 1;

  IF code_id IS NOT NULL THEN
    RETURN code_id;
  END IF;

  -- Generate new code
  new_code := generate_referral_code(user_id_param);

  -- Insert new referral code
  INSERT INTO referral_codes (user_id, code, is_active)
  VALUES (user_id_param, new_code, true)
  RETURNING id INTO code_id;

  RETURN code_id;
END;
$$ LANGUAGE plpgsql;

-- Function to apply referral code when user signs up
CREATE OR REPLACE FUNCTION apply_referral_code(
  referred_user_id_param UUID,
  code_param VARCHAR
)
RETURNS UUID AS $$
DECLARE
  referral_code_record RECORD;
  referral_id UUID;
BEGIN
  -- Get referral code details
  SELECT * INTO referral_code_record
  FROM referral_codes
  WHERE code = UPPER(code_param)
    AND is_active = true
    AND (valid_until IS NULL OR valid_until > NOW())
    AND (max_uses IS NULL OR uses_count < max_uses);

  IF referral_code_record IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired referral code';
  END IF;

  -- Check user is not referring themselves
  IF referral_code_record.user_id = referred_user_id_param THEN
    RAISE EXCEPTION 'Cannot use your own referral code';
  END IF;

  -- Check if user was already referred
  IF EXISTS(SELECT 1 FROM referrals WHERE referred_user_id = referred_user_id_param) THEN
    RAISE EXCEPTION 'User already referred';
  END IF;

  -- Create referral record
  INSERT INTO referrals (
    referrer_user_id,
    referred_user_id,
    referral_code_id,
    code_used,
    status,
    referrer_reward_amount,
    referred_reward_amount
  ) VALUES (
    referral_code_record.user_id,
    referred_user_id_param,
    referral_code_record.id,
    referral_code_record.code,
    'pending',
    referral_code_record.referrer_bonus,
    referral_code_record.bonus_per_referral
  )
  RETURNING id INTO referral_id;

  -- Update referral code usage count
  UPDATE referral_codes
  SET uses_count = uses_count + 1,
      updated_at = NOW()
  WHERE id = referral_code_record.id;

  RETURN referral_id;
END;
$$ LANGUAGE plpgsql;

-- Function to process referral rewards when referred user completes first order
CREATE OR REPLACE FUNCTION process_referral_rewards(order_id_param UUID)
RETURNS VOID AS $$
DECLARE
  order_record RECORD;
  referral_record RECORD;
BEGIN
  -- Get order details
  SELECT * INTO order_record
  FROM orders
  WHERE id = order_id_param;

  IF order_record IS NULL THEN
    RETURN;
  END IF;

  -- Get referral record for this user
  SELECT * INTO referral_record
  FROM referrals
  WHERE referred_user_id = order_record.user_id
    AND status = 'pending'
  LIMIT 1;

  IF referral_record IS NULL THEN
    RETURN;
  END IF;

  -- Update referral status
  UPDATE referrals
  SET status = 'completed',
      first_order_id = order_id_param,
      first_order_completed_at = NOW(),
      updated_at = NOW()
  WHERE id = referral_record.id;

  -- Create reward for referrer (the person who referred)
  INSERT INTO referral_rewards (
    referral_id,
    user_id,
    reward_type,
    reward_amount,
    expires_at
  ) VALUES (
    referral_record.id,
    referral_record.referrer_user_id,
    'credit',
    referral_record.referrer_reward_amount,
    NOW() + INTERVAL '90 days'
  );

  -- Create reward for referred user (the new user)
  INSERT INTO referral_rewards (
    referral_id,
    user_id,
    reward_type,
    reward_amount,
    expires_at
  ) VALUES (
    referral_record.id,
    referral_record.referred_user_id,
    'credit',
    referral_record.referred_reward_amount,
    NOW() + INTERVAL '90 days'
  );

  -- Mark rewards as given
  UPDATE referrals
  SET referrer_rewarded_at = NOW(),
      referred_rewarded_at = NOW()
  WHERE id = referral_record.id;

  -- Award loyalty points to referrer
  IF EXISTS(SELECT 1 FROM loyalty_points WHERE user_id = referral_record.referrer_user_id) THEN
    INSERT INTO loyalty_transactions (user_id, points, transaction_type, reason)
    VALUES (
      referral_record.referrer_user_id,
      50,
      'bonus',
      'Bonus parrainage: ' || referral_record.code_used
    );

    UPDATE loyalty_points
    SET points_balance = points_balance + 50,
        lifetime_points = lifetime_points + 50
    WHERE user_id = referral_record.referrer_user_id;
  END IF;

END;
$$ LANGUAGE plpgsql;

-- Trigger to process referral when first order is delivered
CREATE OR REPLACE FUNCTION trigger_process_referral_rewards()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process when order status changes to 'delivered'
  IF NEW.status = 'delivered' AND (OLD.status IS NULL OR OLD.status != 'delivered') THEN
    -- Check if this is user's first order
    IF NOT EXISTS(
      SELECT 1 FROM orders
      WHERE user_id = NEW.user_id
        AND status = 'delivered'
        AND id != NEW.id
    ) THEN
      PERFORM process_referral_rewards(NEW.id);
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_referral_rewards ON orders;
CREATE TRIGGER trigger_referral_rewards
AFTER UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION trigger_process_referral_rewards();

-- Auto-create referral code for new users
CREATE OR REPLACE FUNCTION auto_create_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  -- Create referral code for new user
  PERFORM create_user_referral_code(NEW.id);
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail user creation
    RAISE WARNING 'Failed to create referral code for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_create_referral_code ON auth.users;
CREATE TRIGGER trigger_auto_create_referral_code
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION auto_create_referral_code();

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_referral_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_referral_codes_updated_at
BEFORE UPDATE ON referral_codes
FOR EACH ROW
EXECUTE FUNCTION update_referral_updated_at();

CREATE TRIGGER trigger_referrals_updated_at
BEFORE UPDATE ON referrals
FOR EACH ROW
EXECUTE FUNCTION update_referral_updated_at();

-- Add comments
COMMENT ON TABLE referral_codes IS 'Referral codes for users to share with friends';
COMMENT ON TABLE referrals IS 'Track who referred whom and reward status';
COMMENT ON TABLE referral_rewards IS 'Rewards given for successful referrals';
