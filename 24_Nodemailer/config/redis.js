import IORedis from "ioredis";
import "dotenv/config";

const redisConnection = new IORedis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    maxRetriesPerRequest: null,
});

redisConnection.on("connect", () => {
    console.log("Redis connected");
});

redisConnection.on("error", (error) => {
    console.error("Redis error:", error.message);
});

export default redisConnection;
