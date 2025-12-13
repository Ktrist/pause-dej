-- Add missing 'in_transit' status to order_status enum
-- This status is used when an order is out for delivery

-- Check if the value already exists, if not add it
DO $$
BEGIN
    -- Add 'in_transit' if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumlabel = 'in_transit'
        AND enumtypid = (
            SELECT oid FROM pg_type WHERE typname = 'order_status'
        )
    ) THEN
        ALTER TYPE order_status ADD VALUE 'in_transit';
    END IF;
END $$;

-- Ensure all expected order statuses exist
-- Expected statuses: pending, confirmed, preparing, ready, in_transit, delivered, cancelled

COMMENT ON TYPE order_status IS 'Order lifecycle statuses: pending → confirmed → preparing → ready → in_transit → delivered (or cancelled at any point)';
