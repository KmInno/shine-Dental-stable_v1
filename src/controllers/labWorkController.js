const LabWorkModel = require("../models/labWorkModel");
const logger = require("../utils/logger");

function today() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

async function getLabWorkPage(req, res, next) {
    try {
        const selectedDate = req.query.date || today();
        const labWork = await LabWorkModel.getLabWorkByDate(selectedDate);
        const totalLabWork = await LabWorkModel.getTotalLabWorkByDate(selectedDate);

        res.render("labwork", {
            title: "Lab Work",
            user: req.user,
            labWork,
            totalLabWork,
            selectedDate
        });
    } catch (error) {
        logger.error(`Error in getLabWorkPage: ${error.message}`, error);
        next(error);
    }
}

async function addLabWork(req, res) {
    try {
        const { work_type, unit, price, status, created_date } = req.body;
        const validStatuses = ["paid", "pending"];

        if (!work_type || !unit || !price || !validStatuses.includes(status)) {
            return res.status(400).json({ message: "Type of work, unit, price, and status are required" });
        }
        if (Number.isNaN(Number(price)) || Number(price) <= 0) {
            return res.status(400).json({ message: "Price must be a valid positive number" });
        }

        await LabWorkModel.createLabWork(
            work_type.trim(),
            unit.trim(),
            Number(price),
            status,
            created_date || today(),
            req.user.id
        );
        res.status(201).json({ message: "Lab work added successfully" });
    } catch (error) {
        logger.error(`Error in addLabWork: ${error.message}`, error);
        res.status(500).json({ message: "Error adding lab work" });
    }
}

async function deleteLabWork(req, res) {
    try {
        const deleted = await LabWorkModel.deleteLabWork(
            req.params.id,
            req.user.id,
            req.user.usertype === "admin"
        );
        if (!deleted) {
            return res.status(404).json({ message: "Lab work not found or permission denied" });
        }
        res.json({ message: "Lab work deleted successfully" });
    } catch (error) {
        logger.error(`Error in deleteLabWork: ${error.message}`, error);
        res.status(500).json({ message: "Error deleting lab work" });
    }
}

module.exports = {
    getLabWorkPage,
    addLabWork,
    deleteLabWork
};
