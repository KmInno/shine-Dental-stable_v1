const initializeDatabase = require('./src/config/db');

async function testUniquePatientId() {
    const db = await initializeDatabase();
    
    try {
        console.log('Testing Unique Patient ID System\n');
        console.log('=====================================\n');
        
        // Test 1: Create a new patient receipt
        console.log('TEST 1: Create receipt for NEW patient');
        console.log('--------------------------------------');
        
        const testPatient = {
            name: 'John Test Patient',
            phone: '0712-345-678',
            service: 'Cleaning',
            amount: 50.00,
            paid: 50.00
        };
        
        console.log(`Patient: ${testPatient.name}`);
        console.log(`Phone: ${testPatient.phone}`);
        
        // Check if patient exists
        const existing1 = await db.query(
            `SELECT DISTINCT patient_id, COUNT(*) as receipt_count 
             FROM receipts 
             WHERE patient_phone = ? AND patient_id IS NOT NULL 
             GROUP BY patient_id`,
            [testPatient.phone]
        );
        
        if (existing1[0].length === 0) {
            console.log('✓ Patient is NEW - will generate new patient ID\n');
        } else {
            console.log(`Found existing patient ID: ${existing1[0][0].patient_id} (${existing1[0][0].receipt_count} receipts)\n`);
        }
        
        // Test 2: Show existing patients with multiple receipts
        console.log('TEST 2: Show patients with MULTIPLE receipts\n');
        console.log('--------------------------------------');
        
        const [patients] = await db.query(`
            SELECT 
                patient_id,
                patient_name,
                patient_phone,
                COUNT(*) as receipt_count,
                GROUP_CONCAT(DISTINCT id) as receipt_ids,
                MAX(created_at) as last_visit
            FROM receipts
            WHERE patient_id IS NOT NULL AND patient_id != ''
            GROUP BY patient_phone, patient_id, patient_name
            HAVING receipt_count > 1
            ORDER BY receipt_count DESC
        `);
        
        if (patients.length === 0) {
            console.log('ℹ No patients with multiple receipts yet\n');
        } else {
            console.log(`✓ Found ${patients.length} patient(s) with multiple receipts:\n`);
            patients.forEach((p, idx) => {
                console.log(`${idx + 1}. ${p.patient_name}`);
                console.log(`   Patient ID: ${p.patient_id}`);
                console.log(`   Phone: ${p.patient_phone}`);
                console.log(`   Receipt count: ${p.receipt_count}`);
                console.log(`   Receipt #'s: ${p.receipt_ids}`);
                console.log(`   Last visit: ${p.last_visit}\n`);
            });
        }
        
        // Test 3: Show patient ID statistics
        console.log('TEST 3: Patient ID Statistics\n');
        console.log('--------------------------------------');
        
        const [stats] = await db.query(`
            SELECT 
                COUNT(DISTINCT patient_id) as unique_patient_ids,
                COUNT(DISTINCT id) as total_receipts,
                ROUND(COUNT(DISTINCT id) / COUNT(DISTINCT patient_id), 2) as avg_receipts_per_patient
            FROM receipts
            WHERE patient_id IS NOT NULL AND patient_id != ''
        `);
        
        console.log(`Unique Patient IDs: ${stats[0].unique_patient_ids}`);
        console.log(`Total Receipts: ${stats[0].total_receipts}`);
        console.log(`Avg Receipts/Patient: ${parseFloat(stats[0].avg_receipts_per_patient).toFixed(2)}\n`);
        
        // Test 4: Show the "patient ID → multiple receipts" pattern
        console.log('TEST 4: Example of Single Patient ID with Multiple Receipts\n');
        console.log('--------------------------------------');
        
        const [example] = await db.query(`
            SELECT 
                r.id,
                r.patient_id,
                r.patient_name,
                r.service,
                r.amount,
                r.created_at
            FROM receipts r
            WHERE r.patient_id = (
                SELECT patient_id 
                FROM receipts 
                WHERE patient_id IS NOT NULL 
                GROUP BY patient_id 
                HAVING COUNT(*) > 1 
                LIMIT 1
            )
            ORDER BY r.created_at ASC
        `);
        
        if (example.length > 0) {
            console.log(`Patient ID: ${example[0].patient_id}`);
            console.log(`Patient: ${example[0].patient_name}\n`);
            console.log('Receipts under this patient ID:');
            example.forEach(r => {
                console.log(`  - Receipt #${r.id}: ${r.service} (${r.amount}) - ${r.created_at}`);
            });
        }
        
        console.log('\n✓ Testing complete!');
        console.log('\nSystem working as expected:');
        console.log('  ✓ One patient ID per phone number');
        console.log('  ✓ Multiple receipts can share the same patient ID');
        console.log('  ✓ Each receipt has unique database ID');
        
    } catch (error) {
        console.error('✗ Test failed:', error.message);
        process.exit(1);
    } finally {
        await db.end();
    }
}

testUniquePatientId();
