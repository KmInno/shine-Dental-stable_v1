const initializeDatabase = require('./src/config/db');

async function fixMissingId() {
    const db = await initializeDatabase();
    
    try {
        console.log('Fixing missing patient IDs...\n');
        
        // Get the highest sequence for March 2026
        const [result] = await db.query(`
            SELECT MAX(patient_id) as max_id FROM receipts 
            WHERE patient_id LIKE 'sds-26-03-%'
        `);
        
        const maxId = result[0].max_id;
        console.log(`Current highest ID: ${maxId}`);
        
        // Extract sequence number and increment
        const lastSequence = parseInt(maxId.split('-')[3]);
        const nextSequence = String(lastSequence + 1).padStart(3, '0');
        const newPatientId = `sds-26-03-${nextSequence}`;
        
        console.log(`Next patient ID: ${newPatientId}`);
        
        // Update receipt 14
        await db.query(
            `UPDATE receipts SET patient_id = ? WHERE id = 14`,
            [newPatientId]
        );
        
        console.log(`\n✓ Assigned receipt #14 (Hakeem Booker) patient ID: ${newPatientId}`);
        
        // Verify
        const [verify] = await db.query(`
            SELECT id, patient_name, patient_id 
            FROM receipts 
            WHERE patient_id LIKE 'sds-26-03-%'
            ORDER BY patient_id ASC
        `);
        
        console.log('\nAll March 2026 receipts:');
        verify.forEach(r => {
            console.log(`  ${r.patient_id}: #${r.id} - ${r.patient_name}`);
        });
        
    } catch (error) {
        console.error('✗ Fix failed:', error.message);
        process.exit(1);
    } finally {
        await db.end();
    }
}

fixMissingId();
