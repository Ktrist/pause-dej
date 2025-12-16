-- Create push_subscriptions table
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription JSONB NOT NULL, -- Store the full push subscription object
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id) -- One subscription per user
);

-- Add index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);

-- Add RLS policies
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscriptions
CREATE POLICY "Users can view their own push subscriptions"
ON push_subscriptions FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own subscriptions
CREATE POLICY "Users can create their own push subscriptions"
ON push_subscriptions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own subscriptions
CREATE POLICY "Users can update their own push subscriptions"
ON push_subscriptions FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own subscriptions
CREATE POLICY "Users can delete their own push subscriptions"
ON push_subscriptions FOR DELETE
USING (auth.uid() = user_id);

-- Add function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_push_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at
CREATE TRIGGER push_subscriptions_updated_at
BEFORE UPDATE ON push_subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_push_subscription_updated_at();

-- Grant permissions
GRANT ALL ON push_subscriptions TO authenticated;
GRANT ALL ON push_subscriptions TO service_role;
