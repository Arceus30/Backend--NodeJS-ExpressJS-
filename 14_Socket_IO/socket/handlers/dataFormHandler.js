function registerDataFormHandler(io, socket) {
    socket.on("form-data", (data) => {
        console.log("Data:", data);
        io.emit("form-data", data);
    });
}

module.exports = registerDataFormHandler;
