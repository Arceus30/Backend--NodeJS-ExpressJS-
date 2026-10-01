import "dotenv/config";
import nodemailer from "nodemailer";

// Temporary Ethereal SMTP credentials.
const testAccount = await nodemailer.createTestAccount();

const connection = async () => {
    // "Create a connection configuration for an SMTP server."
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),

        // For a typical SMTP submission configuration on port 587, you commonly use: secure:false
        // The connection can then upgrade to TLS using STARTTLS. With implicit TLS on port 465, you commonly use: secure:true
        secure: Number(process.env.SMTP_PORT) === 465,

        auth: {
            user: testAccount.user || process.env.SMTP_USER,
            pass: testAccount.pass || process.env.SMTP_PASSWORD,
        },
    });

    // This is useful for checking whether the transporter can connect/authenticate before attempting to send mail.
    await transporter.verify();
    console.log("SMTP connection is ready");
    return transporter;
};

const transporter = await connection();

export default transporter;
