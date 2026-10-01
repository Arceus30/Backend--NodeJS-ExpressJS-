const { MongoClient } = require("mongodb");

async function connectDB() {
    const mongoClient = new MongoClient(
        "mongodb://localhost:27017/?replicaSet=rs0",
    );

    // Connect to MongoDB
    await mongoClient.connect();

    console.log(`Worker ${process.pid} connected to MongoDB`);

    // Select database and collection
    const db = mongoClient.db("socketio");
    try {
        await db.createCollection("socket_events", { capped: true, size: 1e6 });
    } catch (err) {
        // collection already exists
    }
    const collection = db.collection("socket_events");
    return collection;
}

module.exports = connectDB;
