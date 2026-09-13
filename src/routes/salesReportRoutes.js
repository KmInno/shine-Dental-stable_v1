const express = require("express");
const router = express.Router();
const salesReportController = require("../controllers/salesReportController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// All report routes require authentication
router.use(authMiddleware);

// GET - Daily sales report (Available to all authenticated users)
router.get("/daily", salesReportController.getDailyReport);

// GET - Weekly sales report (Available to all authenticated users)
router.get("/weekly", salesReportController.getWeeklyReport);

// GET - Monthly sales report (Admin only)
router.get("/monthly", adminMiddleware, salesReportController.getMonthlyReport);

// GET - Annual sales report (Admin only)
router.get("/annual", adminMiddleware, salesReportController.getAnnualReport);

module.exports = router;
