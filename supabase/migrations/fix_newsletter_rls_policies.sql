-- =====================================================
-- FIX NEWSLETTER RLS POLICIES
-- =====================================================
-- Fix permission issues with newsletter subscribers
-- =====================================================

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can view own subscription" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Users can insert own subscription" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Users can update own subscription" ON newsletter_subscribers;

-- Allow users to view their own subscription (by user_id or email match)
CREATE POLICY "Users can view own subscription"
  ON newsletter_subscribers FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Allow anyone to insert (for signup forms and public subscription)
CREATE POLICY "Anyone can subscribe"
  ON newsletter_subscribers FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow users to update their own subscription
CREATE POLICY "Users can update own subscription"
  ON newsletter_subscribers FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Allow users to upsert (needed for the subscribe hook)
CREATE POLICY "Users can upsert subscription"
  ON newsletter_subscribers FOR ALL
  TO authenticated
  USING (
    auth.uid() = user_id
    OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
  WITH CHECK (
    auth.uid() = user_id
    OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );
