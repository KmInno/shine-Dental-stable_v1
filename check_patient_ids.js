const initializeDatabase = require('./src/config/db');

async function checkPatientIds() {
    const db = await initializeDatabase();
    
    try {
        console.log('Checking patient ID distribution...\n');
        
        // Check for duplicates or issues
        const [duplicates] = await db.query(`
            SELECT patient_id, COUNT(*) as count 
            FROM receipts 
            WHERE patient_id IS NOT NULL AND patient_id != ''
            GROUP BY patient_id 
            HAVING count > 1
        `);
        
        if (duplicates.length > 0) {
            console.log('✗ Found duplicate patient IDs:');
            duplicates.forEach(d => {
                console.log(`  ${d.patient_id}: ${d.count} receipts`);
            });
        } else {
            console.log('✓ No duplicate patient IDs found');
        }
        
        // Show all March 2026 patient IDs
        console.log('\nAll sds-26-03-* patient IDs:');
        const [march] = await db.query(`
            SELECT id, patient_name, created_at, patient_id 
            FROM receipts 
            WHERE patient_id LIKE 'sds-26-03-%'
            ORDER BY patient_id ASC
        `);
        
        march.forEach(r => {
            console.log(`  ${r.patient_id}: Receipt #${r.id} - ${r.patient_name} (${r.created_at})`);
        });
        
        // Show receipt without patient ID
        console.log('\nReceipts without patient IDs:');
        const [missing] = await db.query(`
            SELECT id, patient_name, created_at 
            FROM receipts 
            WHERE patient_id IS NULL OR patient_id = ''
            ORDER BY created_at DESC
        `);
        
        if (missing.length > 0) {
            missing.forEach(r => {
                console.log(`  Receipt #${r.id}: ${r.patient_name} (${r.created_at})`);
            });
        } else {
            console.log('  ✓ All receipts have patient IDs');
        }
        
    } catch (error) {
        console.error('✗ Check failed:', error.message);
        process.exit(1);
    } finally {
        await db.end();
    }
}

checkPatientIds();
