import {
    addMessage,
    roomUsers,
    selectedUser,
    sendPrivateMessageBtn,
    typingIndicator,
} from "./ui.js";
import { setSelectedSocketId } from "./state.js";

function userJoined(socket) {
    socket.on("user-joined", ({ username, socketId, roomName }) => {
        addMessage(`${username} ${socketId} joined ${roomName}`);
    });
}

function userLeft(socket) {
    socket.on("user-left", ({ username, socketId, roomName }) => {
        addMessage(`${username} ${socketId} left ${roomName}`);
    });
}

function userDisconnected(socket) {
    socket.on("user-disconnected", ({ username, socketId, roomName }) => {
        const displayName = username || socketId;
        addMessage(`${displayName} disconnected from ${roomName}`);
        typingIndicator.textContent = "";
    });
}

function getRoomUsers(socket) {
    socket.on("room-users", (users) => {
        roomUsers.innerHTML = "";
        users.forEach((user) => {
            const li = document.createElement("li");
            const username = document.createElement("span");
            username.textContent = `${user.username} 🟢`;
            const button = document.createElement("button");
            button.textContent = "Message";
            button.type = "button";
            button.addEventListener("click", () => {
                setSelectedSocketId(user.socketId);
                selectedUser.textContent = user.username;
                sendPrivateMessageBtn.disabled = false;
                addMessage(`Selected ${user.username} for private messaging`);
            });
            li.appendChild(username);
            li.appendChild(button);
            roomUsers.appendChild(li);
        });
    });
}

function connectionStatus(socket) {
    socket.on("connection-status", ({ recovered }) => {
        if (recovered) {
            addMessage("Connection recovered successfully");
        } else {
            addMessage("New connection established");
        }
    });
}
export function registerUserHandler(socket) {
    userJoined(socket);
    userLeft(socket);
    userDisconnected(socket);
    getRoomUsers(socket);
    connectionStatus(socket);
}
