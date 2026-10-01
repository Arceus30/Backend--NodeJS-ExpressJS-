const { createOTP, verifyOTP } = require("../services/otpServices");
const { isValidPhoneNumber } = require("../utils/phoneNumber");
const { isValidOTP } = require("../utils/otp");

const sendOTPController = async (req, res) => {
    try {
        const { phone } = req.body;
        if (!isValidPhoneNumber(phone)) {
            return res.status(400).json({
                success: false,
                message: "Phone number is required",
            });
        }
        const res = createOTP(phone);
        res.status(200).json({ success: true, message: "OTP sent" });
    } catch (err) {
        console.log(err);
        if (err instanceof SMSProviderError) {
            return res.status(502).json({
                success: false,
                message: "SMS provider failed",
                code: err.code,
            });
        }
        res.status(500).json({
            success: false,
            message: "Failed to send OTP",
        });
    }
};

const verifyOTPController = async (req, res) => {
    try {
        const { phone, otp } = req.body;
        if (!isValidPhoneNumber(phone) || !isValidOTP(otp)) {
            return res.status(400).json({
                success: false,
                message: "Phone and OTP are required",
            });
        }
        const result = await verifyOTP(phone, otp);
        if (!result.success) {
            return res.status(400).json(result);
        }
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Verification failed",
        });
    }
};

module.exports = {
    sendOTPController,
    verifyOTPController,
};
