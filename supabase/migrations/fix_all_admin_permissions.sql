-- Comprehensive RLS policies for all admin operations
-- This enables the admin dashboard to manage all resources

-- ============================================
-- DISHES TABLE
-- ============================================
DROP POLICY IF EXISTS "Admins can view all dishes" ON dishes;
DROP POLICY IF EXISTS "Admins can insert dishes" ON dishes;
DROP POLICY IF EXISTS "Admins can update dishes" ON dishes;
DROP POLICY IF EXISTS "Admins can delete dishes" ON dishes;

CREATE POLICY "Admins can view all dishes"
  ON dishes FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert dishes"
  ON dishes FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update dishes"
  ON dishes FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete dishes"
  ON dishes FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================
-- DELIVERY ZONES TABLE
-- ============================================
DROP POLICY IF EXISTS "Admins can view all delivery_zones" ON delivery_zones;
DROP POLICY IF EXISTS "Admins can insert delivery_zones" ON delivery_zones;
DROP POLICY IF EXISTS "Admins can update delivery_zones" ON delivery_zones;
DROP POLICY IF EXISTS "Admins can delete delivery_zones" ON delivery_zones;

CREATE POLICY "Admins can view all delivery_zones"
  ON delivery_zones FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert delivery_zones"
  ON delivery_zones FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update delivery_zones"
  ON delivery_zones FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete delivery_zones"
  ON delivery_zones FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================
-- DELIVERY SLOTS TABLE
-- ============================================
DROP POLICY IF EXISTS "Admins can view all delivery_slots" ON delivery_slots;
DROP POLICY IF EXISTS "Admins can insert delivery_slots" ON delivery_slots;
DROP POLICY IF EXISTS "Admins can update delivery_slots" ON delivery_slots;
DROP POLICY IF EXISTS "Admins can delete delivery_slots" ON delivery_slots;

CREATE POLICY "Admins can view all delivery_slots"
  ON delivery_slots FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert delivery_slots"
  ON delivery_slots FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update delivery_slots"
  ON delivery_slots FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete delivery_slots"
  ON delivery_slots FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================
-- DELIVERY ROUTES TABLE
-- ============================================
DROP POLICY IF EXISTS "Admins can view all delivery_routes" ON delivery_routes;
DROP POLICY IF EXISTS "Admins can insert delivery_routes" ON delivery_routes;
DROP POLICY IF EXISTS "Admins can update delivery_routes" ON delivery_routes;
DROP POLICY IF EXISTS "Admins can delete delivery_routes" ON delivery_routes;

CREATE POLICY "Admins can view all delivery_routes"
  ON delivery_routes FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert delivery_routes"
  ON delivery_routes FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update delivery_routes"
  ON delivery_routes FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete delivery_routes"
  ON delivery_routes FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================
-- B2B PACKAGES TABLE
-- ============================================
DROP POLICY IF EXISTS "Admins can view all b2b_packages" ON b2b_packages;
DROP POLICY IF EXISTS "Admins can insert b2b_packages" ON b2b_packages;
DROP POLICY IF EXISTS "Admins can update b2b_packages" ON b2b_packages;
DROP POLICY IF EXISTS "Admins can delete b2b_packages" ON b2b_packages;

CREATE POLICY "Admins can view all b2b_packages"
  ON b2b_packages FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert b2b_packages"
  ON b2b_packages FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update b2b_packages"
  ON b2b_packages FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete b2b_packages"
  ON b2b_packages FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================
-- B2B QUOTE REQUESTS TABLE
-- ============================================
DROP POLICY IF EXISTS "Admins can view all b2b_quote_requests" ON b2b_quote_requests;
DROP POLICY IF EXISTS "Admins can update b2b_quote_requests" ON b2b_quote_requests;

CREATE POLICY "Admins can view all b2b_quote_requests"
  ON b2b_quote_requests FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can update b2b_quote_requests"
  ON b2b_quote_requests FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- B2B ACCOUNTS TABLE
-- ============================================
DROP POLICY IF EXISTS "Admins can view all b2b_accounts" ON b2b_accounts;
DROP POLICY IF EXISTS "Admins can insert b2b_accounts" ON b2b_accounts;
DROP POLICY IF EXISTS "Admins can update b2b_accounts" ON b2b_accounts;

CREATE POLICY "Admins can view all b2b_accounts"
  ON b2b_accounts FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert b2b_accounts"
  ON b2b_accounts FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update b2b_accounts"
  ON b2b_accounts FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- B2B INVOICES TABLE
-- ============================================
DROP POLICY IF EXISTS "Admins can view all b2b_invoices" ON b2b_invoices;
DROP POLICY IF EXISTS "Admins can insert b2b_invoices" ON b2b_invoices;
DROP POLICY IF EXISTS "Admins can update b2b_invoices" ON b2b_invoices;
DROP POLICY IF EXISTS "Admins can delete b2b_invoices" ON b2b_invoices;

CREATE POLICY "Admins can view all b2b_invoices"
  ON b2b_invoices FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert b2b_invoices"
  ON b2b_invoices FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update b2b_invoices"
  ON b2b_invoices FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete b2b_invoices"
  ON b2b_invoices FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================
-- B2B CONTRACT DOCUMENTS TABLE
-- ============================================
DROP POLICY IF EXISTS "Admins can view all b2b_contract_documents" ON b2b_contract_documents;
DROP POLICY IF EXISTS "Admins can insert b2b_contract_documents" ON b2b_contract_documents;
DROP POLICY IF EXISTS "Admins can update b2b_contract_documents" ON b2b_contract_documents;
DROP POLICY IF EXISTS "Admins can delete b2b_contract_documents" ON b2b_contract_documents;

CREATE POLICY "Admins can view all b2b_contract_documents"
  ON b2b_contract_documents FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert b2b_contract_documents"
  ON b2b_contract_documents FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update b2b_contract_documents"
  ON b2b_contract_documents FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete b2b_contract_documents"
  ON b2b_contract_documents FOR DELETE
  USING (auth.role() = 'authenticated');
