const express = require("express");
const router = express.Router();
const labWorkController = require("../controllers/labWorkController");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.get("/", labWorkController.getLabWorkPage);
router.post("/", labWorkController.addLabWork);
router.delete("/:id", labWorkController.deleteLabWork);

module.exports = router;
