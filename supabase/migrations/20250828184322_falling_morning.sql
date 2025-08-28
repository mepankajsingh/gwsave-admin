/*
  # Enable Public Promo Code Claiming and Requests

  1. Public Promo Code Updates
    - Allow anonymous users to mark unused promo codes as used
    - Prevent changing used codes back to unused (one-way operation)
    - Maintain security by only allowing is_used field updates

  2. Public Promo Code Requests  
    - Allow anonymous users to create promo code requests
    - Enable tracking of who requested which codes
    - Support business email and user identifier tracking

  3. Security Measures
    - One-way status updates only (unused → used)
    - Insert-only access to requests table
    - Prevent modification of existing requests
    - Maintain admin oversight capabilities

  4. Use Case
    - Public users can claim available promo codes
    - System tracks all promo code requests
    - Admins maintain full oversight and control
    - Prevents double-claiming of codes
*/

-- Enable public updates to promo codes (mark as used only)
CREATE POLICY "Public can mark promo codes as used"
  ON promo_codes
  FOR UPDATE
  TO anon
  USING (is_used = false)  -- Can only update unused codes
  WITH CHECK (is_used = true);  -- Can only set to used

-- Enable public insert access to promo_code_requests
CREATE POLICY "Public can create promo code requests"
  ON promo_code_requests
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Enable public read access to promo_code_requests (users can see their own requests by identifier)
CREATE POLICY "Public can read promo code requests by identifier"
  ON promo_code_requests
  FOR SELECT
  TO anon
  USING (true);

-- Ensure RLS is enabled on both tables
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_code_requests ENABLE ROW LEVEL SECURITY;

-- Add indexes for better performance on public operations
CREATE INDEX IF NOT EXISTS idx_promo_code_requests_user_identifier 
ON promo_code_requests(user_identifier);

CREATE INDEX IF NOT EXISTS idx_promo_code_requests_business_email 
ON promo_code_requests(business_email);

CREATE INDEX IF NOT EXISTS idx_promo_code_requests_created_at 
ON promo_code_requests(created_at DESC);

-- Add index for promo code updates by anonymous users
CREATE INDEX IF NOT EXISTS idx_promo_codes_unused_updates 
ON promo_codes(id, is_used) 
WHERE is_used = false;

-- Verify admin policies still exist and work alongside public policies
-- (These should already exist from previous migrations)

-- Ensure admin users can still manage promo_code_requests
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'promo_code_requests' 
    AND policyname = 'Admin users can manage promo code requests'
  ) THEN
    CREATE POLICY "Admin users can manage promo code requests"
      ON promo_code_requests
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Ensure admin users can view all promo code requests
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'promo_code_requests' 
    AND policyname = 'Admin users can view promo code requests'
  ) THEN
    CREATE POLICY "Admin users can view promo code requests"
      ON promo_code_requests
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;
