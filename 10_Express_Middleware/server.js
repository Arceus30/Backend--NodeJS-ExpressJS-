const express = require("express");
const app = express();
const port = 3000;

const { myLogger, requestTime } = require("./middleware/first");
const cookieParser = require("cookie-parser");

// Middleware
// Order: Middleware function ordering dictates the sequence in which middleware function be executed
// A concise formal signature would be: app.<method>([path], handler) or router.<method>([path],handler)
// where:
// method = use | all | get | post | put | patch | delete | ...
// path   = optional path pattern (if not specified it will run on all paths)
// handler = middleware/handler function, we can pass any number of middleware and handler separated by comma (an array of functions can also be passed)

// Built In Middleware
// 1.) express.static(root, [options]); -->
// root: Specifies the root directory from which to serve static assets (relative to the directory from where the node process launches).
// To use multiple static assets directories, call the express.static middleware function multiple times:
app.use(express.static("public")); // The middleware will run for requests of type http://localhost:3000/*
app.use("/static", express.static("public")); // The middleware will run for requests of type http://localhost:3000/static/*

// 2.) express.json(): middleware function which parses application/json requests so we can access req.body
app.use(express.json());

// 3.) express.urlencoded({}): middleware function which parses html form submissions using URL-encoded data and makes the parsed values available as a JS object in req.body
// extended: false --> Uses a simpler parser. It's suitable for basic key-value data:
// extended: true --> Uses the qs parser, which can handle nested objects and arrays.
app.use(express.urlencoded({ extended: true }));

// Third Party Middleware
app.use(cookieParser());
// 2.) app.use(cookieParser(secret)); parses the signed (with secret) and unsigned cookies and store them in req.cookies
// When secret is provided, this module will unsign and validate any signed cookie values and move those name value pairs from req.cookies into req.signedCookies. A signed cookie is a cookie that has a value prefixed with s:. Signed cookies that fail signature validation will have the value false instead of the tampered value.

// Custom Middleware:
// 1.) myLogger prints logged and then set request time
app.use(myLogger); // if path is not specified middleware will execute on every path and every method

// middleware will be executed when request path matches (every method)
app.use("/b", requestTime); // modifying the request object

// Skipping to the next route
// Call next('route') to skip the remaining middleware functions in a router middleware stack and pass control to the next route.
// In the following example, if the user ID is 0, the first handler skips to the next route, which sends a special response:
app.get(
    "/user/:id",
    (req, res, next) => {
        // if the user ID is 0, skip to the next route
        if (req.params.id === "0") next("route");
        // otherwise pass the control to the next middleware function in this stack
        else next();
    },
    (req, res) => {
        // send a regular response
        res.send("regular");
    },
);

// handler for the /user/:id path, which sends a special response
app.get("/user/:id", (req, res) => {
    res.send("special");
});

// reads the cookie
app.get("/cookie/read", (req, res) => {
    console.log(req.cookies);
});

// sets the cookie
app.get("/cookie/set", (req, res) => {
    res.cookie("username", "keshav30"); // res.cookie(cookie-name, cookie-value)
    res.cookie("name", "keshav", {
        httpOnly: true,
        path: "/",
    });
    res.status(200).send("Accepted");
});

// clear the cookies
app.get("/cookie/clear", (req, res) => {
    res.clearCookie("username"); // res.clearCookie(cookie-name)
    res.clearCookie("name", {
        httpOnly: true,
        path: "/",
    });
    res.status(200).send("Accepted");
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err);
    res.status(400).send(err.message);
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
