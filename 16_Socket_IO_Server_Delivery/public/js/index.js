let lastReceivedId = 0;
const receivedMessageIds = new Set();
const socket = io();

const messageInput = document.querySelector("#messageInput");
const sendButton = document.querySelector("#sendButton");
const messagesList = document.querySelector("#messages");

const connectionStatus = document.querySelector("#connectionStatus");
const socketId = document.querySelector("#socketId");
const lastReceivedIdElement = document.querySelector("#lastReceivedId");
const messageCount = document.querySelector("#messageCount");
const deliveryLog = document.querySelector("#deliveryLog");

// Display a message on the page
function displayMessage(message) {
    // Ignore a message we've already processed
    if (receivedMessageIds.has(message.id)) {
        console.log("Duplicate ignored:", message.id);
        return;
    }
    receivedMessageIds.add(message.id);

    const li = document.createElement("li");
    li.textContent = `#${message.id} - ${message.content}`;
    messagesList.appendChild(li);

    lastReceivedId = Math.max(lastReceivedId, message.id);

    lastReceivedIdElement.textContent = lastReceivedId;
    messageCount.textContent = messagesList.children.length;
}

// Send a new message
sendButton.addEventListener("click", () => {
    const content = messageInput.value.trim();
    if (!content) {
        return;
    }
    socket.emit("create-message", content);
    messageInput.value = "";
});

// Receive a newly created message
socket.on("new-message", (message) => {
    displayMessage(message);
});

// Receive complete server state
socket.on("full-state", (data) => {
    console.log("FULL STATE:", data);
    messagesList.innerHTML = "";
    data.messages.forEach(displayMessage);
    deliveryLog.textContent = `FULL STATE DELIVERY → Received ${data.messages.length} messages`;
});

socket.on("missing-events", (data) => {
    console.log("MISSING EVENTS:", data);
    data.messages.forEach(displayMessage);
    deliveryLog.textContent = `MISSING EVENTS DELIVERY → Received ${data.messages.length} messages after ID ${data.afterId}`;
});

socket.on("connect", () => {
    console.log("Connected:", socket.id);
    console.log(lastReceivedId);
    if (lastReceivedId === 0) {
        // First connection
        socket.emit("request-full-state");
    } else {
        // Reconnection
        socket.emit("request-missing-events", lastReceivedId);
    }
    connectionStatus.textContent = "Connected";
    socketId.textContent = socket.id;
});

socket.on("disconnect", () => {
    console.log("Disconnected from server");
    connectionStatus.textContent = "Disconnected";
    socketId.textContent = "-";
});
