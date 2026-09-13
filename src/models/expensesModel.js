const initializeDatabase = require("../config/db");
const logger = require("../utils/logger");

async function ensureExpenseDateColumn(db) {
    try {
        const [columns] = await db.query("SHOW COLUMNS FROM expenses LIKE 'expense_date'");
        if (columns.length > 0) {
            return;
        }

        logger.warn("expense_date column missing. Adding compatibility column to expenses table.");
        await db.query("ALTER TABLE expenses ADD COLUMN expense_date DATE NULL AFTER id");
        await db.query("UPDATE expenses SET expense_date = DATE(created_at) WHERE expense_date IS NULL");
    } catch (error) {
        logger.error(`Error ensuring expense_date column: ${error.message}`, error);
        throw error;
    }
}

// Create a new expense
async function createExpense(description, category, amount, created_by, expense_date = null) {
    const db = await initializeDatabase();
    try {
        await ensureExpenseDateColumn(db);
        const normalizedDate = expense_date || new Date().toISOString().split('T')[0];
        const sql = "INSERT INTO expenses (expense_date, description, category, amount, created_by) VALUES (?, ?, ?, ?, ?)";
        const [result] = await db.query(sql, [normalizedDate, description, category, amount, created_by]);
        return result;
    } catch (error) {
        logger.error(`Error in createExpense: ${error.message}`, error);
        throw error;
    } finally {
        await db.end();
    }
}

// Get all expenses
async function getAllExpenses() {
    const db = await initializeDatabase();
    try {
        await ensureExpenseDateColumn(db);
        const [result] = await db.query("SELECT * FROM expenses ORDER BY COALESCE(expense_date, DATE(created_at)) DESC");
        return result;
    } catch (error) {
        logger.error(`Error in getAllExpenses: ${error.message}`, error);
        throw error;
    } finally {
        await db.end();
    }
}

// Get expenses for a specific date
async function getExpensesByDate(date) {
    const db = await initializeDatabase();
    try {
        await ensureExpenseDateColumn(db);
        const [result] = await db.query("SELECT * FROM expenses WHERE DATE(COALESCE(expense_date, created_at)) = ? ORDER BY created_at DESC", [date]);
        return result;
    } catch (error) {
        logger.error(`Error in getExpensesByDate: ${error.message}`, error);
        throw error;
    } finally {
        await db.end();
    }
}

// Get single expense by id
async function getExpenseById(id) {
    const db = await initializeDatabase();
    try {
        const [result] = await db.query("SELECT * FROM expenses WHERE id = ?", [id]);
        return result.length > 0 ? result[0] : null;
    } catch (error) {
        logger.error(`Error in getExpenseById: ${error.message}`, error);
        throw error;
    } finally {
        await db.end();
    }
}

// Get expenses for a date range
async function getExpensesByDateRange(startDate, endDate) {
    const db = await initializeDatabase();
    try {
        await ensureExpenseDateColumn(db);
        const [result] = await db.query(
            "SELECT * FROM expenses WHERE DATE(COALESCE(expense_date, created_at)) BETWEEN ? AND ? ORDER BY created_at DESC",
            [startDate, endDate]
        );
        return result;
    } catch (error) {
        logger.error(`Error in getExpensesByDateRange: ${error.message}`, error);
        throw error;
    } finally {
        await db.end();
    }
}

// Get total expenses for a date
async function getTotalExpensesByDate(date) {
    const db = await initializeDatabase();
    try {
        await ensureExpenseDateColumn(db);
        const [result] = await db.query("SELECT SUM(CAST(amount AS DECIMAL(10,2))) as total FROM expenses WHERE DATE(COALESCE(expense_date, created_at)) = ?", [date]);
        return parseFloat(result[0].total) || 0;
    } catch (error) {
        logger.error(`Error in getTotalExpensesByDate: ${error.message}`, error);
        throw error;
    } finally {
        await db.end();
    }
}

// Get expenses by category
async function getExpensesByCategory(category, startDate, endDate) {
    const db = await initializeDatabase();
    try {
        await ensureExpenseDateColumn(db);
        const [result] = await db.query(
            "SELECT * FROM expenses WHERE category = ? AND DATE(COALESCE(expense_date, created_at)) BETWEEN ? AND ? ORDER BY COALESCE(expense_date, DATE(created_at)) DESC",
            [category, startDate, endDate]
        );
        return result;
    } catch (error) {
        logger.error(`Error in getExpensesByCategory: ${error.message}`, error);
        throw error;
    } finally {
        await db.end();
    }
}

// Get total expenses by category for a date range
async function getTotalExpensesByCategory(startDate, endDate) {
    const db = await initializeDatabase();
    try {
        await ensureExpenseDateColumn(db);
        const [result] = await db.query(
            "SELECT category, SUM(amount) as total FROM expenses WHERE DATE(COALESCE(expense_date, created_at)) BETWEEN ? AND ? GROUP BY category ORDER BY total DESC",
            [startDate, endDate]
        );
        return result;
    } catch (error) {
        logger.error(`Error in getTotalExpensesByCategory: ${error.message}`, error);
        throw error;
    } finally {
        await db.end();
    }
}

// Update an expense
async function updateExpense(id, expense_date, description, category, amount) {
    const db = await initializeDatabase();
    try {
        await ensureExpenseDateColumn(db);
        const sql = "UPDATE expenses SET expense_date = ?, description = ?, category = ?, amount = ? WHERE id = ?";
        const [result] = await db.query(sql, [expense_date, description, category, amount, id]);
        return result.affectedRows > 0;
    } catch (error) {
        logger.error(`Error in updateExpense: ${error.message}`, error);
        throw error;
    } finally {
        await db.end();
    }
}

// Delete an expense
async function deleteExpense(id) {
    const db = await initializeDatabase();
    try {
        const [result] = await db.query("DELETE FROM expenses WHERE id = ?", [id]);
        return result.affectedRows > 0;
    } catch (error) {
        logger.error(`Error in deleteExpense: ${error.message}`, error);
        throw error;
    } finally {
        await db.end();
    }
}

module.exports = {
    createExpense,
    getAllExpenses,
    getExpensesByDate,
    getExpenseById,
    getExpensesByDateRange,
    getTotalExpensesByDate,
    getExpensesByCategory,
    getTotalExpensesByCategory,
    updateExpense,
    deleteExpense
};
