-- =====================================================
-- B2B CORE TABLES - MISSING FUNCTIONALITY
-- =====================================================
-- Purpose: Add supporting tables for B2B features
-- Tables: business_addresses, budget_alerts, order_approvals
--
-- Created: 2024-01-21
-- =====================================================

-- =====================================================
-- 1. BUSINESS_ADDRESSES TABLE
-- =====================================================
-- Businesses may have multiple delivery locations (HQ, branches, etc.)

CREATE TABLE IF NOT EXISTS business_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Link to business
  business_id UUID NOT NULL REFERENCES business_accounts(id) ON DELETE CASCADE,

  -- Address Type
  address_type VARCHAR(50) DEFAULT 'delivery' CHECK (address_type IN ('delivery', 'billing', 'both')),

  -- Address Label
  label VARCHAR(100) NOT NULL, -- e.g., "Siège social", "Bureau Annecy", "Entrepôt Lyon"

  -- Address Details
  street VARCHAR(255) NOT NULL,
  postal_code VARCHAR(10) NOT NULL,
  city VARCHAR(100) NOT NULL,
  country VARCHAR(100) DEFAULT 'France',

  -- Additional Info
  is_default BOOLEAN DEFAULT false,
  delivery_instructions TEXT,
  contact_name VARCHAR(100),
  contact_phone VARCHAR(20),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_business_addresses_business ON business_addresses(business_id);
CREATE INDEX idx_business_addresses_default ON business_addresses(business_id, is_default);
CREATE INDEX idx_business_addresses_type ON business_addresses(address_type);

-- Only one default address per business per type
CREATE UNIQUE INDEX idx_business_addresses_unique_default
  ON business_addresses(business_id, address_type)
  WHERE is_default = true;

COMMENT ON TABLE business_addresses IS 'Multiple delivery/billing addresses for B2B accounts';
COMMENT ON COLUMN business_addresses.label IS 'Human-readable name for this address';
COMMENT ON COLUMN business_addresses.delivery_instructions IS 'Special instructions for deliveries to this location';

-- =====================================================
-- 2. BUDGET_ALERTS TABLE
-- =====================================================
-- Alert system for budget threshold notifications

CREATE TABLE IF NOT EXISTS budget_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Link to business and budget
  business_id UUID NOT NULL REFERENCES business_accounts(id) ON DELETE CASCADE,
  budget_id UUID NOT NULL REFERENCES business_budgets(id) ON DELETE CASCADE,

  -- Alert Type
  alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN (
    'threshold_75',      -- 75% budget used
    'threshold_90',      -- 90% budget used
    'budget_depleted',   -- 100% budget used
    'budget_exceeded',   -- Over budget
    'low_balance'        -- Custom threshold
  )),

  -- Threshold
  threshold_percentage INTEGER, -- e.g., 75, 90, 95

  -- Alert Details
  message TEXT NOT NULL,
  amount_used DECIMAL(10,2) NOT NULL,
  amount_remaining DECIMAL(10,2) NOT NULL,
  percentage_used DECIMAL(5,2) NOT NULL,

  -- Notification
  is_read BOOLEAN DEFAULT false,
  notified_at TIMESTAMPTZ,
  notification_sent BOOLEAN DEFAULT false,

  -- Timestamps
  triggered_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_budget_alerts_business ON budget_alerts(business_id);
CREATE INDEX idx_budget_alerts_budget ON budget_alerts(budget_id);
CREATE INDEX idx_budget_alerts_type ON budget_alerts(alert_type);
CREATE INDEX idx_budget_alerts_unread ON budget_alerts(is_read) WHERE is_read = false;
CREATE INDEX idx_budget_alerts_triggered ON budget_alerts(triggered_at DESC);

-- Prevent duplicate alerts for same threshold
CREATE UNIQUE INDEX idx_budget_alerts_unique_threshold
  ON budget_alerts(budget_id, alert_type, DATE_TRUNC('day', triggered_at));

COMMENT ON TABLE budget_alerts IS 'Budget threshold alerts and notifications for businesses';
COMMENT ON COLUMN budget_alerts.alert_type IS 'Type of budget alert triggered';
COMMENT ON COLUMN budget_alerts.percentage_used IS 'Percentage of budget used when alert triggered';

-- =====================================================
-- 3. ORDER_APPROVALS TABLE
-- =====================================================
-- Approval workflow for large orders or over-budget orders

CREATE TABLE IF NOT EXISTS order_approvals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Link to order and business
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES business_accounts(id) ON DELETE CASCADE,

  -- Requester & Approver
  employee_id UUID REFERENCES business_employees(id) ON DELETE SET NULL,
  requested_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Approval Thresholds
  order_amount DECIMAL(10,2) NOT NULL,
  approval_threshold DECIMAL(10,2) NOT NULL,
  reason_code VARCHAR(50) CHECK (reason_code IN (
    'exceeds_threshold',    -- Order amount exceeds approval limit
    'exceeds_budget',       -- Employee budget exceeded
    'first_order',          -- First order requires approval
    'unusual_activity',     -- Flagged as unusual
    'custom'                -- Custom reason
  )),

  -- Status
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
    'pending',
    'approved',
    'rejected',
    'cancelled'
  )),

  -- Details
  request_message TEXT,
  approval_message TEXT,
  rejection_reason TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_order_approvals_order ON order_approvals(order_id);
