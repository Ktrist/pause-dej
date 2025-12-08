-- RPC Functions for Pause Dej' Application
-- These functions provide server-side logic for common operations

-- ==============================================
-- Function: increment_promo_code_usage
-- Description: Increments the usage count of a promo code
-- Parameters: promo_id (UUID) - The ID of the promo code
-- Returns: void
-- ==============================================
CREATE OR REPLACE FUNCTION increment_promo_code_usage(promo_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE promo_codes
  SET usage_count = usage_count + 1
  WHERE id = promo_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_promo_code_usage TO authenticated;

-- ==============================================
-- Usage Example:
-- SELECT increment_promo_code_usage('promo-code-uuid-here');
-- ==============================================
