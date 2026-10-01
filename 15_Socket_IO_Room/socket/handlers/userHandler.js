const { isValidUsername } = require("../validation");

function setUsername(socket) {
    socket.on("set-username", (username, callback) => {
        if (!isValidUsername(username)) {
            callback({
                success: false,
                message: "Invalid username",
            });
            return;
        }
        socket.data.username = username.trim();
        callback({
            success: true,
            message: `Username set to ${socket.data.username}`,
        });
    });
}

function userHandler(socket) {
    setUsername(socket);
}

module.exports = userHandler;
