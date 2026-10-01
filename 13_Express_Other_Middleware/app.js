require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");

// --------------------------------------------------
// Middleware packages
// --------------------------------------------------
const morgan = require("morgan");
const helmet = require("helmet");
const methodOverride = require("method-override");
const session = require("express-session");
const passport = require("passport");

require("./config/passport");

// --------------------------------------------------
// Routes
// --------------------------------------------------
const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");

// --------------------------------------------------
// Create Express application
// --------------------------------------------------

const app = express();
const PORT = 3000;

app.set("view engine", "ejs");

// --------------------------------------------------
// MORGAN
// --------------------------------------------------
// Morgan is an HTTP request logger. Every time a request reaches our server, Morgan prints information about that request.
// For example:
// GET /
// POST /login
// GET /tasks
app.use(morgan("dev")); // pre-defined string (Concise output colored by response status for development use.)
// morgan('tiny');  // pre-defined string (The minimal output.)
// morgan(':method :url :status :res[content-length] - :response-time ms'); // format string of predefined tokens
// morgan(function (tokens, req, res) {
//   return [
//     tokens.method(req, res),
//     tokens.url(req, res),
//     tokens.status(req, res),
//     tokens.res(req, res, 'content-length'), '-',
//     tokens['response-time'](https://github.com/expressjs/morgan/blob/HEAD/req, res), 'ms'
//   ].join(' ')
// }) // custom format function

// Creating new tokens: To define a token, simply invoke morgan.token() with the name and a callback function. This callback function is expected to return a string value. The value returned is then available as “:type” in this case:
morgan.token("type", function (req, res) {
    return req.headers["content-type"];
});
// Calling morgan.token() using the same name as an existing token will overwrite that token definition.

// write logs in a file
const accessLogStream = fs.createWriteStream(
    path.join(__dirname, "access.log"),
    { flags: "a" },
); // create a write stream (in append mode)
app.use(morgan("dev", { stream: accessLogStream })); // setup the logger

// --------------------------------------------------
// HELMET
// --------------------------------------------------
// Helmet adds various security-related HTTP headers to our responses.
// We don't have to manually write those headers ourselves.

// Example:
// Browser requests: GET /
// Express sends response headers. Helmet modifies/adds security-related headers to that response.
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                ...helmet.contentSecurityPolicy.getDefaultDirectives(),

                // Allow browser JavaScript to send requests
                // to Cloudinary.
                connectSrc: ["'self'", "https://api.cloudinary.com"],
            },
        },
    }),
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// --------------------------------------------------
// METHOD-OVERRIDE
// --------------------------------------------------
// Browsers' HTML forms traditionally support: GET, POST
// But our application wants to use REST-style: GET, POST, PUT, DELETE
// method-override allows us to use PUT and DELETE through a normal POST form.
// Example: <form method="POST" action="/tasks/123?_method=DELETE">
// method-override sees: _method=DELETE and makes Express treat the request as: DELETE /tasks/123
app.use(methodOverride("_method"));

app.use(express.static("public"));

// --------------------------------------------------
// EXPRESS SESSION
// --------------------------------------------------
// express-session allows our server to remember information about a browser between requests. This will be extremely important for login.
// Conceptually:
// First request: Browser  --->  POST /login  --->  Express  --->  Session created
// Browser receives a session cookie.
// Later: Browser  --->  GET /tasks  --->  Cookie: connect.sid=...  --->  Express  --->  Session is found
// This allows us to know that the user is logged in.
app.use(
    session({
        // Secret used to sign the session ID cookie.
        // IMPORTANT: In a real application this should come from an environment variable rather than being written directly in the source code.
        secret: "taskvault-secret",

        // Don't save the session back to the session store if nothing changed.
        resave: false,

        // Don't create an empty session for every visitor who hasn't logged in.
        saveUninitialized: false,

        cookie: {
            // JavaScript running in the browser cannot directly read this cookie. Helps reduce certain XSS-related risks.
            httpOnly: true,

            // Browser should only send this cookie over HTTPS.
            // During local HTTP development this must remain false, otherwise your browser may not send it.
            secure: false,

            // Controls when the browser should send the cookie in cross-site situations.
            sameSite: "lax",

            // Session cookie lifetime.
            maxAge: 24 * 60 * 60 * 1000,
        },
    }),
);

// --------------------------------------------------
// PASSPORT
// --------------------------------------------------
// Passport itself is authentication middleware.
// Later we will configure Passport with a LocalStrategy: username + password
// Passport needs two middleware calls: passport.initialize() & passport.session()
app.use(passport.initialize());

// passport.session() allows Passport to restore the logged-in user from the session.
// We will configure Passport before this becomes fully useful.
app.use(passport.session());

// --------------------------------------------------
// HOME ROUTE
// --------------------------------------------------
app.get("/", (req, res) => {
    res.send(`
        <h1>TaskVault</h1>
        <p>Our project is running!</p>
        <p>Later this page will become the homepage.</p>
    `);
});

app.get("/.well-known/appspecific/com.chrome.devtools.json", (req, res) => {
    res.json({});
});

app.use(authRoutes);
app.use(taskRoutes);

// --------------------------------------------------
// MULTER / GLOBAL ERROR HANDLER
// --------------------------------------------------
app.use((err, req, res, next) => {
    // Check whether the error was generated by Multer.

    if (err instanceof multer.MulterError) {
        return res.status(400).send(`Upload error: ${err.message}`);
    }

    // Handle our custom fileFilter error.
    if (err) {
        return res.status(400).send(err.message);
    }

    // Anything else goes to the next error handler.
    next();
});

// --------------------------------------------------
// MONGODB CONNECTION
// --------------------------------------------------
mongoose
    .connect("mongodb://127.0.0.1:27017/taskvault")
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((error) => {
        console.log("MongoDB connection error:");
        console.log(error);
    });

// --------------------------------------------------
// START SERVER
// --------------------------------------------------
app.listen(PORT, () => {
    console.log(`TaskVault running at http://localhost:${PORT}`);
});
