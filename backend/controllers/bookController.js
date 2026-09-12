const db = require("../config/db");

// Get all books
const getAllBooks = async (req, res) => {
    try {
        const [books] = await db.query(
            "SELECT * FROM books ORDER BY created_at DESC"
        );

        res.render("books", {
            books,
            user: req.session.user || null
        });

    } catch (error) {
        console.error("Error fetching books:", error);

        res.status(500).render("errors/500", {
            message: "Unable to load books."
        });
    }
};


// Get single book
const getBookById = async (req, res) => {
    try {
        const bookId = req.params.id;

        const [books] = await db.query(
            "SELECT * FROM books WHERE id = ?",
            [bookId]
        );

        if (books.length === 0) {
            return res.status(404).render("errors/404");
        }

        res.render("books/details", {
            book: books[0],
            user: req.session.user || null
        });

    } catch (error) {
        console.error("Error fetching book:", error);

        res.status(500).render("errors/500", {
            message: "Unable to load book details."
        });
    }
};


module.exports = {
    getAllBooks,
    getBookById
};