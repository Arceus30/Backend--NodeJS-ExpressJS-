const express = require("express");
const userRoutes = require("./routes/userRoutes.js");
const postRoutes = require("./routes/postRoutes.js");

const knexUserRoutes = require("./knex/routes/userRoutes.js");
const knexPostRoutes = require("./knex/routes/postRoutes.js");

const app = express();

app.use(express.json());
app.use("/users", userRoutes);
app.use("/posts", postRoutes);
app.use("/knex/users", knexUserRoutes);
app.use("/knex/posts", knexPostRoutes);

module.exports = app;
