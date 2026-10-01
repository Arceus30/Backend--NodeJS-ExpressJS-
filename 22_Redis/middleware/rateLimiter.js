const redisClient = require("../redis/config.js");

const WINDOW_SECONDS = 60;
const MAX_REQUESTS = 5;

function rateLimiter() {
    return async (req, res, next) => {
        try {
            const clientIp = req.ip;

            const key = `rate-limit:${clientIp}`;
            const [count] = await redisClient
                .multi() // Starts a Redis transaction. The commands after .multi() are queued and then executed together when .exec() is called.
                .incr(key) // Increments the value stored at key by 1. If the key doesn't exist, Redis creates it with a value of 1.
                .expire(key, WINDOW_SECONDS, { NX: true }) // Sets an expiration on the key: Set the expiration only if the key does not already have an expiration.
                .exec(); // Executes the queued commands: Redis returns the results of both commands, something like:
            // [
            //     [null, 5],  // result of INCR
            //     [null, 1]   // result of EXPIRE
            // ]

            console.log(`IP: ${clientIp}, requests: ${count}`);
            if (count > MAX_REQUESTS) {
                return res.status(429).json({ message: "Too many requests" });
            }
            next();
        } catch (error) {
            next(error);
        }
    };
}

module.exports = { rateLimiter };
