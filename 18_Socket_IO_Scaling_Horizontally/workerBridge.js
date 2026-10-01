function setupWorkerBridge(io) {
    process.on("message", (message) => {
        console.log(`Worker ${process.pid} received bridge message:`, message);
        if (message.type === "chat message") {
            io.emit("chat message", message);
        }
    });
}

module.exports = setupWorkerBridge;
