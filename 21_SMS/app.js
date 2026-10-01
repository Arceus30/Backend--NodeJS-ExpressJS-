const express = require("express");
const authRoutes = require("./routes/authRoutes.js");
const smsRoutes = require("./routes/smsRoutes.js");
const app = express();

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/sms", smsRoutes);
module.exports = app;
