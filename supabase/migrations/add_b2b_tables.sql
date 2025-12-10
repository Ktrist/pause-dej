-- Migration pour le système B2B
-- B2B.1-B2B.9: Fonctionnalités B2B

-- Table pour les demandes de devis B2B
CREATE TABLE IF NOT EXISTS b2b_quote_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_name VARCHAR(200) NOT NULL,
  contact_name VARCHAR(200) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(20),
  company_size VARCHAR(50) CHECK (company_size IN ('1-10', '11-50', '51-200', '201-500', '500+')),
  estimated_monthly_orders INTEGER,
  budget_range VARCHAR(50),
  delivery_frequency VARCHAR(100),
  special_requirements TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'negotiating', 'accepted', 'rejected')),
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_b2b_quote_requests_status ON b2b_quote_requests(status);
CREATE INDEX IF NOT EXISTS idx_b2b_quote_requests_created ON b2b_quote_requests(created_at DESC);

-- Table pour les comptes entreprise B2B
CREATE TABLE IF NOT EXISTS b2b_accounts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  company_name VARCHAR(200) NOT NULL,
  company_registration VARCHAR(100),
  vat_number VARCHAR(50),
  billing_email VARCHAR(255) NOT NULL,
  payment_terms VARCHAR(50) DEFAULT 'immediate' CHECK (payment_terms IN ('immediate', 'net15', 'net30', 'net60')),
  credit_limit DECIMAL(10,2) DEFAULT 0.00,
  discount_rate DECIMAL(5,2) DEFAULT 0.00,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'closed')),
  contract_start_date DATE,
  contract_end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_b2b_accounts_user ON b2b_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_b2b_accounts_status ON b2b_accounts(status);

-- Table pour les membres d'équipe B2B
CREATE TABLE IF NOT EXISTS b2b_team_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  b2b_account_id UUID REFERENCES b2b_accounts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(200),
  monthly_budget DECIMAL(10,2) DEFAULT 0.00,
  role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('admin', 'manager', 'member')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(b2b_account_id, email)
);

CREATE INDEX IF NOT EXISTS idx_b2b_team_members_account ON b2b_team_members(b2b_account_id);
CREATE INDEX IF NOT EXISTS idx_b2b_team_members_user ON b2b_team_members(user_id);

-- Table pour les packages entreprise
CREATE TABLE IF NOT EXISTS b2b_packages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price_per_person DECIMAL(10,2) NOT NULL,
  min_people INTEGER DEFAULT 1,
  max_people INTEGER,
  items_included JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_b2b_packages_active ON b2b_packages(is_active);

-- Table pour les factures B2B
CREATE TABLE IF NOT EXISTS b2b_invoices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  b2b_account_id UUID REFERENCES b2b_accounts(id) ON DELETE CASCADE NOT NULL,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  discount_amount DECIMAL(10,2) DEFAULT 0.00,
  tax_amount DECIMAL(10,2) DEFAULT 0.00,
  total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  due_date DATE,
  paid_date DATE,
  payment_method VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_b2b_invoices_account ON b2b_invoices(b2b_account_id);
CREATE INDEX IF NOT EXISTS idx_b2b_invoices_status ON b2b_invoices(status);
CREATE INDEX IF NOT EXISTS idx_b2b_invoices_due_date ON b2b_invoices(due_date);

-- RLS Policies pour b2b_quote_requests
ALTER TABLE b2b_quote_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can create a quote request
CREATE POLICY "Anyone can create quote requests"
  ON b2b_quote_requests FOR INSERT
  WITH CHECK (true);

-- Users can view their own quote requests
CREATE POLICY "Users can view own quote requests"
  ON b2b_quote_requests FOR SELECT
  USING (contact_email = (SELECT email FROM profiles WHERE id = auth.uid()));

-- Admins can view all quote requests
CREATE POLICY "Admins can view all quote requests"
  ON b2b_quote_requests FOR ALL
  USING (auth.role() = 'authenticated');

-- RLS Policies pour b2b_accounts
ALTER TABLE b2b_accounts ENABLE ROW LEVEL SECURITY;

-- Users can view their own B2B account
CREATE POLICY "Users can view own b2b account"
  ON b2b_accounts FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can manage all B2B accounts
CREATE POLICY "Admins can manage b2b accounts"
  ON b2b_accounts FOR ALL
  USING (auth.role() = 'authenticated');

-- RLS Policies pour b2b_team_members
ALTER TABLE b2b_team_members ENABLE ROW LEVEL SECURITY;

-- Team members can view their team
CREATE POLICY "Team members can view own team"
  ON b2b_team_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM b2b_accounts
      WHERE b2b_accounts.id = b2b_team_members.b2b_account_id
      AND b2b_accounts.user_id = auth.uid()
    )
    OR auth.uid() = user_id
  );

-- Account admins can manage team members
CREATE POLICY "Account admins can manage team"
  ON b2b_team_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM b2b_accounts
      WHERE b2b_accounts.id = b2b_team_members.b2b_account_id
      AND b2b_accounts.user_id = auth.uid()
    )
  );

-- RLS Policies pour b2b_packages
ALTER TABLE b2b_packages ENABLE ROW LEVEL SECURITY;

-- Anyone can view active packages
CREATE POLICY "Anyone can view active packages"
  ON b2b_packages FOR SELECT
  USING (is_active = true);

-- Admins can manage packages
CREATE POLICY "Admins can manage packages"
  ON b2b_packages FOR ALL
  USING (auth.role() = 'authenticated');

-- RLS Policies pour b2b_invoices
ALTER TABLE b2b_invoices ENABLE ROW LEVEL SECURITY;

-- Account owners can view their invoices
CREATE POLICY "Account owners can view invoices"
  ON b2b_invoices FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM b2b_accounts
      WHERE b2b_accounts.id = b2b_invoices.b2b_account_id
      AND b2b_accounts.user_id = auth.uid()
    )
  );

-- Admins can manage all invoices
CREATE POLICY "Admins can manage invoices"
  ON b2b_invoices FOR ALL
  USING (auth.role() = 'authenticated');

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_b2b_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_b2b_quote_requests_updated_at
  BEFORE UPDATE ON b2b_quote_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_b2b_updated_at();

CREATE TRIGGER update_b2b_accounts_updated_at
  BEFORE UPDATE ON b2b_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_b2b_updated_at();

CREATE TRIGGER update_b2b_packages_updated_at
  BEFORE UPDATE ON b2b_packages
  FOR EACH ROW
  EXECUTE FUNCTION update_b2b_updated_at();

CREATE TRIGGER update_b2b_invoices_updated_at
  BEFORE UPDATE ON b2b_invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_b2b_updated_at();

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION generate_b2b_invoice_number()
RETURNS TEXT AS $$
DECLARE
  year TEXT;
  month TEXT;
  counter INTEGER;
  invoice_num TEXT;
BEGIN
  year := TO_CHAR(NOW(), 'YYYY');
  month := TO_CHAR(NOW(), 'MM');

  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 10) AS INTEGER)), 0) + 1
  INTO counter
  FROM b2b_invoices
  WHERE invoice_number LIKE 'INV-' || year || month || '%';

  invoice_num := 'INV-' || year || month || LPAD(counter::TEXT, 4, '0');

  RETURN invoice_num;
END;
$$ LANGUAGE plpgsql;
