const initializeDatabase = require('./src/config/db');

async function backfillPatientIds() {
    const db = await initializeDatabase();
    
    try {
        console.log('Starting patient ID backfill for existing receipts...\n');
        
        // Get all receipts without patient_id, ordered by created_at
        const [receipts] = await db.query(`
            SELECT id, created_at 
            FROM receipts 
            WHERE patient_id IS NULL OR patient_id = ''
            ORDER BY created_at ASC
        `);
        
        console.log(`✓ Found ${receipts.length} receipts to migrate\n`);
        
        if (receipts.length === 0) {
            console.log('ℹ No receipts to migrate - all records already have patient IDs or table is empty');
            await db.end();
            return;
        }
        
        // Group receipts by year-month
        const grouped = {};
        receipts.forEach(receipt => {
            const date = new Date(receipt.created_at);
            const year = String(date.getFullYear()).slice(-2);
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const key = `${year}-${month}`;
            
            if (!grouped[key]) {
                grouped[key] = [];
            }
            grouped[key].push(receipt.id);
        });
        
        console.log('Grouped by year-month:');
        Object.keys(grouped).sort().forEach(key => {
            console.log(`  ${key}: ${grouped[key].length} receipts`);
        });
        
        // Backfill patient IDs
        console.log('\nBackfilling patient IDs...');
        let updated = 0;
        
        for (const [yearMonth, receiptIds] of Object.entries(grouped)) {
            for (let i = 0; i < receiptIds.length; i++) {
                const sequence = String(i + 1).padStart(3, '0');
                const patientId = `sds-${yearMonth}-${sequence}`;
                const receiptId = receiptIds[i];
                
                try {
                    await db.query(
                        `UPDATE receipts SET patient_id = ? WHERE id = ?`,
                        [patientId, receiptId]
                    );
                    updated++;
                    
                    if ((i + 1) % 10 === 0 || i === receiptIds.length - 1) {
                        console.log(`  ${yearMonth}: Updated ${i + 1}/${receiptIds.length}`);
                    }
                } catch (error) {
                    console.error(`✗ Failed to update receipt ${receiptId}: ${error.message}`);
                }
            }
        }
        
        console.log(`\n✓ Backfill complete! Updated ${updated}/${receipts.length} receipts`);
        
        // Verify
        const [verify] = await db.query(`
            SELECT COUNT(*) as total, COUNT(DISTINCT patient_id) as unique_ids
            FROM receipts 
            WHERE patient_id IS NOT NULL AND patient_id != ''
        `);
        
        console.log(`\nVerification:`);
        console.log(`  Total receipts with patient IDs: ${verify[0].total}`);
        console.log(`  Unique patient IDs: ${verify[0].unique_ids}`);
        
    } catch (error) {
        console.error('✗ Backfill failed:', error.message);
        process.exit(1);
    } finally {
        await db.end();
    }
}

backfillPatientIds();
