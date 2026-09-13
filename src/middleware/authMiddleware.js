const jwt = require("jsonwebtoken");
require("dotenv").config();

function authenticateToken(req, res, next) {
    const token = req.cookies.jwt;
    console.log("JWT Token:", token);
    if (!token) {
        req.flash("error", "Please login to view this page");
        return res.redirect("/account/login");
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            req.flash("error", "Session expired. Please login again");
            return res.redirect("/account/login");
        }
        req.user = user;
        next();
    });
}

module.exports = authenticateToken;