require("dotenv").config();
const redisClient = require("../redis/config");

const startServer = async () => {
    await redisClient.connect();
    console.log("Server A connected to Redis");

    setInterval(async () => {
        const delivered = await redisClient.publish(
            "notifications",
            JSON.stringify({
                type: "NEW_POST",
                postId: 101,
            }),
        );
        console.log(`Message delivered to ${delivered} subscriber(s)`);
    }, 3000);

    // const subscriber = redisClient.duplicate();
    // subscriber.on("error", (error) => {
    //     console.error("Subscriber Error:", error);
    // });
    // await subscriber.connect();

    // await subscriber.subscribe("notifications", (message) => {
    //     console.log("Server A received:", message);
    // });
    // console.log("Server A subscribed to notifications");
};

startServer();
