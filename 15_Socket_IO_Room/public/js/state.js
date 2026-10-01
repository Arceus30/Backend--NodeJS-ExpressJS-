let currentRoom = null;
let selectedSocketId = null;

function setCurrentRoom(roomName) {
    currentRoom = roomName;
}

function setSelectedSocketId(socketId) {
    selectedSocketId = socketId;
}

export { currentRoom, setCurrentRoom, selectedSocketId, setSelectedSocketId };
