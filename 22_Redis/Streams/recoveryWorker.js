const redisClient = require("../redis/config");

async function main() {
    await redisClient.connect();

    const streamKey = "orders";
    const groupName = "order-workers";
    const consumerName = `recovery-${process.pid}`;

    console.log(`${consumerName} started`);

    // await client.xAutoClaim(stream, group, consumer, minIdleTime, start);
    const result = await redisClient.xAutoClaim(
        streamKey, // stream name
        groupName, //  group name
        consumerName, //  The consumer that will receive/claim the recovered messages.
        5000, // How long must a message have been idle before I can claim it?
        "0-0", // This is the ID from which Redis should start looking through the pending messages.
        {
            COUNT: 10,
        },
    );
    console.log("Next cursor:", result.nextId);

    for (const entry of result.messages) {
        console.log("Claimed:", entry.id, entry.message);

        console.log("Processing...");

        await new Promise((resolve) => {
            setTimeout(resolve, 1000);
        });

        await redisClient.xAck(streamKey, groupName, entry.id);

        console.log("Acknowledged:", entry.id);
    }

    await redisClient.quit();
}

main();
