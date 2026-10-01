const redisClient = require("../redis/config.js");

async function sessionAuth(req, res, next) {
    try {
        const sessionId = req.cookies.sid;

        if (!sessionId) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        const sessionKey = `session:${sessionId}`;
        const session = await redisClient.hGetAll(sessionKey); // get all fields and values stored in a Redis Hash at sessionKey, and store them in session

        if (Object.keys(session).length === 0) {
            return res.status(401).json({
                message: "Session expired or invalid",
            });
        }

        req.sessionId = sessionId;
        req.session = session;

        // Sliding expiration
        await redisClient.expire(sessionKey, 1800);

        next();
    } catch (error) {
        next(error);
    }
}

module.exports = { sessionAuth };
