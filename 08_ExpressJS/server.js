const express = require("express");
const cors = require("cors");

const app = express();
const port = 3000;

const blog = require("./routes/blog");
const birds = require("./routes/birds");

// app.use(cors()); // Simple Usage (Enable All CORS Requests)

// const corsOptions = {
//     origin: "http://localhost:5173.com", // Only a browser frontend running at localhost:5173 is allowed to access my responses.
//     optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
//     credentials: true; // when used with cookies for security. credentials:true cannot be set with origin: *
//     methods: ["GET", "POST", "PUT", "DELETE"], // allowed methods
//     allowedHeaders: ["Content-Type", "Authorization"], // allowed headers
// };

// cors with dynamic origin
// This module supports validating the origin dynamically using a function provided to the origin option. This function will be passed a string that is the origin (or undefined if the request has no origin), and a callback with the signature callback(error, origin).
// When you don't want to hard-code one origin.
const allowedOrigins = [
    "http://localhost:5173",
    "https://myapp.com",
    "https://admin.myapp.com",
];
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
};

app.use(cors(corsOptions)); // configure cors

app.use("/blog", blog); // all requests which start with "/blog" will be handled here
app.use("/birds/:birdId", birds);

// app.<method>(path, request_handler)
app.get("/", (req, res) => {
    console.log(req); // req object
    res.send("Hello World!");
});

// Request params: GET /users/42
app.get(
    "/users/:id",
    // Enable CORS for a Single Route
    // cors(),
    (req, res) => {
        /* fetches a particular user */
        res.json({ id: req.params.id }); // req.params.id === "42"  (always a string)
    },
);

// Query strings — after the ? , key=value pairs: GET /search?term=node&page=2
app.get("/search", (req, res) => {
    const { term, page } = req.query; // term="node", page="2"
    res.json({ term, page });
});

// app.route to group handlers for one path
app.route("/books")
    .get((req, res) => res.json([]))
    .post((req, res) => res.status(201).json({}));

// app.all(path, handler); // special function use to load middleware at a particular path for all method

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
