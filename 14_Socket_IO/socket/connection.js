const registerSingleMessageHandlers = require("./handlers/singleMessages.js");
const registerMultipleMessageHandlers = require("./handlers/multipleMessages.js");
const registerCatchAllHandlers = require("./handlers/catchAll.js");
const registerCSRHandlers = require("./handlers/CSRHandlers");
const registerAcknowledgementHandlers = require("./handlers/acknowledgements.js");
const registerDataFormHandler = require("./handlers/dataFormHandler.js");

function registerConnectionHandlers(io) {
    // The "connection" event fires every time a new client successfully connects to the Socket.IO server.
    // This distinction is extremely important:
    //     io     -> everyone / entire Socket.IO server
    //     socket -> one connected client
    io.on("connection", async (socket) => {
        // Every socket gets a unique ID assigned by Socket.IO. This ID identifies this particular connection.
        console.log("Client connected:", socket.id);

        // `socket.recovered` tells us whether this connection was successfully recovered after a temporary disconnection.
        // This relates to the `connectionStateRecovery` configuration we enabled in socket.js.
        console.log(
            `Connection State Recovery: ${
                socket.recovered ? "RECOVERED" : "NOT RECOVERED"
            }`,
        );

        registerCatchAllHandlers(socket);
        registerSingleMessageHandlers(io, socket);
        registerMultipleMessageHandlers(io, socket);
        registerCSRHandlers(socket);
        registerAcknowledgementHandlers(socket);

        registerDataFormHandler(io, socket);

        // Listen for the `disconnect` event.
        // Socket.IO fires this when this particular client disconnects.
        socket.on("disconnect", (reason) => {
            console.log(`${socket.id} user disconnected because: ${reason}`);
        });
    });
}

module.exports = registerConnectionHandlers;
