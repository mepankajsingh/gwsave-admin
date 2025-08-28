/*
  # Fix Region Check Constraint for Promo Codes

  1. Problem
    - Existing check constraint on promo_codes.region column rejects valid region values
    - Application uses: 'Americas', 'Asia Pacific', 'EMEA'
    - Database constraint may be expecting different values

  2. Solution
    - Drop existing region check constraint if it exists
    - Create new check constraint with correct region values
    - Ensure constraint matches application logic

  3. Allowed Regions
    - Americas
    - Asia Pacific  
    - EMEA
*/

-- Drop existing check constraint on region if it exists
DO $$
BEGIN
    -- Find and drop any existing check constraints on the region column
    IF EXISTS (
        SELECT 1
        FROM information_schema.constraint_column_usage ccu
        JOIN information_schema.check_constraints cc ON ccu.constraint_name = cc.constraint_name
        WHERE ccu.table_name = 'promo_codes' 
        AND ccu.column_name = 'region'
        AND ccu.constraint_schema = current_schema()
    ) THEN
        -- Drop the existing constraint
        EXECUTE (
            SELECT 'ALTER TABLE promo_codes DROP CONSTRAINT ' || constraint_name
            FROM information_schema.constraint_column_usage ccu
            JOIN information_schema.check_constraints cc ON ccu.constraint_name = cc.constraint_name
            WHERE ccu.table_name = 'promo_codes' 
            AND ccu.column_name = 'region'
            AND ccu.constraint_schema = current_schema()
            LIMIT 1
        );
    END IF;
END $$;

-- Also drop any constraint that might be named specifically
ALTER TABLE IF EXISTS promo_codes DROP CONSTRAINT IF EXISTS promo_codes_region_check;
ALTER TABLE IF EXISTS promo_codes DROP CONSTRAINT IF EXISTS promo_codes_region_constraint;

-- Create new check constraint with correct region values
ALTER TABLE promo_codes 
ADD CONSTRAINT promo_codes_region_check 
CHECK (region IN ('Americas', 'Asia Pacific', 'EMEA'));

-- Similarly fix type constraint if it exists and is problematic
DO $$
BEGIN
    -- Drop existing type constraint if it exists
    IF EXISTS (
        SELECT 1
        FROM information_schema.constraint_column_usage ccu
        JOIN information_schema.check_constraints cc ON ccu.constraint_name = cc.constraint_name
        WHERE ccu.table_name = 'promo_codes' 
        AND ccu.column_name = 'type'
        AND ccu.constraint_schema = current_schema()
    ) THEN
        -- Drop the existing constraint
        EXECUTE (
            SELECT 'ALTER TABLE promo_codes DROP CONSTRAINT ' || constraint_name
            FROM information_schema.constraint_column_usage ccu
            JOIN information_schema.check_constraints cc ON ccu.constraint_name = cc.constraint_name
            WHERE ccu.table_name = 'promo_codes' 
            AND ccu.column_name = 'type'
            AND ccu.constraint_schema = current_schema()
            LIMIT 1
        );
    END IF;
END $$;

-- Drop any specifically named type constraints
ALTER TABLE IF EXISTS promo_codes DROP CONSTRAINT IF EXISTS promo_codes_type_check;
ALTER TABLE IF EXISTS promo_codes DROP CONSTRAINT IF EXISTS promo_codes_type_constraint;

-- Create new check constraint for type with correct values
ALTER TABLE promo_codes 
ADD CONSTRAINT promo_codes_type_check 
CHECK (type IN ('Starter', 'Standard'));
