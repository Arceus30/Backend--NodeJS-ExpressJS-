// const processedMessages = new Set(); // So the message is processed only once, even though it may be delivered multiple times.
// function registerMessageHandlers(io, socket) {
//     socket.on("message", (message, acknowledgement) => {
//         console.log("Received:", message);

//         // Check whether we have already processed this message.
//         if (processedMessages.has(message.id)) {
//             console.log("Duplicate message ignored:", message.id);
//             acknowledgement();
//             return;
//         }

//         // Remember this message ID
//         processedMessages.add(message.id);
//         // Process the message
//         console.log("Processing:", message.text);
//         // Tell the client that the message was successfully received and processed.
//         // Comment out so that server won't acknowledges. This lets us observe the retry behavior.
//         acknowledgement();
//     });
// }

// module.exports = registerMessageHandlers;

const fs = require("fs");
const path = require("path");
// ----------------------------------------
// File storage
// ----------------------------------------
const messagesFile = path.join(__dirname, "../../store/messageStore.json");

function readProcessedMessages() {
    const data = fs.readFileSync(messagesFile, "utf-8");
    return JSON.parse(data);
}

function saveProcessedMessages(messages) {
    fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2));
}

function registerMessageHandlers(io, socket) {
    socket.on("message", (message, acknowledgement) => {
        console.log("\nReceived:", message);
        const processedMessages = readProcessedMessages();

        // ----------------------------------------
        // Duplicate detection
        // ----------------------------------------
        if (processedMessages.includes(message.id)) {
            console.log("Duplicate message detected:", message.id);
            console.log("Sending ACK for retry:", message.id);
            acknowledgement();
            return;
        }

        // ----------------------------------------
        // First delivery
        // ----------------------------------------
        console.log("Processing:", message.text);

        // Persist the message ID BEFORE ACK.
        processedMessages.push(message.id);
        saveProcessedMessages(processedMessages);
        console.log("Message ID saved:", message.id);

        // ----------------------------------------
        // Simulate lost ACK
        // ----------------------------------------
        if (message.simulateLostAck) {
            console.log("⚠️ SIMULATING LOST ACK:", message.id);
            return;
        }

        // ----------------------------------------
        // Normal ACK
        // ----------------------------------------
        console.log("Sending ACK:", message.id);
        // This shouldn't normally execute because the retry will hit the duplicate check above.
        acknowledgement();
    });
}
module.exports = registerMessageHandlers;
