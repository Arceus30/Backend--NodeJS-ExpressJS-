export function verificationTemplate(username, verificationUrl) {
    return {
        subject: "Verify Your Account",

        text: `
Hello ${username},

Please verify your account by visiting:

${verificationUrl}

This link will expire soon.
        `,

        html: `
            <h1>Hello ${username}!</h1>

            <p>
                Thanks for creating an account.
            </p>

            <p>
                Please verify your email address by clicking the button below.
            </p>

            <p>
                <a href="${verificationUrl}">
                    Verify Your Account
                </a>
            </p>

            <p>
                This link will expire soon.
            </p>
        `,
    };
}
