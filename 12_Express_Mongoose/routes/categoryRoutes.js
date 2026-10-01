const express = require("express");

const {
    createCategory,
    getCategories,
    getCategory,
    updateCategory,
    deleteCategory,
} = require("../controllers/categoryController");

const router = express.Router();

// ==================================================
// CATEGORY ROUTES
// ==================================================

// POST /api/categories
router.post("/", createCategory);

// GET /api/categories
router.get("/", getCategories);

// GET /api/categories/:id
router.get("/:id", getCategory);

// PATCH /api/categories/:id
router.patch("/:id", updateCategory);

// DELETE /api/categories/:id
router.delete("/:id", deleteCategory);

module.exports = router;
