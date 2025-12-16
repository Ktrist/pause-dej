-- Function to call Edge Function when order status changes
CREATE OR REPLACE FUNCTION notify_order_status_change()
RETURNS TRIGGER AS $$
DECLARE
  supabase_url text;
  service_role_key text;
  function_url text;
  request_id bigint;
BEGIN
  -- Only send notification if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN

    -- Get Supabase configuration (these should be set as database settings)
    supabase_url := current_setting('app.settings.supabase_url', true);
    service_role_key := current_setting('app.settings.service_role_key', true);

    -- Construct the Edge Function URL
    function_url := supabase_url || '/functions/v1/send-order-notification';

    -- Call the Edge Function asynchronously using pg_net
    -- Note: This requires the pg_net extension to be enabled
    SELECT net.http_post(
      url := function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_role_key
      ),
      body := jsonb_build_object(
        'user_id', NEW.user_id,
        'order_number', NEW.order_number,
        'status', NEW.status,
        'old_status', OLD.status
      )
    ) INTO request_id;

    -- Log the request
    RAISE LOG 'Notification request sent for order % (status: % -> %, request_id: %)',
      NEW.order_number, OLD.status, NEW.status, request_id;

  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the order update
    RAISE WARNING 'Failed to send notification for order %: %', NEW.order_number, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on orders table
DROP TRIGGER IF EXISTS order_status_notification_trigger ON orders;

CREATE TRIGGER order_status_notification_trigger
AFTER UPDATE OF status ON orders
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION notify_order_status_change();

-- Enable pg_net extension if not already enabled
-- This allows making HTTP requests from PostgreSQL
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA net TO postgres, authenticated, service_role;

-- Note: You need to set these configuration values in Supabase:
-- 1. Go to Supabase Dashboard > Settings > Database
-- 2. Under "Custom Postgres Configuration", add:
--    app.settings.supabase_url = 'https://your-project.supabase.co'
--    app.settings.service_role_key = 'your-service-role-key'
--
-- OR you can set them via SQL:
-- ALTER DATABASE postgres SET app.settings.supabase_url = 'https://your-project.supabase.co';
-- ALTER DATABASE postgres SET app.settings.service_role_key = 'your-service-role-key';
