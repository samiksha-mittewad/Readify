const db = require("../config/db");

// ===============================
// ADD BOOK TO CART
// ===============================
const addToCart = async (req, res) => {
    try {

        // Check login
        if (!req.session.user) {
            return res.status(401).json({
                success: false,
                message: "Please login to add books to your cart."
            });
        }

        const userId = req.session.user.id;
        const bookId = req.body.bookId;

        // Validate book ID
        if (!bookId) {
            return res.status(400).json({
                success: false,
                message: "Book ID is required."
            });
        }

        // Check whether book exists
        const [books] = await db.query(
            "SELECT * FROM books WHERE id = ?",
            [bookId]
        );

        if (books.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Book not found."
            });
        }

        const book = books[0];

        // Check whether book already exists in user's cart
        const [existingCart] = await db.query(
            `
            SELECT *
            FROM cart
            WHERE user_id = ?
            AND book_id = ?
            `,
            [userId, bookId]
        );

        if (existingCart.length > 0) {

            // Increase quantity
            await db.query(
                `
                UPDATE cart
                SET quantity = quantity + 1
                WHERE user_id = ?
                AND book_id = ?
                `,
                [userId, bookId]
            );

        } else {

            // Add new item
            await db.query(
                `
                INSERT INTO cart
                (user_id, book_id, quantity)
                VALUES (?, ?, 1)
                `,
                [userId, bookId]
            );
        }

        return res.json({
            success: true,
            message: `"${book.title}" added to your cart.`
        });

    } catch (error) {

        console.error("Add to cart error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to add book to cart."
        });
    }
};


// ===============================
// GET CART
// ===============================
const getCart = async (req, res) => {

    try {

        // User must be logged in
        if (!req.session.user) {
            return res.redirect("/login");
        }

        const userId = req.session.user.id;

        // Get cart items with book information
        const [cartItems] = await db.query(
            `
            SELECT
                cart.id,
                cart.book_id,
                cart.quantity,

                books.title,
                books.author,
                books.price,
                books.image,
                books.category,

                (books.price * cart.quantity) AS subtotal

            FROM cart

            INNER JOIN books
                ON cart.book_id = books.id

            WHERE cart.user_id = ?

            ORDER BY cart.id DESC
            `,
            [userId]
        );

        // Calculate total
        const total = cartItems.reduce(
            (sum, item) => sum + Number(item.subtotal),
            0
        );

        res.render("cart/cart", {
            cartItems,
            total,
            user: req.session.user
        });

    } catch (error) {

        console.error("Get cart error:", error);

        return res.status(500).render("errors/500", {
            message: "Unable to load your cart."
        });
    }
};


// ===============================
// REMOVE FROM CART
// ===============================
const removeFromCart = async (req, res) => {

    try {

        if (!req.session.user) {
            return res.status(401).json({
                success: false,
                message: "Please login first."
            });
        }

        const userId = req.session.user.id;
        const cartId = req.params.id;

        const [result] = await db.query(
            `
            DELETE FROM cart
            WHERE id = ?
            AND user_id = ?
            `,
            [cartId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Cart item not found."
            });
        }

        return res.json({
            success: true,
            message: "Item removed from cart."
        });

    } catch (error) {

        console.error("Remove cart error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to remove item."
        });
    }
};


module.exports = {
    addToCart,
    getCart,
    removeFromCart
};