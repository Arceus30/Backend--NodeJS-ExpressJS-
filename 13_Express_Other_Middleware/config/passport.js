const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const BasicStrategy = require("passport-http").BasicStrategy;

const GoogleStrategy = require("passport-google-oauth20").Strategy;

const User = require("../models/User");

// --------------------------------------------------
// LOCAL STRATEGY
// --------------------------------------------------
// Passport supports different authentication strategies.
// Examples:
// LocalStrategy       -> username/password
// GoogleStrategy      -> Google login
// GitHubStrategy      -> GitHub login

// For TaskVault we're going to use username/password.
// LocalStrategy receives:  username & password from the login request.
passport.use(
    new LocalStrategy(async (username, password, done) => {
        try {
            // Look for a user with this username.
            const user = await User.findOne({ username });

            // No user found.
            if (!user) {
                return done(null, false, {
                    message: "Incorrect username",
                });
            }

            // Check the password.
            // REMEMBER: This is intentionally simple for learning.
            // In a real application we would compare a hashed password here.
            if (user.password !== password) {
                return done(null, false, {
                    message: "Incorrect password",
                });
            }

            // Authentication succeeded. "user" is now the authenticated user.
            return done(null, user);
        } catch (error) {
            // Something went wrong while authenticating.
            return done(error);
        }
    }),
);

// --------------------------------------------------
// HTTP BASIC STRATEGY
// --------------------------------------------------
// Passport can support many authentication mechanisms.
// We already have: LocalStrategy: username + password from a form
//  Now we'll add: BasicStrategy: username + password sent through the HTTP Authorization header
// The request contains something conceptually like: Authorization: Basic a2VzaGF2OjEyMzQ1
// BasicStrategy decodes that and gives us: username & password
// We then authenticate the user exactly as before.

passport.use(
    new BasicStrategy(async (username, password, done) => {
        try {
            // Look up the user.
            const user = await User.findOne({
                username,
            });

            if (!user) {
                return done(null, false, {
                    message: "Incorrect username",
                });
            }

            // Again, this is deliberately simple because this project is about learning Passport, not password hashing.
            if (user.password !== password) {
                return done(null, false, {
                    message: "Incorrect password",
                });
            }

            // Authentication succeeded.
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }),
);

// --------------------------------------------------
// GOOGLE OAUTH 2.0 STRATEGY
// --------------------------------------------------
// Google authentication is different from our LocalStrategy.
// LocalStrategy: Our application receives username/password.
// GoogleStrategy:
// We redirect the user to Google.
// Google authenticates them.
// Google sends us back an authorization result.
// Passport obtains the Google profile.
// The verify callback then decides which TaskVault user this Google account belongs to.
passport.use(
    new GoogleStrategy(
        {
            // These values come from Google Cloud.
            clientID: process.env.GOOGLE_CLIENT_ID, // Identifies: "Which application is making this OAuth request?"
            clientSecret: process.env.GOOGLE_CLIENT_SECRET, // A confidential credential associated with that application.

            // Google redirects the user here after successful authentication.
            callbackURL: "http://localhost:3000/auth/google/callback", // Tells Google: "After authorization, send the browser back here."
        },

        async (accessToken, refreshToken, profile, done) => {
            try {
                console.log("Google profile:");
                console.log(profile);

                // --------------------------------------
                // FIND EXISTING GOOGLE USER
                // --------------------------------------
                const existingUser = await User.findOne({
                    googleId: profile.id, // Google user identifier: Lets us associate the Google account with a TaskVault user.
                });

                if (existingUser) {
                    return done(null, existingUser);
                }

                // --------------------------------------
                // CREATE NEW GOOGLE USER
                // --------------------------------------
                const user = await User.create({
                    googleId: profile.id,
                    displayName: profile.displayName,
                    email:
                        profile.emails && profile.emails[0]
                            ? profile.emails[0].value
                            : undefined,
                });

                return done(null, user);
            } catch (error) {
                return done(error);
            }
        },
    ),
);

// --------------------------------------------------
// SERIALIZE USER
// --------------------------------------------------
// After successful login Passport needs to remember which user logged in.
// It does NOT normally put the entire user document into the session.
// Instead, we store a small identifier.For example:
// User: {
//     _id: "abc123",
//     username: "keshav",
//     password: "12345"
// }
//
// Passport can store: "abc123" in the session.
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// --------------------------------------------------
// DESERIALIZE USER
// --------------------------------------------------
// On a later request, Passport finds the ID stored in the session.
// Then it uses that ID to retrieve the actual user.
// Session: userId = "abc123"
// Passport: User.findById("abc123")
// Result: req.user = actual User document
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});

module.exports = passport;
