const redisClient = require("../redis/config.js");

const streamKey = "orders";
const groupName = "order-workers";
const consumerName = `worker-${process.pid}`;

let shuttingDown = false;
let processing = false;
let redisClosed = false;

async function processMessage(entry) {
    processing = true;
    try {
        console.log(`${consumerName} received:`, entry.id, entry.message);

        // Simulate processing
        await new Promise((resolve) => {
            setTimeout(resolve, 5000);
        });

        console.log(`Finished processing ${entry.id}`);
        await redisClient.xAck(streamKey, groupName, entry.id);
        console.log(`${consumerName} acknowledged:`, entry.id);
    } catch (err) {
        console.error(`Failed processing ${entry.id}:`, error);

        // IMPORTANT:
        // Don't XACK on failure.
        // The message remains pending and can later be recovered with XAUTOCLAIM.
    } finally {
        processing = false;
        if (shuttingDown) {
            await closeRedis();
        }
    }
}

async function closeRedis() {
    if (redisClosed) {
        return;
    }
    redisClosed = true;
    console.log("Closing Redis connection...");
    await redisClient.close();
    console.log("Redis connection closed");
}

async function shutdown(signal) {
    if (shuttingDown) {
        return;
    }
    shuttingDown = true;
    console.log(`\nReceived ${signal}`);
    console.log("Shutdown requested...");
    if (processing) {
        console.log("Waiting for current message to finish...");
        return;
    } else {
        await closeRedis();
    }
}

process.on("SIGINT", async () => {
    await shutdown("SIGINT");
});

process.on("SIGTERM", async () => {
    await shutdown("SIGTERM");
});

const main = async () => {
    await redisClient.connect();
    console.log(`${consumerName} connected to redis`);

    try {
        await redisClient.xGroupCreate(streamKey, groupName, "0", {
            MKSTREAM: true,
        });
    } catch (error) {
        if (!error.message.includes("BUSYGROUP")) {
            throw error;
        }
    }
    console.log(`${consumerName} started`);

    while (!shuttingDown) {
        try {
            const result = await redisClient.xReadGroup(
                groupName,
                consumerName,
                [
                    {
                        key: streamKey,
                        id: ">",
                    },
                ],
                {
                    COUNT: 1,
                    // Wake up periodically so the shutdown flag can be checked.
                    BLOCK: 1000,
                },
            );

            if (shuttingDown) {
                break;
            }

            if (!result) {
                continue;
            }

            for (const stream of result) {
                for (const entry of stream.messages) {
                    if (shuttingDown) {
                        break;
                    }
                    await processMessage(entry);
                }
            }
        } catch (err) {
            console.error("Worker loop error:", err);
            if (shuttingDown) {
                break;
            }
            await new Promise((resolve) => {
                setTimeout(resolve, 2000);
            });
        }
    }

    // The loop has stopped taking new work. If the signal arrived while no job was active, close immediately.
    if (!processing) {
        await closeRedis();
    }
};

main().catch(async (error) => {
    console.error("Worker crashed:", error);
    if (redisClient.isOpen) {
        await redisClient.close();
    }
    process.exitCode = 1;
});
