const registerMessageHandler = require("./handlers/messageHandler");

function registerConnectionHandlers(io) {
    io.on("connection", (socket) => {
        console.log(`Socket connected: ${socket.id} | PID: ${process.pid}`);

        // Register message-related events
        registerMessageHandler(io, socket);

        socket.on("disconnect", (reason) => {
            console.log(
                `Socket disconnected: ${socket.id} | PID: ${process.pid} | Reason: ${reason}`,
            );
        });
    });
}

module.exports = registerConnectionHandlers;
