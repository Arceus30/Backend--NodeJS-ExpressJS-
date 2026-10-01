// -------------------------
// DOM elements
// -------------------------
const statusElem = document.querySelector("#status");
const messageInput = document.querySelector("#messageInput");
const sendButton = document.querySelector("#sendButton");
const log = document.querySelector("#deliveryLog");
const simulateLostAck = document.querySelector("#simulateLostAck");
const retryTestButton = document.querySelector("#retryTestButton");

function addLog(message) {
    const item = document.createElement("li");
    item.textContent = message;
    log.appendChild(item);
}

export {
    statusElem,
    messageInput,
    sendButton,
    addLog,
    simulateLostAck,
    retryTestButton,
};
