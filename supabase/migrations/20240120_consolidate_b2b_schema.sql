-- =====================================================
-- B2B SCHEMA CONSOLIDATION MIGRATION
-- =====================================================
-- Purpose: Consolidate old b2b_* tables into business_* schema
-- This migration:
-- 1. Drops old b2b_* tables (add_b2b_tables.sql) if they exist
-- 2. Migrates any data to business_* tables
-- 3. Adds missing columns to business_* tables for full B2B feature set
--
-- Created: 2024-01-20
-- =====================================================

-- =====================================================
-- STEP 1: MIGRATE DATA FROM OLD SCHEMA TO NEW
-- =====================================================

-- Migrate b2b_quote_requests → business_quote_requests (if data exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'b2b_quote_requests') THEN
    INSERT INTO business_quote_requests (
      id,
      company_name,
      contact_name,
      contact_email,
      contact_phone,
      employee_count,
      estimated_monthly_orders,
      message,
      status,
      admin_notes,
      created_at,
      updated_at
    )
    SELECT
      id,
      company_name,
      contact_name,
      contact_email,
      contact_phone,
      CASE company_size
        WHEN '1-10' THEN 5
        WHEN '11-50' THEN 30
        WHEN '51-200' THEN 125
        WHEN '201-500' THEN 350
        WHEN '500+' THEN 1000
        ELSE 50
      END,
      estimated_monthly_orders,
      special_requirements,
      CASE
        WHEN status = 'pending' THEN 'new'
        WHEN status = 'contacted' THEN 'contacted'
        WHEN status = 'accepted' THEN 'converted'
        WHEN status = 'rejected' THEN 'rejected'
        ELSE 'new'
      END,
      notes,
      created_at,
      updated_at
    FROM b2b_quote_requests
    ON CONFLICT (id) DO NOTHING; -- Skip if already exists
  END IF;
END $$;

-- Migrate b2b_accounts → business_accounts (if data exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'b2b_accounts') THEN
    INSERT INTO business_accounts (
      id,
      company_name,
      siret,
      vat_number,
      contact_name,
      contact_email,
      contact_phone,
      address_street,
      address_postal_code,
      address_city,
      manager_user_id,
      status,
      billing_email,
      payment_terms,
      created_at,
      updated_at
    )
    SELECT
      id,
      company_name,
      COALESCE(company_registration, '00000000000000'),
      vat_number,
      'Manager', -- Default contact name
      billing_email,
      '', -- Default empty phone
      '', -- Default empty street
      '', -- Default empty postal code
      '', -- Default empty city
      user_id,
      status,
      billing_email,
      CASE payment_terms
        WHEN 'net15' THEN 15
        WHEN 'net30' THEN 30
        WHEN 'net60' THEN 60
        ELSE 30
      END,
      created_at,
      updated_at
    FROM b2b_accounts
    ON CONFLICT (siret) DO NOTHING; -- Skip if already exists
  END IF;
END $$;

-- =====================================================
-- STEP 2: DROP OLD B2B_* TABLES
-- =====================================================

-- Drop old tables in reverse dependency order
DROP TABLE IF EXISTS b2b_contract_documents CASCADE;
DROP TABLE IF EXISTS b2b_invoices CASCADE;
DROP TABLE IF EXISTS b2b_team_members CASCADE;
DROP TABLE IF EXISTS b2b_packages CASCADE;
DROP TABLE IF EXISTS b2b_accounts CASCADE;
DROP TABLE IF EXISTS b2b_quote_requests CASCADE;

-- Drop old functions if they exist
DROP FUNCTION IF EXISTS update_b2b_updated_at() CASCADE;
DROP FUNCTION IF EXISTS generate_b2b_invoice_number() CASCADE;

COMMENT ON SCHEMA public IS 'Cleaned up old b2b_* tables, consolidated to business_* schema';

-- =====================================================
-- STEP 3: EXTEND BUSINESS_ACCOUNTS TABLE
-- =====================================================

-- Add billing address columns (separate from main address)
ALTER TABLE business_accounts
ADD COLUMN IF NOT EXISTS billing_address_street VARCHAR(255),
ADD COLUMN IF NOT EXISTS billing_address_city VARCHAR(100),
ADD COLUMN IF NOT EXISTS billing_address_postal_code VARCHAR(10),
ADD COLUMN IF NOT EXISTS billing_address_country VARCHAR(100) DEFAULT 'France';

-- Add business details
ALTER TABLE business_accounts
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- discount_rate and credit_limit already exist from 20240118_b2b_system.sql
-- but let's add them conditionally just in case
ALTER TABLE business_accounts
ADD COLUMN IF NOT EXISTS discount_rate DECIMAL(5,2) DEFAULT 0.00;

-- Add index for logo_url for faster lookups
CREATE INDEX IF NOT EXISTS idx_business_accounts_logo ON business_accounts(id) WHERE logo_url IS NOT NULL;

COMMENT ON COLUMN business_accounts.billing_address_street IS 'Separate billing address if different from main address';
COMMENT ON COLUMN business_accounts.notes IS 'Internal admin notes about the business account';
COMMENT ON COLUMN business_accounts.logo_url IS 'URL to company logo for branding';
COMMENT ON COLUMN business_accounts.discount_rate IS 'Custom discount percentage for this business (0-100)';

-- =====================================================
-- STEP 4: EXTEND BUSINESS_EMPLOYEES TABLE
-- =====================================================

-- Add invitation tracking columns
ALTER TABLE business_employees
ADD COLUMN IF NOT EXISTS invitation_token VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS invitation_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_order_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS total_spent_current_period DECIMAL(10,2) DEFAULT 0.00;

