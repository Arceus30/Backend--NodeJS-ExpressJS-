class SMSProviderError extends Error {
    constructor(message, code = "SMS_PROVIDER_ERROR") {
        super(message);
        this.name = "SMSProviderError";
        this.code = code;
    }
}

module.exports = { SMSProviderError };
