const crypto = require("crypto");

const generateOTP = () => {
    return crypto.randomInt(100000, 1000000).toString();
};

const hashOTP = (otp) => {
    return crypto.createHash("sha256").update(otp).digest("hex");
};

const isValidOTP = (otp) => {
    return /^\d{6}$/.test(otp);
};

module.exports = {
    generateOTP,
    hashOTP,
    isValidOTP,
};
