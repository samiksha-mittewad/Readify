const express = require("express");

const {
    getAllBooks,
    getBookById
} = require("../controllers/bookController");

const router = express.Router();


// =========================
// CATALOGUE
// =========================

router.get("/books", getAllBooks);


// =========================
// BOOK DETAILS
// =========================

router.get("/books/:id", getBookById);


module.exports = router;