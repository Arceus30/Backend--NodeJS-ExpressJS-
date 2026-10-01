const { generateOTP, hashOTP } = require("../utils/otp.js");
const {
    saveOTP,
    getOTP,
    deleteOTP,
    hasExceededAttempts,
    incrementAttempts,
    canResendOTP,
} = require("../stores/otpStore.js");
const { sendSMS } = require("./smsServices.js");

const createOTP = async (phone) => {
    // Check resend cooldown
    if (!(await canResendOTP(phone))) {
        throw new Error(`Please wait before requesting another OTP`);
    }
    const otp = generateOTP();
    const otpHash = hashOTP(otp);
    const smsResult = await sendSMS(phone, `Your OTP is ${otp}`);
    await saveOTP(phone, otpHash, smsResult);
    return { smsResult };
};

const verifyOTP = async (phone, otp) => {
    const storedOTP = await getOTP(phone);
    if (!storedOTP) {
        return {
            success: false,
            message: "OTP not found or expired",
        };
    }
    if (await hasExceededAttempts(phone)) {
        await deleteOTP(phone);
        return {
            success: false,
            message: "Too many attempts",
        };
    }

    const submittedHash = hashOTP(otp);

    if (submittedHash !== storedOTP.otpHash) {
        const attempts = await incrementAttempts(phone);
        return {
            success: false,
            message: "Invalid OTP",
            remainingAttempts: 5 - attempts,
        };
    }
    await deleteOTP(phone);
    return {
        success: true,
        message: "OTP verified",
    };
};

module.exports = {
    createOTP,
    verifyOTP,
};
