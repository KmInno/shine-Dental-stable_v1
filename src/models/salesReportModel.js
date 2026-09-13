const initializeDatabase = require("../config/db");
const logger = require("../utils/logger");

// Get daily sales summary
async function getDailySalesSummary(date) {
    const db = await initializeDatabase();
    try {
        const [result] = await db.query(
            `SELECT 
                SUM(CAST(amount_paid AS DECIMAL(10,2))) as total_sales,
                SUM(CASE WHEN mode_of_payment = 'cash' THEN CAST(amount_paid AS DECIMAL(10,2)) ELSE 0 END) as cash_sales,
                SUM(CASE WHEN mode_of_payment = 'visa' THEN CAST(amount_paid AS DECIMAL(10,2)) ELSE 0 END) as visa_sales,
                SUM(CASE WHEN mode_of_payment = 'mobile money' THEN CAST(amount_paid AS DECIMAL(10,2)) ELSE 0 END) as mobile_sales,
                SUM(balance) as total_balance
            FROM receipts 
            WHERE DATE(created_at) = ?`,
            [date]
        );
        return result[0] || { total_sales: 0, cash_sales: 0, visa_sales: 0, mobile_sales: 0, total_balance: 0 };
    } catch (error) {
        logger.error(`Error in getDailySalesSummary: ${error.message}`, error);
        throw error;
    } finally {
        await db.end();
    }
}

// Get weekly sales summary
async function getWeeklySalesSummary(startDate, endDate) {
    const db = await initializeDatabase();
    try {
        const [result] = await db.query(
            `SELECT 
                DATE(created_at) as sale_date,
                SUM(CAST(amount_paid AS DECIMAL(10,2))) as total_sales,
                SUM(CASE WHEN mode_of_payment = 'cash' THEN CAST(amount_paid AS DECIMAL(10,2)) ELSE 0 END) as cash_sales,
                SUM(CASE WHEN mode_of_payment = 'visa' THEN CAST(amount_paid AS DECIMAL(10,2)) ELSE 0 END) as visa_sales,
                SUM(CASE WHEN mode_of_payment = 'mobile money' THEN CAST(amount_paid AS DECIMAL(10,2)) ELSE 0 END) as mobile_sales,
                SUM(balance) as total_balance
            FROM receipts 
            WHERE created_at BETWEEN ? AND ?
            GROUP BY DATE(created_at)
            ORDER BY DATE(created_at) DESC`,
            [startDate, endDate]
        );
        return result;
    } catch (error) {
        logger.error(`Error in getWeeklySalesSummary: ${error.message}`, error);
        throw error;
    } finally {
        await db.end();
    }
}

// Get weekly totals
async function getWeeklyTotals(startDate, endDate) {
    const db = await initializeDatabase();
    try {
        const [result] = await db.query(
            `SELECT 
                SUM(CAST(amount_paid AS DECIMAL(10,2))) as total_sales,
                SUM(CASE WHEN mode_of_payment = 'cash' THEN CAST(amount_paid AS DECIMAL(10,2)) ELSE 0 END) as cash_sales,
                SUM(CASE WHEN mode_of_payment = 'visa' THEN CAST(amount_paid AS DECIMAL(10,2)) ELSE 0 END) as visa_sales,
                SUM(CASE WHEN mode_of_payment = 'mobile money' THEN CAST(amount_paid AS DECIMAL(10,2)) ELSE 0 END) as mobile_sales,
                SUM(balance) as total_balance
            FROM receipts 
            WHERE created_at BETWEEN ? AND ?`,
            [startDate, endDate]
        );
        return result[0] || { total_sales: 0, cash_sales: 0, visa_sales: 0, mobile_sales: 0, total_balance: 0 };
    } catch (error) {
        logger.error(`Error in getWeeklyTotals: ${error.message}`, error);
        throw error;
    } finally {
        await db.end();
    }
}

// Get monthly sales summary (day by day)
async function getMonthlySalesSummary(year, month) {
    const db = await initializeDatabase();
    try {
        const [result] = await db.query(
            `SELECT 
                DATE(created_at) as sale_date,
                DAY(created_at) as day,
                SUM(CAST(amount_paid AS DECIMAL(10,2))) as total_sales,
                SUM(CASE WHEN mode_of_payment = 'cash' THEN CAST(amount_paid AS DECIMAL(10,2)) ELSE 0 END) as cash_sales,
                SUM(CASE WHEN mode_of_payment = 'visa' THEN CAST(amount_paid AS DECIMAL(10,2)) ELSE 0 END) as visa_sales,
                SUM(CASE WHEN mode_of_payment = 'mobile money' THEN CAST(amount_paid AS DECIMAL(10,2)) ELSE 0 END) as mobile_sales,
                SUM(balance) as total_balance
            FROM receipts 
            WHERE YEAR(created_at) = ? AND MONTH(created_at) = ?
            GROUP BY DATE(created_at), DAY(created_at)
            ORDER BY DATE(created_at) DESC`,
            [year, month]
        );
        return result;
    } catch (error) {
        logger.error(`Error in getMonthlySalesSummary: ${error.message}`, error);
        throw error;
    } finally {
        await db.end();
    }
}

