const express = require("express");
const path = require("path");

const multer = require("multer");
const getGridFSBucket = require("../config/gridfs");

const passport = require("passport");

const Task = require("../models/Task");
const requireAuth = require("../middleware/auth");

const router = express.Router();

// --------------------------------------------------
// MULTER CONFIGURATION
// --------------------------------------------------
// Multer handles: multipart/form-data
// This is the encoding used when an HTML form contains file uploads.
// Example:
// <form enctype="multipart/form-data">
// Without Multer, Express won't conveniently give us the uploaded file in req.file.

// --------------------------------------------------
// STORAGE CONFIGURATION
// --------------------------------------------------
// DiskStorage
// DiskStorage --> req.file.path, req.file.filename
const diskStorage = multer.diskStorage({
    // Where should uploaded files be saved?
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },

    // What should the saved file be called?
    filename: (req, file, cb) => {
        // Make the filename unique by adding a timestamp.
        // Example: 1756812345678-notes.pdf
        const uniqueName = Date.now() + "-" + file.originalname;
        cb(null, uniqueName);
    },
});

// MemoryStorage (Default Storage behaviour)
// MemoryStorage --> req.file.buffer
// use memoryStorage when you do not actually want the file on your server.
// suppose your architecture is:
// Browser  -->  Express  -->  Multer  -->  memoryStorage  -->  req.file.buffer  -->  AWS S3
// The Express server is acting as a temporary middleman. You can also send the buffer to:
// S3, Cloudinary, Google Cloud Storage, Azure Blob Storage, another API, image processing library, PDF processing library.
const memoryStorage = multer.memoryStorage({
    // Where should uploaded files be saved?
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },

    // What should the saved file be called?
    filename: (req, file, cb) => {
        // Make the filename unique by adding a timestamp.
        // Example: 1756812345678-notes.pdf
        const uniqueName = Date.now() + "-" + file.originalname;
        cb(null, uniqueName);
    },
});
// Not always use memoryStorage(), because the entire file is kept in memory.
// Your server could end up holding huge amounts of data in RAM.
// So memoryStorage() is particularly useful when: file is small OR you immediately stream/process/store it elsewhere, rather than keeping large files around.

// Create the Multer middleware.
const upload = multer({
    storage: diskStorage,

    // Limit how large an uploaded file can be.
    limits: {
        fileSize: 5 * 1024 * 1024, // maximum size of an individual file i.e, 5 MB
        files: 5, // maximum number of files
        fields: 20, // maximum number of non-file fields
        fieldSize: 100 * 1024, // maximum size of an individual non-file field
    },

    // Decide which files are allowed.
    fileFilter: (req, file, cb) => {
        // Example: Allow PDF, PNG and JPEG files.
        const allowedTypes = ["application/pdf", "image/png", "image/jpeg"];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true); // Accept file.
        } else {
            cb(new Error("Only PDF, PNG and JPEG files are allowed.")); // Reject file.
        }
    },
});

const memoryUpload = multer({
    storage: memoryStorage,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 5,
        fields: 20,
        fieldSize: 100 * 1024,
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ["application/pdf", "image/png", "image/jpeg"];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only PDF, PNG and JPEG files are allowed."));
        }
    },
});

// --------------------------------------------------
// GRIDFS MULTER CONFIGURATION
// --------------------------------------------------
// We deliberately use memoryStorage here. Multer will NOT create a file inside uploads/.
// Instead: multipart/form-data  -->  Multer  -->  req.file.buffer
// Then our route will give that buffer to GridFS.
const gridfsUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ["application/pdf", "image/png", "image/jpeg"];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only PDF, PNG and JPEG files are allowed."));
        }
    },
});

// --------------------------------------------------
// GET /tasks
// --------------------------------------------------
// requireAuth runs BEFORE our route handler.
// Flow:
// GET /tasks
//      |
//      ▼
// requireAuth
//      |
//      ├── not logged in → /login
//      |
//      └── logged in
//              |
//              ▼
//         route handler
router.get("/tasks", requireAuth, async (req, res) => {
    try {
        // req.user was created/restored by Passport.
        // So we know exactly which user is making this request.
        const tasks = await Task.find({
            owner: req.user._id,
        }).sort({
            createdAt: -1,
        });

        res.render("tasks", {
            tasks,
            user: req.user,
        });
    } catch (error) {
        console.log(error);

        res.status(500).send("Could not load tasks.");
    }
});

// --------------------------------------------------
// GET /tasks/new
// --------------------------------------------------
router.get("/tasks/new", requireAuth, (req, res) => {
    res.render("new-task");
});

