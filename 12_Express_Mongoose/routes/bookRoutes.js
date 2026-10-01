const express = require("express");

const {
    createBook,
    getBooks,
    getBook,
    updateBook,
    deleteBook,
    getBookStats,
    getBookReport,
    getCategorySummary,
} = require("../controllers/bookController");

const router = express.Router();

// CREATE: POST /api/books
router.post("/", createBook);

// READ ALL: GET /api/books
router.get("/", getBooks);

// GET /api/books/stats
router.get("/stats", getBookStats);

// GET /api/books/report
router.get("/report", getBookReport);

// GET /api/books/category-summary
router.get("/category-summary", getCategorySummary);

// READ ONE: GET /api/books/:id
router.get("/:id", getBook);

// UPDATE: PATCH /api/books/:id
router.patch("/:id", updateBook);

// DELETE: DELETE /api/books/:id
router.delete("/:id", deleteBook);

module.exports = router;
