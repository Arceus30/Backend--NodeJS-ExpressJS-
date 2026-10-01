import {
    statusElem,
    messageInput,
    sendButton,
    addLog,
    retryTestButton,
} from "./ui.js";
let lastMessage = null;

const socket = io({
    ackTimeout: 5000, // Wait up to 5 seconds for an acknowledgement.

    // The server can receive the same event more than once.
    retries: 3, // If an acknowledgement isn't received, try sending the event again, up to 3 retries.
});
// -------------------------
// Connection
// -------------------------
socket.on("connect", () => {
    console.log("Connected to Socket.IO");
    console.log("Socket ID:", socket.id);
    statusElem.textContent = "Connected";
    addLog(`✓ Connected: ${socket.id}`);
});

socket.on("disconnect", (reason) => {
    statusElem.textContent = "Disconnected";
    addLog(`✗ Disconnected: ${reason}`);
});

// -------------------------
// Send message
// -------------------------
sendButton.addEventListener("click", () => {
    const message = messageInput.value;
    if (!message) {
        return;
    }
    const messageId = crypto.randomUUID();

    lastMessage = {
        id: messageId,
        text: message,
        simulateLostAck: false,
    };

    addLog(`→ Sending: ${messageId}`);
    socket.emit(
        "message",
        {
            id: messageId,
            text: message,
            simulateLostAck: simulateLostAck.checked,
        },
        () => {
            addLog(`← ACK: ${messageId}`);
            addLog(`✓ Delivered: ${messageId}`);
        },
    );
    console.log("Message sent:", messageId);
    messageInput.value = "";
});

retryTestButton.addEventListener("click", () => {
    if (!lastMessage) {
        addLog("⚠️ No message has been sent yet");
        return;
    }
    console.log("Sending same message again:", lastMessage);
    addLog(`→ Manually resending: ${lastMessage.id}`);
    socket.emit("message", lastMessage, () => {
        addLog(`← ACK for existing ID: ${lastMessage.id}`);
    });
});
