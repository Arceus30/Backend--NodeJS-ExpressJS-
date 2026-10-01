const messageRate = new Map();
const RATE_LIMIT = 10;
const WINDOW_MS = 10000;

function rateLimiter(socketId) {
    const now = Date.now();
    const record = messageRate.get(socketId);
    if (!record || now - record.start >= WINDOW_MS) {
        messageRate.set(socketId, {
            start: now,
            count: 1,
        });
        return true;
    }
    record.count++;
    if (record.count > RATE_LIMIT) {
        return false;
    }
    return true;
}

function clearRateLimit(socketId) {
    messageRate.delete(socketId);
}

module.exports = {
    rateLimiter,
    clearRateLimit,
};
