/**
 * Migration: Remove UNIQUE constraint from patient_id
 * This allows multiple receipts per patient
 * 
 * Run with: node fix_unique_constraint.js
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function runMigration() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASS || '',
            database: process.env.DB_NAME || 'receipt_app',
            port: process.env.DB_PORT || 3306,
            multipleStatements: true
        });

        console.log('✓ Connected to database');

        // Run the migration
        const sql = `
            ALTER TABLE receipts DROP INDEX patient_id_UNIQUE;
            ALTER TABLE receipts ADD INDEX idx_patient_id (patient_id);
        `;

        console.log('Running migration: Removing UNIQUE constraint from patient_id...');
        await connection.query(sql);
        console.log('✓ Migration completed successfully!');

        // Verify the change
        const [result] = await connection.query(
            `DESCRIBE receipts`
        );
        
        console.log('\n✓ Table structure after migration:');
        const patientIdRow = result.find(row => row.Field === 'patient_id');
        if (patientIdRow) {
            console.log(`  patient_id: ${patientIdRow.Type}, Key: ${patientIdRow.Key || 'none'}`);
        }

        console.log('\n✓ You can now create multiple receipts for the same patient!');
        await connection.end();

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        if (connection) await connection.end();
        process.exit(1);
    }
}

runMigration();
