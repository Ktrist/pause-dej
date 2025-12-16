-- =====================================================
-- B2B SYSTEM DATABASE SCHEMA
-- =====================================================
-- This migration creates all tables needed for the B2B features
-- Including: businesses, employees, budgets, and B2B-specific orders

-- =====================================================
-- 1. BUSINESS ACCOUNTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS business_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Company Information
  company_name VARCHAR(255) NOT NULL,
  siret VARCHAR(14) UNIQUE NOT NULL, -- French business registration number
  vat_number VARCHAR(20),

  -- Contact Information
  contact_name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(20) NOT NULL,

  -- Address
  address_street VARCHAR(255) NOT NULL,
  address_postal_code VARCHAR(10) NOT NULL,
  address_city VARCHAR(100) NOT NULL,
  address_country VARCHAR(100) DEFAULT 'France',

  -- Business Details
  industry VARCHAR(100),
  employee_count INTEGER,
  description TEXT,

  -- Account Manager (admin user)
  manager_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, active, suspended, cancelled
  approval_date TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Billing
  billing_email VARCHAR(255),
  payment_terms INTEGER DEFAULT 30, -- Days for payment

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX idx_business_accounts_siret ON business_accounts(siret);
CREATE INDEX idx_business_accounts_status ON business_accounts(status);
CREATE INDEX idx_business_accounts_manager ON business_accounts(manager_user_id);

-- =====================================================
-- 2. BUSINESS EMPLOYEES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS business_employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  business_id UUID NOT NULL REFERENCES business_accounts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Employee Info
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  department VARCHAR(100),
  job_title VARCHAR(100),

  -- Role in B2B system
  role VARCHAR(50) DEFAULT 'employee', -- employee, manager, admin

  -- Budget
  individual_budget_monthly DECIMAL(10, 2) DEFAULT 0,
  budget_start_date DATE,

  -- Status
  status VARCHAR(50) DEFAULT 'invited', -- invited, active, suspended, removed
  invitation_sent_at TIMESTAMPTZ,
  invitation_accepted_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(business_id, email)
);

-- Indexes
CREATE INDEX idx_business_employees_business ON business_employees(business_id);
CREATE INDEX idx_business_employees_user ON business_employees(user_id);
CREATE INDEX idx_business_employees_email ON business_employees(email);
CREATE INDEX idx_business_employees_status ON business_employees(status);

-- =====================================================
-- 3. BUSINESS BUDGETS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS business_budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  business_id UUID NOT NULL REFERENCES business_accounts(id) ON DELETE CASCADE,

  -- Budget Period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Budget Amounts
  total_budget DECIMAL(10, 2) NOT NULL DEFAULT 0,
  allocated_budget DECIMAL(10, 2) DEFAULT 0, -- Sum of individual employee budgets
  used_amount DECIMAL(10, 2) DEFAULT 0,
  remaining_amount DECIMAL(10, 2) GENERATED ALWAYS AS (total_budget - used_amount) STORED,

  -- Department-specific budgets (optional)
  department VARCHAR(100),

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(business_id, period_start, period_end, department)
);

-- Indexes
CREATE INDEX idx_business_budgets_business ON business_budgets(business_id);
CREATE INDEX idx_business_budgets_period ON business_budgets(period_start, period_end);
CREATE INDEX idx_business_budgets_active ON business_budgets(is_active);

