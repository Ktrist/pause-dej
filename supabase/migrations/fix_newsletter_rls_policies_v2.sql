-- =====================================================
-- FIX NEWSLETTER RLS POLICIES V2
-- =====================================================
-- Simplified policies without auth.users table access
-- =====================================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own subscription" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Anyone can subscribe" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Users can insert own subscription" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Users can update own subscription" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Users can upsert subscription" ON newsletter_subscribers;

-- Allow authenticated users to view their own subscription (by user_id only)
CREATE POLICY "Users can view own subscription"
  ON newsletter_subscribers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow anyone (anon + authenticated) to insert
CREATE POLICY "Anyone can subscribe"
  ON newsletter_subscribers FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow authenticated users to update their own subscription
CREATE POLICY "Users can update own subscription"
  ON newsletter_subscribers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to delete their own subscription
CREATE POLICY "Users can delete own subscription"
  ON newsletter_subscribers FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow admins to view all subscriptions
CREATE POLICY "Admins can view all subscriptions"
  ON newsletter_subscribers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
