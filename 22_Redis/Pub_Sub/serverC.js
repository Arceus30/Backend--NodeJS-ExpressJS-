const redisClient = require("../redis/config");

const startServer = async () => {
    await redisClient.connect();
    const subscriber = redisClient.duplicate();
    subscriber.on("error", (error) => {
        console.error("Subscribe Error", error);
    });
    await subscriber.connect();
    await subscriber.subscribe("notifications", (message) => {
        console.log("Server C received:", message);
    });
    console.log("Server C subscribed");
};

startServer();
