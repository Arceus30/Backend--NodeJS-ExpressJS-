const messageService = require("../../service/messageService");

// Client wants to create a new message
function createMessage(io, socket) {
    socket.on("create-message", (content) => {
        const message = messageService.createMessage(content);
        // Normal delivery
        io.emit("new-message", message);
        // Simulate the same event being delivered again
        setTimeout(() => {
            io.emit("new-message", message);
        }, 1000);
    });
}

// Method 1:
// Client requests the complete current state
function requestFullState(io, socket) {
    socket.on("request-full-state", () => {
        const messages = messageService.getAllMessages();
        socket.emit("full-state", {
            messages,
            type: "full",
        });
    });
}

// Method 2:
// Client tells the server the last message it received
function requestMissingEvents(io, socket) {
    socket.on("request-missing-events", (lastReceivedId) => {
        const messages = messageService.getMessagesAfter(lastReceivedId);
        socket.emit("missing-events", {
            messages,
            type: "missing",
            afterId: lastReceivedId,
        });
    });
}

function messageHandler(io, socket) {
    createMessage(io, socket);
    requestFullState(io, socket);
    requestMissingEvents(io, socket);
}

module.exports = messageHandler;
