const express = require("express");
const {
    createPost,
    getPosts,
    getPost,
    getUserPosts,
    updatePost,
    deletePost,
    searchPosts,
} = require("../controllers/postController");

const router = express.Router();

router.route("/").get(getPosts).post(createPost);

router.route("/users").get(getUserPosts);

router.get("/search", searchPosts);

router.route("/:id").get(getPost).put(updatePost).delete(deletePost);

module.exports = router;
