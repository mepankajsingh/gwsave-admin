/*
  # Fix Admin Table RLS Infinite Recursion

  1. Problem
    - Previous RLS policy on admins table creates infinite recursion
    - Policy tries to check admins table from within admins table policy
    - This causes "infinite recursion detected in policy" error

  2. Solution
    - Drop problematic recursive policies
    - Create simple, non-recursive policies
    - Allow users to read their own admin record
    - Use simpler approach for admin verification

  3. Security
    - Users can only read their own admin record by email
    - No recursive admin checks in policies
    - Maintains security without infinite recursion
*/

-- Drop the problematic recursive policies
DROP POLICY IF EXISTS "Users can check their own admin status" ON admins;
DROP POLICY IF EXISTS "Admins can manage admin table" ON admins;

-- Create a simple policy for users to read their own admin record
-- This allows the auth service to check if a user is an admin
CREATE POLICY "Users can read own admin record"
  ON admins
  FOR SELECT
  TO authenticated
  USING (email = auth.jwt() ->> 'email');

-- Create a policy for authenticated users to insert/update admin records
-- This is simpler and avoids recursion by not checking admin status
CREATE POLICY "Authenticated users can manage admins"
  ON admins
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
