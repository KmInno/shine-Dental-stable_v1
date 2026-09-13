const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'receipt_app',
      port: process.env.DB_PORT || 3306
    });

    console.log('Connected. Running ALTER TABLE to add description column...');

    const sql = `ALTER TABLE expenses
      ADD COLUMN description VARCHAR(255) NULL AFTER expense_date;`;

    await conn.query(sql);

    console.log('✅ Column `description` added to `expenses`.');
    await conn.end();
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
})();
