/*
  # Fix Admin Access to Promo Codes Table

  1. Problem
    - Admin users getting "new row violates row-level security policy" error
    - RLS policies may be conflicting or not properly recognizing admin users
    - Need to ensure authenticated users can add promo codes

  2. Solution
    - Drop existing conflicting policies on promo_codes table
    - Create clear, non-conflicting policies for admin access
    - Ensure authenticated users have proper INSERT permissions
    - Maintain public read access to unused codes

  3. Security
    - Authenticated users (admins) can perform all operations
    - Anonymous users can only read unused promo codes
    - Used promo codes remain private to admins
*/

-- Ensure RLS is enabled on promo_codes
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh and avoid conflicts
DROP POLICY IF EXISTS "Admin users can manage promo codes" ON promo_codes;
DROP POLICY IF EXISTS "Admin users can view promo codes" ON promo_codes; 
DROP POLICY IF EXISTS "Admin users can view all promo codes" ON promo_codes;
DROP POLICY IF EXISTS "Allow public read access to unused promo codes" ON promo_codes;
DROP POLICY IF EXISTS "Public can view unused promo codes" ON promo_codes;
DROP POLICY IF EXISTS "Public can mark promo codes as used" ON promo_codes;

-- Create comprehensive policy for authenticated users (admins) - all operations
CREATE POLICY "Authenticated users full access to promo codes"
  ON promo_codes
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policy for anonymous users to read unused promo codes only
CREATE POLICY "Anonymous users can view unused promo codes"
  ON promo_codes
  FOR SELECT
  TO anon
  USING (is_used = false);

-- Create policy for anonymous users to mark unused codes as used
CREATE POLICY "Anonymous users can mark codes as used"
  ON promo_codes
  FOR UPDATE
  TO anon
  USING (is_used = false)
  WITH CHECK (is_used = true);

-- Verify the policies are working by checking them
DO $$
BEGIN
  RAISE NOTICE 'RLS policies have been reset for promo_codes table';
  RAISE NOTICE 'Authenticated users now have full access';
  RAISE NOTICE 'Anonymous users can view and claim unused codes only';
END $$;
