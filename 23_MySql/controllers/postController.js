const {
    registerPost,
    findAllPosts,
    findPostById,
    searchPosts: searchPostsRepository,
    updatePostDetails,
    removePost,
    findAllUserPosts,
} = require("../services/postServices.js");

async function createPost(req, res) {
    try {
        const { title, content, user_id } = req.body;
        const result = await registerPost(title, content, user_id);
        res.status(201).json({
            message: "Post created successfully",
            postId: result.insertId,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to create post",
        });
    }
}

async function getPosts(req, res) {
    try {
        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
        const posts = await findAllPosts(page, limit);
        res.status(200).json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to fetch posts",
        });
    }
}

async function getPost(req, res) {
    try {
        const id = Number(req.params.id);
        const post = await findPostById(id);
        res.status(200).json(post);
    } catch (error) {
        if (error.message === "Post not found") {
            return res.status(404).json({
                message: error.message,
            });
        }
        console.error(error);
        res.status(500).json({
            message: "Failed to fetch post",
        });
    }
}

async function getUserPosts(req, res) {
    try {
        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
        const posts = await findAllUserPosts(page, limit);
        res.status(200).json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to fetch posts",
        });
    }
}

async function searchPosts(req, res) {
    try {
        const { search, page, limit } = req.query;
        const result = await searchPostsRepository({
            search,
            page: Math.max(Number(page) || 1, 1),
            limit: Math.min(Math.max(Number(limit) || 10, 1), 100),
        });
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to search posts",
        });
    }
}

async function updatePost(req, res) {
    try {
        const id = Number(req.params.id);
        const { title, content } = req.body;
        const result = await updatePostDetails(id, title, content);
        res.status(200).json({
            message: "Post updated successfully",
            affectedRows: result.affectedRows,
        });
    } catch (error) {
        if (error.message === "Post not found") {
            return res.status(404).json({
                message: error.message,
            });
        }
        console.error(error);
        res.status(500).json({
            message: "Failed to update post",
        });
    }
}

async function deletePost(req, res) {
    try {
        const id = Number(req.params.id);
        const result = await removePost(id);
        res.status(200).json({
            message: "Post deleted successfully",
            affectedRows: result.affectedRows,
        });
    } catch (error) {
        if (error.message === "Post not found") {
            return res.status(404).json({
                message: error.message,
            });
        }
        console.error(error);
        res.status(500).json({
            message: "Failed to delete post",
        });
    }
}

module.exports = {
    getPosts,
    createPost,
    getPost,
    getUserPosts,
    updatePost,
    deletePost,
    searchPosts,
};
