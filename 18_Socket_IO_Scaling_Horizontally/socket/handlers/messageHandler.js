// custom adapter
// function registerMessageHandler(io, socket) {
//     socket.on("chat message", (message) => {
//         console.log(`Worker ${process.pid} received:`, message);
//         // Send the event to the PRIMARY process
//         process.send({
//             type: "chat message",
//             message,
//             serverPid: process.pid,
//         });
//     });
// }
// module.exports = registerMessageHandler;

function messageHandler(io, socket) {
    socket.on("chat message", (message) => {
        console.log(`Message received by PID ${process.pid}:`, message);
        // Broadcast to everyone
        io.emit("chat message", {
            message,
            serverPid: process.pid,
        });
    });
}

function registerMessageHandler(io, socket) {
    messageHandler(io, socket);
    registerRoomHandler(io, socket);
}

// Room Testing
function registerRoomHandler(io, socket) {
    // Join a room
    socket.on("join room", async (room) => {
        socket.join(room);
        console.log(
            `Socket ${socket.id} joined room: ${room} | PID: ${process.pid}`,
        );
        socket.emit("room joined", room);
        await sendRoomMembers(io, room);
    });

    // Leave a room
    socket.on("leave room", async (room) => {
        socket.leave(room);
        console.log(
            `Socket ${socket.id} left room: ${room} | PID: ${process.pid}`,
        );
        socket.emit("room left", room);
        await sendRoomMembers(io, room);
    });

    // Send message to a specific room
    socket.on("room message", ({ room, message }) => {
        console.log(
            `Worker ${process.pid} received room message for ${room}:`,
            message,
        );
        io.to(room).emit("room message", {
            room,
            message,
            serverPid: process.pid,
        });
    });
}

async function sendRoomMembers(io, room) {
    const sockets = await io.in(room).fetchSockets();
    const members = sockets.map((socket) => ({
        socketId: socket.id,
        // serverPid: socket.handshake.headers["x-worker-pid"] || "unknown",
    }));
    io.to(room).emit("room members", {
        room,
        members,
    });
}

module.exports = registerMessageHandler;
