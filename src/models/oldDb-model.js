const initializeDatabase = require("../config/db");
const logger = require("../utils/logger");

async function getOldDate() {
    const db = await initializeDatabase();
    try {
        const [result] = await db.query("SELECT * FROM old_patients");
        return result;
    } catch (error) {
        logger.error("Error fetching old data:", error);
        throw error;
    }
}

async function getOldDateByYear(year) {
    const db = await initializeDatabase();
    try {
        const query = `
            SELECT * FROM old_patients 
            WHERE YEAR(date) = ? 
            ORDER BY date ASC
        `;
        const [result] = await db.query(query, [year]);
        return result;
    } catch (error) {
        logger.error("Error fetching old data by year:", error);
        throw error;
    }
}

async function searchByName(searchTerm) {
    const db = await initializeDatabase();
    try {
        const query = `
            SELECT * FROM old_patients 
            WHERE name LIKE ? 
            ORDER BY date DESC
            LIMIT 100
        `;
        const [result] = await db.query(query, [`%${searchTerm}%`]);
        return result;
    } catch (error) {
        logger.error("Error searching by name:", error);
        throw error;
    }
}

async function getYearsAvailable() {
    const db = await initializeDatabase();
    try {
        const [result] = await db.query(`
            SELECT DISTINCT YEAR(date) as year 
            FROM old_patients 
            WHERE date IS NOT NULL AND YEAR(date) >= 2016 AND YEAR(date) <= 2025
            ORDER BY year ASC
        `);
        return result.map(r => r.year).filter(y => y > 0);
    } catch (error) {
        logger.error("Error fetching available years:", error);
        throw error;
    }
}

module.exports = { getOldDate, getOldDateByYear, searchByName, getYearsAvailable };