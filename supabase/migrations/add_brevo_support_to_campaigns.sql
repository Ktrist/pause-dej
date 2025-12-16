-- =====================================================
-- ADD BREVO SUPPORT TO NEWSLETTER CAMPAIGNS
-- =====================================================
-- Add channel (email/sms) and template_id fields
-- =====================================================

-- Add channel column (email or sms)
ALTER TABLE newsletter_campaigns
ADD COLUMN IF NOT EXISTS channel VARCHAR(10) DEFAULT 'email' NOT NULL
CHECK (channel IN ('email', 'sms'));

-- Add template_id column for Brevo templates
ALTER TABLE newsletter_campaigns
ADD COLUMN IF NOT EXISTS template_id VARCHAR(100);

-- Add index for channel
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_channel ON newsletter_campaigns(channel);

-- Make subject nullable for SMS campaigns
ALTER TABLE newsletter_campaigns
ALTER COLUMN subject DROP NOT NULL;

-- Add phone number support to newsletter_subscribers
ALTER TABLE newsletter_subscribers
ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Add SMS preferences
UPDATE newsletter_subscribers
SET preferences = jsonb_set(
  COALESCE(preferences, '{}'::jsonb),
  '{sms_notifications}',
  'false'::jsonb,
  true
)
WHERE NOT (preferences ? 'sms_notifications');

-- Create index for phone numbers
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_phone ON newsletter_subscribers(phone)
WHERE phone IS NOT NULL;
