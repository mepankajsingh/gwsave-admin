/*
  # Debug Constraint Values - Diagnostic Migration

  1. Purpose
    - Investigate why check constraints are failing
    - Show current constraint definitions
    - Test exact values that should work
    - Identify any character encoding or hidden character issues

  2. Investigation Steps
    - Display current constraint definitions
    - Test each expected value individually
    - Show character codes for expected values
    - Attempt test insertions with detailed error reporting
*/

-- Show current constraint definitions for promo_codes
DO $$
DECLARE
    constraint_def TEXT;
    constraint_name TEXT;
BEGIN
    RAISE NOTICE '=== CURRENT CONSTRAINT ANALYSIS ===';
    
    -- Show all check constraints on promo_codes table
    FOR constraint_name, constraint_def IN
        SELECT 
            cc.constraint_name,
            pg_get_constraintdef(pgc.oid)
        FROM information_schema.check_constraints cc
        JOIN pg_constraint pgc ON cc.constraint_name = pgc.conname
        JOIN information_schema.constraint_column_usage ccu ON cc.constraint_name = ccu.constraint_name
        WHERE ccu.table_name = 'promo_codes'
        AND cc.constraint_schema = current_schema()
    LOOP
        RAISE NOTICE 'Constraint: % = %', constraint_name, constraint_def;
    END LOOP;
END $$;

-- Test expected values one by one
DO $$
DECLARE
    test_regions TEXT[] := ARRAY['americas', 'asia-pacific', 'emea'];
    test_types TEXT[] := ARRAY['starter', 'standard'];
    region_val TEXT;
    type_val TEXT;
    test_code TEXT;
BEGIN
    RAISE NOTICE '=== TESTING EXPECTED VALUES ===';
    
    -- Test each region value individually
    FOREACH region_val IN ARRAY test_regions LOOP
        test_code := 'TEST-REGION-' || upper(replace(region_val, '-', ''));
        
        BEGIN
            RAISE NOTICE 'Testing region: "%" (length: %, char codes: %)', 
                region_val, 
                length(region_val),
                array_to_string(
                    ARRAY(SELECT ascii(substr(region_val, i, 1)) FROM generate_series(1, length(region_val)) i),
                    ','
                );
                
            INSERT INTO promo_codes (code, type, region, is_used) 
            VALUES (test_code, 'starter', region_val, false);
            
            DELETE FROM promo_codes WHERE code = test_code;
            RAISE NOTICE 'Region "%" - SUCCESS', region_val;
            
        EXCEPTION
            WHEN check_violation THEN
                RAISE NOTICE 'Region "%" - FAILED: %', region_val, SQLERRM;
            WHEN unique_violation THEN
                RAISE NOTICE 'Region "%" - SUCCESS (code already exists)', region_val;
                DELETE FROM promo_codes WHERE code = test_code;
            WHEN OTHERS THEN
                RAISE NOTICE 'Region "%" - ERROR: %', region_val, SQLERRM;
        END;
    END LOOP;
    
    -- Test each type value individually
    FOREACH type_val IN ARRAY test_types LOOP
        test_code := 'TEST-TYPE-' || upper(type_val);
        
        BEGIN
            RAISE NOTICE 'Testing type: "%" (length: %, char codes: %)', 
                type_val, 
                length(type_val),
                array_to_string(
                    ARRAY(SELECT ascii(substr(type_val, i, 1)) FROM generate_series(1, length(type_val)) i),
                    ','
                );
                
            INSERT INTO promo_codes (code, type, region, is_used) 
            VALUES (test_code, type_val, 'americas', false);
            
            DELETE FROM promo_codes WHERE code = test_code;
            RAISE NOTICE 'Type "%" - SUCCESS', type_val;
            
        EXCEPTION
            WHEN check_violation THEN
                RAISE NOTICE 'Type "%" - FAILED: %', type_val, SQLERRM;
            WHEN unique_violation THEN
                RAISE NOTICE 'Type "%" - SUCCESS (code already exists)', type_val;
                DELETE FROM promo_codes WHERE code = test_code;
            WHEN OTHERS THEN
                RAISE NOTICE 'Type "%" - ERROR: %', type_val, SQLERRM;
        END;
    END LOOP;
END $$;

-- Clean up any remaining test records
DELETE FROM promo_codes WHERE code LIKE 'TEST-%';
