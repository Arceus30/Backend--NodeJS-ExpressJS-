import {
    sendButton,
    getMessageData,
    addMessage,
    messageInput,
    sendExceptToRoomButton,
    sendPrivateMessageBtn,
    privateMessage,
    typingIndicator,
} from "./ui.js";
import { currentRoom, selectedSocketId } from "./state.js";
import socket from "./socket.js";

// ─────────────────────────────────────────────
// Message Actions
// ─────────────────────────────────────────────
sendButton.addEventListener("click", () => {
    const messageData = getMessageData();
    if (!messageData) {
        return;
    }
    socket.emit("send-message", messageData, (response) => {
        if (!response.success) {
            addMessage(`Error: ${response.message}`);
        }
    });
    messageInput.value = "";
});

sendExceptToRoomButton.addEventListener("click", () => {
    const messageData = getMessageData();
    if (!messageData) {
        return;
    }
    socket.emit("send-except-to-room", messageData, (response) => {
        if (!response.success) {
            addMessage(`Error: ${response.message}`);
        }
    });
    messageInput.value = "";
});

sendPrivateMessageBtn.addEventListener("click", () => {
    const message = privateMessage.value.trim();
    if (!selectedSocketId) {
        addMessage("Select a user first");
        return;
    }
    if (!message) {
        return;
    }
    socket.emit(
        "send-private-message",
        {
            targetSocketId: selectedSocketId,
            message,
        },
        (response) => {
            if (!response.success) {
                addMessage(`Error: ${response.message}`);
                return;
            }
            const time = new Date().toLocaleTimeString();
            addMessage(
                `[${time}] [Private → ${selectedUser.textContent}] ${message}`,
            );
            privateMessage.value = "";
        },
    );
});

// ─────────────────────────────────────────────
// Incoming Messages
// ─────────────────────────────────────────────
function incomingMessage(socket) {
    socket.on("new-message", ({ roomName, username, message, timestamp }) => {
        const time = new Date(timestamp).toLocaleString();
        addMessage(`[${time}] [${roomName}] ${username}: ${message}`);
    });
}

// ─────────────────────────────────────────────
// Private Messages
// ─────────────────────────────────────────────
function incomingPrivateMessages(socket) {
    socket.on("private-message", (data) => {
        const time = new Date(data.timestamp).toLocaleString();
        addMessage(`[${time}] [Private] ${data.from}: ${data.message}`);
    });
}

let typingTimeout;
messageInput.addEventListener("input", () => {
    if (!currentRoom) {
        return;
    }
    socket.emit("typing", {
        roomName: currentRoom,
    });
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        socket.emit("stop-typing", {
            roomName: currentRoom,
        });
    }, 1000);
});

function returnTypingIndicator(socket) {
    socket.on("user-typing", ({ username }) => {
        typingIndicator.textContent = `${username} is typing...`;
    });

    socket.on("user-stop-typing", () => {
        typingIndicator.textContent = "";
    });
}

export function registerMessageHandler(socket) {
    incomingMessage(socket);
    incomingPrivateMessages(socket);
    returnTypingIndicator(socket);
}
