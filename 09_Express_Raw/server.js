const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();

const PORT = 3000;
const uploadDir = path.join(__dirname, "uploads");

// Create uploads folder if it doesn't exist
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// GET "/"
// Show index page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// POST "/upload"
// Receive image as raw bytes
app.post(
    "/upload",
    express.raw({
        type: "image/*",
        limit: "10mb",
    }),
    (req, res) => {
        const imageName = "image.jpg";
        const imagePath = path.join(uploadDir, imageName);

        // req.body is a Buffer
        fs.writeFileSync(imagePath, req.body);

        // Redirect to GET /image.jpg
        res.redirect(`/${imageName}`);
    },
);

// GET "/:imageName"
// Send uploaded image
app.get("/:imageName", (req, res) => {
    const imageName = req.params.imageName;

    const imagePath = path.join(uploadDir, imageName);

    res.sendFile(imagePath);
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
