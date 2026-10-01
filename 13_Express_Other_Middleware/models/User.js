const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    // Local authentication
    username: {
        type: String,
        sparse: true, // It allows MongoDB's unique index to coexist with documents where that optional field isn't present.
        unique: true,
    },

    password: {
        type: String,
    },

    // Google authentication: Google gives each Google account a unique identifier.
    // We store that identifier so that when the user comes back through Google, we can find their existing account.
    googleId: {
        type: String,
        unique: true,
        sparse: true,
    },

    displayName: {
        type: String,
    },

    email: {
        type: String,
    },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
