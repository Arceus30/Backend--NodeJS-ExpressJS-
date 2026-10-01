import crypto from "node:crypto";

const verificationToken = crypto.randomBytes(32).toString("hex");
const verificationUrl = `http://localhost:3000/verify?token=${verificationToken}`;

const resetToken = crypto.randomBytes(32).toString("hex");
const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;
export { verificationUrl, resetUrl };
