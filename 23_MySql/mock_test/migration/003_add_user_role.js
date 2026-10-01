async function up(connection) {
    await connection.execute(`
        ALTER TABLE users
        ADD COLUMN role VARCHAR(30)
        DEFAULT 'user'
    `);
}

async function down(connection) {
    await connection.execute(`
        ALTER TABLE users
        DROP COLUMN role
    `);
}

module.exports = { up, down };
