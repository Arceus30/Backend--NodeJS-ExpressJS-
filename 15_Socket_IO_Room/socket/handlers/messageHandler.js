const { isValidRoomName, isValidMessage } = require("../validation");
const { addMessage } = require("../messageStore");
const { rateLimiter } = require("../rateLimiter");

function sendToRoom(io, socket) {
    // SEND TO ROOM
    // Two cases:
    // 1. room specified: Send to all members of that room.
    // 2. room empty: Send to all rooms that this socket belongs to. In the second case, we emit once for every room. This preserves the room name so the client can display:
    socket.on("send-message", ({ roomName, message }, callback) => {
        if (!isValidRoomName(roomName)) {
            callback({
                success: false,
                message: "Invalid room name",
            });
            return;
        }
        if (!isValidMessage(message)) {
            callback({
                success: false,
                message: "Invalid message",
            });
            return;
        }
        if (!socket.data.username) {
            callback({
                success: false,
                message: "You must set a username first",
            });

            return;
        }

        if (!rateLimiter(socket.id)) {
            callback({
                success: false,
                message: "Too many messages. Slow down.",
            });
            return;
        }
        roomName = roomName.trim();
        message = message.trim();

        if (!socket.rooms.has(roomName)) {
            callback({
                success: false,
                message: "You are not a member of this room",
            });
            return;
        }

        const newMessage = {
            username: socket.data.username,
            message,
            roomName,
            timestamp: new Date().toISOString(),
        };
        addMessage(newMessage);
        //  Sends to everyone in the room, including the sender if the sender is in that room
        io.to(roomName).emit("new-message", newMessage);

        callback({
            success: true,
            message: "Message sent",
        });
    });
}

function sendExceptToRoom(io, socket) {
    socket.on("send-except-to-room", ({ roomName, message }, callback) => {
        if (!isValidRoomName(roomName)) {
            callback({
                success: false,
                message: "Invalid room name",
            });
            return;
        }
        if (!isValidMessage(message)) {
            callback({
                success: false,
                message: "Invalid message",
            });
            return;
        }

        if (!socket.data.username) {
            callback({
                success: false,
                message: "You must set a username first",
            });

            return;
        }

        if (!rateLimiter(socket.id)) {
            callback({
                success: false,
                message: "Too many messages. Slow down.",
            });
            return;
        }
        roomName = roomName.trim();
        message = message.trim();

        if (!socket.rooms.has(roomName)) {
            callback({
                success: false,
                message: "You are not a member of this room",
            });
            return;
        }
        const newMessage = {
            username: socket.data.username,
            message,
            roomName,
            timestamp: new Date().toISOString(),
        };
        addMessage(newMessage);
        io.except(roomName).emit("new-message", newMessage);
        callback({
            success: true,
            message: "Message sent outside the room",
        });
    });
}

function sendPrivateMessage(io, socket) {
    socket.on(
        "send-private-message",
        ({ targetSocketId, message }, callback) => {
            // Make sure sender has a username
            if (!socket.data.username) {
                callback({
                    success: false,
                    message: "You must set a username first",
                });
                return;
            }

            // Validate message
            if (!isValidMessage(message)) {
                callback({
                    success: false,
                    message: "Invalid message",
                });
                return;
            }

            if (!rateLimiter(socket.id)) {
                callback({
                    success: false,
                    message: "Too many messages. Slow down.",
                });
                return;
            }
            console.log(targetSocketId, message);

            // Find target socket
            const targetSocket = io.sockets.sockets.get(targetSocketId);

            if (
                typeof targetSocketId !== "string" ||
                targetSocketId.trim().length === 0
            ) {
                callback({
                    success: false,
                    message: "Invalid target socket ID",
                });
                return;
            }

            const privateMessage = {
                from: socket.data.username,
                fromSocketId: socket.id,
                message: message.trim(),
                timestamp: new Date().toISOString(),
            };

            // Send only to target
            io.to(targetSocketId).emit("private-message", privateMessage);

            callback({
                success: true,
                message: "Private message sent",
            });
        },
    );
}

function typingIndicator(io, socket) {
    socket.on("typing", ({ roomName }) => {
        if (!socket.data.username) {
            return;
        }
        if (!socket.rooms.has(roomName)) {
            return;
        }
        socket.to(roomName).emit("user-typing", {
            username: socket.data.username,
        });
    });

    socket.on("stop-typing", ({ roomName }) => {
        if (!socket.data.username) {
            return;
        }
        if (!socket.rooms.has(roomName)) {
            return;
        }
        socket.to(roomName).emit("user-stop-typing", {
            username: socket.data.username,
        });
    });
}

function registerMessageHandler(io, socket) {
    sendToRoom(io, socket);
    sendExceptToRoom(io, socket);
    sendPrivateMessage(io, socket);
    typingIndicator(io, socket);
}

module.exports = registerMessageHandler;
