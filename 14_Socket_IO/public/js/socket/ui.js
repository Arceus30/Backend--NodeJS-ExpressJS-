const connectBtn = document.getElementById("connectBtn");
const disconnectBtn = document.getElementById("disconnectBtn");

const input = document.getElementById("input");

const sendAllBtn = document.getElementById("sendAllBtn");
const sendOthersBtn = document.getElementById("sendOthersBtn");
const sendSenderBtn = document.getElementById("sendSenderBtn");

const receiveAckBtn = document.getElementById("receiveAckBtn");
const sendAckBtn = document.getElementById("sendAckBtn");

const csrTestStartBtn = document.getElementById("csrTestStartBtn");
const csrTestStopBtn = document.getElementById("csrTestStopBtn");

const messages = document.getElementById("messages");

const sendDataBtn = document.getElementById("sendDataBtn");

function setChatEnabled(enabled) {
    input.disabled = !enabled;

    sendAllBtn.disabled = !enabled;
    sendOthersBtn.disabled = !enabled;
    sendSenderBtn.disabled = !enabled;

    csrTestStartBtn.disabled = !enabled;
    csrTestStopBtn.disabled = !enabled;

    receiveAckBtn.disabled = !enabled;
    sendAckBtn.disabled = !enabled;

    sendDataBtn.disabled = !enabled;

    // Keep messages visible but indicate connection state
    messages.classList.toggle("disconnected", !enabled);
}

function showConnectedState() {
    connectBtn.hidden = true;
    disconnectBtn.hidden = false;

    input.focus();
}

function showDisconnectedState() {
    disconnectBtn.hidden = true;
    connectBtn.hidden = false;
}

function addMessage(message) {
    const item = document.createElement("li");
    item.textContent = message;

    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight); // Scroll to the latest message
}

export {
    messages,
    connectBtn,
    disconnectBtn,
    input,
    sendAllBtn,
    sendOthersBtn,
    sendSenderBtn,
    csrTestStartBtn,
    csrTestStopBtn,
    sendAckBtn,
    receiveAckBtn,
    addMessage,
    setChatEnabled,
    showConnectedState,
    showDisconnectedState,
};
