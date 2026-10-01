const redisClient = require("../redis/config");

const monitor = async () => {
    const streamInfo = await redisClient.xInfoStream("orders");
    console.log("\n--- STREAM ---");
    console.log({
        length: streamInfo.length,
        lastEntry: streamInfo["fast-generated-id"],
        lastEntry: streamInfo["last-generated-id"],
    });

    const groupInfo = await redisClient.xInfoGroups("orders");
    const group = groupInfo.find((group) => group.name === "order-workers");
    console.log("\n--- GROUP ---");
    console.log({
        consumers: group?.consumers,
        pending: group?.pending,
        lag: group?.lag,
    });

    const consumerInfo = await redisClient.xInfoConsumers(
        "orders",
        "order-workers",
    );
    console.log("\n--- CONSUMERS ---");
    for (const consumer of consumerInfo) {
        console.log({
            name: consumer.name,
            pending: consumer.pending,
            idle: consumer.idle,
        });
        if (consumer.pending > 0 && consumer.idle > 60_000) {
            console.warn(`Consumer ${consumer.name} may be unhealthy`);
        }
    }
};

const main = async () => {
    setInterval(monitor, 5000);
};

main();
