import {
    input,
    sendAllBtn,
    sendOthersBtn,
    sendSenderBtn,
    addMessage,
} from "./ui.js";
import { getSocket } from "./socket.js";

function allSingleMessageListener(socket) {
    // Receive a single message
    socket.on("all chat message", (message) => {
        addMessage(message);
    });
}

function otherSingleMessageListener(socket) {
    // Receive a single message
    socket.on("other chat message", (message) => {
        addMessage(message);
    });
}

function myselfSingleMessageListener(socket) {
    // Receive a single message
    socket.on("myself chat message", (message) => {
        addMessage(message);
    });
}

export function registerSingleMessageHandler(socket) {
    allSingleMessageListener(socket);
    otherSingleMessageListener(socket);
    myselfSingleMessageListener(socket);
}

sendAllBtn.addEventListener("click", () => {
    const socket = getSocket();
    const message = input.value.trim();
    if (socket?.connected) {
        if (message) {
            socket.emit("all chat message", message);
            input.value = "";
            input.focus();
        } else {
            socket.emit("all chat messages", 1, "2", {
                3: "4",
                5: Uint8Array.from([6]),
            });
        }
    }
});

sendOthersBtn.addEventListener("click", () => {
    const socket = getSocket();
    const message = input.value.trim();
    if (socket?.connected) {
        if (message) {
            socket.emit("other chat message", message);
            input.value = "";
            input.focus();
        } else {
            socket.emit("other chat messages", 1, "2", {
                3: "4",
                5: Uint8Array.from([6]),
            });
        }
    }
});
sendSenderBtn.addEventListener("click", () => {
    const socket = getSocket();
    const message = input.value.trim();
    if (socket?.connected) {
        if (message) {
            socket.emit("myself chat message", message);
            input.value = "";
            input.focus();
        } else {
            socket.emit("myself chat messages", 1, "2", {
                3: "4",
                5: Uint8Array.from([6]),
            });
        }
    }
});
