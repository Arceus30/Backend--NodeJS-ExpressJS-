export function passwordResetTemplate(username, resetUrl) {
    return {
        subject: "Reset Your Password",

        text: `
Hello ${username},

We received a request to reset your password.

Reset your password here:

${resetUrl}

This link will expire soon.

If you did not request this, you can safely ignore this email.
        `,

        html: `
            <h1>Password Reset</h1>

            <p>Hello ${username},</p>

            <p>
                We received a request to reset your password.
            </p>

            <p>
                Click the button below to choose a new password.
            </p>

            <p>
                <a href="${resetUrl}">
                    Reset Password
                </a>
            </p>

            <p>
                This link will expire soon.
            </p>

            <p>
                If you did not request this, you can safely ignore this email.
            </p>
        `,
    };
}
