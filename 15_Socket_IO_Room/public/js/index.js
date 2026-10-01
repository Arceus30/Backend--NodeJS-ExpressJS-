import socket from "./socket.js";
import { addMessage, updateRoomControls } from "./ui.js";

import { registerMessageHandler } from "./messageHandler.js";
import { registerRoomHandlers } from "./roomHandler.js";
import { registerUserHandler } from "./userHandler.js";

// ─────────────────────────────────────────────
// Connection Events
// ─────────────────────────────────────────────
registerUserHandler(socket);
registerRoomHandlers(socket);
registerMessageHandler(socket);

socket.on("connect", () => {
    addMessage(`Connected: ${socket.id}`);
    console.log("Connected:", socket.id);
});

socket.io.on("reconnect_attempt", () => {
    addMessage("Trying to reconnect...");
});

socket.io.on("reconnect", (attempt) => {
    addMessage(`Reconnected after ${attempt} attempt(s)`);
});

socket.io.on("reconnect_error", (error) => {
    console.log("Reconnection error:", error.message);
});

socket.on("disconnect", () => {
    addMessage("Disconnected from server");
});

// ─────────────────────────────────────────────
// Initial UI State
// ─────────────────────────────────────────────
updateRoomControls();
