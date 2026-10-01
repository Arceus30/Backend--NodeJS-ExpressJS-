const express = require("express");
const { createServer } = require("node:http");
const path = require("node:path");

const app = express();
const server = createServer(app);

app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
    res.render("index");
});

module.exports = server;
