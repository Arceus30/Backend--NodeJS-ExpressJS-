const server = require("./app");
const createSocketServer = require("./socket");
const connectDB = require("./db/config");

const startServer = async () => {
    try {
        const PORT = process.env.PORT || 3000;
        server.listen(PORT, () => {
            console.log(`Worker ${process.pid} running on port ${PORT}`);
        });
        const mongoCollection = await connectDB();
        await createSocketServer(server, mongoCollection);
    } catch (error) {
        console.error("Failed to start server:", error.message);
    }
};

startServer();
