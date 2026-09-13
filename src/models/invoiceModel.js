const initializeDatabase = require("../config/db");
const logger = require("../utils/logger");

async function getLastInvoiceNumber() {
    const db = await initializeDatabase();
    try {
        const [result] = await db.query(
            "SELECT MAX(CAST(SUBSTRING(invoice_number, 5) AS UNSIGNED)) as last_num FROM invoices WHERE invoice_number LIKE 'SDS-%'"
        );
        const lastNum = result[0]?.last_num || 0;
        return `SDS-${String(lastNum + 1).padStart(3, '0')}`;
    } catch (error) {
        logger.error(`Error in getLastInvoiceNumber: ${error.message}`, error);
        return 'SDS-001';
    } finally {
        await db.end();
    }
}

async function createInvoice(client_name, client_address, client_tel, invoice_date, total, items) {
    const db = await initializeDatabase();
    try {
        const invoice_number = await getLastInvoiceNumber();
        const sql = "INSERT INTO invoices (invoice_number, client_name, client_address, client_tel, invoice_date, total, status) VALUES (?, ?, ?, ?, ?, ?, ?)";
        const [result] = await db.query(sql, [invoice_number, client_name, client_address, client_tel, invoice_date, total, 'draft']);
        
        const invoiceId = result.insertId;

        // Insert invoice items
        if (items && items.length > 0) {
            for (const item of items) {
                await createInvoiceItem(invoiceId, item.item_name, item.qty, item.unit_price, item.amount);
            }
        }

        return { id: invoiceId, invoice_number };
    } catch (error) {
        logger.error(`Error in createInvoice: ${error.message}`, error);
        return null;
    } finally {
        await db.end();
    }
}

async function createInvoiceItem(invoice_id, item_name, qty, unit_price, amount) {
    const db = await initializeDatabase();
    try {
        const sql = "INSERT INTO invoice_items (invoice_id, item_name, qty, unit_price, amount) VALUES (?, ?, ?, ?, ?)";
        const [result] = await db.query(sql, [invoice_id, item_name, qty, unit_price, amount]);
        return result;
    } catch (error) {
        logger.error(`Error in createInvoiceItem: ${error.message}`, error);
        return null;
    } finally {
        await db.end();
    }
}

async function getInvoiceDetails(id) {
    const db = await initializeDatabase();
    try {
        const [invoiceResult] = await db.query(
            "SELECT * FROM invoices WHERE id = ?",
            [id]
        );
        
        if (invoiceResult.length === 0) {
            return null;
        }

        const [itemsResult] = await db.query(
            "SELECT * FROM invoice_items WHERE invoice_id = ?",
            [id]
        );

        const invoice = invoiceResult[0];
        invoice.items = itemsResult;
        return invoice;
    } catch (error) {
        logger.error(`Error in getInvoiceDetails: ${error.message}`, error);
        throw new Error("Failed to retrieve invoice details");
    } finally {
        await db.end();
    }
}

async function getInvoices() {
    const db = await initializeDatabase();
    try {
        const [result] = await db.query("SELECT * FROM invoices ORDER BY id DESC");
        return result;
    } catch (error) {
        logger.error(`Error in getInvoices: ${error.message}`, error);
        throw error;
    } finally {
        await db.end();
    }
}

async function deleteInvoice(id) {
    const db = await initializeDatabase();
    try {
        const [result] = await db.query("DELETE FROM invoices WHERE id = ?", [id]);
        return result.affectedRows > 0;
    } catch (error) {
        logger.error(`Error in deleteInvoice: ${error.message}`, error);
        throw error;
    } finally {
        await db.end();
    }
}

async function updateInvoice(id, client_name, client_address, client_tel, invoice_date, total, status) {
    const db = await initializeDatabase();
    try {
        const sql = `
            UPDATE invoices
            SET client_name = ?, client_address = ?, client_tel = ?, invoice_date = ?, total = ?, status = ?
            WHERE id = ?
        `;
        const [result] = await db.query(sql, [
            client_name,
            client_address,
            client_tel,
            invoice_date,
            total,
            status,
            id
        ]);
        return result.affectedRows > 0;
    } catch (error) {
        logger.error(`Error in updateInvoice: ${error.message}`, error);
        throw error;
    } finally {
        await db.end();
    }
}

async function updateInvoiceStatus(id, status) {
    const db = await initializeDatabase();
    try {
        const sql = "UPDATE invoices SET status = ? WHERE id = ?";
        const [result] = await db.query(sql, [status, id]);
        return result.affectedRows > 0;
    } catch (error) {
        logger.error(`Error in updateInvoiceStatus: ${error.message}`, error);
        throw error;
    } finally {
        await db.end();
    }
}

module.exports = { 
    createInvoice, 
    getInvoiceDetails, 
    getInvoices, 
    deleteInvoice, 
    updateInvoice,
    updateInvoiceStatus,
    createInvoiceItem,
    getLastInvoiceNumber
};
