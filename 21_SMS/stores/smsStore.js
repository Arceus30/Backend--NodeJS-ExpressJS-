const redisClient = require("../config/redis.js");

async function saveSMSStatus(messageId, status) {
    await redisClient.set(
        `sms:${messageId}`,
        JSON.stringify({
            messageId,
            status,
        }),
    );
}

async function getSMSStatus(messageId) {
    const data = await redisClient.get(`sms:${messageId}`);

    if (!data) {
        return null;
    }

    return JSON.parse(data);
}

module.exports = { saveSMSStatus, getSMSStatus };
