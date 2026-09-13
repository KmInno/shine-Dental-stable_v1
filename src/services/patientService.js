const ReceiptItem = require("../models/receiptModel");
const initializeDatabase = require("../config/db");
const logger = require("../utils/logger");

function formatServicesArray(service) {
    let services = [];
    try {
        if (typeof service === 'string') {
            const parsed = JSON.parse(service);
            services = Array.isArray(parsed) ? parsed : [parsed];
        } else if (Array.isArray(service)) {
            services = service;
        } else if (service) {
            services = [service];
        }
    } catch (e) {
        services = service ? [service] : [];
    }
    return services;
}

async function findPatientsByName(patient_name) {
    const db = await initializeDatabase();
    try {
        const patients = await ReceiptItem.getExistingPatientByName(db, patient_name);
        
        // Format services for each patient
        if (patients && Array.isArray(patients)) {
            patients.forEach(patient => {
                if (patient.services) {
                    patient.servicesArray = formatServicesArray(patient.services);
                }
            });
        }
        
        return patients || [];
    } catch (error) {
        logger.error(`Error in patientService.findPatientsByName: ${error.message}`, error);
        return [];
    } finally {
        try { await db.end(); } catch (e) { /* ignore */ }
    }
}

async function getReceiptsByPatient(patient_phone) {
    try {
        return await ReceiptItem.getReceiptsByPatient(patient_phone);
    } catch (error) {
        logger.error(`Error in patientService.getReceiptsByPatient: ${error.message}`, error);
        return [];
    }
}

async function getPatientDetails(patient_phone) {
    try {
        return await ReceiptItem.getPatientDetails(patient_phone);
    } catch (error) {
        logger.error(`Error in patientService.getPatientDetails: ${error.message}`, error);
        return null;
    }
}

module.exports = { findPatientsByName, getReceiptsByPatient, getPatientDetails };
