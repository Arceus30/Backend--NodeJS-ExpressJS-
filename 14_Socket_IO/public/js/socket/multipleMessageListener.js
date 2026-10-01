import { addMessage } from "./ui.js";

function allMultipleMessageListener(socket) {
    // Receive a Multiple message
    socket.on("all chat messages", (...messages) => {
        messages.forEach((msg, i) => {
            if (i < messages.length - 1) addMessage(msg);
        });
    });
}

function otherMultipleMessageListener(socket) {
    // Receive a Multiple message
    socket.on("other chat messages", (...messages) => {
        messages.forEach((msg, i) => {
            if (i < messages.length - 1) addMessage(msg);
        });
    });
}

function myselfMultipleMessageListener(socket) {
    // Receive a Multiple message
    socket.on("myself chat messages", (...messages) => {
        messages.forEach((msg, i) => {
            if (i < messages.length - 1) addMessage(msg);
        });
    });
}

export function registerMultipleMessageHandler(socket) {
    allMultipleMessageListener(socket);
    otherMultipleMessageListener(socket);
    myselfMultipleMessageListener(socket);
}
