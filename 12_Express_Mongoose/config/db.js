const mongoose = require("mongoose");

// Function responsible for connecting our Node.js application to the MongoDB database.
const connectDB = async () => {
    try {
        // mongoose.connect() establishes a connection with MongoDB.
        // "mongodb://127.0.0.1:27017/bookstore"
        // 127.0.0.1 -> MongoDB is running on our own computer
        // 27017     -> default MongoDB port
        // bookstore -> database name
        await mongoose.connect(process.env.MONGODB_URI);

        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);

        // If the database connection fails, there is no point in keeping our application running.
        process.exit(1);
    }
};

module.exports = connectDB;
