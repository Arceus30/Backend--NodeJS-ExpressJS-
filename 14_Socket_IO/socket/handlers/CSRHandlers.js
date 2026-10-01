const registerCSRHandlers = (socket) => {
    socket.on("csr-test-start", () => {
        // Test event recovery.  The server keeps emitting messages even while a client is disconnected.
        // socket.data is basically a place on the Socket.IO server-side Socket object where you can store custom data belonging to that particular socket connection.
        // User information
        // Connection-specific state
        // Timers / resources;
        // Anything that belongs specifically to this socket and that your application needs to remember.
        // The information is not permanent, socket.data is not a db
        // socket.data is stored on the server. So, if a server process crashes, server restarts, if a completely new socket is created, socket.data disappears
        socket.data.csrIntervalId = setInterval(() => {
            const message = `Server event: ${new Date().toLocaleTimeString()}`;
            console.log("Generating: ", message);
            socket.emit("myself chat message", message);
        }, 10000);
        console.log("Interval Created: ", socket.data.csrIntervalId);
    });

    socket.on("csr-test-stop", () => {
        console.log("Interval Destroyed: ", socket.data.csrIntervalId);
        clearInterval(socket.data.csrIntervalId);
        socket.data.csrIntervalId = null;
    });
};
module.exports = registerCSRHandlers;
