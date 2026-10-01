const express = require("express");
const passport = require("passport");

const User = require("../models/User");

const router = express.Router();

// --------------------------------------------------
// REGISTER PAGE
// --------------------------------------------------
router.get("/register", (req, res) => {
    res.send(`
        <h1>Register</h1>
        <form method="POST" action="/register">
            <div>
                <label>Username:</label>
                <input type="text" name="username">
            </div>
            <br>
            <div>
                <label>Password:</label>
                <input type="password" name="password">
            </div>
            <br>
            <button type="submit">
                Register
            </button>
        </form>
        <br>
        <a href="/login">
            Already have an account? Login
        </a>
    `);
});

// --------------------------------------------------
// REGISTER USER
// --------------------------------------------------
router.post("/register", async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check whether username already exists.
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.send("Username already exists.");
        }

        // Create the user.
        const user = await User.create({
            username,
            password,
        });
        console.log("Created user:", user);

        res.redirect("/login");
    } catch (error) {
        console.log(error);
        res.status(500).send("Registration failed.");
    }
});

// --------------------------------------------------
// LOGIN PAGE
// --------------------------------------------------
router.get("/login", (req, res) => {
    res.send(`
        <h1>Login</h1>
        <form method="POST" action="/login">
            <div>
                <label>Username:</label>
                <input type="text" name="username">
            </div>
            <br>
            <div>
                <label>Password:</label>
                <input type="password" name="password">
            </div>
            <br>
            <button type="submit">
                Login
            </button>
        </form>
        <hr>
        <h3>Or</h3>
        <a href="/auth/google">
            Continue with Google
        </a>
        <br>
        <a href="/register">
            Create an account
        </a>
    `);
});

// --------------------------------------------------
// LOGIN
// --------------------------------------------------
// Passport handles the authentication.
// passport.authenticate("local") means: "Use the LocalStrategy we configured earlier."
// That strategy receives: username & password and checks them against MongoDB.
router.post(
    "/login",

    passport.authenticate("local", {
        failureRedirect: "/login",
    }),

    (req, res) => {
        // If we reach this function, authentication succeeded.
        // Passport has also established the login inside the session.
        console.log("Logged in user:", req.user);

        // express-session gives us req.session.
        console.log("Session:");
        console.log(req.session);

        res.redirect("/tasks");
    },
);

// --------------------------------------------------
// LOGOUT
// --------------------------------------------------
router.post("/logout", (req, res) => {
    req.logout((error) => {
        if (error) {
            return res.status(500).send("Logout failed.");
        }
        res.redirect("/");
    });
});

// --------------------------------------------------
// GOOGLE LOGIN
// --------------------------------------------------
// This route starts the Google OAuth flow.
// When the user visits: /auth/google
// Passport redirects them to Google. Scope tells Google what information our application wants access to.
// "profile" gives basic profile information.
router.get(
    "/auth/google",
    passport.authenticate("google", {
        scope: ["profile", "email"], // Tells Google: "What information/access is this application requesting?"
    }),
);

// --------------------------------------------------
// GOOGLE CALLBACK
// --------------------------------------------------
// After Google finishes authentication,
// Google sends the user back to: /auth/google/callback
// Passport receives the result and runs our GoogleStrategy.
// If successful: req.user = our TaskVault User
// Passport then creates the login session because we haven't specified: session: false
router.get(
    "/auth/google/callback",
    passport.authenticate("google", {
        failureRedirect: "/login",
    }),
    (req, res) => {
        console.log("Google login successful.");
        console.log("Logged-in user:");
        console.log(req.user);
        res.redirect("/tasks");
    },
);

module.exports = router;
