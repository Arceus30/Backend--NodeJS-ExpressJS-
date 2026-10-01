const createProcedure = async (pool) => {
    await pool.query(`DROP PROCEDURE IF EXISTS get_user_posts`);
    await pool.query(`
        CREATE PROCEDURE get_user_posts(IN userId INT)
        BEGIN
            SELECT p.id, p.title, p.content, p.created_at FROM posts AS p WHERE p.user_id = userId ORDER BY p.id;
        END
    `);
    console.log("Stored procedure created");
};

const callProcedure = async (pool) => {
    const userId = 1;
    const [rows] = await pool.query("CALL get_user_posts(?)", [userId]);
    console.dir(rows, { depth: null });
};

module.exports = { createProcedure, callProcedure };
