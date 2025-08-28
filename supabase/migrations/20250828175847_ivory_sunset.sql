/*
  # Create Admin Table for Access Control

  1. New Tables
    - `admins`
      - `id` (uuid, primary key)
      - `email` (text, unique, required)
      - `is_admin` (boolean, default true)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Initial Data
    - Add thepankajrawat@gmail.com as admin

  3. Security
    - Enable RLS on `admins` table
    - Add policy for authenticated users to read their own admin status
    - Add policy for admins to manage admin table

  4. Purpose
    - Replace auth.users verification with admin table lookup
    - Provide granular admin access control
    - Allow easy admin user management
*/

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  is_admin boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on admins table
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Add initial admin user
INSERT INTO admins (email, is_admin) 
VALUES ('thepankajrawat@gmail.com', true)
ON CONFLICT (email) DO UPDATE SET 
  is_admin = EXCLUDED.is_admin,
  updated_at = now();

-- Create policy for users to check their own admin status
CREATE POLICY "Users can check their own admin status"
  ON admins
  FOR SELECT
  TO authenticated
  USING (email = auth.jwt() ->> 'email');

-- Create policy for admins to manage admin table
CREATE POLICY "Admins can manage admin table"
  ON admins
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE email = auth.jwt() ->> 'email' 
      AND is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE email = auth.jwt() ->> 'email' 
      AND is_admin = true
    )
  );

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_is_admin ON admins(is_admin);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_admins_updated_at 
  BEFORE UPDATE ON admins 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
