/*
  # Debug Current Constraint Values

  1. Purpose
    - Show exactly what values the current constraints expect
    - Verify constraint definitions match frontend expectations
    - Help identify any character encoding or whitespace issues

  2. Investigation
    - Query current constraint definitions
    - Show expected vs actual values
    - Test constraint with expected values
*/

-- Show current constraint definitions
DO $$
DECLARE
    constraint_def TEXT;
BEGIN
    -- Get the current region constraint definition
    SELECT pg_get_constraintdef(oid) INTO constraint_def
    FROM pg_constraint 
    WHERE conname = 'promo_codes_region_final_check';
    
    IF constraint_def IS NOT NULL THEN
        RAISE NOTICE 'Current region constraint: %', constraint_def;
    ELSE
        RAISE NOTICE 'Region constraint promo_codes_region_final_check not found';
    END IF;
    
    -- Get the current type constraint definition  
    SELECT pg_get_constraintdef(oid) INTO constraint_def
    FROM pg_constraint 
    WHERE conname = 'promo_codes_type_final_check';
    
    IF constraint_def IS NOT NULL THEN
        RAISE NOTICE 'Current type constraint: %', constraint_def;
    ELSE
        RAISE NOTICE 'Type constraint promo_codes_type_final_check not found';
    END IF;
END $$;

-- Test if our expected values work with current constraints
DO $$
DECLARE
    test_regions TEXT[] := ARRAY['americas', 'asia-pacific', 'emea'];
    test_types TEXT[] := ARRAY['starter', 'standard'];
    region_val TEXT;
    type_val TEXT;
BEGIN
    RAISE NOTICE 'Testing expected constraint values...';
    
    -- Test each region value
    FOREACH region_val IN ARRAY test_regions LOOP
        BEGIN
            -- Try to insert and immediately delete a test record
            INSERT INTO promo_codes (code, type, region, is_used) 
            VALUES ('TEST-' || upper(region_val), 'starter', region_val, false);
            
            DELETE FROM promo_codes WHERE code = 'TEST-' || upper(region_val);
            
            RAISE NOTICE 'Region value "%" - PASSED', region_val;
        EXCEPTION
            WHEN check_violation THEN
                RAISE WARNING 'Region value "%" - FAILED: %', region_val, SQLERRM;
            WHEN OTHERS THEN
                RAISE WARNING 'Region value "%" - ERROR: %', region_val, SQLERRM;
        END;
    END LOOP;
    
    -- Test each type value  
    FOREACH type_val IN ARRAY test_types LOOP
        BEGIN
            -- Try to insert and immediately delete a test record
            INSERT INTO promo_codes (code, type, region, is_used) 
            VALUES ('TEST-' || upper(type_val), type_val, 'americas', false);
            
            DELETE FROM promo_codes WHERE code = 'TEST-' || upper(type_val);
            
            RAISE NOTICE 'Type value "%" - PASSED', type_val;
        EXCEPTION
            WHEN check_violation THEN
                RAISE WARNING 'Type value "%" - FAILED: %', type_val, SQLERRM;
            WHEN OTHERS THEN
                RAISE WARNING 'Type value "%" - ERROR: %', type_val, SQLERRM;
        END;
    END LOOP;
END $$;

-- Show all current constraints on promo_codes table
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'promo_codes'::regclass 
AND contype = 'c'
ORDER BY conname;
