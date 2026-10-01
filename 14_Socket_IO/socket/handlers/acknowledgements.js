const USE_PROMISE_ACK = false;
// A.) Client emits a request -> Server acknowledges
// Client: socket.emit("receiveAck", data, acknowledgement)
// When USE_PROMISE_ACK is true, the server waits for the acknowledgement using socket.timeout(...).emit(...), where appropriate.
function registerReceiveAckHandler(socket) {
    socket.on("receiveAck", (data, acknowledgement) => {
        console.log("Server received receiveAck request:", data);
        const response = {
            success: true,
            message: "Server received your request.",
            receivedData: data,
        };
        // Client -> Server acknowledgement is inherently received through the acknowledgement callback supplied by Socket.IO.
        if (typeof acknowledgement === "function") {
            acknowledgement(response);
        }
    });
}

// B.) Client emits a request -> Server emits an acknowledgement request -> Client acknowledges
// Client: socket.emit("sendAck", data);
// The server sends an "ackRequest" event to the client and waits for the client's acknowledgement.
async function handleSendAck(socket, data) {
    console.log("Server received sendAck request:", data);
    const acknowledgementPayload = {
        message: "Server is asking the client to acknowledge this request.",
        serverData: data,
    };

    try {
        let clientResponse;
        if (USE_PROMISE_ACK) {
            // Promise-based acknowledgement.
            clientResponse = await socket
                .timeout(5000)
                .emitWithAck("ackRequest", acknowledgementPayload);
        } else {
            // Callback-based acknowledgement.
            clientResponse = await new Promise((resolve, reject) => {
                socket
                    .timeout(5000)
                    .emit(
                        "ackRequest",
                        acknowledgementPayload,
                        (error, response) => {
                            if (error) {
                                reject(error);
                                return;
                            }
                            resolve(response);
                        },
                    );
            });
        }
        console.log(
            "Server received acknowledgement from client:",
            clientResponse,
        );
    } catch (error) {
        console.error(
            "Server did not receive client acknowledgement:",
            error.message,
        );
    }
}

function registerSendAckHandler(socket) {
    socket.on("sendAck", async (data) => {
        await handleSendAck(socket, data);
    });
}

function registerAcknowledgementHandlers(socket) {
    registerReceiveAckHandler(socket);
    registerSendAckHandler(socket);
}

module.exports = registerAcknowledgementHandlers;
