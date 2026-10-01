const server = require("./app");
const createSocketServer = require("./socket");

const startServer = async () => {
    try {
        server.listen(3000, () => {
            console.log("server running at http://localhost:3000");
        });
        createSocketServer(server);
    } catch (error) {
        console.error("Failed to start server:", error.message);
    }
};

startServer();
