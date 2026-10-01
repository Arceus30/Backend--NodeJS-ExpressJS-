const db = require("../../knex/db_knex");

async function createPost(title, content, user_id) {
    const [id] = await db("posts").insert({
        title,
        content,
        user_id,
    });

    return {
        insertId: id,
    };
}

async function getPosts(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    return db("posts")
        .select("id", "title", "content", "user_id", "created_at")
        .orderBy("id")
        .limit(limit)
        .offset(offset);
}

async function getPostCount() {
    const [{ count }] = await db("users").count("* as count");
    return count;
}

async function getPostById(id) {
    const post = await db("posts")
        .select("id", "title", "content", "user_id", "created_at")
        .where("id", id)
        .first();

    return post ?? null;
}

async function searchPosts({ search, page, limit }) {
    const query = db("posts").select("id", "title", "content", "created_at");
    if (search) {
        query.where(function () {
            this.where("name", "like", `%${search}%`).orWhere(
                "email",
                "like",
                `%${search}%`,
            );
        });
    }

    const offset = (page - 1) * limit;
    const posts = await query.clone().orderBy("id").limit(limit).offset(offset);

    const [{ count }] = await query
        .clearSelect()
        .clearOrder()
        .count("* as count");

    return {
        posts,
        pagination: {
            page,
            limit,
            total: Number(count),
            totalPages: Math.ceil(Number(count) / limit),
        },
    };
}

async function getPostsWithUsers() {
    return db("posts AS p")
        .join("users AS u", "p.user_id", "u.id")
        .select(
            "p.id",
            "p.title",
            "p.content",
            "u.id AS user_id",
            "u.name AS user_name",
            "u.email AS user_email",
        )
        .orderBy("p.id");
}

async function updatePost(id, title, content) {
    const updates = {};
    if (title) {
        updates["title"] = title;
    }
    if (content) {
        updates["content"] = content;
    }
    const affectedRows = await db("posts").where("id", id).update(updates);
    return {
        affectedRows,
    };
}

async function deletePost(id) {
    const affectedRows = await db("posts").where("id", id).del();

    return {
        affectedRows,
    };
}

module.exports = {
    createPost,
    getPosts,
    getPostCount,
    getPostById,
    getPostsWithUsers,
    searchPosts,
    updatePost,
    deletePost,
};
