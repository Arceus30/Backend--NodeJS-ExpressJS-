function isValidRoomName(roomName) {
    return (
        typeof roomName === "string" &&
        roomName.trim().length > 0 &&
        roomName.trim().length <= 30
    );
}

function isValidUsername(username) {
    return (
        typeof username === "string" &&
        username.trim().length > 0 &&
        username.trim().length <= 30
    );
}

function isValidMessage(message) {
    return (
        typeof message === "string" &&
        message.trim().length > 0 &&
        message.trim().length <= 500
    );
}

module.exports = {
    isValidRoomName,
    isValidUsername,
    isValidMessage,
};
