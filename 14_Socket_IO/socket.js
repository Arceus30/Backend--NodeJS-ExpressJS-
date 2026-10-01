// Socket.IO's `Server` is responsible for managing real-time connections between the server and clients.
const { Server } = require("socket.io");
const registerConnectionHandlers = require("./socket/connection.js");
function createSocketServer(server) {
    // Create a Socket.IO server and attach it to the existing Node.js HTTP server.
    // Therefore both Express and Socket.IO are running through the same HTTP server.
    // Conceptually:
    //     Node HTTP Server
    //     /          \
    //    /            \
    //  Express       Socket.IO
    //   |               |
    //  HTTP           realtime
    //  request        connections

    // const io = new Server(server [, socketOptions]);
    const io = new Server(server, {
        // Socket.IO can recover a client's connection after a temporary disconnection.
        // Socket.IO can attempt to recover the connection and restore missed state/events when possible.
        connectionStateRecovery: {
            // The server will try to recover a disconnected client's state for up to 2 minutes.
            maxDisconnectionDuration: 2 * 60 * 1000,
            // If the connection is recovered, Socket.IO can skip running middleware again.
            // This is an important configuration option, specially when your application later has authentication/authorization middleware.
            skipMiddlewares: true,
        },

        maxHttpBufferSize: 10 * 1024 * 1024, // 10 MB
    });
    registerConnectionHandlers(io);
}
module.exports = createSocketServer;
