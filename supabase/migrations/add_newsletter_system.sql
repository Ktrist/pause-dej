-- =====================================================
-- NEWSLETTER SYSTEM (N2.1, N2.2, N2.3)
-- =====================================================
-- Marketing emails: newsletters, promos, reactivation
-- =====================================================

-- Newsletter Subscribers Table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_subscribed BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  source VARCHAR(50), -- 'homepage', 'checkout', 'account', etc.
  preferences JSONB DEFAULT '{"weekly_newsletter": true, "promotions": true, "product_updates": true}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Newsletter Campaigns Table
CREATE TABLE IF NOT EXISTS newsletter_campaigns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  campaign_type VARCHAR(50) NOT NULL, -- 'newsletter', 'promo', 'reactivation', 'announcement'
  subject VARCHAR(255) NOT NULL,
  preview_text VARCHAR(255),
  content TEXT NOT NULL, -- HTML content
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'scheduled', 'sending', 'sent', 'cancelled'
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  total_recipients INTEGER DEFAULT 0,
  total_sent INTEGER DEFAULT 0,
  total_opened INTEGER DEFAULT 0,
  total_clicked INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaign Recipients (tracking individual sends)
CREATE TABLE IF NOT EXISTS campaign_recipients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_id UUID REFERENCES newsletter_campaigns(id) ON DELETE CASCADE NOT NULL,
  subscriber_id UUID REFERENCES newsletter_subscribers(id) ON DELETE CASCADE NOT NULL,
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  bounced BOOLEAN DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(campaign_id, subscriber_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_user_id ON newsletter_subscribers(user_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_subscribed ON newsletter_subscribers(is_subscribed);
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_status ON newsletter_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_type ON newsletter_campaigns(campaign_type);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_campaign_id ON campaign_recipients(campaign_id);

-- RLS Policies
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_recipients ENABLE ROW LEVEL SECURITY;

-- Users can view and update their own subscription
CREATE POLICY "Users can view own subscription"
  ON newsletter_subscribers FOR SELECT
  USING (auth.uid() = user_id OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can insert own subscription"
  ON newsletter_subscribers FOR INSERT
  WITH CHECK (true); -- Allow anyone to subscribe

CREATE POLICY "Users can update own subscription"
  ON newsletter_subscribers FOR UPDATE
  USING (auth.uid() = user_id OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Allow authenticated users to manage campaigns (can be restricted later)
CREATE POLICY "Authenticated users can manage campaigns"
  ON newsletter_campaigns FOR ALL
  USING (auth.uid() IS NOT NULL);

-- Allow authenticated users to view recipients (can be restricted later)
CREATE POLICY "Authenticated users can view recipients"
  ON campaign_recipients FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- =====================================================
-- Functions
-- =====================================================

-- Function to get subscriber count by type
CREATE OR REPLACE FUNCTION get_subscriber_count(preference_type VARCHAR DEFAULT NULL)
RETURNS INTEGER AS $$
BEGIN
  IF preference_type IS NULL THEN
    RETURN (SELECT COUNT(*) FROM newsletter_subscribers WHERE is_subscribed = true);
  ELSE
    RETURN (
      SELECT COUNT(*)
      FROM newsletter_subscribers
      WHERE is_subscribed = true
        AND (preferences->preference_type)::boolean = true
    );
  END IF;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get inactive users for reactivation campaigns
CREATE OR REPLACE FUNCTION get_inactive_users(days_inactive INTEGER DEFAULT 30)
RETURNS TABLE (
  user_id UUID,
  email VARCHAR,
  full_name VARCHAR,
  last_order_date TIMESTAMPTZ,
  total_orders INTEGER,
  days_since_order INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id as user_id,
    u.email,
    u.raw_user_meta_data->>'full_name' as full_name,
    MAX(o.created_at) as last_order_date,
    COUNT(o.id)::INTEGER as total_orders,
    EXTRACT(day FROM NOW() - MAX(o.created_at))::INTEGER as days_since_order
  FROM auth.users u
  LEFT JOIN orders o ON o.user_id = u.id AND o.status = 'delivered'
  WHERE EXISTS (
    SELECT 1 FROM orders WHERE user_id = u.id AND status = 'delivered'
  )
  GROUP BY u.id, u.email, u.raw_user_meta_data
  HAVING MAX(o.created_at) < NOW() - INTERVAL '1 day' * days_inactive
  ORDER BY last_order_date DESC;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_newsletter_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER newsletter_subscribers_updated_at
  BEFORE UPDATE ON newsletter_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION update_newsletter_updated_at();

CREATE TRIGGER newsletter_campaigns_updated_at
  BEFORE UPDATE ON newsletter_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_newsletter_updated_at();
