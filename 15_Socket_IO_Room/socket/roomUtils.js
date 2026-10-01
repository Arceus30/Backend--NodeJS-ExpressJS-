function getRoomMemberCount(io, roomName) {
    // io = the whole Socket.IO server
    // io.sockets = the default namespace
    // io.sockets.adapter = the mechanism/data structure Socket.IO uses to manage socket-room relationships
    // io.sockets.adapter.rooms = rooms is a Map of room names → sockets in that room.
    // io.sockets.adapter.rooms  -->  ALL rooms currently maintained by Socket.IO
    const room = io.sockets.adapter.rooms.get(roomName);
    return room ? room.size : 0;
}

function getApplicationRooms(io) {
    const rooms = [];
    for (const [roomName, sockets] of io.sockets.adapter.rooms) {
        // Ignore private socket rooms
        if (sockets.has(roomName)) {
            continue;
        }
        rooms.push({
            roomName,
            memberCount: sockets.size,
        });
    }
    return rooms;
}

function broadcastRoomList(io) {
    const rooms = getApplicationRooms(io);
    io.emit("all-rooms", rooms);
}

function getRoomUsers(io, roomName) {
    const room = io.sockets.adapter.rooms.get(roomName);
    if (!room) {
        return [];
    }
    const users = [];
    for (const socketId of room) {
        const userSocket = io.sockets.sockets.get(socketId);
        if (!userSocket) {
            continue;
        }
        users.push({
            socketId,
            username: userSocket.data.username || "Unknown",
        });
    }
    return users;
}

function broadcastRoomUsers(io, roomName) {
    const users = getRoomUsers(io, roomName);
    io.to(roomName).emit("room-users", users);
}

module.exports = {
    getRoomMemberCount,
    getApplicationRooms,
    broadcastRoomList,
    getRoomUsers,
    broadcastRoomUsers,
};
