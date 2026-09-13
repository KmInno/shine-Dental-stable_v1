-- Setup script for expenses table
-- Run this in your MySQL database (receipt_app) if the expenses table doesn't exist

USE receipt_app;

-- Create expenses table if it doesn't exist
CREATE TABLE IF NOT EXISTS expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_created_at (created_at),
    INDEX idx_created_by (created_by)
);

-- Verify the table structure
SELECT COLUMN_NAME, DATA_TYPE, COLUMN_DEFAULT, EXTRA
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'receipt_app' AND TABLE_NAME = 'expenses'
ORDER BY ORDINAL_POSITION;
