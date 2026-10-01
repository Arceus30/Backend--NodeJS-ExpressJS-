require("dotenv").config();
const app = require("./app.js");
const redisClient = require("./db/redis/config.js");
const PORT = 3000;

const redisConnect = async () => {
    await redisClient.connect();
    console.log("Redis is connected to port 6379");
};

const startServer = async () => {
    await redisConnect();
    app.listen(PORT, () => {
        console.log("Server is listening on port: ", PORT);
    });
};

startServer();
