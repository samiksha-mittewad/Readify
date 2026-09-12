const express = require("express");
const session = require("express-session");
const path = require("path");
require("dotenv").config();

const db = require("./backend/config/db");

const authRoutes = require("./backend/routes/authRoutes");
const bookRoutes = require("./backend/routes/bookRoutes");
const cartRoutes = require("./backend/routes/cartRoutes");

const app = express();

const PORT = process.env.PORT || 3000;


// ===============================
// EJS SETUP
// ===============================

app.set("view engine", "ejs");

app.set(
    "views",
    path.join(__dirname, "frontend", "views")
);


// ===============================
// STATIC FILES
// ===============================

app.use(
    express.static(
        path.join(__dirname, "frontend", "public")
    )
);


// ===============================
// BODY PARSER
// ===============================

app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(express.json());


// ===============================
// SESSION
// ===============================

app.use(
    session({
        secret:
            process.env.SESSION_SECRET ||
            "readify-secret-key",

        resave: false,

        saveUninitialized: false
    })
);


// ===============================
// ROUTES
// ===============================

// Authentication
app.use("/", authRoutes);

// Books
app.use("/", bookRoutes);

// Cart
app.use("/", cartRoutes);


// ===============================
// HOME PAGE
// ===============================

app.get("/", async (req, res) => {

    try {

        const [books] = await db.query(
            `
            SELECT *
            FROM books
            ORDER BY created_at DESC
            `
        );

        res.render("home", {

            books,

            user:
                req.session.user ||
                null

        });

    } catch (error) {

        console.error(
            "Database Error:",
            error
        );

        res.status(500).send(
            "Database connection error."
        );
    }
});


// ===============================
// START SERVER
// ===============================

app.listen(PORT, async () => {

    try {

        const connection =
            await db.getConnection();

        console.log(
            "✅ MySQL Connected Successfully!"
        );


        // Show database connection details

        const [info] =
            await connection.query(
                `
                SELECT
                    @@hostname AS hostname,
                    @@port AS port,
                    DATABASE() AS database_name
                `
            );


        console.log(
            "📊 Node.js MySQL Database:"
        );

        console.table(info);


        connection.release();


        console.log(
            `🚀 Readify is running at http://localhost:${PORT}`
        );

    } catch (error) {

        console.error(
            "❌ MySQL Connection Failed!"
        );

        console.error(
            error.message
        );
    }

});