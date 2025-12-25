-- Migration: Fix RLS Infinite Recursion
-- Date: 2025-12-24
-- Description: Corriger la récursion infinie dans les politiques profiles
--              en utilisant une fonction helper pour vérifier le rôle admin

-- =============================================================================
-- HELPER FUNCTION: Check if user is admin
-- =============================================================================

-- Créer une fonction helper pour vérifier si un utilisateur est admin
-- Cette fonction évite la récursion infinie en utilisant un contexte sécurisé
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- PROFILES TABLE - Fix Recursive Policies
-- =============================================================================

-- Supprimer les anciennes politiques qui causent la récursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Politique pour VIEW: Pas de récursion
-- Les users peuvent voir leur propre profil OU tous les profils s'ils sont admin
CREATE POLICY "Users can view profiles"
  ON profiles FOR SELECT
  USING (
    -- User peut toujours voir son propre profil (pas de subquery)
    auth.uid() = id
    -- OU l'utilisateur est admin (checked by function, no recursion)
    OR is_admin(auth.uid())
  );

-- Politique pour UPDATE: Similaire mais pour les mises à jour
CREATE POLICY "Users can update profiles"
  ON profiles FOR UPDATE
  USING (
    -- User peut toujours modifier son propre profil
    auth.uid() = id
    -- OU l'utilisateur est admin
    OR is_admin(auth.uid())
  );

-- =============================================================================
-- OTHER TABLES - Update to use helper function
-- =============================================================================

-- DISHES
DROP POLICY IF EXISTS "Admins can view all dishes" ON dishes;
DROP POLICY IF EXISTS "Admins can insert dishes" ON dishes;
DROP POLICY IF EXISTS "Admins can update dishes" ON dishes;
DROP POLICY IF EXISTS "Admins can delete dishes" ON dishes;

CREATE POLICY "Admins can view all dishes"
  ON dishes FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert dishes"
  ON dishes FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update dishes"
  ON dishes FOR UPDATE
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete dishes"
  ON dishes FOR DELETE
  USING (is_admin(auth.uid()));

-- ORDERS
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON orders;

CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  USING (
    auth.uid() = user_id
    OR is_admin(auth.uid())
  );

CREATE POLICY "Admins can update all orders"
  ON orders FOR UPDATE
  USING (is_admin(auth.uid()));

-- PROMO_CODES
DROP POLICY IF EXISTS "Admins can view promo codes" ON promo_codes;
DROP POLICY IF EXISTS "Admins can insert promo codes" ON promo_codes;
DROP POLICY IF EXISTS "Admins can update promo codes" ON promo_codes;
DROP POLICY IF EXISTS "Admins can delete promo codes" ON promo_codes;

CREATE POLICY "Admins can view promo codes"
  ON promo_codes FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert promo codes"
  ON promo_codes FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update promo codes"
  ON promo_codes FOR UPDATE
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete promo codes"
  ON promo_codes FOR DELETE
  USING (is_admin(auth.uid()));

-- NEWSLETTER_SUBSCRIBERS
DROP POLICY IF EXISTS "Admins can view all subscribers" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Admins can delete subscribers" ON newsletter_subscribers;

CREATE POLICY "Admins can view all subscribers"
  ON newsletter_subscribers FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete subscribers"
  ON newsletter_subscribers FOR DELETE
  USING (is_admin(auth.uid()));

-- =============================================================================
-- VALIDATION
-- =============================================================================

COMMENT ON FUNCTION is_admin IS
  'Helper function to check if a user has admin role. Uses SECURITY DEFINER to avoid RLS recursion.';

-- Test: Vérifier que la fonction fonctionne
-- SELECT is_admin(auth.uid());
