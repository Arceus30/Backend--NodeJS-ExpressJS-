import "dotenv/config";
import mongoose from "mongoose";
import app from "./app.js";

const PORT = 3000;

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.log(err);
        process.exit(1);
    });
