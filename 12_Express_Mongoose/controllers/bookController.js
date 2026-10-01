const mongoose = require("mongoose");

const Book = require("../models/Book");
const Category = require("../models/Category");

// ==================================================
// CREATE BOOK
// ==================================================
// POST /api/books
const createBook = async (req, res, next) => {
    try {
        // ----------------------------------------------
        // Check whether category ID is a valid ObjectId
        // ----------------------------------------------
        if (!mongoose.Types.ObjectId.isValid(req.body.category)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID",
            });
        }

        // ----------------------------------------------
        // Check whether the Category actually exists
        // ----------------------------------------------
        const category = await Category.findById(req.body.category);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        const book = await Book.create(req.body);

        res.status(201).json({
            success: true,
            data: book,
        });
    } catch (error) {
        next(error);
    }
};

// ==================================================
// GET ALL BOOKS WITH QUERY FILTERS + SORTING + PAGINATION
// ==================================================
// GET /api/books
// Examples:
// /api/books
// /api/books?author=Robert
// /api/books?category=64abc...
// /api/books?minPrice=300&maxPrice=1000
// /api/books?search=clean
// /api/books?sort=price
// /api/books?sort=-price
// /api/books?page=2&limit=10

const getBooks = async (req, res, next) => {
    try {
        if (req.query.minPrice && Number.isNaN(Number(req.query.minPrice))) {
            return res.status(400).json({
                success: false,
                message: "minPrice must be a number",
            });
        }
        if (req.query.maxPrice && Number.isNaN(Number(req.query.maxPrice))) {
            return res.status(400).json({
                success: false,
                message: "maxPrice must be a number",
            });
        }

        // const books = await Book.find();
        // Above line would return:
        // {
        //     title: "Clean Code",
        //     category: "68abc123..."
        // }
        //
        // populate("category") tells Mongoose: "Go to the Category collection and replace this ObjectId with the corresponding document."
        // const books = await Book.find().populate("category");

        // By default populate() fills entire object but we can select the fields we want.
        // Any field which have a prefix "-" will not be fetched
        // const books = await Book.find().populate("category", "name -_id");

        // 1.) Empty filter object
        const filter = {};

        // 2.) Author filter
        if (req.query.author) {
            // Regex allows partial matching.
            // Example: ?author=robert can match:
            // "Robert C. Martin"
            // "Robert Jordan"
            // "robert@example..." etc.
            //
            // "i" means case-insensitive.
            filter.author = {
                $regex: req.query.author,
                $options: "i",
            };
        }

        // --------------------------------------------------
        // STEP 3: CATEGORY FILTER
        // --------------------------------------------------
        if (req.query.category) {
            // category is already an ObjectId in MongoDB. We can pass the id and Mongoose will cast it to ObjectId based on our schema.
            filter.category = req.query.category;
        }

        // --------------------------------------------------
        // STEP 4: PRICE FILTER
        // --------------------------------------------------
        if (req.query.minPrice || req.query.maxPrice) {
            // Create an object containing price operators.
            filter.price = {};

            // Greater than or equal to price >= minPrice
            if (req.query.minPrice) {
                filter.price.$gte = Number(req.query.minPrice);
            }

            // Less than or equal to price <= maxPrice
            if (req.query.maxPrice) {
                filter.price.$lte = Number(req.query.maxPrice);
            }
        }

        // --------------------------------------------------
        // STEP 5: TITLE SEARCH
        // --------------------------------------------------
        if (req.query.search) {
            filter.title = {
                $regex: req.query.search,
                $options: "i",
            };
        }

        // --------------------------------------------------
        // STEP 6: PAGINATION
        // --------------------------------------------------
        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
        const skip = (page - 1) * limit;

        // --------------------------------------------------
        // STEP 7: EXECUTE QUERY
        // --------------------------------------------------
        const books = await Book.find(filter)
            .populate("category")

            // Sorting:
            // We can sort the result based on any field
            // price: Sort ascending order
            // -price: Sort descending order
            .sort(req.query.sort || "-createdAt")
            .skip(skip)
            .limit(limit);

        // ==================================================
        // TOTAL COUNT
        // ==================================================
        const total = await Book.countDocuments(filter);

        res.status(200).json({
            success: true,
            count: books.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: books,
        });
    } catch (error) {
        next(error);
    }
};

// ==================================================
// GET ONE BOOK
// ==================================================
// GET /api/books/:id
const getBook = async (req, res, next) => {
    try {
        // const book = await Book.findById(req.params.id);
        const book = await Book.findById(req.params.id).populate("category");

        if (!book) {
            return res.status(404).json({
                success: false,
                message: "Book not found",
            });
        }

        res.status(200).json({
            success: true,
            data: book,
        });
    } catch (error) {
        next(error);
    }
};

// ==================================================
// UPDATE BOOK
// ==================================================
// PATCH /api/books/:id
const updateBook = async (req, res, next) => {
    try {
        const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true, // the schema validations are run with every update
        });

        if (!book) {
            return res.status(404).json({
                success: false,
                message: "Book not found",
            });
        }

        res.status(200).json({
            success: true,
            data: book,
        });
    } catch (error) {
        next(error);
    }
};

