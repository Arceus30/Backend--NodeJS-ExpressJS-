import {
    connectBtn,
    disconnectBtn,
    setChatEnabled,
    showConnectedState,
    showDisconnectedState,
} from "./ui.js";
import { getSocket, createSocket, destroySocket } from "./socket.js";
import { registerSingleMessageHandler } from "./singleMessageHandler.js";
import { registerMultipleMessageHandler } from "./multipleMessageListener.js";
import { registerCatchAllHandler } from "./catchAll.js";
import "./csrHandler.js";
import { registerAckRequestHandler } from "./acknowledgements.js";
import { registerDataFormListener } from "./dataFormListener.js";
import "./dataFormHandler.js";

function connect() {
    // Without this check, repeatedly clicking Connect could create multiple socket connections.
    if (getSocket()) {
        return;
    }
    const socket = createSocket();
    registerSocketListeners(socket);
    registerCatchAllHandler(socket);
    registerSingleMessageHandler(socket);
    registerMultipleMessageHandler(socket);
    registerAckRequestHandler(socket);
    registerDataFormListener(socket);
}

function registerSocketListeners(socket) {
    // Fired when the Socket.IO connection is successfully established.
    socket.on("connect", () => {
        console.log("Connected");
        console.log("Socket ID:", socket.id);

        // `socket.recovered` tells us whether this connection was recovered after a temporary disconnection.
        // This corresponds to the connection state recovery configuration on the server.
        console.log("Recovered:", socket.recovered);

        if (socket.recovered) {
            console.log("Connection State Recovery successful!");
        } else {
            console.log("This is NOT a recovered connection.");
        }

        setChatEnabled(true);
        showConnectedState();
    });

    // Fired whenever the socket becomes disconnected.
    socket.on("disconnect", (reason) => {
        console.log("Disconnected from server");
        console.log("Reason:", reason);

        setChatEnabled(false);
        showDisconnectedState();

        // IMPORTANT:
        // We deliberately do NOT destroy the socket here. (do not socket = null)
        // Why?
        // Socket.IO can automatically attempt to reconnect using this same socket instance.
        // Keeping the socket object alive also allows Connection State Recovery to potentially work.
        // If we did: destroySocket(); immediately here, we'd lose our reference to this socket.
    });

    // Fired when Socket.IO cannot establish the connection.
    // This is different from `disconnect`. `connect_error` happens when connection establishment itself fails.
    socket.on("connect_error", (error) => {
        console.log("Connection error:", error.message);

        setChatEnabled(false);
        showDisconnectedState();
    });
}

function disconnect() {
    const socket = getSocket();

    // If there isn't a socket, there is nothing to disconnect.
    if (!socket) {
        return;
    }
    // Manually disconnect this socket.
    // IMPORTANT:
    // This is different from an accidental/network disconnect.
    // A manually disconnected socket will not automatically reconnect just because the network becomes available.
    socket.disconnect();

    destroySocket(); // We intentionally destroy our reference so that pressing Connect creates a fresh socket.

    setChatEnabled(false);
    showDisconnectedState();
}

connectBtn.addEventListener("click", connect);
disconnectBtn.addEventListener("click", disconnect);
