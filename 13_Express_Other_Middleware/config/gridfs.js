const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");

// --------------------------------------------------
// GET GRIDFS BUCKET
// --------------------------------------------------
// GridFSBucket gives us methods for storing and retrieving files from MongoDB.
// We don't create a new bucket for every request.
// Instead, we create one using the MongoDB database connection that Mongoose already established.

function getGridFSBucket() {
    // Mongoose exposes the underlying MongoDB database connection through: mongoose.connection.db
    const db = mongoose.connection.db;

    if (!db) {
        throw new Error("MongoDB connection is not ready.");
    }

    // "uploads" is our custom GridFS bucket name. GridFS will create collections such as:
    //     uploads.files
    //     uploads.chunks
    return new GridFSBucket(db, {
        bucketName: "uploads",
    });
}

module.exports = getGridFSBucket;
