const { SMSProviderError } = require("../errors/smsProviderError.js");
async function providerSendSMS({ to, message }) {
    console.log("---- MOCK SMS PROVIDER ----");
    console.log("To:", to);
    console.log("Message:", message);

    if (to === "+910000000000") {
        throw new SMSProviderError(
            "SMS provider rejected the message",
            "PROVIDER_REJECTED",
        );
    }
    return {
        messageId: `mock_${Date.now()}`,
        status: "queued",
    };
}

function simulateDeliveryStatus(status) {
    return {
        status,
    };
}

module.exports = { providerSendSMS, simulateDeliveryStatus };
