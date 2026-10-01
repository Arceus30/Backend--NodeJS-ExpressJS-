require("dotenv").config();
const app = require("./app");
const redisClient = require("./redis/config.js");

const startServer = async () => {
    const PORT = process.env.PORT || 3000;

    // connect()  -->  Connection established
    await redisClient.connect();
    console.log("Redis connected");

    app.listen(PORT, () => {
        console.log(`Server is listening on port ${PORT}`);
    });
};

startServer();
