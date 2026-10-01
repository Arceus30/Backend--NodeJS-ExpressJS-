export function otpTemplate(username, otp) {
    return {
        subject: "Your Verification Code",

        text: `
Hello ${username},

Your verification code is:

${otp}

This code will expire soon.

If you did not request this code, you can ignore this email.
        `,

        html: `
            <h1>Verification Code</h1>

            <p>Hello ${username},</p>

            <p>Your verification code is:</p>

            <h2>${otp}</h2>

            <p>
                This code will expire soon.
            </p>

            <p>
                If you did not request this code,
                you can ignore this email.
            </p>
        `,
    };
}
