-- Migration: Convert patient_id column from INT to VARCHAR(50)
-- This is required because we're now generating patient IDs in the format: sds-YY-MM-NNN

-- First, drop the UNIQUE constraint if it exists
ALTER TABLE receipts DROP INDEX patient_id_UNIQUE;

-- Now modify the column type from INT to VARCHAR(50)
ALTER TABLE receipts MODIFY COLUMN patient_id VARCHAR(50) NULL;

-- Add back the UNIQUE constraint
ALTER TABLE receipts ADD CONSTRAINT patient_id_UNIQUE UNIQUE (patient_id);

-- Verify the change
DESCRIBE receipts;
