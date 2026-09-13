const AppointmentModel = require("../models/appointmentModel");
const logger = require("../utils/logger");

async function getAllAppointments(req, res, next) {
    try {
        const appointments = await AppointmentModel.getAllAppointments();
        
        res.render("appointments", {
            title: "Appointments",
            appointments,
            filter: "all",
            user: req.user
        });
    } catch (error) {
        logger.error(`Error in getAllAppointments: ${error.message}`, error);
        next(error);
    }
}

async function getUpcomingAppointments(req, res, next) {
    try {
        const appointments = await AppointmentModel.getPatientsWithUpcomingVisits();
        
        res.render("appointments", {
            title: "Upcoming Appointments",
            appointments,
            filter: "upcoming",
            user: req.user
        });
    } catch (error) {
        logger.error(`Error in getUpcomingAppointments: ${error.message}`, error);
        next(error);
    }
}

async function getPatientHistory(req, res, next) {
    try {
        const { patient_phone } = req.params;
        const history = await AppointmentModel.getPatientAppointmentHistory(patient_phone);
        
        if (!history || history.length === 0) {
            return res.status(404).render("appointmentDetails", {
                title: "Patient History",
                patient: null,
                history: [],
                user: req.user,
                message: "Patient not found"
            });
        }

        // Extract patient info from first row and organize visits
        const patient = {
            patient_phone: history[0].patient_phone,
            patient_name: history[0].patient_name,
            patient_address: history[0].patient_address,
            gender: history[0].gender,
            age: history[0].age,
            next_visit: history[0].next_visit
        };

        res.render("appointmentDetails", {
            title: "Patient History",
            patient,
            history,
            user: req.user
        });
    } catch (error) {
        logger.error(`Error in getPatientHistory: ${error.message}`, error);
        next(error);
    }
}

module.exports = { 
    getAllAppointments, 
    getUpcomingAppointments,
    getPatientHistory
};
