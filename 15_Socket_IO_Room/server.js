const server = require("./app");
const createSocketServer = require("./socket");

const startServer = () => {
    createSocketServer(server);
    server.listen(3000, () => {
        console.log("server running at http://localhost:3000");
    });
};
startServer();
