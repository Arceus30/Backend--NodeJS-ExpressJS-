const { getUserById } = require("../repositories/userRepository.js");
const {
    createPost,
    getPosts,
    getPostsWithUsers,
    getPostCount,
    getPostById,
    deletePost,
    updatePost,
    searchPosts: searchPostsRepository,
} = require("../repositories/postRepository.js");

async function registerPost(title, content, user_id) {
    const existingUser = await getUserById(user_id);
    if (!existingUser) {
        throw new Error("User does not exists");
    }
    return createPost(title, content, user_id);
}

async function findAllPosts(page, limit) {
    const posts = await getPosts(page, limit);
    const total = await getPostCount();
    return {
        posts,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

async function findAllUserPosts(page, limit) {
    const posts = await getPostsWithUsers(page, limit);
    const total = await getPostCount();
    return {
        posts,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

async function findPostById(id) {
    const post = await getPostById(id);
    if (!post) {
        throw new Error("Post not found");
    }
    return post;
}

async function searchPosts(filters) {
    return searchPostsRepository(filters);
}

async function updatePostDetails(id, title, content) {
    const post = await getPostById(id);
    if (!post) {
        throw new Error("Post not found");
    }
    return updatePost(id, title, content);
}

async function removePost(id) {
    return deletePost(id);
}

module.exports = {
    registerPost,
    findAllPosts,
    findPostById,
    findAllUserPosts,
    searchPosts,
    updatePostDetails,
    removePost,
};