-- =====================================================
-- 4. BUSINESS ORDERS TABLE (extends regular orders)
-- =====================================================
-- Add B2B columns to existing orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES business_accounts(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS employee_id UUID REFERENCES business_employees(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_b2b_order BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS charged_to_budget BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS department VARCHAR(100);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_orders_business ON orders(business_id);
CREATE INDEX IF NOT EXISTS idx_orders_employee ON orders(employee_id);
CREATE INDEX IF NOT EXISTS idx_orders_is_b2b ON orders(is_b2b_order);

-- =====================================================
-- 5. BUSINESS INVOICES TABLE (monthly consolidated)
-- =====================================================
CREATE TABLE IF NOT EXISTS business_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  business_id UUID NOT NULL REFERENCES business_accounts(id) ON DELETE CASCADE,

  -- Invoice Details
  invoice_number VARCHAR(50) UNIQUE NOT NULL,

  -- Period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Amounts
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,

  -- Order Count
  order_count INTEGER DEFAULT 0,

  -- Status
  status VARCHAR(50) DEFAULT 'draft', -- draft, sent, paid, overdue, cancelled

  -- Payment
  due_date DATE,
  paid_date DATE,
  payment_method VARCHAR(50),

  -- File
  pdf_url TEXT, -- Link to generated PDF

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_business_invoices_business ON business_invoices(business_id);
CREATE INDEX idx_business_invoices_status ON business_invoices(status);
CREATE INDEX idx_business_invoices_period ON business_invoices(period_start, period_end);

-- =====================================================
-- 6. BUSINESS QUOTE REQUESTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS business_quote_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Company Information
  company_name VARCHAR(255) NOT NULL,
  siret VARCHAR(14),

  -- Contact Information
  contact_name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(20) NOT NULL,

  -- Business Details
  employee_count INTEGER NOT NULL,
  estimated_monthly_orders INTEGER,
  industry VARCHAR(100),
  message TEXT,

  -- Status
  status VARCHAR(50) DEFAULT 'new', -- new, contacted, quoted, converted, rejected

  -- Follow-up
  admin_notes TEXT,
  contacted_at TIMESTAMPTZ,
  contacted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Conversion
  converted_to_business_id UUID REFERENCES business_accounts(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_quote_requests_status ON business_quote_requests(status);
CREATE INDEX idx_quote_requests_created ON business_quote_requests(created_at);

-- =====================================================
-- 7. BUSINESS PRICING TIERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS business_pricing_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Tier Information
  tier_name VARCHAR(100) NOT NULL,
  min_employees INTEGER NOT NULL,
  max_employees INTEGER,

  -- Pricing
  discount_percentage DECIMAL(5, 2) DEFAULT 0, -- % discount
  monthly_fee DECIMAL(10, 2) DEFAULT 0, -- Optional monthly subscription fee
  delivery_fee DECIMAL(10, 2) DEFAULT 0, -- Delivery fee per order

  -- Features
  features JSONB, -- List of included features

  -- Status
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default pricing tiers
INSERT INTO business_pricing_tiers (tier_name, min_employees, max_employees, discount_percentage, delivery_fee, features, display_order)
VALUES
  ('Starter', 1, 10, 5, 3.00, '["Commande en ligne", "Suivi des dépenses", "Support email"]'::jsonb, 1),
  ('Business', 11, 50, 10, 2.50, '["Commande en ligne", "Gestion budgets", "Support prioritaire", "Factures mensuelles"]'::jsonb, 2),
  ('Enterprise', 51, NULL, 15, 0, '["Commande en ligne", "Gestion avancée", "Support dédié", "Factures personnalisées", "Livraison gratuite"]'::jsonb, 3)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE business_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_pricing_tiers ENABLE ROW LEVEL SECURITY;

-- Business Accounts Policies
CREATE POLICY "Admins can view all business accounts"
  ON business_accounts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Business managers can view their own business"
  ON business_accounts FOR SELECT
  TO authenticated
  USING (manager_user_id = auth.uid());

CREATE POLICY "Admins can insert business accounts"
  ON business_accounts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update business accounts"
  ON business_accounts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Business Employees Policies
CREATE POLICY "Employees can view their own employee record"
  ON business_employees FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Business managers can view their employees"
  ON business_employees FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM business_accounts
      WHERE business_accounts.id = business_employees.business_id
      AND business_accounts.manager_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all employees"
  ON business_employees FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Business Budgets Policies
CREATE POLICY "Business managers can view their budgets"
  ON business_budgets FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM business_accounts
      WHERE business_accounts.id = business_budgets.business_id
      AND business_accounts.manager_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all budgets"
  ON business_budgets FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Business Invoices Policies
CREATE POLICY "Business managers can view their invoices"
  ON business_invoices FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM business_accounts
      WHERE business_accounts.id = business_invoices.business_id
      AND business_accounts.manager_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all invoices"
  ON business_invoices FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Quote Requests Policies
CREATE POLICY "Anyone can submit quote requests"
  ON business_quote_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view all quote requests"
  ON business_quote_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update quote requests"
  ON business_quote_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Pricing Tiers Policies (public read)
CREATE POLICY "Anyone can view active pricing tiers"
  ON business_pricing_tiers FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage pricing tiers"
  ON business_pricing_tiers FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- 9. FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update business budget usage
CREATE OR REPLACE FUNCTION update_business_budget_usage()
RETURNS TRIGGER AS $$
BEGIN
  -- Update budget when order is placed
  IF NEW.is_b2b_order AND NEW.charged_to_budget THEN
    UPDATE business_budgets
    SET used_amount = used_amount + NEW.total,
        updated_at = NOW()
    WHERE business_id = NEW.business_id
      AND period_start <= CURRENT_DATE
      AND period_end >= CURRENT_DATE
      AND (department IS NULL OR department = NEW.department)
      AND is_active = true;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for budget updates
DROP TRIGGER IF EXISTS trigger_update_budget_on_order ON orders;
CREATE TRIGGER trigger_update_budget_on_order
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_business_budget_usage();

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION generate_business_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL THEN
    NEW.invoice_number := 'B2B-' ||
                          TO_CHAR(NOW(), 'YYYYMM') || '-' ||
                          LPAD(NEXTVAL('business_invoice_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Sequence for invoice numbers
CREATE SEQUENCE IF NOT EXISTS business_invoice_seq START 1;

-- Trigger for invoice number generation
DROP TRIGGER IF EXISTS trigger_generate_invoice_number ON business_invoices;
CREATE TRIGGER trigger_generate_invoice_number
  BEFORE INSERT ON business_invoices
  FOR EACH ROW
  EXECUTE FUNCTION generate_business_invoice_number();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS trigger_business_accounts_updated_at ON business_accounts;
CREATE TRIGGER trigger_business_accounts_updated_at
  BEFORE UPDATE ON business_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_business_employees_updated_at ON business_employees;
CREATE TRIGGER trigger_business_employees_updated_at
  BEFORE UPDATE ON business_employees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_business_budgets_updated_at ON business_budgets;
CREATE TRIGGER trigger_business_budgets_updated_at
  BEFORE UPDATE ON business_budgets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_business_invoices_updated_at ON business_invoices;
CREATE TRIGGER trigger_business_invoices_updated_at
  BEFORE UPDATE ON business_invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 10. VIEWS FOR ANALYTICS
-- =====================================================

-- View: Business spending summary
CREATE OR REPLACE VIEW business_spending_summary AS
SELECT
  ba.id AS business_id,
  ba.company_name,
  COUNT(DISTINCT o.id) AS total_orders,
  COALESCE(SUM(o.total), 0) AS total_spent,
  COALESCE(AVG(o.total), 0) AS average_order_value,
  COUNT(DISTINCT o.employee_id) AS active_employees,
  MAX(o.created_at) AS last_order_date
FROM business_accounts ba
LEFT JOIN orders o ON ba.id = o.business_id AND o.is_b2b_order = true
WHERE ba.status = 'active'
GROUP BY ba.id, ba.company_name;

-- View: Employee spending summary
CREATE OR REPLACE VIEW employee_spending_summary AS
SELECT
  be.id AS employee_id,
  be.business_id,
  be.email,
  be.first_name,
  be.last_name,
  be.department,
  be.individual_budget_monthly,
  COUNT(o.id) AS order_count,
  COALESCE(SUM(o.total), 0) AS total_spent,
  be.individual_budget_monthly - COALESCE(SUM(o.total), 0) AS budget_remaining
FROM business_employees be
LEFT JOIN orders o ON be.id = o.employee_id
  AND o.is_b2b_order = true
  AND o.created_at >= DATE_TRUNC('month', CURRENT_DATE)
WHERE be.status = 'active'
GROUP BY be.id, be.business_id, be.email, be.first_name, be.last_name,
         be.department, be.individual_budget_monthly;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

COMMENT ON TABLE business_accounts IS 'Stores B2B customer company information';
COMMENT ON TABLE business_employees IS 'Links employees to their business accounts';
COMMENT ON TABLE business_budgets IS 'Manages budget allocations per period';
COMMENT ON TABLE business_invoices IS 'Monthly consolidated invoices for businesses';
COMMENT ON TABLE business_quote_requests IS 'Quote requests from potential B2B clients';
COMMENT ON TABLE business_pricing_tiers IS 'Pricing plans for different business sizes';
