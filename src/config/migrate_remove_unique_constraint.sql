-- Migration: Remove UNIQUE constraint from patient_id
-- This allows multiple receipts per patient
-- Run this in your MySQL database

USE receipt_app;

-- Drop the UNIQUE constraint
ALTER TABLE receipts DROP INDEX patient_id_UNIQUE;

-- Add a regular index for faster lookups (optional but recommended)
ALTER TABLE receipts ADD INDEX idx_patient_id (patient_id);

-- Verify the change
DESCRIBE receipts;

SELECT CONSTRAINT_NAME, TABLE_NAME, COLUMN_NAME 
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE TABLE_NAME = 'receipts' AND COLUMN_NAME = 'patient_id';
