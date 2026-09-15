const express = require("express");
const router = express.Router();
const labWorkController = require("../controllers/labWorkController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

router.use(authMiddleware);

router.get("/", labWorkController.getLabWorkPage);
router.post("/", labWorkController.addLabWork);
router.put("/:id", adminMiddleware, labWorkController.updateLabWork);
router.delete("/:id", adminMiddleware, labWorkController.deleteLabWork);

module.exports = router;
