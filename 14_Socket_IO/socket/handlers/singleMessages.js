function handleAll(io, socket) {
    // Listen for a "chat message" event coming FROM this client.
    // `message` is the first argument sent by the client.
    socket.on("all chat message", async (message) => {
        console.log("A new message: ", message);
        // Send the event to EVERY connected socket.
        // This includes the client that originally sent the message.
        io.emit("all chat message", message);
    });
}

function handleOthers(socket) {
    socket.on("other chat message", (message) => {
        console.log("A new message: ", message);
        socket.broadcast.emit("other chat message", message); // Send to every socket EXCEPT the current socket.
    });
}

function handleMyself(socket) {
    socket.on("myself chat message", (message) => {
        console.log("A new message: ", message);
        socket.emit("myself chat message", message); // Send only to the current socket.
    });
}
function registerSingleMessageHandlers(io, socket) {
    handleAll(io, socket);
    handleOthers(socket);
    handleMyself(socket);
}

module.exports = registerSingleMessageHandlers;
