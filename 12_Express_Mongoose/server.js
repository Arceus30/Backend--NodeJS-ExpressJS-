// Load variables from .env into process.env
require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

// Read PORT from .env. Use 3000 as a fallback.
const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        // First connect to MongoDB.
        // We don't want to start accepting requests before our database is ready.
        await connectDB();

        // Once MongoDB is connected, start Express.
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error.message);
    }
};

startServer();
