-- ============================================
-- Complete B2B System Database Migration
-- ============================================
-- This creates all tables needed for the B2B functionality

-- 1. Business Accounts Table (Main company records)
CREATE TABLE IF NOT EXISTS business_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    siret VARCHAR(14),
    vat_number VARCHAR(50),
    contact_name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20),
    address_street VARCHAR(255),
    address_city VARCHAR(100),
    address_postal_code VARCHAR(10),
    address_country VARCHAR(100) DEFAULT 'France',

    -- Business settings
    discount_rate DECIMAL(5,2) DEFAULT 0,
    payment_terms INTEGER DEFAULT 30, -- Days
    monthly_budget DECIMAL(10,2) DEFAULT 0,

    -- Status and approval
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'cancelled')),
    approval_date TIMESTAMP WITH TIME ZONE,
    approved_by UUID,

    -- Manager/primary contact user
    manager_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create alias for business_accounts as 'business' for compatibility
DROP VIEW IF EXISTS business CASCADE;
CREATE VIEW business AS SELECT * FROM business_accounts;

-- 2. Business Employees Table
CREATE TABLE IF NOT EXISTS business_employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES business_accounts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    -- Employee info
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    department VARCHAR(100),
    job_title VARCHAR(100),

    -- Budget allocation
    individual_budget_monthly DECIMAL(10,2) DEFAULT 0,

    -- Status
    status VARCHAR(20) DEFAULT 'invited' CHECK (status IN ('invited', 'active', 'suspended', 'removed')),

    -- Invitation tracking
    invitation_token VARCHAR(255) UNIQUE,
    invitation_sent_at TIMESTAMP WITH TIME ZONE,
    invitation_expires_at TIMESTAMP WITH TIME ZONE,
    invitation_accepted_at TIMESTAMP WITH TIME ZONE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(business_id, email)
);

-- 3. Business Budgets Table (Period-based budgets)
CREATE TABLE IF NOT EXISTS business_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES business_accounts(id) ON DELETE CASCADE,

    -- Budget period
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,

    -- Budget amounts
    total_budget DECIMAL(10,2) NOT NULL DEFAULT 0,
    spent_amount DECIMAL(10,2) DEFAULT 0,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(business_id, period_start)
);

-- 4. Business Quote Requests Table
CREATE TABLE IF NOT EXISTS business_quote_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Company info
    company_name VARCHAR(255) NOT NULL,
    siret VARCHAR(14),
    contact_name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20),

    -- Request details
    employee_count INTEGER,
    expected_monthly_volume INTEGER,
    message TEXT,

    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'quoted', 'accepted', 'rejected')),
    admin_notes TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Business Pricing Tiers Table (B2B packages/plans)
CREATE TABLE IF NOT EXISTS business_pricing_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Tier info
    tier_name VARCHAR(100) NOT NULL,
    tier_description TEXT,

    -- Pricing
    price_per_person DECIMAL(10,2) NOT NULL,
    min_employees INTEGER DEFAULT 1,
    max_employees INTEGER,

    -- Features (JSON for flexibility)
    features JSONB DEFAULT '[]'::jsonb,

    -- Discounts and benefits
    discount_rate DECIMAL(5,2) DEFAULT 0,
    free_delivery BOOLEAN DEFAULT FALSE,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if table already exists
ALTER TABLE business_pricing_tiers
ADD COLUMN IF NOT EXISTS tier_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS tier_description TEXT,
ADD COLUMN IF NOT EXISTS price_per_person DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS min_employees INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS max_employees INTEGER,
ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS discount_rate DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS free_delivery BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- 6. Business Invoices Table
CREATE TABLE IF NOT EXISTS business_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES business_accounts(id) ON DELETE CASCADE,

    -- Invoice details
    invoice_number VARCHAR(50) UNIQUE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,

    -- Amounts
    subtotal DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) DEFAULT 0,
    order_count INTEGER DEFAULT 0,

    -- Payment
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
    due_date DATE,
    paid_date DATE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for business_pricing_tiers
