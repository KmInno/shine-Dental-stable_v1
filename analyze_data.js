const initializeDatabase = require('./src/config/db');

async function analyzeExistingData() {
    const db = await initializeDatabase();
    
    try {
        console.log('Analyzing existing receipt data...\n');
        
        // Count total receipts
        const [countResult] = await db.query('SELECT COUNT(*) as total FROM receipts WHERE patient_id IS NULL');
        console.log(`✓ Total receipts without patient IDs: ${countResult[0].total}`);
        
        // Check date range
        const [dateRange] = await db.query(`
            SELECT 
                MIN(created_at) as earliest,
                MAX(created_at) as latest,
                COUNT(*) as count
            FROM receipts 
            WHERE patient_id IS NULL
        `);
        
        if (dateRange[0].earliest) {
            console.log(`✓ Date range: ${dateRange[0].earliest} to ${dateRange[0].latest}`);
            console.log(`✓ Records to migrate: ${dateRange[0].count}`);
        }
        
        // Show sample records
        const [samples] = await db.query(`
            SELECT id, patient_name, patient_phone, created_at 
            FROM receipts 
            WHERE patient_id IS NULL
            ORDER BY created_at ASC
            LIMIT 5
        `);
        
        console.log('\nSample records (first 5):');
        samples.forEach(r => {
            console.log(`  Receipt #${r.id}: ${r.patient_name} (${r.patient_phone}) - ${r.created_at}`);
        });
        
    } catch (error) {
        console.error('✗ Analysis failed:', error.message);
        process.exit(1);
    } finally {
        await db.end();
    }
}

analyzeExistingData();
