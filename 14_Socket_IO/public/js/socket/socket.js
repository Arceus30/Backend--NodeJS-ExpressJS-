let socket = null;

export function getSocket() {
    return socket;
}

export function createSocket() {
    if (socket) {
        return socket;
    }

    // `io()` comes from the Socket.IO client library that we loaded in index.ejs: /socket.io/socket.io.js
    // Calling `io()` creates the client-side Socket.IO connection to the server.
    socket = io();
    return socket;
}

export function destroySocket() {
    socket = null;
}
