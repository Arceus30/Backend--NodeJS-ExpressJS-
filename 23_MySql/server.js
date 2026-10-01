require("dotenv").config();
const app = require("./app");
const { pool, poolEnd } = require("./db/config.js");

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
async function shutdown(signal) {
    console.log(`${signal} received. Shutting down...`);
    server.close(async () => {
        console.log("HTTP server closed");
        try {
            await poolEnd();
            console.log("Database pool closed");
            process.exit(0);
        } catch (error) {
            console.error("Shutdown error:", error);
            process.exit(1);
        }
    });
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
