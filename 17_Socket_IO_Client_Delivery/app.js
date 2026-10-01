const express = require("express");
const { createServer } = require("node:http");

const app = express();
const server = createServer(app);

app.set("view engine", "ejs");
app.set("views", "./views");

app.use(express.static("./public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
    res.render("index", { title: "Client Delivery Lab" });
});

module.exports = server;
