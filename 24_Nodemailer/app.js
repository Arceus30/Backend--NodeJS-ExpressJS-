import "dotenv/config";
import emailQueue from "./queues/emailQueue.js";

import { baseTemplate } from "./email/base.js";
import { welcomeTemplate } from "./email/welcome.js";
import { attachmentTemplate } from "./email/attachment.js";
import { verificationTemplate } from "./email/verification.js";
import { passwordResetTemplate } from "./email/passwordReset.js";
import { otpTemplate } from "./email/otp.js";

import { verificationUrl, resetUrl } from "./util/token_url.js";
import { otp } from "./util/otp.js";

const email = baseTemplate();
const welcomeEmail = { ...email, ...welcomeTemplate("Keshav") };
const attachmentEmail = { ...welcomeEmail, ...attachmentTemplate() };
const verificationEmail = {
    ...welcomeEmail,
    ...verificationTemplate("Keshav", verificationUrl),
};
const passwordResetEmail = {
    ...welcomeEmail,
    ...passwordResetTemplate("Keshav", resetUrl),
};
const otpEmail = { ...welcomeEmail, ...otpTemplate("Keshav", otp) };

const p1 = emailQueue.add(
    "send-email",
    { email: email, t: "baseEmail" },
    {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 5000,
        },
    },
);

const p2 = emailQueue.add(
    "send-email",
    { email: welcomeEmail, t: "welcomeEmail" },
    {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 5000,
        },
    },
);

const p3 = emailQueue.add(
    "send-email",
    { email: attachmentEmail, t: "attachmentEmail" },
    {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 5000,
        },
    },
);

const p4 = emailQueue.add(
    "send-email",
    { email: verificationEmail, t: "verificationEmail" },
    {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 5000,
        },
    },
);

const p5 = await emailQueue.add(
    "send-email",
    { email: passwordResetEmail, t: "passwordResetEmail" },
    {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 5000,
        },
    },
);

const p6 = await emailQueue.add(
    "send-email",
    { email: otpEmail, t: "otpEmail" },
    {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 5000,
        },
    },
);

Promise.all([p1, p2, p3, p4, p5, p6]).then(
    ([
        baseJob,
        welcomeJob,
        attachmentJob,
        verificationJob,
        passwordResetJob,
        otpJob,
    ]) => {
        console.log("Base Job added: ", baseJob.id);
        console.log("Welcome Job added: ", welcomeJob.id);
        console.log("Attachment Job added: ", attachmentJob.id);
        console.log("Verification Job added: ", verificationJob.id);
        console.log("Password Reset Job added: ", passwordResetJob.id);
        console.log("OTP Job added: ", otpJob.id);
    },
);
