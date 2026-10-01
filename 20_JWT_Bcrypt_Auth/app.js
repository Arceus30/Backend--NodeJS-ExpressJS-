import express from "express";
import cookieParser from "cookie-parser";

import authRouter from "./routes/auth.js";
import userRouter from "./routes/user.js";

const app = express();

app.use(express.json());

app.use(cookieParser());

app.use("/auth", authRouter);

app.use("/user", userRouter);

export default app;
