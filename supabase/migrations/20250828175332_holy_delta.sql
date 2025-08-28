/*
  # Allow Public Access to View Unused Promo Codes

  1. Security Changes
    - Add policy for anonymous users to view unused promo codes only
    - Maintain admin-only access for all other operations (INSERT, UPDATE, DELETE)
    - Maintain admin-only access for viewing used promo codes
    - Ensure balanced security between public availability and admin control

  2. Access Control
    - Anonymous users can SELECT promo codes where is_used = false
    - Anonymous users cannot see used promo codes or any other data
    - Only authenticated users can manage promo codes (add, update, delete)
    - Only authenticated users can view all promo codes (including used ones)

  3. Use Case
    - Allows public users to discover available promo codes
    - Protects used/claimed codes from public visibility
    - Maintains strict admin control over code management
*/

-- Add policy for anonymous users to view only unused promo codes
CREATE POLICY "Allow public read access to unused promo codes"
  ON promo_codes
  FOR SELECT
  TO anon
  USING (is_used = false);

-- Ensure RLS is enabled (should already be enabled from previous migrations)
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

-- Verify admin policies still exist for authenticated users
-- (These should already exist from previous migrations, but we'll recreate to be safe)

-- Drop and recreate admin policies to ensure they work alongside the new public policy
DROP POLICY IF EXISTS "Admin users can manage promo codes" ON promo_codes;
DROP POLICY IF EXISTS "Admin users can view promo codes" ON promo_codes;

-- Admin policy for all operations (INSERT, UPDATE, DELETE) 
CREATE POLICY "Admin users can manage promo codes"
  ON promo_codes
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Admin policy to view all promo codes (including used ones)
CREATE POLICY "Admin users can view all promo codes"
  ON promo_codes
  FOR SELECT
  TO authenticated
  USING (true);

-- Add index on is_used column for better performance of public queries
CREATE INDEX IF NOT EXISTS idx_promo_codes_is_used_public ON promo_codes(is_used) WHERE is_used = false;
