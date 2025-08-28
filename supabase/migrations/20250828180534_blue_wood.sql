/*
  # Fix Check Constraint Issues for Promo Codes

  1. Problem
    - Existing check constraints on promo_codes table reject valid values
    - Application uses: 'Americas', 'Asia Pacific', 'EMEA' for regions
    - Application uses: 'Starter', 'Standard' for types
    - Previous migration had SQL column ambiguity issues

  2. Solution
    - Safely drop existing problematic check constraints
    - Create new constraints with correct values
    - Fix SQL ambiguity by properly qualifying column names

  3. Constraints
    - region: 'Americas', 'Asia Pacific', 'EMEA'
    - type: 'Starter', 'Standard'
*/

-- Drop any existing region check constraints
DO $$
BEGIN
    -- Find and drop region constraints with qualified column names
    IF EXISTS (
        SELECT 1
        FROM information_schema.constraint_column_usage ccu
        JOIN information_schema.check_constraints cc ON ccu.constraint_name = cc.constraint_name
        WHERE ccu.table_name = 'promo_codes' 
        AND ccu.column_name = 'region'
        AND ccu.constraint_schema = current_schema()
    ) THEN
        -- Drop the existing constraint using qualified column name
        EXECUTE (
            SELECT 'ALTER TABLE promo_codes DROP CONSTRAINT ' || ccu.constraint_name
            FROM information_schema.constraint_column_usage ccu
            JOIN information_schema.check_constraints cc ON ccu.constraint_name = cc.constraint_name
            WHERE ccu.table_name = 'promo_codes' 
            AND ccu.column_name = 'region'
            AND ccu.constraint_schema = current_schema()
            LIMIT 1
        );
    END IF;
END $$;

-- Drop any existing type check constraints
DO $$
BEGIN
    -- Find and drop type constraints with qualified column names
    IF EXISTS (
        SELECT 1
        FROM information_schema.constraint_column_usage ccu
        JOIN information_schema.check_constraints cc ON ccu.constraint_name = cc.constraint_name
        WHERE ccu.table_name = 'promo_codes' 
        AND ccu.column_name = 'type'
        AND ccu.constraint_schema = current_schema()
    ) THEN
        -- Drop the existing constraint using qualified column name
        EXECUTE (
            SELECT 'ALTER TABLE promo_codes DROP CONSTRAINT ' || ccu.constraint_name
            FROM information_schema.constraint_column_usage ccu
            JOIN information_schema.check_constraints cc ON ccu.constraint_name = cc.constraint_name
            WHERE ccu.table_name = 'promo_codes' 
            AND ccu.column_name = 'type'
            AND ccu.constraint_schema = current_schema()
            LIMIT 1
        );
    END IF;
END $$;

-- Drop any specifically named constraints that might exist
ALTER TABLE IF EXISTS promo_codes DROP CONSTRAINT IF EXISTS promo_codes_region_check;
ALTER TABLE IF EXISTS promo_codes DROP CONSTRAINT IF EXISTS promo_codes_region_constraint;
ALTER TABLE IF EXISTS promo_codes DROP CONSTRAINT IF EXISTS promo_codes_type_check;
ALTER TABLE IF EXISTS promo_codes DROP CONSTRAINT IF EXISTS promo_codes_type_constraint;

-- Create new check constraint for region with correct values
ALTER TABLE promo_codes 
ADD CONSTRAINT promo_codes_region_check 
CHECK (region IN ('Americas', 'Asia Pacific', 'EMEA'));

-- Create new check constraint for type with correct values
ALTER TABLE promo_codes 
ADD CONSTRAINT promo_codes_type_check 
CHECK (type IN ('Starter', 'Standard'));
