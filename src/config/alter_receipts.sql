-- ALTER script to add missing fields to receipts table
-- Run these statements in your MySQL database (adjust types/names as needed)

ALTER TABLE receipts
--   ADD COLUMN patient_id INT NOT NULL AUTO_INCREMENT UNIQUE AFTER id;
--   ADD COLUMN receipt_name VARCHAR(255) NULL AFTER patient_id,
--   ADD COLUMN qty INT NOT NULL DEFAULT 1 AFTER service;
--   ADD COLUMN discount DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER qty;
  ADD COLUMN amount DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER discount;
--   ADD COLUMN amount_paid DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER mode_of_payment;


ALTER TABLE receipts
-- add COLUMN gender ENUM('Male', 'female', 'other') DEFAULT NULL AFTER patient_phone,
-- add column age INT DEFAULT NULL after gender,
-- add COLUMN next_visit DATE DEFAULT NULL after age,
add COLUMN room_number VARCHAR(50) DEFAULT NULL after next_visit;

CREATE TABLE receipts (

id INT AUTO_INCREMENT PRIMARY KEY,

patient_name VARCHAR(150),

patient_phone VARCHAR(20),

service JSON,

mode_of_payment VARCHAR(50),

total DECIMAL(10,2),

amount_paid DECIMAL(10,2),

balance DECIMAL(10,2),

created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);

-- Optional: update existing rows to compute amount = total - discount (if appropriate)
-- UPDATE receipts SET amount = IFNULL(total,0) - IFNULL(discount,0);

-- Verify columns have been added
SELECT COLUMN_NAME, DATA_TYPE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'receipts';
