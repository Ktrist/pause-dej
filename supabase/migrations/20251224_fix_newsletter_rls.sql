-- Migration: Fix Newsletter Subscribers RLS
-- Date: 2025-12-24
-- Description: Ajouter policy permettant aux users de voir leur propre abonnement newsletter

-- Supprimer les anciennes policies
DROP POLICY IF EXISTS "Users can view own subscription" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Users can insert own subscription" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Users can delete own subscription" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Users can update own subscription" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Admins can view all subscribers" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Admins can delete subscribers" ON newsletter_subscribers;

-- Users peuvent voir leur propre abonnement
CREATE POLICY "Users can view own subscription"
  ON newsletter_subscribers FOR SELECT
  USING (
    auth.uid() = user_id
    OR is_admin(auth.uid())
  );

-- Users peuvent créer leur propre abonnement (signup)
CREATE POLICY "Users can insert own subscription"
  ON newsletter_subscribers FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() IS NULL  -- Allow anonymous subscriptions (email only)
  );

-- Users peuvent supprimer leur propre abonnement (unsubscribe)
CREATE POLICY "Users can delete own subscription"
  ON newsletter_subscribers FOR DELETE
  USING (
    auth.uid() = user_id
    OR is_admin(auth.uid())
  );

-- Users peuvent mettre à jour leur propre abonnement
CREATE POLICY "Users can update own subscription"
  ON newsletter_subscribers FOR UPDATE
  USING (
    auth.uid() = user_id
    OR is_admin(auth.uid())
  );

COMMENT ON POLICY "Users can view own subscription" ON newsletter_subscribers IS
  'Users can view their own newsletter subscription or admins can view all';
