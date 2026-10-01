async function up(connection) {
    await connection.execute(
        `CREATE INDEX idx_users_created_at ON users(created_at)`,
    );
}

async function down(connection) {
    await connection.execute(`DROP INDEX idx_users_created_at ON users`);
}

module.exports = { up, down };
