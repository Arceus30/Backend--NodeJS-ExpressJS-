const mongoose = require("mongoose");

// ==================================================
// CATEGORY SCHEMA
// ==================================================
const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,

            // A category must have a name.
            required: [true, "Category name is required"],

            // Remove whitespace around the name.
            trim: true,

            // Category names should not be empty.
            minlength: [2, "Category name must be at least 2 characters long"],

            // Two categories shouldn't have the same name.
            unique: true,
        },

        description: {
            type: String,

            // Optional field.
            trim: true,

            // Prevent excessively long descriptions.
            maxlength: [500, "Description cannot exceed 500 characters"],
        },
    },

    {
        timestamps: true,
    },
);

// ==================================================
// MODEL
// ==================================================
const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
