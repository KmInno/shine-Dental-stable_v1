-- Simplified migration: No separate patients table needed
-- All patient data stays in receipts table

USE receipt_app;

-- Add patient info columns to receipts if they don't exist
ALTER TABLE receipts 
ADD COLUMN IF NOT EXISTS gender ENUM('Male', 'Female', 'Other') DEFAULT NULL,
ADD COLUMN IF NOT EXISTS age INT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS next_visit DATE DEFAULT NULL;

-- Verify receipts table structure
SELECT 'Receipts table verified:' as status;
SELECT COUNT(*) as total_receipts FROM receipts;

SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'receipts' AND TABLE_SCHEMA = 'receipt_app' 
ORDER BY ORDINAL_POSITION;
