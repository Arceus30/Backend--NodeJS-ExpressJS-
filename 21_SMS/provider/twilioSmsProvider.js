const twilio = require("twilio");

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN,
);

async function providerSendSMS({ to, message }) {
    const result = await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to,
        statusCallback: process.env.TWILIO_STATUS_CALLBACK_URL,
    });

    return {
        messageId: result.sid,
        status: result.status,
    };
}

module.exports = { providerSendSMS };
