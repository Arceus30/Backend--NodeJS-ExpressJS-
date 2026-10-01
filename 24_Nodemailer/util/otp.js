import crypto from "node:crypto";

const otp = crypto.randomInt(100000, 1000000).toString();

export { otp };
