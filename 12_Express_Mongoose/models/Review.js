const mongoose = require("mongoose");

// ==================================================
// REVIEW SCHEMA
// ==================================================
const reviewSchema = new mongoose.Schema(
    {
        rating: {
            type: Number,
            required: [true, "Rating is required"],

            // Rating must be between 1 and 5.
            min: [1, "Rating must be at least 1"],
            max: [5, "Rating cannot be greater than 5"],

            validate: {
                validator: Number.isInteger,
                message: "Rating must be a whole number",
            },
        },

        comment: {
            type: String,
            required: [true, "Comment is required"],
            trim: true,
            minlength: [3, "Comment must be at least 3 characters long"],
            maxlength: [1000, "Comment cannot exceed 1000 characters"],
        },

        // ==================================================
        // RELATIONSHIP #1
        // ==================================================
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // This ObjectId refers to a User document.
            required: [true, "User is required"],
        },

        // ==================================================
        // RELATIONSHIP #2
        // ==================================================
        book: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Book", // This ObjectId refers to a Book document.
            required: [true, "Book is required"],
        },
    },
    {
        timestamps: true,
    },
);

// ==================================================
// INDEXING
// ==================================================

// quickly finds reviews written by a particular user.
reviewSchema.index({ user: 1 });

// quickly finds reviews belonging to a particular book.
reviewSchema.index({ book: 1 });

// --------------------------------------------------
// COMPOUND UNIQUE INDEX
// --------------------------------------------------
// The combination of: user + book must be unique.
// This means:
// User A + Book X   ✅
// User A + Book Y   ✅
// User B + Book X   ✅

// But:
// User A + Book X   ❌ again

// In other words, a user can review many books, and a book can have many reviews,
// but the SAME user cannot review the SAME book twice.

reviewSchema.index({ user: 1, book: 1 }, { unique: true });

// ==================================================
// MODEL
// ==================================================
const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
