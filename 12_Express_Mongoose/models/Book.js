const mongoose = require("mongoose");

// ==================================================
// BOOK SCHEMA
// ==================================================
const bookSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Book title is required"],
            trim: true,
            minlength: [2, "Title must be at least 2 characters long"],
            maxlength: [200, "Title cannot exceed 200 characters"],
        },

        author: {
            type: String,
            required: [true, "Author is required"],
            trim: true,
            minlength: [2, "Author name must be at least 2 characters long"],
            maxlength: [100, "Author name cannot exceed 100 characters"],
        },

        price: {
            type: Number,
            required: [true, "Price is required"],

            // Price cannot be negative.
            min: [0, "Price cannot be negative"],

            // Price should have at most two decimal places.
            validate: {
                validator: function (value) {
                    // Example:
                    // 599.99 → true
                    // 599.9  → true
                    // 599.999 → false

                    return Number.isInteger(value * 100);
                },

                message: "Price can have at most 2 decimal places",
            },
        },

        stock: {
            type: Number,
            min: [0, "Stock cannot be negative"],

            // Default value if the client doesn't provide stock.
            default: 0,

            // Stock should be an integer.
            validate: {
                validator: Number.isInteger,
                message: "Stock must be a whole number",
            },
        },

        // enum validation
        status: {
            type: String,
            enum: {
                values: ["draft", "published", "archived"],
                message: "Invalid status",
            }, // Then any value other than draft published archived will not be accepted: deleted ❌, random ❌
        },

        // ==================================================
        // RELATIONSHIP
        // ==================================================
        category: {
            type: mongoose.Schema.Types.ObjectId, // This field will contain a MongoDB ObjectId.
            // "ref" tells Mongoose which model this ObjectId refers to.
            // In this case: Book.category → Category._id
            ref: "Category",

            required: [true, "Category is required"],
        },
    },

    {
        timestamps: true,
    },
);

// ==================================================
// INDEXING
// ==================================================

// Index are like additional data structure MongoDB maintains to make certain queries faster.

// 1 means ascending order.
// -1 means descending order.

// Create an index on "title". This makes queries "searching by title" more efficient.
// Example: Book.find({ title: "Clean Code" })
bookSchema.index({ title: 1 });

// Create a compound index. This creates an index using both category and price.
// It can help queries such as: Book.find({ category: someCategoryId, price: { $lt: 1000 }})
bookSchema.index({ category: 1, price: 1 });

// ==================================================
// MODEL
// ==================================================
const Book = mongoose.model("Book", bookSchema);

module.exports = Book;
