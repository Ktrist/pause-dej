-- Remove duplicate pricing tiers, keeping only one of each
-- First, let's see what we have
SELECT id, tier_name, price_per_person, created_at
FROM business_pricing_tiers
ORDER BY tier_name, created_at;

-- Delete duplicates, keeping the oldest one of each tier
DELETE FROM business_pricing_tiers
WHERE id IN (
  SELECT id
  FROM (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY tier_name ORDER BY created_at ASC) as rn
    FROM business_pricing_tiers
  ) t
  WHERE rn > 1
);

-- Verify we now have only 3 tiers
SELECT tier_name, price_per_person, min_employees, max_employees
FROM business_pricing_tiers
ORDER BY price_per_person ASC;
