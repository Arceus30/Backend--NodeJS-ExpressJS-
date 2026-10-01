function handleAll(io, socket) {
    // Listen for a "chat messages" event.
    // The `...messages` syntax collects ALL arguments sent with the event into an array.
    socket.on("all chat messages", (...messages) => {
        console.log("A new message: ", messages);
        // This one sends the received messages back out to clients.
        io.emit("all chat messages", ...messages);
    });
}

function handleOthers(socket) {
    socket.on("other chat messages", (...messages) => {
        console.log("A new message: ", messages);
        socket.broadcast.emit("other chat messages", ...messages); // Send to every socket EXCEPT the current socket.
    });
}

function handleMyself(socket) {
    socket.on("myself chat messages", (...messages) => {
        console.log("A new message: ", messages);
        socket.emit("myself chat messages", ...messages); // Send only to the current socket.
    });
}
function registerMultipleMessageHandlers(io, socket) {
    handleAll(io, socket);
    handleOthers(socket);
    handleMyself(socket);
}

module.exports = registerMultipleMessageHandlers;
