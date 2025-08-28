/*
  # Fix Check Constraints to Use Lowercase Values

  1. Problem
    - Database expects lowercase values: 'standard', 'starter', 'americas', 'asia-pacific', 'emea'
    - Frontend was sending title case values: 'Standard', 'Starter', 'Americas', 'Asia Pacific', 'EMEA'
    - Check constraints were rejecting valid lowercase values

  2. Solution
    - Drop existing check constraints that expect title case
    - Create new constraints with lowercase values that match database expectations
    - Frontend will be updated to send lowercase values

  3. Database Values
    - type: 'starter', 'standard'
    - region: 'americas', 'asia-pacific', 'emea'
*/

-- Drop any existing check constraints on promo_codes table
DO $$
DECLARE
    constraint_name text;
BEGIN
    -- Drop all check constraints on type column
    FOR constraint_name IN 
        SELECT cc.constraint_name
        FROM information_schema.check_constraints cc
        JOIN information_schema.constraint_column_usage ccu 
            ON cc.constraint_name = ccu.constraint_name
        WHERE ccu.table_name = 'promo_codes' 
        AND ccu.column_name = 'type'
        AND cc.constraint_schema = current_schema()
    LOOP
        EXECUTE 'ALTER TABLE promo_codes DROP CONSTRAINT IF EXISTS ' || constraint_name;
    END LOOP;

    -- Drop all check constraints on region column
    FOR constraint_name IN 
        SELECT cc.constraint_name
        FROM information_schema.check_constraints cc
        JOIN information_schema.constraint_column_usage ccu 
            ON cc.constraint_name = ccu.constraint_name
        WHERE ccu.table_name = 'promo_codes' 
        AND ccu.column_name = 'region'
        AND cc.constraint_schema = current_schema()
    LOOP
        EXECUTE 'ALTER TABLE promo_codes DROP CONSTRAINT IF EXISTS ' || constraint_name;
    END LOOP;
END $$;

-- Create new check constraint for type with lowercase values
ALTER TABLE promo_codes 
ADD CONSTRAINT promo_codes_type_check 
CHECK (type IN ('starter', 'standard'));

-- Create new check constraint for region with lowercase values  
ALTER TABLE promo_codes 
ADD CONSTRAINT promo_codes_region_check 
CHECK (region IN ('americas', 'asia-pacific', 'emea'));

-- Also update promo_code_requests table constraints if they exist
DO $$
DECLARE
    constraint_name text;
BEGIN
    -- Drop all check constraints on type column in requests table
    FOR constraint_name IN 
        SELECT cc.constraint_name
        FROM information_schema.check_constraints cc
        JOIN information_schema.constraint_column_usage ccu 
            ON cc.constraint_name = ccu.constraint_name
        WHERE ccu.table_name = 'promo_code_requests' 
        AND ccu.column_name = 'type'
        AND cc.constraint_schema = current_schema()
    LOOP
        EXECUTE 'ALTER TABLE promo_code_requests DROP CONSTRAINT IF EXISTS ' || constraint_name;
    END LOOP;

    -- Drop all check constraints on region column in requests table
    FOR constraint_name IN 
        SELECT cc.constraint_name
        FROM information_schema.check_constraints cc
        JOIN information_schema.constraint_column_usage ccu 
            ON cc.constraint_name = ccu.constraint_name
        WHERE ccu.table_name = 'promo_code_requests' 
        AND ccu.column_name = 'region'
        AND cc.constraint_schema = current_schema()
    LOOP
        EXECUTE 'ALTER TABLE promo_code_requests DROP CONSTRAINT IF EXISTS ' || constraint_name;
    END LOOP;
END $$;

-- Add constraints to promo_code_requests table with lowercase values
ALTER TABLE IF EXISTS promo_code_requests 
ADD CONSTRAINT promo_code_requests_type_check 
CHECK (type IN ('starter', 'standard'));

ALTER TABLE IF EXISTS promo_code_requests 
ADD CONSTRAINT promo_code_requests_region_check 
CHECK (region IN ('americas', 'asia-pacific', 'emea'));

-- Verify the new constraints
DO $$
BEGIN
    RAISE NOTICE 'Updated constraints to use lowercase values:';
    RAISE NOTICE 'Type: starter, standard';
    RAISE NOTICE 'Region: americas, asia-pacific, emea';
END $$;
