const initializeDatabase = require("../config/db");

async function createAccount(name, email, password) {
    const db = await initializeDatabase();
    try {
        const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
        const [result] = await db.query(sql, [name, email, password]);
        return result; // Return the result
    }
    catch (error) {
        console.error("Error adding account:", error);
        return null;
    }

}

async function getAccountByEmail(email) {
    const db = await initializeDatabase();

    try {
        const [rows] = await db.query(
            'SELECT id, name, email, password, usertype FROM users WHERE email = ?',
            [email]
        );

        if (rows.length === 0) {
            throw new Error("No matching email found");
        }

        console.log("Rows:", rows); // Debugging to verify data
        return rows;
    } catch (error) {
        console.error("Error in getAccountByEmail:", error.message);
        throw error; // Ensure the error is thrown, not returned
    }
}


async function getAccountById(id) {
    const db = await initializeDatabase();

    try {
        const result = await db.query(
            'SELECT * FROM users WHERE id = ?',
            [id]
        )
        return result
    } catch (error) {
        console.error('Error gettong account by ID', error)
        throw error
    }
}

module.exports = { createAccount, getAccountByEmail, getAccountById };