const express = require("express");

const {
    createReview,
    getReviews,
    getReview,
    updateReview,
    deleteReview,
} = require("../controllers/reviewController");

const router = express.Router();

// CREATE: POST /api/reviews
router.post("/", createReview);

// READ ALL: GET /api/reviews
router.get("/", getReviews);

// READ ONE: GET /api/reviews/:id
router.get("/:id", getReview);

// UPDATE: PATCH /api/reviews/:id
router.patch("/:id", updateReview);

// DELETE: DELETE /api/reviews/:id
router.delete("/:id", deleteReview);

module.exports = router;
