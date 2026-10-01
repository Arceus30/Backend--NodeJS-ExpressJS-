const handleTransaction = async (pool) => {
    const connection = await pool.getConnection(); // take one connection from the pool because all transactions must execute on the same connection.
    try {
        await connection.beginTransaction(); // From this point onward, the changes are not permanently committed yet.

        let sql = `INSERT IGNORE INTO users (name, email, age) VALUES (?, ?, ?)`;
        const [userResult] = await connection.execute(sql, [
            "David",
            "david@example.com",
            26,
        ]);
        const userId = userResult.insertId;
        console.log("Created user:", userId);

        sql = `INSERT INTO posts (title, content, user_id) VALUES (?, ?, ?)`;
        await connection.execute(sql, [
            "David's First Post",
            "This post was created inside a transaction.",
            userId,
        ]);

        await connection.commit(); // If all queries succeeded, the changes become permanent
        console.log("Transaction committed");
    } catch (error) {
        await connection.rollback(); // if any occurs the db goes back to the original state all the changes after connection.beginTransaction() are reverted.
        console.error("Transaction rolled back");
        console.error(error.message);
    } finally {
        connection.release(); // This does not close the database connection permanently. It returns the connection to the pool
    }
};

const handleSavePointTransaction = async (pool) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        let sql = `INSERT IGNORE INTO users (name, email, age) VALUES (?, ?, ?)`;
        const [userResult] = await connection.execute(sql, [
            "John",
            "john.smith@example.com",
            35,
        ]);
        const userId = userResult.insertId;
        console.log("Created user:", userId);

        await connection.query(`SAVEPOINT user_created`); // Create SAVEPOINT
        console.log("Savepoint created");

        sql = `INSERT INTO posts (title, content, user_id) VALUES (?, ?, ?)`; // Step 2: Create post
        await connection.execute(sql, [
            "John's First Post",
            "This post was created inside a transaction with savepoint.",
            userId,
        ]);
        console.log("Post created");

        await connection.commit(); // Commit entire transaction
        console.log("Transaction committed");
    } catch (error) {
        console.error("Error:", error.message);
        try {
            await connection.query(`ROLLBACK TO SAVEPOINT user_created`); // Roll back only to the savepoint
            console.log("Rolled back to savepoint");
            await connection.commit(); // Commit everything before the savepoint
            console.log("Transaction committed after partial rollback");
        } catch (rollbackError) {
            console.error("Rollback failed:", rollbackError.message);
            await connection.rollback();
            console.log("Entire transaction rolled back");
        }
    } finally {
        connection.release();
    }
};

module.exports = { handleTransaction, handleSavePointTransaction };