CREATE INDEX IF NOT EXISTS idx_pricing_tiers_active ON business_pricing_tiers(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_pricing_tiers_order ON business_pricing_tiers(display_order);

-- 7. Update Orders Table with B2B fields
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS is_b2b_order BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS b2b_company_id UUID REFERENCES business_accounts(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS b2b_employee_id UUID REFERENCES business_employees(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS charged_to_budget BOOLEAN DEFAULT FALSE;

-- Also add business_id for backward compatibility (alias for b2b_company_id)
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES business_accounts(id) ON DELETE SET NULL;

-- Also add employee_id for backward compatibility (alias for b2b_employee_id)
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS employee_id UUID REFERENCES business_employees(id) ON DELETE SET NULL;

-- ============================================
-- INDEXES for Performance
-- ============================================

-- Business accounts indexes
CREATE INDEX IF NOT EXISTS idx_business_accounts_status ON business_accounts(status);
CREATE INDEX IF NOT EXISTS idx_business_accounts_manager ON business_accounts(manager_user_id);

-- Business employees indexes
CREATE INDEX IF NOT EXISTS idx_business_employees_business ON business_employees(business_id);
CREATE INDEX IF NOT EXISTS idx_business_employees_user ON business_employees(user_id);
CREATE INDEX IF NOT EXISTS idx_business_employees_status ON business_employees(status);
CREATE INDEX IF NOT EXISTS idx_business_employees_email ON business_employees(email);

-- Business budgets indexes
CREATE INDEX IF NOT EXISTS idx_business_budgets_business ON business_budgets(business_id);
CREATE INDEX IF NOT EXISTS idx_business_budgets_period ON business_budgets(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_business_budgets_active ON business_budgets(is_active) WHERE is_active = TRUE;

-- Business invoices indexes
CREATE INDEX IF NOT EXISTS idx_business_invoices_business ON business_invoices(business_id);
CREATE INDEX IF NOT EXISTS idx_business_invoices_status ON business_invoices(status);
CREATE INDEX IF NOT EXISTS idx_business_invoices_period ON business_invoices(period_start, period_end);

-- Orders B2B indexes
CREATE INDEX IF NOT EXISTS idx_orders_b2b_company ON orders(b2b_company_id) WHERE b2b_company_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_b2b_employee ON orders(b2b_employee_id) WHERE b2b_employee_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_is_b2b ON orders(is_b2b_order) WHERE is_b2b_order = TRUE;
CREATE INDEX IF NOT EXISTS idx_orders_charged_to_budget ON orders(charged_to_budget) WHERE charged_to_budget = TRUE;
CREATE INDEX IF NOT EXISTS idx_orders_business_id ON orders(business_id) WHERE business_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_employee_id ON orders(employee_id) WHERE employee_id IS NOT NULL;

-- ============================================
-- VIEWS for Analytics
-- ============================================

-- Business spending summary view
CREATE OR REPLACE VIEW business_spending_summary AS
SELECT
    ba.id AS business_id,
    ba.company_name,
    COUNT(DISTINCT o.id) AS total_orders,
    COALESCE(SUM(o.total), 0) AS total_spent,
    COALESCE(AVG(o.total), 0) AS average_order_value,
    COUNT(DISTINCT o.b2b_employee_id) AS active_employees,
    MIN(o.created_at) AS first_order_date,
    MAX(o.created_at) AS last_order_date
FROM business_accounts ba
LEFT JOIN orders o ON o.b2b_company_id = ba.id AND o.is_b2b_order = TRUE
GROUP BY ba.id, ba.company_name;

-- Employee spending summary view
CREATE OR REPLACE VIEW employee_spending_summary AS
SELECT
    be.id AS employee_id,
    be.business_id,
    be.email,
    be.first_name,
    be.last_name,
    be.individual_budget_monthly,
    COUNT(o.id) AS order_count,
    COALESCE(SUM(o.total), 0) AS total_spent,
    COALESCE(AVG(o.total), 0) AS average_order_value
FROM business_employees be
LEFT JOIN orders o ON o.b2b_employee_id = be.id AND o.is_b2b_order = TRUE
GROUP BY be.id, be.business_id, be.email, be.first_name, be.last_name, be.individual_budget_monthly;

-- ============================================
-- COMMENTS for Documentation
-- ============================================

COMMENT ON TABLE business_accounts IS 'B2B company accounts';
COMMENT ON TABLE business_employees IS 'Employees belonging to B2B companies';
COMMENT ON TABLE business_budgets IS 'Period-based budgets for B2B companies';
COMMENT ON TABLE business_quote_requests IS 'Quote requests from potential B2B clients';
COMMENT ON TABLE business_invoices IS 'Monthly invoices for B2B companies';

COMMENT ON COLUMN orders.is_b2b_order IS 'Flag indicating if this order was placed by a B2B employee';
COMMENT ON COLUMN orders.b2b_company_id IS 'Reference to the company if this is a B2B order';
COMMENT ON COLUMN orders.b2b_employee_id IS 'Reference to the employee who placed this B2B order';
COMMENT ON COLUMN orders.charged_to_budget IS 'Flag indicating if this order was charged to the company budget (vs personal card)';
COMMENT ON COLUMN orders.business_id IS 'Alias for b2b_company_id (backward compatibility)';
COMMENT ON COLUMN orders.employee_id IS 'Alias for b2b_employee_id (backward compatibility)';

-- ============================================
-- ROW LEVEL SECURITY (RLS) Policies
-- ============================================
-- Note: Adjust these based on your auth setup

-- Enable RLS on all B2B tables
ALTER TABLE business_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_pricing_tiers ENABLE ROW LEVEL SECURITY;

-- Example policies (customize based on your needs):

-- Drop existing policies first
DROP POLICY IF EXISTS "Managers can view their company" ON business_accounts;
DROP POLICY IF EXISTS "Employees can view their company" ON business_accounts;
DROP POLICY IF EXISTS "Employees can view their own record" ON business_employees;
DROP POLICY IF EXISTS "Employees can view company budget" ON business_budgets;
DROP POLICY IF EXISTS "Anyone can view active pricing tiers" ON business_pricing_tiers;

-- Business accounts: Managers can view their own company
CREATE POLICY "Managers can view their company" ON business_accounts
    FOR SELECT USING (auth.uid() = manager_user_id);

-- Employees can view their company info
CREATE POLICY "Employees can view their company" ON business_accounts
    FOR SELECT USING (
        id IN (
            SELECT business_id FROM business_employees
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Employees can view their own employee record
CREATE POLICY "Employees can view their own record" ON business_employees
    FOR SELECT USING (user_id = auth.uid());

-- Employees can view budget for their company
CREATE POLICY "Employees can view company budget" ON business_budgets
    FOR SELECT USING (
        business_id IN (
            SELECT business_id FROM business_employees
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Pricing tiers are public - anyone can view active tiers
CREATE POLICY "Anyone can view active pricing tiers" ON business_pricing_tiers
    FOR SELECT USING (is_active = true);

-- ============================================
-- SAMPLE DATA - B2B Pricing Tiers
-- ============================================
-- Insert default pricing tiers if they don't exist

INSERT INTO business_pricing_tiers (tier_name, tier_description, price_per_person, min_employees, max_employees, features, discount_rate, free_delivery, is_active, display_order)
VALUES
    (
        'Starter',
        'Parfait pour les petites équipes qui démarrent',
        8.50,
        5,
        20,
        '["Livraison offerte dès 30€", "Support client prioritaire", "Facturation mensuelle"]'::jsonb,
        5.0,
        false,
        true,
        1
    ),
    (
        'Professional',
        'Idéal pour les équipes en croissance',
        7.50,
        21,
        50,
        '["Livraison offerte dès 30€", "Support client dédié", "Budgets individuels personnalisables", "Facturation mensuelle", "Remise de 10%"]'::jsonb,
        10.0,
        true,
        true,
        2
    ),
    (
        'Enterprise',
        'Pour les grandes organisations',
        6.50,
        51,
        NULL,
        '["Livraison toujours offerte", "Account manager dédié", "Budgets personnalisés par employé", "Facturation flexible", "Remise de 15%", "Menus personnalisés"]'::jsonb,
        15.0,
        true,
        true,
        3
    )
ON CONFLICT DO NOTHING;
