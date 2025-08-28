/*
  # Fix Region Check Constraint for Promo Codes

  1. Problem
    - Check constraint on promo_codes.region column is rejecting valid values
    - Application sends: 'Americas', 'Asia Pacific', 'EMEA'
    - Database constraint is not allowing these exact values

  2. Solution
    - Drop existing problematic check constraint
    - Create new constraint with correct region values that match the application
    - Ensure constraint allows the exact values used by the frontend

  3. Allowed Values
    - Americas
    - Asia Pacific
    - EMEA
*/

-- Drop existing region check constraint that's causing the violation
ALTER TABLE promo_codes DROP CONSTRAINT IF EXISTS promo_codes_region_check;

-- Also drop any other region-related constraints that might exist
DO $$
DECLARE
    constraint_name text;
BEGIN
    -- Find and drop any check constraints on the region column
    FOR constraint_name IN 
        SELECT cc.constraint_name
        FROM information_schema.check_constraints cc
        JOIN information_schema.constraint_column_usage ccu 
            ON cc.constraint_name = ccu.constraint_name
        WHERE ccu.table_name = 'promo_codes' 
        AND ccu.column_name = 'region'
        AND cc.constraint_schema = current_schema()
    LOOP
        EXECUTE 'ALTER TABLE promo_codes DROP CONSTRAINT ' || constraint_name;
    END LOOP;
END $$;

-- Create new check constraint with the exact values used by the application
ALTER TABLE promo_codes 
ADD CONSTRAINT promo_codes_region_check 
CHECK (region IN ('Americas', 'Asia Pacific', 'EMEA'));

-- Also fix type constraint to ensure it matches application values
ALTER TABLE promo_codes DROP CONSTRAINT IF EXISTS promo_codes_type_check;

-- Drop any other type-related constraints
DO $$
DECLARE
    constraint_name text;
BEGIN
    -- Find and drop any check constraints on the type column
    FOR constraint_name IN 
        SELECT cc.constraint_name
        FROM information_schema.check_constraints cc
        JOIN information_schema.constraint_column_usage ccu 
            ON cc.constraint_name = ccu.constraint_name
        WHERE ccu.table_name = 'promo_codes' 
        AND ccu.column_name = 'type'
        AND cc.constraint_schema = current_schema()
    LOOP
        EXECUTE 'ALTER TABLE promo_codes DROP CONSTRAINT ' || constraint_name;
    END LOOP;
END $$;

-- Create new type constraint with correct values
ALTER TABLE promo_codes 
ADD CONSTRAINT promo_codes_type_check 
CHECK (type IN ('Starter', 'Standard'));

-- Verify the constraints by showing what values are now allowed
DO $$
BEGIN
    RAISE NOTICE 'Region constraint now allows: Americas, Asia Pacific, EMEA';
    RAISE NOTICE 'Type constraint now allows: Starter, Standard';
    RAISE NOTICE 'Constraints have been fixed to match application values';
END $$;
