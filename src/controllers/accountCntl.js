const accountModel = require("../models/accounts-model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

/**********************
 * create account
 * *******************/

async function buildLogin(req, res, next) {
    res.render("login", { title: "Login" });
}

async function buildSignup(req, res, next) {
    res.render("signup", {
        title: "Sign Up",
        error: null,
    });
}

/***************************
 * process login
 * *************************/


async function accountLogin(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        req.flash("error", "Email and password are required");
        return res.status(400).render('login', {
            title: "Login",
            messages: req.flash(),
            email,
        });
    }

    try {
        const user = await accountModel.getAccountByEmail(email);

        if (!user || user.length === 0) {
            req.flash("error", "Invalid email or password");
            return res.status(401).render('login', {
                title: "Login",
                messages: req.flash(),
                email,
            });
        }

        const account = user[0];
        const isPasswordValid = await bcrypt.compare(password, account.password);

        if (!isPasswordValid) {
            req.flash("error", "Invalid email or password");
            return res.status(401).render('login', {
                title: "Login",
                messages: req.flash(),
                email,
            });
        }

        // Generate a token and set it in cookies
        const token = jwt.sign({ id: account.id, usertype: account.usertype }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "1h",
        });

        res.cookie("jwt", token, { httpOnly: true, secure: req.secure || process.env.NODE_ENV === "production" });
        req.flash("success", "Login successful");
        res.redirect("/");
    } catch (error) {
        console.error('Error during login:', error);
        req.flash("error", "An error occurred during login");
        res.status(500).render('login', {
            title: "Login",
            messages: req.flash(),
        });
    }
}


/***************************
 * build sign up page
 * *************************/

async function signup(req, res, next) {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 12); // Use a higher salt rounds value for better security
    const accountData = await accountModel.createAccount(name, email, hashedPassword);
    if (accountData) {
        req.flash("success", "Account created successfully. Please login");
        res.status(201).redirect("/account/login");
    } else {
        req.flash("error", "An error occurred. Please try again");
        res.status(500).render("signup", {
            title: "Sign Up",
            messages: req.flash(),
            name,
            email,
        });
    }
}

async function userDashBoard(req, res, next) {
    if (!req.session.user) {
        req.flash("notice", "Please login to view this page");
        return res.redirect("login");
    }
    res.render("index", {
        title: "Dashboard",
        user: req.session.user,
    });
}

async function logout(req, res, next) {
    try {
        // Clear cookies
        res.clearCookie("jwt", { path: "/" });
        res.clearCookie("refreshToken", { path: "/" });

        // Destroy the session
        req.session.destroy(err => {
            if (err) {
                console.error("Error destroying session:", err);
                return res.status(500).send("Unable to log out. Please try again.");
            }

            // Prevent browser caching and redirect
            res.set('Cache-Control', 'no-store');
            res.redirect("login");
        });
    } catch (error) {
        console.error("Logout error:", error);
        next(error); // Pass error to the error-handling middleware
    }
}


async function refreshToken(req, res) {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    try {
        const accountData = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        delete accountData.iat;
        delete accountData.exp;
        const newAccessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
        res.cookie("jwt", newAccessToken, { httpOnly: true, secure: process.env.NODE_ENV !== 'development', maxAge: 3600 * 1000 });
        return res.json({ accessToken: newAccessToken });
    } catch (error) {
        console.error("Error refreshing token", error);
        return res.status(403).json({ message: "Forbidden" });
    }
}

module.exports = {
    buildLogin,
    buildSignup,
    accountLogin,
    signup,
    userDashBoard,
    logout,
    refreshToken,
};