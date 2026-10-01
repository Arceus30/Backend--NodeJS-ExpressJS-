const redisClient = require("../redis/config.js");

const main = async () => {
    await redisClient.connect();

    const streamKey = "orders";

    for (let i = 0; i < 5; i++) {
        const id = await redisClient.xAdd(
            streamKey,
            "*",
            {
                type: "order.created",
                orderId: "101",
                userId: `${1 + i}`,
            },
            {
                TRIM: {
                    strategy: "MAXLEN",
                    strategyModifier: "~",
                    threshold: 10,
                },
            },
        );
        console.log("Added stream entry:", id);
    }

    await redisClient.quit();
};

main();
