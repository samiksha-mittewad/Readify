const express = require("express");

const {
    addToCart,
    getCart,
    removeFromCart
} = require("../controllers/cartController");

const router = express.Router();


// View cart
router.get("/cart", getCart);


// Add book to cart
router.post("/cart/add", addToCart);


// Remove item from cart
router.delete("/cart/remove/:id", removeFromCart);


module.exports = router;