// ==================================================
// DELETE BOOK
// ==================================================
// DELETE /api/books/:id
const deleteBook = async (req, res, next) => {
    try {
        const book = await Book.findByIdAndDelete(req.params.id);

        if (!book) {
            return res.status(404).json({
                success: false,
                message: "Book not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Book deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};

// ==================================================
// BOOK STATISTICS
// ==================================================
// "GET /api/books/stats" : This endpoint demonstrates MongoDB aggregation.
const getBookStats = async (req, res, next) => {
    try {
        const stats = await Book.aggregate([
            {
                $match: {
                    price: {
                        $gte: 500,
                    },
                },
                $group: {
                    _id: null, // means, conceptually: Put all matching documents into one group.

                    // Count total number of books.
                    totalBooks: {
                        $sum: 1,
                    },

                    // Calculate average price.
                    averagePrice: {
                        $avg: "$price", // "$" In an aggregation expression, that means: "Use the value of the price field from the current document."
                    },

                    // Find cheapest book.
                    minimumPrice: {
                        $min: "$price",
                    },

                    // Find most expensive book.
                    maximumPrice: {
                        $max: "$price",
                    },
                },
                $sort: {
                    price: -1,
                },
            },
        ]);

        res.status(200).json({
            success: true,
            data: stats[0] || {
                totalBooks: 0,
                averagePrice: 0,
                minimumPrice: 0,
                maximumPrice: 0,
            },
        });
    } catch (error) {
        next(error);
    }
};

// ==================================================
// BOOK REPORT USING AGGREGATION
// ==================================================
// "GET /api/books/report" : This demonstrates:
// $match
// $lookup
// $unwind
// $project
// $sort

const getBookReport = async (req, res, next) => {
    try {
        const report = await Book.aggregate([
            // ==================================================
            // STAGE 1: $MATCH
            // ==================================================
            {
                $match: {
                    stock: {
                        $gt: 0,
                    },
                },
            },

            // ==================================================
            // STAGE 2: $LOOKUP
            // ==================================================
            // $lookup returns an array of matching docs
            {
                $lookup: {
                    // MongoDB collection we want to join with.
                    // Mongoose model:
                    // Category
                    //
                    // MongoDB collection:
                    // categories
                    from: "categories",

                    // Field in the Book document.
                    localField: "category",

                    // Field in the Category document.
                    foreignField: "_id",

                    // Name of the new field.
                    as: "categoryInfo",
                },
            },

            // ==================================================
            // STAGE 3: $UNWIND
            // ==================================================
            // $unwind is an aggregation stage used to break an array into separate documents.
            // Example:
            // {
            //   name: "John",
            //   skills: ["JavaScript", "MongoDB", "Node.js"]
            // }
            // after unwind om skills the above object will become:
            // { name: "John", skills: "JavaScript" }
            // { name: "John", skills: "MongoDB" }
            // { name: "John", skills: "Node.js" }

            // By default, documents where the array is missing, null, or empty are removed.
            // You can keep them with: preserveNullAndEmptyArrays: true

            // includeArrayIndex: You can also get the original array index:
            {
                $unwind: "$categoryInfo",
            },

            // ==================================================
            // STAGE 4: $PROJECT
            // ==================================================
            {
                $project: {
                    // Keep these fields.
                    title: 1,
                    author: 1,
                    price: 1,
                    stock: 1,

                    // Instead of returning the whole categoryInfo object, return only its name.
                    category: "$categoryInfo.name",

                    // We don't need these in the API response.
                    _id: 0,
                },
            },

            // ==================================================
            // STAGE 5: $SORT
            // ==================================================
            {
                $sort: {
                    price: -1,
                },
            },
        ]);

        res.status(200).json({
            success: true,
            count: report.length,
            data: report,
        });
    } catch (error) {
        next(error);
    }
};

// ==================================================
// CATEGORY SUMMARY
// ==================================================
// GET /api/books/category-summary
const getCategorySummary = async (req, res, next) => {
    try {
        const summary = await Book.aggregate([
            // --------------------------------------------------
            // 1. LOOKUP CATEGORY
            // --------------------------------------------------
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "categoryInfo",
                },
            },

            // --------------------------------------------------
            // 2. UNWIND CATEGORY
            // --------------------------------------------------
            {
                $unwind: "$categoryInfo",
            },

            // --------------------------------------------------
            // 3. GROUP BY CATEGORY
            // --------------------------------------------------
            {
                $group: {
                    // This becomes our grouping key.
                    _id: "$categoryInfo.name",

                    // Count books.
                    bookCount: {
                        $sum: 1,
                    },

                    // Average price.
                    averagePrice: {
                        $avg: "$price",
                    },

                    // Highest price.
                    highestPrice: {
                        $max: "$price",
                    },
                },
            },

            // --------------------------------------------------
            // 4. PROJECT FINAL SHAPE
            // --------------------------------------------------
            {
                $project: {
                    // Rename _id → category.
                    _id: 0,

                    category: "$_id",

                    bookCount: 1,

                    // Round average price to 2 decimal places.
                    averagePrice: {
                        $round: ["$averagePrice", 2],
                    },

                    highestPrice: 1,
                },
            },

            // --------------------------------------------------
            // 5. SORT
            // --------------------------------------------------
            {
                $sort: {
                    bookCount: -1,
                },
            },
        ]);

        res.status(200).json({
            success: true,
            count: summary.length,
            data: summary,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createBook,
    getBooks,
    getBook,
    updateBook,
    deleteBook,
    getBookStats,
    getBookReport,
    getCategorySummary,
};
