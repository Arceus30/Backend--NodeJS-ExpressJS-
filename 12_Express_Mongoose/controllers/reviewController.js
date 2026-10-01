const Review = require("../models/Review");

// ==================================================
// CREATE REVIEW
// ==================================================
// POST /api/reviews
const createReview = async (req, res, next) => {
    try {
        const review = await Review.create(req.body);

        res.status(201).json({
            success: true,
            data: review,
        });
    } catch (error) {
        next(error);
    }
};

// ==================================================
// GET ALL REVIEWS
// ==================================================
// GET /api/reviews
const getReviews = async (req, res, next) => {
    try {
        // Populate BOTH references.
        const reviews = await Review.find()
            .populate("user")
            .populate({
                path: "book",
                populate: {
                    path: "category",
                },
            });

        res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews,
        });
    } catch (error) {
        next(error);
    }
};

// ==================================================
// GET ONE REVIEW
// ==================================================
// GET /api/reviews/:id
const getReview = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id)
            .populate("user")
            .populate("book");

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found",
            });
        }

        res.status(200).json({
            success: true,
            data: review,
        });
    } catch (error) {
        next(error);
    }
};

// ==================================================
// UPDATE REVIEW
// ==================================================
// PATCH /api/reviews/:id
const updateReview = async (req, res, next) => {
    try {
        const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        })
            .populate("user")
            .populate("book");

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found",
            });
        }

        res.status(200).json({
            success: true,
            data: review,
        });
    } catch (error) {
        next(error);
    }
};

// ==================================================
// DELETE REVIEW
// ==================================================
// DELETE /api/reviews/:id
const deleteReview = async (req, res, next) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Review deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createReview,
    getReviews,
    getReview,
    updateReview,
    deleteReview,
};