// Get monthly totals
async function getMonthlyTotals(year, month) {
    const db = await initializeDatabase();
    try {
        const [result] = await db.query(
            `SELECT 
                SUM(CAST(amount_paid AS DECIMAL(10,2))) as total_sales,
                SUM(CASE WHEN mode_of_payment = 'cash' THEN CAST(amount_paid AS DECIMAL(10,2)) ELSE 0 END) as cash_sales,
                SUM(CASE WHEN mode_of_payment = 'visa' THEN CAST(amount_paid AS DECIMAL(10,2)) ELSE 0 END) as visa_sales,
                SUM(CASE WHEN mode_of_payment = 'mobile money' THEN CAST(amount_paid AS DECIMAL(10,2)) ELSE 0 END) as mobile_sales,
                SUM(balance) as total_balance
            FROM receipts 
            WHERE YEAR(created_at) = ? AND MONTH(created_at) = ?`,
            [year, month]
        );
        return result[0] || { total_sales: 0, cash_sales: 0, visa_sales: 0, mobile_sales: 0, total_balance: 0 };
    } catch (error) {
        logger.error(`Error in getMonthlyTotals: ${error.message}`, error);
        throw error;
    } finally {
        await db.end();
    }
}

// Get annual sales summary (month by month)
async function getAnnualSalesSummary(year) {
    const db = await initializeDatabase();
    try {
        const [result] = await db.query(
            `SELECT 
                MONTH(created_at) as month,
                DATE_FORMAT(created_at, '%B') as month_name,
                SUM(CAST(amount_paid AS DECIMAL(10,2))) as total_sales,
                SUM(CASE WHEN mode_of_payment = 'cash' THEN CAST(amount_paid AS DECIMAL(10,2)) ELSE 0 END) as cash_sales,
                SUM(CASE WHEN mode_of_payment = 'visa' THEN CAST(amount_paid AS DECIMAL(10,2)) ELSE 0 END) as visa_sales,
                SUM(CASE WHEN mode_of_payment = 'mobile money' THEN CAST(amount_paid AS DECIMAL(10,2)) ELSE 0 END) as mobile_sales,
                SUM(balance) as total_balance
            FROM receipts 
            WHERE YEAR(created_at) = ?
            GROUP BY MONTH(created_at), DATE_FORMAT(created_at, '%B')
            ORDER BY MONTH(created_at) ASC`,
            [year]
        );
        return result;
    } catch (error) {
        logger.error(`Error in getAnnualSalesSummary: ${error.message}`, error);
        throw error;
    } finally {
        await db.end();
    }
}

// Get annual totals
async function getAnnualTotals(year) {
    const db = await initializeDatabase();
    try {
        const [result] = await db.query(
            `SELECT 
                SUM(CAST(amount_paid AS DECIMAL(10,2))) as total_sales,
                SUM(CASE WHEN mode_of_payment = 'cash' THEN CAST(amount_paid AS DECIMAL(10,2)) ELSE 0 END) as cash_sales,
                SUM(CASE WHEN mode_of_payment = 'visa' THEN CAST(amount_paid AS DECIMAL(10,2)) ELSE 0 END) as visa_sales,
                SUM(CASE WHEN mode_of_payment = 'mobile money' THEN CAST(amount_paid AS DECIMAL(10,2)) ELSE 0 END) as mobile_sales,
                SUM(balance) as total_balance
            FROM receipts 
            WHERE YEAR(created_at) = ?`,
            [year]
        );
        return result[0] || { total_sales: 0, cash_sales: 0, visa_sales: 0, mobile_sales: 0, total_balance: 0 };
    } catch (error) {
        logger.error(`Error in getAnnualTotals: ${error.message}`, error);
        throw error;
    } finally {
        await db.end();
    }
}

module.exports = {
    getDailySalesSummary,
    getWeeklySalesSummary,
    getWeeklyTotals,
    getMonthlySalesSummary,
    getMonthlyTotals,
    getAnnualSalesSummary,
    getAnnualTotals
};
