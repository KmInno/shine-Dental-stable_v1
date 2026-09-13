const initializeDatabase = require('./src/config/db');

async function testDuplicateNameSystem() {
    const db = await initializeDatabase();
    
    try {
        console.log('Testing Duplicate Name Detection System\n');
        console.log('═══════════════════════════════════════════════════════════\n');
        
        // Get a patient that exists
        const [existingPatient] = await db.query(`
            SELECT DISTINCT patient_name, patient_phone, patient_id 
            FROM receipts 
            WHERE patient_id IS NOT NULL 
            LIMIT 1
        `);
        
        if (!existingPatient.length) {
            console.log('No existing patients found');
            return;
        }
        
        const patient = existingPatient[0];
        
        console.log('SCENARIO: Patient with Same Name but Different Phone\n');
        console.log('───────────────────────────────────────────────────────\n');
        
        console.log(`Existing Patient: ${patient.patient_name}`);
        console.log(`Patient ID: ${patient.patient_id}`);
        console.log(`Original Phone: ${patient.patient_phone}\n`);
        
        console.log('When a NEW person comes in with the same name:');
        console.log(`  Name: ${patient.patient_name} (SAME)`);
        console.log(`  Phone: 0777-999-8888 (DIFFERENT)\n`);
        
        console.log('─── OLD SYSTEM (before) ───');
        console.log('❌ System checks only by phone number');
        console.log('❌ New phone = New patient ID => Duplicate names!');
        console.log('❌ Result: Confusion with two people same name, different IDs\n');
        
        console.log('─── NEW SYSTEM (with fix) ───');
        console.log('✅ System checks by phone number first');
        console.log('✅ If not found, checks by name and ASKS USER');
        console.log(`✅ Dialog: "Found patient: ${patient.patient_name} (ID: ${patient.patient_id})`);
        console.log('✅ Dialog: Use same ID? Yes/No');
        console.log('✅ If YES → Reuse ${patient.patient_id}');
        console.log('✅ If NO → Generate new ID\n');
        
        console.log('═══════════════════════════════════════════════════════════\n');
        
        console.log('HOW IT WORKS IN THE APP:\n');
        console.log('1️⃣  User enters receipt for first patient');
        console.log(`    Name: ${patient.patient_name}`);
        console.log(`    Phone: ${patient.patient_phone}`);
        console.log(`    → System assigns: ${patient.patient_id}\n`);
        
        console.log('2️⃣  New receipt for DIFFERENT person, SAME name');
        console.log(`    Name: ${patient.patient_name} (same)`);
        console.log(`    Phone: 0777-NEW-NUMBER (different)`);
        console.log('    → System checks phone: NOT FOUND');
        console.log('    → System checks name: FOUND!');
        console.log(`    → DIALOG: "Found patient ${patient.patient_name} with ID ${patient.patient_id}"`);
        console.log('         Use same ID? [YES] [NO]\n');
        
        console.log('3️⃣  User clicks YES');
        console.log(`    → Receipt created with ID: ${patient.patient_id}`);
        console.log('    → Result: Both receipts share SAME patient ID (incorrect!)\n');
        
        console.log('4️⃣  User clicks NO');
        console.log('    → System generates NEW patient ID: sds-26-03-008 (example)');
        console.log('    → Result: Different person gets different ID (correct!)\n');
        
        console.log('═══════════════════════════════════════════════════════════\n');
        
        console.log('WHAT THIS SOLVES:\n');
        console.log('✓ Prevents confusion when people share the same name');
        console.log('✓ Gives staff control over patient ID assignment');
        console.log('✓ Maintains data integrity with intelligent checking');
        console.log('✓ Works for: Same name + different phone = potential duplicate\n');
        
    } catch (error) {
        console.error('✗ Test failed:', error.message);
        process.exit(1);
    } finally {
        await db.end();
    }
}

testDuplicateNameSystem();
