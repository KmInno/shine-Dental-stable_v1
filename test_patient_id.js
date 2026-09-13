const initializeDatabase = require('./src/config/db');

async function testPatientIdGeneration() {
    const db = await initializeDatabase();
    
    try {
        console.log('Testing Patient ID Generation...\n');
        
        const now = new Date();
        const year = String(now.getFullYear()).slice(-2);
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const pattern = `sds-${year}-${month}-%`;
        
        console.log(`Current date: ${now.toLocaleDateString()}`);
        console.log(`Expected pattern: ${pattern}\n`);
        
        // Count existing patient IDs for this year-month
        const [result] = await db.query(
            `SELECT COUNT(*) as count FROM receipts WHERE patient_id LIKE ?`,
            [pattern]
        );
        
        const count = result[0].count;
        const nextSequence = (count + 1).toString().padStart(3, '0');
        const nextPatientId = `sds-${year}-${month}-${nextSequence}`;
        
        console.log(`✓ Existing patient IDs for ${year}-${month}: ${count}`);
        console.log(`✓ Next patient ID would be: ${nextPatientId}`);
        
        // Show existing patient IDs for this month
        const [existing] = await db.query(
            `SELECT id, patient_id, patient_name FROM receipts WHERE patient_id LIKE ? ORDER BY id DESC LIMIT 5`,
            [pattern]
        );
        
        if (existing.length > 0) {
            console.log('\nRecent patient IDs:');
            existing.forEach(row => {
                console.log(`  Receipt #${row.id}: ${row.patient_id} (${row.patient_name})`);
            });
        } else {
            console.log('\nℹ No existing patient IDs for this month yet');
        }
        
        console.log('\n✓ Patient ID generation test complete');
        
    } catch (error) {
        console.error('✗ Test failed:', error.message);
        process.exit(1);
    } finally {
        await db.end();
    }
}

testPatientIdGeneration();
