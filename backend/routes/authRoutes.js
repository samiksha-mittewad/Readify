const express = require("express");
const { body } = require("express-validator");

const router = express.Router();

const authController = require("../controllers/authController");


// =========================
// REGISTER
// =========================

router.get(
    "/register",
    authController.showRegister
);


router.post(
    "/register",

    [
        body("name")
            .trim()
            .notEmpty()
            .withMessage("Name is required.")
            .isLength({ min: 2 })
            .withMessage("Name must contain at least 2 characters."),

        body("email")
            .trim()
            .isEmail()
            .withMessage("Please enter a valid email address."),

        body("password")
            .isLength({ min: 6 })
            .withMessage("Password must contain at least 6 characters.")
    ],

    authController.register
);


// =========================
// LOGIN
// =========================

router.get(
    "/login",
    authController.showLogin
);


router.post(
    "/login",

    [
        body("email")
            .trim()
            .isEmail()
            .withMessage("Please enter a valid email address."),

        body("password")
            .notEmpty()
            .withMessage("Password is required.")
    ],

    authController.login
);


// =========================
// LOGOUT
// =========================

router.get(
    "/logout",
    authController.logout
);


module.exports = router;