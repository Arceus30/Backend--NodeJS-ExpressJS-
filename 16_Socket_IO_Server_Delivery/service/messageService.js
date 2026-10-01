const messageStore = require("../store/messageStore");

// Create a message
function createMessage(content) {
    return messageStore.addMessage(content);
}

// Get the complete current state
function getAllMessages() {
    return messageStore.getAllMessages();
}

function getMessagesAfter(id) {
    return messageStore.getMessagesAfter(id);
}

module.exports = {
    createMessage,
    getAllMessages,
    getMessagesAfter,
};
