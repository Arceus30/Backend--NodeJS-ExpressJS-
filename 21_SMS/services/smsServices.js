const { providerSendSMS } = require("../provider/mockSmsProvider.js");
// const { providerSendSMS } = require("../provider/twilioSmsProvider.js");

const sendSMS = async (to, message) => {
    if (!to) {
        throw new Error("Recipient phone number is required");
    }
    if (!message) {
        throw new Error("SMS message is required");
    }

    return await providerSendSMS({ to, message });
};
module.exports = { sendSMS };
