const createIndex = async (pool) => {
    await pool.execute(`CREATE INDEX idx_users_status ON users(status)`);
    console.log("Index created");
};

const createCompositeIndex = async (pool) => {
    await pool.execute(
        `CREATE INDEX idx_users_status_age ON users(status, age)`,
    );
    console.log("Composite Index created");
};

const showIndex = async (pool) => {
    const [rows] = await pool.execute(`SHOW INDEX FROM users`);
    console.log("Indexes: ", rows);
};

module.exports = { createIndex, createCompositeIndex, showIndex };
