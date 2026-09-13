const initializeDatabase = require('./src/config/db');

async function runMigration() {
    const db = await initializeDatabase();
    
    try {
        console.log('Running migration: Convert patient_id from INT to VARCHAR...');
        
        // Drop the foreign key constraint if it exists
        try {
            await db.query('ALTER TABLE receipts DROP FOREIGN KEY fk_receipts_patient');
            console.log('✓ Dropped foreign key constraint');
        } catch (err) {
            if (err.message.includes("check that column/key exists")) {
                console.log('ℹ Foreign key not found (this is OK)');
            } else {
                throw err;
            }
        }
        
        // Modify the column type from INT to VARCHAR(50)
        await db.query('ALTER TABLE receipts MODIFY COLUMN patient_id VARCHAR(50) NULL');
        console.log('✓ Modified patient_id column type from INT to VARCHAR(50)');
        
        // Add UNIQUE constraint on patient_id
        try {
            await db.query('ALTER TABLE receipts ADD CONSTRAINT patient_id_UNIQUE UNIQUE (patient_id)');
            console.log('✓ Added UNIQUE constraint on patient_id');
        } catch (err) {
            if (err.message.includes("Duplicate key name")) {
                console.log('ℹ UNIQUE constraint already exists (this is OK)');
            } else {
                throw err;
            }
        }
        
        // Verify the change
        const [columns] = await db.query('DESCRIBE receipts');
        const patientIdCol = columns.find(col => col.Field === 'patient_id');
        console.log('\n✓ Migration complete! Patient ID column structure:');
        console.log(`  Type: ${patientIdCol.Type}`);
        console.log(`  Null: ${patientIdCol.Null}`);
        console.log(`  Key: ${patientIdCol.Key}`);
        console.log('\n✓ Database is ready for unique patient ID generation (format: sds-YY-MM-NNN)');
        
    } catch (error) {
        console.error('✗ Migration failed:', error.message);
        process.exit(1);
    } finally {
        await db.end();
    }
}

runMigration();