-- Add index for invitation token lookups
CREATE INDEX IF NOT EXISTS idx_business_employees_invitation_token
  ON business_employees(invitation_token)
  WHERE invitation_token IS NOT NULL;

-- Add index for last order date sorting
CREATE INDEX IF NOT EXISTS idx_business_employees_last_order
  ON business_employees(last_order_date DESC NULLS LAST);

COMMENT ON COLUMN business_employees.invitation_token IS 'Secure token for employee invitation link (expires in 7 days)';
COMMENT ON COLUMN business_employees.invitation_expires_at IS 'Expiration timestamp for invitation token';
COMMENT ON COLUMN business_employees.last_order_date IS 'Last time employee placed an order';
COMMENT ON COLUMN business_employees.total_spent_current_period IS 'Total spent in current budget period';

-- =====================================================
-- STEP 5: EXTEND BUSINESS_INVOICES TABLE
-- =====================================================

-- Add invoice generation tracking
ALTER TABLE business_invoices
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS csv_export_url TEXT,
ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ;

-- Add index for sent invoices
CREATE INDEX IF NOT EXISTS idx_business_invoices_sent
  ON business_invoices(sent_at DESC NULLS LAST);

COMMENT ON COLUMN business_invoices.discount_amount IS 'Business-specific discount applied to invoice';
COMMENT ON COLUMN business_invoices.csv_export_url IS 'URL to detailed CSV export for accounting';
COMMENT ON COLUMN business_invoices.sent_at IS 'Timestamp when invoice was emailed to customer';

-- =====================================================
-- STEP 5B: CREATE BUSINESS_CONTRACT_DOCUMENTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS business_contract_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES business_accounts(id) ON DELETE CASCADE,

  -- Document Details
  document_type VARCHAR(50) DEFAULT 'contract' CHECK (document_type IN ('contract', 'amendment', 'terms', 'nda', 'other')),
  document_name VARCHAR(200) NOT NULL,
  document_url TEXT NOT NULL,
  file_size INTEGER, -- in bytes
  mime_type VARCHAR(100),
  version VARCHAR(20),

  -- Dates
  signed_date DATE,
  expiry_date DATE,

  -- Status
  is_active BOOLEAN DEFAULT true,
  notes TEXT,

  -- Tracking
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_business_contract_documents_business ON business_contract_documents(business_id);
CREATE INDEX IF NOT EXISTS idx_business_contract_documents_type ON business_contract_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_business_contract_documents_active ON business_contract_documents(is_active);

-- RLS Policies
ALTER TABLE business_contract_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business managers can view their contract documents"
  ON business_contract_documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM business_accounts
      WHERE business_accounts.id = business_contract_documents.business_id
      AND business_accounts.manager_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all contract documents"
  ON business_contract_documents FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trigger_business_contract_documents_updated_at ON business_contract_documents;
CREATE TRIGGER trigger_business_contract_documents_updated_at
  BEFORE UPDATE ON business_contract_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE business_contract_documents IS 'Contract documents and legal agreements for B2B accounts';

-- =====================================================
-- STEP 6: ADD HELPER FUNCTIONS
-- =====================================================

-- Function to clean up expired invitation tokens (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_invitation_tokens()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  UPDATE business_employees
  SET invitation_token = NULL,
      invitation_expires_at = NULL
  WHERE invitation_expires_at < NOW()
    AND status = 'invited';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_expired_invitation_tokens() IS
  'Clears expired invitation tokens from business_employees table';

-- =====================================================
-- STEP 7: UPDATE VIEWS
-- =====================================================

-- Recreate employee spending view to include new columns
CREATE OR REPLACE VIEW employee_spending_summary AS
SELECT
  be.id AS employee_id,
  be.business_id,
  be.email,
  be.first_name,
  be.last_name,
  be.department,
  be.individual_budget_monthly,
  be.status,
  be.last_order_date,
  COUNT(o.id) AS order_count,
  COALESCE(SUM(CASE WHEN o.created_at >= DATE_TRUNC('month', CURRENT_DATE) THEN o.total ELSE 0 END), 0) AS total_spent_this_month,
  COALESCE(SUM(o.total), 0) AS total_spent_all_time,
  be.individual_budget_monthly - COALESCE(SUM(CASE WHEN o.created_at >= DATE_TRUNC('month', CURRENT_DATE) THEN o.total ELSE 0 END), 0) AS budget_remaining
FROM business_employees be
LEFT JOIN orders o ON be.id = o.employee_id
  AND o.is_b2b_order = true
  AND o.charged_to_budget = true
WHERE be.status IN ('active', 'invited')
GROUP BY be.id, be.business_id, be.email, be.first_name, be.last_name,
         be.department, be.individual_budget_monthly, be.status, be.last_order_date;

-- =====================================================
-- STEP 8: VERIFICATION QUERIES (FOR TESTING)
-- =====================================================

-- Count of tables in new schema
DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name LIKE 'business_%';

  RAISE NOTICE 'Total business_* tables: %', table_count;
END $$;

-- Verify no old b2b_* tables remain
DO $$
DECLARE
  old_table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO old_table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name LIKE 'b2b_%';

  IF old_table_count > 0 THEN
    RAISE WARNING 'Warning: % old b2b_* tables still exist', old_table_count;
  ELSE
    RAISE NOTICE 'Success: All old b2b_* tables removed';
  END IF;
END $$;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

COMMENT ON SCHEMA public IS 'B2B schema consolidated to business_* tables - Migration 20240120 complete';
