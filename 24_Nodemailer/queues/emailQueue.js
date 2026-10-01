import { Queue } from "bullmq";
import redisConnection from "../config/redis.js";

// "email": name which identifies our queue.
const emailQueue = new Queue("email", {
    connection: redisConnection,
});

export default emailQueue;
