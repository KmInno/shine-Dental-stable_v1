const initializeDatabase = require("../config/db");
const logger = require("../utils/logger");

async function createPatient(patient_name, patient_phone, patient_address, gender, age, next_visit, room_number) {
    const db = await initializeDatabase();
    try {
        const sql = `INSERT INTO patients (patient_name, patient_phone, patient_address, gender, age, next_visit, room_number) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const [result] = await db.query(sql, [patient_name, patient_phone, patient_address, gender, age, next_visit, room_number]);
        return result.insertId;
    } catch (error) {
        logger.error(`Error in createPatient: ${error.message}`, error);
        return null;
    } finally {
        await db.end();
    }
}

async function getPatientById(patient_id) {
    const db = await initializeDatabase();
    try {
        const [result] = await db.query(
            `SELECT * FROM patients WHERE patient_id = ?`,
            [patient_id]
        );
        return result.length > 0 ? result[0] : null;
    } catch (error) {
        logger.error(`Error in getPatientById: ${error.message}`, error);
        throw new Error("Failed to retrieve patient details");
    } finally {
        await db.end();
    }
}

async function getPatientByPhone(patient_phone) {
    const db = await initializeDatabase();
    try {
        const [result] = await db.query(
            `SELECT * FROM patients WHERE patient_phone = ?`,
            [patient_phone]
        );
        return result.length > 0 ? result[0] : null;
    } catch (error) {
        logger.error(`Error in getPatientByPhone: ${error.message}`, error);
        throw new Error("Failed to retrieve patient details");
    } finally {
        await db.end();
    }
}

async function getAllPatients() {
    const db = await initializeDatabase();
    try {
        const [result] = await db.query("SELECT * FROM patients ORDER BY patient_id DESC");
        return result;
    } catch (error) {
        logger.error(`Error in getAllPatients: ${error.message}`, error);
        throw error;
    } finally {
        await db.end();
    }
}

async function updatePatient(patient_id, patient_name, patient_phone, patient_address, gender, age, next_visit) {
    const db = await initializeDatabase();
    try {
        const sql = `
            UPDATE patients
            SET patient_name = ?, patient_phone = ?, patient_address = ?, gender = ?, age = ?, next_visit = ?
            WHERE patient_id = ?
        `;
        const [result] = await db.query(sql, [
            patient_name,
            patient_phone,
            patient_address,
            gender,
            age,
            next_visit,
            patient_id
        ]);
        return result.affectedRows > 0;
    } catch (error) {
        logger.error(`Error in updatePatient: ${error.message}`, error);
        throw error;
    } finally {
        await db.end();
    }
}

async function deletePatient(patient_id) {
    const db = await initializeDatabase();
    try {
        const [result] = await db.query("DELETE FROM patients WHERE patient_id = ?", [patient_id]);
        return result.affectedRows > 0;
    } catch (error) {
        logger.error(`Error in deletePatient: ${error.message}`, error);
        throw error;
    } finally {
        await db.end();
    }
}

module.exports = { 
    createPatient, 
    getPatientById, 
    getPatientByPhone, 
    getAllPatients, 
    updatePatient, 
    deletePatient 
};
