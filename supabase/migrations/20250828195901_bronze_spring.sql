/*
  # Fix Check Constraints for Promo Codes - Clean Version

  1. Problem
    - Check constraints on promo_codes table are rejecting valid lowercase values
    - Frontend sends: 'starter', 'standard', 'americas', 'asia-pacific', 'emea'
    - Need to ensure database accepts these exact values

  2. Solution
    - Drop existing problematic constraints systematically
    - Create new constraints with correct lowercase values
    - No pg_sleep or complex operations that might cause issues

  3. Expected Values
    - type: 'starter', 'standard'
    - region: 'americas', 'asia-pacific', 'emea'
*/

-- Drop existing constraints by name if they exist
ALTER TABLE promo_codes DROP CONSTRAINT IF EXISTS promo_codes_region_check;
ALTER TABLE promo_codes DROP CONSTRAINT IF EXISTS promo_codes_type_check;
ALTER TABLE promo_codes DROP CONSTRAINT IF EXISTS promo_codes_region_constraint;
ALTER TABLE promo_codes DROP CONSTRAINT IF EXISTS promo_codes_type_constraint;
ALTER TABLE promo_codes DROP CONSTRAINT IF EXISTS promo_codes_region_lowercase_check;
ALTER TABLE promo_codes DROP CONSTRAINT IF EXISTS promo_codes_type_lowercase_check;

-- Drop any other possible constraint names
ALTER TABLE promo_codes DROP CONSTRAINT IF EXISTS check_promo_codes_region;
ALTER TABLE promo_codes DROP CONSTRAINT IF EXISTS check_promo_codes_type;

-- Create new type constraint with correct lowercase values
ALTER TABLE promo_codes 
ADD CONSTRAINT promo_codes_type_final_check 
CHECK (type IN ('starter', 'standard'));

-- Create new region constraint with correct lowercase values
ALTER TABLE promo_codes 
ADD CONSTRAINT promo_codes_region_final_check 
CHECK (region IN ('americas', 'asia-pacific', 'emea'));

-- Also fix promo_code_requests table if it exists
ALTER TABLE IF EXISTS promo_code_requests DROP CONSTRAINT IF EXISTS promo_code_requests_region_check;
ALTER TABLE IF EXISTS promo_code_requests DROP CONSTRAINT IF EXISTS promo_code_requests_type_check;
ALTER TABLE IF EXISTS promo_code_requests DROP CONSTRAINT IF EXISTS promo_code_requests_region_lowercase_check;
ALTER TABLE IF EXISTS promo_code_requests DROP CONSTRAINT IF EXISTS promo_code_requests_type_lowercase_check;

-- Add constraints to promo_code_requests with correct values
ALTER TABLE IF EXISTS promo_code_requests 
ADD CONSTRAINT promo_code_requests_type_final_check 
CHECK (type IN ('starter', 'standard'));

ALTER TABLE IF EXISTS promo_code_requests 
ADD CONSTRAINT promo_code_requests_region_final_check 
CHECK (region IN ('americas', 'asia-pacific', 'emea'));
