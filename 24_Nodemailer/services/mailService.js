import transporter from "../config/mail.js";
import nodemailer from "nodemailer";
export async function sendMail({ email, t }) {
    // "Send this email through that configured SMTP server."
    // sendMail() returns information about the sending operation.
    const info = await transporter.sendMail(
        email, // "The actual email."
    );

    // identifies the email message.
    console.log(`${t} Message ID: ${info.messageId}`);

    // gives us the Ethereal preview URL.
    console.log(`${t} Preview URL: ${nodemailer.getTestMessageUrl(info)}`);

    return info;
}
