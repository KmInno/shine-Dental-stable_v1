const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/invoiceController");
const authenticateToken = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

router.get("/", authenticateToken, invoiceController.getAllInvoices);
router.get("/new", authenticateToken, invoiceController.buildInvoice);
router.post("/create", authenticateToken, invoiceController.addInvoice);
router.get("/:invoice_id", authenticateToken, invoiceController.invoiceDetails);
router.get("/edit/:invoice_id", authenticateToken, adminMiddleware, async (req, res, next) => {
    try {
        const invoice_id = req.params.invoice_id;
        const invoice = await require("../models/invoiceModel").getInvoiceDetails(invoice_id);

        if (!invoice) {
            return res.status(404).send("Invoice not found");
        }

        res.render("invoiceEdit", {
            title: "Edit Invoice",
            invoice,
            user: req.user
        });
    } catch (error) {
        console.error("Error fetching invoice for edit:", error);
        next(error);
    }
});
router.post("/edit/:invoice_id", authenticateToken, adminMiddleware, invoiceController.updateInvoice);
router.delete("/delete/:invoice_id", authenticateToken, adminMiddleware, invoiceController.deleteInvoice);
router.patch("/:invoice_id/status", authenticateToken, adminMiddleware, invoiceController.updateInvoiceStatus);

module.exports = router;
