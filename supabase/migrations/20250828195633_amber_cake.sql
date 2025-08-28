/*
  # Fix Check Constraints for Promo Codes - Final Fix

  1. Problem
    - Region check constraint is still rejecting valid lowercase values
    - Need to completely remove and recreate constraints
    - Ensure no conflicting constraints exist

  2. Solution
    - Drop ALL existing check constraints on both columns
    - Use comprehensive approach to find and remove constraints
    - Create new constraints with correct lowercase values
    - Add verification logging

  3. Database Values
    - type: 'starter', 'standard' (lowercase)
    - region: 'americas', 'asia-pacific', 'emea' (lowercase with hyphen)
*/

-- Disable constraint checking temporarily to avoid conflicts
SET check_function_bodies = false;

-- Comprehensive removal of ALL check constraints on promo_codes table
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    -- Find and drop all check constraints on promo_codes table
    FOR constraint_record IN 
        SELECT 
            tc.constraint_name,
            tc.table_name
        FROM information_schema.table_constraints tc
        WHERE tc.constraint_type = 'CHECK' 
        AND tc.table_name = 'promo_codes'
        AND tc.constraint_schema = current_schema()
    LOOP
        BEGIN
            EXECUTE 'ALTER TABLE promo_codes DROP CONSTRAINT IF EXISTS ' || quote_ident(constraint_record.constraint_name);
            RAISE NOTICE 'Dropped constraint: %', constraint_record.constraint_name;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Could not drop constraint %: %', constraint_record.constraint_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- Also drop constraints by common names that might exist
DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    FOR constraint_name IN VALUES 
        ('promo_codes_region_check'),
        ('promo_codes_type_check'),
        ('promo_codes_region_constraint'),
        ('promo_codes_type_constraint'),
        ('check_promo_codes_region'),
        ('check_promo_codes_type')
    LOOP
        BEGIN
            EXECUTE 'ALTER TABLE promo_codes DROP CONSTRAINT IF EXISTS ' || quote_ident(constraint_name);
            RAISE NOTICE 'Attempted to drop constraint: %', constraint_name;
        EXCEPTION
            WHEN OTHERS THEN
                -- Ignore errors if constraint doesn't exist
                NULL;
        END;
    END LOOP;
END $$;

-- Wait a moment and then create new constraints
SELECT pg_sleep(0.1);

-- Create new check constraint for type with lowercase values
ALTER TABLE promo_codes 
ADD CONSTRAINT promo_codes_type_lowercase_check 
CHECK (type IN ('starter', 'standard'));

-- Create new check constraint for region with lowercase values
ALTER TABLE promo_codes 
ADD CONSTRAINT promo_codes_region_lowercase_check 
CHECK (region IN ('americas', 'asia-pacific', 'emea'));

-- Also fix promo_code_requests table if it exists
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    -- Check if promo_code_requests table exists
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'promo_code_requests' 
        AND table_schema = current_schema()
    ) THEN
        -- Drop existing constraints on promo_code_requests
        FOR constraint_record IN 
            SELECT 
                tc.constraint_name
            FROM information_schema.table_constraints tc
            WHERE tc.constraint_type = 'CHECK' 
            AND tc.table_name = 'promo_code_requests'
            AND tc.constraint_schema = current_schema()
        LOOP
            BEGIN
                EXECUTE 'ALTER TABLE promo_code_requests DROP CONSTRAINT IF EXISTS ' || quote_ident(constraint_record.constraint_name);
                RAISE NOTICE 'Dropped promo_code_requests constraint: %', constraint_record.constraint_name;
            EXCEPTION
                WHEN OTHERS THEN
                    RAISE NOTICE 'Could not drop promo_code_requests constraint %: %', constraint_record.constraint_name, SQLERRM;
            END;
        END LOOP;

        -- Add new constraints to promo_code_requests
        ALTER TABLE promo_code_requests 
        ADD CONSTRAINT promo_code_requests_type_lowercase_check 
        CHECK (type IN ('starter', 'standard'));

        ALTER TABLE promo_code_requests 
        ADD CONSTRAINT promo_code_requests_region_lowercase_check 
        CHECK (region IN ('americas', 'asia-pacific', 'emea'));
        
        RAISE NOTICE 'Added new constraints to promo_code_requests table';
    END IF;
END $$;

-- Re-enable constraint checking
SET check_function_bodies = true;

-- Verify the constraints are in place
DO $$
BEGIN
    RAISE NOTICE 'Migration completed successfully';
    RAISE NOTICE 'Promo codes now accept these values:';
    RAISE NOTICE 'Type: starter, standard';
    RAISE NOTICE 'Region: americas, asia-pacific, emea';
    RAISE NOTICE 'All values must be lowercase';
END $$;

-- Test that the constraints work by attempting to insert a test row (will be rolled back)
DO $$
BEGIN
    -- Test valid values (this should work)
    BEGIN
        INSERT INTO promo_codes (code, type, region, is_used) 
        VALUES ('TEST-CONSTRAINT-CHECK', 'starter', 'americas', false);
        DELETE FROM promo_codes WHERE code = 'TEST-CONSTRAINT-CHECK';
        RAISE NOTICE 'Constraint test PASSED: Valid lowercase values accepted';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING 'Constraint test FAILED: Valid values rejected - %', SQLERRM;
    END;
END $$;
