import "dotenv/config";
import { Worker } from "bullmq";
import redisConnection from "../config/redis.js";
import { sendMail } from "../services/mailService.js";

const emailWorker = new Worker(
    // Watch the email queue and process its jobs.
    "email",
    async (job) => {
        console.log("Processing email job:", job.id);
        const info = await sendMail(job.data);
        console.log("Email sent:", info.messageId);
        return {
            messageId: info.messageId,
        };
    },
    {
        connection: redisConnection,
        concurrency: 5,
    },
);

emailWorker.on("completed", (job) => {
    console.log(`Email job ${job.id} completed`);
});

emailWorker.on("failed", (job, error) => {
    console.error(`Email job ${job?.id} failed:`, error.message);
});

emailWorker.on("error", (error) => {
    console.error("Worker error:", error.message);
});

console.log("Email worker started...");
