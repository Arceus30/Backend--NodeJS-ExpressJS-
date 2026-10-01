export function baseTemplate() {
    return {
        // Who is sending the email.
        from: process.env.MAIL_FROM,

        // Single Recipient
        to: "receiver@example.com",
        // Multiple Recipient
        // to: "receiver1@example.com, receiver2@example.com",
        // to: ["receiver1@example.com", "receiver2@example.com"],

        // CC: Carbon copy. The recipient can see who was CC'd.
        cc: "admin@example.com",

        // BCC: Blind carbon copy. Other recipients cannot see the BCC recipient.
        bcc: "audit@example.com",

        // Reply-To: So when the user clicks Reply, their email client can use the support address rather than the sending address.
        replyTo: "support@myapp.com",
    };
}
