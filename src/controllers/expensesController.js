const ExpensesModel = require("../models/expensesModel");
const LabWorkModel = require("../models/labWorkModel");
const logger = require("../utils/logger");

async function renderExpensesPage(req, res, date) {
    const [expenses, regularExpenseTotal, labWork, labWorkTotal] = await Promise.all([
        ExpensesModel.getExpensesByDate(date),
        ExpensesModel.getTotalExpensesByDate(date),
        LabWorkModel.getLabWorkByDate(date),
        LabWorkModel.getTotalLabWorkByDate(date)
    ]);

    res.render("expenses", {
        title: "Expenses",
        expenses,
        totalExpenses: regularExpenseTotal + labWorkTotal,
        regularExpenseTotal,
        labWork,
        labWorkTotal,
        selectedDate: date,
        user: req.user
    });
}

// Render expenses page
async function getExpensesPage(req, res, next) {
    try {
        const today = new Date().toISOString().split('T')[0];
        await renderExpensesPage(req, res, today);
    } catch (error) {
        logger.error(`Error in getExpensesPage: ${error.message}`, error);
        next(error);
    }
}

// Add new expense
async function addExpense(req, res, next) {
    try {
        const { description, category, amount, expense_date } = req.body;
        
        // Validate input
        if (!description || !category || !amount) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (isNaN(amount) || amount <= 0) {
            return res.status(400).json({ message: "Amount must be a valid positive number" });
        }

        const normalizedDate = expense_date || new Date().toISOString().split('T')[0];

        await ExpensesModel.createExpense(description, category, parseFloat(amount), req.user.id, normalizedDate);

        res.status(201).json({ message: "Expense added successfully" });
    } catch (error) {
        logger.error(`Error in addExpense: ${error.message}`, error);
        res.status(500).json({ message: "Error adding expense" });
    }
}

async function getExpenseForEdit(req, res, next) {
    try {
        const { id } = req.params;
        const expense = await ExpensesModel.getExpenseById(id);

        if (!expense) {
            return res.status(404).render("error", {
                title: "Error",
                message: "Expense not found",
                user: req.user
            });
        }

        res.render("expenseEdit", {
            title: "Edit Expense",
            expense,
            user: req.user
        });
    } catch (error) {
        logger.error(`Error in getExpenseForEdit: ${error.message}`, error);
        next(error);
    }
}

// Get expenses by date
async function getExpensesByDate(req, res, next) {
    try {
        const { date } = req.query;
        
        if (!date) {
            return res.status(400).json({ message: "Date is required" });
        }

        await renderExpensesPage(req, res, date);
    } catch (error) {
        logger.error(`Error in getExpensesByDate: ${error.message}`, error);
        next(error);
    }
}

// Get expenses for date range
async function getExpensesRange(req, res, next) {
    try {
        const { startDate, endDate } = req.query;
        
        if (!startDate || !endDate) {
            return res.status(400).json({ message: "Start date and end date are required" });
        }

        const expenses = await ExpensesModel.getExpensesByDateRange(startDate, endDate);
        const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

        res.status(200).json({
            expenses: expenses,
            totalExpenses: totalExpenses,
            startDate: startDate,
            endDate: endDate
        });
    } catch (error) {
        logger.error(`Error in getExpensesRange: ${error.message}`, error);
        res.status(500).json({ message: "Error fetching expenses" });
    }
}

// Update expense
async function updateExpense(req, res, next) {
    try {
        const { id } = req.params;
        const { expense_date, description, category, amount } = req.body;

        if (!description || !category || !amount) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (isNaN(amount) || amount <= 0) {
            return res.status(400).json({ message: "Amount must be a valid positive number" });
        }

        const normalizedDate = expense_date || new Date().toISOString().split('T')[0];
        const updated = await ExpensesModel.updateExpense(id, normalizedDate, description, category, parseFloat(amount));

        if (updated) {
            res.status(200).json({ message: "Expense updated successfully" });
        } else {
            res.status(404).json({ message: "Expense not found" });
        }
    } catch (error) {
        logger.error(`Error in updateExpense: ${error.message}`, error);
        res.status(500).json({ message: "Error updating expense" });
    }
}

// Delete expense
async function deleteExpense(req, res, next) {
    try {
        const { id } = req.params;
        // Check permission: admin or creator only
        const expense = await ExpensesModel.getExpenseById(id);
        if (!expense) {
            return res.status(404).json({ message: "Expense not found" });
        }

        const isCreator = req.user && Number(req.user.id) === Number(expense.created_by);

        if (!isCreator) {
            return res.status(403).json({ message: "Forbidden: you don't have permission to delete this expense" });
        }

        const deleted = await ExpensesModel.deleteExpense(id);

        if (deleted) {
            res.status(200).json({ message: "Expense deleted successfully" });
        } else {
            res.status(500).json({ message: "Failed to delete expense" });
        }
    } catch (error) {
        logger.error(`Error in deleteExpense: ${error.message}`, error);
        res.status(500).json({ message: "Error deleting expense" });
    }
}

module.exports = {
    getExpensesPage,
    addExpense,
    getExpenseForEdit,
    getExpensesByDate,
    getExpensesRange,
    updateExpense,
    deleteExpense
};
