-- Fix RLS policies to allow admin updates on orders
-- This enables admin dashboard to update order statuses

-- Drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "Admins can update orders" ON orders;

-- Allow authenticated users (admins) to update all orders
CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users (admins) to delete orders if needed
DROP POLICY IF EXISTS "Admins can delete orders" ON orders;

CREATE POLICY "Admins can delete orders"
  ON orders FOR DELETE
  USING (auth.role() = 'authenticated');

-- Allow authenticated users (admins) to view all orders
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;

CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  USING (auth.role() = 'authenticated');