// --------------------------------------------------
// POST /tasks
// --------------------------------------------------
// Notice:
// requireAuth and upload.single("attachment") both are middleware.
// The request has to pass through both before reaching our route handler.
// Flow: POST /tasks --> requireAuth --> Multer --> route handler
router.post(
    "/tasks",
    requireAuth,
    upload.single("attachment"),
    async (req, res) => {
        try {
            // ------------------------------------------
            // NORMAL FORM DATA
            // ------------------------------------------
            // These fields come from:
            //          <input name="title">
            //          <textarea name="description">
            //          req.body.title
            //          req.body.description
            const { title, description } = req.body;

            // ------------------------------------------
            // UPLOADED FILE
            // ------------------------------------------
            // Multer puts information about the uploaded file into req.file.
            // For example:
            // req.file = {
            //     fieldname: "attachment",
            //     originalname: "notes.pdf",
            //     filename: "17283-notes.pdf",
            //     path: "uploads/17283-notes.pdf",
            //     ...
            // }
            // This exists because we used: upload.single("attachment")
            // The string "attachment" MUST match: <input type="file" name="attachment">
            let attachment = undefined;
            if (req.file) {
                attachment = {
                    filename: req.file.filename,
                    path: req.file.path,
                    originalName: req.file.originalname,
                };
            }

            // ------------------------------------------
            // CREATE TASK
            // ------------------------------------------
            await Task.create({
                owner: req.user._id,
                title: title,
                description: description,
                attachment: attachment,
            });
            res.redirect("/tasks");
        } catch (error) {
            console.log(error);
            res.status(500).send("Could not create task.");
        }
    },
);

// --------------------------------------------------
// GET /tasks/:id/edit
// --------------------------------------------------
router.get("/tasks/:id/edit", requireAuth, async (req, res) => {
    try {
        // Find the task AND make sure it belongs to the currently logged-in user.
        // This prevents one user from editing another user's task just by changing the URL.
        const task = await Task.findOne({
            _id: req.params.id,
            owner: req.user._id,
        });

        if (!task) {
            return res.status(404).send("Task not found.");
        }

        res.render("edit-task", {
            task,
        });
    } catch (error) {
        console.log(error);

        res.status(500).send("Could not load task.");
    }
});

// --------------------------------------------------
// PUT /tasks/:id
// --------------------------------------------------
router.put("/tasks/:id", requireAuth, async (req, res) => {
    try {
        const { title, description } = req.body;

        // Update only a task owned by the current user.
        const task = await Task.findOneAndUpdate(
            {
                _id: req.params.id,
                owner: req.user._id,
            },
            {
                title,
                description,
            },
            {
                new: true,
            },
        );
        if (!task) {
            return res.status(404).send("Task not found.");
        }
        res.redirect("/tasks");
    } catch (error) {
        console.log(error);
        res.status(500).send("Could not update task.");
    }
});

// --------------------------------------------------
// DELETE /tasks/:id
// --------------------------------------------------
router.delete("/tasks/:id", requireAuth, async (req, res) => {
    try {
        // Only delete a task if:
        // 1. Its ID matches
        // 2. It belongs to the logged-in user
        await Task.findOneAndDelete({
            _id: req.params.id,
            owner: req.user._id,
        });
        res.redirect("/tasks");
    } catch (error) {
        console.log(error);
        res.status(500).send("Could not delete task.");
    }
});

// --------------------------------------------------
// MULTER ARRAY EXAMPLE
// --------------------------------------------------
// This accepts up to 5 uploaded files.
// The HTML input needs: name="attachments"
// After Multer: req.files will be an array.

router.get("/tasks/:id/attachments", requireAuth, async (req, res) => {
    try {
        const task = await Task.findOne({
            _id: req.params.id,
            owner: req.user._id,
        });

        if (!task) {
            return res.status(404).send("Task not found.");
        }

        res.render("multiple-upload", {
            task,
        });
    } catch (error) {
        console.log(error);

        res.status(500).send("Could not load upload page.");
    }
});

router.post(
    "/tasks/:id/attachments",
    requireAuth,
    upload.array("attachments", 5),
    async (req, res) => {
        try {
            console.log("Uploaded files:");
            console.log(req.files);
            res.send(`
                <h1>Files uploaded!</h1>
                <p>
                    Uploaded ${req.files.length} file(s).
                </p>
                <a href="/tasks">
                    Back to tasks
                </a>
            `);
        } catch (error) {
            console.log(error);
            res.status(500).send("Upload failed.");
        }
    },
);

// --------------------------------------------------
// MULTER fields() EXAMPLE
// --------------------------------------------------
// fields() allows us to accept MULTIPLE FILE FIELDS.
// Example:
// profile  -> maximum 1 file
// documents -> maximum 3 files
// The resulting data:
// req.files = {
//     profile: [ ... ],
//     documents: [ ... ]
// }
// Notice that req.files is an OBJECT here, unlike upload.array(), where req.files is an ARRAY.

