const messageHandler = require("./handlers/messageHandler");

function registerConnectionHandlers(io) {
    io.on("connection", async (socket) => {
        console.log("Client connected:", socket.id);

        // Register message-related events
        messageHandler(io, socket);

        socket.on("disconnect", (reason) => {
            console.log(`${socket.id} user disconnected because: ${reason}`);
        });
    });
}

module.exports = registerConnectionHandlers;
