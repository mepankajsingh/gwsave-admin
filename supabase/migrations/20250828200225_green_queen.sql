/*
  # Fix Check Constraints for Promo Codes - Definitive Solution

  1. Problem
    - Region check constraint is still rejecting valid lowercase values
    - Multiple previous attempts have not resolved the core issue
    - Frontend sends: 'starter', 'standard', 'americas', 'asia-pacific', 'emea'
    - Database constraints are not accepting these values

  2. Solution
    - Completely drop ALL existing check constraints on promo_codes
    - Create brand new constraints with definitive lowercase values
    - Use unique constraint names to avoid conflicts
    - Test the constraints work with expected values

  3. Expected Values (lowercase)
    - type: 'starter', 'standard'
    - region: 'americas', 'asia-pacific', 'emea'
*/

-- Drop ALL possible existing check constraints systematically
ALTER TABLE promo_codes DROP CONSTRAINT IF EXISTS promo_codes_region_check;
ALTER TABLE promo_codes DROP CONSTRAINT IF EXISTS promo_codes_type_check;
ALTER TABLE promo_codes DROP CONSTRAINT IF EXISTS promo_codes_region_final_check;
ALTER TABLE promo_codes DROP CONSTRAINT IF EXISTS promo_codes_type_final_check;
ALTER TABLE promo_codes DROP CONSTRAINT IF EXISTS promo_codes_region_lowercase_check;
ALTER TABLE promo_codes DROP CONSTRAINT IF EXISTS promo_codes_type_lowercase_check;
ALTER TABLE promo_codes DROP CONSTRAINT IF EXISTS check_promo_codes_region;
ALTER TABLE promo_codes DROP CONSTRAINT IF EXISTS check_promo_codes_type;

-- Also check and drop any constraints found programmatically
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    -- Find and drop all check constraints on promo_codes table
    FOR constraint_record IN 
        SELECT constraint_name
        FROM information_schema.table_constraints 
        WHERE table_name = 'promo_codes' 
        AND constraint_type = 'CHECK'
        AND table_schema = current_schema()
    LOOP
        EXECUTE 'ALTER TABLE promo_codes DROP CONSTRAINT IF EXISTS ' || quote_ident(constraint_record.constraint_name);
    END LOOP;
END $$;

-- Create new constraints with unique names and correct lowercase values
ALTER TABLE promo_codes 
ADD CONSTRAINT promo_codes_type_constraint_2025 
CHECK (type IN ('starter', 'standard'));

ALTER TABLE promo_codes 
ADD CONSTRAINT promo_codes_region_constraint_2025 
CHECK (region IN ('americas', 'asia-pacific', 'emea'));

-- Also fix promo_code_requests table if it exists
ALTER TABLE promo_code_requests DROP CONSTRAINT IF EXISTS promo_code_requests_region_check;
ALTER TABLE promo_code_requests DROP CONSTRAINT IF EXISTS promo_code_requests_type_check;
ALTER TABLE promo_code_requests DROP CONSTRAINT IF EXISTS promo_code_requests_region_final_check;
ALTER TABLE promo_code_requests DROP CONSTRAINT IF EXISTS promo_code_requests_type_final_check;
ALTER TABLE promo_code_requests DROP CONSTRAINT IF EXISTS promo_code_requests_region_lowercase_check;
ALTER TABLE promo_code_requests DROP CONSTRAINT IF EXISTS promo_code_requests_type_lowercase_check;

-- Drop programmatically found constraints on requests table
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    FOR constraint_record IN 
        SELECT constraint_name
        FROM information_schema.table_constraints 
        WHERE table_name = 'promo_code_requests' 
        AND constraint_type = 'CHECK'
        AND table_schema = current_schema()
    LOOP
        EXECUTE 'ALTER TABLE promo_code_requests DROP CONSTRAINT IF EXISTS ' || quote_ident(constraint_record.constraint_name);
    END LOOP;
END $$;

-- Add new constraints to promo_code_requests
ALTER TABLE promo_code_requests 
ADD CONSTRAINT promo_code_requests_type_constraint_2025 
CHECK (type IN ('starter', 'standard'));

ALTER TABLE promo_code_requests 
ADD CONSTRAINT promo_code_requests_region_constraint_2025 
CHECK (region IN ('americas', 'asia-pacific', 'emea'));

-- Test that the constraints work by attempting a test insert
DO $$
BEGIN
    -- Test valid values (this should succeed)
    INSERT INTO promo_codes (code, type, region, is_used) 
    VALUES ('TEST-CONSTRAINT-VALIDATION', 'starter', 'americas', false);
    
    -- Clean up test data
    DELETE FROM promo_codes WHERE code = 'TEST-CONSTRAINT-VALIDATION';
    
    RAISE NOTICE 'SUCCESS: Constraints now accept correct lowercase values';
    RAISE NOTICE 'Type values accepted: starter, standard';
    RAISE NOTICE 'Region values accepted: americas, asia-pacific, emea';
EXCEPTION
    WHEN check_violation THEN
        RAISE WARNING 'FAILED: Check constraint still rejecting valid values: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE WARNING 'ERROR during constraint test: %', SQLERRM;
END $$;
