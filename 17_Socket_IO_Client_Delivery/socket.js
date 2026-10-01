const { Server } = require("socket.io");
const registerConnectionHandlers = require("./socket/connection.js");
function createSocketServer(server) {
    const io = new Server(server);
    registerConnectionHandlers(io);
}
module.exports = createSocketServer;
