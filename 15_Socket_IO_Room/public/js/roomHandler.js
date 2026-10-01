import {
    joinButton,
    usernameInput,
    roomInput,
    addMessage,
    leaveButton,
    currentRoomElement,
    updateRoomControls,
    memberCountElement,
    availableRooms,
} from "./ui.js";
import { currentRoom, setCurrentRoom, setSelectedSocketId } from "./state.js";
import socket from "./socket.js";
// ─────────────────────────────────────────────
// Room Actions
// ─────────────────────────────────────────────
joinButton.addEventListener("click", () => {
    const username = usernameInput.value.trim();
    const roomName = roomInput.value.trim();

    if (!username || !roomName) {
        addMessage("Username and room are required");
        return;
    }

    socket.emit("set-username", username, (response) => {
        if (!response.success) {
            addMessage(`Error: ${response.message}`);
            return;
        }
        socket.emit("join-room", roomName, (roomResponse) => {
            if (!roomResponse.success) {
                addMessage(`Error: ${roomResponse.message}`);
                return;
            }
            addMessage(roomResponse.message);
        });
    });
});

leaveButton.addEventListener("click", () => {
    if (!currentRoom) {
        return;
    }
    socket.emit("leave-room", currentRoom, (response) => {
        if (!response.success) {
            addMessage(`Error: ${response.message}`);
            return;
        }
        addMessage(response.message);
    });
});

// ─────────────────────────────────────────────
// Room Events
// ─────────────────────────────────────────────
function roomJoined(socket) {
    socket.on("room-joined", (roomName) => {
        console.log(roomName);
        setCurrentRoom(roomName);
        // Clear old room's users
        roomUsers.innerHTML = "";
        // Clear private-message selection
        setSelectedSocketId(null);
        selectedUser.textContent = "None";
        sendPrivateMessageBtn.disabled = true;
        currentRoomElement.textContent = roomName;
        updateRoomControls();
        addMessage(`You joined: ${roomName}`);
    });
}

function roomLeft(socket) {
    socket.on("room-left", (roomName) => {
        addMessage(`You left: ${roomName}`);
        setCurrentRoom(null);
        roomUsers.innerHTML = "";
        setSelectedSocketId(null);
        selectedUser.textContent = "None";
        sendPrivateMessageBtn.disabled = true;
        currentRoomElement.textContent = "None";
        memberCountElement.textContent = "0";
        updateRoomControls();
    });
}

// ─────────────────────────────────────────────
// Room Member Count
// ─────────────────────────────────────────────
function roomMemberCount(socket) {
    socket.on("room-member-count", ({ roomName, memberCount }) => {
        if (roomName !== currentRoom) {
            return;
        }
        memberCountElement.textContent = memberCount;
    });
}

function getAllRooms(socket) {
    socket.on("all-rooms", (rooms) => {
        availableRooms.innerHTML = "";
        rooms.forEach(({ roomName, memberCount }) => {
            const li = document.createElement("li");
            const roomText = document.createElement("span");
            roomText.textContent = `${roomName} — ${memberCount} member(s) `;
            const joinButton = document.createElement("button");
            joinButton.textContent = "Join";
            joinButton.type = "button";
            joinButton.addEventListener("click", () => {
                const username = usernameInput.value.trim();
                if (!username) {
                    addMessage("Set your username before joining a room");
                    return;
                }
                socket.emit("set-username", username, (response) => {
                    if (!response.success) {
                        addMessage(`Error: ${response.message}`);
                        return;
                    }
                    socket.emit("join-room", roomName, (roomResponse) => {
                        if (!roomResponse.success) {
                            addMessage(`Error: ${roomResponse.message}`);
                            return;
                        }
                        addMessage(roomResponse.message);
                    });
                });
            });

            li.appendChild(roomText);
            li.appendChild(joinButton);
            availableRooms.appendChild(li);
        });
    });
}

function getHistory(socket) {
    socket.on("room-history", (messages) => {
        messages.forEach((data) => {
            const time = new Date(data.timestamp).toLocaleTimeString();
            addMessage(`[${time}] ${data.username}: ${data.message}`);
        });
    });
}

export function registerRoomHandlers(socket) {
    roomJoined(socket);
    roomLeft(socket);
    roomMemberCount(socket);
    getAllRooms(socket);
    getHistory(socket);
}
