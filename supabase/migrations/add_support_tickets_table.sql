-- Migration pour le système de tickets support
-- M7.3: Contact Support

-- Table pour les tickets de support
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  subject VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'general' CHECK (category IN ('general', 'order', 'delivery', 'payment', 'product', 'account', 'other')),
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_order ON support_tickets(order_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created ON support_tickets(created_at DESC);

-- Table pour les réponses aux tickets
CREATE TABLE IF NOT EXISTS support_ticket_responses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  is_staff_response BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ticket_responses_ticket ON support_ticket_responses(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_responses_created ON support_ticket_responses(created_at);

-- RLS Policies pour support_tickets
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Users can view their own tickets
CREATE POLICY "Users can view own tickets"
  ON support_tickets FOR SELECT
  USING (auth.uid() = user_id OR email = (SELECT email FROM profiles WHERE id = auth.uid()));

-- Users can create tickets
CREATE POLICY "Users can create tickets"
  ON support_tickets FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR
    email = (SELECT email FROM profiles WHERE id = auth.uid())
  );

-- Users can update their own open tickets
CREATE POLICY "Users can update own open tickets"
  ON support_tickets FOR UPDATE
  USING (auth.uid() = user_id AND status = 'open')
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all tickets
CREATE POLICY "Admins can view all tickets"
  ON support_tickets FOR SELECT
  USING (auth.role() = 'authenticated');

-- Admins can update all tickets
CREATE POLICY "Admins can update tickets"
  ON support_tickets FOR UPDATE
  USING (auth.role() = 'authenticated');

-- RLS Policies pour support_ticket_responses
ALTER TABLE support_ticket_responses ENABLE ROW LEVEL SECURITY;

-- Users can view responses to their tickets
CREATE POLICY "Users can view responses to own tickets"
  ON support_ticket_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE support_tickets.id = ticket_id
      AND (support_tickets.user_id = auth.uid() OR support_tickets.email = (SELECT email FROM profiles WHERE id = auth.uid()))
    )
  );

-- Users can create responses to their tickets
CREATE POLICY "Users can create responses"
  ON support_ticket_responses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE support_tickets.id = ticket_id
      AND support_tickets.user_id = auth.uid()
    )
  );

-- Admins can manage all responses
CREATE POLICY "Admins can manage responses"
  ON support_ticket_responses FOR ALL
  USING (auth.role() = 'authenticated');

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_support_ticket_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_support_ticket_timestamp();

-- Function to get user's ticket count
CREATE OR REPLACE FUNCTION get_user_ticket_count(user_uuid UUID)
RETURNS TABLE (
  total_tickets BIGINT,
  open_tickets BIGINT,
  resolved_tickets BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) as total_tickets,
    COUNT(*) FILTER (WHERE status IN ('open', 'in_progress')) as open_tickets,
    COUNT(*) FILTER (WHERE status IN ('resolved', 'closed')) as resolved_tickets
  FROM support_tickets
  WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql;
