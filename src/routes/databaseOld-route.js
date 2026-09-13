const express = require('express');
const router = express.Router();
const databaseOldController = require('../controllers/databaseOldController');
const authenticateToken = require("../middleware/authMiddleware");


// Route for Database Old page
router.get('/', authenticateToken, databaseOldController.buildPage); 
console.log(typeof authenticateToken);
console.log(typeof databaseOldController.buildPage);
module.exports = router;