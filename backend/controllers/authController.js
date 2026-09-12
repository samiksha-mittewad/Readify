const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const db = require("../config/db");


// =========================
// REGISTER PAGE
// =========================

exports.showRegister = (req, res) => {
    res.render("auth/register", {
        errors: [],
        old: {}
    });
};


// =========================
// REGISTER USER
// =========================

exports.register = async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.render("auth/register", {
            errors: errors.array(),
            old: req.body
        });
    }

    const { name, email, password } = req.body;

    try {

        // Check if email already exists
        const [existingUsers] = await db.query(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );

        if (existingUsers.length > 0) {
            return res.render("auth/register", {
                errors: [
                    {
                        msg: "An account with this email already exists."
                    }
                ],
                old: req.body
            });
        }


        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);


        // Insert user
        await db.query(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            [name, email, hashedPassword]
        );


        // Redirect to login
        res.redirect("/login?registered=true");

    } catch (error) {

        console.error("Registration Error:", error);

        res.status(500).render("errors/500", {
            message: "Something went wrong while creating your account."
        });

    }
};


// =========================
// LOGIN PAGE
// =========================

exports.showLogin = (req, res) => {

    res.render("auth/login", {
        errors: [],
        registered: req.query.registered === "true"
    });

};


// =========================
// LOGIN USER
// =========================

exports.login = async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {

        return res.render("auth/login", {
            errors: errors.array(),
            registered: false
        });

    }


    const { email, password } = req.body;

    try {

        const [users] = await db.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );


        if (users.length === 0) {

            return res.render("auth/login", {
                errors: [
                    {
                        msg: "Invalid email or password."
                    }
                ],
                registered: false
            });

        }


        const user = users[0];


        // Compare password
        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );


        if (!passwordMatch) {

            return res.render("auth/login", {
                errors: [
                    {
                        msg: "Invalid email or password."
                    }
                ],
                registered: false
            });

        }


        // Store user in session
        req.session.user = {
            id: user.id,
            name: user.name,
            email: user.email
        };


        res.redirect("/");

    } catch (error) {

        console.error("Login Error:", error);

        res.status(500).render("errors/500", {
            message: "Something went wrong while logging in."
        });

    }

};


// =========================
// LOGOUT
// =========================

exports.logout = (req, res) => {

    req.session.destroy((error) => {

        if (error) {
            console.error("Logout Error:", error);
        }

        res.redirect("/");

    });

};