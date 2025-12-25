-- Migration: Fix Admin RLS Policies (v2 - sans b2b_quotes)
-- Date: 2025-12-24
-- Description: Corriger les politiques RLS qui utilisent auth.role() = 'authenticated'
--              et les remplacer par une vérification du rôle admin dans la table profiles

-- =============================================================================
-- DISHES TABLE - Admin Policies
-- =============================================================================

-- Supprimer les anciennes politiques incorrectes
DROP POLICY IF EXISTS "Admins can view all dishes" ON dishes;
DROP POLICY IF EXISTS "Admins can insert dishes" ON dishes;
DROP POLICY IF EXISTS "Admins can update dishes" ON dishes;
DROP POLICY IF EXISTS "Admins can delete dishes" ON dishes;

-- Créer les politiques correctes avec vérification du rôle admin
CREATE POLICY "Admins can view all dishes"
  ON dishes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert dishes"
  ON dishes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update dishes"
  ON dishes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete dishes"
  ON dishes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =============================================================================
-- ORDERS TABLE - Admin Policies
-- =============================================================================

DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON orders;

CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  USING (
    -- User can view their own orders OR is admin
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update all orders"
  ON orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =============================================================================
-- PROFILES TABLE - Admin Policies
-- =============================================================================

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    -- User can view their own profile OR is admin
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (
    -- User can update their own profile OR admin can update any profile
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =============================================================================
-- PROMO_CODES TABLE - Admin Policies
-- =============================================================================

DROP POLICY IF EXISTS "Admins can manage promo codes" ON promo_codes;
DROP POLICY IF EXISTS "Admins can view promo codes" ON promo_codes;
DROP POLICY IF EXISTS "Admins can insert promo codes" ON promo_codes;
DROP POLICY IF EXISTS "Admins can update promo codes" ON promo_codes;
DROP POLICY IF EXISTS "Admins can delete promo codes" ON promo_codes;

CREATE POLICY "Admins can view promo codes"
  ON promo_codes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert promo codes"
  ON promo_codes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update promo codes"
  ON promo_codes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete promo codes"
  ON promo_codes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =============================================================================
-- NEWSLETTER_SUBSCRIBERS TABLE - Admin Policies
-- =============================================================================

DROP POLICY IF EXISTS "Admins can view all subscribers" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Admins can delete subscribers" ON newsletter_subscribers;

CREATE POLICY "Admins can view all subscribers"
  ON newsletter_subscribers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete subscribers"
  ON newsletter_subscribers FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =============================================================================
-- VALIDATION & TESTING
-- =============================================================================

-- Commenter pour vérifier que les politiques sont bien créées
COMMENT ON POLICY "Admins can view all dishes" ON dishes IS
  'Seuls les utilisateurs avec role=admin dans profiles peuvent voir tous les plats';

COMMENT ON POLICY "Admins can view all orders" ON orders IS
  'Les utilisateurs peuvent voir leurs propres commandes OU être admin';

COMMENT ON POLICY "Admins can view all profiles" ON profiles IS
  'Les utilisateurs peuvent voir leur propre profil OU être admin';

-- Note: Pour tester ces politiques, se connecter avec un utilisateur NON-admin
-- et essayer d'accéder aux données admin. Les requêtes doivent échouer.
