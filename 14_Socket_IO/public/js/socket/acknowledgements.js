import { receiveAckBtn, sendAckBtn } from "./ui.js";
import { getSocket } from "./socket.js";

const USE_PROMISE_ACK = false;

// Server -> Client acknowledgement request.
export function registerAckRequestHandler(socket) {
    socket.on("ackRequest", (data, acknowledgement) => {
        console.log("Client received ackRequest:", data);
        const response = {
            success: true,
            message: "Client acknowledged the server request.",
            timestamp: Date.now(),
        };
        acknowledgement(response);
        console.log("Client sent acknowledgement:", response);
    });
}

// A.) Client -> Server
//  Server -> Client acknowledgement
async function receiveAcknowledgement() {
    const socket = getSocket();
    const data = {
        message: "Hello Server!",
        timestamp: Date.now(),
    };

    try {
        let response;
        if (USE_PROMISE_ACK) {
            // Promise-based Socket.IO acknowledgement.
            response = await socket
                .timeout(5000)
                .emitWithAck("receiveAck", data);
        } else {
            // Callback-based Socket.IO acknowledgement.
            response = await new Promise((resolve, reject) => {
                socket
                    .timeout(5000)
                    .emit("receiveAck", data, (error, acknowledgement) => {
                        if (error) {
                            reject(error);
                            return;
                        }

                        resolve(acknowledgement);
                    });
            });
        }
        console.log("Server acknowledgement:", response);
    } catch (error) {
        console.error("Server acknowledgement failed:", error.message);
    }
}

// B.) Client -> Server
// Server -> Client ackRequest
// Client -> Server acknowledgement
function sendAcknowledgementRequest() {
    const socket = getSocket();
    const data = {
        message: "Server, please ask me to acknowledge.",
        timestamp: Date.now(),
    };
    socket.emit("sendAck", data);
    console.log("Client sent sendAck:", data);
}

receiveAckBtn.addEventListener("click", receiveAcknowledgement);
sendAckBtn.addEventListener("click", sendAcknowledgementRequest);
