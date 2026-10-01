const { createClient } = require("redis");

// const redisClient = createClient({
//     url: process.env.REDIS_URL,
// });
// Since redis 5.x is installed, which cannot use the default RESP3
const redisClient = createClient({
    url: "redis://localhost:6379",
    RESP: 2,
});

redisClient.on("error", (error) => {
    console.error("Redis error:", error);
});

module.exports = redisClient;
