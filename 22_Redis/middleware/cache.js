const redisClient = require("../redis/config.js");

function cache(keyGenerator, ttl = 60) {
    return async (req, res, next) => {
        try {
            const key = keyGenerator(req);

            const cachedData = await redisClient.get(key);
            if (cachedData) {
                console.log(`CACHE HIT: ${key}`);
                return res.json({
                    source: "redis",
                    data: JSON.parse(cachedData),
                });
            }

            console.log(`CACHE MISS: ${key}`);
            // Save key for the controller
            res.locals.cacheKey = key;
            res.locals.cacheTTL = ttl;
            next();
        } catch (error) {
            next(error);
        }
    };
}

module.exports = { cache };
