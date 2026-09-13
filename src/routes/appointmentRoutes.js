const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentController");
const authenticateToken = require("../middleware/authMiddleware");

router.get("/", authenticateToken, appointmentController.getAllAppointments);
router.get("/upcoming", authenticateToken, appointmentController.getUpcomingAppointments);
router.get("/:patient_phone", authenticateToken, appointmentController.getPatientHistory);

module.exports = router;
