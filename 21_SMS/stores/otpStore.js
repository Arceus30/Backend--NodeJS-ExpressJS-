const redisClient = require("../db/redis/config");

const OTP_EXPIRY = 5 * 60;
const RESEND_COOLDOWN = 120;
const MAX_ATTEMPTS = 5;

const saveOTP = async (phone, otpHash) => {
    const data = {
        otpHash,
        attempts: 0,
    };
    console.log(JSON.stringify(data));
    await redisClient.set(`otp:${phone}`, JSON.stringify(data), {
        EX: OTP_EXPIRY,
    });
    await redisClient.set(`otp-cooldown:${phone}`, "1", {
        EX: RESEND_COOLDOWN,
    });
};

const getOTP = async (phone) => {
    const data = await redisClient.get(`otp:${phone}`);
    if (!data) {
        return null;
    }
    return JSON.parse(data);
};

const deleteOTP = async (phone) => {
    await redisClient.del(`otp:${phone}`);
    await redisClient.del(`otp-cooldown:${phone}`);
};

const canResendOTP = async (phone) => {
    return (await redisClient.exists(`otp-cooldown:${phone}`)) === 0;
};

const hasExceededAttempts = async (phone) => {
    const data = await getOTP(phone);
    return data.attempts >= MAX_ATTEMPTS;
};

const incrementAttempts = async (phone) => {
    const data = await getOTP(phone);
    data.attempts++;
    await redisClient.set(`otp:${phone}`, JSON.stringify(data), {
        EX: OTP_EXPIRY,
    });
    return data.attempts;
};

module.exports = {
    saveOTP,
    getOTP,
    deleteOTP,
    hasExceededAttempts,
    incrementAttempts,
    canResendOTP,
};
