const express = require('express');
const router = express.Router();
const accountController = require("../controllers/accountCntl")


router.get("/login", accountController.buildLogin)
router.get("/signup", accountController.buildSignup)

router.post("/login", accountController.accountLogin)
router.post("/signup", accountController.signup)

router.get("/logout", accountController.logout)

router.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send("Something broke!")
})

module.exports = router;

