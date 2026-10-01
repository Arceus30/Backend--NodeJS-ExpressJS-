const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    title: {
        type: String,
        required: true,
    },

    description: {
        type: String,
        required: true,
    },

    // --------------------------------------------------
    // FILE INFORMATION
    // --------------------------------------------------
    // Multer will save the actual file on disk. MongoDB will only store information about it.
    // We're not putting the uploaded file itself inside MongoDB.
    // Instead: Uploaded file  --->  uploads/notes.pdf  --->  MongoDB {filename: "...", path: "...", originalName: "notes.pdf"}
    attachment: {
        filename: String,
        path: String,
        originalName: String,
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
