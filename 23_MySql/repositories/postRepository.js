const { pool } = require("../db/config");

async function createPost(title, content, user_id) {
    const [result] = await pool.execute(
        `INSERT INTO posts (title, content, user_id) VALUES (?, ?, ?)`,
        [title, content, user_id],
    );
    return result;
}

async function getPosts(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const [rows] = await pool.execute(
        `SELECT id, title, content, created_at FROM posts ORDER BY id LIMIT ? OFFSET ?`,
        [limit, offset],
    );
    return rows;
}

async function getPostsWithUsers(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const [rows] = await pool.execute(
        `SELECT p.id, p.title, p.content, u.name,u.email, p.created_at FROM posts p JOIN users u ORDER BY id LIMIT ? OFFSET ?`,
        [limit, offset],
    );
    return rows;
}

async function getPostCount() {
    const [rows] = await pool.execute(`SELECT COUNT(*) AS total FROM posts`);
    return rows[0].total;
}

async function getPostById(id) {
    const [rows] = await pool.execute(
        `SELECT id, title, content, created_at FROM posts WHERE id = ?`,
        [id],
    );
    return rows[0] ?? null;
}

async function searchPosts({ search, page, limit }) {
    const conditions = [];
    const values = [];

    if (search) {
        conditions.push(`(title LIKE ? OR content LIKE ?)`);
        values.push(`%${search}%`);
        values.push(`%${search}%`);
    }
    const offset = (page - 1) * limit;

    let sql = `SELECT id, title, content, created_at FROM posts`;

    if (conditions.length > 0) {
        sql += ` WHERE ${conditions.join(" AND ")}`;
    }

    sql += `ORDER BY id LIMIT ? OFFSET ?`;
    values.push(limit, offset);
    const [posts] = await pool.execute(sql, values);

    sql = sql.replace("id, title, content, created_at", "COUNT(*) AS total");
    const [rows] = await pool.execute(sql, values);

    return {
        posts,
        pagination: {
            page,
            limit,
            total: Number(rows[0].total),
            totalPages: Math.ceil(Number(rows[0].total) / limit),
        },
    };
}

async function updatePost(id, title, content) {
    let sql = `UPDATE posts SET `;
    const values = [];
    const updates = [];
    if (title) {
        updates.push(`title = ?`);
        values.push(title);
    }
    if (content) {
        updates.push(`content = ?`);
        values.push(content);
    }
    sql += `${updates.join(", ")}`;
    sql += ` WHERE id = ?`;
    values.push(id);
    const [result] = await pool.execute(sql, values);
    return result;
}

async function deletePost(id) {
    const [result] = await pool.execute(`DELETE FROM posts WHERE id = ?`, [id]);
    return result;
}

module.exports = {
    createPost,
    getPosts,
    getPostsWithUsers,
    getPostCount,
    getPostById,
    searchPosts,
    updatePost,
    deletePost,
};
