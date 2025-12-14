-- =====================================================
-- ADD ADMIN ROLE TO PROFILES
-- =====================================================
-- Add role column to profiles table for admin management
-- =====================================================

-- Add role column to profiles (default 'user')
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user' NOT NULL;

-- Create index for faster role lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Update newsletter_campaigns policies to require admin role
DROP POLICY IF EXISTS "Authenticated users can manage campaigns" ON newsletter_campaigns;

CREATE POLICY "Admins can manage campaigns"
  ON newsletter_campaigns FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Update campaign_recipients policies to require admin role
DROP POLICY IF EXISTS "Authenticated users can view recipients" ON campaign_recipients;

CREATE POLICY "Admins can view recipients"
  ON campaign_recipients FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Optional: Set a specific user as admin (replace with your user ID)
-- UPDATE profiles SET role = 'admin' WHERE email = 'your-admin@email.com';
