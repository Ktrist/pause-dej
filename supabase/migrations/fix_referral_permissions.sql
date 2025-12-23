-- ============================================
-- FIX REFERRAL SYSTEM PERMISSIONS
-- ============================================

-- Make functions SECURITY DEFINER so they can access auth.users
ALTER FUNCTION generate_referral_code(UUID) SECURITY DEFINER;
ALTER FUNCTION create_user_referral_code(UUID) SECURITY DEFINER;
ALTER FUNCTION apply_referral_code(UUID, VARCHAR) SECURITY DEFINER;
ALTER FUNCTION process_referral_rewards(UUID) SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION generate_referral_code(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION create_user_referral_code(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION apply_referral_code(UUID, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION process_referral_rewards(UUID) TO authenticated;

-- Grant execute to service role for triggers
GRANT EXECUTE ON FUNCTION generate_referral_code(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION create_user_referral_code(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION apply_referral_code(UUID, VARCHAR) TO service_role;
GRANT EXECUTE ON FUNCTION process_referral_rewards(UUID) TO service_role;

-- Ensure anon can also execute for signup flow
GRANT EXECUTE ON FUNCTION apply_referral_code(UUID, VARCHAR) TO anon;

-- Add missing RLS policy for public read of referral codes
DROP POLICY IF EXISTS "Public can read active codes" ON referral_codes;
CREATE POLICY "Public can read active codes"
ON referral_codes FOR SELECT
TO public
USING (is_active = true);
