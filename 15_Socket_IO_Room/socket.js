const { Server } = require("socket.io");

const registerConnectionHandlers = require("./socket/connection.js");

function createSocketServer(server) {
    const io = new Server(server, {
        connectionStateRecovery: {
            maxDisconnectionDuration: 2 * 60 * 1000,
            skipMiddlewares: true,
        },
    });
    registerConnectionHandlers(io);
}

module.exports = createSocketServer;
