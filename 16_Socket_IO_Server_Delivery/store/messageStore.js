let messages = [];
let nextId = 1;

// Add a new message
function addMessage(content) {
    const message = {
        id: nextId++,
        content,
    };
    messages.push(message);
    return message;
}

// Get all messages
function getAllMessages() {
    return messages;
}

function getMessagesAfter(id) {
    return messages.filter((message) => {
        return message.id > id;
    });
}

module.exports = {
    addMessage,
    getAllMessages,
    getMessagesAfter,
};
