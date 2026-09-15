-- Create lab work table
CREATE TABLE IF NOT EXISTS lab_work (
    id INT AUTO_INCREMENT PRIMARY KEY,
    work_type VARCHAR(255) NOT NULL,
    unit VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    status ENUM('paid', 'pending') NOT NULL DEFAULT 'pending',
    created_date DATE NOT NULL,
    cleared_date DATE DEFAULT NULL,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_lab_work_date ON lab_work(created_date);
CREATE INDEX idx_lab_work_status ON lab_work(status);
