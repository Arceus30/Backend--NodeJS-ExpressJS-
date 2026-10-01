const { isValidRoomName } = require("../validation");
const {
    getRoomMemberCount,
    broadcastRoomList,
    broadcastRoomUsers,
    getApplicationRooms,
    getRoomUsers,
} = require("../roomUtils");
const { getRoomMessages } = require("../messageStore");

function joinRoom(io, socket) {
    socket.on("join-room", (roomName, callback) => {
        if (!isValidRoomName(roomName)) {
            callback({ success: false, message: "Room name is invalid" });
            return;
        }
        roomName = roomName.trim();
        // Make sure username exists
        if (!socket.data.username) {
            callback({
                success: false,
                message: "You must set a username first",
            });

            return;
        }
        if (socket.rooms.has(roomName)) {
            callback({
                success: false,
                message: `You are already in ${roomName}`,
            });
            return;
        }

        // A socket can technically belong to multiple rooms.
        // Our application, however, treats currentRoom as the user's active room.
        // Therefore, leave existing application rooms first.
        const oldRooms = [...socket.rooms].filter((room) => room !== socket.id);

        for (const oldRoom of oldRooms) {
            socket.leave(oldRoom);
            // Update remaining members
            // Send updated member count to everyone in the room
            const memberCount = getRoomMemberCount(io, oldRoom);
            io.to(oldRoom).emit("room-member-count", {
                roomName: oldRoom,
                memberCount,
            });
            broadcastRoomUsers(io, oldRoom);
        }

        // Add this socket/client to a room named "Room R1". A room is a server-side grouping of sockets.
        // For example:
        //     Room R1
        //     ├── Client A
        //     ├── Client C
        //     └── Client F
        // A client can be in multiple rooms at the same time.
        socket.join(roomName);

        const history = getRoomMessages(roomName);
        socket.emit("room-history", history);

        console.log(`${socket.data.username} joined room ${roomName}`);
        callback({ success: true, message: `Successfully joined ${roomName}` }); // Tell ONLY this client that the join succeeded.
        // Send the current room membership whenever this handler is registered. This gives the client the initial source of truth.
        socket.emit("room-joined", roomName);
        // Sends to everyone in the room except the current socket.
        socket.to(roomName).emit("user-joined", {
            username: socket.data.username,
            socketId: socket.id,
            roomName,
        });
        // Send updated member count to everyone in the room
        const memberCount = getRoomMemberCount(io, roomName);
        io.to(roomName).emit("room-member-count", {
            roomName,
            memberCount,
        });
        broadcastRoomUsers(io, roomName);
        broadcastRoomList(io);
    });
}

function leaveRoom(io, socket) {
    socket.on("leave-room", (roomName, callback) => {
        if (!isValidRoomName(roomName)) {
            callback({ success: false, message: "Room name is invalid" });
            return;
        }
        if (!socket.rooms.has(roomName)) {
            callback({
                success: false,
                message: `You are not in ${roomName}`,
            });
            return;
        }
        // Remove the current socket from "Room R1".
        // `socket` refers to the particular client whose connection is currently being handled.
        socket.leave(roomName);
        console.log(`${socket.id} left room ${roomName}`);
        callback({
            success: true,
            message: `Successfully left ${roomName}`,
        });
        socket.emit("room-left", roomName);
        socket.to(roomName).emit("user-left", {
            username: socket.data.username,
            socketId: socket.id,
            roomName,
        });
        // Send updated count to remaining members
        const memberCount = getRoomMemberCount(io, roomName);
        io.to(roomName).emit("room-member-count", {
            roomName,
            memberCount,
        });
        broadcastRoomList(io);
        broadcastRoomUsers(io, roomName);
    });
}

function getRoomUsersHandler(io, socket) {
    socket.on("get-room-users", (roomName, callback) => {
        // Validate room name
        if (!isValidRoomName(roomName)) {
            callback({
                success: false,
                message: "Invalid Room name",
            });
            return;
        }
        // Make sure the socket is actually in the room
        if (!socket.rooms.has(roomName)) {
            callback({
                success: false,
                message: "You are not a member of this room",
            });
            return;
        }
        callback({
            success: true,
            users: getRoomUsers(io, roomName),
        });
    });
}

function registerRoomHandlers(io, socket) {
    joinRoom(io, socket);
    leaveRoom(io, socket);
    getRoomUsersHandler(io, socket);
}

module.exports = registerRoomHandlers;
