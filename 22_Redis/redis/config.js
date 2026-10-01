const { createClient } = require("redis");

// createClient() creates the Node.js Redis client. It doesn't necessarily mean that the connection has been established yet.
// createClient()  -->  Redis client object created
// const redisClient = createClient({
//     url: process.env.REDIS_URL,
// });
// Since redis 5.x is installed, which cannot use the default RESP3
const redisClient = createClient({
    url: "redis://localhost:6379",
    RESP: 2,

    // reconnection strategy:
    // socket: {
    //     // Reconnect automatically when the connection drops.
    //     reconnectStrategy: (retries) => {
    //         console.log(`Redis reconnect attempt #${retries}`);
    //         // Exponential backoff, capped at 3 seconds.
    //         const delay = Math.min(100 * 2 ** retries, 3000);
    //         return delay;
    //     },
    // },
});

// The TCP connection to Redis has been established.
redisClient.on("connect", () => {
    console.log("Redis connecting...");
});

// The Redis client is ready to accept commands.
redisClient.on("ready", () => {
    console.log("Redis ready");
});

redisClient.on("reconnecting", () => {
    console.log("Redis reconnecting...");
});

redisClient.on("end", () => {
    console.log("Redis connection closed");
});

// handles Redis client errors
redisClient.on("error", (error) => {
    console.error("Redis Client Error:", error);
});
module.exports = redisClient;
