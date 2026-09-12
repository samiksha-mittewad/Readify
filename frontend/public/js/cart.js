document.addEventListener("DOMContentLoaded", () => {

    // =====================================
    // ADD TO CART
    // =====================================

    const cartButtons = document.querySelectorAll(
        ".details-cart-btn, .btn-cart"
    );

    cartButtons.forEach(button => {

        button.addEventListener("click", async () => {

            const bookId = button.dataset.bookId;

            if (!bookId) {
                alert("Unable to add this book to cart.");
                return;
            }

            button.disabled = true;

            const originalContent = button.innerHTML;

            button.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                Adding...
            `;

            try {

                const response = await fetch("/cart/add", {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        bookId: bookId
                    })
                });

                const data = await response.json();


                if (data.success) {

                    button.innerHTML = `
                        <i class="fa-solid fa-check"></i>
                        Added to Cart
                    `;

                    button.classList.add("cart-added");


                    setTimeout(() => {

                        button.innerHTML = originalContent;

                        button.classList.remove("cart-added");

                        button.disabled = false;

                    }, 1500);

                } else {

                    alert(
                        data.message ||
                        "Unable to add book to cart."
                    );

                    button.innerHTML = originalContent;

                    button.disabled = false;
                }

            } catch (error) {

                console.error(
                    "Add to cart error:",
                    error
                );

                alert(
                    "Something went wrong. Please try again."
                );

                button.innerHTML = originalContent;

                button.disabled = false;
            }

        });

    });


    // =====================================
    // REMOVE FROM CART
    // =====================================

    const removeButtons =
        document.querySelectorAll(".remove-cart");


    removeButtons.forEach(button => {

        button.addEventListener("click", async () => {

            const cartId = button.dataset.cartId;

            if (!cartId) {
                return;
            }

            const confirmed = confirm(
                "Remove this book from your cart?"
            );

            if (!confirmed) {
                return;
            }

            button.disabled = true;

            try {

                const response = await fetch(
                    `/cart/remove/${cartId}`,
                    {
                        method: "DELETE"
                    }
                );

                const data = await response.json();


                if (data.success) {

                    window.location.reload();

                } else {

                    alert(
                        data.message ||
                        "Unable to remove item."
                    );

                    button.disabled = false;
                }

            } catch (error) {

                console.error(
                    "Remove cart error:",
                    error
                );

                alert(
                    "Something went wrong while removing the item."
                );

                button.disabled = false;
            }

        });

    });

});