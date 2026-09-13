-- Migration: add description column to expenses
-- Run in your MySQL client: mysql -u user -p receipt_app < add_expense_description.sql

ALTER TABLE expenses ADD COLUMN description VARCHAR(255) NULL AFTER id;

-- Optional: if you prefer a non-null default instead, use:
-- ALTER TABLE expenses
--   ADD COLUMN description VARCHAR(255) NOT NULL DEFAULT '' AFTER expense_date;
