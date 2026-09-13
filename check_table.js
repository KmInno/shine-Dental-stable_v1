const initializeDatabase = require('./src/config/db');

async function checkTableStructure() {
    const db = await initializeDatabase();
    
    try {
        console.log('Checking receipts table structure...\n');
        
        // Get table description
        const [columns] = await db.query('DESCRIBE receipts');
        console.log('Columns:');
        columns.forEach(col => {
            console.log(`  ${col.Field}: ${col.Type} (Null: ${col.Null}, Key: ${col.Key})`);
        });
        
        // Get table constraints
        const [constraints] = await db.query(`
            SELECT CONSTRAINT_NAME, COLUMN_NAME 
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
            WHERE TABLE_NAME = 'receipts' AND TABLE_SCHEMA = DATABASE()
        `);
        console.log('\nConstraints:');
        constraints.forEach(c => {
            console.log(`  ${c.CONSTRAINT_NAME}: ${c.COLUMN_NAME}`);
        });
        
    } catch (error) {
        console.error('Error checking table:', error.message);
    } finally {
        await db.end();
    }
}

checkTableStructure();
