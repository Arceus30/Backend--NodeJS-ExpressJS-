const createViews = async (pool) => {
    await pool.execute(`
        CREATE OR REPLACE VIEW post_details AS
        SELECT p.id, p.title, p.content, p.created_at, u.id AS user_id, u.name AS user_name, u.email AS user_email
        FROM posts AS p
        INNER JOIN users AS u
        ON p.user_id = u.id`);
    console.log("View created");
};

const callViews = async () => {
    const [rows] = await pool.execute(`SELECT * FROM post_details ORDER BY id`);
    console.table(rows);
};

module.exports = { createViews, callViews };
