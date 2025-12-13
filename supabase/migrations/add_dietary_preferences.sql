-- Add dietary preferences to user profiles
-- Enables users to set dietary restrictions and preferences

-- Add dietary_preferences column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS dietary_preferences TEXT[] DEFAULT '{}';

-- Add dietary_tags column to dishes table if it doesn't exist
ALTER TABLE dishes
ADD COLUMN IF NOT EXISTS dietary_tags TEXT[] DEFAULT '{}';

-- Add allergens column to dishes table for allergy warnings
ALTER TABLE dishes
ADD COLUMN IF NOT EXISTS allergens TEXT[] DEFAULT '{}';

-- Create index for faster filtering by dietary tags
CREATE INDEX IF NOT EXISTS idx_dishes_dietary_tags ON dishes USING GIN (dietary_tags);
CREATE INDEX IF NOT EXISTS idx_profiles_dietary_preferences ON profiles USING GIN (dietary_preferences);

-- Add comment explaining the dietary preferences
COMMENT ON COLUMN profiles.dietary_preferences IS 'User dietary preferences and restrictions: vegetarian, vegan, gluten-free, dairy-free, nut-free, halal, kosher, pescatarian, etc.';
COMMENT ON COLUMN dishes.dietary_tags IS 'Dietary tags this dish satisfies: vegetarian, vegan, gluten-free, dairy-free, nut-free, halal, kosher, pescatarian, etc.';
COMMENT ON COLUMN dishes.allergens IS 'Common allergens present in this dish: nuts, dairy, gluten, eggs, soy, shellfish, fish, etc.';

-- Update some seed dishes with dietary tags (examples)
-- This is optional and can be customized based on your actual dishes
UPDATE dishes
SET dietary_tags = ARRAY['vegetarian', 'gluten-free']
WHERE name ILIKE '%salade%' OR name ILIKE '%légumes%';

UPDATE dishes
SET dietary_tags = ARRAY['halal']
WHERE name ILIKE '%poulet%' OR name ILIKE '%boeuf%';
