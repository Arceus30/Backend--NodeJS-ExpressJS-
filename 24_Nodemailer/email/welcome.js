// emails/welcome.js
export function welcomeTemplate(username) {
    return {
        // The email subject.
        subject: "Welcome to My Application",

        // Plain-text version of the email.
        // This is useful for clients that don't render HTML and is also an important fallback.
        text: `
        Hello ${username},
        
        Welcome to our application!
        
        We're happy to have you here.
        `,
        // Email clients that support HTML will generally display the HTML version, while the text version provides a fallback.

        // html: HTML version of the email.
        html: `
            <h1>Welcome ${username}!</h1>

            <p>
                Thanks for joining our application.
            </p>

            <p>
                We're happy to have you here.
            </p>
        `,
    };
}