router.post(
    "/upload-fields",
    requireAuth,
    upload.fields([
        {
            name: "profile",
            maxCount: 1,
        },
        {
            name: "documents",
            maxCount: 3,
        },
    ]),
    (req, res) => {
        console.log("req.body:");
        console.log(req.body);
        console.log("req.files:");
        console.log(req.files);
        res.json({
            message: "fields() upload successful",
            body: req.body,
            files: req.files,
        });
    },
);

// --------------------------------------------------
// MULTER none() EXAMPLE
// --------------------------------------------------
// none() tells Multer:
// "This request should be multipart/form-data,  but it must NOT contain any files."
// Normal fields will still be available through: req.body
// If a file is uploaded, Multer will reject it and throw an error (Multer error).
router.post("/upload-none", requireAuth, upload.none(), (req, res) => {
    console.log("req.body:");
    console.log(req.body);
    res.json({
        message: "Multipart fields processed successfully",
        body: req.body,
    });
});

// --------------------------------------------------
// GRIDFS UPLOAD
// --------------------------------------------------
// The browser uploads to Express.
// Multer stores the file temporarily in RAM.
// Then we stream that buffer into MongoDB GridFS.
router.post(
    "/database-upload",
    requireAuth,
    gridfsUpload.single("file"),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).send("Please select a file.");
            }

            // Get our GridFS bucket.
            const bucket = getGridFSBucket();

            // openUploadStream() creates a writable stream for a new GridFS file.
            //  MongoDB will split the uploaded data into GridFS chunks.
            const uploadStream = bucket.openUploadStream(
                req.file.originalname,
                {
                    metadata: {
                        originalName: req.file.originalname,
                        contentType: req.file.mimetype,
                    },
                },
            );

            // Convert the Multer buffer into a Node.js stream and pipe it into GridFS.
            //  We use the built-in Readable class.
            const { Readable } = require("stream");

            // Turn the Buffer into a readable stream.
            const readable = Readable.from(req.file.buffer);

            // When the buffer has been completely written into GridFS, the upload stream emits "finish".
            uploadStream.on("finish", () => {
                console.log("GridFS file ID:", uploadStream.id);
                res.json({
                    message: "File stored in MongoDB GridFS.",
                    fileId: uploadStream.id,
                    filename: req.file.originalname,
                });
            });

            // Start sending the buffer into GridFS.
            readable.pipe(uploadStream);
        } catch (error) {
            console.log(error);
            res.status(500).send("Could not store file in MongoDB.");
        }
    },
);

// --------------------------------------------------
// DATABASE UPLOAD PAGE
// --------------------------------------------------
router.get("/database-upload", requireAuth, (req, res) => {
    res.render("database-upload");
});

// --------------------------------------------------
// DIRECT CLOUD UPLOAD PAGE
// --------------------------------------------------
// Important: Express only serves the HTML page.
// The actual file upload will happen from the browser directly to Cloudinary.
router.get("/cloud-upload", requireAuth, (req, res) => {
    res.render("cloud-upload");
});

// --------------------------------------------------
// SAVE CLOUDINARY METADATA
// --------------------------------------------------
// The browser has already uploaded the actual file directly to Cloudinary.
// Now it sends only metadata to our Express server. This is NOT a file upload to Express. It is simply JSON.

router.post("/cloud-upload/metadata", requireAuth, async (req, res) => {
    try {
        const { publicId, secureUrl, originalFilename, resourceType } =
            req.body;
        console.log("Cloudinary metadata received:");
        console.log({
            publicId,
            secureUrl,
            originalFilename,
            resourceType,
        });

        // For our learning project we're just returning the information.
        // In a real application we could store it in MongoDB and associate it with: req.user._id and perhaps: task._id
        res.json({
            message: "Cloudinary metadata received.",
            file: {
                publicId,
                secureUrl,
                originalFilename,
                resourceType,
            },
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Could not save cloud metadata.",
        });
    }
});

// --------------------------------------------------
// BASIC AUTHENTICATION EXAMPLE
// --------------------------------------------------
// This route does NOT use our normal session login. Instead, the client must send:
// Authorization: Basic <credentials>
// passport.authenticate("basic") tells Passport: "Use BasicStrategy."
// session: false is important here.
// We are saying: "Authenticate this request, but don't create/maintain a Passport login session for it."

router.get(
    "/api/profile",
    passport.authenticate("basic", {
        session: false,
    }),
    (req, res) => {
        res.json({
            message: "Basic authentication successful",
            user: {
                id: req.user._id,
                username: req.user.username,
            },
        });
    },
);

module.exports = router;
