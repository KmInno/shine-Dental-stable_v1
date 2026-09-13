const User = require("../models/accounts-model");

async function adminMiddleware(req, res, next) {
    try {
        // Check if user is authenticated and is an admin
        if (!req.user) {
            return res.status(401).json({ message: "Authentication required." });
        }
        
        if (req.user.usertype !== 'admin') {
            return res.status(403).json({ message: "Admin access required." });
        }
        
        next();
    } catch (error) {
        console.error("Error in adminMiddleware:", error);
        res.status(403).json({ message: "Access denied." });
    }
}

module.exports = adminMiddleware;