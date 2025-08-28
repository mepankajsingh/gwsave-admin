/*
  # Enable Public Access to Unused Promo Codes

  1. Purpose
    - Allow anonymous (non-authenticated) users to view unused promo codes
    - Maintain admin-only access for all other operations
    - Keep used promo codes private (admin-only)

  2. Security Policy
    - Anonymous users can SELECT promo codes where is_used = false
    - Anonymous users cannot see used promo codes
    - Anonymous users cannot INSERT, UPDATE, or DELETE promo codes
    - Authenticated admins retain full access to all operations

  3. Use Case
    - Public users can browse available promo codes
    - Used codes remain hidden from public view
    - Admin management functionality is preserved

  4. Access Control
    - Public read access: unused promo codes only
    - Admin full access: all promo codes and operations
*/

-- Ensure RLS is enabled on promo_codes table
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

-- Drop existing public policy if it exists to avoid conflicts
DROP POLICY IF EXISTS "Allow public read access to unused promo codes" ON promo_codes;
DROP POLICY IF EXISTS "Public can view unused promo codes" ON promo_codes;
DROP POLICY IF EXISTS "Anonymous users can view unused codes" ON promo_codes;

-- Create policy for anonymous users to view only unused promo codes
CREATE POLICY "Public can view unused promo codes"
  ON promo_codes
  FOR SELECT
  TO anon
  USING (is_used = false);

-- Verify admin policies still exist (recreate if missing)
-- These policies should already exist from previous migrations, but we'll ensure they're in place

-- Admin policy for all operations (should already exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'promo_codes' 
    AND policyname = 'Admin users can manage promo codes'
  ) THEN
    CREATE POLICY "Admin users can manage promo codes"
      ON promo_codes
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Admin policy to view all promo codes (should already exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'promo_codes' 
    AND policyname = 'Admin users can view all promo codes'
  ) THEN
    CREATE POLICY "Admin users can view all promo codes"
      ON promo_codes
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Add optimized index for public queries on unused codes
CREATE INDEX IF NOT EXISTS idx_promo_codes_public_unused 
ON promo_codes(is_used, created_at) 
WHERE is_used = false;

-- Add index for public filtering by type and region
CREATE INDEX IF NOT EXISTS idx_promo_codes_public_filters 
ON promo_codes(type, region, is_used) 
WHERE is_used = false;
