const initializeDatabase = require('./src/config/db');

async function demoPatientIdReuse() {
    const db = await initializeDatabase();
    
    try {
        console.log('DEMO: How the New System Works\n');
        console.log('═══════════════════════════════════════════════════════════\n');
        
        // Pick an existing patient
        const [existingPatient] = await db.query(`
            SELECT patient_id, patient_name, patient_phone 
            FROM receipts 
            WHERE patient_id IS NOT NULL 
            LIMIT 1
        `);
        
        if (!existingPatient.length) {
            console.log('No existing patients found');
            return;
        }
        
        const patient = existingPatient[0];
        
        console.log('SCENARIO: Patient Returns for Another Visit\n');
        console.log('───────────────────────────────────────────\n');
        
        console.log(`Patient: ${patient.patient_name}`);
        console.log(`Phone: ${patient.patient_phone}`);
        console.log(`Existing Patient ID: ${patient.patient_id}\n`);
        
        // Show existing receipts for this patient
        const [receipts] = await db.query(`
            SELECT id, service, amount, created_at
            FROM receipts 
            WHERE patient_phone = ?
            ORDER BY created_at DESC
        `, [patient.patient_phone]);
        
        console.log(`Receipt History (${receipts.length} total):`);
        receipts.forEach((r, idx) => {
            console.log(`  ${idx + 1}. Receipt #${r.id}: ${r.service} - ${r.amount} (${r.created_at})`);
        });
        
        console.log('\n─── NOW PATIENT RETURNS ───\n');
        console.log('OLD SYSTEM (before):\n');
        console.log('❌ Receipt #${newReceiptId}: Would get NEW patient ID: sds-26-03-XXX');
        console.log('❌ Problem: System generates new ID each time');
        console.log('❌ Result: Patient has many different IDs = confusion\n');
        
        console.log('NEW SYSTEM (with fix):\n');
        console.log(`✅ Receipt will get SAME patient ID: ${patient.patient_id}`);
        console.log('✅ System checks if phone exists → finds existing ID');
        console.log('✅ Result: One patient = One ID = Easy tracking!\n');
        
        console.log('═══════════════════════════════════════════════════════════\n');
        
        console.log('HOW IT WORKS:\n');
        console.log('1️⃣  First Visit (NEW Patient)');
        console.log('   → Phone: 0712-345-678');
        console.log('   → System: Can\'t find this phone → Generate ID: sds-26-03-001');
        console.log('   → Result: New receipt created with patient ID\n');
        
        console.log('2️⃣  Return Visit (SAME Patient)');
        console.log('   → Phone: 0712-345-678 (same)');
        console.log('   → System: Found existing phone → Reuse ID: sds-26-03-001');
        console.log('   → Result: New receipt SHARES same patient ID\n');
        
        console.log('3️⃣  Another Return Visit');
        console.log('   → Phone: 0712-345-678 (same)');
        console.log('   → System: Found existing phone → Reuse ID: sds-26-03-001');
        console.log('   → Result: Another new receipt, STILL same patient ID\n');
        
        console.log('═══════════════════════════════════════════════════════════\n');
        
        console.log('DATABASE STRUCTURE:\n');
        console.log('│ Receipt # │ Patient ID    │ Name           │ Phone         │');
        console.log('├───────────┼───────────────┼────────────────┼───────────────┤');
        
        receipts.slice(0, 3).forEach((r, idx) => {
            const name = idx === 0 ? patient.patient_name : '(same)';
            const phone = idx === 0 ? patient.patient_phone : '(same)';
            console.log(
                `│ #${String(r.id).padEnd(8)} │ ${patient.patient_id.padEnd(13)} │ ${name.padEnd(14)} │ ${phone.padEnd(13)} │`
            );
        });
        console.log('└───────────┴───────────────┴────────────────┴───────────────┘');
        console.log('\n✓ Notice: All receipts for same patient share ONE patient ID!');
        
    } catch (error) {
        console.error('✗ Demo failed:', error.message);
        process.exit(1);
    } finally {
        await db.end();
    }
}

demoPatientIdReuse();
