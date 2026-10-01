const express = require("express");

const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const bookRoutes = require("./routes/bookRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

const errorHandler = require("./middleware/errorHandler");

const app = express();

// ==================================================
// MIDDLEWARE
// ==================================================
app.use(express.json()); // Parse JSON request bodies.

// ==================================================
// ROUTES
// ==================================================
// Every route inside userRoutes will now start with: /api/users
// So:
// router.get("/")        → GET /api/users
// router.get("/:id")     → GET /api/users/:id
app.use("/api/users", userRoutes);

app.use("/api/categories", categoryRoutes);

app.use("/api/books", bookRoutes);

app.use("/api/reviews", reviewRoutes);

// ==================================================
// ROOT ROUTES
// ==================================================
app.get("/", (req, res) => {
    res.json({
        message: "Book Store API is running",
    });
});

// ==================================================
// GLOBAL ERROR HANDLER
// ==================================================

// IMPORTANT: This must come AFTER the routes. Any error forwarded to next(error) will eventually arrive here.
app.use(errorHandler);

// Export the Express application.
// We don't call app.listen() here.

// app.js is responsible for CONFIGURING the application.
// server.js will be responsible for STARTING it.
module.exports = app;
