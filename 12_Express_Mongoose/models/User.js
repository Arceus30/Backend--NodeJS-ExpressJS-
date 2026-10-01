const mongoose = require("mongoose");

// ==================================================
// SCHEMA
// ==================================================
// A Schema describes the structure of documents that we want to store in MongoDB.
const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,

            // Validation: name must be provided.
            required: [true, "First name is required"],

            // Remove unnecessary whitespace.
            trim: true,

            // Validation: Name must contain at least 2 characters.
            minlength: [2, "First name must be at least 2 characters long"],
        },

        lastName: {
            type: String,
            required: [true, "Last name is required"],
            trim: true,
            minlength: [2, "Last name must be at least 2 characters long"],
        },

        fullName: {
            type: String,
            trim: true,
        },

        email: {
            type: String,

            required: [true, "Email is required"],

            // Convert email to lowercase before storing it.
            lowercase: true,

            trim: true,

            // Every user should have a unique email.
            unique: true,

            // Index allows MongoDB to find documents more efficiently.
            index: true,
        },

        username: {
            type: String,
            required: true,

            // multiple custom validations
            validate: [
                {
                    validator: function (value) {
                        return value.length >= 5;
                    },
                    message: "Username must be at least 5 characters",
                },

                {
                    validator: function (value) {
                        return /^[a-zA-Z0-9]+$/.test(value);
                    },
                    message: "Username can contain only letters and numbers",
                },
            ],
        },

        age: {
            type: Number,

            // User must be at least 13.
            min: [13, "User must be at least 13 years old"],

            validate: {
                validator: function (value) {
                    // `this` is the current document.
                    if (this.role === "admin") {
                        return value >= 18;
                    }

                    return true;
                },

                message: "Admin must be at least 18 years old",
            },
        },

        role: {
            type: String,
            enum: ["user", "admin"],
        },
    },

    {
        // Automatically add these fields:
        // createdAt
        // updatedAt
        timestamps: true,
    },
);

// ==================================================
// MIDDLEWARE
// ==================================================
// PRE SAVE MIDDLEWARE
// This function runs BEFORE a document is saved. "this" refers to the current User document.

// await user.save(): save middleware runs.
// await User.create(data);: save middleware runs as part of the document save.
// But: "await User.findByIdAndUpdate(id, update);": is a query operation, not a document .save() operation.

userSchema.pre("save", function (next) {
    console.log(`PRE SAVE: About to save user ${this.email}`);

    // Create fullName automatically before saving.
    this.fullName = `${this.firstName} ${this.lastName}`;

    next(); // Continue to the next step. If you forget, the operation can remain waiting.
});

// POST SAVE MIDDLEWARE
// This function runs AFTER the document has been successfully saved to MongoDB. "doc" is the document that was saved.
userSchema.post("save", function (doc) {
    console.log(`POST SAVE: User ${doc.email} was saved successfully`);
});

// PRE QUERY MIDDLEWARE
// This function runs BEFORE a document is updated.
// "await User.findByIdAndUpdate(userId,{ firstName: "Rahul" });" : can trigger the findOneAndUpdate middleware.
userSchema.pre("findOneAndUpdate", function (next) {
    console.log("A User is about to be updated");
    next();
});

userSchema.post("findOneAndUpdate", function (doc) {
    console.log("POST UPDATE: User update completed");
});

// ==================================================
// MODEL
// ==================================================

// A Model is created from a Schema.
// User is now the object we use to interact with the "users" collection in MongoDB.
const User = mongoose.model("User", userSchema);

// Export the model so controllers and other files can use it.
module.exports = User;
