const express = require("express");
const {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    searchUsers,
    transaction,
} = require("../controllers/userController.js");

const router = express.Router();

router.route("/").get(getUsers).post(createUser);

router.get("/search", searchUsers);

router.post("/transact", transaction);

router.route("/:id").get(getUser).put(updateUser).delete(deleteUser);

module.exports = router;
