-- Fix: Remove UNIQUE constraint from patient_id
-- Allows multiple receipts per patient

-- Drop the current UNIQUE constraint
ALTER TABLE receipts DROP INDEX patient_id_UNIQUE;

-- Verify the fix
DESCRIBE receipts;
