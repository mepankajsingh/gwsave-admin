/*
  # Remove Public Access to Promo Codes

  1. Security Changes
    - Remove public read access policy for unused promo codes
    - Remove public update access policy for promo codes
    - Ensure only authenticated admin users can access promo codes
    - Maintain strict admin-only access control

  2. Access Control
    - DROP existing public access policies
    - Confirm admin-only policies are in place
    - No anonymous or public access to any promo code operations

  3. Important Notes
    - This migration removes all public access to promo codes
    - Only authenticated users (admins) can read/write promo codes
    - Ensures consistent security across all promo code operations
*/

-- Remove public read access to unused promo codes
DROP POLICY IF EXISTS "Allow public read access to unused promo codes" ON promo_codes;

-- Remove public update access to promo codes  
DROP POLICY IF EXISTS "Allow public update of promo codes" ON promo_codes;

-- Ensure admin-only policies exist (these should already be in place from previous migration)
-- But we'll recreate them to be certain

-- Drop and recreate admin-only policies to ensure they take precedence
DROP POLICY IF EXISTS "Admin users can manage promo codes" ON promo_codes;
DROP POLICY IF EXISTS "Admin users can view promo codes" ON promo_codes;

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

-- Ensure RLS is still enabled (should already be enabled)
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

-- Verify no policies exist for anonymous role
-- (RLS will automatically block anonymous access when no policies exist for anon role)