CREATE INDEX idx_order_approvals_business ON order_approvals(business_id);
CREATE INDEX idx_order_approvals_status ON order_approvals(status);
CREATE INDEX idx_order_approvals_requested_by ON order_approvals(requested_by);
CREATE INDEX idx_order_approvals_approved_by ON order_approvals(approved_by);
CREATE INDEX idx_order_approvals_created ON order_approvals(created_at DESC);

-- One approval request per order
CREATE UNIQUE INDEX idx_order_approvals_unique_order ON order_approvals(order_id);

COMMENT ON TABLE order_approvals IS 'Approval workflow for B2B orders requiring manager approval';
COMMENT ON COLUMN order_approvals.approval_threshold IS 'Threshold amount that triggered the approval requirement';
COMMENT ON COLUMN order_approvals.reason_code IS 'Reason why approval was required';

-- =====================================================
-- 4. ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Business Addresses RLS
ALTER TABLE business_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business managers can view their addresses"
  ON business_addresses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM business_accounts
      WHERE business_accounts.id = business_addresses.business_id
      AND business_accounts.manager_user_id = auth.uid()
    )
  );

CREATE POLICY "Business managers can manage their addresses"
  ON business_addresses FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM business_accounts
      WHERE business_accounts.id = business_addresses.business_id
      AND business_accounts.manager_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all addresses"
  ON business_addresses FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Budget Alerts RLS
ALTER TABLE budget_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business managers can view their alerts"
  ON budget_alerts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM business_accounts
      WHERE business_accounts.id = budget_alerts.business_id
      AND business_accounts.manager_user_id = auth.uid()
    )
  );

CREATE POLICY "Business managers can update their alerts"
  ON budget_alerts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM business_accounts
      WHERE business_accounts.id = budget_alerts.business_id
      AND business_accounts.manager_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all alerts"
  ON budget_alerts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Order Approvals RLS
ALTER TABLE order_approvals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees can view their own approval requests"
  ON order_approvals FOR SELECT
  TO authenticated
  USING (requested_by = auth.uid());

CREATE POLICY "Business managers can view approval requests for their business"
  ON order_approvals FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM business_accounts
      WHERE business_accounts.id = order_approvals.business_id
      AND business_accounts.manager_user_id = auth.uid()
    )
  );

CREATE POLICY "Business managers can approve/reject requests"
  ON order_approvals FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM business_accounts
      WHERE business_accounts.id = order_approvals.business_id
      AND business_accounts.manager_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all approvals"
  ON order_approvals FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- 5. FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at for business_addresses
CREATE OR REPLACE FUNCTION update_business_addresses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_business_addresses_updated_at ON business_addresses;
CREATE TRIGGER trigger_business_addresses_updated_at
  BEFORE UPDATE ON business_addresses
  FOR EACH ROW
  EXECUTE FUNCTION update_business_addresses_updated_at();

-- Function to ensure only one default address per type
CREATE OR REPLACE FUNCTION ensure_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default THEN
    -- Unset other default addresses of same type for this business
    UPDATE business_addresses
    SET is_default = false
    WHERE business_id = NEW.business_id
      AND address_type = NEW.address_type
      AND id != NEW.id
      AND is_default = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_ensure_single_default_address ON business_addresses;
CREATE TRIGGER trigger_ensure_single_default_address
  BEFORE INSERT OR UPDATE ON business_addresses
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_default_address();

-- Function to create budget alert
CREATE OR REPLACE FUNCTION create_budget_alert(
  p_business_id UUID,
  p_budget_id UUID,
  p_alert_type VARCHAR,
  p_threshold_percentage INTEGER,
  p_amount_used DECIMAL,
  p_amount_remaining DECIMAL,
  p_percentage_used DECIMAL
)
RETURNS UUID AS $$
DECLARE
  v_alert_id UUID;
  v_message TEXT;
BEGIN
  -- Generate alert message
  CASE p_alert_type
    WHEN 'threshold_75' THEN
      v_message := 'Alerte: 75% de votre budget a été utilisé. Il reste ' || p_amount_remaining || '€.';
    WHEN 'threshold_90' THEN
      v_message := 'Attention: 90% de votre budget a été utilisé. Il reste ' || p_amount_remaining || '€.';
    WHEN 'budget_depleted' THEN
      v_message := 'Votre budget est épuisé (100% utilisé). Veuillez renouveler votre budget.';
    WHEN 'budget_exceeded' THEN
      v_message := 'Attention: Votre budget a été dépassé de ' || ABS(p_amount_remaining) || '€.';
    ELSE
      v_message := 'Alerte budget: ' || p_percentage_used || '% utilisé.';
  END CASE;

  -- Insert alert (will fail if duplicate due to unique index)
  INSERT INTO budget_alerts (
    business_id,
    budget_id,
    alert_type,
    threshold_percentage,
    message,
    amount_used,
    amount_remaining,
    percentage_used
  )
  VALUES (
    p_business_id,
    p_budget_id,
    p_alert_type,
    p_threshold_percentage,
    v_message,
    p_amount_used,
    p_amount_remaining,
    p_percentage_used
  )
  ON CONFLICT (budget_id, alert_type, DATE_TRUNC('day', triggered_at))
  DO NOTHING
  RETURNING id INTO v_alert_id;

  RETURN v_alert_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION create_budget_alert IS 'Creates a new budget alert if one doesn''t already exist for today';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

COMMENT ON SCHEMA public IS 'B2B core tables added: business_addresses, budget_alerts, order_approvals - Migration 20240121 complete';
