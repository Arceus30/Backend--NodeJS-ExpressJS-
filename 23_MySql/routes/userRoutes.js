const express = require("express");
const {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    searchUsers,
} = require("../controllers/userController.js");

const router = express.Router();

router.route("/").get(getUsers).post(createUser);

router.get("/search", searchUsers);

router.route("/:id").get(getUser).put(updateUser).delete(deleteUser);

module.exports = router;
