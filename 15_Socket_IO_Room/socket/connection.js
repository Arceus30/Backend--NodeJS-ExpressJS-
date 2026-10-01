const userHandler = require("./handlers/userHandler.js");
const registerRoomHandlers = require("./handlers/roomHandler.js");
const registerMessageHandlers = require("./handlers/messageHandler.js");
const {
    getRoomMemberCount,
    broadcastRoomList,
    broadcastRoomUsers,
} = require("./roomUtils");
const { clearRateLimit } = require("./rateLimiter");

function registerConnectionHandlers(io) {
    io.on("connection", (socket) => {
        console.log(`Socket connected: ${socket.id}`);

        if (socket.recovered) {
            console.log(`Socket recovered: ${socket.id}`);
        } else {
            console.log(`New connection: ${socket.id}`);
        }
        socket.emit("connection-status", {
            recovered: socket.recovered,
        });

        userHandler(socket);
        registerRoomHandlers(io, socket);
        registerMessageHandlers(io, socket);

        let roomsBeforeDisconnect = [];
        socket.on("disconnecting", () => {
            roomsBeforeDisconnect = [...socket.rooms].filter(
                (room) => room !== socket.id,
            );
            for (const roomName of roomsBeforeDisconnect) {
                socket.to(roomName).emit("user-disconnected", {
                    socketId: socket.id,
                    username: socket.data.username,
                    roomName,
                });
            }
        });

        socket.on("disconnect", (reason) => {
            console.log(`Socket disconnected: ${socket.id}`);
            console.log(`Reason: ${reason}`);
            clearRateLimit(socket.id);
            for (const roomName of roomsBeforeDisconnect) {
                const memberCount = getRoomMemberCount(io, roomName);
                io.to(roomName).emit("room-member-count", {
                    roomName,
                    memberCount: memberCount,
                });
                broadcastRoomUsers(io, roomName);
            }
            broadcastRoomList(io);
        });
    });
}

module.exports = registerConnectionHandlers;
