const redisClient = require("../redis/config.js");

const main = async () => {
    await redisClient.connect();
    const streamKey = "orders";
    const groupName = "order-workers";
    const consumerName = `worker-${process.pid}`;

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
    while (true) {
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
                BLOCK: 0,
            },
        );

        if (!result) {
            continue;
        }

        for (const stream of result) {
            for (const entry of stream.messages) {
                console.log(
                    `${consumerName} received:`,
                    entry.id,
                    entry.message,
                );

                // Simulate processing
                await new Promise((resolve) => {
                    setTimeout(resolve, 1000);
                });

                await redisClient.xAck(streamKey, groupName, entry.id);
                console.log(`${consumerName} acknowledged:`, entry.id);
            }
        }
    }
};

main();
