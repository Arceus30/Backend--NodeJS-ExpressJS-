import socket from "./socket.js";
import {
    form,
    input,
    messages,
    currentRoom,
    roomForm,
    roomInput,
    joinRoomA,
    joinRoomB,
    leaveRoomA,
    leaveRoomB,
} from "./ui.js";

// -----------------------------
// Send message
// -----------------------------
form.addEventListener("submit", (event) => {
    event.preventDefault();
    const message = input.value.trim();
    if (!message) {
        return;
    }
    socket.emit("chat message", message);
    input.value = "";
});

// -----------------------------
// Receive message
// -----------------------------
socket.on("chat message", (data) => {
    const item = document.createElement("li");
    item.textContent = `${data.message} — server PID: ${data.serverPid}`;
    messages.appendChild(item);
});

// Join Room A
joinRoomA.addEventListener("click", () => {
    socket.emit("join room", "room-a");
});

// Join Room B
joinRoomB.addEventListener("click", () => {
    socket.emit("join room", "room-b");
});

// Leave Room A
leaveRoomA.addEventListener("click", () => {
    socket.emit("leave room", "room-a");
});

// Leave Room B
leaveRoomB.addEventListener("click", () => {
    socket.emit("leave room", "room-b");
});

// Server confirms room joined
socket.on("room joined", (room) => {
    currentRoom.textContent = room;
});

// Server confirms room left
socket.on("room left", (room) => {
    if (currentRoom.textContent === room) {
        currentRoom.textContent = "None";
    }
});

// Send message to current room
roomForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const room = currentRoom.textContent;
    const message = roomInput.value.trim();
    if (room === "None" || !message) {
        return;
    }
    socket.emit("room message", {
        room,
        message,
    });
    roomInput.value = "";
});

// Receive room message
socket.on("room message", (data) => {
    const item = document.createElement("li");
    item.textContent = `[${data.room}] ${data.message} — server PID: ${data.serverPid}`;
    messages.appendChild(item);
});

socket.on("room members", (data) => {
    const item = document.createElement("li");
    item.textContent = `${data.room} members: ${data.members.length}`;
    messages.appendChild(item);
    console.log(`Members in ${data.room}:`, data.members);
});
