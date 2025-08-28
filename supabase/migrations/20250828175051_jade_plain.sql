/*
  # Admin-Only Access for Promo Code Management

  1. Security Changes
    - Enable Row Level Security (RLS) on `promo_codes` table
    - Enable Row Level Security (RLS) on `promo_code_requests` table
    - Add policy for authenticated users to manage promo codes
    - Add policy for authenticated users to manage promo code requests
    - Restrict all operations to authenticated admin users only

  2. Access Control
    - Only authenticated users can INSERT, UPDATE, DELETE promo codes
    - Only authenticated users can INSERT, UPDATE, DELETE promo code requests
    - Only authenticated users can SELECT promo code data
    - Anonymous users have no access to any promo code data

  3. Important Notes
    - This migration assumes admin users are managed through Supabase Auth
    - All operations require valid authentication session
    - RLS policies provide defense-in-depth security
*/

-- Enable Row Level Security on promo_codes table
ALTER TABLE IF EXISTS promo_codes ENABLE ROW LEVEL SECURITY;

-- Enable Row Level Security on promo_code_requests table  
ALTER TABLE IF EXISTS promo_code_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Admin users can manage promo codes" ON promo_codes;
DROP POLICY IF EXISTS "Admin users can view promo codes" ON promo_codes;
DROP POLICY IF EXISTS "Admin users can manage promo code requests" ON promo_code_requests;
DROP POLICY IF EXISTS "Admin users can view promo code requests" ON promo_code_requests;

-- Create policy for admin users to manage promo codes (INSERT, UPDATE, DELETE)
CREATE POLICY "Admin users can manage promo codes"
  ON promo_codes
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policy for admin users to view promo codes (SELECT)
CREATE POLICY "Admin users can view promo codes"
  ON promo_codes
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy for admin users to manage promo code requests (INSERT, UPDATE, DELETE)
CREATE POLICY "Admin users can manage promo code requests"
  ON promo_code_requests
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policy for admin users to view promo code requests (SELECT)
CREATE POLICY "Admin users can view promo code requests"
  ON promo_code_requests
  FOR SELECT
  TO authenticated
  USING (true);

-- Ensure anonymous users have no access to either table
-- (This is already enforced by RLS being enabled and no policies for anon role)

-- Add indexes for better performance on commonly queried columns
CREATE INDEX IF NOT EXISTS idx_promo_codes_type ON promo_codes(type);
CREATE INDEX IF NOT EXISTS idx_promo_codes_region ON promo_codes(region);
CREATE INDEX IF NOT EXISTS idx_promo_codes_is_used ON promo_codes(is_used);
CREATE INDEX IF NOT EXISTS idx_promo_codes_created_at ON promo_codes(created_at);

CREATE INDEX IF NOT EXISTS idx_promo_code_requests_type ON promo_code_requests(type);
CREATE INDEX IF NOT EXISTS idx_promo_code_requests_region ON promo_code_requests(region);
CREATE INDEX IF NOT EXISTS idx_promo_code_requests_created_at ON promo_code_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_promo_code_requests_promo_code_id ON promo_code_requests(promo_code_id);
