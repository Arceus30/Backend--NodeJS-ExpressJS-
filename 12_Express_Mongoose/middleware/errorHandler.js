// ==================================================
// GLOBAL ERROR HANDLER
// ==================================================
// Express recognizes an error-handling middleware because it has FOUR arguments:
// err, req, res, next
// --------------------------------------------------

const errorHandler = (err, req, res, next) => {
    console.error(err);

    // ==================================================
    // 1. MONGOOSE VALIDATION ERROR
    // ==================================================
    if (err.name === "ValidationError") {
        // Convert Mongoose's validation errors object into a simpler object that is easier for the client to understand.
        const errors = {};

        for (const field in err.errors) {
            errors[field] = err.errors[field].message;
        }

        return res.status(400).json({
            success: false,
            error: "Validation failed",
            details: errors,
        });
    }

    // ==================================================
    // 2. INVALID OBJECT ID
    // ==================================================
    if (err.name === "CastError") {
        return res.status(400).json({
            success: false,
            error: `Invalid value for ${err.path}`,
        });
    }

    // ==================================================
    // 3. DUPLICATE KEY ERROR
    // ==================================================
    // MongoDB uses error code 11000 for duplicate-key violations.
    // Examples in our project:
    // duplicate User.email
    // duplicate Category.name
    // duplicate (Review.user + Review.book)

    if (err.code === 11000) {
        // Find the field(s) that caused the conflict.
        const fields = Object.keys(err.keyValue || {});

        return res.status(409).json({
            success: false,
            error: "Duplicate value",
            fields,
        });
    }

    // ==================================================
    // 4. DEFAULT ERROR
    // ==================================================
    return res.status(500).json({
        success: false,
        error: "Internal server error",
    });
};

module.exports = errorHandler;
