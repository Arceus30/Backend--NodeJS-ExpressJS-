const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../data/messages.json");

function getMessages() {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
}

function saveMessages(messages) {
    fs.writeFileSync(filePath, JSON.stringify(messages, null, 2));
}

function addMessage(message) {
    const messages = getMessages();
    messages.push(message);
    // Keep only the latest 100 messages
    if (messages.length > 100) {
        messages.shift();
    }
    saveMessages(messages);
}

function getRoomMessages(roomName) {
    const messages = getMessages();
    return messages.filter((message) => message.roomName === roomName);
}

module.exports = {
    addMessage,
    getRoomMessages,
};
