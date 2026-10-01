// const { Server } = require("socket.io");
// const { createAdapter } = require("@socket.io/cluster-adapter");

// const registerConnectionHandlers = require("./socket/connection.js");
// // const setupWorkerBridge = require("./workerBridge");

// function createSocketServer(server) {
//     const io = new Server(server, {
//         // Required for our Socket.IO setup
//         connectionStateRecovery: {},

//         // 🔥 Important part
//         adapter: createAdapter(),
//     });
//     registerConnectionHandlers(io);

//     // Listen for events coming from other workers through the primary.
//     // primitive adapter
//     // setupWorkerBridge(io);
// }
// module.exports = createSocketServer;

const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/mongo-adapter");
const registerConnectionHandlers = require("./socket/connection");

async function createSocketServer(server, mongoCollection) {
    const io = new Server(server, {
        connectionStateRecovery: {},
        // MongoDB will act as the communication layer between our Socket.IO workers.
        adapter: createAdapter(mongoCollection),
    });
    registerConnectionHandlers(io);
}
module.exports = createSocketServer;
