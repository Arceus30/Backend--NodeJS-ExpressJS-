import { currentRoom } from "./state.js";

const sendButton = document.querySelector("#send");
const messagesList = document.querySelector("#messages");
const sendExceptToRoomButton = document.querySelector("#sendExceptToRoomBtn");

const joinButton = document.querySelector("#join");
const usernameInput = document.querySelector("#username");
const roomInput = document.querySelector("#room");
const leaveButton = document.querySelector("#leave");
const currentRoomElement = document.querySelector("#currentRoom");

const memberCountElement = document.querySelector("#memberCount");
const availableRooms = document.querySelector("#availableRooms");

const messageInput = document.querySelector("#message");

const selectedUser = document.querySelector("#selectedUser");
const privateMessage = document.querySelector("#privateMessage");
const sendPrivateMessageBtn = document.querySelector("#sendPrivateMessageBtn");

const roomUsers = document.querySelector("#roomUsers");

const typingIndicator = document.querySelector("#typingIndicator");

// ─────────────────────────────────────────────
// UI Helpers
// ─────────────────────────────────────────────

function addMessage(message) {
    const listItem = document.createElement("li");
    listItem.textContent = message;
    messagesList.appendChild(listItem);
}

function updateRoomControls() {
    const hasRoom = Boolean(currentRoom);
    sendButton.disabled = !hasRoom;
    sendExceptToRoomButton.disabled = !hasRoom;
}

function getMessageData() {
    const message = messageInput.value.trim();
    if (!currentRoom || !message) {
        return null;
    }
    return {
        roomName: currentRoom,
        message,
    };
}

export {
    addMessage,
    updateRoomControls,
    joinButton,
    usernameInput,
    roomInput,
    leaveButton,
    currentRoomElement,
    memberCountElement,
    availableRooms,
    getMessageData,
    messageInput,
    sendButton,
    sendExceptToRoomButton,
    sendPrivateMessageBtn,
    selectedUser,
    privateMessage,
    roomUsers,
    typingIndicator,
};
