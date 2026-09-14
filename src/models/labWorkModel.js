const initializeDatabase = require("../config/db");
const logger = require("../utils/logger");

async function ensureLabWorkTable(db) {
    await db.query(`
        CREATE TABLE IF NOT EXISTS lab_work (
            id INT AUTO_INCREMENT PRIMARY KEY,
            work_type VARCHAR(255) NOT NULL,
            unit VARCHAR(100) NOT NULL,
            price DECIMAL(10,2) NOT NULL,
            status ENUM('paid', 'pending') NOT NULL DEFAULT 'pending',
            created_date DATE NOT NULL,
            created_by INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
        )
    `);
}

async function createLabWork(workType, unit, price, status, createdDate, createdBy) {
    const db = await initializeDatabase();
    try {
        await ensureLabWorkTable(db);
        const [result] = await db.query(
            "INSERT INTO lab_work (work_type, unit, price, status, created_date, created_by) VALUES (?, ?, ?, ?, ?, ?)",
            [workType, unit, price, status, createdDate, createdBy]
        );
        return result;
    } catch (error) {
        logger.error(`Error in createLabWork: ${error.message}`, error);
        throw error;
    } finally {
        await db.end();
    }
}

async function getLabWorkByDate(date) {
    const db = await initializeDatabase();
    try {
        await ensureLabWorkTable(db);
        const [result] = await db.query(
            "SELECT * FROM lab_work WHERE created_date = ? ORDER BY created_at DESC",
            [date]
        );
        return result;
    } catch (error) {
        logger.error(`Error in getLabWorkByDate: ${error.message}`, error);
        throw error;
    } finally {
        await db.end();
    }
}

async function getLabWorkByDateRange(startDate, endDate) {
    const db = await initializeDatabase();
    try {
        await ensureLabWorkTable(db);
        const [result] = await db.query(
            "SELECT * FROM lab_work WHERE created_date BETWEEN ? AND ? ORDER BY created_date DESC, created_at DESC",
            [startDate, endDate]
        );
        return result;
    } catch (error) {
        logger.error(`Error in getLabWorkByDateRange: ${error.message}`, error);
        throw error;
    } finally {
        await db.end();
    }
}

async function getAllLabWork() {
    const db = await initializeDatabase();
    try {
        await ensureLabWorkTable(db);
        const [result] = await db.query("SELECT * FROM lab_work ORDER BY created_date DESC, created_at DESC");
        return result;
    } catch (error) {
        logger.error(`Error in getAllLabWork: ${error.message}`, error);
        throw error;
    } finally {
        await db.end();
    }
}

async function getTotalLabWorkByDate(date) {
    const db = await initializeDatabase();
    try {
        await ensureLabWorkTable(db);
        const [result] = await db.query(
            "SELECT SUM(CAST(price AS DECIMAL(10,2))) AS total FROM lab_work WHERE created_date = ? AND status = 'paid'",
            [date]
        );
        return parseFloat(result[0].total) || 0;
    } catch (error) {
        logger.error(`Error in getTotalLabWorkByDate: ${error.message}`, error);
        throw error;
    } finally {
        await db.end();
    }
}

async function getPendingLabWorkTotalByDate(date) {
    const db = await initializeDatabase();
    try {
        await ensureLabWorkTable(db);
        const [result] = await db.query(
            "SELECT SUM(CAST(price AS DECIMAL(10,2))) AS total FROM lab_work WHERE created_date = ? AND status = 'pending'",
            [date]
        );
        return parseFloat(result[0].total) || 0;
    } catch (error) {
        logger.error(`Error in getPendingLabWorkTotalByDate: ${error.message}`, error);
        throw error;
    } finally {
        await db.end();
    }
}

async function deleteLabWork(id, userId, isAdmin) {
    const db = await initializeDatabase();
    try {
        await ensureLabWorkTable(db);
        const sql = isAdmin
            ? "DELETE FROM lab_work WHERE id = ?"
            : "DELETE FROM lab_work WHERE id = ? AND created_by = ?";
        const params = isAdmin ? [id] : [id, userId];
        const [result] = await db.query(sql, params);
        return result.affectedRows > 0;
    } catch (error) {
        logger.error(`Error in deleteLabWork: ${error.message}`, error);
        throw error;
    } finally {
        await db.end();
    }
}

module.exports = {
    createLabWork,
    getLabWorkByDate,
    getLabWorkByDateRange,
    getAllLabWork,
    getTotalLabWorkByDate,
    getPendingLabWorkTotalByDate,
    deleteLabWork
};
