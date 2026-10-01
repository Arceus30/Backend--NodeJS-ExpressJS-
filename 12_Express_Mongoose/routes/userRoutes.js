const express = require("express");

const {
    createUser,
    getUsers,
    getUser,
    updateUser,
    deleteUser,
} = require("../controllers/userController");

const router = express.Router();

// ==================================================
// USER ROUTES
// ==================================================

// CREATE: POST /api/users
router.post("/", createUser);

// READ ALL: GET /api/users
router.get("/", getUsers);

// READ ONE: GET /api/users/:id
router.get("/:id", getUser);

// UPDATE: PATCH /api/users/:id
router.patch("/:id", updateUser);

// DELETE: DELETE /api/users/:id
router.delete("/:id", deleteUser);

module.exports = router;
