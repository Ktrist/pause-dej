-- =====================================================
-- UPDATE REFERRAL SYSTEM: Single-Use Vouchers
-- =====================================================
-- Modify referral rewards to create single-use promo codes
-- instead of generic credits
-- =====================================================

-- Drop and recreate the process_referral_rewards function
-- to create actual promo codes that are single-use
CREATE OR REPLACE FUNCTION process_referral_rewards(order_id_param UUID)
RETURNS VOID AS $$
DECLARE
  order_record RECORD;
  referral_record RECORD;
  referrer_promo_code_id UUID;
  referred_promo_code_id UUID;
  referrer_promo_code TEXT;
  referred_promo_code TEXT;
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

  -- Generate unique promo codes
  referrer_promo_code := 'PARRAIN' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
  referred_promo_code := 'FILLEUL' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));

  -- Create SINGLE-USE promo code for REFERRER (the person who referred)
  INSERT INTO promo_codes (
    code,
    discount_type,
    discount_value,
    min_order_amount,
    usage_limit,     -- SINGLE USE
    usage_count,
    valid_from,
    valid_until,
    is_active
  ) VALUES (
    referrer_promo_code,
    'fixed',
    referral_record.referrer_reward_amount,
    0,
    1,              -- ⚠️ USAGE LIMITÉ À 1 FOIS
    0,
    NOW(),
    NOW() + INTERVAL '90 days',
    true
  )
  RETURNING id INTO referrer_promo_code_id;

  -- Create SINGLE-USE promo code for REFERRED USER (the invited person)
  INSERT INTO promo_codes (
    code,
    discount_type,
    discount_value,
    min_order_amount,
    usage_limit,     -- SINGLE USE
    usage_count,
    valid_from,
    valid_until,
    is_active
  ) VALUES (
    referred_promo_code,
    'fixed',
    referral_record.referred_reward_amount,
    0,
    1,              -- ⚠️ USAGE LIMITÉ À 1 FOIS
    0,
    NOW(),
    NOW() + INTERVAL '90 days',
    true
  )
  RETURNING id INTO referred_promo_code_id;

  -- Create reward record for REFERRER linked to promo code
  INSERT INTO referral_rewards (
    referral_id,
    user_id,
    reward_type,
    reward_amount,
    promo_code_id,
    expires_at
  ) VALUES (
    referral_record.id,
    referral_record.referrer_user_id,
    'promo_code',   -- Changed from 'credit' to 'promo_code'
    referral_record.referrer_reward_amount,
    referrer_promo_code_id,
    NOW() + INTERVAL '90 days'
  );

  -- Create reward record for REFERRED USER linked to promo code
  INSERT INTO referral_rewards (
    referral_id,
    user_id,
    reward_type,
    reward_amount,
    promo_code_id,
    referred_promo_code_id,
    expires_at
  ) VALUES (
    referral_record.id,
    referral_record.referred_user_id,
    'promo_code',   -- Changed from 'credit' to 'promo_code'
    referral_record.referred_reward_amount,
    referred_promo_code_id,
    NOW() + INTERVAL '90 days'
  );

  -- Mark rewards as given
  UPDATE referrals
  SET referrer_rewarded_at = NOW(),
      referred_rewarded_at = NOW()
  WHERE id = referral_record.id;

  -- Award loyalty points to referrer (unchanged)
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

-- Add comment to clarify the single-use nature
COMMENT ON FUNCTION process_referral_rewards IS 'Crée des bons d''achat à usage unique (coupons) pour le parrain et le filleul après la première commande livrée';

-- Update referral_rewards table comment
COMMENT ON TABLE referral_rewards IS 'Récompenses de parrainage sous forme de bons d''achat à usage unique';
COMMENT ON COLUMN referral_rewards.reward_type IS 'Type de récompense: promo_code (bon d''achat à usage unique), credit, points';
COMMENT ON COLUMN referral_rewards.promo_code_id IS 'ID du code promo à usage unique créé pour cette récompense';
