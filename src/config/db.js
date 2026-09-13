const mysql = require("mysql2/promise");
require("dotenv").config();

async function initializeDatabase() {
    try {
        const db = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASS || '',
            database: process.env.DB_NAME || 'receipt_app',
            port: process.env.DB_PORT || 3306
        });

        console.log("Connected to MySQL database");
        return db;
    } catch (err) {
        console.error("Database connection failed:", err);
        throw err;
    }
}

module.exports = initializeDatabase;
