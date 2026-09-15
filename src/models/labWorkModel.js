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
            cleared_date DATE DEFAULT NULL,
            created_by INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
        )
    `);

    const [columns] = await db.query("SHOW COLUMNS FROM lab_work LIKE 'cleared_date'");
    if (columns.length === 0) {
        await db.query("ALTER TABLE lab_work ADD COLUMN cleared_date DATE NULL AFTER created_date");
    }
}

async function createLabWork(workType, unit, price, status, createdDate, createdBy) {
    const db = await initializeDatabase();
    try {
        await ensureLabWorkTable(db);
        const [result] = await db.query(
            "INSERT INTO lab_work (work_type, unit, price, status, created_date, cleared_date, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [workType, unit, price, status, createdDate, status === "paid" ? createdDate : null, createdBy]
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
            "SELECT * FROM lab_work WHERE (status = 'paid' AND COALESCE(cleared_date, created_date) = ?) OR (status = 'pending' AND created_date = ?) ORDER BY created_at DESC",
            [date, date]
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
            "SELECT * FROM lab_work WHERE ((status = 'paid' AND COALESCE(cleared_date, created_date) BETWEEN ? AND ?) OR (status = 'pending' AND created_date BETWEEN ? AND ?)) ORDER BY COALESCE(cleared_date, created_date) DESC, created_at DESC",
            [startDate, endDate, startDate, endDate]
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
        const [result] = await db.query("SELECT * FROM lab_work ORDER BY COALESCE(cleared_date, created_date) DESC, created_at DESC");
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
            "SELECT SUM(CAST(price AS DECIMAL(10,2))) AS total FROM lab_work WHERE status = 'paid' AND COALESCE(cleared_date, created_date) = ?",
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

async function updateLabWork(id, workType, unit, price, status, createdDate, clearedDate, userId, isAdmin) {
    const db = await initializeDatabase();
    try {
        await ensureLabWorkTable(db);
        const sql = isAdmin
            ? "UPDATE lab_work SET work_type = ?, unit = ?, price = ?, status = ?, created_date = ?, cleared_date = ? WHERE id = ?"
            : "UPDATE lab_work SET work_type = ?, unit = ?, price = ?, status = ?, created_date = ?, cleared_date = ? WHERE id = ? AND created_by = ?";
        const params = [workType, unit, price, status, createdDate, status === "paid" ? (clearedDate || createdDate) : null, id];
        if (!isAdmin) params.push(userId);
        const [result] = await db.query(sql, params);
        return result.affectedRows > 0;
    } catch (error) {
        logger.error(`Error in updateLabWork: ${error.message}`, error);
        throw error;
    } finally {
        await db.end();
    }
}

async function updateLabWorkStatus(id, status) {
    const db = await initializeDatabase();
    try {
        await ensureLabWorkTable(db);
        const now = new Date();
        const clearedDate = status === "paid"
            ? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
            : null;
        const [result] = await db.query(
            "UPDATE lab_work SET status = ?, cleared_date = ? WHERE id = ?",
            [status, clearedDate, id]
        );
        return result.affectedRows > 0;
    } catch (error) {
        logger.error(`Error in updateLabWorkStatus: ${error.message}`, error);
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
    updateLabWork,
    updateLabWorkStatus,
    deleteLabWork
};
